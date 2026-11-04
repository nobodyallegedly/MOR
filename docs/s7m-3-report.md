# S7m-3 report: the trim, third part

**Stopped at a clean point.** Done: steps 1 and 2 (the texts) and the first two phases of step 3 (the boundary and the migration). Not done: the rest of step 3 (issuance, proxies, `owners.rs`), step 4's new vectors, step 5 and step 6. Nothing here is a release. The final merge of main was not started.

Branch `claude/s7m-the-trim`, pull request 121, not to be merged. No finding of my own; F423 unused.

## In plain words

The judicial tier is back in the core exactly as draft 17 had it, and F422's settled points are written in. The code now has the boundary F422 chose:
- a collective names its control model in field 35, with parameters the core never reads;
- the default control cMIP, in its own crate, answers the core's questions about areas and holders' rules;
- the core decides the constitution and the judicial tier by itself.

Every test in the workspace passes, and the published vectors regenerate byte for byte with no verdict moved. What remains is moving issuance and proxies, adding the new vectors, and the binding, the apps and the releases.

## The tier restored (step 1)

- **Rule 67 is back in the core** (Part four, after rule 98), in draft 17's words and with its list unchanged. It adds "whatever field 18 says" and "no control model names or adds a power for it".
- **Rule 98.3:** a constitutional clone that also changes the judicial tier names `[4]` beside `[0]` and needs both. The rollback (rule 93) says the same again.
- **`[4]` is the core's in the mark grammar**, counted among every party whose voice remains (rule 65).
- **Other places now pointing at rule 67:** the keepers (rule 36), the plans (rule 81), the chain of judgment (rule 35 and the Terms commentary), the split agreement (rule 15), the judicial tasks (rule 60) and rule 99's "may never decide".
- **The default cMIP:**
  - its rule 67 is a pointer to the core;
  - its rule 62 table marks fields 3, 6, 9, 13, 16 and 21 judicial, the core's;
  - its rules 64.1 and 66, its reasoning and its scenario say "both" again.
- **MICS v31:** the judicial tier is restored, including the sentence on the judging tasks that the third reading flagged.
- **Suite v31:**
  - steps 3.7f and 3.7l are restored;
  - new step 3.7au: a majority swapping a judge by a one-word constitutional change, refused;
  - a checklist item for the judicial tier.

## The settled points (step 2)

