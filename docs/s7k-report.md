**Done. The WebAssembly changes, and so do two binding answers (`agreementsRelease`, and through it `agreementsClosing`, under a declared every-holder rule): rebuild the releases after this commit.** Texts final; Ummia's pinned hashes in "Checks"; three questions for the MOR lead below.

# S7k: the last text points before the redesign's second merge

*Session S7k, 1 November 2026, on `claude/s7i-routes` (pull request 116), beside the Dubsar Suite's round 10. Only `spec/`, `core/` and `docs/` touched; no web release rebuilt. This session records no finding of its own: F416 stays free.*

## In plain words

- **An owner held at a contested position can now leave.** A thief with the chain key, plus one home that receipts both rotations, could keep an identity stuck for good. The owner can now sign one escape that abandons both rotations. The core already counted it, so only the texts changed. Fable's four cases are now vectors.
- **Under a declared every-holder rule, members sign too.** This applies to a sale or release of a collective's work and to a version of its split agreement. A core change.
- **A bare-key payer through a route has no standing**, as directly. This also corrects a sentence of mine from S7j that said otherwise.
- **Several claims of the first hop:** any one citing the tag counts, as built.

## 1. The escape on a standing contest (F414, decided by Nobody, allegedly)

- **Texts (Identity), in Fable's sentences:**
  - rule 29's second exception: a position contested by two rotations revealing the same chain key, wherever served, at a self-hosted home or where one home's conflict leaves the others short of the rule;
  - the conformance paragraph ("for a contested position", "at a self-hosted home" dropped);
  - section 11's sentence;
  - line 70 and rule 44's stated cost: "until the owner leaves by the escape (section 11)".
  - The suite's 7d says it too.
- **Core:** no change. It already counts an endorsed homeless rotation at a position where nothing counts under the old rule, its abandoned rotations never counting.
- **Fable's four vectors** (two homes, a rule of two, one home receipting the owner's rotation and the rival):
  - contested at the position;
  - the escape, endorsed, abandoning both, receipted by its new home: counts;
  - the same with no endorsement, the honest old home objecting: void;
  - a verifier without the endorsement: contested.
- *Found while writing them:* the escape's own home rule must fit its new homes (rotation check 5). A rule of two carried onto one new home makes it no rotation at all, so the vector declares the rule for its one new home.

## 2. Taken under delegation (F414)

- **A declared every-holder rule:**
  - *Texts:* rules 48, 94 and 95 follow rule 65, and rule 64 item 4 names it, one sentence each. Where field 30 declares every holder, every holder at the line signs, members too, under `[5, stake]`. The default (field 30 silent) is unchanged.
  - *Core:* `owners_consent` (owning.rs: a release or transfer of a work, rule 95) and the split agreement's owners' matter (publishing.rs, rule 94) ask members too where the rule is declared.
  - *Test:* `s7k_a_declared_every_holder_rule_asks_every_holder_members_too`.
- **A bare-key payer** (rule 13 and the contest paragraph):
  - My S7j sentence ("a first payer committing only a bare key contests by a claim carrying that key's signature") contradicted the same paragraph's rule (no buyer who can contest), rule 13 and the core. It now says that such a payer has no buyer's standing, as above.
  - Rule 13's sentence matches: a bare-key first payer signs nothing onto the vow, and the purchase is the conversion service's own (Money rule 24). This is how the core reads it.
  - *Question 1 below* asks whether bare-key payers should have standing.
- **Several claims of the first hop** (Money rule 24): any one, valid on its rail and citing the tag version, makes the first payer the buyer, whatever the others cite. As built.

## Vectors

- 505 verdict cases, 4 new.
- Every earlier case keeps its verdict, acts and ids.
- Both READMEs and the c-box's are updated.
- The Python check: all 276 agree, 98 verdict cases judged.

## For the Dubsar Suite

- **The WebAssembly changes** (rebuild after this commit), and so do two binding answers:
  - `agreementsRelease`: under a declared every-holder rule, a release of a collective's work now waits for every holder, members too. It completed with the holders who are no members. A transfer of its stake in a work likewise (no binding of its own; it reaches `agreementsClosing`'s "holds nothing").
  - `agreementsPublication`, for a version of a collective's split agreement that is an owners' matter: the same, though the judicial tier already asks every member there, so the answer moves only where a member's signature counted there by other means.
  - Nothing else in the binding moves: the escape, rule 13, the contest and the route buyer read as before.
  - `wasm/README.md` was off limits this session: these lines are for it.
