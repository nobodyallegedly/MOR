# The first freeze rehearsal: the players' cases, assessed

*Fable, 7 November 2026. Input: the ten players' `beef-with-the-core.md` and `relationships.md` and their earlier `findings.md`, position papers, terms and drafts, on the branch `claude/market` at its latest commit, `0872dffd`; `docs/s7q-report.md`; F420 to F433; my `docs/reviews/fable-last-read.md`; and the eight texts at `af2ed6f8` (Identity draft 15, Text 11, Envelopes 11, Money 13, Agreements 23, Development 11, MICS v36, suite v36) with the default control cMIP draft 6, read where each case points. No player's files are missing. The tally (`claude/MOR-rehearsal-findings-tally.md`) is not in the repository, so it was not read. Read, not run: Counterparty's probes are reported, not re-run here; where I say "confirmed" I mean confirmed from the texts. An independent assessment, reached without the MOR lead's; a recommendation, nothing decided.*

## In plain words

The players found three holes in the way out, and all three are real. A holder of both keys can unmake a sale, an ending or a keeper's testimony by an escape that abandons the chain act that placed it, and the texts then invalidate what others relied on instead of showing it as a dispute. The members of a collective can rewrite the absence clause with every member's signature, which no outside holder has, and then declare a present outside holder absent and share out its stake. A home operator's rotation that keeps no receipt line unmakes its customers' rotations, so an owner who evicted a thief finds the thief's acts valid again. Each is a guarantee the core already claims ("what others relied on stands"; "no stake moved without its holder"; "a home cannot forge a key change") broken by a sentence elsewhere, and each closes with one or two sentences whose cost I name. Beside them, two guarantees the core claims and does not keep (a fee's receiver is an address nobody signed; an audited owner is beaten by a thief who drops the audit), one way-out gap the players argued among themselves (a publication's owners cannot leave their split service, nor end their own offer, without its signature), and one privacy lever (a one-millionth share sold to a deal makes a collective's money public for good) that I would close because the fix is one sentence and deterministic.

Of the rest, most is wording that two conforming clients read two ways, and a handful are things the core is right not to promise and should say once. The largest cluster, a broken vow's refund with nowhere to wait, reached by five players, is not missing grammar: the split's own grammar reaches it, with one clause on when evidence may be acknowledged. The players are wrong in a few places, said below as plainly as where they are right.

**The freeze:** not ready at `af2ed6f8`; ready with the list in section 6, about twenty-five sentences across Identity, Agreements, Money and the suite, no code, then one more rehearsal round on the new drafts. Nothing the players found asks for a new mechanism; everything asks the core to keep a promise it already makes, or to say once what it does not promise.

Marks used below: **change** (before the freeze, with the sentence and its cost), **stated cost** (right not to promise; say it once), **cMIP's** (whose), **misreading** (the sentence that answers it). Cases are merged across players; each names every player who reached it.

## 1. The way out first

### R1. An escape unmakes what a chain act placed (Counterparty C2; Keep case 3; Postmark case 1; Ampersand case 7; Longhouse cites it) — **change**

**Confirmed.** Identity rule 29's stated cost: "a Module may so sign an escape that abandons a rotation which counts. An abandoned rotation never counts (section 11), so the escape then wins, and the acts bound to the abandoned rotation fail everyday check 2." Section 7: a chain signature competes for its position as a rotation does; section 11: the endorsement "may list, under key 0, earlier rotations at the same position that the owner abandons". A verifier reads the list; only the Module's conformance bounds it, and an owner chooses its Module. So a seller places a transfer by a chain signature (Agreements rule 10, "A sale takes effect on the seller's own line"), is paid, then escapes at that position abandoning it: the placing is gone, and nothing in Agreements says what the buyer is owed. The same for a member's or successor's chain signature on an ending (rule 91 guards only against "a later rotation"), and, through everyday check 2, for every act bound to an abandoned rotation: a keeper's records included (Postmark), which rule 42 protects only against "a later rotation". Worse than void: an act failing check 2 is invalid, and an invalid act is never a dispute, so "what others relied on stands" cannot reach it.

**The pattern** is the first of the four: the thing that decides (whether the sale stands) is signed by the seller alone. The escape must stay: a thief holding the chain key can quietly take the next one by a chain signature (section 7), and the owner evicts it by abandoning that signature. So the fix is not in Identity's escape but in what abandonment does to what others relied on, which is where the core already draws that line for rotations.

**Sentences.** Identity, rule 29's stated cost and everyday check 2: *An act bound to a rotation an escape abandons is judged as rule 34 judges an act outside a rotation's kept ancestry: void, or, where another identity acknowledged it or a named keeper recorded it before recording the escape, shown as disputed.* Agreements, rule 10 and rule 91: *A chain signature's placing stands for the act it placed once that act is complete (a transfer both signatures placed; an ending complete; a successor's debt accepted), whatever an escape of its signer later abandons; the escape is shown as a dispute on it.* Rule 42: *"later rotation" includes an escape abandoning the rotation the record was bound to.*

