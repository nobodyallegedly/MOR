Fable's third review: the questions still open on the texts before the freeze, from the attached bundle (its `README.md` says what is in it).

**Where things stand.** After your second review (decided as F389), the sessions took your pattern seriously: two implementations agreeing proves the texts can be read alike, not that they were read. S7f and S7g read all six MIRs for every sentence a verdict turns on and wrote a case for each one no vector exercised: about 600 sentences, 327 verdict cases now (153 before S7g, 124 before S7f). Where the text was clear and the Rust core did something else, the core was fixed: about thirty places, among them an attack (unsigned terms over another's work turning its sales into refunds owed). No text was changed for those. What remains is where the text itself is unclear, points two ways, or may be wrong. Those are the questions here.

**Your task: judge each question, and say what closes it.**
- **S7g's questions** (`questions/s7g-report.md`, "Questions"), all of them.
- **S7f's questions 1, 2, 3 and 8** (`questions/s7f-report.md`): rule 17's guarantee beside Money rule 4's new clause; which version of the terms lists the grant; a backup's pointer without a failed attempt; F391's sentence beside rule 16's set-aside, and a party that is an agreement.
- **S7e's four questions** (`questions/s7e-report.md`): "pending" and "unknown" side by side; what a judge's settlement saw (since built: S7f); naming chain signatures; how unknown spreads.
- **One from the MOR lead:** routes (Money rules 24 to 28) are written but not built in the core (S7g's Q-M3): no code reads a receipt's previous hop or checks a route. Should the texts say so (a route is a rare case whose verification the core library does not yet build), or is the text enough as it is, with the code to follow after the freeze?

For each: the class (text unclear, text wrong, Rust wrong, housekeeping, or, where a lean is built or proposed, keep it or say what should change and why); the evidence, with text and line or function; **the sentence that closes it, in the texts' voice, and where it goes**; and **whether it must be closed before the freeze or can wait for MOR 2 without harm to anyone relying on the frozen core** (an exit, a payment, an agreement, authority). Anything that cannot wait says so plainly.

**Then, in a few paragraphs:** does your verdict still hold, now that the core has been read against every sentence? Do the questions, taken together, point at a weakness in one MIR, or in how two MIRs meet, rather than at gaps? Which, if any, would you not freeze without? Be measured: say what you checked (code read, tests run) and what you only reason.

**Order and budget.** Identity and Agreements first (the way out, authority), then Money, then Envelopes, Text and Development, housekeeping last. If you must stop, stop at a clean point and say which remain.

**Do not:** change the texts, the code or the vectors; decide anything (every judgment is a recommendation for the MOR lead and Nobody, allegedly); write any finding number into the texts.

**Write** one file, `fable-third-review.md`, as a file Nobody, allegedly, can download (or, if you work in the repository, `docs/reviews/`, branch `claude/fable-third-review`, a pull request, no merge): plain words first (the verdict, the questions that must close before the freeze, the sentences that close them), then one entry per question in the sessions' own numbering, then the paragraphs. Never write the author's personal name; write "Nobody, allegedly". No server addresses or keys.
