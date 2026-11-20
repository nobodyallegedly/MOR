# The task list, redone small

*Fable, 11 November 2026. Input: F441 on `claude/lead-records-2`, all of it; the stranger's `agreement-tasks.md` and `agreement-grammar.md`; my `fable-task-list.md` (pull request 137), `fable-after-the-task-list.md` (138) and `fable-witness-attack.md` (139, written an hour before this and relied on here); Development 12's task table; Agreements 24, of which I read the openings of every rule and, whole, rules 7, 10, 15 to 44, 50 to 54, 73 to 80, section 10 and the tasks; `core/vectors/verdicts.json`, the 269 Agreements cases by question and rule. The findings are named from the two logs, searched by title and phrase. Read, not run. A recommendation; nothing here is decided.*

## In plain words

Nobody, allegedly decided: "I think more tasks means less defining for each one. And clearer mapping for cMIPs." This list follows that. Where pull request 137 had one split task doing six jobs, this has six tasks doing one job each, and one founding cMIP may fill all six on day one, so nothing that works today stops working.

Three things came out of redoing it.

1. **There are two kinds of socket, not one.** A task is a question a rule answers: any verifier runs it and gets the same answer. A role is a named identity whose signed statement is trusted for one thing: a witness, or a hand. Draft 24 mixes them. Separated, the list of tasks gets longer and each gets shorter, and the list of roles is seven names.
2. **Run on every family of rules, the two-question test removes little from the core and moves a good deal.** Almost every family guards a lie that signed, ordered text cannot expose. What leaves is description. What moves to cMIPs is the publishing model and the substance of promises, as F441 already decided.
3. **The negotiation record is the odd one.** In substance it is only text with receipts. But it cannot leave as a cMIP, because of a rule written against a recorded attack. Section 2 says why, and what the choice is.

## 1. The list

**Socket kinds.** *Rule*: a specification any verifier runs on the data named; no one's word. *Witness*: a named identity's signed statement about what it saw or found. *Hand*: a named identity that receives in its own name. What depends on a mind (whether someone understood, was free, was able) is a stated cost and has no task.

### 1.1 Tasks: questions a rule answers

Numbers 17 and above are suggestions. Tasks 1 to 7 and 11 are other MIRs' and unchanged.

