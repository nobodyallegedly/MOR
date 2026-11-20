# An attack on eleven decisions of 17 November

17 November 2026. Written by Claude, for Nobody, allegedly. A review: a record of work, not a decision. It changes no text, code or vector, writes no rule, and decides nothing.

**The wish** (Nobody, allegedly, `docs/decisions.md`, branch `claude/lead-records-2`): "I've decided for a total rewrite of agreements from scratch." "No translation, fresh from the research we had all agreed was excellent direction."

**Why this review, in his words:** "Once that is over, we.ll focus the rest of the budget on reviewing, no redrafts, no recode." "Before redrafting any layer I want to really look at the findings in details, find the right questions and then find one last way for me to zoom out before deciding on the rewrite."

## What I read, and what I only reason

**Read, whole:** the eleven entries of `docs/decisions.md` (branch `claude/lead-records-2`), from "Three lines cut back" to "The issuer is priced too"; `docs/reviews/fable-draft-25.md` (branch `claude/fable-draft-25`); and of `docs/agreements-from-scratch/draft-25.md` (branch `claude/agreements-clean-1-hahuwn`), its head, sections 1 to 7, 8.1 to 8.3 and 9.

**Searched, not read whole:** draft 25's sections 8.4 and 10, for the words leave, withdraw, private, key and place. They say nothing on those that the sections I read do not.

**Not read:** every other entry of the ledger (among them "Ending", "Withdrawing an assent" and "Grants", whose headings suggest they bear on the way out); `reasons-25.md`; the encoding; verifier 2's report; the report block; the lower MIRs; the text of the admission test, which I have only as the brief quotes it. Nothing was run.

Each judgment is marked **read** (the sentence is quoted) or **reasoned** (it follows from what I read, and I may be wrong). Every attack below is reasoned: none was run against a verifier.

**Two things about the brief itself.** It quotes, for the vouchers, "The voucher is spent. The promise of something was fulfilled". I did not find those words in the ledger on that branch; the entry has only "Voucher then disappears." And the brief names the branch `claude/fable-attack-review-1`; this session could push only to `claude/fable-attack-review-1-fht8kn`, so the file is there.

## In plain words

None of the eleven decisions is wrong in what it wants. Three of them are unsafe in how they could be written, and they are unsafe together more than apart.

1. **The way out (3)** is safe only if leaving is a different thing from taking back a signature. If leaving is written as the counter signature made available later, one person leaving can take the Terms out of force for everyone, or leave an agreement that still receives money with nobody bound by it. And three older doors (forking your own line, a key declared lost, a doubt left about your assent) each let a person get out in a way that erases more than leaving does. A default way out is safe only if those three release nothing more than it does.
2. **The way out with unclear means unchecked (4).** Until today a withdrawal could exist only in the short time before Terms came into force. From today a person can step out at any moment of an agreement's life. So the doubt that decision 4 freezes on can now be made at any moment, by anyone who signed, for ever.
3. **The way out with the place (9).** Where Terms name a place, an act counts only once the place shows it. A relay that does not show a leaving keeps that person in. "Only an agreement can keep you into something": as written today, a relay can too.

The lock that keeps someone in can be hidden in three ways, not one: in a cMIP no one reads; in a later update that fewer than all signed (decision 2 makes this easier); and in an agreement signed for you by a group you belong to.

Below: the attacks, ranked by harm; then each decision against the others; then where an "Arrived at" line says more, or less, than his words; then the admission test.

---

## 1. The way out (decision 3)

**His words, read:** "Agreed. Only an agreement can keep you into something, and agreements have their own way out. But default should always offer a way out". He agreed to the MOR lead's choice (c): "an exit by default that Terms can switch off, said plainly before anyone signs", "with leaving never erasing what is owed, the record showing who left, and a contest still possible."

**What the "Arrived at" line leaves out, read:** "By default, a signer can leave Terms in force. Only Terms that say so can keep someone in, and those Terms have their own way out." The three safeguards he agreed to (nothing owed is erased, the record shows who left, a contest is still possible) and "said plainly before anyone signs" are in the exchange and not in the line. Anyone writing from the line alone would write the exit without them. Every attack below lands on one of those four.

### 1.1 Leaving written as a signature taken back: the Terms fall for everyone

