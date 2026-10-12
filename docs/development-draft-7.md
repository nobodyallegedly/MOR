# Development draft 7: the report

*12 October 2026. Roadmap: the sessions launched before the review, (c) Development draft 7, plain reading in Agreements draft 11's and Money draft 7's style (F251), one step, texts only. Branch `claude/development-draft-7-spec-qkv64a`. For Nobody, allegedly, to review and approve.*

## In plain words

Development draft 6 was short, but out of order and full of history. Its rules about extensions and the machine that runs verification rules sat in the middle, between the everyday rules. Six italic notes at its top told how it had been revised. Draft 7 says the same rules again, in the order a reader meets them.

**No rule changed.**

- **Part one** is cMIPs and Modules as they run most of the time:
  - naming a specification, by the hash of its content;
  - freezing it at publication;
  - the tasks, with their table;
  - adopting a specification and leaving it;
  - showing what a rule computes before signing;
  - how creators earn;
  - discovery.
- **Part two** is the rare cases and the mechanics: extensions, the frozen machine (RV32IM) that verification rules run on, predecessors, and the trust root and successors.
- **Part three** is the specification format, for reference.
- **Part four** is the reasoning, the open parameters and the freeze scenarios.

Each rule has a new number in reading order, with its old number beside it ("Rule 25 (was 3a)"), and a table maps old numbers to new. The longer rules open with an italic *In short*. Rules that cite Agreements now use draft 11's numbers, and rules that cite Money use draft 7's. The revision notes, "Decided in this draft" and the dates of each decision stay in draft 6 and the findings log.

**The tasks table, brought up to date.** Two items state what Agreements draft 11 already decided. Each is marked "carried from Agreements draft 11", not "new":

- **Task 8, split:** the split cMIP also chooses the receiver for each payment, among the services the signed terms name, in order (F250). This line was already written into draft 6, in place, at the split Module build. Draft 7 only marks it and cites Agreements rule 17 (was 18a).
- **The proof checker of a proven offer (F261):** a paragraph under the table. A proven offer's delivery leaves a proof anyone can check from data alone. The verifier checks the proof, never the cMIP's word. It has no task number, because Agreements draft 11 gives it none. That raised one question (below).

**How we know no rule moved:**

- No code changed, and the code's tests pass unchanged (below).
- A script checked every sentence of draft 6 against draft 7. Every sentence is there, except the history removed on purpose and the citations renumbered. The CDDL block, the tasks table, the reasoning, the open parameters and the freeze scenarios were compared line by line.
- A second reader, who had not written the text, compared draft 7 with draft 6 rule by rule, and checked every citation against the tables of Agreements draft 11 and Money draft 7. They found no rule whose content changed and every citation correct. They found 9 wording points. All are fixed or answered; the list below names each.

**One question** for Nobody, allegedly: is the proof checker of a proven offer a task?

## What changed, file by file

- `spec/MIP-development-draft-7.md`: new.
- `spec/README.md`: one line, draft 7, awaiting approval.
- **Unchanged:** `spec/MIP-development-draft-6.md` stays as the approved text, and the reference that code comments, tests, records and the other drafts cite by its numbers. `spec/02-MOR-core-v21.md` and `spec/03-MOR-freeze-test-suite-v21.md` are not edited (see below: no sentence of theirs quotes a sentence changed). No code, test or record was edited.

## Old numbers to new

Every old rule has exactly one new number. None was split, merged or dropped.

| Old | New | Rule |
| --- | --- | --- |
| 1 | 1 | By hash |
| 2 | 2 | Types by spec |
| 3 | 3 | Creator signature |
| 3a | 25 | Predecessors are claims |
| 4 | 4 | Never updated |
| 5 | 5 | Data formats outlive modules |
| 5a | 6 | Task numbers |
| 6 | 7 | Task grammar |
| 7 | 8 | One per task, per agreement |
| 8 | 9 | Modules within cMIPs |
| 8a | 18 | New kinds of things need no task |
| 8b | 19 | Extensions in agreements |
| 8c | 20 | Add, never subtract |
| 8d | 21 | The path to MOR 2 |
| 9 | 10 | Unknown until adopted |
| 10 | 11 | Adoption by opt-in |
| 11 | 12 | Exit |
| 12 | 22 | One frozen machine |
| 13 | 23 | The rule decides validity; the text explains it |
| 14 | 24 | A mismatch is a bug |
| 15 | 13 | Signing what it computes |
| 16 | 14 | A creator who charges states its fee in its specification |
| 17 | 15 | Usage is evidenced, not tracked, and always by a party |
| 18 | 16 | Bounties |
| 19 | 17 | No core registry |
| 20 | 26 | The six hashes |
| 21 | 27 | A successor changes the prefix |

Citations renumbered, each checked by the second reader against the cited rule's text:

