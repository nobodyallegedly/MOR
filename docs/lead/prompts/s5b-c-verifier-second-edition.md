Carry the C verifier to the box's second edition, in this repository (`nobodyallegedly/MOR-CBOX`), from the texts alone.

**Where things stand.** A first session built a verifier for MOR in C on the branch `claude/c-verifier` (pull request 1), from the box's first edition: every one of its 285 vector checks agreed, and it recorded 49 questions in `QUESTIONS.md`. Since then the box's `main` holds a **second edition** (`SNAPSHOT.md` says from which source commit): the eight texts changed in a number of places, and the vectors grew (108 verdict cases, among them a collective's closing and fork, an agreement as a party of another, a chain of judgment, a succession; `vectors/README.md` ends with "What changed since the previous edition"). The first edition is in `main`'s history; `git diff` between the two editions shows every change to the texts.

**What you have, and all you have:** the same as before. This repository, its texts and its vectors, and your own code and notes on `claude/c-verifier`. The insulation is the point, as before: do not look for MOR anywhere else (not the web, not GitHub, not any other repository, not any registry); attach no other repository; if you meet another implementation by accident, stop reading it and say so. Never edit `spec/`, `vectors/` or `MANIFEST.sha256`; check `sha256sum -c MANIFEST.sha256` at the start and at the end. Nobody answers questions: choose the reading the texts most support, write it down, go on.

**Start** from your own `PROGRESS.md`, `QUESTIONS.md` and `REPORT.md` on `claude/c-verifier`. Make a branch `claude/c-verifier-2` from it and merge `main` (the second edition) into it. Read the diff of the texts between the editions, section by section, before changing code.

**What to do.**
- Bring the verifier to the second edition: where a text changed, change your code to it; where a reading you chose in `QUESTIONS.md` is now settled by the text, say so beside the question (settled, and whether the text agrees with the reading you had chosen).
- Build what the new vectors reach that you had left unbuilt (your report's "What is not implemented"): a collective's closing and fork, an agreement as a party, a chain of judgment, succession confirmed, records putting operational clones in force, the version in force for keepers, "belongs to" at any depth, unknown "same payment" as Money rule 12 now says.
- Run every vector and record each answer.

**The floor, as before, not negotiable:** C11 or C17, warnings as errors; tests and the vector run clean under AddressSanitizer and UndefinedBehaviorSanitizer; every decoder of untrusted bytes fuzzed, new code included, the corpus and any crash kept; one plain memory discipline, the same as before; established libraries only for cryptographic primitives and Unicode tables, pinned.

**Write down, as you go:**
- `QUESTIONS.md`: the old questions marked where the second edition settles them; new questions numbered from 50, each with its source, the question in plain words, the readings considered, the one chosen and why, and which vectors it decided.
- `RESULTS.md`: every vector of the second edition, your answer, whether it matches; for a mismatch, what you think caused it, without changing the vector.
- `PROGRESS.md` kept current; `REPORT.md` at the end: plain words first (how many of the second edition's checks agree; what the text changes made easier or harder; the heavy rules built and what they asked of you; what is still not built and why), then the libraries, the sanitizer and fuzzing runs, the memory discipline, the manifest check.

**Freedom, as before:** no check-ins; stop only when every vector is answered by your verifier, or when you can go no further, and say which. Commit as you go on `claude/c-verifier-2`; open a pull request when you stop; do not merge. No keys or secrets beyond the labelled test data in `vectors/`.
