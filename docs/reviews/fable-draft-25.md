# A fresh-eyes judgment of the new Agreements: draft 25, encoding 2, the report block

17 November 2026. Written by Claude, for Nobody, allegedly, as one input to his zoom-out. A review: a record of work, not a decision. It changes no text, code or vector, and decides nothing.

**The wish** (Nobody, allegedly, `docs/decisions.md`, branch `claude/lead-records-2`): "I've decided for a total rewrite of agreements from scratch." "No translation, fresh from the research we had all agreed was excellent direction." "can I with a single click reward all the people that contributed to the service or good via MOR" "Building blocks over solutions."

**Why now, in his words:** "Before redrafting any layer I want to really look at the findings in details, find the right questions and then find one last way for me to zoom out before deciding on the rewrite."

## What I read, and what I only reason

**Read, whole, and nothing else:**

- `docs/agreements-from-scratch/draft-25.md` and `encoding-2.md`, and `docs/lead/proposals/report-block-4.md`, on branch `claude/agreements-clean-1-hahuwn` (pull request 183);
- `docs/agreements-from-scratch/verifier-2-report.md`, on branch `claude/agreements-verifier-2` (pull request 184).

**Not read**, before or after forming this view: `reasons-25.md`, `history.md`, `companion-3.md`, any earlier draft, the ledger, the verifier's code, the vectors, the lower MIRs. I did not look afterwards either. So where a rule has a reason I do not see, the reason may be in a file I did not open.

**Not run:** the checker, the verifier, any test. Everything about what the bytes do is taken from `encoding-2.md` as written.

Each judgment below is marked **read** (the sentence is quoted) or **reasoned** (it follows from what I read, and I may be wrong).

## In plain words

The heart of this grammar is small and it holds. Signed acts that never change; nobody bound but by their own signature, a power they signed for, or a way of updating they signed for; two rival acts stop each other until someone resolves them; an answer the software could not check is never passed off as checked. That part I would build on.

Three things sit less well.

