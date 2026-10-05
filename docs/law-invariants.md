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

## F131 written in

*5 October 2026, same branch, main merged in first. Nobody, allegedly, answered IT1 to IT3 (findings log, F131). This section writes those answers into Law draft 10, Finance draft 6, the payment cMIP, core v21 and suite v21 (the one page, v6, says nothing at this depth and is unchanged), builds them in the core library and the collective client, and runs everything again. The approved set is revised in place, so these changes need Nobody, allegedly, to approve them again.*

### In plain words

**What changed.**

- **A finished ending stays finished (IT1).** Once a fork or a closing is complete, the collective is over. If someone later signs another fork or closing of the same collective, and that new one names the first (as every honest client now does automatically), the new one counts for nothing. The collective stays ended, and the successors keep what the first fork gave them. Only when two endings were made without either naming the other are they treated as a tie, a race between equals, and then neither counts.
- **Once the collective has cited your act, you are safe from a racing ending (IT2a).** If a later act of the collective's own key that counts cites an act (for example an agent's sale), the collective has taken that act on: it is "adopted". A revocation of the agent's powers, made on another device that never saw the citation, no longer voids the sale. The tie rule ("the ending wins") now only voids acts the collective never took on. The revocation still stops everything the agent does afterwards.
- **A fork drawn on an old line on purpose is a cost we state, not one we cure (IT2b).** Members could still draw a fork's line as the collective stood before a debt, on purpose, and leave the debt out. No program can tell that apart from an honest line drawn before the debt existed, and every cure would let something published after a fork reopen it. So the text says so plainly. Two things limit it: it needs every signer of the fork to go along, and it stays visible (the signed debt, the collective's citation of it, and the fork leaving it out are all there for any outside court). And the collective client now refuses to sign a fork or a closing until it has caught up with every one of the collective's devices and holds every act the ending should cover.
- **The payment decides which claim it buys under (IT3).** When the receipts of one payment name different claims (say one names the song's old shares and another the new shares), the claim that counts is the one the payment itself committed to. A receipt naming a different claim is a "wrong receipt": shown as such, and counting for nothing. The rail shows which one is wrong, because a wrong receipt does not match what the payment carried. Until a program has checked that, it calls the payment "unrecorded" rather than guessing. One payment can no longer be both a purchase and a refund.

**What writing it in found: one flaw and two readings, for Nobody, allegedly.**

- **Flaw U1. A later ending that "forgets" to name the first one still undoes it.** IT1 tells endings apart by naming: the later one names the earlier one. But without a clock, a second fork that knew about the first and simply leaves it out cannot be told from one made without knowing it. *Smallest example:* Ana and Ben fork their collective; it is complete. Days later, Ana and Ben sign a second fork that does not name the first. By the rule's own words the two are a tie, so neither counts, and the collective is alive again: exactly IT1's harm. Honest clients name every ending they hold, so this needs every signer of the second ending to bypass their client, and it is visible (the same people signed both). *Options:* (1) a stated cost, as for IT2b; (2) also order endings by their lines: a fork whose line includes the whole of the other's line and more is the later one even without naming it, which leaves only endings drawn on the same or an older line as ties; (3) a member who signed both orders them. *Built meanwhile:* naming only, as F131 says; the tests count these stories separately ("ENDING-RACE") instead of failing them.
- **Reading U2. How a tie is settled.** Acts never change, so two tied endings can never come to name each other, and "until one names the other" would never come. The code reads it as: a third ending that names both settles the tie and counts, the way a later clone settles two clashing records (B11). The alternative is that a tie can never be settled, and the collective can never end.
- **Reading U3. What "cites" means for IT2a.** The code reads it as "holds in its history": if the collective cites an agent's later act, the agent's earlier acts on the same strand are cited too. Read strictly as "names it directly", a buyer would not be safe once the collective joined the agent's strand at a later act, which is how clients cite.

**What the large runs found.** Two new CODE failures, both hidden until now: before F131, every story where an ending was undone, or a cited act stopped counting, was counted as IT1 or IT2 and set aside. Once those became failures again, the runs found:

- **IC8. A record made after the collective had ended still took a member's voice away.** After a fork, everything the collective's keys sign counts for nothing in Law. But a member's resignation, registered by a record on a device the fork's line never named, removed that member's voice from an act inside the fork's history, so the act stopped counting: an ending undone from after it. Fixed: a record after the ending registers nothing. *Smallest story: a grant, a fork, a resignation on a third device.*
- **IC9. A departure racing the collective's citation still took a voice off the cited act.** IT2a says an act the collective cited is adopted, and no ending racing that citation voids it. A departure (a member leaving) is one of those endings, but the code only applied adoption to agents' acts, not to the collective's own acts signed by its members. Fixed: such an act counts if it counts as judged, or once the departures racing its citation are set aside. *Smallest story: a grant the Finance area's two holders sign, cited by the other device; both holders then leave, by records on a device that never saw the citation.* My first fix skipped those departures outright; the next large run showed that this could bring a departed holder's voice back into a threshold and make an act fail. The fix was redone, and both stories are kept in the test.

Neither changed a rule: both follow from the text as it now stands (rule 47a for IC8, F131's IT2a for IC9). The Law draft says the second in one added sentence (tie rule, "a departure racing the citation takes no voice off the act").

### Precisely

**Rule text.**

| Document | Where | Change |
| --- | --- | --- |
| Law draft 10 | header | revised in place a tenth time, after approval, for F131 |
| | "Made before, made after", 7 (the tie rule) | voids only acts the collective never took on; an act a counting act of the collective's own key cites is adopted (IT2a; reading U3) |
| | same, client conformance | a member's client refuses to sign a fork or closing until it holds every device's latest acts and every act its history should hold (IT2b) |
| | "Fork (type 19)" | `objects` `[[agreement, agreement], * [agreement, ending]]`; reading 4 of F125 replaced: a complete ending is final, a later one naming it counts for nothing, only endings neither naming the other concurrent; which complete ending counts (IT1); reading U2; flaw U1 |
| | "Closing (type 20)" | the same `objects`; counts only as a fork does (IT1) |
| | rule 32a | the payment decides; a wrong receipt counts for nothing; unrecorded until the rail answers (IT3) |
| | rules 35a, 40, 43 | the promise to counterparties restated; adoption by citing; the stated cost of a stale line (IT2a, IT2b) |
| | rule 47a | a complete fork is final; concurrent forks only when neither names the other (IT1) |
| | Decided, Freeze scenarios, Open | F131 and its format; four scenarios; U1, U2, U3 and three readings |
| Finance draft 6 | header, rules 8a, 10c | one push payment's holders share its proof (reading); the payment decides, a wrong receipt counts for nothing (IT3) |
| Payment cMIP draft 2 | header, rail Modules item 3 | a receipt naming another claim recomputes another commitment: the rule answers invalid, Law shows a wrong receipt (IT3) |
| Core v21 | header; purchases; the fork proper; the ending wins; grants; checklist | IT1 to IT3 in short; U1 to U3 on the checklist |
| Suite v21 | header; scenario 3, steps 9w to 9z and "Passes if" | one step per answer, all run |

**Code.**

| | Where | Change |
| --- | --- | --- |
| IT1 | `LawView::closed_by` (`core/src/law/view.rs`), new `ending_knows`, `ending_acts`; `Fork::decode`, `Closing::decode` (`core/src/law/formats.rs`, `check_objects_ending`) | of the complete endings, the one counting is ordered (names or is named by) against every other, and names no other such one; an ending names others by `[agreement, ending]` entries in `objects`, transitively |
| IT2a | `LawView::backing` | an act of the collective's own key that counts, whose history holds the grantee's act, adopts it, as an acknowledgement did (before a fork's line, where a fork or closing ended the collective) |
| IT2b | `LawView::line_unheld`; wasm `lawLineUnheld`, `lawEndingActs`; collective client `endingGate` (`clients/collective/src/actions.ts`) | the client refuses to prepare a fork or closing while its relays hold acts of the collective its sequence lacks, or the line's history is not all held; every ending it signs names the endings of the collective it holds |
| IC8 | `LawView::departure_lines` | for an act, a record after the line of the fork or closing that ended the collective registers no departure (rule 47a) |
| IC9 | `LawView::consent`, `cited_against` | an act of the collective's own key that does not count as judged is judged again with the departures racing a counting citation of it set aside, and counts if either judgment does (F131 IT2a); guarded against re-entry |
| IT3 | `LawView::rail_invalid` (new input, like `push_rails`), `PurchaseVerdict::WrongReceipt`, `same_payment`; wasm `specs.railInvalid`, verdict `"wrong-receipt"` | a receipt the rail shows wrong is a wrong receipt; receipts of one rail proof naming different claims with no rail answer are unrecorded; holders' receipts and recordings ignore wrong ones |

The core reads no rail: which receipts carry the payment's commitment is the payment cMIP's rule, run by the caller, which hands its answer to the core, as it already says which rails are push rails.

**Tests.** New named tests, each checked to fail with its fix undone: `ic8_a_record_after_the_ending_registers_nothing`, `ic9_a_departure_racing_a_citation_takes_no_voice` (with the second story, where setting a departure aside outright would fail the act). The counterexample tests now assert the decided behaviour, renamed: `it1_a_complete_ending_is_final` (a second fork naming the first counts for nothing, a closing naming both too; two forks neither naming the other: neither counts; a closing naming both settles it), `it2_a_cited_act_is_adopted` (the cited sale binds against the racing revocation; the agent's act after it is void), `it2b_a_stale_line_is_a_stated_cost` (the cost stands, and stays legible: the debt and its citation valid, the citation outside the fork's history), `it3_the_payments_claim_decides` (the old-version receipt a wrong receipt, the others a purchase; with no rail answer, all three unrecorded). The collective client's test of unheard acts now also checks that a fork and a closing are refused, naming the unheard act and the rule.

`ic3_a_revoked_act_stays_void_inside_a_forks_history` changed with the decision: its story (a revocation on the other device citing the agent's act) is now an adoption under IT2a, and binds; the test keeps that, and checks IC3's fix where nothing adopts the act: a fork whose line names the grant key's strand holds the act in its history, and the racing revocation still voids it. It was checked to fail with the IC3 fix undone.

**Invariants.**

| Code | Before F131 | Now |
| --- | --- | --- |
| ENDING-UNDONE | TEXT (IT1) | a failure: once an ending counts, no later act undoes it, where every later complete ending names it |
| ENDING-RACE | — | a later complete ending naming none of the earlier ones (flaw U1): counted, not failed |
| SAFE-ONCE-CITED | TEXT (IT2) | a failure: an act cited while it counted, the citing act still counting, still counts |
| SAFE-STALE-LINE | TEXT (IT2) | IT2b's stated cost (the citing act itself left out by an ending's line): counted, not failed |
| PAYMENT-CLAIMS-DISAGREE | TEXT (IT3) | a failure, judged both with the rail's answers and without them |
| RAIL-WRONG | — | a receipt the rail shows wrong is judged a wrong receipt, and no other is |
| TIE-REVOCATION, TIE-EMPTIED, TIE-ENDING, PURCHASE-UNRECORDED | — | their oracle's "adopted" now includes an act of the collective's own key whose history holds the act (IT2a, U3) |

Generators: a fork or closing names every earlier ending of the collective in three stories out of four (`names`), none otherwise; a push payment's commitment names the claim its first receipt names, later receipts for the same proof naming another being wrong receipts the rail shows.

**Large runs** (debug build, one process each, two at a time on four cores):

| Property | Cases | Acts judged | Result |
| --- | --- | --- | --- |
| collective_promises_hold | 5,000 | 225,914 | passed (373 s) |
| collective_verdicts_do_not_depend_on_order | 1,500, each delivered 3 ways | — | passed (278 s) |
| deal_promises_hold | 5,000 | 129,011 | passed (365 s) |
| deal_verdicts_do_not_depend_on_order | 1,500, each delivered 3 ways | — | passed (195 s) |
| collective_stakes_move_only_with_their_holders | 10,000 | — | passed (199 s) |

Coverage in the large collective run: 2,145 complete forks, 647 complete closings, 1,924 collectives ended, 1,125 later endings naming the first (each counting for nothing), 4,672 debts binding, 2,269 revocations counting, 185 areas emptied, 1,214 grant-key acts binding (462 of them adopted by a citation) and 4,094 void, 1,142 purchases and 651 refunds. Stated costs and open questions met, not failures: ENDING-RACE (flaw U1, a later ending naming none of the earlier ones) in 161 stories, SAFE-STALE-LINE (IT2b's stated cost) in 43.

Coverage in the large deal run: 5,419 versions in force and 4,791 drafts, 777 thief's signatures voided by a rotation, 3,186 service receipts backed and 4,273 refused, 2,757 purchases, 2,341 refunds, 4,902 unrecorded payments and 812 wrong receipts (IT3), 3,905 splits of which 1,470 broke their plan as the text says they should. PAYMENT-CLAIMS-DISAGREE, now a failure, never met, with the rail's answers or without them.

The large collective run was repeated until it passed: the first round stopped on IC8; the second on IC9; the first fix for IC9 overflowed the stack (it called itself back, now guarded), and once guarded failed twice, on TIE-EMPTIED and on the story now kept in IC9's test, because skipping a departure outright was wrong; the redone fix passed a 5,000-case run, and then the final round above, every property. Each run draws fresh random stories.

**All tests.** Every Rust test in the workspace: 323 passed, none failed (the 321 there before, and IC8 and IC9; the four IT tests changed in place). The nine TypeScript clients' 113 tests, against WebAssembly bindings rebuilt from this branch's final code: all passed (barebone 9, collective 20, connector 12, desk 8, genesis 14, longform 15, manage 7, reader 16, repo 12).

**Open for Nobody, allegedly, in order:** flaw U1 (a later ending not naming the first); readings U2 (a third ending naming both settles a race) and U3 ("cites" as a line reads it), and the three readings in Law draft 10, "Open in this draft", and the IC9 reading (a racing departure set aside); then approval of the revised set (Law draft 10, Finance 6, core v21, suite v21; the payment cMIP as an instrument). Nothing is merged.

## F132 written in

*5 October 2026, same branch, main merged in first. Nobody, allegedly, answered U1 to U3 and the readings (findings log, F132); writing U1 in raised one question and two flaws, each answered the same day and recorded under F132: U1 refined (an ending signature is an act on the member's identity chain), U4 (an old proposal finished late) and U4b (found by the large run: a drafter names the endings they signed). This section writes them all into Identity draft 11, Law draft 10, Finance draft 6, core v21 and suite v21, builds them in the core library, the homes, the WebAssembly bindings and the collective client, and runs everything again. The approved set is revised in place, so these changes need Nobody, allegedly, to approve them again.*

### In plain words

**What changed.**

- **Members sign forks and closings with their safety key (U1).** A member's signature on a fork or a closing is now an act on their own identity chain: the one line of an identity that never branches, which only the safety key adds to. It is a new kind of Identity act, a *chain signature*: it reveals the safety key, commits the next one, names the fork or closing it signs, and changes nothing else (same everyday key, same homes; no act judged). It counts the way a rotation counts: once the member's homes hold it. Because a member's chain is one line, any two of their ending signatures are in order, whatever phone or laptop they used. The cost is stated: every member signing an ending goes through the safety-key ceremony, so forks and closings are slow and heavy, as rotations are. The old signature acts (Law type 1) no longer count on an ending.
- **A member who signed both endings orders them (U1).** If Ana signed the first fork and, later on her chain, a second one, the second counts as naming the first, even if its own text names nothing. So it counts for nothing, and the first stays final. A true tie is left only between endings that share no signer.
- **A tie is settled by a third ending naming both (U2, confirmed as built).**
- **"Cites" means "holds in its history" (U3), and the other readings, confirmed**: a departure racing the collective's citation takes no voice off the cited act (IC9); a push payment whose receipts name different claims stays unrecorded until the rail's answer is held; one push payment's holders' receipts share its proof without a batch.
- **Once you signed what replaced a proposal, you cannot finish the proposal (U4).** Ben drafts a closing and signs it; Ana does not. They close by a second closing naming the first. If Ana later signs the first, her signature counts for nothing, and the second stays final. Without this, Ana alone could swap or revive an ended collective by finishing an old proposal.
- **Whoever drafts an ending names every ending they signed before (U4b).** Ben drafts a fork and signs it; Ana does not. If Ben then drafts a second fork leaving the first out, that second fork is no fork. Without this rule, Ana's late signature on the first would leave each fork naming the other through their two chains, and neither would count, even where every member must sign. Unlike "every ending a client holds", this can be checked on the drafter's own chain.

**What remains, stated.** Where the drafter of a newer ending never signed an older proposal and leaves it unnamed (they never saw it, a true race; or they bypassed their client, which names every ending it holds), the older proposal can still be finished late. It then counts as the earlier ending, or the two tie until a third names both. Under a threshold, members who signed neither can do it with others' earlier signatures. The late signatures stay visible on their signers' own chains.

**What writing it in found, all answered by Nobody, allegedly, the same day:**

- **U1 refined (question):** a person keeps one sequence per device, and two devices are not ordered until a rotation. So "a signer's own chain" did not order a member who signed two endings from two devices. *Smallest example:* Ana signs the first fork on her phone and the second on her laptop: neither signature is "after" the other. Answer: the ending signature goes on the identity chain, with the safety key. Then asked how: as a full rotation, or as a new act. Answer: a new act, the chain signature (Identity type 16).
- **U4 (flaw, found reasoning about the decision, then confirmed by a test against the code as it stood):** an old half-signed ending finished after a newer one was complete. As built before this session, the old one then counted and the newer one for nothing; with U1 alone, each named the other and neither counted. Answer: U4, above.
- **U4b (flaw, TEXT, found by the 5,000-case run, shrunk to three steps; the code and the oracle agreed):** a newer ending leaving out a proposal its own drafter had signed, then the proposal finished late: a tie even under the every-member rule. The same signatures arise from a true race, so no reading of the chains can tell them apart. Answer: U4b, above.

The rerun after U4b then met the cost named in the answer (a drafter who never signed the proposal) under the every-member rule, where the text had said "under a threshold". No new choice was needed: the stated cost was made exact (above), and the test counts such stories instead of failing them.

**What the large runs found.** Besides U4b, nothing: no CODE failure. Every property passed on the final code.

### Precisely

**Rule text.**

| Document | Where | Change |
| --- | --- | --- |
| Identity draft 11 | header; Definitions (safety key, identity chain, chain signature); types table; "Chain signature (type 16)", new; verification "Chain signature", new; everyday check 2; receipt check 1; "Which rotation counts"; rules 2, 8a, 11; "Status of an act after a rotation"; freeze scenarios; decided 17 | the chain signature: `{0 previous chain act, 1 position, 2 next safety commitment, 3 the act it signs}`, signed by the revealed safety key; sets no key, judges no act, never homeless; a binding never names it; counts at its position as a rotation does; cost stated |
| Law draft 10 | header | revised in place an eleventh time, for F132 |
| | "Fork (type 19)" | every member it lists, its signer included, signs by a chain signature, a signature act or the fork act itself being no member's signature; a successor's signature for its debts stays a signature act (reading); complete only with chain signatures that count and are not void; an ending names another in its `objects` or through a signer's chain (U1); a true tie only between endings sharing no signer, settled by a third (U2, confirmed); U4; U4b; the stated cost; client conformance (no ending another held ending names, none once a complete one is held); U4 judged in two steps (reading) |
| | "Closing (type 20)" | the same |
| | "Made before, made after", 7; rule 32a | U3, the IC9 reading and the two payment readings confirmed |
| | Decided, Freeze scenarios, Open | F132; two scenarios; three readings taken writing F132 in, to confirm; U1 to U3 moved to answered |
| Finance draft 6 | header, rule 8a | the reading on one push payment's holders' receipts confirmed |
| Core v21 | header; the fork proper; checklist | members sign endings with their safety keys; U1, U2, U4, U4b in short; U1 to U3 answered, three readings open |
| Suite v21 | header; 3.9w; new 3.9aa, 3.9ab, 3.9ac; "Passes if" | the chain signature; a signer's chain orders two endings, a true tie settled; an old proposal finished late, U4b; all run |
| Payment cMIP draft 2 | — | unchanged since F131 |

**Readings taken writing F132 in, to confirm** (Law draft 10, "Open in this draft"): the ending act's own signer signs on their chain too (the act itself is the proposal); a successor's signature for its debts stays a signature act (two endings sharing a successor share that side's members, whose chains order them); U4 judged in two steps, first by `objects`, then, among the signatures left, through signers' chains, so that no signature both judges and is judged (in one step, a single late signature could void another member's honest earlier one).

**Code.**

| | Where | Change |
| --- | --- | --- |
| Chain signature | `core/src/identity.rs` (`ChainSignature`, type 16, `check_chain_signature_shape`, `ChainState::sign`); `core/src/chain.rs` | a candidate at its position beside rotations, counted by the same tally; the state it leaves changes only the safety commitment; acts are judged by the next counting *rotation* (`judging`), never a chain signature; a binding naming a chain signature binds nothing (`bound`, `status`); an escape endorsement may be bound to the act that set the key (`sets_key`) |
| Homes | `relay/src/node.rs` (`plan_chain_signature`, `chain_states`, rule 2, policy) | a home holds and receipts a chain signature at its position, refusing a second act at a position it holds, as for rotations; the operator's approval for a strict identity stays a rotation's alone |
| Ending signatures, U1, U4, U4b | `core/src/law/view.rs` (`EndingSigs`, `ending_sigs`, `ending_signed`, `ending_knows`, `ending_objects`; `fork`, `closing`) | a member's signature on an ending is their earliest counting chain signature naming it; U4b first (an ending whose drafter signed earlier an ending it does not name is no ending, its signatures left out); then U4 in two steps; naming is `objects` plus signers' chains; `closed_by` as before over that naming |
| WebAssembly | `wasm/src/lib.rs` (`makeChainSignature`) | a chain signature made from a test safety key |
| Clients | `clients/genesis/src/identity.ts` (`chainSign`; a rotation's predecessor is the latest chain act); `clients/collective/src/actions.ts` | every member signs a fork or closing by a chain signature sent to their homes; the ending gate refuses a further ending once one is complete (U4, client conformance) |

**Tests.** New named tests: `a_chain_signature_takes_a_position_and_changes_no_key` (`core/tests/chain.rs`), `u1_a_signers_chain_orders_two_endings`, `u2_a_third_ending_naming_both_settles_a_tie`, `u4_an_old_proposal_finished_late_counts_for_nothing`, `u4b_a_drafter_names_the_endings_they_signed` (the last checked to fail with U4b switched off; it keeps both the run's first story and the stated-cost story the rerun met). `it1_a_complete_ending_is_final` keeps its first part; its two-forks race moved to the U1 and U2 tests, since two forks of a two-member collective always share signers now.

Existing tests changed, with the reason: in `core/tests/law_collective.rs`, every member's signature on a fork or closing is a chain signature (`Lab::end`), the drafter's included (U1); every fork or closing names, in its `objects`, the earlier endings of its collective (`ending_obj`, as a conforming client does; U4b makes it necessary where the drafter signed them); in `what_is_not_a_fork`, the second complete fork, signed by the same members, now names the first and the first stays final (before: concurrent, neither counting). In `core/tests/chain.rs`, a rotation's predecessor is the person's latest chain act (`Person::tip`). No other assertion changed.

**Invariants.**

| Code | Before F132 | Now |
| --- | --- | --- |
| ENDING-UNDONE | a failure where every later complete ending names the first in `objects` | a failure wherever the later ending names the first in `objects` or through a shared signer's chain: so wherever the two share a signer |
| ENDING-RACE | a later ending naming none of the earlier ones (U1): counted | only endings sharing no signer and naming each other in no way (a true tie): counted |
| ENDING-LATE | — | U4's stated cost: an old proposal the complete ending's drafter never signed nor named, finished late: counted |
| ENDING-SIGNATURES | — | every member's signature on every ending counts in the library exactly as the oracle's own reading of U1, U4 and U4b says |
| ENDING-NO-ENDING | — | the library's endings that are no ending are exactly the oracle's (U4b) |

Generators: every member signs an ending by a chain signature, from a random one of their devices, which then all carry on from it; a closing under a threshold is sometimes signed by just enough members from a random start, so two closings may share no signer; a new step, LateSign, has a member listed on an earlier ending who has not signed it sign it now. The oracle reads U1, U4 and U4b from the generator's own order of the members' ending signatures and from the acts' `objects`, never from the library.

**Large runs** (debug build, on the final code; the collective order replay on the code with U4b, before the oracle's stated-cost reading was made exact, which it does not use):

| Property | Cases | Acts judged | Result |
| --- | --- | --- | --- |
| collective_promises_hold | 5,000 | 231,838 | passed (1,060 s) |
| collective_verdicts_do_not_depend_on_order | 1,500, each delivered 3 ways | — | passed (463 s) |
| deal_promises_hold | 5,000 | 130,114 | passed (333 s) |
| deal_verdicts_do_not_depend_on_order | 1,500, each delivered 3 ways | — | passed (167 s) |
| collective_stakes_move_only_with_their_holders | 10,000 | — | passed (174 s) |

Coverage in the large collective run: 19,496 ending signatures on members' chains; 2,056 complete forks and 615 complete closings; 2,046 collectives ended; 1,172 later endings naming the first (each counting for nothing), 17 of them through a signer's chain alone; 635 endings that are no ending (U4b); 169 late signatures, 125 counting and 44 void (U4); 4,409 debts binding, 2,092 revocations counting, 176 areas emptied, 1,215 grant-key acts binding (460 adopted by a citation) and 3,920 void, 1,084 purchases and 628 refunds. Stated costs and open questions met, not failures: ENDING-RACE (a true tie) in 1 story, ENDING-LATE in none this run (met by the earlier rerun, the story now kept in `u4b_…`), SAFE-STALE-LINE (IT2b) in 38.

Coverage in the large deal run: 5,549 versions in force and 5,123 drafts, 743 thief's signatures voided by a rotation, 2,980 service receipts backed and 4,399 refused, 2,709 purchases, 2,357 refunds, 4,811 unrecorded payments and 686 wrong receipts, 3,839 splits of which 1,437 broke their plan as the text says they should.

The large collective run was run three times: the first round stopped on U4b (TEXT, three steps once shrunk: a fork Ana leaves unsigned, a second fork by its drafter Ben leaving it out, Ana's late signature); the second, after U4b was built, on the stated cost the answer had named, met under the every-member rule (three steps: the second fork drafted by Ana, who never signed the first); the third passed. Before the first large round, four runs of 500 cases were made on the code before U4b; three passed, and the first failed, but its message was lost (only the end of its shrunk story was seen, a resignation step), so it is not classified. It did not recur in those three runs, nor in any large run since. Each run draws fresh random stories.

**All tests.** Every Rust test in the workspace, on the final code: 328 passed, none failed (the 323 there before, and the chain signature, U1, U2, U4 and U4b tests; `it1_…` changed in place). The nine TypeScript clients' 113 tests, against WebAssembly bindings rebuilt from this branch's final code (the collective client's fork and closing now complete only through members' chain signatures, sent to test homes): all passed (barebone 9, collective 20, connector 12, desk 8, genesis 14, longform 15, manage 7, reader 16, repo 12).

**Open for Nobody, allegedly:** the three readings taken writing F132 in (Law draft 10, "Open in this draft"); then approval of the revised set. Nothing is merged.

### Set for approval

Since the approval of 5 October 2026, the set has been revised in place twice, for F131 and F132; nothing else changed. **Law draft 10:** a complete ending is final; an act the collective's own key cites is adopted; a stale line a stated cost, with a client refusing to sign an ending until it holds every device's acts; the payment's claim decides (F131); members sign forks and closings by chain signatures on their identity chains, an ending naming another in its `objects` or through a signer's chain, a true tie only between endings sharing no signer and settled by a third, a signature on a replaced proposal counting for nothing, and a drafter naming every ending they signed (F132); three readings to confirm. **Identity draft 11** (changed by F132 only): the chain signature, type 16. **Finance draft 6:** the payment's commitment decides which claim a purchase buys under, a receipt naming another a wrong receipt (F131); the push-payment reading confirmed (F132). **The payment cMIP draft 2:** a receipt naming another claim recomputes another commitment, so the rule answers invalid and Law shows a wrong receipt (F131); unchanged by F132. **Core v21:** IT1 to IT3 and F132 in short; the checklist's open points. **Suite v21:** steps 3.9w to 3.9z (F131) and 3.9aa to 3.9ac (F132), all run.
