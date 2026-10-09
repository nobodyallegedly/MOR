# FORK-HANDS-OUT: the oracle, not the core; and two questions

*9 October 2026. A build session of its own, for the failure the F190 build found and left open (`docs/f190-build-2026-10-09.md`, "One failure found that predates this build"). Read against Law draft 10 (record, type 17; resignation, type 16; fork, type 19; "Made before, made after"; rules 36a, 37a, 37b, 40, 47a), Finance draft 6 (rule 12a) and `docs/reviews/f185-rollback-review-2026-10-08.md`, section 4, story (b). Nothing in `spec/` or in the core library changed.*

## In plain words

### In one paragraph

The failure was the test's mistake, not the library's. The same mistake then showed up four more times as the test was run on more stories. In all five, the library followed the spec and the test's own simplified reading did not, so the test is what was fixed; the library and the spec are unchanged. The larger runs also found two cases of a different kind, where the spec can be read more than one way: a payment's receipt that a fork drawn on an old line takes away, and a fork that becomes complete because of a departure drawn after it. Both questions are written down below for Nobody, allegedly, to answer, and nothing was chosen. In the second, the library's present answer is wrong whichever way it is answered (a binding debt left with no one owing it), so the library will need a fix once the rule is decided.

### What failed

The randomised test of the collectives' promises said: "a complete fork leaves out a debt in its history". A fork must hand every debt the collective owes to one of its successors, or it does not take effect. Here a fork took effect while a debt was missing from its list, and the test called that a broken promise.

### The smallest story

- A collective of five members. Its Finance lane is held by two of them, call them Ben and Eve, and needs both their signatures. It signs from three devices.
- At the start, device 0 records a change of the collective's rules (the clone naming its split service).
- Ben steps down from the Finance lane. Device 1, which has signed nothing yet, draws the record meant to register that. A record sees what came before it through the devices' latest acts it names; this one names only device 2's, and device 2 has signed nothing either. It does not name device 0's, so it cannot see device 0's record.
- Device 0 signs a public debt. The test believes Ben has left the lane, so only Eve signs it.
- All five members sign an honest fork, which leaves the debt out.

### Who was wrong

**The test.** A record of the collective that changes no rule must name the rules in force *for it*, or it is no record that counts ("no line") and registers nothing. What is in force for a record is decided only by the records it can see. Device 1's record cannot see device 0's record, so for it the founding rules are still in force; but it names the newer rules. So it is no line, and Ben never stepped down as far as the protocol is concerned.

So the Finance lane still has two holders, Ben and Eve, and needs both. Only Eve signed the debt. The debt therefore binds no one, and a fork hands out only debts that bind the collective. The core was right to leave it out, and the fork was right to take effect.

The test had assumed every record it drew for a departure registered it. It now checks, by its own walk over what the record points to, whether the record can see the one that put the current rules in force, and counts the departure only then.

### Is the spec clear on this?

Yes, enough not to stop. The record's format says a record naming no clone names the agreement in force for it. That such a record is then no line is the reading the core already takes (`core/src/law/view.rs`, "a record naming no clone names the agreement in force for it"), and the review of 8 October quoted it this way, describing this very situation as its story (b): a device that has not caught up with a rule change records a departure, and the departure does not count. That review left the core's reading as it was and asked the client to name the right agreement. Nothing new is chosen here.

### A second case, found by the larger run

Running the test at 5,000 cases after the first fix found the same message again with a different story, seed `7145587436215071231`:

- A collective of two members; one of them holds the Finance lane alone. It signs from three devices.
- That holder gives an agent a key to act for the lane. The agent signs a public debt.
- Device 0, which has not seen the debt, cancels the agent's key, with the holder's signature.
- Device 2, which has seen the debt, cancels the key too, but without the holder's signature.
- An unrelated grant, then an honest fork by both members, leaving the debt out.

