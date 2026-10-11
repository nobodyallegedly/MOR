# deal_promises_hold: the failure on main

*11 October 2026. Its own step, before the Agreements draft 11 build resumes. Branch `claude/invariant-deal-promises-fix`, from main at `5a2ec0f`. The first pass stopped at a question for Nobody, allegedly: the cause was a point Agreements draft 11 did not settle. **Answered as F266 (option a); the fix and its tests are at the end ("The answer, and the fix").***

## In plain words

When a payment doesn't divide exactly between a deal's holders, the units left over go one by one to the holders who lost the most in rounding. Where two holders lost the same, they take turns. The split service writes a running count on each split it makes, showing who has had leftover units so far, so that the next tie goes to whoever has had fewer.

The property test that failed on main makes up random deal histories. In one of them, the deal changes its shares (a new version, signed by everyone) between two splits. The library and the test then count turns differently:

- **The library** starts the count again from zero for each new version of the deal. Splits made under an earlier version don't count.
- **The test** carries the count on from the split before, whatever version it was made under.

With two holders at 50% each and one leftover unit, the two counts hand that unit to different holders. Both readings could be argued from draft 11's text, which never said whether the count runs across versions. Nobody, allegedly, decided it (F266): **the count runs across every version of the deal.** The library now does so, and the test, which already did, stays as it was.

## The seed

`17655411432439988002`, with 48 cases. It fails every time it is replayed on main:

```
LAW_INVARIANT_SEED=17655411432439988002 LAW_INVARIANT_CASES=48 cargo test -p mor-core --test agreements_invariants -- --exact deal_promises_hold --nocapture
```

*A separate defect, noted and not fixed here:* the test's comments name the variables `AGREEMENTS_INVARIANT_SEED` and `AGREEMENTS_INVARIANT_CASES`, but the code reads `LAW_INVARIANT_SEED` and `LAW_INVARIANT_CASES`, left over from the rename. A run with `AGREEMENTS_INVARIANT_SEED` set ignores it silently and draws a random seed, so it can look like a passing replay. It is a one-line fix, for its own pull request or this one, as the project lead prefers.

An earlier run of `scripts/test-all.sh` on the same commit passed with another seed (Rust 606 passed, 0 failed, 1 ignored). So the failure turns on which seed a run draws.

## What the failing case is

The smallest history the property found:

1. A deal of two parties, with a split service. One payment comes in.
2. The service splits it exactly, with a fee.
3. Two clones of the deal change the shares, every party signing. The version in force ends with the two holders at 500,000 millionths each.
4. The service splits the same payment again, exactly: a fee of 19, so 981 units for the stake, 490 each and one unit left over, a tie. This split cites the first split as its previous one.

Under the first split, one holder (call them H1) had already received a leftover unit; the other (H2) had not.

- **The test** pays the tied unit to H2 (fewer units so far: 0 against 1) and carries the count {H1: 1, H2: 1}.
- **The library** (`tally_member` in `core/src/agreements/view.rs`) counts a previous split only where it names the version now in force. The first split named an earlier version, so the library reads the second split as the first of its chain. With the count at zero, the tie goes to the smaller identity hash, H1. It then judges the test's split as breaking its plan: a mismatch on both holders, and a wrong running count (it expects {0, 0}).

## The cause

Agreements draft 11, rule 9 (was 15a), says a tied unit goes to "the tied holder that has received the fewest leftover units from this stake so far, counted along the dividing split service's own receipts for the stake". It does not say whether "this stake so far" runs across the versions of the deal.

The text leans both ways:

- **Across versions.** A stake is "identified by that agreement and its index in the agreement's stakes list", and a clone is an act on the same agreement chain. "A new holder starts keeping the chain from its first split" (F182): holders change, and the chain goes on. While a deal stands forked, "its stake's holders there take their turns along that branch's receipts", which reads as if a branch carries the receipts before it. And the split numbering, the rule beside it, says outright that it "runs across every split the service makes under the deal, on any branch" (DQ6).
- **Per version.** "Agreement: … Its id is the id of its terms act", and every version has its own terms act. A clone may reorder, add or drop stakes, so index 0 in a new version may not be the same stake at all. The split is judged against "the stakes as currently held, those of the version in force" (rule 26).

So this is not the library breaking a written rule, nor the test inventing a history the rules forbid. The rules don't say which reading holds, so the cause is a gap in draft 11. As instructed, I stop here and put it as a question rather than pick one.

## Question for Nobody, allegedly

**Does the count of turns for tied leftover units run across the versions of a deal, or start again at each new version?**

Checked against the working rule "core business, or the participants' choice": it is core business. Rule 9's turns are the core's own guarantee that a split service cannot steer ties (F165, F171), and no participant's terms choose how they are counted.

- **(a) Across versions.** The count runs along the service's splits under the deal, through every version, as the split numbering does. A holder new to the stake starts at zero (F182). A clone that drops a holder drops their count. "The stake" across versions would be read by its object (the work it is a share in), not its index, since a clone may reorder the list; that would be a mechanic, listed as a reading. *Fix:* the library (`tally_member`, `prior`). The test stays as it is.
- **(b) Per version, as built.** Each version in force starts its own chain, from zero. A clone needs every party's signature, so the fresh start is no opening for the service alone. The cost is small: after each clone, the first tie goes to the smaller identity hash. *Fix:* the test's oracle and its running count (`core/tests/agreements_invariants.rs`). The library stays.
- **(c) Something else.**

*My lean: (a).* F165's purpose is that no one can steer ties, and the neighbouring rules (the split numbering, F182's new holder, turns per branch) all read as one chain under the deal. Under (b), each clone resets the count; that is harmless, but it is a second way of counting beside the numbering's.

## Tests

- **On main, before anything** (`scripts/test-all.sh`, without `--reproducible` or regtest), in a separate clean checkout of `5a2ec0f`: it stopped in the Rust half. Rust: 331 passed, 1 failed (`deal_promises_hold`, the seed above), 1 ignored, then the script stopped, so the TypeScript half did not run.
- **The failing seed replayed** on main: fails, the same way, every time.
- Nothing is fixed yet. The fix, the failing seed passing, at least 50 other seeds all passing (listed), and a full `scripts/test-all.sh` run on this branch, with the source tree left alone while it runs, all wait for the answer.
