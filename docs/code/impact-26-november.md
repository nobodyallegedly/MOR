# What the answers of 26 November would change in verifier 2 and encoding 2

*The codemeister's sheet, written by a session under it: a record of work, not a decision. Nothing here is built, and nothing is decided. Every reading is a question; a lean is labelled as the session's.*

The wish of this stint, quoted from `docs/decisions.md` on main: "We need to change the current wish to updating the core after the findings" (26 November, 16:46).

## What this sheet is, in plain words

On 26 November, Nobody, allegedly, and the MOR lead went through the round's findings in seventeen exchanges, recorded in `docs/decisions.md` (from "A late version 3 is rejected" to "Wave two: check, then attack, then draft 26"). Each exchange closes with one or more lines marked "Arrived at (to check)": the MOR lead's reading of what was arrived at, not his words. This sheet takes each of those lines, one by one, and says what it would change in **verifier 2** (the code that reads a set of Agreements acts and answers "in force", "fork", "late", "unchecked" and the rest; branch `claude/agreements-verifier-2`, commit `f1a13feb`, pull request 184) and in **encoding 2** (the text that says how each act is written as bytes; branch `claude/agreements-clean-1-hahuwn`, pull request 183): which lines of code it meets, what a verifier would answer differently, how large the change is, which test vectors would give another answer, which new vectors would be needed, and what the code would still have to choose that the text does not say.

Nothing was changed to find this out. The verifier was run on its existing vectors to show today's answers; what it would answer after a change cannot be run, since no code changes, so every "after" is marked read or inferred.

**Precisely.** Code is cited as `path:line` at `f1a13feb`. Draft 25 is `docs/agreements-from-scratch/draft-25.md` and encoding 2 is `docs/agreements-from-scratch/encoding-2.md`, both at the tip of `claude/agreements-clean-1-hahuwn`; the draft 26 brief is `docs/agreements-from-scratch/draft-26-brief.md` on `claude/draft-26-brief-ucdzo3` (pull request 206); the build list is Part 4, section C, of `docs/agreements-from-scratch/review-1-impact-on-verifier.md` on main (rows T1 to T7, D1 to D9, R1 to R29). A grammar case is named by its position in `core/vectors/agreements-new/grammar.json`, counting from 0, and by its name. The round's findings are pull request 229 (`docs/code/round-2-verifier-answers.md`), pull request 232 (`docs/research/round-2-what-the-language-could-not-say.md`, "the research window") and pull request 226 (`docs/simulation/round-2-record.md`).

**How claims are marked.** **[traced]**: to a rule, a line of code or an act, which this session read. **[counted]**: by a script, named in "The scripts", at the end. **[inferred]**: this session's reading, with what would confirm it.

