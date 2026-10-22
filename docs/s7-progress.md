# S7, the fixes after Fable: progress

*Kept by the S7 session (branch `claude/s7-fixes`) so that a next session can continue. The prompt is `docs/lead/prompts/s7-fixes.md`; the decisions are F380.*

## Done
- Part 1, the MIR hash (Q46): `Spec::frozen_text` is the file less one final line break, nothing else; `Spec::draft_without_status_line` is the named tool; `mirFileHash` (WebAssembly) and the reader follow; the vectors' case and the Python check follow.

- Part 1, "same payment" (Q27): `AgreementsView::payments` is the rail's answer, keyed by proof; a record not listed is `Payment::Unstated`, and comparing it with another record is unknown (`same_payment_as` notes it). `paid_toward` and `disagreements` return `None` for unknown; `paid` (and a closing's debts) answer `AgreementsError::PaymentUnstated`. Records of one payment count once (`one_count`). Tests in `core/tests` state their stand-in rails' answer (`common::stand_in_payments`); the Lightning story states the Lightning Module's. WebAssembly: `specs.railPayments`. Five verdict vectors (Money, rule 12) and the existing two given their payment fact.

- Part 2, the texts: F380's sentences written in place (listed in `docs/lead/workbook.md`, "After the box"), then tightened after a stranger's reading. The core: `Status::NotCounting`; rotation check 7 (`kept_tips_fit`; no tip kept by name); "belongs to" at no fixed depth (`belongs_to_judged`, `keeper_unknown_acts`, `Verifier::keepers_cannot_tell`).
- Part 3, the vectors: content keys per act; receipts named in proofs; `[0]`; the Q30 label; canonical text numbered 7 to 12 and judged in the order numbered (`text::check` aligned); NaN at single width; sixteen new verdict vectors (85 in all); both READMEs, with "What changed since the previous edition"; the Python check (key reuse, rule order, MIR hash).

- Part 4, begun: a succession declared and confirmed (87 verdict vectors).
- After the clients' tests: rotation check 7 applies only where a tip's line is held (a tip held alone stays kept by its name); a held record always matches itself when Money's rules compare payments (`payment_counts_rec`, `payers_claims_for`); Dub's vows pass `railPayments`.
- The report, `docs/s7-report.md`; pull request 96; `make-c-box.sh` assembles the box and refuses nothing.

## Next
- The rest of Part 4: a shared family of SLH-DSA-SHA2-128f chain-signature acts, then a collective's closing and fork, agreements as parties, judgment (plan in the report).
- The report's four questions, for Nobody, allegedly (check 7's "invalid" clause first).
