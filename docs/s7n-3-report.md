**I am starting the final merge of main.** CI on `62dcbd1`: green but one step. `clients/reader`'s test 8 ("the texts shipped are the newest draft of each MIR") fails because `clients/reader/src/mirs.ts` still names Money draft 12 and Agreements draft 19. Two lines, the suite's: I did not change `clients/`.

# S7n-3 report: three small points

Branch `claude/s7n-3-three-points`, from main at `db20305`. Not to be merged by me. No finding of my own; F430 unused.

## In plain words

Three gaps from S7n-2 are closed:
- Money now says a control model may narrow who acts for a collective's Money acts.
- A model now lists, in its query answer, every kind of act it lets members decide by share, so founders can be shown that before they sign.
- A grant can no longer get around such a power: it counts only when members holding the share that power asks sign it.

## The three points

1. **Money draft 13** (F429, 1). One clause, in "A collective's Money acts": they are "judged by Agreements under the rule its founding names for Money, or as its control model narrows it (Agreements rules 60 and 99)". Nothing else in Money changed: four lines of diff, the clause and the draft number.
2. **The founding display** (F429, 2). Agreements draft 20, rule 99:
   - `query-answer` gains key 2, `[* [ kind: [spec, type], counted ]]`: each act type the model gives a power by share, with that power, ascending, none twice, empty where it gives none;
   - the queries' words name it;
   - rule 98's client conformance at founding now reads "the client shows who acts on what, Money first: every area, every power by share a model gives an act type (query key 2) among it, every holders' rule and every term under which a stake may be issued";
   - the default control cMIP, now draft 3, answers key 2 empty.

   **The binding** exposes it through a query reader, `agreementsQueryAnswer(payload)`, which returns the whole query answer as CBOR. `readTerms` is unchanged.

   Code: `ControlModel::powers_by_share`, and `control::query_answer`.
3. **Grants under a power by share** (F429, 3). Rule 74 gains: "A grant reaching acts a power by share reaches counts only with signatures meeting that power … as a grant within an area counts with its holders. A grantee's act under it within that reach is the grant's, and asks no further share."

   The core's grant check: a collective's grant naming no area, whose kinds overlap an act type the model lists in key 2, is counted by that power, as an act by share is. With this check switched off, both "not" cases below flip: the check alone decides them.

**Also:** MICS v33 (one sentence); suite v33, step **3.7ba**; the MIR's freeze scenarios (one line); `spec/README.md`; `cmips/README.md`.

## Vectors

**558 cases** (554 before). Agreements has 219. Every earlier case is byte for byte: verdict, acts, ids and place. **No verdict moved.**

**Added, 4 Agreements cases**, in S7n-2's by-share collective (the stated stand-in model):
- a grant reaching payee pointers, signed by the members holding 30 and 20 per cent (exactly half): **does not count**;
- the agent's pointer under it: **not backed**;
- the same grant signed by the member holding half too: **counts**;
- the agent's pointer: **backed**, asking no further share.

The Python check agrees: 291 vectors, 113 judged. The new cases need Agreements, so it does not judge them. Both READMEs give the counts and the cases.

The whole workspace passes locally: 800 tests in 95 suites. The new test is `s7n3_the_query_answer_lists_powers_by_share`.

## For the Dubsar Suite

`wasm/README.md` has a new section, "Agreements draft 20 (S7n-3)":
- `agreementsQueryAnswer`;
- what to show founders ("who acts on what, Money first, powers by share among it");
- grants under a power by share;
- Money's clause.

The default cMIP gives no power by share, so nothing an app does today changes.

## The box

`scripts/c-box/make-c-box.sh` into a scratch folder refused nothing: 8 texts (Money 13, Agreements 20, MICS v33, suite v33), 1 cMIP (draft 3), 12 vector files.

## Questions

1. **"Alone" in Money's creditor's release.**
   - *Plainly:* Money still says, twice, that a collective creditor's release counts "under the rule its founding names for Money alone" (the italic note after "Creditor's release" and a freeze scenario). That reads against today's clause. I left it, as asked.
   - *Lean:* drop "alone" in both at the say-it-once pass, if the pass may touch a word whose meaning the new clause already set. Otherwise, a Money draft 14 of one word.
2. **An act's answer that differs from key 2.**
   - *Plainly:* a model could list a power by share in its query answer and answer otherwise for one act. Nothing says which wins.
   - *Lean:* the act's answer must be the listed power, and any other answer is overreaching. One sentence in rule 99. Cost: the core compares the two.

## After the first edition (the MOR lead, under delegation)

1. **"Alone" dropped in Money draft 13**, in both places, on this branch. The italic note after the creditor's release now says "under the rule its founding names for Money (Agreements rule 92)". The freeze scenario says "a collective creditor's counts under the rule its founding names for Money". *A correction to my first edition:* that second place said "only", not "alone"; its "alone" ("signed by the creditor alone") is another matter, left as it was. Money draft 13 against draft 12 is now these three phrases and the draft number.
2. **An act's answer must be the listed power.** One sentence in rule 99: "A model's answer for an act of a type key 2 lists is that power; any other answer for it is overreaching."
   - The core compares: an act's answer for a listed type that differs from `[0, [2, listed]]`, or a power by share for a type key 2 does not list, is set aside, and the act counts as the core alone would count it.
   - **One vector:** a model listing 600,000 for payee pointers and answering 500,001 for one is overreaching, set aside. The pointer counts under the rule for Money. **559 cases**; every earlier case byte for byte; no verdict moved.
   - The test stand-in of the paper model, draft 2, now lists its powers in key 2, as the rule asks; its five verdicts are unchanged.
   - 800 tests pass locally; the Python check agrees.

## Releases and CI

- **The final merge of main:** main had not moved since `db20305`, from which this branch starts, so the merge was a no-op.
- **The six releases**, rebuilt as their READMEs say, with rustc 1.97.0, wasm-bindgen 0.2.129 and esbuild 0.25.12: commit `aecd9d9`. That covers the display client, Dub, Kišib (its air-gapped WebAssembly too), Damgar, Ummia and Edubba. The display client's reproducibility test passes locally, and GitHub's machine built the same WebAssembly (`ceee4ad9…`).
- **CI on `aecd9d9`, read myself** (5 November, 14:28 UTC): **green but one step.**
  - Green: the Rust workspace; both vector steps; every app and module but the reader; the reproducible display client; the regtest job; Nakišib (linux and mac); the browsers; Kišib's seal; Edubba's release check.
  - **Red: `clients/reader`**, test 8, "the texts shipped are the newest draft of each MIR under spec/". `clients/reader/src/mirs.ts` names `MIR-money-draft-12.md` and `MIR-agreements-draft-19.md`, and the newest are 13 and 20. Two lines, the suite's. I did not change `clients/`.
- **The pull request stays a draft** until the suite's two lines land on this branch and CI is green. Then I mark it ready, as asked, or the MOR lead does.
