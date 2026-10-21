# S2 progress: the core aligned, and the vectors

*The working file of S2 (prompt: `docs/lead/prompts/s2-core-and-vectors.md`). The next session starts here if S2 stops before its report. Branch `claude/s2-core-and-vectors-p14sdz`.*

## Part 0. The last text edits

- [x] F370 written into Money 11 ("What a payment fulfils", receipt field 5, claim field 4, the payment task), Development 11's task table, the MICS's glossary ("Fulfils") and a suite component.
- [x] F371 items 1 to 8 written: Agreements 17 rule 33 (several keepers), "Belongs to" (the version in force; a collective's acts), rule 42, the keeper record's checks, rules 60 and 72 (a member key's act), rule 76 (the grantee's own acknowledgement), "Closing (type 20)" (non-member holders); Text 11 rule 14 (a member key's object) and its freeze lines; Development 11 (a payment cMIP decoded from field 2); MICS v30 and suite v30 lines. Item 5 needed no edit: Text 11 already reads as rule 1 has it.
- [x] Provenance map and glossary.
- [ ] The stranger's reading over Part 0, and its fixes.

## Part 1. The core matches the texts (plan)

What the code does today, read before changing it:

- **Keeper records** are stated by the caller (`AgreementsView::keeper_logs`, `Verifier::keeper_recorded`); type 2 is refused as "format open" by `agreements::in_format` (the dispatcher). To do: decode type 2, read the keeper's sequences from the held acts, one sequence, signer matching, "belongs to", the version in force.
- **Deadlines (rule 33):** no core function. To do: met by an anchor of the act; missed only by keepers' anchored sequences under the keepers' rule; otherwise undetermined.
- **Revocation (rule 76):** an act the revocation's history does not hold is `NotBacked` (void) unless the collective adopted it. To do: disputed where another identity, never the grantee, acknowledged it, or a keeper of its agreement recorded it before the revocation; conferring nothing.
- **Member keys:** Money acts go through `consent` like any act of the collective. To do: Text rule 14's `[collective, version]`; a member-key act citing only its version.
- **Text rule 14:** the one object whose chain is the signer is checked (`text::check_act`, `Verifier::text_pointer`).
- **Contest:** already one format for every act (`Contest::decode`).
- **Pending rotation:** an act bound to a waiting rotation is `Pending` already.
- **Dishonesty:** matches rule 45 as built (a cosigned receipt is one that survives the operator's rotation; otherwise kept through a rotation); a test to pin it.
- **Module fields 11 and 13:** `development::Known::payment_cmip`, one hash. To do: a payment cMIP is one whose field 2 lists Money's task 6, decoded; unknown where it is not held.
- **Spec hash:** `Spec::mir_content(text)`, the text strict. To do: from the file, one final line break removed and the header reduced to the name; the reader (`clients/reader/src/mirs.ts`).

## Part 2, Part 3, the report

Not started.
