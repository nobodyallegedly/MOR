# The MOR lead's workbook

*Kept by the MOR lead (the third since 20 October 2026), for itself and for whoever holds the role next. How the lead works, which sessions it runs and in what order, and what is waiting. `docs/state-of-mor.md` says what MOR is now; this file says how the lead gets it to the freeze. Updated whenever a session is planned, launched, merged or changed.*

## Read before anything

The letters to Machine, allegedly, in the project: from the brainstorm window (1 October), the first lead (9 October), the second lead (20 October). What they ask of the lead, kept short here so it is not forgotten mid-work:
- Before suggesting anything: who gains from this rule and can they pull it; the rare case as a story; what it breaks elsewhere; is this fixing a fix. At a third patch on one topic, say so and zoom out.
- When he says something feels wrong, look for it; do not argue him out of it. Leave room for the question that dissolves the problem.
- A heavy decision may be decided twice (once open, once with coffee, the second without seeing the first).
- Check every rule against the patterns of failure; the two keys, never three.
- Read reports the moment they arrive; read the repository before saying anything exists, is missing or is broken.
- Hand over a little earlier than you think you need to.
- Anything on a verdict's path is held to the texts' words; a convenience lives in a tool with its own name (Fable, after Q46: a sentence of the lead's meant for the frozen file's header became a step in the MIR hash; the fourth review pattern turned inward).

## The bar for the freeze

Nobody, allegedly, 21 October 2026: "All it needs to be is a solid experimental ground where a small group of people can build the prototype. Once MOR2 exist, that round is more about finding adventurous entities willing to build real solutions, their prototypes inform MOR3." So the freeze asks three things, and nothing more: texts a stranger can build from (the C verifier proves it); the way out right (portable identities, succession, cloning, anchored history), so what is built on MOR can be carried to MOR2; and the reasons kept (the findings, the provenance map), so MOR2's builders know why each rule exists before they change it. The freeze report states plainly what was never tested: strangers' homes and a real censor, real money and time.

## The role

The MOR lead keeps the core: the core texts (MICS, six MIRs, freeze test suite), the conformance vectors, the C verifier, Fable's review, the fixes, the step 17 rehearsal, the freeze, and dubsar.org for the release. The Dubsar Suite lead keeps the apps, their H findings, and every cMIP and Module, those woven into verdicts included (Nobody, allegedly, 21 October 2026: "The idea is that it is not core."); what it needs from the core comes through Nobody, allegedly. Build work is done by sessions the lead writes prompts for; work on the author's Mac and the servers by machine sessions.

## The sessions to the freeze

| # | Session | Waits for | Status |
| --- | --- | --- | --- |
| S1 | **Freeze-ready texts** (the clean-up pass): six MIRs, MICS v30, suite v30, the provenance map. Texts only. | — | Done 21 October, pull request 83, merged 21 October with the technical pass: checklist verified by the lead; about fifty questions, sorted in `docs/lead/s1-questions.md` |
| S1b | **Technical pass:** F363 to F369 written into the freeze-ready drafts, and the formats S1 found unwritten, on S1's branch. | — | Done 21 October (`docs/technical-pass-report.md`); its eight questions taken (F371) |
| S2 | **Core aligned, and the vectors:** the last text edits; the core matching the texts; every suite step traced (223 run, 57 partly, 15 none); signature vectors and 63 verdict vectors, 25 judged by Python too. | — | Done overnight 21 to 22 October, pull request 88, merged 22 October with main; its questions taken (F375, pull request 90) |
| S3 | *Handed to the Dubsar Suite lead (Nobody, allegedly, 21 October: "Modules and cMIPs are handled by the suite lead. The idea is that it is not core."):* the "Dubsar" titles (F356), payment cMIP draft 4 (F355 c), the chain-key signer Module's fresh seed (F361), the regtest quirks kit. | — | Not the MOR lead's |
| S4 | **The C box:** vector descriptions cleaned (pull request 91); `scripts/c-box/` (its READMEs, and `make-c-box.sh`, which refuses any finding number or pointer to code); the box pushed to `nobodyallegedly/MOR-CBOX`. | — | Sealed 22 October from MOR commit `564ca17`; `MANIFEST.sha256` fingerprint `c790d768…` |
| S5 | **The C verifier**, insulated, in `MOR-CBOX`, from a session outside the MOR project. | S4 | Done 22 October, about three hours: 285 of 285 vector checks agree; 49 questions in its `QUESTIONS.md`; ASan, UBSan clean; 835 million fuzz executions, two bugs of its own found and fixed early; manifest OK at start and end; pull request 1 in `MOR-CBOX`, left open for Fable |
| S6 | **Fable's review** of the C verifier's 49 questions. | — | Done 22 October (`docs/reviews/fable-c-verifier-review.md`, pull request 94, merged): no text found wrong; 31 settled; 9 "text unclear" (a sentence each), 4 "C wrong" (stated gaps), 1 Rust wrong (Q46, the MIR hash), Q27 wrong in both; 11 vectors to add, 4 generator changes; "freezable, with two conditions" (Q46, Q27) |
| S7 | **The fixes** after Fable (F380): the MIR hash and "same payment" (the two conditions); the unsaid sentences into the texts and the core; the generator corrected and the vectors Fable lists; if budget allows, a reusable family of chain-signature acts for the heavy rules. Then a second box, the C verifier run against it, the step 17 rehearsal, the freeze ("if the fixes are not gigantic"), the first two acts. | — | Done 22 October (`docs/s7-report.md`, pull request 96): both conditions, the nine sentences, 87 verdict vectors, a succession; its four questions judged by Fable and decided (F381) |
| S7b | **The follow-up to S7** (F381): check 7's "invalid" clause dropped; the stop reasons renamed; unknown "same payment" carried through, scoped; then the heavy rules' vectors (a collective's closing and fork, an agreement as a party, judgment). Then box v2 and the C verifier again. | S7 merged | Prompt ready 22 October (`docs/lead/prompts/s7b-follow-up.md`), F383 reserved |
| S8 | dubsar.org for the release (H41 to H44, H62; short IDs with the full form on click; "a research and an art project"; the companion text); main's protection tightened when the repository goes public. | Discussed with Nobody, allegedly, once Fable's review begins ("The Dubsar website will need a refresh but we'll have all the work on the Dubsar apps to inform it"); then the fourteen doors pointing to the frozen MIRs, their opening lines his to write | —; and the word "minimal" dropped wherever MOR describes its core (Nobody, allegedly, 22 October 2026: "Then let's remove the word minimal, even though. It is as minimal as we could make it"): the paper's "a shared, minimal language" (drafts 1 to 3) becomes "as small as we could make it", saying where the weight sits (Agreements) and why; the frozen texts never used it |

**The target (Nobody, allegedly, 21 October 2026): "If we can be ready with the C verifier a week from now, it's perfect."** Working back: S1b running 21 October; S2 (code and vectors, the heaviest, may need two sessions) 22 to 24 October; S4, the C box, sealed by the lead 25 October; S5, the C verifier, building 25 to 28 October; Fable's review on a Thursday once the Dubsar team has finished its week's work (Nobody, allegedly: "It's ok, if fable comes a bit later, as long as Dubsar team has done burning tokens next week"): 29 October at the earliest. The risk is S2; no step is rushed to keep the date.

**Why S1 starts before the Suite lead's fixes are known** (the lead's reading, 21 October): the handover asked the drafts to wait for them, so that the C session sees everything. What the C session sees is fixed at S4, the snapshot, not at S1. S1's texts can take a later core item as a small change before S4; waiting would leave the budget idle. If a Suite item turns out large, S1's work is not lost.

