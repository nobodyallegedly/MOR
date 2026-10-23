Fable's second review: the 24 questions still open before the step 17 rehearsal and the freeze, from the attached bundle (its `README.md` says what is in it).

**Where things stand.** After your first review, your recommendations were taken (F380, F381; `questions/decisions-F380-F386.md`), with S7b's and S7c's follow-ups. Both your conditions for freezing (Q46, the MIR hash; Q27) are met. A second box was sealed and the C verifier, still insulated, carried to it: all 334 vector checks agree, and it built the heavy rules it had left unbuilt (a collective's fork and closing, an agreement as a party, judgment, records, "belongs to" at any depth). Since then one protection was added: a buyer may contest a purchase (F386, S7d). Main is green with all of it.

**Your task: judge these 24, and say what closes each.**
- **The C verifier's new questions, 50 to 65** (`c-verifier/QUESTIONS.md`, "Second edition: new questions"). Same classes as your first review: text unclear, text wrong, Rust wrong, C wrong, vector wrong, housekeeping. For each settled by no vector, say whether the C reading and the Rust core would give the **same verdict** on the cases it concerns; where they would differ, describe the acts that show it, as a vector to add. Note where S7d's text changes (`questions/texts-since-second-box.diff`) bear on one.
- **S7c's five questions** (`questions/s7c-report.md`, "Questions"). The texts and core already carry the session's lean on each.
- **S7d's three questions, and its two older points "for the lead"** (`questions/s7d-report.md`). The lean is built on each.

For the questions where a lean is already built, the judgment is simple: keep the lean, or say what should change and why. For each, also say whether the answer can wait for MOR 2 without harm to anyone relying on the frozen core (an exit, a payment, an agreement); anything that cannot wait says so plainly.

**Then, in a few paragraphs:** does your first verdict ("freezable, with two conditions") still hold, now that the conditions are met and the heavy rules are built twice? Is there anything in these 24, taken together, that points at a weakness rather than a gap? Be measured: say what you checked (code read, tests run) and what you only reason.

**Order and budget.** Work in order of what could change a verdict: Identity and Agreements first, housekeeping last. If you must stop, stop at a clean point and say which remain.

**Do not:** change the texts, the code or the vectors; decide anything (every judgment is a recommendation for the MOR lead and Nobody, allegedly); write any finding number into the texts.

**Write** one file, `fable-second-review.md`, as a file Nobody, allegedly, can download (or, if you work in the repository, `docs/reviews/`, branch `claude/fable-second-review`, a pull request, no merge): plain words first (the verdict, the questions that matter most, any divergence found), then one entry per question (its source and number, its class or your judgment of the lean, the evidence with text and line or function, the closing sentence or change, the vector to add if any, and whether it can wait), then the paragraphs on freezability. Never write the author's personal name; write "Nobody, allegedly". No server addresses or keys.