**Cost, a real choice for Nobody, allegedly:** an owner robbed of both keys cannot, by escape, undo a sale or an ending the thief completed with a buyer in good faith. Identity already states that a stolen chain key is the owner's loss ("like a stolen bitcoin key"); this makes Agreements consistent with it rather than letting every honest seller unmake every sale, which no verifier can tell from an honest escape. One freeze scenario in 3.9 (an escape after a placed sale) so it cannot come back.

### R2. The members take an outside holder's stake through the absence clause (Counterparty C3; Plain Words case 2; Ampersand backs; Keep agrees) — **change**

**Confirmed.** Rule 85: a declaration against "a holder of the collective's stake in itself who is no party ... is made under the clause in force; its authority and its absence-proof cMIP are the clause's"; rule 67: the judicial tier, the abandonment clause among it, changes "only with the signature of every member whose voice remains"; an outside holder has none; rule 88: a contest "voids nothing"; rule 89: outcome 1 against a holder whose plan names no stake successor shares the stake out. The core does not check the period of absence. So the members alone write the clause (one of them as authority, no absence-proof cMIP), declare a present buyer or departed founder absent, and take the stake. Rule 98.2's "a stake moves ... only with its holder, save by succession, the declaration of absence's two outcomes" has an exception that swallows it for every holder who is no member. A buyer of a share has no plan at all; a departed founder's defence (a stake successor named while a member) exists but is not a rule.

**The pattern:** the thing that decides is signed by the wrong party. The core already has the right rule for exactly this shape, rule 48's: a rule binds the holders who accepted it, by signing a version carrying it or by buying under it; and rule 87 already finds, for a party, "the last version of that agreement that the party signed" in the declaration's field 1. The asymmetry for outside holders was chosen (F-series: "so a holder who vanished does not block every change for good"), and the rehearsal shows its price.

**Sentences.** Rule 85 and the declaration's field 1 check: *A declaration against a holder who is no party is judged under the abandonment clause of the version that holder last signed as a party, or, for a holder that bought in, the version in force where the collective's line placed its transfer (rule 48); field 1 names that version, as it names a party's last. Its authority and its absence-proof cMIP are that clause's.* The succession plan's format (Plain Words PW-4, Keep): *A plan naming its own party as stake successor names none.*

**Cost:** "one version of the clause for everyone" holds for the members and no longer for outside holders, who are judged by the clause they accepted, as they are by the holders' rule they accepted; a verifier finds it per holder, by the check rule 87 already runs. A vanished holder stays reachable under its own clause; where that clause's authority has itself vanished, its chain of judgment or the holder's plan is the way, a stated cost to write beside it.

### R3. A home operator's rotation unmakes its customers' key changes (Counterparty C4; Keep case 1; Longhouse case 1; Postmark bought audit for it) — **change**

**Confirmed.** Receipt check 5: "A receipt that lies outside the kept ancestry of a later counting rotation of the home's operator is void, unless it is included under a cosigned log summary." Rule 35 asks the operator to keep its receipt line as a SHOULD. So an operator's rotation that names no tip of its receipt sequence, by bug or on purpose, voids every receipt it signed; the customer's rotation no longer meets its home rule; its chain falls back; the evicted key's acts are valid again. Freeze step 5.7c passes only because its test's closing rotation keeps the receipts.

**The pattern:** a lower layer's guarantee (an owner's rotation counts) rests on another identity's chain staying as it was. The core already makes the exception for keepers' records that placed something (rule 42) and for acts the collective's line placed; a home's receipt is the same kind of thing: evidence another party built on.

**Sentence.** Receipt check 5: *A receipt that counted toward the home rule at a position keeps counting there whatever its operator's later rotation keeps or disowns, shown as disputed, as a keeper's record a rule read to place an act does (Agreements rule 42); only a receipt under a cosigned summary was ever unvoidable, and now none is.* Check 6 then covers the dispute.

**Cost:** an operator whose signing key was stolen can no longer void, by rotation, receipts the thief signed. The loss is small and already bounded: a forged receipt supports only an act that passes receipt check 1, which needs the identity's own chain key, so a stolen operator key alone changes no chain (the MICS says so); what the operator loses is the power to erase its own dishonesty at a position (rule 45), which is the point.

### R4. A thief's rotation that drops the audit beats an audited owner (Counterparty C5; Keep case 2; Longhouse case 4) — **change**

**Confirmed.** Receipt check 4: "The audit requirement that applies is the one the named rotation itself declares." A thief holding the chain key and the home's signing key signs a rival rotation declaring no auditors; its receipt counts outright until the owner's receipt is cosigned, and the texts' own homeless procedure already refuses exactly this ("A thief holding the chain key can neither drop auditing ... nor name auditors of its own", step 4). Requiring audit makes the window worse than not requiring it.

