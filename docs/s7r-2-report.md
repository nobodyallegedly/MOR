**Ready to merge, CI read on the head (below). Texts, suite, code and vectors are done, with one exception: suite step 1.9i (a deal with a notice term) is written but reasoned, not run, because of F438.1. The pins in `clients/` and the six web releases are the Dubsar Suite lead's, on this branch, after I stop.**

# S7r-2 report: termination, defined once, written into MOR

This work is on S7r's branch, `claude/s7r-rehearsal-decisions-t1edud` (pull request 131), on top of `c59aa24`. It writes the same drafts S7r opened: Agreements 24, Development 12, MICS v37 and suite v37. Identity 16, Text 11, Envelopes 12 and Money 14 did not change. F438 is this session's finding (below). It is not written in the log, which lives on `claude/lead-records`.

## In plain words

The core now knows only two states, active or terminated, for an agreement and for each party's place in it, and "unknown" where a verifier cannot tell.

- **The defaults.** A publication's owners' side may terminate, alone, the publication or any other party's place in it. A deal needs every party. A collective names no termination terms.
- **Termination terms.** Anything more is termination terms: a cMIP plugged into one new task, task 15, which answers "met", "not yet met" or "unknown".
- **"No cMIP removes the exit"** is gone from all three places. The way out (a transfer, a release, a resignation, a fork or closing, succession) stays apart, and no term reaches it.
- **Successors.** A stake successor is now judged under the clause that bound the holder it succeeded.
- **Verdicts.** No published verdict moved.

## 1. The sentences, as written and where

All of these are in Agreements 24 unless another text is named.

**The definition.** A new section in Part one, after rule 46: "Termination: active and terminated". It points to "Made before, made after" (section 10, which is in Part two, not beside it). It holds:
- Fable's section 2 as worded: active and terminated, a terminating act, what stands, the defaults by kind.
- Widening, as the addendum reads it: "'the act counts only when the termination terms' cMIP answers met' is read for any terminating act, whoever signed it: a party other than the default's (a partner, a split service, the measurer) may terminate its own place where the terms the parties signed let it. Where they answer not yet met, the act does not count, and the agreement or the place stays active; a later terminating act may count."
- "Only the termination terms (task 15) are asked whether a terminating act counts; no other task's answer, and no control model's, is read for it."
- A stated cost: owners under a veto keep the way out, "each holder may transfer its own share (rule 10), and the owners may release the work (rule 55)".
- Fable's section 6, as client conformance. It ends: "A client that does not hold the termination terms' cMIP shows the agreement's state, or the place's, as unknown from the terminating act on."

**Task 15.**
- Section 22 gets a "Termination terms" entry: what it accepts, what it produces, and "'Not yet met' is condition evaluation's 'pending' (rule 34) under this task's name".
- Development's table gets row 15.

**Its fields.**
- Terms field 36, `[ hash, any ]`, in a deal only. A collective's terms carrying it, or naming task 15 in field 2, are invalid.
- Publication field 13.
- Where field 2 (terms) or field 9 (publication) also names a cMIP for task 15, it must be the same specification. This is said in both formats and in the format prose after "The control model".

**Uses of the definition.**
- **Rule 11.** "A publication's termination is as 'Termination' says." By default the owners' side terminates alone:
  - the publication, by a version that sells nothing;
  - the split service or a backup, by naming others, each newly named one signing to accept;
  - a partner, by dropping it from field 2, its part falling to the owners' line;
  - the measurer, by naming another for its metric.
  
  Every other version needs every party. The stated cost is kept, reworded.
- **Rule 31's first sentence:** "a terminating act of the old service's place".
- **Rule 47.** "A deal is terminated, or winds down, by such a clone … where the deal names termination terms (field 36), the clone counts only when they answer met … Each party's own way out is its transfer (rule 10), which no term reaches."
- **Rules 12 and 17** follow, as does the publication's "It counts" list.

