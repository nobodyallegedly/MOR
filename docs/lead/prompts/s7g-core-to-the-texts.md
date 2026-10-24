The core brought to the texts, in the MOR repository (`nobodyallegedly/MOR`): S7f's suspected differences confirmed by running the core, each confirmed one where the text is clear fixed in the core with a vector, the three texts S7f did not reach read for untested sentences, and the web releases. A larger session: work in the order below, and if you must stop, stop at a clean point and say what remains.

**Why.** The freeze fixes the texts. Where a text is clear and the core does something else, the core is wrong, and the core is what every app and the step 17 rehearsal run on. S7f found 460 sentences no vector exercised; 58 are places the core may differ from the text, three confirmed by running it. This session turns "may" into "does" or "does not", and fixes what is the core's to fix, before the third box is sealed for the C verifier.

**Read first, yourself:** `CLAUDE.md`; `docs/lead/workbook.md` ("Before merging a session's work", "After the box"); `docs/s7f-report.md` (its questions) and `docs/untested-sentences.md` in full; Fable's `docs/reviews/fable-second-review.md`, its last two paragraphs.

**1. The three S7f confirmed: the core follows the text** (S7f's questions 4 to 6; the text is clear, so this is the core's error, not a decision):
- A rotation built on a pending rotation, and every act bound to it: pending, never invalid, as Identity says (`chain.rs`, `status_cx`).
- A payment for a publication carrying a work "some agreement claims": only an agreement that exists (Agreements rule 1) claims; terms nobody signed claim nothing (`view.rs`, `claimed`). *This one is an attack today: anyone could publish unsigned terms over another's work and turn its sales into refunds owed.*
- One payment's records naming different debts, with no named batch: neither counts until the receiver resolves them, as Money rule 12 says (`view.rs`, `paid_toward_if`).
Each with a vector showing the case, and the case that stays as it was.

**2. The 52 suspected differences** (`docs/untested-sentences.md`; S7f's question 7 names the weightiest). For each, write the case as acts and run the core on it. Then one of:
- **the core follows the text:** add the vector; the suspicion was the reader's;
- **the core is wrong and the text is clear:** fix the core, add the vector;
- **the text is unclear or seems wrong:** change nothing; write it as a question, in plain words, then precisely, with options, your lean and the cost.
Money, exits and authority first: Identity's (a homeless rotation made final by an escape through other homes; a self-hosted identity's homeless rotation without its new homes' receipts; a disowned act whose only acknowledgement is unknown or pending; a signing key of the wrong length), then Agreements' and Money's as S7f orders them. Keep `docs/untested-sentences.md` current: each entry marked confirmed, refuted, fixed or question.

**3. Envelopes, Text and Development, read as S7f read the other three:** normative sentences a verdict turns on that no case exercises, listed in `docs/untested-sentences.md`, each confirmed by running the core, then a vector, a core fix where the text is clear, or a question. Envelopes first (every act passes through it).

**Vectors throughout:** every earlier case keeps its verdict, its place and its act ids, unless this session fixes the core on exactly that case: then say which, and why, in "What changed since the previous edition". Both READMEs updated; the Python check passes.

**Do not change a text** in this session, save a word where a stranger's reading of a core fix shows the text and the fix read differently, said in the report. Text questions go to Fable, not into the texts.

**The web releases:** this changes `core/` and the WebAssembly. Before the pull request is ready, merge main (the suite's apps may have merged by then), rebuild every web release that carries the core (the display client, Dub, Kišib, Damgar, Ummia, Edubba) as their READMEs say, and be green on GitHub, the reproducible display client included. When you start that final merge of main, say so in your report's first line and stop to let the MOR lead write "preparing to merge" on the shared page.

**A stranger's reading:** a subagent limited to the eight texts reads each core fix's case and says whether the text gives the verdict the fix gives.

**Questions** go to Fable before they are decided: write each in plain words, then precisely, with options, your lean and the cost; go on with the rest.

**Finding number.** If this session records a finding of its own, it is **F396**; do not take another.

**The apps share this core:** under "For the Dubsar Suite", list every binding function whose answer moves, with whether its result or error shape changes and which inputs matter.

**Report:** `docs/s7g-report.md`, short: the three fixes; the 52 sorted (how many confirmed, refuted, fixed, questions); the three texts read (sentences found, exercised, questions); the questions; the stranger's reading; the releases rebuilt; `scripts/c-box/make-c-box.sh` run into a scratch folder refusing nothing; CI checked yourself.

**Do not:** change a rule; write any finding number, review label or history into the eight texts; change `cmips/`, `modules/` or `clients/` beyond the releases' rebuilt `built/`.

**Rules that never bend:** never write the author's personal name or nicknames in anything that enters the repository; write "Nobody, allegedly". No server addresses, onion addresses or keys. Test identities only; regtest or signet only. Work on a branch `claude/s7g-core-to-the-texts` from main; open a pull request; do not merge.
