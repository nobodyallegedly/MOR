**Ready to merge, CI read on the head (below), save the two client pin tests, which wait on the Dubsar Suite lead. The pins in `clients/` and the six web releases are the Dubsar Suite lead's, on this branch, after I stop.**

# S7r-4 report: the last text points before the pins

This work is on S7r's branch, `claude/s7r-rehearsal-decisions-t1edud` (pull request 131), on top of `00db71a`. It changes the same open drafts: Agreements 24, MICS v37 and suite v37.

## In plain words

A deal can no longer drop a party quietly. A new version of a deal that leaves someone out must carry the termination mark naming that person's place, or it is invalid.

There is one exception. Some parties' places have already ended: they sold their whole stake, or an absence declaration removed their voice. Those parties are left out without the mark.

Writing the code first showed the need for that exception (F440). Nobody, allegedly, chose it: "A)".

## F440: what writing F436.10 exposed (decided)

**The clash.** The check as first decided had no exception, and it made freeze scenario 1 step 9 fail. There, after the authority declares p2 absent (voice removed), the clone without p2 completes.
- Marking that clone would make it a terminating act.
- Where a deal names termination terms, those terms would then be asked about an absence outcome. A notice could delay it and a veto could block it, though rules 85 to 89 and 98.4 hold "whatever any cMIP answers".
- A party that sold its whole stake (rule 10, "which no term reaches") would meet the same problem.

**Decided by Nobody, allegedly: (a).** F436.10 reaches only a party whose place is still active. A party whose place already ended is left out without the mark. It ended either by its own act (a transfer of its whole stake that the clone counts) or by an absence outcome removing its voice.

## 1. F436.10: the sentences as written and where

Both sentences are in Agreements 24.

**The format, field 37 prose** ("The termination mark"), after "that carry it are invalid":
> **A deal's clone that leaves out a party of the parent whose place is still active, without the mark naming that party's place, is invalid**: nothing is removed silently. A place already ended needs no mark: by the party's own act, a transfer of its whole stake the clone counts (field 31; rule 10), or by an absence outcome removing its voice (rule 89).

**Rule 47:**
> … a clone without the mark terminates nothing, whatever it states, and **a clone that leaves out a party of the parent whose place is still active, without the mark naming that party's place, is invalid**, a party whose place already ended, by a transfer of its whole stake the clone counts or an absence outcome removing its voice, being left out without it ("Active and terminated").

## 2. Item 2, the MOR lead's under delegation

All of these are in Agreements 24 unless noted.

**F439.1, the minimum-term line of client conformance:**
> **A minimum term or a notice is checkable only where the terminating act names a block, or cites an anchor, after whose block it was then made; otherwise the termination terms' answer is unknown** (rule 33's "not before").

**S7r-3's four validity points, each said once.**
- *None a party of the clone* and *no mark in founding terms* were already said once, in the field 37 prose. They are unchanged.
- *A marked clone that does not count is no version in force.* Rule 47: "… which counts only when they answer met; a marked clone that does not count is no version in force, the version before it staying in force."
- *Terminating a deal ends every place.* Field 37 prose: "`[0]`, the deal, and with it every party's place".

**The two older lines.**
- **Rule 98.1:** "… save a terminating act under its termination rule ("Termination"): by default every party whose voice remains, by a clone carrying the termination mark (rule 47), or as termination terms answer …". The old text gave a publication's default, "a publication's owners' side (rule 11)", under a deal's rule.
- **The MICS v37 price-tag line:** "*… a publication ends by a terminating act under its termination rule, by default its owners' side alone, or as its termination terms answer (Agreements, "Termination").*"

## 3. The suite (v37)

- **1.9i** gains the case: "**A clone leaving out a party without the mark is invalid**: every party signs the same clone no longer listing that party, its place still active, carrying no mark: it is invalid in every client, nothing removed silently; a party whose place already ended, by a transfer of its whole stake the clone counts or by an absence outcome removing its voice, is left out without the mark."
- **1.9i's notice sentence** uses the F439.1 wording.
- **The checklist's termination line** gains "and invalid where it leaves out a party of the parent whose place is still active" and the F439.1 wording.
- **Scenario 1's "Passes if"** gains "no party whose place is still active left out without the mark naming it (1.9i)".

## 4. Code and vectors

**Code** (`core/src/agreements/view.rs`).
- The check sits beside the mark's existing check on a deal's clone. A clone is invalid when it leaves out a party of the parent that:
  - is not named in its `[1, parties]` mark;
  - still has a voice (no counted absence declaration removing it);
  - has not transferred its whole stake by transfers the clone counts (field 31).
- **A `[0]` mark does not excuse leaving a party out.** It names the deal, not that party's place, so a clone ending the whole deal keeps its parties listed. This is a reading of "naming that party's place".

**Tests.**
- **New: `f436_10_a_party_left_out_needs_the_mark_unless_its_place_already_ended`**, which covers three versions:
  - unmarked, with Ben's sale not counted: invalid;
  - marked: not invalid;
  - counting Ben's sale of his whole stake, unmarked: not invalid.
- **The absence half** is the existing `scenario_1_step_9_absence_is_the_authoritys_judgment`, unchanged and passing.
- **Fixtures** in `review_f190_1_…`, `f192_…` and `draft_11_f254_…` now mark the place they drop.