**"No cMIP removes the exit", struck.**
- Rule 11: struck.
- Rule 98.1 now reads: "save a terminating act under its termination rule ('Termination'): by default a publication's owners' side (rule 11), or as termination terms answer, whose conditions the parties gave in advance by signing them (rule 1)."
- Rule 47 now reads: "save a terminating act under its termination rule".

**Rule 89.** "An outcome of the abandonment clause is judicial, never a termination: … no termination terms are asked about it."

**Rule 49** is retitled "Moving off a cMIP". Development rule 12 is retitled the same way, for the same sentence. "Exit" is left only where it names the principle.

**F437.1, in rule 85.** "A stake passes to a successor with the clause that bound its holder: a stake successor is judged under the version that bound the holder it succeeded, found the same way, carried through successions. A holder that bought more than once is judged under its latest placement." The declaration's field 1 check, the MICS line and the suite checklist follow.

**Glossary.** New entries "Termination" ("The agreed way out …"), "Active, terminated" (pointing to rule 98.2) and "Termination terms". "A deal's end" is updated.

**The MICS.**
- One sentence: "Termination is the agreed way out, beside the way out no term reaches (…)".
- The deal, "Two stops" and last-resort lines follow.
- The tasks line names termination terms.
- A glossary row: "Termination | The agreed way out: …".

**Freeze scenarios.** Agreements gets a new list, "Termination, walked", moved out of "The way out, walked". Development's list gets a task 15 bullet.

## 2. The suite (v37)

| Step | What it tests | Status |
| --- | --- | --- |
| 7.7 | Reworded as a termination | run |
| 7.7b | A minimum term not yet met: the terminating version does not count, and sales under the version before stand. After the term it counts. | run |
| 7.7c | A reader without the cMIP: unknown from the act on | run |
| 7.7d | A partner terminating its own place under terms that let it. Without terms, it cannot. | run |
| 3.7bc | A stake successor judged under the clause that bound its holder | run |
| 1.9i | A deal with a notice term | reasoned (F438.1) |

The checklist gains a termination line. Its publication lines no longer say that only every party ends a publication; S7r had left them so.

## 3. Code and vectors

**Reference verifier (`core/`).**
- **Field 36.** `Terms::termination` and `termination_terms()`. It is refused in a collective, and must match field 2's task 15. `LAST_TASK` is 15; `TERMINATION_TERMS_TASK`.
- **Field 13.** Read with the act (`PublicationAct::termination`), not in `Publication`, which cMIPs I may not touch build by hand. `Publication::termination_of()`. `decode_payload` accepts field 13, but a publication re-encoded from it loses field 13.
- **`publication()`.** A terminating act's shape is checked: it sells nothing, or its every change ends a place. Under the default, the owners' side and each newly named service must sign. Under termination terms, the cMIP's stated answer decides. `PublicationEval.unknown` is set where no answer is held.
- **`termination(id)`** returns a `TerminationEval`: whether the act counts (true, false or unknown), `Activity` (active, terminated or unknown) for the publication, and the same for each place it ends.
- **Task 15 sits behind the same boundary as the other tasks.** `termination_answers` are facts the caller states, as `absence_accepted` is. The core reads no cMIP.
- **`holder_clause_version`** follows successors back through the plans that name them (F437.1).

**Vectors.**
- There are 23 new vectors in `verdicts.json`, covering 7.7b, 7.7c, 7.7d, 3.7bb (the vector S7r left), 3.7bc, and field 36's format (a deal, a mismatch, a collective).
- The fixtures for 3.7bb and 3.7bc are built in the generator, with `band` and `clone_of` from scenario 9.
- The test termination cMIP lives in the generator only (`core/examples/support/s7r.rs`). It is never shipped and is no default.
- There are two new questions, `termination` and `declaration`, and one new fact, `termination_answers`. The C verifier will need to answer them.

**Moved verdicts: none.** All 576 earlier cases and all 1,778 pool acts are byte for byte. The only changed line among them is the file's `about` text, which now names the new questions and fact. 7.7's three vectors keep their names, which still say "exit", because keeping them byte for byte comes first.

