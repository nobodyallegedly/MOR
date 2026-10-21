# Freeze-ready texts: progress

*Kept by the freeze-ready texts session (S1, `docs/lead/prompts/s1-freeze-ready-texts.md`). If this session stops, the next one starts here. Branch: `claude/freeze-ready-texts`.*

## Where we are

| Text | New file | State |
| --- | --- | --- |
| Identity draft 15 | `spec/MIR-identity-draft-15.md` | Committed; stranger's reading done, wording fixes committed |
| Text draft 11 | `spec/MIR-text-draft-11.md` | Committed; stranger's reading done, wording fixes committed |
| Envelopes draft 11 | `spec/MIR-envelopes-draft-11.md` | Committed; stranger's reading done, wording fixes committed |
| Money draft 11 | `spec/MIR-money-draft-11.md` | Committed; stranger's reading done, wording fixes committed |
| Agreements draft 17 | `spec/MIR-agreements-draft-17.md` | Committed; stranger's reading done, wording fixes committed |
| Development draft 11 | `spec/MIR-development-draft-11.md` | Committed; stranger's reading done, wording fixes committed |
| MICS v30 | `spec/02-MOR-MICS-v30.md` | Committed |
| Freeze test suite v30 | `spec/03-MOR-freeze-test-suite-v30.md` | In progress: five parts cleaned in parallel in the scratchpad, then assembled |
| Final stranger's reading over all eight | `docs/freeze-ready-strangers/all-eight.md` | After the suite |
| `spec/README.md` | — | At the end |
| Report | `docs/freeze-ready-drafts-report.md` | At the end |

## How each text is made

1. Read the current draft in full, by parts.
2. A mechanical pass (scripts in the session's scratchpad, `tools/clean.py`, `rep.py`, `xref.py`, `prov.py`, `mkprov.sh`; if the scratchpad is lost, the method is: drop "(was N)", finding numbers and review labels in parentheticals, "new in draft N" marks; list every line still carrying a history word): then a hand pass over every listed line.
3. Cross-references to other MIRs checked against the target's current heading (several texts cited other MIRs by pre-renumbering numbers).
4. The provenance map regenerated (`docs/freeze-provenance.md`).
5. A stranger's reading; its wording fixes taken, the rest questions.
6. Commit.

## Questions so far (for the report)

1. **Identity: how a home is queried** (request and response formats; also Envelopes' "how a client finds the deliveries addressed to it", and the inclusion and consistency proofs' encoding): still marked open in the texts.
2. **Text: the pinned Unicode version**: the definition says "Unicode 17.0 as of this draft"; the frozen text must name one version (18.0 may be out).
3. **Money: the unit specification format**: still marked open.
4. **Identity: an act under a pending rotation** (rule 28 says pending; everyday check 2 needs a binding that counts; contested and unknown positions; an escape endorsement bound to a chain signature).
5. **Identity: dishonesty, "and" or "or"** (rule 45 against "Conflicting receipts", step 3; rule 44's "receipts that count" against step 1's "pass receipt check 1").
6. **Identity: re-homed without audit, two lists** of what may not rely on it (the paragraph after rule 35, and "Re-homed without audit").
7. **A keeper's record and its keeper's rotation**: Identity's evidence rule (counts only while its signer's chain keeps it) against Agreements' (a keeper's record keeps its effect whatever the keeper's later rotation disowned).
8. **Development: the signature-scheme specification format** is listed open, and Identity's schemes named by hash rest on it.
9. **Text rule 14 at a Text-only verifier**: it cannot tell a collective or a grant key; what does it answer?
10. **Text rule 14's two cases overlap** (a collective's grant key; one object against joining heads; "invalid" against Agreements' "counts for nothing"; a holder's member key's binding).
11. **Text: which strings are "text fields"** under a specification the verifier does not implement.
12. **The frozen files' final line break**: Development's root check refuses a text ending with a line break; every spec file in the repository ends with one.
13. **Format gaps found by the strangers** (one grouped question): Identity's escape endorsement CDDL, the `objects` entries of acts that "name X in objects", the inside fields Identity acts carry, rotation checks on payload position and field 11, log index base, key lengths, routes' double version 1, and the like (lists in `docs/freeze-ready-strangers/`).

## Wording fixes taken (for the report)

Listed per text in the commit messages and in `docs/freeze-ready-strangers/` (items marked [fixed]). Beyond the strangers: Identity's history sentences; Envelopes' rule 28 and type 2 as one retired line each, its code comments citing rules, Development rule 12 corrected to 22; Money's app names and "lane" removed, Identity and Development citations corrected, rule 7's member key named by the holder's signature, the payment commitment left to the payment cMIP as its task already says.

## To check later

