# Stranger's reading: Identity draft 15

*A subagent read `spec/MIR-identity-draft-15.md` with access only to the other core texts (no `docs/`, no findings, no code), as the C session will. Its lists, condensed by the freeze-ready session; line numbers are the draft's. What the session did with each item is in brackets: **[fixed]** (wording, no verdict can change), **[Q n]** (a question in `docs/freeze-ready-drafts-report.md`), **[gap]** (a format or procedure the texts do not give, grouped under one question), **[as designed]** (the text already answers it, or the item misreads it).*

## 1. Rules it could not understand or check

1. "Any failure makes the act invalid" (verification procedures) while several steps yield ignored, not counted, voided, nothing counts. [fixed: "any failure of a check on an act's own shape makes it invalid; each procedure says what its other failures mean"]
2. Checks on every act, step 2, "check that it is public", against private links. [fixed: "save a private link (section 3)"]
3. Genesis is signed by the signing key and adds to the identity chain; rule 6 forbids a signing key adding to the chain. [fixed: rule 6 "beyond genesis"]
4. Rule 7: a verifier cannot tell a chain key except by its commitment; nothing ties schemes to key roles. [as designed: a chain key is one revealed against a commitment; rotation check 3]
5. Rule 28 "acts under its new key are pending" while everyday check 2 needs a binding that counts, so they come out invalid. [Q: pending acts and everyday check 2]
6. No status for acts bound to a contested rotation or an unknown position. [Q: pending acts and everyday check 2]
7. Everyday check 2 forbids binding to a chain signature; an escape endorsement is bound to "the act just before the homeless rotation", which may be a chain signature. [Q: pending acts and everyday check 2]
8. "A later rotation" (everyday check 3, receipt check 5) versus "each rotation judges only the key it replaces". [as designed: the rotation replacing the key the act was signed with]
9. Rule 5 says the binding names an identity-chain act; scoped keys bind a higher MIR's act. [fixed: rule 5 points to everyday check 2 for scoped keys]
10. Kept ancestry "provable without opening any private act", yet `prev` is inside. [as designed: the tip's position and summary are on the rotation; proving a particular private act needs its key, as Envelopes says]
11. Kept tip's "running summary including it" against Envelopes' summary "up to and including the previous act". [gap: the kept tip's summary value]
12. Receipt check 3 and "Which rotation counts", step 1: the home set for genesis, and for an act that sets no homes. [gap]
13. A rotation at n naming a non-counting act at n−1. [gap]
14. The default majority threshold's exact value. [gap]
15. "Several homes" against "at least two distinct operators". [gap]
16. Whether the scheme in a chain-key commitment must equal the signature's scheme. [as designed: the commitment hashes scheme and key together; rotation check 3]
17. The scheme's byte encoding stated only in prose. [as designed]
18. No rule on key length per scheme. [gap]
19. Nothing forbids committing the same chain-key hash again. [gap]
20. Genesis, rotation and chain-signature formats silent on salt, acks, refs, hint, position, summary, objects. [gap: which inside fields Identity acts carry]
21. Rotation check 1 silent on `objects`. [gap]
22. Rotation checks: field 11 requiring field 6; payload position and previous act equal to the inside's; signer equal to the identity. [gap]
23. Escape endorsement payload has no CDDL. [gap]
24. "Names X in `objects`" never says what goes in chain and predecessor. [gap]
25. "An abandoned rotation can never count afterwards": "afterwards" undefined. [gap]
26. No check that an objection's payload identity is the homeless rotation's signer. [gap]
27. A log per relay or per operator. [gap]
28. Log position's first index. [gap]
29. Inclusion and consistency proofs have no encoding; how a home is queried is open. [Q: how a home is queried]
30. Homeless step 4's last case and rule 47: no query protocol, no definition of failure. [Q: how a home is queried]
31. "Cosigned log summary" in receipt check 5 and conflicts, for an identity without audit. [gap]
32. Rule 45 ("and") against "Conflicting receipts", step 3 ("or"). [Q: dishonesty, and or or]
33. Rule 44 ("receipts that count") against "Conflicting receipts" ("pass receipt check 1"). [Q: dishonesty, and or or]
34. Receipt check 6: "another identity" than whom. [gap]
35. Resolving an operator on a cycle: which rotation counts if two exist. [gap]
36. What "served" means for a self-hosted rotation. [gap]
37. "Self-hosted identity" against an identity with one self-hosted home among others. [as designed: rule 2's default; a threshold applies otherwise]
38. Private links: "published at the homes its chain names at the binding" against "published at its signer's homes"; "sealed form" undefined. [gap]
39. "Refuses" a private Identity act of another type is no status. [fixed: "treats it as invalid"]
40. Two version-1 routes acts. [gap]
41. Links step 5 covers MOR-to-MOR confirmation only. [as designed: the outside protocol's link cMIP]
42. Termination "signed by the MOR side" when both sides are MOR. [gap]
43. `successor` identifier length for "mor"; mapping a protocol string to its link cMIP. [gap]
44. Signature schemes named by hash rest on a format Development lists as open. [Q: signature-scheme specification format]
45. Re-homed without audit: two lists of what may not rely on it. [Q: re-homed without audit, one list]
46. "All five kinds" of evidence while rule 34 also conditions keeper records. [Q: a keeper's record and its keeper's rotation]
47. Agreements says a keeper's record keeps its effect whatever the keeper's later rotation disowned; Identity's evidence rule says the opposite. [Q: a keeper's record and its keeper's rotation]
48. Scoped key "added and removed by everyday acts of the identity's signing key": a holder's member key is named by the holder's signature and dropped by a later version. [fixed: the scoped-key entry names both ways]
49. "Refers upward in two places only" while Identity points to Agreements elsewhere. [fixed: "Its rules depend upward in two places only"; the other pointers are commentary or a higher MIR's own rule]
50. A reader refuses "a label this section does not define" while a cMIP may define labels. [fixed]
51. `mkey` of an encryption key, whose scheme 4 Identity's CDDL lacks. [fixed: points to Envelopes' `enc-key`]
52. "64 characters for an identity": an `mid` string is 62. [fixed]
53. "Each allowed once" rests on an air-gapped Module no text defines. [as designed: client conformance, said so]

## 2. Terms used two ways

valid (passes checks; survives a rotation; "valid under Identity only as far as its signature"; disputed "is valid" while "disputed is void but relied on"); disputed (valid and relied on; evidence "shown as a dispute" deciding nothing); void (outside the kept ancestry; a homeless rotation voided by an objection); scoped, unknown, pending, provisional, final not listed as one status set; contested (four senses here, plus Envelopes' key forks and vow sales); chain (identity chain, Envelopes' object chain, the routes chain, "a signer's chain keeps it"); line (a sequence, the identity chain, Agreements' line); sequence (acts, and a home's log "sequence number"); chain key ("used once", yet rule 29's exceptions); signing key (scoped keys also sign everyday acts); act ("any signed object", while the Envelopes entry calls Envelopes "the signed container of an act"); scope (a route's spec hash, a scoped key's limit); layer (MIR layers, "three layers" of evidence of a gone home); grant key installed by a grant versus a holder's key; keeper and record (undefined here); receipt (a home's, Money's); home and operator used interchangeably; anchor undefined here; "rule" meaning the home rule in rule 42; self-hosted; re-homed without audit. **[Taken:** the Envelopes entry fixed to "the act format, defined by the Envelopes MIR"; "disputed" written as one display over a void act in the glossary and in rule 34's wording kept; the rest in `docs/freeze-ready-glossary.md` and the report's term question.**]**

## 3. Cross-references

1. Suite v30 named before it exists. [as designed: written in this session]
2. "(rule 55)" for having found the same acts at the signer's homes. [kept: rule 55 is the rule on the verifier's own attempts]
3. "as rules 40 and 44 say": the end of a conflict is "Conflicting receipts", step 2. [fixed]
4. "otherwise anyone could claim to be anyone" quoted as rule 14; it is in the reasoning. [fixed]
5. "(Agreements: the keeper record, and rule 42)" ambiguous. [fixed after Agreements 17]
6. "Its pair is in Agreements" names no rule. [fixed after Agreements 17]
7. "key Module", "the air-gapped chain key Module", "the app shows it", "the journalist". [kept: Modules named by role; "the app" changed to "the client"; the journalist is the suite's]
8. Receipt check 3's "homeless procedure, step 5". [kept]
9. "(the paragraph after rule 35)" for unknown. [fixed]
10. Development's signature-scheme format open. [Q]
11. Other texts cite Identity's old numbers (Agreements "Identity rules 15 to 17", "rule 8b"; Money "rule 16", "rule 7", "rule 22a"). [fixed in those texts' freeze-ready drafts]

## 4. History left

Only the header's approval line, the retired type 11's line and the suite version, all intended. [as designed]
