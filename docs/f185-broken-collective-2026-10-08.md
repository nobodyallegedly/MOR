# F185 and F186: a broken collective, its way back, and two versions of one deal, 8 October 2026

*A building session after the step 11b fix (`docs/step-11b-false-mark-2026-10-08.md`), for Nobody, allegedly. It writes F185, as decided on 8 October 2026, into Law draft 10, core v21 and the freeze test suite v21 (each revised in place, for Nobody, allegedly, to approve again), and builds it in the core library, its WebAssembly bindings, the repo client and the collective client. Then, at Nobody, allegedly's request the same evening, it writes in F186 (two complete versions of one deal) and F185's later notes; F186 is written, not built. Roadmap step 11b.*

## In plain words

**What a broken collective is.** A collective is broken when its keys moved by a rotation whose new agreement fails Law's checks. On the Mac, the rotation removing a member named too few signers. Identity counts such a rotation, so the keys did move. Law finds no agreement in force, so nothing signed in the collective's name counts. That rotation is now called **the broken act**. Everything signed in the collective's name from it on is **the broken stretch**. It stays shown and counts for nothing, for good.

**The way back is a rollback.** A later rotation declares a new version of the agreement that was in force just before the broken act, and names the broken act. It needs that agreement's rule for changing the constitution, counted among the members whose voice remains. By default that is everyone who has not left. The collective keeps its identity, and nothing is erased. The rollback may restore the old agreement exactly, or redo the failed change correctly.

**Leaving a broken collective.** A member can leave during the broken stretch. The resignation names the agreement in force just before the broken act. No record is drawn, since a record of the broken stretch counts for nothing. The resignation takes effect at the next valid line, normally the rollback, which registers it. So a member who resigned and then went silent cannot block the way back.

**The last voice.** If the member leaving is the last whose voice remains, the client now says so before anything is signed: the works will be frozen as they stand, and nobody will be able to change, release or move them. It never blocks the leaving. Once the last voice has left, the works freeze as they stand: the spec now states this as a cost.

**What it looks like in the collective client.** When Law reads a collective as broken and a rollback can repair it, the collective's box says so and offers *Review a rollback*. The review says what went wrong, what the rollback does, who must sign (as Law counts them), which resignations it registers, and that everything since the broken act stays shown and counts for nothing. Sometimes the old rules cannot work with fewer members. For example, "four others judge absence" is impossible with three members. The review then says so, and the members give new numbers (*Roll back with new numbers*). A release from the broken stretch is described as such, never as if the collective were still broken.

