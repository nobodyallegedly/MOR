Say each rule once, in the MOR repository (`nobodyallegedly/MOR`), from main: the say-it-once pass over Agreements (draft 20 to draft 21) and the default control cMIP, the MICS and the freeze test suite following where they point. **Words may move, merge or go; meaning never changes.** Commit at each clean point; if you must stop, stop at one and say what remains.

**Read first, yourself:** `CLAUDE.md`; `docs/lead/workbook.md`; `docs/reviews/fable-who-decides.md` (section 3, the size) and `docs/reviews/fable-s7m-constitution.md` (section 4, what the pass should cut first); in `docs/findings/MOR-findings-log-round-2.md`, F420, F424 and F426 to F429; Agreements draft 20 whole.

**Why, in Nobody, allegedly's words:** "We probably gave the core too much to do." "It means that our original core was already quite lean but that some fat can be trimmed." The trim moved the models out; the fat left is prose said more than once. Draft 20 is about 82,000 words; Fable's estimate for the same rules said once is about 55,000 with notes, 40,000 without. That is a guide, not a target: stop where cutting would change a meaning.

**Order of cutting** (Fable's): 1, the glossary ("Words used"): one definition per word, the rest pointers; 2, "How it runs" and "In short" paragraphs that restate a rule's text; 3, the formats' commentary (Part four) re-explaining rules already given; 4, stated costs and reasons said in more than one place (keep each once, where its rule is); 5, cross-references that copy a rule instead of naming it. Keep every MUST, SHOULD and MAY, every stated cost (once), every client-conformance line, and every italic reason a rule needs to be understood on its own.

**What you may not do:** change a rule's meaning, scope, number or order; add or drop a rule; rename a term; touch the formats' CDDL or field numbers; change any other MIR (Identity, Text, Envelopes, Money, Development) beyond a pointer that names a moved sentence. Where two passages say slightly different things, that is not repetition but a contradiction: **do not choose**; list it as a question.

**The check that nothing moved:**
- the vectors byte for byte, and the whole workspace passing (no code should change; if any does, say why);
- **a meaning diff:** a subagent given draft 20 and draft 21 side by side reads them rule by rule and lists every place where a reader could reach a different verdict, a different MUST, or lose a stated cost. Each item is restored or becomes a question;
- **a stranger's reading:** a subagent limited to the eight texts and the default cMIP reads draft 21 whole and tells back the four parts, the boundary and the way out, and says where a word now names two things or a rule cannot be understood without a passage you cut.

**Sizes:** words before and after, with and without italics, for Agreements, the default cMIP, the MICS and the suite, and for the six MIRs together.

**The suite's pins:** the MICS's and suite's hashes change; Ummia pins them (`docs/s7l-report.md` shows how they are computed). List the new hashes under "For the Dubsar Suite"; do not change `clients/`.

**To the merge:** no code, so no release rebuild unless something under `core/` or `wasm/` changed (it should not). Read CI on your head; write in your report's first line that you are ready and stop, so the MOR lead writes "preparing to merge". Mark the pull request ready.

**Questions:** plain words, then precisely, with options, your lean and the cost; go on with the rest.

**Finding number.** If this session records a finding of its own, it is **F431**; do not take another.

**Report:** `docs/s7o-report.md`, short: the sizes; what was cut, by kind (glossary, how it runs, formats' commentary, stated costs, copies); the meaning diff and what it restored; the stranger's reading; contradictions found (as questions); the new hashes; `scripts/c-box/make-c-box.sh` into a scratch folder refusing nothing; CI checked yourself.

**Rules that never bend:** never write the author's personal name or nicknames in anything that enters the repository; write "Nobody, allegedly". No server addresses, onion addresses or keys. Work on a branch `claude/s7o-say-it-once` from main; open a pull request; do not merge.
