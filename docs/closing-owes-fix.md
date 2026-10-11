# CLOSING-OWES on main, and the F254 walk reading deal voices

*11 October 2026. Its own step. Branch `claude/closing-owes-fix`, from main at `6aa5b77`. Pull request 12 (F254's loop walk) was not merged when this step started (checked twice), so the step started from main as it is. Part 1 is on main's code alone. Part 2 builds on pull request 12's walk, so that pull request's one commit is merged into this branch. Until it is merged, this pull request shows its changes too. Test identities only.*

## In plain words

**Part 1.** The property test `collective_promises_hold` makes up random histories of a collective and checks the library's answers. One seed made it fail with "CLOSING-OWES": a closing counted as complete while a debt in its history was still unpaid.

The library was right, and the test was wrong. Here is what happened in that history:

1. The collective takes on a debt, signed by its only Money signer.
2. It forks. The fork counts, and it hands the debt on to a successor.
3. The Money signer then resigns. The record of the resignation doesn't include the debt.
4. Someone signs a closing that names the fork. The fork already ended the collective, so the closing counts for nothing. It is still judged "as if it were the ending that counts", on its own history.

On the closing's own history, the resignation comes before the closing, and the debt was signed by a voice that, at that resignation's line, was already gone. So in that history the debt binds no one. The rules say this explicitly: a closing is judged on "its own debts, its own departures, its own signatures" (F143).

The test asked a different question. It asked whether the debt binds at all, looking at the real world. There, the fork is what ended the collective, and the resignation came after it, so the debt binds. The test's check for forks already judged debts on the fork's own history; its check for closings didn't. The fix makes the closing check use the same judgment. The library doesn't change.

**Part 2.** The F254 loop check (pull request 12) followed a deal's new version only if everyone in the old version signed it. But a deal may change without a party whose voice was removed for absence (rule 45b, B19). The loop check never followed such a version, so a loop made through it would not be refused. Now the loop check counts that version exactly as rule 45b does, and the loop is refused.

## The seed

`9763223879668712927`, with 48 cases:

```
AGREEMENTS_INVARIANT_SEED=9763223879668712927 AGREEMENTS_INVARIANT_CASES=48 cargo test -p mor-core --test agreements_invariants -- --exact collective_promises_hold --nocapture
```

It fails on main every time it is replayed. The smallest history it finds: two members, each with one device, and the Money lane at a threshold of 1 of 2. Then:

- a debt, public and cited, signed by the lane;
- a fork, honest about debts, every member signing;
- a resignation by one member, by a record whose kept tips do not hold the debt;
- a closing naming the fork, not signed by everyone.

## The cause

It is **the test checking something the rules do not promise**.

What the library answered:

- **The fork** is complete and counts. It handed the debt to a successor.
- **The closing** is complete, but counts for nothing (it names a final ending, F131). Judged on its own history (`on_own_history`, with that history's departures, F143 as F199 reads it), it finds no open debt.
  - The member who resigned held the Money lane alone.
  - The record registering their resignation lies before the closing's line, and its line does not hold the debt.
  - Nothing of the collective's own key adopts the debt there (F131, IT2a).
  - So at the debt's place, the lane has no voice left ("Made before, made after": a departure registered by a line whose history does not hold an act takes the holder's voice off it). The area is frozen, the debt's consent does not count (rules 36a, 44d), and the debt binds no one in that history.

What the test checked: for each complete closing, every debt in its history that `obligation_binds` says binds, unpaid. `obligation_binds` with no ending's line is the global view. There, the fork ended the collective, the resignation lies after the fork's line and is set aside, and the debt binds. So the oracle mixed two views: the closing's history, with the global judgment of whether a debt binds.

The spec is explicit for both endings: "Whether a fork or closing is complete is judged on its own line and history, as if it were the ending that counts: its own debts, its own departures, its own signatures" ("Closing (type 20)", "Judged on its own history"). And for the closing: "every obligation that binds it and lies before its line".

Not the other causes:

- **Not the library breaking a rule.** It reads the closing on its own departures, as the rule says.
- **Not a history the rules forbid.** A resignation registered by a record that does not hold a debt is allowed, and the fork's own check meets such histories already.
- **Not a gap in draft 11.** F143 settles which history is read. F197, F262 and F265 are not involved: the debt is a plain obligation to a creditor, not money owed back and not an absentee's share.

So no question is put.

## The fix

`core/tests/agreements_invariants.rs` only:

- The fork check's judgment of whether a debt binds on an ending's own history moves into one function, `binds_in(lv, d, he)`: in the history, done, cited, the Money lane's consent counting among that history's lines (`lane_counts`, with its adoption reading), or for a grant key's debt, the grant's own checks and the tie rule.
- The fork check calls it, unchanged in effect.
- The closing check now uses it in place of the global `obligation_binds`.

The library is unchanged by part 1. The check is not weaker: it now catches a debt that binds on the closing's own history but not globally, which the old check missed.

## Part 2: the walk reads deal voices

*A mechanic, settled by the project lead* ("The F254 loop walk fix: readings", F254's walk and rule 45b).

`core/src/agreements/view/parties.rs`, `walk_signed`: a deal's clone now needs whom rule 45b needs:

- every party of its parent whose voice remains for it (`deal_voices`);
- every newcomer;
- every holder it takes a stake from (`must_sign`).

Each signs by their own signature act, or, being an agreement, through their own line.

`deal_voices` reads declarations, signature acts, the keepers' records the caller states (`keeper_logs`) and the absence answers (`absence_accepted`). The walk can reach all of these, and none of them is another agreement's verdict, so no judgment depends on itself (reading 5's condition holds).

Where the voices cannot be read at all (a lineage or a declaration that does not decode), the walk follows the clone, failing closed. It may then refuse a loop that is not there, but it never misses one. In the tests, this case never arises.

What the walk still does not read, as before: whether the clone's mark is right, and whether its parent exists. Those are verdicts. A clone the walk follows but rule 45b refuses for its mark can only make the walk refuse more.

## Tests

### Part 1

- **The failing seed passes** (`9763223879668712927`, 48 cases), on part 1's code and on the final code.
- **51 other seeds, each for `collective_promises_hold` and for `deal_promises_hold`:** all pass, 102 runs, each with its default case count, on part 1's code (main and the test fix). The same 51, with the failing seed, then all pass again on the final code (part 2 in): 104 runs. The 51 seeds, drawn from a generator seeded `20261011`:

6393880578301230082, 6235130246231341257, 1011789125271432163, 6606660514699134307, 685921792654385561, 270108546291342068, 15963543846190897403, 12383109446056992938, 4006129475516667518, 12152639319913474376, 9788969470844758345, 2364840530518459990, 16849331045548022198, 67043576315180714, 17974436013034863177, 18228807799024861676, 2774870245183577647, 6839469187579605189, 14984298768177319628, 8387071869350625635, 5398432370777377938, 2592606529549230717, 18209552311165508148, 12778561390058799148, 14243061193785058193, 3722454210201748885, 4090087685021962405, 6572362498487860638, 1982767806093840817, 2999008144847977655, 8314743769583926977, 18197598802189196381, 8730570357792769356, 6291965569273821879, 5321631645734338892, 8546076599256985397, 4078171713024686214, 13326560989200539219, 879286355979697168, 9969432728829889363, 574398262751800011, 9244386889298872796, 7423025750055400657, 17509204393776915462, 6513593487435480437, 17396134354549997734, 18046029235517092713, 4887213677834137067, 5968758917430158895, 18233561257996341045, 11835857707429134180.

### Part 2

`f254_a_loop_through_a_clone_after_an_absence_is_refused`, in `core/tests/agreements_collective.rs`:

- The album A (the Label, Carla); the song B (Ana, Ben), with a keeper and a named absence authority.
- A's later version adds B, everyone signing.
- B's clone drops Ben and names A, its mark naming Ana. Ana, the Label and Carla sign it.
- While Ben's voice remains, the clone is a draft, and A's later version stands.
- The authority then declares Ben absent, and the keeper records it. Now both later versions are refused for the loop, and A and B return to their earlier versions.
- **Fails with pull request 12's walk:** the album's later version is not refused, so the loop stands unrefused. **Passes after.**

Pull request 12's three tests and the earlier F254 tests pass unchanged.

### The whole suite

`scripts/test-all.sh` (without `--reproducible`, regtest not set), the tree untouched during each run:

- **At the start, on main `6aa5b77`:** all passed. Rust 622, TypeScript 220. The random seeds drawn that run did not hit CLOSING-OWES.
- **At the end, on this branch:** all passed. Rust 626 (622, pull request 12's three tests, and this step's one), TypeScript 220. No vector changed.