- Identity's freeze scenarios cite suite steps (5.7e, 5.7f, 5.7g, 5.5c, 5.8b, 8.4, 3.9aa): check against suite v30.
- Identity rule 34 and the keeper record: after Agreements 17, write "Agreements rules 41 and 42"; "Its pair is in Agreements" name the rule; the scoped-key entry: a holder's member key named by the holder's signature, dropped by a later version.
- Text's freeze scenarios: add the collective and grant-key components to suite v30; scenario 1's bidirectional override.
- Money line "Agreements rule 11" for "past its terms": check (Agreements' time reference glossary says it).
- MICS v30: fix "a text act carrying acks or objects is invalid" (two exceptions); the format bound to Text's task; every rule number.
- Development 11: task 4's format bound aligned to Text's task.

## Questions added from the Envelopes stranger (14 to 19)

14. Deterministic CBOR's floats, tags and simple values: said once, the same in Identity and Envelopes.
15. Time reference, one meaning: a clock Module under the anchoring cMIP (Envelopes) or a cMIP filling the time-reference task (Development task 10, Agreements).
16. The running summary: inclusive or exclusive (Envelopes' CDDL comment, its Part three, Identity's kept tip).
17. How a MIR's spec hash is computed (Development rule 26 against `tagged_hash("MOR/spec", content)`).
18. "Everyday act" has no one definition (lean: every act other than genesis, a rotation and a chain signature).
19. Envelopes' freeze-scenario numbers against the suite's: check in suite v30.

## Questions added from the Money stranger (20 to 23)

20. **Money rule 7 and a collective's member keys** (the check the prompt asked: it does not yet read cleanly with Agreements rules 60, 73, 74, 80): member keys listed for pointers only; a collective's own-key receipt and rule 60's threshold; the split service's grant naming no area against rule 74; "such a pointer"; which area; a replaced member key; rule 80 for a person's grant and for a member key.
21. Refunds paid to a claim's refund rail against Money rule 4.
22. A collective's pointer left outside a fork (Money rule 4's bullet cites Agreements rule 91, which does not say it).
23. Money rule 12's wording (a receipt and a claim of one payment needing a batch, read literally).

## Agreements 17: decisions written in, and questions (24 to 33)

Written in: keepers redefined (rules 33, 37, 41, 42, the keeper section's *In short*, the keeper record's format, type 2); a revoked grant's acts disputed in Identity rule 34's words (rule 76, rule 79, "Revocation (type 10)"), with the revocation citing every act under the grant as client conformance; "Only acts valid in their own format count" (Dependencies); a grant to oneself and a holder's member key worded without "lane"; "lane" removed everywhere ("the area reaching Money" and so on); "unrecorded" made "pending" (the MICS's word); rule 90's stale "the agreement must define how forks are settled" written as the default (the field is withdrawn).

Questions:

24. What an act disputed under rule 76 confers (valid and shown disputed, in Identity rule 34's words; does it bind, as rule 80's "binds" asks?). Lean: as a rotation's disputed act, it confers nothing on an agreement chain (rule 6) and is shown; Money counts it as Money counts a disputed receipt.
25. The keeper record's details written in for approval: one record per act, public, chained by `prev` in one sequence, its named signer matching the act's, records of two sequences unordered.
26. The readings Agreements still marks "to confirm" (rules 13 twice and its list, 14, 93, "Forked from", the release rule, the split's delivery, the split service's grant, the resignation, the fork's two-step naming; the contest's field numbers).
27. Draft 10's open questions the texts still carry: QK2 (what a seller still held across versions), QK4 (a transfer and a later payment; the text now states the as-built answer), QH3 (a relay's delivery record's object), QH4 (a resignation and the version registering it), QH5 (a notice to a one-time key: "public notice" and "cannot be reached" both in the text), QH6 (a pointer inside a fork's history the fork left out), QJ3 (`[1, work]` in a standing offer, now "not defined"); and draft 10's readings to confirm.
28. The contest's format for other acts (kept as "Still open").
29. Rule 70's last paragraph: money through a split service a grant tied to no area names, "still to be checked".
30. A closing's "holds nothing" does not see stakes sold by transfer (a stated cost as written; was tied to the transfer format being open, now written).
31. The keeper record and its keeper's rotation (same as question 7).
32. Money rule 7 and Agreements rules 60, 73, 74, 80 (same as question 20).
33. Standing for a request to a judge, written "a party who signed the version" (as the text read "as built").

## Development 11 (questions 34 to 36)

34. Development keeps three items "still open": the CDDL conventions for type definitions, the signature-scheme specification format, and how the MIRs are published so their hashes are fixed (the last partly answered by rule 26).
35. "Fields 11 and 13 are a rail Module's (a reading, to confirm)": on any other kind they make the specification no specification.
36. Task 4's bound in the tasks table now points to Text's task (wording; it read "hides only non-letters", against Text's "only its own declared markup" above a floor).

## Development stranger (37 to 38) and Agreements stranger (39 to 45)

37. **Development: normative text in italics** (several lines; rule 21 has no normal text at all; Part three called "for reference"), and "unknown, never invalid" for an act naming a malformed specification against Envelopes rule 30's "invalid beats unknown".
38. **Development's content format**: unknown or duplicate keys, which kinds may carry fields 1, 2, 5, 7, 10 and 12, field 2 "required" yet undetectable from bytes, field 6's hash and binary (grouped with question 13).
39. **Agreements rule 42's third condition**: a keeper record counts only from a keeper named by an agreement the recorded act's `objects` names; rotations, founding terms, receipts, work claims and posts name none.
40. **Agreements rule 38 under several keepers**: the `keepers` format's codes against "any one, a threshold, or all", and how "recorded before the rotation" combines under a threshold.
41. **Agreements rule 33: an anchor of the act itself.** An anchor shows an act existed by a point; how it shows a deadline missed is not stated (the keeper's anchored sequence does, by the act's absence from it).
42. **A deal with no keeper**: a declaration's line, and every signature act "counting as made after it" (against rule 47's "relied on stays complete").
43. **Member keys in detail** (with question 20): removal, which areas count, when the key counts against rule 72, the agreement in force for its acts, a forked line, the member's own rotation; a grant to oneself and type 1 acceptance.
44. **"Only acts valid in their own format count"** against delivery, use and metric records, and transfer field 3 against a valid over-sale.
45. **Agreements' internal contradictions** (one grouped question): abandonment outcomes against a holder with a named stake successor stated three ways; areas over Identity; judicial tasks with or without task 14; fork completeness and non-member holders' chain signatures; record field 3 and take-ups.
