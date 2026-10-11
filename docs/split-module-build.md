# The split Module: F250, built (roadmap step 13)

*A building session for Nobody, allegedly: one roadmap step, step 13, carrying one decision (findings log, round 2: F250; F244, F248, F249 and H6 as records). Branch `claude/split-module-implementation-5h6pi5`, rebased onto main. Test identities only, never real money. Texts revised in place, for Nobody, allegedly, to approve again: Agreements draft 10, core v21, the freeze test suite v21, Money draft 6 (wording only) and Development draft 6 (the task table). New, experimental, not approved: the split cMIP draft 1 (`cmips/cmip-split-draft-1.md`) and its code (`cmips/split/`, crate `mor-split`).*

## In plain words

**What F250 asked for.** When something is bought, the money for a work goes to the work's split service, which pays each owner their cut. The owners may name backup services in case the first one does not answer. You decided (F249, F250) that this is not a chain of judges with deadlines but a list of attempts: each payment tries the first service; only if that attempt fails does it try the next; the next payment starts again with the first. Which service, which backups and what counts as a failed attempt belong to a community specification (a cMIP) the agreement names. The core keeps only four things: the signed agreement, the receipts, the guarantee that money only goes to an address the owners signed, and each owner's own check: "something was bought; is my cut at my address?"

**What was built.**

1. **The backups moved out of the chain of judges.** An agreement now lists its backup split services in a field of their own (terms field 29), after the main one (field 14), with the cMIP's definition of a failed attempt, all signed with the terms. The old way of naming backups inside the chain of judges is refused. Each backup in a deal still carries one grant per owner, as H6 had it.
2. **The split cMIP, draft 1.** A short rulebook and its code: given the services the owners signed, in order, and what happened when the payer tried them, it says which one gets this payment. A service fails when it refuses, stays silent past a wait (60 seconds unless the agreement says otherwise), or gives a payment request that cannot be paid. It also divides an amount by the agreement's plan, to the last unit.
3. **The core's guarantee and each participant's check.** The library accepts a payout to a backup only for a payment whose earlier attempts are stated to have failed; a payout to anyone the owners did not sign is wrong, whatever is stated. A new check answers, for one purchase and one participant, how much is due, how much arrived at its own payee pointer or vault, and where the trail stops if it does.
4. **Step 13's test.** A fan pays 1,000 for a publication. The work's main service S does not answer within the wait, so the publisher's service pays the work's 850 to the backup T, and 150 to the label. T splits the 850: 510 to Ana, 340 to Ben. Each receipts its cut, and each participant's check finds its whole cut at its own address. The three cuts add up to the 1,000 paid. The next payment goes to S again.

**One question for you (QS1), and one thing to know.**

- **QS1, a buyer paying the work directly.** Through a publisher, the backup works as you described: the publisher's service pays the backup's own address. But a buyer paying the owners directly pays the owners' payee pointer, and the rules let that pointer lead to one service only. So if S fails, a direct buyer has no signed address of T to pay in the owners' name. Options: (a) let an owner's pointer carry addresses of the main service and of its backups, tried in order; (b) let the buyer pay the backup's own address, the backup receipting in the owner's name; (c) backups serve payments through a publisher only. Not built either way: as it stands, a direct buyer pays the owner's pointer.
- **A stated cost in the cMIP, not the core.** Whether an attempt failed is, in draft 1, the payer's word: only the payer sees whether the service answered. A payer could skip a working main service. What bounds it is the core's guarantee: the money still reaches a service every owner signed, split by the same plan. A later draft may ask for evidence.

**Tests.** Every Rust test and every TypeScript package pass (counts below). **No test vector changed.** The vectors (`core/vectors/`) cover CBOR, hashing, locking, acts and canonical text, none of which this step touched. The format of agreements did change: a new field 29, and the chain of judges no longer accepts the split service as a judge. No published vector carried either.

## What changed, precisely

### The texts

**Agreements draft 10** (revised in place):

- **Terms field 29**, `backups = { 0 => [+ hash / [+ hash]], ? 1 => any }`: each backup split service after field 14's, in order (a collective's grant, or a deal's grants, one per payee, as many as field 14 lists), and the split cMIP's parameters for a failed attempt, which the core never reads. Only with field 14 and a named split cMIP (field 2's task 8, or the plan's key 1, the same where both). Every grant of fields 14 and 29 listed once. New paragraph "The split service's backups".
- **The chain of judgment.** The judge `[ 2 ]` (the split service) is withdrawn and never reused; terms carrying it are invalid. One that takes over is one hash again. The H6 paragraph, its CDDL comments, rule 34a's clause and the "Judge" definition are rewritten; the earlier records of H6 stay, marked superseded.
- **Rule 18a (new), the split task handed to the split cMIP:** the services and the failure condition are the cMIP's fields; attempts per payment; the next payment from the first; the task (the cMIP accepts the agreement and the attempts and produces the receiver for this payment); the core's guarantee (never an address the owners did not sign); every attempt failed leaves the money an open obligation of whoever holds it.
- **Rule 18b (new), each participant's check:** once a purchase triggers the agreement, is my cut at my flow address, or my vault where needed.
- **Rules 16, 18, 23 and 30** and **the split plan's verifier paragraph:** a backup receives a payment only once the attempt before it failed for that payment; the pointer check accepts a backup's pointer; switching for good stays a revocation and clone.
- **Grants:** a backup holds grants as field 14's service does; H5 and H7's limit covers backups.
- **Tier table:** field 29 judicial, as field 14; the "protected clause" definition and rule 46a name the backups.
- **Tasks:** the split task also accepts the agreement and the attempts, and produces the receiver.
- **Decided, Freeze scenarios, Open in this draft:** F249 and F250 recorded; QW1 answered; QS1 added.

