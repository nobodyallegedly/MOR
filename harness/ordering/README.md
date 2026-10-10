# mor-ordering-sim

A simulation testing one ordering rule for collectives, proposed for Agreements draft 7's flaws E to L: **for anything done in a collective's name, "before" and "after" are judged only on the collective's own sequence, never on members' personal sequences.** The rule, the replay of each flaw, the attacks and the choices are in `docs/law-ordering-rule-test.md`. The rule was adopted as F109 and written into Agreements draft 7 (seventh pass); the program now also runs the rules exactly as written there (section 8 of the write-up), and was rerun unchanged against the eighth pass, whose answers it already modelled where it reaches them (section 8, last paragraph).

*Agreements draft 8 (1 October 2026):* the rules as written now include B11: a fork of records (two sibling clones recorded on lines that do not name each other, the parent in force) is resolved by a clone of the latest clone of either branch recorded after both lines (`Rule::Root { b11 }`, on for the rules as written only, so the ordering test's own variants are unchanged). The random worlds never produce that case, so `tests/stories.rs` adds a story and a sweep of 3,000 worlds that each start from a fork, all the written rules' checks run on each; the sweep is what showed that a resolving clone must clone the branch's *latest* clone. The tally counts resolutions (`fork_resolutions`).

## In plain words

The program builds many small imaginary collectives: three members, each with a phone, a laptop or a tablet; a collective that signs from one, two or three devices at once; a treasurer, receipts, clones of the agreement, grants and their deals, resignations, declarations of absence, a keeper, friends who acknowledge things. It lets them act in random orders, including the awkward ones: a device left out, a device offline, two devices signing at the same moment, an act slipped in later and dated back, a signature made after leaving.

The program keeps a real clock that MOR does not have. Each rule is judged only on what a verifier can see (sequences, tips, the keeper's own order); the clock is used only to check whether the rule's answer is the one intended. Then it asks: did the rule give a wrong answer? Did something that counted stop counting? Could anyone slip in an act made after a member left? Did a friend's acknowledgement or a member's choice of device change anything?

It runs the same worlds under Agreements draft 7 as written (simplified), to show the flaws' harm happening there and not under the rule.

## Running it

```
cargo run --release -p mor-ordering-sim -- 20000      # 20,000 random worlds, then the tally
cargo test --release -p mor-ordering-sim              # each flaw's story by hand, and a sweep
SIM_EXPLAIN=<seed> cargo run --release -p mor-ordering-sim   # print the first thing a world loses
```

The program exits with an error if the rule tested, or the rules as Agreements draft 7 now writes them, give any wrong answer.

## What is modelled

- `src/model.rs`: acts, their signers' sequences (one per device), forks, the collective's lines and the tips they name (complete, lagging behind slow or offline devices, or leaving a fork out on purpose), the keeper's own order, the real time.
- `src/rule.rs`: one evaluator for every rule. The rule tested (option α: a member's signature is placed at the act of the collective it signs; option β: only where the collective acknowledges it), with or without keepers (none, the collective's own acts only, everything), with records naming their signatures or not, with a member's rotation registered on the collective's line or not (C5); and Agreements draft 7 as its sixth pass wrote it, before F109 (`Rule::Draft7`). A `Clock::RealTime` evaluator is the oracle.
- `src/gen.rs`: random worlds, deterministic from their seed.
- `src/check.rs`: the checks and the tally; `check_written` and `WrittenTally` for the rules as Agreements draft 7's seventh pass writes them (keepers for the collective's own acts, C4; a member's rotation registered on the collective's line, C5).
- `tests/stories.rs`: flaws E, F, G, H, I, J, K, L, Q23, Q28 and Q30 by hand, and the attacks.

## Not modelled

Cryptography and formats (acts are records in memory); the collective's own rotation voiding its old-key acts under Identity (lines behave the same way, by tips); several areas, lanes and tiers (one area, one clone rule); the key grammar (whoever holds the collective's key is assumed to sign what the generator asks); contests.