**The test was wrong again.** When a key is cancelled by a device that has not seen something the key signed, that thing is void: the cancellation wins (rule 40, the "tie rule"). It is saved only if the collective itself takes it on by an act that counts, for instance one pointing to it. Device 2's cancellation points to the debt, but the cancellation of a key inside the Finance lane counts only with that lane's holder's signature (rule 40: "judged by that area alone"), and it has none. So nothing took the debt on, it binds no one, and the fork was right to leave it out. The test already knew this rule (it checks it elsewhere, as TIE-REVOCATION), but its expectation for forks forgot it. The library's own earlier fix IC3 had settled that a void act stays void inside a fork's history.

### A third case, found by the same larger run

With the second fix in, the same seed ran further and failed at its 4,350th story:

- A collective of three members; one of them holds the Finance lane alone. It signs from two devices.
- Device 1 signs a public debt, and the lane's holder signs it.
- The lane's holder then leaves the collective. Device 0, which has not seen the debt, draws the record registering that.
- An honest fork by the two who remain, leaving the debt out.

**The test was wrong a third time.** A departure takes effect at the record registering it, and from there the leaving member's voice "is gone for every act the line's history does not hold" ("Made before, made after", points 3 and 7). Device 0's record does not hold the debt, so the debt counts as made after the departure. The Finance lane then has no holder left for it, so the lane is frozen for it (rule 37b), and the holder's signature, placed at the debt, comes too late. The debt binds no one, and the fork was right to leave it out. The test had taken "the holder signed it" as enough, wherever the debt stood. It now judges the lane at the debt's place, counting each departure registered by a line, in the fork's history, that does not hold the debt.

This is the race the spec already describes for counterparties: a creditor is safe once a later act of the collective cites the debt (rules 35a, 43); here nothing did.

### A fourth case: my own first fix for the third was too generous

My first fix for the third case let any debt that a later act of the collective pointed to count as signed, since the collective "took it on" (rule 40, IT2a). The same seed then failed again, at its 4,385th story:

- The same collective. Device 1 signs a debt, and the lane's holder signs it.
- The holder steps down from the Finance lane; device 0 draws the record, without having seen the debt.
- The holder then leaves the collective altogether; device 0 draws that record too, and this time it names device 1's latest act, so it sees the debt.
- Device 0 signs an unrelated grant. It points to device 0's latest record, so the debt is in its history: the collective took the debt on.
- An honest fork, leaving the debt out.

