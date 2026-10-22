# S7b, the follow-up to S7: report

*Session S7b, 22 October 2026, branch `claude/s7b-follow-up`. The prompt is `docs/lead/prompts/s7b-follow-up.md` (on main); the decisions are F380 and F381. This session recorded no finding of its own (F383 stays free); its questions are below, for Fable before they are decided. S7's pull request 96 was not merged when this began, so this branch carries S7 too (S7's branch with main merged in, then main again), and its pull request replaces 96.*

## In plain words

**S7's CI failure was a flake, not a clash.**
- The merge of S7 with main (`7589537`) failed CI once, in the desk step. On that exact commit, desk passes 113 of 113 here, twice, and also on this branch.
- Every other step of that run passed, including regtest's own end-to-end desk run.
- The earlier S7 commit `83e1ffa` changed only a progress file and failed in a different step (`clients/site`), so the same CI was failing in different places with nothing changed near it.
- I re-ran the failed job once on CI, and the desk step passed on the same commit.
- The display client's "gateway.js differs from built/" is expected on a pull request, not a fault. `gateway.js` carries the core's WebAssembly doc comments, which S7 changed. The release that follows the merge rebuilds `built/`, and the workflow lets that step fail on pull requests for this reason.

**Part 1: F381 in the texts, the core and the vectors.**
- **Check 7.** A kept line whose recorded summary does not fit now keeps nothing, and the rotation still stands, whatever the verifier holds. The clause that could make the rotation invalid is gone from Identity, from the core and from the vector.
- **The stop reasons.** Two are renamed "the genesis unknown" and "the genesis invalid", in Identity, in the core's names and in the vectors.
- **"Same payment".** An answer that depends on two receipts or claims whose payment the rail's answer doesn't name is now unknown, and only that answer. The core works it out twice: once taking the pair as one payment, once as two. Where both give the same answer, it stands; where they differ, it is unknown. A list marks only its affected entries.
  - A vow keeps every sale that doesn't depend on the pair and marks the rest unknown.
  - A collective's payments owed back are marked the same way.
  - Purchases, closings, splits, a split service's account, issuance take-ups, rule 15's lists and refunds answer unknown only when they depend on the pair.
  - Six vectors show it on both sides, for a vow and for a refund.
- **The stranger's reading.** A stranger read the changed text. I tightened the wording; two points it raised are questions below.

