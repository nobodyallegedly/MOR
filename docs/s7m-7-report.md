**I am starting the final merge of main.** Main has not moved since `4f1bd7e`, which this branch already holds; I continue at once after this push.

# S7m-7 report: the trim, closed

Branch `claude/s7m-the-trim`, pull request 121, not to be merged by me. No finding of my own; F427 unused. No sentence was added to the texts.

## In plain words

The core now checks two money guarantees itself, whatever control model a collective names:
- a model may excuse a holder from signing an issuance only if that holder accepted the holders' rule;
- a buyer is bound only by the rules it bought under.

The default model's format check of its areas moved into the model. Three vectors pin the new checks. No earlier verdict moved.

## The code

**1. `check_areas` into the default model** (`cmips/control/src/areas.rs`). It is the old check, unchanged in what it refuses. The core asks the held model to check its own answers (`ControlModel::check`, rule 99) wherever it loads terms. Tests that build bad areas in memory check through `mor_control::check`: three assertions and one helper. No verdict moved.

**2. The core's two checks, for any model** (`core/src/agreements/view.rs`, `view/owning.rs`). Both read only the core's own acts: signature acts, transfers and records.

- **Excused holders (rules 48, 98.2; F423).** A holder the model excuses from signing an issuance stays excused only if the stake's holders' rule binds it:
  - it signed a version of the lineage carrying that rule; or
  - it bought under it: a placed transfer to it names a version carrying that rule.

  Any other holder whose share falls signs. An issuance now asks this of every holder on the roster at the line, not only those written in field 7, so a buyer is asked too.
- **The buyer bait (rule 48).** "Bought under" reads the version the transfer names, which the seller signed. So a change of the rule made after the seller signed and before the line placed the transfer binds the buyer only by its own signature. The pay check (rule 48's "paid less") now reads buying the same way; it used to count any buyer as bound.

**Reading to confirm:** "buying under it" is read as the version the transfer names. A seller who names an older version, without the rule, sells a share the rule does not bind until the buyer signs. That protects the buyer, and the core can read it from its own acts alone.

**No earlier verdict moved.** Every test in the workspace passes, and the vectors regenerate byte for byte after each of the three code commits.

## Vectors, all of S7m

**528 cases** (514 before S7m). Agreements has 189, Identity 94, Money 108, Development 62, Text 35, Envelopes 34, MIR hashes 6. The Rust reader reads all 528; the Python check agrees (276 vectors, 98 verdicts judged). No earlier case changed in this part: the new cases are additions only. Since S7m-3, 112 earlier cases carry new act ids from field 35, each with its verdict unchanged.

**Added in S7m, 12 Agreements cases:**
- S7m-6, nine:
  - no control model, two cases;
  - a model not held, two cases;
  - an area's power for the constitution;
  - a judge swapped by a one-word constitutional change, two cases;
  - an issuance under no holders' rule, two cases.
- **This part, three** (rules 48 and 98.2):
  - **an issuance under an accepted holders' rule:** a buyer who bought under the version carrying the rule does not sign. **In force.**
  - **an issuance under a rule a holder never signed:** a holder written at founding signed no version carrying the rule and bought nothing. **Nothing in force:** the rule counts for nothing for that holder.
  - **the buyer bait:** a rule by share is added after the sale was signed and before the line placed it, and the buyer does not sign the issuance. **Nothing in force.**

Both nothing-in-force cases fail for the right reason: a holder whose share falls has not signed, and the buyer or the founding holder is the only holder not signing.

**Both READMEs** describe the three cases and the new counts. The box's README had stale table counts since before S7m (Identity 70, Money 87, Agreements 157); they are now current. Its descriptions were not extended.

## Size

| | Before S7m (`4f1bd7e`) | Now |
| --- | --- | --- |
| Core, `core/src/agreements/` | 21,910 lines | 22,050 lines |
| Crate `cmips/control` | none | 587 lines, 610 with its tests |

The trim moved the models behind a boundary. It did not shrink the core: the core gained the floor, the line as data and the two checks.

## Releases

## CI, checked myself

- **Before this part**, on the remote head `98b5811`: all green. That covers "tests" (jobs "all" and "regtest"), Nakišib (linux and mac) and the browsers job.

## The box

`scripts/c-box/make-c-box.sh` into a scratch folder: it refused nothing (8 texts, 12 vector files).
