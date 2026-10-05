# Law invariants: random histories against Law draft 10

*5 October 2026. Law stress testing, first part: invariant hunting (roadmap, "Law stress testing, decided by Nobody, allegedly, 5 October 2026"). Branch `claude/law-invariants`, from main after the core pass. Tested against Law draft 10, Finance draft 6, Identity draft 11 and findings F1 to F130. No rule in `spec/` was changed: this session tests, it does not redesign.*

## In plain words

### What was done

Law makes promises: nobody's share moves without their signature; a split pays everyone exactly; a collective's act counts only once every member can read it; a fork hands out every debt it knows of; and so on. Each promise was written down as a sentence a machine can check, tied to the rule or finding it comes from.

Then a generator wrote random stories, thousands of them. A story is a collective of two to five members, signing from one to three devices each, or a deal of two to four parties, with everything that can happen to it: debts, payments, agents hired with grant keys, revocations, members leaving, forks, closings, sales, split services and their backups, splits of incoming money. Some of the people in the stories are honest. Others cheat: they steal someone's everyday key, seal an act to only some of the members, sign from a device that has not heard the news, race a revocation, fork the collective twice, pass off a payout as an incoming payment, or forge a receipt for a debt they never paid.

The core library judged every story, and each promise was checked against what it said, by a separate, much simpler reading of the same acts. Each story was then delivered again in shuffled orders, with the verifier asked questions while the acts were still arriving, and every verdict had to come out the same.

When a promise broke, the tool shrank the story to the smallest one that still breaks it, often one to four acts long. Every such smallest story is now a permanent named test.

Each failure was sorted into one of two kinds:

- **CODE**: the library broke a rule that the text states clearly. The code was fixed, and the test keeps it fixed.
- **TEXT**: the rule itself allows the failure, says nothing, or can be read two ways. Nothing was changed. Each is described below with its smallest example and options, for Nobody, allegedly, to decide.

### What held, and over how many stories

