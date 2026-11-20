# Verifier 2's thirteen readings, in plain words

17 November 2026. Written by Claude, a session under the codemeister of MOR, for Nobody, allegedly, and the MOR lead. A record of work: it sets out questions. It decides nothing, and changes no text, code or vector.

**The wish** (Nobody, allegedly, `docs/decisions.md`, branch `claude/lead-records-2`, 16 November): "Once that is over, we.ll focus the rest of the budget on reviewing, no redrafts, no recode." And: "Before redrafting any layer I want to really look at the findings in details, find the right questions and then find one last way for me to zoom out before deciding on the rewrite."

## What this sheet is

The second grammar verifier (pull request 184, `verifier-2-report.md`, section 3) lists thirteen places where draft 25 can be read in two or more ways, and where the verifier's answer changes with the reading. A verifier is the program that reads signed acts and says who is bound by what. For each of the thirteen, the verifier had to choose a reading to be built at all. This sheet tells each one as a story with named people, says which reading verifier 2 takes today, and gives this session's lean, labelled as such. Nothing here is decided. Each reading is a question for Nobody, allegedly, and the MOR lead.

**What "checked twice" means today.** Two checks have been run, and they are not the same kind of check:

- **On the new Agreements vectors** (`core/vectors/agreements-new/grammar.json`, 120 grammar cases), an independent Python check judges 115 of the 120 cases and agrees with verifier 2 on all 115. It cannot judge the other five (fillings, a filling's rights, the walk before paying, the delegation ended by its delegator, and the act made under it afterwards). The check was first written by an independent reader for verifier 1, without seeing the Rust code. Verifier 2's own session then edited it for draft 25's changes: the spec hashes, the receiver's two forms, the confirmation named by its settlement, a signer's fork resolved under a power, and the call left unread. Those edits are not independent of the verifier (`verifier-2-report.md`, section 1).
- **On the earlier vectors** (`core/vectors/verdicts.json`, the older layers and the old Agreements), the Python check covers 113 of the 559 verdict cases. The Rust library checks all 559 (`core/vectors/README.md`).

Both checks are made against the vectors. A vector holds the answer the verifier gives, so neither check can say whether the reading behind that answer is the one Nobody, allegedly, means. That is what this sheet is about.

**The thirteen, in the order of the verifier's report:**

| # | Short name | In one line | Way out | Area |
|---|---|---|---|---|
| A1 | A late update's answer word | Which word a verifier gives about an update that came too late | no | presentation |
| A2 | Late Terms' answer word | Which word a verifier gives about Terms for a baked work made after a later sale | no | presentation |
| A3 | A place orders every two updates | Under a named place, of two rival updates, the later is always late, so forks of Terms almost vanish | yes | core |
| A4 | Which knots show an update late | Whether one act alone needs to cite the rival, or several acts may do it together | yes | core |
| A5 | Which missing act makes lateness unknown | Which fingerprints the verifier does not hold make "is it late?" unchecked | yes | core |
| A6 | An assent whose cancellation is unclear | Whether that signer is asked to sign an update | yes | core |
| A8 | An agreement whose own power says no | Whether every member signing still makes the agreement sign | yes | core |
| A9 | An act held that cannot be read | Whether it counts for nothing, or makes the answer unchecked | yes | core |
| A10 | Two versions by one author | Whether one act resolves both the Terms fork and the author's own fork | yes | core |
| A11 | "Nothing they name is lacking" | Which missing pieces keep a thief's Terms from being shown invalid | yes | core |
| A12 | The first counter signature | Which withdrawal counts when two follow one assent and neither follows the other | yes | core |
| N1 | A report naming the payment itself | Whether a seller's confirmation that names the payment, not the settlement, counts | no | core |
| N2 | An agreement that is both party and receiver | Whether such Terms have a doer, and so hold the task of passing money on | no | core |

**The order of the sections below** is this session's proposal. The nine that touch the way out come first. "The way out" here means leaving an agreement, a party's exit, the baker's rights carried along an envelope's chain, or anything that can hold someone in. Among those nine, the ones that decide most directly whether someone can withdraw, or can be bound without signing, come first. The other four follow, ordered by how many people a wrong answer reaches.

A few words used throughout:
- **Terms** are the act stating what is agreed. A **version** is one Terms act. An **update** replaces a version, and the **original** is the version it replaces.
- An **assent** is a signature agreeing to Terms. A **counter signature** withdraws an assent before the Terms are in force.
- A **fork** is two rival updates of the same act. While a fork stands, both stop, and the version before them stays in force.
- A **knot** is one act citing another by its fingerprint (its unique hash). Citing gives an order: whoever cites came after.
- A **place** is an ordered public record that the Terms name; it gives each act a position.
- A **socket** is a field of Terms where people plug in a cMIP, a rule of their own choosing. K1 to K8 are draft 25's eight sockets.
- **Dana** is always a third person who holds the acts and asks a verifier.

---

## 1. A12. The first counter signature

**In plain words.** Before Terms are in force, a signer may withdraw an assent with a counter signature. Suppose two withdrawals of one assent exist and neither cites the other: one made before the Terms came into force, and one after. Then which one is read decides whether the assent was withdrawn.

1. **The sentence** (G4.10): "An assent is read against the first counter signature in the same name that follows it; a later counter signature is read only against the assents in that name made after the one before it."

2. **The readings.**
   - (a) "The first" is the one of them that follows no other; where two follow neither each other, it is the one whose id comes first in byte order (a tie broken by the hash).
   - (b) Both are read, and either one withdrawing is enough.
   - (c) Where the Terms name a place, its positions decide which is first; without a place, which one is first is not shown.
   - (d) The two lean on each other and the reading does not settle, so the answer is **unchecked** (G9.2).

3. **A story.**
   - Terms T name Ana and Ben as signers, and a place. By default both must assent.
   - Ana has given Carla, under a delegation, a power to make counter signatures for Ana.
   - Ana assents (a1). Ana then makes a counter signature in Ana's own name (c1), at position 8. Ben assents at position 10, which would put T in force if a1 still counts.
   - Carla, for Ana, makes a counter signature (c2) naming a1, at position 12. c1 and c2 do not cite each other.
   - Dana asks whether T is in force:
     - Under (a), the answer turns on which of c1 and c2 has the smaller hash. If c2 is read, it came after T was in force and changes nothing: T is in force and Ana is bound. If c1 is read, Ana withdrew in time and T is not in force.
     - Under (b) and (c), Ana's assent is withdrawn and T is not in force.
     - Under (d), it is unchecked.

4. **Verifier 2 today:** reading (a). It takes the one that follows no other, and breaks a tie by byte order of id.

5. **The session's lean:** reading (b). Who is bound should not turn on which hash is smaller.
   - Under (a), Ana may be held in Terms Ana withdrew from in time, by chance.
   - Under (b), Ana is protected. Ben is exposed only to learning that T never came into force, which a counter signature can always cause before T is in force.
   - Under (c), the result is the same as (b) where a place exists. Without one, it gives Dana nothing to act on.
   - Under (d), the answer is safe but empty.

6. **Area:** core. **A socket:** K2 (`in_force`) could carry it for Terms that name an `in_force` cMIP: such a cMIP may itself ask whether an assent counts. For Terms on the default, no socket carries it.

7. **The way out:** yes. A counter signature is the only way to withdraw before Terms are in force, and this decides whether the withdrawal holds.

**A reader with the text alone:**
- It added a point this sheet had left out: two counter signatures in Ana's own name that follow one assent and not each other already fork Ana's own line (G6.2), so both stop. The question arises only where at least one is made for Ana under a power, as in the story.
- It read the place's order (c) and unchecked (d) as the text's nearest answers, and said "follows" is never defined as by citing or by place.

---

## 2. A6. An assent whose cancellation is unclear

**In plain words.** By default, an update needs the signature of "everyone who signed the original". Suppose one signer's assent may or may not have been withdrawn, because the order of the withdrawal is not shown. Is that signer asked to sign the update?

1. **The sentence** (G4.8(a)): "**Everyone who signed the original** is: each party in whose name an assent to the original counts (a party named as a signer; a signer who fills a role; a party named as an agreement, where it signed, G1.2); and each party bound by the original with no assent of their own, because the update condition of the version before it answered valid for it (G5.1(c)), where the original itself still names them among its parties: a party that a version took out is not asked by a later update."

2. **The readings.**
   - (a) Only assents that surely count are counted. A signer whose withdrawal's order is not shown is not among those who signed the original, and is not asked.
   - (b) The assent is counted as not yet cancelled, as G4.10 does when it tests order, so the signer is asked.
   - (c) Whether the signer belongs is itself not shown, so whether the update is valid is **not shown**.
   - (d) Whether the original was ever in force is not shown (G4.10), so the update's question has no settled original, and every answer from there on is unsettled.

3. **A story.**
   - Terms O name Ana, Ben and Carla, with no place and no update condition.
   - All three assent. Carla then signs a counter signature naming only Carla's own assent. Nothing cites it, and it cites no one else's assent, so G4.10 cannot tell whether it came before or after O came into force.
   - Later Ana and Ben sign an update U of O. It moves Carla's share to them, and Carla does not sign it.
   - Dana asks whether U replaces O:
     - Under (a), U is valid by default with Ana and Ben alone. If Carla's assent did in fact count, Carla was bound by O, and is now bound by U, which Carla never signed (G5.1(c)).
     - Under (b), Carla is asked, and U is not shown as a replacement until Carla signs.
     - Under (c), U is not shown.
     - Under (d), neither O nor U is settled.

4. **Verifier 2 today:** reading (a). It counts only the assents that surely count; one whose withdrawal's order is not shown is set aside, and its signer is not asked.

5. **The session's lean:** reading (c), which is the verifier's own lean in its report.
   - Under (a), Carla is exposed: an update can bind Carla without Carla's signature, on a doubt about Carla's own withdrawal.
   - Under (b) and (c), Carla is protected. Ana and Ben are exposed only to having to get Carla's signature, or Carla's clear withdrawal.
   - (b) and (c) give Dana the same visible answer. (c) says more plainly why.

6. **Area:** core. **A socket:** K4 (`condition`). Terms that name an update condition say themselves who must sign, and the question arises only on the default.

7. **The way out:** yes. It decides whether someone can be bound by an update they did not sign.

**A reader with the text alone:** it found readings (b), (c) and (d), and could not tell which holds. It added (d), which this sheet now lists.

---

## 3. A9. An act held that cannot be read

**In plain words.** A verifier may hold an act it cannot open: a private act without its key, or one signed with a signature scheme the verifier does not implement. That act might be an assent. Does it count for nothing, or does it make the answer unknown?

1. **The sentences.**
   - G6.1: "So it is where `previous` names an act the verifier holds and cannot open (a private act, held without its key): what that act is cannot be read, so the act counts, the signer's line is **unchecked** before it (G9), and the act is not invalid."
   - G9.1: "Where a verifier cannot apply a rule it needs, because it lacks a cMIP named by fingerprint, lacks an act named by fingerprint, lacks the acts of an agreement named as a party, or cannot get an answer from a named place, it MUST answer **unchecked** for every answer that depends on it."

2. **The readings.**
   - (a) An unreadable act that nothing names counts for nothing. G9.1 speaks of acts lacking, not of acts held unread. Answers are given as if it were not there, often **not shown**.
   - (b) It is "a rule it cannot apply", so every answer that might rest on it is **unchecked**.
   - (c) Unchecked only where another act names it (as G6.1 does for `previous`), and nothing otherwise.

3. **A story.**
   - Terms T name Ana and Ben as signers. Their `in_force` rule says Ana's assent alone puts them in force.
   - Ana assents publicly. Ben also assents, by a private act sent to Ana. Dana holds Ben's act but not its key.
   - Later Ana alone signs an update U of T that takes Ben's share. There is no update condition, so by default everyone who signed T must sign U.
   - Dana asks whether U replaces T:
     - Under (a), Ben's assent counts for nothing, so "everyone who signed" is Ana alone, and U is valid by default. Ben, who did sign T, is bound by U without signing it.
     - Under (b), whether U replaces T is unchecked.
     - Under (c), the answer is as under (a), since nothing names Ben's private act.

4. **Verifier 2 today:** reading (a) for counting assents. An unreadable act is held and shown as unchecked when asked about directly. In counting who signed, it counts for nothing and does not make the answer unchecked. Draft 25 settled only the part where `previous` names such an act (G6.1).

5. **The session's lean:** reading (b), as the verifier's report also leans.
   - Under (a), Ben is exposed: a private signature Ben made can be passed over, and an update bind Ben without Ben's signature.
   - Under (b), Ben is protected. Ana is exposed only to an unchecked answer, until Dana holds the key or Ben's assent is shown another way.
   - (c) leaves Ben where (a) does whenever nothing names Ben's act.

6. **Area:** core, with a development part (what a verifier does with a scheme it lacks). **A socket:** none. Whether an act can be read comes before any socket.

7. **The way out:** yes. It decides whether a private signer can be left out of who must sign an update.

**A reader with the text alone:**
- It read (a) as the text's favoured reading, and (b) as possible.
- It found a further gap. Section 2 rejects "bytes that cannot be read as an act", while G6.1 treats a private act held without its key as not rejected. Which of the two an act under an unknown signature scheme is, is not said. That is a reading this sheet had not listed: (d) an act under an unknown scheme is rejected, and never reaches the grammar rules.

---

## 4. A10. Two versions by one author

**In plain words.** Suppose one author writes two rival versions of the same Terms, and both name that author's same previous act. That makes two forks at once: a fork of the Terms, and a fork in the author's own line of acts. While the author's line is forked, every later act of theirs in that agreement stops. Can one act resolve both forks?

1. **The sentences.**
   - G6.2: "Two acts by one signer within one agreement that name the same `previous` (or that both name none) are a fork."
   - Section 3.2: "A resolving update (G12.3) of a fork of Terms is a Terms act; one of a fork in one signer's line is an act of that signer: a Statement of kind `resolve`, or, where that signer's line forked in Terms acts, a Terms act written as a resolving update."

2. **The readings.**
   - (a) One act can do both. A Terms act written as a resolving update, signed by the author, naming the author's shared previous act and resolving the two versions, resolves the fork of Terms (with the assents the update condition asks) and the author's line.
   - (b) Two acts are needed: a resolving update of Terms, and a `resolve` Statement by the author. But each names the author's same previous act, so each risks being one more tip of the author's fork.
   - (c) Resolving the fork of Terms sets the other version aside. A version set aside "never counted", so the author's line fork falls with it.

3. **A story.**
   - Terms O name Ana, the author, and Ben. There is no update condition.
   - Ana writes V1 and V2, each replacing O, each naming Ana's assent to O as Ana's previous act. Ben assents to both, so V1 and V2 are a fork of Terms, and a fork in Ana's line.
   - Ana and Ben want V1. Ana writes R, a resolving update of O: it continues V1 and names Ana's assent to O as previous. Ben assents to R.
   - Dana asks whether V1 is in force, and whether Ana's next counter signature, on another matter in the agreement, counts:
     - Under (a) and (c), V1 is in force and Ana's acts count again.
     - Under (b), Ana's line is still forked, now with three acts naming one previous act. V1 is in force as Terms, but it is still a stopped tip in Ana's line, and nothing Ana makes in the agreement counts.

4. **Verifier 2 today:** reading (a), as read from its code (`line.rs`, `read_lines`). In a signer's line, any act by that signer that names the shared previous act and resolves every other tip resolves the line, a Terms act included. No vector tests one author's two versions; the cases write rival versions by different authors.

5. **The session's lean:** reading (a).
   - Under (b), one author's careless double draft can freeze all their own acts in the agreement, and a way to undo it is not clearly there.
   - Under (a), every party is protected by one act that everyone needed signs anyway.
   - Under (a), what is exposed: where someone other than Ana resolves the fork of Terms under a power to resolve, Ana's line is not resolved by it. A Terms act carries no `for` (`encoding-2-report.md`), so Ana must still sign.

6. **Area:** core. **A socket:** none carries the shape of the answer. K4 (`condition`) says who must sign the Terms resolve. K3, a power of kind `resolves`, lets another resolve a line, by a Statement only.

7. **The way out:** yes. Until both forks are resolved, nothing the author makes in that agreement counts, a withdrawal included.

**A reader with the text alone:**
- It read (a), and said who must sign: the author, as the act's signer, and whoever the update condition asks.
- It added two things the text does not say. Whether the author's Terms act counts as the author's assent to it is not said. And where someone other than the author signs the resolve, the author's line stays forked, and the version continued stays a stopped tip in it (G12.2).

---

## 5. A3. A place orders every two updates

**In plain words.** Where the Terms name a place, an update is late, and replaces nothing, if at the place it became complete after its rival. Read so, two rival updates are almost never a fork under a place: whichever is completed first wins.

1. **The sentence** (G4.7(b)): "L came after O was replaced, per that place, where the first position at which, counting only the acts the place shows at or before it, L is valid and in force comes after the first position at which, so counted, F is valid and in force (G5.4, G13.3); a verifier gives that **per place**."

2. **The readings.**
   - (a) As written: of two rival updates, the one completed later at the place is late. A fork of Terms stands under a place only where both are completed at one position, or the place does not show one of them.
   - (b) Lateness by place reaches only an update whose own Terms act appears at the place after its rival was complete. Two updates drafted before either was complete, and signed in parallel, are a fork.
   - (c) The place orders the two, but G4.7(e) says a verifier "MUST NOT choose between them, by position", so a fork always stays a fork, and (b) of G4.7 applies only where the rival was drafted after.

3. **A story.**
   - Terms O name Ana and Ben, and a place. There is no update condition, so both must sign any update.
   - Ana drafts V1, raising Ana's share, at position 3. Ben drafts V2, which takes Ben out, at position 5.
   - Both sign both: V1 is complete at position 10, V2 at position 12.
   - Dana asks which Terms are in force:
     - Under (a), V2 is late and V1 is in force, per place. Ben is still in, under V1.
     - Under (b) and (c), V1 and V2 are a fork, both stop, and O stays in force until Ana and Ben resolve it.

4. **Verifier 2 today:** reading (a), as written.

5. **The session's lean:** reading (a) is what the sentence says. This is for Nobody, allegedly, to look at: under a place, the race decides, and forks of Terms almost disappear.
   - Under (a), the parties are protected from a standing fork. They are exposed to an accidental race: whoever collects signatures first wins, though everyone signed both.
   - Under (b) and (c), everyone stays in O until they agree which version continues. That is slower, but no one loses by a few positions.

6. **Area:** core. **A socket:** K4 (`condition`), in part. G4.7(d) leaves to the update condition whether an update made after another may still be valid. So a cMIP can refuse a later rival, but it cannot turn the grammar's "late" back into a fork.

7. **The way out:** yes. It decides whether an update by which someone leaves stands, loses a race, or is frozen in a fork.

**A reader with the text alone:**
- It read (a). A fork arises under a place only at the same position, where the place does not show one of them, or where the place cannot order them.
- It pointed to the tension with G4.7(e) that reading (c) rests on, and to knots overriding the place (G4.7(c)).

---

## 6. A4. Which knots show an update late

**In plain words.** Without a place, an update is late "by knots" when it cites enough of its rival to show it was made knowing the rival was complete. Does one act have to do the citing alone, or may several acts of the late update together cite enough?

1. **The sentences** (G4.7(a)):
   - "L came after O was replaced, by knots, where, counting every act held but those that came after O was replaced, L is not an update of O: O's update condition does not answer valid for it, or it is not in force by its own `in_force`."
   - "So L is late by knots where L itself, or an assent without which L is not an update of O, names, directly or through the acts it names, enough acts for F to be valid and in force."

2. **The readings.**
   - (a) Each alone: L itself, or one of the assents it needs, cites on its own enough of F's acts. The citings of several acts are not added together.
   - (b) Together: if the acts L needs, taken together, cite enough of F's acts, L is late.

3. **A story.**
   - Terms O name Ana, Ben and Carla, with no place and no update condition.
   - V1 replaces O. Ana, Ben and Carla assent to it (a1, b1, c1), and it is in force.
   - Ben then drafts V2, also replacing O. Ana's assent to V2 cites a1, Ben's cites b1, and Carla's cites c1. No single one cites all three.
   - Dana asks which Terms are in force:
     - Under (a), V1 and V2 are a fork, both stop, and O is in force again in effect.
     - Under (b), V2 is late, and V1 stays in force, as shown.

4. **Verifier 2 today:** reading (a). Building the cases, two rival updates whose assents each named part of what made the other came out a fork.

5. **The session's lean:** reading (a) is what the two sentences say, each "itself, or an assent". Under (a), though, three people who each knowingly cited V1 can still fork it, and set back everyone in V1.
   - Under (a), everyone in V1 is exposed to a fork, and the version before it comes back in effect.
   - Under (b), everyone in V1 is protected. Signers of V2 are exposed to having their update count for nothing on the strength of citings each made separately.
   - The session leans to (a) as read, and names the exposure for Nobody, allegedly, to weigh.

6. **Area:** core. **A socket:** K4 (`condition`), in part, as for A3: a condition can refuse V2, but cannot make the grammar call it late.

7. **The way out:** yes. It decides whether a later update can fork, and so freeze, a version in which people already left or joined.

**A reader with the text alone:** it read (a), "the per-act reading", and found no text behind (b) unless one act cites the others.

---

## 7. A5. Which missing act makes lateness unknown

**In plain words.** If a rival update, or an assent it needs, cites something the verifier does not hold, and that thing "might be" what shows the update late, the answer is unchecked. That also makes "which Terms are in force" unchecked from then on. Which missing things count?

1. **The sentence** (G4.7(c)): "Where L, or an assent it needs, names an act the verifier does not hold, and that act might be what shows L came late, whether L is late is **unchecked** (G9), and so is which Terms are in force from O on (G4.8(e))."

2. **The readings.**
   - (a) Any fingerprint in a field that names acts, directly or through acts held, that is not an act held, not a piece the verifier holds, and not a payment, settlement or envelope act another layer gives.
   - (b) Every fingerprint not held, in any field: a verifier cannot tell an act from a piece before it holds it.
   - (c) Only fingerprints in fields that can name one of F's acts (`terms`, `previous`, `answers`, `relies_on` and the like), excluding the body's words and the envelope's fields.
   - (d) Payments and settlements count as knots or do not, a question of its own (see the reader's note below).

3. **A story.**
   - Terms O name Ana and Ben. V1 replaces O and is in force.
   - Ben drafts V2, replacing O. Ana and Ben assent to it, and Ben's assent cites in `relies_on` a photograph of their handshake: a piece, not an act. Dana does not hold the photograph.
   - Dana asks which Terms are in force:
     - Under (a), (b) and (c), Dana cannot tell whether the photograph is one of V1's assents, so whether V2 is late is unchecked, and so is which Terms are in force from O on.
     - Dana is shown nothing settled until Dana's client hands over the photograph.

4. **Verifier 2 today:** reading (a). Any act-naming fingerprint not held, and not a piece held, nor known to Money or the envelope's chain, makes it unchecked. Its report adds a lean: that clients hand the verifier the pieces they hold.

5. **The session's lean:** reading (a), with the duty on clients made plain.
   - Under (a) and (b), no one is wrongly told that V1 is in force or that V2 is a fork. Everyone is exposed to an agreement whose current version is unknown whenever one piece is missing.
   - Under (c), fewer agreements go unknown, but a missing act in a field left out might hide lateness.

6. **Area:** core, with a development part: what a client hands the verifier. **A socket:** none. What a verifier holds is not a socket's.

7. **The way out:** yes. While "which Terms are in force" is unchecked, no one can show that the version in which they left is the one in force.

**A reader with the text alone:**
- It favoured the broad reading (b): an unheld fingerprint cannot be told apart.
- It found a conflict this sheet had not listed. G4.7(a) counts "every field that holds a fingerprint", but G13.1's list leaves out `body`, `envelope` and `envelope_at`.
- It noted that G4.7(a) lists only Terms, Statements and reports as knots, so whether a payment's or settlement's citings count is not said: reading (d).

---

## 8. A8. An agreement whose own power says no

**In plain words.** An agreement (a band, a company) signs either under a power its own Terms give, or, where they give none, by every one of its members signing. Suppose its Terms do give a power, and that power's rule says no. If every member signs anyway, has the agreement signed?

1. **The sentence** (G1.2): "Where x's Terms give no such power, x signs by every one of its signers: one act by each of them, its `for` naming x and its `under` naming x's Terms in force."

2. **The readings.**
   - (a) No. The members' unanimous route opens only where the Terms give no such power; where they do, only the power's rule can make the agreement sign.
   - (b) Yes. "It signs as its own Terms require: every one of its signers, or what its own rule accepts" (also G1.2), and G4.10's "or by all its signers" make the two routes always open.

3. **A story.**
   - Kestrel is a band, an agreement whose signers are Ana and Ben. Its Terms give a power of kind `assent` whose rule says: Carla, the manager, signs for us.
   - A venue's deal D names Kestrel as a party and asks for Kestrel's signing.
   - Ana and Ben, every member, each sign an assent to D for Kestrel. Carla does not.
   - Dana asks whether Kestrel has signed D:
     - Under (a), no. D is not in force for Kestrel until Carla signs, or until Ana and Ben first update Kestrel's own Terms.
     - Under (b), yes.

4. **Verifier 2 today:** reading (a). Kestrel has not signed, even though every member signed.

5. **The session's lean:** reading (a).
   - The power is the members' own rule ("Building blocks over solutions"), and others may rely on it: the venue was told that Carla signs for Kestrel.
   - Under (a), those who rely on the stated rule are protected. The members are exposed: they cannot act all together, for instance to withdraw Kestrel from D before it is in force, except by first updating Kestrel's own Terms under their update condition. If that condition needs Carla too, they chose to be held so.
   - Under (b), the members can always act together, and a third party's reliance on the stated rule is weaker.

6. **Area:** core. **A socket:** K3 (the power's rule). The members can carry the question themselves by writing a rule that also accepts every member signing.

7. **The way out:** yes, at one remove. It decides whether every member together can sign an agreement into or out of something.

**A reader with the text alone:** it read the same two readings. It said (a) is what the text literally favours, and that (a) has "a striking consequence: unanimity cannot sign where a power exists".

---

## 9. A11. "Nothing they name is lacking"

**In plain words.** Terms that point to someone's baked work without the holder of the baker's rights as a party (a thief's Terms) are **invalid**: they never count, for anything, for good. But only "where nothing they name is lacking". Which missing things block that answer, and what does Dana see instead?

1. **The sentence** (G14.3(a)): "Where the verifier holds the envelope, the act the Terms cite and the acts of the chain between them, and the holder at that act is not among the Terms' parties, and they reach that holder through no role, and nothing they name is lacking, they are **invalid** (section 2); so are Terms whose `envelope_at` names an act, held, that is not an act of the chain of the envelope they name."

2. **The readings.**
   - (a) The acts the Terms name directly, other than `envelope`, `envelope_at` and `agreement`, are to be held, or be pieces the verifier holds; if one is lacking, the answer is **unchecked** rather than invalid.
   - (b) Every fingerprint in the Terms: the body's words, every cMIP, `relies_on`, `replaces`, each role's cMIP.
   - (c) Only what could change who held the rights at the act cited: beyond the envelope and its chain, already held, nothing, so a thief's Terms are invalid whenever the chain is held.
   - (d) Where something is lacking and the holder is still not a party, none of G14.3(a) to (d) fits, and the text gives no answer.

3. **A story.**
   - Ana bakes a song: an envelope E, its bake e0.
   - Tom, who copied the bytes, writes Terms T. They name envelope E, cite e0 in `envelope_at`, name Tom and a friend, Ben, as parties, and cite a cover image in `relies_on`.
   - Dana holds E, e0 and T, but not the cover image. Ana, the holder at e0, is not a party, and no role reaches Ana.
   - Dana, about to pay under T, asks whether T counts:
     - Under (a) and (b), the answer is unchecked.
     - Under (c), it is invalid, with G14.3 named.
     - Under (d), it is unsaid.

4. **Verifier 2 today:** reading (a).

5. **The session's lean:** reading (c).
   - Section 2 defines invalid as "no act the verifier does not hold could make it count". Here no act could: T's parties are fixed by its own bytes, and the chain up to e0 is held.
   - Under (a) and (b), Ana and every buyer are exposed. A thief can keep the thief's own Terms from being shown invalid by citing one piece no one holds, and Dana sees "unchecked" where (c) shows "invalid".
   - Under (c), no honest party is exposed that the session can see. The clause may guard a case the text does not name; the session could not tell which.

6. **Area:** core. **A socket:** none. G14 is the grammar's, and the envelope's chain is the layer below's.

7. **The way out:** yes. It touches the baker's rights as the envelope's chain carries them, which replaced the old succession, and whether a buyer can be drawn in by Terms that never count.

**A reader with the text alone:**
- It read (b) and a narrower form of (c), and could not tell which.
- It found (d): if something is lacking and the holder is still not a party, none of G14.3's four outcomes fits literally. G9.1 makes an answer unchecked only where it depends on what is lacking.

---

## 10. N1. A report that names the payment itself

**In plain words.** When Ben, a buyer, pays, the seller confirms receipt by a report. Draft 25 says the confirmation names the settlement (the record both sides can see), "and never the payment itself". Suppose the seller's report names the payment. The bytes cannot tell a payment's id from any other act's, so the report is not rejected. What is it?

1. **The sentences** (G11.7):
   - "A report names the call it answers by naming the act that holds it; for this call, made by default, it names the act that stands for it: the settlement the payment names, the act both sides can see, and never the payment itself."
   - "A report whose call names that settlement is the confirmation of that payment, tied to it as G11.4(b) says."

2. **The readings.**
   - (a) It is no confirmation of that payment, and ties nothing. The payment stays shown as "one side only".
   - (b) It is listed, as its signer's word, and ties nothing, as a report by someone who is not a side of the leg is listed.
   - (c) It is the confirmation all the same, since it names the act that holds the call ("the act that holds it"), as the first verifier read it.
   - (d) It is malformed, and it is for the report block of the shared language to reject it.

3. **A story.**
   - Ana's offer, Terms T, names Ana as receiver. Ben assents to T and pays: payment p, which names settlement s.
   - Ana's software sends a confirmation whose call names p instead of s.
   - Dana asks whether Ben's payment was received:
     - Under (a), the answer is "one side only", and Ana's report is not mentioned.
     - Under (b), it is "one side only", with Ana's report listed beside it as Ana's word.
     - Under (c), it is matched.
     - Under (d), the report is refused.

4. **Verifier 2 today:** reading (a). In the first edition the same report was matched, as under (c).

5. **The session's lean:** reading (b).
   - The text excludes (c) in so many words.
   - Under (a), Ben is exposed: Ben holds Ana's signed word of receipt, and Dana is not shown it.
   - Under (b), Ben is protected as far as the text allows: Dana sees that Ana said it was received, as Ana's word, without a tie.
   - Ana is exposed to nothing under (b) that Ana did not write.

6. **Area:** core, with the shared report block. **A socket:** none in draft 25. The report block (`report-block-4.md`, a proposal) could say how a report names a call made by default.

7. **The way out:** no.

**A reader with the text alone:** it found (b) and (d), and said the text says neither.

---

## 11. N2. An agreement that is both a party and the receiver

**In plain words.** Terms may name, as receiver of what they are paid, an agreement that is also one of their parties. Encoding 2 always names an agreement as receiver by its root, never by its place in the list of parties. G11.2 says that where the receiver "is not one of their own parties (another agreement, or none)", there is no doer under those Terms: no one there whose duty is to pass the money on. Is such a receiver "one of their own parties", or "another agreement"?

1. **The sentences.**
   - G11.2: "Where the receiver those Terms name is not one of their own parties (another agreement, or none), no doer is shown under those Terms: what reaches them is passed on under the Terms of the agreement it reaches (G1.4), and a report that states a doer's lines under these Terms is listed, as its signer's word (G8), and ties nothing."
   - G1.3: "Terms MAY name a `receiver`: one of their own parties named as a signer or as a role, by its position among the parties; or an agreement, by its root fingerprint, whether or not it is one of their parties."

2. **The readings.**
   - (a) "Another agreement": any agreement named as receiver, party or not. There is no doer under these Terms; with `control` empty they do not hold the task of passing on, and a call in them is left unread.
   - (b) "One of their own parties": an agreement that is a party is one. Its receiver for the act is the doer, and the Terms hold the task wherever they give a part to another party.

3. **A story.**
   - Deal D names Ana, a design service, and the band Kestrel, an agreement, as parties. D's receiver is Kestrel, named by its root. D's words give Ana 10 per cent. D names no `control` cMIP, and it carries a call for reports.
   - A payment to D reaches Kestrel, and Kestrel's receiver, Ben, is paid.
   - Dana asks whether Ana's 10 per cent was passed on under D:
     - Under (a), D does not hold the task, its call is left unread, and Ben's report under D is listed and ties nothing. What reaches Kestrel is passed on under Kestrel's own Terms.
     - Under (b), D holds the task, Ben is the doer under D, and Ben's report and Ana's confirmation tie.

4. **Verifier 2 today:** reading (a).

5. **The session's lean:** reading (a), as the text's other places read it: G1.4 follows any agreement receiver into that agreement's own Terms.
   - Under (a), Ana is exposed: Ana's part in D has no doer under D. Ana is protected only if Kestrel's own Terms pass it on, or if D names a `control` cMIP.
   - Under (b), Ana is protected, but Ben becomes a doer under D, which Kestrel's own Terms may not say.

6. **Area:** core. **A socket:** K6 (`control`). Naming a control cMIP makes D hold the task whatever its receiver is, so D's signers can carry the question themselves.

7. **The way out:** no.

**A reader with the text alone:** it read (a), "the text favours another agreement", citing G1.3, section 3.1, the definition of receiver in section 2, and G1.4.

---

## 12. A1. A late update's answer word

**In plain words.** A verifier answers in a few fixed words: shown, not shown, fork, valid, not valid, invalid, unchecked. Draft 25 says what a verifier says about a late update, but names no word.

1. **The sentence** (G4.7(c)): "About L, a verifier answers that it replaces nothing and is no tip, names G4.7 and what shows that L came late (the act of L, or the assent to it, whose namings reach F's acts; or the anchoring and the positions or times it gives), and qualifies the answer **as shown** where knots show it, or **per place**, **per clock** or **per anchoring** where only an anchoring does."

2. **The readings.**
   - (a) Asked "is L late?": **shown**, G4.7, with its qualifier. Asked "is L in force?" or "does L replace O?": **not shown**, G4.7, with "late" beside it.
   - (b) The same for "is L late?", but asked whether L replaces O: shown that it does not. "Not shown" says that an act not held might establish it, and G4.7(c) says nothing makes L an update again once late.
   - (c) **Invalid**: L counts for nothing, for good.
   - (d) Asked about L as a proposed update, **valid** still: its update condition answered valid (G4.11(a)).

3. **A story.**
   - Terms O name Ana and Ben. V1 replaces O, and both sign it.
   - Then Ben drafts L, replacing O, and Ben's assent to L cites both assents to V1.
   - Dana asks:
     - "Is L late?" Under (a) and (b), shown, as shown.
     - "Does L replace O?" Under (a), not shown. Under (b), shown that it does not. Under (c), invalid.
     - "Is L valid?" Under (d), valid by default.

4. **Verifier 2 today:** reading (a).

5. **The session's lean:** reading (a) for "is L late?". For "does L replace O?", reading (b) would tell Dana plainly that this is settled. Under (a), Dana might wait for an act that can never change the answer.
   - (c) is excluded by section 2's list of what is invalid.
   - No one is bound differently under any reading. Only what Dana is told changes.

6. **Area:** presentation. **A socket:** none.

7. **The way out:** no.

**A reader with the text alone:**
- It read "shown" for "is L late?", and "not shown" as plausible for "does L replace O?".
- It added (d), that the update condition still answers valid, and excluded invalid and fork.

---

## 13. A2. Late Terms' answer word

**In plain words.** Terms for a baked work that were made after the rights were sold on, while citing a point before the sale, are late, and count for nothing. Draft 25 says "no new answer word", without saying which existing word.

1. **The sentence** (G14.2(c)): "no new answer word. A verifier shows the Terms as late, names G14.2 and what shows them late (the act whose namings reach Y, or the anchoring and the positions or times it gives), with its qualifier, as G4.7(c) gives the answer about a late update."

2. **The readings.**
   - (a) G14.3's answer about late Terms is **not shown**, G14.2, with "late" (shown, qualified) beside it; they count for nothing.
   - (b) **Invalid**, as for a thief's Terms, since by knots nothing can undo it.
   - (c) No word is fixed: G14.3's four outcomes (invalid, not shown, unchecked, shown) do not cover late Terms whose holder is bound.

3. **A story.**
   - Ana bakes a song: envelope E, bake e0. Terms T1 with Ben cite e0.
   - Ana sells the baker's rights to Carla: transfer t1.
   - Ana then writes Terms T2 with Emil, citing e0, and Emil's assent cites t1.
   - Dana asks whether T2 counts:
     - Under (a), not shown, with "late" beside it.
     - Under (b), invalid.
     - Under (c), the word is unsaid.

4. **Verifier 2 today:** reading (a). Its first report notes that "not shown" here cannot be undone by an act not held, unlike section 2's meaning of the word.

5. **The session's lean:** reading (a), with the same note as A1. Emil is protected under every reading, because T2 counts for nothing. Under (a), what Emil is told is less plain than what is true.

6. **Area:** presentation. **A socket:** none.

7. **The way out:** no. The sale is the layer below's, and T2 counts for nothing under every reading.

**A reader with the text alone:**
- It read (c): the word is not fixed, and it is not invalid, since lateness is not among section 2's cases.
- It asked whether an act not held can change the answer, and found that it can. An assent not held could mean the assent citing Y is no longer one "without which" the Terms are in force. That sits in tension with G4.7(c)'s "nothing else ... makes L an update again". This sheet had not listed that tension.

---

## What this sheet does not settle

Nothing. Every reading above is a question, and every lean is this session's.

Where two are one, or one is two:
- **A1 and A2 are one question:** which word a verifier gives for "late". G14.2(c) points to G4.7(c), so one answer serves both.
- **A3, A4 and A5 are three parts of one:** how lateness is shown, by place, by knots, and when it is unknown.
- **A6 and A9 lead to the same exposure:** a signer left out of "everyone who signed the original" can be bound by an update they did not sign.
- **A9 is two questions:** what counting does with an act held but unread; and, from the second reader, whether an act under an unknown signature scheme reaches the grammar at all.
- **A5 holds a second question:** whether payments' and settlements' citings are knots. The second reader found the field lists of G4.7(a) and G13.1 do not agree.

Could not tell from the texts:
- what "nothing they name is lacking" guards in G14.3(a);
- whether a place can give two acts one position;
- how verifier 2 answers A10 beyond its code, since no vector tests one author's two versions.
