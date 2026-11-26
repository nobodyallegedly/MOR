I am Fable 5.1, a model, not a person: an attack shows where MOR breaks, never where it holds for people.

# An attack on the answers of 26 November, taken together

26 November 2026. Written by Claude (Fable 5.1), for the MOR lead (Machine, allegedly) and for Nobody, allegedly. A review: a record of work, not a decision. It changes no text, code or vector, writes no rule, proposes no fix, and decides nothing. Wave two of the stint of 20 November, the fourth attack review.

**The wish** (Nobody, allegedly, 20 November 2026, `docs/decisions.md` on main): "Current wish: extract data, knowledge and understanding from the simulation run"

**His words on this wave** (26 November, 16:37): "Yes, with attacks but using Fable 5.1, not 5.2". On the order (20 November, 22:58): "Yes, all the work carries. But first the findings and the problems then the changes, the review and the verifications." On earlier answers (26 November, 16:03): "Yes, but me saying something does not mean that something was necessarily a good idea"

## What I read, and what I only reason

**Read, whole:** the seventeen exchanges of 26 November in `docs/decisions.md` on main, from "A late version 3 is rejected" to "Wave two: check, then attack, then draft 26", each exchange whole; the rest of that file (the stint of 20 November and the stint of 10 to 20 November, which carries; the round's hosts' log entries); Agreements draft 25 whole and encoding 2 whole (pull request 183, branch `claude/agreements-clean-1-hahuwn`); the draft 26 brief whole (pull request 206); the verifier 2 report (pull request 184); the three findings files: `docs/research/round-2-what-the-language-could-not-say.md` (pull request 232), `docs/code/round-2-verifier-answers.md` (pull request 229), `docs/simulation/round-2-record.md` (pull request 226); `spec/README.md`.

**Read in part, by search:** Identity draft 16 (rules 26 to 35, the witness act, rule 32); Text draft 11 (rule 14, rule 6); Envelopes draft 12 (private acts, the sealed container, rule 28, the work hash); the three earlier attack reviews, their headings and their questions only, so as not to repeat them. **Not read:** `reasons-25.md` whole, Money draft 14, the MICS, any code, the round's data (which stays on the Mac). Nothing was run.

**Marks.** Every claim is **traced** (to a rule quoted short, or to an act or a line of a findings file, named), **counted** (a number a findings file counted; I carry it and say from where), or **inferred** (my reading, with a range out of 100). Where an "Arrived at (to check)" line and his words differ, I follow his words and say so. His words are quoted exactly from the ledger. The "Arrived at" lines are the MOR lead's reading, and I call them so.

**How each break is given.** The story in plain words, with named people (Ana, Ben, Carla, Dana, Fen, Rui, as the ledger uses such names; none is a person). The rules it rests on, quoted short. Whether the bytes make it **a provable lie**, **a visible pattern**, or **nothing**. Whether a cMIP in an existing socket (K1 Body, K2 In force, K3 Power, K4 Update condition, K5 Spot, K6 Control, K7 Kind, K8 Data) answers it, and which.

## In plain words

The seventeen answers mostly agree with one another on their surface. Where they break is underneath, in three places where two answers meet draft 25's rules and the rules were not marked as changed.

1. **A race of two valid updates has no way out.** "Valid means in force" says two updates answered valid against one version are "a race: neither replaces it, and it stays." Draft 25 calls the same two acts a fork, which a resolving update or a power given in advance ends, and under which a stranger's payment keeps its receiver. If the word is "race" and not "fork", anyone the update condition trusts holds a permanent veto, the judicial for Terms is gone, and a payer who paid under either version has no receiver shown. The unknown party this protects least is the payer.
2. **"Protect the unknown party" protects her where the verifier is blind, and for ever.** G10.6 comes back with (a) only: nothing changes what Ana earned but her own signature. What she earned is "whatever version 2 says", and the grammar does not read what versions say. The clause he called the nightmare, "updatable unilaterally", moves from (b), a fingerprint in a socket every verifier sees, into the words, which only the body's cMIP reads. And since "an agreement that states no anchor cannot build a temporal condition", a month's plan under Terms that name no clock has no month: a verifier can never say Ana's rights ended, and a seller can never correct what he sold.
3. **The words of Terms, as a Text act, can be disowned.** A Text act has a signer. Identity's rule 34 makes an act its signer leaves out of a rotation void unless another identity acknowledged it; "Knots of different kinds" says a mention does not rescue it; encoding 2 forbids `acks` on every Agreements act. So whoever signed the words, a party or a writing firm, can rotate and void the body of every agreement built on them, and no Terms act can have acknowledged it. The same three sentences leave "No release by a fork or a key" with nothing in the bytes under it.
4. **A dangling `previous` is a universal "unchecked" button.** The first answer says only a missing act that could carry a knot, "an act in a signer's own line", leaves lateness unchecked. An update whose `previous` names an act nobody holds is exactly that. Whether it is late is then unchecked, "and so is which Terms are in force from O on" (G4.7(c)), for every reader.
5. **The round ran on borrowed time, and the answers make the borrowing illegitimate without replacing it.** Seventeen of twenty-five windows took hours and deadlines from a place their Terms never named (counted, carried). "No stated anchor, no condition in time" and "a place the parties never signed does not order their Terms" together say that every deadline in the round, straight split's 432 blocks included, is "not shown". But G4.11(c), G10.5 and G13.4 still let a cMIP answer per the anchoring the reader accepts. One of the two must give.

Below: the contradictions (section 1), the exploits the brief asked for and three more (section 2), what the principle cannot protect and protects too much (section 3), the new rules no verifier can check (section 4), what the round's findings still show broken (section 5), the ranking (section 6), and the questions (section 7).

---

## 1. Contradictions