- Agreements, draft 10's numbers to draft 11's: 18a to 17 (task 8), 27 to 28 (fees, rule 14), 44b to 63 and 36a to 60 (field 10); 22 stays 22 (rule 15).
- Money, draft 6's numbers to draft 7's: 10 to 11 and 10c to 18 (field 11's comment); "(Money)" made precise as rule 20 (was 10b, the evidence of a rail Module's use) and rule 22 (was 19, no fees for specifications) in rule 15; the Module definition's quote of Money ("Units are small specifications of their own"), which draft 7 no longer words so, now reads (Money, "Unit").

## No rule moved: the rule-by-rule list

**What the rewrite removed on purpose** (history only; each fact is kept in draft 6 and the findings log):

- the six revision notes at the top of draft 6 (F126, F128 W4, F204, F250, F190 and the technical pass, F191 to F199, step 12b);
- "Decided in this draft" (F40 to F116), each of which is stated in the rules;
- decision narration: "decided by Nobody, allegedly, 10 October 2026" in rules 14 and 15 (were 16 and 17); the quote that gives rule 14's reason stays, in italics;
- "*Before step 12b: fees were standing offers.*" in rule 14 (was 16);
- "step 12b, Fable's reading of OF12, option b" in rule 15 (was 17), now "(OF12 b)", as field 11 already writes "(OF26 a)".

**What it added, commentary only:** italic *In short* summaries (rules 14, 15, 22, field 10); an italic overview of Part one; two italic pointers (rule 4 to rule 25, rule 19 to field 10); headings grouping the definitions and the freeze scenarios.

### The 27 rules

| New | Was | Rule | Second reading |
| --- | --- | --- | --- |
| 1 | 1 | By hash | no difference |
| 2 | 2 | Types by spec | no difference |
| 3 | 3 | Creator signature | no difference (two paragraphs) |
| 4 | 4 | Never updated | no difference; an italic pointer to rule 25 added |
| 5 | 5 | Data formats outlive modules | no difference |
| 6 | 5a | Task numbers | no difference |
| 7 | 6 | Task grammar | no difference |
| 8 | 7 | One per task, per agreement | no difference |
| 9 | 8 | Modules within cMIPs | no difference |
| 10 | 9 | Unknown until adopted | no difference |
| 11 | 10 | Adoption by opt-in | no difference |
| 12 | 11 | Exit | no difference |
| 13 | 15 | Signing what it computes | no difference (two paragraphs; the conformance mark kept) |
| 14 | 16 | A creator who charges states its fee in its specification | fixed: the *In short* said "a Module states its fee"; it now says "a creator who charges", "for information only", "nothing is forced" |
| 15 | 17 | Usage is evidenced, not tracked, and always by a party | fixed: the *In short* now says "the payer the payment commits to … in its claim" (F193) and "the payer's claim" |
| 16 | 18 | Bounties | no difference |
| 17 | 19 | No core registry | no difference |
| 18 | 8a | New kinds of things need no task | no difference |
| 19 | 8b | Extensions in agreements | no difference; an italic pointer to field 10 added |
| 20 | 8c | Add, never subtract | no difference |
| 21 | 8d | The path to MOR 2 | no difference (wholly italic, as in draft 6) |
| 22 | 12 | One frozen machine | fixed: the *In short* now keeps the trigger ("where a cMIP or Module says"), the fixed encoding and F204's client-supplied headers; the budget sentence put back in one paragraph with the profile, so **[for technical review at freeze]** closes the same text as in draft 6 |
| 23 | 13 | The rule decides validity; the text explains it | no difference |
| 24 | 14 | A mismatch is a bug | no difference |
| 25 | 3a | Predecessors are claims | no difference |
| 26 | 20 | The six hashes | no difference |
| 27 | 21 | A successor changes the prefix | no difference |

### The other sections

| Section | Second reading |
| --- | --- |
| Header, "How to read this draft" | fixed: the header said the F250 line was brought in by this draft; it now says draft 6 already carried it, in place, and that the F261 item is a paragraph, not a table line |
| Part one's overview (italic) | fixed: "one cMIP per task" now "at most one" |
| Purpose, dependencies | identical |
| Definitions (all 10 kept, in three groups) | no difference; Money's quote now cited as (Money, "Unit") |
| Tasks table | rows 1 to 7 and 9 to 14 identical; row 8 marked "carried from Agreements draft 11", 18a to 17 |
| The proof checker paragraph | fixed: draft 11's protocol sentence put in ("A delivery the verifier cannot check from data it holds is not proven, whatever the cMIP signs"); the checker sentence credited to the build's reading, where draft 11 has it, not to draft 11's rule; "the offer names that cMIP, not terms field 2" removed as an inference |
| Specification format: CDDL | identical apart from field 11's comment (Money rules 10, 10c to 11, 18) |
| Field 10 | no difference (44b to 63, 36a to 60); fixed: its *In short* now keeps "read only where an agreement names it as an extension" and "any other value or order is invalid" |
| Spec hash; MIPs have no creator | identical |
| Reasoning, open technical parameters | identical |
| Freeze scenarios (11 bullets) | identical, grouped as Part one and Part two |
| Old numbers to new | matches every heading |

