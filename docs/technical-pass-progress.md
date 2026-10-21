# The technical pass: progress

*The technical pass (S1b) on the freeze-ready texts, branch `claude/freeze-ready-texts`. Kept so a next session can start from it. The prompt is `docs/lead/prompts/s1b-technical-pass.md`.*

## Done

- **Main merged in** (F363 to F369, `docs/lead/s1-questions.md`).
- **Identity 15** (committed): deterministic CBOR and the CDDL conventions written out once (Part three, "Encoding", "Formats"), floats, tags and simple values as the code and `core/vectors/cbor.json` have them; every tag listed; the spec hash rule (`{0 => 4, 9 => text}`); "everyday act" defined; everyday check 2: a binding to a rotation not yet counting makes the act pending (F367.1); rule 44, rule 45 and "Conflicting receipts" step 3 aligned (F367.2); the keeper exception to the evidence rule (F364.2); the kept tip's summary; one list for re-homed without audit (F368, Q6); what each Identity act names in `objects`; which inside fields an identity-chain act carries; rotation field 1 from 1, field 11 needing field 6; the escape endorsement's CDDL and binding; log positions from 0, the RFC 9162 tree written out; inclusion and consistency proofs in a fixed encoding, the query left to the relay transport cMIP (F369.1); scheme values and key lengths; routes: version 0, two versions 1, the kind written as absent; the default majority's number; a `mor` successor's identifier.

- **Text 11, Envelopes 11, Money 11, Agreements 17, Development 11, MICS v30, suite v30** (each committed): see `docs/technical-pass-report.md`, "Precisely".
- **Provenance map and glossary**: the technical pass's rows added.

## Next

All done; see the report. Next: Nobody, allegedly's answers to the report's eight questions, then S2 (the core aligned, and the vectors).

## Notes for the report

- Consistency-proof encoding: proposed (the relay transport cMIP serves a bare `[* hash]`); the inclusion-proof encoding is the relay transport cMIP's own, written into the core.
- Agreements' fork division tie key: `tagged_hash("MOR/law/leftover", [fork act, successor])`, smallest first (core `agreements/formats.rs`): to write into Agreements.