| Promise | Held? | Stories |
| --- | --- | --- |
| No stake or share moves without its holder's signature; a deal changes only with every party; a thief's signature counts for nothing once its victim rotates | Held | 5,000 deals (5,435 versions in force, 776 thief's signatures voided), 10,000 collective clones |
| Every split sums exactly; every payout matches its stake within the rounding the text allows | Held after one fix (IC7) | 5,000 deals (3,887 splits) |
| The same acts, in any order, or with some arriving late, give the same verdicts | Held after one fix (IC6) | 1,500 collectives and 1,500 deals, each delivered three ways |
| The same acts always give the same answer | Held | the same |
| Nothing published after a complete fork or closing undoes it | **Broken by the text (IT1)** | 5,000 collectives |
| An act in a collective's name sealed to too few members, or citing nothing on its chain, never binds | Held after one fix (IC1) | 5,000 collectives |
| The tie rule: an act an ending's history does not hold is void, in every order | Held after one fix (IC3) | 5,000 collectives |
| A fork takes effect only if it hands out every debt in its history; no successor owes a debt not handed to it | Held after one fix (IC5) | 5,000 collectives |
| A collective with an open debt cannot close | Held after one fix (IC2) | 5,000 collectives |
| A grant key never acts beyond its reach, after its revocation, after its area empties, or after a fork's line; never signs a decision; a split service's key signs only incoming receipts | Held after one fix (IC3) | 5,000 collectives and 5,000 deals |
| A counterparty that waits until the collective cites its act is safe | **Broken by the text (IT2)** | 5,000 collectives |
| A payment is never both a purchase and owed back | Held after one fix (IC4), **except where the text is silent (IT3)** | 5,000 collectives and 5,000 deals |

### What broke because of the code, now fixed

- **IC1. A debt the collective never really made still bound it.** A debt in the collective's name that cites nothing on the collective's chain, or that its Finance lane's holders never signed, counts for nothing (rules 35b, 36a). One part of the library knew this; the part that answers "does this debt bind?" never asked it. *Smallest story: one debt, citing nothing.*
- **IC2. A collective could "pay" its own debt by writing itself a receipt, and then close.** Finance says a debt is paid by money reaching the creditor (Finance rule 7). The library counted any receipt naming the debt, whoever signed it. *Smallest story: a debt, a receipt the debtor signs itself, a closing.*
- **IC3. A revoked agent's act came back to life inside a fork.** Two devices revoked an agent's grant; one had seen the agent's act, the other had not, so by the tie rule the act was void. A later fork whose history happened to hold it made it binding again. *Smallest story: a grant, one act, two revocations, a fork.*
- **IC4. One payment was a purchase and a refund at once.** The collective acknowledged one receipt of a payment; another receipt of the same payment (the same rail proof) was judged "never recorded, refund it". Rule 32a counts an acknowledgement of the payment. *Smallest story: two receipts for one payment, an acknowledgement, a fork.*
- **IC5. A successor was named as owing a debt from outside the fork's history.** The tie rule says such a debt binds no one and no successor owes it, whatever the fork act lists. *Smallest story: a debt, a fork drawn one act earlier that lists it anyway.*
- **IC6. The order in which acts arrived showed through.** The verifier kept some of its lists in arrival order, so the explanation of why a fork failed listed debts in a different order on different computers. The verdicts were the same, but the same acts must give the same answer, explanations included. *Smallest story: two debts and a fork, delivered in two orders.*
- **IC7. Very large numbers broke the arithmetic.** A split whose payouts add up to more than the computer's largest number crashed the verifier (and on a release build would have wrapped round, possibly to exactly the amount received). Shares in terms had the same weakness: crafted shares could wrap round to exactly 1,000,000 and pass. *Smallest story: one receipt and one split with two enormous payouts.*

Two older tests of the label had relied on IC1 and IC2: their debts were never signed by the label's treasurer, who holds its Finance lane, and one debt was "paid" by a receipt from someone other than its creditor. Their setup was corrected (the treasurer signs; the creditor signs its own receipt); what each test checks is unchanged.

### What broke because of the text: for Nobody, allegedly

**IT1. A second fork undoes the first.** Law says "a complete fork is never undone", and also (reading 4 of F125, confirmed) "any two complete forks or closings of one collective are concurrent, and neither ends it". Both cannot hold once time passes.

*Smallest example.* Ana and Ben fork their collective into two successors. The fork is complete: the collective is ended, the successors own its works and owe its debts, its offers are withdrawn. Days later, Ana and Ben sign a second fork (or, under a constitutional rule of two of three, a different two members do). It is complete too. The two forks are "concurrent", so neither ends the collective: it is alive again, its later acts count, the successors no longer owe its debts, and buyers who relied on the first fork are back where they started. A closing published later does the same.

*Options.*
1. Keep reading 4, and restate the promise: a complete fork is never undone over a debt, but a second complete ending of the same collective undoes it; cost stated, clients warn before signing one.
2. A complete ending stands: a later fork or closing of the same collective counts only if it names the first (a successor forking again is a fork of the successor, as now); for two endings truly made without knowing each other, neither counts until one names the other.
3. Let each signer's own sequence order it: a member's signature on an ending, made after its own signature on a complete ending of the same collective, counts for nothing. Under any rule where two majorities share a member, a second fork can then never complete.

**IT2. "Wait until the collective cites your act" is not always enough.** Law tells counterparties: wait until a later act of the collective cites your act before performing; "from then on it is in every ending's history" (rules 35a, 43). With several devices it is not.

*Smallest example, first shape.* A collective signs from two devices. Its agent sells something with its grant key. Device 1 records the sale in its next act, so the buyer pays and receives. Device 0, which has not yet heard of that act, revokes the agent's grant. The revocation and the sale cite neither each other, so by the tie rule the revocation wins and the sale is void, although the collective had visibly cited it.

*Second shape.* The collective signs a debt; its next act cites it. The members then fork, naming as the fork's line the device's tip as it stood before the debt, which leaves out both the debt and the act citing it. Nobody can tell a line drawn early on purpose from one drawn before the later acts existed. The fork is complete, the debt lies outside its history, so it is void, and no successor owes it: the creditor who waited has no debtor.

*Options.*
1. Keep the tie rule, and restate the promise as conditional: safe once the act is cited, unless an ending is drawn on a device that has not heard of it, or on a line drawn earlier; client conformance: devices share their tips before drawing any ending, as before a rotation; cost stated.
2. An act that another counting act of the collective cites can no longer be voided by an ending racing it: the tie rule voids only acts the collective has never cited. A revocation from an uninformed device then cannot reach a cited sale, and a fork drawn early must still hand out a cited debt, or it does not take effect.
3. For forks and closings only: a verifier that holds an act of the collective cited by another of its acts, outside the ending's history, does not count the ending as complete (fail closed, as for acts it does not hold), so members cannot cut history by drawing an early line.

**IT3. One payment whose receipts name different claims.** On a push rail, one rail payment to several holders carries one rail proof on each holder's receipt (rule 32a, W4 reading). Nothing says what the payment is when those receipts name different claims: one names the version the deal has just replaced, another the current one. The library judges each receipt alone, so the one payment is a purchase by one receipt and a refund by the other. Finance rule 8a pulls the other way: receipts may share a rail proof only if they name the same batch, otherwise neither counts until the receiver resolves them; W4's reading lets holders share a proof with no batch.

*Smallest example.* Ana and Ben change their song's shares from 50/50 to 33/67 by a new version both sign. A buyer's push payment then reaches them both, under one rail proof; Ben's wallet signs two receipts for it, one naming the old version, one the new; Ana's names the new. Ben's old-version receipt comes after his signature on the new version: refund. The other two: purchase.

*Options.*
1. Finance 8a decides: receipts sharing a rail proof that disagree on the claim named count neither, the payment unrecorded until the receiver signs one that resolves them; W4's reading then needs 8a to allow holders' receipts to share a proof (name it as one batch, or say so).
2. The payment is judged as a whole: the claim is the one the payment's commitment names (the payment cMIP), and a receipt naming another claim is a wrong receipt, shown as such, counting for nothing.
3. Keep judging each receipt alone; cost stated: one payment can be shown as both.

### What this did not test

The generators did not exercise: rotations of a collective (its safety key ceremonies), succession plans and abandonment declarations (stakes moved by a clause the holder signed are covered only through ordinary clones), keepers, timed releases, standing offers (their format is open), the tie rule for members' own votes in an area racing their departure, and fees falling alike on several stakes of one split (the split plan's format is open, and the text says the core checks the split, not the plan). An act "citing a stale head" is allowed by the text (an act cites the head "as its signer knew it"); what was tested is an act citing nothing at all. The "within one smallest unit" promise is the text's own tolerance: below the exact share by less than one unit, and above it by fewer units than the stake has holders (rule 26, reading 7 of F125).

