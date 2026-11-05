# S7m-4 report: the trim, fourth part

**Stopped at a clean point, not ready to merge.** Done: steps 1 and 2 (F423 in the texts) and step 5's handover for the binding. Not done: step 3 (issuance, proxies and `owners.rs` into the crate), step 4's new vectors and step 6 (the releases). **The branch cannot be green on GitHub without one change in `clients/`, which is the suite's** (below). The final merge of main was not started.

Branch `claude/s7m-the-trim`, pull request 121, not to be merged. No finding of my own; F424 unused.

## In plain words

Dilution is now a reduction of every holder's share, judged by rule 48, the same rule that keeps any stake from shrinking without its holder. Pre-emption left the core: it is the default control cMIP's way of collecting that consent, nobody's guarantee. Fable's section 3 is written in: the founding warning, "narrowing", the way out reading only the core's own acts, field 7, and the default cMIP's parameters 30 and 32.

The code is where S7m-3 left it: the boundary in place, every Rust test passing, no published verdict moved. Issuance and proxies are still in the core. The apps still write field 34, which the core now refuses, so nine app test steps fail until the suite changes one encoder.

## Sentences written and struck

**Written (draft 18):**
- **Rule 98.2:** Fable's guarantee, as written ("An issuance of a stake is a reduction of every holder's share … is a false mark (rule 46)"), with "the parts a model adds … the client shows them". Also the stated cost on value, not percentage, Money first.
- **Rule 8:** an issuance is "such an act", a reduction under rule 48. Any other change of field 7 is a false mark (rules 46, 98.2); this sentence comes from the fourth reading's contradiction.
- **Rule 45:** an issuance needs every holder, or holders meeting a holders' rule each holder it binds accepted.
- **Rule 48:** the advance permissions are succession, absence's two outcomes, and an issuance under an accepted holders' rule.
- **Rule 98, client conformance at founding:** every holders' rule, issuance term and area, Money first, with the warning for an area letting one member act alone in Money.
- **Rule 98.5:** "narrowing" in one clause.
- **Rule 98's "not held" paragraph:**
  - the way out and "broken" read placement from the core's own acts alone;
  - "no act of the way out waits on a model's answer";
  - field 7, for the way out and a rollback, is the latest constitutional clone's with the placed acts since.
