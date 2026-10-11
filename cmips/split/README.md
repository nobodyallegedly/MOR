# mor-split

**Experimental**: an instrument for testing the core, never for real money. The split cMIP (`../cmip-split-draft-1.md`), the Agreements split task (task 8), roadmap step 13's split Module (F249, F250). It signs nothing.

- `src/lib.rs`: the receiver for a payment (`route`: the services the owners signed, in order, and the attempts made for this payment; the first whose attempt has not failed; never another), what counts as a failed attempt (`Failure`, terms field 29, key 1: a wait in seconds), the services to state to the core as failed for a payment (`failed`), and the amounts (`divide`: shares off the top, the rest by parts, each stake by rule 15a with turns, the running count of leftover units the split carries).
- `tests/divide.rs`: every split sums exactly; leftovers by rule 15a, taking turns; the plan's order deciding only between shares, holders' order nothing; roles, metrics and fees refused; the failure condition and the route.
- `tests/step13.rs`: roadmap step 13 end to end against the core's Agreements view: a fan's payment through a publication, the work's designated service silent, its backup paid for that payment, the share split exactly, every cut receipted at its owner's flow address and found there by each participant's check (Agreements rule 18b); the next payment tried at the designated service again. It uses the core's test world (`../../core/tests/common`).

```
cargo test -p mor-split
```
