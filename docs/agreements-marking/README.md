**Session F443.** S8b, the marking pass. The MOR lead records it in the findings log; this session does not edit the log.

**Status: done. Every row of the inventory, A-001 to A-2772, and every one of the 269 Agreements vectors is marked. Documents only: no text, code, vector or inventory row changed. Nothing here is decided: each mark rests on a decision of F441 or on draft 24 unchanged, and every mark no decision covers is listed in section 3, for Nobody, allegedly, one at a time.**

# Agreements draft 24, marked for the rewrite

*11 November 2026, branch `claude/s8b-marking-pass` from main at `b4b1c60`. Against F441 as it stands on `claude/lead-records-2` (the decisions of 10 and 11 November, all of them); the inventory of S8a (`docs/agreements-inventory/`, on main); Fable's `fable-deals-and-collectives.md` (on main) and `fable-task-list-2.md` (pull request 144), whose task numbers (8 to 27) and guarantee labels (S1 to S17, C1 to C5, D1, D2) are used throughout.*

## In plain words

Agreements is being written again from scratch, and now carries new law: draft 24 is research. Every old verdict stays, moves unchanged into a founding cMIP, or changes by a decision written in the findings log. This is the writers' checklist for that promise. For every sentence the inventory found, and for every test case, it says four things:

- **which part of the new text it belongs to**: the deal's part (it exists only because everyone signs), the collective's part (it exists because someone can be bound without signing), the shared part (everything else), or out of the frozen text;
- **what becomes of it**: it stays as a rule; it stays as language (a word, a format, a reading convention the rules are written in); it moves to the founding cMIP of a named task; it goes to the companion; or it is retired;
- **why**: the decision of F441 it rests on, or "draft 24 unchanged";
- **what it is for**: the guarantee or task of Fable's list it serves.

What it found, in short:

- **Most of draft 24 stays, and most of what stays is unchanged.** Of 2,772 rows, 2,241 stay in the frozen text (1,547 as rules, 694 as language); 1,787 rest on draft 24 unchanged. 455 rows stay but change their wording or verdict by a decision. 531 leave: 160 to founding cMIPs, 337 to the companion (159 of them freeze scenarios, to the suite), 34 retired.
- **The collective's part is the largest, the deal's the smallest.** 1,073 rows are the collective's, 1,029 shared, 139 the deal's. The deal's rows are almost all rule 47 and its forks and settlements: as Fable found, a deal is the shared part with everyone signing.
- **The decisions that move the most rows** are gate 2 (325 rows to the companion and the suite), gate 3 (170, the publishing model to founding cMIPs) and the absence decisions (ONCE 101, R-238 84, T14 62). The negotiation record retires whole (33 rows).
- **Of the 269 vectors,** 235 keep their verdict as they are, 18 keep it but must be derived again under a new rule, 4 keep it with new bytes carrying a new rule, 10 move to the founding cMIPs of tasks 17, 18, 19 and 27, 1 changes and 1 is open. Every vector whose acts hold a deal of two or more parties or a collective is re-made, since every party now states its absence choices. 25 new vectors are needed (section 2).
- **37 choices no decision covers** (section 3), from 153 rows and 15 vectors. The largest: client conformance outside the four duties (58 rows); rule 61's guard against "never" in a collective (12 rows); a judge that fails without vanishing; the succession plan beside the absence outcome.
- **Eight places where two decisions pull against each other** (section 4). The sharpest: absence choices that travel with a sold stake (TRAVEL) against the buyer making its own (BUYER); "a deal never freezes on a party who is not there" (R-43) against "never" being allowed (T14); "a client may preselect an answer" (R-238's stated cost) against "no answer is preselected" (duty 3).

## The files

| File | What it holds |
| --- | --- |
| [01-front.md](01-front.md) to [15-part-6.md](15-part-6.md) | The marks, one file per inventory file, the same ids in the same order. |
| [20-vectors.md](20-vectors.md) | The 269 Agreements vectors, marked. |
| This README | How to read the marks, the counts, the new vectors needed (section 2), the open choices (section 3), the pulls (section 4). |

## 1. How to read a mark

Each row of a marking file has the inventory's **ID**, a few opening words of its quote **to find it** in the inventory, and these columns:

**Part.** By Fable's test (`fable-deals-and-collectives.md`, section 3), *does this rule exist because someone can be bound without signing?*
- *deal*: the row exists only because every party signs (a deal changes with every party whose voice remains; a deal's forks and settlements; a deal completing only with every party's absence choices);
- *collective*: the row exists because someone can be bound without signing;
- *shared*: everything else that stays;
- *out*: the row leaves the frozen text. Its part is then not marked: it goes where its fate says.

**Fate.**
- *stays as a rule*: a guarantee, a verdict rule, a stated cost beside its rule (F441 gate 2 as the lead read it), or one of the four client duties (gate 1 amended);
- *stays as language*: a word's meaning, a field's or format's meaning, a verifier's convention; what the rules are written in. Fable's four sentences of language are marked L1 to L4 under "serves": a party is bound only by its own signature on the exact terms (L1); unknown is never rounded (L2); a verdict and its explanation never depend on the order acts arrive in (L3); the core reads only the ties it names (L4). L1 to L4 are this pass's shorthand, not Fable's labels;
- *founding cMIP, task n*: moves, unchanged unless a decision says otherwise, into the founding cMIP of that task (Fable's numbers). "Task 8" includes the split service's own practice (R-98);
- *companion*: advice, history, reasoning, retired numbers kept as history, a parameter's discussion; *companion (the suite)*: a freeze scenario, which lives only in the freeze test suite;
- *retired*: carried nowhere, by a named decision (the negotiation record; a sentence a decision replaces outright).

**Rests on.** The decision codes below, or "draft 24 unchanged". A decision is cited where it moves the row, changes what it decides, or changes its wording; where a row stays in place with a new wording, the note says how.

**Serves.** S1 to S17, C1 to C5, D1, D2 (Fable's guarantees); L1 to L4 (language, above); duty 1 to duty 4 (gate 1 amended); task n where the row defines what a task accepts or produces. A dash where none.

**Open.** O-n: the choice of section 3 this row waits on. P-n: the pull of section 4 it sits in. Where a row is open, its fate is the marker's lean, not a settled mark.

**Note.** Only where the codes do not say enough, above all where a wording or a verdict changes.

### The decisions, by code

Each code is a decision of F441, in its own words. "Lead" marks one the MOR lead settled under the delegation; "to confirm" is F441's own.

| Code | The decision, in F441's words | Rows | Vectors |
| --- | --- | --- | --- |
| `draft 24 unchanged` | the row's verdict carries over as it is; only its place changes | 1787 | 229 |
| `G1` | gate 1: client conformance's "show before signing" family leaves the core ("Yes"), for terms reading, task 16 | 43 | 0 |
| `G1A` | gate 1 amended: "I think forcing clients to behave a certain healthy way is good": the four duties | 43 | 0 |
| `G2` | gate 2: "Everything out. It's all companion material" | 325 | 0 |
| `G2L` | the lead's reading of gate 2: stated costs stay beside their rules; a parameter's value stays in the format | 86 | 0 |
| `G3` | gate 3: "the core keeps the guarantees and the task list"; the publishing model leaves | 170 | 11 |
| `G3F` | "can a cMIP bring that Law back, no?": a founding cMIP carries today's model unchanged | 110 | 10 |
| `R-43` | "every party whose voice remains" | 34 | 0 |
| `R-92` | "no list": "A share changes only as terms its holder signed say" | 40 | 6 |
| `R-98` | the split delivered to every holder and partner it pays; rule 9's wider reach to the split service's practice | 5 | 0 |
| `R-168` | "An ended grant never revives" | 26 | 0 |
| `R-206` | "Placed in the collective's part" | 34 | 1 |
| `R-223` | the delivery record "moves with role evidence to its task (18)" | 2 | 2 |
| `R-238` | "a new task, absence outcome"; "A deal completes only when each party has chosen its absence outcome; the core sets no default" | 84 | 13 |
| `T14` | "absence proof is forced as well"; "No one may ever declare me absent" is an allowed answer | 62 | 3 |
| `ONCE` | "Absence is defined once, in the shared part" | 101 | 9 |
| `LAWS` | "The five laws the text never states" | 9 | 1 |
| `ITAL` | "The nine italic sentences that decide verdicts": "none is dropped" | 13 | 1 |
| `SMALL` | "The smaller discrepancies" (the formats decide; "invalid" the one word; F330 superseded) | 27 | 3 |
| `RESEARCH` | "we will consider the previous work research": each changed or retired vector names its decision | 61 | 7 |
| `NEVER` | "'never' is a deal's answer" | 12 | 0 |
| `TRAVEL` | "a holder's absence choices are its own terms; they travel with its stake" | 36 | 8 |
| `SIGNED` | "the terms a holder signed are the version its own signature, or the transfer it completed, names" (lead, wording of R-92) | 24 | 7 |
| `ONE` | "a deal of one party is not asked its absence choices" | 8 | 1 |
| `BUYER` | a buyer "makes its own absence choices in the transfer it completes" (lead, to confirm) | 8 | 6 |
| `STAYS` | "'stays' is always an available absence outcome and needs no cMIP" (lead, to confirm) | 0 | 0 |
| `UNKNOWN` | "an unknown from task 15, 26 or 27 never blocks the default way out" (lead, to confirm) | 3 | 0 |
| `NUMBERS` | "the small tasks get their own numbers before the freeze" | 27 | 1 |
| `NEG` | "negotiation is text": rule 52 and type 18 leave the core | 33 | 0 |
| `JUDGE` | "a judge's lapse is a role's absence" | 43 | 4 |
| `HAND` | "a hand gone for good ... is a role's absence"; "never" makes a liveness act show nothing (lead) | 3 | 0 |
| `NOSUSP` | "No suspended voice. Absence, once triggered under the definition the party chose, is final." | 13 | 3 |
| `D3` | "a hand is discharged by the receiver's receipt, or by its own claim whose rail proof shows payment to a destination the receiver itself signed" | 4 | 0 |

`STAYS` is cited by no row or vector: no sentence of draft 24 says it, and it shows only in new vectors (section 2, N-6).

## 2. The vectors

**In plain words.** Most cases keep their verdict. What changes is mostly the cases' bytes: every agreement in the corpus with two or more parties gains each party's absence choices, so the corpus is re-made. A few cases move with the publishing model to founding cMIPs; the declarations of absence are derived again under the new absence task; one verdict changes.

**By verdict** (269 cases, marked one by one in [20-vectors.md](20-vectors.md)):

| Verdict | Cases | Which |
| --- | --- | --- |
| stays | 235 | all others; 10 of them rest on Identity's, the MICS's or Development's own rule (120 to 123, 130, 131, 153 and 224 to 226) |
| stays, re-derived | 18 | the lapsed judges (39 to 42, JUDGE); the succession clones (83, 84, 106 to 108, 149 to 151; O-8); the declaration of 9.3 (105); the buyer's and the successor's declarations (264, 265, 267 to 269) |
| stays, bytes re-made | 4 | the transfers 89, 90, 118, 152: the buyer states its own absence choices in the transfer it completes (BUYER, to confirm; P-1) |
| moves | 10 | the backup payment (148) to task 17; role evidence (159 to 162) to task 18; the metric (163, 164) to task 19; issuance under a holders' rule (174 to 176) to task 27 |
| changes | 1 | 266: "counts" stays; "its stake passing by succession" becomes "its stake stays or moves as its own absence outcome says" (R-238, TRAVEL) |
| open | 1 | 179, a holders' rule standing in for a holder in a control answer (O-36) |

**By part:** shared 125, collective 104, deal 30, out 10. **By decision:** see the table in section 1 (the "Vectors" column).

**Fable's section 5, checked case by case.** It holds, with these differences. The five "declaration" cases are not all changes: four keep their verdict under TRAVEL, SIGNED and BUYER, one changes (266). The five issuance cases of "record" split: two stay in the core under S2 (172, 173), three move to task 27's founding cMIP with their verdicts (174 to 176). Fable's four uncovered families are now covered by decisions of the same day (JUDGE, HAND, BUYER, and HAND again for liveness), save the judge that settles twice (42, O-7). The control answer of 179 is open (O-36).

**Vectors the decisions of 10 and 11 November need that do not exist yet** (25). Each names its decision.

- **N-1.** A deal of two parties, one of which has stated no absence proof: it does not complete (R-238, T14; D2).
- **N-2.** The same with every absence proof stated but one absence outcome missing: it does not complete (R-238; D2).
- **N-3.** A deal of one party with no absence choices: it exists (ONE).
- **N-4.** That deal's clone adding a second party, in which the first party states no absence choices: it does not complete; with both stating them, it does ("every party chooses, the first included", ONE).
- **N-5.** A party answering "no one may ever declare me absent": the deal exists; a declaration against it counts for nothing; its liveness shows nothing (T14, HAND).
- **N-6.** An absence outcome "stays", judged by a verifier holding no task-26 cMIP: judged, not unknown; the split keeps paying the holder's own destination (STAYS, to confirm).
- **N-7.** An outcome "moves" to named identities whose shares sum exactly: the clone applying it is valid; shares not summing: invalid; an outcome from a clause the holder did not sign: invalid (R-238, the core's two checks).
- **N-8.** An outcome "stays, pay meanwhile to named identities": the split pays them, the holder's stake unchanged (R-238).
- **N-9.** A party declared absent under its own definition, which then acts again: its voice stays removed; a later version naming it restores it (NOSUSP; R-43's stated cost).
- **N-10.** Three parties, one declared absent under its clause: a change signed by the other two is complete; the same change with no declaration is not; a change "voting out" the third is not (R-43; D1).
- **N-11.** A collective's founding in which a voice its constitutional change rule counts answers "never", the constitution refusing it: invalid; the same constitution not refusing it: valid (NEVER; O-5).
- **N-12.** A buyer's transfer stating the buyer's own absence choices: it takes effect; one stating none, in a deal of two or more: it does not (BUYER, to confirm; P-1).
- **N-13.** A leaver vanishes after leaving: a declaration under its own absence choices, carried with its stake, counts and its stake moves as they say (TRAVEL; the failure F313 was written against).
- **N-14.** A leaver's stake, the constitution silent on whether its rules bind a leaver: a change under those rules paying it less, without its signature, puts nothing in force; the constitution saying they bind: in force (R-206; C3).
- **N-15.** A share rule (task 27) in the version a holder signed changes its share; the same rule added in a later version the holder did not sign changes nothing; a buyer bound by the version its transfer names (R-92, SIGNED; S2).
- **N-16.** A transfer of a whole stake, a resignation and a default termination, each where a named task 15, 26 or 27 cMIP is not held: each still counts (UNKNOWN, to confirm; O-6).
- **N-17.** A judge declared absent under its role's absence proof: the next judge the chain names settles; a judge not named in the chain: counts for nothing (JUDGE; S17).
- **N-18.** A split service gone for good, declared absent as a role: its place moves to the named identity; with no one named, it stays vacant and the payment is owed back (HAND).
- **N-19.** A keeper declared absent as a role: its place stays vacant or moves, as its role's outcome says; what it recorded still stands (ONCE; S15).
- **N-20.** An act of the retired type 18 under the new Agreements hash: invalid (NEG; a format change named).
- **N-21.** A hand's claim whose rail proof shows payment to a destination the receiver signed: discharged; to another destination: still owing; a rail Module that cannot say: unknown (D3; S13).
- **N-22.** A grant in an area later frozen and then refitted: the ended grant backs nothing; a new grant signed again with the same terms backs (R-168).
- **N-23.** A holder whose pay is held under its absence outcome is still delivered the split; a payout to someone not among its recipients shows as undelivered (R-98).
- **N-24.** A publication naming a backup that is its own split service: refused, in task 17's founding cMIP, beside the test that already pins it (LAWS, law 3).
- **N-25.** The same acts given in two orders: the same verdict and the same explanation (LAWS, law 1; L3). The property tests pin it today for the code; a vector pins it for the independent verifier, which is now built from the new text alone.

## 3. What no decision covers

**In plain words.** Each item is a choice nobody has made yet, for Nobody, allegedly, one at a time. Each says the choice, the rows and vectors that wait on it, and a lean. The leans are the markers', given so the rows could be marked; none is settled. The numbering is for finding, not an order of importance; O-1, O-5, O-7, O-8 and O-13 touch the most of the new text.

- **O-1.** Client conformance that is neither "show before signing" nor one of the four duties (for example: a client never signs terms naming a cMIP or extension it does not implement; a refusal to sign a fork; alarms on receiving a payment): a fifth duty, folded into duty 1, or companion? *Rows:* A-029, A-030, A-175, A-196, A-213, A-241, A-244, A-253, A-276, A-294, A-387, A-472, A-515, A-518, A-556, A-561, A-605, A-614, A-618, A-619, A-620, A-752, A-766, A-839, A-840, A-862, A-863, A-892, A-959, A-960, A-1032, A-1140, A-1187, A-1207, A-1299, A-1357, A-1423, A-1474, A-1569, A-1604, A-1605, A-1606, A-1702, A-1781, A-1792, A-2273, A-2285, A-2286, A-2287, A-2321, A-2369, A-2390, A-2407, A-2411, A-2498, A-2526, A-2528, A-2538. *Lean:* fold the "never sign what you cannot read" sentences into duty 1, and send the rest to the companion; keep as rules the few that guard a recorded attack (F97, F131, F352, F37), as duties.
- **O-2.** Fable sends positions (rule 5), atomic where possible (50), failure attribution (51), disclosure by choice (53) and moving off a cMIP (49) to the companion; nobody has decided it. *Rows:* A-046, A-181, A-519, A-520, A-521, A-522, A-523, A-524, A-534. *Lean:* companion.
- **O-3.** Claim priority by anchor or keeper: one sentence of language, the rest companion (Fable), not decided. *Rows:* A-205, A-206, A-207. *Lean:* as Fable: "shown; it changes no act's validity" as language, the rest companion.
- **O-4.** A sale outside the claim's ownership agreement (rule 14): kept as language, its showing to task 16 (Fable), not decided. *Rows:* A-443, A-444, A-445, A-450, A-452. *Lean:* as Fable.
- **O-5.** Rule 61's guard: must a collective's constitution refuse "never" for every voice its change rule counts (a core rule), or only may it ("may", as decided)? With it: may a collective require "moves" of holders its change rule counts? *Rows:* A-1415, A-1652, A-1653, A-1654, A-1657, A-1658, A-1660, A-1661, A-1663, A-1671, A-1673, A-1711. *Lean:* must, as a rule of the collective's part: otherwise C5 ("can always be ended") holds only where the constitution chose it.
- **O-6.** An unknown from a named termination cMIP (task 15): does the default termination of its kind stay available (UNKNOWN, to confirm), against draft 24's "the state is unknown from it on"? *Rows:* A-496, A-1515, A-1790, A-2768. Vectors: 238, 239, 243, 253, 254. *Lean:* both: the state is unknown under the named terms, and the default way out still counts.
- **O-7.** A judge that fails other than by vanishing (answers "unknown", settles twice with different versions, answers after its period): a role's absence (JUDGE), or a rule of its own that passes to the next named judge? *Rows:* A-096, A-1568, A-1572, A-1597, A-1741, A-1742, A-1744, A-1750, A-1751. Vectors: 42. *Lean:* a rule of its own in the shared part (S17): only a lapse is an absence.
- **O-8.** Rule 83's succession plan: on a declaration of absence, does the plan run, the absence outcome (task 26), or is the plan one form of that outcome ("moves", with the voice)? *Rows:* A-1228. Vectors: 83, 84, 106, 107, 108, 149, 150, 151. *Lean:* one form of "moves" (as JUDGE made the chain one form of "moves").
- **O-9.** Draft 24's outcome "agreement closed": neither "stays" nor "moves". Does it survive anywhere? *Rows:* A-1709, A-1957. *Lean:* no: a closing is its own act; retire it.
- **O-10.** The absence clause's authority forms (one identity; in a collective, a threshold of the others) and their counting: core, or task 14's founding cMIP? *Rows:* A-2375, A-2376, A-2396, A-2400, A-2401, A-2412, A-2442. *Lean:* task 14's founding cMIP; the core keeps "declared only by whom it named, as it named" (S5).
- **O-11.** The liveness act (type 12): a core type, or an act of task 14's founding cMIP? *Rows:* A-2229, A-2230. *Lean:* a core type: presence is read by several tasks and by the line.
- **O-12.** Is task 26 (absence outcome) judicial like task 14, outside every layer's rule, and which layer's rule adopts the cMIPs of the new tasks (17 to 24, 26, 27) in a collective? *Rows:* A-1485, A-1640, A-1642. *Lean:* task 26 judicial beside task 14; tasks 17 to 24 and 27 under the rule for Money.
- **O-13.** Whose absence choices govern a holder who came by no signature of its own (given shares by a fork), and one that signed as a party and later bought? *Rows:* A-1669, A-1670. *Lean:* its own, stated in the act that made it a holder; where none can be (a fork's gift), the fork asks it, and until it answers its outcome is "stays".
- **O-14.** In a deal, can a holder who is no party be declared absent, now that absence choices travel with the stake? *Rows:* A-2379, A-2392. *Lean:* yes, under its own choices, as in a collective.
- **O-15.** A transfer naming an older version in field 0: is the buyer bound by that version (SIGNED), or by the version the line placed in force at the transfer (draft 24)? *Rows:* A-262, A-1098. *Lean:* the version in force where the line placed the transfer; a transfer naming another is invalid.
- **O-16.** Which roles must state their absence choices before an act naming them counts: a publication's partners and split service, a timed release's key deliverer? *Rows:* A-300, A-2252. *Lean:* every role the terms name, as ONCE says; for a role, "stays (vacant)" needs no cMIP.
- **O-17.** How "paid less" is judged once the plan's details are a cMIP's parameters, within one publication and across a fork's successors (Fable's 5.2 of pull request 137, held). *Rows:* A-1092, A-1093, A-1096, A-1290, A-1291. *Lean:* by the core, on the payouts the named cMIP computes for the same receipt under each version.
- **O-18.** Where the publishing model's edges fall: the split agreement (a publication selling nothing) and which of its parts stay constitutional or judicial; the fee bearer and cap Money rule 21 reads; recoupment as a division shape (task 8) or a share rule (task 27). *Rows:* A-063, A-917, A-1043, A-1451, A-1482. *Lean:* split agreement in the shared part as a publication; fee bearer and cap stay in the plan (Money reads them); recoupment is task 27.
- **O-19.** Does "no advance permission reaches unlike treatment of one holder" survive R-92, where a holder may sign its own share rule? *Rows:* A-1087, A-1088. *Lean:* yes, as S2's edge: unlike treatment only by a rule that holder signed.
- **O-20.** A vanished holder whose outcome is "stays" can block for good a change that pays it less. Is that a stated cost to write? *Rows:* A-1090. *Lean:* yes, beside S2.
- **O-21.** Under a rule by share, does a declared-absent holder's "stays" share still count toward the change rule? *Rows:* A-1659. *Lean:* no: its voice is removed (R-43), its share kept.
- **O-22.** Does a party naming only itself as its absence authority count as "never"? *Rows:* A-1655. *Lean:* yes, and the client shows it as "never" (duty 1).
- **O-23.** Does a payment that accepts an offer count as a binding signature for duty 1? *Rows:* A-340. *Lean:* no: duty 1 is for terms; the price tag is shown by Money's own client duties.
- **O-24.** A delivery no verifier can check: "not proven" (draft 24) or "unknown" (task 22's answers)? *Rows:* A-353. *Lean:* unknown (L2).
- **O-25.** With delivery proof now task 22, may a collective name one checker for all its publications? *Rows:* A-356, A-357. *Lean:* no: each publication names its task 22 cMIP.
- **O-26.** Does the rewrite keep draft 24's rule numbers, or number afresh in reading order? *Rows:* A-005. *Lean:* afresh, with a map from old to new in the companion.
- **O-27.** Does a clone changing only a judicial-tier field need the constitutional change rule beside the judicial rule, or the judicial rule alone? (S8a found two readings.) *Rows:* A-1452. *Lean:* as the code does.
- **O-28.** In the timed release format, is "its consent" the collective's own under its rules, or its owners' consent (rule 98)? *Rows:* A-2247. *Lean:* the collective's own.
- **O-29.** A record naming any other act in field 3: invalid whole, or only that entry? *Rows:* A-2360. *Lean:* as the code does.
- **O-30.** Is a grant's list of endings closed, or do an expiry (task 12) and a broken stretch's quarantine end it too? *Rows:* A-2210. *Lean:* closed, the list naming both.
- **O-31.** Does "shown missed" also need a record anchored at or before the point (line 2307 of draft 24 against line 2313)? *Rows:* A-1729, A-1733. *Lean:* as the code does.
- **O-32.** Is a leaver whose stake the collective's rules no longer bind (R-206) still counted among the stake's holders? *Rows:* A-730. *Lean:* yes, as a holder with no voice.
- **O-33.** Now that negotiation is text, is a member's text act naming the collective held to rule 57 (done once sealed to every member)? *Rows:* A-577. *Lean:* no: talk binds nothing.
- **O-34.** Where field 18 counts by share, does any share-rule change (task 27), not only issuance, also need the constitutional change rule? *Rows:* A-1446. *Lean:* yes.
- **O-35.** Does a collective selling its share in a work still need its holders' consent, once owners' consent narrows under R-92 and R-206? *Rows:* A-263. *Lean:* yes, under S2.
- **O-36.** A control model's answer letting a stake's holders' rule stand in for a holder (vector 179): kept in rule 99's format, or moved wholly to task 27? *Rows:* none. Vectors: 179. *Lean:* moved to task 27, the answer kind retired: a format change to name.
- **O-37.** The signed facts (Fable, pull request 135): the summary's hash not in the signature; the facts outside the core in task 16. "Not decided by Nobody, allegedly, yet." No row of draft 24 turns on it; it touches what duty 1 shows. *Rows:* none. *Lean:* as Fable.

## 4. Decisions of F441 that pull against each other

**In plain words.** These are places where obeying one decision exactly means bending another. None is settled here. Each names the decisions, the rows, and how they pull.

- **P-1. TRAVEL against BUYER.** TRAVEL: a holder's absence choices "travel with its stake when it leaves, is sold or is succeeded". BUYER (the lead, to confirm): "a buyer of a stake makes its own absence choices in the transfer it completes", since the seller's choices name the seller's people. For a sale, they say opposite things. *Rows:* A-264, A-1666, A-1668, A-1669, A-2131. *Vectors:* 89, 90, 118, 152, 264, 265, 268, 269. The same question reaches a successor: TRAVEL has it inherit the predecessor's choices; BUYER's reasoning (the choices name the predecessor's people) would give it its own.
- **P-2. T14 against R-43.** R-43: "A deal never freezes on a party who is not there." T14: "no one may ever declare me absent" is allowed, with the stated cost that "a deal that needs it may freeze for good if it vanishes". *Rows:* A-115, A-738, A-1257, A-1442, A-1499 (R-43's rows). The rewrite cannot write R-43's sentence as decided once T14's answer exists.
- **P-3. R-238's stated cost against duty 3 (G1A).** R-238: "a client may preselect an answer, shown before signing (task 16)". Gate 1 amended, duty 3: "on every forced choice (absence proof and absence outcome among them), no answer is preselected: the person picks". *Rows:* A-1662, A-1684. Duty 3 was decided later the same day; nothing says it replaces R-238's sentence.
- **P-4. The holder's own choice (R-238, T14, TRAVEL) against the constitution's refusal (NEVER).** Absence choices are "its own terms" and "the core sets no default", yet a constitution "may refuse" "never" for its constitutional voices, and rule 61's guard needs a counted voice that can be removed. In a collective, which governs a member's answer, the member or the constitution it signed? *Rows:* A-1479, A-1660, A-1663, A-1673. See also O-5, on whether the refusal is required.
- **P-5. R-92 against R-206.** R-92: a share changes "as terms its holder signed say". R-206: where the constitution is silent, the collective's rules "stop binding it the day the holder leaves". A leaver who signed a constitution carrying a share rule (an issuance under a holders' rule, say) that does not say whether it binds leavers: by R-92 the rule still applies, by R-206 it does not. *Rows:* A-730, A-1081. *Vectors:* 174 to 176 (the issuance cases, where a leaver is not yet tested).
- **P-6. Gate 1 against gate 2 as the lead read it (G1 against G2L).** A stated cost stays beside its rule (G2L), but the client check or the "No owner" flag that the cost names as the person's defence moves to the terms-reading cMIP (G1). The cost would then point to a defence the core no longer has. *Rows:* A-391, A-460, A-463.
- **P-7. R-98 against gate 3.** R-98 keeps the delivery check "to every holder and partner it pays"; gate 3 sends partners out of the core with the publishing model. The core's check would name a thing the core no longer defines. *Row:* A-2187.
- **P-8. Not two decisions, but near: R-43 as Fable's S4 states it, against the collective's change of members.** S4 (shared): a voice ends only by the party's own act, by succession, or by a declaration of absence. A collective's constitution may also remove a member by its change rule (rule 69). R-43 was decided for deals; S4 generalises it to the shared part. *Row:* A-1112.

## 5. Counts

**By part and fate** (rows):

| Fate | deal | collective | shared | out | All |
| --- | --- | --- | --- | --- | --- |
| stays as a rule | 103 | 843 | 601 |  | **1547** |
| stays as language | 36 | 230 | 428 |  | **694** |
| moves to a founding cMIP |  |  |  | 160 | **160** |
| companion |  |  |  | 178 | **178** |
| companion (the suite) |  |  |  | 159 | **159** |
| retired |  |  |  | 34 | **34** |
| **All** | **139** | **1073** | **1029** | **531** | **2772** |

**The founding cMIPs, by task** (the 160 rows that move):

| Task | Rows |
| --- | --- |
| 8, shares off the top (with the split service's practice) | 37 |
| 14, absence proof | 1 |
| 16, terms reading | 32 |
| 17, receiver for this payment | 12 |
| 18, role evidence | 41 |
| 19, metric | 12 |
| 20, split due | 3 |
| 21, payout fee | 6 |
| 22, delivery proof | 1 |
| 23, what was promised | 4 |
| 25, collective control | 1 |
| 26, absence outcome | 7 |
| 27, share rule | 3 |

**By decision:** the table in section 1 ("Rows" and "Vectors"). A row may rest on several decisions, so these do not add up to 2,772. 1,786 rows rest on draft 24 unchanged alone; 455 rows stay in the frozen text with a wording or a verdict changed by a decision.

**By file:**

| File | Rows | deal | collective | shared | out | rule | language | cMIP | companion | suite | retired | open |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [01-front.md](01-front.md) | 163 | 3 | 41 | 94 | 25 | 26 | 112 | 5 | 18 | 0 | 2 | 6 |
| [02-part-1a.md](02-part-1a.md) | 132 | 10 | 10 | 97 | 15 | 86 | 31 | 7 | 8 | 0 | 0 | 14 |
| [03-part-1b.md](03-part-1b.md) | 247 | 5 | 7 | 192 | 43 | 162 | 42 | 12 | 21 | 0 | 10 | 22 |
| [04-part-1c.md](04-part-1c.md) | 193 | 0 | 148 | 27 | 18 | 133 | 42 | 0 | 14 | 0 | 4 | 9 |
| [05-part-2a.md](05-part-2a.md) | 175 | 7 | 91 | 67 | 10 | 144 | 21 | 0 | 10 | 0 | 0 | 7 |
| [06-part-2b.md](06-part-2b.md) | 192 | 1 | 23 | 84 | 84 | 89 | 19 | 73 | 11 | 0 | 0 | 12 |
| [07-part-3a.md](07-part-3a.md) | 162 | 1 | 123 | 28 | 10 | 145 | 7 | 8 | 2 | 0 | 0 | 4 |
| [08-part-3b.md](08-part-3b.md) | 176 | 0 | 148 | 20 | 8 | 153 | 15 | 1 | 7 | 0 | 0 | 6 |
| [09-part-4a.md](09-part-4a.md) | 166 | 83 | 44 | 18 | 21 | 123 | 22 | 11 | 10 | 0 | 0 | 14 |
| [10-part-4b.md](10-part-4b.md) | 113 | 2 | 65 | 32 | 14 | 95 | 4 | 9 | 2 | 0 | 3 | 19 |
| [11-part-4c.md](11-part-4c.md) | 151 | 0 | 62 | 74 | 15 | 72 | 64 | 1 | 14 | 0 | 0 | 10 |
| [12-part-5a.md](12-part-5a.md) | 267 | 18 | 61 | 168 | 20 | 31 | 216 | 9 | 10 | 0 | 1 | 1 |
| [13-part-5b.md](13-part-5b.md) | 239 | 9 | 88 | 98 | 44 | 127 | 68 | 24 | 8 | 0 | 12 | 14 |
| [14-part-5c.md](14-part-5c.md) | 202 | 0 | 162 | 29 | 11 | 160 | 31 | 0 | 10 | 0 | 1 | 14 |
| [15-part-6.md](15-part-6.md) | 194 | 0 | 0 | 1 | 193 | 1 | 0 | 0 | 33 | 159 | 1 | 1 |

**What the rows serve.** Every guarantee of Fable's list is served by at least one row. The most served: C5 (a collective can always be ended or rolled back; 352 rows), S16 (grants; 135), S14 (before and after; 131), C4 (the constitution changes only by its own rule; 131), D1 (113). The least: D2 (a deal completes only with every party's absence choices; 15 rows, since draft 24 had no such rule), and the four duties (duty 1, 20 rows; duty 2, 8; duty 3, 3; duty 4, 2).

**The vectors:** stays 235, stays re-derived 18, stays with bytes re-made 4, moves 10, changes 1, open 1; by part, shared 125, collective 104, deal 30, out 10.

**Open and pulls:** 37 open choices touching 153 rows and 15 vectors; 8 pulls touching 23 rows and 11 vectors.

## 6. How it was made, and what was not done

**How.** The inventory's rows were read as data (id, place, quote, what it decides, kind, candidate home, attack, notes). Seven workers each marked two inventory files from one written brief (the decision codes above, the part test, the fate values, the open choices then known), each checking at the end that every id of its files appeared once, with allowed values. Part six (194 rows: reasoning, two parameters, freeze scenarios) and the 269 vectors were marked by the session itself, the vectors one by one from each case's name, rule and verdict. The session then checked every mark mechanically (2,772 ids, each once; every fate and part an allowed value; "out" exactly where the fate leaves the core), read every retired row and every row of the seven restatements that differ, merged the workers' open choices into the 37 of section 3 (the workers' leans are kept where they agreed; where they did not, the lean is the session's and says so in its words), and coded the pulls.

**What was not done.**

- **Nothing was decided**, the leans of section 3 included.
- **No vector was run or re-made**; "stays" and "changes" are readings of each case's name, rule and verdict against the decisions, as Fable's section 5 was.
- **A second reader will move some marks**, above all the line between *rule* and *language*, and between *collective* and *shared* for rows that sit in a collective's rule but state a general convention. The workers named their doubts in the notes.
- **One reading was carried for every worker by the brief and should be checked:** a stated cost takes its rule's fate (the lead's reading of gate 2, "unless corrected").
- **The four research reports of 11 November were not in the repository** and were not read. Gate 1 amended ties each duty to "a measured harm (research R4)"; O-1's lean does not rest on R4.
- **F441's "Next"** names this pass. The pass counted, as Fable's section 7 asked, how many shared rows carry a clause for one kind only: the notes mark them where the workers found them, but no separate count was made.

## Not this session's

- deciding anything;
- the rewrite;
- the findings log (the MOR lead records F443);
- texts, code, vectors and the inventory itself.