**Sentence,** narrow so that rule 56's way to drop vanished auditors stands: *Where a position is contested by two rotations revealing the same chain key, each is judged under the audit requirement in effect before the position; a rotation alone at its position is judged under the requirement it declares.* **Cost:** none to an honest owner; a thief's uncosigned receipt never counts outright at a contested position, and the worst outcome is contested, which the escape leaves.

### R5. A publication's owners cannot leave their split service, nor end their own offer, without its signature (Hop H7, against its own interest; Plain Words case 7; Counterparty confirms; Longhouse disagrees) — **change**

**Confirmed.** Rule 31: "every party signing it, the new service among them"; a deal's clone needs every party whose voice remains (rule 47); a publication ends "by a later version that sells nothing, a version every party signs"; the tag is withdrawn by its signer, the service (Money rule 18); backups take a payment only where an attempt fails; the absence clause reaches only the absent. I looked for the owners' way round and found none: a publication follows its ownership agreement's line through clones, so a new ownership agreement for the same work leaves the old publication selling; only a release to the public domain closes it. So the owners of a work cannot stop selling it, nor change who holds their money, without their partners' and their service's consent. Longhouse calls that a deal's rule; it is, and it fails the first principle for the one party a publication exists for.

**Sentence,** one named exception to "every party": *A publication's owners' side, under its own rule, may alone sign a version that sells nothing (its ending), or one that changes only its split service and backups (fields 3, 11, 12); every other version needs every party. A replaced service withdraws its tags and still owes payouts on everything it received (rule 31).* **Cost:** a partner or service loses a veto over the ending and over its own replacement; one who wants security writes a term (an obligation owed on ending), as in every other deal. Past sales stand, so nothing paid moves.

### R6. One member can make a collective's money public for good (Counterparty C12, C14; Ampersand case 1, which stops its founding; The Back Row case 3; Plain Words case 3; Hop H10) — **change**

**Confirmed.** Rule 57: "where a holder is a deal, the act is public"; a holder's transfer of its own share is a way-out act no model may block (rule 98); a deal has no line, which is rule 57's reason. So a one-millionth share sold to a deal makes every Money act of the collective public, forever. **The pattern:** a rule that protects the owner (sight of the collective's money) traps everyone else, by a lever any one holder can pull. The fix is deterministic, which is what rule 57 feared losing: *Where a holder is a deal, the act is done when sealed to each party of the version of that deal the transfer placing it names (its founding, for a holder at founding), or public.* The set is fixed by the transfer the line placed, so every verifier reads the same recipients. **Cost:** a party the deal adds later is not reached by the collective's sealing and gets the key from its co-parties; the deal chose its parties.

With it, Ampersand's case 2 and Plain Words' case 3 (the holding-collective defence stops the metric paying members) lose their sting, and are answered anyway below (R20).

### R7. A collective cannot be a confirmed successor (Keep case 5; Postmark and Longhouse the neighbouring question) — **change, one clause**

**Confirmed.** Identity section 8 confirms a succession "by a link confirmation of the successor naming the rotation, or by a witness act of the successor"; both are everyday acts; "An everyday act whose signer is a collective is invalid" (everyday check 4). Agreements cannot help: section 8 is Identity's and reads Identity acts. The way to let a collective confirm without tying Identity to Agreements is Identity's own grammar: *or by a chain signature of the successor naming the rotation*, which a collective signs under its key grammar. **Cost:** one chain-key ceremony to confirm; a sentence. If Nobody, allegedly, prefers not, the stated cost is one sentence: *A collective is never a confirmed successor.*

### R8. A keeper or a home passes by rotation, never by succession (Postmark case 3; Longhouse case 5; Backlot backs) — **stated cost**

Right as it is: a keeper is its operator identity (terms field 3), a home likewise, and only the named identity's records or receipts count. Say it once, in Identity's succession section: *An operator's role, as home, keeper or auditor, is its identity's: it passes by that identity's rotation to new holders of its chain key, and never by succession, which names another identity.*

### R9. A confirmed succession acts at once (Keep case 6; Counterparty as a stated cost; The Back Row withdrew its reading) — **stated cost**

"Clients ... follow it only confirmed" makes confirmation necessary, not sufficient. One sentence in section 8: *Confirmation obliges no client to follow at once; when a client follows a confirmed succession is its own rule, or a cMIP's.*

### R10. Whether a conditional debt binds a closing (Plain Words PW-5 and case 4; The Back Row case 4; Backlot case 1; Ampersand case 6) — **misreading, with a sentence to make it plain**

The texts answer it through unknown: the closing counts "every obligation that binds it"; an obligation that depends on a condition binds where the condition holds (rule 34); and a verifier that cannot decide a condition answers unknown, never "not complete" ("A verifier that does not hold every act the closing's history names ... unknown"). So a closing with a conditional debt whose condition is not yet decided is unknown, which is what the players want: it cannot pass. One sentence in the closing's conditions so nobody reads it the other way: *An obligation whose condition the condition cMIP answers unknown at the closing's line leaves the closing unknown; one it answers false binds nothing; one it answers true is owed like any other.* **Cost:** a collective with a period running cannot close until it ends or the creditors release, which is the point.

### R11. A holders' rule cannot bind a member to release its stake on leaving (Ampersand case 9) — **misreading**

No, by two sentences: rule 94, a holders' rule "reaches only the changes that hit every owner of the stake alike"; rule 98.2, "Field 7 changes only by a placed transfer, a succession, an absence outcome or such an issuance". A release on departure moves one holder's stake and is none of the four; and a transfer back to the collective is invalid ("The collective holds no share of itself"). A departing member keeps its stake. The structure that sheds a stake on departure is a vehicle the members hold the stake through, which R20 makes workable.

### R12. A lost chain key; a chain signature quietly taking the next key; a member who lost the chain key can still leave — **stated cost, already stated**

Accepted by every player who raised them (Counterparty, Keep, The Back Row); Keep's finding 3 was answered by rule 70 (a resignation needs the member's own key). Nothing to add.