1. **The text is much larger than its heart.** About 40% of the file is rules. Three of the fourteen rules (the place, the legs and reports, the baker) rest on layers that do not exist yet, and the text says so itself.
2. **There is no way out of Terms in force unless it was designed in before signing.** Draft 25 changes nothing there. The way the text offers (a cMIP in the update condition's socket) reaches less far than the text says, because an update has to pass two gates and the socket governs only one.
3. **The bytes already hold doors that close behind the first real act.** The widest: an agreement never ends, and an agreement cannot cross from one draft's bytes to the next.

My view, in one line: a sound base for the grammar's heart and a good list of what the lower layers must provide; not yet a base to freeze bytes on. Two things should move first, named in section 7.

---

## 1. The whole

### What an agreement on MOR is, from the text alone

Yes, it can be said. My own words, from sections 1 to 3:

> An agreement is a first signed act called Terms, plus every later Terms act that replaces it, plus everything people say inside it (Statements: I agree, I take that back, I contest, I resolve, or a kind someone defined). Terms point, by fingerprint, to their words and to the small rule-documents (cMIPs) that answer the questions the grammar will not answer itself. From copies of the acts alone, anyone can work out who is bound by which Terms, and for everything else whether it is shown, not shown, contradicted, or could not be checked. An agreement can be a party to, or the receiver of, another agreement. It never ends; it only gets a new version.

That the text lets a stranger say this is a real strength. Section 1 does it in one paragraph (**read**): "Agreements is a grammar: the acts in which agreeing is written (Terms and Statement); the grammar rules by which a verifier decides, from acts alone, **who is bound by which Terms, and what is shown, unknown or contradicted**; and the tasks that cMIPs fill".

### Does it hold together

The heart does: G2 (whole), G5.1 (own signature), G6 and G12 (lines and forks), G9 (unchecked is not passed), G13 (now is what an act cites). Each is short, each exposes one lie, and they lean on each other without circles.

Six places where it strains. The first is the one that matters most.

**(a) An update passes two gates, and the text speaks as if there were one.** **Read**, G4.8: "An update is governed by that one answer, and by nothing else." And in the same clause: "Whether the replacing Terms are themselves in force is G4.1's". G4.7 confirms that both are asked: a late update is one "which O's update condition answers valid and which has the assents its own `in_force` requires". Section 8.3, item 2, lists it as still open. **Reasoned:** under "any two owners of three", a new version that names all three as signers and carries no `in_force` rule is valid and still not in force until the third assents (G4.1's default). So fewer-than-all updates work only if the new version brings its own `in_force` rule, which the people making the update choose; and then the update condition must also police that rule, or it polices nothing. The text had to write an exception by hand for one case, the delegator (G5.5: "it replaces, and is in force, without the agent's assent, however it lists its parties and whatever its own `in_force` says"), which shows the gap is real. The way out (section 3) runs through this same gap.

**(b) The answer words lack one.** **Read**, section 2: "**not shown**: the acts held do not establish it; an act not held might". But the text uses "not shown" where nothing unheld can change the answer: Terms replaced (G4.9), a late update, late Terms. And "invalid" is kept for an act that "itself shows it". There is no word for "the acts held establish that this does not count". Verifier 2's first two open readings come from here.

**(c) "From acts alone", except where the grammar reads the words.** **Read**, G5.5: "No field says so: that Terms are a delegation, who the delegator and the agent are, and what conditions the Terms put on ending it, are read from their words, as the body's cMIP gives them". And G11.2: "Whether Terms give a part to a party is read from their words". Two grammar answers (who can replace Terms alone; who owes the passing on) turn on the output of a cMIP whose trust column says "none: format only".

**(d) A named place both must not choose and does choose.** **Read**, G4.7(e): "MUST NOT choose between them, by position or in any other way." And G4.7(b): L is late "per that place, where the first position at which ... L is valid and in force comes after the first position at which, so counted, F is valid and in force". **Reasoned:** the two are reconciled only because a late update "is no tip". The effect is that under a named place the earlier position wins, and a fork of Terms can hardly stand. That may be exactly what is wanted. The text should say it in one plain sentence, because it is the largest thing a place does.

**(e) A Terms act stands in two lines at once**: the agreement's chain (`replaces`) and its author's own line (`previous`). **Reasoned:** an author who redrafts honestly, without pointing the second draft at the first, forks their own line, and "both tips stop". This is verifier 2's A10.

**(f) Rules about things a verifier cannot see.** **Read**, G5.6(d): "A verifier MUST NOT read an act made under a power as naming or replacing a judge". But the judge is named "by the cMIP that socket names or by its parameters", and parameters are bytes "which only that cMIP reads" (section 3). **Reasoned:** the verifier cannot find the judge, so it cannot break this MUST NOT either. The clause is a promise to cMIP authors written as a duty of verifiers.

### What is under it

**Read**, section 8.1, of the place: "Until this exists, every 'per place' in this text has nothing under it that can be built." Of the envelope's chain: "Until this exists, G14 has nothing under it that can be built." The report block is "a proposal, not a decision, and not yet written into any spec". Money's payment and settlement have no fields. So G7, G11 and G14, about 39 of the rules' 106 kilobytes, describe readings of layers that are not there. That is honest and clearly marked. It also means those three rules cannot be frozen with the rest.

---

## 2. The sockets

**In plain words:** five of the eight are true sockets: a question, inputs, an output the grammar uses. Three are something else wearing the name. None is plainly missing, but two things that behave like sockets are not called one.

| | Needed? | Can a cMIP fill it as declared? |
|---|---|---|
| **K1 Body** | Yes | Not as "format only". The grammar reads its output (shares, delegation, ending conditions), so every body cMIP must give those parts in a shape no text fixes. Encoding 2, section 10, item 12: "not fixed here". |
| **K2 In force** | Yes | Yes. The cleanest of the eight. |
| **K3 Power** | Yes | Yes. |
| **K4 Update condition** | Yes | Mostly. It is asked two different questions (below), and it governs one gate of two (section 1(a)). |
| **K5 Spot** | Yes | Yes, though its row holds two questions. |
| **K6 Control** | A field is needed; the row is muddled | The row describes a service, not a document that answers. |
| **K7 Kind** | Yes | Yes. Its only use in the grammar is to match a power's kind. |
| **K8 Data** | The consent is needed | It can be filled, but the answer changes almost nothing a verifier does. |

**K4 is asked two questions in one field.** **Read**, section 2: "The same question asked in two fields is two tasks". K4's row accepts the original and a proposed update, "or, where a filling is asked about, the version it was earned under and the later version (G10.6)". **Reasoned:** the second is another question (may this later version reach what someone already earned?), and with several versions between, the "later version" is no update of the version the cMIP belongs to. A cMIP author writing "two of three" will not know they also answered for every filling. P21 notes it; I would count it as a ninth question hiding in the eighth socket's neighbour.

**K6's row is about the hand, not the cMIP.** **Read**: its question is "Has what these Terms receive been passed on as they say?"; it accepts "an instruction, with the acts and the rule result behind it"; it produces "the controller's signed evidence"; its trust is "hand (Control layer)". None of that is something a document named by fingerprint does. And G11.3: "What K6's row asks of a leg report MUST be readable without any cMIP those Terms name". **Reasoned:** the grammar uses `control` for three things: as a flag that Terms hold the task; as the rule that says whether what was passed on is what was owed; and to say which lines each side receives, which is a question about data. The task is also "still held" with the socket empty, and a payment in another layer is said to hold "the Control task (K6)" too. I think the socket is one honest question ("given what came in, what is owed to whom?") and the rest of the row belongs to the report block and to the service.

**K8 records a consent; it does not carry data.** **Read**, G11.4(d): "The reports a verifier holds are read whoever is reading: it does not ask how they reached it." And: "On whose behalf a verifier reads is not in the acts: whoever asks tells it." **Reasoned:** so K8's yes or no decides only whether a verifier says "unanswered" or "not shown" about silence, and what an honest client puts together. Whether a report in fact reaches a reader is delivery and keys, which this text does not touch. The socket is right to exist, on his words ("data is needed by so many processes"). The text should say plainly that it is a signed permission, and that what enforces it is elsewhere.

**Two near-sockets.** The place and the clock answer a question, for everyone, by a choice people sign: that is the text's own description of a task. They are "named by an identifier and … not a cMIP". P4 (several places under a rule) would need a socket. Encoding 2 writes each as 32 bare bytes "until one does" exist. I would ask now whether they are sockets, because the answer is in the bytes (section 5). The judge has no field at all (section 1(f)); I would not add one, but G5.6 should not speak as if a verifier could see it.

**The wish and the sockets.** **Reasoned:** "reward all the people that contributed" is carried by the grammar for exactly one leg: the receiver is found (G1.4), the payment is confirmed (G11.7). Everything after ("all the people") is hands passing on under K6 and readers seeing further under K8: the two least-defined sockets. That is consistent with "Building blocks over solutions." It also means the wish cannot be tested against this text alone, only against the first K6 and K8 cMIPs.

---

## 3. The way out

**In plain words:** before Terms are in force, yes: one act, alone, no one's consent. Once Terms are in force, no, unless the way out was written into the Terms before signing. That is still so in draft 25; nothing in its list of changes touches it. I judge it partly a gap in the grammar and only partly a cMIP's job.

**Before in force. Read**, G4.10: a counter signature "cancels that assent … Made by the signer of the assent in their own name". That is a clean exit. Its cost is stated: "It is still a race".

**Once in force. Read**, section 7, "No default way out": "an agreement that names no update condition changes only by the assent of everyone who signed it. And since no agreement ends (G4.9), none can be left by ending it … The way out is designed in advance or not at all". And G4.10: a counter signature "made for Terms that are in force changes nothing". So the app's sentence about draft 24 holds for draft 25, and the text agrees with it.

**What a person can still do alone** (**reasoned** from G11.2, G11.8, K7): stop acting, since the grammar makes no one act; put a word on the record (a contest, or a Statement of a kind a cMIP defines). Neither changes what a verifier answers. They stay shown as bound; they stay bound by updates others make under a condition they signed (G5.1(c)); and if they are the `receiver`, payments keep arriving in their hands with a duty to pass them on. For a person who needs to leave quietly, that last one is the sharpest: the receiver cannot resign.

**Is it a cMIP's job in an existing socket?** The text says yes, **read**, section 5.2: "an update condition that answers valid for an update that party alone signed, only where it takes its own signer out". **Reasoned:** that reaches less far than it reads.

1. **It must be chosen before signing.** The person in the question does not negotiate. They sign what is put before them, and an empty `condition` means "everyone who signed the original". The default is where they land, and the default is the grammar's, not a cMIP's.
2. **Leaving can only be written as a new version of everyone's Terms.** The leaver must write a whole Terms act for the people who stay: its `parties`, its `authors`, its `body`. They cannot be an author of it, since "`authors` MUST name one or more of the parties" (G3.1), so the words they wrote are attributed to people who did not write them; or the old words stay and still give the leaver a share. That is a confrontation by construction.
3. **The second gate.** The update condition answers valid; the new version must still be in force by its own `in_force` (section 1(a)). By default that needs the assent of everyone it names as a signer: the people being left.

**One more thing, read**, P9: "a signer can hold back their own assent by forking", and, once Terms are in force, "whether the signer of such an assent is bound meanwhile is not said". **Reasoned:** if the grammar gives no exit, the unsaid one will be tried: fork your own line on purpose. It looks exactly like lying (section 7, "Honest forks") and stops everything that signer built. Whatever is chosen about leaving, this sentence should be said before a freeze.

**What I would put to Nobody, allegedly, as a question, not an answer.** The grammar already has the block: one signer cancelling their own assent, by their own act. It is switched off at the moment Terms come into force. The stated reason, **read**: "this draft chooses that over any default that would let someone be bound without their signature." **Reasoned:** a person withdrawing their own assent binds no one else to anything new; what it does is take something from those who relied on them. Those are different harms, and the grammar treats the delegator's exit the second way already (G5.5: by default "the delegator can end it at any time"). So the question is whether *from now on, not me* is a building block of the same kind as the counter signature, with what others relied on standing as G12.5 lets it stand elsewhere, or whether it stays a thing each agreement must design. His words in the text ("we're not Law", "Your risk, your dial") can be read either way, and I do not read them for him.

---

## 4. Verifier 2's thirteen readings that change an answer

"Before freeze" means: settle in the grammar's own text before any bytes are frozen. None of the thirteen can be left to a cMIP; each is about what the grammar itself answers. Three can wait for another layer.

| | The reading the text best supports | When |
|---|---|---|
| **A1** late update, the word | As built: late is **shown**; in force is **not shown**. But "not shown" is defined as "an act not held might", which is false here. The real fix is the missing word (section 1(b)). | Before freeze, with A2 |
| **A2** late Terms, the word | Same. G14.2(c): "no new answer word". Late Terms "count for nothing, for anything": the effect of invalid without the name. | Before freeze, with A1 |
| **A3** a place orders every two updates | As built; G4.7(b) says it literally. It means first position wins under a place (section 1(d)). | Before freeze: it is a statement about what a place is for, and his to see said plainly |
| **A4** which knots | As built: each alone. G4.7(a): "L itself, or an assent without which L is not an update of O": singular. | Before freeze; a wording fix |
| **A5** which lacking act | As built, the wide reading: "might be" plus G9. But it cannot be applied cleanly, because `relies_on` mixes pieces and acts and "a verifier cannot tell two kinds of fingerprint apart by their bytes" (E5). | Before freeze: it is a bytes question |
| **A6** a cancellation not shown | The verifier's lean, not what it built. G4.10: "Otherwise whether those Terms are in force is **not shown**"; the doubt should carry into the update's answer. | Before freeze |
| **A8** a power that says no | As built: the fallback to every signer is given only "Where x's Terms give no such power". So unanimity loses to a power's no. Literal; whether wanted is his (P17 already asks). | Before freeze: it defines when an agreement has signed, the central idea |
| **A9** an unreadable act held | As built, with one refinement: unchecked only where a held act names it (G6.1, G4.7(c)); otherwise the answer is already "as shown", which covers acts not held. The lean (always unchecked) would let anyone make any agreement unchecked by handing a verifier a locked act. | Before the answer vectors are frozen |
| **A10** two versions by one author | Section 3.2 gives a path: "where that signer's line forked in Terms acts, a Terms act written as a resolving update". The tips are the same acts in both lines, so one act can name them for both, each judged by its own signing rule. The text does not say that it does. | Before freeze: it decides which act form resolves which fork, and honest redrafting meets it |
| **A11** "nothing they name is lacking" | As built (wide, safe). I cannot tell from the text which lacking act the clause guards against. | Can wait, with all of G14, for the envelope's layer |
| **A12** the first counter signature | "The first … that follows it": the one that follows no other. A tie by id is the verifier's invention; two unordered ones cancel the same assent, so no tie-break is needed unless a re-assent lies between. | Wording; low stakes |
| **N1** a report naming the payment | As built: no confirmation, ties nothing, listed as its signer's word. G11.7: "never the payment itself". But encoding 2 hedges: "where the two are different acts" (E5). | With Money: what a settlement is decides it |
| **N2** a receiver that is an agreement and a party | As built. G1.3 keeps "one of their own parties" for a signer or role named by position; an agreement by root is the other form "whether or not it is one of their parties". | Wording; trivial |

---

## 5. One-way doors in the bytes

**In plain words:** most of encoding 2's choices are ordinary and could be made otherwise at the cost of new vectors. Seven would be hard to change after real acts exist. The first is the one I would not walk through yet.

1. **An agreement cannot cross a spec hash, and never ends.** **Read**, E2: "An act under any other spec hash is **not this encoding**"; draft 25's head: "a later draft is a new specification, with a hash of its own, and nothing written under this one is updated"; E23: an act whose `previous` names "an act of another specification" is **invalid**. And G4.9: "No act ends Terms". **Reasoned:** an agreement begun under draft 25's hash can be continued only under draft 25's hash, for ever, and has no default way out. For test identities that is fine ("We can always provide new hashes"). Before any act that matters, the text needs one sentence on how a version under a later specification replaces a version under an earlier one, and how a signer's line passes across.

2. **The spec hash covers the whole file.** It is the hash of `draft-25.md`: rules, the history paragraph, the open questions, the builders' list. A corrected typo in section 8.4 is a new specification. The hashed text should be the rules and the tables, and nothing that is expected to change.

3. **Two lines in every act.** **Read**, E1: "the act is the next of **all** its signer's everyday acts"; and: "The payload's `previous` (E17) is another line … Both are written." Draft 25's section 8.1 still asks whether the core gives "a per-signer line of acts (which would make G6 redundant)". Encoding 2 answers that it does, and the draft has not reacted. **Reasoned:** they are not the same line (one is per agreement and can be checked without a signer's whole life), so keeping both may be right. But it is two fork detectors with two meanings, and what a key change does to either is left to the Sign layer (8.1: "What the Sign layer does when a key is replaced or lost, since that decides whether G6 sees a fork"). This is a lower-layer question sitting inside every Agreements act.

4. **Roles have no name.** **Read**, E10: "A role carries no label"; authors and receiver point by position. **Reasoned:** a position is stable only inside one Terms act. Across versions nothing in the bytes says that the role at position 2 of the new version is the spot people filled under the old one; and since the same party "by the same bytes" may not appear twice, a role's bytes are its identity within a version, so changing one parameter of its cMIP (closing the offer) makes it, in bytes, another role. G10.5 to G10.7 speak of "the spot" across versions as if it had an identity. Draft 25's own section 10, item 4, notes that a test session "gave each role a label".

5. **Fingerprints carry no kind, and `relies_on` mixes kinds.** 32 bytes for an act, a cMIP, words, a signer, a place. In fixed fields the field says which. In `relies_on` ("every other piece the Terms use, and … every version or act they relied on") nothing does. Several answers depend on whether a lacking entry is an act (A5).

6. **The report's bytes are K6's, under a proposal's hash.** The block says "Everything else … is the task's to define", but the encoded report has exactly K6's five line kinds and an amount that is a whole number. A call names its task by the numbers 1 to 8, which are this draft's numbering. A report stands in no line, so one signer can sign two reports that answer one call with two amounts, and no fork is seen. All of it sits under `SPEC_REPORT_BLOCK_4`, the hash of a proposal. I would write no report that matters until the block has a home.

7. **Shapes written only so that they can be ignored.** Power kind 4, `replaces`, "written so that G5.2's case can be: … left unread". Entries of `relies_on` that are not fingerprints, left unread: an open slot for any bytes inside an otherwise closed map. `resolves` without `continues`, read "as an act like any other". Once acts carry these, they can never be refused.

Smaller, and changeable with effort: the place and the clock as 32 bare bytes (E6); sets sorted and never empty (E18); small numbers for the words (E10, E14 to E16); a call "one per task"; "one signing" matched over nine keys (E24).

---

## 6. Size

**In plain words:** no. The heart is small; the file is not. I measured the file: about 266 kilobytes, of which the fourteen rules are about 106. Three rules (G4, G11, G14) are 59 of those. The paragraph before section 1 that recounts drafts 20 to 25 is 9 kilobytes by itself, and it is under the spec hash.

What I would cut, in order. The first costs nothing; each later one is a real choice, and none is mine to make.

1. **Everything that is not a rule, out of the hashed file.** The draft-by-draft paragraph; every "Draft 20 read … that reading is gone" inside a rule; sections 6 to 10. A reader meeting G4.8(g) ("What is left of the signatures. Draft 18 asked two things…") is reading history in the place of a rule.
2. **The baker (G14) out of the grammar's first freeze**, into a text of its own beside the envelope's layer. It is 13 kilobytes and two fields; it cannot be checked by encoding 2's checker ("such Terms pass, with no note"); it puts a MUST in front of every other answer ("MUST first read the envelope"); and the text itself lists it among "things a cMIP could perhaps also build". It rests on his words ("An agreement that points to an envelope already needs the baker"), so this is a question of where it lives and when it freezes, not whether it stands.
3. **Reading across legs (G11.4 to G11.7) to the report block**, leaving in Agreements the receiver, the call in Terms, and the data consent. The text has carried that question itself since draft 14 ("whether it should leave the grammar altogether").
4. **The delegator's default (G5.5).** It is the one place the grammar reads the words, and what it does (one party alone may make a certain update) is exactly what an update condition answers. Also among the text's own "could perhaps".
5. **In the bytes:** the dead shapes of section 5, item 7; and the four named kinds of spot, of which the grammar reads nothing but whether a `what` is required.
6. **The three-way sorting of faults.** Four cases of "invalid" are faults an act's own bytes show (G2.1, G10.1, G4.2, G3.1), and the encoding leaves fields optional or untyped only so that they can be written and then called invalid instead of rejected. Both count for nothing. Folding those four into "rejected" would leave "invalid" for the two cases that need other acts (G6.1, G14.3), and remove a page of ordering rules from both texts.
7. **G5.6 and G5.7** restate what G4.8, G5.1 and G5.2 already give. They are good explanations; they belong with the reasons.

---

## 7. My view

**The heart is a sound base.** Lines, forks, own signature, update by a condition people chose, unchecked is not passed, now is what an act cites, an agreement as a party: I found no contradiction among them, and verifier 2 found very little to change between drafts. Section 8.1 is, as it stands, the best brief the lower layers could be given: it says what Agreements needs from each and claims nothing more.

**It is not yet a base to freeze bytes on**, and I would not rewrite the lower layers against the whole of draft 25. Two things should move first.

**First: the seam with the act format.** Two questions already sit in every act and belong half to the layer below: which layer owns a signer's line (section 5, item 3, with what a key change does to it), and how an agreement that never ends lives across a change of specification (section 5, item 1). Rewriting the lower layers before these are answered means rewriting them against an Agreements whose every act is tied to one draft's hash. Cutting the hashed text down to its rules (section 6, item 1) is the same move seen from the other side, and it is the cheapest thing on this page.

**Second: the two gates, and with them the way out.** Whether an update needs only the update condition's yes, or also the new version's own `in_force`, decides what "two of three" means, what a leaving party must do, and what the delegator's exception is an exception to. It has been listed as open across several drafts. It is the one open reading on which the question he was asked by an app ("no way to leave Terms in force") turns, and it is his to answer, not the lead's and not mine.

After those two, I would freeze the heart alone (the two acts, G1 to G6, G8 to G10, G12, G13, with K1 to K5 and K7), and let the place, the legs and the baker each freeze with the layer it reads.

**Where I may be wrong.** I did not read the reasons, so a rule I call restating or movable may guard something I did not see. I did not run the verifier, so a reading I call "as built" is the report's word for what was built. And my reading of the way out assumes that being shown as bound matters to the person even though the grammar enforces nothing; if "MOR just tracks receipts" is the whole answer, then stopping is leaving, and section 3 is about legibility only.

Test identities only; no server address, onion address or key appears here.
