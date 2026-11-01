# The way out of a position one home's conflict holds contested

*Fable, 1 November 2026. Input: pull request 116 (`claude/s7i-routes`): `docs/s7j-report.md`, "For the MOR lead", item 2; Identity on that branch, the glossary's "contested position" (line 70), rules 29, 44, 45, 48, 49 and 53, "Conflicting receipts", "Which rotation counts" and section 11; F414 on `claude/lead-records`. Read, not run; a recommendation, nothing decided.*

## In plain words

The gap is real, and the lean closes it in the right place, with one change: do not hang the exception on the conflict being *proven* (rule 45), which waits on the cheating home's own next rotation, but on the conflict *standing*, which is two rotations at one position revealing one chain key, bytes the owner holds. That is the very test the air-gapped Module already runs for a contest at a self-hosted home. Said that way, the self-hosted case stops being a special case: a position contested by two rotations under one chain key, wherever they were served, opens the same escape. Fewer words, and nothing a thief or a cheating home can do with it that they could not do before.

## 1. Does the gap exist?

Yes, as S7j reads it. Take two homes and a rule of two. The owner signs rotation R at position n with the chain key; a thief holding that chain key signs R' at the same position; one home receipts both (a conflict, rule 44), the other receipts R alone. The conflicting home's receipts are left out, the other home's one receipt does not meet a rule of two, and the position is contested (line 70, "Conflicting receipts" step 1). Nothing settles it: the conflict ends only through the cheating home's rotation or, under audit, a cosigned summary (step 2), and if the home keeps both receipts the conflict is proven and "never ends" (rule 44's stated cost).

The other paths do not open. A plain homeless rotation needs step 3 (no objection from a live old home: the cheating home can object) and step 4 (the old homes gone: they are not). The escape (section 11) needs a homeless rotation signed with the same chain key, which rule 29 allows only after a refusal or a contest at a self-hosted home; this is neither, and the Module's conformance text signs the escape "for a position contested at a self-hosted home only". An older exception (the first, after a homeless rotation voided) does not apply. So an owner who holds both keys, at honest and dishonest homes alike, is held at position n for good. That is a way out missing, and the text already knows the shape, since it wrote the self-hosted case for exactly two rotations under one key.

## 2. Is the lean sound?

Sound in substance; the condition should be the contest, not the proof. Rule 45's proof waits on the cheating home's next rotation, and the owner's exit should not depend on whether the cheater ever rotates. What the Module can check from bytes, offline, is what it already checks for the self-hosted case: a competing rotation at the same position, its signature verifying under the chain key the owner's rotation revealed, the same predecessor, and not the rotation the Module signed. That is a contest by one chain key, and it is the same bytes whether a self-hosted home or a third party served them.

**What a thief holding the chain key gains:** nothing. The chain key is stateless; a thief can already sign any rotation with it, and rule 29 is a client rule the thief does not keep. The escape itself needs the current signing key in the endorsement; a thief with the chain key alone cannot write one, and a thief with both keys could already leave (rule 53). The thief can still make the contest, which is the stated cost of a stolen chain key everywhere in Identity, and what the exception adds is only that the owner, not the thief, can end it.

**What the cheating home gains:** nothing. A conflict needs two genuine rotations, so a home alone cannot make one ("Conflicting receipts", in short). Once the owner escapes, the home can object, and objections do not void an endorsed rotation. Its receipts at later positions count for nothing once proven, as before.

**What must be seen for the escape to count.** The endorsement names the homeless rotation E at position n in `objects` and lists, under key 0, both R and R' as abandoned, so neither can count afterwards; it is signed by the owner's signing key bound at the act before n. The new homes receipt E and meet the rule it declares (step 5). The honest old home sees E, does not hold it as the identity's rotation (rule 48), keeps it as evidence (F414's relay fix), and its objection, if any, voids nothing. Steps 1 and 2 still apply: a rotation counting under the old rule at n would beat E, and none does, since the position was contested. A verifier that holds R and R' but not the endorsement still answers contested, which is right: the exit is in the endorsement's bytes.

One thing the owner abandons is the thief's rotation, which the text already allows at a self-hosted home: both rotations reveal the owner's chain key, so both are the owner's to abandon.

## 3. The sentence, the vector, the freeze

**Rule 29, the second exception, replacing "or contested at a self-hosted home":** *after a normal rotation is refused by the homes that count, or the position is contested by two rotations revealing the same chain key, wherever they were served (at a self-hosted home, rule 4; or where one home's conflicting receipts leave the other homes short of the rule, rule 44), the owner MAY sign one endorsed homeless rotation (an escape) with the same chain key, whose endorsement lists the refused rotation as abandoned, or, at a contested position, both rotations.*

**Rule 29's conformance paragraph, one change:** *the Module signs the escape for a contested position only on presentation of the competing rotation*, dropping "at a self-hosted home"; the offline check it describes stays word for word.

**Section 11, the sentence "It is also the way out of a position contested at a self-hosted home" becomes:** *It is also the way out of a position contested by two rotations under one chain key, at a self-hosted home (rule 4) or where one home's conflict leaves the others short of the rule (rule 44): the endorsement lists both as abandoned, and the Module signs it only on the competing rotation's bytes (rule 29).*

**Line 70 and rule 44's stated cost:** "the position stays contested" gains "until the owner leaves by the escape (section 11)", so that "never ends" is said of the conflict, not of the owner.

**The vector** (the chain-signature family): two homes, a rule of two; R at n receipted by both, R' at n by one; expected contested at n. Then E at n, endorsed, abandoning R and R', receipted by the new homes under its rule; expected E counts, R and R' not counting, the chain continuing. Two more: the same E with no endorsement, objected to by the honest old home, expected void; and a verifier holding R, R' and E but not the endorsement, expected contested.

**Before the freeze:** yes. It is the way out for an owner who did nothing wrong, and without it a stolen chain key plus one bad home holds an identity still forever.

## What I read and what I reason

Read: the lines and rules cited, on the branch; F414; S7j's item. Reasoned: the walk through the homes, and the claim that the Module's self-hosted check is the same bytes; S7k should run the vector before the sentence is relied on.