## 2. Guarantees the core claims and does not keep

### R13. A fee can be paid to anyone (Counterparty C1; Ampersand case 4; Hop and Plain Words rebuilt around it) — **change**

**Confirmed.** The plan's fee entry is `[ module, part, ? scope ]`, naming no receiver; the split's checklist asks only that "a fee payout is a fee entry's"; the promise two lines below is "never an address the parties did not sign". Development field 7 already says who a Module's fee is paid to (`fee = [ rate, ? paid ]`, "absent, the creator"), and rule 28 calls it "informative". **Sentence,** in the split's checklist: *a fee payout's receiver is the identity the Module's specification names as paid (Development field 7), or its creator where it names none; a fee payout to any other receiver is a mismatch.* **Cost:** the verifier reads the Module's specification, a public bake it already needs to hold to name the fee; a Module not held leaves the receiver unknown, as its amount already is. Two sentences in the MICS's splits bullet and the glossary follow.

### R14. A rail that binds no amount (Counterparty C10; Hop agrees) — **change, one sentence**

Development field 13 binds payee, purpose and previous hop, never the amount; Money's "greater amount counts until the receiver signs a receipt matching the payment" cannot be settled on a proof that shows no amount. The two founding rails bind it. One sentence in Money rule 8 or Development's rail-Module format: *A rail Module's verification answer states the amount the hop moved, read from the proof; a Module whose proof shows none is no rail Module.* **Cost:** none today.

### R15. The refund rail's limit is read per payment (Counterparty C8) — **change, one clause**

Rule 17 counts a refund "only up to the payer's vault limit ... as rule 3 reads it", and rule 3 reads a single payment, so a thief who named his own refund rail is repaid in pieces. The rule's own reason is the total. *The limit bounds what is counted as repaid to that refund rail toward that refund, over every payment to it.*

## 3. The refund cluster, and the split's grammar

### R16. A broken vow's refund has nowhere to wait (Hop H1; Plain Words PW-2, PW-3, case 1; The Back Row case 2; Backlot case 2; Ampersand case 6) — **misreading of the grammar, plus one clause the core must add**

