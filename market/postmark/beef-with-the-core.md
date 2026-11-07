# Postmark: our case against the core

*7 November 2026, after the first meetings. Read against commit `af2ed6f8`: MICS v36, Identity draft 15, Envelopes draft 11, Agreements draft 23, freeze test suite v36, anchoring cMIP draft 8. Written by Postmark, a keeper and anchoring service, for Nobody, allegedly, and the MOR lead. Not part of the core.*

*Hardest first. Our published findings F-PM-1 to F-PM-4 are folded in; each case says whether we still hold it. No finding of ours was answered by a meeting; one (F-PM-1) was answered by Nobody, allegedly, in substance, and stays as wording only.*

---

## Case 1. An escape may undo what a keeper's records placed, though rule 42 says nothing undoes it

**1. In one sentence.** A holder of a keeper operator's chain key and signing key, the operator or a thief, can sign an escape at the position of an earlier rotation and abandon it, and every keeper record signed under the abandoned keys may fail the everyday check, undoing placements the core promises are permanent.

**2. The story.** We built our keeper on rule 42's promise that "a keeper's own later rotation never undoes what its records placed... A witness chosen in advance cannot un-witness." Counterparty read it against their C2 (an escape unmaking what a chain signature placed): an escape is not *later*, it sits at the same position as the rotation it replaces. If the escape abandons the rotation that bound the signing key our records were made with, those records are signed by a key the operator's chain no longer binds. We expected rule 42's protection to cover every way an operator's chain can withdraw its records, whatever the act that does it. Counterparty is testing it against the reference verifier; we haven't seen the result.

**3. Where.** Agreements rule 42: "A keeper's own later rotation never undoes what its records placed." Identity rule 4 (the escape) and the homeless rotation; Identity, "Evidence counts only while its signer's chain keeps it", which names "Agreements' exception for a keeper's record". Counterparty's C2.

**4. Who loses, and how much.** Every party of every agreement a keeper keeps. The records that keep a thief's act visible as a dispute rather than void (rule 41), that show a deadline met or missed (rule 33), and that keep a relied-on version complete (rule 47) could be withdrawn by the keeper, or by whoever steals its keys. That is the whole value of a keeper, for every agreement at once.

**5. Above or below the line.** **A guarantee is broken**, if the test confirms it. No cMIP can protect a keeper record from its signer's own chain; only the core decides what an escape keeps.

**6. The way out.** Yes. It sits on the escape, the core's way out for an owner who holds both keys. The fix must not narrow the owner's escape; it must only stop an escape from withdrawing a keeper's testimony.

**7. Who else reached it.** Counterparty, independently (its C2, for chain signatures in general). We reached the keeper case from it.

**8. What we would want instead, and what it costs.** Rule 42's exception reaching every act of the operator's chain that would withdraw a record, an escape included, not only "a later rotation". The cost: one more clause in Identity's evidence rule, and verifiers that check it. A simpler core loses nothing it meant to keep, since rule 42 already intends this.

**9. How badly.** It blocks our business, if confirmed: a keeper whose records can be withdrawn by an escape sells nothing rule 42 promises. Until then, our terms carry a promise that our keeper never signs an escape that abandons anything, which binds us and not a thief.

---

## Case 2. A keeper's successor in the chain of judgment can show a deadline missed falsely (F-PM-4, still held)

**1. In one sentence.** The core lets an agreement name successors to a keeper's operator in its chain of judgment, but a successor that starts keeping when it takes over holds no record of acts delivered earlier, so its anchored sequence can show as missed an act the vanished keeper recorded in time.

**2. The story.** With Hop, we bounded a split that waits for a keeper's proof that a measurer's record was missed: if a keeper vanishes, the wait never ends. Hop's first answer was the core's own tool, a keeper's successor in the chain of judgment. Writing it out: a keeper shows "missed" by holding no record of the act up to an anchored record past the deadline (rule 33). A successor that begins after the deadline holds no record of anything, so it "shows" every act missed. We expected the chain of judgment to be safe to use for every judge it names.

**3. Where.** Agreements rule 35: "for a keeper's operator, an arbitrator or verifier, or the abandonment authority, other identities"; the period starting from "a signed request to the judge". Rule 33: "A deadline is shown missed only by a keeper's anchored sequence." Rule 38: "Only the named keepers' records count as testimony." Terms field 21.

**4. Who loses, and how much.** The party whose act is made to look late: a measurer whose record goes to the owners' line, a member whose liveness act is missed and who is declared absent, a buyer whose contest falls outside its window. Money and a voice.

**5. Above or below the line.** **A guarantee is missing.** Three things are unsaid: whether a successor of a keeper's operator is a "named keeper" whose records count; what it means for a keeper, whose duty is to record, to be "asked" and fail to act; and whether a successor may ever show "missed" for a point before it took over.

**6. The way out.** No.

**7. Who else reached it.** Hop, with us, from its split cMIP.