- **Who:** any one signer of Terms whose `in_force` rule needed their assent.
- **How, read:** draft 25, G4.1: "Terms are in force when the assents their `in_force` rule requires are present." G4.10: a counter signature "cancels that assent", and "an assent so cancelled is not counted by G4.1". The earlier review pointed at this block as the one to reuse: "The grammar already has the block: one signer cancelling their own assent".
- **Reasoned:** if leaving uses that block after Terms are in force, the count of G4.1 is taken again without the leaver, and the Terms are no longer in force. Then, by G4.3 ("An assent binds its signer only while the Terms it names are in force"), nobody is bound. One person's "from now on, not me" becomes "from now on, nobody", against G4.9 ("Terms stop being in force only ... when a version replacing them is in force").
- **What they gain:** the power to end an agreement alone while seeming only to leave it; a buyer's rights under G10.6 then stand against no one.
- **What the record shows:** an assent, a cancellation, and Terms whose state the text does not say.
- **What must hold:** leaving never changes whether Terms are in force. It changes who is bound from then on, and nothing else. This is the first thing to settle, because every other attack depends on which way it goes.

### 1.2 The hand that leaves while money is arriving

- **Who:** the party Terms name as `receiver`; or a service under a deal; or an escrow.
- **How, read:** G13: a payer "who names the version they read has paid as that version says". G1.4: where a version "names as receiver a signer or a role that is not among its own parties ... no one receives, and the answer is **not shown**". G11.2: passing on "is its obligation under those Terms".
- **Reasoned:** the receiver leaves. Payers who read the version before she left keep paying it; the layer that holds value sends the money to her. If a leaver is read as no longer a party, the verifier answers "no one receives" for money she has in hand. If she is read as no longer bound, the duty to pass on, which exists "under those Terms", has no one under it. Those who stay can name a new receiver only by an update; until they do, every payment goes to someone the record says owes nothing.
- **What they gain:** everything that arrives between leaving and the next version, with a record that names nobody.
- **What the record shows:** payments shown as "one side only"; a leaving; no doer.
- **What must hold:** whoever a version names as receiver stays the hand for everything paid under that version, having left or not, with the duty to pass on and to answer the call. Leaving a seat that receives is not the same act as leaving as an owner. The earlier review saw the first half ("the receiver cannot resign") as a harm to the person; this is the other half.

### 1.3 The lock nobody read

"Only Terms that say so can keep someone in." Where do they say so? Three hiding places.

**(a) In a cMIP.** **Read**, section 3: a socket's parameters are bytes "which only that cMIP reads". G4.11(i): "A verifier MUST NOT answer, of itself, that an agreement is locked". G5.5 already keeps a lock in the words: what conditions a delegation puts on ending "are read from their words, as the body's cMIP gives them", and where the verifier cannot read them the answer is **unchecked**. **Reasoned:** if the switch that turns the exit off is a cMIP's output, a person without that cMIP is told "unchecked" when they ask whether they can leave, and draft 25 as it stands forbids the verifier to say "locked". That is the opposite of "said plainly before anyone signs". For the sentence to mean anything, whether these Terms keep you in has to be readable from the Terms with no cMIP at all, and a cMIP may only add ways out, never take the default away unseen.

**(b) In a later update.** This is where decision 2 meets decision 3. **Read**, G5.1(c): a person is bound by "a Terms act that replaces Terms by which they are bound" where "the update condition of those Terms answers valid for it". Section 7: "a party is bound by an update it never signed". **Reasoned:** Carla signs Terms with the default exit and a condition "any two of three". Ana and Ben sign a version that switches the exit off. By decision 2 it replaces at once, with no assent of Carla's and no second gate. Carla is now kept in by Terms she did not sign, and nothing was said to her before she signed anything. *Who gains:* any majority that wants to stop a minority leaving before it dilutes them. *The record shows:* a valid update. *What must hold:* a version that closes the exit closes it only for those who assent to that version in their own name, as G10.6(a) already does for the rights of a filling; or a person so bound may still leave under the version they signed.

**(c) Through a group.** **Read**, G1.2: an agreement's signature "binds every party bound by x's Terms, as x's Terms say". **Reasoned:** Dara joins a collective whose own Terms leave the exit open. The collective signs, by a vote she lost, a deal that closes it. She never signed the deal and may never have read it. If she leaves the collective, is she still held by the deal? His sentence says "an agreement" keeps you in; it does not say whether that is one you signed in your own name or one signed for you. An agent with a power of kind `assent` raises the same question (G5.6(f): "Your risk, your dial").

**And the plain case.** A buyer signs an offer by an assent (G11.6(b)) and negotiates nothing. Whoever drafts offers for a living will switch the exit off in every one. So for the person the default was meant for, "the person who does not negotiate", its whole worth is that the lock must be visible. What a client shows before signing leaves no act: draft 25 says so of its one client duty (G12.8: "No verifier can check it"). The visibility he agreed to would be a second duty of that kind.

