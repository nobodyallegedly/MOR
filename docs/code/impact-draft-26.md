# What draft 26 and encoding 3 do to verifier 2: the one sheet

*Session 4 of 4 under the codemeister of MOR (Machine, allegedly, narrow hat), 27 November 2026. A record of work, not a decision. Nothing is built and nothing is decided here: every reading is a question, and every proposal or lean is labelled as whose it is. No text, code or vector of MOR is changed by this file.*

**The wish, quoted.** From `docs/decisions.md` on main, "Current wish": "We need to change the current wish to updating the core after the findings" (Nobody, allegedly, 26 November, 16:46). On the order (27 November, 14:53): "We finish this rewrite of agreements, then we turn our attention to money, and after that we’ll tackle development." On this wave (27 November, 16:54): "Yes pls"

**His words on the text, quoted from the ledger.** "This version of agreements is not to be used bare. Big warning needs to be placed on it." "Not to be used bare. Agreements offer the basic sockets to draft rule books, not one unified way of agreeing, more like a language used to decide how to agree." "Protect the unknown parties." "There is no valid update for her anymore. Only a valid agreement" "A fork is a fork." "Knots a cross acts by nature, and possibly cross layer." "Missing act is always “I don’t know”" "There is no such thing as an unsigned act on Mor" "If the terms stipulate two keepers, both keepers are needed. Sorry can’t do" "The person publishing the act is by default an author, the rest adds signature later" "No, Ana took the risk, she bears the responsability."

---

## 1. What this sheet is

**In plain words.** Verifier 2 is the code that reads Agreements acts by draft 25 and encoding 2 and gives the answers ("in force", "fork", "unchecked" and the rest). Draft 26 replaces draft 25, and encoding 3 replaces encoding 2. This sheet says, rule by rule, what verifier 2 would have to answer differently under them, which test cases change, which go, and which new ones are needed. It then estimates what verifier 3 would take, and in what order it could be built. It builds nothing and decides nothing.

**Precisely.** It is made from three sessions' parts, carried over here with this session's checks:

| Part | What it covers | Branch | Commit |
|---|---|---|---|
| 1 | draft 26's rules 5.1 to 5.6 (28 numbered, 33 lettered) | `claude/impact-draft-26-part-1-av0yhg` | `7c9a7fc` |
| 2 | draft 26's rules 5.7 to 5.13 (40 numbered) and section 6 | `claude/impact-draft-26-part-2` | `8ca374b` |
| 3 | encoding 3: the E-rules, the twelve byte choices, the layers below, a stranger's reading | `claude/impact-draft-26-part-3` | `00f00f4` |

What was read: draft 26 and encoding 3 at `d4373f0` (branch `claude/draft-26-outline-vbtvu7`, pull request 292); draft 25 and encoding 2 on `claude/agreements-clean-1-hahuwn`; verifier 2 at `f1a13feb` (branch `claude/agreements-verifier-2`: `core/src/agreements_new/` and `core/vectors/agreements-new/`); the ledger, `docs/decisions.md` on main; the MOR lead's notes of 27 November on main (`docs/lead/notes/2026-11-27-what-changed-in-agreements.md`, `2026-11-27-settled-by-the-lead.md`); the build list, `docs/agreements-from-scratch/review-1-impact-on-verifier.md` on main, Part 4, section C; the sheet of 26 November, `docs/code/impact-26-november.md` on `claude/impact-26-november-4vze7a`.

**Marks.** As the parts mark them: **[traced]** to a rule, a ledger line, a line of code at `f1a13feb` or an act, cited; **[counted]** by a script, named; **[inferred]** a reading, with what would confirm it. Where this session adds a claim, it carries its own mark. Every lean is labelled: *part 1's lean*, *part 2's lean*, *part 3's lean* (the parts call each "the session's"), or *this session's lean* (session 4). "The lead's reading" is the MOR lead's, never his words.

### What this session checked, and what held

| Check | How | Result |
|---|---|---|
| Every numbered rule and lettered part of draft 26 covered once | `rules.py`: reads every `**5.x.y**` item and every `(a)` under one, in section 5 of `draft-26.md` at `d4373f0`, against the rule headings of parts 1 and 2, and looks for each lettered part quoted in its rule's section | **68 numbered, 33 lettered**, as draft 26 sets them out. 28 numbered (and all 33 lettered) in part 1, 40 numbered in part 2; **none missing, none covered twice**; every lettered part quoted in its rule's section [counted] |
| Every E-rule of encoding 3 in part 3, and all twelve items of its section 11 | headings of `encoding-3.md` at `d4373f0` against part 3's | E1 to E20, E23, E25, E24 (23 rules), the set of acts, section 6 (the report) and section 9: **all in part 3**. Section 11's "Open in this text, not yet chosen": **12 items, all in part 3's section B**, the five marked "for Nobody, allegedly" (items 4, 8, 9, 10, 11) the same five part 3 marks [counted] |
| Every quotation | `quotes.py`, `quotes2.py`: every span in double quotes and every quoted rule block of the three parts, against the texts on the branches named, main, the code and the vectors | parts 1 and 2: **every quotation found** in its file. Part 3: every quotation of a file found; **not found**: the eight quotations of its stranger's report (section D, a subagent's report kept in no file, so not checkable), and its own plain-words questions for Nobody, allegedly, written in quote marks (its words, not quotations) [counted] |
| Every file and line of code | `cites.py`: every `file:line` (and `to` line) cited, resolved by each part's own convention, checked to exist at `f1a13feb` | 105 in part 1, 94 in part 2, 95 in part 3: **all exist**. Spot-read against what they are cited for: one slip, at 5.5.5 (below) [counted; the spot-read traced] |
| Every build-list row named | `rows.py`: each row a part names, against Part 4, section C's table | **each is that row**; one line number differs from the row's own (5.5.5, below) [counted] |
| Every question of 26 November named | each `Q` a part cites against the sheet of 26 November's "The questions" | **each is that question** (Q1 to Q26 as cited) [traced] |
| The 22 of 26 November | the sheet of 26 November's totals ("line 1: 3; line 6: 2; line 7: 2; line 8: 3; line 9: 1; line 10: 1; line 16: 5 (a new recipe file); line 18: 3; line 19: 2") against the parts | **all 22 placed**; five placed by both part 1 and part 2 (section 4) [counted] |
| The six entries of 27 November | the prompt's six names against the parts | **all six placed**; three placed by both part 1 and part 2, one of them with different acts (section 4) [counted] |

**Where the parts disagree** (said here, not chosen between; each is repeated where it falls):

1. **Grammar case 64** ("no place named: in force per the anchoring the reader accepts, with it named"). Part 1 retires it (5.5.3: "the sentence it tests ... is gone"); part 2 counts it as changing answer (5.13.5: **per anchoring** → **not shown**, by the pin).
2. **Grammar case 74** ("a filling's rights: a later version changes them where the version it was earned under names an update condition that answers valid"). Part 1 retires it (5.4.3: "the sentence it tests is gone"); part 2 keeps its answer, **shown**, and changes its name, sentence and one `stubs_asked` entry (5.10.7).
3. **`valid.json` case 1** ("every optional field"). Part 3 has it change answer, its author at position 2 naming a role (**invalid**, 5.3.1; or **rejected**, E6, under keeper reading (i)); part 1 counts `valid.json` 7 only under 5.3.1. This session read the generator: case 1's Terms name `Party::Role(...)` at position 2 and `authors: Some(vec![0, 1, 2])` (`core/examples/support/agreements_new.rs:367` to `:374`) [traced].
4. **`valid.json` case 43**, if the signer must be an author (Q5). Part 1: pass → invalid. Part 3: a third act held changes, "not the case's answer". The file says of every case: "the answer is about the last act" (`valid.json`, `about`) [traced].
5. **Grammar case 102** ("after a sale, Terms with the holder of the moment stay in force"). Part 1 counts it under 5.4.1 (shown → not shown); its `tests` is G14.2, among the 15 cases of G14 (99 to 113) that part 2 lists for this session to place, and that no part places (section 4) [counted].
6. **A late update shown by knots across layers** (27 November). Part 1 writes it with a Money payment in `relies_on` (5.5.4); part 2 with an Identity witness act (5.13.1). Both are kept below, as two vectors.
7. **Line 19's second vector of 26 November.** Part 1 writes it together with line 1's first, as one vector (5.5.4: "26 Nov, line 1, 1; and line 19, 2"); part 2 writes it apart (5.13.3, "The words also relied on": the Text act named in version 2's `body` and in version 3's `relies_on`).
8. **Counts placed twice.** Part 1 and part 2 each write five of the same new vectors (section 4); part 1 and part 2 each count two of the same removals, and part 2 and part 3 the same field (section 8).

---

## 2. The table

One row per rule of draft 26 (5.1.1 to 5.13.5, then section 6 and 6.1) and per E-rule of encoding 3. *Size*: a **word** (an answer word or a reason's wording), a **rule** (a check added or changed), a **field**, a **value form**, a **removal** (code that goes), an **interface part**. *Change answer*: today's vectors whose expected word or qualifier would differ (G: `grammar.json`; V: `valid.json`; I: `invalid.json`); rule numbers renamed in every case are not counted; *if* marks a count that rests on a question. *New*: new vectors, none written; *(26 Nov)* one of the 22 of the sheet of 26 November, *(27 Nov)* one the ledger's entries of 27 November add. Rows for 5.1.1 to 5.6.6 are part 1's, 5.7.1 to 6.1 part 2's, the E-rules part 3's (this session wrote part 3's rows from its sections, which have no table). A **⚑** marks a row where the parts disagree or count the same thing; the note follows the table.

| Rule | Short name | Size | Change answer | Retired | New |
|---|---|---|---|---|---|
| 5.1.1 | An agreement as a party | none | 0 | 0 | 0 |
| 5.1.2 | Named, and signing; an agreement's signature | a rule | G 49, 50, 52 (by 5.4.1) | 0 | 3 (1 of 27 Nov) |
| 5.1.3 | The receiver's two forms | a word | 0 | 0 | 0 |
| 5.1.4 | Receiver for an act | a removal | G 67, 68 (by 5.4.1); if: G 66, 76, 77 | 0 | 2 |
| 5.1.5 | A rule may take a receiver | none | 0 | 0 | 0 |
| 5.2.1 | Named by fingerprint | none | 0 | 0 | 1 (27 Nov) ⚑ |
| 5.2.2 | The words are a Text act | a rule | 0 | 0 | 3 (1 of 26 Nov, 1 of 27 Nov) ⚑ |
| 5.2.3 | What is left unread | a word | 0 | 0 | 1 (26 Nov) |
| 5.3.1 | Authors are signers | a rule | V 7; ⚑ V 1 (part 3); if Q5: V 12, ⚑ 43, and G 17 to 25, 27 to 30, 55 to 59, 65 | 0 | 2 (1 of 27 Nov) |
| 5.3.2 | Authors bear the words | none | 0 | 0 | 0 |
| 5.4.1 | Coming into force; the pin; which keepers | a rule | G 1, 2, 5, 10, 12, 14, 26, 35, 46, 49, 50, 52, 53, 55, 56, 67, 68, 91, ⚑ 102 (19); if: G 8, 11, 30, 31, 66, 71, 72, 73, 75, 76, 77, 95 | 0 | 6 (1 of 27 Nov) ⚑ |
| 5.4.2 | A role asks for `in_force` | none | 0 | 0 | 0 |
| 5.4.3 | What an assent binds | a rule | G 2 (by 5.4.1) | ⚑ G 74 (with 5.10) | 3 (2 of 26 Nov) |
| 5.4.4 | An agreement is not counted by default | none | 0 | 0 | 0 |
| 5.4.5 | Counter signature | a word, a rule | G 36; G 35 (by 5.4.1) | 0 | 4 |
| 5.5.1 | The gate and the pin | a rule, a removal | if: G 8, 11, 30 | 0 | 3 (1 of 26 Nov) |
| 5.5.2 | When Terms stop | a word | 0 | 0 | 0 |
| 5.5.3 | Which Terms are in force | a removal ⚑ | 0 (G 60, 61 relabelled) | ⚑ G 64 | 1 |
| 5.5.4 | Two updates of one version; a late update | a word, a rule | G 29, 65; if: G 31 | 0 | 6 (4 of 26 Nov, 1 of 27 Nov) ⚑ |
| 5.5.5 | Replacing; the default signers | a rule, a removal | 0 | G 58 | 7 (2 of 26 Nov, 4 of 27 Nov) ⚑ |
| 5.5.6 | No act ends an agreement but an update | none | 0 | 0 | 0 |
| 5.5.7 | The update condition | a rule, a word | if: G 8, 11 | G 74 (counted at 5.4.3) | 1 |
| 5.6.1 | Who is bound | a rule | G 12, 55, 56 (by 5.4.1) | 0 | 3 (1 of 26 Nov, 1 of 27 Nov) ⚑ |
| 5.6.2 | A replacing Terms act | none | 0 | 0 | 0 |
| 5.6.3 | One's own name only | none | 0 | 0 | 0 |
| 5.6.4 | An act under a power whose Terms were replaced | a rule | 0 | 0 | 2 |
| 5.6.5 | Constitution, executive, judicial | none | 0 | 0 | 0 |
| 5.6.6 | Nothing an agent made is set aside | a removal ⚑ | 0 | G 58 (counted at 5.5.5) | 1 |
| 5.7.1 | A signer's previous act | a word | 0 | 0 | 0 |
| 5.7.2 | Two acts on one previous act: a fork | a word | 0 | 0 | 2 (1 of 27 Nov) ⚑ |
| 5.8.1 | The keeper | a field ⚑ | 0 | 0 | 0 |
| 5.8.2 | Copies at any relay | a removal (counted at 5.13.5) | 0 | 0 | 1 |
| 5.8.3 | Several keepers | a rule | 0 | 0 | 3 (1 of 27 Nov) ⚑ |
| 5.8.4 | Order per keeper | a rule | 0 | 0 | 1 |
| 5.8.5 | Whose keepers and clock count | a rule | 0 | 0 | 1 |
| 5.8.6 | No stated anchor, no condition in time | a rule, and an interface part | 0 | 0 | 3 |
| 5.9.1 | Settlement | none | 0 | 0 | 0 |
| 5.10.1 | What a role names | none | 0 | 0 | 0 |
| 5.10.2 | A spot filled, and from which version | a rule | 0 | 0 | 1 (27 Nov) |
| 5.10.3 | A filler is bound by her own assent | a word | 0 | 0 | 0 |
| 5.10.4 | A role of kind future | none | 0 | 0 | 0 |
| 5.10.5 | New identities | a removal (counted at 5.13.5) | 0 | 0 | 0 |
| 5.10.6 | No update reaches a filling | a rule | 0 | 0 | 1 (26 Nov) ⚑ |
| 5.10.7 | Rights | a removal, and a rule | 0 (⚑ G 74 kept, renamed) | 0 | 4 (2 of 26 Nov) |
| 5.10.8 | How long, and no trigger | a rule, and a field | 0 | 0 | 3 |
| 5.11.1 | Sequence, and leg | none | 0 | 0 | 0 |
| 5.11.2 | The call | none | 0 | 0 | 0 |
| 5.11.3 | Leg report | a removal (counted at 5.11.4) | 0 | 0 | 0 |
| 5.11.4 | Before paying | a removal | 0 | G 78, 80, 81, 82, 83, 84, 85, 86 | 0 |
| 5.11.5 | Reports are data | none | 0 | 0 | 0 |
| 5.11.6 | Who has agreed | none | 0 | 0 | 0 |
| 5.11.7 | The buyer's leg | a removal | 0 | G 92, 93, 94 | 0 |
| 5.11.8 | The contest | none | 0 | 0 | 0 |
| 5.11.9 | A baker may contest | a rule | 0 | 0 (⚑ G 99 to 113 placed by no part) | 1 |
| 5.12.1 | A fork is a fork | none | 0 | 0 | 0 |
| 5.12.2 | Lines, updates and forks | a word | 0 | 0 | 0 |
| 5.12.3 | Both tips stop | a rule, already owed (T1, T4) | 0 | 0 | 2 |
| 5.12.4 | Resolving update | a word, and a rule | if: G 22 | 0 | 4 (2 of 26 Nov) |
| 5.12.5 | A power to resolve | none | 0 | 0 | 0 |
| 5.12.6 | What others relied on stands | none | 0 | 0 | 0 |
| 5.12.7 | A fork that stands | none | 0 | 0 | 0 |
| 5.12.8 | Rival resolving updates | a word | 0 | 0 | 0 |
| 5.12.9 | A client's duty | none | 0 | 0 | 0 |
| 5.13.1 | What an act is read against | a rule | 0 | 0 | 3 (1 of 27 Nov) ⚑ |
| 5.13.2 | An act names what it relied on | none | 0 | 0 | 0 |
| 5.13.3 | Shown after | a rule | 0 | 0 | 4 (4 of 26 Nov) ⚑ |
| 5.13.4 | Order from naming | a word | 0 | 0 | 0 |
| 5.13.5 | Anchoring | a removal ⚑ | ⚑ G 64 | 0 | 2 |
| 6 | Tasks handed to cMIPs (K1 to K8) | a field, a removal, an interface part | 0 (G 74's `stubs_asked`, at 5.10.7) | 0 | 1 (27 Nov) ⚑ |
| 6.1 | Modules | none | 0 | 0 | 0 |
| E1 | An everyday act | none | 0 | 0 | 0 |
| E2 | Spec hash and type | a value, a removal | I 8 (or retired) | V 34, 35, 36; I 103 to 111 (12) | 2 |
| E3 | No `objects`, no `acks` | none | 0 | 0 | 0 |
| E4 | A closed map | none | 0 | I 103 (counted at E2) | 0 |
| E5 | A fingerprint | a row (no code) | 0 | 0 | 0 |
| the set | The set of acts (a row of E5, or E26) | a value form | 0 | 0 | 5 (26 Nov, line 16) |
| E6 | An identifier | a word (key 8's form is E19's) | 0 | 0 | 0 |
| E7 | A socket | none | 0 | 0 | 0 |
| E8 | The body | a word | 0 | 0 | 0 |
| E9 | A party | none | 0 | 0 | 0 |
| E10 | A role | a word | 0 | 0 | 0 |
| E11 | In whose name | a removal (a report's use) | 0 | 0 | 0 |
| E12 | The receiver | a word | 0 | 0 | 0 |
| E13 | Authors | a rule | V 7; V 1 (unless key 8 rejects it first); if the signer is an author: V 12 | V 7 as a passing case | 1 |
| E14 | A power | a word | 0 | 0 | 0 |
| E15 | A Statement's kind | none | 0 | 0 | 0 |
| E16 | A call | none (a value form later, from the MICS) | 0 | 0 | 0 |
| E17 | `previous` | none | 0 | 0 | 0 |
| E18 | Lists | a removal (a report's lists), and a field (the keeper list) | 0 | I 107, 108 (counted at E2) | 0 (see E19) |
| E19 | Presence, and the Terms map | a field ⚑ (key 8's form), a rule (a note) | V 1 under keeper reading (i) (**rejected**, E6) | 0 | 11 (9 to 11, on items 5 and 6) |
| E20 | Presence in a Statement | none | 0 | 0 | 0 |
| §6 | The report (E21 and E22 gone) | a removal: two rules, one file | V 35 among those at E2 | (counted at E2) | 0 |
| E23 | `previous` among the acts held | a word | 0 | 0 | 2 |
| E25 | The act `body` names (new) | a rule, and a constant from another layer | 0 | 0 | 8 ⚑ |
| E24 | One signing | none | 0 | 0 | 0 |
| §9 | The checker's order | a rule (E25's place) | 0 | 0 | 0 |

**The ⚑ notes.** 5.2.1 and 6: the stand-in vector is written by both parts. 5.2.2 and E25: part 1's 5.2.2 vectors and part 3's E25 vectors tell the same stories (a Text act held: pass; a Statement held: invalid), part 1 as a check "among the acts held (as G6.1 is today, `check_held`)", part 3 in the checker's files; whether they are one vector or two (one per file) is not said. 5.3.1: `valid.json` 1 and 43 (disagreements 3 and 4 above). 5.4.1 and 5.8.3: "two keepers, one silent" for in force, written by both; 5.4.1's case 102 (disagreement 5). 5.4.3 and 5.10.7: case 74 (disagreement 2). 5.5.3 and 5.13.5: case 64 (disagreement 1), and the reader's anchoring counted as a removal by both. 5.5.4 and 5.13.1, 5.13.3: line 1's three vectors of 26 November written by both; the 27 November late update across layers by both, with different acts; line 19's second (disagreement 7). 5.5.5 and 5.7.2: the double assent, forked, written by both. 5.6.1 and 5.10.6: line 8's second vector of 26 November written by both. 5.6.6 and 6: the delegation removal counted by both (part 2 as "K1's delegation part"). 5.8.1 and E19: the keeper field counted by part 2 (an act field) and part 3 (key 8's form): one field. 5.11.9: the cases of G14 (section 4).

---

## 3. The rules, part by part

*In plain words.* This section carries over the three parts' sections as they wrote them, in draft 26's order and then encoding 3's, with headings one level down. Each rule's section gives the rule, what it replaces and the code it meets, what a verifier would answer differently (in plain words first), the size, the vectors, the build list and the sheet of 26 November, and the choices it leaves. Where this session's check did not hold, or two parts disagree or write the same thing, a *check note* follows the section. "This part", "this session" and "the session" inside a carried section mean the part that wrote it; a question it names "(below)" is in section 10, under that part's number (P1 Q14 is part 1's Q14).

### 3.0 Part 1's run, and what rules 5.1 to 5.6 rest on

### What was run today [counted]

- `cargo test -p mor-core --locked` at `f1a13feb`: passes, 570 tests, none failing, one ignored (summed from its `test result` lines).
- `python3 core/vectors/agreements_new_grammar_check.py`: "grammar.json: 115 of 120 cases judged again, and agree"; the five not judged are under G10.2, G10.6, G11.4, G4.11 and G5.1(b) (cases 71, 74, 91, 58, 59). It needs the `unicodedata2` package, which this container lacked; it was installed in the session's scratch folder, not in the repository.
- What draft 26 would change cannot be run: no code is written. Every "after" below is read from the text and the code, and marked so.

---

### What these rules rest on in sections 3 and 4

Only what changed from draft 25 and reaches a verifier's answer in 5.1 to 5.6; each is used in the sections below.

- **Author** (§3.2): "An author is named as a signer, never by role and never as an agreement, and is a known party (§5.3)." Draft 25 let an author be a role (G3.1). Reaches 5.3.1 and 5.5.5(a). [traced]
- **Known party**, **unknown party** (§3.2): new. "The known parties are those who have a say in the agreement's updates, and, by default, those who sign them (§5.5)." "Any filling of a role is an unknown party's, whenever it was made." Reaches 5.4.3, 5.5.5(a), 5.5.7(e), 5.6.1(c). [traced]
- **Gate**, **pin**, **valid**, **in force** (§3.3): new as definitions. "In force" now needs the pin for a first version as for an update. Reaches 5.4.1, 5.5.1, and every rule that asks "in force". [traced]
- **Late update** (§3.3) and the answer **late** (§3.6): new; draft 25 had no answer word for it (build list R1). Reaches 5.5.4(c). [traced]
- **Fork** (§3.3): widened to "Terms coming into force against a counter signature that cancels one of the assents they need". Reaches 5.4.5. [traced]
- **Knot**, **shown after** (§3.4): "Knots cross acts and layers: any fingerprint of an act, carried in a field of any act the verifier holds, is a knot, whatever layer either act belongs to, the field `body` included." Today `held.rs:140` to `held.rs:190`, `namings`, reads payload fields of Agreements acts only, and not `body` (`held.rs:150` to `held.rs:159`). The rule is session 2's (5.13); it reaches 5.4.1's pin and 5.5.4(a) here. [traced]
- **Keeper** (§3.4): *place* renamed; "Terms may name one keeper or several (§5.8)". Today one place (`terms.rs:286`, key 8; `mod.rs:243` to `mod.rs:259`). The field's form is session 3's; the agreement among several keepers reaches 5.4.1, 5.5.5(d), 5.6.4. [traced]
- **Anchoring** (§3.4): "An anchoring of a reader's own choosing gives an answer only as that reader's, named so; it never gives the Terms' own answer (§5.13)." Today `Reader.anchoring` (`mod.rs:67` to `mod.rs:73`) gives it where the Terms name no place and no clock (`mod.rs:251` to `mod.rs:257`). Reaches 5.1.4, 5.5.3, 5.5.4(b). [traced]
- **§4.2** `authors`: "each named as a signer, never by role and never as an agreement"; `body`: "the act id of the Text act that carries the words (§5.2)"; `in_force`: "Its answer on coming into force is left unread in a Terms act that carries `replaces` (§5.2)"; `keeper`: "one keeper or several". Fields and their bytes are session 3's. [traced]
- **§4.4, the order of faults**: §5.2, then each role, then 5.4 (a role and no `in_force`), then 5.3 (authors). Verifier 2 checks in the same order (`terms.rs:544` to `terms.rs:609`: G2.1, G10.1, G4.2, G3.1) [traced]. Draft 26 adds to item 2 "then the act `body` names, held and not a Text act", which needs the acts held, as G6.1 does today, not one act's bytes [inferred].

---

### 5.1 An agreement as a party

#### 5.1.1 Terms may name an agreement as a party

1. **The rule.**

   > **5.1.1** Terms MAY name a party as an agreement, by its root fingerprint.

2. **Replaces** D25 G1.1, unchanged [traced, D26 trace §5.1]. **Code:** `terms.rs` decodes a party named as an agreement as `Party::Agreement` (used at `terms.rs:532`); nothing in the grammar turns on it alone [traced].
3. **What a verifier answers differently.** Nothing. Ana and Ben name their co-op's agreement as a party; Dana asks whether the Terms are well formed: shown, before and after [traced].
4. **Size:** none.
5. **Vectors:** none change; none retired; none new.
6. **Build list, sheet:** none.
7. **Choices left to the code:** none.

#### 5.1.2 Named, and signing; an agreement's signature; one level

1. **The rule.**

   > **5.1.2** **Named, and signing.** Naming an agreement as a party asks nothing of it: it need not sign to be named, it is not counted by the default of §5.4, and where it has not signed it is not bound by any act of these Terms, and neither are its parties. A party named as an agreement MAY sign: an assent to these Terms, where their `in_force` rule asks for it (§5.4). Its signing covers what those Terms carry, a call among them (§5.11). It signs as its own Terms require: every one of its signers, or what its own rule accepts (a vote, or a signer its Terms give a power to sign for it). **An agreement's signature.** An act is signed by an agreement x when its `for` names x, by its root; its `under` names Terms of x that are in force (§5.5) and give a power for acts of that kind; and that power's rule, applied to the acts held, says yes (where they give two or more powers for that kind, any one of their rules). Whoever signs such an act (a signer x's power names, or whoever the rule of a vote accepts) signs on behalf of x's parties, under the power x gave. That act is x's signature. It binds every party bound by x's Terms, as x's Terms say (§5.6), and no one else; and it binds a party of x only where that party's own signature is on the version of x's Terms that gives the power: no update condition can give it for a party who did not sign that version (§5.6). It is an act within the agreement it is made in, and stands there in its signer's own line (§5.7). Where x's Terms give no such power, x signs by every one of its signers: one act by each of them, its `for` naming x and its `under` naming x's Terms in force. Each act has one signer, as the core has it. **Which acts are one signing.** Those acts are one signing of x where they are the same act but for their signer and their place in that signer's own line: they name the same `agreement`, `terms`, `kind`, `content`, `for`, `under`, `settlement`, `resolves` and `continues`; their `previous`, `answers` and `relies_on` may differ. x has signed once an act so matched is held from every one of its signers; for an assent, that is an assent by each of them, `for` x, to the same Terms. Each of those acts stands in its own signer's line (§5.7). Where an act's `for` names an agreement, its `under` MUST name Terms of that agreement: an act made for an agreement under any other Terms is not that agreement's signature. **One level.** Its signers are the parties its own Terms name as signers. A party it names as an agreement is not one of them, and neither are that agreement's people: these grammar rules MUST NOT be read as making an agreement's signing need the signature of anyone inside an agreement it names, unless its own Terms say so. A verifier reads what they require from that agreement's Terms in force (§5.5); where it lacks them, the answer is **unchecked** (§3.6).

2. **Replaces** D25 G1.2, changed in two places [traced, D26 trace §5.1]: "a named delegate" becomes "a signer its Terms give a power to sign for it" ("Delegation is a leftover", 18 November: "I think it's best. It's a leftover of the old ways"); and the new sentence "it binds a party of x only where that party's own signature is on the version of x's Terms that gives the power: no update condition can give it for a party who did not sign that version" ("Nothing about me without my signature", 18 November). "in force (§5.5)" now means the gate and the pin. **Code:** `force.rs:69` to `force.rs:115`, `power`: for `Who::Agreement`, it checks that `under` is Terms of x (`force.rs:76` to `force.rs:81`), that they are in force (`force.rs:84` to `force.rs:87`) and the power's rule; it checks no party of x's signature on that version (the signed check at `force.rs:89` to `force.rs:94` is for a person only). `force.rs:119` to `force.rs:152`, `one_signing`: x's signers are its parties named as signers (`force.rs:121`). `order.rs:262` to `order.rs:268`: a person is bound by x's signature where "they are bound by its Terms in force", read through `signed_by`, whose inherited arm (`force.rs:502` to `force.rs:519`) counts someone bound through an update [traced].
3. **What a verifier answers differently.** *Plain words.* The co-op x has three members, Ana, Ben and Carla. Its version 1, signed by Ana and Ben, gives Ben a power to sign for the co-op. Carla joined by version 2, which Ana and Ben signed without her, under an update condition that let them (she is bound by it as a known party, 5.6.1(c)). Ben signs an assent for the co-op to an outside deal. Dana asks whether Carla is bound by it. *Before:* shown, G5.1(b), "the act is the agreement's signature, and they are bound by its Terms in force (G1.2)", where the power stands in the version in force. *After:* not shown for Carla: the power is in a version she never signed; shown for Ana and Ben [inferred from the rule's new sentence; confirm by building `power` with that check]. And the first-version pin reaches every case here: x's Terms must be pinned before x can sign (5.4.1).
4. **Size:** a rule: the party-of-x check, for the power path only (the path with no power, every signer signing, already has each signer's own act).
5. **Vectors.** *Change answer:* grammar 49 "an agreement as a party signs through a power its own Terms give: its signature" (shown → not shown), 52 "an agreement with no power signs by every one of its signers: the same act from each: one signing" (shown → not shown), and 50 "Terms whose `in_force` asks for the agreement's signing: in force once it signed" (shown → not shown), all three by 5.4.1: x's Terms (`party/X`, `party/X2`) are not pinned by knots [counted, `pin_count2.py`; the answer after inferred]. 51 and 54 stay not shown. *Retired:* none. *New:*
   - x's version 1 (Ana, Ben) gives Ben a power of kind `assent`; version 2 adds Carla, signed by Ana and Ben under a condition stub that answers valid; both pinned; Ben's assent for x to an outside Terms, its `under` naming version 2. Asked `bound`, Carla: **not shown**, 5.1.2; Ana: **shown**.
   - The same, Carla's own assent to version 2 held: **shown** for Carla (on Q14's lean, the version `under` names).
   - (27 Nov, "The giver bears it, not the agent") Ben's assent for x, asked `bound` of Ben: **not shown**, 5.6.1 (made in another's name); asked of x's signers, as above.
6. **Build list, sheet:** R6 (an agreement whose own power says no: draft 26 keeps "any one of their rules" and the power path, so the code's reading stands, read only); R17 (an act for an agreement under another's Terms: draft 26 adds "an act made for an agreement under any other Terms is not that agreement's signature", the code's reading, `force.rs:76` to `force.rs:81`); R18 (a role's filler in one signing: "Its signers are the parties its own Terms name as signers", the code's reading, `force.rs:121`); R29 (a power that came in by an update) is settled by the new sentence [traced].
7. **Choices left to the code:**
   - Q14 (below): which version "gives the power": the one `under` names, or the one that first wrote it?

#### 5.1.3 The receiver's two forms

1. **The rule.**

   > **5.1.3** Terms MAY name a `receiver`: one of their own parties named as a signer or as a role, by its position among the parties; or an agreement, by its root fingerprint, whether or not it is one of their parties. The two are told apart in the bytes, not by guessing (§4.2). A receiver that names, by position, a party named as an agreement makes the act not an Agreements act: an agreement is named as receiver by its root.

2. **Replaces** D25 G1.3: "rejected" becomes "not an Agreements act" [traced, D26 trace §5.1]. **Code:** `terms.rs:531` to `terms.rs:534`, rejected under E12 [traced].
3. **What a verifier answers differently.** Nothing in kind: Ana's Terms name as receiver, by position, the co-op named as a party; the checker refuses the bytes, before and after. The verdict's word is the encoding's (session 3) [traced].
4. **Size:** a word (the text's name for the verdict).
5. **Vectors:** `invalid.json` "terms: a receiver whose position names a party named as an agreement (name it by its root)" keeps its answer; its rule's text cites draft 26. None new.
6. **Build list, sheet:** none.
7. **Choices left to the code:** none.

#### 5.1.4 Receiver for an act

1. **The rule.**

   > **5.1.4** **Receiver for an act.** Whatever a payer, an act or a rule of one agreement gives or owes to an agreement, it gives or owes to that agreement's **receiver for the act**: the `receiver` named by the version of that agreement which the act that gives or owes names (§5.13). Where that act names no version, a verifier MUST take the receiver from that agreement's Terms in force, per the keepers that agreement's Terms name, qualified **per keeper** with those keepers named, or, where they name none, **as shown** (§5.5, §5.8, §5.13). Which Terms of that agreement are in force is answered by §5.5: while a fork of its Terms stands, the receiver is the one named by the Terms both branches replace, and the verifier MUST show the fork with that answer and MUST NOT choose a branch (§5.5). Where the receiver so named is one of that agreement's own parties, the answer is that party. Where it is another agreement (5.1.3), the two are agreements of a sequence (§5.11), and a verifier reads that agreement's receiver in the same way, and so on, until one of an agreement's own parties is reached. That party is who receives: the receiving side of one leg (§5.11). These grammar rules follow a receiver no further. What that party then passes on is another leg, carried out under its own agreement's Terms and the cMIPs they name, and is read only as §5.11 says. If a version read names no receiver, or names as receiver a signer or a role that is not among its own parties, or the spot named is not filled, or is filled more than once (which of them receives is not said), or an agreement is met a second time on the way, no one receives, and the answer is **not shown**. Where the act that gives or owes names, as the version it read, Terms that are not shown as a version of that agreement, the answer is **not shown**. Where it names Terms that name an envelope, the answer of Envelopes' rules for such Terms comes first (§2): where those Terms are invalid, no one receives by them, and the verifier shows the payment with them, and the answer invalid, that rule named; where that rule answers not shown or unchecked, so is the receiver. Where it names a tip of a fork that stands, the receiver is the one named by the Terms both branches replace, the fork is shown with it, and the act is shown as built on a tip (§5.5, §5.12); once that tip is set aside, §5.12 says how it is read. If the verifier lacks that agreement's acts, it is **unchecked** (§3.6). A verifier that stops following receivers from agreement to agreement before a party is reached answers **unchecked**, and says how far it followed (§3.6, §7).

2. **Replaces** D25 G1.4, changed [traced, D26 trace §5.1]: "per the anchoring the reader accepts" goes; "per place" becomes "per keeper", with the keepers the Terms name; G14.3 is read as Envelopes' rules. D25 had: "per that agreement's own place, qualified **per place** with that place named, or, where it names none, per the anchoring the reader accepts, or **as shown**". **Code:** `receiver.rs:41` to `receiver.rs:120`, `receiver_rec`; with no version named, the Terms in force come from `chain` (`receiver.rs:80` to `receiver.rs:91`), whose qualifier comes from `scope_of`, which reads the reader's anchoring (`mod.rs:251` to `mod.rs:257`); with a version named, the version must be in the chain's line, stopped in a fork, or set aside (`receiver.rs:66` to `receiver.rs:78`) [traced].
3. **What a verifier answers differently.** *Plain words.* Ana and Ben's work names Ben as receiver and names no keeper. Carla pays without naming a version. Dana, who accepts a relay of her own choosing as anchoring, asks who receives. *Before:* Ben, **per anchoring**, her relay named. *After:* Ben, **as shown**; her relay's order may be given beside it only as Dana's own answer, named so [traced to the rule]. And where the work's first version is not pinned (5.4.1), no Terms are in force, and the answer is **not shown** [inferred].
4. **Size:** a removal (the reader's anchoring in `scope_of`, for this answer), with the qualifier renamed (per keeper).
5. **Vectors.** *Change answer:* grammar 67 "a receiver that is another agreement: followed until one of an agreement's own parties is reached" (shown → not shown) and 68 "a verifier that stops following receivers answers unchecked, and says how far it followed" (unchecked → not shown: W's Terms are not in force before the limit is reached), both by 5.4.1 [counted, `pin_count2.py`; inferred after]. *If Q6:* 66 "the receiver for an act: the receiver named by the version it read", 76 "a receiver named as a role, filled once: the one who fills it receives", 77 "a receiver named as a role whose cMIP the verifier lacks: unchecked": each names a version that is not pinned; under the code's reading (the version must be in the line) they become not shown [inferred]. 69, 70 stay not shown; 20, 21 stay (their root is pinned); 108 stays invalid; 25 is session 2's (5.12). *Retired:* none. *New:*
   - A payment naming no version, Terms naming no keeper, the reader holding an anchoring of its own: **shown, as shown**; the reader's order, if given, labelled as the reader's (5.5.3).
   - A payment naming no version, Terms naming two keepers that disagree on the last version: **not shown**, the keepers disagree (5.5.5(d)).
6. **Build list, sheet:** R16 (a payment naming a version further along a set-aside branch) is 5.12's, session 2's. T6 (late Terms never read the reader's anchoring) goes: draft 26 never lets the reader's anchoring give the Terms' answer, so the code's not reading it is now right [traced, D26 5.5.3]. Sheet: none.
7. **Choices left to the code:**
   - Q6 (below): must a version named by a payment have been in force, or only be shown as a version of that agreement?

#### 5.1.5 A rule may take a receiver as input

1. **The rule.**

   > **5.1.5** A rule (§6), in any socket, MAY take as an input a receiver for an act, so answered, or what a leg report states (§5.11).

2. **Replaces** D25 G1.5, unchanged [traced, D26 trace §5.1]. **Code:** none in the grammar; a cMIP's own input (`sockets.rs`, `Ask`) [traced].
3. **What a verifier answers differently.** Nothing.
4. **Size:** none.
5. **Vectors:** none.
6. **Build list, sheet:** none.
7. **Choices left to the code:** none.

---

### 5.2 The words, and what the Terms use

#### 5.2.1 Named by fingerprint

1. **The rule.**

   > **5.2.1** The `body`, every piece in `relies_on`, and every cMIP named anywhere in a Terms act MUST be named by fingerprint.

2. **Replaces** D25 G2.1, unchanged [traced, D26 trace §5.2]. **Code:** `terms.rs:544` to `terms.rs:553` (the body's words and every socket); `legs.rs:24` [traced].
3. **What a verifier answers differently.** Nothing. Ana's Terms name the body's words by a web address: invalid, before and after.
4. **Size:** none.
5. **Vectors.** *Change:* none; `invalid.json` "terms: the body's words named by an address, not a fingerprint", "terms: the body's cMIP not named by fingerprint (one fault: G2.1, not G2.2)", "terms: in_force's cMIP not named by fingerprint", "terms: a power's rule not named by fingerprint", "terms: a role's spot cMIP not named by fingerprint", and grammar 117 "a body not named by fingerprint makes the Terms invalid" keep their answers, renumbered. *New:*
   - (27 Nov, "A specification is a Text act, named by its id") Terms whose `condition` names a cMIP by a stand-in fingerprint (the SHA-256 of a label no text hashes to), the verifier holding no cMIP of that name: under draft 26, **unchecked**, 5.5.7(h), as today; the Terms are not invalid, since a stand-in is a fingerprint. The ledger's line queues the change to the Development MIR behind draft 26 [traced]; the vector records today's answer, so that the Development change shows when it lands.
6. **Build list, sheet:** none.
7. **Choices left to the code:** none.

*Check note (session 4).* The stand-in vector here is written by part 2 too, at section 6; section 4 lists it once (line 6).

#### 5.2.2 The words are a Text act

1. **The rule.**

   > **5.2.2** **The words are a Text act.** The words of Terms MUST be a Text act (Text, rule 14), public or private, and the Terms MUST name it in `body` by its act id, beside the socket of the cMIP that reads it (task K1). The Text act comes first: Terms can name only an act that already exists, and naming it by its act id is all that this asks of them. Where the act `body` names is held and is not a Text act, the Terms are **invalid**: they lack what they need. These grammar rules read that act id as they read any fingerprint (5.2.1); they do not read the words.

2. **Replaces:** new (N4 of the brief) [traced, D26 trace §5.2], from "The words of Terms are a Text act" (26 November): "Text comes first as a rule since agreement needs to point to it". The invalid case is the lead's reading of 09:27 (D26 report, "Found items"). **Code:** none checks it. `terms.rs:163` to `terms.rs:171`: the body's words are a `Named` fingerprint; `held.rs:62` to `held.rs:64`: an act handed that is of another specification (a Text act) is put among the rejected, so the grammar cannot tell that the act `body` names is a Text act, or that it is not one [traced].
3. **What a verifier answers differently.** *Plain words.* Ana writes her words as a Text post, then Terms naming its act id in `body`. Ben, by mistake, writes Terms whose `body` names Ana's assent, a Statement. Dana holds both acts. *Before:* both Terms pass; neither's body is read. *After:* Ana's Terms pass; Ben's are **invalid**, 5.2.2, "they lack what they need" [traced to the rule]. Where Dana does not hold the act named, nothing changes: the grammar does not read the words (SN Q24: "The verifier need not hold the words to answer the grammar's questions").
4. **Size:** a rule, among the acts held (as G6.1 is today, `check_held`), and it needs the verifier to recognise a Text act held (its spec hash: encoding 3's `TEXT` list, session 3).
5. **Vectors.** *Change:* none: every body in the vectors is a stand-in, not held (the README: every word is "the SHA-256 of a label beginning `agreements-new/`") [traced]. *New:*
   - (26 Nov, line 19, 1) Terms whose `body` names a Text act handed beside them: the Terms **pass**, the Text act known (not lacking).
   - Terms whose `body` names a Statement held: **invalid**, 5.2.2 (item 2 of §4.4, after the fingerprints).
   - (27 Nov, "Signing an agreement relies on its words", 26 November, with his "rely is the solution to all acts someone has to rely on") Terms whose `body` names a Text act that its signer's key change has left out (Identity, rule 34), and a party's witness act relying on it: the Terms **pass** 5.2.2; the Text act stays held and readable, **disputed** in Identity's sense (§3.6, Disputed). What Agreements answers does not change; the vector shows that a voided words act does not make the Terms invalid.
   - Line 19's second vector (the Text act named also in `relies_on` of a late update: **late**) is written once, at 5.5.4.
6. **Build list, sheet:** the sheet's line 19 and line 20; its Q23 (is the body's naming a knot): settled by §3.4, "the field `body` included"; `held.rs:150` to `held.rs:159` leaves it out (session 2's, 5.13). Q24 and Q25: settled by SN ("Text comes first" asks nothing beyond the naming). Q2 (is an act held of another specification known): settled by "Knots are knots" (27 November), the lead's line: "Any fingerprint in a field of any act the verifier holds is a knot, whatever layer either act belongs to" [traced].
7. **Choices left to the code:**
   - Q11 (below): the act `body` names, held and unreadable (private, without its key): invalid, unchecked, or not read?
   - Is a Text act "held" for this rule when it is handed only as a piece (`held.rs:72`, `hold_piece`), with no bytes?

*Check note (session 4).* Part 1 places this check "among the acts held (as G6.1 is today, `check_held`)", which is the checker's; part 3 writes the same check as E25, with its own vectors. Lines 7 and 8 of section 4 and E25's lines 92 and 93 tell the same stories; whether they are one vector or two is not said.

#### 5.2.3 What is left unread

1. **The rule.**

   > **5.2.3** Anything a Terms act refers to in another way is not part of those Terms. A verifier MUST NOT read it as part of them. An entry of `relies_on` that is not a fingerprint is not read, and does not make the Terms invalid; a verifier says that it left it unread. A field §4 does not give is not left unread: the act is not an Agreements act (§4). A `body`, or a cMIP in a socket, that is not named by fingerprint makes the Terms **invalid**, under 5.2.1 (§3.6). **What is left unread**, in these grammar rules, is that entry of `relies_on` and four things more, each where it is said: an entry of `powers` of kind `replaces` (§5.6); a call in Terms that do not hold the task it is attached to (§5.11); a `what` on a role of kind future (§5.10); and the answer of `in_force` on coming into force, in a Terms act that carries `replaces` (5.4.2, §5.5). A verifier says of each that it left it unread.

2. **Replaces** D25 G2.2, with one entry added: the answer of `in_force` on coming into force, in a Terms act that carries `replaces` (SN Q7: "An update's own `in_force` field is left unread, listed in G2.2 with the rest"); "three things more" becomes "four" [traced, D26 trace §5.2]. **Code:** `order.rs:30` to `order.rs:48`, `whole`, lists the checker's notes under G2.2, G5.2 and G10.4, and the calls; no note exists for an update's `in_force` [traced].
3. **What a verifier answers differently.** *Plain words.* Ana and Ben's version 2 carries its own `in_force`. Dana asks what the Terms leave unread. *Before:* "nothing in these Terms is left unread". *After:* "left unread: the answer of `in_force` on coming into force" [traced to the rule].
4. **Size:** a word (one more entry in an answer's list).
5. **Vectors.** *Change:* none: grammar 16, 114, 115 keep their answers. *New:* (26 Nov, line 18, 3) an update carrying its own `in_force`: asked `whole`, **shown**, with that entry left unread; asked `update`, its answer is the gate's and the pin's alone (5.5.1).
6. **Build list, sheet:** the sheet's Q7, settled (A) by SN Q7 [traced].
7. **Choices left to the code:** none.

---

### 5.3 Authors

#### 5.3.1 Authors are parties named as signers

1. **The rule.**

   > **5.3.1** `authors` MUST name one or more of the parties these Terms name, each named as a signer: an author is never a party named by role, and never one named as an agreement (§3.2). Terms whose `authors` name a party named by role or as an agreement, or one who is not one of their parties, are **invalid**.

2. **Replaces** D25 G3.1: "`authors` MUST name one or more of the parties named as signers or roles." The role goes, on the lead's reading ("There is no unsigned act: the author is a known party", 27 November: "There is no such thing as an unsigned act on Mor") [traced, D26 trace §5.3]. **Code:** `terms.rs:600` to `terms.rs:609`: invalid for an author beyond the parties, or named as an agreement; a role passes [traced].
3. **What a verifier answers differently.** *Plain words.* Ana drafts an offer whose only author is the buyer's role. *Before:* the Terms pass (`valid.json` 7). *After:* **invalid**, 5.3.1 [traced]. And, if the ledger's line of 27 November, 16:48 is written into this rule: Ben signs a second version naming Ana alone as author; *before:* it passes; *after:* **invalid** ("a Terms act whose `authors` leaves its signer out is invalid", the lead's line; his words: "Absolutely. The person publishing the act is by default an author, the rest adds signature later") [traced to the ledger; not in draft 26: its report lists it as "Carried to the end of the stage", 1].
4. **Size:** a rule (the role arm becomes invalid); with the 16:48 line, a second rule, readable from one act's bytes (the outside's signer against the signers `authors` names) [inferred].
5. **Vectors.** *Change answer:* `valid.json` 7 "terms: no party named as a signer, an author named by role" (pass → invalid, 5.3.1) [traced]. `invalid.json` 71 "terms: an author that is a party named as an agreement" keeps its answer; its plain words ("authors name parties named as signers or roles") change. *If the 16:48 line is written (Q5):* `valid.json` 12 "terms: a second version of the same Terms, by another signer (with the first, a fork of Terms)" and 43 "held: a fork of Terms, and the resolving update" (pass → invalid), and in `grammar.json` 19 Terms acts signed by someone not among their authors, in cases 17 to 25, 27 to 30, 55 to 59 and 65 (a twentieth, in case 116, is invalid already) (each `fork/v2b`, `power to resolve/v2b`, `late/v2b` or `bound/Y`), which would become invalid and take their forks and powers with them [counted, `signer_author.py`; what each case then answers is not read]. *New:*
   - Terms whose only author is a role: **invalid**, 5.3.1.
   - (27 Nov, 16:48, if written) Terms signed by Ben whose `authors` names Ana only: **invalid**.
6. **Build list, sheet:** the sheet's Q8 and Q15 ("Terms nobody signed"): settled by "There is no unsigned act" (27 November). D26 report items 1 and 3 [traced].
7. **Choices left to the code:**
   - Q5 (below): is the 16:48 line part of 5.3.1, checked by the checker from one act?

*Check note (session 4).* **Disagreement.** Part 3 counts `valid.json` case 1 as changing answer too (its author at position 2 names a role: **invalid**, 5.3.1, or **rejected**, E6, under keeper reading (i)); this part counts case 7 only. The generator gives case 1's Terms `Party::Role(...)` at position 2 and `authors: Some(vec![0, 1, 2])` (`core/examples/support/agreements_new.rs:367` to `:374`) [traced]. On Q5, this part has `valid.json` 43 change; part 3 says a third act held changes, "not the case's answer"; the file says of every case: "the answer is about the last act" [traced]. This session does not choose.

#### 5.3.2 The authors bear the words

1. **The rule.**

   > **5.3.2** The authors are the parties who bear the failure of the words to mean one thing. A cMIP that reads a judge's decision, in whichever socket it sits (§6), MUST accept `authors` as an input.

2. **Replaces** D25 G3.2, unchanged but for "(#4 Align)" [traced]. **Code:** none: what a cMIP accepts is the cMIP's (`sockets.rs`).
3. **What a verifier answers differently.** Nothing.
4. **Size:** none.
5. **Vectors:** none.
6. **Build list, sheet:** none.
7. **Choices left to the code:** none.
---

### 5.4 The first version, and what an assent binds

#### 5.4.1 Coming into force; the pin; which keepers

1. **The rule.**

   > **5.4.1** **Coming into force.** A Terms act without `replaces` is a first version. A first version comes into force when the assents its `in_force` rule requires are present (task K2). Where it carries no `in_force`, it comes into force when there is an assent to it in the name of every party it names as a signer. **The pin.** It is in force once the order of the signatures that put it in force is shown. Where it names keepers, they show it, at the positions they give those assents (§5.8). Where it names none, knots show it: each party in whose name one of those assents is counted has made an act in that same name within the agreement that is shown after every one of those assents (§5.13). Any such act pins, a counter signature included: a counter signature so shown is late, and cancels nothing (5.4.5); one that nothing orders against those assents is a fork (5.4.5, §5.12). Until then it is not yet in force: a verifier answers **not shown** for it as in force, with that reason, no order being shown. Where it names keepers, only they pin, and an act they do not yet show is not yet in force. **Which keepers.** Before any Terms of an agreement are in force, the only keepers it has are those its first version names: whether that version is in force is judged per those keepers, and per the clock it names, and so is every assent that counts toward it (§5.8).

2. **Replaces** D25 G4.1, with the pin added and one clause dropped [traced, D26 trace §5.4]: D25's "Terms that name no party as a signer, and carry no `in_force`, are in force at once." goes (every Terms act now names its author as a signer). The pin is the lead's reading on the brief's item 1 ("a first version still waits for the pin"), from "In force once pinned" (18 November); "a counter signature included" is the lead's reading of 09:47 (D26 report, "Found items"). **Code:** `chain.rs:345` to `chain.rs:356`, `walk`: the root is in force where `in_force_raw` says yes, and no order is asked; `force.rs:271` to `force.rs:297`, `in_force_given`: the `in_force` cMIP's yes or no (`force.rs:272` to `force.rs:279`), else every party named as a signer, and with none named, yes at once (`force.rs:289`); `force.rs:302` to `force.rs:331`, `in_force_raw`; per place, an assent counts where the place shows it (`mod.rs:210` to `mod.rs:236`, `counts`), which is a keeper's pin already [traced].
3. **What a verifier answers differently.** *Plain words.* Ana writes Terms naming Ana and Ben, and no keeper. Ana assents; Ben assents. Nothing more is made. Dana asks whether the Terms are in force. *Before:* **shown**, G4.6, as shown. *After:* **not shown**, 5.4.1, "no order being shown": neither Ana nor Ben has made an act, after both assents, that names them. When Ana's next act in the agreement names both assents, Ana's side is pinned; when Ben's does too, the Terms are in force [traced to the rule]. *In the round:* entry 571's work `db3ce515…` has one signer, the author; her assent `6d7a0585…` and her second version `5b9e8c91…`, whose `previous` names that assent, pin the first version by knots [traced to the round's table, 1b].
4. **Size:** a rule: the pin by knots, a new check on every first version that names no keeper; per keeper it is already met by `counts`. One removal: `force.rs:289`'s "none named: in force at once" has no case left.
5. **Vectors.** *Change answer,* by the pin, where the root names no keeper and some party whose assent puts it in force has no later act naming every such assent [counted, `pin_count2.py`; the after answer inferred along the code path named]:
   - `in_force`: 1 "in force by the default: an assent in the name of every party named as a signer", 5 "in force by `in_force`: the cMIP (a stub asking one name) says the assents it requires are present", 14 "the agreement goes on in its last version: the original stays in force", 35 "a counter signature made after the Terms came into force: they stay in force", 46 "the act after an act not held still counts toward in force", 50 "Terms whose `in_force` asks for the agreement's signing: in force once it signed", 53 "a party named as an agreement is not counted by the default: in force with the signers' assents", 102 "after a sale, Terms with the holder of the moment stay in force": shown → not shown.
   - `last_version`: 10 "the last version, in force" (shown → not shown); 26 "an act shaped as a resolving update where there is no fork is an update like any other: with the other, a fork" (fork → not shown: no version in force, so no updates are read).
   - `assent`: 2 "an assent counted, to Terms in force, binds: shown" (shown → not shown, 5.4.3's "not yet in force, no order being shown").
   - `bound`: 12 "bound by an update without an assent of one's own, where the update condition answers valid", 55 "bound through a power: the act's `for` names them, its `under` Terms that bind them, in force, whose power's rule says yes", 56 "bound by one's own assent": shown → not shown.
   - `signature_of`: 49 "an agreement as a party signs through a power its own Terms give: its signature", 52 "an agreement with no power signs by every one of its signers: the same act from each: one signing": shown → not shown.
   - `receiver`: 67 (shown → not shown), 68 (unchecked → not shown); `before_paying`: 91 "before paying: which agreements of a sequence carry a call, from whom, and their data cMIP, one at a time" (shown → not shown, `legs.rs:341` to `legs.rs:342` reading the last version).
   - *Unchanged* though their root is not pinned, their answer already not shown, unchecked or invalid, or resting on no Terms in force: 0, 3, 4, 6, 7, 9, 13, 15, 33, 34, 37, 47, 48, 51, 54, 57, 59, 69, 106, 116, 117, 118, 119, and the order, line and act questions [counted for the knots; inferred for the paths]. *Pinned already:* the fork, late and line cases 17 to 30 (but 26) and 41, 42, 44, whose update's assents name every assent to the root; the keeper cases 60 to 63 and 65 [counted].
   - *If a question goes one way:* 8, 11 (Q4), 30 (Q3), 31 (Q2), 66, 76, 77 (Q6), 71, 72, 73, 75 (Q1); 95 "a contest made against an offer: it reaches the signers that version names, and no one else" on session 2's reading of 5.11 (`legs.rs:383`).
   *Retired:* none. *New:*
   - Ana and Ben assent, nothing after: **not shown**, 5.4.1, no order shown.
   - The same, Ana's later Statement naming both assents, Ben's none: **not shown**, the same reason (one side pinned).
   - The same, each with a later act naming both: **shown**, in force, as shown.
   - The same Terms naming one keeper that shows both assents: **shown**, per keeper, with no later act.
   - (27 Nov, "Two keepers named, both needed") the same Terms naming two keepers, one showing both assents, the other silent: **not shown**, per keeper, the second keeper not yet showing them ("If the terms stipulate two keepers, both keepers are needed. Sorry can’t do"). Not yet in draft 26's 5.8.3 (D26 report, item 5); 5.8 is session 2's.
   - A counter signature by Ben shown after both assents, naming them: **not shown** as cancelling (late, it cancels nothing), and it pins Ben's side (5.4.5); with Ana's later act, **shown**, in force.
6. **Build list, sheet:** R13 (the default for `in_force`: every signer, no agreement) stays, as SN M19 and M26 have it [traced]. The sheet's Q9 ("Does an update need pinning?") and Q4: settled by 5.5.1(b) and this rule's pin [traced]. Not on the build list: the pin for a first version is new since it.
7. **Choices left to the code:**
   - Q1 (below): with an `in_force` cMIP, which assents are "those assents"?
   - Q2 (below): does an act named and not held leave the pin unchecked?
   - Q16 (below): which acts are "an act in that same name within the agreement": a report, a witness act, an act in another agreement?
   - Q8 (below): with several keepers, does every one have to show the assents?

*Check note (session 4).* Case 102 tests G14.2, one of the 15 cases of G14 that part 2 leaves for this session to place and that no part places (section 4.3; question 11). The "two keepers, one silent" vector here is written by part 2 too, at 5.8.3 (section 4, line 17).

#### 5.4.2 Terms that name a role carry `in_force`

1. **The rule.**

   > **5.4.2** Terms that name a party by role MUST carry `in_force`, in every version: an update that names a party by role carries it too. In an update it is read for who fills a role (§5.10); its answer on coming into force is left unread there (5.2.3, 5.5.1).

2. **Replaces** D25 G4.2, as D25 has it, with its reading for updates [traced, D26 trace §5.4; SN M11: "The role's module (`in_force`, G4.2) is read for who fills a spot and for the first version's coming into force; it is not read for an update"]. **Code:** `terms.rs:597` to `terms.rs:599`: invalid for any Terms act, update or not, naming a role and carrying no `in_force` [traced].
3. **What a verifier answers differently.** Nothing for the check. Ana's version 2 of her offer names the buyer's role and carries no `in_force`: invalid, before and after. Its `in_force`'s answer on coming into force is no longer read (5.2.3, 5.5.1).
4. **Size:** none here (the unread answer is 5.5.1's removal).
5. **Vectors:** `invalid.json` "terms: a party by role and no in_force" and "terms: two faults: a role with no kind, and no in_force (the first in section 2's order: G10.1, then G4.2)" keep their answers. None new.
6. **Build list, sheet:** the sheet's Q17 ("Does a filling still count for in force?"): settled (A) by SN M11 [traced].
7. **Choices left to the code:** none.

#### 5.4.3 What an assent binds

1. **The rule.**

   > **5.4.3** **What an assent binds.** An assent binds its signer only while the Terms it names are in force, with one exception: an assent by which its signer earned a filling binds that signer, and binds the known parties to them, as the version it names says, for as long as that version's words say, on the clock that version names, whether or not a later version is in force; no update reaches it (§5.10). About an assent, a verifier answers **shown** where it is counted in a party's name and those Terms are in force, or where it earned a filling under a version since replaced, with that version named (§5.10); otherwise **not shown**, with the reason (those Terms are not yet in force, no order being shown; they have been replaced; they are a tip of a fork, or a late update; the assent is cancelled, 5.4.5). An assent made within a branch set aside is shown as **disputed**, and binds no one (§5.12).

2. **Replaces** D25 G4.3, changed [traced, D26 trace §5.4]: the exception for an assent that earned a filling ("For the unknown party there is no update, only the agreement she signed", 27 November: "There is no valid update for her anymore. Only a valid agreement"); **shown** for an assent to a replaced version with that version named (SN M15); two reasons added. **Code:** `order.rs:148` to `order.rs:188`, `assent`: shown only where counted and the Terms are in force (`order.rs:183`); otherwise not shown with the in-force reason (`order.rs:185`) [traced]. `spots.rs:14` to `spots.rs:15`: fillings are read from the last version only [traced].
3. **What a verifier answers differently.** *Plain words.* Ana sells seats by an offer; Carla buys under version 2 by an assent that earns her a filling. Ana and Ben then put version 3 in force. Dana asks about Carla's assent. *Before:* **not shown**, G4.3, "and it binds no one", the Terms it names having been replaced. *After:* **shown**, 5.4.3, with version 2 named: it earned a filling, and binds her and binds Ana and Ben to her for as long as version 2's words say [traced to the rule; SN M15]. *In the round:* the lineups' buyers' assents name the version the count takes as last (round, 1d): the after answer is the same word with the version named [traced to the round].
4. **Size:** a rule: an assent that earned a filling is read against the version it names, not the version in force.
5. **Vectors.** *Change answer:* 2 (by 5.4.1). 40 "an assent that is a tip of a signer's fork: not shown, it does not count" and 118 "an assent made under Terms the verifier lacks: unchecked" keep theirs [traced]. *Retired:* 74 "a filling's rights: a later version changes them where the version it was earned under names an update condition that answers valid": no update reaches a filling (this rule; 5.5.7(f); 5.10, session 2's), so the sentence it tests is gone; counted here once [traced]. *New:*
   - (26 Nov, line 7, 1) Carla's assent that earned a filling under version 2, version 3 in force, her role's K5 cMIP held: **shown**, 5.4.3, version 2 named.
   - (26 Nov, line 7, 2) The same without the K5 cMIP: **unchecked** (whether it earned a filling).
   - Ben's assent as a known party to version 2, version 3 in force: **not shown**, "they have been replaced" (the exception is for a filling only, SN M15's "a known party has a say in updates and is bound by them").
6. **Build list, sheet:** the sheet's line 7, its Q12 and Q13: settled by SN M15 (shown, version named; a filling only) [traced].
7. **Choices left to the code:**
   - Q10 (below): "binds the known parties to them": which question asks it, and what does it answer?

*Check note (session 4).* **Disagreement.** Case 74 is retired here; part 2 keeps it, **shown**, its name, sentence and one `stubs_asked` entry changed (5.10.7). This session does not choose (question 10).

#### 5.4.4 An agreement named is not counted by default

1. **The rule.**

   > **5.4.4** A party named as an agreement is not counted by the default of 5.4.1. An `in_force` rule MAY ask for its signing; it has then signed when what its own Terms require is present (5.1.2).

2. **Replaces** D25 G4.4, as D25 has it [traced]. **Code:** `force.rs:282` to `force.rs:296`: the default counts parties named as signers only [traced].
3. **What a verifier answers differently.** Nothing by this rule; case 53 moves by the pin (5.4.1).
4. **Size:** none.
5. **Vectors:** 53 (counted at 5.4.1). None new.
6. **Build list, sheet:** R13 (as at 5.4.1).
7. **Choices left to the code:** none.

#### 5.4.5 Counter signature

1. **The rule.**

   > **5.4.5** **Counter signature.** No assent binds anyone, and nothing in Terms counts, until those Terms are in force (5.4.1, 5.4.3). A counter signature is a Statement of kind `counter_signature` whose `terms` names the Terms an assent names, and which cancels that assent. Made by the signer of the assent in their own name, it follows that assent in the signer's own line (§5.7): directly, or after other acts of that signer. Made for a party under a power of kind `counter_signature` (§5.6), or as an agreement's signature (5.1.2), it cancels the assent counted in that party's name that it names, directly or through acts that name it. It cancels that assent, and no one else's: an assent so cancelled is not counted by 5.4.1. It sets nothing aside: the assent stays an act, readable, shown as cancelled, and so does what it was made within. An assent made for a party by an agent, under a power (§5.6), is cancelled in the same way as one the party made itself, and in no other: by a counter signature in that party's name, which names that assent, directly or through acts that name it, while a counter signature is available (below); the party itself MAY make it, in its own name, as may the agent, as that assent's signer, or another under a power of kind `counter_signature` (§5.6). **Which assent.** A signer may assent, cancel, and assent again. An assent is read against the first counter signature in the same name that follows it; a later counter signature is read only against the assents in that name made after the one before it. **Until the completion.** A counter signature is available only until the assents that put the Terms in force (5.4.1, its first sentence) are shown before it, by the keepers the Terms name, at the positions they give, or, where they name none, by knots: one shown after them is late, cancels nothing, and pins as any act of its signer within the agreement does (5.4.1). One made for Terms that are in force changes nothing: Terms in force change only as §5.5 says. Where a party is an agreement, "signed", for that party, is whatever that agreement's own Terms require: every one of its signers, or what its own rule accepts: one level (5.1.2). A verifier reads that from that agreement's Terms in force (5.5.3); where it lacks them, the answer is **unchecked** (§3.6). A party named as an agreement is not counted by the default of 5.4.1 (5.4.4), so this has effect only where the Terms' own `in_force` rule asks for that party's signing. Such a party makes a counter signature by the same act as its assent: under a power of kind `counter_signature`, or by all its signers (5.1.2). **The order.** Whether the Terms were in force before the counter signature is an answer about what is latest: per keeper, or as shown (5.5.3). In both, the assent the counter signature cancels is counted as not yet cancelled. With keepers, the positions they give settle it: the counter signature changes nothing where its position is after the position at which they show the completion (the assents that put the Terms in force, 5.4.1, its first sentence), and cancels where it is before (§5.8). With none, only knots give an order (§5.13): where the counter signature is shown after acts enough for the Terms to come into force (5.4.1, its first sentence), it is late, and changes nothing; where, counting every act held but those shown after the counter signature, the Terms would not come into force, it came before, and the assent it cancels is not counted. Where the Terms would not come into force even with every act held counted, nothing had completed them, and the counter signature cancels. Otherwise the counter signature and the acts that would put the Terms in force are a fork (§5.12): two acts competing to change the same state, with no order shown. While it stands, neither takes effect: the Terms are not in force. A verifier answers **fork**, shows both, and MUST NOT choose between them; the fork is resolved as §5.12 says. **Its answer.** About a counter signature, **shown** means that it cancels the assent it is read against; **not shown** means that it is not shown as cancelling (it is late and changes nothing, or it follows no assent), with the reason; **fork** means that it and the Terms' coming into force are a fork. Where counter signatures lean on one another so that the reading does not settle, the MICS says what a verifier answers (§2). A later assent by the same signer to the same Terms is counted as any assent is.

2. **Replaces** D25 G4.10, changed [traced, D26 trace §5.4]: where neither order is shown, a **fork**, not "not shown" (D25: "Otherwise whether those Terms are in force is **not shown**, and the verifier says why."; "A fork is a fork", 27 November); the window closes when the completing assents are shown before it; a late counter signature pins; per keeper. **Code:** `force.rs:400` to `force.rs:438`, `counter_cancels`: "nothing had completed them" (`force.rs:408` to `force.rs:413`), per place (`force.rs:414` to `force.rs:426`), by citing (`force.rs:428` to `force.rs:436`), and otherwise `Tri::NotShown` (`force.rs:437`); `force.rs:347` to `force.rs:379`, `first_counter_signature`, which picks the first by id where none orders them (`force.rs:374` to `force.rs:376`); `order.rs:191` to `order.rs:218` [traced].
3. **What a verifier answers differently.** *Plain words.* Ana, Ben and Carla must all assent. Ana and Ben do. Carla assents, and Ana, at about the same time, cancels her own assent; neither act names the other. Dana asks about Ana's counter signature. *Before:* **not shown**, G4.10, "citing gives no order between the counter signature and the Terms coming into force". *After:* **fork**, 5.4.5: the counter signature and the coming into force are two acts competing to change the same state; neither takes effect; the Terms are not in force; the verifier shows both and does not choose ("Agreed, Carla is the monkey wrench that gets it all stuck", 18 November, as the build list's D2 quotes it) [traced to the rule].
4. **Size:** a word (the answer **fork** for a counter signature), and a rule (the late counter signature pins, 5.4.1).
5. **Vectors.** *Change answer:* 36 "a counter signature and a completing assent, neither naming the other: whether the Terms are in force is not shown" (not shown → **fork**) [traced to the code path, `force.rs:437`]; 35 (by 5.4.1). 37 "with the counter signature's order not shown, in force is not shown" keeps **not shown**, with the fork beside it [inferred]. 32, 33, 34 keep theirs. *New:*
   - (Build list T2) Gil assents for Ana under a power; Gil then cancels it, with no power of kind `counter_signature`, before Carla's completing assent, which names Gil's counter signature: **shown**, it cancels ("as may the agent, as that assent's signer").
   - Two counter signatures in Ana's name, one by Ana and one by Gil under a power, nothing ordering them: the answer of Q9 (below).
   - Ana's counter signature shown after every completing assent, by knots: **not shown**, late, it changes nothing; and it pins Ana's side (5.4.1).
   - With an `in_force` stub asking two of three, a counter signature after the two: **not shown**, late (the completion is "the assents that put the Terms in force (5.4.1, its first sentence)"; build list R12, the code's reading).
6. **Build list, sheet:** D2 (settled otherwise than the row's "should": a fork, not "it cancels"); D3 (the withdrawn signer: the fork leaves the Terms not in force, so nothing binds her while it stands); D4 and T5 (the first counter signature by id: draft 26 keeps "the first counter signature in the same name that follows it", and an order only from knots or keepers; Q9); T2 (the agent's own counter signature: draft 26 keeps it); R12 (settled: the completion is the `in_force` rule's) [traced].
7. **Choices left to the code:**
   - Q9 (below): two counter signatures in one name that nothing orders.
   - How a fork of a counter signature against a coming into force is resolved in bytes is not said (D26 report, item 7; 5.12, session 2's).
---

### 5.5 Updates: the gate and the pin

#### 5.5.1 The gate and the pin

1. **The rule.**

   > **5.5.1** **The gate and the pin.** An update replaces the version it names only where it passes two checks:

   >
   > (a) **The gate.** The update condition of the version it names, or that condition's default where the version names none, answers **valid** for it (5.5.7). No other assent is asked.
   >
   > (b) **The pin.** Its order after the last replacement of that version is shown, by the keepers that version names (5.5.5(d)), or, where it names none, by knots (§5.13); where it names keepers, only they pin, and an act they do not yet show is not yet in force. It is shown after the acts that put that version in force (5.4.1 for a first version; this rule for one that is itself an update); and every other update of that version that passes the gate is shown after it, and so is late. The order between two updates of one version is read from the acts that put each through the gate, as 5.5.4 says: it does not wait on either update's own pin.

   >
   > **Valid, and in force.** Valid is the gate's answer, and says only that the update is allowed. In force needs both checks. An update can be valid and not in force: allowed, with its order not shown. A verifier then answers **valid** for it, and **not shown** for it as in force, with the reason: no order is shown, or it is a tip of a fork. Two updates of one version that both pass the gate, neither shown after the other, are a fork (§5.12): both stop, and the version both name stays in force (5.5.4(e)). An update's own `in_force` is left unread (5.2.3): whether it replaces is answered by this rule alone.
2. **Replaces:** new (N1) [traced, D26 trace §5.5], from "The gate and the pin; a fork, not a race" (26 November): "Ok, that”s what I was trying to remember we forced the deadlock and push them to resolve it"; and "Valid and in force, two words, two jobs" (26 November, 18:00): "Agreed." It takes the place of D25 G4.8's last sentence: "Whether the replacing Terms are themselves in force is G4.1's, as draft 18 has it (G4.5; section 8.4)." **Code:** `force.rs:602` to `force.rs:611`, `then_in_force`: after the condition answers valid, an update not in force by its own `in_force` is answered "valid, and not in force by its own `in_force`"; `chain.rs:170` to `chain.rs:177`, `is_update`; `chain.rs:470` to `chain.rs:622`, `step_from`: one update that is valid and in force replaces at once (`chain.rs:554` to `chain.rs:559`), two are a fork; no order after the original is asked of a single update; `chain.rs:194` to `chain.rs:218`, `first_position`, "valid and in force"; `chain.rs:737`'s words ("it is in force by its own `in_force` (G4.8)") [traced].
3. **What a verifier answers differently.** *Plain words.* Ana and Ben's version 1 is in force and names no keeper. Version 2 carries its own `in_force`, asking an assent from Carla, who never gives one; Ana and Ben assent to version 2, and their assents name nothing of version 1's. Dana asks about version 2. *Before:* **not shown**, "valid, and not in force by its own `in_force`". *After:* **valid**, by default (the gate), and **not shown** as in force, "no order is shown", until version 2, or (on Q3's lean) an assent that puts it through the gate, is shown after the assents that put version 1 in force; then it replaces [traced to the rule]. *In the round:* entry 571's second version `5b9e8c91…` names, in `previous`, the author's assent `6d7a0585…` to the root: it is shown after the act that put the root in force, so its pin holds by knots [traced to the round's table, 1b].
4. **Size:** a rule (the pin for an update), and a removal (an update's own `in_force`, `then_in_force`).
5. **Vectors.** *Change answer:* none by this rule alone that 5.4.1 does not already move. *If Q3 reads (i), the update itself:* 30 "after a late rival, the line goes on from the update that came first" (shown → not shown: `late/v2a` does not itself name the root's assents) [counted, `update_pin.py`: reading (i) no, reading (ii) yes]; and every pinned fork case with it. *If Q4:* 8 and 11, at 5.5.7. Plain words only: 8 "an update by the default: everyone who signed the original signs it: valid, by default" and 11 "an update by an update condition (a stub: one of the original's signers): valid, the condition named" say "in force by its own `in_force` (G4.8)", which goes [traced, the sheet of 26 November, line 18]. *New:*
   - (26 Nov, line 18, 1) version 2 valid by a condition, not in force by its own `in_force`, shown after version 1's acts: **valid**, and it replaces.
   - The same, its assents naming nothing of version 1's: **valid**, and **not shown** as in force, "no order is shown".
   - (26 Nov, line 18, 2) at 5.5.4.
   - Two updates of version 1, both valid, one shown after version 1's acts and the other not: **fork** (their order "does not wait on either update's own pin").
6. **Build list, sheet:** D6 (the second gate on an update: removed, as the row's "should"); the sheet's line 18, its Q5 (settled: **fork**, "A fork is a fork"), Q6 (settled: a fork of Terms is still resolved, 5.12), Q7 (settled at 5.2.3), Q9 (settled: the update needs the pin) [traced].
7. **Choices left to the code:**
   - Q3 (below): "It is shown after the acts that put that version in force": the update itself, or the update with the acts that put it through the gate?
   - Is "valid, not in force" given as two answers to one question, or as one answer with the second beside it (today's `with`)?

#### 5.5.2 When Terms stop

1. **The rule.**

   > **5.5.2** **When Terms stop.** Terms stop being in force when an update that replaces them is in force (5.5.1). While a fork of them stands (5.5.4), no Terms that replace them are in force. Terms so replaced may still govern a filling earned under them (5.4.3, §5.10).

2. **Replaces** D25 G4.5, changed: "in force" of the replacing Terms is now both checks [traced, D26 trace §5.5]. **Code:** `order.rs:76` to `order.rs:78`: Terms with a next version in the chain answer not shown, replaced [traced].
3. **What a verifier answers differently.** As 5.5.1: version 1 stops only when version 2 is pinned. Before, it stopped when version 2 was valid and in force by its own rule.
4. **Size:** a word (what "in force" means, already counted at 5.5.1).
5. **Vectors:** 9 "Terms replaced: not shown, naming the Terms that replace them" keeps **not shown**, but its reason changes: by 5.4.1 its root is not in force at all [inferred]. None new.
6. **Build list, sheet:** none.
7. **Choices left to the code:** none.

#### 5.5.3 Which Terms are in force

1. **The rule.**

   > **5.5.3** **Which Terms are in force.** Which Terms of an agreement are in force is an answer about what is latest. A verifier MUST take it per the keepers the Terms name, qualified **per keeper**, with those keepers named (§5.8); or, where they name none, from the knots, **as shown** (§5.13). It MUST NOT give it as latest without saying what the answer stands on. A keeper or an anchoring of the reader's own choosing gives an answer only as that reader's, named so: it never gives the Terms' own answer, never puts Terms in force, and never makes an update late (§5.13). **Which keepers.** Before any Terms of an agreement are in force, the only keepers it has are those its first version names (5.4.1). Whether a later version has replaced the one before is judged per the keepers the one before names (5.5.5(d)). Where versions name different keepers, the answer that given Terms are in force carries the keepers those Terms name, or **as shown** where they name none; each replacement's own answer carries the keepers it was judged by.

2. **Replaces** D25 G4.6, changed [traced, D26 trace §5.5]: per the keepers the Terms name, or as shown; a reader's own anchoring "never gives the Terms' own answer" (SN M20: "A reader's chosen keeper or anchoring gives an answer only labelled as the reader's; it never puts Terms in force and never makes an update late for the Terms' own answer"). **Code:** `mod.rs:243` to `mod.rs:259`, `scope_of`: per the place the Terms name; else, where they name no clock, per the anchoring the reader accepts (`mod.rs:251` to `mod.rs:257`); else as shown; `answer.rs:95`, `Qualifier::PerAnchoring`; `chain.rs:401` to `chain.rs:407`, the last version's qualifier [traced].
3. **What a verifier answers differently.** *Plain words.* Ana and Ben's Terms name no keeper. Dana accepts a relay of her own as anchoring and asks which Terms are in force. *Before:* **shown**, per anchoring, her relay named. *After:* **shown** (once pinned), **as shown**; what her relay says may stand beside it, labelled as hers [traced to the rule].
4. **Size:** a removal (the reader's anchoring in `scope_of`, for the Terms' own answers), and a word (the qualifier "per place" becomes "per keeper").
5. **Vectors.** *Change answer:* none beyond 64. *Retired:* 64 "no place named: in force per the anchoring the reader accepts, with it named": the sentence it tests (D25 G13.4's reader's anchoring giving the Terms' answer) is gone [traced]. *Relabelled:* 60 "in force per the place the Terms name" and 61 "an assent the place does not show does not count: not in force, per place": "per place" becomes "per keeper", answer kept. 62 and 63 keep **unchecked** (63's G7.2 sentence is 5.8's, session 2's; build list D8). *New:*
   - The case 64 replaces: no keeper named, the reader's anchoring held: **shown, as shown** for the Terms' answer, the reader's answer beside it named as the reader's.
6. **Build list, sheet:** T6 (as at 5.1.4); D8 (G7.2's contradicting place, 5.8's) [traced].
7. **Choices left to the code:**
   - Does the verifier still compute the reader's own answer and show it beside the Terms' answer, or drop the reader's anchoring entirely? The rule allows it ("gives an answer only as that reader's, named so"), and does not ask for it.

*Check note (session 4).* **Disagreement.** Case 64 is retired here; part 2 counts it as changing answer, **per anchoring** to **not shown**, by the pin (5.13.5). This session does not choose (question 9). The removal of the reader's anchoring is counted by part 2 too (5.13.5): one removal.

#### 5.5.4 Two updates of one version, and a late update

1. **The rule.**

   > **5.5.4** **Two updates of one version, and a late update.** Where two Terms acts each name the same version in `replaces`, each passes that version's gate (5.5.1(a)), and neither is shown after the other, they are a fork (§5.12): two updates, each allowed by the version they name. A late update (below) is no update, and no tip. **A late update.** Call **O** a version already replaced; **F** the update that replaced it (the Terms act that passed O's gate and pin, 5.5.1; or, where O's replacement was a fork, the resolving update that resolved it, §5.12); and **L** a Terms act whose `replaces` names O, and which passes O's gate. L is a **late update** where L is shown after the acts that put F, the version L should have named, through O's gate and pin (5.5.1), as (a) and (b) say. A late update replaces nothing, and is no tip of a fork: O stays replaced by F, and the line goes on from F as if L were not there. Where nothing shows it, L and F are a fork whose shared act is O, as for any two updates of one version, however late L may in fact be: every version after O is in the branch of F, and stops with it (§5.12).

   >
   > (a) **Which knots count.** Every fingerprint in a field of every act the verifier holds is a knot, Terms or Statement, of this agreement or another, of any layer (§3.4, §5.13). Where O names no keeper, L is shown after O was replaced, by knots, where L, or an act without which L does not pass O's gate, is shown after acts enough for F to pass O's gate and to be shown after the acts that put O in force (5.5.1), or, for a resolving update, to resolve (§5.12). A verifier gives that **as shown**, from the acts alone (§5.13). Where O names keepers, knots show L late only as a named keeper's contradiction ((c)).
   >
   > (b) **Which keepers, and which clock.** Per keeper: the keepers O names (5.5.5(d)). L came after O was replaced, per those keepers, where the first position at which, counting only the acts they show at or before it, L passes O's gate comes after the first position at which, so counted, F passes O's gate and is shown after the acts that put O in force (§5.8); a verifier gives that **per keeper**. Per clock: where the clock O names (§5.8) gives a time for each of those two events and the two times are ordered, **per clock** (§7). No other anchoring gives the Terms' own answer: a verifier MUST NOT read L as late by a time written in an act, by a keeper or a clock the Terms do not name, by what is likely, or in any other way. An anchoring of the reader's own choosing gives only that reader's answer, named so (5.5.3).
   >
   > (c) **The answer.** About L, a verifier answers **late**, names this rule and what shows that L came late (the act of L, or the act it needs, shown after F's acts; or the positions the keepers give, or the times the clock gives), and qualifies the answer **as shown** where knots show it, or **per keeper** or **per clock** where only they do. Which Terms are in force is then answered as if L were not there. An assent to L binds no one (5.4.3), and nothing built on L counts: a late update is no tip and gives no previous. A missing act is never a yes and never a no: where a chain of acts that could show L late needs an act that is named in a field of an act held, and the verifier does not hold it, whether L is late is **unchecked** (§3.6, §5.13), and so is which Terms are in force from O on (5.5.5(e)). Where knots, the keepers or the clock show L late, nothing else (a later resolving update) makes L an update again. **Knots against a keeper.** Where O names keepers, knots show L late against them only as that keeper's contradiction: a keeper's record that contradicts a knot the verifier holds (it places L before an act that L, or an act L needs, is shown after) gives **not shown**, with the reason that the keeper contradicts the acts, and the record is kept as evidence (5.8.4).
   >
   > (d) Whether an update made after another, and not shown to be late, may still be valid is the update condition's to say (5.5.7; §6).
   >
   > (e) **While a fork stands.** An assent to a tip counts for whether that tip was signed, so that the fork is seen, and for nothing else while the fork stands (§5.12). A resolving update is not a tip (§5.12). A verifier MUST answer **fork** for which Terms replace the version both tips name, show both tips, and MUST NOT choose between them, by position or in any other way. Both tips stop (§5.12): until the fork is resolved (§5.12), neither is in force, nothing built on either counts, and the Terms both replace, the last shared version, stay in force. A verifier MUST answer from them every answer that rests on the Terms in force: the powers (§5.6); the update condition (5.5.7); the roles, and who fills them (§5.10); the receiver for an act (5.1.4); whether they hold the Control task, and their calls (§5.11); their data cMIP (§5.11); the keepers and the clock (§5.8); and what any cMIP they name produces (tasks K1 to K8, §6). It MUST show the fork with each such answer, per keeper or as shown.
2. **Replaces** D25 G4.7 and its (a) to (e), changed [traced, D26 trace §5.5]: L's test is "passes O's gate" (D25: "valid and in force"); (a) any fingerprint of any act of any layer is a knot ("Knots are knots", 27 November: "Knots a cross acts by nature, and possibly cross layer."); (b) per the keepers O names and its clock, never a reader's anchoring; (c) the answer **late**, and the missing act unchecked ("Missing act is always “I don’t know”"); knots against a keeper only as the keeper's contradiction; (d) and (e) as D25 has them. **Code:** `chain.rs:232` to `chain.rs:309`, `late_against`: (a) by knots, L's own namings or one assent's (`chain.rs:235` to `chain.rs:260`), answered `Word::Shown` under G4.7; (b) per place or per the reader's anchoring (`chain.rs:261` to `chain.rs:281`), per clock (`chain.rs:282` to `chain.rs:297`); (c) unchecked where a named act is lacking (`chain.rs:298` to `chain.rs:306`); `chain.rs:624` to `chain.rs:656`, `not_late`; `mod.rs:282` to `mod.rs:295`, `known` and `lacking_in`; `held.rs:140` to `held.rs:190`, `namings` (payload fields of Agreements acts only; no `body`; the act format's `prev` not read) [traced].
3. **What a verifier answers differently.** *Plain words.* Ana and Ben's version 1 is replaced by version 2, which Ana signed, then Ben; Ben's assent to version 2 is his act in his own line. Later Ana writes version 3 naming version 1, not version 2, in `replaces`; her version 3's `previous` names her assent to version 2. Dana asks about version 3. *Before:* **shown**, G4.7, "replaces nothing, and is no tip". *After:* **late**, 5.5.4(c), as shown, naming the act that shows it [traced to the rule]. *In the round:* entry 571's third version `bba99964…` names the root `db3ce515…` in `replaces` and, in `previous`, the author's assent `352b6a32…` to the second version `5b9e8c91…`: late by knots; with the work `eeb5cef3…` named in its `relies_on` held as a Text act, it is no longer lacking, since (the lead's line in "Knots are knots") "Any fingerprint in a field of any act the verifier holds is a knot" [traced to the round, 1b; the answer after inferred].
4. **Size:** a word (the answer **late**), and rules: L's test (the gate, not "valid and in force"); knots of every layer (`namings`, and `known` for acts of other layers, session 2's 5.13 with it); the keeper's contradiction; the reader's anchoring removed from (b).
5. **Vectors.** *Change answer:* 29 "a late rival, shown by knots: it names enough acts for the other update to be valid and in force" (shown → **late**, as shown) and 65 "a late rival shown by the place the original names: replaces nothing, per place" (shown → **late**, per keeper) [traced: both are asked `update` and answer `Word::Shown` today, `chain.rs:238`, `chain.rs:272`]. *If Q2:* 31 "an update that names an act the verifier does not hold, which might show it late: which Terms are in force is unchecked" (unchecked → not shown, since its root is not pinned, unless the act not held could be the pin's act). *New:*
   - (26 Nov, line 1, 1; and line 19, 2) version 3 naming version 1, its `relies_on` naming a Text act held beside it: **late**, as shown, where today it is **unchecked**.
   - (26 Nov, line 1, 2) the same with the work declared as a piece: **late**, as shown (needs a `pieces` field in the grammar vectors' format: the library has one, `scenario.rs:60`; the file has none).
   - (26 Nov, line 1, 3) the same with a private act held without its key in `relies_on`: **unchecked**, since it could carry a knot.
   - (26 Nov, line 18, 2) a late update shown by knots where the update that came first is valid and not in force by its own `in_force`: **late**, where today it is not shown late.
   - (27 Nov, "Knots are knots") a late update shown by knots across layers: version 3's `relies_on` names a payment (Money) that names version 2 as the version it read, the payment held through the Money layer: **late**, as shown, the knot being in another layer's act.
   - Knots against a keeper: version 1 names a keeper whose record puts version 3 before Ana's assent to version 2, while version 3's `previous` names that assent: **not shown**, the keeper contradicts the acts, the record kept as evidence.
6. **Build list, sheet:** R1 (settled: the word **late**); R3 (a place orders every two updates: settled, per keeper the later is late, (b)); R4 (one act's namings or several: draft 26 writes "L, or an act without which L does not pass O's gate", singular, the code's reading; Q12); R5 (which lacking act might show it late: settled by "Knots are knots", any fingerprint named); R25 (the act format's `prev` as a knot: draft 26's "any fingerprint of an act, carried in a field of any act the verifier holds, is a knot" reaches it; 5.13, session 2's). The sheet's line 1 and its Q1, Q2 (settled (A), "Knots are knots"), Q3 (settled: **late**, SN M5), Q4 (settled by 5.5.1(b)) [traced].
7. **Choices left to the code:**
   - Q12 (below): L "or an act without which L does not pass O's gate": one act, or several together?
   - "acts enough for F to pass O's gate and to be shown after the acts that put O in force": is F's own second half of the pin (every other update shown after it) left out of L's test, as the trace reads it ("to avoid reading F's own pin (which asks that L be shown after F) into the test for L")? The text says so; the code must not reuse 5.5.1(b) whole here.

*Check note (session 4).* Line 1's three vectors of 26 November are written by part 2 too, at 5.13.3 (section 4, lines 30, 32, 33). Part 1 writes line 19's second inside line 1's first; part 2 writes it apart (line 31). The 27 November vector across layers is written by part 2 too, at 5.13.1, with an Identity witness act in place of a payment; both are kept (lines 35, 36).

#### 5.5.5 Replacing; the default signers

1. **The rule.**

   > **5.5.5** **Replacing.** A Terms act replaces the Terms its `replaces` names (the **original**) only as 5.5.1 says: by the gate, and the pin. The gate is the update condition's one answer, valid or not valid (5.5.7), and nothing else: who must sign an update is part of it. No power makes a Terms act replace (§5.6).

   >
   > (a) **The default signers.** Where the original names no update condition, the signers its default asks for are the known parties (§3.2), the author among them: parties named as signers or as agreements; never a party named by role, and never a signer who fills a role. A party named as an agreement is a known party, and among the default signers, whether or not it has ever signed: how it signs is §5.1's (5.1.2), and an update it does not sign is not valid by default. A stranger's assent makes no one a party. They are the ones the default asks (5.5.7(e)). Two assents of one signer that name the same `previous` fork that signer's line (5.7.2), and neither counts for any update's gate until that line is resolved (§5.12). A second assent that names the first, directly or through acts that name it, is in order: it is a knot, and the update it assents to is shown after the update the first assents to wherever the first assent is among the acts that put that update through its gate (5.5.4); where it is not, and nothing else orders the two updates, they are rivals, a fork of the versions (§5.12).
   >
   > (b) **Valid.** Where the original names an update condition, the gate's answer is that cMIP's, who must sign included (5.5.7). Where it names none, the default answers: an update is valid when every known party signs it (5.5.7(e)).
   >
   > (c) Under the default, a Terms act that lacks one of those signatures does not pass the gate, and replaces nothing: the Terms it names stay in force, and it is not a tip of a fork. A verifier answers **not shown** for it as a replacement, per keeper or as shown: an assent it does not hold may exist (§3.6). A Terms act that a named update condition answers not valid replaces nothing either, whoever signed it, and is not a tip of a fork (5.5.7(c)); nor does a late update (5.5.4).
   >
   > (d) **Which keepers.** Whether a Terms act has replaced the original is judged per the keepers, and the clock, that the original names (§5.8), whatever keepers the new version names: the Terms act, and each act its gate and its pin count, count once those keepers show them. Where the original names several keepers, an order counts where they agree; where they disagree, it is **not shown**, with that reason, and the disagreement is kept as evidence (§5.8).
   >
   > (e) **One update that cannot be checked.** Where two Terms acts name the same original, and for one of them the verifier cannot tell whether it is an update (it lacks a cMIP or an act, §3.6), which Terms are in force is **unchecked** from there on, even where the other is answered valid: the first might be an update too, and the two a fork. The verifier names the last version it has established.
2. **Replaces** D25 G4.8 and its (a) to (e); (f) and (g) go [traced, D26 trace §5.5]. (a) is new in substance: D25's "**Everyone who signed the original** is: each party in whose name an assent to the original counts (a party named as a signer; a signer who fills a role; a party named as an agreement, where it signed, G1.2); and each party bound by the original with no assent of their own" (and more) becomes the known parties ("Who signs an update by default: the known parties", 26 November: "It’s the protect the unknown party expressed the old way."); D25's "Where no one signed the original (its `in_force` rule asked for no one's assent), the default asks for no one's signature" goes ("There is no unsigned act"). The agreement named and never signed is a default signer on the lead's reading of 09:47 (D26 report, "Found items"). The double assent's last two sentences are new. (d): several keepers, from "The place vouches for the chaining only" (its addition, 17:49): "Two disagreeing has its value though". **Code:** `force.rs:473` to `force.rs:523`, `signed_by`: the fillers' arm (`force.rs:486` to `force.rs:492`, through `role_fillers`, `force.rs:525` to `force.rs:540`), agreements only where an assent in their name counts (`force.rs:493` to `force.rs:496`), the inherited arm (`force.rs:502` to `force.rs:519`); `force.rs:547` to `force.rs:598`, `update_raw`: with no one in "everyone who signed", `missing` is empty and the update is valid by default with no assent (`force.rs:574` to `force.rs:577`); G5.5's delegation path (`force.rs:578` to `force.rs:585`); `chain.rs:548` to `chain.rs:553`, (e) [traced]. Lines (`line.rs:67` onward, `read_lines`) already fork two acts of one signer naming the same `previous` [traced].
3. **What a verifier answers differently.** *Plain words.* Ana's offer names Ana as author and signer, Ben as a signer, the co-op x as a party, and a buyer's role; no condition. Carla buys a seat (a filling). Ana and Ben sign version 2. Dana asks about version 2. *Before:* not shown, "by default, everyone who signed the original signs an update; no assent to it is held in the name of" Carla (and x only if x had signed). *After:* not shown, lacking x's signing (x is a known party whether or not it signed); Carla is not asked. When x signs as its own Terms require, version 2 is **valid**, by default [traced to the rule]. *The double assent:* Ben assents to version 2a, and then to version 2b, his second assent naming his first in `previous`: the two updates are ordered, 2b after 2a, wherever Ben's first assent is among those that put 2a through the gate; if both his assents name the same `previous`, his line forks and neither counts until it is resolved [traced to the rule]. *In the round:* the three voters `d32871af…`, `98c069ee…`, `d1b1b2fc…` each assented twice, to the root and to the third version (round, 1d): two assents of one signer, to different versions, which this rule reads by their `previous` [traced to the round; the after answer not read].
4. **Size:** a rule (who the default asks), and removals (the filler arm, the inherited arm, G5.5's path, the empty-default path).
5. **Vectors.** *Change answer:* none of today's by this rule's default [traced, the sheet of 26 November, line 8: no case puts a filler among "everyone who signed"; no original being updated names an agreement, `update_pin.py`]. 7 "an update by the default, lacking one of those who signed the original: not shown, never not valid" and 15 "a power of kind `replaces` gives no power: the default still asks everyone who signed the original" keep **not shown**, their words "everyone who signed the original" becoming "every known party". *Retired:* 58 "a delegation ended by the delegator alone: a version that removes the power, with the delegator's part alone, is valid by default": G5.5 is gone (build list D1); its bytes would answer **not shown** [traced]. *New:*
   - (26 Nov, line 8, 1) an offer with a filled role and no condition, updated by its maker alone, the maker its only known party: **valid**, by default.
   - (26 Nov, line 8, 3) an offer whose K5 cMIP is lacking, an outsider's assent to the original held: **valid** where today **unchecked** (`force.rs:491`): who fills the role no longer matters to the default.
   - (26 Nov, line 8, 2) at 5.6.1.
   - Terms naming the co-op x as a party, x never having signed, updated by every signer: **not shown**, lacking x's signing (5.5.7(e)).
   - (27 Nov, "the double assent", in order) Ben's two assents, the second naming the first in `previous`, to two updates of one version: **shown** after (the second update is late, 5.5.4, where Ben's first assent put the first update through the gate).
   - (27 Nov, "the double assent", forked) Ben's two assents naming the same `previous`: **fork** of Ben's line; neither counts for either update's gate; both updates **not shown** as replacements until it is resolved.
   - (27 Nov, "Two keepers named, both needed") the original names two keepers; one shows the update and its assents, the other is silent: **not shown**, per keeper, the second keeper not yet showing them; and where the two give contrary orders: **not shown**, the keepers disagree, both records kept.
   - (27 Nov, "The known parties of a version are the signers it names") version 2, signed by Ana and Ben, adds Hana as a signer; she assents to it; version 3 signed by Ana and Ben alone: **not shown**, lacking Hana's assent (she is a known party of version 2).
6. **Build list, sheet:** T7 and R28 (the inherited arm and the leaver: gone with "everyone who signed"; the default asks the original's known parties, so a party that a version took out is not asked); D1 (G5.5 gone); T3 (the 16-step limit in `signed_by`, `force.rs:503`, goes with the inherited arm). The sheet's line 8 and its Q14 (settled: every filling, §3.2 Unknown party: "Any filling of a role is an unknown party's, whenever it was made"), Q15 and Q8 (settled: "There is no unsigned act"), Q16 (open: Q13 below) [traced].
7. **Choices left to the code:**
   - Q7 (below): are the known parties "parties named as signers or as agreements" (this rule) or "the signers it names" (the ledger, 16:44)?
   - Q8 (below): with several keepers, every one, or those that show it?
   - "Two assents of one signer that name the same `previous`": is that the signer's line fork of 5.7.2 only (the same act read twice), or a test the gate makes itself?

*Check note (session 4).* Build list T3, as this part cites it: "the 16-step limit in `signed_by`, `force.rs:503`". At `f1a13feb` the limit, `scope.depth < 16`, stands at `force.rs:504`, inside the block that opens at `force.rs:503`, as the build list's row has it ("line 504") [traced]. The double assent, forked, is written by part 2 too, at 5.7.2 (section 4, line 42).

#### 5.5.6 No act ends an agreement but an update

1. **The rule.**

   > **5.5.6** **No act ends an agreement but an update.** Terms stop being in force only as 5.5.2 says: when an update that replaces them is in force. No act ends Terms, or an agreement, without replacing them, and a verifier MUST NOT answer that Terms or an agreement have ended. Asked whether Terms that have been replaced are in force, a verifier answers **not shown**, names the Terms that replace them (5.5.2), and shows the agreement as going on in its last version. An agreement only gets new versions: a verifier reads every replacing version alike (5.5.5, §5.6), whatever its conditions say becomes of the work and its shares; what they say is theirs (§5.2, task K1). A version that dissolves an agreement is such an update: it replaces only as 5.5.1 says, by the update condition of the version it names, as that condition's cMIP dictates, and it is read from its fields, as every version is. A version that cannot be updated is one whose update condition answers not valid to every update (5.5.7(i)). Every version replaced stays an act of the agreement, readable as it was (§5.2).

2. **Replaces** D25 G4.9, reworded on the lead's reading ("What a dissolution is", 18 November: "The update condition decides, as dictated by the cMIP that governs it. My line was a loose example") [traced, D26 trace §5.5]. **Code:** `order.rs:76` to `order.rs:78`; the module never answers "ended" or "locked" (`mod.rs`, its doc lines) [traced].
3. **What a verifier answers differently.** Nothing. Ana and Ben's version 3 dissolves their work: read as any update, by the gate and the pin.
4. **Size:** none.
5. **Vectors:** 9 and 14 move by 5.4.1 only (14 counted there). None new.
6. **Build list, sheet:** none.
7. **Choices left to the code:** none.

#### 5.5.7 The update condition: valid or not valid

1. **The rule.**

   > **5.5.7** **The update condition: valid or not valid.** Terms MAY name in `condition` (task K4) a cMIP, by fingerprint (5.2.1), with its parameters: their **update condition**, called the condition for short. It is one simple field, and these grammar rules read one thing of it: whether the agreement can be updated or not. Asked of a proposed update, that is **valid** or **not valid**, as that cMIP answers: the gate (5.5.1). Everything else is that cMIP's to specify: who must sign an update (two owners of three, one named party, everyone), which parts of an agreement an update may change (a share, a party, the rights a version offers, the offer itself, a power, the judge, the condition itself), when, and on what. It is never asked about a filling: no update reaches one (§5.10).

   >
   > (a) **What it is given.** The version the proposed update would replace (the original: the version in force, 5.5.3, or, for an update of a version already replaced, the version its `replaces` names, 5.5.4: the condition is asked of it, and whether the update is late is 5.5.4's) and the proposed update: a Terms act whose `replaces` names that version. With them, as for any rule, the acts held, among them the assents to the proposed update that count: an assent in a tip that has stopped (5.7.2, 5.12.2) is not among them, and the verifier says which it left out and why; and the answers of the keepers and the clock the Terms name (§5.8). A condition that needs a clock or a keeper is given one only where the Terms name it: Terms that do not supply what the condition's cMIP declares it needs (a clock, a keeper) are **invalid** (5.8.6).
   >
   > (b) **It runs from the bytes.** Whoever holds those bytes can apply the cMIP, to an update already signed or to one only proposed, and gets the same answer as anyone else (task K4). Its answer waits for no one to publish anything.
   >
   > (c) **Not valid.** Where the cMIP answers not valid, the proposed update does not pass the gate, and replaces nothing, whoever signed it (5.5.5): the Terms it names stay in force, and it is not a tip of a fork. A verifier MUST answer **not valid** for it, and MUST name the condition beside that answer, with the ground the cMIP gives: an act, with who signed it, or a time, per the clock the Terms name (§5.8). A time has no other ground: no reader's anchoring answers for the Terms, and Terms that do not supply what the condition's cMIP declares it needs (a clock, a keeper) are invalid (5.5.7(a), 5.8.6). Where the cMIP counts signatures, its answer rests on the assents held: it is given per keeper or as shown, and it may differ once an assent the verifier did not hold is shown.
   >
   > (d) **Valid.** Where the cMIP answers valid, the verifier answers **valid**, named and qualified in the same way. Valid is the gate's answer only: the update replaces the version it names once its order is also shown (5.5.1); until then it is valid, and not in force. Who must sign is part of the cMIP's answer. Nothing more is asked of the update's signatures, and no power is read for it (§5.6).
   >
   > (e) **Which condition.** The condition asked is the one named by the original, the version the update would replace (5.5.5); while a fork of Terms stands, the one named by the Terms both branches replace (5.5.4). **The default update condition.** Where Terms name no update condition, an update is valid when every known party signs it (5.5.5(a)): the author among them, and never a signer who fills a role. A verifier answers **valid**, with the words "by default", where an assent to the update in the name of each of them is held; where one is lacking it answers **not shown** for the update as a replacement (5.5.5(c)), and never **not valid**: the missing assent may exist. There is no power for replacement (§5.6): Terms that name no update condition are updated only by their known parties, whatever their `powers` say.
   >
   > (f) **Nothing changes by itself.** These grammar rules have no condition that triggers. What a version offers changes only through an update. What a filling gave lasts as long as the words of the version it was earned under say, counted on the clock that version names, as the cMIP that reads those words answers: no update ends it, and none is needed (§5.10).
   >
   > (g) **A resolving update.** A resolving update of Terms is an update of the shared Terms (§5.12), and the condition those Terms name is asked of it as of any update: its answer says who must sign it. With none named, the default asks for the known parties (5.5.5(a)). A resolving update carries no words of its own, so there is nothing else in it to answer about; each tip it names was itself answered valid, or is no tip (5.5.5). One signed under a power to resolve that the shared Terms give resolves as §5.12 says, and the condition is not asked of it.
   >
   > (h) Where the verifier lacks the cMIP, whether the update passes the gate is **unchecked** (§3.6), and so is every answer that rests on it (5.5.5(e)).
   >
   > (i) **Output, and nothing more.** These grammar rules name the update condition's cMIP, take the output of that task, valid or not valid, and use it where it is needed: here, in 5.5.1 and in 5.5.5. They have no notion of a cMIP overruling the default, and no value "locked". A named cMIP is not read as set against the default: the socket is filled, and its output is the answer. An update condition whose cMIP answers not valid to every update is read as any other: the version that names it cannot be updated, and that is all that "cannot be updated" means in this text. So is one that answers valid to an update fewer than all have signed, which then passes the gate (5.5.1). A verifier MUST NOT answer, of itself, that an agreement is locked, or that it can never be updated: it gives the condition's answer about each proposed update.
2. **Replaces** D25 G4.11 and its (a) to (i) [traced, D26 trace §5.5]: (a) the reader's anchoring goes, and Terms not supplying what the condition's cMIP declares it needs are invalid ("A condition in time with no anchor is refused", 26 November: "Yes, condition is missing, it should be refused"; the invalid case is 5.8.6, session 2's); (d) valid no longer means "replaces"; (e) the default is every known party; (f) what a filling gave lasts by its version's words, on its clock ("Ana's month ends by the clock the agreement names", 27 November); (g) the default for a resolving update asks the known parties; (i) "cannot be updated" is the condition's answer, never the verifier's. **Code:** `force.rs:547` to `force.rs:598`, `update_raw`, asking `Ask::Update` with `signed_original` (`sockets.rs:64`); `sockets.rs:67`, `Ask::FillingRights` (G10.6(b), going; 5.10, session 2's); `chain.rs:723` to `chain.rs:760`, `update_answer`; `chain.rs:697` to `chain.rs:721`, `resolves` [traced].
3. **What a verifier answers differently.** *Plain words.* Ana's work names a condition stub "two of three owners". Ana and Ben sign version 2. *Before:* **valid**, the condition named, and it replaces at once. *After:* **valid**, the condition named; it replaces once its order is shown (5.5.1) [traced to the rule]. Where Ana's version 1 is not yet pinned, today's code turns valid into **not shown** (`order.rs:132` to `order.rs:140`); draft 26 says valid "is the gate's answer only" (Q4).
4. **Size:** a rule ((a)'s invalid case, with 5.8.6), a word ((d): valid is not "replaces"), and the default of (e) as at 5.5.5.
5. **Vectors.** *Change answer, if Q4 reads "not shown":* 8 and 11 (valid → not shown: their original `update/root`, `condition/root` is not pinned) [counted, `pin_count2.py`; inferred]. 13 "an update condition that answers not valid: not valid, whoever signed it" keeps **not valid**. *Retired:* 74 (counted at 5.4.3). *New:*
   - A condition stub answering valid for version 2, version 1 in force, version 2 not yet shown after version 1's acts: **valid**, the condition named, and **not shown** as in force.
   - (a)'s invalid case (a cMIP declaring a clock, Terms naming none) is 5.8.6's: left to session 2.
6. **Build list, sheet:** R14 (the condition asked of a resolving update: settled, (g): "the condition those Terms name is asked of it as of any update", the code's reading); D7 (earned rights asked apart: (f), with 5.10, session 2's). The sheet's Q26 (settled by SN Q26: the verifier "refuses Terms whose named cMIP declares a need (a clock, a keeper) the Terms do not supply"); Q16 (open: Q13 below) [traced].
7. **Choices left to the code:**
   - Q4 (below): is valid answered of an update whose original is not (yet) in force?
   - Q13 (below): what is a named condition handed, now that "everyone who signed the original" is gone?

---

### 5.6 Who is bound

#### 5.6.1 Who is bound by an act

1. **The rule.**

   > **5.6.1** A person is bound by an act if, and only if:

   >
   > (a) they signed it in their own name, or
   >
   > (b) the act's `for` names them, or names an agreement by whose Terms they are bound (5.1.2); its `under` names Terms by which they are bound and which are in force (§5.5); their own signature is on the version of those Terms that gives the power, as an assent counted in their name (5.6.5(f)): no update condition can give a power for a person who did not sign the version that gives it; those Terms give a power for acts of this kind; and that power's rule, applied to the acts held, says yes (where those Terms give two or more powers for that kind, the act binds where any one of their rules says yes), or
   >
   > (c) the act is a Terms act that replaces Terms by which they are bound as a known party (§3.2), and it passes the gate and the pin of those Terms (5.5.1) (5.6.2). No update binds anyone through a filling: a filling is bound by the version its proof names, and by no update (5.4.3, §5.10).
2. **Replaces** D25 G5.1, (a) unchanged; (b) the person must have signed the version that gives the power ("Nothing about me without my signature", 18 November: "Absolutely, no need to even debate this. Nothing about me is accepted without my signature."); (c) only as a known party, by the gate and the pin, never through a filling [traced, D26 trace §5.6]. **Code:** `order.rs:221` to `order.rs:279`, `bound`: for a Terms act, (c) through `signed_by` of the Terms replaced (`order.rs:233` to `order.rs:239`), which still counts fillers and the inherited; for a Statement made `for` someone, `name_of` (`force.rs:53` to `force.rs:61`) and `power` (`force.rs:69` to `force.rs:115`), whose check "Those Terms bind the one the act is made for" reads `signed_by(under)` (`force.rs:89` to `force.rs:94`), the inherited arm included [traced].
3. **What a verifier answers differently.** *Plain words.* Ana and Ben's version 1 names no power. Version 2, passed by a condition Ana and Ben could pass without Carla, gives Ben a power to assent for Carla. Ben assents for Carla to an outside deal. Dana asks whether Carla is bound. *Before:* **shown**, G5.1(b), where Carla is bound by version 2 through the update (the inherited arm). *After:* **not shown**: Carla's own signature is not on version 2 [traced to the rule; build list R29]. And Gil, who signs for Ana under her power, is not bound by that act: it is made in Ana's name (5.6.1(a), the ledger's "The giver bears it, not the agent") [traced, `order.rs:271`].
4. **Size:** a rule ((b)'s own signature on the version; (c)'s known party and pin).
5. **Vectors.** *Change answer:* 12, 55, 56 (by 5.4.1). 57 "an act with no `for` is made in its signer's own name only" and 59 "an act made under a power after the Terms that gave it were replaced: not bound" keep **not shown** (59's reason changes: G5.5 is gone, and its power's Terms are not pinned) [inferred]. *New:*
   - (Build list R29) the story above: **not shown** for Carla.
   - (26 Nov, line 8, 2) Carla, who filled a role under version 1, and version 2 passed by a condition that answers valid: Carla **not shown** bound by version 2 (no update binds through a filling).
   - (27 Nov, "The giver bears it, not the agent") Gil assents for Ana under a power she gave and signed: asked `bound` of Ana, **shown**, 5.6.1(b); of Gil, **not shown**, 5.6.1 (made in another's name).
6. **Build list, sheet:** R29 (settled by (b)); T7 (the inherited arm, gone); R26 (the holder's binding as shown, not per place: Envelopes' rules, outside this part). The sheet's line 8 [traced].
7. **Choices left to the code:**
   - Q14 (below): "the version of those Terms that gives the power": the version `under` names, or the first version that wrote the power?

*Check note (session 4).* Line 8's second vector of 26 November is written by part 2 too, at 5.10.6 (section 4, line 47).

#### 5.6.2 A replacing Terms act

1. **The rule.**

   > **5.6.2** **A replacing Terms act.** A replacing Terms act (one with `replaces`) binds a party by that party's own assent to it (5.6.1(a)); or, with no assent of theirs, under 5.6.1(c): the party is bound, as a known party, by the Terms it replaces, and it passes their gate and their pin (5.5.1, 5.5.7). Under the default every known party has signed the update (5.5.7(e)). It binds no one through a filling: whoever holds a filling is bound by the version that filling's proof names, for as long as its words say, and by no update (5.4.3, §5.10). **No power for replacement.** No power makes a Terms act replace, and no power binds a party to one: `powers` has no kind `replaces`. An entry of `powers` of that kind gives no power; a verifier says that it left it unread (5.2.3). Which signatures are enough for an update is the update condition's, with the rest of the answer about an update, in one place (5.5.7). An assent to a replacing Terms act MAY be made for a party under a power of kind `assent`, as any assent may (5.6.1(b)): that is acting for someone, and it is counted as that party's signing.

2. **Replaces** D25 G5.2, changed: no binding through a filling; the draft 18 sentences go to the companion [traced, D26 trace §5.6]. **Code:** `terms.rs:561` to `terms.rs:564` (the note for a power of kind `replaces`); `force.rs:670` to `force.rs:677`, `kind_matches` [traced].
3. **What a verifier answers differently.** Nothing beyond 5.6.1(c). Ana's Terms carry a power of kind `replaces`: left unread, before and after.
4. **Size:** none.
5. **Vectors:** 15 and 16 keep theirs. None new.
6. **Build list, sheet:** none.
7. **Choices left to the code:** none.

#### 5.6.3 One's own name only

1. **The rule.**

   > **5.6.3** An act with no `for` and no `under` is made in its signer's own name only. It MUST NOT later be counted as made for anyone else.

2. **Replaces** D25 G5.3, unchanged [traced]. **Code:** `order.rs:252` to `order.rs:258` [traced].
3. **What a verifier answers differently.** Nothing.
4. **Size:** none.
5. **Vectors:** 57 keeps **not shown**. None new.
6. **Build list, sheet:** none.
7. **Choices left to the code:** none.

#### 5.6.4 An act under a power whose Terms were replaced

1. **The rule.**

   > **5.6.4** **An act under a power whose Terms were replaced.** Where whoever is bound through `for` is bound only through Terms that have been replaced, they are bound by the act if it was made before the Terms that replace those were in force, and not bound if it was made after. A verifier MUST answer from §5.8: per the keepers the Terms that gave the power name, by the act's position against the position at which the replacing Terms passed the gate and the pin: the first position at which, counting only the acts those keepers show at or before it, the replacing Terms pass that gate and that pin (5.5.1), qualified **per keeper**; where those keepers disagree, **not shown**, with that reason (§5.8). Where those Terms name no keeper, by knots (§5.13), **as shown**: the person is bound where the act is shown before the replacing Terms passed the gate and the pin, that is, where acts enough for them to pass it are shown after the act; not bound where the act is shown after such acts. Where nothing shows their order, the act is not shown as binding through those Terms; whether the act and the replacing Terms are then a fork (§5.12) is not said by this rule. Whether Terms have been replaced is answered by §5.5; Terms are not ended otherwise (5.5.6).

2. **Replaces** D25 G5.4, changed [traced, D26 trace §5.6]: "valid (G4.11) and in force (G4.1)" becomes "pass the gate and the pin (5.5.1)"; per the keepers the power's Terms name, not shown where they disagree; by knots, as shown; where nothing shows the order, "not shown as binding", and whether it is a fork is not said (D26 report, item 8). **Code:** `force.rs:156` to `force.rs:177`, `in_force_for_power`; `force.rs:182` to `force.rs:212`, `before_in_force`: per place by positions (`force.rs:187` to `force.rs:201`), by citing (`force.rs:202` to `force.rs:210`), and `Tri::NotShown` where citing gives no order (`force.rs:211`) [traced].
3. **What a verifier answers differently.** *Plain words.* Ana's version 1 gives Gil a power to assent for her; version 2 removes it, signed by Ana and Ben, and is pinned. Gil's assent for Ana names nothing of version 2's. Dana asks whether Ana is bound. *Before* and *after:* **not shown** as binding through version 1 where nothing orders them. What changes is what "replaced" means: version 2 must be pinned, not only valid and in force by its own rule; and with two keepers named by version 1, they must agree [traced to the rule].
4. **Size:** a rule (the pin in the replacement's position; several keepers).
5. **Vectors:** 59 (as at 5.6.1). *New:*
   - Version 1 names one keeper, which shows Gil's act before the position at which version 2 passes the gate and the pin: **shown**, Ana bound, per keeper.
   - The same with two keepers that disagree on the order: **not shown**, the keepers disagree.
6. **Build list, sheet:** R27 (which of Part 3's checks the test reaches, `before_in_force`: read only) [traced].
7. **Choices left to the code:**
   - Q15 (below): where nothing shows the order, is the act and the replacing Terms a fork?

#### 5.6.5 Constitution, executive and judicial

1. **The rule.**

   > **5.6.5** **Constitution, executive and judicial.** Three things are kept apart, and this rule is the one place that says so.

   >
   > (a) **The constitution is the update condition: how the Terms may change.** A version is replaced only by an update that passes its gate and its pin (5.5.1): the gate is its update condition's answer, valid, who must sign it included; with none named, an update every known party has signed (5.5.5(a), 5.5.7(e)).
   >
   > (b) **The executive is the powers: who may act under the Terms, and in which kinds of act.** An act made for a person or for an agreement, a Statement of a kind (5.1.2, 5.6.1(b)). A power acts under the Terms as they are. No act made under a power is a version, and none changes what a version says.
   >
   > (c) **The judicial is set in the Terms.** It is three things. The contest: these grammar rules give it, and whom one reaches is read from the version it is made against (§5.11). A judge, where Terms name one: in a socket of theirs, by the cMIP that socket names or by its parameters, fixed by fingerprint (§5.2, §6). And a power to resolve a fork: an entry of `powers` of kind `resolves` (§5.12). Each is read from the version in force (5.5.3); while a fork of Terms stands, from the last shared version (5.5.4(e)).
   >
   > (d) **It changes only by an update.** Who the judge is, whether Terms give a power to resolve and what its rule accepts, and whom a contest reaches, change only when a new version says otherwise, made by an update that passes the gate and the pin ((a)). No power can change it. A verifier MUST NOT read an act made under a power as naming or replacing a judge; as giving, widening, narrowing or removing a power to resolve; or as changing whom a contest reaches. A cMIP that leans on a judge takes who the judge is from the Terms that name that cMIP, and from no act made under a power.
   >
   > (e) **Using it is not changing it.** A judge's decision binds only through a power (5.6.1(b), §6). A resolving update signed under a power to resolve is that power used (§5.12). A contest made for someone under a power of kind `contest` is that person's contest. Each of these acts under what the Terms set, and changes none of it.
   >
   > (f) **An agent within its limits.** An assent made for a party under a power of kind `assent` (5.6.1(b)) to an update, one that changes the judicial included, is that party's signing where the power's rule says yes; the update still has to pass the gate and the pin ((a); 5.5.1). Which updates a power to assent reaches is that power's rule's to say (K3), and a verifier reads its output and nothing more. That is not a power changing the judicial: the judicial changes by the update, and only by it ((d)).
2. **Replaces** D25 G5.6 and its (a) to (f): (a) the default is every known party and the pin is added; (f) stays on the lead's reading (SN M22: "a power given binds its giver") [traced, D26 trace §5.6]. **Code:** none reads "constitution", "executive" or "judicial" by name; (a) is `update_raw` (`force.rs:547`); (b) is `power` (`force.rs:69`); (c) is read where a cMIP leans on a judge (`sockets.rs`); (f) is `name_of` (`force.rs:53` to `force.rs:61`), which counts an assent made under a power of kind `assent` as the party's [traced].
3. **What a verifier answers differently.** Nothing beyond 5.5.1 and 5.5.5: Ana's agent Gil assents for her to an update that names a new judge; it counts as Ana's signing, and the update still needs the gate and the pin [traced].
4. **Size:** none of its own.
5. **Vectors:** none change; none new.
6. **Build list, sheet:** none.
7. **Choices left to the code:** none.

#### 5.6.6 Nothing an agent made is set aside

1. **The rule.**

   > **5.6.6** **Nothing an agent made is set aside.** An act made for a person or an agreement under a power (5.6.1(b)), or as an agreement's signature (5.1.2), is an act like any other once made. Call the **grantor** the one in whose name it was made (the one who gave the power, or the agreement whose power it was). No act of the grantor, and no act of anyone else, sets aside, voids or undoes an act made under its grant. The grantor acts on what was made under its grant only by an update, under the update rules these grammar rules already have, and as anyone may act on any act:

   >
   > (a) **On the grant.** By a version of the Terms that give the power, which ends or narrows it, made as any update of those Terms is: their update condition decides, as its cMIP dictates (5.5.7), or, where they name none, the default (5.5.5(a)); or as the power's own rule says, which answers when the power ends (task K3). A version that ends or narrows it reaches only acts made after that version is in force; an act made before it binds as 5.6.4 says.
   >
   > (b) **On what was made.** By an update of the agreement the act was made in, which passes that agreement's gate and pin (5.5.1): its update condition's answer, or, where it names none, the default: every known party (5.5.5(a)). The grantor is among the known parties where it is one; an assent counted in its name, its agent's included, is its signing (5.6.5(f)).
   >
   > (c) **Before the Terms are in force.** By a counter signature in the grantor's name (5.4.5), as for any assent, while it is available (5.4.5: until the assents that put the Terms in force are shown before it). It cancels the assent counted in that name, and sets nothing aside: the agent's assent stays an act, shown as cancelled. A counter signature that comes later, or one made once the Terms are in force, changes nothing (5.4.5), and only (a) and (b) remain.

   >
   > **Who is covered.** Whoever agreed to what the agent signed keeps what that version gave them, the same way as under any update: a version is replaced only by an update that passes its gate and its pin (5.5.1); a known party who signed it is bound by an update they did not sign only where 5.6.1(c) says so; and a filling is governed by the version its proof names, which no update reaches (5.4.3, §5.10). A verifier MUST NOT read any act as setting aside, voiding or undoing an act made under a power, because it was made by an agent, or because the grantor later acted against it. It reads the grantor's later acts as what they are: a version of the grant, an update of the agreement, or, while one is available, a counter signature. A fork is another thing: an act made under a power that is a tip of a fork stops as any tip does, and may be set aside by a resolving update (§5.12); that is the reading of a fork, not the grantor acting on its grant.
2. **Replaces** D25 G5.7 and its (a) to (c) [traced, D26 trace §5.6]: (a) when a power ends is the power's own rule's (K3) or a version's, its update condition deciding, and G5.5's "By default the delegator can end it at any time" goes ("Delegation is a leftover", 18 November); (b) the default is every known party; (c) the counter signature is available until the completing assents are shown before it. **Code:** `force.rs:578` to `force.rs:585` and `force.rs:616` to `force.rs:652`, `delegation_end`, with `sockets.rs:126` to `sockets.rs:136` (`Delegation`, `Ending`), which let a delegator's version end a power alone [traced].
3. **What a verifier answers differently.** *Plain words.* Ana gave Gil a power by Terms naming no condition. Ana alone signs version 2, which removes it. Dana asks about version 2. *Before:* **valid**, by default, G4.11 (G5.5: the delegator ends it alone). *After:* **not shown** as a replacement: by default every known party signs, Gil among them (5.5.5(a)) [traced to the rule; the build list's D1].
4. **Size:** a removal (G5.5's path and its socket types).
5. **Vectors.** *Retired:* 58 (counted at 5.5.5). *New:*
   - The story above: **not shown**, 5.5.5(c), lacking Gil's assent; with Gil's assent held and the order shown: **valid**, and in force.
6. **Build list, sheet:** D1 [traced].
7. **Choices left to the code:** none.

*Check note (session 4).* The delegation removal is counted by part 2 too, as "K1's delegation part" (section 6): one removal.

### 3.1 Part 2's run, and rules 5.7 to 5.13 and section 6

### Today's answers

Run on `claude/impact-draft-26-part-2`, made from `claude/agreements-verifier-2` at `f1a13feb` [counted]:

- `cargo test -p mor-core --locked`: 570 tests pass, 0 fail.
- `python3 core/vectors/agreements_new_grammar_check.py`: "grammar.json: 115 of 120 cases judged again, and agree"; the five it does not judge are cases 71, 74, 91, 58 and 59 (by their rules G10.2, G10.6, G11.4, G4.11, G5.1(b)), three of them this part's (71, 74, 91).

### 5.7 A signer's own line

#### 5.7.1 Every act names its signer's previous act

1. **The rule.**

> **5.7.1** Every act within an agreement MUST name in `previous` its signer's previous act within the same agreement, or none if it is the signer's first. An act whose `previous` names, among the acts held, anything that is not an act of the same signer within the same agreement (an act of another signer, or of another agreement; a report; a payment; any record that is no Terms act and no Statement) is **invalid** (§3.6). Where `previous` names nothing the verifier holds, the act counts, and the verifier shows that signer's line as **unchecked** before it. So it is where `previous` names an act the verifier holds and cannot open (a private act, held without its key): what that act is cannot be read, so the act counts, the signer's line is **unchecked** before it (§3.6), and the act is not invalid. An act held that is not an Agreements act (§3.6) is a record that is no Terms act and no Statement: an act whose `previous` names it is **invalid**. Whether two acts of a line are a fork, and whether a line is unchecked before an act, are answered from the acts held, **as shown**, whatever a keeper shows. Whether anything is later in a line is an answer about what is latest, and is given as §5.8 says.

2. **What it replaces, and the code it meets.** Draft 25's G6.1, with two words changed [traced: the trace's row for 5.7.1, "G6.1, stays, **on the lead's reading**"]: "rejected" becomes "not an Agreements act", and "a place" becomes "a keeper". The code: `core/src/agreements_new/check.rs:228` (the check among acts held), with the note at `core/src/agreements_new/check.rs:248` and the invalid case at `core/src/agreements_new/check.rs:264`; the line's answer at `core/src/agreements_new/grammar/order.rs:294`, "unchecked before" at `core/src/agreements_new/grammar/order.rs:315` [traced].

3. **What a verifier would answer differently.** Ben's assent to Ana's Terms names, in `previous`, an act Dana does not hold. Today and under draft 26 alike, the assent counts and Ben's line is shown unchecked before it; an assent whose `previous` names Carla's act is invalid. *Before:* `line`: **shown**, G6.1, "unchecked before its first act held"; *after:* the same, naming 5.7.1 [inferred: the rule's sentences are draft 25's]. The one word that moves, "rejected", is the checker's verdict, which draft 26 calls "not an Agreements act" (§3.6); the code's verdict `Rejected` keeps its meaning.

4. **Size.** A word: "rejected" to "not an Agreements act" in the plain words; no branch of code changes.

5. **Vectors.** Renamed only: case 45 (an act whose `previous` names nothing held counts, and its signer's line is shown unchecked before it); case 46 (the act after an act not held still counts toward in force); case 47 (`previous` naming another signer's act: invalid, and it counts for nothing). In `valid.json` and `invalid.json`, the cases naming G6.1 keep their verdicts and rename their rule (counted at the end). Retired: none. New: none.

6. **The build list and the sheet.** R7 (an act held that cannot be read): 5.7.1 keeps draft 25's sentence for a `previous` that names such an act ("the act counts, the signer's line is **unchecked** before it"), and says nothing more of other answers; R7 stays as it was [traced]. R24 (a stolen key's act, `line.rs` `read_lines` not reading void acts): draft 26 is silent on void acts in a line, which are Identity's (§3.3, **Line**); R24 stays [traced].

7. **Choices the text leaves.** None found.

#### 5.7.2 Two acts of one signer naming the same previous act are a fork

1. **The rule.**

> **5.7.2** Two acts by one signer within one agreement that name the same `previous` (or that both name none) are a fork. A verifier holding both MUST answer **fork** for that signer, whatever a keeper shows: an act the keepers do not show is still a tip. It MUST NOT choose between the tips. Both tips stop (§5.12), and the fork is resolved only as §5.12 says. Where the two acts are assents, neither counts for any update's gate until that signer's line is resolved, by a resolving update in it (5.5.5(a), 5.5.7(a), §5.12).

2. **What it replaces, and the code it meets.** G6.2, "place" read as keepers, its reason sentence moved to the companion, and one sentence added: "Where the two acts are assents, neither counts for any update's gate until that signer's line is resolved" [traced: the trace's row for 5.7.2; the M11 report, "Two reasons carried from draft 25 moved to the companion's section 5 (from 5.6.2 and 5.7.2)"]. The code: forks are grouped by signer, agreement and `previous` at `core/src/agreements_new/grammar/line.rs:76`, whatever any place shows; the answer at `core/src/agreements_new/grammar/order.rs:298`; a tip's assent is set aside from every count at `core/src/agreements_new/grammar/force.rs:243`, inside `counted`, which the gate uses at `core/src/agreements_new/grammar/force.rs:553` [traced].

3. **What a verifier would answer differently.** Ana signs two assents, each naming her Terms act in `previous`: one to Ben's proposed version 2, one to Carla's rival version 2. *Before and after:* `line` for Ana: **fork**, both tips shown; neither assent counts toward either version's gate, so under the default each version is **not shown** as a replacement, never **not valid** [inferred: `counted` already skips a stopped assent at `force.rs:243`; draft 26 writes it as a sentence of the rule]. The sentence the code would change is its plain words: "whatever a place shows" becomes "whatever a keeper shows".

4. **Size.** A word ("place" to "keeper"); the added sentence matches what the code does.

5. **Vectors.** Renamed only: case 38 (a fork in a signer's line: two acts that name the same previous act). New:
   - **The double assent, forked** (27 November): Ana's Terms in force; Ben and Carla each propose a version 2 naming them; Ana signs two assents, one to each, both naming her Terms act in `previous`. `line` for Ana: **fork**, 5.7.2, both tips shown; `update` of each version 2: **not shown** as a replacement, by default, Ana's assent not counting; never **not valid**.
   - **A keeper shows one tip**: the same, the Terms naming keeper K, which shows only Ana's first assent. `line` for Ana: **fork**, as shown, whatever the keeper shows.

6. **The build list and the sheet.** T1 ("A fork after Terms are in force takes them out of force", `line.rs` `stopped`, `force.rs` `counted` line 243): 5.7.2's new sentence narrows the assents that a fork stops to "any update's gate"; 5.12.3 keeps "Terms that were in force before a fork was made stay in force". T1 is kept, and sharpened: the code stops a forked assent for coming into force too [inferred; see 5.12.3]. R8 (two versions by one author, one resolving act): see 5.12.4. The 27 November entry on the double assent: the forked case is this rule's; the double assent in order (5.5.5(a)) is session 1's.

7. **Choices the text leaves.**
- Does "neither counts for any update's gate" leave a forked assent counting for a first version's coming into force (5.4.1), where 5.12.3 says that nothing built on a tip counts?

*Check note (session 4).* The double assent, forked, is written by part 1 too, at 5.5.5(a) (section 4, line 42).

### 5.8 The keeper, and the clock

#### 5.8.1 The keeper

1. **The rule.**

> **5.8.1** **The keeper.** Terms MAY name, in `keeper`, one keeper or several, each by the identifier the layer that orders acts gives it. A keeper so named is the agreement's official relay: the way the drafters of the agreement agree on where it is kept. A keeper relays the agreement's acts as any relay does (§3.5), and vouches for the chaining only: which of them came after which, at the positions it gives them in its keeper's records (§3.4). It never vouches for an act's validity, which every verifier checks for itself. These grammar rules take a keeper's answers about order and define nothing more of it.

2. **What it replaces, and the code it meets.** G7.1, with N2: `place` becomes `keeper`, one or several [traced: the trace's row for 5.8.1; the ledger, ""place" is renamed **keeper**: the agreement's official relay, named in its Terms, vouching for the chaining only"]. The code: one place per Terms, `core/src/agreements_new/terms.rs:261`; the layer's interface, `core/src/agreements_new/grammar/layers.rs:42`; the qualifier, `core/src/agreements_new/grammar/answer.rs:91`, which holds one identifier [traced].

3. **What a verifier would answer differently.** Ana and Ben name two keepers in their Terms. Today the Terms carry one `place`, and a second identifier has nowhere to go: the bytes are encoding 3's (session 3). With one keeper named, nothing Dana is told changes but the word: **per keeper** for **per place** [inferred].

4. **Size.** A field: `place` (one identifier) becomes `keeper` (one or several), in the Terms, in the scope (`Scope.place`) and in the qualifier (`Qualifier::PerPlace`). Its bytes are session 3's.

5. **Vectors.** None renamed under this rule's number (no case tests G7.1). New: none here; the several keepers are 5.8.3's.

6. **The build list and the sheet.** None.

7. **Choices the text leaves.** None for the verifier; the keeper's identifier (what it is the hash of) is listed as open in encoding 3 (the M11 report, "What waits on the codemeister", item 7) [traced].

*Check note (session 4).* The keeper field is counted by part 3 too, as key 8's form (E19): one field.

#### 5.8.2 Copies at any relay

1. **The rule.**

> **5.8.2** **Copies.** Copies of an agreement's acts MAY be lodged at any relay. Only the order given by the keepers the Terms name counts for the agreement: a relay the Terms do not name gives no order for it, whatever it relays.

2. **What it replaces, and the code it meets.** New (N2) [traced: the trace's row for 5.8.2]. The code: a reader's anchoring stands in the place's stead where the Terms name neither a place nor a clock, `core/src/agreements_new/grammar/mod.rs:252` to `core/src/agreements_new/grammar/mod.rs:256` [traced]. No code tells a named keeper from any other relay beyond this.

3. **What a verifier would answer differently.** Ben keeps copies of the agreement's acts at a relay the Terms do not name, and Dana is told to read its order. *Before:* where the Terms name neither a place nor a clock, the relay's order becomes the answer, **per anchoring** (case 64). *After:* the relay gives no order for the agreement; the Terms' answer is **as shown**, from knots, and the relay's order may be shown beside it only as Dana's own reading, named so [inferred: 5.8.2 with 5.8.5 and 5.13.5].

4. **Size.** A removal, counted under 5.13.5: the branch at `mod.rs:252` stops giving the Terms' answer.

5. **Vectors.** Case 64 is counted under 5.13.5. New:
   - **A relay the Terms do not name**: Ana's and Ben's Terms name keeper K, which shows the root and both assents; the reader accepts relay R, whose order puts Ben's assent first. `in_force`: **shown**, per keeper, K named; R's order shown only as the reader's.

6. **The build list and the sheet.** The sheet of 26 November, line 11 ("A place named only by a rule the parties never signed"), found that the code already labels such a place per anchoring; under draft 26 the label stays and the answer it labels stops being the Terms' own [traced: the sheet, section 11].

7. **Choices the text leaves.** None beyond 5.13.5's.

#### 5.8.3 Several keepers

1. **The rule.**

> **5.8.3** **Several keepers.** Where the Terms name several keepers, an answer about order counts where they agree. Where they disagree, there is none: a verifier answers **not shown**, with that reason, names the keepers, and shows the records of each as evidence of the disagreement. Where the verifier holds two answers of one keeper that contradict each other, it has no answer from that keeper: **unchecked** (§3.6).

2. **What it replaces, and the code it meets.** New for several keepers (N2); its last sentence is G7.2's last, kept for one keeper [traced: the trace's row for 5.8.3]. The code: one place's answer at a time, `core/src/agreements_new/grammar/mod.rs:210`; one place contradicting itself is unchecked at `core/src/agreements_new/grammar/mod.rs:226`, from `core/src/agreements_new/grammar/layers.rs:24` [traced]. No code compares two places.

3. **What a verifier would answer differently.** Ana's and Ben's Terms name two keepers, K and M. Both show Ben's assent after Ana's: **per keeper**, K and M named. K shows Ben's assent at position 3 and M shows it before Ana's: *after:* **not shown**, "the keepers the Terms name disagree", both named, each one's records shown as evidence. Today neither answer can be given: the Terms hold one place [inferred]. K shows the assent and M shows nothing: Nobody, allegedly, answered on 27 November, "If the terms stipulate two keepers, both keepers are needed. Sorry can’t do"; the line arrived at: "every keeper named must show an act for its order to count". Draft 26 was finished before that exchange (its last commit, `d4373f0`, 14:58; the exchange 16:40) and says only "where they agree" [traced: `git log` of the draft's branch; the ledger's times].

4. **Size.** A rule: an answer about order over a list of keepers, agreeing, disagreeing, or one silent; the "not shown, the keepers disagree" reason is new.

5. **Vectors.** Renamed only: case 63 (two answers of one place that contradict each other: no answer from that place, unchecked) (draft 25's G7.2 sentence, now 5.8.3's last; build-list row D8 had it go, and draft 26 keeps it). New:
   - **Two keepers that agree**: Terms naming K and M, each showing the root and both assents in that order. `in_force`: **shown**, per keeper, K and M named.
   - **Two keepers that disagree**: the same, M placing Ben's assent before the root. `in_force`: **not shown**, the keepers disagree, both named, each one's records shown as evidence.
   - **Two keepers, one silent** (27 November): the same, M showing nothing. `in_force`: **not shown**, on the ledger's reading (question 1, (A)); **shown**, per keeper K, on draft 26 as written (B).

6. **The build list and the sheet.** D8 ("The rest of G7: a place that contradicts itself, and the clock"): its "should" was "G7.2's sentence gone" and "no clock read", with case 63 to go. Draft 26 keeps both: the sentence is 5.8.3's last, and the clock is 5.8.5's. Case 63 stays; D8 is reversed [traced]. The draft's report lists the silent keeper as open (item 5) [traced: "**5.** With several keepers, whether the pin needs every keeper or those that show it where none disagrees (5.8.3)."].

7. **Choices the text leaves.**
- With several keepers and one silent, does the order wait for every keeper named (the ledger's line of 27 November, 16:40), or count where those that show it agree (draft 26 as written)?
- Two keepers that agree on the order of A and B and disagree on C: is every answer **not shown**, or only those that rest on C?

*Check note (session 4).* "Two keepers, one silent" is written by part 1 too, at 5.4.1 (section 4, line 17). This part says "Draft 26 was finished before that exchange (its last commit, `d4373f0`, 14:58...)"; the draft's branch now holds a later commit, `1f81c2a`, "wave four carried", which this sheet did not read (section 11).

#### 5.8.4 Order per keeper

1. **The rule.**

> **5.8.4** **Order per keeper.** Where the Terms in force name a keeper, or several, an act within the agreement counts for any answer about order (which Terms are in force, 5.5.3; the pin, 5.4.1, 5.5.1; whether an update is late, 5.5.4; whether an act under a power came before a replacement, 5.6.4) only once those keepers show it, and at the position they give it; where they are several, only where they agree (5.8.3). A verifier MUST take those answers from the keepers, qualified **per keeper**, with the keepers named. Where a new version names other keepers, or none, whether it has replaced the version in force is judged per the keepers the version it would replace names (5.5.5(d)). Before any Terms of the agreement are in force, the keepers are those its first Terms act names (5.4.1). Knots do not pin, or order the agreement's acts, in the keepers' place; they expose a keeper: a keeper's record that contradicts a knot the verifier holds (B placed before A, while A names B) gives **not shown**, with the reason that the keeper contradicts the acts, and the record is kept as evidence (5.5.4(c)).

2. **What it replaces, and the code it meets.** G7.2, narrowed to order (its list "what is whole, who holds what, whether a period has passed, or whether something was made public" goes), with the keepers named, and one sentence new: a keeper's record that contradicts a knot gives **not shown** [traced: the trace's row for 5.8.4]. The code: `core/src/agreements_new/grammar/mod.rs:210` counts an act only once the place shows it; `core/src/agreements_new/grammar/mod.rs:243` takes the place the Terms name, at `core/src/agreements_new/grammar/mod.rs:245` [traced]. Nothing in the code holds a place's record against a knot.

3. **What a verifier would answer differently.** Ana's Terms name keeper K. Ben's assent names Ana's assent in `relies_on`, and K places Ben's assent before Ana's. *Before:* the place's order is taken as it is: Ben's assent counts at the position K gives it [inferred: `counts` reads positions only]. *After:* **not shown**, "the keeper contradicts the acts", K's record kept as evidence [traced: 5.8.4].

4. **Size.** A rule: the knots held are checked against each record the keepers give.

5. **Vectors.** Renamed only: case 60 (in force per the place the Terms name); case 61 (an assent the place does not show does not count: not in force, per place); case 62 (a place named, and no answer from it: unchecked) (per place becomes per keeper, with the keeper named; case 62, a keeper named and no answer from it, stays **unchecked**). New:
   - **A keeper that contradicts a knot**: Terms naming K; Ben's assent names Ana's assent in `relies_on`; K places Ben's assent before Ana's. `in_force`: **not shown**, the keeper contradicts the acts, K's record kept as evidence.

6. **The build list and the sheet.** R15 ("ask the place for more"): draft 26 makes a keeper vouch for "the chaining only", and keeps "These grammar rules take a keeper's answers about order and define nothing more of it" (5.8.1); R15 stays a reading [traced]. Item 6 of the draft's report ("What a keeper answers beyond order") is left out of the rule; the code's place answers positions only, so nothing in it reads more [traced: `layers.rs:42`].

7. **Choices the text leaves.**
- Where a keeper's record contradicts a knot, is only the answer that rests on that record **not shown**, or every answer per that keeper?

#### 5.8.5 Whose keepers and clock count

1. **The rule.**

> **5.8.5** **Whose keepers and clock count.** The keepers and the clock the Terms in force name are the ones every reader uses for that agreement, whether a party to it or not, except for a filling (below): a verifier MUST NOT give an answer of 5.8.4 for that agreement per another anchoring as the Terms' answer. A keeper or an anchoring of the reader's own choosing, or one named only by a rule the parties never signed, gives an answer only as that reader's, named so, and never the Terms' own (§3.4, 5.5.3). Terms MAY also name a `clock`. Where the Terms in force name one, what time it was, for that agreement, is answered per that clock by every reader, qualified **per clock**: for every answer that turns on a time, the ground of an update condition (5.5.7(c)) among them. For a filling, the keepers and the clock are those its own version names (the version its proof names), never those of the Terms in force: how long what a filling gave lasts is counted on that version's clock (5.4.3, 5.10.2, 5.10.8). What a clock is, and how it is identified, is for the layer that gives it.

2. **What it replaces, and the code it meets.** G7.4, with three additions: a reader's own keeper or anchoring gives only the reader's answer; the clock answers every answer that turns on a time; a filling's keepers and clock are its own version's [traced: the trace's row for 5.8.5]. The code: the anchoring branch at `core/src/agreements_new/grammar/mod.rs:252`; a filling's qualifier is the Terms in force's, `core/src/agreements_new/grammar/spots.rs:22` [traced].

3. **What a verifier would answer differently.** Carla fills a spot under version 1, which names keeper K. Version 2, in force, names keeper M. *Before:* her filling is answered per M, the Terms in force's place [traced: `spots.rs:22` takes the qualifier of the chain's last version]. *After:* per K, the keeper of the version her proof names [traced: 5.8.5, "For a filling, the keepers and the clock are those its own version names"].

4. **Size.** A rule: the scope and qualifier of a filling come from the version it was earned under.

5. **Vectors.** None renamed under this rule's number. New:
   - **A filling per its own version's keeper**: version 1 names keeper K and a role, which Carla fills, K showing her proof; version 2, in force, names keeper M, which does not show it. `fillings`: **shown**, Carla, per keeper K.

6. **The build list and the sheet.** The sheet of 26 November, line 11, is this rule's "named only by a rule the parties never signed" [traced]. Q26 is settled at 5.8.6.

7. **Choices the text leaves.**
- A filling earned under version 1, which names no keeper, while version 2 names one: is the filling answered **as shown**, by its own version, even where version 2's keeper shows its proof?

#### 5.8.6 No stated anchor, no condition in time

1. **The rule.**

> **5.8.6** **No stated anchor, no condition in time.** A condition in time with no anchor the Terms state is refused, not answered. Where the bytes show it, a verifier refuses it: Terms that do not supply what a cMIP they name, in any socket, declares it needs (a clock, a keeper) are **invalid** (§4.4, case 8). A keeper is not a clock: Terms that name a keeper and no clock do not supply a clock. Where only the words show it (the words speak of a time, and no cMIP the Terms name declares a need for a clock or a keeper), these grammar rules do not read the words (§5.2) and have no rule for it: a verifier gives no answer of these grammar rules about that time. In either case, an anchoring of the reader's own choosing gives an answer only as that reader's, named so, and never the Terms' answer (5.8.5).

2. **What it replaces, and the code it meets.** New (N9) [traced: the trace's row for 5.8.6; the ledger, "A verifier refuses where the bytes show it: Terms naming a cMIP that needs a clock or a keeper, and naming neither, are invalid."; the MOR lead's edit (e), "naming neither" going for "A keeper is not a clock"]. The code: none. The one interface every cMIP is plugged in through, `core/src/agreements_new/grammar/sockets.rs:167`, has a name and an answer, and no way to declare a need [traced].

3. **What a verifier would answer differently.** Ana sells Ben a month of access. The Terms' update condition is a cMIP that counts days, and the Terms name no clock. *Before:* the condition is asked, and its answer passed on (or **unchecked** where the verifier lacks it). *After:* the Terms are **invalid**, under 5.8.6, the fault being §4.4's case 8 [traced: §4.4, case 8]. The same where the Terms name a keeper and no clock: "A keeper is not a clock".

4. **Size.** A rule, and a field of the interface: each cMIP declares what it needs; the verifier compares that with the Terms' `keeper` and `clock`.

5. **Vectors.** New:
   - **A condition that needs a clock, and no clock**: Terms whose `condition` is a stub declaring that it needs a clock, and no `clock`. Any question resting on them: **invalid**, 5.8.6 (§4.4, case 8).
   - **A keeper is not a clock**: the same, the Terms naming a keeper and no clock: **invalid**, 5.8.6.
   - **The clock supplied**: the same, the Terms naming a clock. `update`: the condition's answer, **valid** or **not valid**, its ground per clock.

6. **The build list and the sheet.** The sheet's Q26 ("A condition in time with no stated anchor": the verifier passes the cMIP's answer on, or answers over it) is settled toward its (A) and beyond it: the verifier passes the answer on, and refuses Terms that do not supply what the cMIP declares [traced: the MOR lead's settled note, Q26, "it refuses Terms whose named cMIP declares a need (a clock, a keeper) the Terms do not supply"]. Encoding 3's M8 finds that "case 8 (5.8.6) cannot be checked from bytes" [traced: the report's found items].

7. **Choices the text leaves.**
- Where, and in what form, does a cMIP declare that it needs a clock or a keeper (§7, "How a cMIP declares what it needs")? Until it is said, no verifier can give case 8, and every such vector is written against a stub's declaration.
- A cMIP the verifier lacks: its declaration cannot be read. Are the Terms then **unchecked** (the verifier lacks something), never **invalid**?

---

### 5.9 The settlement

#### 5.9.1 Settlement

1. **The rule.**

> **5.9.1** **Settlement.** A Statement MAY name a `settlement` it is tied to: the evidence, from the layer that holds value, that a payment was made. This field is where that layer's proof plugs into Agreements; what a settlement is, is that layer's to say. It names an act and no cMIP, and is not a task. A settlement named is reported on the word of whoever gave it (the MICS, §2). What is done with it (counting only what led to a settlement, dividing what one shows) is a rule's, in whichever socket it sits (§6).

2. **What it replaces, and the code it meets.** G8.5, unchanged but for its references [traced: the trace's row for 5.9.1]. The code: the field, `core/src/agreements_new/statement.rs:90`; read in the contest and the buyer's leg, `core/src/agreements_new/grammar/legs.rs:371` and `core/src/agreements_new/grammar/legs.rs:280` [traced]. G8.1 to G8.4 (say who said it) go to the MICS [traced: the trace's row for 5.9.1].

3. **What a verifier would answer differently.** Nothing. Ben's contest names the settlement of his payment; Dana is shown it on the word of whoever gave it, as today.

4. **Size.** None.

5. **Vectors.** Renamed only: in `valid.json`, "statement: answers, relies_on and settlement" (counted under 5.13.1). New: none.

6. **The build list and the sheet.** None.

7. **Choices the text leaves.** None.

---

### 5.10 Spots, and the unknown party

#### 5.10.1 What a role names

1. **The rule.**

> **5.10.1** A role in `parties` MUST name:

2. **What it replaces, and the code it meets.** G10.1, unchanged but for its references [traced: the trace's row for 5.10.1]. The code: `core/src/agreements_new/terms.rs:571` and the cases after it; at query time, `core/src/agreements_new/grammar/spots.rs:20` [traced].

3. **What a verifier would answer differently.** Nothing: a role with no kind, a kind not one of the five, or no `what` (but for kind future) is invalid, as today.

4. **Size.** None.

5. **Vectors.** Renamed only: the `valid.json` and `invalid.json` cases naming G10.1 (counted at the end). New: none.

6. **The build list and the sheet.** None.

7. **Choices the text leaves.** None.

*Check note (session 4).* The rule block above carries only the rule's first line. Draft 26 at `d4373f0` goes on with three items: "its **kind**, one of: **done** ..., **received** ..., **holding** ..., **fits** ..."; "its `what`: the X, Y, Z or W, by fingerprint (§5.2), except for kind future (5.10.4);"; "its spot socket (task K5): the cMIP that says who fills it, by fingerprint, with its parameters. The role (its kind and its `what`) is that task's input, and not a task of its own." [traced]

#### 5.10.2 A spot filled, and from which version

1. **The rule.**

> **5.10.2** A spot is filled, by a signer, when its K5 cMIP, applied to the acts held and the keepers' answers, names that signer on the strength of a **proof**: the acts that earn the spot. A spot MAY be filled many times; each filling is tied to the proof that earned it. Whether a spot holds one filling or many is said by its K5 cMIP. A verifier MUST answer each filling with its proof, each act reported by who signed it (the MICS, §2), qualified per the keepers its own version names, or as shown where that version names none: a filling's keepers and clock are those of its own version, never those of the Terms in force (5.8.5). For a filling yet to be earned, the role and its cMIP are read from the Terms in force; while a fork of Terms stands, from the Terms both branches replace (5.5.4(e)). A filling already earned is read from the version its proof names, its role and that role's cMIP as that version states them, whatever a later version says of the role (5.10.6).

2. **What it replaces, and the code it meets.** G10.2, with "For a filling yet to be earned" and a sentence added for a filling already earned, and the keepers of the filling's own version [traced: the trace's row for 5.10.2, "**Added by M6, to check**"]. The code: `core/src/agreements_new/grammar/spots.rs:13` reads the role from the Terms in force only, and answers `core/src/agreements_new/grammar/spots.rs:18` where they name none; the qualifier at `core/src/agreements_new/grammar/spots.rs:22` [traced].

3. **What a verifier would answer differently.** Carla fills the spot at position 2 of version 1. Ana and Ben then make version 2, which drops the role. *Before:* `fillings` of position 2: **not shown**, G10.2, "the Terms in force name no role at that position" [traced: `spots.rs:18`]. *After:* **shown**, Carla, with her proof, earned under version 1, its role and that role's cMIP read from version 1 [traced: 5.10.2, "whatever a later version says of the role"]. Asked whether the spot still takes new identities, the answer is read from version 2, which names no such role (5.10.5) [inferred].

4. **Size.** A rule: two readings of a spot, one for fillings yet to be earned (the Terms in force) and one for each filling earned (its own version).

5. **Vectors.** Renamed only: case 71 (a spot filled: each filling with its proof, reported by who signed it). New:
   - **A filling under a dropped role** (27 November): version 1 names a role at position 2, which Carla fills; version 2, valid and in force, names no role. `fillings`: **shown**, Carla, earned under version 1, its role and cMIP read from version 1; `takes_new` under version 2: **not shown**, the version in force naming no such role.

6. **The build list and the sheet.** The 27 November entries' vector *a filling under a dropped role* (the prompt's name for it) falls here [traced: the ledger, "no update of the known parties reaches her in any way (her rights, her spot, her place in the agreement)"].

7. **Choices the text leaves.**
- Which version's K5 cMIP is asked for fillings already earned when the question is about the spot (`fillings` of a root and a position): the position in version 1, version 2, or each version that names a role there? Today a spot is named by the position in the Terms in force, and a dropped role has no position there.

#### 5.10.3 A filler is a party, bound by her own assent

1. **The rule.**

> **5.10.3** Each signer who fills a spot is a party in it from then on. They are bound only by their own assent (§5.6). Filling a spot does not bind any other party; what binds the known parties to the holder of a filling is the version its proof names (5.10.6).

2. **What it replaces, and the code it meets.** G10.3, with a clause added: what binds the known parties to the holder is the version her proof names [traced: the trace's row for 5.10.3, "**Added by M6, to check**"]. The code: who is bound, `core/src/agreements_new/grammar/order.rs:221` [traced].

3. **What a verifier would answer differently.** Nothing the code gives today; the added clause is 5.10.6's, and its effect is counted there.

4. **Size.** A word: a clause, no branch.

5. **Vectors.** None.

6. **The build list and the sheet.** None.

7. **Choices the text leaves.** None.

#### 5.10.4 A role of kind future

1. **The rule.**

> **5.10.4** A role of kind **future** names no `what`: its K5 cMIP defines who the participant is as well as how they are confirmed. It is for participants none of the four kinds can describe in advance. No verifier can check that a future spot was used only for them; whether it was is the authors' word, carried by them (§5.3). A `what` on a role of kind future is left unread, and a verifier says so (5.2.3).

2. **What it replaces, and the code it meets.** G10.4, with "A `what` on a role of kind future is left unread, and a verifier says so" written here [traced: the trace's row for 5.10.4]. The code: `core/src/agreements_new/terms.rs:580`, a note the verifier lists [traced].

3. **What a verifier would answer differently.** Nothing.

4. **Size.** None.

5. **Vectors.** Renamed only: in `valid.json`, the role of kind future with a `what`, its note G10.4 (counted at the end). New: none.

6. **The build list and the sheet.** None.

7. **Choices the text leaves.** None.

#### 5.10.5 New identities

1. **The rule.**

> **5.10.5** **New identities.** Whether a spot still takes new identities is said by its K5 cMIP, applied to the version in force (the role as that version states it), the acts held, and the answers of the keepers and the clock the Terms in force name (5.8.5). These grammar rules define no act and no field for closing a spot or for opening it again: an offer stops taking new identities, or takes them again, by a new version (§5.5), or by what the version in force itself states in advance (a date, a count), as that cMIP reads them. The update condition is not asked for this answer: it is asked only of a proposed update (5.5.7). A verifier MUST give that answer with its cause, as the cMIP gives it, per keeper, per clock or as shown (§5.8, §5.13). A condition in time in that answer is answered per the clock the Terms in force name, and for a filling already earned per the clock its own version names (5.8.5, 5.10.2): an anchoring of the reader's own choosing never gives the Terms' answer (5.8.5, 5.8.6). Whatever that answer is, a filling already earned stays a filling, shown with its proof (5.10.2), and keeps the rights of the version it was earned under (5.10.7). Where the verifier lacks the cMIP, the answer is **unchecked** (§3.6).

2. **What it replaces, and the code it meets.** G10.5: "per the anchoring named" goes; a condition in time per the clock the Terms name, and for a filling per its own version's clock [traced: the trace's row for 5.10.5]. The code: `core/src/agreements_new/grammar/spots.rs:85`, its qualifier from the chain, which takes the reader's anchoring at `core/src/agreements_new/grammar/mod.rs:256` where the Terms name neither place nor clock [traced].

3. **What a verifier would answer differently.** Ana's offer names no keeper and no clock; Dana accepts an anchoring of her own. *Before:* "the spot still takes new identities", **per anchoring**. *After:* **as shown**, the Terms' answer; Dana's anchoring only beside it, as hers [inferred: 5.10.5 with 5.13.5].

4. **Size.** A removal (the anchoring as the Terms' answer), counted under 5.13.5.

5. **Vectors.** Renamed only: case 72 (whether a spot still takes new identities: the task's output, with its cause); case 73 (an offer stops taking new identities by a new version). New: none here (5.13.5's cover it).

6. **The build list and the sheet.** None.

7. **Choices the text leaves.** None.

#### 5.10.6 No update reaches a filling

1. **The rule.**

> **5.10.6** **No update reaches a filling.** For a filling, no later update exists; each later version exists for the agreement. No update of the known parties reaches a filling in any way: its holder has no say in the agreement's updates (§3.2, 5.5.5(a)), and no update binds them (5.6.1(c)). What exists for the holder is the version the filling's proof names (5.10.7): that version binds the holder, by the assent that earned the filling (5.4.3), and binds the known parties to the holder, for as long as its words say, on the clock that version names (5.10.8), whether or not a later version is in force (5.4.3). A verifier MUST NOT read any update, or any update condition's answer, as reaching a filling (5.5.7).

2. **What it replaces, and the code it meets.** New (N5) [traced: the trace's row for 5.10.6; the ledger, "There is no valid update for her anymore. Only a valid agreement, this is because she is the unknown party the network protects. No?"]. The code: a filling's rights changed through the condition of the version earned under, `core/src/agreements_new/grammar/spots.rs:114`; and being bound by an update without one's own assent, `core/src/agreements_new/grammar/order.rs:234`, which asks `signed_by` `core/src/agreements_new/grammar/force.rs:473`, whose "everyone who signed the original" includes a filler [traced; the sheet of 26 November, section 8].

3. **What a verifier would answer differently.** Carla fills a spot under version 1, which names a condition. Version 2 passes that condition without Carla's assent. *Before:* `bound` for Carla by version 2: **shown**, G5.1(c), where the condition answers valid and her assent to version 1 counts in "everyone who signed" [inferred, as the sheet of 26 November read it]. *After:* **not shown**: no update binds her (5.10.6, 5.6.1(c)).

4. **Size.** A rule, shared with session 1: the arm of `signed_by` that counts a filler is 5.5.5(a)'s and 5.6.1(c)'s; the (b) arm of `rights` is 5.10.7's.

5. **Vectors.** New:
   - **The filler not bound by a later version** (26 November, line 8, new vector (2)): version 1 names a role and a condition that answers valid to an update Ana alone signs; Carla fills the role; version 2 is signed by Ana. `bound` for Carla by version 2: **not shown**.

6. **The build list and the sheet.** The sheet of 26 November, line 8, new vector (2) ("the filler not bound by a later version that a condition let through: **not shown**") falls here; its (1) and (3), the default's signers, are session 1's [traced: the sheet, section 8]. Q14 ("Who is an unknown party?") is settled by §3.2, **Unknown party**: "Any filling of a role is an unknown party's, whenever it was made." [traced]. Q16 and Q17 are session 1's (5.5.7, 5.4.2).

7. **Choices the text leaves.**
- The draft's report lists item 13 (what a verifier shows of an agreement the known parties dissolved while a filling's version still binds) and item 16 (whether the principle binds a verifier beyond the rules that apply it) [traced]. Neither changes an answer the code gives today.

*Check note (session 4).* This vector is written by part 1 too, at 5.6.1 (section 4, line 47).

#### 5.10.7 Rights

1. **The rule.**

> **5.10.7** **Rights.** A filling has exactly the rights offered by the version it was earned under, with every condition that version puts on them. The version a filling was earned under is the version its proof names (§5.13), as the spot's cMIP gives it with the filling (K5's row, §6). What the rights and their conditions are is that version's (§5.2, task K1); these grammar rules do not read them. Nothing stops those rights but what that version's own words say (5.10.8). Nothing changes what a filling earned except an assent its holder signs in their own name (5.6.1(a)), or one made for them under a power they gave (5.6.1(b), 5.6.5(f)). A verifier MUST name, with each filling, the version it was earned under, and each later version that changes what it earned, with the assent that rests on: the holder's own, or the one made for them under a power they gave, with that power named.

2. **What it replaces, and the code it meets.** G10.6 with (a) only, folded into one sentence, and a power she gave counted as hers; (b) goes [traced: the trace's row for 5.10.7; the MOR lead's note on what changed, "Comes back with (a) only: nothing changes what a filling earned except an assent its holder signs in their own name (or for her under a power she gave)."]. The code: `core/src/agreements_new/grammar/spots.rs:99`; the (a) arm counts only an assent with no `for`, `core/src/agreements_new/grammar/spots.rs:108`; the (b) arm asks the condition, `core/src/agreements_new/grammar/spots.rs:115`, through `core/src/agreements_new/grammar/sockets.rs:67` [traced].

3. **What a verifier would answer differently.** Carla earned 10% under version 1, whose condition lets Ana and Ben change shares. Version 2 gives her 5%, and she did not sign it. *Before:* `rights`: version 2 changes them, **valid**, G10.6(b), where the condition answers valid [traced: `spots.rs:119`]. *After:* **shown**, "no later version changes them": the condition is never asked about a filling [traced: 5.10.7, 5.10.6]. Carla signs version 3 herself: changed as far as its words say, under either text. Gil signs version 3 for her, under a power she gave: *before*, not counted (`for` is set); *after*, it changes them, the power named [traced: 5.10.7, "or one made for them under a power they gave"].

4. **Size.** A removal (the (b) arm and `Ask::FillingRights`), and a rule (an assent under a power she gave counts as hers).

5. **Vectors.** case 74 (a filling's rights: a later version changes them where the version it was earned under names an update condition that answers valid): keeps its answer (**shown**), loses its name and sentence, which quote G10.6(b), and its `stubs_asked` loses the K4 question about a filling [traced: the sheet of 26 November, section 9]. New:
   - **The condition does not reach a filling** (26 November, line 9): the same, version 2 cutting Carla's share. `rights` of Carla's filling: **shown**, no later version changes them; K4 is not asked.
   - **Her own assent** (26 November, line 10): version 2, assented by Carla in her own name. `rights`: **shown**, version 2 changes them as far as its words say, her assent named.
   - **An assent under a power she gave**: version 2, assented for Carla by Gil, under a power of kind `assent` in Terms Carla signed. `rights`: **shown**, version 2 changes them, the power and Gil named.
   - **Her own assent to a version that does not name her**: version 2 names neither Carla nor her role; Carla assents to it. `rights`: **shown**, version 2 changes them (question 6, (A)); or **shown**, no later version changes them (B).

6. **The build list and the sheet.** D7 ("Earned rights, asked apart"): the half that removes `Ask::FillingRights` stands; its "should" (Carla falls to 5%) is reversed [traced: the sheet of 26 November, section 9]. The sheet's lines 9 and 10 fall here, one new vector each. Q18 ("The holder's own assent to a version that does not name her") is settled by the MOR lead [traced: "Her own assent to a later version, counted in her name or not, is her signature for G10.6 (a)."]; draft 26 writes "an assent its holder signs in their own name" and does not say "counted or not".

7. **Choices the text leaves.**
- Must the later version count her assent in her name (as `spots.rs:108` reads, through `counted`), or is her own signature enough, counted or not (the MOR lead's note)?
- 5.10.7 names "each later version that changes what it earned": does the verifier read whether a version changes it (K1's), or name every later version she assented to?

*Check note (session 4).* **Disagreement.** Case 74 is kept here; part 1 retires it (5.4.3). This session does not choose (question 10).

#### 5.10.8 How long, and no trigger

1. **The rule.**

> **5.10.8** **How long, and no trigger.** What a filling gave lasts as long as the words of the version it was earned under say, measured on the clock that version names, from the anchoring of the purchase; where the version names no clock, no term in time can be read from it (5.8.6). The cMIP that reads those words (task K1) answers whether what the filling gave still applies; a verifier shows that answer as that cMIP's, with the ground it gives, qualified **per clock**, and gives none of its own; where it lacks that cMIP, the answer is **unchecked** (§3.6). No update ends what a filling gave, and none is needed (5.5.7(f)). The update condition is read in one place (5.5.7), and is never asked about a filling. No condition triggers: these grammar rules have no answer **triggered**, and a verifier MUST NOT give one. What a version offers changes only through an update (§5.5); what a filling earned changes only as 5.10.7 says. Whether a spot still takes new identities under the version in force is 5.10.5's. Nothing stops a later version: one made as §5.5 says MAY offer again, and MAY rest what it offers on values already in the chain, named by fingerprint (§5.2, §5.13), or on none. Who fills a spot under it is said by its own K5 cMIP (5.10.2), and a filling under it has the rights that version offers (5.10.7).

2. **What it replaces, and the code it meets.** N6 and G10.7 in one rule [traced: the trace's row for 5.10.8]. The code: the verifier's own promise never to answer "no longer applies", `core/src/agreements_new/grammar/mod.rs:25`; K1's output has no part for it, `core/src/agreements_new/grammar/sockets.rs:119` [traced].

3. **What a verifier would answer differently.** Ana's offer, version 1, sells a month, names a clock, and its body's cMIP reads the month. Carla bought on 1 March. *Before:* no question asks it, and the code's doc says it never answers that her rights no longer apply. *After:* asked on 2 April, the verifier shows K1's answer, "no longer applies", with its ground, **per clock**, as the cMIP's and not its own; lacking the cMIP, **unchecked** [traced: 5.10.8].

4. **Size.** A rule, and a field: K1's output gains "whether what a filling gave still applies, with its ground", and the verifier a question that shows it.

5. **Vectors.** New:
   - **Still applies**: version 1 names a clock; a K1 stub answers that what Carla's filling gave still applies, with its ground. The new question, what a filling gave: **yes (the task's output)**, K1 named, per clock.
   - **No longer applies**: the same, K1 answering no: **no (the task's output)**, per clock; never **triggered**.
   - **K1 lacking**: the same, the verifier not holding the body's cMIP: **unchecked**.

6. **The build list and the sheet.** The ledger's "Ana's month ends by the clock the agreement names" falls here [traced: "The clock specified in the agreement and its anchoring."].

7. **Choices the text leaves.**
- Which act "the anchoring of the purchase" anchors (the draft's report, item 12): the assent that earned the filling, the payment, or its settlement?
- A version that names no clock: "no term in time can be read from it". Does the verifier then show nothing, or pass on K1's answer without a qualifier? Where K1 declares a clock it needs, 5.8.6 makes the Terms invalid; where it declares none, the text gives no answer word [inferred].

---

### 5.11 Legs of a sequence

#### 5.11.1 Sequence, and leg

1. **The rule.**

> **5.11.1** **Sequence, and leg.** Where what one agreement gives or owes reaches another agreement (a party named as an agreement, 5.1.1; a receiver that is an agreement, 5.1.3), and so on from one to the next, those agreements are a **sequence**. A **leg** is one obligation carried out, between its two sides: the **doer**, who carries it out, and the **receiving side**, who receives it. A payment to an agreement is a leg between the payer and that agreement's receiver for the payment (5.1.4). A payout divided among several is one leg for each of them: between whoever pays out (a service, or a party who receives for the others) and each one paid; where one paid is an agreement, that agreement's receiver for the act (5.1.4). These grammar rules define the two sides of a leg, and nothing more of it. Each leg is carried out under the Terms that hold its task (5.11.2), or, for a payment, under the offer's Terms the buyer signed, which require it, the payment itself holding the task of paying and its call (5.11.7); the cMIPs that read it are the ones those Terms name (§5.2). Nothing in one agreement's choice of cMIPs binds another agreement, and nothing is chosen for a sequence as a whole. The agreements of a sequence MAY name the same cMIPs; none is required to.

2. **What it replaces, and the code it meets.** G11.1, unchanged but for references [traced: the trace's row for 5.11.1]. The code: `core/src/agreements_new/grammar/legs.rs:97` [traced].

3. **What a verifier would answer differently.** Nothing.

4. **Size.** None.

5. **Vectors.** None.

6. **The build list and the sheet.** None.

7. **Choices the text leaves.** None.

#### 5.11.2 The call

1. **The rule.**

> **5.11.2** **The call.** Terms hold the Control task (K6) where their field `control` names a cMIP (§5.2); or, with that socket empty, where they name as `receiver` one of their own parties (5.1.3) and give a part to any other party, so that this party holds for the others and passing on to them is its obligation under those Terms. Whether Terms give a part to a party is read from their words, as the body's cMIP gives them (task K1): a share for any party other than the receiver. Where the verifier cannot read the body, or lacks the cMIP in `control`, whether those Terms hold the task is **unchecked** (§3.6). Terms that hold the task MAY carry a call for it, in `calls`, as the report block of the shared language gives it (the MICS, §2): from whom a report is expected (the doer, the receiving side, or both). A call names no keeper and no reader (§3.1). For K6, the doer is whoever carried out the passing on (the controller: a service, or a party that receives for the others): the party those Terms name as `receiver` among their own parties. Where the receiver those Terms name is not one of their own parties (another agreement, or none), no doer is shown under those Terms: what reaches them is passed on under the Terms of the agreement it reaches (5.1.4). And the receiving side of each leg is whoever something was passed on to; where that is an agreement, it is that agreement's receiver for the act (5.1.4), and no other of its parties. The call is made by the signers of those Terms, and binds no one else. In a deal, those signers are the service and the agreement it serves, which signs by its own signature (5.1.2): the call is that agreement's parties' as much as the service's, and each party that signature binds has signed the deal through its agreement. Whoever receives is the receiving side of its leg whether or not it signed the Terms that carry the call. Where it did not, itself or through an agreement's signature, these grammar rules do not make the path to it a signed one: closing that gap is a cMIP's (§6). A call is attached to a task, in the Terms under which that task is carried out; none is attached to a receiving side. A call in Terms that do not hold the task it is attached to is left unread, and the verifier says so (5.2.3). These grammar rules make no Terms carry a call, and make no one answer one. A call is part of signed Terms and is read as they are (§5.2, 5.5.3), by anyone, before any payment is made.

2. **What it replaces, and the code it meets.** G11.2, with one sentence cut for the MICS: "and a report that states a doer's lines under these Terms is listed, as its signer's word (G8), and ties nothing" [traced: the trace's row for 5.11.2]. The code: `core/src/agreements_new/grammar/legs.rs:21`, `core/src/agreements_new/grammar/legs.rs:56` [traced].

3. **What a verifier would answer differently.** Whether Ana's Terms hold the Control task: as today. A report stating a doer's lines where no doer is shown is no longer Agreements' to list; the MICS's report block reads it [inferred: the companion, "a verifier of the MICS's report block then answers what draft 25 had answered here"].

4. **Size.** None in this rule's answers; the cut sentence moves with 5.11.4's.

5. **Vectors.** Renamed only: case 79 (Terms whose `control` names a cMIP hold the Control task); case 87 (with `control` empty, a receiver among the parties who holds for others holds the Control task); case 88 (with `control` empty and no part given to another party: the Control task is not held); in `valid.json`, "terms: two calls, from the doer and from the receiving side". New: none.

6. **The build list and the sheet.** R11 (the doer where the receiver is an agreement that is a party) and R19 (`control` empty, a receiver who holds for others): draft 26 keeps G11.2's wording; both stay readings [traced].

7. **Choices the text leaves.** None new.

#### 5.11.3 Leg report

1. **The rule.**

> **5.11.3** **Leg report.** A leg report is a report that answers such a call. As every report does, it carries the call it answers and the acts it relied on, each by fingerprint, and its signer. Among the acts it relied on are the version of the Terms it passed on by (§5.13) and each settlement it speaks of (5.9.1). Beyond that, it carries what K6's row says (§6). Each signer reports its own half only. What K6's row asks of a leg report MUST be readable without any cMIP those Terms name. Where one doer carries out several legs under one call (a payout to several), which lines of its report each receiving side receives (all of them, or those of its own leg) is said by the cMIP that answers the task (K6). These grammar rules do not say it. How a leg report is read is the MICS's report block's (§2).

2. **What it replaces, and the code it meets.** G11.3, on the lead's reading: what a leg report carries stays, how it is read goes to the MICS [traced: the trace's row for 5.11.3]. The code: `core/src/agreements_new/grammar/legs.rs:97` reads leg reports and ties their halves [traced].

3. **What a verifier would answer differently.** That a leg report of Ben's is readable with no cMIP stays. That the verifier reads it side by side with Ana's, and how, leaves for the MICS; see 5.11.4.

4. **Size.** A removal, counted under 5.11.4.

5. **Vectors.** None under this number.

6. **The build list and the sheet.** D9 ("The baker's and the report block's rules, still in Agreements' verifier"): draft 26 now says what was decided, so D9 becomes a translation error against draft 26 [traced: D9, "Each moves into the translation errors once draft 25 is redrafted"].

7. **Choices the text leaves.** None.

#### 5.11.4 Before paying

1. **The rule.**

> **5.11.4** **Before paying.** Asked which agreements of a sequence carry a call for reports, a verifier answers from their Terms alone (5.11.2), one agreement at a time, per keeper or as shown (5.5.3), and **unchecked** where it lacks them. It answers in the same way, from the same Terms, from whom each call expects reports, and whether those Terms name a data cMIP, in `data` (task K8), by which their signers agreed to a path beyond the leg (5.11.5): **shown**, with its fingerprint, where they name one; where `data` is empty, it answers that no path beyond the leg is agreed in those Terms. For an offer, that answer is also the path a buyer agrees to for their own leg by signing its Terms (5.11.6). The agreements of a sequence, for this question, are found from the agreement asked about by following `receiver` from agreement to agreement, until one names one of its own parties, or none (5.1.4). Parties named as agreements are not walked: which of them a payment reaches is their own Terms' and cMIPs' to say.

2. **What it replaces, and the code it meets.** G11.4(e), on the lead's reading; G11.4's opening and (a) to (d) (where to look, the tie, amounts, silence) leave Agreements for the MICS [traced: the trace's row for 5.11.4, "G11.4(e), stays, **on the lead's reading**"; the companion's section 10, row G11.4: "left: to the MICS"]. The code: `core/src/agreements_new/grammar/legs.rs:324` stays; `core/src/agreements_new/grammar/legs.rs:97` and `core/src/agreements_new/grammar/legs.rs:182` give G11.4(a) to (d)'s answers [traced].

3. **What a verifier would answer differently.** Before paying, Ben asks which agreements of the sequence carry a call: as today, per keeper for per place. Asked whether Ana's and Carla's halves of a leg match, an Agreements verifier no longer answers **matched**, **mismatched**, **one side only**, **unanswered** or **no report called for**: those are the report block's words, given by a verifier of the MICS (§3.6, "Of reports, a verifier also shows what the MICS's report block asks it to show, in that block's words, which are not answers of this text") [traced].

4. **Size.** A removal: `leg` and `silence` leave the Agreements verifier, or stay as the report block's module, named so.

5. **Vectors.** Renamed only: case 91 (before paying: which agreements of a sequence carry a call, from whom, and their data cMIP, one at a time). Retired, with G11.4(a) to (d): case 78 (one leg's call, its two halves matched); case 80 (one leg's call, its two halves mismatched: both shown, neither chosen); case 81 (one leg's call, the doer's half only: one side only); case 82 (a confirmation by a party named as a signer, of which no doer's report speaks: one side only); case 83 (a call that expects one side only: each report shown as stated, no tie answered); case 84 (a call with no report, read by a side of that leg: unanswered); case 85 (a call with no report, read on behalf of no one: that leg's reports are not shown); case 86 (Terms that hold the Control task and carry no call: no report called for). New: none.

6. **The build list and the sheet.** D9, as at 5.11.3 [traced].

7. **Choices the text leaves.**
- Do the retired cases move to a vector file of the MICS's report block (the same bytes, the same answers), or go until that block is rewritten after draft 26 (the MOR lead's settled note, M24, "The MICS is rewritten after draft 26")?

#### 5.11.5 Reports are data: a path beyond one leg

1. **The rule.**

> **5.11.5** **Reports are data: a path beyond one leg.** A report is data. A path by which a report, or what it states, reaches anyone who is not a side of its leg (a partner seeing further, a request from upstream) is a path the people whose data it carries agreed to, with their signature. It is built as a cMIP about data, focused on agreements, which Terms they signed name by fingerprint (§5.2). These grammar rules give no such path themselves: no call, no field and no answer of this text carries a report beyond its leg, and a verifier MUST NOT read any as doing so. What such a cMIP says is its own: who may read what, how a reader puts together the legs it may read, how far it follows, and what a loop answers. **The data task.** Terms name such a cMIP in the field `data`: the task K8 (§6). Its one question, asked for one reader and one report of a leg carried out under those Terms: may this reader read it, or what it states, beyond its leg? It answers yes or no. These grammar rules take that output and add nothing to it. The socket speaks for the people bound by the Terms that name it (5.6.1), and for no one else. Where it is empty the answer is no: one leg. Where a report carries the data of people bound by different Terms (the two sides of a leg), the data cMIP of each is asked, and the report is read beyond its leg only where every one asked answers yes. **Which Terms are asked.** About one report: the Terms that carry the call it answers; and, for each agreement a line of the report names as passed on to or owed to, that agreement's Terms in force (5.5.3). A receiving side named as a signer of the Terms that carry the call is asked through those Terms. Where Terms that are to be asked are not held, the answer is **unchecked** (§3.6). What a data cMIP is beyond that socket is not said here.

2. **What it replaces, and the code it meets.** G11.6(a), its quotation and "that last reading is Claude's" going to the companion [traced: the trace's row for 5.11.5]. The code: `core/src/agreements_new/grammar/legs.rs:227` [traced].

3. **What a verifier would answer differently.** Nothing: where a report carries the data of people bound by two Terms, it is read beyond its leg only where every data cMIP asked answers yes, as today.

4. **Size.** None.

5. **Vectors.** Renamed only: case 89 (may a reader read a leg report beyond its leg: a data cMIP that answers yes for this reader); case 90 (may a reader read a leg report beyond its leg: an empty data socket: one leg). New: none.

6. **The build list and the sheet.** R20 (two data sockets, "that last reading is Claude's"): draft 26 states the reading as the rule, without the label; R20 is settled as the code reads it [traced].

7. **Choices the text leaves.** None.

#### 5.11.6 Who has agreed

1. **The rule.**

> **5.11.6** **Who has agreed.** A verifier MUST NOT read the people of a leg as having agreed to be read from beyond their leg unless Terms they signed say so (5.6.1): by naming such a data cMIP in `data` (K8), or by a rule in them under which others decide it. Which consent a data cMIP asks of the people it reads is that cMIP's to say. Which cMIP, and which rule, apply is what the signers chose when they made the agreement, and is read from the Terms they signed (§5.2). Where those Terms say that a majority decides, the majority decides (5.6.1(b)): a verifier reads a member who was outvoted as that rule says, and MUST NOT answer, beyond it, whether that member agreed. **What the buyer agreed to.** A buyer signs Terms: those of an offer, by an assent to the version they buy under, and paying is what those Terms require of them (5.11.7). So a buyer is bound by that version by their own assent (5.6.1(a), 5.10.3), its data socket included. For a report of the buyer's leg (a confirmation of a payment), the Terms asked are the version the payment names (§5.13), where an assent of the payer to that version is held: its data cMIP speaks for the buyer, and for the receiving side where the receiver for the payment is one of that version's own parties (5.1.4). Where the receiving side is reached through another agreement (5.1.4), that agreement's Terms in force are asked too, as for any report that carries the data of people bound by different Terms (5.11.5), and the report is read beyond its leg only where every one asked answers yes. Where the version's `data` is empty, the answer is no: one leg. Where no assent of the payer to the version its payment names is held, the payer is not shown as bound by those Terms, nothing they signed says that they agreed to be read from beyond their leg, and the answer is no for every reader who is not a side of that leg.

2. **What it replaces, and the code it meets.** G11.6(b), on the lead's reading [traced: the trace's row for 5.11.6]. The code: `core/src/agreements_new/grammar/legs.rs:227` [traced].

3. **What a verifier would answer differently.** Nothing.

4. **Size.** None.

5. **Vectors.** Renamed only: case 98 (the buyer's leg beyond it: the offer's `data` is empty: no, one leg). New: none.

6. **The build list and the sheet.** None.

7. **Choices the text leaves.** None.

#### 5.11.7 The buyer's leg

1. **The rule.**

> **5.11.7** **The buyer's leg.** Paying an agreement is a leg (5.11.1). Its doer is the buyer: a signer of the offer's Terms, whose assent names the version they buy under, and whom those Terms require to pay (5.11.6). Paying is the consequence of the Terms the buyer signed, as for any signer of any Terms; the buyer differs only in that their identity was not known when the offer's maker drafted and signed it (§3.2, **Offer**). The buyer also signs the payment (§5.13), which carries out what those Terms require. Its receiving side is the receiver, for that payment, of the agreement paid (5.1.4). A payment is the act that holds the task of paying: the Control task (K6), with the payer as its doer. The payer, its signer, may call for the receiving side's confirmation, as the signer of any act that holds a task may (the MICS's report block, §2). These grammar rules read every payment as carrying that call: the buyer's confirmation by default is that call, made by default, and no Terms need write it. The confirmation is a report that answers it. A report names the call it answers by naming the act that holds it; for this call, made by default, it names the act that stands for it: the settlement the payment names, the act both sides can see, and never the payment itself. A report whose call names that settlement is the confirmation of that payment. The payment is the doer's half of that leg: its signer is the buyer, and it names the settlement. The confirmation is the receiving side's report, its signer's word (the MICS, §2). How a payment and its confirmation are read together is the MICS's report block's (§2). After the confirmation comes access to what was bought. What that is, and who gives it, is said by the version the payment names and its cMIPs (5.10.7, §5.13; delivery, §6); these grammar rules do not read it. By default the buyer is shown nothing further. What the receiving side then does with the payment is further legs, and their reports go to the two sides of each (the MICS, §2). The buyer's own leg is read beyond it only as the data cMIP of the offer's Terms the buyer signed gives (5.11.6); the buyer reads a further leg only as a data cMIP the people of that leg agreed to gives (5.11.5). The call binds only its signer, the payer: these grammar rules make no one confirm (5.11.2).

2. **What it replaces, and the code it meets.** G11.7, with its reading of the two halves cut for the MICS: "As for any two halves, a verifier shows a payment so confirmed as **matched**" and what follows [traced: the trace's row for 5.11.7; the diff of the two rules' sentences, by the build script]. The code: `core/src/agreements_new/grammar/legs.rs:280` [traced].

3. **What a verifier would answer differently.** Ben pays Ana's offer; Ana confirms. An Agreements verifier still reads the payment as the doer's half and the confirmation as the receiving side's report naming the settlement; whether the two match is the report block's to show [traced: 5.11.7, "How a payment and its confirmation are read together is the MICS's report block's"].

4. **Size.** A removal: `buyer_leg`'s matching goes with 5.11.4's.

5. **Vectors.** Retired: case 92 (the buyer's leg: the payment and the receiving side's confirmation, matched); case 93 (the buyer's leg: the payment and the receiving side's confirmation, mismatched); case 94 (the buyer's leg: the payment and the receiving side's confirmation, one side only). In `valid.json`, the confirmation naming its settlement keeps its verdict (its bytes are the report block's proposal, session 3's). New: none.

6. **The build list and the sheet.** R10 (a report that names the payment itself): 5.11.7 keeps "never the payment itself"; what a verifier does with such a report is the block's now [traced]. R10 leaves Agreements.

7. **Choices the text leaves.** As at 5.11.4.

#### 5.11.8 The contest

1. **The rule.**

> **5.11.8** **The contest: an act, made against an offer or a vow.** A contest is an act of these grammar rules: a Statement of kind `contest`. It is made against an offer or a vow (§3.1, **Vow**; §3.2, **Offer**): its `agreement` names the root of that offer or vow, and its `terms` names the version it is made against. Whom it reaches follows from what it is made against: the signers of that offer or vow (one level, 5.1.2), and no one else. A contest made against a vow is read exactly as one made against an offer. A verifier reads a contest made against any version alike: whether that version names a party by role is shown beside it, and changes no answer. The signers a contest reaches are the parties that version names as signers; a signer who fills a role is not counted among them. Its `terms` names Terms shown as a version, or a tip set aside (then the contest is shown as **disputed**, §5.12); otherwise the contest is **not shown**. A contest is its signer's word, reported as such (the MICS, §2), and stands in its signer's own line (§5.7). **A buyer's contest** is a contest by which a buyer says that what they bought was not delivered after payment. It is made against the offer or vow the buyer bought under, names the version the payment read (§5.13), and names in `settlement` the settlement the payment names, the act both sides can see (5.9.1), and never the payment itself. These grammar rules read a buyer's contest only there: where what was bought was not delivered after payment. A verifier shows a contest as a buyer's where it holds a payment by the same signer that names the same settlement and the same version; where it holds no such payment, whether the contest is a buyer's is **unchecked** (§3.6). That it was not delivered is the buyer's word (the MICS, §2). A verifier MUST NOT read a contest as contesting anyone but the signers of what it is made against: not a service those signers picked, not a deal of theirs, not any other agreement of the sequence. It MUST NOT read a contest as giving its signer sight of any leg (5.11.5, 5.11.7). Where those signers believe the fault is their service's, they contest the service: a contest of their own, made within the deal they signed with it (5.1.2), which reaches the service and is read no further. Whether such a deal, signed by parties who were known, is an offer or a vow is not said. A baker may contest Terms for another envelope of the same work (5.11.9). Who else may make a contest, and when, is not said. What a contest does beyond standing on the record, who answers it and how, and how money comes back, are not these grammar rules' (§6).

2. **What it replaces, and the code it meets.** G11.8, references moved, "bake" read "envelope" [traced: the trace's row for 5.11.8]. The code: `core/src/agreements_new/grammar/legs.rs:371`; a contest built on a tip counts for nothing, `core/src/agreements_new/grammar/legs.rs:407` [traced].

3. **What a verifier would answer differently.** Nothing.

4. **Size.** None.

5. **Vectors.** Renamed only: case 95 (a contest made against an offer: it reaches the signers that version names, and no one else); case 96 (a buyer's contest: a payment by the same signer naming the same settlement and version is held); case 97 (a contest naming a settlement, and no such payment held: whether it is a buyer's is unchecked); in `valid.json`, the buyer's contest and the contest with no content. New: none.

6. **The build list and the sheet.** None.

7. **Choices the text leaves.** None new.

#### 5.11.9 A baker may contest

1. **The rule.**

> **5.11.9** **A baker may contest.** The holder of the baker's rights in an envelope, as the envelope's chain names them (Envelopes, §2), MAY make a contest (5.11.8) against Terms that name another envelope of the same work. It reaches the signers of those Terms, is its signer's word (the MICS, §2), and stands on the record. The holder of the baker's rights is read at the act the contest cites: a contest names an envelope, whose baker's rights its signer holds, and the act of that envelope's chain it relies on (5.13.2), and the holder is read at that act of the envelope the contest names, not from the contested Terms. Who holds the baker's rights, and what follows from them, are Envelopes' (§2). That its signer is the one who made the work is not shown by any act.

2. **What it replaces, and the code it meets.** G14.5(e), on the lead's reading, worded on the holder read at the act the contest cites [traced: the trace's row for 5.11.9]. The code: none. `contest` reads the version and its signers, never the envelope's chain [traced: `legs.rs:371` to `legs.rs:412` name no envelope]. The rest of G14 goes to Envelopes [traced: the companion, "The baker's lines of draft 25 (G14) go to Envelopes with its rules"].

3. **What a verifier would answer differently.** Ana baked a work; Ben bakes the same bytes again and makes Terms for his envelope. Ana contests Ben's Terms, naming her envelope and the act of its chain she relies on. *Before:* a contest like any other, reaching the signers of Ben's Terms, with nothing said of Ana as baker. *After:* the same, and Ana's standing read at the act her contest cites, from her envelope's chain [inferred: 5.11.9; how the verifier shows that standing is not said].

4. **Size.** A rule: the contest reads the holder of the baker's rights at the act it cites.

5. **Vectors.** New:
   - **A baker's contest**: envelope E baked by Ana; envelope F, of the same work, baked by Ben; Ben's Terms name F; Ana's contest against them names E and the act of E's chain it relies on, at which she holds the baker's rights. `contest`: **shown**, 5.11.9, reaching the signers of Ben's Terms, Ana read as the holder at the act cited.
Not counted here: cases 99 to 113 test G14, which leaves for Envelopes with no rule of draft 26's 5.7 to 5.13 in its place; they fall between this part and session 1's (§4.2's `envelope` rows, read by "the baker's rules, in Envelopes"), for session 4 to place [traced: the case list, by the build script].

6. **The build list and the sheet.** D9's baker half, R2, R9, R21 to R23, R26 and T6 rest on G14 [traced: the build list's rows]; they leave Agreements with it, T6 also being moot under 5.13.5 (see the closing table).

7. **Choices the text leaves.**
- A contest whose signer is not the holder at the act it cites: is it **not shown** as a baker's contest and shown as a contest, or not shown at all ("Who else may make a contest, and when, is not said")?

*Check note (session 4).* The 15 cases of G14 (99 to 113) are placed by no part. This sheet lists them (section 4.3) and asks where they go (question 11); of them, part 1 counts case 102 as changing answer by the pin.

### 5.12 Forks

#### 5.12.1 A fork is a fork

1. **The rule.**

> **5.12.1** **A fork is a fork.** Where two acts compete to change the same state, with no order shown between them, these grammar rules know one thing: the fork (§3.3). Where a fork exists there may be a race between its sides, or it may be resolved among all involved; these grammar rules do not say which, and read both alike. Neither act takes effect, and the earlier state stays, until the fork is resolved by a new act, made in an order that can be told, as the agreement's own update condition asks or under a power to resolve given in advance (5.12.4, 5.12.5). A verifier answers **fork**, and MUST NOT choose between its sides. How forks are treated in different cases is not these grammar rules': it is the cMIPs' that the parties chose, and the parties' own.

2. **What it replaces, and the code it meets.** New (N8) [traced: the trace's row for 5.12.1; the ledger, "A fork is a fork. When a fork exists there could be a race between a white party and a black party. Or, the fork could be resolved amicably by all emvolved"]. The code: the word **fork**, given for a signer's line (`order.rs:298`) and for Terms (`chain.rs`) [traced].

3. **What a verifier would answer differently.** Nothing beyond 5.12.2's widening: two updates of one version, two acts of one line, and now a coming into force against a counter signature (5.4.5, session 1's) are all a **fork**. The race's word of 26 November (the sheet's Q5) is withdrawn [traced: the ledger, "A fork is a fork", 27 November, 07:01].

4. **Size.** None in this part; the counter signature's fork is session 1's (cases 36, 37).

5. **Vectors.** None.

6. **The build list and the sheet.** The sheet's Q5 is settled toward (A) (**fork**), and its Q6 toward (A) (a fork of Terms is still resolved by a resolving update) [traced: the ledger, "The gate and the pin; a fork, not a race", and "A fork is a fork"]. Cases 17, 21, 22, 23, 24, 26, 27, 28 do not move on those questions.

7. **Choices the text leaves.** "How forks are treated in different cases is not these grammar rules'": nothing for the verifier.

#### 5.12.2 Lines, updates and forks

1. **The rule.**

> **5.12.2** **Lines, updates and forks.** A **line** is a set of acts of which each names the one before it, so that only one act may follow each: one signer's acts within an agreement, by `previous` (5.7.1); an agreement's Terms, by `replaces` (§5.5); and any other acts these grammar rules read as following one another. An **update** of an act is an act that names it as the one before, and that all the parties that needed to sign it have signed: for one signer's line, that signer (5.7.1); for Terms, those whose signing the update condition asks, or the default (the gate, 5.5.1(a), 5.5.5, 5.5.7). For Terms, a late update (5.5.4) is no update of the version it names. Where an act has one update, that update is the next act of the line. A **fork** is two acts competing to change the same state, with no order shown between them: two updates of the same act of one line (5.5.4, 5.7.2); Terms coming into force against a counter signature that cancels one of the assents they need (5.4.5); or any other. Three or more are one fork with that many tips. Two acts of one signer that both name no `previous` are a fork with no shared act. These grammar rules see a fork from the acts alone: for a fork of a line, two acts were signed by all the parties that needed to sign them. They say nothing of what anyone meant. Where the fork is of a line, the act both follow is the **shared act**; each of the two updates is a **tip**; a tip, with every act that follows it in the line, is a **branch**.

2. **What it replaces, and the code it meets.** G12.1, widened to two acts competing to change the same state [traced: the trace's row for 5.12.2]. The code: forks of a line, `core/src/agreements_new/grammar/line.rs:67`; forks of Terms in `chain.rs` `step_from` [traced].

3. **What a verifier would answer differently.** For lines and Terms, nothing. The new member, "Terms coming into force against a counter signature that cancels one of the assents they need", is answered in 5.4.5 (session 1).

4. **Size.** A word here ("or any other"); the rule is 5.4.5's.

5. **Vectors.** None under this number.

6. **The build list and the sheet.** D2 ("A withdrawal racing the Terms' completion", case 36) is 5.4.5's; it is listed for session 1.

7. **Choices the text leaves.**
- "or any other": which acts compete "to change the same state" (the draft's report, item 8)? The code has two kinds of fork only (a line, a version), and a third would be a new branch [traced: the report's list; inferred for the code].

#### 5.12.3 Both tips stop

1. **The rule.**

> **5.12.3** **Both tips stop.** While a fork stands, neither tip counts as the next act of its line, and nothing built on either tip counts: no act that follows a tip in the line, and no act that rests on a tip or on an act built on it (it names it, in `terms`, `under`, `answers` or `relies_on`, or was made within or under Terms of that branch), however many namings lie between. **One thing an assent to a tip still counts for.** A fork of Terms is two updates each signed by all who needed to sign, and the signing is the assents. So an assent to a tip, among the assents that count (5.5.7(a)), counts for whether that tip was signed, and for nothing else: it binds no one while the fork stands, since the Terms it names are not in force (5.4.3). Every other act that rests on a tip (through `under`, `answers` or `relies_on`, or as the version a payment read) counts for nothing while the fork stands; a payment that names a tip is read as 5.1.4 says. The shared act stays the last act of the line that counts: for Terms, the last shared version stays in force (5.5.4(e)). A verifier MUST show both tips, and what it holds that is built on them, with the fork; MUST answer **fork** where 5.5.4 and 5.7.2 say; and MUST NOT choose between the tips, by position or in any other way. A fork stands until 5.12.4 resolves it. Terms that were in force before a fork was made stay in force: Terms stop only by replacement (5.5.2).

2. **What it replaces, and the code it meets.** G12.2, unchanged but for "among the assents that count (5.5.7(a))" and references [traced: the trace's row for 5.12.3]. The code: `core/src/agreements_new/grammar/line.rs:206`, following every field an act names, at `core/src/agreements_new/grammar/line.rs:218` [traced].

3. **What a verifier would answer differently.** Ana's and Ben's Terms are in force. Ben then makes two acts naming the same `previous`, one of them his assent. *Before:* Ben's assent stops, and with it the Terms' coming into force: not in force (build-list row T1). *After, as draft 25 already says:* in force; "Terms that were in force before a fork was made stay in force" [traced: T1, `force.rs:243`].

4. **Size.** A rule, already owed (T1, T4).

5. **Vectors.** Renamed only: case 39 (both tips of a signer's fork stop: neither assent counts, and the Terms are not in force); case 40 (an assent that is a tip of a signer's fork: not shown, it does not count). New:
   - **T1**: Ana's and Ben's Terms in force; Ben's next two acts both name his assent in `previous`, one of them naming Ana's assent in `relies_on`. `in_force`: **shown**, the Terms stay in force; `line` for Ben: **fork**.
   - **T4**: Ana's line forked; Carla's Statement names one of Ana's tips only in `resolves`, resolving nothing. `assent` of Carla's: it counts; it is not built on the tip.

6. **The build list and the sheet.** T1 kept: draft 26 keeps the sentence. T4 ("Built on a tip" follows every field) kept: 5.12.3 and §3.3, **Built on a tip**, keep the list `terms`, `under`, `answers`, `relies_on`, while the code follows every field, `resolves` and `settlement` included [traced]. 5.13.1 now makes every field a knot; "built on" is a separate list, so T4 is not made moot [inferred].

7. **Choices the text leaves.**
- Does 5.13.1's widening of knots to every field widen "built on a tip" too? The text keeps two lists; the code keeps one (T4).

#### 5.12.4 Resolving update

1. **The rule.**

> **5.12.4** **Resolving update.** A fork of a line is resolved by an update of the shared act: an act of the same line whose `previous`, or for Terms whose `replaces`, names the shared act; which names every tip in `resolves`, by the list of the tips' ids (§4.2, §4.3); and which names one of them in `continues`. It resolves the fork only when it is signed as an update of the shared act must be: for one signer's line, by that signer (§5.7); for Terms, so that the update condition of the shared Terms answers valid for it, which says who must sign it; by default, the known parties (5.5.5(a), 5.5.7(g)); or under a power to resolve (5.12.5). A resolving update of Terms that resolves is an update of the shared Terms and takes an update's answers: **valid**, by their update condition or its default, and **in force** once pinned (§5.5); one signed under a power to resolve is answered as 5.12.5 says. The tip it names in `continues` then counts as the next act of the line, what is built on that tip counts as these grammar rules read it, and the line goes on from that branch. Every other tip is **set aside**: it never counted as the next act of the line (for Terms, it never counted as the next version), and no act that follows it in the line counts. A resolving update is not a tip of the fork it resolves, and carries no words of its own: it carries only what §4.3 says it carries. An act that names `resolves` and no `continues` resolves nothing. An act that names `resolves` and does not in fact resolve the fork it sits in (it is not signed as this rule asks, or does not name every tip, or there is no fork: what it names in `resolves` is one update and no other) is an act like any other, and may itself be a tip: a fork is not hidden by adding the field. Where what it names in `resolves` are not the tips of a fork in its own line (for a Statement of kind `resolve`, its signer's line; for a Terms act, the agreement's chain), a verifier answers **not shown** for it as a resolving update, with the reason: nothing to resolve; where it fails otherwise, **not shown**, with the reason it fails (not signed as this rule asks, or not naming every tip). Where such an act names the shared act as the one before it, it is an update of that act beside the one it names, and the two are a fork. A resolving update MUST name every tip, and MAY name more acts than the tips. Where the two tips of a signer's line both name no `previous`, a resolving update that also names none resolves them. **After a fork is resolved.** An act that names the resolving update as the one before it (in `previous`, or for Terms in `replaces`) is read as following the last act of the continued branch. So the next act MAY name either. But two acts, one that names the resolving update and one that names the last act of the continued branch, are two updates of the same act, and a fork. For Terms the same holds: a version whose `replaces` names a resolving update replaces the last version of the continued branch, and the update condition asked of it is that version's (5.5.7(e)). These grammar rules give the form of a resolving update for a fork of a line only.

2. **What it replaces, and the code it meets.** G12.3, changed: the default signers are the known parties; `resolves` is the list of the tips' ids; a resolving update of Terms takes an update's answers; one that resolves nothing is **not shown**, with the reason [traced: the trace's row for 5.12.4]. The code: `core/src/agreements_new/grammar/order.rs:334`; a line's resolve, `core/src/agreements_new/grammar/order.rs:352`; the fall-through, `core/src/agreements_new/grammar/order.rs:355`, which for any act that is not a Terms act answers `core/src/agreements_new/grammar/order.rs:121`; Terms resolving updates checked at `core/src/agreements_new/grammar/chain.rs:697`, "no fork" at `core/src/agreements_new/grammar/chain.rs:700` [traced].

3. **What a verifier would answer differently.** In the round, the author of root `db3ce515…` signed `06b0f886…`, a Statement of kind resolve, naming in `resolves` two Terms acts, `5b9e8c91…` and `bba99964…` [traced: the round's answers, entry 571]. Those are not tips of a fork in that signer's own line. *Before:* `resolution`: **unchecked**, G4.8, "it resolves nothing, and is read as an act like any other (G12.3): not held (G9)" [traced: the round's answers, 1c, "`order.rs` line 355 falls through to `update`, which at line 121 answers **unchecked**"]. *After:* **not shown**, 5.12.4, "nothing to resolve" [traced: 5.12.4]. A Terms act shaped as a resolving update where there is no fork: *before*, its answer as an update; *after*, **not shown** as a resolving update, "nothing to resolve", beside its answer as an update [traced]. A fork of Terms resolved: *before*, `resolution` **shown**, G12.3 (case 22); *after*, on one reading, **valid** by the shared Terms' condition or its default, and **in force** once pinned [inferred; question below]. Carla filled a spot of the shared version and Ana and Ben, its known parties, sign the resolving update: *before*, not resolved (the default asked everyone who signed the shared version, Carla among them) [inferred, as the sheet of 26 November read `signed_by`, section 8]; *after*, resolved, **valid** by default [traced: 5.12.4, "by default, the known parties"].

4. **Size.** A word ("not shown, nothing to resolve" for the fall-through), and a rule (the default signers, and an update's answers for a resolving update of Terms).

5. **Vectors.** Changes answer, if read so: case 22 (a fork of Terms resolved by an update of the shared Terms that names every tip and the one that continues); renamed only on the other reading. Renamed only: case 23 (after the resolving update, the tip continued is in force); case 24 (the other tip is set aside: it never counted as the next version); case 26 (an act shaped as a resolving update where there is no fork is an update like any other: with the other, a fork); case 41 (a signer's fork resolved by that signer's resolving update: the line goes on from the tip continued); case 42 (after the resolution, the continued assent counts: the Terms are in force). New:
   - **A resolve in an unforked line** (26 November, line 6, (1); the round's `06b0f886…`): Ana's resolve names two Terms acts in `resolves`. `resolution`: **not shown**, 5.12.4, nothing to resolve.
   - **A Terms act shaped as a resolving update, no fork** (line 6, (2)): `resolution`: **not shown**, nothing to resolve, beside its answer as an update.
   - **A resolve in an unchecked line**: Ana's resolve names two acts in `resolves`, one of them not held. `resolution`: **unchecked** (the MOR lead's note, Q11).
   - **The known parties resolve**: version 1 names a role, which Carla fills; two version 2s fork; Ana and Ben sign the resolving update. `resolution`: **valid** by default, the known parties; `last_version`: the continued tip, in force once pinned.

6. **The build list and the sheet.** The resolve that resolves nothing (`order.rs:355`, G12.3): changed, toward the sheet's Q10 (A) and the round's Q3 (B), both "not shown" [traced: the settled note, M13, Q10, Q11, "A resolve that resolves nothing: "not shown, nothing to resolve". A resolve in a line that is itself unchecked: unchecked."]. The sheet's line 6 and its two new vectors fall here; its Q10 is settled (A) and its Q11 (A) by the MOR lead's note, though draft 26 does not write Q11's case [traced]. R8 (two versions by one author, one resolving act) stays a reading: §4.3 lets a Terms act written as a resolving update resolve "a fork in one signer's line" where that line forked in Terms acts, and does not say whether one act resolves both the signer's line and the chain [traced: §4.3]. R14 (the condition asked of a resolving update): draft 26 asks it, as the code does (5.5.7(g), session 1's) [traced].

7. **Choices the text leaves.**
- Asked `resolution` of a resolving update of Terms that resolves, is the answer **valid** and **in force** (5.12.4, "takes an update's answers") in place of today's **shown**? Case 22 moves if so.
- A resolve in one signer's line that resolves has no answer word in 5.12.4 (the draft's report, found items): **shown**, as today (cases 41, 43)?
- Must a resolving update itself be pinned (the draft's report, item 10; 5.12.4 writes "in force once pinned" for Terms)? For a resolve in a line, nothing says.

#### 5.12.5 A power to resolve

1. **The rule.**

> **5.12.5** **A power to resolve.** Terms MAY give, in advance, a power (§5.6) to sign the resolving update of a fork: an entry in `powers` whose rule (task K3) says who may sign it, and which resolving update it accepts. A resolving update signed under such a power carries the signatures 5.12.4 asks for, and resolves the fork as 5.12.4 says. For a fork of Terms, the power is read from the Terms both tips replace, which stay in force (5.5.4(e)); it is an entry of `powers` of kind `resolves`, and of no other kind. A power to resolve is part of the judicial: it is set in the Terms, and it is given, changed or removed only by an update the update condition answers valid, never by a power (5.6.5). For a fork in one signer's line too, it is an entry of `powers` of kind `resolves`, in Terms by which that signer is bound: a power to make that act for the signer (5.6.1(b)): the resolving update then stands in the line of whoever signed it, its `previous` is that signer's own, its `for` names the signer whose line forked, and it resolves by naming the tips. That resolving update is a Statement of kind `resolve` (§4.3): a power of kind `resolves` is for Statements of that kind in a signer's line, and for no Statement of another kind. How the fork is resolved is the power's rule's: it may accept only the resolving update it computes from the acts and the keepers' answers, whoever signs it, or accept the one a named person signs (a judge, named in those Terms: 5.6.5; §6), or anything else; these grammar rules force no single way. A verifier MUST report such a resolving update with the power it was signed under and whoever it rests on (5.6.1; the MICS, §2). Its answer about it is **shown**, naming this rule, the power and its rule's answer, and the signer: the update condition is not asked of it (5.5.7(g)), so it is neither valid nor not valid.

2. **What it replaces, and the code it meets.** G12.4, its history sentence moved to the companion [traced: the trace's row for 5.12.5]. The code: `core/src/agreements_new/grammar/line.rs:125` for lines; for Terms, `core/src/agreements_new/grammar/order.rs:341` [traced].

3. **What a verifier would answer differently.** Nothing: **shown**, naming the power and its signer, the condition not asked.

4. **Size.** None.

5. **Vectors.** Renamed only: case 28 (a fork resolved under a power to resolve given in advance: shown, naming G12.4, the power and its signer); case 43 (a signer's fork resolved by a resolve made for that signer under a power to resolve); case 44 (after a resolve under a power, the continued assent counts); in `valid.json`, the resolve made under a power of kind `resolves`. New: none.

6. **The build list and the sheet.** None.

7. **Choices the text leaves.** None new.

#### 5.12.6 What others relied on stands

1. **The rule.**

> **5.12.6** **What others relied on stands.** An act signed by someone who signed none of the acts of a branch whose tip is set aside, and that rests on an act of that branch (it names it, in `terms`, `under`, `answers` or `relies_on`, or was made within or under Terms of that branch), stands: it has the effect these grammar rules gave it, or would have given it had that tip stood alone. A payment that names a version of that branch as the one it read (5.13.2) is such an act. A verifier MUST show that act, and every answer resting on it, as **disputed**. "The acts of a branch" are the acts of the line: for Terms, the Terms acts; whoever signed one of them is not protected here for what they built on it. What stands differs by act. A payment that names a version of that branch is read as if the tip had stood alone: its receiver is read from that version (5.1.4), and both are shown as disputed. **As if the tip had stood alone** means: the line is read with every other tip of that fork, every act built on them, and the resolving update, left out. A version further along that branch is then a version where it would have been one, and a payment that names it is read against it. **A filling earned within that branch** by a proof made by someone who signed none of its Terms acts stands in the same way: it is shown as **disputed**, with the version of that branch it was earned under named; no version of the continued line is named as a later version that changes its rights (5.10.7). An assent, or another Statement made within that branch, by someone who signed none of its Terms acts, stands as an act, shown as disputed, and binds no one: the Terms it names never counted as a version, and an assent binds only while the Terms it names are in force (5.4.3).

2. **What it replaces, and the code it meets.** G12.5, unchanged but for references [traced: the trace's row for 5.12.6; the diff by the build script finds no change of words]. The code: `core/src/agreements_new/grammar/line.rs:255`; the payment's receiver from a set-aside branch, `core/src/agreements_new/grammar/receiver.rs:73`; the branch read as if alone, `core/src/agreements_new/grammar/chain.rs:453` [traced].

3. **What a verifier would answer differently.** Nothing.

4. **Size.** None.

5. **Vectors.** Renamed only: case 25 (a payment that names a version of a branch set aside stands: its receiver read from that version, disputed). New: none.

6. **The build list and the sheet.** R16 (a payment naming a version further along a set-aside branch) stays as it was: the sentence it rests on is draft 25's [traced]. T3 ("Stopping without saying unchecked", `chain.rs` `as_if_alone`, 10,000 steps): draft 25's G9.2 ("It MUST NOT answer **not shown** or **invalid** because it stopped") has no general sentence in draft 26; only 5.1.4 says, for receivers, that a verifier that stops answers **unchecked** [traced: a search of draft 26 for "because it stopped" finds nothing]. T3 is changed: for `as_if_alone` and `line_end`, the text no longer says what a verifier that stops answers.

7. **Choices the text leaves.**
- A verifier that stops reading a branch as if alone (or a line's end) before it ends: **unchecked**, as G9.2 had it, or is that left to §3.6's "the verifier lacks something it needs"?

#### 5.12.7 A fork that stands

1. **The rule.**

> **5.12.7** A fork that no resolving update has resolved stands: of Terms, as 5.5.4 says; in one signer's line, as 5.7.2 says.

2. **What it replaces, and the code it meets.** G12.6, references moved [traced]. The code: the chain's end, `End::Fork`, read at `core/src/agreements_new/grammar/order.rs:113` [traced].

3. **What a verifier would answer differently.** Nothing.

4. **Size.** None.

5. **Vectors.** None under this number.

6. **The build list and the sheet.** None.

7. **Choices the text leaves.** None.

#### 5.12.8 Rival resolving updates

1. **The rule.**

> **5.12.8** **Rival resolving updates.** Two resolving updates of the same fork, each signed as 5.12.4 asks, that continue the same tip resolve it, and are no fork. A resolving update of a fork of Terms is an update of the shared Terms (5.5.7(g)): one that is shown, as 5.5.4 says, to have come after another had resolved the fork is a late update, and resolves nothing (5.5.4). Two that continue different tips are themselves a fork: two updates of the same shared act. Neither resolves the first fork while the other stands: every tip stays stopped (5.12.3), and the shared act stays the last act of the line that counts. That fork is resolved the same way: by a resolving update that names the two rival ones in `resolves` and one of them in `continues`, signed as 5.12.4 asks or under a power given in advance (5.12.5).

2. **What it replaces, and the code it meets.** G12.7, "one that the knots or an anchoring show came after" written "one that is shown, as 5.5.4 says" [traced: the trace's row for 5.12.8]. The code: `core/src/agreements_new/grammar/chain.rs:657` [traced].

3. **What a verifier would answer differently.** Only where a reader's anchoring would have shown a resolving update late: under draft 26 it does not (5.13.5) [inferred; counted under 5.13.5].

4. **Size.** A word.

5. **Vectors.** Renamed only: case 27 (two resolving updates that continue different tips: neither resolves the first fork while the other stands). New: none.

6. **The build list and the sheet.** None.

7. **Choices the text leaves.** None.

#### 5.12.9 A client's duty

1. **The rule.**

> **5.12.9** **A client's duty (client conformance).** A client that holds both tips of a fork MUST NOT show either tip, or anything built on either, as a resolved act: not as the next version, not as in force, not as that signer's latest act. It shows the fork as unresolved, until 5.12.4 resolves it. This is a duty of clients and not a grammar rule a verifier applies. No verifier can check it: what a client showed a person leaves no act. It is written here and nowhere else.

2. **What it replaces, and the code it meets.** G12.8, unchanged [traced]. The code: none; a client's duty, not a grammar rule.

3. **What a verifier would answer differently.** Nothing.

4. **Size.** None.

5. **Vectors.** None.

6. **The build list and the sheet.** None.

7. **Choices the text leaves.** None.

---

### 5.13 Knots: what an act names, and "shown after"

#### 5.13.1 What an act is read against

1. **The rule.**

> **5.13.1** **What an act is read against.** An act is read against the versions and acts it names, in any field that holds a fingerprint (`body`, `terms`, `under`, `replaces`, `agreement`, `previous`, `answers`, `resolves`, `continues`, `relies_on`, `settlement`, `envelope`, `envelope_at`, and any other), the body's field included. Each such naming is a knot (§3.4): any fingerprint in any field of any act the verifier holds, whatever layer either act belongs to. A verifier reads knots in fields, never in an act's content. A report is read in the same way, against the call and the acts it names (5.11.3). A version that replaces one an act names does not change what these grammar rules read that act as having done. Whether the act's signer is bound from then on is 5.4.3 and §5.6, unchanged.

2. **What it replaces, and the code it meets.** G13.1, changed on the lead's reading: any fingerprint in any field, the body's included, of any act of any layer, is a knot [traced: the trace's row for 5.13.1; the ledger, "Knots a cross acts by nature, and possibly cross layer."]. The code: `core/src/agreements_new/grammar/held.rs:140` lists the payload fields of Terms, Statements and reports, and no `body`: for Terms, from `core/src/agreements_new/grammar/held.rs:152` to `core/src/agreements_new/grammar/held.rs:159`; the one other layer read is Money's, `core/src/agreements_new/grammar/mod.rs:264` [traced]. The act format's `prev`, and the fields of a Text, Identity or Envelopes act, are not read.

3. **What a verifier would answer differently.** Ana's version 3 names version 1 in `replaces`, version 2 having already replaced it. Version 3's `relies_on` names Carla's witness act (an Identity act), whose own field names Ben's assent to version 2. *Before:* the witness act is no Agreements act; it is not read, and version 3 and version 2 are not ordered by it: **fork** or **unchecked** [inferred: `namings` reads Agreements payloads only]. *After:* version 3 is shown after Ben's assent through the witness act, and is **late**, as shown [inferred: 5.13.1 with 5.5.4(a)]. In the round, the two assents never lodged, `81374b4f…` and `b6c78860…`, stand before their voters' lineups in the voters' own sequences [traced: the round's answers, 1d]: under 5.13.1, read with §3.3's "A signer's acts across their whole life, by `prev`, are the layer below's (Envelopes, Identity); this text reads them", the sequence's `prev` would order them [inferred].

4. **Size.** A rule: the verifier holds acts of every layer it reads, decoded to their fields, and reads every fingerprint field of each.

5. **Vectors.** Renamed only: in `valid.json`, "statement: answers, relies_on and settlement" (tests G13.1, G13.2, G8.5). New:
   - **A late update shown by knots across layers** (27 November): version 3 names version 1, version 2 having replaced it; version 3's `relies_on` names an Identity witness act whose own field names Ben's assent to version 2. `update` of version 3: **late**, as shown.
   - **The body is a knot**: Ben's assent names version 2, whose `body` names Text act T. `order` of Ben's assent and T: **shown**, the assent after T.
   - **The act format's `prev`** (R25; the round's `81374b4f…`): Ana's assent, and her later act in another agreement that names the assent only by its sequence's `prev`. `order`: **shown** (question 8, (A)).

6. **The build list and the sheet.** R25 ("The act format's `prev` as a knot"): moves toward its "should" [inferred; question below]. The sheet's Q23 ("Is the body's naming of the Text act a knot?") is settled, yes: "the body's field included" [traced]. Q21 (a set's fingerprint a knot) is settled, no: §4.1, "it is no knot by itself" [traced; the set's form is session 3's]. The round's question Q4 (the act format's `prev`) is this rule's [traced: the round's answers, 1g]. The 27 November entries' vector *a late update shown by knots across layers* (the prompt's name) falls here; session 1 may meet it at 5.5.4(a).

7. **Choices the text leaves.**
- Is the act format's `prev` (the outer act's field, not the payload's) a "field of an act" in 5.13.1's sense?
- Which layers' acts must the verifier decode, to read their fields? A layer it does not decode: is its act "held" (a piece, read for nothing), or lacking?

*Check note (session 4).* The 27 November vector across layers is written by part 1 too, at 5.5.4(a), with a Money payment in place of a witness act; both are kept (section 4, lines 35, 36).

#### 5.13.2 An act names what it relied on

1. **The rule.**

> **5.13.2** **An act names what it relied on.** An act that relied on a version or an act, of its own agreement or of another, names it: a Statement in `relies_on` where no other field names it, a Terms act in `relies_on` (§5.2). A verifier MUST NOT read an act as having relied on a version or act it does not name. A payment to a work names the version of the work agreement it read; how a settlement carries that name is for the layer that gives the settlement (Money, §2).

2. **What it replaces, and the code it meets.** G13.2, unchanged but for references [traced]. The code: `relies_on` in `core/src/agreements_new/grammar/held.rs:140`; a payment's version and settlement in `core/src/agreements_new/grammar/mod.rs:264` [traced].

3. **What a verifier would answer differently.** Nothing.

4. **Size.** None.

5. **Vectors.** None under this number.

6. **The build list and the sheet.** The 27 November entry "rely is the solution to all acts someone has to rely on" asks nothing of the verifier (client conformance) [traced: the ledger, "nothing is added to Identity or Agreements."]. The vector *the words act voided and relied on* (the prompt's name) is left for session 1 (5.2.2).

7. **Choices the text leaves.** None.

#### 5.13.3 Shown after

1. **The rule.**

> **5.13.3** **Shown after.** Act B is shown after act A when the verifier holds a chain of acts, each naming the one before by fingerprint, from B back to A, or a keeper's record or an anchoring that places them so (5.13.5). Here an anchoring is one to the clock the Terms name, and a keeper's record is one of a keeper the Terms name. Any other anchoring or keeper is evidence a reader may show, labelled as that reader's: it never pins, and never makes an update late (5.5.3, 5.13.5). Knots between acts (a fingerprint of one act in a field of another) count wherever the verifier holds them. This is the one reading of "shown after" in this text, and every grammar rule that asks whether one act came after another reads it so: the pin (5.4.1, 5.5.1(b)), a counter signature (5.4.5), a late update (5.5.4), an act under a power whose Terms were replaced (5.6.4), and a signer's line (§5.7). It proves that B came after A, and nothing more: never that an act came before one that does not name it, and never that an act does not exist. Where the Terms name keepers, the order of the agreement's acts is theirs: only they pin (5.5.1(b)), and knots do not order the agreement's acts in their place; knots expose a keeper whose record contradicts them (5.8.4). **A missing act.** Where a chain of acts that could show B after A needs an act that is named in a field of an act held, and the verifier does not hold it, the answer is **unchecked** (§3.6): never a yes, and never a no. No grammar rule goes around it.

2. **What it replaces, and the code it meets.** New (N7), the one reading of "shown after" [traced: the trace's row for 5.13.3, "the one-line reading of "shown after" is the MOR lead's (item 28)"]. The code: what a verifier "knows", `core/src/agreements_new/grammar/mod.rs:282` (an Agreements act held, a piece, a payment or settlement, an act of the envelope's chain), and what is lacking, `core/src/agreements_new/grammar/mod.rs:292` (everything else named, and every act held and unreadable) [traced].

3. **What a verifier would answer differently.** Ana's work is a Text act, `eeb5cef3…` in the round, named in `relies_on` by her version 3 `bba99964…`, which names the root `db3ce515…` while version 2 `5b9e8c91…` has replaced it [traced: the round's answers, entry 571]. *Before:* with the Text act held as bytes, the checker rejects it as not this encoding, it is not "known", and `last_version` is **unchecked**, G4.8, "names an act this verifier does not hold" [traced: the round's answers, 1b, and the sheet of 26 November, section 1]. *After:* the Text act is held; it names nothing that could show version 3 earlier, and version 3 is **late**, as shown [inferred: 5.13.3, "named in a field of an act held, and the verifier does not hold it"]. Where the work is a private act held without its key: still **unchecked** [inferred: 5.7.1's reading of an act held and not opened].

4. **Size.** A rule: "known" becomes "held, of any layer"; what is lacking is what is named in a field of an act held and not held.

5. **Vectors.** None renamed under this number (case 31, which tests G4.7, keeps **unchecked**: its lacking act is named in `relies_on` and held as nothing, which 5.13.3 leaves unchecked; it is session 1's to count). New:
   - **A Text act held** (26 November, line 1, (1)): version 3 names version 1, its `relies_on` naming a Text act held beside it. `update` of version 3: **late**, as shown, where today **unchecked**.
   - **A piece declared** (line 1, (2)): the same, the work declared as a piece (a `pieces` field the vectors' format lacks). `update`: **late**, as shown.
   - **A private act without its key** (line 1, (3)): the same, `relies_on` naming a private act held without its key. `last_version`: **unchecked**.
   - **The words also relied on** (line 19, (2)): the same, the Text act named in version 2's `body` and in version 3's `relies_on`. `update` of version 3: **late**, as shown.

6. **The build list and the sheet.** R5 ("which lacking act might show it late") and the sheet's Q1 are settled toward (A): any act named in a field and not held is lacking [traced: the ledger, "a missing act named in a field leaves lateness unchecked"]. Q2 ("Is an act held of another specification known?") is settled (A): any act held, of any layer [traced: 5.13.1, 5.13.3]. The sheet's line 1 (three new vectors) and line 19's second new vector fall here.

7. **Choices the text leaves.**
- A piece held that is no act (a work given as bytes): is it "held" for 5.13.3? The vectors' file has no field for pieces today (the sheet of 26 November, line 1, new vector 2).

*Check note (session 4).* These four vectors of 26 November: line 1's three are written by part 1 too, at 5.5.4; line 19's second part 1 writes inside line 1's first (section 4, lines 30 to 33).

#### 5.13.4 Order from naming

1. **The rule.**

> **5.13.4** **Order from naming.** An act that names another, directly or through acts that name it, came after it. A verifier MAY give that order as **shown**, from the acts alone, with no keeper and no qualifier. Between two acts of which neither so names the other, no order is shown from the acts alone. **Before or after Terms came into force, from naming.** Where the Terms name no keeper: an act came after Terms came into force where the acts it is shown after are enough for those Terms to pass the gate and the pin (5.5.1), or, for a first version, to come into force and be pinned (5.4.1). It came before where, counting every act held but those shown after it, those Terms do not pass them. Otherwise no order between them is shown. **Per keeper**, the position at which Terms came into force is the first position at which, counting only the acts the keepers show at or before it, they pass the gate and the pin (5.4.1, 5.5.1, 5.6.4).

2. **What it replaces, and the code it meets.** G13.3, written on the gate and the pin, and scoped "Where the Terms name no keeper" [traced: the trace's row for 5.13.4]. The code: `core/src/agreements_new/grammar/order.rs:323`; before or after a replacement, `core/src/agreements_new/grammar/force.rs:182`, by citing at `core/src/agreements_new/grammar/force.rs:202` only where no place is named [traced].

3. **What a verifier would answer differently.** Ben's assent names Ana's Terms: shown after them, with no qualifier, as today. Whether an act came before Terms came into force now reads "pass the gate and the pin": the pin is session 1's (5.4.1, 5.5.1) [inferred].

4. **Size.** A word here; the gate and the pin are session 1's rules.

5. **Vectors.** Renamed only: case 3 (order from citing: B's assent names the Terms, and came after them); case 4 (order from citing: two assents that name nothing of each other: no order). New: none.

6. **The build list and the sheet.** None.

7. **Choices the text leaves.** None.

#### 5.13.5 Anchoring

1. **The rule.**

> **5.13.5** **Anchoring.** Whether anything is later than an act, and what time it was, are never shown by naming. For an agreement whose Terms in force name keepers, every reader takes "nothing later" from those keepers; for one whose Terms in force name a clock, every reader takes the time from that clock (5.8.5). A verifier MUST NOT give, per a reader's own anchoring, an answer that the keepers or the clock the agreement names give. An anchoring of the reader's own choosing, whether or not the agreement names any, gives an answer only as that reader's, named so: it never gives the Terms' own answer, never puts Terms in force, and never makes an update late (5.5.3, 5.8.5). Where the reader accepts an anchoring from which the verifier holds no answer, or holds two that contradict each other, every answer that rests on it is **unchecked** (§3.6), and not **as shown**. A verifier MUST give each such answer **per anchoring**, with the anchoring named (**per keeper** or **per clock** where it is one the Terms name), or **as shown**.

2. **What it replaces, and the code it meets.** G13.4, changed on the lead's reading: "Only where the agreement names none does each reader accept the anchoring it chooses" goes; a reader's own anchoring gives only that reader's answer [traced: the trace's row for 5.13.5]. The code: `core/src/agreements_new/grammar/mod.rs:252` to `core/src/agreements_new/grammar/mod.rs:256` make the reader's anchoring the Terms' scope; lateness by anchoring at `core/src/agreements_new/grammar/chain.rs:261` [traced].

3. **What a verifier would answer differently.** Ana's and Ben's Terms name no keeper and no clock; each has assented, and Dana accepts an anchoring that shows both assents. *Before (case 64):* **shown**, G4.6, **per anchoring**, Dana's anchoring named [traced: `cases.rs:1123`]. *After:* the Terms' own answer is **as shown**, from the acts; Dana's anchoring is shown beside it, labelled as hers, and never puts the Terms in force [traced: 5.13.5]. As shown, the word then rests on the pin by knots (5.4.1, session 1's): with no act of Ana's or Ben's shown after both assents, **not shown**, "no order is shown" [inferred: case 64 holds the root and the two assents only, `cases.rs:1111` to `cases.rs:1114`].

4. **Size.** A removal: the reader's anchoring stops being the Terms' scope (`scope_of`'s anchoring branch; lateness by anchoring), and becomes a second answer, the reader's, beside the Terms'.

5. **Vectors.** Changes answer: case 64 (no place named: in force per the anchoring the reader accepts, with it named). New:
   - **The reader's anchoring beside a keeper**: Terms naming keeper K, which shows the root and both assents; the reader accepts anchoring X, which shows neither assent. `in_force`: **shown**, per keeper; X's answer beside it, labelled as the reader's.
   - **No lateness by the reader's anchoring**: two versions 2 naming the root, nothing in the acts ordering them; the reader's anchoring puts one first. `last_version`: **fork**, as shown; the reader's order beside it, as hers.

6. **The build list and the sheet.** T6 ("Late Terms never read the reader's anchoring", `baker.rs`): its "should" (the reader's anchoring shows the Terms late) is now against draft 26, which never makes Terms late by a reader's anchoring; and G14.2 leaves for Envelopes. T6 is moot [traced: 5.13.5, "never makes an update late"]. The round's Q5 (does an assent the anchoring does not show count, per anchoring) is moot for the Terms' answer [inferred]. The MOR lead's settled note, M20 and F8: "A reader's chosen keeper or anchoring gives an answer only labelled as the reader's" [traced].

7. **Choices the text leaves.**
- Must a verifier still compute the reader's own answer and show it beside the Terms' ("named so"), or may it give the Terms' answer alone? The text says what the reader's answer is when given, not that it must be given.

*Check note (session 4).* **Disagreement.** Case 64 is changed here; part 1 retires it (5.5.3). This session does not choose (question 9).

### 6. Tasks handed to cMIPs

1. **The text.**

> The eight tasks (§3.1, **Task**) are listed here, each with its one question, what the cMIP in it accepts and produces, where these grammar rules use its output, and whom it makes you trust. A list field has one socket for each entry: each entry of `powers` is its own socket, and so is each role in `parties`. So an agreement may name many rules, and never two cMIPs in one socket. Every cMIP in a socket is also given its own parameters, the acts held, and the answers of the keepers and the clock the Terms name (§5.8); the column "Accepts" lists what it is given beyond those. A cMIP declares what it needs (a clock, a keeper); Terms that do not supply it are invalid (5.8.6). How a cMIP declares it is open (§7).
> | # | Task | The socket (field) | Its one question | Accepts | Produces | Where the output is used | Trust |
> |---|---|---|---|---|---|---|---|
> | K1 | Body | Terms: `body`, the cMIP beside the words | What do these words say? | the Text act `body` names, by its act id (5.2.2) | a reading for people, and any parts for machines that other cMIPs and these grammar rules read: among them the part each party is given (5.11.2), and whether what a filling gave still applies, with its ground (5.10.8). It gives nothing for the baker's rights: those are read from the envelope's chain (Envelopes, §2) | §5.2, 5.10.8, 5.11.2 | none: format only |
> | K2 | In force | Terms: `in_force` | Are the assents that put these Terms in force present? | the Terms that name it; it may ask whether an assent in a given name counts (5.4.1, 5.4.5, 5.1.2) | yes or no; the same output for the same inputs, for anyone | 5.4.1, for a first version; in an update, read for who fills a role, its answer on coming into force left unread (5.4.2, 5.2.3). Empty: the default of 5.4.1 | none: anyone can recompute |
> | K3 | Power | Terms: each entry of `powers` (its rule) | Does this act, of this power's kind, bind the parties: was it made by those who may? | the Terms that give the power; the act asked about (a Statement of that kind, or a resolving update); receivers for acts and what leg reports state (5.1.5) | yes or no. For kind `resolves`: who may sign the resolving update, and which one is accepted (5.12.5). There is no kind `replaces`: this socket is never asked about a replacing Terms act, and what is left of it for updates is nothing (5.6.2). It never answers about the Terms themselves (5.6.5) | 5.1.2, 5.6.1(b), 5.12.5. No entry: no power | none where the cMIP only computes; otherwise whoever its modules name (a judge, a teller) |
> | K4 | Update condition | Terms: `condition` | Can the agreement be updated like this? | the version the proposed update would replace (the original) and the proposed update, with the assents to it that count (5.5.7(a)). It is never asked about a filling (5.10.6) | valid or not valid, with its ground: an act, or a time per the clock the Terms name; who must sign the update is part of that one answer (5.5.5); the same output for the same inputs, for anyone | 5.5.1, 5.5.5, 5.5.7, 5.6.1(c), 5.12.4. Empty: the default, every known party (5.5.5(a), 5.5.7(e)) | none: anyone can recompute |
> | K5 | Spot | Terms: the cMIP of each role in `parties` | Who fills this spot, by which proof, and on whose word; and does it still take new identities? | the role (its kind and `what`) as the version in force states it; for a filling already earned, as the version its proof names states it (5.10.2) | each filling: the signer who fills it, the proof that earned it (the acts it rests on), and the version it was earned under (5.10.7); or none; whether the spot holds one filling or many (5.10.2); whether it still takes new identities, and why (5.10.5); for kind future, also what defines the participant (5.10.4) | §5.10, 5.1.4 | whoever the cMIP names as confirming: for done, a witness or the counterparty; for received, the previous holder; for holding, as its cMIP says; for fits, those who vouch; for future, as its cMIP says |
> | K6 | Control | Terms: `control` | Has what these Terms receive been passed on as they say? | an instruction, with the acts and the rule result behind it | the controller's signed evidence. Where the Terms that hold this task carry a call (5.11.2), a report answering it is a **leg report**. Beyond what every report carries, a leg report from the doer (the controller) states, with amounts: **what was received**, each amount with the act it came by (a settlement); **what was passed on**, each amount with to whom (a signer, or an agreement by its root) and the act it went by (a settlement); **the doer's own part**, where the doer is itself one to whom the leg's Terms give a part (a party who receives for the others): its amount, which is not a fee; **what was kept** (a fee); and, apart from both, **what is still owed**, each amount with to whom. A leg report from a receiving side (one to whom something was passed on; for an agreement, its receiver for the act, 5.11.2) confirms what it received, each amount with the act it came by. The confirmation of a buyer's payment, by the receiving side of that leg, is such a report: it answers the call the payment carries by default (5.11.7). Which of a doer's lines each receiving side receives is said by the cMIP in this socket (5.11.3). Each act so named is one of the acts the report relied on | §5.11. Empty: the task is still held where one party receives for the others (5.11.2); then what this row asks of a leg report is read with no cMIP (5.11.3) | hand (Control layer) |
> | K7 | Kind | Statement: `kind`, where it is a fingerprint | What does a Statement of this kind state, and which cMIPs read it? | the `kind` fingerprint, the Statement's `content` | the meaning of `content`, and how rules may read it | 5.6.1(b), with the power for that kind (K3) | none: definition only |
> | K8 | Data | Terms: `data` | May this reader read this report, or what it states, beyond its own leg? | the Terms that name it; the reader asked about, as the verifier is told (the MICS, §2); the report asked about: one of a leg carried out under those Terms, or that carries the data of people bound by them (5.11.5 says which Terms are asked); or, asked about silence, the call that no report answers (the MICS, §2) | yes or no, for that reader and that report, or that call, with its ground. What else the cMIP says (how a reader puts together the legs it may read, how far it follows, what a loop answers, which consent it asks) is its own, and is not read by these grammar rules (5.11.5) | 5.11.4, 5.11.5, 5.11.6, 5.11.7; the MICS (§2). Empty: no path beyond the leg | none where the cMIP only computes; otherwise whoever its modules name |
> A payment holds the task of paying, the Control task (K6), with the payer as its doer (5.11.7). Which field of a payment holds it, and what fills it, is the layer that holds value's to say (Money, §2).

2. **What it replaces, and the code it meets.** Draft 25's section 5, its K rows changed as the trace's rows K1 to K8 say [traced: the trace's rows K1 to K8; the row-by-row diff by the build script]. The code: `core/src/agreements_new/grammar/sockets.rs:49` (one question per task), `core/src/agreements_new/grammar/sockets.rs:98`, `core/src/agreements_new/grammar/sockets.rs:167` [traced].

3. **What a verifier would answer differently, task by task.**
- **K1.** It accepts the Text act `body` names, by its act id, where today the code hands it the Terms act, `core/src/agreements_new/grammar/sockets.rs:52`; its output gains whether what a filling gave still applies (5.10.8); "for a delegation" goes, `core/src/agreements_new/grammar/sockets.rs:122` (with build-list row D1, session 1's) [traced].
- **K2.** In an update, read for who fills a role only (5.4.2, session 1's) [traced].
- **K3.** References only [traced].
- **K4.** "It is never asked about a filling": `core/src/agreements_new/grammar/sockets.rs:67` goes (5.10.7). It accepts "the assents to it that count", where today it is also handed everyone who signed the original, `core/src/agreements_new/grammar/sockets.rs:64` (the sheet's Q16; session 1's 5.5.7). Its ground's time is per the clock the Terms name [traced].
- **K5.** For a filling already earned, the role as the version its proof names states it (5.10.2); today `core/src/agreements_new/grammar/sockets.rs:71` is always asked with the Terms in force [traced: `spots.rs:21`].
- **K6.** "Two reports that name the same settlement match where they state the same amount for it" goes for the MICS (5.11.4) [traced].
- **K7, K8.** References only [traced].
- **What a cMIP declares.** "A cMIP declares what it needs (a clock, a keeper); Terms that do not supply it are invalid (5.8.6)": the interface has no declaration (5.8.6) [traced].

4. **Size.** A field (K1's output part), a removal (K4's question about a filling; K1's delegation part, shared with session 1), and an interface part (what a cMIP declares).

5. **Vectors.** Changed: case 74's `stubs_asked` (counted under 5.10.7). New:
   - **A specification named by a stand-in** (27 November): Terms whose `condition` names a fingerprint that no text on MOR hashes to and no cMIP the verifier holds. `update`: **unchecked**, the cMIP lacking.

6. **The build list and the sheet.** D1 (K1's delegation) and D7 (K4 asked apart) as above. The sheet's Q24 ("Must the verifier hold the Text act of the words?") is settled (A), K1's [traced: "The verifier need not hold the words to answer the grammar's questions; K1 reads them."]. The 27 November entry "A specification is a Text act, named by its id" is a change to Development, queued behind draft 26 [traced: the ledger, "A change to the Development MIR, queued behind draft 26."]; draft 26 still names a cMIP by fingerprint (§3.1, **cMIP**), so a stand-in that names no published text is a cMIP the verifier lacks, **unchecked**, as today [inferred]. The vector of that entry is placed here; session 1 may meet it at 5.2.1.

7. **Choices the text leaves.**
- K1 accepts "the Text act `body` names": is the cMIP handed the Text act (which the verifier need not hold), or its act id?
- K5 for a filling already earned: is it asked of the version its proof names before the verifier knows the filling (the proof names the version), or asked of the Terms in force and then of each version a filling names?

*Check note (session 4).* The stand-in vector is written by part 1 too, at 5.2.1 (section 4, line 6). K4's `signed_original` is a removal here and a question in part 1 (Q13).

#### 6.1 Modules

1. **The text.**

> A cMIP in a socket may use modules to give its answer. A module is a kind of answer, not a task: no field of an act names it; the cMIP in a socket does (§3.1, **Module**). Each says whom an answer makes you trust, and a verifier reports that with every answer (the MICS, §2).
> | Module | What it answers | Whom it makes you trust |
> |---|---|---|
> | **Rule** | what follows from these acts: yes or no, a list of who, or amounts; the same output for the same inputs, for anyone | none: anyone can recompute |
> | **Identity** | who is behind this signer: signed statements by those who vouch | a witness (Sign layer) |
> | **Assurance** | what was done to make it likely that a party was able, free and understood: signed statements of what was done; never a pass | a witness |
> | **Witness** | what happened in the world: each named witness's signed statement | the witness |
> | **Tally** | what a vote decided, without showing who voted how: the result, with whatever proof the method allows | the teller |
> | **Delivery** | whether an act reached a person: the recipient's signed acknowledgment, or the Deliver layer's evidence | the recipient, or the Deliver layer |
> | **Judge** | what the named judge decided, given the Terms (with `authors`, 5.3.2) and the acts of the dispute: a signed decision, which binds only through a power (K3, §5.6). The judge is named in the Terms, by the cMIP in a socket or its parameters, and is changed only by an update, never by a power (5.6.5) | the judge |
> Two more things answer questions and are not sockets of an act.
> - **The keeper** (`keeper`) and **the clock** (`clock`) are named by Terms by an identifier, not as cMIPs. Their answers are another layer's (§5.8), and are given to every cMIP in a socket. Whether a clock is itself a module under a cMIP of another layer is that layer's to say.
> - **Standing**: what one signer's acts show about them, to anyone who looks. A reader chooses the cMIP; no act names it, so it is no task of an act. It computes from signed acts and keepers' answers only, qualified per keeper or as shown; anyone can recompute it, and nobody keeps it.

2. **What it replaces, and the code it meets.** Draft 25's section 5.3, its history and "Was" column moved to the companion [traced: the trace's row "6.1 Modules"]. The code: none; no field of an act names a module, and the verifier reports what a socket's cMIP says (`Said`, `CmipNamed`) [traced: who said what is carried by `core/src/agreements_new/grammar/answer.rs:124`, and a socket's cMIP by `core/src/agreements_new/grammar/answer.rs:179`; no type names a module].

3. **What a verifier would answer differently.** Nothing.

4. **Size.** None.

5. **Vectors.** None.

6. **The build list and the sheet.** None.

7. **Choices the text leaves.** None for the verifier.

---

### The build list's translation errors, and the resolve that resolves nothing

| Row | What it is | Under draft 26 | Whose rule |
|---|---|---|---|
| T1 | A fork after Terms are in force takes them out of force | **kept**: 5.12.3 keeps "Terms that were in force before a fork was made stay in force"; 5.7.2 narrows what a forked assent stops to "any update's gate" | this part (5.12.3, 5.7.2) |
| T2 | An agent cannot take back the assent it made | for session 1 (5.4.5) | session 1 |
| T3 | Stopping without saying unchecked | **changed**: G9.2's general sentence is not in draft 26; only 5.1.4 says it, for receivers | this part (5.12.6) and session 1 (5.1.4) |
| T4 | "Built on a tip" follows every field | **kept**: 5.12.3 and §3.3 keep the four fields | this part (5.12.3) |
| T5 | A12 with a place: the first withdrawal by id | for session 1 (5.4.5) | session 1 |
| T6 | Late Terms never read the reader's anchoring | **moot**: a reader's anchoring never makes Terms late (5.13.5), and G14.2 leaves for Envelopes | this part (5.13.5) |
| T7 | "Everyone who signed" through a version that never replaced | for session 1 (5.5.5(a): the default signers are the known parties) | session 1 |
| `order.rs:355` | The resolve that resolves nothing falls through to `update` and answers **unchecked** | **changed**: **not shown**, "nothing to resolve" (5.12.4) | this part (5.12.4) |

The marks: T1, T3, T4 traced to draft 26's sentences; T6 traced to 5.13.5; the sessions' split inferred from the rule numbers.

### 3.2 Part 3: encoding 3, the E-rules

### Today's answers

`cargo test -p mor-core --locked` at `f1a13feb`: 34 test runs, 570 tests passed, 0 failed, 1 ignored; the two vector suites `tests/agreements_new_vectors.rs` and `tests/agreements_new_grammar_vectors.rs` among them [counted: the log's "test result" lines, summed]. Every change below is read or inferred, not run: no encoding 3 code exists to run (encoding 3, E24: "none is yet written for encoding 3, and this text changes no code").

`valid.json` holds 44 cases and `invalid.json` 116, 160 in all [counted, `count.py`].

**Two things that touch nearly every vector.**

- **As bytes, 153 of the 160 change answer to "not this encoding".** Every case whose act reaches the spec hash check (check.rs:145) carries draft 25's spec hash, which encoding 3 answers "not this encoding" (E2: "An act under any other spec hash is **not this encoding**"). The seven that stop before it keep their answers: invalid cases 0 to 4 and 6 (Envelopes rules 1, 3, 5 and 10), and case 5, already "not this encoding" [counted, `count.py`]. Read this way the files are simply encoding 2's, and stay where they are, as encoding 2 says of encoding 1's.
- **Regenerated, most keep their answer.** The useful reading, used for every count below: the same payloads, written again under `SPEC_DRAFT_26` by the generator (`core/examples/support/agreements_new.rs`), re-sealed and re-signed with the same fixed inputs [inferred: the generator writes every act from the library's constants]. Then only the cases named in section A change answer.
- **Rule names.** The checker names grammar rules by draft 25's numbers (G2.1 and so on, e.g. terms.rs:546). Under draft 26 each has a new number: G1.4 is 5.1.4; G2.1 is 5.2.1; G2.2 is 5.2.3; G3.1 is 5.3.1; G4.2 is 5.4.2; G5.2 is 5.2.3; G6.1 is 5.7.1; G10.1 is 5.10.1; G10.4 is 5.10.4; G12.3 is 5.12.4 [traced: encoding 3, section 4's lists and section 9, step 7]. 28 cases name one of these as their rule or in their notes [counted, `count.py`]: 20 invalid, 8 passing with notes. Their verdict stays; the word in `rule` or `notes` changes. That is counted apart from "change answer" below.

---

### A. The E-rules

One section per E-rule, in encoding 3's order: E1 to E20 (with the set of acts after E5), the report's section (E21 and E22 gone), then E23, E25 and E24, as encoding 3 places them, and section 9, the checker's order. Code lines are at `f1a13feb`; each was checked to exist (`cites.py`).

#### E1. An everyday act

**The rule** (encoding 3): "Every act of this encoding is an everyday act of the act format in force". Its sequence sentence now adds: "whatever specification they are under (a Text act carrying words included)".

**Replaces**: E1 of encoding 2, the same rule; the Text act is named [traced].

**The code it meets**: check.rs:165 (no signer, E1), check.rs:171 (the signature over the act id), check.rs:194 (a scheme not implemented: unknown), check.rs:213 to 218 (`prev` present, one entry at most). The act format reads `prev` at act.rs:104 and act.rs:551 [traced].

**What the checker answers differently**: nothing. *Plain words:* Ana signs a Text act with her words, then the Terms. The Terms' `prev` names the Text act, since both are in her one sequence. The checker already checks only that `prev` is present and has at most one entry. Example: a Terms act with `prev` naming her Text act passes, as it would today [inferred: check.rs:214 to 216 test only the count].

**Size**: none (a word in a comment).

**Vectors**: none change, none retired, none new.

#### E2. Spec hash and type

**The rule**: "Terms | draft 26's, `SPEC_DRAFT_26` | 0"; "Statement | draft 26's, `SPEC_DRAFT_26` | 1"; "Under `SPEC_DRAFT_26`, a type other than 0 or 1 is rejected. An act under any other spec hash is **not this encoding**." And of the report: "this checker answers a report **not this encoding**."

**Replaces**: E2 of encoding 2, whose table had a third row, the report under `SPEC_REPORT_BLOCK_4` [traced].

**The code it meets**: mod.rs:53 (`SPEC_DRAFT_25`), mod.rs:59 (`SPEC_REPORT_BLOCK_4`), mod.rs:62 to 69 (the types, `REPORT` among them), check.rs:145 to 164 (the match on spec and type, the report's arms at check.rs:148 and check.rs:152), the test mod.rs:363 to 367 recomputing both hashes from their files [traced].

**What the checker answers differently.** *Plain words:* an act under draft 25's hash was "this encoding"; now it is not. A report, which verifier 2 decoded and passed, is now "not this encoding": it is the MICS's act, with the MICS's bytes. Example: a report under the report block's hash, type 0, `{0: [h'…']}`: today **pass** (valid case 36); under encoding 3 **not this encoding**, E2.

*Precisely*: one constant replaced, one removed; the report arms go; `Decoded::Report` goes (check.rs:58, check.rs:178, check.rs:187, check.rs:203). `SPEC_DRAFT_26` recomputed by `spechash.py` from the file on the branch, by encoding 3's recipe (`tagged_hash("MOR/spec", {0 => 4, 9 => text})`, one final line break removed): `e9e5b6837c10fd310157cc2a620ba268e3c3684efdb0e3ba68af068701e0e214`, as encoding 3 gives; plain SHA-256 `6ee29fc27844908b7a29205ddabcf3d704dc343bbc41bacf7a326980f315d541`, as given; 428 lines, 146,051 bytes [counted]. The same script gives draft 25's hash as mod.rs:53 has it, so the recipe is the core's [counted].

**Size**: a value (the constant) and a removal (the report's row).

**Vectors.** Change answer: invalid case 8 ("type 1 under the report block's spec hash"): **rejected** E2 today, **not this encoding** E2 under encoding 3 (or retired, the case no longer testing a type rule). Retired: valid cases 34, 35, 36 (reports passing) and invalid cases 103 to 111 (reports rejected under E4, E18, E21, E22): 12 [traced to the files' names and answers]. Kept, answer the same once regenerated: invalid case 7 (type 2 under the Agreements spec hash: rejected, E2). New, none written:
- an act under `SPEC_DRAFT_25`, its payload a valid Terms act of encoding 2: **not this encoding**, E2;
- a report under `SPEC_REPORT_BLOCK_4`, valid under encoding 2's E21: **not this encoding**, E2.

*Watch:* wave four has the scribe carry the five answers of 27 November into draft 26 ("the scribe carries the five answers into draft 26 and closes its list"): one changed byte of the file is a new `SPEC_DRAFT_26`, and encoding 3's E2 must then be given again [inferred: the file at `d4373f0` was committed at 14:58, before the answers of 16:40 to 16:53].

#### E3. No `objects`, no `acks`

**The rule**: "An act of this encoding MUST NOT carry `objects` or `acks` in its inside; one that does is rejected."

**Replaces**: E3, the same; draft 26 cited [traced].

**The code it meets**: check.rs:219 to 224 [traced].

**What the checker answers differently**: nothing. Example: a Terms act with `acks: [h'…']` in its inside is **rejected**, E3, as today.

**Size**: none.

**Vectors**: invalid cases 12 and 13 keep their answers. None retired, none new.

#### E4. A closed map

**The rule**: "Each payload, and every map within it (a role), is a closed map whose keys are the small unsigned integers its format lists. A key it does not list, or one that is not an unsigned integer, makes the act rejected."

**Replaces**: E4, the same [traced].

**The code it meets**: mod.rs:296 to 305 (`closed`), terms.rs:387, statement.rs:191, terms.rs:127 (a role) [traced].

**What the checker answers differently**: nothing for Terms and Statements. Example: Terms with key 20 are **rejected**, E4, as today.

**Size**: none.

**Vectors**: invalid cases 16, 17, 43 and 81 keep their answers; invalid case 103 (a report's key) retires with E2.

#### E5. A fingerprint

**The rule**: "A fingerprint ... is `hash`: a byte string of exactly 32 bytes." Its table changes: "the words (`body`'s first item) | the act id of the Text act that carries them (5.2.2) | as any act"; the row for the words by work hash goes; the rows for a report's lines go; a Text act and a payment join "an act".

**Replaces**: E5 of encoding 2, whose row read "the body's words | the work hash, `tagged_hash("MOR/work", words)` **[lead]**" [traced].

**The code it meets**: mod.rs:237 to 242 (`hash_of`), mod.rs:138 to 166 (`Named`, the three exceptions) [traced]. The checker never computes a work hash: no use of `hash::work` under `core/src/agreements_new/` [counted: `grep -rn 'work(' core/src/agreements_new` finds only `same_work`, an envelope's work, grammar/layers.rs:130].

**What the checker answers differently**: nothing from one act's bytes. *Plain words:* the 32 bytes in the body used to be the hash of loose words; now they are a Text act's id. Both are 32 bytes; the checker cannot tell them apart (encoding 3: "A verifier cannot tell two kinds of fingerprint apart by their bytes: the field says which it is."). Example: a body `[h'<32 bytes>', [h'<cmip>', null]]` passes alone, under either meaning.

**Size**: a row (what a fingerprint is of); no code.

**Vectors**: invalid cases 34, 35, 93, 95 and 97 keep their answers. The vectors' bodies are stand-ins, the SHA-256 of a label (the vectors' README: "Every identity, binding, cMIP, word, envelope, settlement and unit here is a stand-in") [traced]. Alone they still pass; held with other acts, see E25.

#### The set of acts (a row of E5, or E26)

**The rule** (new): "A set of acts is named by one value, computed from a list of act ids and never written as a list in its field". Its five steps: members are act ids; "sorted in the bytewise order of their 32 bytes, and an id that appears more than once is kept once"; "`tagged_hash(LABEL, members)`"; "The value is `hash`: 32 bytes, bare"; "The empty set has the label and no members". And: "This text gives no field the set form".

**Replaces**: new. The sheet of 26 November, line 16, gave it as "a new value form", "one row of encoding 2's E5 table or one new E-rule" [traced].

**The code it meets**: none [traced: the sheet of 26 November says the same, "No code in `core/src/agreements_new/` computes a fingerprint of a set of acts"; checked again at `f1a13feb`]. The core has the parts: `tagged_hash_parts` (hash.rs:45) hashes parts joined, the shape reading (a) of the joining needs.

**What the checker answers differently**: nothing, since no field holds a set's value. *Plain words:* Ana, Ben and Carla name exactly three acts as one fingerprint; anyone who has the three ids recomputes it and gets the same 32 bytes. The checker never meets one. Example: a Statement with a set's value in `relies_on` passes, and the value is read as an act id not held (encoding 3: "where one stands in a field that holds act ids (an entry of `relies_on`, say), it is read as an act id, which no act held has").

**Size**: a new value form: one recipe, one label, one function in the library.

**Vectors**: none change, none retired. New (a recipe file, ids in and value out, as the sheet of 26 November proposed), none written:
- two ids, given in either order: one value;
- one id given twice: the same value as once;
- one id: a value that is not the id;
- the empty set: the label over no members (its bytes wait on item 2 of part B);
- a Statement with a set's value in `relies_on`, nothing else held: **pass**, no note (read as an act id; item 4 of part B).

#### E6. An identifier

**The rule**: "**E6. An identifier** ... of a keeper or of a clock is `hash`. Anything else is rejected, under E6." The keeper's preimage is open; the clock's 32 bytes are kept, **[lead]**, and whether key 9 stands is open.

**Replaces**: E6 of encoding 2, "**E6. An identifier** of a place or a clock is `hash`" [traced].

**The code it meets**: terms.rs:492 (key 8, "the place's identifier", E6), terms.rs:493 (key 9), terms.rs:261 and terms.rs:286 (`place`, `PLACE`) [traced].

**What the checker answers differently**: for one entry, nothing: a keeper is 32 bytes, as a place was. What changes is key 8's form, under E19's map below. Example: key 8 holding the text `"relay.example"` is **rejected**, E6, today and under both readings of its form.

**Size**: a word (place to keeper); the form is E19's.

**Vectors**: invalid case 36 ("a place that is not an identifier", key 8 a text string) keeps its answer under both readings [counted: `facts.py`, key 8 is a 16-character string]. New: see E19.

#### E7. A socket

**The rule**: "socket = [ cmip: any, params: any ]   ; exactly two items", "An **empty socket is the field left out**".

**Replaces**: E7, the same; the defaults cited to 5.4.1, 5.5.5(a), 5.11.2 [traced].

**The code it meets**: mod.rs:168 to 194 [traced].

**What the checker answers differently**: nothing. Example: `in_force: 7` is **rejected**, E7, as today.

**Size**: none. **Vectors**: invalid cases 37, 38 and 44 keep their answers.

#### E8. The body

**The rule**: "body = [ words: any, socket ]   ; words: the Text act's act id (E5)". "The checker reads no words: what `words` names is tested only among the acts held (E25)."

**Replaces**: E8, the same bytes; `words` is now an act id [traced].

**The code it meets**: terms.rs:407 to 412 (decoding), terms.rs:549 to 553 (words or socket not a fingerprint: G2.1) [traced].

**What the checker answers differently**: alone, only the rule's number (G2.1 becomes 5.2.1). Example: a body `["https://example.org", [h'…', null]]` is **invalid**, 5.2.1 (today G2.1).

**Size**: a word (the rule's number).

**Vectors**: invalid case 39 keeps its answer; invalid cases 65 and 66 keep their verdict, their rule renamed.

#### E9. A party

**The rule**: "party = [0, signer: hash] ... / [1, role] ... / [2, root: hash]". "Anything else is rejected, under E9".

**Replaces**: E9, the same [traced]. **The code it meets**: terms.rs:145 to 157 [traced].

**What the checker answers differently**: nothing. Example: `[0, "A"]` is **rejected**, E9, as today. **Size**: none. **Vectors**: invalid cases 40 and 41 keep their answers.

#### E10. A role

**The rule**: the role map `{ ? 0 => any, ? 1 => any, ? 2 => socket }`, "each makes the Terms invalid (5.10.1)", "A `what` on a role of kind 4 is left unread (5.10.4)."

**Replaces**: E10, the same bytes, numbers renamed [traced]. **The code it meets**: terms.rs:123 to 133 (decoding), terms.rs:566 to 596 (the role's cases), terms.rs:578 to 581 (the note) [traced].

**What the checker answers differently**: only rule numbers (G10.1 is 5.10.1, G10.4 is 5.10.4, a spot's cMIP G2.1 is 5.2.1). Example: a role `{0: 0, 2: [h'…', null]}` with no `what` is **invalid**, 5.10.1.

**Size**: a word. **Vectors**: invalid case 42 keeps its answer; invalid cases 69 and 73 to 79 keep their verdict, rule renamed; valid case 6 keeps its pass, its note renamed.

#### E11. In whose name

**The rule**: "who = [0, signer: hash] / [2, root: hash]". It no longer serves a report's line [traced: encoding 3, section 12].

**The code it meets**: mod.rs:196 to 229 (`Who`), used also by report.rs [traced].

**What the checker answers differently**: nothing for a Statement. Example: `for: [1, {…}]` is **rejected**, E11, as today. **Size**: a removal (the report's use goes with E22). **Vectors**: invalid case 92 keeps its answer.

#### E12. The receiver

**The rule**: "receiver = [0, position: uint] ... / [2, root: hash]"; "A position that names a party named as an agreement is **rejected**"; a position beyond the list is "**not shown** (5.1.4 ...); the checker gives it as a note."

**Replaces**: E12, the same [traced]. **The code it meets**: terms.rs:434 to 446, terms.rs:531 to 535, terms.rs:615 to 622 [traced].

**What the checker answers differently**: only the note's number (G1.4 is 5.1.4). Example: `receiver: [0, 7]` with one party: **pass**, note 5.1.4.

**Size**: a word. **Vectors**: invalid cases 45 to 50 keep their answers; valid case 10 its pass, note renamed.

#### E13. Authors

**The rule**: "authors = [+ uint]"; "A position beyond the list, or one naming a party named by role or as an agreement, makes the Terms **invalid** (5.3.1: "an author is never a party named by role, and never one named as an agreement")."

**Replaces**: E13 of encoding 2, whose invalid case was only "A position beyond the list, or naming a party named as an agreement" [traced].

**The code it meets**: terms.rs:399 to 406 (decoding), terms.rs:600 to 609 (the case: beyond the list, or an agreement; a role falls to `_ => {}` and passes) [traced].

**What the checker answers differently.** *Plain words:* draft 25 let an author be a role (a spot for someone not yet known); draft 26 does not: an author is a known signer (5.3.1). Example: parties `[[1, {0: 0, 1: h'…', 2: [h'…', null]}]]`, authors `[0]`, `in_force` present: today **pass** (valid case 7); under encoding 3 **invalid**, 5.3.1.

**Size**: a rule (one more invalid case).

**Vectors.** Change answer: valid case 7 ("no party named as a signer, an author named by role"), **pass** to **invalid** 5.3.1; valid case 1 ("every optional field"), whose author at position 2 names a role, **pass** to **invalid** 5.3.1, unless key 8 rejects it first (E19 below) [counted: `facts.py`]. Invalid cases 43 and 44 also name a role as author, but are rejected before the grammar (E4, E7): unchanged. Invalid cases 70 and 71 keep their verdict, rule renamed. Valid case 7 is then retired as a passing case (its name says it tests that an author may be a role). New:
- an author naming a role, `in_force` present: **invalid**, 5.3.1;
- a passing Terms act with no party named as a signer cannot be written any more, since its author must be a signer [inferred from 5.3.1 and E19's required `authors`].

*Not in encoding 3, and in the ledger since 16:50:* "a Terms act whose `authors` leaves its signer out is invalid" (the MOR lead's arrived-at line, "to check", on his "Absolutely. The person publishing the act is by default an author, the rest adds signature later"). Neither draft 26 at `d4373f0` nor encoding 3 says it [counted: no such sentence in either file]. If draft 26 takes it, the checker compares the outside's signer (act.rs:81) with the identity hashes of the parties `authors` names, and three of today's passing Terms acts change: valid case 7 (already invalid above), valid case 12 ("a second version of the same Terms, by another signer"), and the third act held in valid case 43, not the case's answer [counted: `facts.py`]. See the questions at the end.

*Check note (session 4).* Part 1 counts `valid.json` 7 only under 5.3.1, not case 1; see the note at 5.3.1.

#### E14. A power

**The rule**: "power = [ kind: 0 / 1 / 2 / 3 / 4 / hash, rule: socket ]"; kind 4 "gives no power and is left unread (a note), not rejected".

**Replaces**: E14, the same [traced]. **The code it meets**: terms.rs:199 to 214, terms.rs:420 to 433, terms.rs:560 to 565 [traced].

**What the checker answers differently**: the note's number (G5.2 is 5.2.3). Example: `powers: [[4, [h'…', null]]]`: **pass**, note 5.2.3.

**Size**: a word. **Vectors**: invalid cases 54 to 57 keep their answers; invalid case 68 its verdict, rule renamed; valid cases 19 (note renamed) and 20 unchanged.

#### E15. A Statement's kind

**The rule**: "kind = 0 / 1 / 2 / 3 / [ cmip: hash, params: any ]".

**Replaces**: E15, the same [traced]. **The code it meets**: statement.rs:54 to 66 [traced].

**What the checker answers differently**: nothing. Example: `kind: 4` is **rejected**, E15. **Size**: none. **Vectors**: invalid cases 86 and 87 keep their answers.

#### E16. A call

**The rule**: "call = [ task: 1..8, from: 0 / 1 / 2 ]"; "**One call per task**"; "these bytes are encoding 2's, kept until the MICS gives a call's bytes".

**Replaces**: E16, the same bytes; the report's naming of the payer's call goes [traced].

**The code it meets**: terms.rs:447 to 477 [traced].

**What the checker answers differently**: nothing. Example: two calls for task 6 are **rejected**, E16. **Size**: none now; a value form later, when the MICS gives a call's bytes (part C). **Vectors**: invalid cases 58 to 60 and valid case 14 keep their answers.

#### E17. `previous`

**The rule**: "previous = [] / [hash]   ; [] for none: the signer's first act in this agreement".

**Replaces**: E17, the same [traced]. **The code it meets**: mod.rs:315 to 327 [traced].

**What the checker answers differently**: nothing. Example: `previous: [h'…', h'…']` is **rejected**, E17. **Size**: none. **Vectors**: invalid cases 19 and 20 keep their answers.

#### E18. Lists

**The rule**: "**No empty list.** ... absent means none (no power, no call, no keeper, nothing relied on)"; "**Sets are sorted.** `authors`, `relies_on`, `powers`, `calls`, `answers` and `resolves` are sets"; "**The keeper field.** **Open**: whether its list ... is a set, sorted and each keeper once, as the lists above; or keeps the writer's order, as `parties` does."

**Replaces**: E18 of encoding 2, which listed "a report's `relies_on`" among the sets and "a report's `lines`" beside `parties` [traced].

**The code it meets**: mod.rs:251 to 259 (`list_of`), mod.rs:263 to 274 (`check_set`), mod.rs:278 to 285 (`check_distinct`) [traced].

**What the checker answers differently**: for every list verifier 2 has, nothing. The keeper list is new (E19 below). Example: `authors: [1, 0]` is **rejected**, E18, as today.

**Size**: a removal (a report's two lists) and, with the keeper, a field.

**Vectors**: invalid cases 52, 53, 57, 61 to 64 and 94 keep their answers; invalid cases 107 and 108 (a report's lists) retire with E2. New: see E19.

#### E19. Presence, and the Terms map

**The rule**: key 8 becomes "keeper: one keeper or several, by identifier (E6); its form is open"; the two readings "keeper = [+ hash]" and "keeper = hash / [2* hash]"; a resolving update carries no `keeper` or `clock` (it "carries **nothing else**"); case 4 "in every Terms act that carries `parties`, an update included"; a new note: "`in_force` in a Terms act that carries `replaces`, its answer on coming into force left unread, still read for who fills a role (5.2.3, 5.4.2)"; "A Terms act with no `replaces` is read as a first Terms act".

**Replaces**: E19 of encoding 2 and its map, key 8 "place, by identifier" [traced].

**The code it meets**: terms.rs:478 to 536 (presence), terms.rs:492 (key 8), terms.rs:518 (a resolving update's allowed keys: anything else, a keeper and a clock among them, already rejected), terms.rs:597 to 599 (G4.2, already read whether or not `replaces` is present), terms.rs:610 to 625 (the notes; none for `in_force` on an update) [traced].

**What the checker answers differently.**

*Key 8, plain words:* Terms may now name two keepers or more. If one keeper is always written as a list of one (reading (i)), the bare 32 bytes verifier 2 writes for its place are refused. If one keeper is written bare and several as a list (reading (ii)), today's bytes pass, and a list of one keeper is refused. Example: Terms with `8: h'<32 bytes>'`: under (i) **rejected**, E6 (the rule that gives key 8's form, encoding 3: "E6 for a keeper and a clock (key 8's form, section 4, under whichever reading is taken)"); under (ii) **pass**.

*The note, plain words:* an update that carries `in_force` passes, with a note that its answer on coming into force is not read there. Example: Terms with `0: h'…'`, `1: h'…'`, `6: [h'…', null]` and the required fields: today **pass**, no note; under encoding 3 **pass**, note 5.2.3.

*Precisely*: key 8 needs a new parser, `list_of` and `hash_of` per entry under (i), or a match on bytes or array of two or more under (ii); whether `check_set` applies waits on item 6 of part B. The note is one more push in `Terms::grammar`. Case 8 (5.8.6) is not given (section 9).

**Size**: a field (key 8's form) and a rule (the note).

**Vectors.** Change answer: valid case 1 (key 8 bare 32 bytes [counted, `facts.py`]): under (i) **rejected** E6; under (ii) its answer turns on E13 (**invalid** 5.3.1). No passing vector carries `in_force` with `replaces` [counted, `facts.py`: only invalid case 32, rejected first under E19], so none gains the note. Invalid cases 18 and 21 to 33 keep their answers. New, none written:
- one keeper, in the form chosen: **pass**;
- one keeper in the other form: **rejected**, E6;
- two keepers, sorted: **pass**;
- two keepers out of order: **rejected**, E18 (if the list is a set) or **pass** (if not);
- the same keeper twice: **rejected**, E18;
- an empty keeper list: **rejected**, E18 (under (i); under (ii), E6 or E18, see part D);
- an entry of the keeper list not 32 bytes: **rejected**, E6;
- an update carrying `in_force`: **pass**, note 5.2.3;
- an update naming a role and carrying no `in_force`: **invalid**, 5.4.2;
- a resolving update carrying a keeper: **rejected**, E19;
- a resolving update carrying a clock: **rejected**, E19.

*Check note (session 4).* The keeper field is counted by part 2 too (5.8.1): one field. The note on an update's `in_force` is the checker's twin of part 1's 5.2.3 vector (section 4, lines 10 and 87).

#### E20. Presence in a Statement

**The rule**: "`agreement`, `terms`, `kind` and `previous` are required."; "`for` and `under` are written together, or neither."; "**A resolve** (kind 3) carries `resolves` and `continues`".

**Replaces**: E20, the same; `resolves` written as "the list of the tips' ids" [traced].

**The code it meets**: statement.rs:189 to 231 [traced].

**What the checker answers differently**: nothing. Example: an assent with `content` is **rejected**, E20. **Size**: none. **Vectors**: invalid cases 82 to 85, 88 to 91, 96 and 98 to 102 keep their answers; valid cases 22 to 33 their passes (case 31's note renamed).

#### Section 6: the report (E21 and E22 gone)

**The rule**: "A report is the MICS's act type, defined once, in the MICS's report block"; "This text gives a report no bytes"; "E21 and E22 (the report and its lines) are gone, and their numbers are not given again".

**Replaces**: E21 (the report) and E22 (lines) of encoding 2 [traced].

**The code it meets**: report.rs, all 201 lines (`Report`, `CallRef`, `Line`, `Amount`); mod.rs:44 (their export); check.rs:148, check.rs:152 to 154, check.rs:178, check.rs:187, check.rs:203 to 205; held.rs:98 to 103 and held.rs:172 to 184 (the grammar side reads reports, for sessions 1 and 2) [traced].

**What the checker answers differently**: a report is **not this encoding** (E2). Example: valid case 35 ("a doer's leg report, every kind of line"): **pass** today; **not this encoding** under encoding 3.

**Size**: a removal: two rules, one file.

**Vectors**: retired, with E2's count: valid 34 to 36, invalid 103 to 111. Invalid case 114 ("previous names a report") keeps its verdict, **invalid** (its rule renamed 5.7.1): the report held is now an act of another specification, which 5.7.1 also makes invalid; its name should say so [inferred: check.rs:254 to 255 gives the reason "an act that is no Terms act and no Statement" for any act not decoded as one].

#### E23. `previous` among the acts held

**The rule**: "**The same agreement.** An act is within the agreement its `agreement` field names"; the first Terms act "is within the agreement it is the root of: its own act id"; "Otherwise the act is **invalid** (5.7.1): `previous` names an act of another signer, an act within another agreement, a report, a payment, an act of another specification (a Text act among them), or an act held that is **rejected**".

**Replaces**: E23 of encoding 2, the same test, with a payment and a Text act named [traced].

**The code it meets**: check.rs:228 to 276 (`check_held`), check.rs:112 to 118 (the agreement an act is within), check.rs:238 (an act that is no Terms act and no Statement) [traced].

**What the checker answers differently**: only the rule's number (G6.1 is 5.7.1). *Plain words:* Ana's assent names, as her previous act in the agreement, the Text act with her words. That is an act of another layer, so the assent is invalid. Verifier 2 already says so: a Text act is "not this encoding", and anything not decoded as Terms or a Statement makes the act invalid. Example: Text act T (Ana), then Ana's assent with `previous: [T]`: **invalid**, 5.7.1, today (as G6.1) and under encoding 3 [inferred from check.rs:238 and check.rs:254].

**Size**: a word.

**Vectors**: valid cases 37 to 43 keep their passes (39 and 40 their notes renamed); invalid cases 112 to 115 their verdicts, rule renamed. New:
- `previous` names a Text act held: **invalid**, 5.7.1;
- `previous` names a Money act held (a payment): **invalid**, 5.7.1.

#### E25. The act `body` names (new)

**The rule**: "Where the act it names is held, opens, and is a **Text act**, nothing is found."; "Where the act it names is held, opens, and is not a Text act ... the Terms are **invalid**"; held and not opened: "the Terms are **not invalid**", note or nothing **open**; not held: "the Terms are not invalid. **Open**"; "**Open**: which spec hashes are `TEXT`". A Text act is "an act under Text's spec hash, `TEXT`, of type 0, whose payload is as Text's Part three gives it".

**Replaces**: new [traced: encoding 3, section 12: "**E25.** New"].

**The code it meets**: none in `check_held` (check.rs:228 to 276 reads only `previous`). The core has a Text act's format check, `text::check_act` (text.rs:245 to 290, type 0 at text.rs:233), written to Text draft 8 (its comment: "Text draft 8, part three"), and no constant for Text's spec hash: the identity chain is handed one by its caller (chain.rs:631 to 645, `never_ack_specs`) [traced]. On the grammar side, held.rs:41 and held.rs:71 to 74 keep "pieces that are no acts (the words of a body ...)", and `namings` leaves the body out (held.rs:137 to 139: "The words of a body and a cMIP are not acts"); under draft 26 the words are an act and the body is a knot (5.13.1 lists `body`), for sessions 1 and 2 [traced].

**What the checker answers differently.** *Plain words:* handed the Terms with other acts, the checker looks for the act whose id the body carries. If it is a Text act, fine. If it is something else (a Statement, a payment, a Text-spec act of the wrong type), the Terms are invalid: they have no words. If the act is missing, or private and locked, the Terms still count; whether the checker says “I could not check that” is open. Example: Ana's Terms with `body: [S, [h'…', null]]`, handed with S, which is Ana's assent (a Statement): today **pass**; under encoding 3 **invalid**, 5.2.2.

*Precisely*: the checker needs (1) `TEXT`, one hash or several (item 10 of part B), (2) Text's payload format for the draft or drafts taken, (3) a test inserted in case 2's place: after every 5.2.1 finding and before case 3 (section 9, step 7, its first item). Today `check_held` appends its one held case at the end and sets `rule` only where the act was not already invalid (check.rs:264 to 270); for E25, where the act already shows case 3 to 5, the first-named rule must change to 5.2.2.

**Size**: a rule, and a constant (or a list) from another layer.

**Vectors**: none change: every held case's answer is about its last act, and no held case ends with a Terms act that has a body [counted: `dump.py`, the last acts of valid cases 37 to 43 are Statements or a resolving update]. New, none written:
- Terms, with the Text act its body names held and public: **pass**;
- Terms, with the act its body names held, a Statement: **invalid**, 5.2.2;
- Terms, with the act named held, under `TEXT`, type 1: **invalid**, 5.2.2;
- Terms, with the act named held, under `TEXT`, type 0, field 0 a byte string: **invalid**, 5.2.2;
- Terms, with the Text act named held, private, without its key: **pass**, a note or none (item 9);
- Terms, with another act held but not the one named: **pass**, a note or none (item 9);
- Terms with a role lacking its kind, and the act named held, a Statement: **invalid**, `invalid` [5.2.2, 5.10.1], `rule` 5.2.2 (the order);
- Terms naming a Text act made under an earlier Text draft's spec hash: **pass** or **invalid**, 5.2.2 (item 10).

*Check note (session 4).* Part 1's 5.2.2 vectors tell the same stories as two of these (section 4, lines 7 and 92, 8 and 93).

#### E24. One signing

**The rule**: "Statements whose payloads have the same bytes under the keys 0 (`agreement`), 1 (`terms`), 2 (`kind`), 3 (`content`), 4 (`for`), 5 (`under`), 9 (`settlement`), 10 (`resolves`) and 11 (`continues`)".

**Replaces**: E24, the same; its building paragraph now says no code is written for encoding 3 [traced].

**The code it meets**: statement.rs:115 to 125 (`ONE_SIGNING`), statement.rs:249 to 253 (`one_signing`) [traced].

**What the checker answers differently**: nothing. **Size**: none. **Vectors**: none (no vector tests it alone).

#### Section 9: the checker's order

**The rule**: step 7, "**Invalid** (draft 26, §4.4, cases 2 to 8)": case 2 (5.2.1, then 5.2.2 with several acts), case 3 (roles), case 4 (5.4.2), case 5 (5.3.1), case 6 (5.7.1), case 7 "not given", case 8 "**open**". Step 6 reads "E4 to E20".

**Replaces**: encoding 2's step 7, "in section 4's order, then G6.1" [traced].

**The code it meets**: terms.rs:541 to 627 (`Terms::grammar`: G2.1, the roles, G4.2, G3.1, in that order, which is cases 2, 3, 4 and 5), check.rs:184 to 193, check.rs:264 to 270 [traced].

**What the checker answers differently**: the order of the one-act cases is the same [traced: terms.rs:549 to 609 against §4.4]. The change is E25's place inside case 2, above. Case 8 is given by no checker under either reading until item 11 of part B is chosen.

**Size**: a rule (the place of E25). **Vectors**: invalid cases 79 and 80 keep their order, rules renamed.

---

## 4. The vectors, in one list

**In plain words.** Each line is one test case: the acts held, the question asked, and the answer before and after (or, for a new one, the answer it should give). None is written. The answers after are the parts' readings of the text, not runs: no code exists to run them [inferred, as each part marks it]. Grammar cases are named by their position in `grammar.json` (from 0), checker cases by their position in `valid.json` (V) or `invalid.json` (I). The part and rule each line comes from is given in brackets.

**Precisely, how this list was made.** This session took every vector line of the three parts' "Vectors" items by script (`newvec.py`: 127 lines; less part 1's eight lines that list changing cases and its four pointers, and part 3's one line that is a remark, not a vector), read them against each other, and merged those that are the same acts, question and answer, naming both parts [counted].

### 4.1 Today's vectors that change answer, on the text's plain reading

Grammar, by the first-version pin (5.4.1; part 1) [counted by part 1's `pin_count2.py`; the answers after inferred]: each holds Terms naming no keeper, assents, and no later act of each party naming every completing assent.

- G 1 (`in_force`): in force by the default, every signer assented: **shown** → **not shown**, no order shown.
- G 2 (`assent`): an assent counted, to Terms in force: **shown** → **not shown**, "not yet in force, no order being shown".
- G 5 (`in_force`): in force by an `in_force` stub asking one name: **shown** → **not shown**.
- G 10 (`last_version`): the last version, in force: **shown** → **not shown**.
- G 12 (`bound`): bound by an update without one's own assent, the condition answering valid: **shown** → **not shown**.
- G 14 (`in_force`): the original stays in force, the agreement going on in its last version: **shown** → **not shown**.
- G 26 (`last_version`): an act shaped as a resolving update with no fork: **fork** → **not shown** (no version in force).
- G 35 (`in_force`): a counter signature made after the Terms came into force: **shown** → **not shown**.
- G 46 (`in_force`): the act after an act not held still counts toward in force: **shown** → **not shown**.
- G 49 (`signature_of`): an agreement signs through a power its Terms give: **shown** → **not shown** (its Terms not pinned).
- G 50 (`in_force`): `in_force` asks for the agreement's signing, which it gave: **shown** → **not shown**.
- G 52 (`signature_of`): an agreement with no power signs by every signer: **shown** → **not shown**.
- G 53 (`in_force`): an agreement named as a party is not counted by default: **shown** → **not shown**.
- G 55 (`bound`): bound through a power: **shown** → **not shown**.
- G 56 (`bound`): bound by one's own assent: **shown** → **not shown**.
- G 67 (`receiver`): a receiver that is another agreement, followed to a party: **shown** → **not shown**.
- G 68 (`receiver`): a verifier that stops following receivers: **unchecked** → **not shown** (W's Terms not in force before the limit).
- G 91 (`before_paying`): which agreements of a sequence carry a call: **shown** → **not shown** (`legs.rs:341` reads the last version).
- G 102 (`in_force`): after a sale, Terms with the holder of the moment: **shown** → **not shown**. ⚑ It tests G14.2, one of the cases of G14 (4.3).

Grammar, by other rules:

- G 36 (`counter_signature`; 5.4.5, part 1): a counter signature and a completing assent, neither naming the other: **not shown** → **fork**.
- G 29 (`update`; 5.5.4(c), part 1): a late rival shown by knots: **shown** (G4.7) → **late**, as shown.
- G 65 (`update`; 5.5.4(c), part 1): a late rival shown by the place the original names: **shown**, per place → **late**, per keeper.
- G 64 (`in_force`; ⚑): no place named, the reader's anchoring: **shown**, per anchoring → **not shown**, as shown, by the pin (part 2, 5.13.5); or retired (part 1, 5.5.3).

Checker (regenerated under `SPEC_DRAFT_26`; part 3):

- V 7: Terms with no party named as a signer, an author named by role: **pass** → **invalid**, 5.3.1 (then retired as a passing case).
- V 1 (⚑, part 3 only): every optional field, an author at position 2 naming a role: **pass** → **invalid**, 5.3.1; or **rejected**, E6, under keeper reading (i) (key 8 bare).
- I 8: type 1 under the report block's spec hash: **rejected**, E2 → **not this encoding**, E2 (or retired).

As bytes, unchanged: 153 of the 160 checker cases answer **not this encoding** under encoding 3, since they carry draft 25's spec hash (part 3, "Today's answers") [counted by part 3]. Every other count here is of the cases regenerated.

Renamed only, answer kept: grammar cases throughout (part 2 counts 36 in its rules; part 1 renames every case), G 60 and 61 ("per place" → "per keeper"); 24 of `valid.json` and 11 of `invalid.json` by part 2's count, 28 checker cases by part 3's (20 invalid, 8 passing with notes) [counted by parts 2 and 3; the two counts are of different things: part 2 counts cases naming one of its rules, part 3 every case naming a draft 25 rule].

### 4.2 Today's vectors that change answer if a question goes one way

- G 8, 11 (`update`; Q4): valid by default, valid by a condition stub, their originals not pinned: **valid** → **not shown**, if "valid" is not answered of an update whose original is not in force.
- G 30 (`last_version`; Q3 (i)): after a late rival, the line goes on from the first update: **shown** → **not shown**, if an update's pin is its own knots only.
- G 31 (`last_version`; Q2 (B)): an update naming an act not held: **unchecked** → **not shown**.
- G 66, 76, 77 (`receiver`; Q6 (B)): the receiver from the version a payment names, not pinned: **shown** / **shown** / **unchecked** → **not shown**, if that version must have been in force.
- G 71, 72, 73, 75 (`fillings`, `takes_new`, `takes_new`, `receiver`; Q1 (B)): an offer's Terms not pinned if the pin must reach every counted assent: **shown** / **yes** / **no** / **shown** → **not shown**.
- G 95 (`contest`; part 2's reading of 5.11): a contest against an offer: **shown** → **not shown**, if a contest needs the version in force.
- G 22 (`resolution`; part 2's Q2 (A)): a fork of Terms resolved: **shown** → **valid**, and **in force** once pinned.
- V 12, ⚑ V 43, and 19 Terms acts in grammar cases 17 to 25, 27 to 30, 55 to 59 and 65 (Q5, the signer among the authors): Terms signed by someone their `authors` leave out: **pass** → **invalid** (V 12; part 1 also V 43, part 3 "the third act held ... not the case's answer"); the grammar cases' second tips become invalid, and what each case then answers is not read [counted by parts 1 and 3].

### 4.3 Today's vectors retired

- G 58 (`update`; 5.5.5, part 1): a delegation ended by the delegator alone, valid by default: G5.5 is gone (its bytes would answer **not shown**).
- G 64 (⚑; 5.5.3, part 1): the reader's anchoring giving the Terms' answer; or changed (part 2).
- G 74 (⚑; 5.4.3, part 1): a later version changing a filling's rights through a condition; or kept, **shown**, its name, sentence and K4 `stubs_asked` entry changed (part 2, 5.10.7).
- G 78, 80, 81, 82, 83, 86 (`leg`; 5.11.4, part 2): one leg's halves **matched**, **mismatched**, **one side only** (twice), each shown as stated, **no report called for**: the reading of leg reports goes to the MICS's report block.
- G 84, 85 (`silence`; 5.11.4, part 2): a call with no report: **unanswered**; read on behalf of no one: **not shown**. The same.
- G 92, 93, 94 (`buyer_leg`; 5.11.7, part 2): the payment and its confirmation **matched**, **mismatched**, **one side only**. The same.
- V 34, 35, 36 (E2 and section 6, part 3): three reports that pass: a report is the MICS's act, **not this encoding**.
- I 103 to 111 (E2, part 3): nine reports rejected under E4, E21, E18, E22: the same.
- **Placed by no part: the 15 cases of G14** (G 99 to 113: the baker at the cited act, a sale, a thief's Terms, a double sale, the same work baked again). Part 2: G14 "leaves for Envelopes with no rule of draft 26's 5.7 to 5.13 in its place", "for session 4 to place". This session does not place them: whether they retire with G14, move to Envelopes' vectors, or stay where draft 26 still reads an envelope (5.1.4's Envelopes' rules, 5.11.9, §4.4 case 7) is a question (section 10, question 11). Of them, part 1 counts G 102 as changing answer and G 106, 108 as unchanged.

### 4.4 New vectors, in draft 26's order, then encoding 3's

*(26 Nov, line n, k)* is the sheet of 26 November's line n, its k-th new vector; *(27 Nov: name)* one of the six entries the prompt names; *(27 Nov, after draft 26)* one from the ledger's entries of 27 November that came after draft 26 was written. "Both" marks a vector parts 1 and 2 each wrote, listed once here.

**5.1 An agreement as a party** (part 1)
1. 5.1.2: x's version 1 (Ana, Ben) gives Ben a power of kind `assent`; version 2 adds Carla, signed by Ana and Ben under a condition stub answering valid; both pinned; Ben assents for x to outside Terms, `under` version 2. `bound`, Carla: **not shown**; Ana: **shown**.
2. 5.1.2: the same, Carla's own assent to version 2 held. `bound`, Carla: **shown** (on Q14's lean).
3. 5.1.2 *(27 Nov, after draft 26: "The giver bears it, not the agent")*: Ben's assent for x. `bound`, Ben: **not shown** (made in another's name).
4. 5.1.4: a payment naming no version; Terms naming no keeper; the reader holds its own anchoring. `receiver`: **shown, as shown**; the reader's order, if given, labelled as the reader's.
5. 5.1.4: a payment naming no version; Terms naming two keepers that disagree on the last version. `receiver`: **not shown**, the keepers disagree.

**5.2 The words** (part 1; with part 2 for 1)
6. 5.2.1 and §6 *(27 Nov: a specification named by a stand-in; both)*: Terms whose `condition` names a fingerprint no text hashes to; no such cMIP held. `update`: **unchecked**, the cMIP lacking (5.5.7(h)); the Terms not invalid.
7. 5.2.2 *(26 Nov, line 19, 1)*: Terms whose `body` names a Text act handed beside them. The Terms **pass**; the Text act known, not lacking. (⚑ the same story as E25's first, line 92.)
8. 5.2.2: Terms whose `body` names a Statement held. **invalid**, 5.2.2. (⚑ the same story as E25's second, line 93.)
9. 5.2.2 *(27 Nov: the words act voided and relied on)*: Terms whose `body` names a Text act that its signer's key change has left out, a party's witness act relying on it. The Terms **pass** 5.2.2; the Text act held and readable, **disputed** in Identity's sense.
10. 5.2.3 *(26 Nov, line 18, 3)*: an update carrying its own `in_force`. `whole`: **shown**, "left unread: the answer of `in_force` on coming into force"; `update`: the gate's and the pin's answer alone. (Its checker twin is E19's note, line 87.)

**5.3 Authors** (part 1)
11. 5.3.1: Terms whose only author is a role. **invalid**, 5.3.1. (Its checker twin: E13's, line 84.)
12. 5.3.1 *(27 Nov, after draft 26, if written: the signer is an author)*: Terms signed by Ben whose `authors` names Ana only. **invalid**.

**5.4 The first version** (part 1; with part 2 for 17)
13. 5.4.1: Ana and Ben assent; nothing after. `in_force`: **not shown**, 5.4.1, no order shown.
14. 5.4.1: the same, Ana's later Statement naming both assents, Ben's none. `in_force`: **not shown** (one side pinned).
15. 5.4.1: the same, each with a later act naming both. `in_force`: **shown**, as shown.
16. 5.4.1: the same Terms naming one keeper that shows both assents. `in_force`: **shown**, per keeper, no later act.
17. 5.4.1 and 5.8.3 *(27 Nov: two keepers, one silent; both)*: Terms naming two keepers, one showing both assents, the other nothing. `in_force`: **not shown**, per keeper, on the ledger's line (part 1; part 2's question 1 (A)); **shown**, per keeper, on draft 26 as written (part 2, (B)).
18. 5.4.1: Ben's counter signature shown after both assents, naming them. `counter_signature`: **not shown** as cancelling (late); it pins Ben's side; with Ana's later act, `in_force`: **shown**.
19. 5.4.3 *(26 Nov, line 7, 1)*: Carla's assent earned a filling under version 2; version 3 in force; her role's K5 cMIP held. `assent`: **shown**, 5.4.3, version 2 named.
20. 5.4.3 *(26 Nov, line 7, 2)*: the same without the K5 cMIP. `assent`: **unchecked** (whether it earned a filling).
21. 5.4.3: Ben's assent as a known party to version 2; version 3 in force. `assent`: **not shown**, "they have been replaced".
22. 5.4.5 (build list T2): Gil assents for Ana under a power, then cancels it with no power of kind `counter_signature`, before Carla's completing assent, which names Gil's counter signature. `counter_signature`: **shown**, it cancels.
23. 5.4.5: two counter signatures in Ana's name, one by Ana, one by Gil under a power, nothing ordering them. The answer of Q9.
24. 5.4.5: Ana's counter signature shown after every completing assent, by knots. `counter_signature`: **not shown**, late; it pins Ana's side.
25. 5.4.5 (build list R12): an `in_force` stub asking two of three; a counter signature after the two. `counter_signature`: **not shown**, late.

**5.5 Updates** (part 1; with part 2 for 33 to 35, 41, 45)
26. 5.5.1 *(26 Nov, line 18, 1)*: version 2 valid by a condition, not in force by its own `in_force`, shown after version 1's acts. `update`: **valid**, and it replaces.
27. 5.5.1: the same, its assents naming nothing of version 1's. `update`: **valid**; `last_version`: version 1, version 2 **not shown** as in force, "no order is shown".
28. 5.5.1: two updates of version 1, both valid, one shown after version 1's acts, the other not. `last_version`: **fork**.
29. 5.5.3: the case 64 replaces: no keeper named; the reader's anchoring held. `in_force`: **shown, as shown**; the reader's answer beside it, named as the reader's.
30. 5.5.4 and 5.13.3 *(26 Nov, line 1, 1; both)*: version 3 names version 1, version 2 having replaced it; its `relies_on` names a Text act held beside it. `update`: **late**, as shown, where today **unchecked**. (Part 1 also counts line 19, 2 here; part 2 writes it apart, line 31.)
31. 5.13.3 *(26 Nov, line 19, 2; part 2)*: the same, the Text act named in version 2's `body` and in version 3's `relies_on`. `update`: **late**, as shown.
32. 5.5.4 and 5.13.3 *(26 Nov, line 1, 2; both)*: the same with the work declared as a piece (the grammar vectors' format needs a `pieces` field; the library has one, `scenario.rs:60`). `update`: **late**, as shown.
33. 5.5.4 and 5.13.3 *(26 Nov, line 1, 3; both)*: the same with a private act held without its key in `relies_on`. `last_version`: **unchecked**.
34. 5.5.4 *(26 Nov, line 18, 2)*: a late update shown by knots where the update that came first is valid and not in force by its own `in_force`. `update`: **late**, where today not shown late.
35. 5.5.4 *(27 Nov: a late update shown by knots across layers; part 1's acts)*: version 3's `relies_on` names a payment (Money) that names version 2 as the version it read. `update`: **late**, as shown.
36. 5.13.1 *(27 Nov: the same entry; part 2's acts)*: version 3's `relies_on` names an Identity witness act whose own field names Ben's assent to version 2. `update`: **late**, as shown.
37. 5.5.4: version 1 names a keeper whose record puts version 3 before Ana's assent to version 2, while version 3's `previous` names that assent. `update`: **not shown**, the keeper contradicts the acts, the record kept as evidence.
38. 5.5.5 *(26 Nov, line 8, 1)*: an offer with a filled role and no condition, updated by its maker alone, its only known party. `update`: **valid**, by default.
39. 5.5.5 *(26 Nov, line 8, 3)*: an offer whose K5 cMIP is lacking; an outsider's assent to the original held. `update`: **valid**, where today **unchecked**.
40. 5.5.5: Terms naming the co-op x as a party, x never having signed; updated by every signer. `update`: **not shown**, lacking x's signing (turns on Q7).
41. 5.5.5 *(27 Nov: the double assent, in order)*: Ben's two assents to two updates of one version, the second naming the first in `previous`. `update` of the second: shown after the first; the second **late** where Ben's first assent put the first through the gate.
42. 5.5.5 and 5.7.2 *(27 Nov: the double assent, forked; both)*: two assents of one signer (Ben in part 1, Ana in part 2), each to a different update of one version, both naming the same `previous`. `line`: **fork**, both tips shown; `update` of each: **not shown** as a replacement, by default, never **not valid**.
43. 5.5.5 *(27 Nov: two keepers, one silent, for an update)*: the original names two keepers; one shows the update and its assents, the other nothing. `update`: **not shown**, per keeper; where the two give contrary orders: **not shown**, the keepers disagree, both records kept.
44. 5.5.5 *(27 Nov, after draft 26: "The known parties of a version are the signers it names")*: version 2, signed by Ana and Ben, adds Hana as a signer; she assents; version 3 signed by Ana and Ben alone. `update`: **not shown**, lacking Hana's assent.
45. 5.5.7: a condition stub answering valid for version 2; version 1 in force; version 2 not yet shown after version 1's acts. `update`: **valid**, the condition named; **not shown** as in force.

**5.6 Who is bound** (part 1; with part 2 for 47)
46. 5.6.1 (build list R29): version 2, passed by a condition without Carla, gives Ben a power to assent for her; Ben assents for Carla. `bound`, Carla: **not shown**.
47. 5.6.1 and 5.10.6 *(26 Nov, line 8, 2; both)*: Carla filled a role under version 1; version 2 passed by a condition that answers valid without her. `bound`, Carla, by version 2: **not shown**.
48. 5.6.1 *(27 Nov, after draft 26: "The giver bears it, not the agent")*: Gil assents for Ana under a power she gave and signed. `bound`, Ana: **shown**, 5.6.1(b); Gil: **not shown**.
49. 5.6.4: version 1 names one keeper, which shows Gil's act before the position at which version 2 passes the gate and the pin. `bound`, Ana: **shown**, per keeper.
50. 5.6.4: the same with two keepers that disagree on the order. `bound`: **not shown**, the keepers disagree.
51. 5.6.6: Ana gave Gil a power by Terms naming no condition; Ana alone signs version 2, removing it. `update`: **not shown**, lacking Gil's assent; with Gil's assent held and the order shown: **valid**, and in force.

**5.7 A signer's own line** (part 2)
52. 5.7.2: line 42's Terms naming keeper K, which shows only the first assent. `line`: **fork**, as shown, whatever the keeper shows.

**5.8 The keeper, and the clock** (part 2)
53. 5.8.2: Terms naming keeper K, which shows the root and both assents; the reader accepts relay R, whose order puts Ben's assent first. `in_force`: **shown**, per keeper, K named; R's order only as the reader's.
54. 5.8.3: Terms naming K and M, each showing the root and both assents in order. `in_force`: **shown**, per keeper, K and M named.
55. 5.8.3: the same, M placing Ben's assent before the root. `in_force`: **not shown**, the keepers disagree, each one's records shown as evidence.
56. 5.8.4: Terms naming K; Ben's assent names Ana's in `relies_on`; K places Ben's first. `in_force`: **not shown**, the keeper contradicts the acts.
57. 5.8.5: version 1 names keeper K and a role Carla fills, K showing her proof; version 2, in force, names keeper M, which does not. `fillings`: **shown**, Carla, per keeper K.
58. 5.8.6: Terms whose `condition` is a stub declaring it needs a clock; no `clock`. Any question resting on them: **invalid**, 5.8.6.
59. 5.8.6: the same, naming a keeper and no clock. **invalid**, 5.8.6 ("A keeper is not a clock").
60. 5.8.6: the same, naming a clock. `update`: the condition's answer, its ground per clock.

**5.10 Spots, and the unknown party** (part 2)
61. 5.10.2 *(27 Nov: a filling under a dropped role)*: version 1 names a role at position 2, which Carla fills; version 2, valid and in force, names no role. `fillings`: **shown**, Carla, earned under version 1; `takes_new` under version 2: **not shown**.
62. 5.10.7 *(26 Nov, line 9)*: version 2 cuts Carla's share, under a condition that lets Ana and Ben change shares. `rights`: **shown**, no later version changes them; K4 not asked.
63. 5.10.7 *(26 Nov, line 10)*: version 2 assented by Carla in her own name. `rights`: **shown**, version 2 changes them as far as its words say.
64. 5.10.7: version 2 assented for Carla by Gil, under a power of kind `assent` in Terms she signed. `rights`: **shown**, version 2 changes them, the power and Gil named.
65. 5.10.7: version 2 names neither Carla nor her role; she assents to it. `rights`: **shown**, changed (part 2's question 6 (A)), or **shown**, unchanged (B).
66. 5.10.8: version 1 names a clock; a K1 stub answers that what Carla's filling gave still applies. The new question: **yes (the task's output)**, K1 named, per clock.
67. 5.10.8: the same, K1 answering no. **no (the task's output)**, per clock; never **triggered**.
68. 5.10.8: the same, the body's cMIP not held. **unchecked**.

**5.11 Legs** (part 2)
69. 5.11.9: envelope E baked by Ana, F of the same work by Ben; Ben's Terms name F; Ana's contest against them names E and the act of E's chain it relies on. `contest`: **shown**, 5.11.9, Ana read as the holder at the act cited.

**5.12 Forks** (part 2)
70. 5.12.3 (build list T1): Terms in force; Ben's next two acts both name his assent in `previous`. `in_force`: **shown**, they stay in force; `line`, Ben: **fork**.
71. 5.12.3 (build list T4): Ana's line forked; Carla's Statement names one tip only in `resolves`. `assent` of Carla's: it counts, not built on the tip.
72. 5.12.4 *(26 Nov, line 6, 1)*: Ana's resolve names two Terms acts in `resolves`, her line unforked (the round's `06b0f886…`). `resolution`: **not shown**, nothing to resolve.
73. 5.12.4 *(26 Nov, line 6, 2)*: a Terms act shaped as a resolving update, no fork. `resolution`: **not shown**, nothing to resolve, beside its answer as an update.
74. 5.12.4: Ana's resolve names two acts, one not held. `resolution`: **unchecked**.
75. 5.12.4: version 1 names a role Carla fills; two version 2s fork; Ana and Ben sign the resolving update. `resolution`: **valid**, by default; `last_version`: the continued tip, in force once pinned.

**5.13 Knots** (part 2)
76. 5.13.1: Ben's assent names version 2, whose `body` names Text act T. `order`: **shown**, the assent after T.
77. 5.13.1 (build list R25): Ana's assent, and her later act in another agreement naming it only by her sequence's `prev`. `order`: **shown** (part 2's question 8 (A)).
78. 5.13.5: Terms naming keeper K, which shows the root and both assents; the reader's anchoring X shows neither. `in_force`: **shown**, per keeper; X's answer beside it, as the reader's.
79. 5.13.5: two versions 2 naming the root, nothing ordering them; the reader's anchoring puts one first. `last_version`: **fork**, as shown; the reader's order beside it.

**Encoding 3** (part 3; checker files)
80. E2: an act under `SPEC_DRAFT_25`, its payload a valid Terms act of encoding 2: **not this encoding**, E2.
81. E2: a report under `SPEC_REPORT_BLOCK_4`, valid under encoding 2's E21: **not this encoding**, E2.
82. The set *(26 Nov, line 16, 1 to 4)*: a recipe file, ids in and value out: two ids in either order, one value; one id twice, the same value as once; one id, a value that is not the id; the empty set, the label over no members. (Four vectors.)
83. The set *(26 Nov, line 16, 5)*: a Statement with a set's value in `relies_on`, nothing else held: **pass**, no note.
84. E13: an author naming a role, `in_force` present: **invalid**, 5.3.1.
85. E19 (key 8, on items 5 and 6): one keeper in the form chosen: **pass**; in the other form: **rejected**, E6; two keepers sorted: **pass**; out of order: **rejected**, E18, or **pass**; the same keeper twice: **rejected**, E18; an empty list: **rejected**, E18 (or E6); an entry not 32 bytes: **rejected**, E6. (Seven vectors.)
86. E19: a resolving update carrying a keeper: **rejected**, E19; carrying a clock: **rejected**, E19. (Two vectors.)
87. E19: an update carrying `in_force`: **pass**, note 5.2.3.
88. E19: an update naming a role and carrying no `in_force`: **invalid**, 5.4.2.
89. E23: `previous` names a Text act held: **invalid**, 5.7.1.
90. E23: `previous` names a payment held: **invalid**, 5.7.1.
91. E25: Terms, with another act held but not the one `body` names: **pass**, a note or none (item 9).
92. E25: Terms, with the Text act their body names held and public: **pass**.
93. E25: Terms, with the act named held, a Statement: **invalid**, 5.2.2.
94. E25: the act named held under `TEXT`, type 1: **invalid**, 5.2.2; under `TEXT`, type 0, field 0 a byte string: **invalid**, 5.2.2. (Two vectors.)
95. E25: the Text act named held, private, without its key: **pass**, a note or none (item 9).
96. E25: a role lacking its kind, and the act named held a Statement: **invalid** [5.2.2, 5.10.1], `rule` 5.2.2.
97. E25: a Text act made under an earlier Text draft's spec hash: **pass** or **invalid**, 5.2.2 (item 10).

### 4.5 The 22 of 26 November, and the six of 27 November

**The 22**, by the sheet of 26 November's own count, all placed [counted]:

| Line | Its count | Where | Placed by |
|---|---|---|---|
| 1 | 3 | lines 30, 32, 33 | both parts (part 1 at 5.5.4, part 2 at 5.13.3) |
| 6 | 2 | lines 72, 73 | part 2 |
| 7 | 2 | lines 19, 20 | part 1 |
| 8 | 3 | lines 38, 47, 39 | part 1 (all three); part 2 the second, again |
| 9 | 1 | line 62 | part 2 |
| 10 | 1 | line 63 | part 2 |
| 16 | 5 | lines 82, 83 | part 3 |
| 18 | 3 | lines 26, 34, 10 | part 1 |
| 19 | 2 | lines 7, 31 | part 1 the first; the second by part 2 apart, by part 1 inside line 30 |

**The six the 27 November entries add**, all placed; **none is unplaced** [counted]:

| Entry | Where | Placed by |
|---|---|---|
| the double assent, in order | line 41 | part 1 |
| the double assent, forked | line 42 | both (part 1 at 5.5.5(a), part 2 at 5.7.2) |
| two keepers, one silent | lines 17 (in force) and 43 (an update) | line 17 by both (part 1 at 5.4.1, part 2 at 5.8.3); line 43 by part 1 |
| a filling under a dropped role | line 61 | part 2 |
| a specification named by a stand-in | line 6 | both (part 1 at 5.2.1, part 2 at §6) |
| a late update shown by knots across layers | lines 35 and 36 | part 1 with a payment, part 2 with a witness act: two vectors |
| the words act voided and relied on | line 9 | part 1 |

Part 1 adds four more from the entries of 27 November that came after draft 26 (lines 3, 12, 44, 48); they turn on rules draft 26 does not yet carry (Q5, Q7).

### 4.6 The count

97 numbered lines, of which four hold several vectors (82: four; 85: seven; 86: two; 94: two): **108 new vectors** once each, of which **79 grammar** (lines 1 to 79) and **29 checker** (lines 80 to 97) [counted from this list]. Before merging, the parts count 49 (part 1), 37 (part 2) and 29 (part 3), 115 in all; **seven are written by both parts 1 and 2** (lines 6, 17, 30, 32, 33, 42, 47) [counted]. Four pairs more tell the same story in the grammar's files and the checker's (lines 7 and 92, 8 and 93, 10 and 87, 11 and 84): counted here once in each file, so four fewer if each is written once. Line 31 is one fewer on part 1's reading (disagreement 7).

---

## 5. The twelve byte choices

*In plain words.* Encoding 3 leaves twelve things about the bytes open (its section 11, "Open in this text, not yet chosen"). Part 3 took each: the choice, the readings, what each costs, which makes two honest writers write the same bytes, and a proposal. Every proposal below is **part 3's**, labelled there "the session's proposal". Part 3's section B is carried over as it wrote it; its section D, a stranger's reading of encoding 3, follows it, since it is the evidence part 3 cites for items 1 to 7 and 9 to 10.

### B. The twelve byte choices

Encoding 3, section 11: "Open in this text, not yet chosen". Each item: the choice and where else it is open; the readings; what each costs; which makes two honest writers write the same bytes; **the session's proposal**. *Two honest writers* means two people who mean the same thing.

#### 1. The set's label

1. **The choice**: "The set's label." Also open in the trace (M8's "Open", 1: "the tag text for `tagged_hash`") and draft 26, §7 ("**The set of acts: its hash and its label** ... Fixed by the encoding (encoding 3)").
2. **Readings**: any tag string beginning `MOR/`, since Identity says "Every tag the core uses begins with `MOR/`" and lists them (Identity draft 16, "Encoding and conventions").
3. **Costs**: a verifier, one constant; a client, the same constant; a stranger, nothing to compute until the string is printed. Identity's list of tags must name it too [traced: Identity draft 16 lists every tag the core uses].
4. **Same bytes**: only a printed string does; until then every writer picks their own and every set has as many values as writers (the round's three readers, the ledger's "three honest readers turned one list of acts into different fingerprints").
5. **The session's proposal**: the tag `MOR/act-set`, listed in Identity's tags beside `MOR/act`. *Reason:* it names what it hashes, in the pattern of the core's tags (`MOR/act`, `MOR/mmr-leaf`), and no tag in use is a prefix trap for it.

#### 2. How a set's members are joined

1. **The choice**: "How a set's members are joined." Also: the trace, M8's "Open", 2; draft 26, §7, "**The empty set**" ("How its value is written").
2. **Readings**: (a) the sorted 32-byte ids concatenated, nothing between (the MOR lead's "joined"); (b) the deterministic CBOR array of the ids.
3. **Costs**: (a) a verifier calls `tagged_hash_parts` (hash.rs:45) with the ids; the empty set is the label over no bytes. A stranger might join with separators or hex text, as the round's readers did. (b) a verifier encodes an array first; the empty set is the label over the byte `80`. A stranger might write the ids as text, or as a map. Neither costs a client more than a line.
4. **Same bytes**: either, once chosen. Members are all exactly 32 bytes, so (a) has no ambiguity of where one ends; (b) adds a header that carries no information here.
5. **The session's proposal**: (a), concatenated. *Reason:* fixed-size members need no framing, it is the recipe as the MOR lead first set it out, and the core already hashes parts this way.

#### 3. Where the set's rule stands

1. **The choice**: "Whether the set's rule is a row of E5 or an E-rule of its own (E26)." Also: the trace, M8's "Open", 3; the sheet of 26 November, line 16 ("one row of encoding 2's E5 table or one new E-rule"). Not in draft 26, §7.
2. **Readings**: (i) a row of E5's table; (ii) E26.
3. **Costs**: no checker answer today, since no field holds one (item 4). If a field ever does, the rule a "rejected" answer names is E5 under (i), E26 under (ii) (the stranger's point 4, part D). A stranger looks for a recipe in E5's table of what each fingerprint is of under (i), in a rule of its own under (ii).
4. **Same bytes**: the bytes are the same under both; only a rule's name can differ.
5. **The session's proposal**: (ii), E26. *Reason:* the set is a computation in five steps, not a row of E5's table of what each fingerprint is of, and "One fault, one rule" then has one rule to name.

#### 4. Which fields may hold a set's value (for Nobody, allegedly, too)

1. **The choice**: "Which fields may hold a set's value (none in this text, as draft 26, §7, says)." Also: the trace, M8's "Open", 4, and "For the text", 1; draft 26, §7, "**Which fields take the set form** (§4.1). Whether any field of §4.2 or §4.3 holds a set of acts as one value; in this text none does."
2. **Readings**: (a) none: only a cMIP's own parameters hold one, read by that cMIP; (b) a field of Terms or a Statement takes the set form (draft 26, §4.1, names "a body's evidence" as one use).
3. **Costs**: (a) no code. But a writer who puts a set's value in `relies_on` writes 32 bytes the verifier reads as an act it does not hold: whatever rests on it is unchecked, "I don't know", never a yes, never a no (the grammar's `lacking_in`, grammar/mod.rs:292) [inferred]. (b) a field that says it holds a set: a new key, read as no knot; a verifier must know which fields hold sets; vectors for each.
4. **Same bytes**: (a) leaves room for two: one writer puts the set in `relies_on`, another in a cMIP's parameters. (b) gives one place, once the field is named.
5. **The session's proposal**: (a), none, as draft 26 says. *Reason:* it is draft 26's own reading, and a misplaced set fails safe, as "unchecked".

**Question for Nobody, allegedly** (plain words, for a phone):
> A group of acts can be named by one fingerprint. Should Terms or a Statement have a place for one? Today only a rule's own settings can hold it. If someone puts one where acts are named, the verifier sees an act it doesn't have, and answers "I don't know" for whatever rests on it.
>
> *The session's lean:* no place in Terms or Statements, for now; only a rule's settings.

#### 5. The keeper field's form

1. **The choice**: "The keeper field's form, for one keeper and for several." Also: the trace, M8's "Open", 5. Not in draft 26, §7; draft 26, §4.2, `keeper`: "one keeper or several, each by the identifier the layer that orders acts gives it".
2. **Readings**: (i) always a list, `[+ hash]`; (ii) `hash` for one, `[2* hash]` for several.
3. **Costs**: (i) a verifier parses one form; verifier 2's bare hash at key 8 is refused, so valid case 1 changes (E19). A stranger who writes one keeper as a list is right. (ii) two forms to parse and one more rejection (a list of one); today's bytes pass. A stranger who writes `[h]` for one keeper is refused.
4. **Same bytes**: both give one byte form per meaning, (ii) by refusing `[h]`. (i) leaves less to get wrong: the stranger saw the split exactly here (part D, point 5).
5. **The session's proposal**: (i), always a list. *Reason:* one form whatever the count; nothing to get wrong when a second keeper is added.

#### 6. Whether the keeper list is sorted

1. **The choice**: "Whether the keeper list is sorted." Also: the trace, M8's "Open", 6, and its blind reader ("whether two keepers written out of order are rejected (Open 6)").
2. **Readings**: (a) a set, sorted, each once (E18); (b) the writer's order, as `parties`.
3. **Costs**: (a) `check_set` (mod.rs:263), already written; a client sorts. (b) a duplicate check only; but the same two keepers have two byte forms, so two act ids for one meaning.
4. **Same bytes**: (a) does; (b) leaves room for two. Draft 26 gives keepers no order: 5.8.3 reads "where they agree", and the ledger: "If the terms stipulate two keepers, both keepers are needed."
5. **The session's proposal**: (a), sorted, each once. *Reason:* the order means nothing, so, as every such list in encoding 3, it is written in one order.

#### 7. What a keeper's identifier is the hash of

1. **The choice**: "What a keeper's identifier is the hash of." Also: the trace, M8's "Open", 7, and "For the text", 6 ("no layer gives one, so E6's keeper preimage cannot be fixed from the text"); draft 26, 5.8.1.
2. **Readings**: (a) the keeper's identity hash, as a signer is named; (b) opaque 32 bytes until the layer that orders acts gives keepers an identifier.
3. **Costs**: the byte checker answers the same under both (32 bytes). The grammar verifier, under (a), can tie a keeper's record to the keeper named, since a keeper lodges signed records (draft 26, §3.4, "**Keeper's record**"); under (b) it needs a table from elsewhere, as verifier 2's stand-in `places` (grammar/layers.rs:305). A stranger, under (b), does not know what to write.
4. **Same bytes**: (a) gives one value per keeper; (b) leaves it to each writer.
5. **The session's proposal**: (a), the identity hash, unless the layer that orders acts gives another before draft 26 is final. *Reason:* the keeper signs its records, and its identity is the one name the bytes can check.

#### 8. Whether key 9 stands as 32 bytes (for Nobody, allegedly, too)

1. **The choice**: "Whether key 9 stands as 32 bytes." Also: the trace, M8's "Open", 8; draft 26, §7, "**How Terms name their clock** ... What identifies a clock, and whether the `clock` field stands as written."; the MOR lead's note of 27 November: "**Back to him, if draft 26 meets them:** how Terms name their clock".
2. **Readings**: (a) keep key 9, 32 bytes, as encoding 2 had it; (b) a richer form now (a chain and a position, say); (c) no key 9 until a layer gives clocks.
3. **Costs**: (a) nothing changes; what the 32 bytes name is unknown, so each writer may mean something else by them. (b) a form nobody has defined yet. (c) valid case 1 (it carries key 9) is **rejected**, E4; and no Terms can name a clock, so every Terms act naming a cMIP that needs one is invalid (5.8.6), every time-limited sale with it: against "The clock specified in the agreement and its anchoring." [inferred].
4. **Same bytes**: (a) fixes the form, not the meaning; (c) fixes nothing to write.
5. **The session's proposal**: (a), keep key 9 as 32 bytes. *Reason:* Terms must be able to name their clock now, and a richer form later is a new specification, as encoding 2 said.

**Question for Nobody, allegedly**:
> Terms can name their clock today with a 32-byte name, though no text yet says what a clock is. Keep that field, or remove it until clocks exist? Removing it means no Terms could name a clock, so every sale "for a month" would be refused.
>
> *The session's lean:* keep it.

#### 9. A `words` act held without its key, or not held: a note or nothing (for Nobody, allegedly, too)

1. **The choice**: "Whether a `words` act held without its key, or not held, gives a note or nothing." Also: the trace, M8's "Open", 9, and "For the text", 4; the MOR lead's settled reading of Q24 and Q25: "The verifier need not hold the words to answer the grammar's questions; K1 reads them."
2. **Readings**: (a) a note: whether the act is a Text act is unchecked (as E23 gives for `previous`); (b) nothing: the grammar does not read the words.
3. **Costs**: (a) a verifier keeps which ids it holds (it does, for E23) and adds a note; every vector of Terms held with other acts but not their words carries it; a stranger must know when a lone act counts as "held" (part D, point 3). (b) no code; but a missing words act and a present one give the same output.
4. **Same bytes**: the bytes are not at stake, the answer is: two checkers that choose differently give different `notes`, so the vectors cannot be shared until it is chosen.
5. **The session's proposal**: (a), a note, and only when the checker is handed several acts, as E23's note is (check.rs:248). *Reason:* draft 26 answers **unchecked** where "the verifier lacks something it needs to apply a grammar rule: a cMIP the Terms name, or an act named in a field that it does not hold", and 5.2.2's test needs that act.

**Question for Nobody, allegedly**:
> Terms point to the act holding their words. If the verifier doesn't have that act, or can't open it, should it say “I couldn't check the words are a Text act”, or say nothing, since it never reads the words?
>
> *The session's lean:* say it, as "I don't know", when it is checking several acts together.

#### 10. Which spec hashes are `TEXT` (for Nobody, allegedly, too)

1. **The choice**: "Which spec hashes are `TEXT`." Also: the trace, M8's "Open", 10; draft 26, §2: "**Text, draft 11.** The Text act (rule 14), which carries the words of Terms." Text draft 11: "A text act is an Envelopes MIR act of `type` 0 under the hash of this MIR, written `TEXT`."
2. **Readings**: (a) Text draft 11's hash alone; (b) the hashes of every Text draft, listed in the encoding; (c) as (b), and an act under a spec hash the checker does not know at all gives a note, not invalid.
3. **Costs**: (a) one constant; words published under any other Text draft (earlier, or the frozen one) make the Terms invalid when held, so every new Text draft would need a new Agreements encoding. (b) a list, grown with each Text draft; each draft's payload format checked as that draft gives it (the core's `text::check_act` is draft 8's). (c) as (b), plus a third outcome; a checker that does not know a new Text draft does not call its words invalid.
4. **Same bytes**: the writer's bytes do not change; two checkers with different lists answer differently, invalid against pass, for the same acts.
5. **The session's proposal**: (b), every Text draft's hash, listed. *Reason:* the words are text whatever Text draft carried them, and invalid must not depend on when someone published.

**Question for Nobody, allegedly**:
> Terms point to the Text act holding their words. Text has had several drafts, each with its own fingerprint. Should only Text acts made under today's draft count as words, or Text acts of any draft?
>
> *The session's lean:* any Text draft, listed by name.

#### 11. Case 8: how a cMIP's declared needs are read, and by whom (for Nobody, allegedly, too)

1. **The choice**: "How a cMIP's declared needs are read, and by whom (case 8)." Also: the trace, M8's "Open", 11, and "For the text", 3; draft 26, §7, "**How a cMIP declares what it needs** (5.8.6, §6). Where, and in what form, a cMIP states that it needs a clock or a keeper."; the MOR lead's note (Q26): "What a cMIP declares it needs is part of its spec: a line for Development to carry."
2. **Readings**: (a) the checker is handed, beside the acts, what each cMIP declares it needs; (b) the case is the grammar verifier's, which holds the cMIPs.
3. **Costs**: (a) a new input to the checker; two checkers handed different tables answer differently for the same bytes; its vectors carry the table. (b) the byte checker never gives case 8; the grammar verifier gives **invalid** 5.8.6 where it holds the cMIP's text and **unchecked** where it lacks it. With the ledger's "A specification is a Text act, named by its id" (14:47 to 14:52), the declaration would be in an act a verifier can hold [inferred].
4. **Same bytes**: no byte of a Terms act is at stake; (a) lets the answer depend on the table each checker was handed.
5. **The session's proposal**: (b), the grammar verifier's. *Reason:* the need is in the cMIP's text, which the byte checker never reads.

**Question for Nobody, allegedly**:
> If Terms use a rule that needs a clock but name no clock, they are invalid. Where should the verifier learn that the rule needs a clock: from the rule's own published text, read by the full verifier, or from a list handed to the quick byte checker?
>
> *The session's lean:* from the rule's own text, the full verifier's job.

#### 12. `SPEC_DRAFT_26`

1. **The choice**: "`SPEC_DRAFT_26`: not a choice; computed by M11 once the text was final, and given in E2. *For the codemeister, who checks it.*" Also: the trace, M8's "Open", 12.
2. **Readings**: none.
3. **Checked**: recomputed by `spechash.py` from `draft-26.md` at `d4373f0`: `e9e5b6837c10fd310157cc2a620ba268e3c3684efdb0e3ba68af068701e0e214`, as E2 gives; the file's SHA-256 also as given [counted].
4. **Same bytes**: yes, for that file. Wave four changes the file, so the hash too (E2 above).
5. **The session's proposal**: recompute it once wave four's edits are in, and keep a test that recomputes it from the file, as mod.rs:363 to 367 does today. *Reason:* one changed byte is another specification.

---

### D. A stranger's reading

**What was done.** One subagent was given `encoding-3.md` alone (no draft 26, no code, no conversation, none of this file's proposals) and asked to write the bytes of one example of each new thing, using SHA-256 of test labels for every id, and to say where it could not tell. Its report is evidence of where the text is unclear, not a vote.

**Where it could not tell** (its words quoted where short):

1. **The set of acts**: the label ("No text gives its string") and the joining; it wrote both readings: (a) the two ids concatenated, 64 bytes; (b) `825820 … 5820 …`; the empty set "(a) the label over no bytes; (b) the label over `80`". Part B, items 1 and 2.
2. **Where the set's rule stands**: "The text says the bytes are the same either way, but it changes the rule a checker names for a fault." Part B, item 3.
3. **The keeper field**: one keeper `815820 …` under (i), `5820 …` under (ii), so a whole first Terms payload has "two different byte strings and two different act ids"; it called this "a real split, not just a matter of style". Part B, item 5.
4. **The keeper list's order**: its two test keepers happened to sort in the writer's order, "With other ids they would differ." Part B, item 6.
5. **A keeper's identifier**: "I used the test hashes as opaque values." Part B, item 7.
6. **The words, not held**: whether a note is given, and "it is also unclear whether that note applies to a single act at all": step 7 gives E25 only "with several acts", while step 8 lists E25's note among a pass's notes. Part B, item 9.
7. **A Text act**: "I cannot write or recognise a Text act's bytes from this text": `TEXT` and Text's payload are not in encoding 3. Part B, item 10; part C, item 6.
8. **What it must take elsewhere**: `tagged_hash` and deterministic CBOR (Identity), the act around the payload (Envelopes). Encoding 3 says so itself ("What these texts do not give").

**Where its bytes differ from what the text intends**: none it wrote where the text chooses. The body `825820 <words> 825820 <cmip> f6` (a socket with no parameters given `null`) is what E7 and E8 give; its Terms payload `{2: [[0, h'…']], 3: [0], 4: <body>, 8: <keeper>, 19: []}` is in the map's key order; its answers (pass alone; **invalid** 5.2.2 with a Statement held as the words; **pass**, not invalid, with the words private and no key) are E25's [inferred: read against E7, E8, E19, E25].

**Where it found the text saying two things**, each checked against the file:

1. Section 12 says of E2: "`SPEC_DRAFT_26` in place of `SPEC_DRAFT_25`, not yet computed", while E2 and section 11, item 12, give the hash. Checked: both sentences are there; the hash is given and right (part B, item 12) [traced].
2. E5 says "§4.1's three exceptions: E7, E8, E10, and an entry of `relies_on`", four things for three. Checked: the sentence is there; draft 26, §4.1, groups the body and a socket's cMIP as one exception [traced].
3. E25 only with several acts (step 7) against E25's note among a pass's notes (step 8): item 6 above [traced].
4. Key 8: the same act passes under one reading and is rejected under the other: item 3 above [traced].

One more, found by this session reading the stranger's empty keeper list: under reading (ii), `8: []` is neither `hash` nor `[2* hash]`, and "One fault, one rule" names both "E6 for a keeper and a clock (key 8's form ...)" and "E18 for a list's emptiness": two rules for one fault [inferred].

---

### The five for Nobody, allegedly, gathered

Encoding 3 marks five items "for Nobody, allegedly, too": those whose choice changes a verifier's answer. Each, as part 3 wrote it for a phone, with part 3's lean:

1. **Item 4, a place for a group of acts.** "A group of acts can be named by one fingerprint. Should Terms or a Statement have a place for one? Today only a rule's own settings can hold it. If someone puts one where acts are named, the verifier sees an act it doesn't have, and answers "I don't know" for whatever rests on it." *Part 3's lean:* no place in Terms or Statements, for now; only a rule's settings.
2. **Item 8, the clock's field.** "Terms can name their clock today with a 32-byte name, though no text yet says what a clock is. Keep that field, or remove it until clocks exist? Removing it means no Terms could name a clock, so every sale "for a month" would be refused." *Part 3's lean:* keep it.
3. **Item 9, the words not at hand.** "Terms point to the act holding their words. If the verifier doesn't have that act, or can't open it, should it say “I couldn't check the words are a Text act”, or say nothing, since it never reads the words?" *Part 3's lean:* say it, as "I don't know", when it is checking several acts together. (Part 1 asks the same of an act held and unreadable, its lean "unchecked": question 16.)
4. **Item 10, which Text drafts count.** "Terms point to the Text act holding their words. Text has had several drafts, each with its own fingerprint. Should only Text acts made under today's draft count as words, or Text acts of any draft?" *Part 3's lean:* any Text draft, listed by name.
5. **Item 11, where a rule says it needs a clock.** "If Terms use a rule that needs a clock but name no clock, they are invalid. Where should the verifier learn that the rule needs a clock: from the rule's own published text, read by the full verifier, or from a list handed to the quick byte checker?" *Part 3's lean:* from the rule's own text, the full verifier's job.

---

## 6. What draft 26 asks of the layers below

*Part 3's section C, carried over as it wrote it.*

One line each, for the MICS and Envelopes rewrites (and the other layers where they meet). Each: what verifier 2 reads today, what draft 26 says it needs, what the layer below must say.

1. **`prev`, the signer's one sequence.** Today: `inside.prev` (act.rs:104, read at act.rs:551; checked at check.rs:214 to 216). Draft 26, §2: "`prev`, the signer's line across all their acts". Below: Envelopes rule 13 already asks it of every everyday act, and Text draft 11, rule 14, of a Text act ("the everyday fields (`prev`, position and running summary, Envelopes rule 13)"); nothing more needed, save that the MICS's rewrite keep one sequence across specifications [traced].
2. **`objects`.** Today: refused on an Agreements act (check.rs:219 to 221). Draft 26, 5.13.1, reads every line from payload fields ("`body`, `terms`, `under`, `replaces`, `agreement`, `previous` ..."). Below: Envelopes must keep `objects` optional, so that an Agreements act carries none; Text draft 11, rule 14, lets a Text act carry one object under "Agreements rules 73 and 80" and "Agreements rule 58", draft 24's numbers, which draft 26 does not have: Text must say what those objects mean once Agreements is draft 26 [traced: Text draft 11, rule 14; inferred: the rule numbers are draft 24's].
3. **`acks`, and reliance.** Today: refused (check.rs:222 to 224). Draft 26, §2: "The witness act (rule 10), by which one identity relies on another's act; acts left out or disowned by a key change, and those kept because another relied on them (rule 34)." Below: Identity's witness act must be able to name a Text act and any Agreements act, and rule 34 keep what a witness act relies on, so that a client's reliance on the words keeps them visible (the ledger, "Clients can easily fix this by automatically rely on the text when an agreement is signed.") [traced].
4. **The keeper's identifier.** Today: key 8, 32 bytes, "the place's identifier" (terms.rs:492). Draft 26, 5.8.1: "each by the identifier the layer that orders acts gives it". Below: the layer that orders acts (the MICS or Envelopes) must say what identifies a keeper (part B, item 7), and the form of a keeper's record, "the act's id and its position" (draft 26, §3.4), signed, so that 5.8.3 and 5.8.4 can be read from bytes; verifier 2 today takes positions from a stand-in table (grammar/layers.rs:305) [traced].
5. **A clock's reference.** Today: key 9, 32 bytes (terms.rs:493); clocks a stand-in table (grammar/layers.rs:306). Draft 26, 5.8.5: "What a clock is, and how it is identified, is for the layer that gives it." Below: some layer must say what a clock is, how it is named in 32 bytes or another form, and how an act is anchored to it (part B, item 8) [traced].
6. **A Text act's id in `body`.** Today: any 32 bytes (terms.rs:407 to 412), never looked up; the grammar holds the words as a "piece" (held.rs:41). Draft 26, 5.2.2: "The words of Terms MUST be a Text act (Text, rule 14), public or private, and the Terms MUST name it in `body` by its act id". Below: Text must give `TEXT` for each draft and say whether acts of earlier drafts stay Text acts (part B, item 10); the act id is Envelopes' (`tagged_hash("MOR/act", outside)`), unchanged [traced].
7. **The report and a call.** Today: report.rs, under `SPEC_REPORT_BLOCK_4` (mod.rs:59); a call's bytes in Terms (terms.rs:447 to 477). Draft 26, §4.3: "A report (§3.1) is one act type, defined once, in the MICS's report block"; §4.2, `calls`: "calls for reports, as the MICS's report block gives them". Below: the MICS must give the report's spec hash, type and bytes, a call's bytes (encoding 3 keeps `[task, from]` until then), how a report names its call, and whether one report may answer several calls ("whether one report may answer several is the block's") [traced].
8. **The signer, and a key change.** Today: the outside's field 0 (act.rs:81), compared in check.rs:256 for "the same signer". Draft 26, §2: "a key change continues the signer's line and never starts a fresh one." Below: Identity and Envelopes must keep field 0 the identity hash across rotations, never the key, so that E23's "by the same signer (the outside's field 0)" holds after a rotation [traced].
9. **A cMIP's spec hash.** Today: a socket's `cmip` is any 32 bytes (mod.rs:168 to 194); the core computes a specification's hash from content (hash.rs:62 to 64). Draft 26, §2: "**Development, draft 12.** How a cMIP or a Module is named, by its spec hash". The ledger since 14:52: "a specification (a cMIP, a Module, any text acts name) is a Text act on MOR, named by its act id" and "The spec hash as a name for loose content goes with it", "queued behind draft 26". Below: when Development is rewritten, a cMIP is named by an act id; encoding 3's E5 row for a cMIP ("its spec hash, `tagged_hash("MOR/spec", content)`") and E2's own spec hash then change with it. Until then they stand [traced; inferred: that the change reaches E2 and the inside's `spec` field, act.rs:100].
10. **What a cMIP declares it needs.** Today: nothing. Draft 26, 5.8.6: "Terms that do not supply what a cMIP they name, in any socket, declares it needs (a clock, a keeper) are **invalid**". Below: Development must say where and in what form a cMIP declares a need for a clock or a keeper (part B, item 11) [traced].
11. **The set's label in Identity's list of tags.** Today: none. Encoding 3: "which Identity's list of the core's tags would then name". Below: Identity, "Encoding and conventions", adds the tag (part B, item 1) [traced].
12. **A settlement and a payment.** Today: `settlement` any 32 bytes (statement.rs:222); Money a stand-in table on the grammar side. Draft 26, 5.13.2: "how a settlement carries that name is for the layer that gives the settlement (Money, §2)". Below: Money must give the settlement as an act with an id both sides can see, and how a payment names the version it read (for the Money review, after Agreements) [traced].
13. **The envelope's chain.** Today: `envelope`, `envelope_at` any 32 bytes (terms.rs:495 to 496). Draft 26, §4.4, case 7: "*Invalid*, under Envelopes' rules for Terms that name an envelope (§2), where those rules give it." Below: Envelopes must give the bake's and a transfer's act ids, and its rules for Terms naming an envelope, before any checker gives case 7 [traced].

---

## 7. The estimate of verifier 3 (this session's)

*Everything in this section is this session's estimate and proposal, labelled so. Nothing here is decided.*

**In plain words.** Most of verifier 2 stays: the checker of one act's bytes, the reading of lines, receivers, legs, data and contests, and the answer types change their rule numbers and some words, not their shape. About 750 lines go (the report, the matching of leg reports, the baker's rules, delegation, two arms of "everyone who signed"). Between 1,300 and 2,100 lines are new or rewritten, most of them in four places: the pin, knots across every field and layer, several keepers, and reading a filling under its own version. The test cases grow from 120 to between 170 and 190 in the grammar, and from 160 to about 175 in the checker.

**How this session counted.** Lines are `wc -l` of each file at `f1a13feb`, comments and tests included [counted]. Lines that go are the line ranges the parts cite for each removal [counted from the ranges; that they go is the parts' inference]. Lines that are new are this session's guess from the size of the code each change sits in (for example, the keepers' reading against `counts` and `scope_of`, `mod.rs:210` to `:259`, about 50 lines for one place) [inferred: confirm by building]. Vector code is costed per case: `grammar/cases.rs` is 1,809 lines for 120 cases, about 15 a case; the checker's generator, `core/examples/support/agreements_new.rs`, is 804 lines for 160 cases, about 5 a case [counted].

### What verifier 2 is today [counted]

| Module | Lines | What it does |
|---|---|---|
| `mod.rs`, `check.rs`, `terms.rs`, `statement.rs` | 1,682 | the checker: one act's bytes, and `previous` among the acts held |
| `report.rs` | 201 | the report and its lines (E21, E22) |
| `grammar/chain.rs`, `force.rs`, `order.rs` | 1,836 | in force, updates, forks, late, counter signatures, who is bound |
| `grammar/held.rs`, `mod.rs`, `layers.rs`, `answer.rs` | 1,241 | the acts held, knots, the place and clock, the answer words |
| `grammar/line.rs`, `receiver.rs`, `spots.rs`, `legs.rs`, `baker.rs` | 1,214 | lines, receivers, spots, legs and reports, the baker |
| `grammar/sockets.rs`, `stubs.rs`, `questions.rs`, `scenario.rs`, `recording.rs` | 798 | the cMIP interface, the stubs, the questions, the vectors' format |
| `grammar/cases.rs` | 1,809 | the 120 grammar cases, built in code |
| **All of `core/src/agreements_new/`** | **8,781** | |
| beside it: the generator and its grammar half; the two vector tests | 925; 260 | `core/examples/support/`, `core/tests/` |

### What stays, what goes, what is new

| Module | Stays | Goes (lines, from the ranges cited) | New or rewritten (lines, inferred) |
|---|---|---|---|
| Checker (`check.rs`, `terms.rs`, `statement.rs`, `mod.rs`) | almost all: E1, E3 to E12, E14 to E18, E20, E23, E24 as they are, rule numbers renamed | the report's arms in `check.rs`; `SPEC_DRAFT_25` and `SPEC_REPORT_BLOCK_4` replaced (about 20) | `SPEC_DRAFT_26` (after wave four); key 8's parser (about 30, on items 5 and 6); E13's role case (about 10); E19's note (about 10); E25 with `TEXT` and Text's payload check (60 to 100, on item 10); the set of acts' function (about 20, on items 1 and 2) |
| `report.rs` | nothing | **201** | nothing: the MICS's report block |
| `grammar/chain.rs`, `force.rs` | the walk of versions, forks, resolving updates, counter signatures' reading by knots and positions | an update's own `in_force` (`force.rs:602` to `:611`, 10); delegation (`force.rs:578` to `:585`, `:616` to `:652`, 45); the filler and inherited arms of `signed_by` (`force.rs:486` to `:492`, `:502` to `:519`, 25); the default's yes at once (`force.rs:289`, a few) | **the pin** for a first version and an update (250 to 400); L's test by the gate (about 50); the word **late**; a counter signature's **fork** (50 to 80); the default signers as known parties (60 to 100, replacing the arms) |
| `grammar/held.rs`, `mod.rs` | the acts held, `known` and `lacking_in` in shape | the reader's anchoring as the Terms' scope (`mod.rs:251` to `:257`, `chain.rs:261` to `:281`'s per-anchoring branch, about 15) | **knots of every field and layer**: decoding Text, Identity, Envelopes and Money acts held, every fingerprint field, `body`, perhaps `prev` (200 to 350); the reader's own answer beside the Terms' (80 to 150) |
| `grammar/layers.rs`, `answer.rs` | the stand-in tables, the answer type | `Qualifier::PerPlace` renamed | **several keepers**: a list, agreement, disagreement, a silent keeper, a record against a knot (250 to 400) |
| `grammar/spots.rs`, `sockets.rs` | the spot's reading | G10.6(b) and `Ask::FillingRights` (about 20); `Delegation`, `Ending` (`sockets.rs:126` to `:136`, 11); K4's `signed_original` (a field) | a filling read under its own version, keepers and clock (5.8.5, 5.10.2, 5.10.7); K1's new output part and its question (5.10.8) (150 to 250); what a cMIP declares (5.8.6) (50 to 100, waiting on item 11) |
| `grammar/legs.rs`, `baker.rs` | `holds_control`, `data`, `before_paying`, `contest` | `leg` and `silence` (`legs.rs:97` to `:213`, about 115) and `buyer_leg`'s matching (about 40), to the MICS's report block; `baker.rs` (240) to Envelopes, but for what 5.11.9 reads | the baker's contest read at the act it cites (about 30) |
| `grammar/order.rs`, `line.rs`, `receiver.rs` | as they are, rule numbers renamed | nothing | a resolve that resolves nothing: **not shown** (about 20); the receiver per keeper (small) |
| **Code, all** | about 6,200 of the 6,972 lines outside `cases.rs` | **about 750** | **1,300 to 2,100** |

So verifier 3's code, without its cases: about **7,500 to 8,300 lines**, against verifier 2's 6,972 [inferred].

**Vectors.** Grammar: of 120, between 12 and 29 go (11 to the MICS, case 58, and on the open questions cases 64, 74 and the 15 of G14), about 22 change answer (up to about 30 more on the questions), and 79 are new: **about 170 to 187** cases, and `cases.rs` grows by about 1,200 lines [counted from section 4; the lines inferred at 15 a case]. Checker: of 160, 12 go and valid 7 stops being a passing case; 29 are new: **about 176**, and the generator grows by about 150 lines [counted; the lines inferred at 5 a case]. The 153 cases that answer "not this encoding" as bytes stay as encoding 2's files, as encoding 2 said of encoding 1's (part 3).

### The order to build it in (this session's)

**The MOR lead's lean** is the gate and the pin first. *This session agrees*, with one step before it that changes no meaning: the pin moves 19 of the 22 grammar answers that change on the plain reading, and every later step (late, several keepers, the known parties, a filling under its own version) asks "in force" through it, so building it first means each later step's vectors are written once against the final word. The step before it renames every rule and retires the cases that leave, so that the pin's diff shows the pin's answers and nothing else. In every step the vectors come first, then the code.

0. **Rename and retire.** *Vectors:* every case's rule renamed to draft 26's numbers and "per place" to "per keeper"; the 11 cases of 5.11.4 and 5.11.7, case 58 and the 12 reports retired (or moved, question 40). *Code:* the rule names and words in every answer; `report.rs` out. *Why:* mechanical and everywhere; done first, it keeps every later diff to its meaning.
1. **The gate and the pin** (5.4.1, 5.5.1, 5.5.2, 5.2.3's new entry, 5.13.4, 5.5.7(d)). *Vectors:* the 19 that change by the pin, then lines 13 to 16, 18, 26 to 28, 45 of section 4. *Code:* the pin by knots and per keeper (one keeper, as today's place), an update's own `in_force` removed. *Why:* the largest change, and the one everything else reads.
2. **Knots across fields and layers, and late** (5.13.1, 5.13.3, 5.5.4). *Vectors:* G 29, 65; lines 30 to 37, 76, 77. *Code:* acts of other layers held and read; `body` a knot; the word **late** and L's test. *Why:* the pin by knots reads knots; late needs both, and settles today's **unchecked** for a Text act held.
3. **Several keepers, and the reader's anchoring as the reader's** (5.8.1 to 5.8.5, 5.5.3, 5.5.5(d), 5.6.4, 5.13.5, 5.8.2). *Vectors:* lines 5, 17, 43, 49, 50, 52 to 57, 78, 79 and case 64 (once question 9 is answered). *Code:* the keeper list, agreement, disagreement, a silent keeper, a record against a knot; the reader's answer beside the Terms'. *Why:* "only they pin" rewrites step 1's per-keeper half; it waits on byte items 5 to 7 only for the checker, not for the grammar.
4. **The known parties, and the unknown party protected** (5.5.5(a), 5.6.1, 5.1.2, 5.6.6, 5.4.3, 5.10.2, 5.10.5 to 5.10.8, 5.12.4's default, K4 and K5). *Vectors:* lines 1 to 3, 19 to 21, 38 to 44, 46 to 48, 51, 61 to 68, 75, and case 74 (question 10). *Code:* `signed_by` rewritten as the known parties; delegation out; a filling read under its own version; K1's new question. *Why:* one rewrite of who signs and who is bound, best done once the pin and keepers are in, since a filling's keepers and clock are its own version's.
5. **The small words** (5.4.5's fork, 5.12.4's "nothing to resolve", 5.12.3's T1 and T4, 5.11.9, 5.7.2). *Vectors:* G 36; lines 22 to 25, 42, 69 to 74. *Code:* each a branch. *Why:* independent of each other and small; after step 1 because a counter signature's window is the pin's.
6. **The checker of encoding 3** (E2, E13, E19, E23, E25, the set). *Vectors:* lines 80 to 97, V 7, V 1, I 8. *Code:* as the first row of the table above. *Why:* last among the bytes because `SPEC_DRAFT_26` changes with wave four's edits, and four of its items (5, 6, 9, 10) wait on choices; 5.3.1 and E13 can go earlier, being one act's bytes.
7. **What waits on other layers** (5.8.6's declarations; 5.2.2 with `TEXT`; the cases of G14). *Vectors:* lines 58 to 60, 7, 8, 9. *Code:* the interface for a cMIP's declared needs. *Why:* each waits on Development, Text or Envelopes to say something first (section 6).

---

## 8. The totals

From the sections above; each count is of today's vectors in `core/vectors/agreements-new/` unless marked new [counted, but for the answers after, inferred as the parts mark them].

| What | Count | Which, and what is counted twice |
|---|---|---|
| Rules of draft 26 | **68** numbered, **33** lettered; section 6 (8 tasks), 6.1 (7 modules) | 28 and 33 in part 1, 40 in part 2 [counted, `rules.py`] |
| ... that change what a verifier answers, or the code | **44** (18 of part 1's 28, 26 of part 2's 40); and section 6 | by their *Size* column, every row not "none" |
| ... with no change | **24** (10 and 14); and 6.1 | |
| ... new, with no draft 25 rule | **8**: 5.2.2, 5.5.1 (part 1); 5.8.2, 5.8.3 (for several keepers), 5.8.6, 5.10.6, 5.12.1, 5.13.3 (part 2) | [traced, each part's "Replaces"] |
| Draft 25's rules that go, named by the parts | G5.5 (delegation); G4.8(f), (g); G4.1's "in force at once"; G8.1 to G8.4 and G11.4's opening and (a) to (d) and G11.7's reading of the halves (to the MICS); G10.6(b); G9.2's general sentence; G13.4's "Only where the agreement names none does each reader accept the anchoring it chooses."; G14 but G14.5(e) (to Envelopes) | [traced, the parts' "Replaces"] |
| E-rules of encoding 3 | **23** (E1 to E20, E23, E25, E24), the set of acts, section 6, section 9 | [counted] |
| ... that change what the checker answers | **4** (E2, E13, E19, E25), with E6 and E18 through key 8, and section 9 | part 3 counts 5, section 9 among them |
| ... new | **2**: E25, the set of acts | |
| ... retired | **2**: E21, E22 | |
| ... unchanged in answer | **17**: E1, E3, E4, E5, E7 to E12, E14 to E17, E20, E23, E24 | |
| Vectors that change answer, plain reading | **22 grammar** (G 1, 2, 5, 10, 12, 14, 26, 35, 46, 49, 50, 52, 53, 55, 56, 67, 68, 91, 102; 36; 29, 65) and **3 checker** (V 7, V 1, I 8) | ⚑ G 102 is a G14 case; ⚑ V 1 is part 3's only; ⚑ G 64 is changed by part 2, retired by part 1, and counted in neither total here |
| ... if a question goes one way | **up to 13 grammar** (G 8, 11, 30, 31, 66, 76, 77, 71, 72, 73, 75, 95, 22) and with Q5 **V 12**, ⚑ V 43, and 19 Terms acts in 19 grammar cases | of Q5's 19 cases, 29, 55, 56, 65 are counted above and 30 among the ifs, 58 is retired (part 1) |
| Vectors retired | **24 sure**: G 58, the 11 of 5.11.4 and 5.11.7, the 12 reports; and V 7 as a passing case | ⚑ G 64 and G 74 retired by part 1, not by part 2; G 99 to 113 placed by no part (up to 15 more) |
| Vectors renamed only | grammar: every case; checker: 28 (part 3's count) | part 2's 24 and 11 are of the checker cases naming its rules; not added to part 3's |
| As bytes, unchanged files | **153 of 160** checker cases answer **not this encoding** | part 3 |
| New vectors | **108**: 79 grammar, 29 checker (section 4.6) | **7 written by both parts 1 and 2**, counted once; **4 pairs** the same story in two files, counted once in each; part 1 would write line 31 inside line 30 |
| ... of the 22 of 26 November | **22**, written as 19 lines of section 4 (lines 82 and 83 hold line 16's five) | five placed by both parts 1 and 2: line 1's three, line 8's second, line 19's second (part 1 inside line 30) |
| ... of the 27 November entries | **6** entries, as 9 vectors (lines 6, 9, 17, 35, 36, 41, 42, 43, 61); and 4 from the entries after draft 26 (lines 3, 12, 44, 48) | three placed by both parts 1 and 2 |
| Fields | **1** act field: `place` becomes `keeper`, one or several (key 8's form); **2** interface parts: K1's output part (5.10.8), what a cMIP declares (5.8.6) | ⚑ the keeper field is counted by part 2 (5.8.1) and part 3 (E19): one field |
| Value forms | **1**: the set of acts; and one value replaced, `SPEC_DRAFT_26` | part 3 |
| New answer words and reasons | **late** (5.5.4(c)); **fork** for a counter signature (5.4.5); the qualifier **per keeper**; "nothing to resolve" (5.12.4); "the keepers disagree" (5.8.3); "the keeper contradicts the acts" (5.8.4, 5.5.4(c)) | parts 1 and 2 |
| Removals | **9**: the reader's anchoring as the Terms' answer; an update's own `in_force`; delegation (G5.5, with K1's delegation part); the filler and inherited arms of "everyone who signed"; the default's yes at once; G10.6(b) and `Ask::FillingRights`; the reading of leg reports side by side; K4's `signed_original`; the report (E21, E22, `report.rs`, `SPEC_REPORT_BLOCK_4`) | ⚑ the anchoring counted by parts 1 and 2; ⚑ delegation by part 1 and by part 2 as K1's part; K4's `signed_original` a removal for part 2, a question (Q13) for part 1 |

---

## 9. The three largest changes, by what they cost in code and vectors (this session's)

1. **The pin, for a first version and an update** (5.4.1, 5.5.1): a new check on every Terms act that names no keeper, read by every question that asks "in force"; it alone moves 19 of today's 22 grammar answers, and needs about ten new cases and 250 to 400 lines.
2. **Knots in every field of every act, of every layer, with "late"** (5.13.1, 5.13.3, 5.5.4): the verifier must hold and read the acts of Text, Identity, Envelopes and Money, the `body` included; it moves G 29, 65 and today's **unchecked** for a Text act held, needs about ten new cases, and 250 to 400 lines.
3. **Several keepers, and the reader's anchoring only as the reader's** (5.8, 5.5.3, 5.13.5): the place becomes a list that must agree, a silent keeper and a keeper against a knot are new answers, and the scope and qualifier of every answer are rewritten; about 20 new cases (grammar and checker) and 330 to 550 lines. Close behind it: the known parties and the unknown party protected (step 4), about 25 cases and 200 to 350 lines.

---

## 10. The questions

All the questions of the three parts, merged where two parts ask the same one, those that would change a verifier's answer first. Each quotes its sentence, gives the readings and the leans, labelled as whose. None is settled here. The parts' own numbers are kept in brackets (P1 Q5 is part 1's Q5; P2 1 is part 2's first; P3 B5 is part 3's byte item 5).

### 10.1 Those that would change the answer of today's vectors

1. **The signer of a Terms act among its authors** (P1 Q5; P3 question 3). The ledger, "The signer of a Terms act is an author" (27 November, 16:48 to 16:50), the lead's line: "a Terms act whose `authors` leaves its signer out is invalid"; his words: "Absolutely. The person publishing the act is by default an author, the rest adds signature later". Not in draft 26 at `d4373f0` nor in encoding 3. (A) invalid under 5.3.1, checked from one act's bytes (the outside's signer against `authors`); (B) not until the scribe writes it. *Part 1's lean:* (A) once written. *Part 3's lean:* it goes into draft 26 and E13 with wave four. Moves V 12 (⚑ and V 43, part 1) and 19 grammar cases' second tips.
2. **With an `in_force` cMIP, which assents must the pin reach?** (P1 Q1). 5.4.1: "each party in whose name one of those assents is counted has made an act in that same name within the agreement that is shown after every one of those assents". (A) only the assents the cMIP requires, which K2 must then name; (B) every assent counted. *Part 1's lean:* (A). Moves G 71, 72, 73, 75 under (B).
3. **An update's pin: the update itself, or the acts that put it through the gate?** (P1 Q3). 5.5.1(b): "It is shown after the acts that put that version in force (5.4.1 for a first version; this rule for one that is itself an update)". (i) the update's own knots; (ii) the update's or those of the assents that put it through the gate. *Part 1's lean:* (ii). Under (i), G 30 moves, and every fork case's tips stop being pinned.
4. **Is "valid" answered of an update whose original is not in force?** (P1 Q4). 5.5.1: "Valid is the gate's answer, and says only that the update is allowed." (A) valid; (B) not shown, as `order.rs:132` to `:140` today. *Part 1's lean:* (A). Moves G 8, 11 under (B).
5. **Does an act named and not held leave the pin unchecked?** (P1 Q2). §3.4: "Where an act such a chain needs is named and not held, the answer is unchecked (§5.13)"; 5.4.1: "Until then it is not yet in force: a verifier answers **not shown** for it as in force". (A) unchecked, wherever the act could be a party's later act; (B) not shown, unless named in that party's own line. *Part 1's lean:* (A), "Missing act is always “I don’t know”". Moves G 31 under (B).
6. **Must the version a payment names have been in force?** (P1 Q6). 5.1.4: "Where the act that gives or owes names, as the version it read, Terms that are not shown as a version of that agreement, the answer is **not shown**." (A) any version shown; (B) only one that was in force, as `receiver.rs:66` to `:78`. *Part 1's lean:* (A). Moves G 66, 76, 77 under (B).
7. **A resolving update's answer word** (P2 2). 5.12.4: "A resolving update of Terms that resolves is an update of the shared Terms and takes an update's answers". (A) **valid** and **in force**, for **shown**; (B) **shown**. *Part 2's lean:* (A). Moves G 22.
8. **Key 8, one keeper** (P3 question 1; B5). Encoding 3: "reading (i): one form, a list always", "reading (ii): two forms, told apart by their bytes". *Part 3's lean:* (i). Under (i), V 1 is **rejected**, E6, before E13.
9. **Grammar case 64: retired, or changed?** (this session's, from disagreement 1). 5.5.3: "A keeper or an anchoring of the reader's own choosing gives an answer only as that reader's, named so". (A) retired, the sentence it tests gone (part 1); (B) kept, its answer **not shown**, as shown, by the pin (part 2). *This session gives no lean;* part 1's new line 29 stands either way.
10. **Grammar case 74: retired, or kept with its sentence changed?** (this session's, from disagreement 2). 5.10.7: "Nothing changes what a filling earned except an assent its holder signs in their own name". (A) retired (part 1); (B) kept, **shown**, renamed, its K4 `stubs_asked` entry gone (part 2). *This session gives no lean.*
11. **Where the 15 cases of G14 go** (this session's, from part 2's "for session 4 to place"). Draft 26's companion, as part 2 quotes it: "The baker's lines of draft 25 (G14) go to Envelopes with its rules". (A) retired with G14; (B) moved to Envelopes' vectors; (C) kept where draft 26 still reads an envelope (5.1.4, 5.11.9, §4.4 case 7). *This session gives no lean;* G 102 (counted by part 1 as changing) and G 106, 108 turn on it.
12. **Does a contest need the version in force?** (from part 1's "95 ... on session 2's reading of 5.11"; part 2 asks no question of it). 5.11.8: "Its `terms` names Terms shown as a version, or a tip set aside (then the contest is shown as **disputed**, §5.12); otherwise the contest is **not shown**." (A) shown as a version, in force or not; (B) in force (`legs.rs:383` today). *No part gives a lean.* Moves G 95 under (B).

### 10.2 Those that would change a verifier's answer in a new vector only

13. **Several keepers, one silent** (P1 Q8; P2 1). 5.8.3: "Where the Terms name several keepers, an answer about order counts where they agree."; the ledger: "If the terms stipulate two keepers, both keepers are needed. Sorry can’t do". (A) every keeper named must show it; (B) those that show it, where none disagrees. *Part 1's and part 2's lean:* (A), his words; draft 26 would need the sentence. Lines 17, 43.
14. **Are agreements named as parties known parties?** (P1 Q7). 5.5.5(a): "the known parties (§3.2), the author among them: parties named as signers or as agreements"; the ledger, "The known parties of a version are the signers it names", his word "Yes". *Part 1 gives no lean;* a question for him. Line 40.
15. **Two counter signatures in one name that nothing orders** (P1 Q9). 5.4.5: "An assent is read against the first counter signature in the same name that follows it". (A) by knots or keepers only; (B) by id, as `force.rs:374` to `:376`. *Part 1's lean:* (A). Line 23.
16. **The act `body` names: held and unreadable, or not held** (P1 Q11; P3 B9). 5.2.2: "Where the act `body` names is held and is not a Text act, the Terms are **invalid**". Part 1: (A) unchecked, (B) not read. Part 3: (a) a note, (b) nothing. *Part 1's lean:* (A). *Part 3's lean:* (a), a note, with several acts only. Lines 91, 95.
17. **One act's namings, or several together?** (P1 Q12). 5.5.4(a): "L, or an act without which L does not pass O's gate, is shown after acts enough for F to pass O's gate". *Part 1's lean:* one act, the text's singular.
18. **Which version "gives the power"?** (P1 Q14). 5.6.1(b): "their own signature is on the version of those Terms that gives the power". (A) the version `under` names; (B) the version that first wrote it. *Part 1's lean:* (A). Lines 1, 2, 46.
19. **An act under a power and the replacing Terms, with no order: a fork?** (P1 Q15). 5.6.4: "whether the act and the replacing Terms are then a fork (§5.12) is not said by this rule." *Part 1's lean:* not shown, as written.
20. **Which acts pin a party's side?** (P1 Q16). 5.4.1: "has made an act in that same name within the agreement". (A) a Terms act or Statement of that agreement; (B) also a report or a witness act. *Part 1's lean:* (A).
21. **Where a cMIP declares what it needs, and who reads it** (P2 3; P3 B11). 5.8.6: "Terms that do not supply what a cMIP they name, in any socket, declares it needs (a clock, a keeper) are **invalid**". Part 2: (A) in the cMIP's own text, (B) a field of the socket; *part 2 gives no lean.* Part 3: (a) a table handed to the checker, (b) the grammar verifier's; *part 3's lean:* (b). Lines 58 to 60.
22. **A cMIP the verifier lacks, for 5.8.6** (P2 4). (A) **unchecked**; (B) the Terms pass until read. *Part 2's lean:* (A).
23. **A filling under a dropped role** (P2 5). 5.10.2: "A filling already earned is read from the version its proof names, its role and that role's cMIP as that version states them, whatever a later version says of the role". (A) K5 asked of each version that named a role there; (B) a spot named by the version and position the asker gives. *Part 2's lean:* (B). Line 61.
24. **Her own assent, counted or not** (P2 6). 5.10.7: "Nothing changes what a filling earned except an assent its holder signs in their own name". (A) her signature enough; (B) only one counted in her name, as `spots.rs:108`. *Part 2's lean:* (A). Line 65.
25. **Which layers' fields are knots** (P2 7). 5.13.1: "any fingerprint in any field of any act the verifier holds, whatever layer either act belongs to". (A) every layer in the core decoded; (B) only the layers implemented. *Part 2's lean:* (A). Lines 35, 36.
26. **The act format's `prev`** (P2 8; build list R25). (A) a knot; (B) not a field of the act. *Part 2's lean:* (A). Line 77.
27. **A filling's term with no clock** (P2 9). 5.10.8: "where the version names no clock, no term in time can be read from it (5.8.6)". (A) nothing shown; (B) K1's answer with no qualifier. *Part 2's lean:* (A).
28. **A keeper that contradicts a knot: which answers?** (P2 10). 5.8.4: "a keeper's record that contradicts a knot the verifier holds (B placed before A, while A names B) gives **not shown**". (A) those resting on that record; (B) every answer per that keeper. *Part 2's lean:* (A). Lines 37, 56.
29. **A verifier that stops** (P2 11; build list T3). Draft 25's G9.2: "It MUST NOT answer **not shown** or **invalid** because it stopped."; draft 26 keeps it for receivers only. (A) **unchecked**, saying how far; (B) left to §3.6. *Part 2's lean:* (A).
30. **A forked assent and coming into force** (P2 12). 5.7.2: "Where the two acts are assents, neither counts for any update's gate until that signer's line is resolved". (A) nor for a first version's coming into force; (B) the gate only. *Part 2's lean:* (A), what the code does.
31. **The reader's own answer: given, or may be left out?** (P2 13; part 1 at 5.5.3). 5.13.5: "An anchoring of the reader's own choosing, whether or not the agreement names any, gives an answer only as that reader's, named so". *Part 2's lean:* given, beside the Terms' answer; part 1 gives no lean. Lines 4, 29, 53, 78, 79.
32. **A baker's contest by one who is not the holder** (P2 14). 5.11.9: "The holder of the baker's rights is read at the act the contest cites". *Part 2's lean:* shown as a contest, **not shown** as a baker's.
33. **Which spec hashes are `TEXT`** (P3 B10; P3 question 4). *Part 3's lean:* every Text draft, listed. Lines 94, 97.
34. **Key 9** (P3 B8). *Part 3's lean:* keep it, 32 bytes.
35. **The keeper list sorted** (P3 B6). *Part 3's lean:* sorted, each once. Line 85.
36. **Fields holding a set's value** (P3 B4). *Part 3's lean:* none, for now. Line 83.

### 10.3 Those that would change no answer

37. **"Binds the known parties to them": which question asks it?** (P1 Q10). *Part 1's lean:* no question of its own.
38. **What a named update condition is handed** (P1 Q13; the sheet of 26 November's Q16). `sockets.rs:64`, `signed_original`. *Part 1's lean:* hand the known parties; part 2 counts the field as a removal.
39. **A line resolve's word** (P2 15). *Part 2's lean:* **shown**, as today.
40. **Where the eleven retired leg cases go** (P2 16). *Part 2's lean:* kept, moved to the MICS's report block's vectors.
41. **"Built on a tip" and knots** (P2 17; build list T4). *Part 2's lean:* the two lists stay apart.
42. **The "or any other" fork** (P2 18). *Part 2 gives no lean;* draft 26's report lists it (item 8).
43. **A piece held** (P2 19). *Part 2's lean:* held, naming nothing.
44. **K1's input** (P2 20). *Part 2's lean:* the act id.
45. **Byte items 1, 2, 3, 7, 12** (P3 question 9): the set's label, its joining, where its rule stands, a keeper's identifier, `SPEC_DRAFT_26`. Part 3's proposals are in section 5.
46. **Left open in the parts' sections, not numbered by them.** Part 1: whether "valid, not in force" is two answers or one with the second beside it (5.5.1); whether F's own second half of the pin is left out of L's test (5.5.4); whether "Two assents of one signer that name the same `previous`" is the line's fork only or a test the gate makes (5.5.5); whether a Text act handed only as a piece is held (5.2.2). Part 2: with two keepers that agree on A and B and disagree on C, whether every answer is **not shown** (5.8.3); a filling earned under a version naming no keeper while the next names one (5.8.5); whether 5.10.7 reads which later versions change what a filling earned or names every one she assented to; which act "the anchoring of the purchase" anchors (5.10.8); whether a resolving update must itself be pinned (5.12.4); whether a layer the verifier does not decode is held or lacking (5.13.1); when K5 is asked for a filling already earned (§6).

---

## 11. What this sheet does not settle

- **Anything.** It decides no reading, chooses between no two parts, and writes no vector or code. Where the parts disagree (section 1), both readings stand.
- **Draft 26 has moved.** The branch `claude/draft-26-outline-vbtvu7` now ends at `1f81c2a`, "Agreements draft 26: wave four carried; the report rewritten (the scribe's N1)", after `d4373f0`; it changes `draft-26.md` and `encoding-3.md` [traced: `git log` of the branch]. The parts and this sheet read `d4373f0` only, as asked. Whether wave four carries the five answers of 27 November (the signer as author, both keepers needed, the known parties of a version, renewal, the giver bears it), and so settles questions 1, 13 and 14, is not read here; `SPEC_DRAFT_26` as part 3 recomputed it is `d4373f0`'s file's, and changes with it.
- **The answers after are read, not run.** No code exists for draft 26; every "after" is a reading of the text against the code paths named.
- **The estimate's lines.** The lines that go are counted from cited ranges; the lines that are new are this session's guess, and a build could differ by half.
- **Cases the parts did not follow.** Part 1 followed the pin to `chain.rs:345` for 19 cases; the legs, data, contest and baker cases (78 to 113, but 91 and 102) were not followed, and some may move by the pin too.
- **The stranger's report** (section 5) was a subagent's, kept in no file; its quotations could not be checked.
- **The layers below** (section 6): what Text, Identity, Envelopes, Money, Development and the MICS must say before some vectors can be written.