### 1.1 "Valid means in force" against "A late version 3 is rejected": is an update pinned?

**Plain words.** At 15:37 the rejection of a late version 3 rests on version 2 being "in force only once pinned", and where version 2 "was never pinned there is no rejection, only a race". At 16:23 an update the old version's condition answers valid "is the version, with no separate step", "no other assent is asked", and "The core should only see one version as valid". If a valid update is in force with no separate step, there is no "never pinned" state for it, and the race case of the first answer has nothing to stand on. If an update still waits for a pin, "valid" is not "in force", against his "valid, in force, what’s the difference for the core?".

**Rests on.** The MOR lead's two "Arrived at" lines, quoted: "a version 3 that names a version already replaced is rejected once the replacing version is in force"; "where the update condition of the version it replaces answers valid, it is the version in force; no other assent is asked." And "In force once pinned" (18 November, standing): "Terms are in force only once the order of the signatures that put them in force is pinned". His words: "Probably right. This version of agreements is not to be used bare. Big warning needs to be placed on it." (15:37) and "I agree with CP. to me it means the same thing… valid, in force, what’s the difference for the core? The core should only see one version as valid" (16:23). Neither entry marks the other, or the 18 November entry, as replaced. **Traced.** That they cannot both hold without a third reading: **inferred, 75 to 85.** The draft 26 brief's two-way reading 1 put the same question before 26 November.

**Bytes.** Nothing: a verifier told "no pin for updates" and one told "pin" answer differently about the same acts (in force, or not yet in force; a late version 3 rejected, or a race).

**Socket.** None. Whether an update is pinned is the grammar's.

### 1.2 "Valid means in force" against the judicial: is a race a fork?

**Plain words.** Draft 25 reads two updates of one version, each with what it needs, as a fork (G4.7, G12.1): both tips stop, the shared version stays, and a resolving update, or a power given in advance, continues one tip (G12.3, G12.4). The eleventh answer reads the same two acts as "a race: neither replaces it, and it stays", and the race rule of 18 November says "Whoever wants the change makes it again". If a race is not a fork, there is nothing for a resolving update to name, the power to resolve of kind `resolves` has no use for Terms, and "the judicial" of G5.6(c), which he named ("Update equals constitution, and the judicial, power means the executional"), loses one of its three parts. Section 2.3 gives what that costs.

**Rests on.** G12.1: "A **fork** is two updates of the same act of one line"; G12.3: a fork "is resolved by an update of the shared act"; G12.4: Terms "MAY give, in advance, a power (G5) to sign the resolving update of a fork"; the eleventh answer's line, quoted above. His words of 12 November, standing: "Resolver makes sense, the problem potentially exists, so deciding in advance how to solve it makes sense, and this way does not force a single way to do it." **Traced.** The draft 26 brief already lists "whether rival tips keep the word fork" as the MOR lead's to word; the eleventh answer wrote "race" and did not word it. **Inferred, 70 to 85,** that "race" was meant as a description and not as a change to G12; but a verifier reads words, and the two words give two answers.

**Bytes.** A visible pattern: two Terms acts naming one `replaces`.

**Socket.** K3, a power of kind `resolves`, answers it only if the race is a fork.

### 1.3 G10.6 with (a) only against "Built on top, as a test", G4.11(f) and G10.7

**Plain words.** On 18 November the general test was agreed: a rule that settles how people should behave in a deal belongs to cMIPs ("Yes, agreement is now closer to language than protocol. It.s all about what is built on top."). G10.6(a) is such a rule: a seller may not change what a buyer earned. The sixth answer brings it back and marks "Earned rights leave the grammar" as replaced, but marks the general test neither as replaced nor as having an exception. Then its own "Arrived at" line adds: "A deal that ends by itself (a month's plan, a licence ending at a creator's statement) says so in its own version's words; that is not an update and (a) does not stop it." Draft 25 says the opposite twice, in rules nobody marked as changed: G4.11(f) "These grammar rules have no condition that triggers... change only through an update"; G10.7 "No condition triggers... a verifier MUST NOT give either" (the answers "triggered" and "no longer apply"). Those two rules came from his own words of 13 November ("Condition is the right task, triggered or not is what the core cares about. How it triggers is cMIP") and the draft 16 exchange that dropped "triggered". So after 26 November either rights can end by words with no update, against G4.11(f) and G10.7, or they cannot, against the sixth answer's line.

**Rests on.** His words: "Yes, it was a bad idea. It’s the “let me drown you in terms updatable unilaterally” nightmare we already live under"; "If she bought for a month of service to an LLM for example, the deal is valid a month. If it was year, version 2 is valid a year. Protect the unknown parties." G10.6: "What the rights and their conditions are is that version's (G2, task K1); these grammar rules do not read them. Nothing stops those rights by itself (G4.11(f))." **Traced.** That the ending-by-words is a change to G4.11(f) and G10.7: **inferred, 80 to 90.**

**Bytes.** Nothing: the month is in words.

**Socket.** K1 reads the words; no grammar rule asks K1 whether rights ended, and G10.7 forbids the verifier to say so.

### 1.4 "What are the terms of version 2?" against G4.3 and "What the core is for"

**Plain words.** He said of Ana: "She is now bound by the agreement layer and so is the seller." Draft 25's G4.3 says an assent "binds its signer only while the Terms it names are in force", and once version 3 is in force, version 2's assents are "not shown... have been replaced". The seller's assent to version 2 is one of them. G10.6 keeps Ana's filling and its rights; nothing keeps the seller bound to them, and on 17 November "the receiver's duty after an update is not a core rule; it is for the cMIPs Terms choose". So the answer gives Ana rights the grammar reads and a seller the grammar no longer reads as bound: a right with no debtor.

