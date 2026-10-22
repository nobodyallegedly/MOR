# The C verifier's 49 questions, judged

*Fable, 22 October 2026. Input: the bundle `MOR-fable-c-review-bundle` (MOR at `a26727c4`; MOR-CBOX branch `claude/c-verifier` at `6d0c9997`, pull request 1). The texts are MICS v30, Identity draft 15, Text 11, Envelopes 11, Money 11, Agreements 17, Development 11 and freeze test suite v30; line numbers below are theirs. The Rust functions named are in `core/src/`. I built the C verifier here (its four dependencies from source, then `make`), ran its 112 unit checks and the eleven vector files: 285 of 285 agree, as its report says. The Rust tests I could not run (no crate fetching in this container); where I say what the Rust core does, I say it from reading the function, and every vector I propose is for a session with `cargo` to run. Nothing below changes a text, a line of code or a vector, and nothing is decided: each entry says which class the question falls in and what would close it, for Nobody, allegedly, to decide.*

## In plain words

**The verdict on the whole.** The C session read the texts well. Of its 49 questions, none shows the texts contradicting themselves, and none shows the C verifier deciding something the texts forbid. Thirty-one are settled by the texts or by the vectors as they stand, and the C reading and the Rust core give the same verdict. The rest fall into three groups: places where the text is clear enough to a careful reader but leaves a sentence unsaid, so that two honest verifiers could part (nine questions, "Text unclear"); places where the C verifier stops short of the rule and says so, which is honest but leaves a verdict open (four, "C wrong", all of them gaps the C report lists itself); and one place where the Rust core, and the C verifier after it, have written a convenience into a rule (the MIR hash, Q46). Six are housekeeping. No question needs a text changed in substance; every closing sentence below is one the text's own reasoning already implies.

**The questions that matter most.** Four, in this order.

1. **Q46, the MIR hash.** Development rule 26 says every line of a frozen file is part of the hashed text and that at the freeze the first line is the name alone. Both verifiers also drop a one-line italic paragraph that follows the title, as a convenience for hashing drafts. The Rust `frozen_text` drops *any* such line; the C version drops only one beginning `*Draft ` or `*Version `. The MICS and the suite each have, after their status line, a one-line italic paragraph ("*Reading this document…*", "*This suite tests…*"). Once the status line is removed at the freeze, that paragraph becomes the line after the title, and the Rust core would hash the MICS and the suite without it: a wrong hash for two of the eight texts, from a convenience nobody decided. The C verifier would get those two right and would still be wrong for any frozen text whose second paragraph happens to begin "*Version ". This is a Rust-wrong, and the fix is to take the convenience out of the rule's path: the drafts' hashes are a tool's business, the frozen hash is the file's bytes and nothing else.
2. **Q27, "same payment".** Money line 204 says sameness is the rail Module's to judge, "never through the proof's bytes". The C verifier takes identical proof bytes as the same payment; the Rust `payments` map does the same wherever the rail's answer is not listed. Both diverge from the text in the same direction, and the vectors cannot see it because every proof there is byte-stable. A reorganisation that re-serialises a proof, or two witnesses writing one transaction differently, would split one payment into two for both verifiers. The text is right; the code needs the rail's answer to be a fact it is handed, or unknown.
3. **Q14, Q15 and Q49, the stop vocabulary.** The texts have no word for what a rotation that passes its checks but loses at a decided position *is*: Rust answers invalid, C answers void, and F298 says invalid is for a failed rule. Likewise the acts bound to a contested rotation: Rust holds them pending, C has no word. Neither verifier is wrong, because the text does not say; both would be right once it says one thing. This is the only group where a vector today could be written two ways and both pass.
4. **Q35 and Q36, keepers.** "Belongs to" (Agreements line 98) is recursive; Rust follows it to depth four, C one level, the text gives no bound. And the version in force for an act (line 105) is the latest complete version on the named version's line that the act's history holds; Rust implements it (`keepers_version`), C uses the version named and says so. These are where G2 (the aggregated review) already sits: keepers' records between F297 and F302. The texts are precise; the C verifier is short; one vector each would fix the reading for good.