### 1.4 Forking instead of leaving

- **Who:** any signer who wants out of more than leaving gives.
- **How, read:** G6.2: two acts by one signer "that name the same `previous` ... are a fork". G12.2: "While a fork stands, neither tip counts". G12.3: a tip set aside "never counted as the next act of the line". P9: "a signer can hold back their own assent by forking, until they resolve the fork themselves ... whether the signer of such an assent is bound meanwhile is not said". Section 7, "Honest forks": it "looks exactly like a lie", and so a lie looks like a lost device.
- **Reasoned:** months after signing, the signer makes a second act that names the same `previous` as their assent did. The assent is now a tip. While the fork stands, their assent is in doubt, and by decision 4 everything that depends on it is unchecked. Then they resolve their own fork, alone (G12.3: "for one signer's line, by that signer"), and choose. Continue the assent: they were in all along. Continue the other tip: the assent "never counted". That is a way out that reaches backwards, chosen after seeing how things went, and it leaves no word "left" on the record.
- **What they gain:** a free choice, made later, between having signed and never having signed; and a freeze meanwhile.
- **What the record shows:** a fork that reads as an accident, then a resolving act.
- **What must hold:** an assent that already counted toward Terms in force is not un-counted by anything its signer does later in their own line. The same for a key: decision 6 has "a key change continues the signer's line", and draft 25, section 9, says the text "does not say what a change of key does to a line (G6): whether an act the core calls void is still a tip". A key declared lost as of a date before the assent is the same attack through the layer below. Decision 6 makes that layer the owner of the answer; Agreements should say what it needs: no act of the lower layer releases a signer from more than leaving would.

An honest exit is the cure here. A person with a cheap, visible door has no reason to use the window. But the window must be shut in the same writing, or the default adds a door and leaves the window.

### 1.5 Leaving, dated backwards

- **Who:** a party who has received, or owes, and wants the leaving to have come first.
- **How, read:** G13.3: "Between two acts of which neither so names the other, no order is shown from the acts alone." Section 7: "Order without an anchoring is partial."
- **Reasoned:** a payment arrives on Monday; she does not confirm it. On Tuesday she signs a leaving that cites nothing recent. No knot ties the two. She says she had left. With no place, the order is not shown; by decision 4 it is unchecked.
- **What must hold:** a leaving takes effect against others' acts only from where the acts or a named place show it; what cannot be ordered against it is read as before it. That is G13 applied to the leaver ("now is what an act cites"), and it keeps "leaving never erasing what is owed" from depending on her own timing.

### 1.6 Leaving, signed for you

- **Who:** a majority holding a power.
- **How, read:** G4.10 lets a counter signature be "made for a party under a power of kind `counter_signature`". G5.6: "No power can change" the constitution.
- **Reasoned:** if leaving is a Statement of a kind, Terms can give a power for it, and two members can sign the third's leaving. Then, with her out, the default no longer asks her for anything, and her share goes at the next update. An expulsion wearing the word exit. Expelling changes who is in the agreement, which in his words is the constitution ("Update equals constitution"); a power is the executive. *What must hold:* a leaving is made in its signer's own name only, or it is said plainly that Terms may give this power.

### 1.7 The group left holding the promise

- **Reasoned.** Three sell lifetime access to a work; Ben hosts it. Ben leaves. Ana and Carla are still bound to a promise only Ben could keep, and every buyer's filling keeps "exactly the rights offered by the version it was earned under" (G10.6). Each signed because the others did; the first to leave moves his part of the weight onto the rest. The reasonable answer for each of them is to leave too, and the last one out holds everything. If all leave, the agreement "never ends" (G4.9), still names a receiver, and binds nobody.
- **What the record shows, and should keep showing, read:** G11.8: a contest reaches "the parties that version names as signers". That is keyed to the version, not to who is still bound, so by its letter a contest still reaches Ben. That sentence is what "a contest still possible" rests on; it must survive the rewrite as it is.
- **Not closed by any of this:** the weight the leaver moves onto those who stay. That is a stated cost of a default exit, and it should be written as one.

### 1.8 What the leaver loses, and what they keep by accident

- **Loses, reasoned:** after leaving, the default update condition no longer asks them (it must not, or the leaver holds a veto over those they left: "pay me and I sign"). So the next version can give them nothing. A person who leaves a work they co-wrote keeps what was already earned and nothing after, at the others' choice. The person the default protects should be told that leaving is also giving up their say.
- **Keeps, reasoned:** powers. G5.1(b) asks that the people bound be bound by the Terms that give the power; it asks nothing of the one who signs under it. A delegate who leaves is free of every duty and can still sign for the group, unless leaving also ends the powers they held.

