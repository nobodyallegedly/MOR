**Ready to merge, CI read on the head (below), save the two client pin tests, which wait on the Dubsar Suite lead. The pins in `clients/` and the six web releases are the Dubsar Suite lead's, on this branch, after I stop.**

# S7r-3 report: a deal's termination marked

This work is on S7r's branch, `claude/s7r-rehearsal-decisions-t1edud` (pull request 131), on top of `51f44b1`. It writes F436.9 into the same open drafts: Agreements 24, MICS v37 and suite v37. Development 12 did not change, because the task table did not move. Identity 16, Text 11, Envelopes 12 and Money 14 did not change either.

## In plain words

A deal now ends only when its parties say so. A clone of a deal that terminates carries a mark, field 37, naming what it ends: the whole deal, or named parties' places. A clone without the mark terminates nothing, whatever its words say. A deal's termination terms are asked only about a marked clone.

## 1. The sentences, as written and where

All are in Agreements 24.

**The format** ("Terms (type 0)").
- In the CDDL: `? 37 => terminates`, "the termination mark: in a deal's clone only, which terminates what it names", and `terminates = [ 0 ] / [ 1, [+ hash] ]`, "the deal / the places of these parties".
- In the prose after field 36: "**The termination mark** (field 37) says that a deal's clone terminates, and names what: `[0]`, the deal; `[1, parties]`, the places of those parties, ascending, none twice, each a party of the parent and none a party of the clone. It appears only in a deal's clone: founding terms, or terms carrying a key grammar (field 12), that carry it are invalid."
- Field 37 is new: it is not among the withdrawn numbers or the control model's numbers.

**The definition**, "A terminating act".
- "… or a deal's clone carrying the termination mark (terms field 37), which names what it terminates, the deal or named parties' places (rule 47) …"
- "A deal's clone without the mark is never a terminating act, whatever it states."

**Rule 47.** "A clone terminates only where it carries the termination mark (field 37), naming the deal or the parties' places it terminates; a clone without the mark terminates nothing, whatever it states. Where the deal names termination terms (field 36), they are asked only about a marked clone, which counts only when they answer met."