**Part 2: the heavy rules, shown rather than argued.** Vectors now reach:
- a collective's closing, and its fork into two sides: complete when every member signs with a chain signature, not complete when one member's chain signature is missing;
- an act of the collective before (counts) and after (doesn't) each;
- an agreement that is a party of another;
- a chain of judgment: the judge settles; the next judge waits while the first judge's period runs, then settles once it has passed; the first judge's late answer counts for nothing.

The operational clone put in force by a record was already a vector from S7. Each family is built once, and its chain signatures sit once in the pool. There are 108 verdict vectors in all; `verdicts.json` is 1,447,011 bytes, and both READMEs say so.

## Precisely

### S7's CI on `7589537`

The run on the S7 branch merged with main had one failing step: `clients/desk`.
- Rust, vectors, Python, WebAssembly, every other client and module, regtest (including `clients/desk on regtest (round 3, end to end)`) and the browsers job all passed.
- On a worktree at exactly `7589537`, with the WebAssembly built there, `clients/desk` passed 113 of 113 twice.
- On this branch (S7, main, and S7b's core), it passed 113 of 113, and site 86 of 86.

The prompt allows one re-run for a job that fails where the commit changed nothing near it. I re-ran the failed job of run 39788003748 once: on the re-run, `clients/desk` passed on the same commit. I could not read which desk test failed the first time: the log returned covers only the end of the job.

The display client's reproducible-build test fails here and on CI, with `gateway.js differs from the released copy in built/`. `built/gateway.js` embeds the WebAssembly bindings' doc comments, which S7 changed for `mirFileHash` and `agreementsPaid`. On a pull request the workflow marks that step `continue-on-error`, because the release made after the merge (`[release display client]`) rebuilds `built/`. This is S7's change, it needs no fix in this branch, and it is listed for the Dubsar Suite below.

### Part 1, F381

**Check 7 (F381, 1).**
- Identity's check 7 drops the clause. The new sentence says that a tip that does not fit never makes the rotation invalid, whatever the verifier holds, and that it is no failure of the rotation checks under rule 29. The commentary says why: a home receipts without the private lines, and validity is fixed by the bytes.
- In the core, `kept_tips_fit` and its call are removed.
- `core/tests/drafts_after_step_15.rs` (F292) is updated: the rotation stands, and its line is void.
- The vector "a rotation whose one kept tip does not fit its line" now answers valid. A new case asks about its tip: void.

**The stop reasons (F381, 2).**
- "What stops a chain" names each reason in bold: **the genesis unknown**, **the genesis invalid**, and the rest.
- The core's variants are `Stop::GenesisUnknown` and `Stop::GenesisInvalid`.
- The vectors write "genesis unknown" and "genesis invalid".
- WebAssembly writes `genesis-unknown` and `genesis-invalid`. Before, it wrote `unknown`, which was ambiguous with "cannot tell". No client reads these.

**Unknown "same payment", scoped (F381, 4).**
- `same_payment_as` answers, for a pair whose payment is unstated, what the answer being judged assumes, and notes it.
- `AgreementsView::judged` answers `f` assuming every such pair is two payments. Where any was compared, it answers again assuming every such pair is one. The same answer both ways stands; otherwise the answer is unknown.
- `judged_r` reports unknown as `PaymentUnstated`.
- `judged_list` keeps the entries found both ways and marks the others.

The judged answers:
- `paid_toward`, `disagreements`, a closing's debts (as in S7, now two-way);
- `payment_counts` (rule 15's lists, now `Option<bool>`);
- `purchase`, `closing`, `split`, `service_account`, an issuance take-up (`took_up`);
- `refund_repaid` (now `Option<u64>`);
- `owed_back`: entries marked `unknown: true`;
- `vow`: a sale found one way only, or in a different state either way, is `SaleState::Unknown`; an unsigned payment found one way only goes to `VowEval::unknown`.

The scope holds because each answer is judged on its own:
- A sale that doesn't depend on the pair stands.
- A consent that reaches a closing through a chain of calls becomes unknown only if the closing's own answer differs both ways; then its `?` carries the unknown up, as dependence should.
- Nothing is made unknown merely because an unstated pair exists somewhere in the view.

`one_count` groups records by `same_on_rail`. Tests in `modules/` and `harness/` take `Option` where the API changed. `refund_repaid` callers unwrap: every payment there is stated.

**Vectors for F381, 4** (six cases, Money):
- A vow's sale with the rail's answer stated: one sale, pending.
- The same without the answer: the sale stands; the receipt's place is unknown.
- A confirmation by a later claim acknowledging the door's record, the answer stated: confirmed.
- The same without the answer: the acknowledging claim's own sale is confirmed either way and stands; whether the first claim is a second sale is unknown, and the receipt's place is unknown.
- A refund repaid by the payer's receipt naming its claim of the payment: 300 with the answer, unknown without.

New questions: `vow`, `refund repaid`.

**Workbook.** Each text change is one line under "After the box", S7b.

### Part 2, the heavy rules

Each family is one world, built once, with every member's chain key SLH-DSA-SHA2-128f (17,088-byte signatures). Its cases differ only in which acts the verifier holds, or in what is asked. Families that share a prefix (the collective of the closing and of the fork) produce the same acts, so the pool holds them once.

| Rule | Cases | Verdicts |
| --- | --- | --- |
| A collective's closing (Agreements rule 47a) | complete; one member's chain signature not held; an act after; an act before | complete true; false; does not count; counts |
| A collective's fork into two sides (rule 47a) | each successor founded first, naming the original; the same four | as for the closing |
| An agreement as a party of another (rule 1) | exists once that agreement's parties and the other party signed; not without one of its parties | exists; does not exist |
| A chain of judgment (rule 34a) | the judge of forks keeps A; the next link settles while the judge's period runs; the period passed: the next link settles B (its earlier settlement out of turn); the judge's late answer | A in force; the reference; B; B |
| A record putting an operational clone in force | already S7's | |

New questions: `closing`, `fork`, `version in force`. New facts: `judges_lapsed`, `settled_out_of_turn`. Both vector READMEs give the size (1,447,011 bytes) and add every case to "What changed since the previous edition". The box README carries no code path or finding number; `make-c-box.sh` checks this.

**Totals:** 108 verdict vectors (Identity 27, Text 8, Envelopes 5, Money 17, Agreements 38, Development 7, MIR hashes 6). The Python check judges 26 of them, 192 checks in all. Regenerating gives the same bytes.

## For the Dubsar Suite

- **Stop reasons in the chain answer** read `genesis-unknown` and `genesis-invalid` (they read `unknown` and `invalid`). No client reads them today.
- **`agreementsVow`:** a sale's state may be `unknown`, and a new `unknown` list holds payments whose place rests on an unstated payment. Dub's vows already pass `railPayments` (S7), so with the rail's answers stated, nothing changes.
- **`agreementsOwedBack`:** each entry gains `unknown` (boolean).
- **The functions behind purchases, closings, splits, a split service's account, take-ups and `agreementsPaid`** throw `law/payment-unstated` only where their answer depends on an unstated pair.
- **Rust API:** `AgreementsView::payment_counts` returns `Option<bool>` (the payment cMIP's `Held` implementations return it as is), and `refund_repaid` returns `Option<u64>`.
- **The display client** (`clients/site/built/gateway.js`) needs its release after the merge, as after any change to the bindings' comments.

## Questions, for Fable before they are decided

**1. A kept tip whose line the verifier does not hold: kept by its name, or unknown?**

*Plain words:* S7 made the tip itself count as kept by its name when its line is not held, with what lies below it unknown. That is what the core did before, what the collective client's rollback test and the gauntlet's 5.5c rely on, and what check 7 now says. Section 6, though, lists "a kept tip whose line it cannot rebuild" among the things a verifier answers unknown. A reader of section 6 could make the tip unknown too.

*Options:*
- **(a)** Keep the tip kept by its name, and reword section 6's example as "an act below a kept tip whose line it cannot rebuild".
- **(b)** Make the tip unknown until its line is held.

*Lean:* (a). It is wording only, it matches the core, the suite and the clients, and a tip found not to fit only ever comes from a broken client.

*Cost of (a):* a verdict that flips from valid to void when a broken client's line arrives.

**2. Does an unknown genesis stop the chain?**

*Plain words:* "What stops a chain" lists "the genesis unknown" as a stop. Section 6's commentary and Part four say a client can check the rotations of a chain whose genesis is signed under a scheme it lacks, though every act under it is unknown. The core stops at the genesis and answers unknown for everything under it, so the verdicts agree. Only the word "stops" reads differently.

*Options:*
- **(a)** As written: the chain stops there, and acts are unknown.
- **(b)** Resolve rotations past an unknown genesis, still unknown.

*Lean:* (a). No verdict changes.

**3. Precedence among the seven reasons.**

*Plain words:* where two reasons fit (pending beside contested, pending beside cannot-tell), the text names no order. The core's order follows its steps.

*Options:*
- **(a)** State the core's order in the text.
- **(b)** Leave it, since a verifier names one reason and two verifiers agree only if the order is fixed.

*Lean:* (a), in one sentence, after Fable confirms the order.

**4. The two-way judgement is exact for one unstated pair, and an approximation for several.**

*Plain words:* answering "all such pairs are one payment" and "all are two" misses the mixed assignments. An answer that differs only under a mixed assignment would stand when it should be unknown.

*Options:*
- **(a)** Accept it, and say so in the core's doc.
- **(b)** Judge each unstated pair separately (2ⁿ answers).

*Lean:* (a). Unstated pairs are rare once a client passes the rail's answers, and (b) costs exponential time.

## The stranger's reading

A subagent read only the eight texts, judging the changed passages as a stranger who must build a verifier.

**Wording fixed after its reading:**
- check 7 now says what "fits" means; that a verifier can tell only when it holds every act of the sequence up to the tip; and that the check decides what is kept, never validity, nor a failure under rule 29;
- its commentary says "valid" where it said "counts";
- "What stops a chain" names each reason;
- section 6's "Void needs …" now speaks of every kept tip's line and of the kept ancestry, not of an undefined "kept line".

**Left open:** questions 1 to 3 above. Besides those, the stranger noted these, for the next suite:
- the meaning of "can count";
- what "holds a sequence" means for a private act held without its content key;
- a kept tip whose recorded `position` is wrong;
- shared ancestry under a misfit tip;
- what Agreements' "every kept tip it names holds there" asks of a misfit tip;
- the suite has no step for a misfit tip or for the seven stop reasons.

## The box assembles

`scripts/c-box/make-c-box.sh`, run into a scratch folder outside the repository, assembled the box (8 texts, 12 vector files, a manifest) and refused nothing.