**The test was wrong, not the core.** The rule for this is the reading Nobody, allegedly, confirmed with F132: a debt the collective took on "counts if it counts as judged, or once the departures racing its citation are set aside". A departure "races" the citation when neither has seen the other. Here the stepping down came *before* the grant that took the debt on (the grant's history holds it), so it is not set aside. Judged with it, the lane is frozen for the debt, and the debt binds no one. Taking a debt on protects it from a departure the collective had not yet seen when it took the debt on, never from one it had already seen. The test now follows that reading: it judges the debt as it stands, and, if the collective took it on, once more with the departures racing that citation set aside, and expects the fork to hand it out if either judgment counts. A new named test checks both sides: the case above (left out), and the same stepping down with the debt cited instead by device 1's next act, which has not seen the stepping down, so that the stepping down is set aside and the fork must hand the debt out.

### A fifth case, found on a fresh seed

Every property at 5,000 fresh cases then found one more, seed `11735650117398688613`:

- Two members; one holds the Finance lane alone. Three devices.
- On device 0, the holder gives an agent a key within the lane.
- The holder steps down from the lane; device 1 draws the record, without having seen the grant.
- The agent signs a debt; device 0 cancels the key without the holder's signature (so the cancellation does not count).
- An honest fork, leaving the debt out.

**The test was wrong again**, by the same rule as the third case, applied to the grant instead of the debt. The record that registers the stepping down has not seen the grant, so the holder's voice is gone for the grant, the lane is frozen for it, and the grant never counted. The agent's debt is backed by nothing. The test had taken the grant as counting because the holder had signed it. It now judges the grant the way it judges a debt of the lane.

### What the five share

The cases are not related to one another: the first is about which record counts, the second about a cancelled key, the third about a departure racing a debt, the fourth about when taking a debt on saves it, the fifth about a departure racing a grant. What they share is the test's single shortcut, "within its signer's powers" read as "the right people signed it", which the spec does not allow. Each time the core followed the spec.

### A question for Nobody, allegedly: does a fork on an old line take away a payment's rail?

Found by the same seed as the second to fourth cases, `7145587436215071231`, at its 4,847th story, once those were fixed. It is a different promise: "a buyer who waits until the collective has visibly taken their payment on is safe".

**The story.**

- A collective of five sells a work. Its Finance lane chose which payment rail it accepts, by a payee pointer signed on device 0.
- A buyer pays. The split service's receipt for the payment counts, and device 1's next act cites it: the collective has visibly taken the payment on, and the buyer is safe, as the spec promises.
- A member leaves.
- All the members sign a fork on purpose on an old line: device 0's line is drawn two acts back, before the pointer.

**What happens now.** The fork's history holds the receipt and device 1's act citing it, but not the pointer. Acts outside a fork's history count for nothing (rule 47a), so the pointer counts for nothing. A receipt counts only on a rail the payee's pointer names (Finance rule 12a). So the receipt stops counting, and the payment the buyer made is no longer recorded, although everything about the payment itself is inside the fork's history.

**Why I could not decide.** The spec can be read two ways, and a third is possible:

1. **As the library does now.** The pointer is void after the fork, so the receipt has no rail. A fork drawn on an old line is already a stated cost (IT2b: everything outside its history is void, and it needs every signer to choose it). This would add that it can also undo a receipt *inside* its history, by leaving out the pointer the receipt relied on. The test would then count this as that stated cost, not as a failure.
2. **As the payment stood.** Finance rule 12a, rewritten for F181, judges the pointer "as the chain stood for" the payment. The pointer counted when the payment was made and received. Read that way, a pointer the fork leaves out still counts for payments already made to it, and is void only for what comes after. The library would then be wrong here, and would change.

A third way, failing closed: a verifier that sees, inside a fork's history, a receipt relying on a pointer outside it treats the fork as not complete, as it does for history it does not hold.

F181's "as the chain stood" was written for the payee's own identity chain (locks and rotations), not for a collective's ending, so the text has not met this case before.

**Which do you want: (1) a stated cost, (2) the pointer stands for payments already made to it, or (3) the fork is not complete?** Until then, the test reports it as a failure at that seed and at 5,000 cases; the default run (48 cases) does not reach it.

### A second question for Nobody, allegedly: can a departure drawn after a fork decide whether the fork took effect?

Found by the 10,000-case run, seed `7020607380199548456`, at its 2,836th story.

**The story.**

- Two members; one of them, say Ana, holds the Finance lane alone. Two devices.
- Device 1 signs a debt, and Ana signs it for the lane. The debt binds the collective.
- Both members sign a fork that leaves the debt out. A fork must hand out every debt it can see, so this one does not take effect: the library says so.
- Then Ana leaves the collective. Device 0 draws the record registering that, without having seen the debt.

**What the library says now.** Seen from Ana's departure, the debt counts as made after it (it is not in that record's history), so for the fork's check the lane has no holder for the debt and the debt does not bind. So the fork, which left it out, now takes effect, and the collective is ended. But once the collective is ended by that fork, a record drawn after it counts for nothing (the earlier fix IC8), so the departure counts for nothing, and the debt binds again. The library ends with all three at once: the fork complete, the debt binding, and no successor owing it. The creditor has lost their debtor.

That answer is wrong under any reading, but how to fix it depends on a rule the spec does not state: **for a fork's check of the debts it must hand out, which departures count?**

1. **Only those registered before the fork's line** (in its history), as the fork's own check of who may sign it already says ("the departures registered before it counted"). A later departure never changes whether the fork took effect: here the fork stays incomplete, and the members must draw a new one. This matches the reading in the fork's text, still marked "to confirm": "whether a fork took effect never changes with what happens after it".
2. **Also later ones the debt's own history does not hold**, as point 7 of "Made before, made after" says for acts in general ("a member's voice a line removes is gone for every act the line's history does not hold"). Then the fork does take effect, and the departure must keep counting after it for that debt, so the debt does not bind; the rule that a record after an ending counts for nothing (IC8) would need an exception for it.