**The divergences found between the C reading and the Rust core, where no vector decides.** Nine: Q11 (a private link found at no home: Rust unknown, C valid), Q14 (invalid against void), Q15/Q49 (pending against unspecified), Q17 (a kept tip whose summary does not fit: Rust keeps the tip by name, C keeps nothing), Q18 (a scoped key's acknowledgement: Rust does not count it, C does), Q27 (both diverge from the text), Q35 (depth), Q36 (version in force), Q41 (records, type 17: Rust applies them, C does not), Q46 (the hash). Each has a vector described in its entry.

## The questions, in the C session's numbering

Classes: **Text unclear** (the text leaves a sentence unsaid; I give it in the text's voice and where it goes), **Text wrong** (none found), **Rust wrong**, **C wrong**, **Vector wrong**, **Housekeeping**. "Same verdict" means the C reading and the Rust core answer alike on the acts the question describes.

### Identity

**Q11. An act whose key the verifier does not hold.** Same verdict for everyday acts: unopened, unknown (both); opened, of a type Identity defines, with a key its chain never installed, invalid (`chain.rs` `status_cx`, the `Verdict::Invalid` branch; C the same). The divergence is the private link: Identity rule 17 (line 235 on) and line 186 require a private link to be found at a home before it counts; the Rust core answers unknown for one found nowhere, the C verifier counts it valid because, as its report says, a link's standing is not built. **C wrong** (a stated gap, not a misreading). Vector: a private link claim and confirmation, both valid in form, served by no home in the facts; expected unknown; the same pair with a home's receipt in the facts, expected valid.

**Q12. A fact gives an index and a path, not which receipt it proves.** Identity line 943 says a proof names `summary`, `receipt`, `index` and `path`; the vectors' fact omits the receipt and lets the verifier find it by the leaf. Same verdict today. **Housekeeping**, vector shape: the generator should write the receipt's hash into the fact as the text names it, so that a vector cannot be passed by a verifier that proves the wrong leaf.

**Q13. When a conflict is proven rather than only contested.** Lines 522 and 530 say what the C session chose (its reading b): two receipts from one home for one position prove the conflict; without them the position is contested. Same verdict. Settled by the text.

**Q14. A rotation that passes its checks and loses at a decided position.** Rust `status_cx` answers invalid; the C verifier answers void; the text (rules 40 to 44, lines 500 to 516) says which rotation counts and says nothing of what the other *is*. F298 reserves invalid for a rule the act fails, and this rotation fails none. **Text unclear.** Closing sentence, under "Which rotation counts" (line 376): *A rotation that passes the rotation checks but does not count at its position is neither invalid nor void: it is not counting, and a client shows it so; the acts bound to it are judged by the rotation that counts.* Vector: two rotations at one position, both passing the checks, the home rule deciding for one; the verdict question on the other.

**Q15. The chain question's stop vocabulary.** The Rust `Stop` enum (no genesis, unknown, invalid, end, pending, contested, cannot tell) is the C session's vocabulary word for word; the texts name none of it. Rust `waiting()` holds every act bound to a contested rotation pending until the contest resolves; the C verifier leaves them unspecified. **Text unclear**, with Q49; the closing sentence is there. Vector: a contested rotation at position n and an everyday act bound to it; expected pending.

**Q16. Is `prev` required on every everyday act?** Envelopes' comment on the inside says "required on every everyday act"; both verifiers require it. Same verdict; settled.

**Q17. A kept tip whose rebuilt line does not reach it or whose summary does not match.** Line 435 answers the first half (a line the verifier cannot rebuild: unknown). For the second, the Rust `in_kept_ancestry` keeps the tip act by name (`t.act == x.id`) before rebuilding the line, so a tip whose summary does not fit still counts as kept while nothing below it does; the C verifier keeps nothing from such an entry. Neither follows from the text, which makes the summary part of what the rotation carries (line 44) and never says what a wrong one does. **Text unclear.** Closing sentence, in "The rotation checks" (line 367), as a seventh check: *7. Each kept tip's running summary is the summary of the line it names up to that tip, where the verifier holds that line; a tip whose summary does not fit keeps nothing, and a rotation whose every tip the verifier holds and none fits is invalid.* (If Nobody, allegedly, prefers the tip to stand on its name alone, the sentence is the Rust reading instead; either closes it.) Vector: a rotation naming a tip with a wrong summary, the line held; the verdict question on the tip act and on an act below it.

**Q18. Whose acknowledgement counts.** Rule 34 (line 398) says an acknowledgement counts "only while its own signer's chain keeps it valid". Rust `acknowledged()` requires `Status::Valid`, so an acknowledgement signed with a scoped key (status scoped, not valid) does not rescue a disowned act; the C verifier accepts valid or scoped. The text's word "valid" supports Rust, but scoped is valid within its scope, and a reader may take it either way. **Text unclear.** Closing sentence, in rule 34 after "the exception stated there for keeper records": *An acknowledgement counts only when signed with the acknowledging identity's own key, never with a scoped key: reliance is the identity's, not a grantee's.* Vector: a disowned act acknowledged by a witness act signed with another identity's scoped key; expected void.

**Q19. "Status" against "status after keepers".** The vectors ask both because Identity alone cannot see keeper records; Agreements rules 36 to 42 and Identity rule 34 give the second. Both verifiers answer both; same verdict. Settled, and the two questions should stay two.

**Q20. Homeless rotations and the escape.** Lines 570 to 618 say what the C session chose (never by its own flag; through the procedure or the escape); Rust the same. Same verdict; settled.

**Q21. Self-hosted homes and identities resolving into each other.** "Resolving an operator" (line 301 on) supports the reading: a self-hosted home's receipt is the rotation it serves. For a loop (a home's chain leading back to the identity being resolved), the Rust `resolve_cx` detects it with its `Cx.stack` and takes the inner chain on its own signatures, with no depth bound; the C verifier does the same to a fixed depth and answers unknown beyond it. Same verdict on every chain shorter than the C bound; the bound is a limit of the build the text does not set, and unknown beyond it is the permitted answer (line 435). **Housekeeping**: the C report should state the bound as a limit of the build, not a reading.

**Q22. Duplicate copies of one act id.** Envelopes line 358 is explicit (the id is the locked bytes' hash; the signature is outside it), and the suite's line 517 exercises it; a verifier keeps the copy whose signature is valid, and both verifiers do. Same verdict; settled, no vector needed.

**Q23. Which declaration of a collective's agreement counts.** Line 3787: per (specification, kind), the counting chain act with the highest position, `null` removing it. Both verifiers follow. Same verdict; settled.

### Text

**Q24. Rule 14 for decisions.** Same verdict in every case the C session lists; Rust `text_pointer` (`chain.rs` 1921) and `text.rs` 259 implement the same shapes, and the six vectors cover them. One word both verifiers pass over: rule 14 says a collective's one object names "its own *latest* decision", and neither checks latest, only that the predecessor is a decision of the collective's own (Rust: any position of its chain, or any record of its own; C: a record, grant or revocation of the collective). Same verdict, and lenient in the same way. **Text unclear**, lightly: either the word "latest" is a client's duty (then say so: *a client names the latest; a verifier accepts any decision of the collective's own*) or it is a check, and then a vector for an older decision named is missing. The reasoning in italics (the pointer places the text on the actions chain) favours the first.

**Q25. Rule 14 when Agreements is absent.** The text's second paragraph (line 63) says exactly what the C session chose, and Rust `text_pointer` returns `None` (unknown) where the signer's chain or the named act is not held. Same verdict; settled.

### Envelopes

**Q26. Invalid beats unknown.** Envelopes rule 30; Rust `status_cx` opens with it (its first comment). Same verdict; settled.

### Money

**Q27. "Same payment".** Line 204: whether two proofs are of one payment is the rail Module's to say, "never through the proof's bytes". The C verifier treats identical bytes as one payment and different bytes as two; the Rust `payments` map takes the rail's answer where the facts list it and falls back to the bytes where they do not. Both diverge from the text where it matters: a rail whose proofs are not byte-stable (a reorganisation, two witnesses). **Rust wrong and C wrong** in the same place, and **vector wrong** for leaving it untested. Change to the generator: a case with two byte-different proofs that the rail's fact says are one payment (expected: one payment, the second receipt a duplicate under rules 10 and 11), and a case with two byte-identical proofs the rail's fact says are two (expected: two). Both verifiers should answer unknown where the rail's fact is absent and the bytes differ.

**Q28, Q29.** Same verdict; settled by rules 10 and 11 and the vectors.

**Q30. "The vault's declaration" in a case whose identity declares no vault.** The vector's label is wrong, not its bytes: the payment names a payee pointer, and both verifiers pass it. **Housekeeping**, vector label.

**Q31. Version 0 on a payee pointer.** Both refuse it (`money.rs` 551; C `formats.c` `versioned()`); Money's versioned chains begin at 1. Same verdict; settled.

### Agreements

**Q32. Founding terms and deal marks.** Rust `check_terms_inside` (`formats.rs` 1740 on) requires field 4 to be every party on founding terms and a mark on a clone, and a deal's clone rule to be every party; existence is every party's valid signature. The C reading is the same. Same verdict; settled.

**Q33. Clone objects `[parent, parent]`.** Line 3046 writes `[[parent, act]]`; the terms comment at line 2880 says "with its latest act in objects"; the Rust core accepts any act of the parent's chain as predecessor; the vectors write the parent twice, which is one such act. **Housekeeping**: align the comment at 2880 with 3046 (*the parent as chain and, as predecessor, an act of the parent's line, its latest where the client holds it*), so that the vectors' shape is visibly within the rule.

