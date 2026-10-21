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

## The bar for the freeze

Nobody, allegedly, 21 October 2026: "All it needs to be is a solid experimental ground where a small group of people can build the prototype. Once MOR2 exist, that round is more about finding adventurous entities willing to build real solutions, their prototypes inform MOR3." So the freeze asks three things, and nothing more: texts a stranger can build from (the C verifier proves it); the way out right (portable identities, succession, cloning, anchored history), so what is built on MOR can be carried to MOR2; and the reasons kept (the findings, the provenance map), so MOR2's builders know why each rule exists before they change it. The freeze report states plainly what was never tested: strangers' homes and a real censor, real money and time.

## The role

The MOR lead keeps the core: the core texts (MICS, six MIRs, freeze test suite), the conformance vectors, the C verifier, Fable's review, the fixes, the step 17 rehearsal, the freeze, and dubsar.org for the release. The Dubsar Suite lead keeps the apps, their H findings, and every cMIP and Module, those woven into verdicts included (Nobody, allegedly, 21 October 2026: "The idea is that it is not core."); what it needs from the core comes through Nobody, allegedly. Build work is done by sessions the lead writes prompts for; work on the author's Mac and the servers by machine sessions.

## The sessions to the freeze

| # | Session | Waits for | Status |
| --- | --- | --- | --- |
| S1 | **Freeze-ready texts** (the clean-up pass): six MIRs, MICS v30, suite v30, the provenance map. Texts only. | — | Done 21 October, pull request 83, not merged: checklist verified by the lead; about fifty questions, sorted in `docs/lead/s1-questions.md` |
| S1b | **Technical pass:** F363 to F369 written into the freeze-ready drafts, and the formats S1 found unwritten, on S1's branch. | — | Prompt ready 21 October (`docs/lead/prompts/s1b-technical-pass.md`) |
| S2 | **Core aligned, and the vectors:** the core library matching S1's texts (keeper records, rule 33 by anchors, F359, F295's count); suite steps already tested marked run, small tests for the cheap core steps; conformance vectors part 2 (signatures) and verdict vectors for every layer, checked by the Python implementation too. | S1 approved; the Suite lead's items touching the core | Not written |
| S3 | *Handed to the Dubsar Suite lead (Nobody, allegedly, 21 October: "Modules and cMIPs are handled by the suite lead. The idea is that it is not core."):* the "Dubsar" titles (F356), payment cMIP draft 4 (F355 c), the chain-key signer Module's fresh seed (F361), the regtest quirks kit. | — | Not the MOR lead's |
| S4 | **The C box** (the lead itself): a new repository holding the freeze-ready texts and vectors, fingerprinted; the C session's prompt. | S1 and S2 merged; the Suite lead's core items in | — |
| S5 | **The C verifier**, insulated, outside the project. | S4 | — |
| S6 | **Fable's review, a Thursday**: each divergence judged (text unclear, text wrong, Rust wrong, C wrong). About half of Fable's weekly allowance. | S5 | — |
| S7 | Fixes; the step 17 rehearsal; the freeze ("if the fixes are not gigantic"); the first two acts of the frozen protocol, "Thank you for the shower…" with a photograph of the Earth, then the full text formatted (build brief). | S6 | — |
| S8 | dubsar.org for the release (H41 to H44, H62; short IDs with the full form on click; "a research and an art project"; the companion text); main's protection tightened when the repository goes public. | Discussed with Nobody, allegedly, once Fable's review begins ("The Dubsar website will need a refresh but we'll have all the work on the Dubsar apps to inform it"); then the fourteen doors pointing to the frozen MIRs, their opening lines his to write | — |

**The target (Nobody, allegedly, 21 October 2026): "If we can be ready with the C verifier a week from now, it's perfect."** Working back: S1b running 21 October; S2 (code and vectors, the heaviest, may need two sessions) 22 to 24 October; S4, the C box, sealed by the lead 25 October; S5, the C verifier, building 25 to 28 October; Fable's review on a Thursday once the Dubsar team has finished its week's work (Nobody, allegedly: "It's ok, if fable comes a bit later, as long as Dubsar team has done burning tokens next week"): 29 October at the earliest. The risk is S2; no step is rushed to keep the date.

**Why S1 starts before the Suite lead's fixes are known** (the lead's reading, 21 October): the handover asked the drafts to wait for them, so that the C session sees everything. What the C session sees is fixed at S4, the snapshot, not at S1. S1's texts can take a later core item as a small change before S4; waiting would leave the budget idle. If a Suite item turns out large, S1's work is not lost.

## How a decision is recorded (the same turn)

1. A finding in `docs/findings/MOR-findings-log-round-2.md`, newest first, the next F number (check the top first: the Suite lead writes there too, its entries marked "(Dubsar Suite)").
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

## Before merging a session's work

Read its report and its questions; read the CI run yourself (a session's green is not CI's); take the questions to Nobody, allegedly, one at a time, with a lean; record the answers; merge; update the state file.

## Questions waiting for Nobody, allegedly

None. (Finding numbers in the frozen texts: removed, F360, 21 October.)

## Budget

One weekly allowance, shared with the Suite lead, renewed Wednesdays at 13:00 UTC. Nobody, allegedly, signals 80% (no new session unless it can finish), 90% (merge what is green, sync, save prompts) and 95% (a "where we stopped" note at the top of the state file). A Fable review costs about half of Fable's weekly allowance.

## Handing over

Before long context degrades the lead: a "where we stopped" at the top of the state file, this workbook brought up to date, and a prompt for the next lead in the project.