## Core v21 and freeze suite v21: sentences to change

**None.** Neither document quotes a sentence this draft changed. Their Development sections paraphrase (core v21, "MIP: Development"; the suite's "Development" components), and the one sentence close to Development's words, core v21's "A plain tip carries no module fees beyond the rail's own" (Money's section), quotes a sentence that is unchanged. Neither cites Development by rule number. Nothing for the project lead to apply. One stale sentence, already stale before this draft, is listed below as carried point 2.

## Question for Nobody, allegedly

### Q1. Is the proof checker of a proven offer a task?

**Area: core business** (Development's task grammar).

*In plain words:* Development says a task is "a point where a MIP hands work to a cMIP", and that every task has one global number. Agreements draft 11 hands a proven offer's proof to the checker of the cMIP the offer names. By Development's own words, that is a task, but it has no number. The two texts do not quite agree.

*The working rule, checked:* participants already choose which cMIP checks their proof (the seller names it in the offer). But whether that choice is "a task" is the core's grammar: it decides the table every client counts the same way. So it is put.

*Options:*

- **(a) Not a task** (recommended). The checker is the verification rule of the cMIP the offer names (rule 22), as a rail Module's check of a rail proof already is. The freeze-ready draft reads a task as a point where a MIP hands work to a cMIP *an agreement names by task number* (terms field 2). Nothing changes in code. An offer names its cMIP directly, so a number would serve nothing.
- **(b) Task 15**, Agreements, "Proof of delivery": accepts an offer's item and a proof, produces proven, not proven or unknown. Every client counts it the same way. In a collective with areas, it would also fall in the Agreements lane like other Agreements tasks, a further rule to write.
- **(c) Leave it open** until the freeze-ready draft.

Draft 7 states the paragraph as Agreements draft 11 has it, with no number, and decides nothing.

## Noticed in draft 6, carried unchanged

These were in draft 6, or between drafts, and are kept as they were. They are listed for the freeze-ready draft.

1. **Q1's answer**, once given, is written in: either the definition of a task is narrowed, or task 15 added.
2. **Core v21 lags F211.** Its "Earning through signed terms" says "Creators earn through standing fee offers"; since step 12b, a Module states its fee in field 7 and only an agreement's fee entry makes it owed (rule 14, was 16). Core is the project lead's to revise.
3. **Task 6 and field 11.** The payment task's output still says the cMIP tells "whether each rail Module is a request rail or a push rail"; since step 12b the rail Module declares its kind itself, in field 11 (OF26 a). Consistent if read as "how the cMIP reads field 11", but worth one wording. Money draft 7's carried point 2 (its "FORMAT OPEN") is the same thing.
4. **RV32IM and the checkers built so far.** Rule 22 asks every rule "anyone can run" to be a program for RV32IM. The rail Modules' rules and the anchoring checker run natively in the library today; the profile itself is open until freeze (F78). The freeze-ready draft should say whether a proven offer's checker is such a rule (it is, by its definition).
5. **Money's payment task wording.** Money draft 7's "Tasks" leaves out the claim a purchase pays under, which Development's row 6 has (F126). Development is the fuller one.
6. **Judicial tasks.** Agreements draft 11 calls absence proof (task 14) judicial in its tasks list, but its rule 60 names only 9, 10 and 11 as the judicial tasks. Development's table marks none as judicial. Agreements' to tidy; noted here because the table is Development's.
7. **No freeze scenario** for the proof checker in Development's list; Agreements draft 11's scenarios cover proven offers.
8. **Draft 6's in-place revisions** (F204, F190, F191 to F199, step 12b, F250) were each "for Nobody, allegedly, to approve again". Approving draft 7 approves their content as written here.

## Tests

**Main, before writing anything** (commit `ea7cd5d`, `scripts/test-all.sh`, without `--reproducible` and without regtest): **all tests passed.**

- Rust workspace: 634 passed, 0 failed, 1 ignored (the Lightning regtest, skipped unless `MOR_LN_REGTEST` is set).
- TypeScript: 248 passed, 0 failed, in 14 packages: barebone 9, collective 41, connector 12, desk 12, genesis 17, longform 26, manage 7, poster 7, reader 16, repo 18, site 57, jpeg 14, video 6, carry 6.

*How it ran:* this container had no `wasm-bindgen`. I installed the version the script names (`cargo install wasm-bindgen-cli --version 0.2.129 --locked`), outside the repository, while the Rust half ran. The tree was untouched during the run; the draft was written in a scratch folder.

**The branch, after the texts commit** (`a6739b8`, same options): **all tests passed**, with the same counts as on main: Rust 634 passed, 0 failed, 1 ignored; TypeScript 248 passed, 0 failed. No code or test changed, so the code's tests pass unchanged: the check that no rule moved. The tree was untouched during the run.