**Q34. A deal fork and its reference.** Rules 46 and 47 as the C session reads them; Rust the same. Same verdict; settled by the fork case.

**Q35. "Belongs to", how far.** Line 98 defines it through "an act that belongs to it": recursive, with no bound. Rust `belongs_into` follows it to depth four (a bound of the build); the C verifier stops at one level. A keeper's record that names an act two steps from the agreement (an obligation's fulfilment under a deal's clone) belongs for Rust and not for C. **C wrong**, and the text is silent on depth. Closing sentence at line 98: *A verifier follows "belongs to" through every step the acts it holds allow; it does not stop at a fixed depth, and where a step names an act it does not hold, it answers unknown for what lies beyond.* (If a bound is wanted for cost, it belongs in the suite's working rules, stated.) Vector: a keeper record naming an act at depth two; expected counted.

**Q36. The version in force for an act.** Line 105 is precise: the latest complete version on the named version's line that the act's history holds. Rust `keepers_version` implements it; the C verifier uses the version the act names, and its report lists this under "not implemented". **C wrong** (stated gap). Vector: a deal with a clone in force, an act naming the founding whose history holds the clone, keepers named only by the clone; expected the clone's keepers count.

**Q37. Keeper records and a keeper's later rotation.** Identity line 413 states the keeper exception; the C reading follows it; Rust `keepers_recorded_before` the same. Same verdict; settled.

