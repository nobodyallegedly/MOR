# Draft 25 after review 1, part 2 of 4: only rules in the hashed text

17 November 2026. Written by the scribe (Claude), session R2. A map, not a decision: it changes no text of draft 25 and proposes no wording. It classifies draft 25 as it stands. Decisions 1 to 9 are not applied here; another session maps them.

**The wish** (Nobody, allegedly, `docs/decisions.md`, branch `claude/lead-records-2`): "I've decided for a total rewrite of agreements from scratch." "can I with a single click reward all the people that contributed to the service or good via MOR". On now: "Before redrafting any layer I want to really look at the findings in details, find the right questions and then find one last way for me to zoom out before deciding on the rewrite." And: "Once that is over, we.ll focus the rest of the budget on reviewing, no redrafts, no recode." (quoted as the ledger has it)

**The decision mapped here** (decision 10 of 17 November, the ledger's entry "Only rules in the hashed text"). The MOR lead proposed taking out of the hashed text everything that is not a rule (the draft history, the open lists, the reasons), since a typo fixed in a history paragraph makes a new specification. He: "Yes, the text should be just that. Everything else goes into companion documents for the few who might be interested." The ledger's "Arrived at (to check)", the MOR lead's reading: "a hashed text holds its rules and nothing else. The history, the open lists and the reasons go into companion documents beside it."

**Measured file.** `docs/agreements-from-scratch/draft-25.md`, branch `claude/agreements-clean-1-hahuwn` at commit `cdb9b74` (pull request 183): 265,705 bytes, 877 lines. KB here means 1,000 bytes. The script is in the appendix; every number below comes from it, except where a line says "counted by hand".

---

## In plain words

1. Draft 25 is 266 KB. Read narrowly, a rule is only what a verifier (the software that checks signed acts against the text) must check, with the definitions and data fields it needs. That is about half the draft: 140 KB, of which the fourteen grammar rules of section 4 are 100 KB and the definitions and fields 40 KB, holding 124 numbered rules and sub-rules.
2. Read widely, a rule also includes what a builder needs: the tasks the text hands to cMIPs (documents others write to plug into it; section 5) and the values it leaves open (section 6). That is 177 KB, holding 149 numbered items.
3. 89.0 KB is not a rule in either reading: the stated costs (18.6 KB), the open lists (24.7 KB), what the other layers must give (13.8 KB), a guide for builders (16.7 KB), the reasons (7.5 KB), the history (5.1 KB) and the front matter (2.6 KB). Inside the 140 KB of rules there are also about 2 KB of sentences on earlier drafts and 3 KB of quoted words of Nobody, allegedly; they are counted in the 140 KB, not added to it.
4. The brief for this map gives draft 25 "106 rules". Measured, 106 is a size, not a count: section 4, the grammar rules with their reasons, is 106,081 bytes, which is Fable's review's "about 106" kilobytes. The count is 124.
5. A few things outside the narrow rules would be missed by a verifier: the rows of the task table that the rules point to, the sentence that says which hash acts are written under, and three answers kept in the open list that tell a verifier what to say while a question is still open ("until then").

---

## 1. What "a rule" means here

His words say "the text should be just that" and do not define a rule. The ledger entry does not settle it either. Its "Arrived at" line, the MOR lead's, names three things that leave ("the history, the open lists and the reasons"); draft 25 itself says, at the head of section 8, "Sections 6 and 7 are part of what is open too". Read together, that line would send section 6 out, which is the narrow reading for section 6. But the line is the MOR lead's, marked "to check", and his own words ("Everything else") name no list. So both readings are kept all the way through, and none is chosen.

- **Narrow**: only what a verifier checks, the MUST, SHOULD and MAY sentences, with the definitions and data fields they cannot be read without. Here: section 2 (Definitions, but its three retired words), section 3 (the data each act carries), and section 4's introduction and the clauses of G1 to G14. Draft 25 has no SHOULD ("no SHOULD appears", it says itself).
- **Wide**: the narrow, plus the tasks handed to cMIPs (all of section 5) and the open parameters (all of section 6), since a builder needs them to build.
- **A third reading, seen and not chosen.** "Only what changes a verifier's answer." This is the test the MOR lead used, in his wording, under decision 9 ("one sentence earns its place, since it changes a verifier's answer"). It is narrower than the narrow reading in two places: it would also take out clauses that only restate others (Fable's review, section 6, item 7, names G5.6 and G5.7), and duties that no verifier checks (the client's duty, G12.8, and a client's ranking, G14.5(c)). It is not measured here beyond those named clauses: measuring it needs a judgment on every sentence.

**One word to watch.** In draft 25 the word "rule" alone means a cMIP that computes (section 2, "Rule"), and its fourteen rules are always called "grammar rules". In his words, and in this file, "rules" means what the text lays down. This file reads his "rules" as the grammar rules and what they need, never as draft 25's "rule".

---

## 2. Section by section

How to read the table. **Bytes**: the size of that part, measured. **Naming an earlier draft**: bytes of sentences, inside that part, that name an earlier draft ("Draft 20 read…", "New in draft 18", "no longer a term"); where a sentence names a draft only as the origin of something still read today ("as draft 18 has it"), only those few words are counted. It is a pattern measure, and so approximate. **His words quoted**: bytes of the quotations of Nobody, allegedly, with their lead-in ("In the words of Nobody, allegedly: …"); also a pattern measure, which misses a few quotes not introduced that way. Both are parts of the bytes, not added to them. **Class**: rule (narrow), rule (wide only), or not a rule. **Where it goes**: "stays" where it is a rule in the narrow reading; otherwise the companion group it would join if it left (section 4 below).

Section 4 has no parts called stories or examples: each grammar rule has its clauses and two lines of reasons ("Lie exposed", "Protects"); its plain words and longer reasons are already in a file beside it, `reasons-25.md`. Examples inside clauses (such as "two owners of three" in G4.11) are part of the clause, and are not measured apart.

| Part of draft 25 | Bytes | Naming an earlier draft | His words quoted | Class | Where it goes |
|---|---|---|---|---|---|
| Title and date | 132 | 36 |  | not a rule | front matter |
| Before section 1: the wish | 393 |  | 135 | not a rule | front matter |
| Before section 1: What this file is | 873 | 264 |  | not a rule | front matter |
| Before section 1: How to read it | 820 | 314 |  | not a rule | front matter |
| Before section 1: The test of this text | 435 |  | 157 | not a rule | reasons |
| Before section 1: What draft 25 is (its changes) | 1,509 | 190 |  | not a rule | history |
| Before section 1: Its spec hash | 403 |  |  | not a rule (see section 5 of this file) | front matter |
| Before section 1: What drafts 24 to 20 were | 2,952 | 1,211 | 38 | not a rule | history |
| Before section 1: What it is for | 609 |  | 202 | not a rule | builder's guide |
| Before section 1: One block used here is not this text's | 973 | 191 |  | not a rule | other layers |
| 1. Purpose (what Agreements is) | 1,050 |  |  | not a rule | reasons |
| 1. One constraint on everything below | 449 |  |  | not a rule | reasons |
| 2. Definitions: three retired words (Succession, Join, Triggered) | 657 | 503 |  | not a rule | history |
| 2. Definitions: Answers (the answer words, invalid and rejected) | 6,455 | 367 |  | rule (narrow) | stays |
| 2. Definitions: the other words | 20,902 | 350 | 748 | rule (narrow) | stays |
| 3. The data each act carries (field kinds, one fault one rule) | 2,294 |  |  | rule (narrow) | stays |
| 3.1 Terms (the table) | 5,305 | 232 |  | rule (narrow) | stays |
| 3.2 Statement (the table) | 2,077 |  |  | rule (narrow) | stays |
| 3.2 after the table (content, first act, what a resolving update carries, report) | 2,901 | 77 |  | rule (narrow) | stays |
| 4. Grammar rules: introduction | 323 |  |  | rule (narrow) | stays |
| G1. An agreement as a party: the rule (5 numbered clauses, 0 lettered sub-clauses) | 5,889 |  |  | rule (narrow) | stays |
| G1: its reason, "Lie exposed" | 186 |  |  | not a rule | reasons |
| G1: its reason, "Protects" | 229 |  |  | not a rule | reasons |
| G2. Whole: the rule (2 numbered clauses, 0 lettered sub-clauses) | 946 |  |  | rule (narrow) | stays |
| G2: its reason, "Lie exposed" | 98 |  |  | not a rule | reasons |
| G2: its reason, "Protects" | 110 |  |  | not a rule | reasons |
| G3. Author: the rule (2 numbered clauses, 0 lettered sub-clauses) | 315 |  |  | rule (narrow) | stays |
| G3: its reason, "Lie exposed" | 115 |  |  | not a rule | reasons |
| G3: its reason, "Protects" | 63 |  |  | not a rule | reasons |
| G4. In force: the rule (11 numbered clauses, 21 lettered sub-clauses) | 21,035 | 423 | 421 | rule (narrow) | stays |
| G4: its reason, "Lie exposed" | 410 |  |  | not a rule | reasons |
| G4: its reason, "Protects" | 410 |  |  | not a rule | reasons |
| G5. Own signature: the rule (7 numbered clauses, 12 lettered sub-clauses) | 12,102 | 252 | 455 | rule (narrow) | stays |
| G5: its reason, "Lie exposed" | 401 |  |  | not a rule | reasons |
| G5: its reason, "Protects" | 203 |  |  | not a rule | reasons |
| G6. Own line: the rule (2 numbered clauses, 0 lettered sub-clauses) | 1,649 |  |  | rule (narrow) | stays |
| G6: its reason, "Lie exposed" | 73 |  |  | not a rule | reasons |
| G6: its reason, "Protects" | 57 |  |  | not a rule | reasons |
| G7. Place to look: the rule (4 numbered clauses, 0 lettered sub-clauses) | 1,744 |  |  | rule (narrow) | stays |
| G7: its reason, "Lie exposed" | 93 |  |  | not a rule | reasons |
| G7: its reason, "Protects" | 81 |  |  | not a rule | reasons |
| G8. Say who said it: the rule (5 numbered clauses, 0 lettered sub-clauses) | 1,623 |  |  | rule (narrow) | stays |
| G8: its reason, "Lie exposed" | 124 |  |  | not a rule | reasons |
| G8: its reason, "Protects" | 125 |  |  | not a rule | reasons |
| G9. Unchecked is not passed: the rule (2 numbered clauses, 0 lettered sub-clauses) | 1,236 |  |  | rule (narrow) | stays |
| G9: its reason, "Lie exposed" | 87 |  |  | not a rule | reasons |
| G9: its reason, "Protects" | 61 |  |  | not a rule | reasons |
| G10. Spots: the rule (7 numbered clauses, 2 lettered sub-clauses) | 5,428 |  |  | rule (narrow) | stays |
| G10: its reason, "Lie exposed" | 142 |  |  | not a rule | reasons |
| G10: its reason, "Protects" | 118 |  |  | not a rule | reasons |
| G11. Legs of a sequence: the rule (8 numbered clauses, 8 lettered sub-clauses) | 23,241 | 114 | 357 | rule (narrow) | stays |
| G11: its reason, "Lie exposed" | 289 |  |  | not a rule | reasons |
| G11: its reason, "Protects" | 217 |  |  | not a rule | reasons |
| G12. Forks: the rule (8 numbered clauses, 0 lettered sub-clauses) | 10,191 | 116 |  | rule (narrow) | stays |
| G12: its reason, "Lie exposed" | 120 |  |  | not a rule | reasons |
| G12: its reason, "Protects" | 208 |  |  | not a rule | reasons |
| G13. Now is what an act cites: the rule (4 numbered clauses, 0 lettered sub-clauses) | 2,787 |  |  | rule (narrow) | stays |
| G13: its reason, "Lie exposed" | 176 |  |  | not a rule | reasons |
| G13: its reason, "Protects" | 82 |  |  | not a rule | reasons |
| G14. The baker: the rule (5 numbered clauses, 9 lettered sub-clauses) | 11,971 | 102 | 652 | rule (narrow) | stays |
| G14: its reason, "Lie exposed" | 540 |  |  | not a rule | reasons |
| G14: its reason, "Protects" | 783 |  |  | not a rule | reasons |
| 5. Tasks: introduction (one cMIP per socket, what every cMIP is given) | 2,070 |  | 171 | rule (wide only); the narrow rules point into it | cMIP map (narrow only) |
| 5. Tasks: the table K1 to K8 | 5,767 | 14 |  | rule (wide only); the narrow rules point into it | cMIP map (narrow only) |
| 5. Tasks: the payment's task (one paragraph) | 214 |  |  | rule (wide only); the narrow rules point into it | cMIP map (narrow only) |
| 5.1 Five things built on the blocks (table, escrow, data path) | 4,328 | 168 | 86 | rule (wide only); it says of itself that none of it is a grammar rule | cMIP map (narrow only) |
| 5.1 Four things a cMIP could perhaps also build, kept | 812 | 397 |  | rule (wide only); it says of itself that none of it is a grammar rule | cMIP map (narrow only) |
| 5.2 What can be said in this language (table of 19 rows) | 4,735 | 69 | 219 | rule (wide only); it says of itself that none of it is a grammar rule | cMIP map (narrow only) |
| 5.3 Modules (table, place and clock, standing) | 2,686 | 343 |  | rule (wide only) | cMIP map (narrow only) |
| 6. Open parameters: introduction | 256 | 81 |  | rule (wide only) | open parameters (narrow only) |
| 6. P1 | 130 |  |  | rule (wide only) | open parameters (narrow only) |
| 6. P2 | 431 | 125 |  | rule (wide only) | open parameters (narrow only) |
| 6. P4 | 158 |  |  | rule (wide only) | open parameters (narrow only) |
| 6. P5 | 224 |  |  | rule (wide only) | open parameters (narrow only) |
| 6. P6 | 1,579 | 352 | 87 | rule (wide only) | open parameters (narrow only) |
| 6. P7 | 223 |  |  | rule (wide only) | open parameters (narrow only) |
| 6. P8 | 1,290 | 346 |  | rule (wide only) | open parameters (narrow only) |
| 6. P9 | 1,235 | 368 |  | rule (wide only) | open parameters (narrow only) |
| 6. P11 | 191 |  |  | rule (wide only) | open parameters (narrow only) |
| 6. P12 | 275 |  |  | rule (wide only) | open parameters (narrow only) |
| 6. P15 | 944 | 650 |  | rule (wide only) | open parameters (narrow only) |
| 6. P16 | 290 |  |  | rule (wide only) | open parameters (narrow only) |
| 6. P17 | 2,481 | 1,527 |  | rule (wide only) | open parameters (narrow only) |
| 6. P18 | 1,863 | 1,127 |  | rule (wide only) | open parameters (narrow only) |
| 6. P19 | 1,215 | 530 | 38 | rule (wide only) | open parameters (narrow only) |
| 6. P20 | 1,838 | 103 |  | rule (wide only) | open parameters (narrow only) |
| 6. P21 | 1,016 | 761 |  | rule (wide only) | open parameters (narrow only) |
| 7. Stated costs | 18,645 | 213 | 161 | not a rule | stated costs |
| 8. What is still open: introduction | 182 |  |  | not a rule | open lists |
| 8.1 What this text needs from the other layers | 12,785 | 1,861 | 327 | not a rule | other layers |
| 8.2 For Nobody, allegedly | 7,622 | 1,294 | 38 | not a rule | open lists |
| 8.3 Left as draft 23 has it | 1,999 | 990 |  | not a rule | open lists |
| 8.4 Still open from earlier drafts | 14,866 | 4,928 |  | not a rule | open lists |
| 9. What a builder needs that is not in this text | 6,234 | 1,620 |  | not a rule | builder's guide |
| 10. What the encoding must fix | 9,847 | 2,067 |  | not a rule | builder's guide |

The rows add up to 265,701 bytes; the last 4 bytes are the line `---` between G14 and section 5, counted with "not a rule". Total: 265,705.

---

## 3. How big a rules-only text would be

| Reading | Bytes | KB | Share of 265,705 | Without the sentences naming an earlier draft | Without those and without his quoted words |
|---|---|---|---|---|---|
| Narrow | 140,414 | 140.4 | 52.8 % | 138,381 | 135,748 |
| Narrow, keeping the task table and what the rules cite of section 5 (its introduction, K1 to K8, the payment's paragraph) | 148,465 | 148.5 | 55.9 % | 146,418 | 143,614 |
| Wide | 176,665 | 176.7 | 66.5 % | 167,671 | 164,437 |
| Wide, without 5.1 and 5.2 (which say of themselves that none of them is a grammar rule) | 166,790 | 166.8 | 62.8 % | 158,430 | 155,501 |
| Not a rule in either reading | 89,040 | 89.0 | 33.5 % | | |

The second and fourth rows are not further readings: they show, measured, how much turns on two parts of section 5 whose class the two readings leave unclear (section 5 of this file says why).

Whether the quoted words and the history sentences inside the rules would leave is not settled by decision 10: "Only rules" would send history out, and his quoted words, inside a rule, are its origin rather than the rule. Both columns are given so that either can be read; none is chosen. If the quotes leave, the hashed text carries no words of his, only the MOR lead's and Claude's wording of them.

**Counting rules.** Counted by script, from the lines of section 4:
- 72 numbered clauses (G1.1 to G14.5), and 52 lettered sub-clauses written as their own list lines ("(a)", "(b)" …): **124** in the narrow reading.
- Not counted in that 124, and listed so the count can be redone: the three unlettered list lines of G10.1 (the role's kind, its `what`, its spot socket); six lettered parts written inside a paragraph rather than as list lines (G5.5's (i) to (iii), and G14.2's "Late Terms" (a) to (c)). With them, 133.
- One of the 52 lettered sub-clauses, G4.8(g) ("What is left of the signatures. Draft 18 asked two things…"), is history in its whole; without it, 123.
- The wide reading adds the eight tasks K1 to K8 and the seventeen open parameters listed (P1, P2, P4 to P9, P11, P12, P15 to P21): **149** (158 with the nine above). The seven modules of section 5.3 have no numbers and are not counted.

**Against the MOR lead's figures.** Draft 25's 266 KB is confirmed (265,705 bytes). The "106" does not count rules: section 4 measures 106,081 bytes (100,157 of clauses, 5,601 of "Lie exposed" and "Protects", the rest headings and blank lines), which is Fable's "the fourteen rules are about 106" kilobytes. Fable's other figure is confirmed too: the clauses of G4, G11 and G14 are 56,247 bytes, and about 58,900 with their headings and reasons, Fable's "59". By the count above, draft 25 has 124 numbered rules and sub-rules (72 clauses), not 106.

---

## 4. What leaves, and the companion documents it would form

The grouping is mine (the scribe's), by what a reader would come for; nothing in the ledger sets it. Two companions already exist beside draft 25, and its front matter names them: `reasons-25.md` (each grammar rule in plain words, and why it is there) and `history.md` (how the text came to be, draft by draft). Three groups below would join them; the others would be new.

**Leaves in both readings: 89,040 bytes.**

| Group | What a reader comes for | Sections of draft 25 | Bytes |
|---|---|---|---|
| The reasons behind the rules | why each grammar rule is there: the lie it exposes, whom it protects; what Agreements is for | "Lie exposed" and "Protects" of G1 to G14 (5,601); section 1, Purpose and One constraint (1,499); The test of this text (435). Would sit beside `reasons-25.md` | 7,535 |
| The history of the drafts | what each draft changed, and words no longer used | What draft 25 is (1,509); What drafts 24 to 20 were (2,952); the three retired words of section 2 (657). Would join `history.md`. Not counted here: 2,033 bytes of sentences naming an earlier draft inside the rules (section 3 of this file) | 5,118 |
| The open lists | what is not yet answered, for him, for the MOR lead, from earlier drafts | 8 introduction (182); 8.2 (7,622); 8.3 (1,999); 8.4 (14,866), of which a third names a draft by number | 24,669 |
| What the other layers must give | the needs Agreements has of the core, the place, Money, the envelope's chain, the report block | 8.1 (12,785); One block used here is not this text's (973) | 13,758 |
| The stated costs | the cases the grammar knowingly does not close | 7 (18,645) | 18,645 |
| A builder's and encoder's guide | what is missing below Agreements, in order; what the bytes must choose | 9 (6,234); 10 (9,847); What it is for (609) | 16,690 |
| About this file | its title, date, wish, what it is, how to read it, its spec hash | Title and date (132); the wish (393); What this file is (873); How to read it (820); Its spec hash (403) | 2,621 |
| (a separator line) | | `---` after G14 | 4 |

**Leaves in the narrow reading only: 36,251 bytes.**

| Group | What a reader comes for | Sections of draft 25 | Bytes |
|---|---|---|---|
| The cMIP author's map | which socket a cMIP plugs into, what it is given, what it returns; what is built on the blocks; what can already be said in the language; the modules | 5 introduction (2,070); the table K1 to K8 (5,767); the payment's task (214); 5.1 (5,140); 5.2 (4,735); 5.3 (2,686) | 20,612 |
| The open parameters | the values the grammar depends on and does not fix | 6, P1 to P21 as listed (15,639), of which 5,970 bytes name a draft by number | 15,639 |

---

## 5. What a verifier would miss if it left

Listed where something classed "not a rule", or "wide only", carries what a verifier reads. Each says why. None is a proposal: whether it stays, moves into the rules, or leaves is not decided here.

1. **The rows of the task table (section 5), in the narrow reading.** The narrow rules point into it by name: G11.3 ("Beyond that, it carries what K6's row says"; "What K6's row asks of a leg report MUST be readable without any cMIP"), G11.4(c) and G11.5 (K6's row), G4.11(a) (K4's row), G10.6 (K5's row), G11.4(d) (K8's row); and section 2 ("Leg report") and section 3.2 say what a leg report carries "is in K6's row". K6's row is the only place that lists what a leg report carries (what was received, passed on, the doer's own part, what was kept, what is still owed). Without it, a verifier cannot read a leg report. Section 5's introduction also holds the one sentence saying what every cMIP is given (its parameters, the acts held, the place's and the clock's answers). This is where the two readings differ most: 8,051 bytes (the second row of the size table).
2. **The spec hash paragraph** (before section 1). The only place that says acts of Agreements are written under this text's spec hash, how that hash is computed, and that a later draft is a new specification. It has no MUST, so the narrow reading's test does not catch it, and it is in neither section 5 nor 6. Decision 10 rests on what that paragraph says (a change to the text makes a new specification).
3. **Three "until then" readings in the open list** (section 8.2, items 14 to 16, kept from draft 23). Each tells a verifier what to answer while a question is open: a pending payment, "The least reading until then is unchecked (G9)"; money still owed, "Until then a 'still owed' line is shown as stated and tied to nothing"; pools, "Until then one report line names one settlement." I found none of the three said in section 4.
4. **The duties of clients**, inside the narrow by their wording, outside it by "what a verifier checks". G12.8 is a MUST for clients, and says of itself: "No verifier can check it… It is written here and nowhere else." G14.5(c) is a MAY for clients. Section 8.1 lists "where the duties of clients are kept" as open. If they leave, they have no other home yet.
5. **The pointers to open parameters**, in the narrow reading. The rules cite P2, P8, P16, P17, P18, P19 and P20 (for example G9.2, "How far a verifier must follow is not fixed (P2, P8)"). I found no answer a verifier gives that lives only in section 6: each parameter says what the rules leave unfixed. If section 6 leaves, those pointers point outside the hashed text. P2's "both C sessions' verifiers follow eight levels" is a fact the vectors lean on (section 10, item 16), not a rule.
6. **Section 5.2 and 5.1, in the wide reading.** Both say of themselves "None of this is a grammar rule". A verifier reads nothing from them; the wide reading keeps them only because section 5 is named whole. The fourth row of the size table shows them out.
7. **Nothing found in the reasons, the history, the stated costs or sections 9 and 10** that a verifier needs and the rules do not already say. Two near-misses: "How to read it" says MUST and MAY are used as in RFC 2119, which section 4's introduction says again; section 10, item 2, says a field section 3 does not give makes an act rejected, which section 3 says again. The stated costs carry no check, but `CLAUDE.md` asks that a rule marked as a stated cost not be quietly bypassed: a builder handed only the rules would not see where the grammar knowingly stops.

---

## 6. The cold read

Before pushing, "In plain words" and five rows of the table, picked by a seeded random draw, were handed to a subagent that had seen neither the ledger nor the prompt for this session. What it stumbled on, and what was done:

Fixed in the wording:
- "106" was corrected without saying who said it: point 4 now names the brief and gives the count.
- The 140 KB and section 4's 106 KB seemed to be two sizes of one thing: point 1 now says what the 140 KB is made of.
- "Narrow" and "wide" and "verifier" were not explained in the summary: points 1 and 2 now say them in plain words.
- The group sizes, rounded to whole KB, added up to 90.5, not 89: they are now given to one decimal, and add to 89.0.
- "His quoted words" had no one named: now "quoted words of Nobody, allegedly", and the summary says they are counted inside the 140 KB, not twice.
- "Until then" was unexplained: point 5 now says what those answers are.
- The table's last column was headed "If it leaves" and held "stays": renamed "Where it goes".

Not fixed:
- Words of the protocol (cMIP, grammar rule, resolving update, "Lie exposed", G1 to G14) are glossed only where the summary needs them; the rest belong to draft 25 and a short gloss of each would be new wording for it.
- In the G4 row, 423 bytes naming earlier drafts and 421 bytes of quotes are close by chance; both are measured.
- The reader saw five rows without the table's own explanation above them; the explanation stays where it is.

---

## Appendix: the script

Run with `python3 -I measure.py draft-25.md out.json` on the file named at the top. It splits the file by lines into the parts of the table (each line belongs to exactly one part, and the long paragraph "What draft 25 is" is cut at its bold labels "Its spec hash." and "What draft 24 was." and "What it is for"), measures each part in UTF-8 bytes, checks that the parts add up to the file's size, and measures inside each part the sentences naming an earlier draft and the quotations of his words, by the patterns given at its top.

```python
import re, sys, json
data = open(sys.argv[1], 'rb').read()
lines = data.decode('utf-8').split('\n')
# keep newline bytes: every line but the last gets '\n'
L = [(l + '\n') if i < len(lines)-1 else l for i, l in enumerate(lines)]
L = [l for l in L if l != '']
B = lambda s: len(s.encode('utf-8'))
assert sum(B(l) for l in L) == len(data)

HIST = re.compile(r"\b[Dd]rafts? \d+|[Ee]arlier drafts|no longer a term|that reading is gone|reading is gone|until draft|From draft|New in draft|as draft \d+ has it|Was\b \|")
SENT = re.compile(r'(?<=[.;])\s+(?=[A-Z*"(`])| \| |\n')
QUOTE = re.compile(r'(?:In the words of Nobody, allegedly|Nobody, allegedly)(?:, [^:"]{0,80})?: "[^"]*"[.,]?(?: [Aa]nd(?:, [^"]{0,20})?,? "[^"]*"[.,]?)*|(?:his words|[Hh]is word for such a case was)[^"]{0,10}"[^"]*"')

TAG = re.compile(r",? as draft \d+ (?:has it|reads it)|,? from draft \d+,?|From draft \d+,? |New in draft \d+[;:,]? ?")
# sentences that name a draft but also state what a verifier reads now: only the draft tag is counted, not the sentence
RULE_SENT = ["Whether the replacing Terms are themselves in force is G4.1's", "An assent to a replacing Terms act MAY be made",
 "A judge's decision binds only through a power", '**"Bound by them"**, as draft 22 reads it', "From draft 24 those cases rest",
 "From draft 23 it gives nothing for the baker", "it is not a task; earlier drafts called it a socket", "For this question alone, whether the Terms are a version"]
def spans(text):
    """bytes of sentences carrying a history marker, and bytes of his quoted words (not double-counted)"""
    q = sum(B(m.group(0)) for m in QUOTE.finditer(text))
    qt = QUOTE.sub('', text)
    h = 0; tag = 0
    for s in SENT.split(qt):
        if not HIST.search(s): continue
        if any(k in s for k in RULE_SENT):
            tag += sum(B(m.group(0)) for m in TAG.finditer(s)); continue
        h += B(s)
    return h + tag, q

segs = []  # (key, label, text)
def add(key, label, idxs):
    segs.append((key, label, ''.join(L[i] for i in idxs)))

n = len(L)
# locate headings
head = [i for i, l in enumerate(L) if l.startswith('#')]
def find(prefix):
    for i, l in enumerate(L):
        if l.startswith(prefix): return i
    raise SystemExit('no ' + prefix)

used = set()
def take(key, label, a, b):  # [a,b)
    idx = [i for i in range(a, b) if i not in used]
    used.update(idx); add(key, label, idx)

# preamble pieces by line number (0-based)
pre_end = find('## 1. Purpose')
pieces = {}
for i in range(0, pre_end):
    l = L[i]
    if l.startswith('# '): k = 'P.title'
    elif l.startswith('15 November'): k = 'P.date'
    elif l.startswith('**The wish**'): k = 'P.wish'
    elif l.startswith('**What this file is.**') or l.startswith('- `') : k = 'P.whatfile'
    elif l.startswith('**How to read it.**'): k = 'P.howread'
    elif l.startswith('**The test of this text**'): k = 'P.test'
    elif l.startswith('**What draft 25 is.**'): k = 'P.d25'
    elif l.startswith('**One block used here'): k = 'P.block'
    else: k = pieces.get('_last', 'P.title')
    pieces['_last'] = k
    pieces.setdefault(k, []).append(i)
used.update(range(0, pre_end))
# split the long 'What draft 25 is' line
d25line = ''.join(L[i] for i in pieces['P.d25'])
a = d25line.index('**Its spec hash.**'); b = d25line.index('**What draft 24 was.**'); c = d25line.index('**What it is for**')
segs.append(('P.title', 'Title, date', ''.join(L[i] for i in pieces['P.title']+pieces['P.date'])))
segs.append(('P.wish', 'The wish', ''.join(L[i] for i in pieces['P.wish'])))
segs.append(('P.whatfile', 'What this file is (and the three files beside it)', ''.join(L[i] for i in pieces['P.whatfile'])))
segs.append(('P.howread', 'How to read it', ''.join(L[i] for i in pieces['P.howread'])))
segs.append(('P.test', 'The test of this text', ''.join(L[i] for i in pieces['P.test'])))
segs.append(('P.d25', 'What draft 25 is (its changes, in plain words)', d25line[:a]))
segs.append(('P.hash', 'Its spec hash', d25line[a:b]))
segs.append(('P.hist', 'What drafts 24 to 20 were', d25line[b:c]))
segs.append(('P.for', 'What it is for (and sections 9, 10 named)', d25line[c:]))
segs.append(('P.block', 'One block used here is not this text\'s', ''.join(L[i] for i in pieces['P.block'])))

def nexthead(i):
    for j in range(i+1, n):
        if L[j].startswith('#'): return j
    return n

# Section 1
s1 = find('## 1. Purpose'); s2 = find('## 2. Definitions')
c1 = next(i for i in range(s1, s2) if L[i].startswith('**One constraint'))
take('1.purpose', '1. Purpose (what Agreements is)', s1, c1)
take('1.constraint', '1. One constraint on everything below', c1, s2)

# Section 2
s3 = find('## 3. The data')
retired = [i for i in range(s2, s3) if re.match(r'- \*\*(Succession|Join|Triggered)\*\*', L[i])]
answers = next(i for i in range(s2, s3) if L[i].startswith('- **Answers**'))
take('2.retired', '2. Definitions: three retired words (Succession, Join, Triggered)', 0, 0)
segs.pop(); idx=retired; used.update(idx); add('2.retired', '2. Definitions: three retired words (Succession, Join, Triggered)', idx)
take('2.answers', '2. Definitions: Answers (the answer words, invalid and rejected)', answers, s3)
take('2.defs', '2. Definitions: the other words', s2, answers)

# Section 3
s31 = find('### 3.1'); s32 = find('### 3.2'); s4 = find('## 4. Grammar rules')
take('3.intro', '3. The data each act carries (field kinds, one fault one rule)', s3, s31)
take('3.1', '3.1 Terms (the table)', s31, s32)
t = next(i for i in range(s32, s4) if L[i].startswith('An assent'))
take('3.2', '3.2 Statement (the table)', s32, t)
take('3.2b', '3.2 after the table (content, first act, what a resolving update carries, report)', t, s4)

# Section 4
g1 = find('### G1.')
take('4.intro', '4. Grammar rules: introduction', s4, g1)
s5 = find('## 5. Tasks')
rules = [i for i in range(g1, s5) if L[i].startswith('### G')]
rules.append(s5)
for r in range(len(rules)-1):
    a_, b_ = rules[r], rules[r+1]
    name = L[a_].strip('# \n')
    gid = name.split('.')[0]
    lie = [i for i in range(a_, b_) if L[i].startswith('**Lie exposed.**')]
    pro = [i for i in range(a_, b_) if L[i].startswith('**Protects.**')]
    rest = [i for i in range(a_, b_) if i not in lie+pro and i not in used]
    # trailing '---' separator before section 5 goes with the clauses? put it apart
    sep = [i for i in rest if L[i].strip() == '---']
    rest = [i for i in rest if i not in sep]
    used.update(rest); add('4.%s.rule' % gid, '%s: the clauses' % name, rest)
    used.update(lie); add('4.%s.lie' % gid, '%s: Lie exposed' % gid, lie)
    used.update(pro); add('4.%s.pro' % gid, '%s: Protects' % gid, pro)
    if sep: used.update(sep); add('sep4', 'separator', sep)

# Section 5
s51 = find('### 5.1'); s52 = find('### 5.2'); s53 = find('### 5.3'); s6 = find('## 6. Open')
tbl = next(i for i in range(s5, s51) if L[i].startswith('| # |'))
take('5.intro', '5. Tasks: introduction (one cMIP per socket ...)', s5, tbl)
pay = next(i for i in range(tbl, s51) if L[i].startswith('A payment is an act'))
take('5.table', '5. Tasks: the table K1 to K8', tbl, pay)
take('5.pay', '5. Tasks: the payment\'s task (one paragraph)', pay, s51)
four = next(i for i in range(s51, s52) if L[i].startswith('Four things a cMIP'))
take('5.1', '5.1 Five things built on the blocks (table, escrow, data path)', s51, four)
take('5.1b', '5.1 Four things a cMIP could perhaps also build, kept', four, s52)
take('5.2', '5.2 What can be said in this language (table of 19 rows)', s52, s53)
take('5.3', '5.3 Modules (table, place and clock, standing)', s53, s6)

# Section 6: per parameter
s7 = find('## 7. Stated')
ps = [i for i in range(s6, s7) if re.match(r'- \*\*P\d+', L[i])]
take('6.intro', '6. Open parameters: introduction', s6, ps[0])
ps2 = ps + [s7]
for k in range(len(ps)):
    pid = re.match(r'- \*\*(P\d+)', L[ps[k]]).group(1)
    take('6.%s' % pid, '6. %s' % pid, ps2[k], ps2[k+1])

# 7
s8 = find('## 8. What is still')
take('7', '7. Stated costs', s7, s8)
s81 = find('### 8.1'); s82 = find('### 8.2'); s83 = find('### 8.3'); s84 = find('### 8.4'); s9 = find('## 9.'); s10 = find('## 10.')
take('8.intro', '8. What is still open: introduction', s8, s81)
take('8.1', '8.1 What this text needs from the other layers', s81, s82)
take('8.2', '8.2 For Nobody, allegedly', s82, s83)
take('8.3', '8.3 Left as draft 23 has it', s83, s84)
take('8.4', '8.4 Still open from earlier drafts', s84, s9)
take('9', '9. What a builder needs that is not in this text', s9, s10)
take('10', '10. What the encoding must fix', s10, n)

left = [i for i in range(n) if i not in used]
add('rest', 'separators and blank lines not assigned above', left)
tot = sum(B(t) for _,_,t in segs)
assert tot == len(data), (tot, len(data))
out = []
for k, lab, t in segs:
    h, q = spans(t)
    out.append(dict(key=k, label=lab, bytes=B(t), hist=h, quote=q))
json.dump(out, open(sys.argv[2], 'w'), indent=1)
print(tot)
for o in out: print('%-14s %7d %6d %6d  %s' % (o['key'], o['bytes'], o['hist'], o['quote'], o['label']))
```
