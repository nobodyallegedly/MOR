**Not ready: stopped on F436.10, which as decided breaks freeze scenario 1 step 9 (F440, below). The Dubsar Suite lead should not pin yet: the hashes below are the texts as they stand, not final. Item 2 is written and clean.**

# S7r-4 report: the last text points before the pins, and where they stopped

This work is on S7r's branch, `claude/s7r-rehearsal-decisions-t1edud` (pull request 131), on top of `00db71a`. It changes the same open drafts: Agreements 24, MICS v37 and suite v37.

## In plain words

Nobody, allegedly, agreed that a deal can no longer drop a party quietly. A new version of a deal that leaves someone out must carry the termination mark naming that person's place.

Writing the code showed a clash. Sometimes a party is left out for another reason: an absence declaration has removed their voice, or they sold their whole stake. Under the rule as decided, that version would also need the mark. The mark turns it into a termination, so a deal's termination terms would be asked about it. Those terms can include a notice period or a veto. Leaving out an absent party would then depend on terms that the absence rules, and rule 10's "which no term reaches", keep out.

So F436.10 is not written. Everything else the lead delegated (item 2) is written.

## 1. F436.10: held (F440)

**Nothing of F436.10 is committed.** The texts, the code and the suite case were written and tested in this session, then taken out. The patch is kept outside the repository and can be re-applied once the question is settled.

### F440. A deal's clone leaving out a party whose place already ended

**What the code showed.** With the check in place ("a deal's clone leaving out a party of the parent without the mark naming that party's place is invalid"), three existing tests and three existing vectors fail.

- **`scenario_1_step_9_absence_is_the_authoritys_judgment`** (freeze scenario 1, step 9).
  - After the authority's declaration (voice removed, stake redistributed), p1 and p3 sign a clone without p2. The suite says this clone completes.
  - Under F436.10 the clone is invalid unless it marks p2's place.
- **`review_f190_1_…`, `draft_11_f254_…`, and the rule 15 vectors** (`verdicts.rs`, `s7j.rs`: "Lu in Kai's place").
  - In each, a party leaves with every party signing and no mark.
  - These are only fixtures: marking the place keeps every verdict.

**Why marking the absence clone is not a fix.**
- With the mark, the step 9 test passes, but only because that deal names no termination terms. I checked this.
- Where a deal names termination terms, the mark makes the absence clone a terminating act, so those terms are asked about it ("Termination": "for any terminating act").
- A notice in the terms could then delay an absence outcome, and a veto could block it. Rules 85 to 89 and rule 98.4 decide absence "whatever any cMIP answers".
- The absent party's place has already ended by the outcome ("Active and terminated"). The mark would end it a second time.
- A party that left by its own act, a transfer of its whole stake (rule 10, "which no term reaches"), has the same problem.

**The question for Nobody, allegedly.** Does F436.10 reach a party whose place has already ended by its own act or by an absence outcome put in force under the clone?
- (a) **No.** Such a party may be left out without the mark: the declaration, or the transfer, is the visible act, so nothing is removed silently. F436.10 then reaches only a party whose place is still active. I would choose (a).
- (b) **Yes.** The mark is always required. A mark naming a place that has already ended is then a record only: no terminating act, and no termination terms asked.

**Once decided**, the patch goes back in with that exception or that reading:
- the field 37 prose and rule 47 sentence;
- the check beside the mark's existing check in `view.rs`;
- the 1.9i vector (`a clone leaving out a party of the parent without the termination mark: invalid`), which pairs with the existing marked one-place case;
- the suite's 1.9i case and checklist clause;
- marks added to the f190, f254 and rule 15 fixtures. The three rule 15 vectors' acts would change; their verdicts would not.

## 2. Item 2, the MOR lead's under delegation: written

All of these are in Agreements 24 unless noted.

**F439.1, the minimum-term line of client conformance.** It now reads: "**A minimum term or a notice is checkable only where the terminating act names a block, or cites an anchor, after whose block it was then made; otherwise the termination terms' answer is unknown** (rule 33's "not before")."