**Core v21:** the split service's paragraph, the pointer check and the chain of judgment. **Freeze suite v21:** the split service line, steps 3.7r and 3.9u, scenario 7's step 8a; **step 8b added** (step 13's payment). **Money draft 6:** rule 1's wording (a backup instead of a service the chain names). **Development draft 6:** task 8's row. **The split cMIP draft 1** (new): the services in order, the failure condition, the receiver for a payment, the stated cost, the amounts, delivery. `cmips/README.md` lists it.

### The library (`core/src/agreements/`)

- `formats.rs`: `Judge::SplitService` and `Taker` removed; a chain link's `next` is `(hash, period)`; decoding `[ 2 ]` refuses the terms, naming F250. New `Backups`, `ServiceGrants`, `BACKUPS_FIELD` (29), `SPLIT_TASK` (8), `Terms::backups`, `Terms::split_cmip`, and `check_backups`.
- `tiers.rs`: field 29 judicial, compared by clones.
- `view.rs`: a new caller fact, **`attempts_failed`** (`(payment, service)`: the split cMIP's answer, as `judges_lapsed` is the time reference's). **`signed_receivers`** (the addresses the owners signed, in order) and **`receiver_for`** (the receiver for one payment) are public; `layer_receiver` uses them per split. Every reading of the chain's split-service link (`deal_services`, `named_services`, `carrying_deals`, `collective_split_grant`, `grantors_of`, `pointer_check`) now reads field 29. **`cut_check`** returns a `CutCheck` (due, received, the receipts, receipts paid elsewhere, and where the trail stops), following the payment layer by layer, at most eight deep.
- `wasm/src/lib.rs`: the terms reading drops the split-service judge and adds `backups`. The collective client (`clients/collective/src/explain.ts`) shows field 29 in plain words before signing (rule 4a, client conformance).

### The split cMIP's code (`cmips/split/`, crate `mor-split`)

`route`, `failed`, `Failure`, `Attempt` and `divide`, and two test files: `divide.rs` (sums, rule 15a with turns, the plan's order, refusals, the route) and `step13.rs` (the step's payment, end to end against the core's view, using the core's test world).

## Readings taken (mechanics, listed for you to confirm)

1. **Where the cMIP's fields sit.** Field 14 stays the first address (the designated pointer, F248), unchanged. The backups and the failure condition sit in a new terms field, 29, rather than inside the split plan's parameters (plan key 7). *Why:* the plan is operational, so any area holder could change it; backups move money, as field 14 does, which is judicial (the stated exception). Field 29 keeps the protection the backups had in field 21.
2. **Field 29 is judicial**, as field 14.
3. **Collectives too.** F249 says backups are not judgement, so a collective's backups left the chain as well; a collective's backup is one grant.
4. **The old link `[ 2 ]` is withdrawn, never reused,** and terms carrying it are invalid, as field 25 was. Test terms that used it were rewritten.
5. **No time reference is needed for backups** (F249: F246's stages and deadlines do not apply to them).
6. **Field 29 requires field 14 and a named split cMIP**: field 2's task 8, or the plan's key 1, the same where both name one.
7. **The split task is task 8, extended**: the same cMIP computes the amounts and chooses the receiver. No new task number.
8. **How the core learns an attempt failed:** the caller states it per payment and service, as it states a judge's lapsed period; the payment is the act that pays the agreement (the split of the layer above, or the buyer's receipt or claim). Without it, only the designated pointer counts (fail closed).
9. **Every attempt failed:** no receiver; the money stays an open obligation of whoever holds it.
10. **A backup's grant keys count from the deal's existence**, as F130's reading 2 had it; a backup that received money splits it under the agreement (rule 20 accepts any service the terms name).
11. **The participant's check:** the flow address is any payee pointer on the participant's own chain that counts (rule 12), within what its vault leaves to the flow (rule 14a); the vault is an entry its chain declared and its vault in force still carries. Which pointer version a debt counts toward (rule 14) is the payer's question and is not applied. Only the participant's own receipts count, as for a payout's discharge; the payer's claim alone does not. A split that breaks its plan is followed and named.
12. **Rule numbers:** 18a and 18b, in draft 10's suffix style; draft 11 (F251) renumbers.
13. **Other texts carried along:** Development's task table (task 8) and Money rule 1's wording.
14. **The cMIP's failure condition (draft 1):** refused, silent past a wait (default 60 seconds, set in field 29's key 1), or a request that could not be paid. The payer's word is the evidence (stated cost, above).
15. **The cMIP's amounts (draft 1):** shares off the top in millionths of the amount; the rest by parts, largest remainder, ties to the share listed first in the plan; each stake by rule 15a with turns. Roles, metrics and fees are refused, never guessed.
16. **The client** shows field 29 before signing, because a client that could not show signed terms would break rule 4a.

## Not done here

- **QS1** (above): direct buyers and backups, left for your decision.
- **F252 and F253**, decided this morning and marked "to build with the next Agreements change", are not built: one step per session. F251 starts Agreements draft 11 once this branch is merged.
- The WebAssembly binding takes no `attempts_failed` input yet; no client passes one.

## Tests

Run after rebasing onto main (`0718a46`):

- `cargo test --workspace --locked`: RUST_RESULT
- `scripts/test-all.sh`: TS_RESULT

New tests: `core/tests/agreements.rs` (field 29's format, tier and checks; the withdrawn link refused), `core/tests/agreements_collective.rs` (3.9u and 3.7r on field 29; F248's designation with attempts per payment: a backup paid only after a stated failure, the next payment back to S, never an address not signed), `core/tests/agreements_invariants.rs` (the generator's backup now in field 29), `cmips/split/tests/divide.rs` and `cmips/split/tests/step13.rs`, and the collective client's terms reading.
