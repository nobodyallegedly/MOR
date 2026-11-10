The inventory of Agreements draft 24, before it is written again from scratch, in the MOR repository (`nobodyallegedly/MOR`), from main. Documents only: no text, code or vector changes. Commit at each clean point.

**Read first, yourself:** `CLAUDE.md`; `docs/lead/workbook.md`; on `claude/lead-records-2`, **F441** in `docs/findings/MOR-findings-log-round-2.md` (the rewrite and its gate decisions); `docs/reviews/fable-agreements-rewrite.md` (pull request 136), section 2, which names this inventory "the most valuable ingredient"; `docs/must-audit-2026-10.md` as the model, knowing it maps October's drafts.

**Why:** Agreements is to be written again from scratch, with a promise: no guarantee changes, and every verdict stays in the core or moves unchanged into a founding cMIP. The inventory is the checklist the new text is diffed against: nothing in it may be lost.

**The work:** every **verdict-bearing sentence** of `spec/MIR-agreements-draft-24.md`, in normal text (italics are commentary), the unit being the rule sentence, not the keyword (draft 24 uses MUST 29 times in 81,516 words). For each, one row:
1. an id (A-001 onwards), the rule number and section, and the sentence **quoted exactly**;
2. **what it decides**, in one plain line;
3. **its kind:** guarantee (no module may break it); grammar (a format or a meaning every act is written in); stated cost (the edge of a guarantee); client conformance (no verifier checks it); not a rule (advice, history, reasoning, a scenario, a parameter's discussion: F441.2 says these leave);
4. **its candidate home after the move:** core; a task (name it if one exists, else "new task"); a founding cMIP (which); the companion;
5. **what exercises it:** the cases of `core/vectors/verdicts.json` and the tests under `core/tests/` and `cmips/*/tests/` that would fail if it were lost, by name; "none" where none does;
6. **the attack it closes,** where the findings log records one: the F number and one line, without the narrative.

**Then, from the rows:** sentences saying the same thing in more than one place (grouped); sentences that read two ways (the stranger's section 2 in `docs/reviews/fable-fresh-eyes.md`, pull request 134, names six); vectors and tests that exercise no sentence (a law the text never stated); and counts by kind and by home.

**Where:** `docs/agreements-inventory/` (a README with the counts and the method, and the rows split by part of draft 24 so no file is too long to read). If you stop before the end, stop at a part boundary and say in the README's first line which parts are done.

**Not yours here:** deciding anything; the rewrite itself; the task list (Fable's); `clients/`, `cmips/`, `modules/`.

**Finding number.** If this session records a finding of its own, it is **F442**; do not take another.

**Rules that never bend:** never write the author's personal name or nicknames in anything that enters the repository; write "Nobody, allegedly". No server addresses, onion addresses or keys. Work on a branch `claude/s8a-inventory` from main; open a pull request; do not merge.
