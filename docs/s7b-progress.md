# S7b, the follow-up to S7: progress

*Kept by the S7b session (branch `claude/s7b-follow-up`), so that a next session can continue. The prompt is `docs/lead/prompts/s7b-follow-up.md` (S7b's prompt, on main); the decisions are F380 and F381. Put on hold by the lead, mid-Part 1.*

**Base.** S7's pull request 96 was not merged when this session began; this branch starts from `claude/s7-fixes` (with main merged into it by the lead), then merges the latest main (F381, the prompt). Rebase or merge onto main once pull request 96 is merged.

## Done (work in progress, not yet tested as a whole)
- **Check 7's second clause dropped (F381, 1).** Identity's check 7 drops the clause and gains, in its commentary, why (a home receipts without the private lines). `kept_tips_fit` and its call removed from `chain.rs`. `core/tests/drafts_after_step_15.rs` (F292): the rotation with a misfit tip stands, the tip and its line void. The vector is now "a rotation whose one kept tip does not fit its line … it stands, valid", plus a new case for the tip (void).
- **Stop reasons renamed (F381, 2).** Identity's "What stops a chain": "the genesis unknown", "the genesis invalid". `Stop::GenesisUnknown`, `Stop::GenesisInvalid`. The vectors write "genesis unknown" and "genesis invalid". WebAssembly writes "genesis-unknown" and "genesis-invalid" (it wrote "unknown", which was ambiguous with cannot tell). No client reads them.
- **Unknown "same payment", scoped (F381, 4): the mechanism only.**
  - `AgreementsView::judged` now answers twice where an unstated pair was compared: once assuming not one payment, once assuming one. The same answer both ways stands; otherwise unknown.
  - `same_payment_as` answers by the assumption (`assume_same`).
  - `judged_r` (unknown as `PaymentUnstated`) and `judged_list` (entries found one way only marked) are written but not yet used.
  - `one_count` groups by `same_on_rail`, and `note_unstated` is gone.

## Next
1. Wrap the answers F381 names, each its own scope:
   - `payment_counts` → `Option<bool>`, and the payment cMIP's `Held` impls in tests drop `Some(..)`;
   - `purchase` → `judged_r`;
   - `owed_back` → `judged_list`, with an `unknown` mark on `OwedBack`;
   - `refund_repaid` → `Option<u64>`;
   - `vow` → sales found one way only marked;
   - `service_account`, `split`, `closing`, `took_up` → `judged_r`.

   Then the tests, the WebAssembly (list changes "For the Dubsar Suite"), and at least two vectors (for example, a purchase and a vow's sale on an unstated pair).
2. Fix the doc line on `one_count` ("unknown where two records could be one payment …").
3. Update the vector count in `core/tests/vectors.rs`, both vector READMEs ("What changed since the previous edition"), and the workbook's "After the box".
4. A stranger's reading of the changed text; then Part 2 (the shared SLH-DSA-128f collective, then the cases); then `docs/s7b-report.md`, the box, the pull request, CI.