| # | Task | The one question | Accepts | Produces | Declaration owed | Stranger's tasks | From draft 24 |
|---|---|---|---|---|---|---|---|
| 8 | Shares off the top | How much of this payment goes to each receiver the publication names, before the owners' line? | the amount received; the plan's parameters | an amount for each named receiver and the remainder for the stake's line, summing exactly; or unknown | the most the plan may take before the owners' line | Divide | rule 15's order of partners; rule 28's fee entries and when each applies; recoupment and every other shape |
| 17 | Receiver for this payment | Which named service receives this payment? | the services the publication names; the attempts made | one of them, never another | who receives, and who next if it fails | Hold | rule 17; publication fields 11 and 12; rule 31's backup sentence |
| 18 | Role evidence | Has this role been filled, and by whom? | a role of the plan; acts offered as evidence; the payer's claim | filled by an identity, unfilled, or unknown | who may earn the role, on whose word | Perform, Inspect | rule 22, nearly whole; plan key 3 |
| 19 | Metric | What part of a metric share is each identity's? | the measurer's signed records; the identities the plan pays | a part for each, or unknown | what is measured, by whom | Measure | rules 29 and 30's metric sentences |
| 20 | Split due | Is a split, or a payout, due yet? | the plan's timing parameters; the receipts; a point on the time reference | due, not yet, or unknown | how long the service may hold money | Due, Wait | rule 26; rule 24's minimums; rule 16's "how long it may hold money" |
| 21 | Payout fee | How much of this payout may its rail fee take? | the plan's fee parameters; the payout's receipt | within the cap, or the shortfall | who bears the fee, up to how much | Divide | rule 25 |
| 9 | Condition | Is this condition met? | a condition and the acts it refers to | true, false, pending, unknown | what makes the obligation due, as who decides | Due, Perform | as now, scoped to obligations (S7r's F437.3) |
| 10 | Time reference | Is this act before or after this point? | a point and an act | before, after, undetermined | none | Order, Due, Wait | as now |
| 12 | Grant limits | Is this act within the grant's limits? | a grant and an act under it | within, or not | what the grantee may do, up to how much, until when | Scope | as now |
| 13 | Work claims | as now | as now | as now | none | Fix | as now |
| 14 | Absence proof | Is this party's absence shown? | as now | accepted, refused, unknown | which acts break absence, for how long, on which reference | Alive, Wait | as now |
| 15 | Termination terms | Does this terminating act count? | as now | met, not yet met, unknown | who may end this, alone or not, and from when | End, Leave | as now |
| 16 | Terms reading (the signer's client chooses) | What do these terms do? | terms or an offer, and the declarations above | facts, never forecasts | none: it shows the others' | Align | F441.1's family |
| 22 | Delivery proof | Does this proof show the delivery? | what was sold in a proven-delivery form; the proof | proven, not proven, unknown | none | Perform | today's checker, "not a task" |
| 23 | What was promised | What are the parts of this promise? | a publication's words and parameters for a vow | its parts: quantities, seats, kinds, points | what the buyer is owed, in parts | Fix, Inspect | rule 13's list of substance |
| 24 | Owed back on a part | What is owed back when a part fails? | the parts; the state of each (pending, confirmed, contested) | an amount for each failed part | what comes back, and to whom | End, Divide | a bundle's partial refund; publication field 8's terms |
| 25 | Collective control | Which power does this act or clone need? | as rule 99 | as rule 99, in its format | what can be decided without you, and by whom; whether your share may be issued against without your signature | Decide, Count | as rule 99 (a hook today, numbered here) |

**One founding cMIP may fill several.** A cMIP lists the tasks it fills. The founding split cMIP fills 8, 17, 18, 19, 20 and 21 together and carries today's model unchanged; a later one may fill 19 alone. That is the "clearer mapping": six sockets, one plug on day one, six markets afterwards.

### 1.2 Roles: identities the terms name

A role is not a task. It is a party everyone signs. What it signs has a format; where the format is not the core's, a task or Module above supplies it.

| Role | Kind | Trusted for | What it signs | Bound by |
|---|---|---|---|---|
| Keeper | witness | the order in which it recorded acts | a keeper record (the core's format) | rules 36 to 44; `fable-witness-attack.md`, section 5, part 4 |
| Arbitrator or verifier | witness | a finding on content | an answer under the condition cMIP (task 9) | rules 35 and 44 |
| Abandonment authority | witness | that a party is gone | a declaration (the core's format) | rules 85 to 89; task 14 where named |
| Measurer | witness | a count | a record (a Module's format, under task 19) | never the split service, never one it pays |
| Helper (a relay, a service) | witness | that it delivered or was used | a record (a Module's format, under task 18) | never the split service or the payee (F75) |
| Split service | hand | to pay as the plan computes | a receipt, a split | receives in its own name; never signs for those it pays (F129, F130, F235) |
| Custodian of a key share | hand | to release a share as the clause says | a rotation, with the others | rule 59 |

The conversion service is Money's hand, unchanged.

### 1.3 The stranger's 49, and where each is answered

- **By the layers, no task:** Fix (Text, terms), Identify (Identity), Commit and Exchange (signature acts, sealed delivery), Order (Envelopes), Acknowledge (Money's receipt; an acknowledgement), Record (sequences), Conceal and Reveal (Envelopes).
- **By the core of Agreements, as language or guarantee:** Title, Sum, Transfer (rules 8 to 10, on the seller's own line), Admit and Bind (a clone and the newcomer's signature), Authorise and Name (grants; an act naming whom it is for), Show and Notify (sealed to every member; a split delivered to every holder), Current and Whole (the line), Succeed, Recover (the key grammar), Raise (contest), Hear, Judge, Final (the chain of judgment), Complete, Amend, End, Leave.
- **By a task:** Hold (17), Divide (8, 21), Perform (9, 18, 22), Inspect (18, 23), Measure (19), Due and Wait (10, 20), Scope (12), Decide and Count (25), Alive (14), Align (16, in part).
- **Properties, not tasks:** Keep, Check.
- **Stated costs:** Able, Align, Free.
- **Answered nowhere in the five MIRs:** Secure (a pledge or a guarantor: the words do not occur), a secret Count, and Enforce. Enforce is rule 32's stated cost. The other two are tasks someone may want; I name them and propose nothing.

## 2. The two-question test, family by family

Question 1: is there a lie here that signed, ordered text cannot already expose? Question 2: does catching it hurt someone who did not choose the rule? No to the first: only text, it leaves. Yes to the first and no to the second: a task for a cMIP. Yes to both: the core's.

### The negotiation record first (rule 52, type 18)

The lies it catches: "I never received your message"; "that is not the whole thread"; and a message its author later disowns by a rotation.

**Question 1: no, in substance.** Text acts that reply to one another, with a signed receipt of the last one, expose all three.

**But it cannot leave the way F441.3 lets things leave.** The receipt is an acknowledgement, and Envelopes rule 18 says that "every act of a cMIP or Module MUST NOT carry `acks`", and a text act likewise. That rule is F110's: a like must never become testimony that rescues a thief's act. F118 then made the negotiation message an Agreements type for exactly this reason, and set aside "messages naming earlier ones as references (a disowned message would become void, not disputed)". So:

- a negotiation cMIP cannot reproduce it, because its acts may not acknowledge;
- text acts with Identity's witness act (type 15) could, at two costs: a witness act is public, so anyone sees that a party relies on some act; and type 18 would be removed, which is a byte that moves, against F441's "no byte of any format moves";
- or it stays: a format and four sentences, with no verdict of Agreements reading it. No published case in `verdicts.json` names it.

**My view:** it stays, shrunk to its format. It fails the test and is still the cheapest safe thing. This is the one place where the test and a recorded attack point opposite ways, and it is for Nobody, allegedly.

### Every other family

| Family (rules) | The lie | Q1 | Q2 | Result | Written for |
|---|---|---|---|---|---|
| Making an agreement (1, 2, 3, 6) | "You signed this." | no: a signature is the exposure | n/a | the core's, as language, short | F74 |
| What you sign is what you saw (4) | hidden characters | yes | yes | one sentence of client conformance stays (F441.1) | Text's floor |
| Positions (5) | none | no | n/a | leaves: a definition nothing reads | none found |
| Claims and priority (7) | "I made it first." | no: priority is "shown; it changes no act's validity" | n/a | one sentence stays; the rest is description | F363 |
| Stakes, transfers (8, 9, 10) | "It is mine to sell"; sold twice; parts over the whole | yes | yes: the buyer | the core's | F38, F73, F150, F165, F224, F266 |
| Publications and the purchase (11, 12) | "That was not my price"; "paid for nothing" | yes | yes: the buyer chose a price, not a cMIP | the core's grammar; the proof checker to task 22 | F227, F386, F391 |
| Vows (13) | "I kept the promise." | yes | no, for the substance | state of each sale stays; substance to tasks 23 and 24 | F237, F240, F252, F264 |
| A sale outside the claim's ownership (14) | "I own this." | not catchable | n/a | shown, never judged: two sentences stay | F247, F284, F285 |
| Clones and marks (45, 46) | "The change was agreed." | yes | yes: the party who did not sign | the core's | F71, F104 |
| Termination | "You may not leave"; "I ended it." | yes | defaults yes; terms no | defaults the core's; terms task 15 | F436, items 7 to 10 |
| Moving off a cMIP (49) | none | no | n/a | leaves: it points at Development rule 12 | none found |
| Atomic, failure attribution (50, 51) | none | no | n/a | leave: descriptions of Money | none found |
| Disclosure by choice (53) | none | no | n/a | leaves: it is Envelopes' | none found |
| Standing and contests (54) | "Nobody objected." | partly: a contest is text, but whose contest sets a sale's state is a verdict | yes | the core's, small | F69, F240, F386 |
| A collective, done, two chains (56 to 58, 72) | "The group decided"; "you were told." | yes | yes: the absent member | the core's | F109, F142, F156 |
| Key grammar (59) | the key held hostage | yes | yes | the core's: the way out | F77, F96 |
| Counting a power (65) | "We had the votes." | yes | the count itself yes; which power, no | counting the core's; which power, task 25 | F420, F425 |
| Grants (73, 74) | "I act for her"; "within my powers." | yes | reach yes; limits no | the core's; limits task 12 | F129, F320 |
| A grant's end (76 to 80) | "I am still authorised." | yes | yes: the counterparty | the core's, said once with the line | F359, F365 |
| Keepers (36 to 44) | "It was signed before the theft." | yes | yes | the core's | F58, F363, F364, F375 |
| The line (section 10) | "That was done before I left." | yes | yes | the core's | F109, F302, F304 |
| Forks of records (90) | two versions in force | yes | yes | the core's | F121 |
| Legible money: the guarantees (15, 16, 20, 21, 23, 27, 30) | money gone; paid to another | yes | yes: the voiceless holder, the payer | the core's | F64, F123, F129, F235 |
| Legible money: the model (17, 22, 24 to 26, 28, 29) | "the relay earned it"; "the metric says" | yes | no: every party signs the plan | tasks 8, 17 to 21 | F50, F75, F211, F213, F214, F218, F249, F250, F271 |
| Legible money: descriptions (18, 19, 32) | none | no | n/a | leave, save rule 32's stated cost | none |
| No stake reduced without its holder (48) | "You agreed to less." | yes | yes | the core's | F270, F282, F423 |
| Members, leaving (69, 70, 71) | "You cannot go." | yes | yes | the core's: the way out | F195 |
| Succession (81 to 84) | "I am his heir." | yes | the language yes; who died, a witness | the core's language; the authority a role | F49, F279, F305 |
| How a collective ends (91, 92) | "We owe nothing." | yes | yes: the creditor | the core's | F143, F262, F303, F331 |
| A broken collective (93) | a key moved against the agreement | yes | yes | the core's | F185 |
| Public domain (55) | "It was never released." | yes | unclear | the act the core's; a release at a future point, see section 6 | F310 |
| The last resort, the judicial tier, deals (98, 67, 47) | a majority picks its judge | yes | yes | the core's | F121, F422 |
| Layers, voices covered (60, 61) | "Nobody could act." | yes | yes | the core's | F103, F105, F402 |
| Abandonment (85 to 89) | "He is gone"; "I was here." | yes | the outcomes yes; the proof no | outcomes the core's; proof task 14; the authority a role | F105, F166, F279, F313 |
| Time and the chain of judgment (33, 35) | "It was late"; a dead judge | yes | yes | the core's | F246, F358, F364 |
| Conditions (34) | "It is not due." | yes | no | task 9 | S7r's F437.3 |
| Numbers kept as history (62 to 68, 94 to 97) | none | n/a | n/a | out by F441.2 | |

**What fails the first question and leaves:** rules 5, 49, 50, 51, 53, 18, 19, the prose of 32, the descriptive parts of 7 and 14. None carries a verdict that I found, and none was written against an attack I found.

**What fails the second and becomes a task:** the publishing model, a vow's substance, the proof checker, termination terms, absence proof, grant limits, which power an act needs.

**No recorded attack is let back in** on one condition per family: the finding named beside it is read against the new sentence when it is written. The inventory session is where that happens; this table is its index.

## 3. What the core keeps

One sentence each.

1. A party is bound only by its own signature on the exact terms.
2. Terms change only by a new version whose mark says truthfully which powers its changes need and who met them.
3. A deal changes only with every party whose voice remains, save a termination its terms or its default allow.
4. A stake is held, moved and sold on its holder's own line, once, and an over-sale confers nothing and is owed back.
5. No stake moves, shrinks or is paid less without its holder, save by succession, the declared outcomes of absence, and an issuance under a rule that holder accepted.
6. A payment naming a counted price tag is a purchase under one version, and never depends on any cMIP above.
7. What is paid for nothing is owed back to the payer the payment names.
8. Each sale of a promise is pending, confirmed or contested, by those who signed onto it, and a contest voids nothing.
9. A split sums exactly; one receipt, one split, by the one who received.
10. The stake's line goes to its holders alone, by their shares, layer by layer.
11. Only the signed are paid, and money is received only by a service the publication names.
12. A hand receives in its own name and never signs for those it pays.
13. For a collective, an act binds only once every member can read it and it is on the collective's chain.
14. Before and after are judged on a line: by what the line cites, by a named keeper's order, by a clock, or by a keeper's order with a clock on both sides; and by nothing else.
15. What others relied on stands: what a line or a named keeper placed stays placed.
16. A member can always leave alone; a key grammar always leaves a way to rotate; a collective can always be ended or rolled back.
17. The judges are one set, signed by everyone, changed only by everyone, and a judge that fails is replaced by the one already signed.
18. What a verifier cannot tell it answers unknown, never valid and never void.

Sentences 12 and 14 are new wording from `fable-witness-attack.md`; the rest are pull request 137's ten and draft 24's own, compressed.

## 4. The vectors

Of the 269 Agreements cases in `verdicts.json`:

| Cases | Today | Moves to the founding cMIP as filler of |
|---|---|---|
| "split judged": a relay's role share evidenced, and not; a delivery record for the object paid for, and for another (4) | rule 22 | task 18, role evidence |
| "split judged": a metric payout to a holder the owners' line pays nothing; a measurer that is the split service (2) | rules 29, 30 | task 19, metric |
| "purchase": a payment to a backup, receipted in the backup's own name (1) | rule 17 | task 17, receiver |
| "split": 9.1, its split after the complete transfer (1) | rules 10, 15 | shared: the line to the holders is the core's; what is left after the label's part is task 8's |

**Stay, 261**, as in pull request 137: every deal, collective, grant, keeper, record, closing, fork and work-owners case; the 15 "control answer" and 15 "termination" cases, which read an answer in the core's format; the 5 "deadline" cases; the vows; the contests.

**In neither: none**, on pull request 137's two conditions (the publication's list of parties stays readable by the core; the first service named stays the receiver a reader without the cMIP assumes).

Tasks 20, 21, 23 and 24 have no published case today. The Rust tests beyond `verdicts.json` are not mapped here.

## 5. The declarations, together

F441's first gate allows one client sentence: before a signature, the client shows what its terms-reading cMIP produces. For the declarations not to grow back into the family they replaced, each must be data in one fixed shape, produced by rule and the same for everyone:

> **who** · may, must or never · **what** · up to **how much** · until or after **which point**, on **which reference**

| Task | Its declaration, in that shape |
|---|---|
| 8 | the plan · may · take before the owners' line · at most N in a million |
| 17 | service A · must · receive every payment · B only where A fails |
| 18 | whoever shows E · may · earn role R · up to N in a million |
| 19 | measurer M · must · sign what metric X divides · over N in a million |
| 20 | the service · may · hold what it received · until P on reference T |
| 21 | each receiver · may · bear its payout's fee · up to F, or no cap |
| 9 | judge J · must · find C · before this is owed |
| 12 | grantee G · may · do K in your name · up to L, until E |
| 14 | authority A · may · declare you absent · after D on reference T without one of these acts |
| 15 | party X · may · end this alone · from P; or never without Y |
| 24 | the seller's side · must · pay back a failed part · N of the price |
| 25 | power W · may · decide K without you; issue against your share · yes or no, by whom |

Three rules keep it small. A cMIP that cannot state its effect in this shape declares "not stated", and the client shows that. A declaration is an answer of the task, checked like any answer, never a client's own warning. And no declaration is ever a condition of a way-out act (F441.1).

## 6. My view

**The list.** I think this is the shape Nobody, allegedly asked for: each task one question and one kind of answer, each cMIP knowing which socket it fills, and the trusted parties named apart from the rules. The core side shrinks to eighteen sentences of guarantee plus the grammar.

**Where the line is still uncertain,** most important first:

1. **"No byte moves" against new task numbers.** F441 says no byte of any format moves; F441.3 moves the publishing model out, which moves the plan's and the payout's bytes, as pull request 137 said. Six split tasks make it more visible. I kept number 8 for the plan's arithmetic so that a publication's field 9 keeps its meaning. Development rule 6 says "A successor protocol may add tasks with new numbers; the numbers here never change", so new numbers are free before the freeze and closed after it: if this list is wanted, it is wanted now. The bytes are for the lead to check against the formats.
2. **The negotiation record** (section 2).
3. **The open verdict of pull request 139**: whether a split service's own claim with the rail's proof shows a payout paid. Tasks 20 and 21 are judged at that moment.
4. **Task 9 holds a rule and a witness.** "An arbitrator's answer is an act of the condition cMIP." By the rule of this list they are two: the rule that evaluates, and the finding an arbitrator signs. I left them together because every agreement names one condition cMIP today and the finding's format is its business. It is the least clean row.
5. **Task 25 answers three questions** (which power a change needs; who may do an act alone; how holders consent together). Rule 99 already gives them three answer shapes under one named model. Splitting them would change terms field 35. I would not, before the freeze.
6. **A release at a future point** (rule 55): a key delivered later by a named identity is a promise and a hand of a key. It may be a vow under task 23. I have not read enough of rule 55 to say.
7. **Task 21 may be too small.** It is one question asked at a different moment from task 8, which is why it is apart. If it reads as noise, it folds into 8.

## What I read and what I reason

Read: F441 whole; the stranger's two texts whole; Development's task table; the Agreements rules named at the top; the vectors' names, questions and rules. Reasoned: every "Q1" and "Q2" in section 2, which are my judgment of a family from its rules' openings and the findings named, not a sentence-by-sentence inventory; the numbers 17 to 25; the shape of section 5. "None found" means not found by searching the logs' titles and phrases. The rules of Agreements 24 that I read only by their openings are 1 to 6, 11 to 14, 45 to 49, 55 to 61, 65, 67, 69 to 72, 81 to 93, 98 and 99: a verdict hiding deeper in one of them is not weighed here.
