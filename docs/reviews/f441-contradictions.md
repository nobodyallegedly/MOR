# F441, checked against itself

*11 November 2026, from main at `00cfa09`. Read: F441 in `docs/findings/MOR-findings-log-round-2.md`, from its heading to the heading of F443, and the README of `docs/agreements-marking/` for its labels (decision codes such as TRAVEL, SIGNED, STAYS; open choices O-n; pulls P-n). Not read, by instruction: draft 24, the inventory rows, the reviews. A contradiction check, not a decision: nothing here is decided, and no text, code or vector was changed.*

## In plain words

F441 records some forty decisions taken one at a time, and a handful of settlements by the MOR lead. Each one reads well alone. This review asks whether the writers of the new Agreements can write all of them, as they stand, in one text.

Mostly they can. But some sentences were written before later decisions and were never reworded, so they now say something the later decision undoes. A few later decisions also reach further than the question they answered.

The marking pass (F443, section 4) already names eight pulls, P-1 to P-8. F441 settles P-1 (the buyer's own choices, withdrawn). P-2 (a deal "never freezes" against "never") and P-3 (preselection against duty 3) are still unreconciled in F441's own text. This review does not repeat the eight. It names them only where it finds the same pull reaching further, and says so.

What it finds, in short:

1. **Seven pairs that cannot both be written as stated** (section 1). The sharpest: a member's absence choices are "in its constitution" against "never the collective's rules" (1.1); "a voiceless party keeps its stake and its pay" against an absence outcome that moves the stake (1.2); the lead's wording of R-92 ("a later version... binding it only if it signs") against what a collective is (1.3); the core checks "that the holder signed the clause" against choices that travel to a buyer or successor who signed nothing (1.4).
2. **Three places where the core shapes what a cMIP produces** (section 2), the largest being the list of what "stays" may mean.
3. **Four ways the way out can hang on a module, a missing signature or an unknown** (section 3). The largest: the "unknown never blocks" settlement covers leaving, but not an absence declaration, though R-92 calls absence part of the way out.
4. **Three stated costs that break a guarantee stated elsewhere** (section 4).
5. **Eight words used in two senses** (section 5): stays, voice, party, constitution, absence, default, succession, terms.
6. **Nine settlements under delegation that read as principle** (section 6), among them "Nothing in MOR is updated", the lead's wording of R-92, the closed world, and sending "a payload read before signing is the one signed" to non-binding companion material.

How sure: each finding says *sure*, *fairly sure* or *unsure*. *Sure* means the two sentences cannot both be written as they stand, whatever the intention. *Fairly sure* means they collide on the most natural reading and one sentence would settle it. *Unsure* means a reading exists under which there is no collision, but the writers would have to choose it.

---

## 1. Pairs that pull

### 1.1 Where a member's absence choices live: "in its constitution" against "never the collective's rules"

**Plain words.** One sentence puts a collective member's absence rules inside the constitution. A later decision says they are the member's own and never the collective's. If they are in the constitution, they are the collective's rules, so they stop binding the day the member leaves (R-206), and the constitution's change rule can rewrite them without the member.

**Precisely.**
- The lead's reading, confirmed: "'everywhere it can exist' reaches every place a named identity can vanish, not only a deal's parties: **a collective's members (in its constitution)**".
- Decided after pull request 144: "**a holder's absence choices are its own terms**; they travel with its stake when it leaves, is sold or is succeeded, and **are never the collective's rules**".
- With R-206: "where it says nothing, they stop binding it the day the holder leaves", and the lead's wording: "'constitution' means only the collective's own signed founding rules".

**Case.** A member signs a constitution whose text includes its absence clause ("two members may declare me absent after a year"). The member leaves; the constitution says nothing on leavers. A year later two members declare it absent.
- *Reading of "in its constitution":* the clause is a rule of the constitution, it stopped binding the leaver; the declaration counts for nothing, and the leaver can never be declared absent (the failure F313 was written against, which TRAVEL was meant to close).
- *Reading of TRAVEL:* the clause is the member's own terms; it travelled with the stake; the declaration counts.

A second case: while the member is still in, the constitution is changed by its own change rule, without the member, to say "any one member may declare another absent". By "in its constitution", that binds the member (the constitution changes only by its own change rule); by TRAVEL, it does not.

**Related.** P-4 asks which governs a member's *answer*; this asks where the answer is *written*, which decides R-206's and the change rule's reach over it. NEVER ("a collective's constitution may refuse 'never'") is a constitution limiting the member's own terms, and is consistent with either reading.

**How sure:** sure that the two phrases cannot both stand; fairly sure TRAVEL was meant to replace the parenthesis.

### 1.2 "A voiceless party keeps its stake and its pay" against an absence outcome that moves it

**Plain words.** R-43, decided first, promises that a party who loses its voice keeps its stake and its pay. R-238, decided later the same day, lets a party choose that its stake moves to others, or that its pay goes to others meanwhile, once it is declared absent. Both were decided; only one wording can be true without a qualifier.

**Precisely.**
- R-43: "A voiceless party **keeps its stake and its pay: nothing pays it less without it** (R-92, R-206)."
- R-238: "**the stake moves** to named identities in named shares, with or without the voice", and "the stake stays (its pay ... **paid meanwhile to named identities**)".

**Case.** A party chose "moves to my co-party". It is declared absent under its own clause. By R-43 as written, it keeps its stake; by R-238, the stake moves. With NOSUSP ("Absence, once triggered ... is final") there is no route back.

Each side's reading: R-43 says the stake is untouchable once the voice is gone; R-238 says the party's own signed clause moved it, which R-92's principle ("as terms its holder signed say") allows. The likely intent is R-238 with R-43 qualified ("except as its own absence outcome says"), but R-43's sentence as written must change.

**How sure:** sure on the wording; the substance is probably settled by R-92.

### 1.3 The lead's wording of R-92 against what a collective is

**Plain words.** The lead settled that the terms binding a holder are the version it signed, and that a later version binds it only if it signs. That is a deal's rule. A collective exists precisely because people can be bound by versions they did not sign. Written generally, the sentence abolishes the collective's change rule over shares; written only for deals, it leaves R-92 silent on collectives.

**Precisely.**
- SIGNED (lead): "the terms a holder signed are the version its own signature, or the transfer it completed, names; **a later version is a new rule, binding it only if it signs**."
- Fable's test, adopted with R-206: a collective's rule is one that "exists because someone can be bound without signing"; R-206: "Whether a collective's rules still bind a leaver's stake is the collective's constitution's to say"; and "the constitution changes only by its own change rule".
- G3's guarantee, "no share shrinks without its holder".

**Case.** A collective's constitution says its share rules bind leavers. After a member leaves, the constitution is changed by its own rule to add a recoup schedule that reduces that stake.
- *SIGNED:* a later version the leaver did not sign; it changes nothing.
- *R-206:* the constitution said its rules still bind the leaver's stake; it applies.

The same collision exists for a current member who voted against a share-rule change.

**Related.** This is P-5 (R-92 against R-206) made sharper. P-5 asks whether a rule the leaver *signed* still applies. SIGNED reaches every *later* version, and so every share change a collective makes by its change rule. It is also in section 6: a settlement on wording that decides what binds whom.

**How sure:** sure that the sentence cannot be written in the shared part as stated; fairly sure it was meant for deals only.

### 1.4 "The core checks ... that the holder signed the clause" against choices that travel

**Plain words.** R-238 gives the core one check on an absence outcome: did the holder sign the clause that produced it? TRAVEL then sends a seller's absence clause to the buyer, and a predecessor's to the successor. The buyer and the successor never signed that clause.

**Precisely.**
- R-238: "The core checks the sum and **that the holder signed the clause that produced it**."
- TRAVEL: absence choices "travel with its stake when it leaves, **is sold or is succeeded**".
- SIGNED (lead): the version "its own signature, **or the transfer it completed**, names".
- R-238 again: "A deal completes only when each party **has chosen** its absence outcome"; duty 3: "**the person picks**".

**Case.** A sells its whole stake to B. The seller's clause says "my brother may declare me absent; my stake moves to my brother". B is later declared absent by A's brother.
- *R-238's check:* the holder (B) did not sign the clause; the outcome is invalid.
- *TRAVEL with SIGNED:* B's completed transfer names the terms, clause included; the outcome is valid, and B's stake goes to the seller's brother.

For a successor by Identity, nothing B-like was signed at all, so SIGNED's "transfer it completed" does not reach it. And in neither case did the new holder "choose" or "pick", as R-238 and duty 3 require of a party.

**Related.** P-1 was settled toward TRAVEL by withdrawing the buyer's own choices. This is what remains of it: the sentences that P-1's settlement must now reword. F443 also lists O-13 (a holder who came by no signature).

**How sure:** fairly sure. One sentence ("signed, or holds the stake by a transfer it completed or a succession, under") would settle it, but someone must decide that a buyer can be bound by a seller's choice of people.

### 1.5 "A deal never freezes on a party who is not there": wider than "never"

**Plain words.** P-2 is that R-43's promise fails for a party who answered "no one may ever declare me absent". It fails more widely: for any party whose own definition cannot be met, and for any vanished party whose stake "stays" and whom a change would pay less.

**Precisely.**
- R-43: "**A deal never freezes on a party who is not there**"; "nothing pays it less without it".
- T14: "Each party states who may declare it absent and how"; NOSUSP: "a declaration meeting the party's own definition is correct by that definition", and so a declaration not meeting it is not.
- R-238: "the core sets no default".

**Cases.**
- *The declarer is gone.* A party named one person who may declare it absent. That person vanishes first. The party then vanishes. No one can declare it; the deal freezes, though the party is not there. (Whether the declarer's own absence passes its power to someone is not said: the declarer is a role "the terms name" only on one reading of ONCE.)
- *The definition never triggers.* "Declared after a contest window" where the window cannot be run by anyone left.
- *A change that pays the absent holder less.* An absent party whose outcome is "stays" has lost its voice but, by R-43, "nothing pays it less without it". Any change that pays it less (a new party joining and diluting it, for instance) needs a signature it can never give. The deal does not freeze, but every such change does, for good.

Each side's reading: R-43 promises the deal moves on; T14 and NOSUSP make the party's own definition the only route, with no default. F443 has the last case as O-20 ("a stated cost to write?"); this review adds that, as worded, it contradicts R-43's sentence, not only adds a cost.

**How sure:** sure for the first and third cases, given R-43 as written.

### 1.6 A deal of one party against "the core sets no default" and "everywhere it can exist"

**Plain words.** A deal of one party is not asked its absence choices; its stake follows its identity's succession. That is a default set by the core, which R-238 said there would not be. And Nobody, allegedly, said absence must be defined "everywhere it can exist": a single party can vanish too.

**Precisely.**
- ONE: "a deal of one party is not asked its absence choices; with no other party nobody is left waiting, and **its stake follows its identity's own succession**."
- R-238: "**the core sets no default**".
- T14: "'absence' needs to be define[d] everywhere it can exist", read by the lead, confirmed, as "every place a named identity can vanish", including "the roles terms name (a witness, a hand, a keeper)".

**Case.** One party publishes a work through a deal naming a split service and a keeper. ONE says the party is not asked. Are the roles it names asked? "Nobody is left waiting" is not true of payers whose payments the split service holds.

Each side's reading: ONE gives a default (Identity's succession) and exempts the deal; R-238 and T14 say no default and definition everywhere. Probably ONE is meant as a stated exception, and the roles of a one-party deal are still asked; F441 says neither.

**How sure:** fairly sure that "the core sets no default" cannot be written beside ONE without "save for a deal of one party"; unsure on roles.

### 1.7 Succession as a core way out against succession as one chosen outcome

**Plain words.** Two decisions treat succession differently. R-43 and R-92 put it in the core as a way out that works even where terms say nothing. R-238 lists "to the successor" as one absence outcome among several, to be chosen. When a party has chosen "moves to my co-party" and its identity also has a successor, which wins?

**Precisely.**
- R-43: a voice is removed by "succession, its voice passing to the successor".
- R-92: "**Succession and absence stay in the core** beside it, as the way out, **which works even where the terms say nothing**."
- R-238: outcomes discussed include "to the successor of the holder's identity (Nobody, allegedly: dictated by Identity; the voice goes with it)"; "the core sets no default".
- TRAVEL: choices travel when the holder "is succeeded".

**Case.** A party's identity names a successor under Identity. The party chose "moves to my co-party" as its absence outcome. It vanishes; its successor under Identity takes over the identity, and the co-party also declares it absent.
- *R-43 / R-92:* succession passes stake and voice to the successor.
- *R-238:* the chosen outcome moves the stake to the co-party.
- *TRAVEL:* the successor inherits the clause, which can then be used against the successor.

R-92's "even where the terms say nothing" is also hard to square with absence once T14 forces every party to say something. F443's O-8 asks the same about rule 83's succession plan; at F441's level the pull is between R-92 and R-238 themselves.

**How sure:** fairly sure.

---

## 2. The core doing a cMIP's work

The working rule recorded in F441 is, in its own words, "nothing enters the core that a cMIP could carry" (R-92), and "the core defines the tasks and the guarantees, never the details a cMIP can supply" (gate 3); the brief gives it as "the core decides only where a rule sits and who must have signed it, never what a cMIP will". Gate 3 also has each task stated "with what it accepts and produces", so naming a task's output shapes is in scope. The findings below go further than shapes.

### 2.1 The list of what "stays" may mean

**Plain words.** The core is to apply two shapes, "stays" and "moves". But inside "stays", F441 lists four ways the pay is handled, and says the choice must say which. That is a cMIP's menu, written into the core.

**Precisely.** R-238: "**the stake stays** (its pay continuing to the holder's own destination, held, left owing, or paid meanwhile to named identities)"; on kept waiting: "the pay is held by a hand or left owing, **and the choice says which**". The core's two checks are "the sum and that the holder signed the clause". None of the four pay modes is checked by either. "Paid meanwhile to named identities" is also a share of pay moving to others, which the core would have to check as it checks "moves" (a sum), so it is not merely a detail.

**Case.** A task-26 cMIP offers a fifth mode: "pay into a fund the remaining parties hold jointly until a date". Is it "stays" (the stake is unchanged) or invalid (not on the list)?

**How sure:** fairly sure the parenthesis reads as a closed list; unsure whether it was meant as one.

### 2.2 The judge's lapse answered by task 26 "as a move to the next judge"

**Plain words.** The decision makes a judge's lapse an ordinary role's absence, which is good for the core. But it then says what task 26 will answer for a judge: a move to the next one in the chain. That is the core naming what the cMIP outputs.

**Precisely.** JUDGE: "judged by task 14 and **answered by task 26 as a move to the next judge the chain names**; the chain of judgment is one way of filling 'moves to'". Beside it, the guarantee: "a failed judge is replaced only by one already signed, in the order signed". The guarantee is the core's; the "answered as" is task 26's. A role's outcome may also "stay (vacant, or held)" (ONCE) and "'stays' is always an available absence outcome" (STAYS): can a judge's place stay vacant when a chain names a next judge?

**How sure:** unsure: "one way of filling" may mean the chain is only the founding cMIP's answer. The writers should be told which.

### 2.3 "Never" makes a liveness act show nothing

**Plain words.** The lead settled what a liveness act shows for a party who answered "never". The liveness act's meaning is task 14's, or a core type (F443's O-11 is open on that). Either way the settlement decides an output before its place is decided.

**Precisely.** HAND (lead): "a party whose absence answer is 'never' makes a liveness act show nothing, a stated cost of its own choice". If the liveness act stays a core type, this is a core rule about a cMIP-free fact; if it goes to task 14's founding cMIP, the core is defining what that cMIP shows.

**How sure:** unsure; depends on O-11.

*Also checked and not found to be the core doing a cMIP's work:* T14's forcing of an answer (that is "who must have signed"); NEVER (a constitution's refusal, placed in the collective's part); D3 (a guarantee of discharge, with the proof left to each rail Module); R-92's "a verifier can apply from the signed terms, through the cMIP that names how" (a condition on where the rule sits).

---

## 3. The way out

The way out, as F441 states it in places: a member "can always leave; a leaver keeps the stake it held" (R-206); "the way out" is among the guarantees no cMIP is trusted with (gate 3); "Nothing in a reading is ever a condition of a way-out act" (gate 1); a client "never blocks or delays it" (duty 2); and UNKNOWN (lead, to confirm): "an unknown from task 15, 26 or 27 never blocks the default way out (a transfer of one's whole stake, a resignation, a default termination)".

### 3.1 An absence declaration can hang on an unknown, and UNKNOWN does not cover it

**Plain words.** R-92 calls absence part of the way out, working even where terms say nothing. But after T14 and R-238, every absence runs through the party's own task-14 proof and task-26 outcome, both supplied by cMIPs. A verifier without them answers "unknown". The lead's UNKNOWN covers leaving, selling and terminating, not a declaration. So a reader without the cMIP cannot tell whether the voice was removed, and so cannot tell who must sign every later change.

**Precisely.** R-92: "Succession and absence stay in the core beside it, **as the way out**". T14: "Each party states who may declare it absent **and how**". R-238: "redistributed among the remaining holders (**a move whose shares the cMIP computes**)"; "moves ... with or without the voice". UNKNOWN lists tasks 15, 26, 27 and three acts, not task 14 and not a declaration. Gate 3: "a reader without it shows unknown".

**Case.** Three parties. One is declared absent under a task-14 cMIP a verifier does not hold; its outcome "moves with the voice" to two named identities in shares a task-26 cMIP computes. The other two then sign a change. Valid, invalid or unknown? If unknown, R-43's "never freezes" holds only for readers holding both cMIPs.

**How sure:** sure that F441 leaves this open; whether it should be closed (a core form of proof, for example, which F443's O-10 leans against) is for Nobody, allegedly.

### 3.2 "Entering a deal never depends on a module" covers the outcome, not the proof

**Plain words.** The lead settled that "stays" needs no cMIP, "so entering a deal never depends on a module". But a party must also state its absence proof, "who may declare it absent and how". The only answer F441 makes plainly module-free is "never", and a collective may refuse "never". So in such a collective, joining depends on a task-14 module.

**Precisely.** STAYS (lead, to confirm): "'stays' is always an available absence outcome and needs no cMIP, so entering a deal never depends on a module". T14: absence proof forced. NEVER: "A collective's constitution may refuse 'no one may ever declare me absent' for any voice its constitutional change rule counts". F443's O-10 leans to sending the authority forms (one identity; a threshold) to task 14's founding cMIP.

**Case.** A collective refuses "never" for its counted voices. A new member's client holds no task-14 cMIP. It can choose "stays" but cannot state a proof. It cannot join.

**How sure:** fairly sure, unless the core keeps one module-free form of proof ("this identity may declare me absent by a signed act"), which F441 does not say.

### 3.3 In a deal, leaving may need someone else's signature

**Plain words.** In a collective, a member can always leave. F441 states no equal promise for a deal. R-43's ways out of a deal are selling the whole stake (which needs a buyer to sign) or terminating one's own place "where the terms allow". UNKNOWN speaks of "a resignation, a default termination" as if a deal party always has one.

**Precisely.** R-43: "the party's own act (transfer of its whole stake, or **termination of its own place where the terms allow**)". UNKNOWN: "the default way out (a transfer of one's whole stake, a resignation, a default termination)". R-206: "a member can always leave" (collective's part). Gate 3 lists "the way out" among the guarantees without saying what it is for a deal; termination is "defined once ... (F436.7)", which this review did not read.

**Case.** A deal's terms do not allow termination of a party's own place. No one will buy. The party cannot leave. Is that a valid deal (the terms chose it) or does the core's default termination still apply (UNKNOWN's "default termination")?

Each side's reading: R-43 makes termination depend on the terms; UNKNOWN speaks of a default that, by its name, does not.

**How sure:** unsure: F436.7 may already answer it. If it does, R-43's "where the terms allow" should say so.

### 3.4 Selling the whole stake carries the seller's absence clause to the buyer

**Plain words.** This is the way out working, but at a cost the buyer may not see: after TRAVEL, the buyer takes the seller's choice of people who may declare it absent and receive its stake (1.4). A buyer may refuse to buy on those terms, which makes the seller's way out depend on the seller's own earlier choices being acceptable to someone else.

**Precisely.** TRAVEL, with BUYER withdrawn; duty 1 shows the terms reading before a binding signature, and the transfer is one. No sentence says whether a transfer may carry new absence choices for the buyer, agreed by the remaining parties, or by no one.

**How sure:** fairly sure the cost exists; whether it is a cost to state or a rule to change is for Nobody, allegedly.

---

## 4. Costs against guarantees

### 4.1 "I chose the definition" against "voice removed only by a recognised act, never by the other parties' vote"

**Plain words.** The protection against being wrongly declared absent is now all at signing. But a party can name the other parties as those who may declare it absent. Then the other parties, together, can remove its voice and, under a "moves" outcome, take its stake, and it is final.

**Precisely.** R-43: "a voice is removed only by a recognised act, **never by the other parties' vote**". NOSUSP: "There is no wrongly declared her, there is a wrongly defined on her end"; R-43's cost reworded: "a party present when its own absence definition is met regains its voice only by a later version naming it; **it chose the definition**." G3: "no share shrinks without its holder".

**Case.** A party's clause: "the other two parties may declare me absent; my stake moves to them in equal shares". The two do so while the party is present. By R-43 the declaration is a recognised act, not a vote; in effect it is one. Under 1.1's first reading, in a collective the definition could even be written by the change rule.

Each side's reading: the guarantee holds formally (the party signed); the cost shows it holds only as well as the party's signature was informed, which is duty 1's and task 16's work, never a verifier's.

**How sure:** fairly sure this needs saying beside R-43, as a cost; it is not a contradiction once 1.1 is settled toward TRAVEL.

### 4.2 "Never" freezes others, not only its chooser

**Plain words.** The costs of "never" are stated as the chooser's own. They fall on the other parties.

**Precisely.** T14's cost: "that party's voice can never be removed, and a deal that needs it may freeze for good if it vanishes". HAND (lead): "'never' makes a liveness act show nothing, **a stated cost of its own choice**". Against R-43 ("A deal never freezes") and duty 1 (each party is shown what the person can always do). The other parties signed a deal in which one party said "never"; they are shown it only if the terms reading shows another party's choices, which duty 1 does not say.

**How sure:** fairly sure; P-2 names the R-43 side, this names the "of its own choice" wording.

### 4.3 A payload read is the one signed: sent to the companion

**Plain words.** Among the five laws the text never states, one is that what a person reads before signing is what they sign. The lead sends it to the companion, which gate 2 makes non-binding. Duty 1 and task 16 rest on it: the screen shows a reading of the terms, and the guarantee that those are the terms signed is then in no binding text.

**Precisely.** Lead, five laws: "(4) a payload read before signing is the one signed: a property of the library, companion material". Gate 2 as read: "the companion is published beside the frozen texts, hashed, **non-binding**". Duty 1: "before a signature that binds a person to terms, the client shows its terms reading". R-238's cost: a client's answer "shown before signing". L1 (F443's shorthand): "a party is bound only by its own signature on the exact terms".

**Case.** A library shows one payload and signs another. No act is invalid; no frozen rule is broken; the companion says it should not happen. Every "shown before signing" in F441 then rests on non-binding text.

**How sure:** fairly sure. It may be covered by L1 in the core; if so, law 4 is L1's library side and the writers should say where L1 sits.

*Also checked:* R-238's lost-keys cost ("a holder whose keys to its own destination are lost loses that pay") does not shrink a share; the negotiation record's cost ("I received it" with no type of its own) breaks no stated guarantee; D3's "otherwise it stays owing, visibly" against a held payout for an absent holder (R-98): the hand is never discharged while the holder is absent, which is consistent but long; worth one line beside D3.

---

## 5. Words

Each is a term F441 uses in two senses. **How sure:** sure that both senses occur; how much each matters is noted.

- **Stays.** (a) A stake's absence outcome that keeps the stake with the holder, even when its pay goes "meanwhile to named identities" (R-238); (b) a role's outcome meaning "vacant, or held" (ONCE); (c) a draft-24 verdict that "stays" (the promise). (a) and (b) are opposite: a stake that stays is occupied, a role that stays may be empty. Matters for 2.1 and 2.2.
- **Voice.** (a) A party's place among those who sign a change (R-43); (b) something that moves with a stake to named identities "in named shares, with or without the voice" (R-238), which suggests a voice attached to a stake and divisible; (c) a voice "its constitutional change rule counts" (NEVER), a collective's counting; (d) a voiceless holder's veto on anything that pays it less (R-43), which is a voice in sense (a) for one kind of change. Matters for 1.5.
- **Party** and **holder.** "A holder who is no party" exists (lead, F330 superseded by rule 85), yet ONE counts "a co-owner, a partner, a buyer of a share" as a second *party* joining. Gate 3 sends partners out of the core with the publishing model, yet a partner is here a party. Absence choices are asked of "each party" (R-238) and are "a holder's" (TRAVEL). Matters for who must choose (F443's O-14, O-16).
- **Constitution.** (a) "Only the collective's own signed founding rules" (lead, R-206); (b) the place a member's absence is defined ("in its constitution"); (c) the source of a refusal of "never". Sense (b) is the pull of 1.1.
- **Absence.** (a) A fact: "has this party vanished, and who says so?" (task 14); (b) a status: "a declaration meeting the party's own definition is correct by that definition" (NOSUSP), whether or not the party vanished; (c) "not active on MOR" while its destination still receives (R-238, on kept waiting). Under (b), "a deal never freezes on a party who is not there" (R-43) speaks of a fact the core no longer reads. Matters for 1.5.
- **Default.** "The core sets no default" (R-238); "the default way out", "a default termination" (UNKNOWN); a client that "may preselect" (R-238's cost, P-3). Matters for 3.3.
- **Succession.** (a) Identity's own succession, which a one-party deal's stake follows (ONE) and R-43 counts as a recognised act; (b) one absence outcome among others ("to the successor", R-238); (c) rule 83's plan (O-8). Matters for 1.7.
- **Terms.** (a) The agreement's signed version (SIGNED); (b) "its own terms", a holder's absence choices, which travel apart from the agreement and are "never the collective's rules" (TRAVEL). Under (a), absence choices change with each version every party signs; under (b), they belong to the holder. Matters for 1.1 and 1.4.

*Also checked:* **stake** and **share** are used near-interchangeably (gate 3 "no share shrinks"; R-43 "keeps its stake"; R-92 "a share changes"); no collision found, but the rewrite should fix one meaning for each. **Seat** does not occur in F441. **Hand** is used both as a role ("a hand gone for good", HAND) and as what is not an agent (witness attack): consistent.

---

## 6. What the lead settled that reads as principle

**In plain words.** The delegation covers mechanics. These settlements decide who is bound, what is guaranteed, or what is binding at all. Each may be right; each reads as something Nobody, allegedly, would want to say yes to. Ordered by how far they reach.

1. **SIGNED, the wording of R-92**: "a later version is a new rule, binding it only if it signs." It decides what binds a buyer (the version its transfer names) and, written generally, removes a collective's change rule over shares (1.3). F443's O-15 shows it also chooses between the transfer's named version and the one in force at the transfer. **Fairly sure** it is principle.
2. **R-168's sentence "Nothing in MOR is updated."** Offered as the reason a grant cannot revive, it reads as a law of the whole protocol, and it is not in any decision of Nobody, allegedly, in F441. If it is meant as a principle (every change is a new signed act, never an edit), it belongs among the guarantees and wants a yes; if not, it should stay a reason, in the companion. **Fairly sure.**
3. **The five laws, 1, 2 and 5, as guarantees**: order-independence, "a verifier always answers ... and judging a split never fails", and the closed world ("the core reads only ties it names"). These are probably draft 24's practice, but stating them as guarantees is new law, and the closed world in particular decides which ties among works the core will ever read. **Fairly sure.**
4. **Law 4 sent to the companion** (section 4.3), and **law 3 sent to a founding cMIP** (a publication's backup cannot be its own split service), where it binds only those who name that cMIP. Both turn a guard into something optional or non-binding. **Fairly sure.**
5. **Gate 2 as the lead read it**: stated costs stay beside their rules (so are binding text), and the companion is hashed and non-binding. F443 already carried it "for every worker" and asked that it be checked. **Fairly sure**: it decides what kind of sentence a cost is.
6. **UNKNOWN** ("an unknown ... never blocks the default way out") and **STAYS** ("'stays' is always an available absence outcome ... entering a deal never depends on a module"): both marked "to confirm" in F441, both guarantees about the way out and about entering. STAYS also says no constitution may require "moves" (F443's O-5 asks that). **Sure** they are principle; F441 already asks for confirmation.
7. **R-98, delivery narrowed to those the split pays**: rule 9's "every holder, paid or not" goes to the split service's practice. A holder paid nothing in a period is then not delivered the split it is entitled to check. That is a transparency guarantee changing for unpaid holders. **Unsure**: it may be only the code's long-standing behaviour.
8. **F330 superseded by rule 85** ("a declaration against a holder who is no party states no outcome, never outcome 0"). Choosing between two drafted rules decides a verdict. The lead also says the absence outcome replaces the question, which would make the sentence moot; the writers should be told it is moot, not law. **Unsure.**
9. **HAND's cost wording**, "a stated cost of its own choice" (4.2): it assigns a cost to the chooser that falls on others. **Unsure**: small, but costs are part of guarantees by gate 2's reading.

*Read as mechanics, not principle:* R-223 (which object a delivery record names); the nine italic sentences ("none is dropped"); "invalid" as the one word; "the formats decide where the commentary disagrees" (though in a rewrite carrying new law, "the formats decide" and "formats may change where a decision requires it" should be stated together); the hand gone for good as a role's absence; "constitution" as a wording; the test comment corrected by its keeper.

*Not decided at all, as F441 says:* the signed facts (the summary's hash not in the signature, "Not decided by Nobody, allegedly, yet"), F443's O-37.

---

## What was not done

- Draft 24, the inventory rows, the reviews and F436 were not read, by instruction. Where a finding may be answered there (3.3 by F436.7, 2.3 by O-11), it says so.
- Nothing was decided, and no text, code, vector or log entry was changed.
- F443's eight pulls are not repeated except where this review finds them reaching further (1.3 from P-5, 1.4 from P-1, 1.5 and 4.2 from P-2).
