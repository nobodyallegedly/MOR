# S7m-6 report: the trim, last part

**Stopped at a clean point, before the final merge of main; not yet ready to merge.** Done:
- issuance and proxies into the crate, as decisions on facts the core reads;
- a model not held leaves the way out judged;
- nine new vectors, both READMEs, and the boundary's tests.

Not done:
- `owners.rs` and `check_areas` into the crate;
- the core checking the buyer bait, and checking that a model's "excused" holders accepted its rule;
- three of the asked vectors;
- the releases.

Branch `claude/s7m-the-trim`, pull request 121, not to be merged. No finding of my own; F426 unused.

## In plain words

The default control model now decides issuance and proxies the way it decides clones: the core reads the facts of the collective's line and hands them over, and the model answers. Nothing it decides changed. A verifier that doesn't hold a collective's model now still judges its constitution and way out, and answers unknown only where the model is needed. The new vectors pin that, and no earlier verdict moved.

What's left is a smaller piece of code, three vectors and the releases.

## The code moved, across all of S7m

**Into `cmips/control` (crate `mor-control`, 455 lines with its tests):**
- the default cMIP's parameter codec, `install`, `held`, `decode`;
- the operational allocation of a clone's powers (`lies_in`, `clone_powers`);
- **this part:**
  - issuance with pre-emption (`issuance.rs`): the old `issuance_at` judgment, unchanged in what it decides, over `IssuanceFacts` (roster, signatures, the offer's placement, reach, period, take-ups);
  - the proxy decision (rule 97), over `ProxyFacts` (the holder's own vote; its latest placed proxy, revoked or not).

**In the core (`core/src/agreements/`, 21,910 lines before S7m, 22,072 now):**
- `control.rs`: the trait, the line's design, the facts types, refusal of an overreaching answer;
- the terms parser with field 35;
- `tiers.rs` as the floor: the constitution, the judicial tier, the last resort;
- the view gathering the facts (`view/issuance.rs` now only reads; `view/proxies.rs` reads, then asks the collective's model).

**This part also:**
- a model the verifier does not hold no longer makes the collective's terms unknown: they are read without the model's answers. An everyday act's consent, an operational clone, an issuance or a proxy vote is unknown; the constitution and the way out are judged (rule 98);
- `drop_control` for a verifier holding none.

**Still in the core, to move:**
- `owners.rs`: the formats of types 26 to 28, still decoded as Agreements types; see question 1.
- `check_areas`: it runs in the core's terms check on the model's answers; see question 2.

**The core does not yet check, for a model other than the default:**
- **that a holder a model "excuses" from signing an issuance accepted the holders' rule** (rule 98.2). The default model excuses only under a rule by share the roster accepted, and the core still has every other holder whose share falls sign.
- **the buyer bait** (rule 48: a change to the holders' rules made between a transfer's signing and its placement binds the buyer only with its signature).

Both are new core logic that I did not write in this part.

## Vectors

**525 cases** (514 before S7m); the reader and the Python check agree (276 checked by Python). **No earlier verdict moved**: every earlier case keeps its acts' meaning and its verdict, 112 of them with new ids since S7m-3 (field 35).

**Added, 9 Agreements cases:**
- No control model:
  - a clone marked with the clone rule puts nothing in force;
  - marked with the constitutional change rule, every member signing, it is in force.
- A model not held:
  - an operational clone is unknown;
  - a constitutional clone adding a member is in force, judged without the model.
- A clone changing the constitution's words under a power a model names puts nothing in force (a model reaching the constitution, refused).
- A majority swapping a judge with a one-word constitutional change:
  - under the constitutional change rule alone, nothing in force;
  - with the judicial tier's rule too, every member signing, in force.
- An issuance under no holders' rule:
  - one holder not signing, nothing in force;
  - every holder signing, in force.

A new fact, `"control_models_held": false`, judges a case with no model held. A model's overreaching answer itself is tested in `cmips/control/tests/boundary.rs` (no published vector: a vector cannot hold a model).

**Not added:** an issuance under an accepted holders' rule (it needs an offer, its placement and its take-ups, a long chain of acts); one under a rule a holder never signed; the buyer bait (the core does not check it yet).

**Both READMEs** (`core/vectors/README.md`, `scripts/c-box/vectors-README.md`) describe field 35, the default cMIP, the new fact and the nine cases.

## Edubba

The suite's changes are on the branch: `encodeTerms` writes field 35, and the area rewording. With them, Edubba founds collectives naming the default cMIP. On `76a3a40`, the first head with them, Nakišib and site in WebKit went green where they were red. The main CI run on this part's head is not read yet; see CI.

## For the Dubsar Suite

`wasm/README.md`'s section "Agreements draft 18: control models" is current: field 35, `agreementsControlPack`, and what an app calls before signing. Nothing in the binding's names changed in this part.

## Questions

1. **Types 26 to 28** (issuance offer, proxy, revocation of a proxy) are decoded and checked as Agreements types; the text calls them the default cMIP's own acts. *Options:* (a) they move to the cMIP's specification, and the tests' acts migrate; (b) they stay Agreements types, numbered for the cMIP, and the text says so. *Lean:* (a), with the second model's act rule F425 settles (a model's own acts count where field 35 names it). It is one more migration.
2. **`check_areas`** is the default model's format check, run by the core on the answers. *Lean:* move it into the model's `read`, refusing parameters outside its format. The core's in-memory `Terms::check` then no longer sees areas; a handful of tests that build bad areas in memory would check through `mor_control::decode` instead.
3. **The core's check of "excused" and the buyer bait** for any model. *Lean:* the core verifies that each excused holder signed a version carrying the holders' rule, or bought under it; and that a change of the holders' rules placed after a transfer's signing and before its placement binds the buyer only by its signature. Both read only the core's own acts.

## Releases, the box and CI

- **Releases:** not rebuilt.
  - Next, in order: the final merge of main, which I will announce in the next report's first line before starting, so the MOR lead can write "preparing to merge"; then dispatching the six release workflows on this branch (display client, Dub, Kišib, Damgar, Ummia, Edubba); then CI green.
  - Main has not moved since `4f1bd7e`, which is merged.
- **`scripts/c-box/make-c-box.sh`** into a scratch folder: it refused nothing (8 texts, 12 vector files).
- **CI:** on `76a3a40`, Nakišib and site in WebKit green. The main "tests" run on this part's heads is to be read; locally, every test in the core, the crate and the binding passes, the vectors regenerate byte for byte, and the Python check agrees.

- **CI, read myself** (run 1394, head `81746bc`, S7m-5's last; read 4 November, 20:55 UTC):
  - every step green but two app steps: the Rust workspace, both vector steps, desk, Kišib, Damgar, Ummia, Dub, Edubba's paths through them, the regtest job (Damgar and the desk on regtest), the reproducible display client and the other apps;
  - **`clients/repo`**, test 13, "an ordinary change is recorded at once, without a rotation": the app changes its release area's words as an ordinary change, and its own check now refuses that ("not an ordinary change of the release area"). Under F421 an area's words are the control model's parameters, the constitution's, so this verdict moved by decision. The app's test is the suite's to update; I did not change `clients/`;
  - **`clients/collective`** and the display client's test 2: `mor_wasm_bg.wasm` differs from the released copy in `built/`, expected until the releases are rebuilt.

## What remains, in order

1. Questions 1 to 3 (types 26 to 28; `check_areas`; the core's excused and buyer-bait checks), and the three vectors that wait on them.
2. Read CI on this head.
3. Announce, then merge main, rebuild the six releases, green CI, and stop for "preparing to merge".