## Precisely

### Files

- `core/tests/law_invariants.rs`: generators, oracle, invariants, the order replay, and the named counterexamples.
- `core/tests/common/mod.rs`: the test `World` logs every act it holds (with the content key a recipient opens it with), so a story can be replayed into a fresh verifier in any order.
- `core/Cargo.toml`: `proptest = "1"` as a dev-dependency.

Run: `cargo test -p mor-core --test law_invariants` (48 cases per property by default, so the suite stays quick); `LAW_INVARIANT_CASES=5000` for a large run. Failures print the shrunk story; each property also prints how often each kind of event really happened (coverage) and how often each TEXT finding was met.

### Generators

**The collective world** (`collective_promises_hold`, `collective_verdicts_do_not_depend_on_order`). A shape: 2 to 5 members, each with 1 to 3 devices of their own; the collective signing from 1 to 3 devices; a constitutional change rule of every party or a threshold; optionally a Finance lane (area 2) held by a random non-empty subset with a random threshold; optionally a work the collective owns, in which case it also names a split service by a grant (in its Finance lane where it has one) put in force by a judicial clone every member signs, recorded, with a payee pointer and a publication of the work. Then 1 to 27 steps, each drawn from:

| Step | What it does |
| --- | --- |
| Publish | a publication on a device, public, sealed to every member, or sealed to too few |
| Debt | an obligation on a device, to one of two creditors, sealed three ways, citing the chain or nothing, signed or not by the Finance lane's holders |
| Join | a publication on one device citing the head of another device or of a grant key's strand |
| Grant | a grant to one of two agents, in the Finance area or in none, accepted or not, its area's holders signing or not; its grant key's two strands |
| AgentAct | an act signed with a grant key, on one of its two strands: within its reach, beyond it, or a decision (a record, a grant, a revocation); sealed three ways |
| Revoke | a revocation on a device, citing the strand's heads or not, its area's holders signing or not |
| Ack | the collective acknowledges an agent's act (an adoption) |
| Resign | a member resigns or steps down from the Finance area, registered by a record on a device naming some other devices' tips, the other devices told of it or not |
| Fork | two sides drawn from the members whose voice remains (under a threshold rule, one may sign no side), each founding its successor first; the line at the devices' tips or 1 to 2 acts back (stale); the debts the library says must be handed out, one fewer, none, or one more from outside the history; sealed three ways; every member signing or one missing; the successors signing or not |
| Closing | the line latest or stale, sealed three ways, every member signing or one missing |
| Pay | a receipt naming a debt, by its creditor, by the debtor itself, or by a stranger; in full or half |
| Release | a creditor's release, by the creditor or by a stranger |
| Sale | a receipt for the work's publication naming the claim, by a device or by the split service's grant key; one of three rail proofs (so receipts share proofs); disguised as a payout (the payer is the service, or a batch) or not; the Finance lane signing or not |

