# What draft 26 and encoding 3 do to verifier 2: part 3, the bytes

*27 November 2026. Session 3 of 4 under the codemeister (Machine, allegedly, narrow hat). A record of work and a set of proposals, not a decision. Every proposal and every lean here is the session's, labelled so. Nothing in MOR's texts, code or vectors is changed by this file. Session 4 assembles it with parts 1 and 2.*

## The wish, quoted

From `docs/decisions.md` on main, "Current wish": "We need to change the current wish to updating the core after the findings" (Nobody, allegedly, 26 November, 16:46). On the order (27 November, 14:53): "We finish this rewrite of agreements, then we turn our attention to money, and after that we’ll tackle development." On this wave (27 November, 16:54): "Yes pls"

His words on the text, from the ledger: "This version of agreements is not to be used bare. Big warning needs to be placed on it." "Not to be used bare. Agreements offer the basic sockets to draft rule books, not one unified way of agreeing, more like a language used to decide how to agree." "Protect the unknown parties." "There is no valid update for her anymore. Only a valid agreement" "A fork is a fork." "Knots a cross acts by nature, and possibly cross layer." "Missing act is always “I don’t know”" "There is no such thing as an unsigned act on Mor" "If the terms stipulate two keepers, both keepers are needed. Sorry can’t do" "The person publishing the act is by default an author, the rest adds signature later" "No, Ana took the risk, she bears the responsability."

## In plain words

Verifier 2 is the code that checks the bytes of Agreements acts as encoding 2 writes them (draft 25). Encoding 3 writes the bytes of draft 26. This part says, rule by rule, what a checker built from encoding 3 would answer that verifier 2 does not, what the twelve open byte choices cost, and what draft 26 needs from the layers below.

The short answer. Most of encoding 3 is encoding 2 with new rule numbers: the same bytes pass and fail for the same reasons. Five things really change an answer:

1. **The spec hash.** Every act is now written under draft 26's fingerprint. Verifier 2's acts, under draft 25's, become "not this encoding".
2. **The report is gone.** It is the MICS's now, so a report is "not this encoding" too, and two rules (E21, E22) and twelve vectors go.
3. **The keeper field.** Key 8 may name several keepers. Its form is open, and one reading rejects the bytes verifier 2 writes today.
4. **An author named by role is now invalid** (5.3.1). Two of today's passing vectors fail.
5. **The words are a Text act** (E25, new). Handed several acts, the checker looks at the act `body` names: a Text act is fine; another kind of act makes the Terms invalid.

Plus one new note (an update that carries `in_force`) and one new value nobody yet writes in any field (the set of acts).