- **The air-gapped Module** (`modules/airgap`, yours). Its code already opens the escape on a competing rotation at any homes: `check_competing` and `standing` do not ask for a self-hosted home. What must change:
  - the summary's words for `Exception::EscapeContested` ("the position is contested at a self-hosted home"): say "the position is contested by two rotations revealing this key";
  - the doc comments on `EscapeContested` and `check_competing`, and the README, which name a self-hosted home;
  - a test in `tests/rule_29.rs` for a contest at two homes, a rule of two, one home receipting both: the competing rotation opens the escape, and without it, the escape is refused.
- **Ummia's pinned hashes**, final for these texts: see Checks.

## Questions

1. **A declared every-holder rule is now not the same rule as the default.**
   - *Plain words:* under a declared every-holder rule, every holder signs, members too; under the default (field 30 silent), members consent through the collective's own rules. But the working rule says a default is always one of the declared options, never a third rule. And Agreements says the default is the forced one of the declared options, `[0]`.
   - *Options:*
     - (a) the default becomes the declared form: every holder signs, members too, wherever the rule is every holder. This changes rule 48's reading for every collective with no field 30, and moves vectors and tests;
     - (b) name the default as a form of its own (members through the collective's rules) and drop "one of the declared options" and "(the default)" beside `[0]`;
     - (c) a declared `[0]` reads as the default (members through the collective's rules), reverting this session's sentences in rules 48, 94, 95 and 65.
   - *Lean:* (a), for one rule only. *Cost:* the most work, and members of every collective sign their own owners' matters.
2. **Does a rule 40 contest open the escape too?** Two competing rotations, each missing the home rule, are also two rotations revealing one chain key.
   - Fable's condition reads "wherever they were served", but rule 29, section 11 and line 70 list only the self-hosted and rule 44 cases.
   - *Lean:* yes, one more item in each list. The core already counts an endorsed escape wherever nothing counts under the old rule.
3. **What the Module's check proves:** a competing rotation's bytes prove a rival exists, not that the position is contested.
   - So a Module could sign an escape that abandons a rotation which counts. Both keys are the owner's, so this harms nobody but the owner.
   - *Lean:* a stated cost beside rule 29's conformance paragraph.
4. **Should a bare-key payer have standing?**
   - *Plain words:* a buyer who paid without naming an identity, giving only a one-time key for refunds, cannot contest a sale or confirm a vow, directly or through a route. They can be refunded.
   - *Options:* (a) as now: no standing (the stated cost of rule 22); (b) standing by a claim carrying that key's signature (key 8), as for refunds.
   - *Lean:* (a) for MOR 1.
   - *Cost of (b):* the contest and the vow's sale read key-8 claims, and a one-time key's contests are shown publicly.

## The stranger's reading

A subagent read only the eight texts, this session's diff and the five new cases.
- **4 agree, 1 differed:** the declared every-holder release, against rule 95's item 3. That item still said "each holder who is no member"; it now carries the declared case.
- **Its points, fixed in the texts:**
  - rule 42 (an act bound to a contested rotation, pending until the escape too);
  - line 70 rewritten (the escape as soon as one home's conflict leaves the others short, proven or not);
  - section 11's "In short" and the MICS's row;
  - rule 64 item 4 ("where field 30 declares every holder");
  - field 30's share condition (a rule by share);
  - rule 95's lead-in (`[5, stake]` in a clone's mark, signature acts otherwise);
  - Money rule 24: several claims, each a buyer's claim, "astray" only where none cites the tag, and a bare-key first payer never the buyer;
  - the contest paragraph's list of when the service is the buyer;
  - rule 13's clause;
  - the suite's 7d (the conflict may also end by step 2).
  - Case 4's explanation now says that the verifier reached both old homes.
- **Questions:** 1 to 3 above.

## Checks

- `cargo test --workspace`: green (core, relay, harness, the WebAssembly crate).
- `python3 core/vectors/check.py`: all 276 agree, 98 verdict cases judged.
- The generator gives the same bytes again.
- `scripts/c-box/make-c-box.sh`: 8 texts, 12 vector files.
- No finding number or review label is in the texts.
- **Ummia's pinned hashes, final for these texts** (`clients/ummia/src/cards.ts`):
  - `MICS_HASH = 'c9d7f5cba40f00f3cb184e7c1b50bbbea11c4cbf677d5fc59b76ce764d9bd788'`
  - `SUITE_HASH = 'd073424439a15ed815a424cfcc6659025d5272b0231e7b82c36ff0c5f04df254'`
- GitHub: not read by me this session; the suite's final rebuild runs it.