**Which do you want, (1) or (2)?** The test's own reading follows (1): it counts only departures in the fork's history. That is the reading this question asks about, so the test's verdict here is not a decision; under (2) the test would change too. Nothing in the library was changed; the run at that seed fails on it.

### One reading the core takes, for Nobody, allegedly, to know (not a failure)

Where several acts of the collective took the same debt on, each having missed a different departure, the core sets aside every departure that *any* of them missed, all at once. "The departures racing its citation" could also be read one citation at a time. No story here depended on the difference, the test now mirrors the core, and nothing was chosen in this session; it is noted only so that the reading is visible.

### What the client should take from the first case

This is the same lesson as story (b): a device drawing a record should first catch up with the collective's latest records. The display client's conformance on this is already noted in that review. No new rule.

## Precisely

**Replay before the fix:** `LAW_INVARIANT_SEED=12903442695522571031 LAW_INVARIANT_CASES=1500 cargo test -p mor-core --test law_invariants -- --exact collective_promises_hold --nocapture`, failing at case 807 with the shrunk story:

```
Shape { members: 5, devices: 3, member_devices: 1, constitutional: None, lane: Some((18, 2)), owns_work: true }
Resign { member: 21, area_only: true, dev: 7, tips: 12, inform: false }   // member 1 steps down; record on device 1, naming device 2's (empty) tip
Debt { dev: 0, seal: Public, cited: true, creditor: 0, amount: 1, lane_sign: true }   // the oracle had member 4 sign alone
Fork { stale: 0, sides: 0, debts: Honest, seal: Public, all_sign: true, succ_sign: false, names: false }
```

