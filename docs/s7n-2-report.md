**I am starting the final merge of main.** CI on `f5d3bc1` (my `12239c8` with the suite's reader line) was all green ("tests", jobs "all" and "regtest"; Nakišib; the browsers) save Edubba's release check, which compares with the `built/` copy the releases will replace.

# S7n-2 report: the boundary for a second model, second part

Branch `claude/s7n-second-model-mngeur`, pull request 124, not to be merged by me. No finding of my own; F429 unused.

## In plain words

A control model can now make an everyday act count by share: for example, a payment counts only when members holding more than half of the collective sign it. This is Nobody, allegedly's decision (F428).

The core counts it the way it already counts a change rule by share.

The paper test was run again with this rule. The outside builder amended its model so that every Money act needs a majority by share. A second outsider judged five acts under the amended model, and the core gives the same five verdicts.

The other six points of F428 are written:
- the mixed clone's cost is now stated;
- the clone rule `[1]` is counted by field 5;
- an area's number may be below its layer's threshold;
- a change of model ends an area's grants;
- the line as data stays as it is;
- the default cMIP now goes in the box.

## The sentences (Agreements draft 19, still draft 19)

- **Rule 99, everyday acts by share** (F428, 1).
  - `act-answer` gains `[2, counted]`: a power for that one act, its rule `[3, stake, share]`, counted among the parties `among` names.
  - A new paragraph, "An everyday act by share":
    - the signers are counted as rule 60 counts them, and must be voices that remain at the act;
    - they must hold at least that share of what those voices hold;
    - it is counted as rule 65 counts a rule by share, the fewer-voices clause included;
    - it takes the act out of its layer's rule, as an area does;
    - where the collective enters an agreement as a party, it still needs the rule for Agreements;
    - an answer that is not by share, or that names a non-party, is overreaching.
- **Rule 65.** A power a model gives one act by share is counted among the parties that answer names. For an act, the stake is read from field 7 of the agreement in force for it, with the transfers placed before the act. "Areas keep counting heads" now points to `[2, counted]` for decisions by share.
- **Rule 99, the mixed clone's stated cost** (2): "bundling a working change with a constitutional one skips what the model would ask beyond the layers' rules and its areas (the clone rule among it); the constitutional change rule, the top rule the founders wrote, is met instead."
- **Rule 99, `[1]`** (3): "A model says when the clone rule, `[1]`, is needed, never by which rule: field 5 counts it, as the terms write it, whatever rule the answer's `counted` entry for `[1]` gives." Rule 65's list says the same.
- **Rule 98.5** (4): "An area's number may be below its layer's threshold (one treasurer alone where the rule for Money is any two): the founders' choice, which the client shows before they sign, Money first."
- **Rule 74** (5): "A change of control model ends every grant within an area": from the line that puts in force an agreement naming another model, or none. An act under the grant after that line is not backed, whatever area of the new model carries the same id.
- **MICS v32**: one paragraph covering points 1, 3 and 5.
- **Suite v32**: two new steps.
  - **3.7ay**, a payment by share. Thirty and twenty per cent together, exactly half, do not count; with the member holding half, the payment counts; the member holding half alone does not; an answer by head is overreaching.
  - **3.7az**, a change of model ends an area's grants.
- The MIR's own freeze scenarios gain both.
- The default cMIP is unchanged: it gives no power by share (it need not).

## By share, in code and on paper

**Code.**
- `ControlModel::act_answer`: a model answering per act, in rule 99's format.
- The core reads the answer with `read_answer`:
  - `[0, [2, counted]]` is counted by the same formula as `share_rule_met` (rule 65's rule by share), among `among`, at the act;
  - a refusal makes the act invalid;
  - an overreaching answer is set aside: the act counts under its layer's rule or area.

  No new counting rule.
- `AreaCount` gains `share`, and the binding shows it.
- `Backing`: a grant within an area is not backed once the agreement in force names another model.
- Two test stand-ins in `mor-control`:
  - `stated`, a model whose per-act answers a vector states;
  - `twin`, the default cMIP held under a second hash.

**On paper.**
- The builder's draft 2 is `docs/s7n/second-model-on-paper-draft-2.md`:
  - Money acts by share among the Money layer's actors;
  - the treasurers dropped, since areas count heads;
  - Money tasks need the rule for Money and `[1]`.
- The second outsider's verdicts are `docs/s7n/five-verdicts-on-paper-draft-2.md`.
- The core, holding draft 2 as a stand-in (`agreements_collective.rs`, `second_model_by_share::the_five_acts`), agrees on all five:

| # | Act | Paper | Core |
| --- | --- | --- | --- |
| 1 | pointer, Ben drafts (30%), Cy signs (20%) | does not count (half, not more) | does not count |
| 2 | pointer, Ana (50%) alone | does not count | does not count |
| 3 | pointer, Ana drafts, Cy signs | counts (70%) | counts |
| 4 | clone replacing the payment cMIP, Ana and Ben, `[1]` and `[6, 3]` | in force | in force |
| 5 | the same clone, Ben and Cy | invalid (`[1]` by field 5 not met; false mark) | invalid |

**Where they guessed** (the builder's list is in its file; the verifier's notes are in its file). The main points are questions 1 to 3 below. The others:
- which power label an act's `counted` carries;
- `500001` being one millionth stricter than "more than half";
- the fewer-voices clause, restated in shares, doing nothing for an act.

## Vectors

**554 cases** (545 before S7n-2). Agreements has 215. Every earlier case is **byte for byte**: verdicts, acts, ids and places, the new cases added at the section's end. The Python check: 291 vectors, 113 verdicts judged (111 before).

**No verdict moved.**

**Added, 9 Agreements cases:**
- **By share**: a collective holding 50, 30 and 20 per cent, under the stated stand-in model.
  - Its answer for a payee pointer is counted among the three, more than half. The verifier is told the answer: a new fact, `control_answers`.
  - Drafted by the 30 per cent alone: **does not count**.
  - With the 20 per cent too, exactly half: **does not count**.
  - With all three: **counts**.
  - The answer written by head instead: **overreaching, set aside**, and the pointer **counts** under the rule for Money (that member alone).
- **Two "control answer" cases**: an act's power by share reads "an act, by share"; one by head reads "overreaching".
- **A change of control model** (rule 74):
  - the record putting in force a clone naming the twin model, every member signing: **the line**;
  - the agent's pointer under a grant within the Money area before the change: **backed**;
  - the same pointer after the change: **not backed**, the new model's Money area carrying the same id. A new fact, `control_models_also`.
  - With the new rule switched off, this case reads "backed": the rule alone decides it.

**Both READMEs** give the counts, the two new facts and the new cases.

## For the Dubsar Suite

`wasm/README.md` has an "Added in S7n-2" table:
- `agreementsConsent`'s areas may hold a power by share: `area` -1000, and `share`;
- `agreementsControlAnswer` reads `[0, [2, counted]]`;
- a grant within an area is not backed after a change of model.

The suite's fix (`a071bec`, desk types and the reader's draft) is on the branch, and `core-types.ts --check` is up to date.

## The box

`scripts/c-box/make-c-box.sh` now carries the default control cMIP, in `cmips/`, beside the eight texts. It leaves out the cMIP's "For the Dubsar Suite" section, a handover to its owners that is no part of the specification and points into `docs/`. The box's README says why it is there: the suite runs steps against it, and a builder of a second model needs one model to read.

Run into a scratch folder, it refused nothing: 8 texts, 1 cMIP, 12 vector files.

## Questions

1. **Money's wording.**
   - *Plainly:* Money says a collective's Money acts count under the rule its founding names for Money. Read alone, it misses a control model's areas and powers by share; the verifier on paper noticed.
   - *Options:*
     - (a) Money draft 13 adds "(or as its control model narrows it, Agreements rules 60 and 99)";
     - (b) leave it, Agreements deciding.
   - *Lean:* (a). Cost: a second Money draft in two sessions, one clause.
2. **Founding display.**
   - *Plainly:* the client must show, before founders sign, what lets one member act alone, Money first. The query answer has no slot for an act's power by share, so a client cannot show it.
   - *Lean:* `query-answer` gains key 2: for each act type the model gives a power by share, its `counted`. Cost: one CDDL line, and the default cMIP answers it empty.
3. **Grants under a power by share.**
   - *Plainly:* rule 74 says who may grant within an area or a layer, not within a power by share.
   - *Lean:* a grant reaching acts that a power by share reaches counts only with signatures meeting that power, as a grant within an area does with its holders. Cost: one sentence, and the core's grant check extended.

## Releases and CI

- **The final merge of main:** main had not moved since `b3c900e`, which this branch already holds, so the merge was a no-op ("Already up to date").
- **The six releases**, rebuilt as their READMEs say (`cd clients/genesis && npm run wasm`, then `npm run release` in `site`, `dub`, `kishib`, `damgar`, `ummia` and `desk`), with rustc 1.97.0, wasm-bindgen 0.2.129 and esbuild 0.25.12: commit `4a31c8a`. That covers the display client, Dub, Kišib (its air-gapped WebAssembly too), Damgar, Ummia and Edubba.
  - The desk's `mor_wasm_bg.wasm` (`6e24ee12…`) matches the bytes GitHub's machine printed in Edubba's release check.
  - The display client's reproducibility test passes locally (`npm run test:build`).
- **CI on `4a31c8a`, read myself** (5 November, after 11:27 UTC): **all green**, the desk's step included (the suite's fix is in):
  - "tests" (run 42014885716): jobs "all" (the Rust workspace, both vector steps, every app and module, the reproducible display client) and "regtest";
  - Nakišib, linux and mac;
  - the browsers;
  - Kišib's seal;
  - Edubba's release check.
- **Locally:** the whole workspace passes, 799 tests in 95 suites.
- The pull request is marked ready for review, not merged.
