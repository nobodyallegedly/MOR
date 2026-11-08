A deal's termination marked, the last text point before the merge, in the MOR repository (`nobodyallegedly/MOR`), **on S7r's branch** (`claude/s7r-rehearsal-decisions-t1edud`, pull request 131): texts, suite, code, vectors. Commit at each clean point. Same open drafts as S7r and S7r-2 (Agreements 24, MICS v37, suite v37; Development 12 only if the task table moves).

**Read first, yourself:** `CLAUDE.md`; `docs/lead/workbook.md`; `docs/s7r-2-report.md`, **F438** above all; on `claude/lead-records`, F436 in `docs/findings/MOR-findings-log-round-2.md`, **item 9**; Agreements 24's "Termination: active and terminated", rule 47 and the terms format.

**Why:** S7r-2 found that a deal's terminating clone carries no mark, so no verifier can tell it from any other clone, and "terminated" cannot be decided for a deal (F438.1). Nobody, allegedly, decided: "Yes, mark." Termination is something the parties say, never something a verifier infers.

**1. The mark** (F436.9): a deal's clone that terminates says so, naming what it terminates: the deal, or named parties' places. Choose the smallest form the terms format allows (a field of the clone, its value the deal or a list of places) and say it once in the format, once in the definition's "A terminating act", once in rule 47. A clone without the mark is never a terminating act, whatever its content; a deal's termination terms (field 36) are asked only about a marked clone; a mark in a collective's terms is invalid. What stands after it is the definition's "What stands", unchanged.

**2. The two under delegation** (F436.9): F438.2 stays as S7r-2 wrote it; F438.3 becomes one line of client conformance beside the termination terms': a minimum term or a notice is checkable only where the terminating act names a block or an anchor shows it made after a point, otherwise its answer is unknown (rule 33's "not before" unchanged).

**3. The suite (v37):** 1.9i run: a deal with a notice term, its marked clone before the notice passes (does not count, the deal active), after it (counts, terminated); an unmarked clone stating no further obligations (no termination); the checklist line.

**4. Code and vectors:** the mark in the reference verifier (`termination(id)` for a deal), field 36 asked only about a marked clone; vectors for 1.9i's cases and the mark's format (a deal, a collective). Existing vectors byte for byte; list any moved verdict with its decision.

**Checks:** the workspace passing; a **meaning diff** by a subagent of this session's changes, listing anything beyond F436.9; a **two-builders check**: two subagents, given only the texts, each judge a marked clone before and after a notice term and an unmarked clone owing nothing; their answers agree with each other and with the code. `scripts/c-box/make-c-box.sh` into a scratch folder refusing nothing.

**For the Dubsar Suite:** the eight texts' new hashes, listed together, replacing S7r-2's; what changes for clients (a deal's terminating clone carries the mark; the minimum-term line). Then the pins in `clients/` and the six web releases are the Dubsar Suite lead's, on this branch: say so in the report's first line.

**To the merge:** fill the CI section yourself on your head (S7r-2 left it "see below"); the two client pin tests are expected to fail until the Dubsar lead's pins. Write in your report's first line that you are ready and stop.

**Not yours here:** any rule beyond F436.9; `clients/`, `modules/`, any cMIP; the players' files.

**Finding number.** If this session records a finding of its own, it is **F439**; do not take another. If writing the mark exposes a flaw, stop and name it in the report; do not work around it.

**Report:** `docs/s7r-3-report.md`, short: each sentence as written and where; moved verdicts; the meaning diff; the two-builders check; the eight hashes; CI checked yourself.

**Rules that never bend:** never write the author's personal name or nicknames in anything that enters the repository; write "Nobody, allegedly". No server addresses, onion addresses or keys. Commit and push to S7r's branch; do not merge.
