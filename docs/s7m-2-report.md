# S7m-2 report: the trim, second part

**Stopped at a clean point after step 1 (F421's sentences written into the texts). The code (steps 3 to 6) is not done: no file under `core/`, `wasm/` or `cmips/control` changed, so no release needed rebuilding and the final merge of main was not started.** Main was merged into the branch first (`4f1bd7e`, F421 and Fable's review). Branch `claude/s7m-the-trim`, pull request 121, not to be merged. No finding of mine: F422 unused.

## In plain words

The constitution is back in the core, in Fable's words. A collective's constitution covers its members, words, keepers, clock, absence clause, key grammar, judges, succession plans, refund terms, layers, chain of judgment, departed members, release rule and its control model with its parameters, plus its split agreement. All of it changes only under the collective's constitutional change rule, and a control model can neither name a power for any of it nor add one. A model now governs everyday acts and operational changes, and nothing else.

Pre-emption is a core guarantee. The way back after a broken collective is read along constitutional clones alone. Entering a publication is an Agreements-layer act. The publications stated cost and the buyer bait are back in the core.

The code is where this session stopped: question 1 below has to be decided before the models can move.

## The sentences written

- **Draft 18, rule 98:**
  - **98.2:** pre-emption, as Fable words it.
  - **98.3:** Fable's constitutional change, replacing the definition and striking the exception, with an italic line naming the fields.
  - **Guarantees:** entering a publication or any agreement is an Agreements-layer act, never a model's power alone.
  - **"Not held" paragraph:** the way out and "broken" are read along constitutional clones alone, and the client-conformance line "a client acting for or reading a collective holds the default control cMIP".