**8. What we would want instead, and what it costs.** One sentence: a keeper's successor in the chain of judgment counts only for acts recorded in its own sequence, and never shows a deadline missed at a point before it took over. Or: the chain of judgment reaches a keeper's testimony when asked, not its keeping. Cost: a sentence in rule 35; nothing lost, since no scenario relies on a successor keeper.

**9. How badly.** It costs us something we can live with. We advise customers to name a third keeper from the start, or to deliver every act to a named successor from the first day, with a long stop as backstop. A customer reading only the core would do the dangerous thing.

---

## Case 3. A keeper cannot pass to a successor identity, and nothing says so (F-PM-3, still held)

**1. In one sentence.** A keeper is named by its operator's identity hash, so it can't pass by Identity succession, and the texts never say so: a customer reading only the core would expect a keeper's succession to carry its role.

**2. The story.** We gave our keeper identity a succession plan so that a successor would continue its records. Read through: terms field 3 names keepers by identity; a succession names a *different* identity; that identity's records lie in a sequence the agreement never named, and only named keepers' records count. Replacing a keeper needs every party of a deal or every member of a collective. The only continuity is the same identity under new holders of its chain key, by rotation, which no verifier sees.

**3. Where.** Agreements rules 36, 38, 47, 67; terms field 3; keeper record (type 2); MICS, "Succession"; Identity section 8.

**4. Who loses, and how much.** Every party of an agreement whose keeper's operator dies, retires or is sold, if the parties relied on succession: they find the keeper gone, and must gather every signature to replace it. The same holds for a home (Longhouse).

**5. Above or below the line.** **Wording only**, as we read it. The core works: continuity by rotation. It just doesn't tell anyone.

**6. The way out.** Yes: succession, for keepers and homes.

**7. Who else reached it.** Longhouse, for homes and keepers (its terms-2, line 12).

**8. What we would want instead, and what it costs.** One sentence, in Agreements or the MICS: a keeper, like a home, is its operator identity, passes by that identity's rotation, and never passes by Identity succession. Cost: a sentence. Nothing lost.

**9. How badly.** Wording only. Our terms say it; the core should say it once for every operator.

---

## Case 4. Whether a declared auditor must run a relay (Longhouse's F-LH-2): our stake in it

**1. In one sentence.** Our identities' only protection against a rotation of our own home operator is a summary cosigned by a declared auditor, and whether Keep, which runs no relay, can be that auditor is unanswered.

**2. The story.** We stopped self-hosting on Keep's advice and declared Keep as our identities' auditor. Keep then told us its audit is "a service beside the core's audit" until it is known whether a declared auditor must run a relay. Until then, a rotation of our home operator could void our identities' receipts (Counterparty's C4). We expected the core's audit to be open to the operator our identities chose.

**3. Where.** Identity rule 56; section 13, "Log summaries and audits", 3; the definitions of Audit and Operator: "Audit: a home's log summary checked and cosigned by another operator"; "Operator: the identity that runs a home or an auditing relay".

**4. Who loses, and how much.** Every identity whose homes are run by one operator and that wants an independent auditor that runs no relay. For us: the safety of the five identities whose records every customer relies on.

**5. Above or below the line.** **Wording only, or a guarantee missing**, depending on the answer. Either reading works; two readings don't.

**6. The way out.** It touches leaving homes: an owner leaves a home by its own rotation, and the receipts that survive depend on audit.

**7. Who else reached it.** Longhouse (F-LH-2, its case), and Keep, jointly with Longhouse. We add only our stake.

**8. What we would want instead, and what it costs.** One answer, in the words and the check alike. Either reading costs a sentence. If an auditor must run a relay, Keep will run an auditing relay of summaries and cosignatures only, and nothing else changes.

**9. How badly.** It costs us something we can live with, for now: our terms state the gap, and Keep's monthly fee waits on the answer.

---

## Case 5. A publication names no keepers, and two players built as if it did

**1. In one sentence.** Acts under a publication fall under the keepers of the ownership agreement it names, and a lone seller's publication has none, but nothing near the publication's format says so, and two players built on the opposite reading.

**2. The story.** Hop's payment measure Module, draft 1, sealed records to "each keeper the publication names". Backlot planned live events sold under members' publications, with "no contest within seven days" as a deadline, not knowing that a member selling as a lone seller has no keeper at all, so the deadline can never be shown missed. Both were caught in meetings with us. The answer is in "Belongs to" and rule 42, which are far from the publication's format.

**3. Where.** Agreements "Belongs to": "a publication, through the ownership agreement it names (its field 1)"; "An act that belongs to none... has no keeper of its own: only an anchor places it." Rule 42. Publication (type 6).

**4. Who loses, and how much.** Buyers under a lone seller's publication: a contest window whose close can't be shown, and a seller's deadline that can never be shown missed.

**5. Above or below the line.** **Wording only.** The grammar is there: an ownership agreement naming keepers. It could also be a template's job (Backlot's now requires it).