### 1.9 What leaving must never erase

Drawn from the attacks above; a list of what must hold, not a rule.

1. That the Terms are in force (1.1).
2. What reached the leaver's hands, the duty to pass it on, and the call to report it; and the same for whatever still arrives under a version that names them (1.2).
3. The rights of fillings earned before they left, and the reach of a contest against the versions they signed (1.7).
4. What is already owed to the leaver.
5. The order of things: nothing is placed after the leaving by the leaver's own silence (1.5).
6. The others' ability to go on without the leaver's signature, and the end of the powers the leaver held (1.8).
7. That they signed at all: no fork and no change of key releases more than leaving does (1.4).

**Is "Terms that say so can keep someone in" enough?** No. It needs three more things said: *where* Terms say so (readable with no cMIP); *when* (not by a later update the person did not sign); and *whose* Terms (signed in their own name, or also those signed for them). And one question for Nobody, allegedly, that his sentence raises and does not settle: "agreements have their own way out" reads as a fact. Draft 25 allows a lock (G4.11(i): a condition that "answers not valid to every update" is "read as any other"). Terms with the exit switched off and a lock have no way out at all, for ever. Is that allowed?

---

## 2. Unclear means unchecked (decision 4)

**Read:** "Where it is unclear whether someone's assent counts, every answer that depends on it is unchecked; an update is not shown as replacing the old Terms until that person's position is clear."

**In plain words:** it protects Carla from losing her share on a guess. It does so by giving Carla, and anyone who can stand where Carla stands, a way to stop the agreement without committing to anything.

### 2.1 The open option

- **Who:** a person named as a signer whose assent the Terms did not need to come into force.
- **How:** she signs a private assent and gives it, locked, to the others' verifiers; or she assents and withdraws with nothing that orders the two.
- **What she gains, reasoned:** time, and a choice. If the work earns, she opens the assent: she signed at the start and claims her share. If it brings debts, she never opens it. Meanwhile no update under the default is shown. Under reading (a) she lost a share without signing; under (b) she holds an option the others pay for. The MOR lead named the cost ("the cost on those taking her share"); it also falls on everyone who deals with them, below.
- **What the record shows:** an act nobody can read, or two acts with no order.
- **For ever?** Yes, as decided. Only she can clear it, and "until that person's position is clear" has no end. If she is dead or gone, it is permanent.

### 2.2 Who else can do it

- **Read**, the earlier review on A9: the lean "would let anyone make any agreement unchecked by handing a verifier a locked act", with the refinement "unchecked only where a held act names it". Decision 4's line does not carry that refinement.
- **Reasoned:** whether a locked act can be tied to Carla and to this agreement without its key is the encoding's, which I did not read. If it can, only Carla can do this. If it cannot, anyone can, at no cost and with no name. Either way the doubt should be shown with its owner: not "unchecked", but unchecked, waiting on whom.

### 2.3 Two readers, two answers