**F438.3, one line of client conformance**, beside the termination terms' lines: "**A minimum term or a notice is checkable only where the terminating act names a block, or an anchor shows it made after a point; otherwise the termination terms' answer is unknown** (rule 33's 'not before')."

**F438.2** stays as S7r-2 wrote it. **"What stands"** is unchanged.

**Summaries kept from contradicting the mark.** These name the mark and say nothing new:
- the glossary's "A deal's end";
- the Legible-money list's "A deal ends";
- the MICS "A deal ends by a clone" line;
- the freeze-scenario bullet for 1.

## 2. The suite (v37)

- **1.9i is run.** A deal names a notice (field 36).
  - A marked clone `[0]` naming a block before the notice's end: not yet met; it does not count, and the deal stays active, the version before it in force.
  - The same clone naming a block after it: met; the deal is terminated, every party's place with it.
  - A reader without the cMIP: unknown.
  - A clone without the mark stating no further obligations: no terminating act. It is a version like any other, and the terms are not asked.
  - A marked clone naming one place.
  - The mark's invalid forms.
  - The F438.3 line.
- **The checklist's termination line** gains the mark and the F438.3 line.
- **Scenario 1's "Passes if"** gains 1.9i.

## 3. Code and vectors

**Code.**
- `Terms::terminates` (`Terminates::Deal` / `Places`) holds field 37, encoded and decoded.
- The format checks refuse the mark in founding terms or a collective's terms. They also refuse places out of order, and places naming a party of the clone.
- The view refuses a mark naming someone who is not a party of the parent.
- **`termination(id)` now answers for a deal's clone.**
  - An unmarked clone is no terminating act.
  - A marked clone counts where it is complete and, where the version it clones names termination terms, where they answer met. Where no answer is held, unknown.
  - `TerminationEval.deal` tells a deal's reading from a publication's.
- **Field 36 is asked only about a marked clone.** `agreement()` treats a complete marked clone as not existing when the terms answer not yet met, and as unknown with no answer. Unmarked clones are untouched.

**Vectors.**
- 12 new vectors in `verdicts.json`:
  - 1.9i: before, after, a reader without the cMIP twice, the unmarked clone twice, and one place;
  - the mark's format: a party still listed, a stranger, founding terms, a drafted marked clone, a collective.
- The pool grew by 26 acts.

**Moved verdicts: none.** The diff of `verdicts.json` removes no line, so every earlier case and pool act is byte for byte, `about` included.

## The meaning diff (a subagent, on this session's text changes)

**Every change maps to F436.9 or the brief.** It also confirmed:
- each of the three places says the mark once;
- "What stands" is unchanged;
- field 37 collides with nothing.

**Fixed.**
- My bold inside an already-bold conformance paragraph inverted its emphasis.
- 1.9i's "and a client shows it so" added a showing duty the MIR line does not state. Struck.

**Beyond F436.9, left for the lead to confirm or strike.**
- **"None a party of the clone."** This is a validity condition. It keeps a terminated party from being listed again in the same version. It also means a party holding two seats by succession cannot end one seat alone. The mark names identities, not seats.
- **A mark in founding terms is invalid.** This follows from "a mark in the clone", but it is a new invalidity.
- **"The version before it in force"** (1.9i). A marked clone that does not count does not take effect as a version either. This is the publication precedent (7.7b), now said for a deal. The code reads it so.
- **"Every party's place with it"** (1.9i). Terminating the deal ends every place. The MIR implies this but does not say it; the code reads it so.

**Read and left.** The definition's first branch, "a version … that names a party's place terminated", could still be read as covering a deal's clone. The new sentence ("never a terminating act" without the mark) decides it.

**Older, not this session's.**
- Rule 98.1 gives "a publication's owners' side (rule 11)" as an example under "A deal changes only with every party".
- The MICS's Money line still says, in italics, "a publication ends only by a later version every party signs". That predates the termination default.

## The two-builders check (two subagents, given only the eight texts)

| Case | Builder A | Builder B | The code |
| --- | --- | --- | --- |
| Marked `[0]`, block 80, notice ends 120 | terminating act; does not count; deal active; both places active | the same | `counts false`, deal active, both places active (vector) |
| The same, block 150 | counts; deal terminated; both places terminated | the same | `counts true`, terminated, both terminated (vector) |
| Unmarked, "no further obligations" | not a terminating act; in force as a version; terms not asked; active | the same | no terminating act, active, no place; exists (vectors) |
| A reader without the cMIP, block 150 | unknown; deal and places unknown | the same | `unknown`, unknown, unknown (vector) |
| Marked, no block, no anchor | unknown | unknown | (stated as a fact in the vectors: no answer, unknown) |

**They agree with each other and with the code.**

**What they raised.**
- **Fixed.** 1.9i said "the same marked clone signed after the period", but what is checked is the block the clone names. It now says "naming a block after the period's end", and the same for before.
- **Left: F439** (below).
- **Left as readings.**
  - How a clone names a block is the cMIP's matter; no terms field carries it.
  - Rule 45's "a complete clone closes the parent" sits beside a marked clone that does not count. This was already true of S7r-2's sentence; the code reads "does not count" as "does not exist".
  - The unknown-without-a-block sentence sits in client conformance, as the lead decided, though it states what a verifier answers.

## F439: what writing the mark exposed (for the lead)

1. **"An anchor shows it made after a point" reads against rule 33.**
   - Both builders, independently, read the half of F438.3 about anchors as contradicting rule 33: "an anchor shows only that something existed by a point, never that it did not exist before".
   - One reading makes it hold: the terminating act's history holds the anchor itself, and the anchor names its block, so what cites it was made after that block. That is "naming a block" by another route.
   - I wrote the line as decided and invented no mechanism. The lead may want to say which reading it means, or strike the anchor half.
2. **A deal's clone that drops a party without the mark.**
   - By the definition, a place ends only by a terminating act, the party's own act, or an abandonment outcome.
   - So a party every party agrees to drop from field 0 by an unmarked clone keeps a place "active" while no longer listed.
   - The code reports no place ended for an unmarked clone, as written. The question for Nobody, allegedly, is whether dropping a party from a deal needs the mark, or the place stays active.

## The eight texts' hashes

These are computed as in `docs/s7l-report.md`: `tagged_hash("MOR/spec", {0: kind, 9: text})`, with one final line break removed. The same code reproduces S7r-2's values for the five texts that did not change. They replace S7r-2's.

| Text | Spec hash |
| --- | --- |
| Identity draft 16 | `43cc2a7fe8e8a31dc566d0942e9d2c8b95902953e51ea2074372c51bbc2f0616` |
| Text draft 11 | `7835d789f6e9cbb3a089620deea1ca73c591617a10a414bc47bb58ed9063b478` |
| Envelopes draft 12 | `c56f0b4ebf63ad774aaaec268c65c93cd4eff9f63bd94754f64062bf8f45bfdc` |
| Money draft 14 | `ba4b3d32832f73a541bccd8a2fe387d95837ecbf2079155f70b715123faa6a2c` |
| Agreements draft 24 | `a6f4c9dc0a3ae910ad702c0167b3352ba0660ea56112454da108763d13b77d4d` |
| Development draft 12 | `cc174b8fbcaa3b65f6ba19fa23f72fd3952e9706d452b8fb04ac6120bec4d2b7` |
| MICS v37 | `361f16a6d1363d189a0956d66f45ec39edaa3b1e0e6e41d4f29ad6808af828f3` |
| Freeze test suite v37 | `666a6241773017a5eddd16b01e7d497ab4d5cc1127843318e4a0232570d60358` |

## For the Dubsar Suite

**Pins.**
- Ummia's `MICS_HASH` and `SUITE_HASH` are the values above.
- The reader's draft lines are unchanged: Identity 16, Envelopes 12, Money 14, Agreements 24, Development 12; Text 11.

**What changes for clients.**
- **A deal's terminating clone carries the mark** (terms field 37: `[0]` the deal, or `[1, parties]` their places, each no longer listed).
  - A client drafting a deal's ending writes the mark.
  - A client never shows a clone without it as a termination, whatever its words say.
  - A client asks a deal's termination terms only about a marked clone.
- **The minimum-term line.** A client shows a minimum term or a notice as unknown unless the terminating act names a block or an anchor shows it made after a point.
- **Releases.** `core/` changed again, so the six web releases need rebuilding. The `wasm` binding still takes no termination answers, so a marked clone of a deal naming termination terms reads as unknown there.

## Checks

- `cargo test --workspace --locked`: 800 passed, 0 failed (on `2407f66`'s code; the later commits change texts only).
- Vectors regenerated: 12 new, 0 moved.
- `python3 core/vectors/check.py`: "all 291 vectors agree (113 verdict vectors judged here)".
- `scripts/c-box/make-c-box.sh` into a scratch folder, on `5c666dd`, refused nothing: 8 texts, 1 cMIP, 12 vector files.

## CI (read myself on the head)

Read on `5c666dd`, the last commit that changes texts, code or vectors. The commit after it adds this report only.

- **tests, run 1456 (`regtest` job):** passed.
- **tests, run 1456 (`all` job):** every step passed save `clients/ummia` and `clients/reader`. Among the passing steps:
  - the Rust workspace;
  - the vectors regenerated byte for byte;
  - the independent Python check;
  - the WebAssembly build;
  - every other client and Module;
  - the reproducible build.
- **The two failures are the pins awaiting the Dubsar Suite lead, as on S7r-2's head.**
  - `clients/ummia` still pins S7r's `MICS_HASH` and `SUITE_HASH` (`clients/ummia/src/cards.ts`).
  - `clients/reader` still names Agreements draft 23 (`clients/reader/src/mirs.ts`), and its test asks for the newest draft under `spec/`.
  - I read the failing steps from the job's step results and the cause from the pinned sources. The job log itself could not be downloaded from this session.
- **nakisib, run 168:** passed.
