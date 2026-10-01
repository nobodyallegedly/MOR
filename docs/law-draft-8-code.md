# Law draft 8 and the code

*1 October 2026. A report for the project lead, from the build window of the roadmap's item "a short pass writing B1, B11 and B12 into Law draft 7 and the code, then merge". Branch `claude/law-draft-8-code-rdvox0`: the code rework branch (`claude/law-7-code-rework-j7w1j5`) with main merged in. Not merged to main; the roadmap is not edited.*

## In plain words

Law draft 8 is draft 7 with what reworking the code found. A collective that rotates its keys without changing its rules now keeps every change it recorded (Flaw B1). A collective's agreement that forked, because two devices recorded two different changes without hearing of each other, can now be repaired: the collective records a change of one side after seeing both, and that side wins (B11). And a declaration of absence finally has an exact format (B12), so the code can run what waited on it: a dead or vanished member's voice removed at the collective's line, a year of their receipts kept, a seat passed to a nominee, and the absence authority counted where the declaration takes effect. The twelve other answers (B2 to B13) are written in as recorded.

Writing it and building it found one new flaw and two questions. The flaw: a seat cannot pass automatically by a succession plan as the text stands, because the clone doing it must also change the keys and the plan itself, which the text does not allow (B14). The questions: how several members sign one declaration of absence together (B15), and which rotation counts as the "recovery" one (B16). The code refuses those cases rather than guessing. The ordering simulation also caught a gap in my first reading of B11, now fixed in the text.

## What changed in the text

- `spec/MIP-law-draft-8.md`: draft 7 with Flaw B1 (a rotation declaring nothing new carries the agreement in force forward, recorded clones included) and B2 to B13 written in where they belong: B2 in "Made before, made after" and rule 37c; B3 and B10 in rule 44d; B4 in rule 44b; B5 and B6 in rule 37; B7 under "Areas"; B8 in the mark's format; B9 in the keepers' placing and in deals; B11 in rules 37c and 47 and the record act; B12 as a new format section, "Abandonment declaration (type 13)", with rule 51 and record field 3. B13 is a client matter. Its end lists Flaw B14, questions B15 and B16, and five readings the code takes (below).
- `spec/02-MOR-core-v19.md`: only its header and three sentences (B1, B11, the declaration).
- `spec/03-MOR-freeze-test-suite-v19.md`: header, and steps 3 (B11), 7b (B8), 7g (B1, B5), 7k (B12); step 8b marked as waiting on Flaw B14.
- The draft 7, core v18 and suite v18 files are kept until approval; `spec/README.md` lists both.
- `docs/findings/MOR-findings-log-round-2.md`: B14 to B16 and the simulation's finding recorded under F109; earlier wording untouched.

## What changed in the code