Five players agree the split's grammar cannot hold money for the buyer: rule 27 pays only the plan; the payout format has no "owed back"; rule 34's conditional payout has no entry in the plan. They are right about rule 34, which promises a publication's split something the plan cannot say, and that is a two-way reading to close. They are wrong that the grammar is missing. The split plan already has a share whose receiver is known only at payment time and is decided by evidence signed by someone on the buyer's side: the role share (rule 22). A plan can write a role, "refund", of any part, filled by the payer, whose evidence is an act signed by someone other than the service and the payer (the payout's format asks for that): a named keeper's record of the buyer's contest, or an arbitrator's finding under the chain of judgment, acknowledged by the buyer; unfilled, it goes to the owners' line (plan key 3). The split cMIP, which already sets when the service splits (rule 26: "accumulate and pay out periodically or above a threshold"), signs the split at the vow's point. A buyer whose contest a keeper recorded by then is repaid from what the service holds, at the refund rail its claim names; one who did not contest, pays; and the buyer's word alone decides nothing, which is as it should be. The real seller's record shows it, as a role payout, which is more legible than an escrow.

What stops it today is one timing sentence in rule 22: "Evidence is acknowledged in the claim written at payment", and the stated cost "a record acknowledged after the split fills nothing". Money rule 29 already has a payer writing a second claim of the same payment. **Sentence:** *Evidence is acknowledged in a claim of the payment its payer writes before the split, the claim written at payment or a later claim of the same payment (Money rule 29); a record acknowledged after the split fills nothing.* And rule 34, scoped: *A deal's obligation or payout may depend on a condition; a publication's split follows its plan's evidence (rule 22), never a condition.* An italic example beside rule 22 (the refund role) so that the next drafter sees it. **Cost:** the service holds the money until the vow's point, which is what a refund needs and the cMIP's parameters already allow; the publication names a keeper or an arbitrator, which a vow's terms need anyway (R30); no new payout kind, no new state.

### R17. A metric share no record measures falls to the owners' line (Hop H5; Ampersand dropped it) — **change, one clause**

Plan key 3 gives a role share nobody fills three destinations and a metric share none; there is no reason for the asymmetry. *Plan key 3's choice applies to a metric share no record measures.*

### R18. "Already pays" for a holder paid nothing (Hop H4; Backlot; Plain Words dropped it) — **change, wording**

The verifier counts every holder of the stake in the version in force, paid or not; the text does not say. Write what the code does: *the publication's partners and every holder of the stake of the ownership agreement it names, in the version in force for the receipt, paid or not.* Every bundle in the market rests on it; a narrower code reading would break both pools.

### R19. Who receives a split that pays the stake nothing (Counterparty C15; Hop H10; Ampersand case 8) — **change, wording**

Rule 9's conformance ("every receipt for a stake to every holder of it, paid or not") and rule 20 ("every holder and partner it pays") read two ways. Rule 9's purpose is the leftover count, which needs every split that divides the stake. Scope it: *every split that divides the stake*. A split whose owners' line pays nothing is delivered to those it pays. **Cost:** a sliver's buyer reads the splits that pay it, not every payment's spread.

### R20. A metric cannot pay through a holding collective (Ampersand case 2; Plain Words case 3) — **misreading**

Rule 15 already divides "layer by layer": an owner that is a collective "is paid at its own pointer, which leads to the split service its own split agreement names ... it adds one layer of splitting when the money gets to that identity". A holding collective's own split agreement may carry a metric share dividing by the same records among its holders, the members, who are identities its plan pays. Two levels, two plans, the records shared. No change; the first-layer check reads the first layer, as it should.

### R21. The payer cannot contest the record that divides its own payment (Counterparty C13; The Back Row case 5; Ampersand case 5; Backlot case 4) — **change, one line**

Standing is the core's (rule 54), a contest moves nothing, and the payer is as affected by the record as a holder. *The payer a payment's commitment names has standing to contest an act the split of that payment rests on.* A named verifier remains the terms' choice.

### R22. A buyer-measured metric (Hop H3; Ampersand case 3; Backlot case 3) — **a Module's job**

Hop's countersigning measurer (its Module draft 2) fits the core's form: the measurer named in advance signs what the payer's client computed. A measurer who is the payer of each payment is a second kind of measurer the core does not need: the payer can already tilt its own money by what it buys. Not for MOR 1.

### R23. A relay's delivery record under a pass (Hop H6; Longhouse accepts the partner share) — **cMIP's, with a half-clause**

Rule 22 counts a delivery record only where "the object it names is the one the payment was for, where the verifier reads the record's format". A pass sells access, and what access covers is the access form's cMIP's to say. *or one the publication's access form covers, as its cMIP says* lets the verifier that reads that cMIP count it, and leaves it unknown otherwise. A partner share works today; this can wait if the list must be shorter.

### R24. A replaced service's tag keeps counting on a push rail (Hop H8) — **stated cost**

On a push rail a vanished service signs no receipt, so the payment stays pending and no purchase occurs; the buyer paid a dead address, as it would any dead address. Rule 12's strong SHOULD (check the latest version) is the defence. Say it once beside rule 12; no push rail exists.

### R25. Batches (Counterparty C12; Hop case 9) — **a cMIP's, and the reference code**

The batch's format is the payment cMIP's, which leaves it undefined; Money rule 12's "amounts together do not exceed what the payment shows" is the core's and must be checked in the reference verifier. Not a text change. Step 7.4 is "reasoned" until a batch exists and the check is in code.

### R26. Grants under a power by share survive a change of control model (Counterparty C12) — **change, one sentence, low weight**

Rule 74 ends "a grant naming an area"; a grant that counted only under the old model's by-share answer (F428) keeps backing acts after the new model withdrew the power. A verifier knows, when it judged the grant, whether its signers met the layer's rule alone or needed the model's answer. *A change of control model also ends every grant that counted only under the old model's answer.* Only a second model is touched; cheap enough to close now.

## 4. Identity's evidence, audits and keepers

### R27. The same verdict, not the same evidence; omission by a home unprovable (Counterparty case 15; Longhouse cases 2 and F-LH-1; Keep case 7; Pointer P4; Backlot case 5; Postmark's paper) — **stated cost, said once**

Right not to promise: freshness needs a clock the core has not, and the market answered in two days (head statements, intake receipts, readers that ask every home). Two sentences in Identity section 4 or the MICS: *The core decides alike on the same evidence and does not promise the same evidence: a home's compliance with rules 19 and 20 shows only through its receipts, its cosigned summaries and the other homes, and no verifier can prove an omission; completeness and freshness are the market's.* And rules 19 and 20 marked as conduct no verifier can check, as the MICS says such rules are.

### R28. Must a declared auditor run a relay (Longhouse F-LH-2, case 3; Keep case 4; Postmark case 4; Backlot) — **change, wording**

The check ("Log summaries and audits", 3) asks only for an identity the owner declared; the glossary, rule 56 and section 13 say "operator". The check is the right reading: an auditor checks consistency proofs and signs, and needs no relay for either. Three words. **Cost:** none.

### R29. A keeper's successor in the chain of judgment shows a deadline missed falsely (Postmark case 2; Hop) — **change, one sentence**

Rule 33 shows a deadline missed by a named keeper's anchored sequence holding no record of the act; a successor that began keeping after the point holds no record of anything. *A keeper's sequence shows a deadline missed only where it holds a record anchored at or before the deadline's point; a sequence whose earliest anchor lies past the point shows nothing missed.* Mechanical; nothing lost.

### R30. A publication names no keepers (Postmark case 5; Hop and Backlot built on the opposite) — **change, one line in the format**

"Belongs to" answers it far from the publication. *A publication's keepers are those of the ownership agreement it names; a lone seller's publication has none, and its deadlines can be shown met by anchors but never missed.*

### R31. What sits in a keeper's one sequence (Postmark case 7) — **change, wording**

The type 2 format already says `prev` "names the operator's previous keeper record": *a keeper's sequence holds its keeper records and nothing else*, said in rule 37.

### R32. A keeper is a relay operator, three wordings (Postmark case 8) — **wording**

The glossary's reading in the MICS: a relay whose operator signs an ordering.

### R33. "Not before" (Postmark case 6) — **cMIP's**

Rule 33 says it is no mechanism of MOR 1; a condition cMIP may read a block an act names, and the terms may run a debt from the last day the service is shown delivering, as Ampersand's now does. A clause in rule 33's commentary saying a condition cMIP may is harmless; not needed.

## 5. Conformance sentences read two ways

### R34. Who reads a buyer's claim (Pointer P8, case 1; The Back Row findings 1 and 6, case 1; Counterparty case 9; Hop, Dubsar) — **change**

The sentence after the contest format ("where the payee of a purchase is a collective, or an agreement with several parties ... or public") predates the redesign: under a publication the payee is the split service (rule 16), so read literally it never applies, and read as the owners' side it lets a conforming client publish every subscriber's claim in a pool. **Sentence:** *The buyer's client makes its claim of the purchase readable by the payee, the split service (rule 16); by the owners' side or anyone else only by the buyer's choice, shown before paying; never public by a client's choice. A buyer who contests makes the contest readable as rule 54's standing needs.* **Cost:** the owners lose the per-buyer view the 23 October note meant to give them; they keep every receipt and every split.

### R35. The default control cMIP named, not pinned (Plain Words PW-1, case 5; Pointer P7, case 3) — **change, wording**

A cMIP's spec hash covers its creator, who uploads it after the freeze, so the core cannot pin it by hash. The conformance sentence should not name a default at all: *A client acting for or reading a collective holds the control model the collective's terms name (field 35), or shows what that model decides as unknown (rule 99).* The suite's pin by file path stays for the rehearsal. **Cost:** none; the reference verifier implementing the cMIP's rules is Dubsar's choice, not the core's.

### R36. "Salt: random" (Pointer case 4; Keep) — **change, two words**

*unpredictable to anyone without the signer's secrets* in place of "random", in Envelopes' inside format. The guarantee is the same; no verifier can tell.

### R37. Showing a rule's hash before signing (Pointer case 5) — **client's**

Development rule 13 is already a conformance duty; one clause ("the client shows the specification's creator and enough of its hash to tell it apart") costs nothing and can go in the same pass; a client's job otherwise.

### R38. Field 10 binds nothing (Counterparty C11) — **misreading**

Agreements rule 60: "In a collective, a verifier applies an extension's rules only to acts of Development and of the layers whose rule its adoption met." An extension's own acts belong to Development; the core verifier runs no extension's rules; a client implementing one applies them within that sentence, which it can read from the clone's mark. Field 10 coming from the calling app in the reference binding is Dubsar's defect, told to its lead. The collective's Money signers are not bypassed: an under-declared extension's rules do not reach Money acts.

### R39. Two claims naming an unadopted rail Module make a vow's sales unknown (Counterparty C6) — **misreading, and a code defect**

Money rule 4: "A receipt or claim naming any other rail Module counts for nothing, whatever its rail's proof shows", where "other" is any Module the payee's pointer or vault does not name; no proof need be read to see that a Module is nowhere in the payee's pointers. The reference verifier registering such a record as unanswered is a defect to log, not a rule. A Module the payee does name and the verifier does not implement is rightly unknown, two of them rightly making the list unknown: that is the cost of not implementing a rail the payee accepts.

### R40. One key for a ten-track publication; a bare bake's refund; step 5.2 (Counterparty C7; The Back Row finding 3) — **stated cost and wording**

A multi-bake publication is delivered when "the content key ... completes every purchase it reaches, a cMIP binding them tighter where it names one": partial delivery of a bundle is the stated cost rule 13 already names, and the cMIP is the remedy. Say "each bake's content key" and the cost in one line. A bare bake's refund: Money rule 18 points to rule 11, which reads "a payment that receives neither ... creates an obligation to refund it"; one clause, "a bare bake's tag payment likewise". Step 5.2 describes two purchases, one by nobody (a gift) and one by a fresh identity (refunded); "a second purchase" makes it unmistakable.

### R41. Spec/README cites `fable-last-read.md`, not at `af2ed6f8` (Counterparty) — **wording**

The review is on an unmerged branch; the pointer should wait for the merge or name the pull request.

## 6. What blocks a freeze step as written

| Step | Player | Does it block? | What makes it pass |
| --- | --- | --- | --- |
| 5.7c, a used chain key after a closure rewrites nothing | Counterparty, Keep, Longhouse | Yes: the step's claim holds only where the closing rotation keeps the receipts, which no rule requires | R3's sentence; then the step runs with a closing rotation that keeps nothing |
| 5.7d, the audit settles which receipt is real | Counterparty, Keep, Longhouse | Yes, as claimed: a rival dropping the audit counts outright until the cosignature | R4's sentence; the step then reads "contested, never the thief outright" |
| 5.2, the anonymous buyer refunded | Counterparty | No: two purchases, one a gift and one as a fresh identity | "a second purchase" in the step |
| 7.4, a batch | Counterparty, Hop | As a run, yes: no cMIP defines a batch and the code checks no total | "reasoned" until the payment cMIP defines one and the code checks Money rule 12's total |
| Scenario 7, step 7, the service signs its replacement | Hop | No: passes as written, by courtesy | R5 makes it a guarantee; the step then adds the owners' side replacing a service that does not sign |
| The checklist items on role shares and use records (Pointer's line numbers 134 and 230 are not scenario numbers) | Pointer, Hop | Not blocked; "reasoned" is allowed, and should not be used here | Vectors before the freeze: a role share acknowledged and not; a delivery and a use record; a record naming the wrong object; a metric payout to a holder paid nothing; a metric payout whose measurer is the service |
| 3.9aa, 3.9ae, 7f (the escape) | Counterparty | No step covers R1 | One new step in 3.9: an escape after a placed sale |

## 7. Which cases hold up a market

From the ten relationships pages, the relationships several players say they cannot do without, and the cases under them:

- **Hop with both DAOs** (Hop's two customers; Plain Words' "Hop, or any split service"; Pointer's role share exists only in their plans): R18 (the wording every bundle rests on), R16 (the refund, Hop's product), R5 (leaving a service), R13 (fees, which moved Ampersand's maintainers to partners), R6 (Ampersand will not found while it stands).
- **Plain Words with both DAOs** (all its revenue; Backlot's admissions are its clones): R2 (the absence clause, which it must disclose to every client), R10 (the closing), R35 (its own hold on the default, which it asks to lose).
- **Keep with the DAOs and Longhouse** (Keep's revenue; Longhouse's "setup every identity goes through"; Postmark's auditor): R3 and R4 (its two "answers from the author"), R28 (whether its audits are the core's).
- **Longhouse with Postmark** (each the other's second keeper; the DAOs' two-keeper clause): R29 (a successor keeper), R28, R32; R27 as the cost both state.
- **Pointer with the DAOs and The Back Row** (the screen every promise reaches members through): R34 (the claim sentence, its first promise), the vectors.
- **Counterparty with The Back Row** (each the other's credibility): no case of the core; the relationship rests on findings being read against the texts, which this is.

Under one deal: R23 (Longhouse's role share, replaced by a partner share), R24 (no push rail exists), R7 (Keep's family-collective successor), R36 (Keep's Module), R30 (Backlot's live-event template).

## 8. Where the players are wrong

- **The refund's grammar is missing** (Hop, Plain Words, The Back Row, Backlot, Ampersand): it is not; a role share filled by the payer on a keeper's record of its contest, under a split signed at the vow's point, does it, with one timing clause (R16). Rule 34 is the sentence that misled them.
- **Field 10 binds nothing** (Counterparty): the sentence that binds it is rule 60's; the defect is the reference binding's.
- **Anyone can make a vow's sales unknown** (Counterparty): Money rule 4 counts such claims for nothing before any proof is read; the code is wrong, not the rule.
- **A pending conditional debt may let a collective close** (Plain Words, The Back Row, Backlot, Ampersand): unknown is the answer the texts give, and unknown is never complete.
- **A holders' rule can bind a member to release its stake on leaving** (Ampersand's hope): no, by rule 94 and rule 98.2; the structure is a vehicle.
- **A metric cannot reach a holding collective's members** (Ampersand, Plain Words): rule 15's second layer of splitting does, with a split agreement at that layer.
- **A keeper's testimony is unprotected by rule 42 at all** (Postmark's worst reading): it is protected against a later rotation; the gap is the escape only (R1).
- **The same verdict should mean the same evidence** (the players' first expectation, each then corrected itself): the core is right, and should say so (R27).
- **A buyer-measured metric needs the core** (both DAOs): a Module does it (R22).
- **The default control cMIP should be pinned by hash** (Plain Words, Pointer): it cannot be, since the hash covers a creator who uploads after the freeze; the right fix drops the default from the conformance sentence (R35).
- Longhouse is wrong that H7 is a deal's rule to keep: a publication's owners not being able to stop selling their own work fails the right of exit (R5).

## 9. The shortest list, and the freeze

In order of weight, each a sentence or two, no code:

1. **R1**, Identity rule 29 and everyday check 2; Agreements rules 10, 42 and 91: an abandoned rotation's acts disputed, not invalid; a chain signature's placing stands once the act is complete. A new 3.9 step.
2. **R2**, Agreements rule 85 and the declaration's checks: a holder who is no party judged under the clause it last signed or bought under; a plan naming itself names none.
3. **R3**, Identity receipt check 5: a receipt that counted keeps counting, shown disputed.
4. **R4**, Identity receipt check 4: a contested position judged under the requirement before it.
5. **R5**, Agreements rules 11, 31 and 47: the owners' side alone ends a publication or replaces its service.
6. **R13**, the split's checklist: a fee's receiver is the Module's declared payee.
7. **R6**, Agreements rule 57: a deal holder reached through the version the placing transfer names.
8. **R34**, the claim sentence after the contest format: the payee, never public by a client's choice.
9. **R16**, Agreements rule 22's timing clause and rule 34 scoped; the refund example.
10. **R10**, the closing's conditions: unknown leaves the closing unknown.
11. **R35**, rule 98's conformance: the model the terms name.
12. **R27**, Identity section 4: the same evidence not promised; rules 19 and 20 marked.
13. **R28**, auditor: any declared identity.
14. **R29**, rule 33: a keeper shows missed only from its first anchor.
15. **R17, R18, R19, R21**, the split's wording: the metric share's destination; "already pays"; "every split that divides the stake"; the payer's standing.
16. **R7, R8, R9**, Identity section 8: a collective confirms by chain signature (or never does); an operator passes by rotation; confirmation obliges no client.
17. **R14, R15**, Money: the amount stated by the rail's answer; the refund rail's limit as a total.
18. **R26, R30, R31, R36, R40, R41**, one line each.
19. **Code and vectors, outside the texts:** Money rule 4's early refusal (R39); rule 12's batch total (R25); field 10 read from the specification (R38); the five vectors for role shares, records and metrics; the reference verifier's handling of R1 to R4 once the texts move.

**Cost of the whole list:** about twenty-five sentences, in Identity (draft 16), Agreements (draft 24), Money (draft 14), Envelopes (one phrase, draft 12) and the suite (v37), with the MICS following; no mechanism added, no act type, no field; the MICS's four design rules unchanged. The two decisions that are Nobody, allegedly's and nobody else's: R1 (the robbed owner against the good-faith buyer: I recommend the buyer, as Identity already does for a stolen chain key) and R5 (one named exception to "every party" in a deal, for the owners' side of a publication).

**My view on the freeze:** not ready at `af2ed6f8`. R1, R2 and R3 are way-out guarantees the texts claim and break; R4, R5, R13 and R6 are guarantees claimed and not kept, or a way out the players walked into a wall. Ready with the list above, written in one pass and rehearsed once more by the same ten players on the new drafts, with the four scenarios that go with it (an escape after a sale; an outside holder declared absent under the clause it accepted; an operator's rotation that keeps nothing; a contested position with the audit dropped) run, not reasoned. The rehearsal did what it was for: every case here is one a client would have met on real money in its first year.

## What I read and what I reason

Read: the twenty files of the ten players, whole; their earlier findings and position papers where a case points to them; S7q's report; F432 and F433; the texts at `af2ed6f8` at every sentence a case quotes, and around it: Identity rules 29, 34, 56, sections 7, 8, 11, 13 and the receipt checks; Agreements rules 9 to 12, 15, 20 to 22, 26 to 31, 33 to 35, 37, 42, 47, 48, 54, 57, 60, 67, 74, 85 to 89, 91, 94, 98, the split, publication, contest, declaration and closing formats; Money rules 3, 4, 8, 11, 12, 17, 18, 24, 29; Development rule 20, fields 7, 10 and 13; suite steps 5.2, 5.7c, 5.7d, 7.4, scenario 7 and the Agreements checklist. Reasoned: each case against those sentences; the way out walked again through R1, R2, R3 and R5. Not run: Counterparty's probes, which I take as reported; nothing in Rust; the sentences I propose are judged mechanical by hand, not by a builder.
