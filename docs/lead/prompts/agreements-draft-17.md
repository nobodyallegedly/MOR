**Current wish** (Nobody, allegedly, `docs/decisions.md` on branch `claude/lead-records-2`): "I've decided for a total rewrite of agreements from scratch." "No translation, fresh from the research we had all agreed was excellent direction." On what must hold: "can I with a single click reward all the people that contributed to the service or good via MOR". And: "Building blocks over solutions."

Agreements from scratch, draft 17, in the MOR repository (`nobodyallegedly/MOR`). Start a branch `claude/agreements-draft-17` from `claude/agreements-draft-16` (pull request 170). Read **only**: `docs/agreements-from-scratch/draft-16.md`, `reasons-16.md`, `history.md` and `companion-3.md` (on that branch); `docs/decisions.md` (branch `claude/lead-records-2`).

**What to bring in:** in `docs/decisions.md`, the exchange **"The update condition"**, read as a whole, with all its lines ("My words matter less than our words within that conversation do"). Its arrived-at lines are the MOR lead's reading; the last one replaces the first where they differ, and the MOR lead's withdrawn readings are not to be used. Where a line says more than the exchange supports, follow the exchange and list the difference.

**Please write draft 17:** draft 16 with one change, nothing else.

**The update condition.** His words: "Condition is short for update condition"; "it is wether it is valid or not valid"; "Yes, and the cMIPs replies"; "the cMIP can run the verification via bytes, so it should be able to run"; "It answers wether it can be updated or not. Because agreements make these conditions potentially complex the core still needs a simple field the cMIP can then specify in details."
- One simple field in Terms names the update condition's cMIP, with its parameters. The cMIP answers whether the agreement can be updated or not: given the version in force and a proposed update, valid or not valid. It runs from the bytes; nothing waits for anyone to publish.
- The rule of a power for replacement (G5.2, "allowed or not") and the condition (G10.7) are this one block. Make them one, in one place, and say what is left of each. Who may sign an update (powers, G5) is not changed; only the answer about the update itself becomes the update condition's.
- The answers **triggered** and **no longer applies** are dropped. Rights stop applying, or an offer changes, only through an update the condition answers valid. Rework G10.5, G10.6 and G10.7, and every place that reads them, only as far as this needs.
- Whether a spot still takes new identities (G10.5, K12) is not covered by the exchange: leave it as draft 16 has it, less the reference to triggering, and list it as open.
- Keep the task numbers as they are, unless the merge leaves a task with nothing to do; then say so.

Housekeeping, as before: the rules in `draft-17.md`, the plain words and reasoning in `reasons-17.md` (from `reasons-16.md`, changed only where this touches it), one part in `history.md`.

Where the exchange does not cover something the change touches, leave it as draft 16 has it, and list it in the open section. Plain words first, then precisely. Decide nothing beyond the exchange. Write `draft-17.md` and `reasons-17.md`, add to `history.md`, and change `companion-3.md` only where this touches it (a pull request, no merge). Never write the author's personal name; write "Nobody, allegedly". No server addresses or keys.