**What the core said.** `record(col, rec)`: `line = false`, "a record naming no clone names the agreement in force for it". The setup's record putting the split-service clone in force is on device 0; the stepping-down record names only device 2's tip, empty, and has no earlier act of its own, so its history holds no record, and the founding terms are in force for it (record, type 17: "for the agreement in force at a record, only the records before it count", B2). It names the clone instead. `consent(debt)`: the Finance area counted among both holders, two needed, one signer, not met; `obligation_binds(debt) = false`; the fork, `complete`, lists no debt. Each is what Law draft 10 says (rule 36a: the area's holders whose voice remains; fork, type 19: "an obligation is handed out only if it binds the collective", F144).

**What the oracle did.** `Op::Resign` pushed every departure into `departures`, from which `lane_now()` and `gone()` are read, whatever the record. `lane_sign` then had member 4 alone sign the debt, and FORK-HANDS-OUT's `should` took `lane_signed` non-empty as "within its signer's powers".

**Fix** (`core/tests/law_invariants.rs`, `Op::Resign`): `ColWorld` keeps `current_record`, the record that put `current` in force (`setup_sales`); a departure is pushed only when the record's history, by the oracle's own `history_of` walk, holds it, or when the founding terms are in force. A record so drawn is still noted as a record, so every other check sees it as before.

**Named test** `of1_a_record_naming_an_agreement_not_in_force_registers_nothing`: the shrunk story as found (the whole `check()` passes; it failed on the old oracle, checked by reverting the oracle's change alone); then the same with the successors signing, asserting the record is no line, both holders sign the debt, it binds, and the complete fork hands it out; then the record naming device 0's tip too (`tips: 13`), so it is a line and registers the stepping down, member 4 alone meets the lane (rule 37b, fewer holders remaining than the threshold), the debt binds and the complete fork hands it out.

**Second case: replay before the fix:** `LAW_INVARIANT_SEED=7145587436215071231 LAW_INVARIANT_CASES=5000 cargo test -p mor-core --test law_invariants -- --exact collective_promises_hold --nocapture` (the release profile was used; the stories do not depend on it), shrunk to:

```
Shape { members: 2, devices: 3, member_devices: 1, constitutional: None, lane: Some((1, 1)), owns_work: false }
Grant { dev: 0, agent: 0, in_area: true, accept: true, holders_sign: true }
AgentAct { grant: 0, strand: 0, what: InScope, seal: Public }          // a debt of 25 on the grant key's strand
Revoke { grant: 0, dev: 0, join_strand: false, holders_sign: true }    // counts; its history does not hold the debt
Revoke { grant: 0, dev: 50, join_strand: true, holders_sign: false }   // device 2; cites the debt; does not count
Grant { dev: 45, agent: 0, in_area: false, accept: false, holders_sign: false }
Fork { stale: 0, sides: 0, debts: Honest, seal: Public, all_sign: true, succ_sign: false, names: false }
```

The core: `backing(debt)` is `NotBacked`, "the revocation ended the grant, and its history does not hold the act: the ending wins (the tie rule, F128 G1)"; device 2's revocation does not count (`consent` not met: the Finance holder never signed it); `obligation_binds(debt) = false`; the fork is complete and lists no debt. FORK-HANDS-OUT's `should`, for a debt signed with a grant key, asked only that the grant counts and the debt lies in its reach, never whether a revocation or a line emptying the area voids it.

**Fix:** the oracle's two tie-rule readings for grant keys, until now written inline in TIE-REVOCATION and TIE-EMPTIED, are now two methods, `voiding_revocations` and `voiding_lines`, unchanged in substance; those checks call them, and FORK-HANDS-OUT's `should` for a grant key's debt now also requires both to be empty.

**Named test** `of2_a_fork_leaves_out_a_debt_a_revocation_voided`: the shrunk story (the debt in the fork's history, void by G1, not binding, the complete fork listing nothing, `check()` passing; it failed on the old `should`, checked by removing the new condition alone); then the same with device 2's revocation signed by the holder, so that it counts and adopts the debt (rule 40, IT2a), and the complete fork must hand it out.

**Third case: replay** as for the second (seed `7145587436215071231`, 5,000 cases), shrunk to:

```
Shape { members: 3, devices: 2, member_devices: 1, constitutional: None, lane: Some((1, 1)), owns_work: false }
Debt { dev: 61, seal: Public, cited: true, creditor: 0, amount: 1, lane_sign: true }   // device 1; member 0, the lane's holder, signs
Resign { member: 63, area_only: false, dev: 110, tips: 120, inform: false }              // member 0 leaves; record on device 0, naming no tip
Fork { stale: 0, sides: 0, debts: Honest, seal: Public, all_sign: true, succ_sign: false, names: false }
```

The core: `consent(debt)` is `Areas`, the Finance area `frozen: true`, no voices; `obligation_binds(debt) = false`; the fork is complete and lists no debt.

**Fix:** a method `lane_meets(d, he, aside)`: the lane's holders less those whose departure a line in the fork's history `he` registers without holding `d`, the records in `aside` left out; none left, false (frozen); otherwise the holders among them who signed `d` must number at least the threshold, or all of them where fewer remain. (Its first form also let any adopted debt through; that was too generous: see the fourth case.)

**Named test** `of3_a_departure_racing_a_debt_freezes_the_lane_for_it`: the shrunk story (the fork's history holds the debt and the line, the line does not hold the debt, the area frozen, the debt not binding, the complete fork listing nothing, `check()` passing; it failed on the old `should`, checked by removing the new condition alone); then the record naming device 1's tip (`tips: 122`), so the line holds the debt and the holder's voice remains for it: the debt binds and the complete fork hands it out.

**Fourth case: replay** as for the second, shrunk to:

```
Shape { members: 3, devices: 2, member_devices: 1, constitutional: None, lane: Some((1, 1)), owns_work: false }
Debt { dev: 61, seal: Public, cited: true, creditor: 0, amount: 1, lane_sign: true }      // device 1; member 0 signs
Resign { member: 63, area_only: true, dev: 110, tips: 120, inform: false }                // member 0 steps down; record on device 0, no tip
Resign { member: 0, area_only: false, dev: 0, tips: 2, inform: false }                    // member 0 resigns; record on device 0, naming device 1's tip
Grant { dev: 14, agent: 0, in_area: false, accept: false, holders_sign: false }           // device 0: counts, its history holds the debt
Fork { stale: 0, sides: 0, debts: Honest, seal: Public, all_sign: true, succ_sign: false, names: false }
```

The core: `consent(debt)` frozen, no voices; `obligation_binds(debt) = false`; the fork complete, listing nothing. The stepping-down record lies in the grant's history (`cited_against` sets aside only a line the citing act does not follow).

**Fix:** `lane_counts(lv, d, he)`: `lane_meets(d, he, {})`, or, where `adopters(d)` is not empty, `lane_meets(d, he, aside)`, `aside` being the departures' records that some adopting act's history does not hold; `lane_meets` takes the records to set aside. FORK-HANDS-OUT's `should` asks `lane_counts`.

**Named test** `of4_a_departure_before_the_citation_is_not_set_aside`: the shrunk story (one adopter, the stepping down in its history and not holding the debt, frozen, not binding, the complete fork listing nothing, `check()` passing; it failed on the original `should`); then the stepping down racing a citation by device 1's next act (`Publish { dev: 1 }`): as judged frozen, set aside it counts, the debt binds and the complete fork hands it out.

**Fifth case: replay:** `LAW_INVARIANT_SEED=11735650117398688613 LAW_INVARIANT_CASES=5000 cargo test -p mor-core --test law_invariants -- --exact collective_promises_hold --nocapture`, failing at case 3,232, shrunk to:

```
Shape { members: 2, devices: 3, member_devices: 1, constitutional: None, lane: Some((1, 1)), owns_work: false }
Grant { dev: 57, agent: 0, in_area: true, accept: true, holders_sign: true }      // device 0
Resign { member: 32, area_only: true, dev: 13, tips: 44, inform: false }            // member 0 steps down; record on device 1, not holding the grant
AgentAct { grant: 0, strand: 0, what: InScope, seal: Public }                       // a debt
Revoke { grant: 0, dev: 0, join_strand: true, holders_sign: false }
Fork { stale: 0, sides: 0, debts: Honest, seal: Public, all_sign: true, succ_sign: false, names: false }
```

The core: `consent(grant)` is not met (the holder's voice gone for it, the area empty); `backing(debt)` is `NotBacked`, "the grant does not count"; `obligation_binds(debt) = false`; the fork complete, listing nothing. The oracle took `GrantInfo::holders_signed` as the grant counting; `voiding_lines` covers only lines that hold the grant.

**Fix:** `make_grant` keeps the holders who signed the grant in `lane_signed`, as for a debt; FORK-HANDS-OUT's `should` for a grant key's debt, its grant within the area, also asks `lane_counts(grant)`.

**Named test** `of5_a_grant_racing_the_line_that_empties_its_area_never_counts`: the shrunk story (the line not holding the grant, the grant not counting, the debt not backed, the complete fork listing nothing, `check()` passing; it failed without the new condition); then the record naming device 0's tip (`tips: 45`): the line holds the grant, which counts, and the agent's debt, after the line that emptied the area, is void all the same (G2) and not handed out.

**The question's story: replay:** `LAW_INVARIANT_SEED=7145587436215071231 LAW_INVARIANT_CASES=5000 cargo test -p mor-core --test law_invariants -- --exact collective_promises_hold --nocapture`, failing at case 4,847 on SAFE-ONCE-CITED, shrunk to:

```
Shape { members: 5, devices: 3, member_devices: 1, constitutional: None, lane: Some((8, 1)), owns_work: true }
Sale { strand: 182, proof: 0, disguise: None, lane_sign: true, line_current: false }   // the split service's receipt
Join { dev: 139, other: 103 }                                                             // device 1 cites it
Resign { member: 0, area_only: false, dev: 29, tips: 14, inform: false }                  // record on device 2, a line
Fork { stale: 2, sides: 0, debts: Honest, seal: Public, all_sign: true, succ_sign: false, names: false }
```

Device 0's sequence holds four acts (the grant to the split service, the record of its clone, the payee pointer, the work's publication); the fork's line names its second. The core, after the fork: the pointer `Closed`; the receipt `RailNotAccepted` (`rail_not_accepted`, `core/src/law/view.rs`, asks for a pointer of the collective naming the rail whose `consent` counts now); the citing act counts; the fork complete and ending the collective, its history holding the receipt and the citing act. The oracle's SAFE-STALE-LINE, IT2b's stated cost, covers only a citing act left out by the line; here it is a supporting act. Nothing was changed for it.

**The second question's story: replay:** `LAW_INVARIANT_SEED=7020607380199548456 LAW_INVARIANT_CASES=10000 cargo test -p mor-core --test law_invariants -- --exact collective_promises_hold --nocapture`, failing at case 2,836 on FORK-HANDS-OUT, shrunk to:

```
Shape { members: 2, devices: 2, member_devices: 1, constitutional: None, lane: Some((1, 1)), owns_work: false }
Debt { dev: 7, seal: Public, cited: true, creditor: 0, amount: 1, lane_sign: true }        // device 1; member 0 signs
Fork { stale: 0, sides: 0, debts: DropOne, seal: Public, all_sign: true, succ_sign: false, names: false }   // leaves the debt out
Resign { member: 92, area_only: false, dev: 20, tips: 132, inform: false }                  // member 0 leaves; record on device 0, naming no tip of device 1
```

The core, after each step: the debt binds; then the fork is not complete ("the fork hands out every obligation in the history it cites, or does not take effect (F127)"); then the fork is complete and the collective closed by it, while `obligation_binds(debt) = Some(true)` and `debtors(debt) = Some([])`. The record is a line registering the departure, outside the fork's history, and does not hold the debt. Judging the fork, `departure_lines` leaves out its check of the ending at a line point ("a line's own judgment is part of judging the ending"), so the record counts there; judging the debt as an act, the record lies after the ending and registers nothing (IC8). The oracle's `lane_meets` counts only departures whose records lie in the fork's history (reading 1). Nothing was changed for it.

## Results

All runs on the final code, the release profile (the stories do not depend on it; earlier reports used debug builds).

| Run | Cases | Result |
| --- | --- | --- |
| `collective_promises_hold`, seed 12903442695522571031 (the failure assigned) | 1,500 | passed (122 s) |
| `collective_promises_hold`, seed 11735650117398688613 (the fifth case) | 5,000 | passed (425 s) |
| `collective_promises_hold`, seed 7145587436215071231 (the second to fourth cases) | 5,000 | passes the cases fixed; fails at case 4,847 on the first question |
| every property, fresh seeds (collective 6524120664935024780, collective order 671306332230212826, deal 15630267128818504730, deal order 13038650476811743564, stakes 7388054547205481166, leftovers 6154070690504286053) | 5,000 each | all 29 tests passed (501 s) |
| `collective_promises_hold`, fresh seed 7020607380199548456 | 10,000 | fails at case 2,836 on the second question |
| `cargo test --workspace --locked` (debug, the default 48 cases) | — | 453 passed, none failed, 1 ignored |

Coverage in the 5,000-case collective run: 230,477 acts judged; 2,017 complete forks and 545 complete closings; 2,106 collectives ended; 4,519 debts binding; 1,147 grant-key acts binding and 4,087 void; 2,081 revocations counting; 155 areas emptied; 1,028 purchases and 609 refunds. Stated costs met, not failures: SAFE-STALE-LINE 55, ENDING-RACE 2, ENDING-LATE 2. An intermediate run with OF1 and OF2 only also passed every property at 5,000 fresh cases.

So every test is green at the default number of cases, as CI runs it, and at 5,000 fresh cases; the two seeds that still fail stop on the two questions, not on anything this session could settle.

**WebAssembly.** Unchanged: only `core/tests/law_invariants.rs` and this report changed; nothing under `core/src` or `wasm/` did, so the display client needs no release for this.