**Q38. "Before" in a keeper's sequence.** The C reading (walk `prev` within the keeper's own acts) is the text's and Rust's. Same verdict; settled.

**Q39. Deadlines.** Rust `deadline()` reads an anchor at or before the point as met, as the C session does; the five choices match. **Housekeeping**: the suite's question writes the keepers' rule as `0` where the format writes `[0]`; the generator should write `[0]`.

**Q40. A collective's consent.** Rule 73 (lines 1665, 1669, 2148) defines a member key as the C session reads it; areas, done, frozen areas and the constitutional rule are rules 57 to 60, 65 and 72. Same verdict; settled.

**Q41. Records (type 17) when counting consent.** Line 3647: an operational clone recorded by the collective is in force "at once". Rust `record_eval` applies records; the C verifier does not, and says so. **C wrong** (stated gap). Vector: a collective records an operational clone changing an area's number; an act under the new number; expected counted by Rust's reading, and the text's.

**Q42. Grant backing.** Rule 79 (line 2260) with rule 76; Rust `Backing` has the same states (backed, binds, void, disputed, unknown). Same verdict; settled by the grant cases.

**Q43. A grant not accepted.** Rust `accepted()` (`view.rs` 4941) requires the grantee's valid signature act naming the grant, as F128 says; the C reading is the same. Same verdict; settled.

