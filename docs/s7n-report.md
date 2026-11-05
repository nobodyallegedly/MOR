# S7n report: the boundary for a second model

**Stopped before the final merge of main; not yet ready to merge.** Pull request 124, branch `claude/s7n-second-model-mngeur` (the session's branch, from main at `b3c900e`), not to be merged by me. No finding of my own; F428 unused.

## In plain words

Before this session, a builder from outside could check what the core decides, but could not write a second control model that two teams would implement the same way. Seven points were unsettled.

All seven are now settled in Agreements draft 19:
- rule 99 gives a model's inputs as plain data;
- its answer has an exact format;
- an act a model refuses and an answer that oversteps now have separate names;
- a model may have acts of its own, which count;
- the remaining three points are spelled out in rules 60, 69, 83 and 98.

**Types 26 to 28 moved.** The issuance offer, the proxy and its revocation are now the default model's own acts. The core no longer decodes them.

**Tested on paper.** An outside builder, limited to the texts, wrote a different model. A second outsider judged five acts under it. The core, holding that model as a stand-in, gives the same five verdicts. The first builder still had to guess at sixteen points. Two of them are now fixed in the text; the rest are below as questions.

## The sentences

**Agreements draft 19** (all in rule 99 unless named):
1. **The answer's format** (point 1). A CDDL gives `answer`, `act-answer`, `clone-answer`, `counted` and `query-answer`.
   - Each power is a `counted` entry: `[power, among, rule]`.
   - "Any k of these named holders" is a `counted` entry whose `among` names them, with the rule `[1, k]`. So the `rule` grammar did not need to change.
2. **A model's own acts** (point 2): "A model's own acts count where the collective's terms name that model in field 35, under the types its specification declares."
   - An act of a type the model does not declare, or outside its type's format, is invalid. To a verifier not holding the model, it is unknown.
   - An act for the collective of the model's specification belongs to the Agreements layer.
   - Rule 60's "specifications the collective has not adopted" gains this as its second exception.
3. **The inputs, as the line as data** (point 3). These are written into "What a control model accepts":
   - the voices, the roster, the signatures, the model's own placed acts and the signature acts naming them;
   - the layers each extension declares (added after the paper exercise);
   - the facts the verifier states.

   The model reads nothing else. The signatures are handed over so that it can say who acted, never to count a power (also added after the paper exercise).
4. **Two verdicts** (point 4):
   - **refused** is the verdict on an act or clone: the model answers `[2, reason]`, and the act or clone is invalid;
   - **overreaching** is the verdict on an answer: one outside the format, or reaching what a model may never decide. It is set aside, and the act or clone is judged by the last resort. It never makes the act refused.

   The task line "Control model", the MIR's freeze scenarios and the MICS follow.
5. **A mixed clone** (point 5). A clone with a constitutional change and operational changes needs `[0]` (and `[4]` where rule 67 asks it), plus the power of each layer's rule and each area its operational changes lie under. The clone rule `[1]` is never asked beside `[0]`.
   - This is said in rule 98.3, in rule 99, and in the last resort's paragraph for a collective naming no model.
   - Rule 99's "a model is never asked about a constitutional change" now adds: "for a clone that also makes operational changes, it is asked about those alone". The paper builder found the contradiction this closes.
6. **Step 3.7c's publication** (point 6), in rule 98's last-resort list and rule 60. The collective's publication, and its signature act on terms or on a publication, count only where its rule for Agreements is met, besides any area. A grant within such an area backs them only where that rule is met too.
7. **Removal and succession** (point 7), rules 69 and 83. Each may leave the control model's parameters as they are; the model reads a holder who is no party out of its areas itself. Both rules no longer say "written with an empty list".
8. **"Bought under"**, rule 48: "It bought under the version of the agreement its transfer names (field 0), which the seller signed."

**Also:**
- The type table's row for 26 to 28 now says that an Agreements act of these types is invalid.
- The default cMIP is draft 2:
  - its answers are in rule 99's format;
  - section 7 puts its acts under its own specification;
  - rule 64.1 covers the mixed clone;
  - an area's holders are read among the parties in a clone;
  - three new freeze scenarios.
- MICS v32 maps it all.
- Suite v32:
  - steps 3.2 and 3.7c gain the rule for Agreements;
  - 3.7aq uses "overreaching";
  - **3.7aw** (a model's own acts) and **3.7ax** (the mixed clone) are new.
- `spec/README.md` names the current drafts (it still named draft 17).

## The types moved

| Before | Now |
| --- | --- |
| Agreements types 26, 27, 28 (`spec` the Agreements MIR's hash) | the default control cMIP's types 26, 27, 28 (`spec` its stand-in hash); the same payloads and `objects` |
| `core/src/agreements/owners.rs` (`owner_types`, `IssuanceOffer`, `Proxy`, the revocation's decoder and payload) | `cmips/control/src/acts.rs`; the file in the core is gone |
| the view: `is_agreements(x, 26/27/28)` | `model_kind`: of the collective's field-35 model, a type it declares (`ControlModel::act_kind`), in its format (`act_format`), read by `read_offer`, `read_proxy` and `read_revocation` into the core's plain `OfferRead` and `ProxyRead` |

**Verdicts kept.** The tests migrated: two in `agreements_draft_14.rs` and the issuance and proxy tests in `agreements_collective.rs`. Their acts' bytes and ids changed (the `spec` field); their verdicts did not. In the format test, the cMIP's types are judged by `mor_control::acts::in_format`, since the chain judges only the MIRs' formats; the same payloads under the Agreements hash are asserted invalid. No published vector held these types, so no vector id moved.

## Money's pointer

Money draft 12 changes one phrase: "a take-up of an issuance (Agreements rule 96)" becomes "(a control model's, Agreements rule 99)". Nothing else changes; the diff against draft 11 is that line and the draft number.

## The second model on paper

**The model.** A subagent limited to the nine texts (the eight in the box, plus the default cMIP) wrote "Majority and treasury": `docs/s7n/second-model-on-paper.md`.
- Majority by share decides operational clones.
- One area, held by treasurers, covers the Money MIR's acts and decides tasks 6 and 7.
- It declares no acts of its own.

It changed the suggested model on one point: no model can make an *everyday act* count by share (question 1).

**The five acts.** A second subagent, given only the texts and that model, judged five acts: `docs/s7n/five-verdicts-on-paper.md`. The core, holding the model as a stand-in (`agreements_collective.rs`, `second_model::the_five_acts`), gives the same five:

| # | Act | Paper | Core |
| --- | --- | --- | --- |
| 1 | a payee pointer, the treasurer alone | counts | counts |
| 2 | a payee pointer, two other members | does not count | does not count |
| 3 | a clone replacing the Text cMIP, `[1]` and `[6, 1]` | in force | in force |
| 4 | a clone replacing the payment cMIP, the treasury `[2, 0]` | in force | in force |
| 5 | a clone adding a member and replacing the Text cMIP, `[0]` alone | invalid (false mark) | invalid ("the mark names other powers"); with `[6, 1]` beside it, in force |

**Where it guessed** (sixteen points, in the model's own file; the main ones):
- by-share everyday acts cannot be expressed;
- the mixed clone drops `[1]`;
- what field 5 means under another model;
- what "narrowing" means;
- an area's ids across a change of model;
- the inputs: the extensions' layers, and the signatures it is handed. Both are now in rule 99.

The others are minor or answered by the texts. The verifier was unsure about act 3's `[1]` beside `[6, 1]`, and about act 4 letting one treasurer change the payment cMIP alone.

## Vectors

**545 cases** (528 before). Agreements has 206. Every earlier case is **byte for byte**: verdicts, acts and ids. The Python check agrees: 289 vectors, of which it judges 111 verdicts (98 before).

**No earlier verdict moved**, in the vectors or in the tests, save one test assertion, moved by decision. In `agreements.rs`, the S7m test of a clone changing an area's words and a payment cMIP now needs `[0]` and `[6, 3]` (point 5).

**Added, 17 Agreements cases:**
- **A new question, "control answer"**: a model's answer as CBOR bytes, read as rule 99 reads it. Thirteen cases:
  - three answers read as a clone: an area's power; the clone rule and the rule for Money; a stand-in for a holder;
  - **overreaching**: naming `[0]`, `[4]` or `[3, party]`; parties not ascending; a stand-in by the rule for Money; an unknown kind;
  - an act reached by area 3; an act no area reaches; refused; unknown.

  This is the overreaching answer, carried where a vector can carry it: as bytes. A vector cannot hold a model, so a clone judged under an overreaching model stays in the tests (`s7n_an_overreaching_answer_is_set_aside`).
- **A mixed clone**: adding a member and naming a second payment cMIP. Marked `[0]` alone, **nothing in force**. With `[6, 3]` beside it, **in force**.
- **A model's own act under field 35**: a member's proxy of the default cMIP's specification, registered by a record, is **placed (the line)**. The same payload under the Agreements hash, type 27, is **invalid**.

**New tests:**
- the publication needing the rule for Agreements besides the area;
- the removal leaving the parameters to the model;
- the overreaching answer set aside;
- the five acts.

The whole workspace passes locally: 798 tests in 95 suites.

**Both READMEs** (`core/vectors/README.md`, `scripts/c-box/vectors-README.md`) give the new counts, the new question and the Python check's 111. The box's README also corrects its stale file size.

## For the Dubsar Suite

`wasm/README.md` has a new section, "Agreements draft 19: the boundary for a second control model (S7n)". It covers:
- the types moved, with the old and new spec, Rust names and files;
- **where an app breaks** (below);
- publications under the rule for Agreements;
- mixed clones in `agreementsPowersNeeded`;
- removals leaving the parameters, as seen in `readTerms`;
- overreaching;
- two new binding functions:
  - `agreementsControlCmip()`, the hash an issuance offer, a proxy or a revocation now names as its `spec`;
  - `agreementsControlAnswer(bytes)`.

**Where an app breaks, plainly.** `clients/desk/scripts/core-types.ts` reads `pub mod owner_types` from `core/src/agreements/owners.rs`, which is gone. The desk's type generator throws, and its `core-types` test fails. Through that list, the desk's granular menu (and Edubba, which uses proxies and issuance) offers types 26 to 28 as Agreements acts, which would now be invalid. The fix is the suite's:
- read `cmips/control/src/acts.rs`'s `pub mod types`;
- list them under the collective's control model, with `spec` from `agreementsControlCmip()`.

I did not change `clients/`. `clients/reader/src/mirs.ts` still names Agreements draft 18; that is one line, and the suite's to change.

## Questions

1. **Everyday acts by share.**
   - *Plainly:* a model can give an act to an area, which counts heads, or leave it to its layer's rule. It cannot say "members holding more than half sign this payment".
   - *Precisely:* `act-answer` is `[0]` or `[1, area]`; rule 65 counts areas by head.
   - *Options:*
     - (a) state it as a limit of MOR 1;
     - (b) add `act-answer` `[2, counted]`, a power by share for one act.
   - *Lean:* (a), with one italic sentence in rule 99. Cost of (b): a new counting path for everyday acts, and vectors for it.
2. **The mixed clone drops the clone rule.**
   - *Plainly:* bundling a working change with any constitutional change skips whatever the model asks for working changes beyond the layers and areas. Where field 18 is weaker than field 5, that is a way around field 5.
   - *Options:*
     - (a) as written: the constitutional change rule is the top rule the founders wrote;
     - (b) ask `[1]` too, where the model names it for those changes.
   - *Lean:* (a), the decision's words ("under the layers' rules"), with the stated cost named in rule 99. Cost of (b): one more signature round for every mixed clone.
3. **What `[1]` means under another model.**
   - *Plainly:* the core counts the clone rule by field 5 as written, whatever the model.
   - *Options:*
     - (a) say so: a model says when `[1]` is needed, never by which rule;
     - (b) let the model's `counted` entry for `[1]` decide.
   - *Lean:* (a), one clause; the code already does it.
4. **Narrowing** (rule 98.5).
   - *Plainly:* may an area's number be below its layer's threshold, so that one treasurer acts alone where the layer's rule is any two?
   - *Lean:* yes. The holders are among the layer's actors; the number is the founders' choice, shown Money first. One clause.
5. **Area ids across a change of model.**
   - *Plainly:* "never reused" is the default model's rule. A collective switching models could see an old grant land in a new area of the same id.
   - *Lean:* the core says that a grant within an area ends at the line where the agreement in force names another model. Cost: one rule, and a vector.
6. **The line as data, in code.**
   - *Plainly:* the core gathers the line's facts for the three shapes the default model uses: an offer, a proxy, a revocation (`ActKind`). A model act of another shape is placed by the line, and gets nothing more.
   - *Lean:* enough for MOR 1. A cMIP lead who needs another shape asks for it, and the core adds that shape's facts.
7. **The box lacks the default cMIP.**
   - *Plainly:* the suite names `cmips/cmip-collective-control-draft-2.md`, and the box's builder needs it to know what a model looks like, but `make-c-box.sh` copies only the eight texts.
   - *Lean:* add it to the box before the third box is sealed.

## Releases, the box and CI

- **Releases:** not rebuilt yet. They wait for the final merge of main, which I will announce in this report's first line and then stop, so that the MOR lead can write "preparing to merge". Main has not moved since `b3c900e`, from which this branch starts.
- **`scripts/c-box/make-c-box.sh`** into a scratch folder: it refused nothing (8 texts, 12 vector files).
- **CI:** see below.

## What remains, in order

1. The MOR lead's "preparing to merge".
2. Merge main.
3. Rebuild the six releases as their READMEs say.
4. Green CI, the desk's `core-types` step excepted until the suite's change lands on the branch.