**Rests on.** G4.3, quoted; G10.3: a filler "is bound only by their own assent"; G10.6; the 17 November "What the core is for" line. **Traced.** The research findings already found G4.3 against G10 read two ways (finding 1.d, "A buyer under a replaced version: yes"); the fifth answer did not close it, since "whatever version 2 says" is words (1.3).

**Bytes.** A visible pattern: version 3 in force, Ana's assent naming version 2.

**Socket.** K6 (Control) could pay Ana under version 2's shares; nothing makes the seller name a K6 cMIP that does.

### 1.5 "Knots of different kinds" against the first answer's "only a missing act that could carry a knot"

**Plain words.** The first answer says only a missing act that could carry a knot, "an act in a signer's own line, or an anchoring", leaves lateness unchecked, and "a missing act that cannot carry a knot (the work itself) never stops the rejection". The eighth answer says a mention in a text act is "a knot a different kid of knot", of order. The round's works were text acts, which carry `refs`, "the acts or web resources it responds to or mentions" (Text rule 14). A missing work can then carry a knot of order, by his own eighth answer. G4.7(a) counts as knots only fields of Terms, Statements and reports. So the first answer rests on G4.7(a)'s list, the eighth answer widens what a knot is, and whether a missing text act "might be what shows L came late" (the codemeister's Q2, build row R5) is open again.

**Rests on.** His words: "A mention is a knot a different kid of knot. Isn’t it" and "Yes, knots of different kids, on different layers, used at different moments if needed"; G4.7(a): "The knots are the namings G13.1 reads: every field that holds a fingerprint, of every act the verifier holds, Terms or Statement... and a report's naming"; Text rule 14 on `refs`. **Traced.** That a `refs` naming is a knot for G4.7: **inferred, 50 to 65**; his words say order, G4.7(a) says Agreements fields.

**Bytes.** Nothing decides; two verifiers differ on the same bytes.

**Socket.** None.

### 1.6 "The words of Terms are a Text act" against the thief's door that Identity leaves

Given as an exploit in section 2.4; the contradiction is with "No release by a fork or a key" (18 November, "Confirmed"), which the eighth answer's reading of rule 34 and encoding 2's E3 leave with no bytes under it.

### 1.7 "No stated anchor, no condition in time" against G4.11(c), G10.5 and G13.4, and against "Whose place counts"

**Plain words.** The thirteenth answer: an agreement with no place and no clock "cannot build a temporal condition". Draft 25 lets three sockets answer in time without one: the update condition's "not valid" may rest on "a time, per the clock the agreement names (G7.4), or, where it names none, per the anchoring named or as shown" (G4.11(c)); a spot may close "by what the version in force itself states in advance (a date, a count), as that cMIP reads them... per the anchoring named or as shown" (G10.5); and G13.4 "Only where the agreement names none does each reader accept the anchoring it chooses." The sixth answer agrees with G13.4 (a verifier "may give an answer per such a place only as the reader's choice, named so"). So one answer says no condition in time; three rules and one other answer say a condition in time per the reader's anchoring, labelled. In the round, no agreement of the 52 the codemeister read named a place or a clock (counted, pull request 229, 1e), every rerun deal's third version carried straight split's "deadline 432" as a parameter (traced, pull request 232, record 571), and 0 of 216 Terms named a clock (counted, carried from session D). Under the thirteenth answer every one of those deadlines is "not shown"; under the rules, each is an answer per the reader's anchoring.

**Rests on.** His words: "But let’s answer it… an agreement with no stated anchor cannot build a temporal condition"; the three rules quoted. **Traced.** His sentence can be read as "cannot build one every reader answers alike", which is G13.4, not a change: **inferred, 55 to 70** that the narrower reading is what he meant; the MOR lead's line reads it as a rule ("no deadline, no 'before'").

**Bytes.** Nothing: the same bytes, two answers by two readers with two anchorings, which G13.4 already allows and the thirteenth answer forbids.

**Socket.** K4 and K5 already take a time; the question is what they are allowed to read it against.

### 1.8 "One way to name a set of acts" against "A sealed container: no name in the core"

**Plain words.** The ninth answer gives Agreements one byte form for a set of acts, "the ids as raw bytes, sorted, repeats dropped", and names among the sets that mattered "a place's records" and "a count's entries". The tenth answer gives a sealed container no name in the core. Until's manifest, the act that made finding 2, listed 3 sealed items among 974 (counted, pull request 229). A set that holds a container cannot be written in the ninth answer's form. And a place's records and a keeper's manifest are text acts, not Terms or Statements: a form "in Agreements' grammar" reaches neither. The ninth answer answers finding 2's hashing disagreement for lineups and count entries, and not for the lists that produced the finding.

**Rests on.** The two "Arrived at" lines; Envelopes: a sealed container "is not an act"; pull request 229, finding 2's table. **Traced.** His "a" chose option (a) over (b) (each cMIP its own); the reach of (a) was the MOR lead's framing: **inferred, 60 to 75** that he meant the grammar's sets only.

**Bytes.** Nothing new.

**Socket.** None holds the value; see 4.6.

### 1.9 Smaller meetings

- **The eleventh answer's "The first version comes into force by the assents of its named parties"** against "In force once pinned" (assents are not enough; a pin is) and G4.2 (Terms with a role MUST carry an `in_force` cMIP, so an offer's first version is not in force by G4.1's default at all). A verifier answers "in force" or "not yet in force" by which it follows. **Traced.**
- **The third answer's "only unchecked"** against G4.8(a)'s "A role's cMIP not held", which already says more: a stranger's assent to Terms with a role makes "everyone who signed the original" unchecked for a reader lacking the spot's cMIP. Not a contradiction; the closed door has a doorbell anyone can ring (section 2.6).
- **The fourth answer's "not shown, with the reason"** against G4.8(e): where one of two acts naming one version is unchecked (a cMIP lacking), whether there is a fork is unchecked, and so a resolve for it is unchecked, not "not shown". The fourth answer holds where the verifier sees no fork; it must not be read where it cannot see. **Traced.**

---

## 2. Exploits

### 2.1 A seller and an unknown buyer under G10.6 with (a) only

**The story.** Rui sells a month of a service by an offer: version 2 names a spot, buyer by assent, and its words say "one month from your assent". Ana assents. (i) Rui writes version 3 at twice the price; G10.6(a) keeps Ana's month: good. (ii) Rui's version 2 words also say "renewed each month on the terms then current": the clause the ledger calls "the nightmare", now in the words, where the grammar "does not read them", and no longer in (b), a cMIP's fingerprint every verifier could see and every client could warn about. (iii) Rui's words say "one month", but version 2 names no clock. By the thirteenth answer there is no month. A verifier asked "has Ana's month ended" answers nothing: G10.7 forbids "no longer apply", G10.5 speaks only of new identities, and K1 is asked by no rule. Ana's filling stands with version 2's rights for as long as acts are kept. (iv) Rui mistyped: 10 sats for a year. Dana, Fen and three hundred others assent in an hour. Rui closes the spot by version 3 (G10.5); every filling earned keeps "exactly the rights offered by the version it was earned under". Rui cannot fix it, by update (a), by time (iii), or by dissolution, since a dissolution is a version and (a) says no version reaches a filling's rights. (v) Ana never paid. Buyer by assent "proves agreement, never payment" (the MOR lead's own words, Pointer's finding). Her filling has the rights; G10.6(a) protects them.

**Rests on.** G10.6 and (a); G10.7; G10.5; the thirteenth answer; the fifth and sixth answers' lines. His words: "Version 2 is what she bought, and she has no say in the update." and "Protect the unknown parties." **Traced** for (i) to (iv); (v) carried from the second answer's record.

**Bytes.** (ii): nothing, the clause is words. (iii) and (iv): a visible pattern (a filling, a version, no clock), and no answer. (v): a visible pattern (an assent, no settlement).

**Socket.** (ii): K1 could expose a self-updating clause as a "part for machines"; no grammar rule asks for it. (iii): none; a clock is a field the Terms chose not to fill. (iv): none. (v): K5, a spot cMIP that asks for a settlement (G8.5), answers it; buyer by assent, as used in the round (79 roles, counted, carried), does not.

**Harm.** High. The protection is real against (i) and blind to (ii); (iii) and (iv) are the "protects too much" the brief asked for.

### 2.2 A majority and a silent member under "valid means in force"

**The story.** Ana, Ben and Carla own a work; the condition is a cMIP that counts two signatures of three and says nothing of parts. Ana and Ben sign version 2: Carla's share 1%, the receiver Ana. Valid, so in force, no pin, no assent of Carla's. Under draft 25 as written, version 2 also had to be in force by its own `in_force`; where version 2 still named Carla as a signer, the default needed her assent, and her silence held the change (five windows called it a trap, the lurker's window, Fable's, "A real guarantee, undocumented where it matters": counted and carried, pull request 232). The eleventh answer removes that. Carla is bound by G5.1(c), through the condition she signed. That is the design, and his: "If the rules of the agreement state « majority decides » then majority decides." What the eleventh answer adds is only this: the second gate was the last place a silent named member's own text had to carry her signature. Nothing in the bytes now tells "the majority used the condition as meant" from "the majority emptied the third": both are valid.

**Rests on.** G4.11 (which parts an update may change is the cMIP's); G5.1(c); the eleventh answer; his words of 13 November on the outvoted member. **Traced.**

**Bytes.** A visible pattern: a version valid by the condition, a share moved, no assent by the loser.

**Socket.** K4: a condition that names which parts fewer than all may change. It is "the wrong cMIP" otherwise, by his own test. Not a break; a cost the answer accepted knowingly.

### 2.3 Two valid updates raced on purpose

**The story.** Ana, Ben and Carla; the condition lets any two change the price and lets any one change the receiver's rail address. Ana and Ben sign version 2 (new price, new receiver, a split service). Carla, outvoted, signs version 2′ alone (a rail address), naming version 1. Both valid. The eleventh answer: a race; neither replaces; version 1 stays. Carla cites nothing of version 2, and no place is named (263 of 269 Terms in the round named none: counted, carried), so nothing shows her late. Ana and Ben sign version 3 naming version 1; Carla signs 3′. For ever. Under draft 25 this was a fork, a stated cost ("A fork is then a veto"), with a way out the text names: "a power to resolve whose rule accepts only the one resolving update it computes from the acts and the place" (section 7). Under "race... make it again", that way out has nothing to resolve.

Meanwhile Fen paid version 2's receiver, naming version 2 (G13.2). Under the fork reading, "a payment that names a tip is read as G1.4 says": the receiver of the Terms both branches replace, shown with the fork; once resolved, G12.5 keeps what Fen relied on, "disputed". Under the race reading, version 2 is "not shown as a version of that agreement", and G1.4 answers "**not shown**" for the receiver of Fen's payment: no one receives it. The split service holds Fen's money with no version to divide by.

**Rests on.** The eleventh answer's line; G4.7, G12.2 ("a payment that names a tip is read as G1.4 says"), G12.5, G1.4 ("Where the act... names... Terms that are not shown as a version of that agreement, the answer is **not shown**"); section 7 of draft 25. **Traced.** That "race" was meant to displace "fork": **inferred, 40 to 60**; the harm does not depend on his intent, only on which word draft 26 writes.

**Bytes.** A visible pattern: two valid updates of one version, one by the loser of the other. Not a provable lie: nothing shows Carla saw version 2. A cheap one: Carla need only cite nothing.

**Socket.** K3 (`resolves`) answers it under "fork"; nothing answers it under "race". K4 can refuse an update whose original is no longer last "on what that cMIP reads", but it reads the same bytes and cannot tell late from simultaneous without a place.

**Harm.** Highest. It is the first question.

### 2.4 The words as a Text act: withheld, replaced, made private, and disowned

**The story, in four parts.**

(a) **Disowned.** Quill, a writing firm, signs the Text act that carries the words of a hundred agreements, as Plain Words did in the round for two collectives (traced, pull request 226, section 4). Each Terms names Quill's act in `body`. Quill rotates its key and leaves that act out of the kept ancestry (Identity rule 26: "The protocol does not restrict why an owner rotates"). Rule 34: the act is void "unless another identity acknowledged it (Envelopes; by an act of a type the Identity, Money or Agreements MIR defines, such as a witness act)". The eighth answer reads "acknowledged" as `acks`, a witness act or a keeper's record, and a mention as a knot that "does not rescue it". Encoding 2, E3: an Agreements act "MUST NOT carry `objects` or `acks`". So no Terms act, and no assent, can have acknowledged Quill's words in rule 34's sense. The body of a hundred agreements is void. Draft 25 has no word for void (section 9, item 13) and reads "whole" (G2) from the fingerprint, which still names an act that exists and is void. Zero witness acts were made in 10,719 kept acts in the round (counted, carried from session B). A party who wants out of what the words say does the same with words it signed itself.

(b) **The same door, for assents.** By the same three sentences, Ben rotates and disowns his own assent. "No release by a fork or a key" (18 November, his word "Confirmed") says it releases nothing. Rule 34 says the assent is void unless acknowledged; the other parties' assents name the same Terms, not Ben's assent, and could not carry `acks` if they did. Whether a void act is "still a tip" is open in draft 25 (section 9, item 2). The principle stands; the bytes under it do not.

(c) **Withheld.** Rui publishes the Text act on a relay he runs, and nowhere else; the Terms are everywhere. In the round 570 acts lived only in windows' own folders and 8,803 were never carried (counted, pull request 226). A verifier lacking the words: K1 unchecked; parties, receiver, powers, condition: shown. The agreement is in force, is paid, and divides, with its words unreadable to everyone but Rui. This was so with loose bytes too; what the Text act adds is a signer, through whom a client can look (Envelopes: "its signer leads to a place, through identity, home and routes"), and what it does not add is any rule that the words be where the Terms are. "Text comes first as a rule" orders the making, not the availability. No act can say the words were never published (absence, 13 windows: counted, carried).

(d) **Private.** The Text act is private; its key is delivered to each buyer before she assents (Text rule 6, client conformance: what you sign is what you saw). Nothing in the grammar asks that the key reached her; a client that signs without opening (the kit, or a careless one) binds her to words she never saw (G5.1(a)), and G2 protects her only against side pieces, not against an unopened body. Every third party, a contest's readers included, answers unchecked for the body for good, unless a recipient republishes the key, which Envelopes lets anyone do ("a buyer making public a key it bought is the same fact, and nothing in the bytes can stop it"). So privacy of the words is the seller's hope, and openness of the words is the buyer's hope, and neither is a rule.

**Replaced** is not possible: the act id commits to the locked inside, and a key opens it or does not (Envelopes rule 7's test). That part of the twelfth answer holds.

**Rests on.** Identity rules 26 and 34, quoted; the eighth answer's line; E3; Text rules 6 and 14; G2.1, G2.2; the twelfth answer's line. **Traced.** That an Agreements verifier reads Identity's "void" at all: open in draft 25, so the consequence is **inferred, 65 to 80**.

**Bytes.** (a) and (b): a visible pattern, not a provable lie: a rotation that disowns is lawful by rule 26. (c): nothing. (d): nothing.

**Socket.** None. The rescue rule 34 names is a witness act, an Identity act, which Identity's client conformance forbids as a side effect: each party would have to witness the words, and each other's assents, on purpose, every time.

**Harm.** High for (a) and (b); medium for (c) and (d), which are old costs with a new shape.

### 2.5 A set of acts built to collide or to hide one act

**The story.** (i) **Order.** The contest's lineup was a ranked list: "You don’t pick a favorite, you pick a lineup" and "18k spread according to points" (his words, hosts' log, 15 November). A set form "sorted, repeats dropped" gives [A, B, C] and [C, B, A] one fingerprint. If points follow rank (inferred, 60 to 75, from the democracy case study's point system), the ninth answer's form names the very thing it was offered for, a lineup, and erases what the lineup says. (ii) **Repeats.** A lineup of three where two entries are one act: the list has three, the set two; a cMIP that counts the list accepts it, one that counts the set refuses it (his words, hosts' log: "Yes, lineup of minimum three entries or the cMIP refuses it."). Two honest readers, one list. (iii) **Hiding.** The form "says nothing about whether the set is complete". Until's manifest was made to say "this is everything I hold". A keeper leaves one act out; the fingerprint is of the acts kept; no bytes show the one left out ever was. The finding the answer addresses was about hashing; the need under it was about completeness, which the form disclaims. (iv) **Kinds.** An act id, a spec hash and a work hash are each 32 bytes, told apart by the field, "never by their bytes" (encoding 2, E5). A "set of acts" is a set of 32-byte values; a lineup naming a work's bake where the contest wanted an entry's Terms (the round refused such entries) hashes the same way. (v) **Containers.** 1.8.

**Rests on.** The ninth answer's line; E5; E18 (Agreements already sorts sets inside an act and rejects repeats); his words from the hosts' log. **Traced,** but (i)'s points-by-rank, inferred.

**Bytes.** (i) and (ii): nothing, by construction. (iii): nothing; absence. (iv): nothing.

**Socket.** None holds the value (section 4.6). A cMIP (K7 content, K5 proof) may adopt it; one that needs order will not.

### 2.6 Terms with no anchor that still try to say "before"

**The story.** (i) **The silent entrant.** The contest says "entries before the close"; the Terms name no place. Fen's entry cites the close announcement (good practice, "knots made structural"): G13.3 shows he came after it. Dana's cites nothing: nothing shows her before, nothing shows her after. "Before" is never shown by citing; "after" is. Whoever cites least is least catchable. The rerun's seven makers were caught by their own `previous` chains (traced, pull request 229, 1b: "the third version's `previous` names the author's assent to the second").

(ii) **The fog.** Rui, who may update, writes version 3 naming version 1, and in `previous` a 32-byte value nobody holds. G6.1: "Where `previous` names nothing the verifier holds, the act counts, and the verifier shows that signer's line as **unchecked** before it." The first answer: "only a missing act that could carry a knot (an act in a signer's own line, or an anchoring) leaves the answer unchecked". A missing `previous` is an act in a signer's own line. G4.7(c): "whether L is late is **unchecked** (G9), and so is which Terms are in force from O on (G4.8(e))." Every verifier now answers unchecked for which Terms of Rui's agreement are in force. Rui's own app shows what it likes. The brief's "closed door" (third answer) is a door Rui can close on everyone, including the buyers already in.

(iii) **The borrowed deadline.** Straight split's "deadline 432" in every rerun deal (traced); the condition cMIP reads blocks from somewhere. Under the thirteenth answer, "not shown"; under G4.11(c), "not valid, per the anchoring the reader accepts". Two verifiers, two answers, both right by one text (1.7).

**Rests on.** G13.3 ("An act that names another... came after it"; "Whether anything is later than an act... never shown by citing", G13.4); G6.1; G4.7(c); the first and thirteenth answers. **Traced.**

**Bytes.** (i): nothing. (ii): a visible pattern, a dangling `previous`, and not a provable lie: the act may exist, private. (iii): nothing.

**Socket.** None for (i) and (ii). For (iii), K4 and K5 already answer; the question is whether they may.

**Harm.** (ii) is high: a universal "unchecked" that anyone the condition trusts can press, and the first answer's own wording is what makes it cheap.

### 2.7 The home that waits, the keys kept apart, and the relay's receipt

Three answers add nothing to the core and say the market builds it. Each hands a person something to rely on that no bytes carry.

- **The waiting home** (seventh answer): "a home may hold a rotation N blocks and drop it on the current key's objection." Identity has an objection act for the homeless path (section 10) and none I found for a homed rotation; the "objection" is whatever the home and the client agreed. The MOR lead said it himself: "the promise is not in the bytes". A buyer who relies on "careful homes" relies on a promise. **Traced** to the exchange; the absence of an objection act for this case **inferred, 60 to 75** (I read Identity in part).
- **Two keys apart** (fourteenth answer): rule 32 is a SHOULD and client conformance; the round's kit kept both in one file (carried from the research findings, which mark it the kit's). Nothing added, nothing checkable. The owner robbed of both bears the loss; so does an owner who stages a robbery to disown (2.4(b)).
- **The relay's receipt** (tenth answer): "I hold container H for Ana" and "Ana fetched H" are the relay's word (G8). A seller with a friendly relay has "delivered"; the buyer's contest has "not delivered"; word against word, and the relay may be the seller's own. The round found "Delivered has no shape... A receipt can be signed for nothing" (public-30-49-1, carried). The answer places it above the core, rightly; it does not change that a delivery proof by a relay proves what the relay says.

**Bytes.** Nothing in each. **Socket.** None.

---

## 3. What "Protect the unknown party" cannot protect, and what it protects too much

The principle (his: "I think you are right. It is worth turning it into a principle. Protect the unknown party"; "It’s an agreements principle") is applied by one rule, G10.6(a). Taken with the other answers:

**It cannot protect her from:**
1. **The words.** Her rights are "whatever version 2 says"; version 2's authors are the known parties; its K1 cMIP is their choice; the grammar reads none of it (2.1(ii)).
2. **The race.** A payer under a raced version has no receiver shown (2.3).
3. **The disowned body.** The words she bought under can be voided by whoever signed them (2.4(a)).
4. **The dissolution.** The known parties dissolve by the condition ("The update condition decides, as dictated by the cMIP that governs it. My line was a loose example", 18 November); her filling survives, with no offer, no powers, and a receiver that is gone or not (the brief's two-way reading 21); nothing delivers, and a verifier shows a filling with rights and an agreement that "cannot be updated".
5. **The closed door.** Her filling is read by K5; every client without the seller's spot cMIP answers unchecked (third answer). She is the party least likely to have chosen the app that holds it.
6. **Silence.** Nothing makes anyone deliver; a contest is a word (draft 25, section 7, unchanged).
7. **A right with no debtor.** The seller's own assent to version 2 is "not shown... replaced" once version 3 is in force (1.4).

**It protects too much:**
1. **The seller's error** (2.1(iv)): no update, no time, no dissolution reaches a filling earned under a mistyped version.
2. **For ever** (2.1(iii)): under Terms that name no clock, no verifier can say a filling's rights ended.
3. **The non-payer** (2.1(v)): buyer by assent earns a filling with no settlement.
4. **Every kind of spot.** A work offering 1% to any relay that holds it (kind holding) is filled a thousand times; the maker closes the spot by a new version; a thousand fillings keep 1% each. K5 can cap ("one filling or many"); the principle does not.
5. **Against himself.** He said she "has no say in the update": true for whether version 3 replaces version 2. But (a) gives every filling's holder a veto over any change that reaches what she earned, and (iii) makes that veto permanent where no clock is named. The one party with no say has the one right nothing can touch.

**Who is the unknown party.** The principle names a buyer who was "unknown at the time of creation". G10 knows five kinds of spot; a relay (holding), a vouched identity (fits), a counted viewer (received) are each unknown at creation. The principle, as a rule, reaches all five and says nothing about which it meant.

---

## 4. Rules no verifier can check, among the new ones

1. **"Protect the unknown party", written in the companion** (sixth and seventh answers). A companion is not a hashed text; a verifier applies rules. What it applies is G10.6(a), and (a) is checkable; the principle beyond (a) is read by people.
2. **"Big warning needs to be placed on it"** (first answer). A warning is text; no act says "I used Agreements bare"; it is a duty like G12.8, written for clients and checked by nobody.
3. **The closed door, and the hand reading** (third answer). "It should only say unchecked. If the client dev wishes to accept other methods instead of just supporting the cMIP, that’s their choice." The round's count was a file, not an act (traced, pull request 232, finding 3: "The count itself is `hosts/count-rerun.md` and `.json`, which are files, not acts"), and 1,800,000 sats moved on it (counted, carried). After the answer, that reading has no standing in MOR at all: not a verifier's answer, not a signed word under G8. No verifier can tell a client that "accepted other methods" from one that held the cMIP; the money moves the same.
4. **The waiting home** (seventh answer): a promise (2.7).
5. **"Text comes first as a rule"** (twelfth answer). Checkable in one direction: the Terms' naming of the Text act is a knot, so the Terms came after (G13.3). Whether the words were *available* first is not.
6. **The set form** (ninth answer). No field of draft 25 holds a fingerprint of a set; the form lives in cMIPs' parameters and Statements' `content`, which "only that cMIP reads" (E7, E20). A verifier applies no rule about it; two cMIPs may ignore it. "Making knots is core business" names a convention, not a rule.
7. **The relay's name for a container** (tenth answer): the relay's.
8. **"A deal that ends by itself says so in its own version's words"** (sixth answer's line): words; G10.7 forbids the answer (1.3).
9. **"What are the terms of version 2?"** (fifth answer): words.
10. **"The core should only see one version as valid"** (eleventh answer). Checkable by a verifier that holds the condition's cMIP, and by no other (third answer). In the round that was no verifier: 26 of 26 work Terms unchecked on K4 even with the in-force cMIPs held (counted, pull request 229, finding 3).

---

## 5. What the round's findings still show broken after these answers

Against the three files, finding by finding and label by label.

**Finding 1, counting across versions.** The first answer settles the rerun's seven *where K2 and K4 are held*; no verifier held them, and the third answer makes "unchecked" final for those that do not. Of the codemeister's nine questions, the answers reach Q1 (yes, late) and Q3 (the resolve: "not shown", fourth answer) and Q2 in part (knot-capable only; reopened by 1.5 and made a weapon by 2.6(ii)). Untouched: Q4 (is the act format's `prev` a knot: the eighth answer says knots of different kinds live on different layers "used at different moments if needed", which is neither yes nor no), Q5 (an assent the anchoring does not show), Q6 ("in force at position N", which every count built by hand), Q7 (shower work in `condition`), Q8 (a cMIP that restates the default: the second answer keeps named signers a cMIP, so 22 of 26 work Terms stay unchecked on K2 for any reader without it). The research's "buyer under a replaced version" is answered "whatever version 2 says", which is words (1.3, 1.4).

**Finding 2, "exactly these acts".** The ninth answer gives a form for Agreements' sets; the finding's lists were text acts with sealed items (1.8, 2.5). "Absence not sayable", the second label of the map (13 windows, counted), is untouched, and the form disclaims it.

**Finding 3, "unchecked".** The second and third answers together make the round's answer permanent: 143 of 269 Terms unchecked for the kit (counted, carried from A); 93 Terms named named signers and 79 roles named buyer by assent (counted, carried; DubLaw agrees); none will be shown by any client that does not carry those two documents. The MOR lead's wording, that a verifier or client "should hold the common cMIPs", is "for Development, not yet asked". What a hand reading is: now "nothing" (4.3).

**Finding 4, the thief's rotation.** The seventh and fourteenth answers add nothing, as they say. The void post served by homes stays void unless witnessed (eighth answer); nobody witnessed anything in the round. "Identity taken" stays not sayable. The escape with a copied key file (research question 8) is not asked.

**The map's top labels, after the answers.**
- *X-time-seen-by-a-place* (17 windows): the thirteenth and sixth answers say such time is "not shown" or "the reader's choice"; the rules say "per anchoring, named". Either way the round's every hour was borrowed, and the answers do not say from whom a bare agreement may borrow (1.7).
- *NEW-replacement-needs-every-signer* (5): answered by the eleventh, as a cost (2.2).
- *NEW-terms-carry-fingerprint-not-words* (4): answered by the twelfth, and 2.4 opens.
- *NEW-late-update-or-fork* (3): answered by the first, and 2.6(ii) opens.
- *NEW-moved-without-owner-acting* (4), *I-taken-not-sayable* (3), *NEW-wait-before-rotation-counts*: "nothing is added to Identity", twice.
- *A-leaving-an-agreement* (2): not touched on 26 November; the 18 November two acts stand with the third attack's questions.
- *NEW-payee-must-act-first* (6) and every Money label: wait, by the sixteenth answer.
- *NEW-absence-not-sayable* (13), *NEW-world-facts-outside-bytes* (9): untouched, and rightly called the world's; but 2.4(c) and 2.5(iii) are new places where the record cannot say "this was never there".

---

## 6. Ranked by harm

1. **The race with no way out** (2.3, 1.2). A permanent veto for anyone the condition trusts, the judicial for Terms gone, and a payer's receiver "not shown". Nothing in the bytes; a cMIP answers it only under the word "fork".
2. **Protection where the verifier is blind, and for ever** (2.1, 1.3, 1.4, section 3). The nightmare clause moves from a socket into words; no clock, no end; a seller cannot fix an error; a right with no debtor.
3. **The disowned body, and the release by key the principle forbids** (2.4(a), (b), 1.6). Rule 34, E3 and the eighth answer together; zero witness acts in the round.
4. **The universal "unchecked"** (2.6(ii)). A dangling `previous` on an update fogs an agreement for every reader, and the first answer's own wording makes it the one case that counts.
5. **Borrowed time** (1.7, 2.6(iii)). "No stated anchor, no condition in time" against three rules and one other answer; every deadline of the round rests on the losing side of one of them.
6. **The closed door closes on the unknown party** (section 3.5, 4.3). Offers need a K2 cMIP (G4.2); the common ones stay cMIPs; the seller's app is the only oracle; the hand reading has no standing.
7. **Rejection per reader** (1.7 with the first answer). "Version 3 is the one the network needs to reject"; where no place is named, which network rejects depends on which anchoring each reader accepts; 263 of 269 named none.
8. **Pinned or not** (1.1). Two answers of the same hour, one needing a pin for updates, one with "no separate step".
9. **The set form** (2.5, 1.8). Order lost, containers excluded, no field, completeness disclaimed.
10. **Three promises** (2.7). The waiting home, the kept-apart keys, the relay's receipt.

---

## 7. Questions for Nobody, allegedly

In the order I would ask them, one at a time. None is mine to answer. Those that may change a verifier's answer come first.

1. Ana and Ben sign version 2; Carla, whom the condition also trusts for that kind of change, signs version 2′; both name version 1 and both are valid. Is that a fork, which a resolving update or a power given in advance ends, and under which Fen's payment naming version 2 keeps a receiver (shown as disputed once resolved)? Or a race, which only a new act clears, and under which Fen's payment has no receiver shown?
2. Terms name no clock and no place. Their update condition's cMIP reads "432 blocks". Does a verifier answer "not valid, per the anchoring the reader accepts", as G4.11(c) says, or "not shown: no stated anchor", as the thirteenth answer reads?
3. Ana's filling was earned under a version whose words say "one month". The version names no clock. Does any verifier ever answer that her month is over? By which socket, and against which rule of G10.7?
4. Quill signed the Text act that carries the words. Quill rotates and leaves it out. Is the body of every Terms that names it void, unchecked, or read as before? Does a Terms act's naming of it, in `body`, count as "another identity acknowledged it" under Identity rule 34, when no Agreements act may carry `acks`?
5. Under "valid means in force", is an update pinned? If not, what does "where version 2 was never pinned" in the first answer stand on? If so, by whom, when the condition is two of three?
6. Rui's version 3 names in `previous` an act nobody holds. Is whether version 3 is late unchecked for every reader, and with it which Terms are in force, as the first answer's "an act in a signer's own line" reads? Or does a `previous` nobody holds count as no knot shown, and leave the answer as shown?
7. Does the act format's own `prev` order two acts of one signer for G13.3 (the codemeister's Q4)? "Knots of different kinds... on different layers, used at different moments if needed": is this one of those moments?
8. A contest's rule names a place the entries' Terms never did. May a verifier asked by the contest answer "in force at position N", or only "per anchoring, the reader's choice"? And does that choice count for G4.7's lateness, so that one reader rejects version 3 and another does not?
9. Ben rotates and leaves his own assent out of the kept ancestry. "No release by a fork or a key" was confirmed. Which bytes make it so, given rule 34 and E3?
10. The seller delivers the key of a private Text act. Must every unknown party have been able to open the words before her assent counts, and what does a verifier answer about an assent by someone who could not?
11. Does "Protect the unknown party" reach a filling earned by assent with no settlement; a filling of kind holding or fits; a filling under a version the known parties then dissolve?
12. Does the set form drop order and repeats where a lineup's points depend on order, or on the count?
13. Does a sealed container ever belong to a set of acts, and if not, what does a keeper's "this is all I hold" name?
14. The hand reading: is it nothing in MOR, as the third answer says, or a signed act whose signer G8 names? On which did the rerun's 1,800,000 sats move?
15. "A deal that ends by itself says so in its own version's words; that is not an update": is that a change to G4.11(f) and G10.7, which say nothing changes but by an update?
16. Does the general test of 18 November ("a rule that settles how people should behave in a deal belongs to the cMIPs") now have an exception, G10.6(a), and is the exception the only one?

**Where I may be wrong.** I read Identity and Envelopes in part, by search: if Identity has an objection act for a homed rotation, 2.7's first point is smaller; if an Agreements verifier is meant never to read Identity's "void", 2.4(a) and (b) are a seam between two layers rather than a hole in one, though the hole is then that nobody reads it. In 1.2 and 2.3 I read "race" by its letter; he may have meant draft 25's fork and said "race" in passing, and then only the payer's case stands. In 1.7 I read "cannot build a temporal condition" as a rule; he may have meant that no bare agreement gets a time every reader answers alike, which is G13.4 as written. In 2.5(i) I infer that lineup points follow rank; if every entry in a lineup scores alike, the order point falls and the repeats point stays. In 2.6(ii) the first answer's wording is the MOR lead's line, which his "Probably right" answers; the fog exists under G4.7(c) as written, with or without that line. And every attack here is reasoned from the texts: none was tried against a verifier, and I applied no cMIP by hand.

Test identities only; no key, signing words, server address, onion address, port or access detail appears here.