**Q44. A grant to oneself.** Line 2141 says valid; both follow. Same verdict; settled, no vector.

**Q45. Terms checks written as prose.** Fields 10 and 25 withdrawn, field 4, collective-only fields, stakes summing to one million, a holder never the collective, one time reference, a judge not its own task, the keepers' rule: all in `check_terms_inside`, and the C list matches it. Same verdict; settled.

### Encoding, text and the act

**Q1. The order of canonical-text checks.** Settled by `canonical-text.json` (37 cases), and rule 7 (UTF-8) comes first on either reading. **Housekeeping**: the text could say "the first rule, in the order numbered, that the string breaks", one clause at Text rule 7.

**Q2. Error names for additional-information 28 to 31.** Settled by `cbor.json`; the names are the vectors', not the text's, and no verdict rests on the name. **Housekeeping**.

**Q3. Shortest floats and NaN.** The Rust `cbor.rs` encodes a NaN in the shortest width that keeps its payload, as the C session chose, reading RFC 8949 4.2.1 as Identity cites it. Same verdict. **Vector wrong** by omission: add a NaN whose payload needs single width, accepted at single and refused at double.

**Q4. The order of an act's opening checks.** Settled by `open-act.json`; the Rust `Inside::decode` path runs them in the same order. **Housekeeping**: the text could say, once, that the rules are numbered for reading and checked in the order the bytes allow.

**Q5. Which strings must be canonical.** Rust `text::check_value` checks every text string in the inside, keys included, at any depth, as the C session chose; Envelopes rule 5 says "the act", Text rule 1 says "every text field". Same verdict. **Text unclear**, lightly: closing clause at Envelopes rule 5: *every CBOR text string in the inside, map keys included, at any depth, whatever specification the act names.*

**Q6. A content key used twice (Envelopes rule 9).** Rule 9 binds the signer, and no verdict rule reads it; the C verifier enforces nothing, and the Rust core likewise. The vectors reuse keys and nonces across acts (the test keys derive from labels). Same verdict. **Vector wrong**: the generator should derive one key per act, so that a future verifier that warns on reuse is not failed by the vectors; and rule 9 should carry the words *client conformance* so a reader knows it is never a verdict.

**Q7. X-Wing, whose draft is not in the box.** The C session implemented X-Wing from memory and `sealed.json` confirms it byte for byte; it did not compute `XWING`, the hash of the draft's text, which no rule it checks reads. Same verdict. **Housekeeping**, but it points at a weakness (below): Envelopes lines 370 and 502 fix a constant by the SHA-256 of a text that is not in the genesis repository. At the freeze the draft's text, or at least its bytes' hash and where they were taken from, should be committed beside the MIRs, licensing permitting, or the rule rests on a fact a verifier in a box cannot check.

**Q8. The 90-character limit.** Line 758 states it as a property of BIP-350's guarantee, not a rule, and an `mkey` of an X-Wing key cannot fit it. The C reading is right; Rust sets no limit either. Same verdict; settled.

**Q9. Which refusal a bad textual form gets first.** Settled by `textual-forms.json`. **Housekeeping**.

**Q10. Bare hexadecimal and hints.** Lines 752 and 754 support the C reading (hex for hashes, never a key; hints on `mid` only). Same verdict; settled.

### Development

**Q46. The MIR hash's text.** Rule 26 (lines 265 to 269): the content is `{0 => 4, 9 => text}`, the text is the file with one final line break removed, every line of the file is part of it, and at the freeze the first line is the name alone. Both verifiers add a step the rule does not have: they drop a one-line italic paragraph after the title, with the blank line before it. Rust `frozen_text` (`development.rs` 437) drops any such line; C (`development.c` 212 on) only one beginning `*Draft ` or `*Version `. The MICS and the suite have a one-line italic paragraph right after their status line (MICS line 5, 511 characters; suite line 5, 397). At the freeze, with the status line gone, that paragraph is the line after the title, and the Rust core hashes both texts without it. **Rust wrong**, and **C wrong** in principle (a narrower pattern, the same step outside the rule). The fix: `mir_file_hash` and its C twin hash the file's bytes less one final line break, nothing else; dropping a draft's status line, if wanted, is a tool's option, named as such, never on the path a verdict takes. Vector: a file `# T\n\n*an italic line*\n\nbody\n`; expected the hash over the text with the italic line kept. The five MIR-hash cases use stand-ins without such a line, which is why 285 of 285 agree.