**S7r-3's four validity points, each said once.**
- *None a party of the clone* and *no mark in founding terms* were already said once, in the field 37 prose. They are unchanged.
- *A marked clone that does not count is no version in force.* Rule 47 now reads: "… which counts only when they answer met; a marked clone that does not count is no version in force, the version before it staying in force."
- *Terminating a deal ends every place.* The field 37 prose now reads: "`[0]`, the deal, and with it every party's place".

**The two older lines.**
- **Rule 98.1** now reads: "… save a terminating act under its termination rule ("Termination"): by default every party whose voice remains, by a clone carrying the termination mark (rule 47), or as termination terms answer …". The old text, "a publication's owners' side (rule 11)", gave a publication's default under a deal's rule.
- **The MICS v37 price-tag line** now reads: "*… a publication ends by a terminating act under its termination rule, by default its owners' side alone, or as its termination terms answer (Agreements, "Termination").*"

## 3. The suite (v37)

- **1.9i's notice sentence and the checklist's termination line** now use the F439.1 wording.
- **The 1.9i case for the unmarked clone dropping a party is held**, with F436.10.

## Moved verdicts

**None.** No code or vector changed: `verdicts.json` and the pool are byte for byte.

## The meaning diff (a subagent, on this session's text changes)

**Every change maps to item 2. Nothing goes beyond item 10.**
- Each of the four validity points is now said exactly once in Agreements 24.
- Rule 98.1 and the MICS line agree with "The defaults, by kind".
- The new minimum-term line agrees with rule 33. The old line did not: an anchor shows only that something existed by a point.

**Noted, not changed.**
- Rule 98.1's exception now has the same default as its main rule ("only with every party … save … by default every party …"). It is correct, though it reads oddly.
- "Names a block, or cites an anchor, after whose block it was then made" is the wording as decided. Its "then" adds nothing.

## The eight texts' hashes (as they stand; not final)

Computed as in `docs/s7l-report.md`: `tagged_hash("MOR/spec", {0: kind, 9: text})`, kind 4 for a MIR, 6 for the MICS, 7 for the suite, with one final line break removed. The five unchanged texts reproduce S7r-3's values.

| Text | Spec hash |
| --- | --- |
| Identity draft 16 | `43cc2a7fe8e8a31dc566d0942e9d2c8b95902953e51ea2074372c51bbc2f0616` |
| Text draft 11 | `7835d789f6e9cbb3a089620deea1ca73c591617a10a414bc47bb58ed9063b478` |
| Envelopes draft 12 | `c56f0b4ebf63ad774aaaec268c65c93cd4eff9f63bd94754f64062bf8f45bfdc` |
| Money draft 14 | `ba4b3d32832f73a541bccd8a2fe387d95837ecbf2079155f70b715123faa6a2c` |
| Agreements draft 24 | `6404ca9afca4b2f628814481bacba189f8a25f2ca794cb08c8ecc17b87c580dd` |
| Development draft 12 | `cc174b8fbcaa3b65f6ba19fa23f72fd3952e9706d452b8fb04ac6120bec4d2b7` |
| MICS v37 | `bbf9331c6aeaa055e7a63411e3325448f1424dc53b2feba2eda921d8906c315d` |
| Freeze test suite v37 | `39c92d73c2d21f40fddd95a2bce2f8c8f237340de32b68a1a83e7522c70c11a8` |

**For the Dubsar Suite.** These values will change again when F436.10 is written. The one change for clients, "a deal's clone dropping a party carries the mark", waits on F440 too. Under (a) it reaches only a party whose place is still active. The pins in `clients/` and the six web releases remain the Dubsar Suite lead's, on this branch, once F436.10 is in.

## Checks

- `cargo test --workspace --locked`: 800 passed, 0 failed.
- Vectors regenerated: byte for byte.
- `python3 core/vectors/check.py`: "all 291 vectors agree (113 verdict vectors judged here)".
- `scripts/c-box/make-c-box.sh` into a scratch folder refused nothing: 8 texts, 1 cMIP, 12 vector files.
- With the F436.10 patch applied, 3 tests failed (named above), and 3 existing vectors needed their fixtures marked.

## CI

Read on this head after the push: see the next commit, which adds the result to this report.
