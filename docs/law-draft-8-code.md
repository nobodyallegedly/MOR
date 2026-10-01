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