- **Draft 18, rule 99:**
  - a model's refusal of a change of field 35 is void;
  - the queries (an area's id, holders, number and reach; the parties a power is counted among);
  - "it names no power for a constitutional change, and adds none".
- **Draft 18, elsewhere:**
  - keepers (rule 36), plans (rule 81), the chain of judgment (rule 35) and the split agreement (rule 15) now change under the constitutional change rule;
  - beside rule 48: the buyer bait's sentence, and "prices, partners and publications are no owners' matter…" with its stated cost.
- **The default cMIP:**
  - every constitutional field's row in rule 62 is now "the core's, under the constitutional change rule alone";
  - rule 64.1 points to the core;
  - rule 67 keeps only the judicial tasks of field 2 (9, 10, 11);
  - a sentence makes every rule about a constitutional field a pointer to Agreements rule 98;
  - field 17 can no longer be named by an area.
- **MICS v31:** the constitution, pre-emption, the model's scope, the queries, the client line, the stated cost and the buyer bait.
- **Suite v31:**
  - Steps 3.7c, 3.7d, 3.7e, 3.7f and 3.7l are rewritten where F421 moves their verdicts: the refund terms, keepers and arbitrators are now constitutional.
  - The label's "Releases" area now reaches publications and the claims cMIP (task 13), no longer the refund terms.
  - New steps: 3.7ar (a model taking the constitution, refused; S7m's corner moves back), 3.7as (dilution without pre-emption counts for nothing) and 3.7at (the buyer bait).

**The hostile reading's six successes and two ambiguities, checked on paper against the result:**

1. The judicial clauses handed to one member: **closed.** Fields 3, 6, 9, 13, 16 and 21 are constitutional.
2. Dilution: **closed** by pre-emption in rule 98.2.
3. Parameter changes escaping `[0]`: **closed.** The exception is struck, and field 35's parameters are constitutional.
4. A publication paying a member's company: **stated**, not closed, as F421 intends (the stated cost beside rule 48).
5. The buyer bait: **closed** by the part-two sentence.
6. A keeper or clock chosen by one member: **closed** with 1 for fields 3 and 6. *Field 2's judicial tasks remain; see question 2.*

The ambiguities:
- A model adding powers to a constitutional clone: **closed** ("names no power for it and adds none").
- A model refusing a change of field 35: **closed** (void).

The stranger's leaks:
- **e: closed** by the "constitutional clones alone" sentence.
- **i: stated**, in the core.

## The second hostile reading

A subagent limited to draft 18, the MICS v31 and the default cMIP wrote the worst model it could ("founders-friendly"). It tried three things:
- one member's area over field 2's judging tasks and over extensions;
- a holders' rule of one millionth, "whatever the parameters say";
- an issuance offer of its own with a one-block period.

**Blocked:**
- clawback on leaving (rule 98.2);
- moving the stake through an area (rule 8);
- paying one holder unlike the others;
- areas reaching records, resignations, forks or closings;
- every listed constitutional field: the model, keepers, arbitrators, field 6, the abandonment clause, the chain of judgment.

**Still succeeds:**
1. **Choosing the clock or a judge alone through field 2's judicial tasks** (9, 10, 11; and 14 by rule 60's wording), where field 6 is absent. This is question 2; the MICS already says the opposite of the MIR here.
2. **A judge swapped by tacking it onto a constitutional change, where field 18 is below everyone.** This is F421's own consequence: "a model adds no power", so `[4]` no longer joins `[0]`. *Fixed in the texts:* the default cMIP's rule 66, a reasoning bullet and a scenario still said "both". Whether the constitution should keep "every member for a judge" whatever field 18 says is question 4.
3. **Paying holders less or selling works under a tiny holders' rule.** Whether a holder accepted a rule, and what the rule says, is answered by the model from parameters the core cannot read, and the members can change those parameters under `[0]`. Question 4.

**Ambiguous:**
- "Offered" and "reached" in pre-emption are undefined in the core (question 5).
- A model's refusal of a constitutional clone other than field 35's. *Fixed:* a model is never asked about a constitutional change, so any refusal of one is void.
- Extensions adopted by one area holder.
- Area holders moving along the line by the model's own acts.
- Absence proof via field 2's task 14.

**Two verifiers can still disagree on what the way out reads** (question 6):
- stepping down and an area's freeze read who holds an area from the model;
- a fork whose kept holders consented under a holders' rule;
- "broken" read along constitutional clones, against rule 69's parent requirement when an operational clone was recorded in between;
- a rollback that also changes operational fields is unknown without the model.

**The default cMIP, read literally:** it let proxies vote on a constitutional change counted among holders (*fixed*: never on a constitutional change). Rules 64.3, 68 and 95.4 still restate the core's rules, covered by section 1's pointer.

**Texts at odds:**
- rule 48's "unless the agreement pre-authorised it" against rule 98.2;
- rule 98.2's "signs it" against rule 99's "or a rule that holder accepted";
- the MICS on the split agreement (*fixed*: constitutional).

## The code: not moved

`cmips/control` does not exist yet. `tiers.rs`, `owners.rs`, `view/issuance.rs`, `view/proxies.rs`, the area parser and the area checks are still in `core/src/agreements/`. The core still judges collectives as draft 17 did, so the texts are now ahead of the code on F421's points: the refund terms and field 2's judges. Vectors, the binding and the releases are unchanged: 516 cases, all verdicts as on main.

**What stopped it** is a fork in the code's shape, which I did not want to decide by default:
- The models live as typed fields of the core's `Terms` (`areas`, `area_words`, `holders_rules`, `issues_under`), encoded by `Terms::to_map`.
- About 700 call sites in the core's tests, the vector generator and the binding build terms through it.
- Moving these fields behind an opaque field 35 means the core can no longer encode or decode them. Every test, vector and binding call that builds a collective with areas must then go through the cMIP crate to pack its parameters, and the view must ask a held model to read them back. See question 1.

**The plan, once question 1 is decided:**

1. **Core.**
   - `agreements::control`: a `ControlModel` trait shaped like `ProofChecker`, with three parts:
     - `read(params) -> Verdict<Answers>`, the queries: areas as `Area` (id, holders, number, reach), holders' rules and issues under;
     - `clone_powers(parent, clone, line) -> Verdict<Vec<Power>>`, asked only for a clone making no constitutional change;
     - `rollback_extra`.
   - The core's floor: `constitutional_change(parent, clone)` over fields 0, 1, 3, 5, 6, 9, 12, 13, 16, 17, 18, 19, 21, 22, 24 and 35, giving `[0]` alone and never asking a model.
   - The last resort with no model: `[0]` for every clone, `[6, layer]` for a clone touching only field 2 or 15 entries, and the layer rule for acts.
   - Unknown when the model is not held, for the acts and clones that need it, never for the way out.
   - Field 35 is decoded raw; fields 20, 30, 32 and 34 leave the terms parser.
   - `AgreementsView::terms()` fills the answers from the held model, the one place terms are loaded.
2. **The crate `cmips/control`.**
   - It takes the area, holders-entry and issues-under codecs and `check_areas` from `formats.rs`, `tiers.rs` (the tiers adjusted only by F421's list), and `owners.rs` (types 26 to 28 under the cMIP's own specification hash).
   - It also takes the issuance and proxy judgment. These use the view's placement machinery, so the line (the roster at a line, what it placed) is exposed to the trait as data.
   - Its tests come from `core/tests/agreements_draft_14.rs` and the area tests of `agreements_collective.rs`. The core's integration tests and the generator take it as a dev-dependency (one `mor_core` build, as for integration tests); `install(&mut Terms)` packs the parameters.
3. **Vectors.**
   - The four area cases change bytes (field 34 into field 35); their verdicts stay.
   - New cases: a model not held, no model, a model reaching the constitution, dilution without pre-emption, and the buyer bait.
   - Verdicts F421 moves: a clone changing the refund terms, a keeper or an arbitrator under an area or the judicial tier's power. No published case covers these today.
4. **The binding and the apps:**
   - terms JSON gains `control: [cmip, params]` and loses `areas`, `areaWords`, `holdersRules` and `issuesUnder`, which become the default cMIP's parameters;
   - the tiers and owners exports move;
   - Edubba is checked on the default cMIP;
   - then the six releases are rebuilt, and CI is checked.

## For the Dubsar Suite

Nothing changed in the binding this session. The default cMIP's text is updated for F421: constitutional fields are the core's, and areas no longer reach the refund terms. Its handover still holds: the crate does not exist yet. The apps' display strings citing Agreements rules 64, 67 and 94 to 96 still resolve through draft 18's pointers.

**One app needs a line:** `clients/reader/src/mirs.ts` pins Agreements draft 17, and its test requires the newest draft. It should name `MIR-agreements-draft-18.md`. CI fails on it until then.

## Edubba on the default cMIP

Not testable until the code moves. One thing to watch: any Edubba collective whose area reaches the refund terms (field 17), or whose operational clone changes keepers or judges, gets a different verdict under F421. That is F421's decision, not a regression.

## Questions (for the MOR lead and Fable)

1. **The shape of a control model's parameters in the code.**
   - *(a)* Opaque parameters. The model's `read` returns typed answers in core types (`Area`, holders entries); the core encodes and decodes none of it; every test, vector and binding call that builds a collective with areas goes through the crate's `install`. That is about 700 encode sites, mostly through helpers.
   - *(b)* The core defines the encoding of the queries' answers (areas, holders' rules) and reads them from the parameters itself; a model only names powers and judges issuance. This is much less churn, but the area format is back in the core: a model's field, in the core.
   - *Lean:* (a), the only one that is a boundary.
   - *Cost:* one full session of mechanical migration before any logic moves.
