# S7m report: the trim

**Stopped at a clean point after steps 1 to 5 (the texts). Steps 6 and 7 (the core, the vectors, the binding, the web releases) are not done; no code changed, so no release needed rebuilding and the final merge of main was not started.** Branch `claude/s7m-the-trim`, draft pull request 121, not to be merged.

## In plain words

Agreements is rewritten in four parts, with no rule moved by accident: the grammar of agreeing; what others relied on stands; the way out; and the deciders. The deciders part says two things. First, what the core decides itself whatever any module says (new rule 98, the last resort). Second, what a "control model" is (new rule 99): a cMIP a collective names, which may say which powers its everyday acts and its clones need, and which may never touch the way out, what others relied on, or the last resort. Today's tiers, areas, owners' matters, issuance and proxies moved, word for word, into the first such cMIP, the default one, so a collective that names it works as before.

The texts are done. The code is not: the models run through about ten thousand lines of the core's view, and moving them behind the new boundary is a session of its own (see "What remains"). The size went down less than hoped. Moving the models out was the smaller half; the larger half is a pass that says each rule once, and that pass has not been done.

## The four parts, and the size

`spec/MIR-agreements-draft-18.md`:

- **Part one, the grammar of agreeing**: rules 1 to 14 and 45, 46, 49 to 54 (making, claims, stakes and transfers, publications and the purchase, clones and marks, contests, standing, the negotiation record); 56 to 59 and 72 (a collective as an identity its members act for); 73 to 75 (grants); 65 (counting a consent).
- **Part two, what others relied on stands**: keepers (36 to 44); "Made before, made after" (the collective's line); 76 to 80 (a grant's fate); 90 (forks of records); legible money (15 to 32); 48 (no stake moved or reduced without its holder).
- **Part three, the way out**: 69 (changing members); 70 and 71 (leaving, leaving an area); 81 to 84 (succession); 91 and 92 (fork, closing); 93 (a broken collective's way back); 55 (public domain).
- **Part four, the deciders**: **rule 98, the last resort** (every party of a deal; the holder alone; the constitutional rule for membership and the way out; a vanished party's two outcomes; the layer rule), with 47, 60, 61 and 85 to 89. Then the tasks handed to cMIPs: 33 to 35, the task list, and **rule 99, control models**. Section 23 keeps each moved number (62 to 64, 66 to 68, 94 to 97) as a one-line pointer to the default cMIP.
- Then the formats (Part five) and the reasoning and freeze scenarios (Part six).

Rule numbers are unchanged: other MIRs and the apps cite them.

**Size** (one count for both files: words, then words with italic spans removed):

| | with italics | without |
| --- | --- | --- |
| Draft 17 | 89,677 | 70,922 |
| Draft 18 | 80,450 (about) | 65,000 (about) |
| Default control cMIP | 11,860 | 9,182 |

Fable's estimate was about 50,000 and 35,000. To get there, the rules have to be read one by one and each said once: the glossary restating rules, the "how it runs most of the time" paragraphs, and the formats re-explaining the rules. This pass removed only the "*In short*" summaries. **Not done; it is the main thing left on the texts.**

## What left the core, and where it went

To `cmips/cmip-collective-control-draft-1.md`, verbatim, except that a field these rules read from the terms is now a parameter with the same number:

- rules 62 to 64 and 66 to 68 (tiers, what a clone changes, which powers it needs, protections, the judicial tier, departed holders);
- rules 94 to 97 (the holders' rule, the owners' matters, issuance with pre-emption, proxies);
- the areas: terms fields 34 and 20, the `area` and `field-ref` formats, rule 60's area paragraphs, and the terms' area checks;
- field 30 (holders' rules) and field 32 (issues under), as parameters 30 and 32;
- types 26 to 28 (the issuance offer, a proxy, a proxy's revocation), now the cMIP's own acts;
- the glossary entries (tier, protected clause, change rules, area, holders' rule, owners' matters, issuance, proxy);
- eight reasoning bullets, and the "Tiers and clones" and owners' freeze scenarios.

New in the terms: **field 35, the control model, `[cmip, params]`** (only in a collective). The mark keeps the powers `[1]`, `[2, area]`, `[4]` and `[5, stake]` in its grammar; what each means is the model's.

**Not moved: rule 22 (role shares with evidence) and rule 29 (attention).** See question 5.

## The boundary (rule 99)

- **What a control model accepts:** the collective's agreement in force (with the model's parameters); for a clone, the parent and the clone; the collective's line (who still has a voice, who holds the stakes there); and the act or clone.
- **What it produces:** for an act, whether an area reaches it, and if so who that power is counted among and by what rule. For a clone, the powers it needs, each with who it is counted among and its rule, and whether holders consenting together stand in for each holder's signature. Or "refused", or "unknown".
- **The core counts; the model never does.** Every power the model names is counted by rule 65 and checked in the mark by rule 46. This is the same pattern `proofs.rs` uses for a proven delivery's checker.
- **What it may never decide:** anything in parts two and three; the last resort; who signed; a clock; a proof of absence. An answer that reaches any of these is refused, and the core judges alone.

## The sentences that stayed as guarantees (rule 98)

- Membership and the way out change only under the constitutional change rule (every member by default), and a holder paid less signs.
- No sale or release of a stake a collective holds counts without the consent of the holders who have no say. Each signs, or they consent together under a rule that binds only holders who accepted it.
- Nothing reaches what one holder is paid unlike the others.
- A role share paid is on the record.
- **A collective whose control model's cMIP a verifier does not hold is judged under the constitutional rule alone for its way out.** The way out is listed: resignation, stepping down, a plan's succession, absence, a fork or closing, a rollback that copies the agreement before the break, a holder's own transfer, and owners' release. Every other act whose power the model decides is unknown to that verifier.
- A collective naming no control model is judged by the last resort alone.
- "A constitutional change" (fields 0, 1, 5, 12, 18, 19, 22, 35) is read by the core alone, never by a model. So whether a collective is broken never depends on a model.

## The MICS and the suite

- **MICS v31**: the Agreements paragraph names the four parts and the tasks. "Owners" and "Three tiers" are replaced by "Who decides what the terms did not write". The glossary is updated. The layers are unchanged.
- **Suite v31**:
  - Section 3's model steps (7c to 7f, 7l, 7ab to 7ad, 7aj, 7ak) moved under a new section "3b", run against the default cMIP; the tiers, areas and owners' items moved under a checklist heading "The default control cMIP".
  - New steps: 3.7ao (the way out with the model not held), 3.7ap (no model: the last resort), 3.7aq (a model that tries to decide the way out, refused).
- **Fable's scars**: each is still answered by a core step (stolen key, 1.9g and 3.7z; race and double count, Money's; vanished member, 3.7k and 3.8; thief before rotation, 3.7o; unmeetable rule, 3.7w and now 3.7ao; co-owned sale, scenario 2; vanishing seller, the rule 30 steps; bypass, the split steps; "25% of nothing", 3.9ah, a core guarantee now; stolen grant key, 3.9r). See the stranger's reading below for its own check.

## Vectors and the binding

None changed: the core did not change. On the next session's plan, four published cases (field 34's areas, and a grant within an area) change bytes because field 34 moves into field 35's parameters, and the vectors for the new sentence and the boundary are still to be written. Below, "For the Dubsar Suite" lists what the binding will change.

## For the Dubsar Suite

- **The default cMIP** is `cmips/cmip-collective-control-draft-1.md`, with its own "For the Dubsar Suite" handover. The MOR Law Firm team owns it once merged. Its crate `cmips/control` does not exist yet: the code is still in `core/src/agreements/` (`tiers.rs`, `owners.rs`, `view/issuance.rs`, `view/proxies.rs`, and the areas inside `view.rs` and `formats.rs`).
- **Names the apps cite.** The apps cite these Agreements rule numbers in display text: assess (`assess.ts`: 64, 67, 94 to 96), desk (`grid.ts`: 64, 67) and collective (`explain.ts`). These numbers are now the default cMIP's. Draft 18 keeps each as a pointer, so assess's test that every cited rule is in the newest draft passes. **It failed until those pointers were added; `clients/` was not changed.**
- **What the binding will change, next session** (not yet done): terms with field 35 in place of 34, 20, 30 and 32; the types 26 to 28 under the cMIP's specification hash; and the areas and tiers exports moving behind the control-model checker. Edubba must run unchanged on the default cMIP; it can be checked only once the code moves.

## The two readings

**(a) A stranger** (a subagent limited to the eight texts and the default cMIP) told back the four parts correctly.

It found that every scar is still answered in the core, with two leaks:
- **(e) The broken collective's way back with the model not held.** Which agreement is in force rests on earlier clones, whose completeness may need the model's powers.
- **(i) A token price or a greedy partner through a publication.** This remains a stated cost that only the cMIP writes.

On whether the boundary can be built from the texts alone: partly. It named these gaps:
- there is no wire format for a model's answer, so in practice the verifier runs the model;
- "refused" has two meanings;
- "narrowing" is undefined;
- the act output names one power, while an act can belong to two layers;
- the core reads area holders, ids and reach (rules 65, 71, 83, grant field 5) without the task defining those queries;
- a split agreement's version, a publication, carries no mark to name `[5, stake]` in;
- `kind` is defined only in the cMIP.

**Fixed on this branch:**
- a deal's mark was made false by my new italic sentence (deals name `[1]`);
- with no model, a clone adopting a layer's cMIP now needs `[6, layer]`, not `[0]`;
- rule 99's "never decides" list now names absence, and says a model may name the power over keepers, judges and plans but never what they do;
- stale pointers in draft 18, the MICS and the suite.

**Left as listed:** suite steps 1.9e and 1.9g speak of a deal's "holders' rule (field 30)"; Money draft 11's "Agreements rule 96" (now a pointer).

**(b) A hostile reader** wrote the worst control model it could ("ops", held by one member) and tested it against the texts.

**Blocked:**
- gating any way-out act;
- gating the record that registers a departure;
- paying one holder unlike the others;
- hiding a role share;
- re-reading a past line;
- voiding an adopted grant act;
- undoing past keeper records.

**Succeeds** (each is a flaw to decide, not mine to fix):
1. **The judicial clauses are left to the model.** The model can hand the abandonment clause, its authority and the absence-proof cMIP to one member. That member's accomplice then declares the others absent, removes their voices, and shares out the stakes of any member with no named stake successor. This is the two-step attack the judicial tier existed for. **Question 4 below; my lean is now firmly to keep the judicial tier's sentence in the core.**
2. **Dilution.** A holders' rule of one millionth plus issuance with no pre-emption lets one member issue itself almost the whole stake. Rule 8 lets "an issuance a collective's control model allows" through, and pre-emption lives only in the default cMIP. **Question 9.**
3. **Changes to the parameters alone** escape `[0]`: areas are redrawn and words moved into the parameters by the model's own power. That is my own exception in rule 98.3, and it contradicts rule 71 and the definition of voice. **Question 3.**
4. **A publication paying a member's company 95%**: the stated cost "prices and publications are no owners' matter" is now only in the cMIP. **Question 10.**
5. **The buyer bait** (a transfer held back while the holders' rule changes) is older than this draft: rule 10 of draft 17 reads the same. **Question 11.**
6. **The future keeper or time reference chosen by one member's model power.** This follows from 1.

**Ambiguous:**
- whether a model may *add* powers to a constitutional clone; an added power is not covered by rule 61, so a vanished holder of it freezes the constitution;
- a model refusing every change of field 35 locks the collective into it, save by breaking the collective and rolling back.

**Checks:**
- With the model not held, a verifier can still be left unknown about the way out, indirectly, through which agreement is in force.
- Two honest verifiers could disagree on a fork whose kept holders consented under the model's rule, because "waits" read as incomplete. **Fixed:** the act is unknown, never incomplete.
- The default cMIP, read literally, answers for plan successions (its rule 64.3, which rule 83 duplicates), lets the holders' rule complete a fork (rule 95.4, which rule 98 sanctions), and reads receipts and clocks for issuance (rule 96), outside rule 99's "accepts" list.

**What the two readings show:** the boundary holds for the doors out themselves and for the record. It does not yet hold for the clauses that decide who is gone, nor for owners' consent and issuance, both of which the core handed out whole. Those two points are where Fable's "a module that holds the constitution holds the collective" bites, and they should be decided before any code moves.

## Questions (for the MOR lead and Fable, before anything is decided)

1. **An ordinary act whose power depends on a model the verifier does not hold.**
   - *Written:* unknown (rule 98), as for a specification it does not implement.
   - *Options:* (a) unknown, as written; (b) judge it under the layer rule, which lets two verifiers disagree wherever an area narrows the layer; (c) count nothing.
   - *Lean:* (a).
   - *Cost:* a client without the default cMIP sees most collectives' everyday acts as unknown, so clients need to hold the default cMIP (a client-conformance line not yet written).
2. **How a collective names its model.**
   - *Written:* a new terms field 35, `[cmip, params]`, as field 6 does for the time reference.
   - *Alternative:* a task number in field 2. That touches Development's task table, and field 2 carries no parameters.
   - *Lean:* field 35.
   - *Cost:* a one-way format door.
3. **One verdict that moves, in a corner.**
   - "Constitutional" is read by the core alone and includes any change of field 35, its parameters included. So a rotation declaring a clone that changes only area words, or only holders' rules, is not a broken act. In draft 17, it was.
   - No vector covers it.
   - *Alternative:* keep fields 20, 30 and 32 as terms fields only the model reads. This moves no verdict, but leaves model fields in the core's format.
   - *Lean:* as written, so that whether a collective is broken never depends on a model. **Needs a decision**, since a moved verdict is a bug unless decided.
4. **The judicial protections (now: whatever the model).** The hostile reading shows this is not only about collectives with no model.
   - *Written, following the prompt:* keepers, judges, the abandonment clause, succession plans, the chain of judgment and the collective's split agreement change under the constitutional change rule. That is every member by default, as before, but less if the founders chose less.
   - *Lean, the other way:* keep one core sentence, "a collective's judges and keepers change only with every member whose voice remains, whatever its model". Keepers underwrite what others relied on.
   - *Cost:* one more core sentence; the default cMIP is unchanged either way.
5. **Rules 22 and 29 (role shares, attention) were not moved.**
   - Money (the referral) and Development (the use record, the payer bound) point at rule 22's evidence.
   - Moving it means moving those pointers and changing the split cMIP, which is not this session's to change.
   - *Lean:* keep them in the core until the split cMIP's lead takes them, with Money's and Development's pointers, in one move.
6. **Rule 94 (the holders' rule).**
   - The prompt puts it in the cMIP; F416 and Fable keep "the holders' rule's grammar" in the core.
   - *Written:* the mechanism (field 30, which changes are owners' matters, proxies) is the cMIP's. The core keeps three things:
     - the counting forms (rule 65, by head and by share);
     - the last resort (each holder signs);
     - two guarantees: a rule binds only holders who accepted it, and changing one needs every holder of the stake.
   - Please confirm.
7. **Field 5 (the clone rule)** stays in the terms. In a collective, only the model reads it, and changing it is constitutional in the core (as in the default).
   - *Alternative:* move it to the parameters, which changes the bytes of every collective.
   - *Lean:* keep it.
8. **Money's pointer.** Money draft 11 lists "a take-up of an issuance (Agreements rule 96)". Draft 18's pointer keeps it readable. The suggested wording for Money's next draft is "(a control model's, Agreements rule 99)". No other MIR was changed.
9. **A floor under owners consenting together, and under issuance.**
    - The core accepts any rule binding only holders who accepted it, with no floor on its form.
    - *Options:* (a) pre-emption into the core (rule 8's exception only for a pre-emptive issuance) and a floor on the share (for example a majority of the stake); (b) leave forms free, and add client conformance showing at founding and at purchase who can consent for a holder.
    - *Lean:* (a) for pre-emption, (b) for the share.
10. **The publications stated cost** ("prices and publications are no owners' matter; owners are protected by sight and exit") moved with rule 95. It is true whatever the model, so it belongs back in the core, beside rule 48. *Lean:* move it back, as a sentence.
11. **The buyer bait** (older than this draft). *Lean:* a change to the rules binding a stake's holders, made after a transfer was signed and before the line placed it, binds that buyer only with its signature.
12. **Powers a model adds to a constitutional clone.**
    - *Options:* (a) forbid models from adding any power to a constitutional change, and from refusing a change of field 35; (b) allow it, with rule 61 coverage for every added power.
    - *Lean:* (a). Constitutional changes are the core's, all the way.
13. **What the boundary must expose** so that the core can judge stepping down, succession and grants within an area by itself: the holders, id, number and reach of an area, and the list of parties a power is counted among. With these, the task can be built from the texts alone. Write them into rule 99 as queries the model answers. *Lean:* yes, next texts pass.
14. **The size.** A pass that says each rule once is needed to reach Fable's estimate. Should it be the next texts session, or folded into the code session?

## What remains

1. **The code (step 6).**
   - In the core: `agreements::control`, a `ControlModel` trait shaped like `ProofChecker`, with verdicts for an act and for a clone. Terms gain field 35, and fields 20, 30, 32 and 34 leave the terms parser.
   - In the core, the last resort: with no model, `[0]` for every clone and the layer rule for every act. Also the refusal of answers that reach the way out (the constitutional floor; the way-out acts never asked) and "unknown" when a model is not held.
   - The crate `cmips/control`: `tiers.rs`, `owners.rs`, the issuance and proxy logic, and area parsing, implementing the trait.
   - Its tests: from `core/tests/agreements_draft_14.rs`, and the area tests in `agreements_collective.rs`.
   - The obstacle is that `view/issuance.rs` and `view/proxies.rs` use the view's private placement machinery, so the boundary must expose the line (the roster, placement) as data.
2. **The vectors.** Regenerate the four area cases (bytes change; verdicts must not). Add cases for a model not held, an overreaching model, and no model. Update both READMEs and the Python check.
3. **The binding**, and Edubba on the default cMIP.
4. **The six web releases** rebuilt in the branch, then green on GitHub; then the final merge of main (to be announced first).
5. **The texts' say-it-once pass** (question 14).

## Checks

- `scripts/c-box/make-c-box.sh` into a scratch folder: it refused nothing (8 texts, 12 vector files). The box does not carry the default cMIP, which the suite now names.
- Locally:
  - `cargo test -p mor-core --test spec_texts` passes (the new texts have no final line break);
  - `clients/assess` passes 60 of 60 with the pointers (59 of 60 without).
- **GitHub CI on pull request 121** (read 4 November, 14:43 UTC, latest head `f8880a6`, run 1376): every step green but one.
  - The green steps include the Rust workspace, the vectors regenerated byte for byte, the Python check, every other client and module, the regtest job and the reproducible display client.
  - **`clients/reader` fails** its test "the texts shipped are the newest draft of each MIR under spec/": `clients/reader/src/mirs.ts` lists `MIR-agreements-draft-17.md`, and draft 18 is now the newest.
  - It is not a text matter, and not a flake: a one-line change in `clients/` (`'MIR-agreements-draft-17.md'` to `'MIR-agreements-draft-18.md'`), not this session's to make. It is for the Dubsar Suite, before the branch can be green.