**Not in code:** a deal's termination, which waits on F438.1. Field 36 is read and checked, but no deal clone is asked about.

## F438: what writing termination exposed (for the lead)

1. **A deal's terminating clone carries no mark.**
   - The definition's "the clone rule 47 describes for a deal", stating where the shares went and what is still owed, cannot be told by a verifier from any other clone of the deal.
   - So "terminated" cannot be decided for a deal, and a notice term cannot be applied to "the end clone".
   - I wrote what was decided and invented no mark. 1.9i is reasoned, and the code asks nothing for deals.
   - The options for Nobody, allegedly, include:
     - a clone naming no future obligations;
     - a flag in the clone;
     - reading termination for a deal only as a party's place dropped from field 0. That last reading is decidable, but it is not "the end clone".
2. **The measurer is no party.**
   - It signs nothing (rule 29), and the publication's "Its parties" list leaves it out. Yet F436.7 and the definition list it among the places the owners' side may terminate, and the definition says a place is active "from the version that names it, which it signed".
   - Written: the owners' side terminates the measurer's place by naming another measurer for its metric; the new measurer does not sign, as no measurer does. Fable's "a metric share no one measures, as key 3 says" holds until the new measurer's first record.
3. **A minimum term needs "not before".**
   - Rule 33 says "not before" is no mechanism of MOR 1, except where a condition cMIP reads a block that an act names. Both builders flagged this.
   - Task 15 says a termination cMIP's conditions are what the data shows. So a minimum term can only be met where the terminating act names a block, or where an anchor shows the act made after a point. Otherwise the answer is unknown.
   - This follows from the texts as they stand. Worth a line in the client conformance, if Nobody, allegedly, agrees.

## The meaning diff (a subagent: each text against main's, S7r's changes and mine together)

- **Mapping.** Every change maps to an F436 item, R-number or F437.
- **Beyond F436, fixed.**
  - My "save where termination terms the owners signed let it" (rule 11, the MICS, the checklist) let terms give a partner the publication's ending. The addendum's widening is a party's own place, so I struck it.
  - A stray "never 'unknown' to the chain", also struck.
- **Beyond F436, left.** Identity's receipt check 5 joins the escape (F436.1) to F436.6 A. S7r named this and the earlier meaning diff accepted it.
- **Contradictions, fixed:**
  - a stale scenario bullet ("a later version every party signs");
  - rule 98's opening sentence over 98.1, now tied to the parties' own signatures;
  - "A deal ends" in the Agreements glossary and the MICS, which now say the clone counts as its termination terms answer.
- **Read and left.** The definition says an abandonment outcome terminates the place, while rule 89 says it is "never a termination". That is Fable's vocabulary: the place is terminated, the outcome is not a terminating act.
- **Missing, added:** F437.1 in the MICS and the suite checklist; a task 15 bullet in Development's scenario list; field 36's comment made unambiguous.
- **No old wording left:** no "only by every party", "owners' side's exit" or "no cMIP removes the exit" remains anywhere.

## The two-builders check (two subagents, given only the eight texts)

| Case | Builder A | Builder B | The code |
| --- | --- | --- | --- |
| Owners drop partner L at 60, minimum term 100 | does not count; P active; L active; old sales stand | the same | `counts false`, active, L active (vector) |
| The same at 140 | counts; P active; L terminated; L's part to the owners' line | the same | `counts true`, active, L terminated (vector) |
| A reader without the cMIP | unknown; P active; L unknown; no client signs unimplemented | the same | `unknown`, active, L unknown (vector) |
| Successor H: the new judge, field 1 latest | counts for nothing | counts for nothing | counts for nothing (vector) |
| Successor H: the old authority, field 1 founding | counts | counts | counts (vector) |

**They agree with each other and with the code.**