- **Question 4:** a stake's holders' rule is a query answer of rule 99. A buyer's client shows it before paying (client conformance). A change of it binds no holder without that holder's signature.
- **Question 5:** rule 98.2 defines "reached" (public, or sealed to the holder), the period (on the agreement's time reference) and a take-up (placed by the line, or anchored).
- **Question 6:**
  - stepping down is read without the model: any member may step down from an area id its terms name, and a non-holder's step-down changes nothing;
  - rule 69's parent, for the way out, is the latest constitutional clone or any clone recorded after it.
- **Question 7:** field 24 is the release rule, as written.
- **The three contradictions:**
  - rule 48's "pre-authorised" now names rule 98's three permissions;
  - rule 98.2's "signs it" adds "or consents under a rule it accepted, as rule 48 says";
  - the MICS's split agreement is now judicial tier.

## The third hostile reading

A subagent limited to the texts and the default cMIP, run after step 2.

**Blocked:**
- the head-on attacks on the constitution and the judicial tier;
- resignation;
- paying one holder unlike the others;
- keepers' records.

**Fixed in the texts on this branch:** two side doors on paper, the MICS sentence on the judging tasks and the italic Terms line on the chain of judgment.

**Still succeeds, for the MOR lead and Fable:**
1. **Dilution.** Pre-emption has no floor on its period or price; an offer can run for one block at a huge price.
2. **A holders' rule of one millionth binds departed founders**, and founders are not shown it at founding (only buyers are).
3. **A model's areas can narrow Money to one member** with no Money-first warning; "narrowing" is undefined.
4. **Placement and adoption through model-governed acts.** Record field 3's "an act a control model asks a line to place", and acknowledgements and adoptions by an area holder, let a verifier without the model disagree on when a departure took effect.
5. **The way out reads parameters only the model understands:**
   - stepping down "from an area id its terms name";
   - a succession clone's "out of every area it held";
   - a refit's area entry.
6. **Stale field 7.** By-share endings read the stake along constitutional clones alone, while field 7 changes by operational clones; and a rollback can be read as copying either clone.
7. **The default cMIP, read literally:** parameter 30's "every holder signs" adds a requirement to a constitutional change; parameter 32 makes every issuance constitutional. *Fixed:* parameter 20 is now constitutional, as rule 98 says.

## The code moved (step 3)

**Phase one, the migration**, behaviour-preserving, in its own commit (`shape (a), phase one`):
- **Terms:** they gain `control: Option<Control>` (field 35, `[cmip, params]`). Fields 20, 30, 32 and 34 leave the terms parser and are refused as terms fields.
- **The answers** (areas, their words, holders' rules, an issuance's offer) are Rust fields filled from the held model (`agreements::control::fill`), never encoded by the core.
- **The trait:** `agreements::control::ControlModel` (`read`, `pack`, `clone_powers`).
- **The view** holds models (`with_control`) and fills the answers wherever it loads terms.
- **The crate `cmips/control` (`mor-control`):**
  - the default cMIP's parameter codec (`params`, `read`), `install`, `control()`, `held()` and `decode`;
  - its stand-in hash `sha256("cMIP: A collective's control, draft 1 (stand-in)")` (test data).
- **The tests, the generator and the binding go through it:**
  - every view holds the default model;
  - every test-built collective names it;
  - two round-trip helpers decode through it.
- **Result:** every test passed; no verdict moved across 514 cases; 112 cases have new act ids, because every collective now carries field 35. Python check: 276 vectors agree.

**Phase two, the logic:**
- **In the core (`tiers.rs`):**
  - The tier table is the core's floor: F421's constitution (fields 0, 1, 5, 12, 17, 18, 19, 22, 24, 35 and the model's parameters) and F422's judicial tier (3, 6, 9, 13, 16, 21 and field 2's tasks 9, 10, 11 and 14).
  - `powers_needed` gives `[0]` and/or `[4]` itself, never asking a model.
  - For an operational change it asks the held model, refusing an answer that names `[0]`, `[4]` or a plan (`control::checked`). The answer is unknown (`Missing`) where the model is not held.
  - With no model it applies the last resort (a layer's rule for field 2 or 15 entries, otherwise `[0]`).
  - A rotation's "constitutional change" now uses F421's whole list.
- **Into the crate (`cmips/control/src/tiers.rs`):** `lies_in` and the operational allocation (areas, layer rules, the clone rule), unchanged in what they decide.
- **Lines:** the core's `tiers.rs` went from 329 to 316 lines while gaining the floor and the last resort. `control.rs` is 80 new lines. The crate is 285 lines.

**Not moved yet:**
- `owners.rs` (types 26 to 28) and the issuance and proxy judgment (`view/issuance.rs`, `view/proxies.rs`). They use the view's placement machinery, which must first be exposed to the trait as data.
- `check_areas` and the area overlap checks; they still run in the core on the answers.

**Not yet written in code:** F421's pre-emption guarantee in the core, and the buyer-bait sentence. Both are enforced by the default cMIP's issuance code as before, but not by the core for other models.

**Verdicts F421 and F422 moved, in the tests (none in the published vectors):**
- **Area words are constitutional (F421, parameters of field 35):**
  - an area's words changed under that area's power: was in force, now invalid, `[0]` alone;
  - two areas' words, or an area's words with a layer's cMIP: the constitutional change rule alone;
  - an area's words with a judicial clause: `[0]` and `[4]`.
- **The release rule (F421, field 24):** a change under the clone rule now needs the constitutional change rule.
- **The refund terms (F421, field 17):** a by-share clone-rule test that changed them now changes nothing instead.
- **A rotation declaring a clone that changes only a judicial clause** is no longer a broken act (F421's list covers the judicial tier). No test pinned the old verdict.

Nine test clones used an area's words only as a convenient operational change. They now adopt a claims cMIP under the label's rule for Agreements, so the line-and-fork tests test what they did before.

**One reading I kept, and you should confirm** (question 1): "named again only by a constitutional clone" (rule 65) still means a clone changing the constitution beyond the judicial tier, as in draft 17. Read with F421's whole list, a member's old signature on a judicial clone would bring them back after they left.

## Vectors (step 4)

Regenerated after phase two: byte for byte unchanged since phase one, 514 cases, no verdict moved. **Not yet added:** a model not held, no model, a model reaching the constitution, a judge swapped by a majority, dilution without pre-emption, the buyer bait. The READMEs do not yet describe field 35.

## For the Dubsar Suite

**The binding (`mor-wasm`):**
- it holds the default model and reads terms through `mor_control::decode`;
- `agreementsPowersNeeded` asks the held models;
- **new:** `agreementsControlPack(payload)` moves a collective's legacy keys 20, 30, 32 and 34 into field 35 `[defaultCmip, {20, 30, 32, 34}]`.

**Apps that build collective terms with field 34** (areas), 20, 30 or 32 now produce payloads the core refuses ("terms fields 20, 30, 32 and 34 are a control model's parameters"). They need one call to `agreementsControlPack` before signing. I did not change `clients/`.

**Also changed:**
- The JSON shapes the binding returns are unchanged so far: `areas`, `areaWords`, `holdersRules` and `issuesUnder` are now the model's answers.
- `wasm/README.md` is not yet updated.
- The suite's reader line (draft 18) is already on the branch (`460b3fb`).
- The default cMIP's handover in its text predates the code; to be updated with this list.

## Edubba on the default cMIP

Not checked. Edubba founds collectives with areas, so until it calls `agreementsControlPack` its foundings are refused. This is an app-side change, not this session's.

## Questions

1. **"Named again" (rule 65)** under F421's list. *Lean:* keep draft 17's reading, a clone changing the constitution beyond the judicial tier, and say so in rule 65. *Cost:* one clause.
2. **Is a judicial clause also "constitutional"?** F421's list includes fields 3, 6, 9, 13, 16 and 21; F422's rule 67 treats them as the judicial tier.
   - *Built:* a clone changing only a keeper names `[4]` alone, as in draft 17; with another constitutional change, `[0]` and `[4]`.
   - *Alternative:* `[0]` and `[4]` always.
   - *Lean:* as built, and one sentence in rule 98.3: "the judicial tier's fields need the judicial tier's rule, and the constitutional change rule only where the clone also changes another field of the constitution".
3. **The third reading's money gaps** (dilution with a one-block period; a one-millionth holders' rule binding departed founders, not shown at founding). *Lean:* client conformance at founding (show every holders' rule and issuance term, Money first), and a floor on the pre-emption period expressed on the time reference. Whether a floor is a rule or a stated cost is for Nobody, allegedly.

## Releases, the box and CI

- **Releases:** not rebuilt. The core and the WebAssembly changed, so the six must be rebuilt before this branch can merge.
- **`scripts/c-box/make-c-box.sh`:** not rerun this session after the texts changed; to rerun before the third box.
- **CI:** not yet read on these heads. Locally, every test in the workspace passes, the vectors regenerate byte for byte, and the Python check agrees.

## What remains, in order

1. Issuance, proxies and `owners.rs` into the crate, with the line exposed as data; `check_areas` with them. The core's pre-emption and buyer-bait guarantees for any model.
2. The six new vectors; both READMEs on field 35.
3. `wasm/README.md`'s "For the Dubsar Suite"; the default cMIP's handover.
4. Merge main, rebuild the six releases, CI green, then stop for "preparing to merge".