- **Reasoned:** the doubt exists only for a verifier that holds the locked act. One that does not hold it answers "shown, as shown". So the attacker chooses who sees the freeze: hand the locked act to a buyer's verifier and not to the owners'. That is "one history shown to one person and another to another" (G6's lie), done with an act that is not a fork.

### 2.4 Who is exposed

- **Read**, G4.8(e): "which Terms are in force is **unchecked** from there on".
- **Reasoned:** not only those taking her share. Every version built on the doubted update; every buyer who fills a spot under one (their filling names a version not shown as a version); every payer whose payment names no version and so needs "the Terms in force" (G1.4). The people furthest from the quarrel carry it.

### 2.5 A cMIP can pass straight through it

- **Read**, K4's row: "valid or not valid"; K2's row: "it may ask whether an assent in a given name counts". G4.11(b): "Its answer waits for no one to publish anything."
- **Reasoned:** under a named condition the verifier does not know which assents the cMIP leaned on. A cMIP can answer "valid" having counted a doubted assent, and decision 4 is not applied. The decision holds only if the grammar itself answers "does this assent count?" with three answers (yes, no, unclear) and an "unclear" handed to any task makes that task's output unchecked. Otherwise it is a guarantee a module can break.

### 2.6 A small wording point

The line says "not shown as replacing". **Read**, section 2: "not shown" and "unchecked" are two answers, and G4.8(e) uses unchecked. The earlier review already found the answer words one short. Which word a verifier gives here should be said, since decision 4 is named after one of them.

---

## 3. Each decision against the others

### 3 against 2: they hold together only one way

**Reasoned.** There are two ways to write leaving.

- *As an update* (a new version without the leaver). Then by decision 2 the update condition decides alone. Under the default ("everyone who signed the original") the exit needs everyone, which is no exit; so the grammar would have to overrule the default for this one case, as G5.5 does for the delegator. And where Terms name any condition, G4.11(i) says the cMIP's output "is the answer" and the grammar has "no notion of a cMIP overruling the default": so naming a two-of-three cMIP that never thought about leaving would switch the exit off without a word. Decision 2 would undo decision 3 in every agreement that names a condition.
- *As the leaver's own act*, which replaces no version. Then decision 2 is untouched: nothing is updated, and the update condition is never asked. But then 1.1 must be answered (it is not a cancelled assent), and the switch that keeps someone in cannot be the update condition's.

Only the second lets both decisions stand as he gave them. And the case of 1.3(b) remains under either: decision 2 lets fewer than all close the exit later.

**One more, on decision 2's second sentence. Read:** "The new version's own `in_force` governs only its own later life, not whether it replaces the old one." His words are "A, agreed", to "(a) the update condition alone decides". G4.5: "Terms stop being in force when Terms that replace them ... are in force." **Reasoned:** if a version replaces by the condition alone and is not in force by its own rule, either nothing is in force (and by G4.3 nobody is bound: an exit for all, by accident), or it is in force regardless and its `in_force` field asks nothing. G5.5 says the needed words for its one case: "it replaces, and is in force". What "its own later life" means is the MOR lead's sentence and is not yet a reading a verifier can apply.

### 4 against 3: each makes the other worse

**Reasoned.** Decision 4 was sized for a short window. **Read**, G4.10: a counter signature "is available only until every party has signed"; "One made for Terms that are in force changes nothing". So until today, doubt about a withdrawal could arise only before Terms were in force. Decision 3 lets a person step out at any time. So "it is unclear whether someone's assent counts" can now be made true at any time: a leaving kept private, or one that nothing orders against the update it races. Together, 3 and 4 give every signer a standing way to freeze the agreement that neither gives alone.

In the other direction, decision 3 is the relief for decision 4: where Carla's doubt freezes an agreement for good (2.1), the others' own way out is the only way they have left. So the two should be written in one pass, with 1.5 (how a leaving is ordered) deciding how often 4 bites.

### 3 against 9: a relay can keep someone in

**Read**, G7.2: where Terms name a place, an act "counts ... only once the place shows it". Section 7: "a party's own act that never reached the place does not count, even if it is genuine." Decision 9: "every reader takes what is latest from it and from nothing else." **Reasoned:** a leaving the relay does not show has not happened. See section 4.

### 8 against 1, and against an earlier exchange

**Read**, decision 1: open again is "whether a holder of the baker's rights must be bound by the Terms, beyond being a party". Decision 8, in the MOR lead's reframing that "Agreed for the first" answers: "the baker into Envelopes, Agreements asking only whether the current holder is a party".

- **"only whether ... is a party"** answers, in passing, the question decision 1 reopened that same day. **Reasoned:** G4.1 lets an `in_force` rule need fewer than all. A copier writes Terms that name the baker as a party, with a rule that needs only his own assent, and himself as receiver. The baker "is a party". If that is all that is asked, the Terms count. That is the theft G14 exists to stop ("whose work no stranger's Terms can rule").
- **"current holder"** is the reading that draft 24 removed, **read**: "Draft 23 read the current holder, as the chain stands now; that reading is gone", because under it "a sale made every earlier agreement for the work stop counting, payments under them lost their receiver". It may be a loose word. It is in the sentence he agreed to.

Neither is in the "Arrived at" line, which says only "the baker's rule moves into Envelopes". Both should be put to him before anything is written from the reframing.

### 5 against the text it leaves alone

**Read**, his words: "A move to MOR2 potentially does end it". The line: "A move to MOR 2 ends a MOR 1 agreement unless it is updated to MOR 2". "Potentially" is gone. And draft 25, G4.9: "a verifier MUST NOT answer that Terms or an agreement have ended". **Reasoned:** inside MOR 1 nothing ends. A MOR 1 verifier will show the old agreement in force for ever, and a payer reading MOR 1 pays its receiver. After a move there are two living agreements, each right by its own text, and nobody sees a fork. That is MOR 2's to solve, as he said; MOR 1 should not be described as ending anything. And "nothing new in MOR 1 beyond the default way out" assumes the people can leave: Terms with the exit closed and a lock (1.9) can never cross.

### 6: what "It does" answers

**Read:** the MOR lead's lean has four parts (keep both threads; the signer's line is the layer below's; the agreement's thread is Agreements'; a key change continues the line). He: "It does". **Reasoned:** the plainest reading is that it answers the last part: a key change does continue the line. The line says "both threads stay". That may well be what he meant; it is more than two words say. One consequence to see first: if a person's line is "every act a person signs, across their life", one fork in it reaches every agreement they are in, and with decision 4 every one of them goes unchecked. What Agreements reads from the lower line, and how far a fork there reaches, is not said.

### 7 with 8, 9 and 10: no contradiction, one consequence

One freeze, with three rules moving to texts that do not exist yet (**read**, section 8.1: the place has "nothing under it that can be built"; the report block is "not yet written into any spec"). So those homes must be written before the one freeze, and what cannot be run is frozen as "reasoned". With decision 10, a companion document is outside the hash and can change after the freeze; section 5 below says what that costs.

### 11 against the core

Not core, so only where it leans on it.

- "Voucher then disappears." Nothing disappears on MOR (**read**, section 2: an act is "never updated"; G10.7: "nothing is undone"). Spent has to be something a reader is shown.
- A voucher that hops is a filling that passes to another. **Read**, P7: "whether a filled spot can pass to another" is open.
- Hopping twice with one voucher is a fork, and **read**, section 7: "Without a place, no scarcity". So a voucher exchange needs a place, and by decision 9 that is a relay. Whoever runs it orders every trade and every redemption. If it is the issuer, see section 4.
- The issuer and decision 3. A voucher is a promise held by strangers who come later. If the issuer can leave by default, "from now on, not me" stops the next hop, since the next holder's filling comes after the leaving. So every serious voucher will close the exit, and the market he describes ("the eggs from coop and the eggs from storby could end up being priced differently") will price, among other things, whether the issuer can walk. That is a good test for decision 3: it is the plainest case of "what is owed" to people who are not yet there.

---

## 4. The place (decision 9)

**Read:** "the place is a pointer to a relay, a field in Terms, with one rule: where the Terms name a place, every reader takes what is latest from it and from nothing else. The rest of G7 leaves the grammar." His words: "It's just a pointer to a relay then. Why the need for more grammar?"

**In plain words:** he is right that it is simple. The one sentence that stays makes the relay the only voice on what is latest. So everything that sentence does depends on a relay nobody in the grammar can check, and one sentence that left with "the rest" was the check.

**It lies.** *Who:* the relay. *How:* one "latest" to Ana, another to a buyer. *Read*, G7.2, in what leaves: "Where the verifier holds two answers of one place that contradict each other, it has no answer from that place: **unchecked**". The lean sends "a place contradicting itself" to "the relay's or a cMIP's". *Reasoned:* then the liar's own layer says what counts as its lie. G13.4 keeps a like sentence for an anchoring "the reader accepts"; whether it covers the place the Terms name should be said. And two answers convict a relay only if its answers are signed (section 8.1 asks for "a signed answer, by the place"). That need is now someone else's to write, before the one freeze.

**It withholds.** *Read*, G7.2 and section 7, as above. *Reasoned:* it can refuse a leaving (the person stays in), a counter signature (the person is bound), the assent that completes an update, a resolving update (the fork stands), a buyer's proof. *The record shows:* nothing, which is the point: silence leaves no act. A person holding their own signed leaving, and everyone else's acknowledgement of it, is still in, because "from nothing else".

**It orders.** *Read*, the earlier review, A3: "under a named place the earlier position wins". G4.10: "the counter signature changes nothing where its position is after the position at which the Terms came into force". G10.5: who came in time is "per the place". *Reasoned:* between two rival updates, a withdrawal and the last assent, the hundredth buyer and the hundred-and-first, the relay picks the winner by position. That is a judge nobody named as a judge, and positions can be sold.

**It disappears.** *Read*, G9.1: where a verifier "cannot get an answer from a named place, it MUST answer **unchecked** for every answer that depends on it". G4.8(d): whether a version has replaced the original "is judged per the place ... that the original names". *Reasoned:* the relay is gone. Everything about what is latest is unchecked. The version that would name a new place must be shown by the old one. The agreement can never move, and, since a leaving counts only once the place shows it, nobody can leave it either. And this meets draft 25's own first constraint, **read**, section 1: "No grammar rule needs a particular server, keeper, platform or software author to remain." A pointer to a relay needs that relay to remain.

**One of the parties runs it.** All of the above, with a motive. With decision 2: two of three sign a version that names their own relay. If "which answers count per place" has left the grammar with the rest of G7, nothing says which place judges that replacement. From then on their relay is the only voice, and the third party's leaving reaches it or does not.

**"From nothing else" and the acts' own order.** *Read*, G6.2: fork "whatever a place shows: an act the place does not show is still a tip". G4.7(c): "Where knots or an anchoring show it, nothing else (a place that shows L before F ...) makes L an update again." *Reasoned:* in draft 25 the acts' own citing can overrule a place. Read alone, "from nothing else" silences it. I take the sentence as meant for "what is latest" only; it should say so, or the relay can order an act before the act it cites.

**What would keep it simple and safe, as questions, not rules.** Does a person's own leaving, and a fork, count from the acts whatever the place shows? Is a place's answer always signed, so that two answers expose it? What do signers do when the place is gone? Each is one sentence, and each decides whether "just a pointer" hands the agreement to the relay.

---

## 5. The moves (decisions 8 and 10)

### The baker into Envelopes

- **The check needs words only Agreements has. Read**, G14.2: Terms count "only if the holder at the act they cite ... is one of their parties, bound by them (G5.1), and they are not late", late being read by "the knots, or an anchoring" of the agreement. **Reasoned:** party, bound and late are Agreements' words. A lower text cannot say them without reading the layer above it. Who holds the rights can move down. That Terms count for nothing without the holder cannot, or it is said nowhere.
- **Someone must make the verifier ask. Read**, G14.3: a verifier "MUST first read the envelope" before any answer that rests on such Terms; G1.4: "the answer of G14.3 comes first". And section 3: "A field these tables do not give is not read past: the act is **rejected**". **Reasoned:** the fields `envelope` and `envelope_at` are in the Terms act. If no Agreements rule reads them, they are either rejected or read by nobody, and a verifier of Agreements alone passes a thief's Terms and pays his receiver. One sentence must stay in Agreements.
- **Two things that could be lost on the way:** "holder at the act cited" turning back into "current holder", and "bound" turning into "is a party" (section 3 above). And G14.5 ("never picks", the baker's contest) leans on the contest, which stays in Agreements.

### Reading reports into the MICS

- **Who may tie. Read**, G11.4(b): "A report ties only where its signer is a side of the leg ... A report by anyone else is listed ... and ties nothing." Who is a side is read by G1.4 and G11.2. **Reasoned:** the words matched, mismatched and one side only can live in the shared language. Who counts as a side cannot: it is each layer's. If the MICS has the tie without that filter, a stranger's "received" makes a payment read as matched.
- **Who may say "unanswered". Read**, G11.4(d): "**Unanswered** is said only by a verifier that reads as a side of that leg, or along a path the people of that leg signed for". His words, quoted in section 8.1: "Never extended to the other layers. Or surveillance become cheap and omnipresent." **Reasoned:** this is the privacy guarantee of the whole block. Moved into the shared language it governs every layer at once, so one slip there is a slip everywhere.
- **No line for reports. Read**, section 3.2: "no fork is seen among reports". The earlier review: one signer can answer one call "with two amounts, and no fork is seen". **Reasoned:** in Agreements that was one rule's gap. In the MICS it is every layer's, frozen once.
- **What stays, and is safe as far as I can see:** G8.3 ("MUST NOT show a payment as received on the buyer's word alone") is in G8 and does not move.

### The history into companion documents

What a verifier answers loses nothing. Four other things could.

- **Whose reading each rule is.** Draft 25 marks many sentences "Claude's reading" or "the MOR lead's settlement", mostly in sections 8.2 to 8.4. With only rules under the hash, a frozen sentence he decided and one a drafter guessed look the same. Each such reading should reach him before the freeze, since after it they bind alike.
- **The purpose lines.** "Lie exposed" and "Protects" are how section 1 tests every rule. Outside the hash they can be changed without a new specification, and they are what a reader uses when a rule is unclear. Inside it, a typo in one is a new specification. Which they are should be chosen, not fall out.
- **The stated costs.** Section 7 is where a signer is told "Bound by an update one did not sign". It is not a rule, so it goes. It is also the only place those warnings are written. A companion nobody must read can soften over time.
- **The holes.** Section 6 lists values "the grammar rules depend on and this draft does not fix". A hashed rule that depends on an unfixed value should say so in the hashed text, or two honest verifiers differ with nothing to tell them why.

---

## 6. The admission test

As the brief gives it: "part of the shared language every act is written in, or a guarantee no module may be able to break". All reasoned.

| | What stays in the core | Does it pass |
|---|---|---|
| **1. Three lines cut back** | nothing yet: three questions reopened | Not a test of the core. But "no stranger's Terms rule a work" is a guarantee no module may break, so the reopened "bound" has to be answered in the core, in whichever layer. |
| **2. The two gates** | an update replaces where the original's condition answers valid | Passes, as the guarantee of G5.1(c). The second sentence (the new version's `in_force` and "its own later life") does not yet say what a verifier answers; a field that asks nothing would fail the first limb. |
| **3. A way out** | a leaving act; an exit by default that Terms can switch off | The act passes, as language. The exit itself, as decided, is not "a guarantee no module may be able to break", since Terms may switch it off. What can be such a guarantee is narrower: nobody is kept in but by a sentence they signed, which a verifier can show with no cMIP; and the list of 1.9. If the switch is a cMIP's, it fails. |
| **4. Unclear means unchecked** | G9 applied to people | Passes, if "does this assent count?" is the grammar's own three-way answer. If a cMIP may count a doubted assent and answer valid (2.5), a module breaks it. |
| **5. Crossing** | nothing new | Passes by adding nothing. The line's "ends" is not a word MOR 1 has. |
| **6. Two threads** | the agreement's thread in Agreements; one ask of the layer below | Both are language. The ask ("a key change continues the signer's line") is a guarantee and belongs where keys are. Missing: what a lower-layer fork or a voided act may do to an assent (1.4). |
| **7. One freeze** | a way of working, not a rule | Not applicable. Its consequence: rules with nothing built under them are frozen as reasoned. |
| **8. Three rules** | the receiver, the call, the buyer's leg, the contest, the consent to data; one sentence that Terms for an envelope need its holder | Pass. The report words pass into the MICS as language. Two guarantees must be carried whole to their new homes: who may tie, and who may say unanswered. The holder test cannot leave Agreements entirely (section 5). |
| **9. The place** | a field, and one sentence | The field passes, as language. The sentence passes as language too: it stops each reader choosing their own anchoring. It is not a guarantee no module can break: it hands "latest" to a relay. The sentence that left (two answers of one place that contradict: unchecked) *is* such a guarantee, and is G9's kind. The cut went one sentence too deep. |
| **10. Only rules hashed** | the rules | Passes; it is the test applied to the file. |
| **11. Vouchers** | nothing; not core | Not applicable. It needs from the core two things still open: a filling that passes on (P7), and what leaving does to a promise held by people not yet there. |

---

## 7. Ranked by harm

1. **Leaving read as an assent taken back** (1.1): one person ends the Terms for all.
2. **The hand that leaves while money arrives** (1.2): money taken, record names nobody.
3. **A relay that does not show a leaving, or is gone** (sections 3 and 4): kept in with no Terms saying so; an agreement that can neither move nor be left.
4. **Fork or key instead of leaving** (1.4): an exit backwards, chosen later, with a freeze meanwhile.
5. **The lock arriving by a later update, or through a group** (1.3): decision 2 undoing decision 3.
6. **The standing freeze from 3 and 4 together** (section 3), and the open option (2.1).
7. **The baker read as "a party" and "current"** (section 3): a thief's Terms count; a sale undoes earlier agreements.
8. **A party-run place choosing winners** (section 4).
9. **Report reading moved without "who may tie" and "who may say unanswered"** (section 5).
10. **Expulsion signed as a leaving; the leaver keeping powers; the run for the door** (1.6 to 1.8).

## 8. Questions for Nobody, allegedly

In the order I would ask them, one at a time. None is mine to answer.

1. When someone leaves, do the Terms stay in force for the others exactly as they were?
2. Does a person named as receiver stay answerable for what is paid under the version that names them, after leaving?
3. Must "these Terms keep you in" be readable with no cMIP?
4. Can an update you did not sign close your way out?
5. Does a leaving count from the act itself, whatever a named place shows?
6. May Terms close the way out and also be locked, so that there is none, for ever?
7. Is Carla's doubt allowed to last for ever, and is it shown with her name?
8. In "Agreed for the first": is it the holder at the act cited, and must that holder be bound, or only named?

**Where I may be wrong.** I read none of the earlier exchanges on ending and withdrawing, so some of section 1 may already be answered in his words. I did not read the encoding, so 2.2 turns on something I do not know. I read "It does" one way; he knows what he meant. And every attack here is reasoned from the text: a verifier might already refuse some of them, and none was tried.

Test identities only; no server address, onion address or key appears here.