**What they raised:**
- **Fixed.** Builder A noted that naming a *member* as the new absence authority leaves that member uncovered (rule 61), so the clone could be invalid. S7r's 3.7bb had the same pattern. Both steps and both fixtures now name an outside judge.
- **Fixed in the fixture.** A record may register only declarations that remove a voice. 3.7bc's fixture no longer registers the declaration against the departed founder.
- **Left as readings:**
  - "Not before" (F438.3).
  - Which payment is "next" after a dropped partner on a push rail. Both read rule 12 by analogy.
  - Whether a non-counting terminating version and a later one form "the parties' fork".
  - Whether a succession clone changing field 7 may be declared by a rotation. S7r's 3.7ag uses the same pattern.

## The eight texts' hashes

These are computed as in `docs/s7l-report.md`: `tagged_hash("MOR/spec", {0: kind, 9: text})`, with one final line break removed. The same code reproduces S7r's values for the four texts that did not change.

| Text | Spec hash |
| --- | --- |
| Identity draft 16 | `43cc2a7fe8e8a31dc566d0942e9d2c8b95902953e51ea2074372c51bbc2f0616` |
| Text draft 11 | `7835d789f6e9cbb3a089620deea1ca73c591617a10a414bc47bb58ed9063b478` |
| Envelopes draft 12 | `c56f0b4ebf63ad774aaaec268c65c93cd4eff9f63bd94754f64062bf8f45bfdc` |
| Money draft 14 | `ba4b3d32832f73a541bccd8a2fe387d95837ecbf2079155f70b715123faa6a2c` |
| Agreements draft 24 | `774c5e0698311eb4d25e5c16946e0b5be012d87a7a162d68ad1c87f79392b0a9` |
| Development draft 12 | `cc174b8fbcaa3b65f6ba19fa23f72fd3952e9706d452b8fb04ac6120bec4d2b7` |
| MICS v37 | `6755fc0526a4ea06cd99e6ef649c1ad39f41ce03c1925cf526186326e2a7c4f2` |
| Freeze test suite v37 | `6e6cf35dd72c44b2d402c0d472c7b3638de8b6ef4a575f1ad053be86a15a9429` |

## For the Dubsar Suite

**Pins.**
- Ummia's `MICS_HASH` and `SUITE_HASH` are the values above, replacing S7r's.
- The reader's draft lines are unchanged from S7r's: Identity 16, Envelopes 12, Money 14, Agreements 24, Development 12. Text stays 11.

**What changes for clients:**
- **Show termination terms before signing.** Show the cMIP's creator and hash, which terminations it reaches and whom it protects, and what it adds, with a plain warning for a veto or a minimum term. A buyer of a share is shown the publications over its stake and their terms.
- **Never sign terms naming a termination-terms cMIP the client does not implement.**
- **Show unknown after a terminating act the client cannot judge,** for the agreement or the place, never active by default.
- **Without terms**, a publication's owners' side alone may end it, or drop a partner, the measurer, the service or a backup. A client acting for the owners' side shows what the act ends, and that everything received before is still split and paid.
- **The task list.** `clients/site/src/listing.ts` lists the tasks and will need task 15, "Termination terms".
- **The binding.** `wasm` builds, but takes no termination answers yet. A publication naming termination terms therefore reads as "unknown" there after a terminating act, as the texts say for a reader without the cMIP.
- **Releases.** `core/` changed again, so the six web releases need rebuilding before merge.

## Checks

- `cargo test --workspace --locked`: 800 passed, 0 failed (on `af5e60a`'s code, before the last fixture change; rerun on the head below).
- Vectors regenerated: 23 new, 0 moved. `cargo test -p mor-core --test vectors` passes. `python3 core/vectors/check.py`: "all 291 vectors agree (113 verdict vectors judged here)".
- `scripts/c-box/make-c-box.sh` into a scratch folder refused nothing: 8 texts, 1 cMIP, 12 vector files. It first refused finding numbers I had put in vector rule strings and in step 1.9i; those are removed.

## CI (read myself on the head)

See below.
