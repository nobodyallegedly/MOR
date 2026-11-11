**Status: done, every part of draft 24 (front matter, parts one to six) and every analysis the session was asked for. Documents only: no text, code or vector changed. Nothing here is decided.**

# Agreements draft 24: the inventory of verdict-bearing sentences

*11 November 2026, branch `claude/s8a-inventory` from main at `fc624ab`. For the MOR lead and for the session that writes Agreements again from scratch (F441). Against `spec/MIR-agreements-draft-24.md` (3,817 lines, 81,516 words), `core/vectors/verdicts.json` (618 cases), the tests under `core/tests/` and `cmips/*/tests/`, and the findings logs.*

## In plain words

Agreements is to be written again from scratch with one promise: no guarantee changes, and every verdict stays in the core or moves unchanged into a founding cMIP. This inventory is the checklist the new text is compared against. It lists every sentence of draft 24 that decides something, **2,772 rows**, one per sentence, each quoted exactly, with what it decides, what kind of rule it is, where it could live after the move, which vectors and tests would fail if it were lost, and which attack it closes.

The rows are split by part of draft 24, so that no file is too long to read. After the rows come five files built from them: the sentences that say the same thing in more than one place; the sentences that read two ways; the guarantees nothing exercises; the vectors and tests no sentence states; and the counts, below.

What it found, in short:

- **Most of draft 24 is grammar, and most of it stays in the core.** Of the 2,578 rows outside Part six, 1,910 are grammar, 388 guarantees, 99 stated costs, 84 client conformance and 97 not rules. Part six (194 rows) is reasoning and freeze scenarios, all "not a rule" save one parameter.
- **One rule in two places is common.** 363 groups of sentences say one rule more than once (1,214 rows). In 322 groups one wording is narrower or broader than another; in 34 they say exactly the same; in **7 they differ**, which the rewrite has to resolve before it can say the rule once (below).
- **The stranger's six two-way readings:** four are in draft 24 and are tied to their rows; two (the chain key's "exactly once", "*Pending* has one meaning") are the MICS's own sentences, and draft 24's several meanings of "pending" are listed. Workers noted 167 more.
- **Six laws the text never states**, found by reading the tests no row cites. The most concrete: the reference code refuses a publication whose backup is its own split service, and no sentence of draft 24 says so.
- **54 guarantees are exercised by no vector and no test.** A rewrite could lose any of them with every test still passing; the inventory diff is their only defence.
- **55 stated costs and client duties are written wholly in italics**, which draft 24's own reading rule makes commentary. They are listed as rows here (marked), because F441.2 keeps stated costs beside their rules. Workers also found italic sentences that decide verdicts (below).

## The files