Each step draws its own randomness from what it is, so shrinking a story never changes the steps it keeps.

**The deal world** (`deal_promises_hold`, `deal_verdicts_do_not_depend_on_order`). 2 to 4 parties, a stake in their work in random shares; optionally a split service holding one grant per payee (F129 H4), and a backup service named by the chain of judgment, one grant per payee (F130 H6), with a time reference; every party signing the founding terms, or one missing. Steps: a clone with new shares from the latest version or from any version, signed by some parties, some signatures a thief's (a copy of the party's everyday key, signing from a sequence of its own); a party's rotation keeping only its own sequence; a payee's revocation, citing the service's last act or not; a receipt by the service's or the backup's grant key, honest or disguised (payer is a service, a batch, money another party received, money under another agreement); a push-rail payment, each payee in a random subset signing its receipt for one rail proof, naming the old claim or the current one; a split of an incoming receipt, exact, with one payout moved by up to three units, or with payouts that overflow, delivered to every holder or not.

**Stakes in a collective** (`collective_stakes_move_only_with_their_holders`). 2 to 4 members and 0 to 2 departed holders sharing the collective's stake in itself; a clone redrawing the shares (sometimes dropping a member's share), its mark the clone rule; random holders sign; some signatures made but not named by the record (A2); a record puts it in force or not.

### The oracle

History (F127) is read independently of the library: from a set of starting acts, follow each act's previous act in its sequence, its `objects` entries on the collective's chain, and, for a record, its kept tips, transitively. A fork's or closing's history starts from its tips; a revocation's or record's from what it cites. Everything else the checks need (who sealed what, who signed what, which grant an act was signed under, what each step meant) is the generator's own bookkeeping, never read from the library.

### Invariants, with their codes

| Code | Promise | Rules |
| --- | --- | --- |
| DEAL-EVERY-PARTY, DEAL-PARENT, DEAL-LIVENESS | a version of a deal exists exactly when every party of its parent has a signature act valid under Identity and its parent exists | F107, rules 1, 45b |
| STAKE-MOVED, STAKE-LIVENESS | a share that falls (in a deal, or in a collective, departed holders included) has its holder's valid signature, named by the record putting the clone in force; with every needed signature named, the record puts it in force | rules 13, 45, 46, 46b; F71, F74; A2 |
| THIEF-SIGNATURE | a thief's signature with a copied everyday key is void once its victim rotates keeping only its own sequence | Identity rules 15 to 17; Law rule 5 |
| SPLIT-SUM, SPLIT-STAKE, SPLIT-EXACT, SPLIT-DELIVERY, SPLIT-PANIC | payouts sum exactly; each holder's payout is judged against its exact share exactly as the text's tolerance says; an exact split never breaks its plan; an undelivered holder is shown; nothing panics | rules 20, 21, 26; N10; Q9; reading 7 of F125 |
| NOT-DONE, UNCITED | an act sealed to too few members, or citing nothing on the chain, never counts or binds | rules 35a, 35b; F126, F127, F128 |
| GRANT-DECISION, GRANT-SCOPE, GRANT-COUNTS, SERVICE-PAYOUT, SERVICE-NO-DEAL | a grant key never signs a decision, never acts beyond its reach or under a grant that does not count, a split service's key never signs a payout; a payee's grant backs nothing before the deal exists | rules 38, 38a, 44; F128; F129 H4, H5; F130 H7 |
| TIE-REVOCATION, TIE-EMPTIED, TIE-ENDING | an act a revocation, an area-emptying line, or a fork or closing does not hold is void unless adopted | the tie rule; rules 37b, 40, 43, 47a; G1, G2 |
| FORK-HANDS-OUT, FORK-OWES | a complete fork lists every binding debt in its history; no successor owes a debt not handed to it, nor one outside the history | rule 47a; N13; F127 |
| CLOSING-OWES | a complete closing has no binding debt in its history that the creditor was not paid in full or did not release | rule 47a D5, 47b; Finance rule 7 |
| ENDING-UNDONE | once a fork or closing is complete, later acts never undo it, nor change whether acts in its history count | rule 47a |
| SAFE-ONCE-CITED, SAFE-STALE-LINE | an act that counted when a later act of the collective cited it still counts | rules 35a, 43 |
| PURCHASE-AND-REFUND, PURCHASE-UNRECORDED, PAYMENT-CLAIMS-DISAGREE | the receipts of one rail payment never give a purchase and a refund at once; a purchase is recorded by an act of the collective that counts | rule 32a; F127 W2; F128 W4 |
| order and determinism | every verdict on every act (status, consent, backing, done, binds, debtors, purchase, agreement, fork, closing, split, current state) is the same read twice, replayed in a shuffled order, and replayed in another order with the verifier queried while acts arrive | — |