**Repair, not undo** (F185's later notes). A rollback voids only an act Law reads as broken. An attempt to "roll back" a working collective puts nothing in force and is itself a broken act, repaired the same way. A client must never propose a rollback unless Law reads the collective as broken; this one never does. Two costs are written down. A member whose signature the rollback needs can ask a price for it. Holders of enough of the safety key can break the collective on purpose and refuse to repair it.

**Two complete versions of one deal (F186).** A deal cannot break. But every party may sign two new versions of the same version, for example from two devices out of step. While the two branches are equally long, the version before them stays in force. Once one branch is longer, by a further version everyone signed, that branch is in force. Set beside rule 47, which handles the same thing for a collective's records, it differs in seven places. Those are written as questions, DF1 to DF7.

**The WebAssembly changed.** The display client must be released again.

## What changed in the texts

- **Law draft 10, revised in place for F185:**
  - Rule 37: a failed declaration breaks the collective until a rollback.
  - New rule 37d: the broken act and the broken stretch. Every act of the stretch stays shown and counts for nothing in Law; it places no member's signature, and its records register nothing. The rollback: its parent, the broken act it names, its powers (rules 44c, 44d), and the rollback as a line. No rollback once every voice has resigned.
  - Rule 37a, two new paragraphs. *Leaving a broken collective.* *The last voice*, with the client conformance and the stated cost.
  - "Collectives in the identity chain": the rollback's Law declaration, `[LAW, 0, [clone, [+ hash], broken, [* hash]]]`, and how it registers departures.
  - Also updated: "Decided in this draft", "Freeze scenarios", and "Open in this draft" (six questions, RB1 to RB6, and six readings).
- **Law draft 10, also revised in place for F185's later notes and for F186:**
  - Rule 37d: repair not undo, the client conformance, the two stated costs, and money received still counting in Finance (rule 10).
  - Rule 5: the status quo stands, save for two complete versions of one deal.
  - Rule 45 points to 45b for deals and to rules 37c and 47 for collectives.
  - Rule 45b: the new paragraph *Two complete versions of one deal*.
  - "Open in this draft": DF1 to DF7.
- **Core v21, revised in place:** two bullets under "Members come and go", and one under "Clone, never modify" for F186.
- **Freeze test suite v21, revised in place:** new step 1.7a, two complete versions of one deal, and new step 3.7w covers the broken collective, a resignation during the broken stretch, the rollback, rollbacks that put nothing in force, no rollback once every voice has resigned, and the last voice's warning.
- **Findings log:** a line under F185 saying it is written in and built, and one under F186 saying it is written in.

**Found by building it, and written into rule 37d.** A failed rotation in the broken stretch still "placed" the signatures it named, so a signature collected during the stretch could count later at the rollback. Rule 37d's "counts for nothing" already covers this; the text now says it outright, and the core does it. No rule changed.

## What changed in the code

**Core library** (`core/src/law/`):
- `formats.rs`: the rollback declaration (`Declared.rollback`, `rollback_declaration`).
- `tiers.rs`: `rollback_powers`, the constitutional change rule, plus the judicial tier's rule where the clone changes a judge.
- `view.rs`:
  - Law reads the chain with broken stretches (`chain_state`, kept per view). A rotation that fails rule 37 opens a stretch; only a complete rollback naming that rotation closes it (`rollback_at`, `rollback_departures`).
  - A rollback's registrations are departure lines from then on (`rollback_lines`).
  - An act of the stretch places no signature.
  - New questions for clients: `broken_act`, `rollback_voices`, `rollback_agreement`.
  - A rotation declaring no Law agreement, or one in neither form, stays broken with no way back (RB4).

**Bindings** (`wasm/src/lib.rs`):
- `makeRotation` takes a rollback declaration (`broken`, `registers`).
- New: `lawBrokenAct`, `lawRollbackVoices`, `lawRollbackAgreement`, `lawRollbackPlan`.

**Repo client** (`clients/repo/src/`):
- The collective's file keeps the rules of each agreement it puts in force (`rules`), so a rollback can rebuild the agreement in force before a broken act.
- `rollback()` makes the clone and the rotation; the rotation code is shared with member changes (`rotateTo`).
- A release check says when a release was published during a broken stretch since rolled back.

**Collective client** (`clients/collective/src/`):
- `prepareRollback`: the review in plain words. Law counts again before the clone and before the rotation.
- `prepareLeave`: during a broken stretch, the resignation names the earlier agreement and no record is drawn. The last voice is warned in either case.
- The page: the button and the form for new numbers.
- **A fault found and fixed:** the bindings give a missing number as `undefined`, never `null`. The client's existing checks `needed === null` ("nobody's voice remains for this power") therefore never fired. They now read `needed == null`.

## Tests

- **Rust workspace:** 411 passed, none failed (408 before). The two checks added after that run, inside existing tests, pass in `law_collective` (101 of 101). Three new tests in `core/tests/law_collective.rs`:
  - `a_broken_collective_rolls_back` (step 3.7w). Six rollbacks that put nothing in force: naming another act as the broken act, too few voices, registering what is no resignation, a clone of the broken clone, marked with the clone rule, and an ordinary clone declaration. Then the rollback that works.
  - `a_rollback_may_change_nothing_and_needs_every_voice_that_remains`, including a second broken act after a rollback, and a rollback's registration staying in effect.
  - `no_rollback_once_every_voice_has_resigned`.
  - Also: a rollback that registers a real declaration of absence puts nothing in force (RB3), and an attempt to roll back a working collective breaks it (F185, repair not undo).
- **Collective client:** 27 of 27 (24 before), the browser test included, including the new `test/rollback.test.ts`. It covers 3.7w end to end against real homes and a relay, the last voice in a working collective, and the last voice in a broken one.
- **Other clients:** repo 13, connector 12, desk 10, genesis 17, reader 16, site 27, barebone 9, manage 7, longform 26, JPEG module 14: all passing (`scripts/test-all.sh`).

## Questions for Nobody, allegedly

Writing the rule exposed six things F185 does not settle. None was chosen. Where the text is silent, the code keeps what it did before or refuses, and says which. They are in Law draft 10, "Open in this draft", RB1 to RB6.

1. **RB1. Grants across the broken stretch.** Does a grantee's act during the broken stretch count, and does a grant issued before the broken act survive the rollback? *As built, unchanged by F185:* the grant keeps backing its grantee's acts through the stretch and after the rollback, so grantees go on acting for the collective while its own key counts for nothing. I checked this with a probe test, not kept.
2. **RB2. Acts a counterparty relied on during the stretch** (a debt, a sale, a receipt). After the rollback, may the collective adopt them by citing them (rule 40), or must it sign them anew? *As built:* they count for nothing for good, and the client says "sign again what is still wanted".
3. **RB3. A declaration of absence made during the stretch.** F185 counts a party declared absent out of the rollback, but says only that resignations take effect at it. Can a rollback register a declaration, so that a member who dies during the stretch does not block the way back? And what of a broken recovery rotation (C7)? *As built:* a rollback registers resignations and steppings down only.
4. **RB4. A rotation declaring no Law agreement at all, or a malformed one.** Is it a broken act with a way back? *As built:* broken with no way back.
5. **RB5. The last voice under a constitutional change rule naming some parties only.** Is the last of the named parties "the last voice"? *As built:* the warning is given only when no other party's voice remains.
6. **RB6. Forks and closings of a broken collective.** *As built:* they count for nothing; roll back first.

### F186 beside rule 47 (DF1 to DF7)

F186 was asked written in, not built. The core library still leaves the version before a deal's fork in force for good (rule 5's old status quo, audit R5b). Building it needs the answers below. Rule 47 settles forks of a collective's records; F186 settles forks of a deal. Side by side:

1. **DF1. Growth without knowing the fork.** Rule 47 resolves only by a clone recorded after both lines, by someone who saw both branches. F186 counts any complete clone, even one made by parties who never saw the other branch. Intended, or must the growing clone show it knew the other branch?
2. **DF2. Length against one step.** In a collective, branches of two clones and one clone leave the parent in force until someone resolves the fork. In a deal, the longer branch wins at once. Should collectives follow the length rule, or do the two keep different rules?
3. **DF3. Is a discarded branch discarded for good?** With no clock, "as soon as one grows" can only be judged on what a verifier holds. If the losing branch later grows longer, does it come back into force? And how do two verifiers holding different clones agree?
4. **DF4. A branch that forks again.** How is its length counted?
5. **DF5. A deal's own concurrency rule** (terms field 10, format open). Does it settle the fork first, as a collective's does?
6. **DF6. Keepers.** A deal's keepers can tell which clone completed first. Should their order decide instead of length?
7. **DF7. What was done under a branch** later not in force, or under either branch while they were equal (payouts, splits, purchases, transfers)?

**Readings to confirm** (Law draft 10, "Readings taken writing F185 in"):
- The declaration's form.
- The rollback's mark names the constitutional change rule whatever its changes, and may change nothing.
- The broken act is the first failing rotation; later attempts are part of the stretch.
- Steppings down are registered like resignations.
- A rollback's registrations stay in effect after it.
- "Just before the broken act" is the agreement in force at that rotation.

Also still to be checked, as F185 said: whether money keeps flowing through a split service granted in the founding terms once the last voice has left.

## Release

**The WebAssembly changed** (new Law reading and four new bindings), so **the display client must be released again**. This build's `mor_wasm_bg.wasm`, built here on Linux: sha256 `f0154a78066d859b289299b9f45640d4add4b3aeaaa5d4dde10b52e05e3b4d76`. The published build is made on GitHub, so its hash is the one to record at release.

## Next

- Nobody, allegedly, reads and approves the revised texts, and answers RB1 to RB6 and DF1 to DF7.
- F186 is built in the core once DF1 to DF7 are answered.
- The display client is released again.
- The human test of step 11b resumes on the Mac with a fresh collective. The old test collective on the Mac cannot be rolled back by this client: its file kept no rules for the founding agreement (they are kept from this version on), so it is refounded, as planned.
