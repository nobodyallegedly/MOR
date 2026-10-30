# mor-split

**Experimental**: an instrument for testing the core, never for real money. The split cMIP, draft 4 (`../cmip-split-draft-4.md`), the Agreements split task (task 8), for a publication (Agreements type 6). It signs nothing.

In plain words: a publication says who is paid from each sale. This crate answers two questions for its split service, and for anyone checking it. **Which service takes this payment?** The publication's own service first, then its backups in order, each only if the one before failed for this payment. **How much does each person get?** First the partners, the helpers, the metric shares and the fees, each a fixed fraction of the payment. Then everything left goes to the owners, by what each owns.

- `src/lib.rs`:
  - `route(publication, attempts)` and `failed(publication, attempts)`: the receiver for a payment and the services to state to the core as failed, from the publication's services (field 3, then field 11's backups) and its failure condition (`Failure`, field 12: a wait in seconds).
  - `divide(amount, publication, owners, facts)`: the payouts the core accepts. Off the top, each in millionths of the payment, rounded down: partners (field 2), role shares among their fillers, metric shares by their measures, and the fees owed on this payment (plan key 9). What is left is the owners' line: `Owners::Lone(drafter)` for a lone seller's publication, or `Owners::Line { agreement, holders, before }`, the holders of the ownership agreement's one stake in the version in force for this payment, by rule 9 with turns, with the running count the split carries. `Facts` brings the payment's rail, the roles' fillers and evidence, the metric measures and the fees' receivers.
- `tests/divide.rs`: every split sums exactly; the owners' line by rule 9, taking turns; no list's order decides anything; everything but the owners off the top (F280); roles, metric shares and fees; what draft 4 refuses; the failure condition and the route.
- `tests/f280.rs`: a named receiver or a stake in a plan refused by the core's format and by the cMIP; the same receiver as a partner off the top, the rest to the owners by ownership, exact to the unit.
- `tests/step13.rs`: roadmap step 13 end to end against the core's Agreements view: Ana and Ben's ownership agreement, their publication with a label as partner, a split service S and a backup T; a fan's attempt at S silent, the fan pays T naming S's price tag, T splits it exactly, every cut receipted at its owner's flow address and found there by each participant's check (Agreements rule 18); the next payment tried at S again. It uses the core's test world (`../../core/tests/common`).

```
cargo test -p mor-split
```
