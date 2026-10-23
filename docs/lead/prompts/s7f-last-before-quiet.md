The last core session before the quiet window, in the MOR repository (`nobodyallegedly/MOR`): four decisions written in, a pass over the texts for sentences no vector exercises, and the web releases. A larger session: work in the order below, and if you must stop, stop at a clean point and say what remains.

**Read first, yourself:** `CLAUDE.md`; `docs/lead/workbook.md` ("Before merging a session's work", "After the box"); F389, F391 and F392 at the top of `docs/findings/MOR-findings-log-round-2.md` (on the branch `claude/lead-records` until the next records push: `git show origin/claude/lead-records:docs/findings/MOR-findings-log-round-2.md`), and F145 for the payee's own act; `docs/s7e-report.md` (its question 2); `docs/splits-report.md`, section 4, on the branch `claude/splits-separate-people` (pull request 104); Fable's `docs/reviews/fable-second-review.md`, "Does the first verdict hold" (its last two paragraphs are the reason for part 5).

**1. A judge's settlement saw its request's history** (S7e's question 2; the core follows the text). Agreements, "What a settlement could see", lists for every settlement "what it cites, each with its own history", and a judge's settlement cites the request. The core's `deal_walk` reads only the kept and dropped versions' histories. Make the core read the text: a judge's settlement must name every tip its request's history holds, or it counts nothing. Vector: a judge keeps A and drops B while the request's history holds a third version C: the settlement counts nothing; the same naming C: in force. No text change unless the stranger finds the sentence unclear.

**2. A purchase from several sellers** (F391). One sentence after "A contest of a purchase" in Agreements: *Client conformance: where the payee of a purchase is a collective, or an agreement with several parties, the buyer's client makes its claim of the purchase readable by every member of the collective's agreement in force, or by every party of the version the purchase names: sealed to each of them, or its key delivered to each (rule 57).* With its stated cost, in italics: every member or party sees who bought. No verdict moves.

**3. A deal's payments go where the payee's own grant in the deal sends them** (F392, point 1). Money rule 4's second condition gains one clause: *or, where the payment follows an agreement or offer whose terms list, in field 14 or 29, a grant of the payee's, the pointer of that grant's grantee, the agreement's designated pointer (Agreements rules 15 and 17)*, judged by Agreements as rule 7 judges a collective's pointer; a Money-only client shows it unknown. Check Agreements rules 15 to 17 and the pointer check (rule 16) read the same once it is in; say so in one line if they need none. The core's Money check follows. Vectors: a buyer's payment to a deal's split service's pointer, the payee's grant listed in field 14: counts; the same with no grant of the payee's listed: counts for nothing; a backup's pointer (field 29) paid after the first attempt failed: counts. The payment cMIP's step 3 is the suite's (its draft 5); do not change `cmips/`.

**4. A collective's sale is a purchase** (F392, point 2). The core's `purchase_unjudged` counts the collective's own stake (object null) as a stake in every work the collective sells under its agreement, as the glossary's "Stake" says. Vector: a sale of a collective's work under its offer: a purchase; a buyer's contest of it: shown. If a text sentence needs a word to say it plainly, give it the word.

**Also:** `scripts/rehearsal/rehearse.ts` matches the clock identity the feed page now carries (a pattern, as it does for the two authors), not the `CLOCK-IDENTITY` placeholder.

**5. Sentences no vector exercises** (Fable's point: two implementations agreeing proves the texts can be read alike, not that they were read). Read the six MIRs, Identity and Agreements first, for normative sentences (MUST, MUST NOT, "counts only", "is invalid", "is void", "is unknown") on which a verdict turns and which no case in `core/vectors/verdicts.json` exercises. Write them down in `docs/untested-sentences.md`: the text and line, the verdict it decides, whether a case exercises it, and what the Rust core does. Then:
- where the core does what the sentence says, add a vector, the way out first (rotation, succession, escape, a collective's exit and closing, a fork's settlement, a refund owed back);
- where the core does something else, do not change it: write it as a question;
- where a sentence decides nothing a vector could show (client conformance, a stated cost), say so and leave it.
Aim for the sentences that decide money, exits and authority; say how far you got and which MIRs remain.

**Vectors throughout:** every earlier case keeps its verdict and its act ids; both READMEs updated with "What changed since the previous edition"; the Python check passes.

**The web releases:** this changes `core/` and the WebAssembly. Before the pull request is ready, merge main (the splits round, #104, should have merged by then; if not, say so and wait for the MOR lead), rebuild every web release that carries the core (the display client, Dub, Kišib, Damgar, Ummia, Edubba) as their READMEs say, and be green on GitHub, the reproducible display client included.

**A stranger's reading:** a subagent limited to the eight texts reads what you changed and says what it cannot follow.

**Questions** go to Fable before they are decided: write each in plain words, then precisely, with options, your lean and the cost; go on with the rest.

**Finding number.** If this session records a finding of its own, it is **F393**; do not take another.

**The apps share this core:** under "For the Dubsar Suite", list any change to the WebAssembly interface and every function whose answer moves (a collective's sales now purchases; payments to a deal's service counting), with whether its result or error shape changes and which inputs matter.

**Report:** `docs/s7f-report.md`, short: what changed, the untested sentences (how many found, how many now exercised, how many questions), the questions, the stranger's reading, the releases rebuilt, `scripts/c-box/make-c-box.sh` run into a scratch folder refusing nothing, CI checked yourself.

**Do not:** change a rule beyond F389, F391 and F392 and S7e's question 2; write any finding number, review label or history into the eight texts; change `cmips/`, `modules/` or `clients/` beyond the rehearsal script and the releases' rebuilt `built/`.

**Rules that never bend:** never write the author's personal name or nicknames in anything that enters the repository; write "Nobody, allegedly". No server addresses, onion addresses or keys. Test identities only; regtest or signet only. Work on a branch `claude/s7f-last-before-quiet` from main; open a pull request; do not merge.