- **Core library** (`core/src/law/`): B1 (records since the last declaring rotation keep counting); B11 (a clone of the latest clone of one branch, recorded after both lines, resolves a fork); B8 (signers ascending, else invalid); B12: the declaration's format and rule 51's checks, registration on a record, its effect at the line (F105, Q28, flaw C, Flaw L), the threshold authority counted at the line (Q37), C7 at the recovery rotation (read as in B16's lean), and in a deal a declaration drawing its own line, the deal's keepers placing signatures before it (Q28's confirmed reading). A clone marked with a succession plan is now checked as far as the texts go (automatic plan, successors signing, trigger in effect, every voice signed that plan, nothing else changed), then refused as unsettled (Flaw B14).
- **WebAssembly bindings**: `declarationPayload`; departures of kind "declared"; a record says whether it resolves a fork.
- **Repo client**: marks sorted (B8); a general "recorded at once" change, used for the release area's words and for who judges absence.
- **Collective client** (B13): changing only "who judges absence" is now a judicial change under the clone rule, recorded at once, no rotation; its review says that a member who does not sign stays judged by the clause they signed, and warns that the constitution's words, being constitutional, keep the old number. A mark's signers are read out in party order.
- **Ordering simulation**: B11 for the rules as written (the ordering test's own variants unchanged), a B11 story, and a sweep of 3,000 worlds that each start from a fork, since random worlds never produce one that resolves.

B8 was not in the task's list for the code, but without it the code would accept marks the text now calls invalid, so it is in.

## Test results

All run on the final code:

- Rust workspace: 233 tests, 0 failures. Law: `law.rs` 11/11, `law_collective.rs` 29/29 (9 new: B1 with B5; B11 twice; 3.7k's declaration with Q28, C2, Flaw L, flaw C and a frozen area; Q37; C7; 3.8; 3.8b up to Flaw B14; Q28 in a deal).
- Repo client 11/11, collective client 16/16 (one new: the judicial change, against real homes and a relay, a release under it verified by a fresh verifier); the other clients still pass: genesis 13/13, barebone 9/9, longform 15/15, manage 7/7, reader 16/16.
- Ordering simulation: stories 21/21 (2 new); 20,000 random worlds, 0 wrong answers for the rule tested and for the rules as Law draft 8 writes them; the fork sweep, 3,000 worlds, 2,100 of them resolving their fork, 0 wrong answers. The sweep first found 2,646 "status quo" failures under my first reading of B11 (a clone of a branch's *first* clone resolving the fork, dropping a later clone on that branch); B11 now reads "a clone of the branch's latest clone", in the text and the code.

## Still open

- **Flaw B14** (Law draft 8, "Open in this draft"): a succession clone must also change the key grammar and drop the executed plan. Lean: it replaces the party by its seat successors in every holding, thresholds unchanged, and drops the plan; with it, where successors go in the parties' list (lean: in the party's place) and what a seat's "voting weight" does (lean: weight 1 only for now). Scenario 3.8b waits on it.
- **B15**: how a threshold of the other members signs one declaration. Lean: one signs, the others add signature acts naming it. Until then a declaration counts only where its signer alone meets the number (Q37's case). Note: the collective client's own clause is "any k of the other members", so it cannot use declarations until B15 is answered.
- **B16**: which rotation is C7's recovery rotation. Lean, built: the one declaring the clone that removes the declared member.
- Readings the code takes, to confirm: a fork is resolved by a record only; a threshold authority counted at a record sees that record's resignations but not its other declarations; a plan with no seat entry is a nomination; in a deal, a threshold authority is counted among parties no earlier recorded declaration removed; and B11's "latest clone".
- Unchanged from the rework: formats Law still leaves open (revocations, imports, the fork rule, keeper records, stakes, split plans, refund terms) are refused, not guessed. The deployed test collective still uses draft 6 formats and must be refounded (test only); B8 also means clones signed by the earlier clients with unsorted marks are invalid now (test only).

## Ready to approve and merge?

**Not yet, by one decision.** Everything written from B1 to B13 is in the text and the code, consistent, and tested, with nothing failing. But Flaw B14 is a real flaw in the text: as written, no seat ever passes automatically. It needs a choice from Nobody, allegedly (my lean is option 1). B15 and B16 are smaller and each has a lean. Once those three are answered, writing them in is a short pass, and then Law draft 8, core v19, freeze suite v19 and the code are ready to approve and merge together. If Nobody, allegedly prefers to merge now with B14 to B16 listed as open, nothing on the branch blocks that: the code refuses exactly those cases.

---

# Last pass: B14, B15 and B16 written in and built

*1 October 2026. Same branch, main merged in first (one conflict in the findings log, resolved by keeping main's decided wording for B14 to B16). Not merged to main; the roadmap is not edited.*

## In plain words

Nobody, allegedly answered the three points the first pass left open, and they are now in the text and the code.

- **A seat can pass automatically by succession (B14).** The successor takes the departed member's place in the collective's keys, with every threshold unchanged, and the used plan is dropped. The rotation that brings the change in re-deals the keys to include the successor. Scenario 3.8b now runs to the end: the successor's voice counts afterwards, and a clone that lowers a threshold, leaves the successor out of a key, or keeps the plan is rejected.
- **Several members can sign one declaration of absence (B15).** One of them signs the declaration and the others add their own signatures naming it. It counts once enough have signed. The collective client can now declare a member absent under its own rule ("any k of the other members").
- **The "recovery rotation" is the one that removes the declared member (B16).** This was already built; the text now says it.

Writing them in turned up three new flaws, B17 to B19, and a few small points B14's answer does not cover. They are named at the end of Law draft 8. The code refuses each of those cases instead of guessing, and decides nothing new.

## One point of writing to check

B15 says the declaration "counts once the required number have signed". In a collective I wrote "once" the F109 way: the others' signatures count at a line only if the collective placed them there, either by an earlier act acknowledging them or by the record that registers the declaration acknowledging them (Envelope `acks`). This mirrors how a record names the signatures that complete a clone (A2). Without it, a signature arriving late could change what an older line did, which is the flaw A2 closed. No new format is needed. **Nobody, allegedly should confirm this reading.**

## New flaws, for Nobody, allegedly

- **B17.** If one person holds the safety key, rule 36 requires a successor named in their plan. Under B14 the succession clone puts the successor in that place and drops the plan, so the successor holds the key with no successor named, and rule 36 makes that clone invalid. The plan's power cannot add a new plan. So rule 36's own example never completes automatically and can only pass by nomination.
- **B18.** If the absent member is the only holder of the everyday key (the C7 case), the collective cannot act without them. It therefore cannot place the others' signatures before the recovery rotation, and a threshold declaration needing more than one signer never takes effect there. Under "every party" that would freeze the constitution. The collective client refuses to declare its key holder absent and says why.
- **B19.** In a deal, the texts do not say where a declaration completed by several signatures takes effect.
- **Left open by B14's answer:** where the successor goes in the list of parties when not in the departed member's place; what a seat's "voting weight" does; a successor who is already a party; several successors to a key held by one person; a departed member who was a custodian or held the recovery path.

## What changed

- **Text:**
  - Law draft 8: header, act table, signature field 0, the declaration section, record field 3, "Made before, made after" item 3, rules 36, 44c, 48c, 49, 51 and 53, "Decided", the freeze list, and "Open in this draft".
  - Core v19: header, succession, abandonment.
  - Freeze suite v19: header, the checklist, step 7k (B15, B16, B18), step 8b (no longer waiting), "Passes if".
  - `spec/README.md`; findings F109 (applied).
  - The readings at the end of draft 8 are unchanged.
- **Core library:**
  - Succession clone checked against B14. The open shapes are refused as unsettled.
  - A threshold declaration counts the others' signature acts placed at or before its line.
  - B18 and B19 are refused as unsettled.
- **WebAssembly and genesis client:** an everyday act can carry `acks`.
- **Repo client:** `declare`, `signedVersions`, and a record that can acknowledge acts; `TestCollective.declareAbsent`.
- **Collective client:**
  - New action "Declare a member absent", with a review read from the exact bytes, and a button on the page.
  - The number of signatures needed comes from the clause the absent member signed last.
  - Declaring the everyday key's holder absent is refused.

## Test results

- **Rust workspace:** 237 passed, 0 failed, including 4 new tests in `law_collective.rs`, now 33/33:
  - 3.8b in four cases;
  - B14's open points refused;
  - B17 shown;
  - B15 at the recovery rotation;
  - B15 in a deal.

  The threshold test was rewritten for B15 in six cases.
- **Clients:**
  - collective 17/17 (one new test: declaring absence, judged by a fresh verifier);
  - repo 11/11, genesis 13/13, barebone 9/9, longform 15/15, manage 7/7, reader 16/16;
  - every client typechecks.
- **Ordering simulation:**
  - 20,000 worlds: 0 wrong answers, for the rule tested and for the rules as draft 8 writes them;
  - stories and sweep: 21/21.

  The simulation does not model succession, threshold authorities or C7, so these results show the new text breaks nothing it does model. They do not test B14 or B15 themselves; the core's tests do that.

## Ready to approve and merge?

**Yes, if Nobody, allegedly accepts two things:** the B15 reading above, and B17 to B19 staying open, listed at the end of Law draft 8. Everything that was decided is written in, built and tested, with nothing failing. The three new flaws are real gaps, but each one is a rare case that verifiers refuse. None of them breaks anything that works today.

If Nobody, allegedly prefers to settle B17 first, its choice is small: one of the three options listed at the end of draft 8. B17 matters for any collective whose safety key is held by one person.