- **Rule 65:** "a constitutional clone here is one changing the constitution beyond the judicial tier" (S7m-3's question 1).
- **Rule 98.3:** a judicial-only clone needs `[4]` alone (S7m-3's question 2).

**Struck from the core:** rule 98.2's pre-emption sentence; its definitions of "reached", the period and a take-up; rule 8's exception ("an issuance a control model allows"). The default cMIP keeps them as its rule 96.

**The default cMIP:**
- parameter 30 restates the core's default (every holder signs where a stake names no rule);
- parameter 32 is no longer "constitutional": an issuance is a reduction judged by rule 98.2;
- field 7 is reached by no area (from the fourth reading).

**MICS v31:** dilution as reduction, the stated cost, pre-emption as one model's way.

**Suite v31:** step 3.7as is now the three cases: no rule (every holder signs), an accepted rule, and a rule a holder never signed (counts for nothing). The checklist follows.

## The fourth hostile reading

A subagent limited to the texts and the default cMIP. **Blocked:** full resignation, records, absence, a model's refusal of a constitutional clone, the split agreement and the judicial tier through a model. **Still succeeds or ambiguous, in order of harm:**

1. **A mixed clone declared by a rotation.** A verifier holding the model can find its mark false (the operational part); one without the model judges it by the core alone, not broken. So "broken" can depend on the model, and with it whether a resignation is registered (rule 70). **Question 1.**
2. **The default cMIP's members consenting "through the powers above".** Read literally, it could let an area holder plus the non-members issue without a member who holds 30%. The core's rule 45 says every holder signs. *Partly fixed:* field 7 is reached by no area. The cMIP's sentence on members consenting through the constitution still needs to say "for a reduction, every member signs or a holders' rule they accepted". **Question 2.**
3. **An issuance and field 7 for the way out.** An issuance changes field 7, but it is no constitutional clone, while the way out reads "constitutional clones alone", so verifiers can disagree on a fork's division or a vote by share. *Lean:* the way out reads field 7 updated by placed issuances too (rule 98's sentence already says "the placed acts since"; make issuance one of them, explicitly). **Question 3.**
4. **No floor on a holders' rule's form** (one millionth, or a named founder). Rule 98.2 accepts it by design, the say not the price. Where field 18 counts by share, an issuance under such a rule moves the constitution. **Question 4.**
5. **Parameters only the model can read**, for succession ("nothing else in the areas") and stepping down. Rule 83's "with no other power" sits against 98.3's `[0]`; the default cMIP's 64.3 names `[3, party]` and drops a plan from field 16, which is judicial. **Question 5.**
6. **Area holders computed on the fly; a judge named in the parameters** (an area's limits cMIP); **publications reached by an area.** The last is a stated cost.

## The code

**Moved, across S7m (phases one and two, S7m-3; nothing new in this part):**

| Where | What |
| --- | --- |
| Core, new: `agreements/control.rs` (80 lines) | The boundary: the trait, filling answers, refusing a model's answer that reaches the constitution or the judicial tier |
| Core: `tiers.rs` (329 to 316 lines) | The constitutional and judicial floor, the last resort |
| Core: terms parser | Fields 20, 30, 32 and 34 gone; field 35 decoded raw |
| Into the crate `cmips/control` (285 lines) | The parameter codec, `install`, `held`, `decode`, `lies_in` and the operational allocation |
| Still in the core | `owners.rs`, `view/issuance.rs`, `view/proxies.rs`, `check_areas` |

The issuance and proxy judgment calls about 25 private view methods (placement, payments, the roster at a line, take-ups). Moving it means first designing the "line as data" the trait receives. That design is the work that remains.

**The core does not yet enforce, for a model other than the default:**
- rule 98.2's issuance-as-reduction;
- the buyer bait.

**The core and the text differ in two places, and the code must follow:**
- the core still accepts an area's field reference to field 7;
- the default cMIP's issuance code still checks pre-emption, which the text now calls the model's own way (no verdict differs: the default model asks it).

## Vectors

Unchanged since S7m-3: 514 cases, byte for byte, no verdict moved; the Python check agrees, 276 vectors. **Not added:**
- the three issuance cases (no rule, an accepted rule, a rule a holder never signed);
- a model not held;
- no model;
- a model reaching the constitution;
- a majority swapping a judge with a one-word constitutional change;
- the buyer bait.

The READMEs do not yet describe field 35.

## For the Dubsar Suite

`wasm/README.md` has a new section, "Agreements draft 18: control models", with the old and new shapes and `agreementsControlPack`.

**What every app must do:** call `agreementsControlPack` on a collective's terms before signing them, or write field 35 in `clients/repo/src/agreements.ts`'s `encodeTerms`. The one encoder serves Edubba, Dub, Kišib, Damgar, Ummia and the desk.

**CI on this branch's phase-two head** (run 1383; read myself) fails exactly there:
- In the "all" job, 9 app steps fail with "What was shown cannot be signed": assess, collective, connector, desk, Kišib, Damgar, Ummia, repo, site.
- In the regtest job, Damgar and the desk fail.
- The display client's released copy differs, expected until the releases are rebuilt.
- The Rust workspace, both vector steps and every other app are green.

The default cMIP's handover in its own text predates the code; the binding's section above is the current one.

## Edubba on the default cMIP

Edubba founds and clones collectives through `encodeTerms` with field 34, so the core refuses every collective it founds until the change above. Nothing else is known to break: it reads `areas`, `holdersRules` and the rest through the binding, whose JSON shapes are unchanged. To check once the suite's change is in.

## Questions

1. **A mixed clone declared by a rotation, and "broken".** *Options:* (a) a rotation may declare only a clone whose every change is constitutional, the operational part recorded separately; (b) "broken" judged on the constitutional part alone, the operational part judged after. *Lean:* (a). It is simple, and a verifier never needs the model to tell broken from not. *Cost:* two acts where one was.
2. **The default cMIP's "members consent through the powers above".** *Lean:* one sentence: for a reduction of a share (an issuance, a sale or release of a work), each member is a holder too, signing or bound by a holders' rule it accepted, as rule 98.2 says. This may move a verdict the default cMIP's issuance code gives today; to check against `view/issuance.rs` before writing.
3. **An issuance in field 7 for the way out.** *Lean:* name a placed issuance among "the placed acts since" in rule 98, one clause.
4. **A floor on a holders' rule's form.** Fable's section 1 says none is needed, "the say, not the price". The new point is a constitution counted by share and captured by issuance. *Options:* (a) stated cost, shown at founding; (b) an issuance under a holders' rule never changes how field 18 counts by share without the constitutional change rule. *Lean:* (b), one sentence, since it keeps the constitution in the core.
5. **Succession under a model.** *Lean:* rule 83's "with no other power" stands. A succession clone changes only what rule 83 lists, the model's parameters left as they are (the model reads the departed party out of its areas by itself). The default cMIP's 64.3 becomes a pointer.

## Releases, the box and CI

- **Releases:** not rebuilt. They can't go green before the suite's encoder change.
- **`scripts/c-box/make-c-box.sh`** into a scratch folder: it refused nothing (8 texts, 12 vector files).
- **CI:** read myself on run 1383; as above.

## What remains, in order

1. The suite's encoder change, for CI green.
2. The line as data, then issuance, proxies, `owners.rs` and `check_areas` into the crate. The core's issuance-as-reduction and buyer bait for any model.
3. The eight new vectors; both READMEs.
4. Questions 1 to 5 above.
5. Merge main, rebuild the six releases, green CI, then stop for "preparing to merge".
