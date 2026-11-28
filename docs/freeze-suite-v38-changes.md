# The freeze test suite, version 38: what changed from version 37

*The scribe, sessions S1 and S2, 28 November 2026. S2's part is the section "S2: the answers, the 23 steps, the sweep" at the end, and the marks "Answered" on S1's questions. A record of work, not a decision, and not part of the suite: what `spec/03-MOR-freeze-test-suite-v38.md` changes in version 37, step by step, and what it rests on. Version 37 stays LATEST until Nobody, allegedly, says otherwise. Nothing here is his but what the ledger quotes; every reading is the MOR lead's or the scribe's, and is marked so.*

## In plain words

Nobody, allegedly, changed how agreements work this morning: an agreement no longer has versions that replace one another; it lives until its ending condition is met, and any change is that end and a new agreement whose first act may point back to the old one. Version 37 of the suite was written the old way. Version 38 is version 37 copied whole, with only the steps that the no-versions test (Fable 5.1, pull request 360, its section 2.2) lists written again on the new model. Each changed step is below, with what it rests on. Where his words and the lead's readings do not settle a step's answer, the step says *open*, and the answer is asked below; nothing is decided here.

**Marks.** TRACED: the v38 wording traces to an entry of the ledger (`docs/decisions.md` on main, cited by its heading) or to a reading of the MOR lead's in `docs/lead/notes/2026-11-28-no-versions-test-sorted.md` (cited by its letter and number), or to a step of v37. COUNTED: by the check script on the two files. INFERRED: the scribe's reading of what the model does to the step, where no line says it in so many words. "his" marks an entry whose words are his (its "Arrived at" lines are the lead's, to check); "the lead's" marks a reading of the MOR lead's.

**The count** (COUNTED, by the check script on v37 and v38): v37 has 214 steps, v38 218. Of the steps of section 2.2, 71 are rewritten, 3 dropped (each keeping its number with one line naming the entry that removes it), and 4 added; 140 steps are as v37 has them, 28 of them listed in section 2.2 and left as they were (the second table below). Six stand-ins are named. 44 rewritten or added steps carry an answer marked *open*.

**Outside the steps.** The head line is the one asked for. The head's second paragraph says how a rewritten step cites Agreements. A paragraph, "The model in v38's steps", is added under "What an answer is": it says, with the headings it rests on, what each new word means in the steps (question 21). Core components gains a section "Stand-ins" beside `cmip-collective-control`, whose note says where the model reaches it; section 3b's head gains a note defining the mark *open: the tiers as ending condition* (question 4). The Agreements boxes of Core components are left as v37 has them (question 20).

## The steps changed, dropped or added

| Step | v37, in short | v38 | Rests on | Stand-in | Mark |
|---|---|---|---|---|---|
| 1.1 | a deal; every clone needs every contributor; three keepers, two of three; a lost keeper's records live on in copies | its ending condition every contributor's signature; the keepers are where its acts are, two of three counted by a stand-in in their socket; answers of absence name the two left; an act only in a copy is unchecked, the acts bearing on it shown as evidence | “The ending condition”; “Keepers: cross verification by default, a socket to lift it”; “"As far as I can see" is the honest answer”; “Rely when a relay dies: a proof, not one for the bytes” (his) | two of three keepers | TRACED; the deal's ending condition stated in its terms, INFERRED (question 1) |
| 1.5 | the thief's acts void unless acknowledged, or recorded by a keeper before the rotation; a keeper record of an act nobody holds confers nothing | the keeper half goes: a keeper's relaying shows nothing about before; whether Identity rule 34's keeper case still keeps such an act is *open*; a keeper service's record is shown as evidence; the citation of Agreements rule 6 removed, its sentence kept | “The keeper's ordered record is a service, not the core” (his: “It’s a service people can run to serve agreements, not a must, I’d say”) | ordered keeper record | TRACED; open (question 23) |
| 1.6 | one party signs a clone alone: a draft | dropped | “Nothing is updated: new acts” (his: “Nothing is ever updated, it’s new acts.”) | | TRACED |
| 1.7 | the publication moves to a new payment cMIP by a later version every party signs | every party signs a new publication pointing to the old; one party's pointer closes nothing; the judge rule kept for new agreements | “The closing pointer: no longer valid, and it once existed” (his); A1 (the lead's) | | TRACED |
| 1.7a | two complete versions of a deal: the reference, settlement, the judge of forks, the chain of judgment, tangled deals, the numbering, the alarms | two new agreements both pointing to the deal: a fork, neither taking effect, the deal as it was, settled by its rule or a resolver, strangers who relied keeping it, disputed; a purchase under the fork, and the settling act's form and finality, *open*; the judge of forks, the chain of judgment, tangled deals and the settlement's form dropped as the fork of Terms' mechanism; the numbering kept; the clients' checks kept, reworded | “A fork is a fork” (his: “A fork is a fork.”); “A dead keeper: the agreement is dead; what follows is a new act” (his: “Disputes, races… that’s where it’s a fork and rules have to settle.”); A2 (the lead's) | fork resolver | TRACED; open (questions 16, 18) |
| 1.8 | a missed deadline shown by the keeper's sequence anchored past the point | met by the delivery's own anchoring; missed as far as the acts held at the two keepers left show; no keeper's order read | “An act that names a clock is anchored to it”; “"As far as I can see" is the honest answer” (his: “The as far as I can see is different, with 3 keepers all stating theirs.”) | | TRACED |
| 1.9b | two of three clone the abandonment clause: a draft | their pointer closes nothing, the ending condition asking every contributor; the third bound by nothing; whether the new agreement binds the two who signed it *open* | “The closing pointer: no longer valid, and it once existed”; “No dissolving with open obligations to unknown parties” (his: “The known parties are protected by their signatures, or the signature scheme they agreed to.”); A1 (the lead's) | | TRACED; open (question 2) |
| 1.9d | an investor, no party: a clone lowering its share a draft until it signs; publication versions by the parties alone | the publication's parties sign new publications pointing to the old, by its ending condition; a new ownership agreement lowering the share binds the investor in nothing; whether it closes the old without the investor *open* | “No dissolving with open obligations to unknown parties” (his); “Protect the unknown party is an Agreements principle” (his) | | INFERRED; open (question 3) |
| 1.9e | outcome 1 under the clause: the clone in force without the investor | whether the declaration lets the pointer close the deal without the investor *open* | as 1.9d | | open (question 3) |
| 1.9h | terms field 31 names the transfer, so the clone asks the buyer | a new agreement binds the buyer only with its signature; whose signature closes the old *open*; field 31 a version's mechanism | as 1.9d | | open (question 3) |
| 1.9i | termination terms with a notice; the marked clone; a clone without the mark; a party's place | an ending by clock after an anchored notice, triggering with no further act; the deal provisional until anchored, "not yet anchored"; a notice with no clock refused; one party leaving by the end and a new agreement; whether one party's place can end alone *open* | “The ending condition” (his: “Dissolved, by signatures or any other conditions the bytes can check, anchoring to a clock for example.”); “An act that names a clock is anchored to it” (his: “So an agreement that states a clock is provisional until anchored.”); B15 (the lead's) | ending by clock | TRACED; open (question 15) |
| 1.10 | | new: a closing pointer under two of three: it closes for all three; Cy, who did not sign, bound by nothing new; one signature closes nothing; the old keeper dead, it closes all the same; without the pointer, the old tip comes back with its keeper; several pointers, each against its own ending condition; an agent signing the pointer for the giver | “The closing pointer: no longer valid, and it once existed” (his); “A keeper is a relay: lodge, relay, fetch” (his: “It can, it does not mean it has to.”); “Ending the old agreement is an act on its chain” (his: “The pointing to it is what closes it.”); “The giver bears it, not the agent” (his); A1, B11, B20 (the lead's) | ending by two of three signatures | TRACED |
| 2.6 | the publication ended by a later version selling nothing; a racing payment owed back | ended by its ending condition, dissolved; a racing payment read under its words, which here say owed back; a buyer's key still owed would bar the dissolution | “The ending condition”; “No dissolving with open obligations to unknown parties” (his: “Important, an agreement cannot be dissolved if it has open obligations towards unknown parties”); B12 (the lead's) | | TRACED |
| 2.7 | a release from a point: the ownership agreement closed; publication B sells nothing, a payment after it owed back | the release anchored to its clock, the ownership agreement ending by clock at the point; a payment anchored after it read under B's words; one not anchored *open* | “An act that names a clock is anchored to it” (his) | | TRACED; open (question 12) |
| 3.1b | a clone dropping a layer's entry invalid | a new agreement dropping one is outside the format, its pointer closing nothing | “The closing pointer: no longer valid, and it once existed” | | INFERRED |
| 3.1d | a record putting an operational clone in force | dropped | “Nothing is updated: new acts” (his) | | TRACED |
| 3.1e | a record naming the clone it writes but no decision | "the clone it writes" goes; the rest kept | “No versions: the chain guards the end and forces knots” (his: “Guarding its end, and forcing the creation of knots used to order stuff”) | | TRACED |
| 3.3 | concurrent records of conflicting clones leave the parent in force | two new agreements pointing to one, nothing ordering them: a fork, settled by rule or resolver; one after the other, the second closes nothing; two sharing a signer *open* | “A fork is a fork” (his); A2, B3 (the lead's) | fork resolver | TRACED; open (question 9) |
| 3.7 | a member leaves; a clone of the founding agreement, a draft until the new member signs; a keeper's record places nothing | a new agreement pointing to the founding one; the tiers as the ending condition *open*; renew or exit for every counterparty, the old label running on; the label's identity *open*; a keeper's relaying places nothing | “A change of who they are: renew or exit” (his: “They change WHO they are, I get asked if I wish to continue.”); “The keeper's ordered record is a service, not the core” (his) | | TRACED; open (questions 4, 6) |
| 3.7b | a clone rewriting the clone rule: invalid, or a draft | the pointer closes nothing, the constitutional change rule asking every member; the third bound by nothing | A1 (the lead's); the tiers | | open (question 4) |
| 3.7c | the refund terms by the area's power: invalid; by the constitutional change rule: in force | the pointer closes nothing, or closes; the grant within the area kept; the citation of Agreements rule 98 removed, its parenthesis kept | the tiers | | open (question 4) |
| 3.7d | clones of the keepers and of the refund terms invalid | each pointer closes nothing | the tiers | | open (question 4) |
| 3.7e | one clone under two powers, in force with no rotation | closes with both signatures; the rotation *open* | the tiers; step 3.7 | | open (questions 4, 6) |
| 3.7f | the arbitrator's clone a draft | closes nothing until the third signs | the tiers | | open (question 4) |
| 3.7g | the treasurer's Money clone in force, needing no rotation; the record's mechanics | a new agreement under the Money power: closing *open*, and renew or exit for a change that is not of who they are *open*; the record's mechanics kept to what field 2's signatures meet; the citation of Agreements rule 60 removed | “A change of who they are: renew or exit”; “Collectives: the dual agreement framework” (his) | | open (questions 4, 5) |
| 3.7i | a removal by a clone; the removed member a departed holder | the pointer meets the rule; whether the stake is carried into the new agreement *open* | as 1.9d | | open (questions 3, 4) |
| 3.7j | extensions adopted and dropped by marked clones | new agreements under the layer powers; renew or exit *open* | the tiers | | open (questions 4, 5) |
| 3.7k | the declaration names a version; the constitutional clone of the two who remain; clones before and after the line | the declaration names the agreement; new agreements in place of clones; the citation of Agreements rule 87 removed | the tiers | | open (question 4) |
| 3.7l | a clone across two tiers | closes only with both | the tiers | | open (question 4) |
| 3.7m | the nominee's clone; drafts; a keeper's record places nothing; refits by constitutional clone | new agreements; a publication at the keeper before the line places nothing; the citation of Agreements rule 76 removed | “The keeper's ordered record is a service, not the core” (his); the tiers | | open (question 4) |
| 3.7n | layer and judicial clones; invalid terms | new agreements that close or close nothing; the invalid terms kept | the tiers | | open (question 4) |
| 3.7o | the ordering stories: a keeper's record placing a receipt; sibling clones; a record naming too few signatures | new agreements; the receipt lost as far as the acts held show; a keeper service's record *open*; siblings a fork; a pointer completed late *open*; the citation of Agreements rule 90 removed | “"As far as I can see" is the honest answer”; “The keeper's ordered record is a service, not the core”; “A fork is a fork” (his) | ordered keeper record; fork resolver | open (questions 13, 17) |
| 3.7q | a departed share lowered by a clone the holder does not sign: a draft | binds the holder in nothing; closing without the holder *open*; "a mark naming them" goes with marks | as 1.9d | | open (question 3) |
| 3.7s | a version changing the constitution and the anchoring cMIP | a new agreement; who closes it as v37's tiers say | the tiers | | open (question 4) |
| 3.7w | a broken collective, its rollback, quarantine, a stretch's payments, a closing blocked by money owed back | the pointer that misses the ending condition closes nothing; nothing to roll back; the identity *open*; the last-voice warnings, the repayment cases, the returned member, the old stepping down, the unregistered resignation and the sealed declaration kept; whether a refund owed to a buyer bars the dissolution *open*; quarantine, the stretch's payments, the stretch's declaration and contest, the technical break and the rollback's detail dropped with the rollback; the citation of Agreements rule 70 removed | “The closing pointer: no longer valid, and it once existed”; “No dissolving with open obligations to unknown parties” (his) | | open (questions 4, 6, 11) |
| 3.7x | split agreement versions paying the departed holder less, drafts until Cy signs | binds Cy in nothing; closing without Cy *open* | as 1.9d | | open (question 3) |
| 3.7y | succession clones moving Cy's stake | new agreements; the one under the plan Cy signed closes with the members alone | “No dissolving with open obligations to unknown parties” (his: the scheme they agreed to) | | INFERRED |
| 3.7z | back only by a constitutional clone naming them | by a new agreement naming them, which they sign | “Nothing is updated: new acts” | | TRACED |
| 3.7ac | a waiver set by fewer than every holder: a draft | closes nothing | the tiers | | open (question 4) |
| 3.7ag | the clause of the version it last signed | of the agreement it last signed | “No versions: the chain guards the end and forces knots” | | TRACED |
| 3.7aj | a version of the split agreement; clones lowering or adding a rule drafts | a new split agreement pointing to the old; the others close nothing | the tiers | | open (question 4) |
| 3.7as | an issuance a draft while one holder has not signed; a rule added by a clone | counts for nothing while one has not; added by a new agreement; the citations of Agreements rules 48 and 98 removed | “Nothing is updated: new acts” | | TRACED |
| 3.7au | a judge swapped by a one-word clone | the pointer closes nothing until the fourth signs | the tiers | | open (question 4) |
| 3.7av | a rotation declares the constitution alone | dropped | “Nothing is updated: new acts” (his) | | TRACED |
| 3.7ax | a constitutional clone also adopting a Money cMIP | a new agreement closing only with the treasurer too | the tiers | | open (question 4) |
| 3.7bb | a clone of the judicial tier; a declaration naming the latest version | a new agreement the buyer did not sign; the clause of the agreement its transfer was placed under; whether the pointer closes without the buyer *open*; the citation of rule 61 removed | “No dissolving with open obligations to unknown parties” (his) | | TRACED; open (question 3) |
| 3.7bc | the same for a stake successor | the same | as 3.7bb | | TRACED |
| 3.8 | the plan executes as a clone | a new agreement; the board has changed: each counterparty asked to renew or exit; the citations of Agreements rules 60 and 71 removed | “A change of who they are: renew or exit” (his) | | TRACED; open (question 4) |
| 3.8b | succession clones, invalid while marked with the plan alone | new agreements under the plan, which close nothing where they change more than it gives | the tiers | | open (question 4) |
| 3.8c | approved under the constitutional change rule | approved by a new agreement; the draft 24 heading removed from the step's head | “Nothing is updated: new acts” | | TRACED |
| 3.8e | the succession clone under the plan alone | a new agreement under the plan | the tiers | | open (question 4) |
| 3.8f | the succession clone's signature acts | the new agreement's | “Nothing is updated: new acts” | | TRACED |
| 3.9 | the fork of a collective: a back-link, debts handed out, publications selling nothing, concurrent fork acts | the successors point to the original; whether two pointers and one fork act are one ending or a fork *open*; handing a debt without its creditor against renew or exit *open*; payments after the line read under the words; concurrent fork acts a fork | “A fork is a fork”; “A change of who they are: renew or exit” (his); B12 (the lead's) | fork resolver | open (questions 7, 8) |
| 3.9a | a group splits off by a clone; the collective keeps its identity | a new agreement; renew or exit; the identity *open* | “A change of who they are: renew or exit” (his) | | open (question 6) |
| 3.9b | renewing its publications | nobody meets its ending condition | “The ending condition” | | TRACED |
| 3.9c | a clone of the release rule a draft until the third signs | binds the third in nothing; closing without the third *open* | as 1.9d | | open (question 3) |
| 3.9e | a timed release on the time reference | anchored to its clock, provisional until anchored, ending by clock at the point; with no clock, refused | “An act that names a clock is anchored to it” (his) | | TRACED |
| 3.9f | a collective that holds nothing and owes nothing closes | the dissolution barred while an obligation toward an unknown party is open; whether holding a work, or a debt to a creditor who is neither a party nor a buyer, bars it *open* | “No dissolving with open obligations to unknown parties” (his) | | TRACED; open (question 10) |
| 3.9g | a successor owing debts cannot close | *open*, as 3.9f | as 3.9f | | open (question 10) |
| 3.9h | a clone gives the lender 40%; holding 60%, it cannot close | a new ownership agreement; *open*, as 3.9f | as 3.9f | | open (question 10) |
| 3.9i | no validity rests on where an act is stored | so where the collective names no keeper; where it names one, whether a debt drawn for it counts only at that keeper *open* | “The keeper's ordered record is a service, not the core” (his: the keeper's "where") | | open (question 14) |
| 3.9k | a payment after the fork owed back; the receipt names the version | read under the publication's words; the receipt names the agreement | B12 (the lead's) | | TRACED |
| 3.9l | a record putting the treasurer's clone in force | a record registering the treasurer's new agreement | “Nothing is updated: new acts” | | TRACED |
| 3.9r | an act a keeper recorded before the revocation valid and disputed | a keeper's relaying shows nothing about before; a keeper service's record shown as evidence, its weight *open* | “The keeper's ordered record is a service, not the core” (his) | ordered keeper record | open (question 13) |
| 3.9ab | a true tie: neither counts; a third closing counts | a fork, neither taking effect; the third, after both, counts | “A fork is a fork” (his) | | TRACED |
| 3.9aj | a publication over a closed owner sells nothing | a payment after the line read under the publication's words; whom the owners' line would pay *open* | “The ending condition”; B12 (the lead's) | | open (question 12) |
| 3.9al | | new: a band that changes its singer: a new party; the venue renews, the merchandiser exits, the old band running on for its deal; the album's buyer kept; the identity *open* | “A change of who they are: renew or exit” (his); “No versions: the chain guards the end and forces knots” (his); “No dissolving with open obligations to unknown parties” (his) | | TRACED; open (questions 4, 6) |
| 6.3 | the publication ended by a later version; a racing payment owed back | ended by its ending condition, dissolved; the racing payment read under its words; no obligation open, every key delivered | “The ending condition”; “No dissolving with open obligations to unknown parties” (his); B12 (the lead's) | | TRACED |
| 7.7 | the service switched by a new version; a terminating act of the owners' side | a new publication pointing to the old; the owners' side alone as the ending condition; the partners not carried over, each in the new only once it signs; the citations of Agreements rules 11 and 12 removed | “The ending condition” (his); “No dissolving with open obligations to unknown parties” (his: the known parties protected by their signatures) | | INFERRED (the partners) |
| 7.7b | termination terms with a minimum term | an ending by clock not met before the point, met after it, each ending's place shown by its own anchoring; the publication provisional until anchored | “The ending condition”; “An act that names a clock is anchored to it” (his) | ending by clock | TRACED |
| 7.7c | a reader without the termination terms' cMIP | a reader without the stand-in: unknown, never in force by default | “The ending condition” | ending by clock | TRACED |
| 7.7d | a partner terminating its own place | the label ends the publication, the others sign a new one without it; whether one place can end alone *open* | “The ending condition” | ending by clock | open (question 15) |
| 7.9 | | new: a subscription that states a clock: provisional until anchored, not shown with "not yet anchored", never invalid; the month from the assent's own anchoring; "one month" with no clock refused | “An act that names a clock is anchored to it” (his: “An act cannot name a clock without itself being anchored to it.”); “Ana's month ends by the clock the agreement names” (his) | | TRACED |
| 7.10 | | new: no dissolving while a listener's month is open; the spot closed, assents not counted, payments read under the words; a verifier that cannot tell never shows it dissolved | “No dissolving with open obligations to unknown parties” (his); “Protect the unknown party is an Agreements principle” (his); “"As far as I can see" is the honest answer” (his); B5 (the lead's) | open obligation check | TRACED |
| 9.2 | the two who stay sign a constitutional clone | a new agreement; each counterparty asked to renew or exit; the citations of Agreements rules 58, 69 and 70 removed | “A change of who they are: renew or exit” (his) | | TRACED |
| 9.3 | the seat passes as a constitutional clone | by a new agreement; the board has changed; the citations of Agreements rules 59, 83, 87 and 89 removed | “A change of who they are: renew or exit” (his) | | TRACED |
| 9.4 | publications over the closed owner sell nothing; holding nothing and owing nothing | read under their words; no obligation toward an unknown party open | “A fork is a fork”; “No dissolving with open obligations to unknown parties” (his) | | TRACED |
| 9.6 | the parties sign a later version selling nothing | ended by its ending condition; the racing payment read under its words; the citations of Agreements rules 11, 12, 30 and 54 removed | “The ending condition” (his); B12 (the lead's) | | TRACED |
| Passes if, 1, 2, 3, 6, 7, 9 | the clauses of the steps above | rewritten to what the steps now say; clauses for 1.10, 3.9al, 7.9 and 7.10 added | as the steps | | TRACED |

## The steps of section 2.2 left as they were, and why

| Step | Why it stays |
|---|---|
| 1.3, 1.4 | The offer and the buyer: the same under the model (section 2.2). 1.3's "the version whose stake it pays" reads as the agreement; its wording is left for P8's numbering. |
| 2.1 to 2.5, with their lettered steps | The offer and the buyer: the same (section 2.2). |
| 3.7a | A founding's key grammar only: no clone, no keeper's order. |
| 3.7aa | A missing act answers unknown and voids nothing: the same as “A missing act stays unchecked: no door around it”; no version in it. |
| 3.8d | A format rule only. |
| 3.9d | A fork with a member on no side: its question is step 3.9's; no version in it. |
| 3.9j | Money acts counted under the rule for Money; no version. |
| 3.9m | The collective's chain and a member's own `prev`: knots, which the model keeps. |
| 3.9n | The tie rule reads a closing's history; no version; whether a dissolution's history decides a debt is step 3.9f's question. |
| 3.9p | An ending must be done (sealed to every member, or public): the same. |
| 3.9w | A complete ending is final, and a later ending naming it changes nothing: the same (section 2.2). |
| 3.9ac | A signer's own chain orders the closings: knots, the same. |
| 3.9ae | Finality on chain keys: Identity's. |
| 3.9af | A closing whose history is not held is unknown: the same as the missing act. |
| 3.9ag | The kept holders' consent to a fork's founding plans: no version. |
| 3.9ai | An ending counted by share: no version. |
| 5.3 | Negotiation messages: the same (section 2.2). |
| 7.1 to 7.6 | The offer and the buyer: the same (section 2.2). |
| 8.3 | An extension named: the same (section 2.2). |
| 9.1 | A transfer is Money's and the ownership agreement's: the same (section 2.2). |
| 9.5 | Identity's (section 2.2). |
| 9.7 | No version in its words; the model only makes the crossing simpler (section 2.2). |

## The stand-ins

Six, each listed in v38's Core components, "Stand-ins", as "a stand-in, for DubLaw's launch set to fill", none named like a real cMIP (COUNTED): `stand-in: two of three keepers` (1.1, 1.8), `stand-in: ending by two of three signatures` (1.10), `stand-in: ending by clock` (1.9i, 7.7b to 7.7d), `stand-in: fork resolver` (1.7a, 3.3, 3.7o, 3.9), `stand-in: open obligation check` (7.10), `stand-in: ordered keeper record` (1.5, 3.7o, 3.9r). They stand for what the lead's note for the Dubsar Suite lead lists for DubLaw's set (`docs/lead/notes/2026-11-28-for-dubsar-from-this-round.md`): an ending condition for each common shape, a K9 rule, a resolver for forks, the open-obligation check, and keeper services. `cmip-collective-control` stays where v37 uses it; v38 marks where the model reaches it (section 3b's note).

## Agreements rule numbers left in v38

None in a step v38 rewrote or added (COUNTED). Left, as v37 has them, by place (COUNTED; the numbers are draft 24's):

- the head's example of the citation form: 76
- Core components, Agreements: 7, 9, 10, 11, 12, 13, 14, 15, 16, 17, 22, 30, 33, 34, 37, 41, 42, 54, 56, 57, 58, 59, 60, 67, 73, 76, 83, 90, 91, 98, 99
- Core components, `cmip-collective-control`: 60, 65
- step 1.9f: 14, 48; step 1.9g: 47
- step 2.1: 14; 2.1c: 14; 2.4: 12; 2.4k: 12, 16; 2.4l: 13
- step 3.1: 98, 99; 3.1a: 58; 3.1c: 60; 3.1f: 57, 60; 3.2: 98; 3.4: 76; 3.5: 76; 3.6: 98; 3.7p: 35; 3.7ao: 98; 3.7ap: 98; 3.7aq: 99; 3.7ar: 98; 3.7at: 48; 3.7aw: 99 (its 96 and 97 are `cmip-collective-control`'s); 3.7ay: 65, 99; 3.7ba: 74, 99; 3.7az: 74
- step 3.9j: 92; 3.9m: 58; 3.9o: 12; 3.9p: 57, 91; 3.9q: 57; 3.9s: 73 to 80; 3.9t: 11, 12, 16, 30; 3.9u: 16, 17; 3.9v: 15, 16, 67; 3.9w: 91; 3.9x: 76, 79; 3.9y: 79; 3.9z: 12; 3.9ac: 91; 3.9ad: 10; 3.9ah: 98; 3.9ak: 10
- section 3b's note, and scenario 3's "Passes if": 67
- step 7.8: 15; 7.8b: 18
- step 9.1: 10, 12, 15, 30

## Questions for the MOR lead

One batch, each with the scribe's lean.

1. **The default ending condition.** Where terms name none, is it every known party's signature, so that steps 1.1, 1.7, 2.6 and 6.3 need no stand-in for it? *Lean:* yes, “Who signs an update by default: the known parties” carried to the socket by “The ending condition”; v38 states it in each step's terms meanwhile. **Answered** (the MOR lead's answer 1, `docs/lead/notes/2026-11-28-answers-to-s1.md`): yes: every known party's signature; written into 1.1 and the head.
2. **A pointer that closes nothing.** Is the new agreement it opens in force among its signers, each bound by both, or does it fail with its pointer (1.9b, 3.7b, 3.7w)? *Lean:* in force among its signers, a client warning before signing, as the no-versions test's 3.3.1 reads. **Answered** (the MOR lead's answer 2, `docs/lead/notes/2026-11-28-answers-to-s1.md`): in force among its signers, each bound by both, the old going on, a client warning; written into 1.9b, 3.7b, 3.7w and the head.
3. **A holder who is no party** (an investor, a departed holder, a buyer of a share): does a new agreement lowering or moving its share close the old without its signature (1.9d, 1.9e, 1.9h, 3.7i, 3.7q, 3.7x, 3.7bb, 3.9c)? *Lean:* no: its share is protected by its signature as a known party's is, so the closing waits for it; this is also question H2, his. **Answered** (the MOR lead's answer 3, `docs/lead/notes/2026-11-28-answers-to-s1.md`): his, by “Shares and how they move are the cMIPs'”: what a share is and who signs to lower it are the cMIPs'; written into 1.9d, 1.9e, 1.9h, 3.7i, 3.7q, 3.7x, 3.7bb, 3.9c.
4. **`cmip-collective-control` as an ending condition.** May its tiers, areas and layer powers be read as the signatures a closing pointer must bring, until it is rewritten (every step marked *open: the tiers as ending condition*)? *Lean:* yes, as the lead's note for Dubsar has it ("Constitutional cMIPs are written for the end and the hand-over, not for amending"), the cMIP to be rewritten so before freeze. **Answered** (the MOR lead's answer 4, `docs/lead/notes/2026-11-28-answers-to-s1.md`): yes, until `cmip-collective-control` is rewritten for the end and the hand-over, before freeze; every *open: the tiers as ending condition* mark replaced, and section 3b's note.
5. **A change that is not of who they are.** Where a collective is one agreement, does a new payment cMIP or extension (3.7g, 3.7j) ask every counterparty to renew or exit? *Lean:* yes as the words stand, every new agreement being a new party; the face of several agreements is how a collective spares them; asked of him as H1. **Answered** (the MOR lead's answer 5, `docs/lead/notes/2026-11-28-answers-to-s1.md`): his, by “We are, we use, we offer”: the collective's choice; written into 3.1, 3.7g, 3.7j, 3b.7e, and step 3.9am added.
6. **The collective's identity.** Does its identity, whose genesis declares the founding agreement, carry to the new agreement by a rotation, or is a new agreement a new identity (3.7, 3.7e, 3.7w, 3.9a, 3.9al)? *Lean:* the rotation declares the new agreement and the identity carries on, its counterparties still asked, since the party named in their deals is the agreement; for the Identity pass to write. **Answered** (the MOR lead's answer 6, `docs/lead/notes/2026-11-28-answers-to-s1.md`): as the scribe leant, for the Identity pass; written into 3.7, 3.9a, 3.9al, 3b.7e; left open for 3.7w and 3.7ae (a rotation declaring an agreement that closed nothing, or none declaring one that closed).
7. **A split by all.** Two successors each pointing to the original, and one fork act meeting its ending condition: one ending, or a fork by A2 (3.9)? *Lean:* one ending: the fork act meets the condition and names both; A2's fork is for two acts nothing orders. **Answered** (the MOR lead's answer 7, `docs/lead/notes/2026-11-28-answers-to-s1.md`): one ending where one act meets the condition and both successors are ordered after it by knots; otherwise a fork; written into 3.9, its application to successors founded first left open (question 3 below).
8. **Debts handed out at a fork** without the creditor (3.9): carried over, against renew or exit? *Lean:* not carried over: the creditor renews with the successor named, or the original runs on owing it. **Answered** (the MOR lead's answer 8, `docs/lead/notes/2026-11-28-answers-to-s1.md`): not carried over; written into 3.9 and 3.9g.
9. **Two endings sharing a signer** (3.3): ordered by that signer's own line, or a fork by B3? *Lean:* ordered by the signer's identity chain, as v37's 3.9ab and “Knots are knots: one reading, "shown after"” read; B3 speaks of `previous` inside a new agreement. **Answered** (the MOR lead's answer 9, `docs/lead/notes/2026-11-28-answers-to-s1.md`): ordered where the signer's own line orders them; otherwise a fork; written into 3.3.
10. **What bars a dissolution** besides an unknown party's open obligation: a work still held, a public debt to a creditor who is neither a party nor a buyer (3.9f, 3.9g, 3.9h)? *Lean:* neither bars it in the core, his words naming unknown parties only; the creditor keeps the debt's own signed record; stated as a cost. **Answered** (the MOR lead's answer 10, `docs/lead/notes/2026-11-28-answers-to-s1.md`): neither bars it in the core, a stated cost, listed for him; written into 3.9f, 3.9g, 3.9h.
11. **A refund owed to a buyer** (3.7w, 3.9f): an obligation open toward an unknown party, barring the dissolution? *Lean:* yes: the buyer took part through a spot. **Answered** (the MOR lead's answer 11, `docs/lead/notes/2026-11-28-answers-to-s1.md`): yes; written into 3.7w and 3.9f.
12. **A publication over an ended owner** (2.7, 3.9aj): whom does its owners' line pay? *Lean:* read under the publication's words; where they say nothing, owed back, as v37 had it. **Answered** (the MOR lead's answer 12, `docs/lead/notes/2026-11-28-answers-to-s1.md`): as the scribe leant; written into 2.7 and 3.9aj.
13. **A keeper service's ordered record** (3.7o, 3.9r): does it place an act for a collective, or keep an act against a revocation, where the agreement names the service in its keepers' socket? *Lean:* yes, as that service's answer, labelled so; never where the agreement does not name it. **Answered** (the MOR lead's answer 13, `docs/lead/notes/2026-11-28-answers-to-s1.md`): yes, as that service's answer, only where the agreement names it; written into 1.5, 1.5b, 3.4, 3.7o, 3.9r.
14. **"Act exists @" for a debt drawn for a collective** that names a keeper (3.9i). *Lean:* no: a debt is a Money act, not an act of the agreement; the keeper's where is for the agreement's own acts. **Answered** (the MOR lead's answer 14, `docs/lead/notes/2026-11-28-answers-to-s1.md`): no; written into 3.9i.
15. **One party's place ending alone** (1.9i, 7.7d). *Lean:* no such ending in the core: a party's leaving is the end and a new agreement without it. **Answered** (the MOR lead's answer 15, `docs/lead/notes/2026-11-28-answers-to-s1.md`): no such ending in the core; written into 1.9i and 7.7d.
16. **A settling act for a fork of two endings** (1.7a): its form, and its finality. *Lean:* any act the agreement's own rule accepts, or its resolver's, naming both, and final against a later act that names it. **Answered** (the MOR lead's answer 16, `docs/lead/notes/2026-11-28-answers-to-s1.md`): as the scribe leant; written into 1.7a.
17. **A pointer completed late** after another pointer closed the same agreement (3.7o). *Lean:* it closes nothing: an agreement ends once. **Answered** (the MOR lead's answer 17, `docs/lead/notes/2026-11-28-answers-to-s1.md`): closes nothing where knots order it after; otherwise a fork; written into 3.7o.
18. **A purchase under a forked ownership agreement** (1.7a). *Lean:* a purchase under the publication, the owners' line divided by the stake of the agreement the fork left standing. **Answered** (the MOR lead's answer 18, `docs/lead/notes/2026-11-28-answers-to-s1.md`): as the scribe leant; written into 1.7a, the division the split cMIP's answer.
19. **Steps the model reaches that section 2.2 does not list**, left as v37 has them: 1.5b, 1.9, 1.9c, 1.9f, 1.9g, 3.1, 3.4, 3.7h, 3.7p, 3.7v, 3.7ae, 3.7af, 3.7ah, 3.7ao, 3.7ap, 3.7aq, 3.7ar, 3.7az, 3.9o, 3.9v, 3.9x, 3.9z, 7.8. *Lean:* a second pass writes them on the model on this branch, before P8. **Answered** (the MOR lead's answer 19, `docs/lead/notes/2026-11-28-answers-to-s1.md`): yes: this pass, S2.
20. **The Agreements boxes of Core components** still describe keeper records, clone drafts and termination. *Lean:* rewrite them in P8's commit on this branch, with draft 26's numbers. **Answered** (the MOR lead's answer 20, `docs/lead/notes/2026-11-28-answers-to-s1.md`): yes, in P8's commit on this branch; left.
21. **The paragraph "The model in v38's steps"**: does it stay until draft 26 defines its words? *Lean:* yes; the stranger's run below needed it. **Answered** (the MOR lead's answer 21, `docs/lead/notes/2026-11-28-answers-to-s1.md`): yes; kept, and two bullets added.
22. **Draft 24's field numbers** (field 7, 19, 33…) stay in rewritten steps. *Lean:* keep them until draft 26 gives its encoding. **Answered** (the MOR lead's answer 22, `docs/lead/notes/2026-11-28-answers-to-s1.md`): yes; kept.
23. **Identity rule 34's keeper case** ("a named keeper recorded it") against a keeper that keeps no order (1.5). *Lean:* for the Identity pass; v38 marks it open. **Answered** (the MOR lead's answer 23, `docs/lead/notes/2026-11-28-answers-to-s1.md`): for the Identity pass; 1.5 and 1.5b keep *open*.
24. **An old agreement closed, yet running on** (3.9al, 3.7): the pointer closes the old collective's agreement, while the old collective "runs on while it has standing obligations". Under what, and by whom, does it sign meanwhile? *Lean:* the pointer closes it for every new act but those its standing obligations call for, signed under its last rules; this needs a sentence of the lead's. **Answered** (the MOR lead's answer 24, `docs/lead/notes/2026-11-28-answers-to-s1.md`): the lead's sentence, to check, listed for him; written into the head, 3.7, 3.7az, 3.9 and 3.9al.
25. **The forms the stranger could not build** (1.9i, 1.10): the notice act, an anchoring and its proof, which field names the clock (v37's time reference, field 6) and the ending condition, the closing pointer's field, and each stand-in's parameters. *Lean:* the codemeister's to propose with draft 26's encoding; v38 runs reasoned until then. **Answered** (the MOR lead's answer 25, `docs/lead/notes/2026-11-28-answers-to-s1.md`): the codemeister's, with draft 26's encoding; v38 runs reasoned until then.
26. **Powers in a v38 step** (1.10's agent): "a power of sort `assent`" is draft 26's word, not v37's grant. *Lean:* say in the step that the power is draft 26's, given by Eve's giver in an act of his own, and run it once draft 26 numbers it. **Answered** (the MOR lead's answer 26, `docs/lead/notes/2026-11-28-answers-to-s1.md`): as the scribe leant; 1.10 left as S1 wrote it.
27. **The Core components boxes contradict rewritten steps** (termination by marked clone, line on "Clone drafts"), the stranger's stop (c) on 1.9i. *Lean:* as question 20; until then the head's rule that the rewritten step's headings decide applies. **Answered** (the MOR lead's answer 27, `docs/lead/notes/2026-11-28-answers-to-s1.md`): as 20.

## Questions for Nobody, allegedly

His, one at a time.

- **H1 (his).** When a collective changes something that is not who it is (a new way to be paid, a new tool), and it is built as one agreement, should each of its counterparties still be asked to renew or exit? *The scribe's lean:* as the words stand, yes, since the new agreement is a new party; a collective that does not want to ask them keeps such changes in an agreement other than the one it shows the world. **Answered** (his, “We are, we use, we offer”, 13:45–13:53): His words, quoted: “Why did they put the way to get paid in that agreement and not in a separate one would be my question. One agreement for “we are” one agreement for “we use” other agreements for “we offer” no?”
- **H2 (his), after H1.** An investor bought a share of a film but signed none of the film's agreements. When the owners make a new agreement that lowers the investor's share, should that wait for the investor's signature, as it would for one of the owners? *The scribe's lean:* yes. **Answered** (his, “Shares and how they move are the cMIPs'”, 13:53–13:58): His words, quoted: “Here again, we”re talking shares and how they move. Nothing in the core answers this. It’s all in the cMIPs”; and, at 13:58: “It’s easier than that. If agreements it’s always a cMIP”

## The checks

Run by `check.py` (the scribe's script, outside the repository) on v37, v38, this file and `docs/decisions.md` at main; its results are in the pull request's report. What it checks: every step number of v37 is in v38, rewritten, kept, or dropped with its line; no rewritten or added step cites an Agreements rule number or a draft 24 heading; every heading cited in v38 and here exists in the ledger on main, word for word; every quote marked "his:" here is in the ledger word for word, typos included; every stand-in used is listed and labelled; `spec/README.md` and v37 are those of main, and no other file changed; no address, port, link, key-like string or signing word; no line ends in a space.

## The stranger's run

A subagent that had seen neither the ledger nor the scribe's prompt was given v38 alone and three rewritten steps: 1.9i (an ending by clock), 1.10 (a closing pointer meeting a two of three ending condition) and 3.9al (renew or exit). It could list the acts and the verifier's answers for each, and stopped where the suite's words do not say enough.

Fixed, needing no choice: an agreement's "first act" and a pointer's "signatures" defined in "The model in v38's steps"; in 1.9i, the deal "ended, dissolved where no new agreement follows", the new agreement after a clock ending showing lineage and closing nothing more, "not yet met" given as far as the acts at the deal's keepers show, and a pointer leaving a party out closing nothing because the ending condition is a clock; in 1.10, the new agreement's parties named, and the dead keeper's case split (the pointer closes, the old deal's own acts unchecked); scenario 1's pass clause "no pointer closes the film's deal without every party"; in 3.9al, the band founded like the label under `cmip-collective-control`, Cy's leaving by resignation and record, the venue's deal's ending condition and clock, the venue's ending signed by the venue and the old band, "label" replaced by "a name people use", and the old band running on for the buyer's obligation.

Listed, needing a choice: questions 24 to 27 above, and these, already asked: the tiers (4), the identity (6), a holder who is no party under a pointer that closes without them (3), one party's place (15). The stranger's other stops are formats v38 does not give (25): a notice, an anchoring, the clock's field, the pointer's field, the stand-ins' parameters.

## S2: the answers, the 23 steps, the sweep

*The scribe, session S2, 28 November 2026, on S1's branch. A record of work, not a decision. It rests on his entries “We are, we use, we offer” and “Shares and how they move are the cMIPs'” (28 November, 13:45 to 13:58, his words quoted in the ledger, their "Arrived at" lines the MOR lead's, to check), on the MOR lead's answers to S1 (`docs/lead/notes/2026-11-28-answers-to-s1.md`, by number), and on the notes S1 rested on. Nothing here is his but what the ledger quotes.*

### In plain words

S1 rewrote version 38 on the new model of agreements and asked 27 questions of the MOR lead and two of Nobody, allegedly. All are answered. Then he said something simpler that reaches every agreement step: “If agreements it’s always a cMIP”. So S2 did three things. It wrote the answers into the steps that asked them. It wrote the 23 steps S1 had left as version 37 had them. And it swept every agreement step: each now ends with **Runs on**, the cMIPs it runs on (a stand-in where none exists yet), saying which of its answers are those cMIPs', and without them, unchecked; and with **Beneath, it passes if**, the core's guarantees the step still tests whatever the cMIP says: who signed, what names what, a fork, the stated where, an anchoring, the unknown party's protection (the MOR lead's reading, to check). A collective built as one agreement now says that asking every counterparty is its own choice, and a new step, 3.9am, shows a collective cut in three.

### The count

COUNTED, by the scribe's script on v38 and the scribe's record of each edit: v38 now has 219 steps (S1's 218 and step 3.9am). 158 steps name their cMIPs (**Runs on**, **Beneath**); 35 are listed as untouched by any cMIP (below); dropped steps are as S1 left them. 45 steps have an answer written in; the 23 steps of question 19 are rewritten; 31 steps lost an Agreements rule number or a draft 24 heading beyond those 23; one step is added. Eight stand-ins are new, fourteen in all. Eight steps still carry an answer marked *open* (below).

### Outside the steps

- The head's second paragraph names the MOR lead's answers to S1 as a source, cited "the MOR lead's answer 2".
- "The model in v38's steps" gains three bullets: the default ending condition and a pointer that closes nothing (answers 1 and 2); **The cMIPs, and the core beneath them** (his 13:58, the lead's reading of the guarantees, to check); **A closing pointer while obligations stand** (answer 24, the lead's sentence, to check).
- Section 3b's second note: the mark *open: the tiers as ending condition* is gone, answer 4 cited instead.
- Core components, "Stand-ins": eight added; "ending by clock" widened to a fixed point (steps 2.7, 3.9e, 3.9aj); every line's scenarios brought up to date.
- Every scenario's **Passes if** gains one clause: an agreement's doing is the cMIPs' answer, unchecked without them, the guarantees beneath holding. Scenario 1's and 3's clauses on shares, versions and debts are rewritten to the answers; scenario 3's gains the cut in three and the old collective's standing obligations.

### The answers written in

Each step is listed with the answer's number, or his entry's heading. Steps on shares, splits, payouts, debts handed over and refunds are answered as the cMIP's, the core's part being what the bytes show (13:56).

| Step | Answer |
|---|---|
| 1.1 | answer 1 |
| 1.5 | answer 23 (stays open, for the Identity pass) |
| 1.7a | answer 18; answer 16 |
| 1.9b | answer 2 |
| 1.9d | "Shares and how they move are the cMIPs'" |
| 1.9e | "Shares and how they move are the cMIPs'" |
| 1.9h | "Shares and how they move are the cMIPs'" |
| 1.9i | answer 15 |
| 2.7 | answer 12; "Shares and how they move are the cMIPs'" |
| 3.3 | answer 9 |
| 3.7 | answers 4, 6, 24 |
| 3.7b | answers 2, 4 |
| 3.7g | answers 4, 5; "We are, we use, we offer" |
| 3.7i | answer 4; "Shares and how they move are the cMIPs'" |
| 3.7j | answers 4, 5; "We are, we use, we offer" |
| 3.7k | answer 4 |
| 3.7m | answer 4 |
| 3.7n | answer 4 |
| 3.7o | answers 13, 17 |
| 3.7q | answers 3 ("Shares and how they move are the cMIPs'"), 4 |
| 3.7s | answer 4 |
| 3.7w | answers 2, 4, 11; 6 stays open for this case |
| 3.7x | "Shares and how they move are the cMIPs'" |
| 3.7au | answer 4 |
| 3.7ax | answer 4 |
| 3.7bb | "Shares and how they move are the cMIPs'" |
| 3.8 | answer 4 |
| 3.8b | answer 4 |
| 3.8e | answer 4 |
| 3.9 | answers 7, 8, 24; the application of 7 to successors founded first left open |
| 3.9a | answer 6 |
| 3.9c | "Shares and how they move are the cMIPs'" |
| 3.9f | answers 10, 11 (the second collective's refund INFERRED) |
| 3.9g | answers 8, 10 |
| 3.9h | answer 10 |
| 3.9i | answer 14 |
| 3.9r | answer 13 |
| 3.9aj | answer 12 |
| 3.9al | answers 4, 6, 24; the identity signing the old band's acts left open |
| 3b 7c | answer 4 |
| 3b 7d | answer 4 |
| 3b 7f | answer 4 |
| 3b 7l | answer 4 |
| 3b 7e | answers 4, 6; "We are, we use, we offer" |
| 7.7d | answer 15 |

### The sweep

One row per step changed in (b), (c) or (d): what was done, its source, the cMIPs it names in **Runs on**, and the guarantees its **Beneath** tests (TRACED to the step's own words; which answer is a cMIP's is INFERRED by the scribe from his 13:58, to check).

| Step | Done | Source | cMIPs named | Guarantees tested |
|---|---|---|---|---|
| 1.1 | answer written in, swept | answer 1 | `stand-in: two of three keepers`; `stand-in: abandonment clause`; the deal's ending condition, the default (no cMIP) | who signed, what names what, the stated where |
| 1.3 | swept |  | `stand-in: waterfall split`; `stand-in: stake and transfer` | who signed, what names what |
| 1.4 | swept |  | `stand-in: stake and transfer`; `stand-in: waterfall split` | who signed, what names what |
| 1.5 | answer written in, swept | answer 23 (stays open, for the Identity pass) | `stand-in: ordered keeper record` | who signed, the stated where |
| 1.5b | rewritten on the model (question 19), swept | question 19; answers 13, 23 | `stand-in: ordered keeper record`; `stand-in: stake and transfer` | who signed, what names what, an anchoring |
| 1.7 | swept |  | the publication's ending condition, the default (no cMIP); `stand-in: payment by rail`; `stand-in: words of sale` | who signed, what names what, a fork |
| 1.7a | answer written in, swept | answer 18; answer 16 | `stand-in: fork resolver`; `stand-in: waterfall split` | a fork, who signed, what names what, the unknown party's protection |
| 1.8 | swept |  | `stand-in: milestone terms`; the arbitrator the terms name | an anchoring, the stated where |
| 1.9 | rewritten on the model (question 19), swept | question 19 | `stand-in: abandonment clause`; `stand-in: stake and transfer` | who signed, what names what, an anchoring |
| 1.9b | answer written in, swept | answer 2 | the deal's ending condition, the default (no cMIP); `stand-in: abandonment clause` | who signed, what names what |
| 1.9c | rewritten on the model (question 19), swept | question 19 | `stand-in: abandonment clause`; `cmip-collective-control` | who signed, what names what |
| 1.9d | answer written in, swept | "Shares and how they move are the cMIPs'" | `stand-in: waterfall split`; `stand-in: stake and transfer` | who signed, what names what, the unknown party's protection |
| 1.9e | answer written in, swept | "Shares and how they move are the cMIPs'" | `stand-in: abandonment clause`; `stand-in: stake and transfer` | who signed, what names what |
| 1.9f | rewritten on the model (question 19), swept | question 19; answer 1 | `stand-in: stake and transfer`; `stand-in: waterfall split`; `stand-in: vow marketplace` | who signed, what names what |
| 1.9g | rewritten on the model (question 19), swept | question 19 | `stand-in: waterfall split` | who signed, what names what |
| 1.9h | answer written in, swept | "Shares and how they move are the cMIPs'" | `stand-in: stake and transfer` | who signed, what names what |
| 1.9i | answer written in, swept | answer 15 | `stand-in: ending by clock` | an anchoring, who signed, the stated where |
| 1.10 | swept |  | `stand-in: ending by two of three signatures`; the fourth film's ending condition, every party's (no cMIP); Eve's power of sort `assent`, draft 26's, its rule | who signed, what names what, the stated where, a fork |
| 2.1 | rule number removed, swept | Agreements rule 14 removed, its sentence kept | `stand-in: waterfall split`; `stand-in: words of sale`; `stand-in: stake and transfer` | who signed, what names what, a fork |
| 2.1c | rule number removed, swept | Agreements rule 14 removed; the agreement's answer named as the cMIP's | `stand-in: words of sale` | what names what, who signed |
| 2.2 | swept |  | `stand-in: waterfall split`; `stand-in: stake and transfer` | who signed, what names what |
| 2.3 | swept |  | `stand-in: waterfall split` | who signed |
| 2.4 | rule number removed, swept | Agreements rule 12 removed | `stand-in: words of sale`; `stand-in: waterfall split` | who signed, what names what |
| 2.4d | swept |  | `stand-in: waterfall split` | who signed |
| 2.4e | swept |  | `stand-in: waterfall split` | who signed, what names what |
| 2.4f | swept |  | `stand-in: waterfall split`; the relay transport cMIP, type 0 | who signed, what names what |
| 2.4k | rule number removed, swept | Agreements rules 12 and 16 removed | `stand-in: words of sale`; `stand-in: waterfall split` | who signed, what names what |
| 2.4l | rule number removed, swept | Agreements rule 13 removed; the draft 24 heading "A contest of a purchase" removed | `stand-in: words of sale`; `stand-in: waterfall split` | who signed |
| 2.5b | swept |  | `stand-in: waterfall split` | who signed |
| 2.6 | swept |  | publication A's ending condition, the default (no cMIP); `stand-in: words of sale` | who signed, a fork, the unknown party's protection |
| 2.7 | answer written in, swept | answer 12; "Shares and how they move are the cMIPs'" | `stand-in: ending by clock`; `stand-in: words of sale` | an anchoring, who signed |
| 3.1 | rewritten on the model (question 19), swept | question 19; answer 4; "We are, we use, we offer"; Agreements rules 98 and 99 removed | `cmip-collective-control`; `stand-in: abandonment clause`; `stand-in: payment by rail` | who signed, what names what |
| 3.1a | rule number removed, swept | Agreements rule 58 removed | `cmip-collective-control` | who signed, what names what |
| 3.1b | swept |  | `cmip-collective-control` | what names what |
| 3.1c | rule number removed, swept | Agreements rule 60 removed | `cmip-collective-control` | who signed |
| 3.1e | swept |  | `cmip-collective-control` | what names what |
| 3.1f | rule number removed, swept | Agreements rules 57 and 60 removed | `cmip-collective-control` | who signed, what names what |
| 3.2 | rule number removed, swept | Agreements rule 98 removed | `cmip-collective-control` | who signed, what names what |
| 3.3 | answer written in, swept | answer 9 | `stand-in: fork resolver`; `cmip-collective-control` | a fork, what names what |
| 3.4 | rewritten on the model (question 19), swept | question 19; answer 13; Agreements rule 76 removed | `cmip-collective-control`; `stand-in: ordered keeper record` | who signed, what names what, a fork |
| 3.5 | rule number removed, swept | Agreements rule 76 removed; the keeper's record gone | `cmip-collective-control` | who signed, what names what |
| 3.6 | rule number removed, swept | Agreements rule 98 removed | `cmip-collective-control`; `stand-in: stake and transfer`; `stand-in: waterfall split` | who signed, what names what |
| 3.7 | answer written in, swept | answers 4, 6, 24 | `cmip-collective-control`; `stand-in: abandonment clause` | who signed, what names what, the stated where |
| 3.7ae | rewritten on the model (question 19), swept | question 19; answers 6 and 24 read, the case left open | `cmip-collective-control` | who signed, what names what |
| 3.7af | rewritten on the model (question 19), swept | question 19 | `cmip-collective-control` | who signed, what names what |
| 3.7ag | swept |  | `stand-in: abandonment clause`; `stand-in: stake and transfer`; `cmip-collective-control` | who signed, what names what |
| 3.7ah | rewritten on the model (question 19), swept | question 19 | `cmip-collective-control`; `stand-in: stake and transfer` | who signed, what names what |
| 3.7ai | swept |  | `stand-in: waterfall split`; `cmip-collective-control` | what names what, who signed |
| 3.7al | swept |  | the grant's limits cMIP, its expiry; the time reference cMIP (task 10) | an anchoring, who signed |
| 3.7am | swept |  | `cmip-collective-control` | who signed |
| 3.7an | swept |  | `cmip-collective-control`; `stand-in: abandonment clause`; `stand-in: stake and transfer` | what names what |
| 3.7ao | rewritten on the model (question 19), swept | question 19; Agreements rule 98 removed; the rollback goes with step 3.7w | `cmip-collective-control` | who signed, a fork |
| 3.7ap | rewritten on the model (question 19), swept | question 19; Agreements rule 98 removed | `stand-in: words of sale`; `stand-in: stake and transfer` | who signed, what names what |
| 3.7aq | rewritten on the model (question 19), swept | question 19; Agreements rule 99 removed | a control model the collective names | who signed, what names what |
| 3.7ar | rewritten on the model (question 19), swept | question 19; Agreements rule 98 removed | a control model the collective names | who signed, what names what |
| 3.7as | swept |  | `cmip-collective-control`; `stand-in: stake and transfer` | who signed |
| 3.7at | rule number removed, swept | Agreements rule 48 removed | `stand-in: stake and transfer`; `cmip-collective-control` | who signed, what names what |
| 3.7au | answer written in, swept | answer 4 | `cmip-collective-control` | who signed |
| 3.7aw | rule number removed, swept | Agreements rule 99 removed | `cmip-collective-control` | what names what, who signed |
| 3.7ax | answer written in, swept | answer 4 | `cmip-collective-control`; `stand-in: payment by rail` | who signed |
| 3.7ay | rule number removed, swept | Agreements rules 65 and 99 removed | a control model answering `[2, counted]` for Money acts; `stand-in: stake and transfer` | who signed, what names what |
| 3.7az | rewritten on the model (question 19), swept | question 19; answer 24; Agreements rule 74 removed | `cmip-collective-control`; the new control model | what names what, a fork |
| 3.7b | answer written in, swept | answers 2, 4 | `cmip-collective-control` | who signed |
| 3.7ba | rule number removed, swept | Agreements rules 74 and 99 removed | step 3.7ay's control model; `stand-in: stake and transfer` | who signed |
| 3.7bb | answer written in, swept | "Shares and how they move are the cMIPs'" | `stand-in: abandonment clause`; `stand-in: stake and transfer` | who signed, what names what |
| 3.7bc | swept |  | `stand-in: abandonment clause`; `stand-in: stake and transfer` | who signed, what names what |
| 3.7g | answer written in, the cut in three, swept | answers 4, 5; "We are, we use, we offer" | `cmip-collective-control`; `stand-in: payment by rail` | who signed, what names what, a fork |
| 3.7h | rewritten on the model (question 19), swept | question 19 | `cmip-collective-control`; `stand-in: abandonment clause` | who signed, what names what |
| 3.7i | answer written in, swept | answer 4; "Shares and how they move are the cMIPs'" | `cmip-collective-control`; `stand-in: stake and transfer` | who signed |
| 3.7j | answer written in, the cut in three, swept | answers 4, 5; "We are, we use, we offer" | `cmip-collective-control`; the extensions' specifications, field 10 | who signed, what names what |
| 3.7k | answer written in, swept | answer 4 | `cmip-collective-control`; `stand-in: abandonment clause` | who signed, what names what, a fork |
| 3.7m | answer written in, swept | answer 4 | `cmip-collective-control` | who signed, what names what, the stated where, a fork |
| 3.7n | answer written in, swept | answer 4 | `cmip-collective-control`; the conversion, split, grant-limits, anchoring and time reference cMIPs its terms name (tasks 7, 8, 12, 11, 10) | what names what, who signed |
| 3.7o | answer written in, swept | answers 13, 17 | `cmip-collective-control`; `stand-in: ordered keeper record`; `stand-in: fork resolver` | who signed, what names what, a fork, the stated where |
| 3.7p | rewritten on the model (question 19), swept | question 19; answer 4; Agreements rule 35 removed | `stand-in: milestone terms`; `cmip-collective-control` | what names what, who signed |
| 3.7q | answer written in, swept | answers 3 ("Shares and how they move are the cMIPs'"), 4 | `cmip-collective-control`; `stand-in: stake and transfer`; `stand-in: waterfall split` | who signed, what names what |
| 3.7r | swept |  | `cmip-collective-control`; the split agreement's split service and its backup (fields 3 and 11) | what names what, who signed |
| 3.7s | answer written in, swept | answer 4 | `cmip-collective-control`; `stand-in: stake and transfer` | who signed |
| 3.7t | swept |  | `stand-in: waterfall split`; `stand-in: stake and transfer` | who signed, what names what |
| 3.7u | swept |  | the time reference cMIP (task 10); the arbitrators the chain names | an anchoring, what names what |
| 3.7v | rewritten on the model (question 19), swept | question 19 | `cmip-collective-control`; `stand-in: stake and transfer` | who signed, what names what |
| 3.7w | answer written in, swept | answers 2, 4, 11; 6 stays open for this case | `cmip-collective-control`; `stand-in: words of sale`; `stand-in: open obligation check` | who signed, what names what, the unknown party's protection |
| 3.7x | answer written in, swept | "Shares and how they move are the cMIPs'" | `stand-in: stake and transfer`; `stand-in: waterfall split` | who signed |
| 3.7y | swept |  | `stand-in: stake and transfer`; `stand-in: abandonment clause`; `cmip-collective-control` | who signed, what names what |
| 3.7z | swept |  | `cmip-collective-control`; `stand-in: abandonment clause` | who signed, what names what |
| 3.8 | answer written in, swept | answer 4 | `cmip-collective-control`; `stand-in: abandonment clause`; `stand-in: stake and transfer` | who signed, what names what |
| 3.8b | answer written in, swept | answer 4 | `cmip-collective-control`; `stand-in: abandonment clause`; `stand-in: stake and transfer` | who signed, what names what |
| 3.8c | swept |  | `cmip-collective-control`; `stand-in: stake and transfer`; `stand-in: abandonment clause` | who signed |
| 3.8e | answer written in, swept | answer 4 | `cmip-collective-control`; `stand-in: stake and transfer` | what names what, who signed |
| 3.8f | swept |  | `cmip-collective-control`; `stand-in: abandonment clause` | who signed |
| 3.9 | answer written in, swept | answers 7, 8, 24; the application of 7 to successors founded first left open | `cmip-collective-control`; `stand-in: stake and transfer`; `stand-in: words of sale`; `stand-in: fork resolver` | who signed, what names what, a fork, the unknown party's protection |
| 3.9a | answer written in, swept | answer 6 | `cmip-collective-control`; `stand-in: stake and transfer` | who signed, what names what |
| 3.9ab | swept |  | `cmip-collective-control` | a fork, who signed |
| 3.9ad | rule number removed, swept | Agreements rule 10 removed | `stand-in: stake and transfer`; `stand-in: waterfall split` | a fork, who signed |
| 3.9ag | swept |  | `cmip-collective-control`; `stand-in: waterfall split` | what names what, who signed |
| 3.9ah | rule number removed, swept | Agreements rule 98 removed | `cmip-collective-control`; `stand-in: stake and transfer` | who signed, what names what |
| 3.9ai | swept |  | `cmip-collective-control`; `stand-in: stake and transfer` | who signed, what names what |
| 3.9aj | answer written in, swept | answer 12 | `stand-in: words of sale`; `stand-in: ending by clock` | a fork, an anchoring |
| 3.9ak | rule number removed, swept | Agreements rule 10 removed | `stand-in: stake and transfer` | who signed |
| 3.9al | answer written in, swept | answers 4, 6, 24; the identity signing the old band's acts left open | `cmip-collective-control`; the venue's deal's ending condition, the venue's and the band's signatures (no cMIP); `stand-in: words of sale`; `stand-in: open obligation check` | who signed, what names what, an anchoring, the unknown party's protection |
| 3.9am | added, the cut in three, swept | (d): "We are, we use, we offer" | `cmip-collective-control`; `stand-in: payment by rail`; `stand-in: waterfall split`; `stand-in: words of sale` | who signed, what names what, the unknown party's protection |
| 3.9b | swept |  | the collective's ending condition; `stand-in: waterfall split` | who signed |
| 3.9c | answer written in, swept | "Shares and how they move are the cMIPs'" | `stand-in: stake and transfer` | who signed, what names what |
| 3.9d | swept |  | `cmip-collective-control`; `stand-in: stake and transfer` | who signed, what names what |
| 3.9e | swept |  | `stand-in: ending by clock` | an anchoring, who signed |
| 3.9f | answer written in, swept | answers 10, 11 (the second collective's refund INFERRED) | `cmip-collective-control`; `stand-in: open obligation check`; `stand-in: words of sale` | who signed, the unknown party's protection |
| 3.9g | answer written in, swept | answers 8, 10 | `cmip-collective-control` | what names what, a fork |
| 3.9h | answer written in, swept | answer 10 | `cmip-collective-control`; `stand-in: stake and transfer`; `stand-in: waterfall split` | who signed, what names what |
| 3.9i | answer written in, swept | answer 14 | `cmip-collective-control` | who signed, the stated where |
| 3.9j | rule number removed, swept | Agreements rule 92 removed | `cmip-collective-control` | who signed |
| 3.9k | swept |  | `cmip-collective-control`; `stand-in: words of sale` | what names what, the unknown party's protection |
| 3.9l | swept |  | `cmip-collective-control` | who signed |
| 3.9m | rule number removed, swept | Agreements rule 58 and the draft 24 heading removed | `cmip-collective-control` | what names what, a fork |
| 3.9n | swept |  | `cmip-collective-control` | what names what |
| 3.9o | rewritten on the model (question 19), swept | question 19; Agreements rule 12 removed | `stand-in: waterfall split`; `stand-in: payment by rail`; `stand-in: stake and transfer` | who signed, what names what, a fork |
| 3.9p | rule number removed, swept | Agreements rules 91 and 57 removed | `cmip-collective-control` | who signed |
| 3.9q | rule number removed, swept | Agreements rule 57 removed | `cmip-collective-control` | who signed |
| 3.9r | answer written in, swept | answer 13 | `cmip-collective-control`; `stand-in: ordered keeper record` | who signed, what names what, a fork |
| 3.9s | rule number removed, swept | Agreements rules 73 to 80 removed | the grant's own reach, its limits cMIP where it names one | who signed, a fork |
| 3.9t | rule number removed, swept | Agreements rules 11, 12, 16 and 30 removed | `stand-in: waterfall split`; `stand-in: words of sale` | who signed, what names what |
| 3.9u | rule number removed, swept | Agreements rules 16 and 17 removed | `stand-in: waterfall split` | who signed, what names what |
| 3.9v | rewritten on the model (question 19), swept | question 19; Agreements rules 15, 16 and 67 removed | `stand-in: waterfall split`; `stand-in: stake and transfer`; `cmip-collective-control` | who signed, what names what |
| 3.9x | rewritten on the model (question 19), swept | question 19; Agreements rules 76 and 79 removed; the keeper's record gone | `cmip-collective-control`; `stand-in: words of sale` | what names what, a fork |
| 3.9y | rule number removed, swept | Agreements rule 79 and the draft 24 heading removed | `cmip-collective-control` | what names what |
| 3.9z | rewritten on the model (question 19), swept | question 19; Agreements rule 12 removed | `stand-in: payment by rail`; `stand-in: waterfall split` | what names what, who signed |
| 3b 7ab | swept |  | `cmip-collective-control` | who signed, what names what |
| 3b 7ac | swept |  | `cmip-collective-control`; the time reference cMIP (task 10) | who signed, an anchoring, what names what |
| 3b 7ad | swept |  | `cmip-collective-control` | what names what, a fork |
| 3b 7aj | swept |  | `cmip-collective-control`; `stand-in: waterfall split`; `stand-in: stake and transfer` | who signed, what names what |
| 3b 7ak | swept |  | `cmip-collective-control` | who signed, what names what |
| 3b 7c | answer written in, swept | answer 4 | `cmip-collective-control`; `stand-in: words of sale` | who signed, what names what |
| 3b 7d | answer written in, swept | answer 4 | `cmip-collective-control` | who signed |
| 3b 7e | answer written in, the cut in three, swept | answers 4, 6; "We are, we use, we offer" | `cmip-collective-control`; `stand-in: payment by rail` | who signed |
| 3b 7f | answer written in, swept | answer 4 | `cmip-collective-control` | who signed |
| 3b 7l | answer written in, swept | answer 4 | `cmip-collective-control` | who signed |
| 6.1 | swept |  | the proven-delivery checker its access form names (step 8.6); `stand-in: words of sale` | who signed, what names what |
| 6.2 | rule number removed, swept | the draft 24 heading "Grant (type 9)" removed | the grant's own reach: the company's key deliveries | who signed |
| 6.3 | swept |  | the publication's ending condition, the company's signature (no cMIP); `stand-in: words of sale`; `stand-in: open obligation check` | who signed, the unknown party's protection |
| 7.1 | swept |  | `stand-in: play-count split`; the time reference cMIP (field 6) | who signed, what names what |
| 7.2 | swept |  | `stand-in: words of sale` | who signed, what names what |
| 7.3 | swept |  | the grant to the key-release service, its reach | who signed |
| 7.4 | swept |  | `stand-in: play-count split`; the play-count module, its use record | who signed |
| 7.5 | swept |  | `stand-in: words of sale` | an anchoring |
| 7.6 | swept |  | `stand-in: words of sale` | the unknown party's protection |
| 7.7 | swept |  | the publications' ending conditions: every party's, and the owners' side alone (no cMIP); `stand-in: words of sale`; `stand-in: play-count split` | who signed, what names what |
| 7.7b | swept |  | `stand-in: ending by clock` | an anchoring, who signed |
| 7.7c | swept |  | `stand-in: ending by clock` | what names what |
| 7.7d | answer written in, swept | answer 15 | `stand-in: ending by clock`; `stand-in: waterfall split` | an anchoring, who signed |
| 7.8 | rewritten on the model (question 19), swept | question 19; Agreements rule 15 removed; "the version in force" goes | `stand-in: words of sale`; `stand-in: waterfall split`; `stand-in: stake and transfer` | who signed, what names what |
| 7.8a | swept |  | `stand-in: waterfall split` | who signed, what names what |
| 7.8b | rule number removed, swept | Agreements rule 18 removed | `stand-in: waterfall split`; `stand-in: stake and transfer` | who signed, what names what |
| 7.9 | swept |  | the publication's clock, a block height; `stand-in: words of sale` | an anchoring |
| 7.10 | swept |  | `stand-in: open obligation check`; `stand-in: words of sale` | the unknown party's protection, who signed, the stated where |
| 9.1 | rule number removed, swept | Agreements rules 10, 12, 15 and 30 removed | `stand-in: stake and transfer`; `stand-in: waterfall split` | who signed, what names what |
| 9.2 | swept |  | `cmip-collective-control`; `stand-in: stake and transfer` | who signed, what names what |
| 9.3 | swept |  | `stand-in: abandonment clause`; `stand-in: stake and transfer`; `cmip-collective-control` | who signed, what names what |
| 9.4 | swept |  | `cmip-collective-control`; `stand-in: words of sale`; `stand-in: open obligation check` | the unknown party's protection, who signed |
| 9.6 | swept |  | the publication's ending condition, its parties' (no cMIP); `stand-in: words of sale` | a fork, who signed |

### Untouched by any cMIP

Agreement steps a cMIP cannot change, left as they are, and steps of other layers inside the agreement scenarios (TRACED to each step's words):

| Step | Why |
|---|---|
| 1.2 | a bake: Envelopes and Text, no agreement |
| 1.5c | a flow pointer and a rotation: Money and Identity |
| 2.1b | a bake's size: Envelopes |
| 2.4b | Money: a route, receipts, claims, formats or rails |
| 2.4c | Money: a route, receipts, claims, formats or rails |
| 2.4g | Money: a route, receipts, claims, formats or rails |
| 2.4h | Money: a route, receipts, claims, formats or rails |
| 2.4i | Money: a route, receipts, claims, formats or rails |
| 2.4j | Money: a route, receipts, claims, formats or rails |
| 2.5 | an unknown cMIP and a machine profile: Development and clients |
| 2.5c | a bare bake sold by its own price tag: Money and Identity, no agreement |
| 2.6b | a refund claimed by the committed key alone: Money |
| 3.7a | a founding's key grammar: who holds the chain key is the core's and Identity's |
| 3.7aa | a missing act answers unknown and voids nothing: the core's, as “A missing act stays unchecked: no door around it” |
| 3.8d | a succession plan's format (key 2): the grammar's, what names what |
| 3.9w | a complete ending is final against a later one naming it: knots, the core's |
| 3.9aa | a chain signature: Identity |
| 3.9ac | a signer's own chain orders the closings: knots, the core's |
| 3.9ae | finality on chain keys and placed releases: Identity's and the core's |
| 3.9af | a closing whose history is not held is unknown: the core's, as “A missing act stays unchecked: no door around it” |
| 5.3 | negotiation messages are talk: no agreement's doing, the core's |
| 8.1 | specifications: Development |
| 8.2 | specifications: Development |
| 8.3 | specifications: Development |
| 8.4 | specifications: Development |
| 8.5 | specifications: Development |
| 8.6 | specifications: Development |
| 8.7 | specifications: Development |
| 8.8 | specifications: Development |
| 8.9 | specifications: Development |
| 8.10 | specifications: Development |
| 8.11 | specifications: Development |
| 8.12 | specifications: Development |
| 9.5 | a collective's rotation and escape: Identity |
| 9.7 | a crossing to MOR 2: the MICS and Development |

Scenario 4 (a voting cMIP's), scenario 5's other steps (Identity, Text, Money) and scenario 8 (Development) are other layers, not touched.

### The stand-ins

Fourteen, each listed in Core components, "Stand-ins", as "a stand-in, for DubLaw's launch set to fill", none named like a real cMIP (COUNTED). S1's six kept. New in S2: `stand-in: stake and transfer` (what a share is, how it passes, who signs to lower or move it); `stand-in: waterfall split` (a split plan's division); `stand-in: words of sale` (a payment read under a publication's words); `stand-in: payment by rail` (task 6); `stand-in: abandonment clause` (the authority on absence and its outcomes); `stand-in: milestone terms` (a deadline on the terms' clock); `stand-in: vow marketplace` (how a marketplace sells others' vows); `stand-in: play-count split` (a month's receipts by play counts). They stand for what the lead's note for the Dubsar Suite lead leaves to DubLaw (`docs/lead/notes/2026-11-28-for-dubsar-from-this-round.md`): shares and how they move, "with DubPay where it pays". `cmip-collective-control` stays the one real cMIP, marked in every step that names it as reached by the model (section 3b's note).

### Agreements rule numbers left in v38

None in any step (COUNTED). Left, outside the steps, for P8 (answer 20): the head's example of the citation form (76); Core components' Agreements and `cmip-collective-control` boxes, as S1's list above has them; section 3b's first note (67). S1's list of numbers in steps is now history: each was removed, its sentence kept, or the step rewritten. Two draft 24 headings were in agreement steps and are removed: "A contest of a purchase" (2.4l), "Grant (type 9)" (6.2), with "Made before, made after" (3.9m, 3.9y) and "Fork (type 19)" (3.9w).

### Steps still marked open

COUNTED, eight: 1.5 and 1.5b (Identity rule 34's keeper case: for the Identity pass, answer 23); 1.9 (question 2 below); 3.7w (question 4); 3.7ae (question 5); 3.7ap (question 7); 3.9 (question 3); 3.9al (question 6).

### Questions for the MOR lead

One batch, each with the scribe's lean.

1. **Draft 24's format rules in agreement steps** (a field invalid in a kind of terms; "a judge never handles what it judges"; a threshold of parties as a deal's authority, 1.9c; outcome 2 struck): the core's grammar ("what names what"), or the cMIPs'? S2 kept the field and judge rules as the core's and wrote the authority and outcomes as `stand-in: abandonment clause`'s. *Lean:* field and judge rules stay the core's grammar until P8 says which fields stay; the clause's outcomes are the cMIP's.
2. **An abandonment clause in the ending condition** (1.9): may a deal's ending condition name its clause, so that a declaration under it counts for the absent party's signature (the scheme they agreed to, 08:58)? *Lean:* yes, where the ending condition names it; otherwise the absent party's signature is asked.
3. **Successors founded before the fork act** (3.9, answer 7): are they ordered after the fork act that names them? *Lean:* yes in effect: their pointers count only once the fork act that names them is complete, so the fork act is the one ending.
4. **A rotation declaring an agreement whose pointer closed nothing** (3.7w; answer 6 reads the closing case): what does the identity name? *Lean:* still the old agreement; the rotation's declaration puts nothing in force in Agreements.
5. **A pointer that meets the ending condition, with no rotation declaring it** (3.7ae): is the old agreement closed? *Lean:* closed in Agreements, its signatures meeting the condition, the identity naming the old one until a rotation; the old runs on for its standing obligations (answer 24).
6. **Answers 6 and 24 together** (3.9al): once the identity declares the new agreement, under which identity are the old one's standing acts signed? *Lean:* the same identity, each act naming the old agreement it is made under.
7. **Marks** (3.7ap): does a new agreement still carry a mark naming the power it is made under? *Lean:* no: the pointer's signatures are read against the ending condition, so a mark says nothing the bytes do not; the step keeps the case.
8. **A refund owed to a payer who bought through no spot** (3.9f's second collective): a debt under answer 10, barring nothing? *Lean:* yes (INFERRED from answers 10 and 11).
9. **The default ending condition and 13:58** (1.7, 2.6, 6.3, 7.7, 9.6 run on it with "no cMIP"): does "no agreement step is answered by the core alone" ask a stand-in for the default too? *Lean:* no: answer 1 makes it the core's default, and each such step's other answers still run on cMIPs.
10. **Type numbers** ("Agreements type 13", "type 4") are left in steps beside draft 24's field numbers. *Lean:* keep them with the fields, as answer 22.
11. **The guarantees list** (13:58, the lead's): S2 used it as six names in every **Beneath**. Should "the unknown party's protection" also name "the known parties' protection, by their signatures" (08:58), now written under "who signed"? *Lean:* keep six, the known parties under "who signed".

12. **A closing the stake cMIP refuses** (1.9d, and every step where a pointer lowers a holder's share): the parties' pointer meets the ending condition, but `stand-in: stake and transfer` answers that the holder must sign. Is the old agreement closed while the lowering is not in force, or does answer 2 apply (the new agreement in force among its signers, the old going on)? *Lean:* the closing is the core's, by the ending condition; the share as lowered is unchecked, or refused, by the cMIP's answer, the holder bound in nothing; stated in each such step once settled.

### Questions for Nobody, allegedly

His, one at a time; each is the MOR lead's to put to him, listed so by the lead.

- **N1 (his).** When a collective changes who it is, the old one still has deals running. The MOR lead's sentence, from your words of 10:15 ("they are operating two collectives at once, because the old one still has obligations via standing agreements"): the old agreement takes no new commitments; what it still owes is done under it, by its last rules, by the people its rules name, until each is delivered; then nothing more is done under it. Is that what you meant? *The scribe's lean:* yes.
- **N2 (his), after N1.** A collective may dissolve while it still owes a debt to someone who is neither a party nor a buyer through a spot (a supplier, a lender): the core does not stop it; the creditor keeps the signed debt. Is that a cost you accept? *The scribe's lean:* yes, as the MOR lead answered (answer 10).

### The checks

Run by the scribe's `check.py` (outside the repository) on v37 and `docs/decisions.md` at main, v38 and this file. Results:

- PASS: every v37 step number in v38 (214 in v37, 219 in v38, missing [])
- PASS: every agreement step names a cMIP or stand-in, or is listed untouched (158 name their cMIPs, 35 listed untouched; failing [])
- PASS: no Agreements rule number in a step ([])
- PASS: every ledger heading cited exists on main, word for word (27 cited; not found [])
- PASS: his words against the ledger, typos included (16 quoted; not found [])
- PASS: every other curly quote in v38 is in the ledger ([])
- PASS: every stand-in labelled and listed, none named like a real cMIP (14 used, 14 listed; unlabelled steps []; diff set())
- PASS: spec/README.md and v37 untouched; only the two files changed (['docs/freeze-suite-v38-changes.md', 'spec/03-MOR-freeze-test-suite-v38.md'])
- PASS: nothing forbidden; no line ends in a space ([])
- PASS: steps still marked open (listed) (8: ['1.5', '1.5b', '1.9', '3.7w', '3.7ae', '3.7ap', '3.9', '3.9al'])

### The stranger's run

A subagent that had seen neither the ledger nor the scribe's prompt was given v38 alone and three swept steps: 1.9d (a share moving), 7.10 (an ending, and a closing pointer, while a listener's month is open) and 3.9am (a collective cut in three). For each it could list the verdicts and tell, from the step's words, which were a cMIP's (each named in **Runs on**, "its answer, and without it, unchecked") and which the core's (each named in **Beneath**). It stopped where the words did not say enough.

Fixed, needing no choice: in 7.10, the keys still owed given to `stand-in: words of sale`, the publication's clock named in **Runs on**, and the pointer made while her month is open written by answer 24 (the lead's, to check); in 3.9am, the "we use" agreement's ending condition (the default, answer 1) and who signs it for "we are" (its rule for Agreements), the old "we use" running on with the old "we are" (answer 24), the buyers kept whichever "we are" follows, an answer given to each stand-in named, and renew or exit written under "who signed".

Listed, needing a choice (question 12 below): in 1.9d, the verdict where the parties' pointer meets the ownership agreement's ending condition but `stand-in: stake and transfer` answers that the investor must sign to lower its share. Other stops are the step's setup, in steps it was not given (the investor's holding, 7.10's keepers and ending condition, how an agreement is a party: steps 1.4, 7.1, 7.7, 3.1), or formats v38 does not give (answer 25).