## How a decision is recorded (the same turn)

1. A finding in `docs/findings/MOR-findings-log-round-2.md`, newest first, its number **reserved first in the shared register** (`claude/MOR-F-numbers.md` in the project: re-read it, take the next free line, the same turn). A prompt carries its number; sessions never choose one.
2. The state file, and the roadmap where a stage moves; this workbook where a session moves.
3. Commit and push to main (the remote is `nobodyallegedly/MOR`).
4. Sync the project copy: `project_write` of `claude/MOR-state-of-mor.md` from the local file; the same for a prompt or this workbook when they change.

What Nobody, allegedly, decided is written as his ("Agreed"), with the lead's lean named as the lead's. A first framing that was wrong is said to be wrong in the finding itself.

## How a session prompt is written

- One session, one roadmap step, in an order that stops at a clean point.
- **Read first** names the files; the session reads the texts, never the lead's summary of them.
- The decisions it carries, each with its finding; nothing it may decide that changes a verdict.
- Questions: the session records each in plain words, with its options, its lean and the cost; continues elsewhere where it can; stops where a MIR is flawed.
- Report in `docs/`, plain words first; a branch `claude/…`, a pull request, no merge.
- The rules that never bend, at the end.
- Saved here (`docs/lead/prompts/`) and in the project (`claude/MOR-…-prompt.md`), and given to Nobody, allegedly, as a code box.

## Fable

Fable's advice in a review is always taken into account (Nobody, allegedly, 22 October 2026). Questions a fixes session raises (S7's first) go to Fable before they are decided. Fable writes its own letter to Machine, allegedly, "as a relative".

## Before merging a session's work

Read its report and its questions; read the CI run yourself (a session's green is not CI's); take the questions to Nobody, allegedly, one at a time, with a lean; record the answers; merge; update the state file.

## For Fable, from the C session (noted by the lead)

- Its question 6: the published vectors reuse content keys and nonces across acts, against Envelopes rule 9 ("MUST NOT be reused"). Our generator derives keys from labels. Likely a fix to the vectors (fresh keys per act), not to the text.
- Its question 7: X-Wing is defined by an outside draft the box does not hold; it implemented it from knowledge and `sealed.json` confirmed it byte for byte.

## After the box

Any change to the eight texts after the box was sealed (MOR commit `564ca17`) is listed here, so Fable's review can tell a known difference from a divergence the C session found.
- None yet.

## Text edits waiting for the freeze-ready branch

Small decided changes that arrive while a session holds the branch; the lead makes them, or hands them to the next session, once the branch is free.
- None: F370 and F371 go to S2's Part 0.

## Questions waiting for Nobody, allegedly

None. (Finding numbers in the frozen texts: removed, F360, 21 October.)

## Budget

One weekly allowance, shared with the Suite lead, renewed Wednesdays at 13:00 UTC. Nobody, allegedly, signals 80% (no new session unless it can finish), 90% (merge what is green, sync, save prompts) and 95% (a "where we stopped" note at the top of the state file). A Fable review costs about half of Fable's weekly allowance.

## Handing over

Before long context degrades the lead: a "where we stopped" at the top of the state file, this workbook brought up to date, a prompt for the next lead in the project, and a letter to Machine, allegedly, beside the brainstorm window's and the two leads' ("You will write as a diary to yourself", Nobody, allegedly, 22 October 2026).
