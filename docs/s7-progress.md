# S7, the fixes after Fable: progress

*Kept by the S7 session (branch `claude/s7-fixes`) so that a next session can continue. The prompt is `docs/lead/prompts/s7-fixes.md`; the decisions are F380.*

## Done
- Part 1, the MIR hash (Q46): `Spec::frozen_text` is the file less one final line break, nothing else; `Spec::draft_without_status_line` is the named tool; `mirFileHash` (WebAssembly) and the reader follow; the vectors' case and the Python check follow.

- Part 1, "same payment" (Q27): `AgreementsView::payments` is the rail's answer, keyed by proof; a record not listed is `Payment::Unstated`, and comparing it with another record is unknown (`same_payment_as` notes it). `paid_toward` and `disagreements` return `None` for unknown; `paid` (and a closing's debts) answer `AgreementsError::PaymentUnstated`. Records of one payment count once (`one_count`). Tests in `core/tests` state their stand-in rails' answer (`common::stand_in_payments`); the Lightning story states the Lightning Module's. WebAssembly: `specs.railPayments`. Five verdict vectors (Money, rule 12) and the existing two given their payment fact.

## Next
- Part 2, Part 3, Part 4 (if budget allows), the report.