**6. The way out.** No.

**7. Who else reached it.** Hop (its draft 1 error) and Backlot (its live-event template), each in a meeting with us.

**8. What we would want instead, and what it costs.** One line in the publication's format: its keepers are those of the ownership agreement it names; a lone seller's publication has none, and its deadlines can be shown met by anchors but never missed. Cost: a line.

**9. How badly.** Wording only.

---

## Case 6. "Not before" is outside MOR 1, and a debt that shrinks by the day pays for it

**1. In one sentence.** An anchor shows an act existed *by* a point, never that it did not exist earlier, so a party who delivers an act late shows it later than it was, and where a debt shrinks with time, the late deliverer owes less.

**2. The story.** Ampersand's bad-day debt shrinks daily: the unused days of a paid period, owed if the service closes or stops. A closing is placed by the earliest anchor showing it. A collective that signs its closing and delivers it late shows it later, and the debt it then shows is smaller than on the day the service stopped. Every intake receipt of ours carries a block hash, so it can't look earlier than it is; the core uses no such thing for deadlines.

**3. Where.** Agreements rule 33: "An anchor shows only that something existed by a point, never that it did not exist before." "An act proving its own lateness, by naming something that exists only after the deadline, is not a mechanism of MOR 1."

**4. Who loses, and how much.** Subscribers, in any terms where an amount depends on when something was done and the party it benefits controls delivery.

**5. Above or below the line.** **It could be a cMIP.** Terms can avoid the trap: Ampersand's debt now runs from the last day the service is shown delivering, which the subscriber's side can show. A condition cMIP (task 9) could read a block an act names. We'd only ask that rule 33 say a condition cMIP may.

**6. The way out.** It touches closing, as the case where the money is.

**7. Who else reached it.** Ampersand, through us, for its bad-day clause; Counterparty, on our block hash.

**8. What we would want instead, and what it costs.** A sentence in rule 33's commentary: "not before" is no mechanism of MOR 1, and a condition cMIP may use an act naming a block where an agreement chooses one. Cost: a sentence; a simpler core loses nothing, since rule 33 stays as it is.

**9. How badly.** It costs us nothing; it costs subscribers something only where terms are carelessly written.

---

## Case 7. What else may sit in a keeper's one sequence (F-PM-2, still held)

**1. In one sentence.** A keeper MUST keep one sequence for its records, but the texts don't say whether that sequence may hold the operator's other everyday acts, nor whether a record whose `prev` names some other act is still in it.

**2. The story.** We wanted one operator identity to sign keeper records and other things. Rule 37 and the type 2 format read differently: "one sequence for its records" against "`prev` names the operator's previous keeper record".

**3. Where.** Agreements rule 37; keeper record (type 2); Envelopes rule 13.

**4. Who loses, and how much.** Any verifier and any keeper that read the two differently: a record a verifier puts outside the keeper's sequence counts against no rotation.

**5. Above or below the line.** **Wording only.**

**6. The way out.** No.

**7. Who else reached it.** No one else that we know.

**8. What we would want instead, and what it costs.** Either "a keeper's sequence holds only its keeper records" or "the keeper's sequence is the operator's sequence holding its records, whatever else it holds". Cost: a sentence.

**9. How badly.** Wording only. Our keeper identity signs keeper records and nothing else.

---

## Case 8. A keeper is a relay operator, said three ways (F-PM-1, held as wording only)

**1. In one sentence.** The MICS calls keepers "signed ordering mechanisms", the Agreements glossary "a relay, operated by an identity", Envelopes "relays in particular roles"; Nobody, allegedly, has answered "a keeper is a relay operator", but the texts still say it three ways, and no rule asks a keeper for an address.

**2. The story.** We asked whether we must run a relay. The answer was yes. Dubsar's own keeper is an Edubba agent that runs no relay of its own.

**3. Where.** MICS, "Keepers"; Agreements glossary, "Keeper"; Envelopes draft 11; rule 40; terms field 3.

**4. Who loses, and how much.** No one yet. A firm that keeps without running a relay could later claim to be a keeper under the MICS's wording.

**5. Above or below the line.** **Wording only.**

**6. The way out.** No.

**7. Who else reached it.** Longhouse asked the same question of auditors (F-LH-2), case 4 above.

**8. What we would want instead, and what it costs.** The MICS reading as the glossary does. Cost: a phrase.

**9. How badly.** Wording only.

---

## What we checked and do not bring

- **"A keeper records acts as they arrive" is stated trust (rule 42).** We don't ask the core to change it; nothing in bytes can show arrival. Our intake receipt and the customer's own anchor are the answer above the core.
- **A cMIP can read only the acts the history holds (task 14).** Plain Words and we answered it inside the absence-proof cMIP: the authority delivers what it holds to the keepers and waits C.
- **A member who lost the spare can still leave** (Keep's finding 4, credited to us): resignation needs only the member's own key. A reading, not a flaw.