**What was run today** [counted]: `cargo test -p mor-core --locked` passes, 570 tests, none failing; `python3 core/vectors/agreements_new_grammar_check.py` (the case runner the vectors' README names) judges 115 of the 120 grammar cases again and agrees with every one, and names the five it does not judge (cases 71, 74, 91, 58, 59 by their rules G10.2, G10.6, G11.4, G4.11, G5.1(b)); `python3 core/vectors/agreements_new_check.py`: `all 163 agreements-new vectors agree`; `python3 core/vectors/check.py`: `all 569 vectors agree (391 verdict vectors judged here)`.

## The lines, in one table

Twenty-five lines marked "Arrived at" stand in the seventeen exchanges [counted]. One row each, in the ledger's order. The column of vectors that change answer counts existing vectors whose expected answer (its word and rule) would differ; "if" marks a count that rests on a question below.

| # | Exchange | The line, short | Size of the change | Vectors that change answer | New vectors | Questions |
|---|---|---|---|---|---|---|
| 1 | A late version 3 | Only a lacking act that could carry a knot leaves "late" unchecked | a rule | 0; case 31 if Q1 is read narrowly | 3 | Q1, Q2, Q3, Q4 |
| 2 | A late version 3 | Not to be used bare: a big warning | none in code | 0 | 0 | Q22 |
| 3 | Named signers, buyer by assent | They stay cMIPs | none | 0 | 0 | none |
| 4 | A hand count | Lacking a cMIP, the answer is only "unchecked" | none | 0 | 0 | none |
| 5 | A hand count | A closed door, not another way to the result | none | 0 | 0 | none |
| 6 | A resolve with nothing to resolve | "Not shown", with the reason | a word | 0 | 2 | Q10, Q11 |
| 7 | A buyer under a replaced version | What version 2 says decides | a rule | 0 | 2 | Q12, Q13 |
| 8 | The same | Protect the unknown parties: a filling has no say in updates | a rule | 0 | 3 | Q14, Q15, Q16, Q17 |
| 9 | The same | G10.6(b) goes | a removal | 0 (case 74 renamed) | 1 | none |
| 10 | The same | This replaces 18 November: G10.6 comes back with (a) only | a rule | 0 (case 74 renamed) | 1 | Q18 |
| 11 | Whose place counts | A place named only by a rule the parties never signed does not order their Terms | none | 0 | 0 | none |
| 12 | Whose place counts | "Protect the unknown party" is a principle | none in code | 0 | 0 | none |
| 13 | Protect the unknown party | It is an Agreements principle | none in code | 0 | 0 | none |
| 14 | A key change that waits | Nothing added to Identity | none | 0 | 0 | none |
| 15 | Knots of different kinds | Rule 34 stays | none | 0 | 0 | none |
| 16 | One way to name a set of acts | One byte form in Agreements' grammar | a new value form | 0 | 5 | Q19, Q20, Q21 |
| 17 | A sealed container | Nothing changes in the core | none | 0 | 0 | none |
| 18 | Valid means in force | One gate for an update; two valid updates are a race | a removal | 0; 4 if Q5 goes to "not shown" (cases 17, 21, 26, 27), 4 more if Q6 goes to (B) (cases 22, 23, 24, 28) | 3 | Q5, Q6, Q7, Q8, Q9 |
| 19 | The words of Terms | The words are a Text act, named by its act id | a rule | 0 | 2 | Q2, Q23, Q24 |
| 20 | The words of Terms | The Text act comes first | none in code | 0 | 0 | Q25 |
| 21 | "Before the close" | A simulation artefact; nothing changes | none | 0 | 0 | none |
| 22 | "Before the close" | No stated anchor, no condition in time | none in verifier 2 | 0 | 0 | Q26 |
| 23 | Two keys | Nothing added to Identity | none | 0 | 0 | none |
| 24 | Money's findings | They wait for the Money review | none | 0 | 0 | none |
| 25 | Wave two | The order of the wave | none | 0 | 0 | none |

One more line, in the exchange on "before the close", says how he answers (after each reply, more may follow); it is not marked as arrived at and touches no code, so it is not a row.

---

## 1. Only a lacking act that could carry a knot leaves "late" unchecked

**His words, and the line.**

> He: "Version 3 is the one the network needs to reject"

> He: "Probably right. This version of agreements is not to be used bare. Big warning needs to be placed on it."

> *Arrived at (to check, "probably right"):* a version 3 that names a version already replaced is rejected once the replacing version is in force. Only a missing act that could carry a knot (an act in a signer's own line, or an anchoring) leaves the answer unchecked; any other missing act does not. Where the replacing version was never pinned, it is a race: the change fails and the earlier version stays.

*Where the line says more than his words* [traced]: his words name version 3 only, and "Probably right" answers the MOR lead's reading. Three parts are the MOR lead's, from the week's rules: "only a missing act that could carry a knot"; "once the replacing version is in force", read in the exchange as "only once pinned"; and the race where version 2 was never pinned. The word "rejected" is the line's: draft 25 gives a late update no such word (it "replaces nothing, and is no tip of a fork", G4.7), and in encoding 2 and the vectors' README "rejected" is the checker's verdict for bytes that are no Agreements act.

**The code it meets** [traced]:
- `core/src/agreements_new/grammar/chain.rs:232`, `late_against`: by knots, then by anchoring; the acts named by the later update, and by each assent it needs, are gathered as "lacking" at `chain.rs:246` and `chain.rs:259`, and where any is lacking and nothing showed the update late, the answer is unchecked, `chain.rs:298` to `chain.rs:306`: `names an act this verifier does not hold ({}), which might be what shows it came late (G4.7(c), G9)`.
- `core/src/agreements_new/grammar/mod.rs:282` to `mod.rs:287`, `known`: a fingerprint is known if it is an Agreements act held, a piece declared, a payment or settlement, or an act of the envelope's chain; `mod.rs:292` to `mod.rs:295`, `lacking_in`: everything else named, and every act held unreadable, is lacking.
- `core/src/agreements_new/grammar/held.rs:63` and `held.rs:64`: an act handed that is rejected or of another specification (a Text post, for one) is put among the rejected, which `known` never reads; so a work held as its own Text act counts as lacking. `held.rs:72`, `hold_piece`, is the only way to tell the verifier that a fingerprint is no act, and the grammar vectors have no field for pieces [counted: no case of `grammar.json` carries one].
- `chain.rs:624`, `not_late`: a lateness left unchecked makes the agreement's chain unchecked from the original on (G4.8(e)).
- Encoding 2: none. No E-rule reads lateness.

**What a verifier would answer differently.** *In plain words.* Ana writes the Terms of her work, version 1, with Ben; version 2 replaces it, and both sign it, Ana's assent naming version 2 in her own line. Later Ana writes a version 3 that names version 1, not version 2, as the one it replaces, and relies on the work itself, a Text post. Dana holds every act, the Text post and the cMIPs, and asks which version is in force. Today the Text post is "not this encoding" to the verifier, so it counts as an act it lacks, and Dana is told "unchecked". Under the line, the Text post cannot carry a knot, so Ana's own line shows version 3 came after version 2 was in force: version 3 replaces nothing, and version 2 is in force.

*Precisely* [traced to the code; the "after" inferred]:
- Before: `last_version` of the root: **unchecked**, G4.8, its plain words naming the work as the act not held, `which might be what shows it came late (G4.7(c), G9)`.
- After: `update` of version 3: **shown**, G4.7, as shown, late, replacing nothing and no tip (G4.7(a)), as case 29 answers today; `last_version`: **shown**, G4.6, version 2.
- The round: entry 571 of the rerun count (pull request 229, 1b): root `db3ce515…`, version 2 `5b9e8c91…`, version 3 `bba99964…` naming the root in `replaces`, and the work `eeb5cef3…` in `relies_on`. Pull request 229 found it **unchecked** with the work not held, and **late**, as shown, with the work held as a piece [traced to pull request 229's table].

**The size.** A rule: G4.7(c)'s "might be what shows L came late" is narrowed to acts that could carry a knot. In code, `known` and `lacking_in` take in what they leave out today (an act held of another specification, at least); no field, no word, no act type.

**What it costs in vectors.**
- Existing: case 31, "an update that names an act the verifier does not hold, which might show it late: which Terms are in force is unchecked" (`last_version`, **unchecked**, G4.8). Its lacking act is a stand-in that is held as nothing at all, named in `relies_on` (`core/src/agreements_new/grammar/cases.rs:714`). Unchanged if a fingerprint held as nothing could carry a knot (the session's lean, Q1); otherwise **unchecked → fork** (version 2a and version 2c both valid, neither shown late) [inferred]. Cases 29, 30 and 65 do not move [inferred: they lack nothing].
- New (read, none run):
  1. A version 3 naming version 1, its `relies_on` naming a Text act held beside it (rejected as not this encoding by the checker): **late**, as shown, where today it is **unchecked**.
  2. The same with the work declared as a piece: **late**, as shown, which needs a `pieces` field in the grammar vectors' format (the library has one, `core/src/agreements_new/grammar/scenario.rs:60`; the file does not).
  3. The same with a private act held without its key named in `relies_on`: **unchecked**, since it could carry a knot.

**Choices the text does not make.**
- Q1. Can a fingerprint the verifier holds as nothing at all carry a knot, or must the verifier know what it is before it counts as lacking?
- Q2. Is an act the verifier holds and reads as another specification (a Text act, a Money act) "known", so that it is never lacking?
- Q3. Is *rejected* the word for a late update (the line's), or does a late update keep G4.7's answer, that it "replaces nothing, and is no tip of a fork", with no new word?
- Q4. The line's "once the replacing version is in force", read in the exchange as "only once pinned": does lateness wait on a pin that verifier 2 does not have (the brief's "In force once pinned", not built; no line of the code reads a pin [traced: no match for "pin" under `core/src/agreements_new/`])?

**The build list.** R5 ("A5: which lacking act might show it late", `chain.rs` `not_late`, `mod.rs` `lacking_in`): the line takes the row's other reading, "a narrower set"; it changes the row from a reading into a decision once draft 26 says so, and leaves open where the set ends (Q1, Q2). R1 (a late update's word) is left open by Q3. Pull request 229's Q2 is the same point; its lean (B) is the line's.

## 2. Not to be used bare: a big warning

> *Arrived at (to check):* this Agreements is not to be used bare, and carries a big warning saying so (as on 18 November: "Agreements is not to be used bare. It's to build on top of."). Where and how the warning is written is for the rewrite.

No code answers it: verifier 2 gives answers, and nothing in its output or its report says "not to be used bare" [traced: `core/src/agreements_new/grammar/mod.rs:1` to `mod.rs:29`, the module's own words, carry no such warning]. No vector moves. Whether the verifier's own output should carry the warning is Q22, for the rewrite.

## 3. Named signers and buyer by assent stay cMIPs

> *Arrived at (to check):* named signers and buyer by assent stay cMIPs, not grammar defaults. Agreements is treated almost as a language; the community's implementations write the rules. That a verifier or client should hold the common cMIPs so they can be checked is the MOR lead's wording, for Development, not yet asked.

The code already answers it: a cMIP not held is **unchecked** (`core/src/agreements_new/grammar/mod.rs:193` to `mod.rs:204`, `ask`), and no cMIP is read as the default (stub cMIPs exist for tests only, `core/src/agreements_new/grammar/stubs.rs`). No vector moves (cases 6, 118 and 119 stay **unchecked**) [traced]. Build list R13 (the default for `in_force`) is untouched.

## 4. Lacking a cMIP, the answer is only "unchecked"

> *Arrived at (to check):* where a reader lacks a cMIP the answer is only "unchecked". The core gives a hand reading no answer and no form of its own. Whether a client accepts other methods, in place of supporting the cMIP, is the client developer's choice. The MOR lead's (b) is not taken.

The code already answers it: `ask` turns a cMIP not held into **unchecked** (`mod.rs:197`), and the answer words have no form for a hand reading (`core/src/agreements_new/grammar/answer.rs:22`, `Word`). No vector moves [traced]. The round's hand count is `e42cb8e2…` (pull request 229, finding 3).

## 5. A closed door, not another way to the result

> *Arrived at (to check):* Terms made with a cMIP are read with that cMIP. A reader without it should find a closed door ("unchecked"), not another way to the result. In the round the way through was an app that supported the cMIP, and that is what was missing.

The same code as line 4 answers it; verifier 2 never stands in for a cMIP it lacks [traced: `mod.rs:193` to `mod.rs:203`]. No vector moves.

## 6. A resolve with nothing to resolve: "not shown", with the reason

**His words, and the line.**

> He: "Agreed. It’s a different reason for a “sorry can’t do” and it’s always good to state why"

> *Arrived at (to check):* a resolve that resolves nothing is answered "not shown", with the reason: nothing to resolve. "Unchecked" is kept for a reader that lacks something. Every refusal states its own reason.

*Where the line says more than his words:* "Every refusal states its own reason" widens his "it’s always good to state why" into a rule for every refusal; verifier 2 already gives a reason with every answer (`answer.rs`, `Answer::new` takes its words), so it costs nothing beyond this case [inferred].

**The code it meets** [traced]: `core/src/agreements_new/grammar/order.rs:334`, `resolution`. A resolving update of Terms that resolves a fork is answered at `order.rs:336` onward; a resolve in a signer's forked line at `order.rs:353`; anything else falls through at `order.rs:355` to `update`, which, for a Statement, answers at `order.rs:121`: **unchecked**, G4.8, "not held (G9)", though the act is held and read. Encoding 2: none (E20 gives a resolve's form, and is not touched).

**What a verifier would answer differently.** *In plain words.* Ana's line in the agreement has no fork. Following advice later withdrawn, she lodges a resolve naming her version 2 and version 3 and continuing version 3. Dana asks what it does. Today she is told *unchecked, not held*, as if the verifier lacked something. Under the line: *not shown: nothing to resolve, there being no fork in Ana's line among the acts held*.

*Precisely* [traced; the "after" inferred]:
- Before: **unchecked**, G4.8, "it resolves nothing, and is read as an act like any other (G12.3): not held (G9)".
- After: **not shown**, G12.3, with the reason: nothing to resolve.
- The round: the seven resolves at records 1026 to 1032; entry 571's is `06b0f886…`, naming `5b9e8c91…` and `bba99964…` (pull request 229, 1b and 1c).

**The size.** A word: the answer's word and rule for one path, `order.rs:355`; no rule of the grammar changes.

**What it costs in vectors.**
- Existing: none change. `resolution` is asked in cases 22 and 28 only, each a resolving update that does resolve a fork of Terms [counted]; no vector runs the path at `order.rs:355` (pull request 229, 1c, says the same).
- New: (1) a resolve Statement in an unforked line: **not shown**, G12.3, "nothing to resolve"; (2) a Terms act written as a resolving update where there is no fork, asked `resolution` (Q10).

**Choices the text does not make.**
- Q10. A Terms act shaped as a resolving update where there is no fork is "an act like any other" and may be a tip (G12.3; case 26): asked `resolution`, does it get "not shown, nothing to resolve", or its answer as an update, as today?
- Q11. Where the line is itself unchecked (an act it names is not held), is the answer still "unchecked", since then the reader does lack something?

**The build list.** Not on it. The nearest row, T4 ("Built on a tip" follows every field), touches `resolves` that resolve nothing for another answer, and is not settled. Pull request 229's Q3 and the research window's question 7 are this point; the line takes their (B).

## 7. What version 2 says decides, for a buyer under a replaced version

**His words, and the line.**

> He: "What are the terms of version 2? Would be my answer"

> *Arrived at (to check):* the Terms of the version she signed decide it, and the cMIPs they name. The grammar keeps her assent to version 2 as a signed fact; what it means once version 2 is replaced is whatever version 2 says.

*Where the line says more:* "The grammar keeps her assent to version 2 as a signed fact" is the MOR lead's; his words ask only what version 2's Terms say.

**The code it meets** [traced]: `core/src/agreements_new/grammar/order.rs:148`, `assent`, which at `order.rs:185` answers an assent to Terms that are not in force: **not shown**, G4.3, `counted in the name of {}, and it binds no one: {}`, the reason taken from `in_force`, which for replaced Terms begins `not in force: replaced by {}` (G4.9, `order.rs:77`). Draft 25, G4.3: "An assent binds its signer only while the Terms it names are in force." Encoding 2: none.

**What a verifier would answer differently.** *In plain words.* Carla buys a year of service under version 2, by her assent (the buyer cMIP fills a role with her). A month later Ana and Ben replace version 2 with version 3. Dana asks about Carla's assent. Today she is told it binds no one, since version 2 is no longer in force. Under the line, Carla's assent to version 2 stands as a signed fact, and what it gives her (a year, by version 2's words) is version 2's, read by the cMIPs version 2 names.

*Precisely* [the "after" inferred]:
- Before: **not shown**, G4.3, its plain words: counted in Carla's name, binding no one, the Terms replaced by version 3.
- After: not "binds no one" (the code's words); the word is open (Q12): **shown**, the assent counted, made under version 2, which is replaced, what it gives read from version 2 (K1, K5); or **unchecked** where the verifier lacks the cMIP version 2 names.
- The round: the buyers' assents behind entry 571, one to the root and three to `bba99964…` (pull request 229, 1d: exploratory, **not shown**, G4.3).

**The size.** A rule: G4.3's "binds its signer only while the Terms it names are in force" no longer holds for a buyer's assent to a replaced version.

**What it costs in vectors.** Existing: none change: `assent` is asked in cases 2, 40 and 118 only, none of them to replaced Terms [counted]. New: (1) a buyer's assent to a version since replaced, with the buyer's cMIP held; (2) the same without it: **unchecked**.

**Choices the text does not make.**
- Q12. What word does a verifier give a buyer's assent to a replaced version: "shown" with the version named, or a reading handed to the cMIP with no word of the grammar's?
- Q13. Is this for a buyer only (a filling, line 8), or for a known party's assent too, whom version 3 does bind (G5.1(c))?

**The build list.** No row. The research window marks it "a rule read two ways" (G4.3 against G10, its 1.d and 1.f) [traced].

## 8. Protect the unknown parties: a filling has no say in updates

**His words, and the line.**

> He: "Yes, and the what she bought creates different scenarios probably addressed differently under different cMIPs. We’re talking about the right to update terms on an ongoing agreement. Ana is a different class of participant, she is unknown at the time of creation of the agreement. Therefore, she has no say in the updating of it, only the known parties can. She should be protected. Version 2 is what she bought, and she has no say in the update. Let”s look at a service… it would protect her from terms being changed on her. If she bought for a month of service to an LLM for example, the deal is valid a month. If it was year, version 2 is valid a year. Protect the unknown parties."

> *Arrived at (to check):* protect the unknown parties. A participant who joins through a role after the agreement was made (a filling) has no say in its updates; only the known parties have. What she bought is the version she acted under, for as long as that version says (a month, a year). The scenarios of what is bought are the cMIPs'.

*Where the line says more:* the words in brackets, a filling, are the MOR lead's: his words say "unknown at the time of creation"; the line reads every participant who joins through a role as such.

**The code it meets** [traced]:
- `core/src/agreements_new/grammar/force.rs:473`, `signed_by`, "everyone who signed the original" (G4.8(a)): at `force.rs:486` to `force.rs:492`, a signer who fills a role of the original, by its K5 cMIP (`force.rs:525`, `role_fillers`), is counted among them; where the K5 cMIP is lacking and an outsider's assent is held, the answer is unchecked (`force.rs:491`).
- `force.rs:547`, `update_raw`: the default asks each of them (G4.11(e)); a named condition is handed them as `signed_original` (`force.rs:556`, `force.rs:557`).
- `core/src/agreements_new/grammar/order.rs:233` to `order.rs:239`, `bound`: a person is bound by an update without their own assent, G5.1(c), where `signed_by` of the version before holds them; a filling is.
- Encoding 2: none.

**What a verifier would answer differently.** *In plain words.* Ben's offer names Ben and a role, "whoever buys"; it names no update condition. Carla fills the role. Ben writes version 2 alone. Today the default asks everyone who signed the offer, Carla among them, so Ben's version 2 replaces nothing until Carla signs it; and where version 2 does replace (a condition that answers valid), Carla is bound by it without signing (G5.1(c)). Under the line: Carla has no say, so Ben alone can update the offer for those who come after; and Carla is not bound by version 2: she keeps the version she bought.

*Precisely* [the "after" inferred]:
- Before: `update` of version 2: **not shown**, G4.8, its plain words: by default everyone who signed the original signs an update, and no assent to it is held in Carla's name; `bound` (Carla, version 2) where a condition let it through: **shown**, G5.1(c).
- After: `update`: **valid**, G4.11, by default; `bound` (Carla, version 2): **not shown**, G5.1; her rights stay those of the offer (G10.6, line 10).
- The round: no act found that shows it alone; the stories of entry 571's buyers (line 7) are the nearest [inferred].

**The size.** A rule: G4.8(a)'s "a signer who fills a role" leaves "everyone who signed the original", and G5.1(c) no longer reaches a filling. One arm of `signed_by` goes, with the unchecked it gives where a K5 cMIP is lacking.

**What it costs in vectors.**
- Existing: none change [traced]. Only `spot_cases` (`core/src/agreements_new/grammar/cases.rs:1200`) puts roles in Terms that are updated: its offer's spot names no filling (`cases.rs:1212`, parameters `null`), so no filler is ever among "everyone who signed" in cases 71 to 77.
- New: (1) an offer with a filled role and no condition, updated by its maker alone: **valid**, by default; (2) the filler not bound by a later version that a condition let through: **not shown**; (3) an offer whose K5 cMIP is lacking, an outsider's assent held: **valid** where today **unchecked**.

**Choices the text does not make.**
- Q14. "A participant who joins through a role after the agreement was made": is every filling of a role an unknown party, or only one made after the first version came into force?
- Q15. Terms whose parties are all roles, or name no signer: who is a known party, and whom does the default ask? Under line 18, an update of such Terms would be valid with no one's signature.
- Q16. Is a named condition still handed the fillers (`signed_original`, `force.rs:557`), for a cMIP that wants them?
- Q17. Does a filling still count for whether the Terms she filled are in force (G4.1, G4.2's `in_force`), where the line takes her say only in updates?

**The build list.** No row holds it. T7 ("Everyone who signed" through a version that never replaced) and R28 (the default update and the leaver) meet the same function, `signed_by`: the line narrows the set both rows read, and settles neither. R18 (a role's filler in one signing) is untouched.

## 9. G10.6(b) goes

**His words, and the line.**

> He: "Yes, it was a bad idea. It’s the “let me drown you in terms updatable unilaterally” nightmare we already live under"

> *Arrived at (to check):* G10.6(b) goes. No later version changes the rights of a filling already earned except by an assent its holder signs in their own name. An update condition cannot reach what an unknown party bought. A deal meant to change says so in its own words, and is bought as such. (A change to Agreements, for the list owed to the Dubsar Suite lead.)

**The code it meets** [traced]: `core/src/agreements_new/grammar/spots.rs:99`, `rights`; the (b) arm at `spots.rs:114` to `spots.rs:127`, which asks the condition of the version the filling was earned under (`Ask::FillingRights`, `core/src/agreements_new/grammar/sockets.rs:67`, task K4 at `sockets.rs:87`), recorded at `core/src/agreements_new/grammar/recording.rs:43`, answered by the K4 stub at `core/src/agreements_new/grammar/stubs.rs:156` and `stubs.rs:157`. Draft 25, G10.6(b), and K4's row ("where a filling is asked about"). Encoding 2: none.

**What a verifier would answer differently.** *In plain words.* Ben's offer: whoever brings a buyer earns 10%. It names an update condition under which Ben alone may change it. Carla fills the spot. Ben signs version 2: 5%. Today, where that condition's cMIP answers valid for Carla's filling, Dana is told version 2 changes Carla's rights. Under the line, nothing changes Carla's 10% but her own signature.

*Precisely* [the "after" inferred]: before, `rights`: **shown**, G10.6, with a second answer **valid**, G10.6, the later version changing them under G10.6(b), the K4 cMIP named; after: **shown**, G10.6, `no later version changes them`.

**The size.** A removal: G10.6(b), its question to K4 (`Ask::FillingRights`) and the stub's two arms.

**What it costs in vectors.**
- Existing: case 74, "a filling's rights: a later version changes them where the version it was earned under names an update condition that answers valid", keeps its answer (**shown**, G10.6, `no later version changes them`) but not its name or its sentence, which quote (b) [traced: its version earned under, `961b1b47…`, names no condition, so the (b) arm is never reached, and its `stubs_asked` holds one K4 question only, about versions `c4cdf60b…` and `146efe2b…`, an update]. No vector runs the (b) arm today [counted: `rights` is asked in case 74 only]. The Python case runner does not judge case 74 (`a filling's rights across versions (G10.6)`).
- New: (1) the version earned under names a condition that answers valid for a later version the holder did not sign: rights unchanged.

**Choices the text does not make.** None found beyond line 10's.

**The build list.** D7 ("Earned rights, asked apart", `spots.rs` `rights`, `sockets.rs` `Ask::FillingRights`): the half that removes `Ask::FillingRights` stands; the row's "should" (Carla falls to 5%) is reversed by line 10.

## 10. This replaces 18 November: G10.6 comes back with (a) only

**His words, and the line.**

> Asked whether it replaces 18 November's, he: "Yes, but me saying something does not mean that something was necessarily a good idea"

> *Arrived at (to check):* this replaces "Earned rights leave the grammar" (18 November). G10.6 comes back with (a) only: nothing changes what a filling earned except an assent its holder signs in their own name. A deal that ends by itself (a month's plan, a licence ending at a creator's statement) says so in its own version's words; that is not an update and (a) does not stop it. His words: what he said earlier binds as the record of an exchange, not as proof it was a good idea; it can be revisited.

*Where the line says more:* the deal that ends by itself, and the reading of his words as "it can be revisited", are the MOR lead's.

**The code it meets** [traced]: `core/src/agreements_new/grammar/spots.rs:107` to `spots.rs:112`, the (a) arm of `rights`: a later version changes a filling's rights where it carries an assent by the holder in their own name (`for` empty, `spots.rs:108`). It stays as it is. The draft 26 brief planned G10.6 to go, with G10.6(a) "GOES or STAYS" and G10.6(b) "GOES", and changes to G10.5, G10.7, G12.5, K4 and K5 resting on it [traced: the brief's rows]; under this line those rows turn back, and only (b) goes (line 9). Encoding 2: none.

**What a verifier would answer differently.** *In plain words.* As in line 9; and if Carla herself signs version 2, her rights change as far as version 2 says. A month's plan that ends after a month ends by its own words, which the grammar does not read (G2; task K1). Verifier 2 already answers so, but for (b) [traced].

*Precisely*: no answer moves beyond line 9's [inferred].

**The size.** A rule, kept: G10.6 with (a). In code, nothing but line 9's removal.

**What it costs in vectors.** Existing: none (case 74, counted under line 9 too, is renamed once). New: (1) the holder's own assent on a later version: **shown**, G10.6, changed as far as its words say (G10.6(a)); no vector runs the (a) arm today [counted: `rights` is asked in case 74 only, which has no such assent].

**Choices the text does not make.**
- Q18. The (a) arm counts the holder's assent only where the later version counts it in her name (`spots.rs:108` reads `counted`): where version 2 names neither Carla nor a role she fills, her assent to it is counted in no one's name, and (a) is never met. Is her assent to a version that does not name her enough?

**The build list.** D7 is reversed in its "should": today's code is what the line asks, but for (b). The draft 26 brief's rows G10.5, G10.6, G10.6(a), G10.6(b), G10.7, G12.5, K4 and K5 change.

## 11. A place named only by a rule the parties never signed

> *Arrived at (to check):* a place named only by a rule the parties never signed does not order their Terms. A verifier may give an answer per such a place only as the reader's choice, named so. A contest counts by its own place for its own purposes.

The code already answers it: a place the Terms do not name reaches the verifier only as the reader's anchoring, used where the Terms name neither a place nor a clock, and the answer carries it, **per anchoring**, by its identifier (`core/src/agreements_new/grammar/mod.rs:243` to `mod.rs:258`, `scope_of`; case 64) [traced]. No vector moves. Whether a verifier should answer "in force at position N" is pull request 229's Q6, not this line's.

## 12. "Protect the unknown party" is a principle

> *Arrived at (to check):* "Protect the unknown party" is a principle of MOR. Where it is written is not yet asked.

No code: a principle is applied by the rules that carry it (lines 8 to 10). No vector moves.

## 13. It is an Agreements principle

> *Arrived at (to check):* it belongs to Agreements: stated in the Agreements companion, applied by Agreements' rules.

No code: the companion is not read by the verifier. No vector moves.

## 14. A key change that waits is a home's service

> *Arrived at (to check):* nothing is added to Identity. A rotation that waits, dropped on the current key's objection, can be offered by homes, above the core.

Verifier 2 reads no identity chain (its README: "The identities here have no identity chain") [traced]; nothing in it answers a rotation. No vector moves.

## 15. Knots of different kinds: rule 34 stays

> *Arrived at (to check):* rule 34 stays as it is: an owner's post left out by a key change stays visible as disputed only where another identity acknowledged it (`acks`, a witness act) or a keeper recorded it; a mention does not rescue it. Relying is a knot, useful to the identity that makes it. A mention is a knot too, of another kind (order, not reliance), on another layer, used at other moments where needed.

Verifier 2 reads the knots of Agreements' payload fields only (`core/src/agreements_new/grammar/held.rs:140`, `namings`) and no Text mention or Identity rule [traced]. No vector moves. The round's case: The Back Row's notices `161e54c4…` and `40756718…`, naming the void post `a49398c0…` (pull request 229, finding 4).

## 16. One way to name a set of acts, in Agreements' grammar

**His words, and the line.**

> He: "You are going to expand what the set of byte is and what it does pls"

> He: "Should it be in envelopes though? It feels like agreements stuff"

> He: "Knots making is core core business, a"

> *Arrived at (to check, reading his "a" as option a):* Agreements' grammar gets one byte form for naming a set of acts, a value like a fingerprint, so that Terms and every cMIP built on Agreements name the same set the same way. It says nothing about whether the set is complete, what it means, or when it was read. Making knots is core business.

*Where the line says more:* the recipe (the ids as raw bytes, sorted, repeats dropped, joined, hashed with a label) is the MOR lead's, in the exchange; his words choose (a) and nothing of the recipe. The line's own bracket, reading his word as option (a), is its caution.

**The code it meets** [traced]: none. No code in `core/src/agreements_new/` computes a fingerprint of a set of acts; `relies_on` and a socket's parameters take any 32 bytes, and the verifier cannot tell kinds of fingerprint apart (encoding 2, E5: "A verifier cannot tell two kinds of fingerprint apart by their bytes: the field says which it is."). Encoding 2: E5, the table of "What each fingerprint is of", would gain a row; or a new rule after E24 (the last of encoding 2 [traced]).

**What a verifier would answer differently.** *In plain words.* Ana, Ben and Carla's lineup names exactly three acts. Dana is handed three fingerprints for it by three honest writers, one per writer. Under the line, there is one recipe: Dana recomputes one fingerprint from the three ids and sees whether a writer's matches. It says nothing of whether three acts were all there were.

*Precisely* [inferred]: no grammar answer changes; a set's fingerprint is a value the grammar names and does not read. The round: Until's manifest `a95af5cc…`, Turnstile's list `cd2ec44a…` and Longhouse's check `d18774fe…`, three rules and three answers (pull request 229, finding 2).

One interaction [traced to the code, inferred in effect]: a set's fingerprint written in `relies_on` is a fingerprint the verifier holds as nothing, so, under today's `lacking_in` (`mod.rs:292`), it makes any lateness that rests on that act **unchecked**, as line 1 describes; under line 1's narrower reading it depends on Q1.

**The size.** A new value form (a set of acts): one recipe, one label, one row of encoding 2's E5 table or one new E-rule; a function in the library; a vector file.

**What it costs in vectors.** Existing: none change. New, a recipe file (`ids` in, fingerprint out), with its check in `core/vectors/check.py` [inferred]: (1) two ids in either order: one fingerprint; (2) an id given twice: the same as once; (3) one id: a fingerprint that is not the id itself; (4) the empty set (Q20); (5) an act passing with a set's fingerprint in `relies_on`.

**Choices the text does not make.**
- Q19. Is a set's fingerprint written as bare 32 bytes, told apart only by its field, or in a form the bytes tell apart (as E12 tells a position from a root)?
- Q20. Is the empty set a set? What label is hashed with it?
- Q21. Is a set's fingerprint a knot (G13.1, G4.7(a)): does naming a set name each act in it, for order, where the verifier holds the list?

**The build list.** No row. The research window's question 11 and pull request 229's finding 2 are this point.

## 17. A sealed container: the core gives the address, not a name

> *Arrived at (to check):* nothing changes in the core. The sealed container's outside gives its address (its recipients); the core gives it no name. A relay or a delivery service names a container by the hash of its bytes, for receipts of delivery, above the core. The proof of who wrote what, to whom, stays in the inner act.

Verifier 2 never reads a sealed container: what has no act id is passed over (`core/src/agreements_new/grammar/held.rs:53`) [traced]. No vector moves.

## 18. Valid means in force: one gate for an update

**His words, and the line.**

> He: "I agree with CP. to me it means the same thing… valid, in force, what’s the difference for the core? The core should only see one version as valid"

> He: "Yes, I always assumed in force to be human speech, and valid to be its translation for the verifier to be honest"

> *Arrived at (to check):* for an update there is one gate: where the update condition of the version it replaces answers valid, it is the version in force; no other assent is asked. The core sees one version at a time. Two updates answered valid against one version are a race: neither replaces it, and it stays. The first version comes into force by the assents of its named parties. "In force" is the human word; "valid" is its translation for the verifier. (A change to Agreements, for the list owed to the Dubsar Suite lead.)

*Where the line says more:* the race ("neither replaces it, and it stays") and the first version's coming into force are the MOR lead's reading of "The core should only see one version as valid". "The first version comes into force by the assents of its named parties" does not say "once pinned", where the draft 26 brief's G4.1 row says: "Terms are in force only once the order of those signatures is pinned" [traced]; which holds is the scribe's to check.

**The code it meets** [traced]:
- `core/src/agreements_new/grammar/force.rs:602` to `force.rs:611`, `then_in_force`: the second gate; after the condition answers valid, the update must be in force by its own `in_force`, or it is **not shown**, "valid, and not in force by its own `in_force`" (`force.rs:608`). Called from `update_raw` (`force.rs:547`) on both paths, a named condition and the default.
- `core/src/agreements_new/grammar/chain.rs:170`, `is_update`, and every reading that asks "valid and in force": `chain.rs:194`, `first_position` (G4.7(b)); `chain.rs:232`, `late_against`, for the update that came first (G4.7(a)).
- `chain.rs:723`, `update_answer`: the words ``the update condition answers valid, and it is in force by its own `in_force` (G4.8)``.
- `chain.rs:392`: two updates of one version, both passing, are `End::Fork`; the answer is **fork** (G4.7), both tips stop, the shared version stays in force.
- `force.rs:302`, `in_force_raw`: stays, for the first version (G4.1).
- Encoding 2: none in form. Field 6, `in_force`, stays optional in every Terms act (section 4), so an update may still carry one (Q7).

**What a verifier would answer differently.** *In plain words.* Ana, Ben and Carla's Terms name an update condition, "two of three". Ana and Ben sign version 2; Carla says nothing. Today the condition answers valid, but version 2 also needs everyone it names by its own default, Carla included, so one silent member leaves the majority rule inert: Dana is told version 2 replaces nothing. Under the line, valid is in force: version 2 is the version. And where Ana and Ben sign version 2 while Ben and Carla sign another version 2, both answered valid: today a fork, both stopped; under the line a race, in which the first version stays.

*Precisely* [the "after" inferred]:
- Before: `update` of version 2: **not shown**, G4.8, its plain words beginning `valid, and not in force by its own`; after: **valid**, G4.11, and version 2 in force.
- Before, two rivals: `last_version`: **fork**, G4.7, both tips shown; after: the first version stays in force, the word open (Q5).
- The round: Counterparty's proposal, act `aa552d9c…` (named in the ledger's exchange).

**The size.** A removal: the in-force step for updates (`then_in_force`, and "and in force" in every reading of an update). If the race takes "not shown" for "fork" (Q5), a word too.

**What it costs in vectors.**
- Existing, answer: none change in word or rule [counted: no case's answers carry the words "not in force by its own"]. Plain words only, which two builders need not match: cases 8, 11 and 58 say "and it is in force by its own `in_force` (G4.8)" [counted]; case 58 goes anyway, by D1, not by this line.
- Existing, if Q5 goes to "not shown": cases 17, 21, 26 and 27 (**fork** as the answer picked: two updates of one version), and the fork shown beside the answer in 18, 19 and 20 [counted]; and cases 22, 23, 24 and 28 (a fork of Terms resolved) if a race leaves nothing to resolve (Q6) [inferred]. Case 38 is a fork in one signer's line, not an update, and does not move.
- New: (1) version 2 valid by a condition, not in force by its own default: **valid**, it replaces; (2) a late update shown by knots where the update that came first is valid and not in force by its own rule: **late**, where today it is not shown late; (3) an update carrying its own `in_force` (Q7).

**Choices the text does not make.**
- Q5. Two updates answered valid against one version: is the word **fork**, as G4.7 and verifier 2 give it, or **not shown**, the race's word in the brief's "One rule for every race"?
- Q6. If a race leaves the version as it was, is a fork of Terms still resolved by a resolving update (G12.3), or does a new update of the same version simply follow; and does that new update race the two rivals again?
- Q7. What of an update's own `in_force` field: left unread with a note (as G2.2 lists), rejected, or read for something else?
- Q8. Where no one signed the original (Terms that name no signer and carry no `in_force`, in force at once, G4.1), the default asks no one (G4.8(a)); with one gate, any act naming those Terms in `replaces` would replace them. Is that so?
- Q9. Does an update need pinning (the brief's two-way reading 1), against "no other assent is asked"?

**The build list.** D6 ("The second gate on an update", `force.rs` `then_in_force`; `chain.rs` `is_update`, `first_position`, `late_against`): settled, in the row's "should". R14 (the condition asked of a resolving update) and R3 (a place orders every two updates) are left open, but Q6 bears on both.

## 19. The words of Terms are a Text act

**His words, and the line.**

> He: "How many acts are involved here?"

> He: "I think it”s cleaner, it keeps text to text and agreement grammar to agreement grammar, both have their own hashes to verify"

> *Arrived at (to check):* the words of Terms are an act of the Text layer, public or private, and the Terms name it by its act id. Text keeps text; the agreement grammar keeps the grammar; each is verified by its own hash. The hash choice for loose words goes. (A change to Agreements, for the list owed to the Dubsar Suite lead.)

**The code it meets** [traced]:
- `core/src/agreements_new/terms.rs:160` to `terms.rs:171`, `Body`: the words are a fingerprint (`Named`); the library gives them no meaning, and computes no work hash for them.
- `core/src/agreements_new/grammar/held.rs:140` onward, `namings`: the body's words are not a naming, so they are never a knot and never lacking.
- `held.rs:63`, `held.rs:64`: a Text act handed to the verifier is "not this encoding", put among the rejected, and not `known` (line 1).
- `core/src/agreements_new/grammar/sockets.rs:52`, `Ask::Body { terms }`: K1's cMIP is handed the Terms, not the words.
- Encoding 2: E5's table, the row for "the body's words", whose fingerprint is "the work hash", `tagged_hash("MOR/work", words)`, marked **[lead]**; under the line, an act id (`tagged_hash("MOR/act", outside)`), the first row of the same table. E8 (`body = [ words: any, socket ]`) keeps its form.
- Beside verifier 2 on the same branch: the Kišib client compares the words with their work hash (`clients/kishib/src/agreements.ts:324`), and its tests build bodies so (`clients/kishib/test/agreements-new.test.ts:268`).

**What a verifier would answer differently.** *In plain words.* Ana publishes her words as a Text post, public or private, then writes Terms whose body names the post by its act id. Dana fetches the post, checks its act id, and reads the words. Today the body holds the hash of loose words, and Dana must know which hash. Under the line there is no such question. The grammar reads no words, so no answer of verifier 2 moves.

*Precisely* [inferred]: no grammar answer changes. The round: the work `eeb5cef3…`, named in `relies_on` of entry 571's version 2 (pull request 229, 1b); the plain-words bodies hashed with plain SHA-256 (DubLaw's Q3, as the exchange says).

**The size.** A rule: E5's row for the body's words (what the fingerprint is of).

**What it costs in vectors.** Existing: none change. Every body in `valid.json` and `grammar.json` is a stand-in, the SHA-256 of a label (the vectors' README) [traced], so its bytes are as good under the line. New: (1) Terms whose body names a Text act handed beside them: the Terms pass, the Text act is known; (2) with line 1, that Text act named also in `relies_on` of a late update: **late**.

**Choices the text does not make.**
- Q23. Is the body's naming of the Text act a knot (G13.1 reads "any field that holds a fingerprint")? Today the body is not among `namings`.
- Q24. Must a verifier hold the Text act, and if it lacks it, or holds it private without its key, is anything unchecked (G9), or is that K1's to say?
- Q2 (line 1) again: is the Text act, held, known?

**The build list.** No row. It meets R5 through `known` (line 1).

## 20. The Text act comes first

> *Arrived at (to check):* the Text act carrying the words comes first, as a rule: Terms can name only an act that already exists, so the words are published before the Terms that point to them.

No code is needed for the order itself: Terms can name the Text act's act id only once that act exists, since the id is a hash of its outside (E5's first row) [inferred: a writer cannot name an act id before the act is made, short of breaking the hash]. No vector moves. Q25: does "comes first" ask any check of a verifier beyond that naming (that the Text act is held, or published)?

## 21. "The close" was the simulation's

> *Arrived at (to check):* "the close" was the round's numbered windows, an artefact of the simulation, not a finding about the core. Nothing changes. (Not asked, the MOR lead's lean: Terms that name a deadline and no place or clock get "not shown", with that reason.)

Nothing in verifier 2 reads a deadline: the round's "close" was a record number of the place, read by the counters (pull request 229, 1e) [traced]. No vector moves.

## 22. No stated anchor, no condition in time

**His words, and the line.**

> Then he (16:33): "But let’s answer it… an agreement with no stated anchor cannot build a temporal condition"

> *Arrived at (to check):* an agreement that states no anchor (no place, no clock) cannot have a condition in time: no deadline, no "before", no "after the close". The MOR lead's reading, to check: a verifier answers such a condition "not shown", with that reason.

*Where the line says more:* that a verifier answers such a condition "not shown" is the MOR lead's reading, and the line marks it so.

**The code it meets** [traced]: verifier 2 builds no condition in time of its own. A condition in time is a cMIP's, whose answer is taken as it is (G4.11(i); `core/src/agreements_new/grammar/force.rs:557`, the K4 question, which hands the cMIP the original, the update, the assents counted and who signed the original, and no time). The reader's anchoring serves order, what is latest (`core/src/agreements_new/grammar/mod.rs:243`, `scope_of`), and a clock is read only where the Terms name one (`core/src/agreements_new/grammar/chain.rs:282` onward, lateness per clock). Encoding 2: none.

**What a verifier would answer differently.** *In plain words.* Ana and Ben's Terms name no place and no clock, and their update condition's cMIP allows an update only before the first of the month. Today verifier 2 passes on whatever that cMIP answers. Under the MOR lead's reading, the verifier would answer *not shown, no anchor stated*. *Precisely* [inferred]: no grammar case asks a condition in time, and no vector moves.

**The size.** None in verifier 2, unless Q26 goes to the verifier.

**Choices the text does not make.**
- Q26. Draft 25 hands a condition's answer to its cMIP: "These grammar rules name the update condition's cMIP, take the output of that task, valid or not valid" (G4.11(i)). Does "not shown" for a condition in time with no stated anchor become the verifier's answer, overruling the cMIP's, or is it a rule that a cMIP must follow, the verifier passing its answer on? And does a reader's own anchoring (G13.4) count as no stated anchor?

**The build list.** No row.

## 23. Two keys, so they are kept apart

> *Arrived at (to check):* nothing is added to Identity. The chain key and the signing key exist to be kept apart; whoever keeps both in one place gives up what the second key was for, and an owner robbed of both bears the loss, as Identity already states. Keeping them apart is the clients' duty.

Verifier 2 reads no keys of an identity chain [traced: its README]; nothing in it answers this. No vector moves. Build list R24 (a stolen key's act) is untouched.

## 24. Money's findings wait for the Money review

> *Arrived at (to check):* the focus stays on Agreements. Money's findings from the round go to the Money review, after draft 26, read against draft 14, "What defines Money" and the duo.

What Agreements reads of Money stays as it is (`core/src/agreements_new/grammar/legs.rs`, G11.7, the buyer's leg; `core/src/agreements_new/grammar/layers.rs`, the stand-in for Money) [traced]. No vector moves (cases 92 to 94, 96 to 98 stay).

## 25. Wave two: check, then attack, then draft 26

> *Arrived at (to check):* that is wave two, with the attack, run on Fable 5.1, not 5.2. Draft 26 is written only after he has settled the conflicts.

No code: this sheet is one of the wave's three pieces. No vector moves.

---

## The totals

Counted from the sections above; each count is of existing vectors in `core/vectors/agreements-new/` unless marked new.

| What | Count | Which |
|---|---|---|
| Vectors that change answer, on any reading | **0** | none [counted for the words; inferred for the paths] |
| Vectors that change answer, if a question goes one way | **up to 9** | case 31 (Q1, line 1); cases 17, 21, 26, 27 (Q5, line 18); cases 22, 23, 24, 28 (Q6, line 18) [inferred] |
| Vectors whose name or sentence changes, answer kept | **1** | case 74 (lines 9 and 10) [traced] |
| Vectors whose plain words change, answer kept | **3** | cases 8, 11, 58 (line 18) [counted] |
| Vectors that go | **0** | none by these lines (case 58 goes by D1, already on the build list) |
| New vectors | **22** | line 1: 3; line 6: 2; line 7: 2; line 8: 3; line 9: 1; line 10: 1; line 16: 5 (a new recipe file); line 18: 3; line 19: 2 [inferred] |
| New fields | **0** | |
| New act types | **0** | |
| New value forms | **1** | a set of acts (line 16) |
| Removals | **2** | G10.6(b), with `Ask::FillingRights` (line 9); the in-force step for updates (line 18) |
| `valid.json`, `invalid.json` | **0 change** | the checker's answers rest on E-rules none of these lines changes in form [inferred] |

**Counted under two lines:** case 74, under lines 9 and 10 (one renaming). Case 31 is counted under line 1 only; line 16's interaction with it adds no count. The "if" counts of line 18 are not added to the sure count.

## The three largest changes

By what they cost in code and vectors, the session's reading:

1. **One gate for an update, and the race (line 18).** It reaches every reading of an update in `force.rs` and `chain.rs` (the condition's answer, lateness by knots, lateness per place), and it leaves four questions that each move vectors or open a hole: the race's word (four cases), whether a fork of Terms is still resolved (four more), an update's own `in_force`, and Terms nobody signed.
2. **Protect the unknown parties (lines 7, 8, 9, 10 together).** One arm of `signed_by` goes, which changes who the default asks, whom an update binds without their signature, and what a buyer's assent to a replaced version is answered; G10.6(b) goes with its question to K4; eight new vectors, and none of today's runs a filling through an update.
3. **One way to name a set of acts (line 16).** The only new value form: a recipe, a label, a row or rule in encoding 2, a function and a vector file of its own; it touches no answer of today's, but it meets line 1 wherever a set's fingerprint stands in `relies_on`.

## The questions

All of them, those that would change a verifier's answer first. Each quotes its sentence, gives the readings, and the session's lean, labelled as the session's. None is settled here.

**Those that would change a verifier's answer.**

1. **Q5. The race's word.** The line (18): "Two updates answered valid against one version are a race: neither replaces it, and it stays." (A) **fork**, as G4.7 and verifier 2 give it, both tips shown; (B) **not shown**, as the brief's "One rule for every race" words a race. *The session's lean:* (A) where both are shown valid, since the brief leaves open "whether rival tips keep the word", and *fork* says why; a question for the MOR lead's wording. Moves cases 17, 21, 26, 27.
2. **Q6. After a race, is a fork of Terms still resolved?** Draft 25, G12.3: "A fork is resolved by an update of the shared act". (A) yes, as today, by a resolving update; (B) no, a new update simply follows the version that stayed. *The session's lean:* (A), since under (B) every new update of that version meets the two rivals again. Moves cases 22, 23, 24, 28 under (B).
3. **Q1. Can a fingerprint held as nothing carry a knot?** The line (1): "Only a missing act that could carry a knot (an act in a signer's own line, or an anchoring) leaves the answer unchecked". (A) yes: the verifier cannot know what it lacks, so an unknown fingerprint might be such an act; (B) no: only a fingerprint the verifier knows to be an act of a signer's line, or an anchoring. *The session's lean:* (A), as pull request 229's (B) reading puts it ("an act the verifier does not hold at all"); under (B) case 31 moves to **fork**.
4. **Q2. Is an act held of another specification known?** Draft 25, G4.7(c): "Where L, or an assent it needs, names an act the verifier does not hold, and that act might be what shows L came late". (A) yes: a Text act held, read and seen to be no Agreements act, cannot be such an act; (B) no, as the code does today. *The session's lean:* (A); it is what lets the round's entry 571 be answered **late** with the work held (lines 1 and 19).
5. **Q12. A buyer's assent to a replaced version.** Draft 25, G4.3: "An assent binds its signer only while the Terms it names are in force." (A) **shown**, counted, made under a version since replaced, what it gives read from that version's cMIPs; (B) no word of the grammar's: the verifier names the version and hands the rest to the cMIP. *The session's lean:* (A), "a signed fact" in the line's words, with the version named.
6. **Q13. For a buyer only, or a known party too?** The line (7): "The grammar keeps her assent to version 2 as a signed fact". (A) a filling only; (B) every assent. *The session's lean:* (A): a known party has a say in updates and is bound by them (G5.1(c)).
7. **Q14. Who is an unknown party?** The line (8): "A participant who joins through a role after the agreement was made (a filling) has no say in its updates". (A) every filling of a role; (B) only one made after the first version came into force. *The session's lean:* (A), the line's own bracket, since where no place is named the bytes give no clean before and after.
8. **Q15. Terms with no known party.** The same line, with draft 25, G4.8(a): "Where no one signed the original (its `in_force` rule asked for no one's assent), the default asks for no one's signature". (A) the default asks no one, as written; (B) such Terms need an update condition. *The session's lean:* none; a question for him, with Q8.
9. **Q8. Terms nobody signed, under one gate.** The line (18): "no other assent is asked". (A) anyone may replace them, as one gate reads; (B) the second gate stays for them alone. *The session's lean:* none; it is the open item of draft 25's section 8.4, now with nothing behind it.
10. **Q7. An update's own `in_force`.** Encoding 2, section 4: field 6, `in_force`, optional in every Terms act. (A) left unread, with a note; (B) rejected on an update; (C) read for something else. *The session's lean:* (A), as G2.2 already lists what is left unread.
11. **Q9. Does an update need pinning?** The brief's G4.1 row: "Terms are in force only once the order of those signatures is pinned"; the line (18): "it is the version in force; no other assent is asked". *The session's lean:* none; the scribe's conflict to list.
12. **Q4. Does lateness wait on a pin?** The exchange (1): version 2 "is in force only once pinned". *The session's lean:* it follows Q9.
13. **Q10. A Terms act shaped as a resolving update, resolving nothing, asked `resolution`.** Draft 25, G12.3: such an act "is an act like any other, and may itself be a tip". (A) "not shown, nothing to resolve", beside its answer as an update; (B) its answer as an update, as today. *The session's lean:* (A): "Every refusal states its own reason."
14. **Q11. A resolve in a line that is itself unchecked.** The line (6): unchecked "is kept for a reader that lacks something". (A) **unchecked**; (B) **not shown**. *The session's lean:* (A).
15. **Q18. The holder's own assent to a version that does not name her.** The line (10): "nothing changes what a filling earned except an assent its holder signs in their own name". (A) her assent to it is enough, counted or not; (B) only where the later version counts it in her name, as `spots.rs:108` reads. *The session's lean:* (A).
16. **Q16. Is a named condition still handed the fillers?** `force.rs:557`, `signed_original`. (A) no, they leave "everyone who signed"; (B) yes, as information a cMIP may read. *The session's lean:* (A), the answer otherwise depending on what the cMIP does with them.
17. **Q17. Does a filling still count for in force?** Draft 25, G4.2: "Terms that name a party by role MUST carry `in_force`." (A) yes: the line takes her say in updates only; (B) no. *The session's lean:* (A).
18. **Q26. A condition in time with no stated anchor.** Draft 25, G4.11(i): "These grammar rules name the update condition's cMIP, take the output of that task, valid or not valid, and use it where it is needed". (A) the verifier passes the cMIP's answer on, and the rule binds the cMIP; (B) the verifier answers "not shown" over it. *The session's lean:* (A), since under (B) the verifier computes part of a task.
19. **Q24. Must the verifier hold the Text act of the words?** (A) no: K1's; (B) yes, or unchecked. *The session's lean:* (A).

**Those that would not change an answer today.**

20. **Q3.** Is *rejected* the word for a late update? The line (1): "a version 3 that names a version already replaced is rejected". *The session's lean:* the line's plain word; G4.7's answer kept, since *rejected* is the checker's verdict for bytes that are no Agreements act.
21. **Q19.** Is a set's fingerprint bare 32 bytes, or a form the bytes tell apart? *The session's lean:* bare, as every fingerprint of E5, the field saying which.
22. **Q20.** Is the empty set a set, and what is its label? *The session's lean:* none.
23. **Q21.** Is a set's fingerprint a knot? *The session's lean:* no: it names no act the verifier can read without the list.
24. **Q23.** Is the body's naming of the Text act a knot? Draft 25, G13.1: "An act is read against the versions and acts it names, in any field that holds a fingerprint". *The session's lean:* yes, by G13.1's words; today's `namings` leaves the body out.
25. **Q25.** Does the rule that the Text act comes first ask the verifier anything beyond the naming? *The session's lean:* no.
26. **Q22.** Does the verifier's own output carry the "not to be used bare" warning? *The session's lean:* for the rewrite, as the line says.

## What this sheet does not settle

- Whether the lines of 26 November agree with each other, with the ledger before them and with the draft 26 brief: the scribe's task. Three places where they meet the brief are named above (pinning, line 18; G10.6, line 10; the race's word, line 18), not resolved.
- Whether the lines hold up when attacked: Fable's task.
- Any reading of a question above, any rule of draft 26, any line of code or any vector: nothing is built.
- What the Kišib client would change (line 19 names one line of it); clients are outside verifier 2.
- The round's acts were not run again here; the round's answers are pull request 229's and pull request 232's.

## The scripts

Run at `f1a13feb` (the branch's code and vectors), in the repository's root.

- Tests: `cargo test -p mor-core --locked` (570 passed, 0 failed).
- Case runners: `python3 core/vectors/agreements_new_grammar_check.py`; `python3 core/vectors/agreements_new_check.py`; `python3 core/vectors/check.py` (with `cryptography` and `unicodedata2==17.0.0`, as `.github/workflows/test.yml` installs them).
- The counts of `grammar.json` (asks, words, plain words, stubs asked):

```python
import json
g = json.load(open('core/vectors/agreements-new/grammar.json'))
def walk(a, out):
    out.append(a)
    for w in a.get('with') or []:
        walk(w, out)
cases = g['cases']
asks = {}
for i, c in enumerate(cases):
    asks.setdefault(c['question']['ask'], []).append(i)
print('resolution', asks['resolution'], 'rights', asks['rights'], 'assent', asks['assent'])
alls = []
for i, c in enumerate(cases):
    out = []
    for a in c['answers']:
        walk(a, out)
    alls.append(out)
print('not in force by its own', [i for i, o in enumerate(alls) if any('not in force by its own' in a['says'] for a in o)])
print('in force by its own', [i for i, o in enumerate(alls) if any('in force by its own' in a['says'] for a in o)])
print('fork picked', [i for i, c in enumerate(cases) if c['answers'][c['answer'].get('pick', 0)]['word'] == 'fork'])
print('fork anywhere', [i for i, o in enumerate(alls) if any(a['word'] == 'fork' for a in o)])
print('pieces', [i for i, c in enumerate(cases) if 'pieces' in c or 'pieces' in c['layers']])
print('74, K4 asked about', [s['about'] for s in cases[74]['stubs_asked'] if s['task'] == 'K4'])
```

Its output at `f1a13feb`: resolution [22, 28], rights [74], assent [2, 40, 118]; not in force by its own []; in force by its own [8, 11, 58]; fork picked [17, 21, 26, 27, 38]; fork anywhere [17, 18, 19, 20, 21, 26, 27, 38]; pieces []; case 74's one K4 question about `c4cdf60b…` and `146efe2b…`.

- The twenty-five lines: `sed -n 50,116p docs/decisions.md | grep -c 'Arrived at (to check'` on main at `cf86c32` (its ledger the same as at `c7e729b`), 25, each line read.