### Counts

Large runs (debug build, so overflow is checked), one process each:

| Property | Cases | Acts judged | Result |
| --- | --- | --- | --- |
| collective_promises_hold | 5,000 | 228,679 | passed (409 s) |
| collective_verdicts_do_not_depend_on_order | 1,500, each delivered 3 ways | — | passed (281 s) |
| deal_promises_hold | 5,000 | 129,067 | passed (402 s) |
| deal_verdicts_do_not_depend_on_order | 1,500, each delivered 3 ways | — | passed (201 s) |
| collective_stakes_move_only_with_their_holders | 10,000 | — | passed (216 s) |

Coverage in the large collective run: 2,240 complete forks, 679 complete closings, 1,530 collectives ended, 5,357 debts binding, 2,611 revocations counting, 184 areas emptied, 1,292 grant-key acts binding and 4,190 void, 1,479 purchases and 593 refunds. TEXT findings met: IT1 (ENDING-UNDONE) in 621 stories, IT2 in 7 (an ending drawn elsewhere) and 25 (an early line).

Coverage in the large deal run: 5,435 versions in force and 4,956 drafts, 776 thief's signatures voided by a rotation, 3,117 service receipts backed and 4,269 refused, 3,060 purchases, 2,625 refunds and 4,959 unrecorded payments, 3,887 splits of which 1,436 broke their plan as the text says they should. TEXT findings met: IT3 (PAYMENT-CLAIMS-DISAGREE) in 126 stories.

Named tests, kept: `ic1_a_debt_citing_nothing_binds_no_one`, `ic2_only_the_creditors_receipt_pays_a_debt`, `ic3_a_revoked_act_stays_void_inside_a_forks_history`, `ic4_an_acknowledgement_records_the_whole_payment`, `ic5_no_successor_owes_a_debt_outside_the_forks_history`, `ic6_explanations_do_not_depend_on_arrival_order`, `ic7_sums_that_overflow_never_pass`, `it1_a_second_complete_fork_undoes_the_first`, `it2_a_cited_act_is_voided_by_an_ending_drawn_elsewhere`, `it2b_a_stale_line_voids_a_cited_debt`, `it3_one_payment_whose_receipts_name_different_claims`. Each IC-test was checked to fail with the library as it was before this session.

### Code fixed

| | Where | Change |
| --- | --- | --- |
| IC1 | `LawView::obligation_binds` (`core/src/law/view.rs`) | a collective's debt binds only where `consent` counts (cited, done, its lane's holders, its grant), besides the tie rule |
| IC2 | `LawView::paid_toward` | counts only receipts whose payee is the obligation's creditor and which the creditor signed (Finance rule 7); sums saturating |
| IC3 | `LawView::backing` | an act a fork's or closing's history holds still answers to the revocations and area-emptying lines of its grant; only an adoption placed before the ending's line overrides them |
| IC4 | `LawView::recorded` (purchases) | acknowledgements of any receipt for the same rail proof record the payment |
| IC5 | `LawView::debtors` | an obligation that does not bind is owed by nobody, whatever the fork lists |
| IC6 | `Verifier::add_with_key` (`core/src/chain.rs`) | the indexes by signer, by type and by acknowledgement are kept in act-id order |
| IC7 | `LawView::split`; `Terms::check`, succession plans, fork shares (`core/src/law/formats.rs`) | sums of payouts and shares taken in 128 bits |

Existing tests changed, with the reason: in `core/tests/law_collective.rs`, the label's debts (`obligation`, `obligation_to`, and four debts written inline) are signed by Ben, who holds the label's Finance lane (rule 36a; IC1), and d2 in `a_collective_forks` is owed to an identity that signs its own receipt (Finance rule 7; IC2). No assertion was changed.

All existing tests were run: every Rust test in the workspace, 321 passed and none failed (the 305 there before and 16 new); the nine TypeScript clients' 113 tests, against the WebAssembly bindings rebuilt from this branch, all passed.
