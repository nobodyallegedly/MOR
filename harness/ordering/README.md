# mor-ordering-sim

A simulation testing one ordering rule for collectives, proposed for Law draft 7's flaws E to L: **for anything done in a collective's name, "before" and "after" are judged only on the collective's own sequence, never on members' personal sequences.** The rule, the replay of each flaw, the attacks and the choices left open are in `docs/law-ordering-rule-test.md`. Law draft 7 itself is unchanged.

## In plain words

The program builds many small imaginary collectives: three members, each with a phone, a laptop or a tablet; a collective that signs from one, two or three devices at once; a treasurer, receipts, clones of the agreement, grants and their deals, resignations, declarations of absence, a keeper, friends who acknowledge things. It lets them act in random orders, including the awkward ones: a device left out, a device offline, two devices signing at the same moment, an act slipped in later and dated back, a signature made after leaving.

The program keeps a real clock that MOR does not have. Each rule is judged only on what a verifier can see (sequences, tips, the keeper's own order); the clock is used only to check whether the rule's answer is the one intended. Then it asks: did the rule give a wrong answer? Did something that counted stop counting? Could anyone slip in an act made after a member left? Did a friend's acknowledgement or a member's choice of device change anything?

It runs the same worlds under Law draft 7 as written (simplified), to show the flaws' harm happening there and not under the rule.

## Running it

```
cargo run --release -p mor-ordering-sim -- 20000      # 20,000 random worlds, then the tally
cargo test --release -p mor-ordering-sim              # each flaw's story by hand, and a sweep
SIM_EXPLAIN=<seed> cargo run --release -p mor-ordering-sim   # print the first thing a world loses
```

The program exits with an error if the rule tested gives any wrong answer.

## What is modelled

- `src/model.rs`: acts, their signers' sequences (one per device), forks, the collective's lines and the tips they name (complete, lagging behind slow or offline devices, or leaving a fork out on purpose), the keeper's own order, the real time.
- `src/rule.rs`: one evaluator for every rule. The rule tested (option α: a member's signature is placed at the act of the collective it signs; option β: only where the collective acknowledges it), with or without keepers (none, the collective's own acts only, everything), with records naming their signatures or not; and Law draft 7 as written. A `Clock::RealTime` evaluator is the oracle.
- `src/gen.rs`: random worlds, deterministic from their seed.
- `src/check.rs`: the checks and the tally.
- `tests/stories.rs`: flaws E, F, G, H, I, J, K, L, Q23, Q28 and Q30 by hand, and the attacks.

## Not modelled

Cryptography and formats (acts are records in memory); the collective's own rotation voiding its old-key acts under Identity (lines behave the same way, by tips); several areas, lanes and tiers (one area, one clone rule); the key grammar (whoever holds the collective's key is assumed to sign what the generator asks); contests.
