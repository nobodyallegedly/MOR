# Agreements, draft 26: the report, after wave five, P5 and P6

*The scribe's session P3, 27 November 2026, to the MOR lead and Nobody, allegedly; rewritten whole in N1's shape; brought up to date by the scribe's session P5, the same evening, and by the scribe's session P6 after it; each adds a first section and marks what it changed below. A record of work, not a decision: nothing in it is chosen. Marks: TRACED (to a rule or a ledger entry), COUNTED (by a script, named in `draft-26-trace.md` under "P3", "P5" and "P6"), INFERRED (the scribe's reading). Draft 26 is not merged and not LATEST; draft 25, encoding 2 and `spec/README.md` are untouched.*

**The wish** (Nobody, allegedly, 26 November, 16:46): "We need to change the current wish to updating the core after the findings". On the order (27 November, 14:53): "We finish this rewrite of agreements, then we turn our attention to money, and after that we’ll tackle development."

## What P6 changed

**In plain words.** He said that how many of the keepers an agreement names must show an act is the agreement's own choice, made through a cMIP: two of two to check that neither cheats, two of three to go on when one dies. With no such cMIP, every keeper named is needed, as before. A buyer's filling under an agreement whose keeper died stands where a copy of the keeper's signed record shows it; with no copy held, the answer is "I don't know" (unchecked); no one is told to keep a copy. The clone of 21:42 is the new agreement of 22:36. Where that cMIP is named, beside the keeper list, is the lead's reading, to check; its bytes are left to the codemeister.

**His entries** (TRACED, each read whole in `docs/decisions.md` on main; his words as the ledger has them; each "Arrived at" line is the lead's, to check):

1. **How many keepers are needed: the agreement and its cMIP decide** (27 November, 23:22–23:28): "Look at my words. Nothing here contradicts them. / That scenario was a two out of two, to check that none of the two cheated. / In a two out of three, you keep that, plus you add a way out if one of the three dies. / What decides if it’s two out of two or three out of two or just one. The agreement and the cMIP it uses". Rules: §3.1 **Task**, §3.3 **Pin**, §3.4 **Keeper** and **Placed**, §3.6, §4.2 `keeper`, 5.4.1, 5.5.1(a), (b), 5.5.4(e), 5.5.5(d), 5.6.4, 5.8.3, 5.8.4, 5.13.3, §6 (K9), §6.1, §7 (P6-1 to P6-10, P6-12, P6-14 to P6-17, P6-19 to P6-24). The socket, a cMIP beside the keeper list, is the lead's reading of 23:33, to check.
2. **The same entry, on her filling** (23:22–23:29): "Provided that there is a back up copy somewhere…"; and, on a client keeping the keeper's record: "It’s not something I would specify." Rules: 5.10.6 (P6-18); no client duty written (5.12.9 stays the one).
3. **The clone is the new agreement** (23:30–23:32): "I laughed… because to me it still always the same question. And it boils down to you try real hard to think like a human, I try real hard to think like a machine." No rule changes: 5.8.3 already reads a new first act, no update and no fork (P5-20); the companion's section 5 and scenario 8.28, and this report, read it so.

Also, on the lead's 23:22: 1, 5.5.7(c), with a pointer in 5.5.5(c) (P6-11, P6-13); 2, 5.5.5(d) and 5.8.3 (P6-12, P6-16, P6-24); 3, the companion's 6.16 (21:45's answer 2 marked withdrawn), nothing left in the text; 4, §7 (P6-23). COUNTED: 24 edits to draft 26; 37 to the companion (13 rows of section 9 and one of 9.4 among them; scenarios 8.4, 8.22, 8.28, 8.30, 8.31 re-read or rewritten in part, 8.37 to 8.39 new); 8 to encoding 3, and the hash (the trace, P6).

## What P5 changed

**In plain words.** He said that an update the keeper never showed is no update, that a dead keeper leaves the agreement where it stood and what its parties do next is a new agreement, and that no rule is written for a case the other rules already settle. So the way out by the parties' own acts, keeper or not, is gone again. Where Terms name keepers, the keepers order every act; where they name none, the acts naming one another do. An agreement whose keepers fall silent stays as they left it, and a buyer's filling under it stands as they showed it. Draft 26, encoding 3 and the companion say so, partly on the lead's readings of 22:45, to check.

**His entries** (TRACED, each read whole in `docs/decisions.md` on main; his words as the ledger has them; each "Arrived at" line is the lead's, to check):

1. **An update the keeper never showed is no update** (27 November, 22:27–22:30): "Why? The update never got to the keeper, how can it be valid? To be valid the agreement needs to be checked at the keeper." Rules, with the lead's 22:45, 1: §3.3 **Gate** and **Update**, 5.5.1(a), 5.5.4, 5.5.7(a), 5.12.2 (P5-3, P5-5, P5-11, P5-14, P5-18, P5-25, P5-27).
2. **A dead keeper: the agreement is dead; what follows is a new act** (22:36): "There is no update. It’s a new act. If you always think about it as a new act then it’s easier to solve these ones. The act is found at the tip of its chain, and it points to a keeper, and the keeper is dead. Angreement is dead. So, whatever they do next is a new act, a new agreement, that can point to the dead one if they wish to show lineage, but the truth is, every single time, it’s a new act. Disputes, races… that’s where it’s a fork and rules have to settle." Rules, with the lead's 22:45, 3 and 4: §1, 5.8.3, 5.10.6 (P5-2, P5-20, P5-23).
3. **No rule for an exception logic covers** (22:37–22:39): "They didn’t skip it. They just created a new act because the previous one was a dead end no? Are you creating rules for exceptions that are covered by logic?" Rules: the pin one rule again, §3.3 **Pin**, 5.4.1, 5.5.1(b), 5.5.3, 5.5.5(d), 5.8.4, 5.13.3 (P5-4, P5-9, P5-10, P5-12, P5-13, P5-17, P5-21, P5-22, P5-26); with the lead's 22:45, 2, 5.5.4(a) (P5-15, P5-16).

Also, on the lead's answers of 22:30 that still stand: 1, §3.2 **Unknown party**, §3.3 **Apply**, 5.5.7(f), 5.10.6, 5.10.8 (P5-6, P5-7, P5-19, P5-23, P5-24); 2, 5.1.2 (P5-8); 4, 5.4.1, checked, no change. Mechanical: draft 26's head names draft 25's branch (P5-1). COUNTED: 27 edits to draft 26; 26 to the companion's text, 18 table rows of its section 9, and five scenarios rewritten in part (8.28, 8.30, 8.31, 8.32, 8.36); 5 to encoding 3 and the hash (the trace, P5).

## What wave five changed

*As P3 wrote it; where P5 changed a rule below, it is marked "(P5)".*

**In plain words.** Three sessions carried this evening into the rules. A buyer's yes gives nobody a power over her. Known parties and unknown parties are two classes with two sets of rules. Publishing the Terms is its signer's yes. An update every known party signs, each after the other, is ordered by their own acts, keeper or not; any other update, two of three included, waits on every keeper named; a dead keeper is left only by a new version every known party signs (P5: withdrawn after his 22:36 and 22:39; above). (*Withdrawn*, by his "A dead keeper: the agreement is dead; what follows is a new act" (22:36) and "No rule for an exception logic covers" (22:37–22:39); its "every keeper named" read again by his "How many keepers are needed: the agreement and its cMIP decide", 23:22–23:28.) Draft 26 then said so, partly on the lead's readings, to check. The lead's readings of the last open questions are written into the rules they touch, each listed below for him to see. The bytes and the companion follow, and the three files were checked again as one.

**His words of the evening**, each exchange by the scribe's short name, what it arrived at to check (TRACED, each to its entry in `docs/decisions.md` on main, read whole; his words as the ledger has them):

1. **A filling gives no power** (18:39–18:47): "Yup, this should not happen. Not sure I caught all the details though"; "Buona did they build it in agreements?"; corrected: "“that fills an unknown party spot”". Rules: §3.2 **Power** and **Unknown party**, 5.4.3, 5.6.1(b), (c), 5.6.2, 5.6.3, 5.10.6, 5.10.7 (P1).
2. **Two classes**, in the same exchange (18:47): "It’s seems important to really make a point that these two are not the same class or IDs and are not bound by the same rules." Rules: §0, §3.2 **Two classes**, now with the rule beside each item (P1, P3-33).
3. **The pin in two halves**: "A dead keeper: an update every needed signer signs needs no keeper" (18:44–18:51): "A dead keeper forces a new version of the agreement, no?"; "Sounds good"; read again in "A dead keeper: two of three cannot leave it" (21:29–21:42): "Keeper is dead. That version of the agreement is dead. For the agreement to be valid, the keeper is indeed needed to verify the agreement. It’s not “act exists” as a condition, it’s “act exists @“. Condition is not met, agreement is dead. What can save them? All three signature that sign a clone to the agreement to a new keeper." Rules: §1, §3.3 **Pin**, 5.4.1, 5.5.1(b), 5.5.3, 5.5.5(d), 5.8.3, 5.8.4, 5.10.2, 5.13.3 (P1, P3-9 to P3-18). (P5: the two halves taken out after his 22:36 and 22:39, the pin one rule again; above.) (*Withdrawn*, by his "A dead keeper: the agreement is dead; what follows is a new act" (22:36) and "No rule for an exception logic covers" (22:37–22:39); his "clone" read as a new agreement by "The clone is the new agreement", 23:30–23:32.)
4. **Publishing the Terms is the publisher's assent** (20:49–20:50): "Yes, I don’t see the need to have her sign twice". Rules: §3.1 **Terms** and **Assent**, §3.2 **Author**, §4.3 **An author's first act**, 5.4.1, 5.5.7(e) (P3-1 to P3-6); encoding 3's E13 and E17. Fable 1.1: his 20:50 answers it, as the lead reads it; to check.

**The lead's readings carried** (COUNTED): of the fifty rows, 39 by P1, 4 by P2 into encoding 3, 7 with no text change; of the seven of 20:41, all seven, as the batch of 21:45 and his 21:42 correct them (2 and 3, and 1's "pinned by knots" half: *Withdrawn*, by his "A dead keeper: the agreement is dead; what follows is a new act" (22:36) and "No rule for an exception logic covers" (22:37–22:39), as the lead's note of 22:45 reads them); the codemeister's two; of the twelve of 20:55, nine into the text, three (11, 13, 14) with no change, as the note says; of the batch of 21:45, all five (3 *Withdrawn*, by his "A dead keeper: the agreement is dead; what follows is a new act" (22:36) and "No rule for an exception logic covers" (22:37–22:39); 2's second clause withdrawn with the hatch, the lead's 23:22, 3). Rows that could not be carried: none whole; what a carried row left open is listed below. Each reading P3 carried is in the table "The MOR lead's readings, for him to check".

**The wording splits.** Fable's ten (its section 1): 1.1, his 20:50, as the lead reads it, to check; 1.2, 1.3, 1.5 to 1.8, one reading each, P1's, to check; 1.4 P1's reading, to check; 1.9 a reading in encoding 3, P2's, to check; 1.10, its three listed parts written on the lead's readings 6 and 10, to check. The scribe's nineteen lines of P1 and N1's nine wordings: each now one reading, by the note's rows 8 to 19 (below), but N1's fifteen lines the note does not reach (listed).

## In plain words

*As draft 26 now says, partly on the lead's readings (below), to check; item 5 rewritten by P5, and again by P6.*

1. Draft 26 is the rules of Agreements rewritten after the round's findings: a new file beside draft 25, which stays as it is.
2. It is a grammar, not a rule book: it says how signed acts are read, and leaves what people agree to cMIPs in eight sockets.
3. Two people write the words (a Text act) and Terms that name them; the one who publishes the Terms has said yes by publishing; the other says yes in an act of their own; the Terms count once their order is shown.
4. A change is an update: allowed by the old version's own condition (the gate), and ordered after it (the pin).
5. Who orders it: where the Terms name keepers, those keepers, for every act, whoever signs it; where they name none, the acts naming one another. How many of the keepers must show an act is the agreement's choice, by a cMIP it names beside them (two of three, say); with none named, every one. An update the keepers never show is no update. If too few keepers are left to show its acts, the agreement stays as they left it, and what its parties do next is a new agreement, which may name the old one; a buyer's filling under the old one stands where a copy of the keepers' signed records shows it, and with no copy held the answer is unchecked.
6. Two allowed changes that nothing orders are a fork: both stop, the old version stays, until the agreement resolves it its own way.
7. Someone who joins later through a role keeps exactly what the version they signed gave, on that version's clock; no update reaches them, and nobody can act for them but under a power they gave in a Statement of their own.
8. An act signed for someone else under a power binds the one who gave the power, not the one who signed.

## The files

COUNTED (`wc -lc`, the final files on `claude/draft-26-outline-vbtvu7`, after P6):

| File | Lines | Bytes |
|---|---|---|
| `draft-26.md` (the hashed text) | 436 | 157,698 |
| `encoding-3.md` (its bytes) | 519 | 71,263 |
| `draft-26-companion.md` | 2334 | 495,378 |
| `draft-26-trace.md` | 2016 | 460,293 |
| `draft-26-report.md` (this file) | 275 | 48,964 |

**The hashes** of the final `draft-26.md`, computed last, after every other edit of it:
- E2's tagged hash, `SPEC_DRAFT_26`: `eff0648f5fd1d6b623ccb581ab2f2e07e0bf406b9ddb58fed555642b4cf43b91`, by the core library's `Spec::mir_file_hash`, run from a scratch crate on the file (the same binary gives P5's `783f6821…` on the file as P5 left it).
- The plain sha256 of the file's bytes, `sha256sum draft-26.md`: `5d63d56f1e6edd21ae0a714cda5138f748ded7526d07caa4bbd56a42368ce7b1`.

Computed by P6, after every other edit of the file. The first names the text, as encoding 3's E2 has it. Both are written, each named, in encoding 3's E2 and the companion's head. P5's values (`783f6821…`, `a0ee4064…`) name the text before P6. P3's values (`60c0b84e…`, `c770b324…`) name the text before P5; N1's (`04bae25c…`, `09ba9ce5…`) the text before wave five.

## The counts

COUNTED unless marked.
- **Rules of draft 26**: 68 numbered and 33 lettered clauses, 32 headings; 9 tasks, 7 modules, 8 open values (§7). Unchanged by wave five and by P5; P6 added the task K9 and two open values.
- **Words defined**: 94 bold terms in §3's entry heads, 93 distinct; none new in P3.
- **References**: 965 in draft 26, 295 in encoding 3 (292 before P5), 202 in the companion's sections 9 and 10; none bad. P6's count, task numbers included: 1074 in draft 26, 343 in encoding 3, 228 in the companion's sections 9 and 10; none bad but the named 5.7.3.
- **Quotations**: of his words, 162 spans after "He:" in the four files as P3 found them, all in the ledger word for word; of draft 26, 135 in the companion and 34 in encoding 3 that stand in the text now, and 4 in the companion that quote an older draft 26 on purpose, each labelled.
- **Edits of wave five**: P1, 62 to draft 26; P2, 30 to encoding 3 and the companion's sections; P3, 47 to draft 26, 15 to encoding 3, 33 and 22 table rows to the companion; P5, 27 to draft 26, 5 to encoding 3, 26 and 18 table rows to the companion, with five scenarios rewritten in part; P6, 24 to draft 26, 8 to encoding 3, 37 to the companion, with three scenarios new.
- **Scenarios**: 39 (8.1 to 8.39; 8.37 to 8.39 by P6); vectors named from 8.22 onward: 8.22 to 8.36; after P5, 8.28's fourth waits on encoding 3's item 14 (below).

## What the check found and fixed

**P6's check** (six checks, by script, on the touched rules and their quotations; each in the trace under P6). References: none bad (draft 26, 1074; encoding 3, 343; every line P6 wrote). Words: nothing defined twice; the new task named once, "Keepers", in its row; every sentence left that speaks of every keeper carries the default or the cMIP. Only rules in §4 to §7. Quotations: three brought to the words in the companion, one kept labelled "as wave four left it"; encoding 3's §3.4 quotation brought to it. His words: 224 spans, all in the ledger word for word. Nothing forbidden.

**P6's stranger** (one subagent, draft 26 alone). (1) Three keepers, a cMIP asking two, one silent, an update every known party signs that two show: **valid**, by default, and **in force**, **per keeper**; lacking the cMIP, **unchecked** (5.5.1(a), (b), 5.5.5(d), 5.5.7(c), (e), 5.8.3, 5.8.4), 80%. (2) One keeper, dead, a buyer's filling: no copy held, **unchecked** (5.10.6), 85%; one signed copy held, the filling stands, shown with its proof, bound by its version (5.10.2, 5.10.6, 5.10.8), 75%. Least understood: 5.5.4(a)'s "no choice of acts ... avoids an act so shown" (listed before); 5.4.5's "the one before it"; 5.5.5(d)'s "only keepers that do not show the original's acts" (fixed, P6-24). It found: 5.10.6's **unchecked** beside §3.6 and 5.8.3 (listed below); whether a held copy counts beyond a filling (listed); "with those keepers named" (listed).

**P5's check** (seven checks, by script, on the touched rules and their quotations; each in the trace under P5). References: none bad in draft 26 (965) and encoding 3 (295); the companion's 8 hits are P3's, each named on purpose. Words: nothing defined twice; no word left that only the dropped half used; no answer word and no state word added. Knots: every hit read in draft 26 (37), encoding 3 (7) and the companion's sections 9 and 10 (30): none pins by knots where keepers are named. Only rules in §4 to §7. Quotations: encoding 3 holds none of a rule P5 changed; the companion's four older ones are each labelled as P3's words; one fixed (8.29's §3.2). His words: 180 spans, all in the ledger but P3's seven marked shortenings; fixed, "Carla’s" in 8.28. Nothing forbidden.

**P5's stranger** (one subagent, draft 26 alone). (1) All three sign under a live keeper that has not shown it: **not shown** as a replacement, never **not valid**, per keeper, the keeper named; the order of their signing does not help (5.5.1(a), 5.5.5(c), 5.5.7(e), 5.8.3, 5.8.4), 85%. (2) Two of three, the keeper silent before showing it, then a new first act all three sign: the two's update is no update and makes no fork (5.5.1(a)), 70%; the old agreement stays where its keeper left it and is not ended (5.8.3, 5.5.6), 85%; the new act is a new agreement, no update and no fork, in force once its own keeper shows its assents (5.4.1, 5.8.3), 80%; the buyer's filling stands as the keeper showed it, nothing reaching it (5.10.6), 80%. Least understood: 5.5.1(a)'s "no update of that version" (fixed: "while they do not show it", P5-27); 5.5.4(a)'s "Each such choice is read whole" and 5.12.2's "signed by all the parties that needed to sign it" (listed, as P3 listed them). It also found that the new act cannot name the old root in `agreement` (§4.2), and asked whether a named condition's answer is passed on (both listed below).

*P3's check, as P3 wrote it:* eight checks, by script; each script and result is in the trace under P3.

1. **References.** None bad in the three files.
2. **Words.** Fixed: §3.2 **Two classes** bolded two words it says are "defined below" (unbolded); encoding 3's "powers: [kind, rule]" and "a role of kind future" (now "sort", N1's rename). Listed: "agreement" twice in §3's heads (as **Party**'s third way and as **Agreement**); **grantor** (5.6.6) and **proof** (5.10.2) defined where they stand, not in §3; **Assent** now also a Terms act; "a filling" beside "an unknown party's filling"; "Control" in §1's list of operations.
3. **Only rules.** Nothing of the ledger, the lead, a session or a scenario in §4 to §7; §0 holds no MUST or MAY.
4. **The bytes against the rules.** 20 Terms fields and 12 Statement fields, each with its key; E3, E13 and step 7.4 ask what 5.13.1, 5.3.1 and §4.4 give.
5. **The companion's trace.** 68 rows for 68 rules; every draft 25 number of 9.1 in section 10; 250 ledger headings, all word for word.
6. **Quotations.** As counted above; P3's companion edits brought 11 quotations to the rules' words.
7. **The head.** Says what it rewrites, not merged, not LATEST, where the companion and encoding 3 are. Found: `draft-25.md`, named beside it, is not on this branch or on main (the pull request names its branch).
8. **What the files must not hold.** Nothing: no key, address, port, access detail or personal name; no line ends in a space.

**The stranger** (one subagent, draft 26 alone). Its four answers matched the text. The three cases: (1) the seller's act for Ana under a power written into the offer is not her signature, and V3 does not change what her filling earned; she could have given the power by a Statement of her own while V1 was in force (90%, 70%). (2) With the keeper dead, a version all three sign, each after the others, is **in force**, **as shown**; one two of three sign under a named condition is **valid** and **not shown** as in force, and a fresh version all three sign beside it risks a fork (85%, 80%). (3) A known party's own filling is no unknown party's, and the update binds him; whether it reaches what the filling earned has "no single answer" (55%). The five sentences it understood least: 5.5.4(a)'s "no choice of acts enough for L to pass O's gate avoids an act so shown. Each such choice is read whole"; 5.5.1(b)'s "It is shown after them where it, or an act that put it through the gate, is" (fixed, its pronouns named); 5.12.2's "signed by all the parties that needed to sign it"; 5.6.1(b)'s Statement (which field names the grantee); 5.10.8's "anchoring of the purchase". The rest is listed below.

## What needs a choice, for Nobody, allegedly

One line each; nothing chosen. Where a reading of the lead's now answers a line, it is in the table after this one, for him to check.

**P1's thirteen lines**
1. The rules of each class (§3.2 **Two classes**): the lead's line, now with the rule beside each item (reading 12); to check.
2. A known party's own filling: 5.10.7 no longer stands for it (reading 7); 5.10.6, 5.10.8, 5.5.7(f) and §3.3 **Apply** now say "an unknown party's filling", and §3.2 that an update reaches a known party's filling as it reaches that party (P5, the lead's answer 1 of 22:30; to check).
3. Which signers an update needs, and "each shown after the other": answered by his 21:42 and the lead's answer 1 of 21:45; "each shown after the other" answered by his 22:36 and 22:39 (the pin by knots where keepers are named is gone; the lead's reading, to check).
4. A first version every party signs, pinned by knots whatever keepers it names: answered by his 22:36 and 22:39 (reading 2 withdrawn, 5.4.1 pins by the keepers; the lead's reading, to check).
5. Lateness by knots with keepers named: answered by his 22:36 and 22:39 (reading 3 withdrawn; the lead's 22:45, 2: knots do not show an update late, and still expose a keeper; to check).
6. Fable 1.1: his 20:50 bears on it (the lead's reading); to check.
7. A Terms act signed by one who is no party: invalid, reading 6; to check.
8. Which act gives a power "in an act of her own": reading 5 and answer 4 of 21:45 (a Statement of a K7 kind), the lead's, to check; which field names the grantee is not said (the stranger).
9. A counter signature against an agent's assent, an agreement-party's pin: reading 10, the lead's, to check; its (b) beside 5.1.2's "x signs by every one of its signers" (below, the lead's question 2).
10. Where the principle stands: reading 11, P1-1 stands; to check.
11. N1's fifteen lines the note does not reach: below, "N1's list".
12. 5.6.1(b)'s "in force" beside 5.6.4: reading 8; to check.
13. What shows a signer's fork came after the update: reading 9; to check.

**P2's line**: under two of three, may the two leave a keeper without it: his 21:42 bears on it ("Condition is not met, agreement is dead"); answered by his 22:36 and 22:39: no act leaves a keeper as an update; what the parties do next is a new agreement (5.8.3; the lead's reading, to check).

**P5's lines** (*answered* by his 23:22–23:32, as P6 writes them):
- The lead's 22:45, 4, for him to check: an unknown party's filling under an agreement whose keepers no longer show its acts "stands as the keeper showed it before it died, bound by her version for as long as its words say, recorded and checkable; nothing reaches it, the new agreement included" (written in 5.10.6, P5-23). *Answered* by his 23:22–23:29: it stands where a held copy of the keeper's signed record shows it; no copy held, unchecked; no client duty (5.10.6, P6-18).
- His 21:42, "All three signature that sign a clone to the agreement to a new keeper", as the lead reads it after 22:36: a new agreement, a new first act naming the old one, not a new version of it (5.8.3); for him to check. *Answered* by his 23:30–23:32: "The clone is the new agreement".
- From the stranger: where Terms name a keeper and a named condition counts signatures, what a verifier passes on for an update whose assents the keeper does not show: the cMIP's answer on none counted (likely not valid, per keeper, 5.5.7(c)), or only not shown, as the default (5.5.5(c)); the text does not say (the lead's question 1, below). *Answered* by the lead's 23:22, 1: the cMIP's answer, per keeper, **not shown** as in force (5.5.7(c), P6-13).
- From the stranger: which field of the new first act names the old agreement; not `agreement`, which a first act cannot carry (§4.2); encoding 3's item 14, for the codemeister. Draft 26's §7 now lists it (the lead's 23:22, 4; P6-23).

**P6's lines**
- The socket for the keepers' cMIP: a cMIP beside the keeper list, in the keeper field, as `in_force` names one (§4.2 `keeper`, 5.8.3, K9); the lead's reading of 23:33, to check; its bytes, encoding 3's item 15.
- From the stranger: 5.10.6 answers **unchecked** where no copy of a dead keeper's record is held (his 23:29's line, the lead's 23:33), while §3.6 **Unchecked** names only a cMIP or an act not held, and §3.6 **Not shown** and 5.8.3 give **not shown** for a keeper that does not show an act; which word §3.6 gives it is a choice.
- From the stranger: whether a held copy of a dead keeper's record counts for anything but a filling (which Terms are in force, 5.5.3), K9 accepting "the keepers' records the verifier holds".
- From the stranger: whether "with those keepers named" (5.5.3, 5.8.4) names every keeper the Terms name or those that counted; and whether a keeper that stopped differs from one that has "not yet" shown an act (§3.4 **Placed**).
- 5.8.3: where the verifier holds two contradicting answers of one keeper, "it has no answer from that keeper: **unchecked**"; under a named cMIP, whether the other keepers' records still give the answer (INFERRED).

**N1's list, where no reading reached**: the brief's 7 (how a fork that is not of a line is resolved in bytes), 8 (which acts compete "to change the same state"), 11 (how long a filling binds when its words state no term), 12 ("the anchoring of the purchase"; a filling that is not bought; the stranger again), 13 (what a verifier shows of an agreement dissolved while a filling's version binds), 29 (what the known parties may still do), 30 ("Terms state their anchors" for all Terms), 34(a) (how Terms name their clock), 35 (the two copies of "A condition in time with no anchor is refused"); the lead's 09:47 sentence on unreadable tips; **Rival** against 5.12.8's heading; **Knot** MOR-wide, not said in §3.4; **Vow**, no test from an offer; a payment that "holds" K6; case 8 not checkable from bytes; a keeper's identifier.

**Found in wave five**
- A valid update two of three sign, unpinned behind a dead keeper, beside a new version every known party signs: by 5.5.1(b) as written they read as a fork (INFERRED; the stranger's case 2); whether it must be resolved first is his question below. *Answered* by his 22:30 ("An update the keeper never showed is no update"): no update, no fork (5.5.1(a), P5-11; the lead's line, to check).
- "Naming a new keeper": whether a keeper the old version did not name is asked, or a version naming none leaves it too. *No longer asked*: the way out by a new version is withdrawn (his 22:36 and 22:39); the lead's 22:30, 3 on it is withdrawn too.
- 5.6.3's "the grantor (5.6.6), who gave the power" against 5.6.6's "the one in whose name it was made", which come apart where a known party gave the power (P2's blind reader).
- 5.5.5(a) and 5.5.7(e)'s "never a signer who fills a role", for a known party who fills its own spot (P2's blind reader).
- 5.5.4(a)'s "Each such choice is read whole" and 5.12.2's "signed by all the parties that needed to sign it" (the stranger).
- `draft-25.md`, named in the head as beside it, is not on this branch or on main; the pull request names its branch, `claude/agreements-clean-1-hahuwn`. *Fixed* (P5-1, the lead's mechanical find of 22:30): the head names the branch and pull request 183.

## The MOR lead's readings, for him to check

Every reading of 20:41, 20:55 and 21:45 carried into draft 26 by P3, of 22:30 and 22:45 carried by P5, and of 23:22 and 23:33 carried by P6, one line each, with the rule it changed; each is the lead's reading, not a decision of Nobody, allegedly; two rest on his words, as marked. The notes are `docs/lead/notes/2026-11-27-readings-for-p2.md` on main. Rows marked *Withdrawn* stay as the record; the entry that withdrew each is named.

| Reading | What it made the text say | Rule (P3 row) |
|---|---|---|
| 20:41, 1, as 21:45's 1 corrects it | the signers an update needs for its gate are those the condition's cMIP (K4) requires; by default the known parties | 5.5.5, 5.5.7(d) (P3-7, P3-8) |
| 20:41, 1, "each shown after"; 21:45, 2 | every keeper named pins any update; knots also pin one every known party signs, each one's act shown after every other's assent. *Withdrawn* (its "pinned by knots" half), by his 22:36 and 22:39 and the lead's note of 22:45 | 5.5.1(b), §3.3 **Pin**, 5.5.5(d), 5.8.3, 5.8.4 (P3-9 to P3-13; taken out, P5) |
| 21:45, 3, the lead's, resting on his 21:42 | any other update, two of three included, only by the keepers, or not shown; a dead keeper left only by a new version, naming a new keeper, every known party signs. *Withdrawn*, by his 22:36 and 22:39 (the lead's note of 22:45) | 5.5.1(b), 5.8.3, §1 (P3-9, P3-12, P3-16; taken out, P5) |
| 21:45, on P2's "For P3" 8 and 9 | 5.13.3's "only they pin" brought to agree with 5.5.1(b). *Withdrawn* with the split it followed, by his 22:39 | 5.13.3 (P3-15; P5-26) |
| 20:41, 2 | a first version every known party signs is pinned by their knots whatever keepers it names. *Withdrawn*, by his 22:36 and 22:39 (the lead's note of 22:45) | 5.4.1, 5.8.4 (P3-17, P3-18, P3-14; taken out, P5-9, P5-10, P5-22) |
| 20:41, 3 | with keepers named, knots still show an update late; a keeper vouches for the chaining only. *Withdrawn*, by his 22:36 and 22:39 (the lead's note of 22:45) | 5.5.4(a), (c), 5.8.4 (P3-19 to P3-21, P3-13; P5-15, P5-16, P5-21) |
| 20:41, 4, the lead's, resting on his 20:50 | the Terms act is its signer's assent; the others assent later | §3.1, §3.2, §4.3, 5.4.1, 5.5.7(e) (P3-1 to P3-6) |
| 20:41, 5; 21:45, 4 | a holder gives a power only by a Statement in her own name, of a K7 kind, naming the grantee and the sort, read by K3 | 5.6.1(b), 5.10.7 (P3-22, P3-25) |
| 20:41, 6; 21:45, 5 | Terms that carry `parties` and whose signer is no party they name as a signer are invalid | 5.3.1, §4.4 case 5 (P3-26, P3-27) |
| 20:41, 7 | 5.10.7 stands for an unknown party's filling only | 5.10.7 (P3-23, P3-24) |
| for the codemeister, 1 and 2 | an empty keeper list is not an Agreements act (E18); the words note names 5.2.2 | §4.4 cases 1, 2 (P3-28, P3-29) |
| 20:55, 8 | "in force" in 5.6.1(b) read at the act's position, as 5.6.4 places it | 5.6.1(b) (P3-22) |
| 20:55, 9 | a signer's fork is after the update where shown so; otherwise the update not shown as in force, with the reason | 5.12.3 (P3-30) |
| 20:55, 10(a) | the party's own counter signature against an agent's assent: pointer to 5.6.6(c) | 5.4.5 (P3-31) |
| 20:55, 10(b) | an agreement's act for a pin is one act made for it under a power its Terms give | 5.1.2 (P3-32) |
| 20:55, 12 | the rule cited beside each item of **Two classes** | §3.2 (P3-33) |
| 20:55, 15 | "One fault, one grammar rule"; "fits two grammar rules"; encoding 3 quotes it so | §4.4 (P3-34) |
| 20:55, 16 | a layer by its own name: "(Money)", "the Money layer" | §3.1 **Settlement**, K6's trust (P3-35, P3-36) |
| 20:55, 17 | "It computes; what it leans on is named by its modules (§6.1)" | §3.1 **Rule** (P3-37) |
| 20:55, 18 | each sentence said once: the receiver 5.1.3's, the keepers 5.8.4's, the counter signature 5.4.5's | §4.2 `receiver`, 5.4.1, 5.5.3, 5.8.4, 5.4.4 (P3-38 to P3-42) |
| 20:55, 19 | `in_force` in an update read only for who fills a role; counter signatures that "each name the other"; the contest's `terms` and `relies_on` | 5.4.2, 5.4.5, 5.11.9 (P3-43 to P3-45) |
| 20:55, 11, 13, 14 | no change (the lead's): P1-1 stands; "kind" and "sort" stand | none |
| 22:30, 1 (P3's batch of four) | a spot a known party fills is a known party's act, and an update reaches it as it reaches that party | §3.2 **Unknown party**, §3.3 **Apply**, 5.5.7(f), 5.10.6, 5.10.8 (P5-6, P5-7, P5-19, P5-23, P5-24) |
| 22:30, 2 | where Terms give no power, an agreement's signing by every one of its signers is one act, and serves the pin as one act | 5.1.2 (P5-8) |
| 22:30, 3 | a new version every known party signs may name any keeper, or none. *Withdrawn*, by his 22:36 and 22:39 (the lead's note of 22:45) | none |
| 22:30, 4 | "every known party" in 5.4.1 | 5.4.1, checked: no change (the sentence it named went with P5-9) |
| 22:33, the narrowing | the gate waits on the keepers only for an update not every known party signs. *Withdrawn*, by his 22:36 and 22:39 (the lead's note of 22:45) | none (P4 wrote nothing) |
| 22:45, 1, resting on his 22:30 | with keepers named, the gate of every update counts only the assents every keeper shows; an update not shown so is no update, competes with nothing, makes no fork | §3.3 **Gate**, **Update**, 5.5.1(a), 5.5.4, 5.5.7(a), 5.12.2 (P5-3, P5-5, P5-11, P5-14, P5-18, P5-25, P5-27) |
| 22:45, 2 | with keepers named, knots do not show an update late; they still expose a keeper whose record contradicts them | 5.5.4(a) (P5-15, P5-16); 5.5.4(c), 5.8.4 kept |
| 22:45, 3 | a new first act MAY name an earlier agreement; no new field; which field is the codemeister's, nothing chosen | 5.8.3 (P5-20); encoding 3, section 11, item 14 |
| 22:45, 4, resting on "Protect the unknown party"; for him to check | an unknown party's filling under an agreement its keepers left stands as they showed it; nothing reaches it, the new agreement included. *Corrected* by his 23:22–23:29 ("How many keepers are needed"): where a held copy shows it; no copy held, unchecked | 5.10.6 (P5-23; P6-18) |
| 16:44 read as "every keeper named, always" (the lead's, in the ledger) | *Withdrawn*, by his 23:22–23:28: the 16:44 case is two of two, the default | 5.8.3 (P6-15) |
| one keeper run as a group by a cMIP (the lead's lean, 23:22–23:28) | *Withdrawn*, by his 23:28 | none |
| a client duty to keep the keeper's signed record (the lead's lean, 23:29) | *Withdrawn*, by his 23:29: "It’s not something I would specify." | none (5.12.9 unchanged) |
| 23:22, 1 | with keepers named, the update condition's cMIP is asked on the assents they show, its answer passed on per keeper, **not shown** as in force | 5.5.7(c), 5.5.5(c) (P6-11, P6-13) |
| 23:22, 2 | a live keeper that shows an update naming other keepers pins it as any update; only a dead keeper leaves the parties a new agreement to make (the ledger's "dead or alive" of 22:39 corrected) | 5.5.5(d), 5.8.3 (P6-12, P6-16, P6-24) |
| 23:22, 3 | 21:45's answer 2, its second clause, withdrawn with the hatch | the companion's 6.16 |
| 23:22, 4 | one line in §7 beside encoding 3's item 14 | §7 (P6-23) |
| 23:33, resting on his 23:22–23:32 | her filling stands where a held copy of the keeper's signed record shows it; no copy, unchecked; no client duty. How many keepers, the agreement's by its cMIP; with none, every keeper named. The socket: the keeper field's own, a cMIP beside the list, to check; encoding 3 lists it open. The clone of 21:42 is the new agreement of 22:36 | §3.4, §4.2, 5.8.3, 5.10.6, K9, §7 (P6); encoding 3, item 15 |

**Questions for the MOR lead**, one batch, each with the scribe's lean (the scribe's reading, INFERRED, not a proposal):
1. 5.10.6's last sentence, 5.10.8, 5.5.7(f) and §3.3 **Apply** say "a filling": does reading 7 reach them, so that an update reaches a known party's own filling? *Lean*: yes.
2. Reading 10(b) against 5.1.2's "x signs by every one of its signers" where its Terms give no power: may that signing also serve for the pin? *Lean*: yes, one signing as one act.
3. "Naming a new keeper": is a new version naming only the surviving keeper, or none, a way out too? *Lean*: yes; the pin by knots asks nothing of the keepers it names.
4. Reading 2's "every party", written "every known party" (5.4.1): right? *Lean*: yes.

*Answered* by the lead's batch of 22:30: 1, yes (written, P5); 2, yes (written, P5-8); 3, the lead's reading, withdrawn at 22:45; 4, yes (checked, no change left to make).

**P5's questions for the MOR lead**, one batch, each with the scribe's lean (INFERRED, not a proposal):
1. With keepers named and a named condition that counts signatures, an update whose assents the keepers do not show: does the verifier pass on the cMIP's answer on none counted (5.5.7(c), likely **not valid**, per keeper), or answer only **not shown**, as for the default (5.5.5(c))? *Lean*: the cMIP's answer, per keeper, as 5.5.7(c) says, with **not shown** as in force; the text does not say which (the stranger).
2. 5.5.5(d) still lets a live keeper show an update that names other keepers; the lead's line of 22:39 says "Parties who leave a keeper, dead or alive, make a new agreement". Does an update naming a new keeper, shown by the live one, still replace? *Lean*: yes; P5 wrote "no act gets past them as an update" (5.8.3) so as not to contradict 5.5.5(d).
3. 21:45's answer 2 ("knots are a second way, for an update every known party signs"): withdrawn with the hatch, though the note of 22:45 names only 21:45's 3? *Lean*: yes.
4. Should draft 26's §7 list "which field of a first act names an earlier agreement" beside encoding 3's item 14? *Lean*: yes, one line, once the lead says so; P5 added none.

*Answered* by the lead's batch of 23:22: 1, the cMIP's answer, per keeper, with **not shown** as in force (written, P6-13); 2, yes, it replaces (written, P6-12, P6-16); 3, yes, withdrawn with the hatch (the companion's 6.16); 4, yes (written, P6-23).

**For Nobody, allegedly**, one at a time, his:
1. *His*, *answered* by his 22:30 ("An update the keeper never showed is no update"): "Why? The update never got to the keeper, how can it be valid? To be valid the agreement needs to be checked at the keeper." The lead's line, to check: no update, no fork. The question as P3 asked it: where two of three have signed a valid update that the dead keeper will never pin, and all three then sign a new version naming a new keeper, the two are a fork by the rules as written; must they first resolve it, or does the version all three sign stand? (The stranger's case 2.)

P5 has no new question for him: the two lines marked for him above are to check. *Answered* by his 23:22–23:32 (P6, above). P6 has no new question for him; the socket for the keepers' cMIP is the lead's reading, for him to check.

## What waits on the codemeister

Encoding 3's section 11, as P2 left it and P3 kept: open, 1 the set's label, 2 how a set's members are joined (and the empty set), 3 where the set's rule stands, 7 what a keeper's identifier is the hash of, 11 how a cMIP's declared needs are read for case 8, 13 whether the checker applies Text's own rules, 14 which field of a first act names an earlier agreement (P5, the lead's 22:45, 3; now in draft 26's §7), 15 the keepers' cMIP: where it is named, its key, what it is asked (P6); read as the lead's, 4, 5, 6, 8, 10; 9, which the lead reads as met by 5.2.2, to check; 12 `SPEC_DRAFT_26`, computed again by P3 and by P5, for him to check. Also `TEXT`'s values (E25). The vectors the scenarios name, none written: 8.22 to 8.26 (wave four); 8.27 to 8.29 (on his words of 18:39 to 18:51); 8.4's variant (**not shown**, per keeper, K2 named); 8.28's four, rewritten by P5 (the live keeper; the dead keeper, no update and no fork; the new first act W1, no update and no fork; the filling as the keeper showed it), the last waiting on encoding 3's item 14 for W1's field; 8.30 (**not shown** as a replacement, per keeper); 8.31 (**not shown**, per keeper); 8.32 (no update, no fork, per keeper; two variants); 8.33 to 8.35, writable on the text, which rests on the lead's readings, to check; 8.36, now writable (P5); 8.37 and 8.39, writable (P6); 8.38, waiting on item 15; 8.14's set vectors waiting on items 1 and 2.

## What draft 26 hands to other texts

In full in the companion's last section, "What draft 26 hands to other texts"; wave five adds the table below and nothing to the four lists but what P2 checked.
- **The MICS**: the thirteen rules of how a reader answers and reads across legs, the report block, and the evidence-and-accounting line.
- **Envelopes**: the thirteen rules of the baker, the baker's rule for a contest, the three verbs, "uploader", and `prev` and `refs` read as knots.
- **Identity**: rule 34 and the keeper's record; the pair to renumber; a key change continuing the signer's line.
- **Development**: how a cMIP declares what it needs (in its own published text); N9's and N10's client halves; the client duty of 5.12.9; the common cMIPs; "A specification is a Text act, named by its id".

### The 26 rules that moved, for the Dubsar Suite lead's rereads

Copied from the companion's last section (P2's; the pointer column is the scribe's search, INFERRED).

| draft 25 number | its heading | to | draft 25's text, short | the draft 26 rule that points to it |
|---|---|---|---|---|
| G7.3 | G7, Place to look (no heading of its own) | the MICS | With no place named, every answer about what is latest is qualified **as shown**, or **per anchoring** with the anchoring named; never given as latest or whole without saying what it stands on. | §3.6 **Answers** (the qualifiers); 5.5.3; 5.13.5 |
| G8.1 | G8, Say who said it (none) | the MICS | For any answer about the world, about time, or about value under Control, a verifier reports who stated it. | §2 (the MICS: "say who said it"); 5.9.1, 5.11.8, 5.11.9 ("the MICS, §2") |
| G8.2 | G8, Say who said it (none) | the MICS | A time written inside an act is its signer's claim; only a place gives a position; the time is the clock's, or a reader's anchoring, named. | §2; 5.8.5 (the clock the Terms name), 5.13.5 |
| G8.3 | G8, Say who said it (none) | the MICS | No value is reported as moved on an Agreements act alone; whether Control obeyed is the controller's or the receiver's signed word. | §2; 5.11.7 ("its signer's word") |
| G8.4 | G8, Say who said it (none) | the MICS | Who fills a spot, and what a leg received and passed on, are answers about the world, reported with whoever confirmed them. | 5.10.2 ("each act reported by who signed it (the MICS, §2)"); 5.11.3 |
| G9.1 | G9, Unchecked is not passed (none) | the MICS | Lacking a cMIP, an act, an agreement's acts or a place's answer it needs, a verifier answers **unchecked** for every answer that depends on it. | §3.6 **Unchecked**; §2 |
| G9.2 | Where a verifier stops | the MICS | A verifier that stops following answers **unchecked** for what lies beyond and says how far it followed, never **not shown** or **invalid**; how far is not fixed. | §3.6 **Unchecked** (its last sentence, wave five, P1-11: "A verifier that stops before it has applied a grammar rule answers **unchecked** for what it did not reach, and says how far it went"); 5.1.4; §7, "How far a verifier follows" |
| G11.4 | Reading across legs | the MICS | A result that depends on a sequence is read leg by leg, from the reports held, each leg's part given with who signed it. | 5.11.3 ("How a leg report is read is the MICS's report block's") |
| G11.4(a) | Where to look | the MICS | From the Terms that hold a Control task, whether they carry a call and from whom; a leg's reports are with its two sides. | 5.11.2, 5.11.4 |
| G11.4(b) | The tie | the MICS | Two halves of a leg are tied by the act both name (a settlement); shown **matched**, **mismatched** or **one side only**. | 5.11.7 ("How a payment and its confirmation are read together is the MICS's report block's") |
| G11.4(c) | Amounts | the MICS | Two leg reports naming one settlement match where they state the same amount; otherwise both are shown, neither chosen. | K6's row (§6); 5.11.3 |
| G11.4(d) | Silence | the MICS | A call with no report is **unanswered**; Terms holding Control and carrying no call, **no report called for**; neither read as kept or failed. | K8's row (§6: "the call that no report answers (the MICS, §2)") |
| G11.6 | One leg | the MICS | A report answers the call of its own leg and goes to the other side of that leg and no one else; the grammar never follows a receiver beyond one leg. | §3.1 **Report** ("A report goes to the other side of its own leg ... (the MICS)"); 5.1.4; 5.11.5 |
| G14.1 | G14, The baker (none) | Envelopes | Terms MAY name an `envelope`; the holder of the baker's rights is read from the envelope's chain, at the act the Terms cite. | §2 (Envelopes); §4.2 `envelope`, `envelope_at` |
| G14.2 | G14, The baker (none) | Envelopes | Terms naming an envelope count only if the holder at the act they cite is one of their parties, bound by them, and they are not late. | §4.2 `envelope_at` ("What follows from the act it names ... is Envelopes'"); §4.4, case 7 |
| G14.3 | Without the holder, nothing | Envelopes | A verifier asked anything resting on such Terms first reads the envelope, its baker, the act cited and the holder at it. | 5.1.4 ("the answer of Envelopes' rules for such Terms comes first") |
| G14.3(a) | Invalid | Envelopes | Where the holder at the act cited is not among the Terms' parties, nothing lacking, the Terms are **invalid**, and count for nothing. | §4.4, case 7; 5.1.4 |
| G14.3(b) | Not shown | Envelopes | Where the holder is named but not shown bound, the answer, and every answer resting on the Terms, is **not shown**. | 5.1.4 |
| G14.3(c) | Unchecked | Envelopes | Lacking the envelope, the act cited or the chain between, the answer is **unchecked**. | 5.1.4 |
| G14.3(d) | Shown | Envelopes | Where the acts held establish G14.2, the Terms count, and are read as any Terms are. | 5.1.4 |
| G14.4 | G14, The baker (none) | Envelopes | A work edited and baked again has another envelope and another baker. | none |
| G14.5 | The same work, baked again | Envelopes | Anyone may bake the same bytes again; Terms naming that envelope and its baker count; made legible, not forbidden. | none |
| G14.5(a) | Shown beside a bake | Envelopes | Holding several envelopes of the same work, a verifier shows each beside the others, **as shown**. | none |
| G14.5(b) | Never picks | Envelopes | A verifier never chooses between bakes of the same work, nor answers which baker made it. | 5.11.9 ("That its signer is the one who made the work is not shown by any act") |
| G14.5(c) | A client may rank | Envelopes | A client MAY rank such bakes for its person, by knots or an anchoring; the ranking is the client's. | none |
| G14.5(d) | Judging is a cMIP's, or an arbiter's | Envelopes | Which bake has the better claim needs judgment: a cMIP's or a named judge's, reported with whoever it rests on. | 5.11.9 (a baker may contest) |

## The MOR lead's readings, by time

All of 27 November, given to the scribe; each with the rules it shaped and the other reading, in the companion's section 6.
- On the brief's heaviest items: 6.1. The lines that say more than his words: 6.2. The outline's held rules: 6.3.
- 09:16, on M2's rows: 6.4. 09:27, on M3's questions: 6.5. 09:47, on M4's rows: 6.6. 10:07, on M5's rows: 6.7.
- 13:20, on M6's question: 6.8. The rows of the note the lead calls settled: 6.9. 14:33, on M7: 6.10. 14:59, on M8 and M9: 6.11. 15:34, on M10: 6.12.
- Wave four: the lean on four words, and the five lines: 6.13.
- The evening: the fifty rows, 6.14; 18:41, on "by default", 6.15; 20:41, 20:55 and 21:45, with his 20:50 and 21:42, 6.16; 22:30 and 22:45, with his 22:30, 22:36 and 22:39, 6.16, "After P3" (P5); 23:22 and 23:33, with his 23:22 to 23:32, 6.16, "After P5" (P6).
