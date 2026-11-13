Build a verifier in C for one layer of a protocol, from its texts alone, in this repository (`nobodyallegedly/MOR-CBOX`), on the branch **`agreements-box-1`** and nowhere else.

**What you have, and all you have.** The branch `agreements-box-1` holds a fixed snapshot: `spec/agreements-draft-17.md` (the Agreements layer of MOR: two acts, the grammar rules G1 to G14 a verifier applies, and the tasks it hands to plug-in specifications called cMIPs), `spec/report-block-2.md` (a block the layer relies on), a `README.md`, a `SNAPSHOT.md`, and `MANIFEST.sha256` fingerprinting every file. That is the whole of your material. There are no test vectors, no other implementation for you to read, no record of why the rules are as they are, and nobody to answer your questions.

**The insulation is the point.** The question this work answers is whether this text alone is enough for a careful stranger to build a correct verifier, and where it is not. So:
- Do not look for MOR anywhere else: not on the web, not on GitHub, not in any other repository, not in any registry. **Do not open, check out, diff or read any other branch of this repository**, including `main`: they hold an older core that this text replaced, and reading it spoils the test. Attach no other repository. If you come across another implementation or text of MOR by accident, stop reading it and say so in your report.
- Never edit `spec/`, `README.md`, `SNAPSHOT.md` or `MANIFEST.sha256`. Check `sha256sum -c MANIFEST.sha256` at the start and at the end, and report the result.
- The layers this text leans on are not here (its section 8.1 lists them). Where you need one (an act format, a fingerprint, a signature, a place, a clock, an amount), choose the simplest stand-in that lets you go on, write down what you chose and why, and keep it behind one small interface so it can be replaced.
- Every task (K1 to K13) is a plug-in. Build a stub for each that you need, so that the grammar can be run with a stub's answer, including **unchecked** where no plug-in is present.
- When the text is unclear, silent, or seems to contradict itself or the report block, do not wait: choose the reading the text most supports, write it down, and go on.

**What to build.** A library and a command-line tool in C that take a set of acts (Terms and Statements, in your stand-in format) and give the answers the text gives (valid and not valid, invalid, not shown, unchecked, fork, and every other answer it names, each with its qualifiers), grammar rule by grammar rule, as far as you can take it. With no vectors, write your own test cases from the text: at least one for every sentence with MUST or MUST NOT, each citing the sentence it tests.

**Freedom.** No check-ins, your own structure, order and tools. Stop when every grammar rule is built or you can go no further, and say which.

**The floor, not negotiable:** C11 or C17, warnings as errors (at least `-Wall -Wextra -Werror`); tests under AddressSanitizer and UndefinedBehaviorSanitizer, clean; every decoder of untrusted bytes fuzzed (libFuzzer or AFL++), the corpus and any crash kept; one plain memory discipline, stated at the top of your report and kept throughout; established libraries only for cryptographic primitives, pinned, with your reason.

**What to hand back**, on a branch `claude/agreements-c-1` made from `agreements-box-1` (a pull request, no merge):
- `REPORT.md`: in plain words first, what you built, what you could not and why, your stand-ins, the memory discipline, the sanitizer and fuzzing results, the manifest check at start and end.
- `QUESTIONS.md`: every place you had to choose a reading, each with the sentence quoted, the readings you saw, the one you chose and why, and whether it changes an answer a verifier gives. Put first the questions that change an answer.
- `STANDINS.md`: each stand-in, and which sentence of section 8.1 it stands in for.
- The code and your tests.

Never write anyone's personal name; the author is "Nobody, allegedly". No server addresses or keys.