| File | What it holds |
| --- | --- |
| [01-front.md](01-front.md) to [15-part-6.md](15-part-6.md) | The rows, A-001 to A-2772, in the order of draft 24, one file per part or half-part (the table under "Counts" gives each file's ids). |
| [16-two-way-readings.md](16-two-way-readings.md) | The stranger's six readings tied to their rows; then every other row noted as reading two ways (167). |
| [17-restatements.md](17-restatements.md) | 363 groups of sentences saying one rule in more than one place, each with its relation (same, one narrower, they differ). |
| [18-guarantees-not-exercised.md](18-guarantees-not-exercised.md) | The 54 guarantees no case or test exercises. |
| [19-vectors-and-tests-no-sentence-states.md](19-vectors-and-tests-no-sentence-states.md) | The 6 verdict cases and 50 tests no row cites, each classified; the laws the text never stated; the property tests mapped promise by promise. |

## The row

Each row has nine columns:

1. **ID**, A-001 onwards in the order of draft 24.
2. **Where**: the rule number, the nearest heading, and the line of draft 24 where the sentence starts.
3. **The sentence, quoted exactly.** Only bold markers (`**`) are removed. A CDDL comment is quoted without its `;` and indentation, its continuation lines joined by one space. A table row is quoted by the cell that carries the rule.
4. **What it decides**, in one plain line.
5. **Its kind**, one of five:
   - *guarantee*: protects someone who did not choose the rule, so no cMIP or Module may break it;
   - *grammar*: a format, a meaning, or a verdict rule every act is written and read in. Verdict rules of the publishing model, which a cMIP could carry differently, are grammar too;
   - *stated cost*: the edge of a guarantee, what it does not promise;
   - *client conformance*: a duty no verifier can check from acts;
   - *not a rule*: advice, history, reasoning, a scenario or a parameter's discussion. F441.2 sends these to the companion.
6. **Its candidate home** after the move:
   - *core*;
   - an existing task: Development's tasks 1 to 15, task 16 (terms reading, F441.1), or the control model hook of rule 99;
   - a new task, named (only "delivery", as Fable's pull request 137 proposes);
   - a founding cMIP: the split cMIP for the publishing model (F441.3), or the terms-reading cMIP for "show before signing" (F441.1);
   - the companion; the freeze scenarios go to the suite.
   
   A stated cost takes its rule's home. Where a worker hesitated between two homes, the other is in the notes. **A home is a candidate, never a decision.** The task list itself is Fable's to redo (F441: pull request 137's three decisions are held). Its 5.1 (a party's fixed share staying in the core) and 5.2 (how "paid less" is judged once the details are parameters) would move rows between the core and the founding split cMIP; each such row says so.
7. **Exercised by**: the cases of `verdicts.json` (written as layer and case name) and the tests (file and function) that would fail if the sentence were lost; "none" where none was found.
8. **Attack closed**: the F number and one line, where the findings log records an attack or failure the sentence answers. Sources: the provenance map (`docs/freeze-provenance.md`, for draft 17), then both findings logs. 1,567 rows name one; "—" means none was found, not that none exists.
9. **Notes**: two-way readings, other places saying the same thing, and the worker's doubts. These are the first place to look when a row seems wrong.

## How it was made

**The unit.** The unit is the sentence in normal text (draft 24 says italics are commentary), never the keyword: draft 24 uses MUST 29 times. Where the method needed choices, these are the ones taken:

- **Italic labels.** An italic label followed by normal text ("*Client conformance.* Before any terms ... the client:") makes the normal text a rule, of the kind the label names.
- **Lead-ins.** A lead-in that decides nothing by itself ("The settlement is one of:") is folded into the rows of its items and named in their "decides". Lead-ins that decide something have rows of their own.
- **CDDL.** The CDDL moves over exactly (Fable, pull request 136), so it has no row per field. Each comment that states a rule, a bound or a meaning has a row, including the rule 99 block in Part four.
- **Withdrawn fields** are "not a rule" (history), unless the comment also makes an act invalid.
- **Part six.** Each reasoning title, parameter and scenario is a row, so that the companion and the suite can be diffed too.

**Italics.** A sentence wholly in italics has no row, with one exception. Every italic span of more than eight words that names itself a stated cost or client conformance was added at assembly: 55 rows, each marked in its notes. Its "decides" line was written by one more reader from the sentence in context. The stated costs are there because F441.2 keeps stated costs beside their rules. This is the session's reading, to be confirmed or corrected.

**Who did it.** Fifteen workers each took one segment of draft 24, cut at part or section boundaries, from one written brief. Each wrote structured rows, then walked its segment again. The session then checked the rows mechanically, in four ways:

- **every quote** against draft 24 (with bold markers removed and whitespace collapsed): all 2,772 match;
- **every case name** against `verdicts.json` and **every test name** against the `#[test]` functions under `core/tests/` and `cmips/*/tests/`: all match;
- **coverage**: every normal-text sentence of draft 24 by a rough sentence splitter, against the quotes. What no quote covers is lead-ins and bold run-in labels only (for example "How it is signed." and "A fork is complete when:"), folded on purpose;
- **consistency**: every "not a rule" is homed in the companion, and nothing else is.

Then three more readers built the analyses:

- **Restatements**, from candidate groups seeded mechanically from the workers' "same as" pointers. The reader confirmed, split or dropped each group and searched for more (glossary against body, type table and CDDL against the rules, rule 47 against "Termination", rules 91 to 93 against the fork and closing formats).
- **The 6 cases and 50 tests no row cites**, each opened and classified. The session re-read the backup test.
- **The italic rows' "decides" lines.**

The session spot-checked several of the seven differing groups against the quotes.

**What was not done.**

- **No test was run.** "Would fail if lost" is a reading of the case's rule, its name and the test's assertions, not a mutation run.
- **The attack column is as complete as the workers' searches.**
- **Homes and kinds are judgments under the gate of F441;** a second reader will move some. The workers named their hesitations in the notes rather than hiding them.

## Counts

**By kind and candidate home** (rows):

| Kind | core | an existing task | new task: delivery | founding split cMIP | founding terms-reading cMIP | companion | companion (the suite's scenarios) | All |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| guarantee | 385 | 2 |  | 1 |  |  |  | 388 |
| grammar | 1714 | 87 | 14 | 96 |  |  |  | 1911 |
| stated cost | 78 |  | 1 | 9 | 11 |  |  | 99 |
| client conformance | 49 |  |  | 1 | 34 |  |  | 84 |
| not a rule |  |  |  |  |  | 131 | 159 | 290 |
| **All** | **2226** | **89** | **15** | **107** | **45** | **131** | **159** | **2772** |

**The existing tasks, one by one:** control model (rule 99), 45; task 15 Termination terms, 10; task 8 Split, 10; task 12 Grant limits, 6; task 14 Absence proof, 6; task 10 Time reference, 4; task 13 Work claims, 3; task 11 Anchoring, 2; task 6 Payment, 1; task 9 Condition evaluation, 1; task 4 Text format, 1.

**By part of draft 24:**

| File | Ids | Rows | guarantee | grammar | stated cost | client conformance | not a rule |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [01-front.md](01-front.md): how to read, purpose, dependencies, words used | A-001 to A-163 | 163 | 6 | 137 | 1 | 2 | 17 |
| [02-part-1a.md](02-part-1a.md): rules 1 to 10 | A-164 to A-295 | 132 | 23 | 86 | 6 | 11 | 6 |
| [03-part-1b.md](03-part-1b.md): publications, changing an agreement, contests | A-296 to A-542 | 247 | 45 | 166 | 12 | 10 | 14 |
| [04-part-1c.md](04-part-1c.md): a collective, grants, counting a consent | A-543 to A-735 | 193 | 23 | 147 | 9 | 7 | 7 |
| [05-part-2a.md](05-part-2a.md): keepers, made before and after, a grant's end, forks of records | A-736 to A-910 | 175 | 45 | 113 | 7 | 6 | 4 |
| [06-part-2b.md](06-part-2b.md): legible money, no stake reduced without its holder | A-911 to A-1102 | 192 | 54 | 112 | 12 | 3 | 11 |
| [07-part-3a.md](07-part-3a.md): changing members, leaving, succession | A-1103 to A-1264 | 162 | 13 | 123 | 12 | 12 | 2 |
| [08-part-3b.md](08-part-3b.md): how a collective ends, a broken collective, public domain | A-1265 to A-1440 | 176 | 27 | 134 | 11 | 3 | 1 |
| [09-part-4a.md](09-part-4a.md): rules 98, 67 and 47 | A-1441 to A-1606 | 166 | 52 | 83 | 13 | 10 | 8 |
| [10-part-4b.md](10-part-4b.md): rules 60, 61, 85 to 89 | A-1607 to A-1719 | 113 | 16 | 91 | 3 | 3 |  |
| [11-part-4c.md](11-part-4c.md): the tasks, rule 99, numbers kept as history | A-1720 to A-1870 | 151 | 29 | 104 | 2 | 3 | 13 |
| [12-part-5a.md](12-part-5a.md): the type table, terms, signature, publication, claim, transfer | A-1871 to A-2137 | 267 | 15 | 240 | 3 |  | 9 |
| [13-part-5b.md](13-part-5b.md): split to record | A-2138 to A-2376 | 239 | 15 | 211 | 4 | 8 | 1 |
| [14-part-5c.md](14-part-5c.md): abandonment to the retired type 21 | A-2377 to A-2578 | 202 | 25 | 163 | 4 | 6 | 4 |
| [15-part-6.md](15-part-6.md): reasoning, parameters, freeze scenarios | A-2579 to A-2772 | 194 |  | 1 |  |  | 193 |

**Exercised** (rows citing at least one case or test):

| Kind | Exercised | Not exercised | Share |
| --- | --- | --- | --- |
| guarantee | 334 | 54 | 86% |
| grammar | 1491 | 420 | 78% |
| stated cost | 22 | 77 | 22% |
| client conformance | 21 | 63 | 25% |
| not a rule | 149 | 141 | 51% |

**The vectors and tests, the other way round.**

- Of the 268 distinct Agreements case names in `verdicts.json`, 266 are cited by a row. The 2 that are not, with 4 Money and Text cases naming an Agreements rule, are classified in file 19: 5 exercise a sentence after all and 1 is Money's.
- Of the Agreements test files' 50 tests no row cites:
  - 19 exercise a sentence after all;
  - 28 exercise another MIR (all of `drafts_after_step_15.rs`'s and `refs_f272.rs`'s, most of `money_price_tag.rs`'s, four debt-payment tests);
  - 3 pin laws no sentence states.

  None is history only.

**Restatements:** 363 groups, 1,214 rows; 34 the same, 322 one narrower, 7 differ. **Two-way readings:** the stranger's six (four in draft 24) and 167 others. **Attacks:** 1,567 rows name an attack or failure from the findings log.

## What the rewrite will meet first

Each item below is recorded, not judged. Where an item is a possible flaw in draft 24, it is for the MOR lead to bring to Nobody, allegedly.

**The seven restatements that differ** (file 17):

- **R-43:** a deal changes with "every party" (A-115, A-1497, A-1910, A-1992), or with "every party whose voice remains" (A-738, A-1257, A-1442, A-1499).
- **R-92:** three advance permissions move a stake without its holder (A-1078, A-1443), or only rule 89's do (A-1079).
- **R-98:** a split is delivered to every holder of the stake, paid or not (A-238), or to every holder and partner it pays (A-984, A-1884, A-2187).
- **R-168:** a frozen area's grants end "for good" (A-1198), or may be reinstated by cloning at the refit (A-1151, A-1255).
- **R-206:** a change that pays the stake less needs every voiceless holder's signature (A-1081), or the owners' consent, which a control model may give for the holders together (A-924, A-997, A-1085).
- **R-223:** a relay's delivery record must name the object paid for (A-1005), or any bake the publication sells (A-2104).
- **R-238:** a declaration moves a stake "only by succession" (A-1703), or outcome 1 may also redistribute it (A-1079, A-1455, A-1691, A-1707).

**The laws the text never states** (file 19):

- verdicts, and explanations too, do not depend on the order acts arrive in. Normal text says it only of "before" and "after" and of lines;
- judging a split never fails (a property of the code more than a law);
- **a publication's backup cannot be its own split service.** The code refuses it; field 11 (A-2078) says only "each an identity, a party";
- a payload read before signing is the publication signed (a property of the library);
- a publication's `refs` to another work creates no tie the core reads. Normal text says so only for bakes and vows.

**Italic sentences that decide verdicts.** Workers found these (each named in the notes of the row beside it). By draft 24's reading rule they are commentary; the rewrite has to make each a rule or drop it knowingly:

- "A complete fork or closing is final" (line 1726; finality also in normal text at line 3456);
- a rollback's exemption from rule 46's false mark and rule 69's constitutional change (line 1879);
- a mark naming the wrong powers is false, and a mark's signers out of order invalid (lines 2713 and 2723);
- thresholds, and named parties being parties (line 2715);
- terms using either place alone stay valid (line 2798);
- a collective naming no control model is judged by the last resort alone (line 2802);
- the split's rounding tolerance, which decides how "any deviation breaks the plan" is read (line 2992);
- an ordinary clone restores nobody (line 876);
- rule 88's paragraph on what a contest shows, which normal text repeats under "Contest (type 14)".

**Smaller discrepancies the workers noted** (each in its row's notes):

- **Withdrawn fields:** the list at line 2796 leaves out field 10, which line 2589 calls withdrawn.
- **How many layers:** field 19 and line 2800 define five layer keys; the italic line 2808 says "Six layers, one per MIR".
- **Field 34:** line 2796 puts field 34 outside the format, while two cases judge areas "named as field 34".
- **A status rule in a format comment:** the transfer's field 3 bound ("at most what the seller still holds") is written as a format comment, though line 49 says such a bound is never a format rule.
- **"Does not count" against "invalid":** the case "a grant for a collective naming a key: it does not count" gives "does not count" where the text says "invalid".
- **"Refused" in a test comment:** the doc comment of `cmips/control/tests/boundary.rs` calls an overreaching answer "refused", which rule 99 says it never makes an act. This may be the comment's wording only.
- **F330 against rule 85:** F330 (Q2) recorded that a declaration against an outside holder with a stake successor states outcome 0 alone; rule 85 now says it states no outcome and never outcome 0. The worker could not tell whether a later finding superseded F330.

## Not this session's

- deciding anything, the homes included;
- the rewrite;
- the task list (Fable's);
- `clients/`, `cmips/`, `modules/`.

**F442** was reserved for a finding of this session's own. It is **unused**: the items above are observations for the MOR lead, not decisions, and the session recorded none in the findings log.