**Q47. A Module under a MIR.** Lines 349, 362, 479 and 489 say what the C session chose; Rust `development.rs` 420 the same. Same verdict; settled.

### Verdict questions in the vectors

**Q48. All six MIRs, no cMIP.** As stated; the facts stand in for rail answers and anchors. Settled.

**Q49. The chain question's stop vocabulary.** With Q15. The suite asks for "what stops the chain" and the texts have no word for it; the Rust enum is one answer and the C verifier adopted it. **Text unclear.** Closing sentence, in the suite's "How to read a chain question" or at Identity's "A verifier that cannot tell answers unknown" (line 433): *A chain stops for one of seven reasons, and a verifier names which: no genesis held; the next act unknown; the next act invalid; the end of what is held; the next act pending a contest; the position contested; or the verifier cannot tell. The same reason from two verifiers holding the same acts is part of the freeze test.*

## Is the core freezable once these are closed

Yes, with two conditions, and I say so more firmly than after the aggregated review, because a second implementation, written in a box from the texts alone, agrees with the first on 285 checks and asks 49 questions of which none finds the texts wrong. That is the test a specification can pass: a stranger reading it builds the same thing. The C session's questions are the residue, and the residue is small and of one kind: the texts say what counts and sometimes not what the rest *is called* (Q14, Q15, Q49), or say a rule precisely and leave its depth or its key unsaid (Q17, Q18, Q35). Those are sentences, not designs.

The first condition is Q46. A trust root of six hashes that two implementations compute from the same bytes differently is not a root; it is the one thing the freeze cannot carry. The fix is a deletion in two places and one vector. The second is Q27, which is the one place where both implementations took the same convenient path against a text that had foreseen it; the text is right, and the vectors should be made to catch it before the freeze, not after.

What the questions point at as a weakness is this. Every divergence between the two verifiers that no vector catches lives in a part of the protocol that the vectors leave out because its acts are heavy (the README's reason: megabytes of SLH-DSA signatures). The C report's "What is not implemented" list is, almost line for line, the list of rules that act on long chains of chain signatures: links' standing, succession confirmed, forks on versioned chains, the version in force, records, collective forks and closings, judgment chains, nesting. The freeze suite reasons through those and runs the rest. The weakness is not in the rules; it is that the only proof of two verifiers agreeing on them is reading. Two things would narrow it. One: a vector family with one short chain signature each, built once and reused, so that the heavy acts cost megabytes once rather than per case. Two: the suite marking, scenario by scenario, which of its steps a vector has reached and which are reasoned only, so that the freeze can say what it has shown and what it has argued.

Two smaller weaknesses the questions show. Q7: a constant in the core (`XWING`) is fixed by the hash of a text that is not in the genesis repository; a verifier in a box cannot check it, which is the fourth review pattern in miniature. Q6 and Q12: the vectors are also a specification, and where their shape is looser than the text's (a fact without its receipt, keys reused) a verifier can pass them while reading the text wrong. The generator should be held to the text's shapes as the code is.

## Vectors to add, for a session with `cargo`

Each is described in its entry; the list: Q11 (a private link at no home), Q14 (a passing rotation that does not count), Q15 (an act bound to a contested rotation), Q17 (a kept tip with a wrong summary), Q18 (an acknowledgement under a scoped key), Q27 (two byte-different proofs of one payment; two identical proofs of two), Q3 (a single-width NaN), Q35 (a record at depth two), Q36 (keepers of the version in force), Q41 (an operational clone by record), Q46 (a file with an italic line after its title). And the generator changes: Q6 (one key per act), Q12 (the receipt in the fact), Q30 (the label), Q39 (`[0]`).