**Marks.** Each claim is **[traced]** (to a rule, a ledger line or a line of code, cited), **[counted]** (by a script, named) or **[inferred]** (the session's reading, with what would confirm it). The scripts are listed at the end.

**What was read, at which commit.** Encoding 3, draft 26 and its trace: branch `claude/draft-26-outline-vbtvu7` at `d4373f0` (pull request 292, not merged). Encoding 2 and draft 25: branch `claude/agreements-clean-1-hahuwn`. Verifier 2: branch `claude/agreements-verifier-2` at `f1a13feb`. The ledger, the MOR lead's two notes of 27 November and the latest texts: main at `591c212`. The sheet of 26 November: branch `claude/impact-26-november-4vze7a`.

## Today's answers

`cargo test -p mor-core --locked` at `f1a13feb`: 34 test runs, 570 tests passed, 0 failed, 1 ignored; the two vector suites `tests/agreements_new_vectors.rs` and `tests/agreements_new_grammar_vectors.rs` among them [counted: the log's "test result" lines, summed]. Every change below is read or inferred, not run: no encoding 3 code exists to run (encoding 3, E24: "none is yet written for encoding 3, and this text changes no code").

`valid.json` holds 44 cases and `invalid.json` 116, 160 in all [counted, `count.py`].

**Two things that touch nearly every vector.**

- **As bytes, 153 of the 160 change answer to "not this encoding".** Every case whose act reaches the spec hash check (check.rs:145) carries draft 25's spec hash, which encoding 3 answers "not this encoding" (E2: "An act under any other spec hash is **not this encoding**"). The seven that stop before it keep their answers: invalid cases 0 to 4 and 6 (Envelopes rules 1, 3, 5 and 10), and case 5, already "not this encoding" [counted, `count.py`]. Read this way the files are simply encoding 2's, and stay where they are, as encoding 2 says of encoding 1's.
- **Regenerated, most keep their answer.** The useful reading, used for every count below: the same payloads, written again under `SPEC_DRAFT_26` by the generator (`core/examples/support/agreements_new.rs`), re-sealed and re-signed with the same fixed inputs [inferred: the generator writes every act from the library's constants]. Then only the cases named in section A change answer.
- **Rule names.** The checker names grammar rules by draft 25's numbers (G2.1 and so on, e.g. terms.rs:546). Under draft 26 each has a new number: G1.4 is 5.1.4; G2.1 is 5.2.1; G2.2 is 5.2.3; G3.1 is 5.3.1; G4.2 is 5.4.2; G5.2 is 5.2.3; G6.1 is 5.7.1; G10.1 is 5.10.1; G10.4 is 5.10.4; G12.3 is 5.12.4 [traced: encoding 3, section 4's lists and section 9, step 7]. 28 cases name one of these as their rule or in their notes [counted, `count.py`]: 20 invalid, 8 passing with notes. Their verdict stays; the word in `rule` or `notes` changes. That is counted apart from "change answer" below.

---

## A. The E-rules

One section per E-rule, in encoding 3's order: E1 to E20 (with the set of acts after E5), the report's section (E21 and E22 gone), then E23, E25 and E24, as encoding 3 places them, and section 9, the checker's order. Code lines are at `f1a13feb`; each was checked to exist (`cites.py`).

### E1. An everyday act

**The rule** (encoding 3): "Every act of this encoding is an everyday act of the act format in force". Its sequence sentence now adds: "whatever specification they are under (a Text act carrying words included)".

**Replaces**: E1 of encoding 2, the same rule; the Text act is named [traced].

**The code it meets**: check.rs:165 (no signer, E1), check.rs:171 (the signature over the act id), check.rs:194 (a scheme not implemented: unknown), check.rs:213 to 218 (`prev` present, one entry at most). The act format reads `prev` at act.rs:104 and act.rs:551 [traced].

**What the checker answers differently**: nothing. *Plain words:* Ana signs a Text act with her words, then the Terms. The Terms' `prev` names the Text act, since both are in her one sequence. The checker already checks only that `prev` is present and has at most one entry. Example: a Terms act with `prev` naming her Text act passes, as it would today [inferred: check.rs:214 to 216 test only the count].

**Size**: none (a word in a comment).

**Vectors**: none change, none retired, none new.

### E2. Spec hash and type

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

### E3. No `objects`, no `acks`

**The rule**: "An act of this encoding MUST NOT carry `objects` or `acks` in its inside; one that does is rejected."

**Replaces**: E3, the same; draft 26 cited [traced].

**The code it meets**: check.rs:219 to 224 [traced].

**What the checker answers differently**: nothing. Example: a Terms act with `acks: [h'…']` in its inside is **rejected**, E3, as today.

**Size**: none.

**Vectors**: invalid cases 12 and 13 keep their answers. None retired, none new.

### E4. A closed map

**The rule**: "Each payload, and every map within it (a role), is a closed map whose keys are the small unsigned integers its format lists. A key it does not list, or one that is not an unsigned integer, makes the act rejected."

**Replaces**: E4, the same [traced].

**The code it meets**: mod.rs:296 to 305 (`closed`), terms.rs:387, statement.rs:191, terms.rs:127 (a role) [traced].

**What the checker answers differently**: nothing for Terms and Statements. Example: Terms with key 20 are **rejected**, E4, as today.

**Size**: none.

**Vectors**: invalid cases 16, 17, 43 and 81 keep their answers; invalid case 103 (a report's key) retires with E2.

### E5. A fingerprint

**The rule**: "A fingerprint ... is `hash`: a byte string of exactly 32 bytes." Its table changes: "the words (`body`'s first item) | the act id of the Text act that carries them (5.2.2) | as any act"; the row for the words by work hash goes; the rows for a report's lines go; a Text act and a payment join "an act".

**Replaces**: E5 of encoding 2, whose row read "the body's words | the work hash, `tagged_hash("MOR/work", words)` **[lead]**" [traced].

**The code it meets**: mod.rs:237 to 242 (`hash_of`), mod.rs:138 to 166 (`Named`, the three exceptions) [traced]. The checker never computes a work hash: no use of `hash::work` under `core/src/agreements_new/` [counted: `grep -rn 'work(' core/src/agreements_new` finds only `same_work`, an envelope's work, grammar/layers.rs:130].

**What the checker answers differently**: nothing from one act's bytes. *Plain words:* the 32 bytes in the body used to be the hash of loose words; now they are a Text act's id. Both are 32 bytes; the checker cannot tell them apart (encoding 3: "A verifier cannot tell two kinds of fingerprint apart by their bytes: the field says which it is."). Example: a body `[h'<32 bytes>', [h'<cmip>', null]]` passes alone, under either meaning.

**Size**: a row (what a fingerprint is of); no code.

**Vectors**: invalid cases 34, 35, 93, 95 and 97 keep their answers. The vectors' bodies are stand-ins, the SHA-256 of a label (the vectors' README: "Every identity, binding, cMIP, word, envelope, settlement and unit here is a stand-in") [traced]. Alone they still pass; held with other acts, see E25.

### The set of acts (a row of E5, or E26)

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

### E6. An identifier

**The rule**: "**E6. An identifier** ... of a keeper or of a clock is `hash`. Anything else is rejected, under E6." The keeper's preimage is open; the clock's 32 bytes are kept, **[lead]**, and whether key 9 stands is open.

**Replaces**: E6 of encoding 2, "**E6. An identifier** of a place or a clock is `hash`" [traced].

**The code it meets**: terms.rs:492 (key 8, "the place's identifier", E6), terms.rs:493 (key 9), terms.rs:261 and terms.rs:286 (`place`, `PLACE`) [traced].

**What the checker answers differently**: for one entry, nothing: a keeper is 32 bytes, as a place was. What changes is key 8's form, under E19's map below. Example: key 8 holding the text `"relay.example"` is **rejected**, E6, today and under both readings of its form.

**Size**: a word (place to keeper); the form is E19's.

**Vectors**: invalid case 36 ("a place that is not an identifier", key 8 a text string) keeps its answer under both readings [counted: `facts.py`, key 8 is a 16-character string]. New: see E19.

### E7. A socket

**The rule**: "socket = [ cmip: any, params: any ]   ; exactly two items", "An **empty socket is the field left out**".

**Replaces**: E7, the same; the defaults cited to 5.4.1, 5.5.5(a), 5.11.2 [traced].

**The code it meets**: mod.rs:168 to 194 [traced].

**What the checker answers differently**: nothing. Example: `in_force: 7` is **rejected**, E7, as today.

**Size**: none. **Vectors**: invalid cases 37, 38 and 44 keep their answers.

### E8. The body

**The rule**: "body = [ words: any, socket ]   ; words: the Text act's act id (E5)". "The checker reads no words: what `words` names is tested only among the acts held (E25)."

**Replaces**: E8, the same bytes; `words` is now an act id [traced].

**The code it meets**: terms.rs:407 to 412 (decoding), terms.rs:549 to 553 (words or socket not a fingerprint: G2.1) [traced].

**What the checker answers differently**: alone, only the rule's number (G2.1 becomes 5.2.1). Example: a body `["https://example.org", [h'…', null]]` is **invalid**, 5.2.1 (today G2.1).

**Size**: a word (the rule's number).

**Vectors**: invalid case 39 keeps its answer; invalid cases 65 and 66 keep their verdict, their rule renamed.

### E9. A party

**The rule**: "party = [0, signer: hash] ... / [1, role] ... / [2, root: hash]". "Anything else is rejected, under E9".

**Replaces**: E9, the same [traced]. **The code it meets**: terms.rs:145 to 157 [traced].

**What the checker answers differently**: nothing. Example: `[0, "A"]` is **rejected**, E9, as today. **Size**: none. **Vectors**: invalid cases 40 and 41 keep their answers.

### E10. A role

**The rule**: the role map `{ ? 0 => any, ? 1 => any, ? 2 => socket }`, "each makes the Terms invalid (5.10.1)", "A `what` on a role of kind 4 is left unread (5.10.4)."

**Replaces**: E10, the same bytes, numbers renamed [traced]. **The code it meets**: terms.rs:123 to 133 (decoding), terms.rs:566 to 596 (the role's cases), terms.rs:578 to 581 (the note) [traced].

**What the checker answers differently**: only rule numbers (G10.1 is 5.10.1, G10.4 is 5.10.4, a spot's cMIP G2.1 is 5.2.1). Example: a role `{0: 0, 2: [h'…', null]}` with no `what` is **invalid**, 5.10.1.

**Size**: a word. **Vectors**: invalid case 42 keeps its answer; invalid cases 69 and 73 to 79 keep their verdict, rule renamed; valid case 6 keeps its pass, its note renamed.

### E11. In whose name

**The rule**: "who = [0, signer: hash] / [2, root: hash]". It no longer serves a report's line [traced: encoding 3, section 12].

**The code it meets**: mod.rs:196 to 229 (`Who`), used also by report.rs [traced].

**What the checker answers differently**: nothing for a Statement. Example: `for: [1, {…}]` is **rejected**, E11, as today. **Size**: a removal (the report's use goes with E22). **Vectors**: invalid case 92 keeps its answer.

### E12. The receiver

**The rule**: "receiver = [0, position: uint] ... / [2, root: hash]"; "A position that names a party named as an agreement is **rejected**"; a position beyond the list is "**not shown** (5.1.4 ...); the checker gives it as a note."

**Replaces**: E12, the same [traced]. **The code it meets**: terms.rs:434 to 446, terms.rs:531 to 535, terms.rs:615 to 622 [traced].

**What the checker answers differently**: only the note's number (G1.4 is 5.1.4). Example: `receiver: [0, 7]` with one party: **pass**, note 5.1.4.

**Size**: a word. **Vectors**: invalid cases 45 to 50 keep their answers; valid case 10 its pass, note renamed.

### E13. Authors

**The rule**: "authors = [+ uint]"; "A position beyond the list, or one naming a party named by role or as an agreement, makes the Terms **invalid** (5.3.1: "an author is never a party named by role, and never one named as an agreement")."

**Replaces**: E13 of encoding 2, whose invalid case was only "A position beyond the list, or naming a party named as an agreement" [traced].

**The code it meets**: terms.rs:399 to 406 (decoding), terms.rs:600 to 609 (the case: beyond the list, or an agreement; a role falls to `_ => {}` and passes) [traced].

**What the checker answers differently.** *Plain words:* draft 25 let an author be a role (a spot for someone not yet known); draft 26 does not: an author is a known signer (5.3.1). Example: parties `[[1, {0: 0, 1: h'…', 2: [h'…', null]}]]`, authors `[0]`, `in_force` present: today **pass** (valid case 7); under encoding 3 **invalid**, 5.3.1.

**Size**: a rule (one more invalid case).

**Vectors.** Change answer: valid case 7 ("no party named as a signer, an author named by role"), **pass** to **invalid** 5.3.1; valid case 1 ("every optional field"), whose author at position 2 names a role, **pass** to **invalid** 5.3.1, unless key 8 rejects it first (E19 below) [counted: `facts.py`]. Invalid cases 43 and 44 also name a role as author, but are rejected before the grammar (E4, E7): unchanged. Invalid cases 70 and 71 keep their verdict, rule renamed. Valid case 7 is then retired as a passing case (its name says it tests that an author may be a role). New:
- an author naming a role, `in_force` present: **invalid**, 5.3.1;
- a passing Terms act with no party named as a signer cannot be written any more, since its author must be a signer [inferred from 5.3.1 and E19's required `authors`].

*Not in encoding 3, and in the ledger since 16:50:* "a Terms act whose `authors` leaves its signer out is invalid" (the MOR lead's arrived-at line, "to check", on his "Absolutely. The person publishing the act is by default an author, the rest adds signature later"). Neither draft 26 at `d4373f0` nor encoding 3 says it [counted: no such sentence in either file]. If draft 26 takes it, the checker compares the outside's signer (act.rs:81) with the identity hashes of the parties `authors` names, and three of today's passing Terms acts change: valid case 7 (already invalid above), valid case 12 ("a second version of the same Terms, by another signer"), and the third act held in valid case 43, not the case's answer [counted: `facts.py`]. See the questions at the end.

### E14. A power

**The rule**: "power = [ kind: 0 / 1 / 2 / 3 / 4 / hash, rule: socket ]"; kind 4 "gives no power and is left unread (a note), not rejected".

**Replaces**: E14, the same [traced]. **The code it meets**: terms.rs:199 to 214, terms.rs:420 to 433, terms.rs:560 to 565 [traced].

**What the checker answers differently**: the note's number (G5.2 is 5.2.3). Example: `powers: [[4, [h'…', null]]]`: **pass**, note 5.2.3.

**Size**: a word. **Vectors**: invalid cases 54 to 57 keep their answers; invalid case 68 its verdict, rule renamed; valid cases 19 (note renamed) and 20 unchanged.

### E15. A Statement's kind

**The rule**: "kind = 0 / 1 / 2 / 3 / [ cmip: hash, params: any ]".

**Replaces**: E15, the same [traced]. **The code it meets**: statement.rs:54 to 66 [traced].

**What the checker answers differently**: nothing. Example: `kind: 4` is **rejected**, E15. **Size**: none. **Vectors**: invalid cases 86 and 87 keep their answers.

### E16. A call

**The rule**: "call = [ task: 1..8, from: 0 / 1 / 2 ]"; "**One call per task**"; "these bytes are encoding 2's, kept until the MICS gives a call's bytes".

**Replaces**: E16, the same bytes; the report's naming of the payer's call goes [traced].

**The code it meets**: terms.rs:447 to 477 [traced].

**What the checker answers differently**: nothing. Example: two calls for task 6 are **rejected**, E16. **Size**: none now; a value form later, when the MICS gives a call's bytes (part C). **Vectors**: invalid cases 58 to 60 and valid case 14 keep their answers.

### E17. `previous`

**The rule**: "previous = [] / [hash]   ; [] for none: the signer's first act in this agreement".

**Replaces**: E17, the same [traced]. **The code it meets**: mod.rs:315 to 327 [traced].

**What the checker answers differently**: nothing. Example: `previous: [h'…', h'…']` is **rejected**, E17. **Size**: none. **Vectors**: invalid cases 19 and 20 keep their answers.

### E18. Lists

**The rule**: "**No empty list.** ... absent means none (no power, no call, no keeper, nothing relied on)"; "**Sets are sorted.** `authors`, `relies_on`, `powers`, `calls`, `answers` and `resolves` are sets"; "**The keeper field.** **Open**: whether its list ... is a set, sorted and each keeper once, as the lists above; or keeps the writer's order, as `parties` does."

**Replaces**: E18 of encoding 2, which listed "a report's `relies_on`" among the sets and "a report's `lines`" beside `parties` [traced].

**The code it meets**: mod.rs:251 to 259 (`list_of`), mod.rs:263 to 274 (`check_set`), mod.rs:278 to 285 (`check_distinct`) [traced].

**What the checker answers differently**: for every list verifier 2 has, nothing. The keeper list is new (E19 below). Example: `authors: [1, 0]` is **rejected**, E18, as today.

**Size**: a removal (a report's two lists) and, with the keeper, a field.

**Vectors**: invalid cases 52, 53, 57, 61 to 64 and 94 keep their answers; invalid cases 107 and 108 (a report's lists) retire with E2. New: see E19.

### E19. Presence, and the Terms map

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

### E20. Presence in a Statement

**The rule**: "`agreement`, `terms`, `kind` and `previous` are required."; "`for` and `under` are written together, or neither."; "**A resolve** (kind 3) carries `resolves` and `continues`".

**Replaces**: E20, the same; `resolves` written as "the list of the tips' ids" [traced].

**The code it meets**: statement.rs:189 to 231 [traced].

**What the checker answers differently**: nothing. Example: an assent with `content` is **rejected**, E20. **Size**: none. **Vectors**: invalid cases 82 to 85, 88 to 91, 96 and 98 to 102 keep their answers; valid cases 22 to 33 their passes (case 31's note renamed).

### Section 6: the report (E21 and E22 gone)

**The rule**: "A report is the MICS's act type, defined once, in the MICS's report block"; "This text gives a report no bytes"; "E21 and E22 (the report and its lines) are gone, and their numbers are not given again".

**Replaces**: E21 (the report) and E22 (lines) of encoding 2 [traced].

**The code it meets**: report.rs, all 201 lines (`Report`, `CallRef`, `Line`, `Amount`); mod.rs:44 (their export); check.rs:148, check.rs:152 to 154, check.rs:178, check.rs:187, check.rs:203 to 205; held.rs:98 to 103 and held.rs:172 to 184 (the grammar side reads reports, for sessions 1 and 2) [traced].

**What the checker answers differently**: a report is **not this encoding** (E2). Example: valid case 35 ("a doer's leg report, every kind of line"): **pass** today; **not this encoding** under encoding 3.

**Size**: a removal: two rules, one file.

**Vectors**: retired, with E2's count: valid 34 to 36, invalid 103 to 111. Invalid case 114 ("previous names a report") keeps its verdict, **invalid** (its rule renamed 5.7.1): the report held is now an act of another specification, which 5.7.1 also makes invalid; its name should say so [inferred: check.rs:254 to 255 gives the reason "an act that is no Terms act and no Statement" for any act not decoded as one].

### E23. `previous` among the acts held

**The rule**: "**The same agreement.** An act is within the agreement its `agreement` field names"; the first Terms act "is within the agreement it is the root of: its own act id"; "Otherwise the act is **invalid** (5.7.1): `previous` names an act of another signer, an act within another agreement, a report, a payment, an act of another specification (a Text act among them), or an act held that is **rejected**".

**Replaces**: E23 of encoding 2, the same test, with a payment and a Text act named [traced].

**The code it meets**: check.rs:228 to 276 (`check_held`), check.rs:112 to 118 (the agreement an act is within), check.rs:238 (an act that is no Terms act and no Statement) [traced].

**What the checker answers differently**: only the rule's number (G6.1 is 5.7.1). *Plain words:* Ana's assent names, as her previous act in the agreement, the Text act with her words. That is an act of another layer, so the assent is invalid. Verifier 2 already says so: a Text act is "not this encoding", and anything not decoded as Terms or a Statement makes the act invalid. Example: Text act T (Ana), then Ana's assent with `previous: [T]`: **invalid**, 5.7.1, today (as G6.1) and under encoding 3 [inferred from check.rs:238 and check.rs:254].

**Size**: a word.

**Vectors**: valid cases 37 to 43 keep their passes (39 and 40 their notes renamed); invalid cases 112 to 115 their verdicts, rule renamed. New:
- `previous` names a Text act held: **invalid**, 5.7.1;
- `previous` names a Money act held (a payment): **invalid**, 5.7.1.

### E25. The act `body` names (new)

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

### E24. One signing

**The rule**: "Statements whose payloads have the same bytes under the keys 0 (`agreement`), 1 (`terms`), 2 (`kind`), 3 (`content`), 4 (`for`), 5 (`under`), 9 (`settlement`), 10 (`resolves`) and 11 (`continues`)".

**Replaces**: E24, the same; its building paragraph now says no code is written for encoding 3 [traced].

**The code it meets**: statement.rs:115 to 125 (`ONE_SIGNING`), statement.rs:249 to 253 (`one_signing`) [traced].

**What the checker answers differently**: nothing. **Size**: none. **Vectors**: none (no vector tests it alone).

### Section 9: the checker's order

**The rule**: step 7, "**Invalid** (draft 26, §4.4, cases 2 to 8)": case 2 (5.2.1, then 5.2.2 with several acts), case 3 (roles), case 4 (5.4.2), case 5 (5.3.1), case 6 (5.7.1), case 7 "not given", case 8 "**open**". Step 6 reads "E4 to E20".

**Replaces**: encoding 2's step 7, "in section 4's order, then G6.1" [traced].

**The code it meets**: terms.rs:541 to 627 (`Terms::grammar`: G2.1, the roles, G4.2, G3.1, in that order, which is cases 2, 3, 4 and 5), check.rs:184 to 193, check.rs:264 to 270 [traced].

**What the checker answers differently**: the order of the one-act cases is the same [traced: terms.rs:549 to 609 against §4.4]. The change is E25's place inside case 2, above. Case 8 is given by no checker under either reading until item 11 of part B is chosen.

**Size**: a rule (the place of E25). **Vectors**: invalid cases 79 and 80 keep their order, rules renamed.

---

## B. The twelve byte choices

Encoding 3, section 11: "Open in this text, not yet chosen". Each item: the choice and where else it is open; the readings; what each costs; which makes two honest writers write the same bytes; **the session's proposal**. *Two honest writers* means two people who mean the same thing.

### 1. The set's label

1. **The choice**: "The set's label." Also open in the trace (M8's "Open", 1: "the tag text for `tagged_hash`") and draft 26, §7 ("**The set of acts: its hash and its label** ... Fixed by the encoding (encoding 3)").
2. **Readings**: any tag string beginning `MOR/`, since Identity says "Every tag the core uses begins with `MOR/`" and lists them (Identity draft 16, "Encoding and conventions").
3. **Costs**: a verifier, one constant; a client, the same constant; a stranger, nothing to compute until the string is printed. Identity's list of tags must name it too [traced: Identity draft 16 lists every tag the core uses].
4. **Same bytes**: only a printed string does; until then every writer picks their own and every set has as many values as writers (the round's three readers, the ledger's "three honest readers turned one list of acts into different fingerprints").
5. **The session's proposal**: the tag `MOR/act-set`, listed in Identity's tags beside `MOR/act`. *Reason:* it names what it hashes, in the pattern of the core's tags (`MOR/act`, `MOR/mmr-leaf`), and no tag in use is a prefix trap for it.

### 2. How a set's members are joined

1. **The choice**: "How a set's members are joined." Also: the trace, M8's "Open", 2; draft 26, §7, "**The empty set**" ("How its value is written").
2. **Readings**: (a) the sorted 32-byte ids concatenated, nothing between (the MOR lead's "joined"); (b) the deterministic CBOR array of the ids.
3. **Costs**: (a) a verifier calls `tagged_hash_parts` (hash.rs:45) with the ids; the empty set is the label over no bytes. A stranger might join with separators or hex text, as the round's readers did. (b) a verifier encodes an array first; the empty set is the label over the byte `80`. A stranger might write the ids as text, or as a map. Neither costs a client more than a line.
4. **Same bytes**: either, once chosen. Members are all exactly 32 bytes, so (a) has no ambiguity of where one ends; (b) adds a header that carries no information here.
5. **The session's proposal**: (a), concatenated. *Reason:* fixed-size members need no framing, it is the recipe as the MOR lead first set it out, and the core already hashes parts this way.

### 3. Where the set's rule stands

1. **The choice**: "Whether the set's rule is a row of E5 or an E-rule of its own (E26)." Also: the trace, M8's "Open", 3; the sheet of 26 November, line 16 ("one row of encoding 2's E5 table or one new E-rule"). Not in draft 26, §7.
2. **Readings**: (i) a row of E5's table; (ii) E26.
3. **Costs**: no checker answer today, since no field holds one (item 4). If a field ever does, the rule a "rejected" answer names is E5 under (i), E26 under (ii) (the stranger's point 4, part D). A stranger looks for a recipe in E5's table of what each fingerprint is of under (i), in a rule of its own under (ii).
4. **Same bytes**: the bytes are the same under both; only a rule's name can differ.
5. **The session's proposal**: (ii), E26. *Reason:* the set is a computation in five steps, not a row of E5's table of what each fingerprint is of, and "One fault, one rule" then has one rule to name.

### 4. Which fields may hold a set's value (for Nobody, allegedly, too)

1. **The choice**: "Which fields may hold a set's value (none in this text, as draft 26, §7, says)." Also: the trace, M8's "Open", 4, and "For the text", 1; draft 26, §7, "**Which fields take the set form** (§4.1). Whether any field of §4.2 or §4.3 holds a set of acts as one value; in this text none does."
2. **Readings**: (a) none: only a cMIP's own parameters hold one, read by that cMIP; (b) a field of Terms or a Statement takes the set form (draft 26, §4.1, names "a body's evidence" as one use).
3. **Costs**: (a) no code. But a writer who puts a set's value in `relies_on` writes 32 bytes the verifier reads as an act it does not hold: whatever rests on it is unchecked, "I don't know", never a yes, never a no (the grammar's `lacking_in`, grammar/mod.rs:292) [inferred]. (b) a field that says it holds a set: a new key, read as no knot; a verifier must know which fields hold sets; vectors for each.
4. **Same bytes**: (a) leaves room for two: one writer puts the set in `relies_on`, another in a cMIP's parameters. (b) gives one place, once the field is named.
5. **The session's proposal**: (a), none, as draft 26 says. *Reason:* it is draft 26's own reading, and a misplaced set fails safe, as "unchecked".

**Question for Nobody, allegedly** (plain words, for a phone):
> A group of acts can be named by one fingerprint. Should Terms or a Statement have a place for one? Today only a rule's own settings can hold it. If someone puts one where acts are named, the verifier sees an act it doesn't have, and answers "I don't know" for whatever rests on it.
>
> *The session's lean:* no place in Terms or Statements, for now; only a rule's settings.

### 5. The keeper field's form

1. **The choice**: "The keeper field's form, for one keeper and for several." Also: the trace, M8's "Open", 5. Not in draft 26, §7; draft 26, §4.2, `keeper`: "one keeper or several, each by the identifier the layer that orders acts gives it".
2. **Readings**: (i) always a list, `[+ hash]`; (ii) `hash` for one, `[2* hash]` for several.
3. **Costs**: (i) a verifier parses one form; verifier 2's bare hash at key 8 is refused, so valid case 1 changes (E19). A stranger who writes one keeper as a list is right. (ii) two forms to parse and one more rejection (a list of one); today's bytes pass. A stranger who writes `[h]` for one keeper is refused.
4. **Same bytes**: both give one byte form per meaning, (ii) by refusing `[h]`. (i) leaves less to get wrong: the stranger saw the split exactly here (part D, point 5).
5. **The session's proposal**: (i), always a list. *Reason:* one form whatever the count; nothing to get wrong when a second keeper is added.

### 6. Whether the keeper list is sorted

1. **The choice**: "Whether the keeper list is sorted." Also: the trace, M8's "Open", 6, and its blind reader ("whether two keepers written out of order are rejected (Open 6)").
2. **Readings**: (a) a set, sorted, each once (E18); (b) the writer's order, as `parties`.
3. **Costs**: (a) `check_set` (mod.rs:263), already written; a client sorts. (b) a duplicate check only; but the same two keepers have two byte forms, so two act ids for one meaning.
4. **Same bytes**: (a) does; (b) leaves room for two. Draft 26 gives keepers no order: 5.8.3 reads "where they agree", and the ledger: "If the terms stipulate two keepers, both keepers are needed."
5. **The session's proposal**: (a), sorted, each once. *Reason:* the order means nothing, so, as every such list in encoding 3, it is written in one order.

### 7. What a keeper's identifier is the hash of

1. **The choice**: "What a keeper's identifier is the hash of." Also: the trace, M8's "Open", 7, and "For the text", 6 ("no layer gives one, so E6's keeper preimage cannot be fixed from the text"); draft 26, 5.8.1.
2. **Readings**: (a) the keeper's identity hash, as a signer is named; (b) opaque 32 bytes until the layer that orders acts gives keepers an identifier.
3. **Costs**: the byte checker answers the same under both (32 bytes). The grammar verifier, under (a), can tie a keeper's record to the keeper named, since a keeper lodges signed records (draft 26, §3.4, "**Keeper's record**"); under (b) it needs a table from elsewhere, as verifier 2's stand-in `places` (grammar/layers.rs:305). A stranger, under (b), does not know what to write.
4. **Same bytes**: (a) gives one value per keeper; (b) leaves it to each writer.
5. **The session's proposal**: (a), the identity hash, unless the layer that orders acts gives another before draft 26 is final. *Reason:* the keeper signs its records, and its identity is the one name the bytes can check.

### 8. Whether key 9 stands as 32 bytes (for Nobody, allegedly, too)

1. **The choice**: "Whether key 9 stands as 32 bytes." Also: the trace, M8's "Open", 8; draft 26, §7, "**How Terms name their clock** ... What identifies a clock, and whether the `clock` field stands as written."; the MOR lead's note of 27 November: "**Back to him, if draft 26 meets them:** how Terms name their clock".
2. **Readings**: (a) keep key 9, 32 bytes, as encoding 2 had it; (b) a richer form now (a chain and a position, say); (c) no key 9 until a layer gives clocks.
3. **Costs**: (a) nothing changes; what the 32 bytes name is unknown, so each writer may mean something else by them. (b) a form nobody has defined yet. (c) valid case 1 (it carries key 9) is **rejected**, E4; and no Terms can name a clock, so every Terms act naming a cMIP that needs one is invalid (5.8.6), every time-limited sale with it: against "The clock specified in the agreement and its anchoring." [inferred].
4. **Same bytes**: (a) fixes the form, not the meaning; (c) fixes nothing to write.
5. **The session's proposal**: (a), keep key 9 as 32 bytes. *Reason:* Terms must be able to name their clock now, and a richer form later is a new specification, as encoding 2 said.

**Question for Nobody, allegedly**:
> Terms can name their clock today with a 32-byte name, though no text yet says what a clock is. Keep that field, or remove it until clocks exist? Removing it means no Terms could name a clock, so every sale "for a month" would be refused.
>
> *The session's lean:* keep it.

### 9. A `words` act held without its key, or not held: a note or nothing (for Nobody, allegedly, too)

1. **The choice**: "Whether a `words` act held without its key, or not held, gives a note or nothing." Also: the trace, M8's "Open", 9, and "For the text", 4; the MOR lead's settled reading of Q24 and Q25: "The verifier need not hold the words to answer the grammar's questions; K1 reads them."
2. **Readings**: (a) a note: whether the act is a Text act is unchecked (as E23 gives for `previous`); (b) nothing: the grammar does not read the words.
3. **Costs**: (a) a verifier keeps which ids it holds (it does, for E23) and adds a note; every vector of Terms held with other acts but not their words carries it; a stranger must know when a lone act counts as "held" (part D, point 3). (b) no code; but a missing words act and a present one give the same output.
4. **Same bytes**: the bytes are not at stake, the answer is: two checkers that choose differently give different `notes`, so the vectors cannot be shared until it is chosen.
5. **The session's proposal**: (a), a note, and only when the checker is handed several acts, as E23's note is (check.rs:248). *Reason:* draft 26 answers **unchecked** where "the verifier lacks something it needs to apply a grammar rule: a cMIP the Terms name, or an act named in a field that it does not hold", and 5.2.2's test needs that act.

**Question for Nobody, allegedly**:
> Terms point to the act holding their words. If the verifier doesn't have that act, or can't open it, should it say “I couldn't check the words are a Text act”, or say nothing, since it never reads the words?
>
> *The session's lean:* say it, as "I don't know", when it is checking several acts together.

### 10. Which spec hashes are `TEXT` (for Nobody, allegedly, too)

1. **The choice**: "Which spec hashes are `TEXT`." Also: the trace, M8's "Open", 10; draft 26, §2: "**Text, draft 11.** The Text act (rule 14), which carries the words of Terms." Text draft 11: "A text act is an Envelopes MIR act of `type` 0 under the hash of this MIR, written `TEXT`."
2. **Readings**: (a) Text draft 11's hash alone; (b) the hashes of every Text draft, listed in the encoding; (c) as (b), and an act under a spec hash the checker does not know at all gives a note, not invalid.
3. **Costs**: (a) one constant; words published under any other Text draft (earlier, or the frozen one) make the Terms invalid when held, so every new Text draft would need a new Agreements encoding. (b) a list, grown with each Text draft; each draft's payload format checked as that draft gives it (the core's `text::check_act` is draft 8's). (c) as (b), plus a third outcome; a checker that does not know a new Text draft does not call its words invalid.
4. **Same bytes**: the writer's bytes do not change; two checkers with different lists answer differently, invalid against pass, for the same acts.
5. **The session's proposal**: (b), every Text draft's hash, listed. *Reason:* the words are text whatever Text draft carried them, and invalid must not depend on when someone published.

**Question for Nobody, allegedly**:
> Terms point to the Text act holding their words. Text has had several drafts, each with its own fingerprint. Should only Text acts made under today's draft count as words, or Text acts of any draft?
>
> *The session's lean:* any Text draft, listed by name.

### 11. Case 8: how a cMIP's declared needs are read, and by whom (for Nobody, allegedly, too)

1. **The choice**: "How a cMIP's declared needs are read, and by whom (case 8)." Also: the trace, M8's "Open", 11, and "For the text", 3; draft 26, §7, "**How a cMIP declares what it needs** (5.8.6, §6). Where, and in what form, a cMIP states that it needs a clock or a keeper."; the MOR lead's note (Q26): "What a cMIP declares it needs is part of its spec: a line for Development to carry."
2. **Readings**: (a) the checker is handed, beside the acts, what each cMIP declares it needs; (b) the case is the grammar verifier's, which holds the cMIPs.
3. **Costs**: (a) a new input to the checker; two checkers handed different tables answer differently for the same bytes; its vectors carry the table. (b) the byte checker never gives case 8; the grammar verifier gives **invalid** 5.8.6 where it holds the cMIP's text and **unchecked** where it lacks it. With the ledger's "A specification is a Text act, named by its id" (14:47 to 14:52), the declaration would be in an act a verifier can hold [inferred].
4. **Same bytes**: no byte of a Terms act is at stake; (a) lets the answer depend on the table each checker was handed.
5. **The session's proposal**: (b), the grammar verifier's. *Reason:* the need is in the cMIP's text, which the byte checker never reads.

**Question for Nobody, allegedly**:
> If Terms use a rule that needs a clock but name no clock, they are invalid. Where should the verifier learn that the rule needs a clock: from the rule's own published text, read by the full verifier, or from a list handed to the quick byte checker?
>
> *The session's lean:* from the rule's own text, the full verifier's job.

### 12. `SPEC_DRAFT_26`

1. **The choice**: "`SPEC_DRAFT_26`: not a choice; computed by M11 once the text was final, and given in E2. *For the codemeister, who checks it.*" Also: the trace, M8's "Open", 12.
2. **Readings**: none.
3. **Checked**: recomputed by `spechash.py` from `draft-26.md` at `d4373f0`: `e9e5b6837c10fd310157cc2a620ba268e3c3684efdb0e3ba68af068701e0e214`, as E2 gives; the file's SHA-256 also as given [counted].
4. **Same bytes**: yes, for that file. Wave four changes the file, so the hash too (E2 above).
5. **The session's proposal**: recompute it once wave four's edits are in, and keep a test that recomputes it from the file, as mod.rs:363 to 367 does today. *Reason:* one changed byte is another specification.

---

## C. What draft 26 asks of the layers below

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

## D. A stranger's reading

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

## Totals

**E-rules** [counted by eye against encoding 3, sections 2 to 9 and 12]:
- In encoding 3: 23 rules (E1 to E20, E23, E24, E25), and the set of acts (a row of E5 or E26).
- Changing what the checker answers: 5: E2 (the spec hash; a report not this encoding), E13 (an author by role invalid), E19 (key 8's form; the note on an update's `in_force`), E25 (new), and section 9's place for E25. E6 and E18 change with E19's key 8.
- New: 2: E25, and the set of acts (no checker answer until a field holds one).
- Retired: 2: E21, E22.
- Unchanged in answer, numbers renamed or cited anew: E1, E3, E4, E5, E7 to E12, E14 to E17, E20, E23, E24.

**Vectors** (regenerated under `SPEC_DRAFT_26`; 160 today) [counted: `count.py`, `facts.py`, by name for the rest]:
- Change answer (verdict or first rule): 3 for sure: valid 7 (**invalid** 5.3.1), valid 1 (**rejected** E6 under keeper reading (i), else **invalid** 5.3.1), invalid 8 (**not this encoding**, or retired). One more if draft 26 takes "the signer of a Terms act is an author": valid 12.
- Rule or note renamed, verdict kept: 28.
- Retired: 12 (valid 34 to 36; invalid 103 to 111), and valid 7 as a passing case.
- New, none written: 2 (E2), 5 (the set), 9 to 11 (key 8 and E19, depending on items 5 and 6), 1 (E13), 2 (E23), 8 (E25): 27 to 29.
- As bytes, unchanged files: 153 of 160 answer "not this encoding".

## Questions, those that would change a verifier's answer first

1. **Key 8, one keeper** (part B, item 5). Encoding 3: "reading (i): one form, a list always", "reading (ii): two forms, told apart by their bytes". Readings: (i) `[h]`; (ii) `h`. A first Terms act naming one keeper passes under one and is rejected under the other. *The session's lean:* (i).
2. **An author named by role** (E13), not a choice but a change to two passing vectors: draft 26, 5.3.1, "an author is never a party named by role". Recorded for session 4, so the vectors move with it.
3. **The signer among the authors.** The ledger, 16:48 to 16:50, arrived at (to check): "a Terms act whose `authors` leaves its signer out is invalid". Not in draft 26 at `d4373f0` nor in encoding 3. Readings: in draft 26 (a new invalid case, by the outside's signer against `authors`), or not. Changes valid 12 to invalid. *The session's lean:* it goes into draft 26 and E13 with wave four; the scribe's to carry, the lead's to confirm.
4. **Which spec hashes are `TEXT`** (item 10), invalid or pass for the same acts. *The session's lean:* every Text draft, listed.
5. **Words not held, note or nothing** (item 9), the `notes` of every held vector of Terms. *The session's lean:* a note, with several acts only.
6. **Case 8** (item 11), invalid from the grammar verifier or from a table handed to the checker. *The session's lean:* the grammar verifier's.
7. **Key 9** (item 8), passes or rejected. *The session's lean:* keep it.
8. **The keeper list sorted** (item 6), rejected or pass for two keepers out of order. *The session's lean:* sorted.
9. **Fields holding a set** (item 4); items 1, 2, 3, 7 and 12 change no answer today.

## What this session could not tell

- Whether wave four's edits to draft 26 touch any byte rule beyond the signer-as-author (question 3): draft 26 at `d4373f0` predates them [inferred].
- What the MICS's report block will give as a call's bytes: E16 stands on encoding 2's form (part C, item 7).
- Whether the generator, rerun under `SPEC_DRAFT_26`, would keep every other case's answer: read, not run; no encoding 3 code exists.
- Whether `text::check_act` (written to Text draft 8) matches Text draft 11's Text act: the payload rule reads the same (field 0 a text string, field 1 a 32-byte hash, no other); the objects rule differs in wording (draft 11 names two cases) [traced to both texts; not checked by code].

## The scripts

All in the session's scratchpad, not in the repository; each reads only the files named.

- `count.py`: reads `valid.json` and `invalid.json` at `f1a13feb`; counts the cases, those that reach the spec hash check, and those naming a draft 25 rule.
- `dump.py` and `facts.py`: open every act of both files (with `core/vectors/check.py`'s CBOR and lock), list each payload's keys; find key 8's form, `in_force` with `replaces`, authors naming a role, and Terms whose signer is no author.
- `spechash.py`: recomputes `SPEC_DRAFT_26` and `SPEC_DRAFT_25` by encoding 3's recipe, and the plain SHA-256.
- `quotes.py`: checks every quotation of this file against the files it quotes.
- `cites.py`: checks every `file:line` cited here exists at `f1a13feb`.