2. **Field 2's judicial tasks** (9 condition evaluation, 10 time reference, 11 anchoring) are not in F421's list.
   - Field 6 (the time reference) and field 9 (absence proof) are, but a condition cMIP or an anchoring cMIP named in field 2 can still be changed by a power a model names. The default cMIP keeps them at every member (its rule 67); another model need not.
   - *Options:* (a) add "field 2's entries for tasks 9, 10 and 11" to the constitution; (b) leave them to models, a stated cost.
   - *Lean:* (a), since they decide who wins a dispute, as Fable's principle says.
   - *Cost:* one more clause in the list.
3. **A judge and the constitution together.** Under F421, a clone changing the constitution and a judge needs `[0]` alone. Where field 18 is below every member, a majority can swap a judge by adding a one-word change, which draft 17's rule 64.1 had stopped.
   - *Options:* (a) add to rule 98 "a change of fields 3, 6, 9, 13, 16 or 21 needs every member whose voice remains, whatever field 18 says"; (b) leave it to field 18, a stated cost.
   - *Lean:* (a), as the old judicial tier did.
4. **The core cannot read the holders' rule.**
   - Today it lives in the model's parameters, so "a rule binding only holders who accepted it" is checked on the model's word.
   - *Options:* (a) the holders' rule of a collective's stake becomes a core query answer (rule 99), shown to a buyer at purchase, and a change of it binds no departed holder without its signature (rule 45 already asks every holder of the stake to sign a change of it); (b) move it back to a core field.
   - *Lean:* (a); the question is whether rule 45's "every holder signs a change of it" is enough once the parameters are constitutional.
5. **"Offered" and "reached" in pre-emption.** *Lean:* define them in rule 98.2 as the default cMIP's issuance does: public or sealed to the holder, its period on the agreement's time reference, a take-up placed by the line or anchored.
6. **What the way out reads from a model.** Who holds an area, for stepping down and an area's freeze; and the agreement in force when an operational clone sits between constitutional ones.
   - *Lean:* stepping down judged without the area's holders: any member may step down from any area id its terms name, and a step-down by a non-holder changes nothing.
   - *Lean:* rule 69's parent read as "the latest constitutional clone, or any clone recorded after it".
7. **Field 24's name.** Fable's review calls field 24 "the holders' rule of the stake in itself". In the texts, field 24 is the release rule. I wrote it as the release rule. Please confirm that was meant.

## Checks

- `scripts/c-box/make-c-box.sh` into a scratch folder: it refused nothing (8 texts, 12 vector files).
- Locally:
  - `cargo test -p mor-core --test spec_texts` passes;
  - `clients/assess` passes 60 of 60.
- No core or WebAssembly change, so the releases need no rebuild.
- **CI on pull request 121, checked myself** (runs 1368 to 1370):
  - every step green but one: `clients/reader`, test 8, "the texts shipped are the newest draft of each MIR under spec/";
  - `clients/reader/src/mirs.ts` lists `MIR-agreements-draft-17.md`, and draft 18 is now the newest;
  - **a one-line change in `clients/` (`'MIR-agreements-draft-17.md'` to `'MIR-agreements-draft-18.md'`), not mine to make: for the Dubsar Suite, before this branch can be green.**
  - The regtest job, the reproducible display client and the vectors are green.

Draft 18 is now 81,001 words (65,513 without italics); the say-it-once pass is a later texts session.
