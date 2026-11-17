# Draft 25 after review 1: the four parts joined

17 November 2026. Written by Claude, the scribe's session R5. A map only, and a record of work: it changes no text of draft 25 or of any other file, writes no new wording, no fix and no rule, and chooses nothing. It joins four parts written by four other sessions and measures one thing (section 2). Where a part looks wrong, it is left as it is and listed under "Rows to check".

**The wish** (Nobody, allegedly, quoted from the ledger, `docs/decisions.md`, branch `claude/lead-records-2`): "I've decided for a total rewrite of agreements from scratch." What must hold: "can I with a single click reward all the people that contributed to the service or good via MOR". On now: "Before redrafting any layer I want to really look at the findings in details, find the right questions and then find one last way for me to zoom out before deciding on the rewrite." And the budget rule: "Once that is over, we.ll focus the rest of the budget on reviewing, no redrafts, no recode." (quoted as the ledger has it)

**Why** (the MOR lead's wording): to show him, before he zooms out, what draft 25 would look like with today's decisions in it: what goes, what moves, what changes, and how much is left.

**Words used here.** "He", "his words": Nobody, allegedly. *Draft 25* is the rewrite of the Agreements rulebook (`docs/agreements-from-scratch/draft-25.md`, branch `claude/agreements-clean-1-hahuwn`, pull request 183, not merged). *Today's decisions* are the ten ledger entries numbered 1 to 10 in `docs/lead/assignments/2026-11-17-wave-2-common.md` (branch `claude/lead-records-2`), from "Three lines cut back" to "Only rules in the hashed text". Each closes with an *"Arrived at (to check)" line*, the MOR lead's reading; where it says more than his words, his words win. A *rule* is a numbered clause of draft 25's section 4 (G1.1 to G14.5) or one of its lettered sub-clauses ((a), (b) …); K1 to K8 are the eight rows of its task table. A *verifier* is the software that applies the rules to signed acts and gives answers. *Envelopes* is the layer where a finished work is sealed ("baked") with its baker named; the *MICS* is the language all of MOR shares; the *layer below* is where acts and keys live. *Narrow* and *wide* are part 2's two readings of "rules" (section 2 below). KB means 1,000 bytes.

**The four parts** (copied unchanged beside this file; section 10):
- Part 1, decisions 1 to 9, rule by rule, with a table giving every numbered rule its fate.
- Part 2, decision 10: what is a rule and what is not, measured, and the companion documents.
- Part 3, the research window's 234 open items (OI-001 to OI-234).
- Part 4, the scribe's wave-1 list: 1,886 places in the repository that lean on the old Agreements, 42 needs, 52 unclear cases.

---

## 1. In plain words

1. Draft 25 is 266 KB. Holding only rules, it would be 140 KB read narrowly (what a verifier checks) or 177 KB read widely (with what a builder needs); today's decisions take it to about 129 KB (111 rules) or about 165.5 KB (136 rules).
2. What leaves: most of the baker's rule (G14) goes to the Envelopes layer, the rules for reading payment reports (G11.4, but for one sub-clause read two ways) go to the MICS, and most of the place (G7) leaves, keeping its field `place` and one sentence.
3. What changes: an update replaces old Terms as soon as their update condition says yes; anyone who signed can walk out by default; where it is unclear whether someone's assent counts, the answer is "unchecked".
4. Of draft 25's 124 numbered rules and its 8 task rows, part 1 finds 13 leave (12 move, 1 goes), 21 change, 38 stay but are touched, 9 can stay or leave, 51 are untouched. The MOR lead's brief counted "106 rules": 106 is section 4's size in KB, not a count.
5. Of 234 open items, 5 close, 68 change, 155 stay, 6 can be read two ways. Of 1,886 places in the repository (sentences or test steps that lean on the old Agreements), 530 are touched.
6. The parts read many moves two ways (more rows than part 1's 9): the size runs from about 115 KB to 131 KB narrow, and from 151 KB to 167 KB wide.
7. One conflict waits for Nobody, allegedly: decision 8's framing (the MOR lead's words, which he agreed to) asks about the "current" holder of the baker's rights, while an earlier exchange of his set "current" aside for the holder when the Terms were made (section 8).

---

## 2. The size

**Step 1, part 2's measure.** Part 2 (one of the four parts this file joins) measured draft 25 (commit `cdb9b74`, 265,705 bytes, 877 lines) and found two sizes for a text holding only rules. This session ran part 2's script (its appendix) on the same file and got the same numbers.

| Reading | What counts as a rule | Bytes | Numbered rules |
|---|---|---|---|
| Narrow | what a verifier checks: section 2 (definitions, less three retired words), section 3 (the data each act carries), section 4's introduction and the clauses of G1 to G14 | 140,414 | 124 (72 clauses and 52 lettered sub-clauses) |
| Wide | the narrow, and section 5 (tasks handed to cMIPs, the documents that plug into the rules) and section 6 (open parameters) | 176,665 | 149 (adding K1 to K8 and 17 parameters) |

**The "106".** The MOR lead's brief gave draft 25 "106 rules". As part 2 found, 106 is not a number of rules: section 4 is 106,081 bytes, which is the "about 106" kilobytes in Fable's review of draft 25 ("the fourteen rules are about 106"). Draft 25 has 124 numbered rules (72 numbered clauses and 52 lettered sub-clauses).

**Step 2, what part 1's table marks "goes" or "moves".** 13 rows: G7.3 goes; G11.4 and G11.4(a) to (d) move to the MICS; G14.1, G14.4, G14.5 and G14.5(a) to (d) move to Envelopes. Their bytes in draft 25, measured by the script in the appendix of this file (it splits section 4 by the same lines as part 2's script: a rule's bytes are its own list line and the paragraphs indented under it):

| Rows | Bytes |
|---|---|
| G7.3 (goes) | 247 |
| G11.4, G11.4(a), (b), (c), (d) (to the MICS) | 5,290 |
| G14.1 (to Envelopes; part 1 keeps its field `envelope` in Agreements: that first sentence, 103 bytes, is inside the 1,712 and is counted here as moving; see "Rows to check" at the end of this file) | 1,712 |
| G14.4, G14.5, G14.5(a) to (d) (to Envelopes) | 1,920 |
| **Total** | **9,169** |

**Step 3, the parts of "changes" rows that part 1 says leave Agreements.** Part 1 marks these rows "changes", not "moves", because the clause stays; but it says a part of each leaves. Measured the same way:

| Part | Where part 1 sends it | Bytes |
|---|---|---|
| G14.2's paragraph "A double sale" | Envelopes | 627 |
| G11.7's sentence "As for any two halves … **one side only**;" | the MICS | 209 |
| G7.2, cut to "the one sentence": measured here as all of G7.2 leaving, with G7.4's first sentence (205 bytes) kept as the one rule. Part 1 says the two merge into one sentence; whatever of G7.2 the merged sentence keeps is not counted back | the relay or a cMIP | 789 |
| G7.4's clock part ("Terms MAY also name a `clock`" to the end of the clause) | leaves G7 | 275 |
| K6's sentence "Two reports that name the same settlement match … (G11.4)" (section 5, so in the wide reading only) | the MICS | 95 |

These take away bytes but no number from the rule count: each of these clauses keeps its number in Agreements (G7.2's number is kept by the one merged sentence).

**The result.**

| | Narrow | | Wide | |
|---|---|---|---|---|
| | bytes (KB) | rules | bytes (KB) | rules |
| Draft 25 today, whole | 265,705 (265.7) | 124 | 265,705 (265.7) | 149 |
| Rules only (part 2) | 140,414 (140.4) | 124 | 176,665 (176.7) | 149 |
| Less "goes" and "moves" (step 2) | 131,245 (131.2) | 111 | 167,496 (167.5) | 136 |
| Less also the leaving parts of "changes" rows (step 3) | **129,345 (129.3)** | **111** | **165,501 (165.5)** | **136** |

Against today's 265,705 bytes, step 3 is 48.7 % (narrow) and 62.3 % (wide). The "rules" column counts numbered clauses and lettered sub-clauses (in the wide reading also K1 to K8 and the parameters); it counts nothing that decisions 2 to 4 might add, since no wording for them is written.

**Where a move can be read two ways.** Each line below starts from step 3 (129,345 narrow, 165,501 wide) and changes only what it names.

| Reading | Whose | Bytes | Narrow | Wide |
|---|---|---|---|---|
| **How much of G14 moves.** Part 1: G14.1, G14.4, G14.5 and (a) to (d) move, the double sale with them; G14.2's check and G14.3 stay (this is step 3) | part 1 | 0 | 129.3 KB, 111 rules | 165.5 KB, 136 rules |
| The whole baker's rule but the check: G14.3 and its four answers, and G14.5(e), move too | part 4, 8b(i) | −3,741 | 125.6 KB, 105 | 161.8 KB, 130 |
| As above, and G14.2's paragraphs "Bound by them" and "Late Terms" too (only its check stays) | part 4, 8b(i), read to the end | −6,757 | 122.6 KB, 105 | 158.7 KB, 130 |
| Only the envelope's chain moves: G14.5 and (a) to (d) stay (part 4 does not name G14.4; it is left moving, as in part 1) | part 4, 8b(ii) | +1,762 | 131.1 KB, 116 | 167.3 KB, 141 |
| G14.2's "Late Terms" paragraph moves with the chain | part 1 (left open there) | −1,408 | 127.9 KB, 111 | 164.1 KB, 136 |
| G14.5(e), the original baker's contest, moves | part 1, two readings | −302 | 129.0 KB, 110 | 165.2 KB, 135 |
| **Whether G11.6 moves.** Its own text ("One leg …") moves to the MICS | part 4, 8c(i) | −1,064 | 128.3 KB, 110 | 164.4 KB, 135 |
| G11.6's own text and G11.6(c) ("One leg is the block's, in every layer …") move | part 4, 8c(i), read with (c) | −1,337 | 128.0 KB, 109 | 164.2 KB, 134 |
| G11.6 stays (part 1; part 4, 8c(ii)) | parts 1 and 4 | 0 | 129.3 KB, 111 | 165.5 KB, 136 |
| **Whether the clock leaves with the place.** Only G7's words on the clock leave (this is step 3) | parts 1 and 4, (i) | 0 | 129.3 KB, 111 | 165.5 KB, 136 |
| The clock leaves the grammar entirely: also section 2's "Clock" and section 3.1's `clock` row. Not measured: the words "per clock" inside G4.7(b), G4.11(c), G8.2, G10.5, G13.4 and G4.7(e), which sit in clauses that stay | parts 1 and 4, (ii) | −266 | 129.1 KB, 111 | 165.2 KB, 136 |
| **Other rows part 1 reads two ways.** G6.1 and G6.2 move to the layer below | part 1, decision 6 (ii) | −1,628 | 127.7 KB, 109 | 163.9 KB, 134 |
| G11.1, G11.3, G11.4(e) and G11.5 move to the MICS | part 1, decision 8 | −4,299 | 125.0 KB, 107 | 161.2 KB, 132 |
| **The two ends.** Everything read as leaving leaves at once (G14 to the end of part 4's 8b(i), G11.6 with (c), the whole clock, G6, G11.1, G11.3, G11.4(e), G11.5) | all | −14,287 | 115.1 KB, 97 | 151.2 KB, 122 |
| Nothing read two ways leaves, and G14 is read as part 4's 8b(ii) | all | +1,762 | 131.1 KB, 116 | 167.3 KB, 141 |

So, with today's decisions in it, a rules-only draft 25 would be **about 129 KB holding 111 rules, read narrowly, or about 165.5 KB holding 136 rules, read widely**; between **115 and 131 KB (97 to 116 rules) narrow**, and **151 and 167 KB (122 to 141 rules) wide**, as the readings fall.

How it was measured, and what it leaves out:
- Bytes are UTF-8 bytes of whole lines (with their line ending), or, for the parts of a line in step 3, of the span named, as the appendix's script cuts it.
- Part 2 says section 4's clauses are 100,157 bytes; the 124 rows measured here add up to 99,793. The other 364 bytes are blank lines and lines inside section 4 that no single row owns; they stay in every size above.
- Nothing is added for what decisions 2, 3 and 4 would write in (a default way out, a home for "unchecked"), since no such wording exists. Nothing is taken away for rules that "change" by losing a few words (G4.1, G4.7, G4.8, G5.4, G5.5, G12.1, G13.3 and the rest): part 1 names what they lose, but not as bytes that could be cut without new wording.
- Part 2's other measured rows are not redone here; for example its row between the narrow and the wide, the narrow reading plus section 5's task table (148,465), would lose the same 9,169 + 1,900 + 95 bytes.

---

## 3. What goes, what moves, what changes

From part 1's table (132 rows: the 124 rules and K1 to K8), grouped by destination. Fate, decision and note are part 1's, copied. The parts of a "changes" row that leave (section 2, step 3) are listed again under their destination, marked "part of". Section 2's definitions, section 3's fields and section 7's stated costs have no numbered rules; what part 1 says of them is in the last rows.

**Stays, untouched** (51 rows, no decision touches them): G1.1, G1.5, G2.1, G2.2, G3.1, G3.2, G4.4, G4.7(d), G4.8(b), G4.8(c), G4.8(e), G4.8(f), G4.11, G4.11(a), G4.11(b), G4.11(f), G4.11(g), G4.11(h), G4.11(i), G5.1(a), G5.1(b), G5.2, G5.3, G5.6, G5.6(a) to (f), G5.7(a) to (c), G8.1, G8.3, G8.4, G8.5, G9.2, G10.1 to G10.4, G10.6(a), G10.6(b), G10.7, G12.2, G12.7, G13.2, K3, K5, K7.

| Destination | Rule | Fate | Decision | Note (part 1's) |
|---|---|---|---|---|
| Stays in Agreements, changes | G4.1 | changes | 2 | no longer decides whether a version replaces; "its own later life" read two ways |
| Stays in Agreements, changes | G4.3 | changes | 3 | a signer who has left is no longer bound |
| Stays in Agreements, changes | G4.5 | changes | 2 | old Terms are replaced when the condition answers valid |
| Stays in Agreements, changes | G4.7 | changes | 2 | fork and late update lose "its own `in_force`" |
| Stays in Agreements, changes | G4.7(a) | changes | 2 | "valid and in force" becomes valid |
| Stays in Agreements, changes | G4.7(b) | changes | 2, 9 | as (a); "per clock" open (9) |
| Stays in Agreements, changes | G4.8 | changes | 2 | the second gate goes |
| Stays in Agreements, changes | G4.8(a) | changes | 2, 4 | "in force by its own `in_force`" goes (2); unclear assent to the original becomes unchecked (4) |
| Stays in Agreements, changes | G4.10 | changes | 4, 3 | "not shown" on order becomes unchecked (4); whether a way out works after in force: open (3) |
| Stays in Agreements, changes | G5.4 | changes | 2 | "valid … and in force" becomes valid |
| Stays in Agreements, changes | G5.5 | changes | 2, 3 | the hand-written in-force exception has nothing left to do (2); can the agent leave by default (3): open |
| Stays in Agreements, changes | G7.1 | changes | 9 | the field stays, as a pointer to a relay |
| Stays in Agreements, changes | G7.2 | changes | 9 | cut to the one sentence; the list of answers per place and a place contradicting itself go to the relay or a cMIP |
| Stays in Agreements, changes | G7.4 | changes | 9 | its first sentence is the one rule; the clock part leaves G7 |
| Stays in Agreements, changes | G9.1 | changes | 4 | the unclear-assent case needs a home: here, or where each case arises |
| Stays in Agreements, changes | G11.7 | changes | 8 | the buyer's leg stays; its matched / mismatched / one side only sentence moves to the MICS |
| Stays in Agreements, changes | G12.1 | changes | 2, 6 | an update of Terms no longer needs "those whose assent G4.1 asks for" (2); the signer's line follows G6 (6) |
| Stays in Agreements, changes | G13.3 | changes | 2 | "in force … and, for a replacing version, valid" becomes valid for a replacing version |
| Stays in Agreements, changes | G14.2 | changes | 8, 1 | cut to the one check, holder a party; double sale moves; late Terms open; "bound by them" and "nothing in an agreement" open (1) |
| Stays in Agreements, changes | K2 | changes | 2 | its output no longer decides whether a version replaces |
| Stays in Agreements, changes | K6 | changes | 8 | the match-on-amount sentence moves to the MICS; whether its line kinds go with the block: open |
| Stays in Agreements, changes or stays (two readings) | G4.11(e) | changes or stays | 3 | two readings: the default way out is written into the default condition, or stands beside it |
| Stays in Agreements, changes or stays (two readings) | G5.1 | changes or stays | 3 | two readings: "if, and only if" changes for one who left, or the way out is written elsewhere |
| Stays in Agreements, text as it is | G1.2 | stays | 6 | "stands there in its signer's own line (G6.1)" follows G6 |
| Stays in Agreements, text as it is | G1.3 | stays | 3, 8 | Agreements keeps the receiver (8); can a receiver leave (3), open |
| Stays in Agreements, text as it is | G1.4 | stays | 8, 9 | Agreements keeps it (8); its G14.3 check reads what stays of G14; "per place" follows the one rule (9) |
| Stays in Agreements, text as it is | G4.2 | stays | 2 | open: still a MUST for a replacing version? |
| Stays in Agreements, text as it is | G4.6 | stays | 9 | "Which place" (which version's place counts): open |
| Stays in Agreements, text as it is | G4.7(c) | stays | 9 | "per clock" open |
| Stays in Agreements, text as it is | G4.7(e) | stays | 9 | "the place and the clock (G7)" listed; clock open |
| Stays in Agreements, text as it is | G4.8(d) | stays | 9 | which version's place: open |
| Stays in Agreements, text as it is | G4.8(g) | stays | 2 | confirmed by 2; its history wording is decision 10's, another part |
| Stays in Agreements, text as it is | G4.9 | stays | 3, 5 | leaving does not end the agreement (3); "does end it" read two ways (5) |
| Stays in Agreements, text as it is | G4.11(c) | stays | 9 | "per the clock": open |
| Stays in Agreements, text as it is | G4.11(d) | stays | 2 | confirmed by 2 |
| Stays in Agreements, text as it is | G5.1(c) | stays | 3, 1 | is one who left still bound by later updates (3): open; G14.2's "bound by them" leans on it (1) |
| Stays in Agreements, text as it is | G5.7 | stays | 3 | "Who is covered" is one draft 25 answer to what leaving must not erase |
| Stays in Agreements, text as it is | G8.2 | stays | 9 | "per the clock the agreement names": open |
| Stays in Agreements, text as it is | G10.5 | stays | 9 | "the place and the clock": clock open |
| Stays in Agreements, text as it is | G10.6 | stays | 3 | is one draft 25 answer to what leaving must not erase |
| Stays in Agreements, text as it is | G11.2 | stays | 8 | the call in Terms, kept |
| Stays in Agreements, text as it is | G11.6 | stays | 8 | one leg is already the block's; the rule on following no receiver is kept |
| Stays in Agreements, text as it is | G11.6(a) | stays | 8 | consent to data beyond one leg, kept |
| Stays in Agreements, text as it is | G11.6(b) | stays | 8 | the buyer's leg and who has agreed, kept |
| Stays in Agreements, text as it is | G11.6(c) | stays | 8 |  |
| Stays in Agreements, text as it is | G11.8 | stays | 8, 3 | the contest, kept (8); "a contest still possible" after leaving (3) |
| Stays in Agreements, text as it is | G12.3 | stays | 6 | for a fork in a signer's line, follows G6 |
| Stays in Agreements, text as it is | G12.4 | stays | 6 | for a fork in a signer's line, follows G6 |
| Stays in Agreements, text as it is | G12.5 | stays | 3 | is one draft 25 answer to what leaving must not erase |
| Stays in Agreements, text as it is | G12.6 | stays | 6 | "in one signer's line, as G6.2 says" follows G6 |
| Stays in Agreements, text as it is | G12.8 | stays | 6 | "that signer's latest act" follows G6 |
| Stays in Agreements, text as it is | G13.1 | stays | 3 | is one draft 25 answer to what leaving must not erase |
| Stays in Agreements, text as it is | G13.4 | stays | 9 | it is the one rule for the place; the clock open |
| Stays in Agreements, text as it is | G14.3 | stays | 8 | what follows for Terms that fail the check stays in Agreements; its "MUST first read" leans on Envelopes |
| Stays in Agreements, text as it is | G14.3(a) | stays | 8, 1 | invalid stays; "never count" / "for good" open (1) |
| Stays in Agreements, text as it is | G14.3(b) | stays | 8, 1 | rests on "bound by them" (1): open |
| Stays in Agreements, text as it is | G14.3(c) | stays | 8 | the fork-in-chain part leans on Envelopes |
| Stays in Agreements, text as it is | G14.3(d) | stays | 8 |  |
| Stays in Agreements, text as it is | K1 | stays | 1 | "gives nothing for the baker's rights": open (1) |
| Stays in Agreements, text as it is | K4 | stays | 2, 3 | confirmed as deciding updates alone (2); default way out beside it or in it (3): open |
| Stays in Agreements, text as it is | K8 | stays | 8 | consent to data beyond one leg, kept |
| Envelopes | G14.1 | moves | 8, 1 | to Envelopes, but for the field `envelope` (and `envelope_at`, open); "from nothing in any agreement" open (1) |
| Envelopes | G14.4 | moves | 8 | to Envelopes |
| Envelopes | G14.5 | moves | 8 | to Envelopes |
| Envelopes | G14.5(a) | moves | 8 | to Envelopes |
| Envelopes | G14.5(b) | moves | 8 | to Envelopes |
| Envelopes | G14.5(c) | moves | 8 | to Envelopes |
| Envelopes | G14.5(d) | moves | 8 | to Envelopes |
| Envelopes, or stays (two readings) | G14.5(e) | stays or moves | 8 | the contest is Agreements' (G11.8); the case is the same-work rule's |
| The MICS | G11.4 | moves | 8 | to the MICS, with the report block |
| The MICS | G11.4(a) | moves | 8 | to the MICS |
| The MICS | G11.4(b) | moves | 8 | to the MICS: matched, mismatched, one side only |
| The MICS | G11.4(c) | moves | 8 | to the MICS: both amounts shown |
| The MICS | G11.4(d) | moves | 8 | to the MICS: unanswered; "Who is a side, for silence" asks K8, which stays |
| The MICS, or stays (two readings) | G11.1 | stays or moves | 8 | sequence and leg: kept with the call, or with the reading rules (MICS) |
| The MICS, or stays (two readings) | G11.3 | stays or moves | 8 | the leg report: what it carries (K6), or how it is read (MICS) |
| The MICS, or stays (two readings) | G11.4(e) | stays or moves | 8 | reads calls and data consent from Terms (kept), yet sits in G11.4 (moves) |
| The MICS, or stays (two readings) | G11.5 | stays or moves | 8 | a reading rule, or a rule on what each side signs |
| The layer below, or stays (two readings) | G6.1 | changes, and stays or moves | 4, 6 | private act held unread becomes unchecked for what depends on it (4); stays or moves to the layer below (6) |
| The layer below, or stays (two readings) | G6.2 | stays or moves | 6 | two readings: Agreements' own line, or the signer's line of the layer below |
| Goes | G7.3 | goes | 9 | "the rest of G7"; G13.4 already holds the no-place case |
| Envelopes | part of G14.2 | "A double sale" | 8 | "that is a fork in the envelope's chain, and it is read as that layer reads forks" |
| Envelopes | section 2, "Bake, envelope, baker"; section 8.1, "The envelope's chain, from the layer below" | move | 8 | "already 'named here, not defined'. The move gives them a home" |
| The MICS | part of G11.7 | "As for any two halves … one side only" | 8 | the sentence moves; the buyer's leg stays |
| The MICS | part of K6 | "Two reports that name the same settlement match …" | 8 | the sentence moves; whether K6's line kinds go with the block is open |
| The MICS | section 2, "Answers", last paragraph | confirmed | 8 | "already says these are 'not answers of this text'" |
| The layer below | every "its signer's own line" in G1.2, G4.10, G12.1 to G12.4, G12.6, G12.8 and the kind `resolve` | follows G6 | 6 | each clause stays; only its words on a signer's line follow G6's fate |
| The layer below | section 8.1, what the Sign layer does when a key is replaced or lost | answered as a need | 6 | "a key change continues the signer's line" |
| The relay or a cMIP | part of G7.2 | the list of answers that count per place; a place contradicting itself | 9 | "go to the relay or a cMIP" |
| The relay | section 8.1, "A place, from the layer that orders acts" | move | 9 | the five needs ("how a relay orders" is on the MOR lead's list) |
| Leaves G7 | part of G7.4 | the clock | 9 | whether the clock leaves the grammar entirely is read two ways |
| A companion document | none of the 132 rows | | 10 | part 1 maps decisions 1 to 9; what decision 10 sends out is in section 4 below. Part 2 notes G4.8(g) is history in its whole; part 1: "its history wording is decision 10's" |
| The MOR 2 list | Fable's one sentence on how a later specification's version replaces an earlier one's | not written in MOR 1 | 5 | "it goes on the MOR 2 list" |
| Goes | section 7, "No default way out" | goes | 3 | "this stated cost is the opposite of the decision" |

---

## 4. The companion documents

**From part 2.** Decision 10 sends out of the hashed text everything that is not a rule. Part 2's grouping (the scribe's, "by what a reader would come for; nothing in the ledger sets it"):

| Group | What a reader comes for | Bytes | In which reading it leaves |
|---|---|---|---|
| The reasons behind the rules | "Lie exposed" and "Protects" of G1 to G14; section 1; "The test of this text". Beside the existing `reasons-25.md` | 7,535 | both |
| The history of the drafts | what each draft changed; three retired words. Joins the existing `history.md`. Not counted: 2,033 bytes naming earlier drafts inside the rules | 5,118 | both |
| The open lists | section 8's introduction, 8.2, 8.3, 8.4 | 24,669 | both |
| What the other layers must give | section 8.1; "One block used here is not this text's" | 13,758 | both |
| The stated costs | section 7 | 18,645 | both |
| A builder's and encoder's guide | sections 9 and 10; "What it is for" | 16,690 | both |
| About this file | title, date, wish, what it is, how to read it, its spec hash | 2,621 | both |
| The cMIP author's map | section 5 whole | 20,612 | narrow only |
| The open parameters | section 6, P1 to P21 as listed | 15,639 | narrow only |

89,040 bytes leave in both readings (with a 4-byte separator line); 36,251 more leave in the narrow reading only. Part 2 lists seven things a verifier would miss if they left (its section 5): the task table's rows, which the narrow rules point into (above all K6's, the only list of what a leg report carries); the spec hash paragraph; three "until then" answers in section 8.2 (items 14 to 16); the duties of clients (G12.8, G14.5(c)); the rules' pointers to open parameters; sections 5.1 and 5.2 in the wide reading; and nothing in the reasons, history, costs or sections 9 and 10, but for the warning that a builder handed only the rules would not see where the grammar knowingly stops.

**What part 1 adds to them.** Each of these is said in part 1; none is placed in a group by part 1.
- *The stated costs* lose "No default way out" (section 7), which decision 3 reverses. Decision 4's cost, as the MOR lead's lean put it, "the cost on those taking her share", "is not written there yet".
- *What the other layers must give* (section 8.1) changes: what the Sign layer does on a key change is "answered as a need" (decision 6); the five needs of a place "move to the relay" (decision 9); the envelope's chain gets a home in Envelopes (decision 8). Whether the core's act format "already gives … a per-signer line of acts (which would make G6 redundant)" stays open under decision 6's two readings.
- *The open lists*: section 8.3, item 2 (the new version's own `in_force`) is "answered, for whether the update replaces" (decision 2); what "its own later life" means is still open. Three baker questions go back on the open list (decision 1).
- *A MOR 2 list*: Fable's one sentence on crossing to a later specification goes there, not into MOR 1 (decision 5).
- *History*: G4.8(g)'s history wording is "decision 10's" (part 1's table); part 2 counts G4.8(g) as history in its whole.
- *The head of draft 25*: its sentences "so 'invalid' stays an act that never counted" (decision 1c) and "a later draft is a new specification … nothing written under this one is updated" (decision 5, stays) are in parts that part 2 sends to "About this file" and "The history of the drafts".

---

## 5. The open list, shortened

From part 3 (OI-001 to OI-234, the research window's list, branch `claude/research-open-items-3t05ih`).

| Result | Count |
|---|---|
| closes | 5 |
| changes (moves elsewhere, or becomes another question) | 68 |
| stays | 155 |
| two readings (closes under one reading, only changes under another) | 6 |
| **Total** | **234** |

- **Closed:** OI-005 and OI-014 (decision 4), OI-013 (decision 2), OI-033 (decision 3), OI-226 (decision 1). All five are on part 3's own "to check" list (section 9 below).
- **Two readings:** OI-002, OI-035 (decision 9); OI-010 (decision 4); OI-074, OI-219 (decision 3); OI-130 (decision 8).
- **Changes, by decision** (an item may count under two): decision 1: 5; decision 3: 1; decision 6: 13; decision 8: 46; decision 9: 7; decision 10: 3. Decisions 2 and 4 change none (each closes items); decisions 5 and 7 touch no item.
- **The 40 items marked as changing a verifier's answer:** 2 close (OI-005, OI-014), 2 two readings (OI-002, OI-035), 11 change, 25 stay.
- By cluster, the baker and the envelope changes most (22 of 23); acting for others least (24 of 25 stay).

---

## 6. The wave-1 list

From part 4 (the scribe's list `docs/agreements-from-scratch/old-agreements-pointers.md`, branch `claude/old-agreements-pointers-knyyf4`: 1,886 places, in 31 files).

**Places touched: 530 of 1,886**, each counted once; 90 are touched by two decisions or more.

| Decision | Places |
|---|---|
| 1 (1a 19; 1b, the widest reading of ownership reopened, 76) | 89 |
| 2, the two gates | 97 |
| 3, a way out by default | 26 |
| 4, unclear means unchecked | 4 |
| 5, crossing to a new text | 16 |
| 6, two threads, two owners | 25 |
| 7, one freeze | 37 |
| 8 (8a the baker 78; 8b the report block 97) | 174 |
| 9, the place is a pointer (31 of them point only to the clock) | 111 |
| 10, pointers to parts that leave the hashed text | 53 |

Without the two light groups (1b and 10): 460. By file, the MICS has most (185 of its 536 places).

**Needs: 15 of 42 touched.** Draft 25's section 8.1, 10 of 20: 8.1-1, 8.1-2, 8.1-3, 8.1-5, 8.1-6, 8.1-7, 8.1-8, 8.1-12, 8.1-13, 8.1-14. The wave-1 list's own, 5 of 22: N1, N5, N6, N12, N13. Two are answered in part: what a key change does (8.1-3, decision 6) and that all six freeze together (N1, decision 7). None is answered in full.

**Unclear cases: 17 of 52 touched:** UC-01, UC-50, UC-04, UC-08, UC-12, UC-13, UC-14, UC-28, UC-33, UC-20, UC-26, UC-30, UC-35, UC-39, UC-43, UC-46, UC-48. One is answered, for MOR 1: UC-48 (a MOR 2 act replacing a MOR 1 version). The three "Arrived at" lines of the wave-1 list's section 4b are all open again, by decision 1.

---

## 7. Every reading that can go two ways

Gathered from the four parts, by decision. None is chosen. Where two parts read the same thing differently, both are shown and the difference is said.

### Decision 1, three lines cut back
- **"Bound by them"** (part 1, 1a): must the holder of the baker's rights be a party, or a party and bound? Party only: "the owner of the bake rights have to be a party of the agreement that rules the envelope"; bound as well: "Agreed" to the lean "that the baker must be a party and bound" ("The baker's rights after a sale").
- **"Not by agreements"** (part 1, 1b): (i) no agreement takes part in stating ownership, as draft 25 has it; (ii) the envelope states the owner, and how a transfer comes about is left open. Part 4 counts the widest reading of this (every place resting on draft 24's ownership agreement, 76) apart.
- **"An act that never counted"** (part 1, 1c): does his "Invalid yes, sorry" mean "never counted, from the start", or only "counts for nothing"?
- **What decision 1 cut from "The holder at the time"** (part 3, OI-226): the MOR lead named one phrase; the item names three ("to dodge a later transfer", "the buyer holds the rights from then on", "so 'invalid' stays an act that never counted"). Part 3 notes the current line holds none of the three; decision 1 named only the third.

### Decision 2, the two gates
- **"Its own later life"** (part 1; part 3, OI-013): the MOR lead's words, not his. (i) A replacing version is in force from that moment, and its `in_force` is read only where something else asks it; (ii) it is in force only once its own `in_force` is met, so for a while no Terms would be in force, which clashes with G4.9.
- Open in part 1, not as two readings: whether G4.2 still binds a replacing version; when a replacing version is "in force" for G4.10's counter signature; whether G14.2's "not in force" still applies.

### Decision 3, a way out by default
- **"Agreements have their own way out"**: part 1: (i) Terms that keep someone in must themselves give a way out; (ii) every agreement already has a way out, its updates. Part 4 (3a): (i) such Terms must contain a way out; (ii) they are left to their own update condition. The two parts read it the same way.
- **"Always"**: here the parts differ. Part 1: (i) as (c), the default offers a way out and Terms can switch it off; (ii) "always" as a block that is always there, closer to (b). Part 3: (i) the default always includes an exit that Terms may switch off; (ii) a way out is always on offer, and Terms that keep someone in must carry their own. Part 3's second reading is not part 1's second reading: part 1's (ii) is a block no Terms can switch off; part 3's (ii) is close to part 1's (i) of "their own way out".
- **What leaving must not erase**: the parts differ. Part 1: "The lean says 'leaving never erasing what is owed', and he agreed to the lean", and the line "says *less* than the lean he agreed to". Part 3 (OI-033) and part 4 (N8): those three things "are not in his words" / "not in his words or in the 'Arrived at' line". Both are true of the record; they weigh it differently.
- **Where it is written** (part 1): in G4.11(e)'s default update condition, or beside it; G5.1 changes, or the way out is written elsewhere; in which field Terms "say so".
- **The delegator** (part 3, OI-074): "default should always offer a way out" covers a delegator, or decision 3 is about a signer leaving Terms and ending a delegation still rests on "I lean a." Part 1 asks the other side: whether the agent can leave by default.
- **The client rule** (part 3, OI-219): the default gives the client duty a guarantee to point at, or the rule's "what the person can always do" clashes with Terms that may keep someone in.

### Decision 4, unclear means unchecked
- **How far it reaches.** The parts read along two different lines. Part 1: which assents are "unclear": (i) only an assent held whose counting is unclear (A6, A9); (ii) also an assent that might exist and is not held. Parts 3 and 4: which answers are touched: narrow, only whether an update replaces the old Terms (the case set out); wide, every answer that depends on the assent (the "Arrived at" line). These are two questions, not two readings of one; both stand.
- **Which answer word** (part 3): the option says the update "is not shown as replacing"; the title and the line say "unchecked".
- **Its home** (part 1): a new cause in G9.1, or written where each case arises (G4.8(a), G4.10, G6.1).
- **OI-010** (part 3): the race between a counter signature and the last assent stays under the narrow reading, changes under the wide.

### Decision 5, crossing to a new text
- **"Does end it"**: the parts differ. Part 1: (i) it ends only as MOR 2 sees it, and G4.9 is untouched; (ii) MOR 1 must say an agreement can end by a move, which touches G4.9. Part 4 (5a): (i) a move ends it unless it is updated; (ii) it may or may not end it, and MOR 2 decides; either way G4.9 stays inside MOR 1. Part 3: his word is "potentially", the line says "ends"; no item turns on it. Part 1 asks whether MOR 1 changes; part 4 asks whether the end is certain.

### Decision 6, two threads, two owners
- **Is G6 the signer's line?** (part 1): (i) G6's line runs within one agreement, so it is not the life-long line and stays; (ii) it is one signer's acts, so it moves to the layer below.
- **What "It does" answers** (part 1, not fixed; part 3; part 4, 6a): the whole lean, or only its last part.
- Open in part 1: if (ii), whether acts still carry `previous` in Agreements' fields; whether Agreements still answers "fork" (G6.2) or passes on the layer below's answer.

### Decision 7, one freeze
- **What "Fine with me" says of Agreements** (part 4, 7a): (i) Agreements is one of the six that freeze together; (ii) it says only when the six freeze, not whether draft 25's file, under its own hash, is the text that freezes. Part 1: decision 7 touches no rule.

### Decision 8, where three rules live
- **"Current holder" or the holder at the act cited**: parts 1, 3 and 4 all flag it. Section 8 below sets it out.
- **How much of G14 moves**: the parts differ. Part 1: G14.1, G14.4, G14.5 and (a) to (d) move; the check (G14.2, cut down) and G14.3 with its four answers stay, since they are about whether an agreement counts. Part 4 (8b): (i) the whole baker's rule moves, Agreements keeping only the check (G14.2 in part); (ii) only the envelope's chain moves, G14.3 and G14.5 staying. Part 1's map is neither of part 4's readings: G14.3 stays as in part 4's (ii), and G14.5 moves as in part 4's (i). Sizes in section 2.
- **Late Terms** (part 1): stay with the check, or move with the chain.
- **G14.5(e), the original baker's contest** (part 1): stays with G11.8, or moves with G14.5.
- **What the last "Agreed" covers** (part 1, not fixed; part 4, 8a): the report block's home and the list of what Agreements keeps, or the home only.
- **G11.6, "a report goes no further than its leg"**: the parts differ. Part 1: G11.6 and G11.6(c) stay, since what they add in Agreements is kept. Part 4 (8c): (i) it is a rule of the report block and moves to the MICS; (ii) it is part of the consent to data beyond one leg, which stays.
- **Parts neither list names** (part 1): G11.1, G11.3, G11.4(d)'s "who is a side", G11.4(e), G11.5, and K6's five line kinds: each can stay or go with the block.
- **OI-130** (part 3): reading across legs leaves the Agreements grammar (closes), or it goes to the MICS, not to data cMIPs as the item asks (changes).

### Decision 9, the place is a pointer
- **The clock**: parts 1 and 4 read it two ways; part 3 does not. Part 1: (i) only G7's words on the clock leave, and the field and "per clock" stay; (ii) the clock leaves the grammar entirely. Part 4 (9a): (i) yes, it leaves, by the "Arrived at" line and the MOR lead's list; (ii) his words speak only of the place. Part 3 marks OI-023 and OI-167 "changes" on the clock leaving (see "Rows to check").
- **Which version's place** (part 1): are G4.6 and G4.8(d) "which answers count per place" (leave), or part of "where the Terms name a place" (stay)?
- **"Only once the place shows it"** (part 1): stays as part of "takes what is latest from it", or leaves; section 7's "Closed world hurts the one who did not lodge" rests on it.
- **"Pointer to a relay"** (part 1): is a relay draft 25's "layer that orders acts"; how is a relay named without a server address?
- **How little** (part 3): he agreed to the MOR lead's cut (the field and one sentence), or "simpler than what we are discussing" asks for less still.
- **OI-002, OI-035** (part 3): the one sentence orders the two updates / makes a reader ask the place (closes), or it covers only what is latest under a named place (changes).

### Decision 10, only rules in the hashed text
- **What a rule is** (part 2): narrow (what a verifier checks) or wide (with sections 5 and 6). A third reading, "only what changes a verifier's answer", is seen and not measured.
- **Inside the rules** (part 2): whether the 2,033 bytes naming earlier drafts and the quoted words of Nobody, allegedly (about 3 KB) leave. "If the quotes leave, the hashed text carries no words of his."
- **Which texts** (part 4, 10a): draft 25 only, or every hashed text, the MICS and the other rulebooks too.

---

## 8. One conflict: "current holder" or "the holder at the time"

Parts 1, 3 and 4 each flag it; none resolves it, and neither does this file.

**In plain words.** A baker's rights to a work can be sold. Terms that name the work count only if the right person is one of their parties. Two exchanges in the ledger point at two different people: in decision 8's framing (the MOR lead's words; decisions 1 and 8 are both of 17 November, numbered by the MOR lead), the person who holds the rights *now* ("current"); in an earlier exchange (in the ledger under 13 November), the person who held them *at the moment the Terms point to*. If a sale has happened in between, these are two different people, and Terms made before the sale count under the second reading but not under the first.

**Decision 8, "Where three rules live"**, as the ledger has it, whole:

> **Where three rules live** (17 November, the review after wave 1; Fable's review, section 6). With F84 standing, the MOR lead reframed Fable's staged freeze as where three rules live: the baker into Envelopes, Agreements asking only whether the current holder is a party; reading across legs (G11.4) to the report block, Agreements keeping the receiver, the call in Terms, the buyer's leg, the contest and the consent to data; the place staying in Agreements until the layer that orders acts is written. He: "Agreed for the first, not sure I get the second, expand on third too" The MOR lead set out the two kinds of rules in G11 (what people sign; how any report is read) and that the report block has no home yet; and what a place is (what orders an agreement's acts and answers what is latest for every reader; Agreements says only that named Terms' place is read; the place itself is for a layer not yet written). He: "Remind me where the report was born, what layer?" The MOR lead: born in Agreements (the leg report in rule 11, after the click test on draft 10), made a block for all of MOR in his words ("Let's look at wether a more generic rule about MOR can solve it. Tasks may or may not call for a report."; "Yes, I lean so too. It is elegant, and can be used wherever it is needed."); by the admission test its home is the shared language, the MICS. He: "Agreed"
> - *Arrived at (to check):* the baker's rule moves into Envelopes; the report block's home is the MICS, and the rules for reading reports (matched, mismatched, one side only, both amounts shown, unanswered) go with it; Agreements keeps what people sign: the receiver, the call in Terms, the buyer's leg, the contest and the consent to data beyond one leg. The place: explained, not yet confirmed.

**"The holder at the time"**, as the ledger has it, whole:

> **The holder at the time** (draft 23, pull request 178, section 8.2 items 1 and 2: read as "current", a sale makes every earlier agreement stop counting, and a thief's "invalid" could change with a later transfer). The MOR lead leaned, from "now is what an act cites": Terms name the envelope act they relied on, and the holder is read at that point; agreements made before a sale keep standing; the buyer holds the rights from then on; a thief's Terms stay invalid for good; where knots or anchoring show Terms cite an old point of the envelope's chain to dodge a later transfer, they do not count, as with a late rival. He: "Agreed"
> - *Arrived at (to check):* Terms that name an envelope name the act of its chain they relied on; the holder of the baker's rights is read at that act. Terms made with the holder of the moment keep counting after a sale. Where knots or anchoring show that Terms were made after a later transfer than the act they cite, they do not count. A thief's Terms, which cite a point where he held nothing, stay invalid for good.

**Decision 1, "Three lines cut back"**, which cut that line, as the ledger has it, whole:

> **Three lines cut back** (17 November). The scribe found three "Arrived at" lines saying more than their exchanges: "bound by them" and "not by agreements" (The envelope states its owner), and "an act that never counted" (The holder at the time). The MOR lead leaned to cut all three back to his words, and to put anything draft 25 built on them back on the open list. He: "Agreed."
> - *Arrived at (to check):* the three lines now say only what the exchanges said. Open again, for the review: whether a holder of the baker's rights must be bound by the Terms, beyond being a party (draft 25 G14.2 has "bound by them", from the earlier exchange "The baker's rights after a sale"); whether agreements play any part in stating ownership; and whether a thief's Terms are an act that never counted.

**What the record shows, without choosing.**
- His words in decision 8 on this point are "Agreed for the first". "The current holder" is in the MOR lead's framing, not in his words.
- His word in "The holder at the time" is "Agreed", to a lean that read the holder "at that point". That exchange named "current" as the problem it answered ("read as 'current', a sale makes every earlier agreement stop counting").
- Decision 1 cut "an act that never counted" from that exchange's line; the line, as it now stands, still reads the holder "at that act".
- Draft 25 follows "The holder at the time": G14.1, "It is read at that act, not as the chain stands now"; the field `envelope_at` exists for it.
- The two readings the parts give (part 1, 8a; part 3, reading 1; part 4, 8b): (i) "current" was loose wording, and the holder is still read at the act the Terms cite, so `envelope_at` stays in Agreements; (ii) the check is on the holder now, which would undo the change draft 24 made (reading the holder at the act cited, with the field `envelope_at`, new in draft 24). Items that turn on it (part 3): OI-139, OI-142, OI-143, OI-145, OI-146, OI-147.

---

## 9. To check

Every item the parts listed as closed, answered or moved beyond what his words reach. Each needs his eye.

**From part 3 (closed items):**
- **OI-005 and OI-014** (decision 4): his word is "Agreed", to option (b) ("not shown as replacing … until Carla's position is clear"); the line widens it to "every answer that depends on it is unchecked". OI-014 asks whether "in force" (not only "replaces") becomes unchecked.
- **OI-013** (decision 2): "A, agreed"; "its own later life" is the MOR lead's wording.
- **OI-033** (decision 3): the lean's three things (what is owed, the record of who left, a contest) are not in his words; section 7's party who is gone with no successor is not a signer leaving.
- **OI-226** (decision 1): the item names three phrases; decision 1 named one.

**From part 1 (rules mapped on the MOR lead's wording):**
- Decision 2: the line's second sentence, "governs only its own later life", is the MOR lead's.
- Decision 3: the line says less than the lean he agreed to; "always" is his own word, after "Agreed".
- Decision 6: what "It does" answers is not recorded.
- Decision 8: whether the closing "Agreed" covers the list of what Agreements keeps; part 1 quotes the list as the MOR lead's, and maps G1.3, G1.4, G11.2, G11.6, G11.7, G11.8 and K8 as staying on it. "The current holder" is the MOR lead's framing (section 8).
- Decision 9: the one sentence of rule is the MOR lead's; his words are "pointer to a relay" and "simpler", and his "Yes, agreed" came after it. G7.3 "goes" and the G7.2 and G7.4 cuts rest on "the rest of G7 leaves the grammar", the MOR lead's line.

**From part 4 (needs and cases answered or moved):**
- **UC-48** (decision 5), "answered for MOR 1": rests on the line "nothing new in MOR 1", after his "Agreed"; his own words say "potentially".
- **8.1-3, UC-04, UC-39** (decision 6), "answered in part": a key change continues the line is the MOR lead's lean, answered "It does".
- **N1, UC-20, UC-26, UC-30** (decision 7), "answered in part": "Fine with me" answered whether F84 stands, not which file and hash.
- **8.1-14** (decision 9), the clock "moved, by the 'Arrived at' line": his words do not name the clock.
- **8.1-7** (decision 8): what Agreements keeps is the MOR lead's list (as above).

**From part 2:** nothing is listed as closed. Its narrow and wide readings rest on his "Everything else", which names no list; the line's list ("the history, the open lists and the reasons") is the MOR lead's.

---

## 10. The four parts

Copied unchanged into `docs/agreements-from-scratch/draft-25-after-review-1/`:
- [Part 1, decisions 1 to 9](draft-25-after-review-1/part-1-decisions.md), from branch `claude/draft-25-after-review-1-decisions-o3fdzl`.
- [Part 2, only rules in the hashed text](draft-25-after-review-1/part-2-rules-only.md), from branch `claude/draft-25-after-review-1-rules-only-aiwgwo`.
- [Part 3, the open items](draft-25-after-review-1/part-3-open-items.md), from branch `claude/draft-25-after-review-1-open-items`.
- [Part 4, the wave-1 list](draft-25-after-review-1/part-4-wave-1.md), from branch `claude/draft-25-after-review-1-wave-1`.

---

## Rows to check

Where a part looks wrong to this session. Left as the part has it; the reason is given.

1. **Part 1, G4.8(c) and G4.8(e)** are marked "stays, untouched", but their notes say decision 4 reaches them (G4.8(c): "whether decision 4 reaches a lacking assent: open"; G4.8(e): "already answers unchecked, in decision 4's spirit", and the decision 4 entry lists G4.8(e) as "Stay"). By part 1's own convention, a row a decision touches or opens a question about is "stays". If so, the counts would be 49 untouched and 40 stays.
2. **Part 1, G14.1** is marked "moves", while its note keeps the field `envelope` in Agreements, and the field's rule is G14.1's first sentence ("Terms MAY name an `envelope` … (G2)."). By part 1's convention that may be "changes". Section 2 here counts all of G14.1 as moving, as the table says; the first sentence is 103 bytes.
3. **Part 3, OI-023 and OI-167** are marked "changes" on the ground that the clock leaves the grammar ("The clock goes with it"; "The clock leaves the grammar"). Parts 1 and 4 read whether the clock leaves two ways. These two rows may belong under "two readings".
4. **Part 4, "In plain words", line 1** calls today's ten decisions "Nobody, allegedly's". Each entry carries the MOR lead's "Arrived at" line, and several rows of part 4 rest on that line; `CLAUDE.md` asks that his name not be written over words he did not write.
5. **Part 4, section 6, reading 8b(i)** keeps in Agreements only "whether the current holder is a party (G14.2 in part)", which would send G14.3 to Envelopes; part 1 gives G14.3 its own reason to stay (his words in "A thief's Terms": "An agreement that points to an envelope already needs the baker … to be valid"). Part 4 does not cite those words. Shown as two readings in section 7; listed here because part 4's (i) and (ii) leave out part 1's map.

---

## Appendix: how section 2 was measured

Draft 25 was read from branch `claude/agreements-clean-1-hahuwn` (commit `cdb9b74`, 265,705 bytes). Part 2's script, run as its appendix says, gave the same narrow (140,414) and wide (176,665) totals. Two short scripts then measured the rules; both are given whole.

`clauses.py` measures every numbered clause and lettered sub-clause of section 4 (124 rows, 99,793 bytes), cutting lines as part 2's script does. Run: `python3 -I clauses.py draft-25.md clauses.json`.

```python
# Measures, in UTF-8 bytes, each numbered clause and lettered sub-clause of section 4 of draft 25,
# by the same line convention as part 2's script: a clause's row holds its own list line and the
# indented paragraphs (and blank lines between them) that follow it, up to the next clause or
# sub-clause list line; a sub-clause's row holds its own list line and its indented continuation.
import re, sys, json
data = open(sys.argv[1], 'rb').read()
lines = data.decode('utf-8').split('\n')
L = [(l + '\n') if i < len(lines)-1 else l for i, l in enumerate(lines)]
B = lambda s: len(s.encode('utf-8'))
s4 = next(i for i,l in enumerate(L) if l.startswith('## 4. Grammar rules'))
s5 = next(i for i,l in enumerate(L) if l.startswith('## 5. Tasks'))
CL = re.compile(r'- (G\d+\.\d+) ')
SUB = re.compile(r'  - \(([a-z])\) ')
rows = {}; order = []; cur = None; parent = None; pend = []
for i in range(s4, s5):
    l = L[i]
    m = CL.match(l); s = SUB.match(l)
    if m:
        cur = parent = m.group(1); pend = []
    elif s and parent:
        cur = parent + '(' + s.group(1) + ')'; pend = []
    elif l.startswith('###') or l.startswith('**Lie') or l.startswith('**Protects') or l.strip()=='---':
        cur = parent = None; pend = []; continue
    elif cur is None:
        continue
    elif l.strip() == '':
        pend.append(i); continue
    else:
        # indented paragraph: belongs to the parent clause, not to the last sub-clause
        if l.startswith('  ') and not l.startswith('    ') and cur != parent:
            cur = parent
    if cur not in rows: rows[cur] = []; order.append(cur)
    rows[cur] += pend + [i]; pend = []
out = {k: dict(bytes=sum(B(L[i]) for i in rows[k]), lines=[i+1 for i in rows[k]]) for k in order}
json.dump(out, open(sys.argv[2],'w'), indent=0)
tot = sum(v['bytes'] for v in out.values())
print(len(out), 'rows', tot, 'bytes')
for k in order: print('%-9s %6d  lines %s-%s' % (k, out[k]['bytes'], out[k]['lines'][0], out[k]['lines'][-1]))
```

`sizes.py` subtracts the rows and parts named in section 2 from part 2's totals. Line numbers are those of draft 25 at commit `cdb9b74`. Run: `python3 -I sizes.py clauses.json draft-25.md`.

```python
# Subtracts from part 2's measured rules-only sizes the clauses part 1's table marks "goes" or "moves",
# and then, separately, each further part that the parts read as leaving or as read two ways.
import json, sys
C = json.load(open(sys.argv[1])); L = open(sys.argv[2],'rb').read().decode().split('\n')
B = lambda s: len(s.encode())
NAR, WIDE, RN, RW = 140414, 176665, 124, 149
def cl(*ks): return sum(C[k]['bytes'] for k in ks)
def line(n): return B(L[n-1]) + 1            # a whole line with its newline
def part(n, start, end=None):                 # bytes of a span inside line n
    s = L[n-1]; a = s.index(start); b = s.index(end, a) + len(end) if end else len(s) + 1
    return B(s[a:b])
base = ['G7.3','G11.4','G11.4(a)','G11.4(b)','G11.4(c)','G11.4(d)','G14.1','G14.4','G14.5','G14.5(a)','G14.5(b)','G14.5(c)','G14.5(d)']
x = cl(*base)
print('A goes/moves rows:', len(base), 'rules', x, 'bytes -> narrow', NAR-x, 'wide', WIDE-x, '| rules', RN-len(base), RW-len(base))
print('  of which G14.1', C['G14.1']['bytes'], '; its first sentence (the field)', part(402, 'Terms MAY name an `envelope`', '(G2).'))
extra = {
 'G14.2 "A double sale" paragraph (with the blank line before it)': line(409)+line(408),
 'G11.7 sentence "As for any two halves ... one side only;"': part(367, 'As for any two halves', '**one side only**;'),
 'G7.2 whole (the one rule taken as G7.4\'s first sentence, kept)': C['G7.2']['bytes'],
 'G7.4 clock part ("Terms MAY also name a `clock`" to the end)': part(303, 'Terms MAY also name a `clock`'),
}
e = sum(extra.values())
for k,v in extra.items(): print('  B+', v, k)
k6 = part(451, 'Two reports that name the same settlement', '(G11.4)')
print('B parts of "changes" rows that leave:', e, '-> narrow', NAR-x-e, 'wide', WIDE-x-e-k6, '(wide also less K6 sentence', k6, ')')
AB = x + e
print('--- readings, each against A+B (narrow / wide) ---')
def r(name, db, dr):
    print('%-70s %+6d bytes %+d rules -> narrow %d (%d rules), wide %d (%d rules)' % (name, -db, -dr, NAR-AB-db, RN-len(base)-dr, WIDE-AB-k6-db, RW-len(base)-dr))
g143 = cl('G14.3','G14.3(a)','G14.3(b)','G14.3(c)','G14.3(d)')
r('G14 (i) whole rule but the check: + G14.3 and (a)-(d), G14.5(e)', g143 + cl('G14.5(e)'), 6)
r('G14 (i) as above, and G14.2 "Bound by them" and "Late Terms" too', g143 + cl('G14.5(e)') + line(405)+line(404)+line(407)+line(406), 6)
r('G14 (ii) only the envelope chain: G14.5 and (a)-(d) stay', -cl('G14.5','G14.5(a)','G14.5(b)','G14.5(c)','G14.5(d)'), -5)
r('G14 "Late Terms" paragraph moves (part 1, open)', line(407)+line(406), 0)
r('G11.6 own text moves (part 4, 8c(i))', cl('G11.6'), 1)
r('G11.6 own text and G11.6(c) move', cl('G11.6','G11.6(c)'), 2)
r('clock (ii) leaves entirely: + section 2 "Clock", 3.1 `clock` row', line(100)+line(144), 0)
r('G6.1 and G6.2 move to the layer below (part 1, decision 6 (ii))', cl('G6.1','G6.2'), 2)
r('G11.1, G11.3, G11.4(e), G11.5 move to the MICS (part 1, "stays or moves")', cl('G11.1','G11.3','G11.4(e)','G11.5'), 4)
r('G14.5(e) moves (part 1)', cl('G14.5(e)'), 1)
allmax = g143 + cl('G14.5(e)') + line(405)+line(404)+line(407)+line(406) + cl('G11.6','G11.6(c)') + line(100)+line(144) + cl('G6.1','G6.2','G11.1','G11.3','G11.4(e)','G11.5')
r('everything read as leaving, at once (largest move)', allmax, 6+2+2+4)
small = -cl('G14.5','G14.5(a)','G14.5(b)','G14.5(c)','G14.5(d)')
r('nothing read two ways leaves, and G14 (ii) (smallest move)', small, -5)
```

Its output:

```
A goes/moves rows: 13 rules 9169 bytes -> narrow 131245 wide 167496 | rules 111 136
  of which G14.1 1712 ; its first sentence (the field) 103
  B+ 627 G14.2 "A double sale" paragraph (with the blank line before it)
  B+ 209 G11.7 sentence "As for any two halves ... one side only;"
  B+ 789 G7.2 whole (the one rule taken as G7.4's first sentence, kept)
  B+ 275 G7.4 clock part ("Terms MAY also name a `clock`" to the end)
B parts of "changes" rows that leave: 1900 -> narrow 129345 wide 165501 (wide also less K6 sentence 95 )
--- readings, each against A+B (narrow / wide) ---
G14 (i) whole rule but the check: + G14.3 and (a)-(d), G14.5(e)         -3741 bytes -6 rules -> narrow 125604 (105 rules), wide 161760 (130 rules)
G14 (i) as above, and G14.2 "Bound by them" and "Late Terms" too        -6757 bytes -6 rules -> narrow 122588 (105 rules), wide 158744 (130 rules)
G14 (ii) only the envelope chain: G14.5 and (a)-(d) stay                +1762 bytes +5 rules -> narrow 131107 (116 rules), wide 167263 (141 rules)
G14 "Late Terms" paragraph moves (part 1, open)                         -1408 bytes +0 rules -> narrow 127937 (111 rules), wide 164093 (136 rules)
G11.6 own text moves (part 4, 8c(i))                                    -1064 bytes -1 rules -> narrow 128281 (110 rules), wide 164437 (135 rules)
G11.6 own text and G11.6(c) move                                        -1337 bytes -2 rules -> narrow 128008 (109 rules), wide 164164 (134 rules)
clock (ii) leaves entirely: + section 2 "Clock", 3.1 `clock` row         -266 bytes +0 rules -> narrow 129079 (111 rules), wide 165235 (136 rules)
G6.1 and G6.2 move to the layer below (part 1, decision 6 (ii))         -1628 bytes -2 rules -> narrow 127717 (109 rules), wide 163873 (134 rules)
G11.1, G11.3, G11.4(e), G11.5 move to the MICS (part 1, "stays or moves")  -4299 bytes -4 rules -> narrow 125046 (107 rules), wide 161202 (132 rules)
G14.5(e) moves (part 1)                                                  -302 bytes -1 rules -> narrow 129043 (110 rules), wide 165199 (135 rules)
everything read as leaving, at once (largest move)                     -14287 bytes -14 rules -> narrow 115058 (97 rules), wide 151214 (122 rules)
nothing read two ways leaves, and G14 (ii) (smallest move)              +1762 bytes +5 rules -> narrow 131107 (116 rules), wide 167263 (141 rules)
```

---

## Cold read

Before the pull request, sections 1, 2 and 8 were handed to a subagent that had seen neither the ledger, the parts nor the prompt for this session. It reported 18 stumbles. Its own reading of the size: "about 129 KB with 111 rules read narrowly, or about 166 KB with 136 rules read widely", with a range of 115 to 131 KB narrow and 151 to 167 KB wide; it found the arithmetic adds up.

**Fixed in the wording:** what "106" is, said where it first appears; "him" named; "places" said to be sentences or test steps; part 1's 9 two-way rows told apart from the more rows the parts read two ways; how a clause can lose all of G7.2's bytes and keep its number; that G14.1's 103 bytes are inside its 1,712; which field G7 keeps (`place`); that one sub-clause of G11.4 is read two ways; 165.5 KB given as measured, not rounded to 166; where "13 November" comes from; what "draft 24's change" was; that "current" is in the MOR lead's framing, not in his words; who numbered the decisions; "part 1, open" made plain; where part 2's 148,465 sits.

**Not fixed:** the protocol's own words (verifier, cMIP, MICS, Envelopes, baker, place, clock, leg, knots, anchoring, unchecked) are glossed in "Words used here" at the head of this file, which the reader was not given; the rest need draft 25 itself, and a gloss of each would be new wording for it. The quoted ledger entries in section 8 keep their own words (F84, the admission test, the click test, Fable, wave 1): they are quoted whole and cannot be changed. "Rows to check" and the four parts are outside the excerpt, and are defined at the head and end of this file.