**Vectors.**
- **One new 1.9i vector**, "a clone leaving out a party of the parent without the termination mark: invalid". It is the clone of the existing one-place case ("a marked clone naming one party's place …: that place terminated"), without the mark. That existing case is the marked pair: it counts as the mark says.

**Moved by F436.10: three vectors, verdicts unchanged.** Each one's fixture had an unmarked clone putting Lu in Kai's place, which is now invalid. The fixtures now mark Kai's place, so their acts changed and their verdicts did not:
- "a deal one of whose parties is a deal, signed by every party of that deal's version in force: exists"
- "an inner deal already re-versioned, Lu in Kai's place, the outer deal then signed by Jo and Kai: it does not exist"
- "the outer deal signed by Jo and Kai under the inner deal's founding, the inner deal then re-versioned: the consent stands, the outer deal exists"

Every other case is byte for byte. The pool lost those fixtures' 16 old acts and gained 19.

## The meaning diff (subagents, on this session's text changes)

**Item 2:** every change maps to it, and nothing goes beyond item 10.
- Each validity point is now said once.
- Rule 98.1 and the MICS line agree with "The defaults, by kind".
- The new minimum-term line agrees with rule 33. The old one did not.

**F436.10 and (a):** every change maps to them, and nothing goes beyond.
- "A transfer of its whole stake the clone counts" adds no condition: in a deal, field 31 decides which transfers a version counts.
- The decision is said once in each of the two places.
- It agrees with scenario 1 step 9 and with rule 89's succession clone.

**Fixed after the review.**
- Rule 47 now names the two ways a place ends, as the field 37 prose does.
- 1.9i's loose "without it" now says "without the mark".
- "Passes if" gains the case.

**Noted, not changed.**
- **Outcome 1 alone** (stake redistributed, voice kept) does not end a place. Dropping that party still needs the mark.
- **Step 1.9e's investor** "left the parties". Under F436.10 that happened by a marked clone; the step does not say how.
- **Rule 98.1's exception** now has the same default as its main rule. It is correct, though it reads oddly.

## The eight texts' final hashes

Computed as in `docs/s7l-report.md`: `tagged_hash("MOR/spec", {0: kind, 9: text})`, kind 4 for a MIR, 6 for the MICS, 7 for the suite, with one final line break removed. The five unchanged texts reproduce S7r-3's values. These replace S7r-3's.

| Text | Spec hash |
| --- | --- |
| Identity draft 16 | `43cc2a7fe8e8a31dc566d0942e9d2c8b95902953e51ea2074372c51bbc2f0616` |
| Text draft 11 | `7835d789f6e9cbb3a089620deea1ca73c591617a10a414bc47bb58ed9063b478` |
| Envelopes draft 12 | `c56f0b4ebf63ad774aaaec268c65c93cd4eff9f63bd94754f64062bf8f45bfdc` |
| Money draft 14 | `ba4b3d32832f73a541bccd8a2fe387d95837ecbf2079155f70b715123faa6a2c` |
| Agreements draft 24 | `deaa97a11283f31e3f6f981cea1559558cda13cf79f9ce3cc4f6feb96b070af3` |
| Development draft 12 | `cc174b8fbcaa3b65f6ba19fa23f72fd3952e9706d452b8fb04ac6120bec4d2b7` |
| MICS v37 | `bbf9331c6aeaa055e7a63411e3325448f1424dc53b2feba2eda921d8906c315d` |
| Freeze test suite v37 | `a44ffcb3d741a8463ff9f11bddc81df4d5c8dff8bfd7cd805b57e606aeaa7d92` |

## For the Dubsar Suite

**Pins.**
- Ummia's `MICS_HASH` and `SUITE_HASH` are the values above.
- The reader's draft lines are unchanged from S7r-3: Identity 16, Envelopes 12, Money 14, Agreements 24, Development 12; Text 11.

**The one change for clients.** A deal's clone that drops a party carries the mark naming that party's place (`[1, parties]`). The exception is a party whose place already ended, by a whole-stake transfer the clone counts or an absence outcome removing its voice.

**Releases.** `core/` changed, so the six web releases need rebuilding.

## Checks

- `cargo test --workspace --locked`: 801 passed, 0 failed.
- Vectors regenerated: byte for byte save the three listed and the one new.
- `python3 core/vectors/check.py`: "all 291 vectors agree (113 verdict vectors judged here)".
- `scripts/c-box/make-c-box.sh` into a scratch folder refused nothing: 8 texts, 1 cMIP, 12 vector files.
  - Its first run refused the new vector's rule for carrying a finding number. That was fixed in `1ad9945`.

## CI (read myself on the head)

Read on `c4877ed`, the last commit that changes texts, code or vectors. The commit after it adds this section only.

- **tests, run 1460 (`regtest` job):** passed.
- **tests, run 1460 (`all` job):** every step passed save `clients/ummia` and `clients/reader`. Among the passing steps:
  - the Rust workspace;
  - the vectors regenerated byte for byte;
  - the independent Python check;
  - the WebAssembly build;
  - every other client and Module;
  - the reproducible build of the display client.
- **The two failures are the pins awaiting the Dubsar Suite lead, as on S7r-3's head.**
  - `clients/ummia` still pins S7r's `MICS_HASH` and `SUITE_HASH`.
  - `clients/reader` still names Agreements draft 23.
  - I read the failing steps from the job's step results, not from the job log.
- **nakisib, run 172:** passed.
