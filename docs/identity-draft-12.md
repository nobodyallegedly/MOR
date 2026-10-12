# Identity draft 12: the report

*12 October 2026. Roadmap: Identity draft 12, plain reading in Agreements draft 11's and Money draft 7's style (F251), one step, texts only. Branch `claude/identity-draft-12-reading-gayoqt`, one commit for the text and one for this report. For Nobody, allegedly, to review and approve.*

## In plain words

Identity draft 11 was readable but out of order. It ran from the formats to the checks to 56 rules, numbered with letters as they grew (1a, 8c, 10f, 32a), so a reader met rare cases (homeless rotations, conflicting receipts, audit) before seeing how an ordinary rotation works. Its header also carried the story of eleven drafts. Draft 12 says the same rules again, in the order a reader meets them.

**This draft changes no rule.**

- **Part one** is an identity as it runs most of the time:
  - it is born: genesis, its homes, the home rule and its default, self-hosting;
  - it signs: the two keys, bindings, scoped keys;
  - its everyday acts: witness acts, routes and the inbox, names, links;
  - its homes: what a home must do, receipts, acceptance conditions;
  - a rotation as it usually runs, and which one counts;
  - what a rotation keeps, and what it voids.
- **Part two** is the rare cases: chain signatures, succession, competing rotations and conflicting receipts, homeless rotations, escape with both keys, finality, audit.
- **Part three** is the encoding and the act formats, for reference. **Part four** is the tasks, reasoning, open parameters and freeze scenarios.

Each verification check now stands next to the rules it serves. Each check keeps its name and step numbers ("receipt check 6", "homeless procedure, step 4"), so every existing citation of a check still works. Long rules are cut into short lists. Each section opens with an italic *In short*. Every rule has a new number, 1 to 56, with its old number beside it ("Rule 9 (was 18a)"). A table maps old numbers to new. The one numbered Agreements citation now uses draft 11's numbers: grant rules 38 to 44 became 73 to 80. Draft 11 cited no Money rule by number.

The revision notes, the "revised in place" notes and the list "Choices introduced by drafts 2 to 11 (decided)" stay in draft 11 and the findings log. Every rule they describe is stated in the rules themselves.

**How we know no rule moved:**

- No code changed, and the code's tests pass, with the same counts as on main (below).
- A script checked every "rule N" in draft 12 through the table against what draft 11 cited. All of them map.
- A second script looked for every sentence of draft 11 in draft 12. Each sentence it did not find was checked by hand: each was a renumbered reference, a sentence split into a list, or a label ("Cost, stated" is now "Stated cost").
- A second reader, who had not written the text, compared draft 12 with draft 11, rule by rule and section by section. They found no rule whose content changed. The MUST, SHOULD, MAY and MUST NOT counts are equal (42, 14, 10, 14). The CDDL is byte-identical apart from one rule number in a comment. The tasks, reasoning, open parameters and freeze scenarios are identical. They did find 11 points, all in what the rewrite added (summaries, intros, "How to read", the header): 10 are fixed, and 1 is a header change, listed for approval. The list below names each.

**No questions** for Nobody, allegedly. Writing exposed no flaw or contradiction in an Identity rule that is not already decided. The wording points noticed are carried unchanged and listed at the end.

## What changed, file by file

- `spec/MIP-identity-draft-12.md`: new.
- `spec/README.md`: one line, draft 12, awaiting approval.
- **Unchanged:** `spec/MIP-identity-draft-11.md` stays the approved text. It is also the reference that code comments, tests, records, core v21, freeze suite v21, Agreements draft 11 and Money draft 7 cite by its numbers (for example "Identity rules 15 to 17", "rule 8b", "rule 22a"). No code, test or record was edited. Core v21 and freeze suite v21 were not edited (the next section explains why nothing in them needs to change).

## Core v21 and freeze suite v21: sentences that quote a changed sentence

**None.** A script went through every quoted passage in `spec/02-MOR-core-v21.md` and `spec/03-MOR-freeze-test-suite-v21.md`. It checked whether each quote is draft 11 text, and whether that text is still in draft 12. Every Identity sentence they quote is still in draft 12 word for word:

- "I received this act and rely on it" (core lines 95 and 434; suite line 57);
- "I received this act" (core line 126);
- the section title "Chain signature (type 16)" (suite line 246). That section is still in draft 12, in Part three. What the act counts as and changes is now in section 7, which the format section points to.

The other quotes that match draft 11 text are not Identity sentences: "F132 written in" is a section of `docs/law-invariants.md`, and "Fork (type 19)" is an Agreements section.

Core and the suite also cite Identity by rule number. Those numbers stay draft 11's until the freeze-ready draft, as for Agreements and Money. The table below is how to find each one in draft 12.

## Old numbers to new

Every old rule has exactly one new number. None was split, merged or dropped.

| Old | New | Rule |
| --- | --- | --- |
| 1 | 5 | The verifier runs the checks |
| 1a | 8 | Scoped keys |
| 2 | 7 | A chain key signs only rotations and chain signatures |
| 3 | 6 | A signing key never adds to the identity chain |
| 4 | 1 | Genesis |
| 5 | 2 | Several homes: the home rule, and its default |
| 6 | 27 | A valid rotation |
| 7 | 28 | A rotation counts once the homes receipt it |
| 8 | 26 | Why an owner rotates is the owner's business |
| 8a | 29 | One chain key, one rotation |
| 8b | 31 | Declarations ride on the chain key |
| 8c | 50 | Closure, by the operator's rotation |
| 9 | 18 | A home checks before it stores |
| 10 | 19 | A home keeps and serves |
| 10a | 20 | A receipt for every chain act |
| 10b | 44 | Two receipts from one home: a conflict |
| 10c | 21 | Rely on receipts |
| 10d | 45 | Dishonesty, proven at a position |
| 10e | 56 | Audit is the owner's choice |
| 10f | 3 | A single home's security is the owner's |
| 11 | 30 | First held wins, at each home |
| 11a | 48 | An old home objects |
| 12 | 24 | A home's own acceptance conditions |
| 12a | 25 | Device-bound policies are never the default |
| 13 | 22 | What a home serves besides the chain |
| 14 | 23 | Consult the homes |
| 15 | 33 | Kept acts stay valid |
| 16 | 34 | Acts left out or disowned are void, unless relied on |
| 17 | 35 | Sequences a rotation does not name |
| 18 | 36 | Old disputes may be collapsed |
| 18a | 9 | A client implements every MIP it acts on |
| 18b | 10 | Witness acts |
| 18c | 11 | A witness act is never a side effect |
| 19 | 40 | The home rule decides between competing rotations |
| 20 | 41 | With no declared rule, the default |
| 21 | 42 | A contested rotation's rule waits |
| 22 | 43 | An outvoted home |
| 22a | 4 | Self-hosting is a trust model |
| 23 | 14 | A link needs both sides |
| 24 | 15 | Either side may end a link |
| 25 | 16 | A link gives no authority |
| 26 | 17 | Private links |
| 27 | 37 | Only in a rotation that counts |
| 28 | 38 | The latest rotation decides |
| 29 | 39 | Succession does not end the identity |
| 30 | 46 | The way out of homes that are gone |
| 31 | 54 | The old homes' rotation always wins |
| 32 | 49 | One objection voids it |
| 32a | 55 | Re-homed without audit is never final by the next rotation |
| 33 | 47 | A client first tries the old homes |
| 34 | 51 | A home that closes says so |
| 35 | 52 | Auditors for a single home |
| 36 | 53 | Both keys always get out |
| 37 | 32 | Keep the two keys apart, and back both up |
| 38 | 12 | Anyone can find anyone |
| 39 | 13 | A stolen signing key and the inbox |

The checks keep their names and step numbers: every act, genesis, rotation, chain signature, everyday acts, receipt, conflicting receipts, log summaries and audits, the homeless procedure, objection and absence statement, resolving an operator, which rotation counts, and which value counts. Each check now sits in this section:

| Check | Section in draft 12 |
| --- | --- |
| Every act; everyday acts (types 2 to 15) | 2. Signing |
| Genesis | 1. An identity is born |
| Which value counts: declarations, succession, routes, names, links | 3. Everyday acts |
| Receipt; resolving an operator | 4. Homes and receipts |
| Rotation; which rotation counts | 5. A rotation as it usually runs |
| Chain signature | 7. Chain signatures |
| Conflicting receipts | 9. Competing rotations |
| Homeless procedure; objection and absence statement | 10. Homeless rotations |
| Escape with both keys (paragraph) | 11. Escape |
| Finality; re-homed without audit (paragraphs) | 12. Finality |
| Log summaries and audits; inclusion proofs | 13. Audit |

## No rule moved: the rule-by-rule list

*How it was checked.* I rewrote draft 11 against a checklist of every condition, exception, MUST, SHOULD and MAY, "invalid", "void", "counts for nothing", finding tag, client conformance mark and stated cost. Then three checks:

1. A script listed every rule reference in both drafts and mapped each one through the table.
2. A script looked for every sentence of draft 11 in draft 12. I checked by hand each sentence it did not find.
3. A second reader, who had not written the text, compared draft 12 with draft 11, rule by rule and section by section. They looked only for a statement changed, dropped, weakened, strengthened or added, including text moved between protocol and commentary. They diffed the CDDL, the tasks, the reasoning, the open parameters and the freeze scenarios.

The code's tests, unchanged, pass (below).

**What the rewrite removed on purpose.** Each of these is history, and each fact stays in draft 11:

- the header's revision notes for drafts 7 to 11: F86 to F88, F92 to F95, F101, F110, F128, F129 and F132, and question H1;
- the section "Choices introduced by drafts 2 to 11 (decided)", with its dates and decision quotes. Every choice it lists is stated as a rule or check in draft 12. The finding tags F18, F19, F20, F61, F117 and F131 appeared only there and in the header.

**What the rewrite added:**

- the "How to read" section;
- the *In short* summaries and the openings of Parts one and two;
- the headings that group the definitions;
- pointers from Part three to the sections where the moved text now stands;
- the list of the checks and where each one is.

None of these says anything the rules do not say. Where the second reader found that one did, it is fixed (below).

### The 56 rules

| New | Was | Rule | Second reading |
| --- | --- | --- | --- |
| 1 | 4 | Genesis | no difference |
| 2 | 5 | Several homes: the home rule, and its default | no difference (split into a list) |
| 3 | 10f | A single home's security is the owner's | no difference |
| 4 | 22a | Self-hosting is a trust model | no difference |
| 5 | 1 | The verifier runs the checks | no difference in the rule; fixed: the paragraph listing the checks, which ends "Any failure makes the act invalid", taken out of the rule's body and given its own heading, so it is not cited as rule 5 (finding 8) |
| 6 | 3 | A signing key never adds to the identity chain | no difference |
| 7 | 2 | A chain key signs only rotations and chain signatures | no difference |
| 8 | 1a | Scoped keys | no difference (references renumbered; Agreements 38 to 44 now 73 to 80) |
| 9 | 18a | A client implements every MIP it acts on | no difference |
| 10 | 18b | Witness acts | no difference (the format section's sentences and commentary on the witness act moved here, intact) |
| 11 | 18c | A witness act is never a side effect | no difference |
| 12 | 38 | Anyone can find anyone | no difference |
| 13 | 39 | A stolen signing key and the inbox | no difference |
| 14 | 23 | A link needs both sides | no difference |
| 15 | 24 | Either side may end a link | no difference |
| 16 | 25 | A link gives no authority | no difference |
| 17 | 26 | Private links | no difference |
| 18 | 9 | A home checks before it stores | no difference |
| 19 | 10 | A home keeps and serves | no difference |
| 20 | 10a | A receipt for every chain act | no difference |
| 21 | 10c | Rely on receipts | no difference in the rule; fixed: section 4's *In short* said clients rely on receipts; it now says "should", as the rule's SHOULD (finding 6) |
| 22 | 13 | What a home serves besides the chain | no difference |
| 23 | 14 | Consult the homes | no difference |
| 24 | 12 | A home's own acceptance conditions | no difference |
| 25 | 12a | Device-bound policies are never the default | no difference |
| 26 | 8 | Why an owner rotates is the owner's business | no difference |
| 27 | 6 | A valid rotation | no difference (split into a list) |
| 28 | 7 | A rotation counts once the homes receipt it | no difference |
| 29 | 8a | One chain key, one rotation | no difference (split into a list) |
| 30 | 11 | First held wins, at each home | no difference in the rule; fixed: section 5's *In short* said each home holds the first rotation it sees; it now says a home that accepts a rotation holds the first valid one and rejects any other (finding 2) |
| 31 | 8b | Declarations ride on the chain key | no difference |
| 32 | 37 | Keep the two keys apart, and back both up | no difference |
| 33 | 15 | Kept acts stay valid | no difference |
| 34 | 16 | Acts left out or disowned are void, unless relied on | no difference in the rule; fixed: Part one's opening summary now says acts left out *or disowned* are void unless another identity acknowledged them or a named keeper recorded them (finding 5) |
| 35 | 17 | Sequences a rotation does not name | no difference |
| 36 | 18 | Old disputes may be collapsed | no difference in the rule; fixed: the client conformance mark now reads "a duty or permission", since this rule is a MAY (finding 9) |
| 37 | 27 | Only in a rotation that counts | no difference |
| 38 | 28 | The latest rotation decides | no difference |
| 39 | 29 | Succession does not end the identity | no difference |
| 40 | 19 | The home rule decides between competing rotations | no difference |
| 41 | 20 | With no declared rule, the default | no difference |
| 42 | 21 | A contested rotation's rule waits | no difference |
| 43 | 22 | An outvoted home | no difference |
| 44 | 10b | Two receipts from one home: a conflict | no difference in the rule; fixed: section 9's *In short* called a second use of a chain key a thief's or a mistake; it now names rule 29's two exceptions too (finding 4) |
| 45 | 10d | Dishonesty, proven at a position | no difference |
| 46 | 30 | The way out of homes that are gone | no difference ("the verification procedure above" now "the homeless procedure below") |
| 47 | 33 | A client first tries the old homes | no difference |
| 48 | 11a | An old home objects | no difference |
| 49 | 32 | One objection voids it | no difference in the rule; fixed: section 10's *In short* said "any live home" stops it; it now says "a valid objection" and points to the exceptions (finding 3) |
| 50 | 8c | Closure, by the operator's rotation | no difference |
| 51 | 34 | A home that closes says so | no difference |
| 52 | 35 | Auditors for a single home | no difference |
| 53 | 36 | Both keys always get out | no difference |
| 54 | 31 | The old homes' rotation always wins | no difference |
| 55 | 32a | Re-homed without audit is never final by the next rotation | no difference |
| 56 | 10e | Audit is the owner's choice | no difference |

### The other sections

| Section | Second reading |
| --- | --- |
| Header | fixed: a decision quote from the dropped "Choices" list (F132's reason) had been kept in section 7, against the header's own statement that decisions stay in draft 11; removed (finding 7). The "written against" line now names core v21, Envelopes 7, Text 6, Money 7, Agreements 11, Development 6 and F1 to F266, instead of draft 11's "core v21, Envelopes 7 and F1 to F117, F128, F129, F132". That is metadata, not a rule; listed for approval (finding 11) |
| How to read | fixed: "client conformance" reads "a duty or permission" (finding 9). Fixed: the documents that keep citing old numbers are named without version numbers, since the freeze scenarios still say "freeze test suite v16" (finding 10; see carried point 3) |
| Part two's opening | fixed: it said a chain signature is spent "only on an Agreements fork or closing"; Identity does not limit what one signs. It now reads "only where a higher MIP asks for one (today, Agreements' forks and closings)" (finding 1) |
| The verification procedures | fixed: their opening ("A verifier runs these checks in order. Any failure makes the act invalid.") stands under its own heading, not inside rule 5 (finding 8). The checks' texts match draft 11, apart from renumbered references and added pointers |
| Purpose, Dependencies | identical |
| Definitions ("Words used in this MIP", grouped under five headings, all 22 kept) | identical text, reordered (chain key now before scoped key); one reference renumbered |
| Encoding and conventions | identical |
| Act formats: CDDL | byte-identical, apart from "(rule 5)" to "(rule 2)" in the genesis comment |
| Act formats: prose | no difference. Text moved to the rules it serves, intact: the private-link paragraph to section 3, "one signer per act" to section 2, the address hint to section 4, proofs carried to section 13, the objection's "no clock is needed" to section 10, the escape endorsement to section 11, the chain signature's counting to section 7, the witness act to rule 10. A pointer is left at each place |
| Tasks, Reasoning, Open technical parameters, Freeze scenarios | identical |
| Old numbers to new | all 56 rows match the headings. The Agreements line (38 to 44 became 73 to 80) checks against Agreements draft 11's own table |

## Questions for Nobody, allegedly

None. Each point noticed was first checked against the working rule "core business, or the participants' choice". Each turns out to be either already decided (so not put) or a stale word to fix in the freeze-ready draft (carried, below). None is a flaw in a rule.

## Noticed in draft 11, carried unchanged

These are in draft 11 and are kept exactly as they were. They are listed for the freeze-ready draft.

1. **"Check that it is public."** Check 2 on every act requires the act to be public, yet types 6 to 8 may be private (F134, F152). The private-link paragraph decides it, and the code already accepts private acts of types 6 to 8 and refuses every other private Identity act (F134, built). The check's wording should name the exception. Not a question: the rule is decided (F134). *Area: core business, wording only.*
2. **Two receipts "that count".** Rule 44 (was 10b) says two receipts "that count" from one home are a conflict. The conflicting receipts procedure says two receipts "that pass receipt check 1", and while a conflict stands neither counts. Read literally, rule 44 makes the conflict depend on what the conflict undoes. The procedure, and F53's intent, give the reading: receipts that pass check 1. The freeze-ready draft could make rule 44 say so. *Area: core business, wording only.*
3. **"Freeze test suite v16"** in the freeze scenarios. The suite is at v21. The scenario numbers there were not checked against v21 in this pass. *Area: presentation of the spec, references.*
4. **Two lists of what may not rely on "re-homed without audit".** The finality section says "keepers, vault payments and agreements MUST NOT rely on it". The paragraph after rule 35 (F153) gives the longer list: "no keeper record, payment, discharge of a debt, agreement, fork or closing". Both are MUST NOT, and the second covers the first. The freeze-ready draft could state one list. *Area: core business, wording only.*
5. **"Envelopes. The signed container of an act."** This definition carries the rename (F212) onto the word for one act's container. Elsewhere "Envelopes" is the MIP. *Area: wording.*
6. **The hash tag `"MOR/safety"`** keeps the chain key's old name, "safety key". It is on the wire, so it stays until a freeze decides otherwise, as Money draft 7 noted for its own old tag.
7. **The header's "written against" list was out of date in draft 11.** Draft 11 had been revised in place for F134, F137, F152, F153, F159 and F168 without its list saying so. Draft 12's header names F1 to F266. No finding after F168 asks for an Identity change that is not written in: the findings log was searched for every "Core changes: Identity".
8. **Agreements and Money cite Identity by draft 11's numbers.** For example, Agreements draft 11 cites "Identity rules 15 to 17", "rule 6" and "rule 8b", and Money draft 7 cites "rule 16", "rule 7" and "rule 22a". Those stay until the freeze-ready drafts. In draft 12 they are rules 33 to 35, 27, 31, 34, 28 and 4. Agreements' "rule 6" is cited in a sentence on "Identity alone"; it maps to rule 27, a valid rotation.

## Tests

**Main, before writing anything** (commit `ea7cd5d`, `scripts/test-all.sh`, without `--reproducible` and without regtest): **all tests passed.**

- Rust workspace: 634 passed, 0 failed, 1 ignored (the Lightning regtest, skipped unless `MOR_LN_REGTEST` is set).
- TypeScript: 248 passed, 0 failed, in 14 packages: barebone 9, collective 41, connector 12, desk 12, genesis 17, longform 26, manage 7, poster 7, reader 16, repo 18, site 57, carry 6, jpeg 14, video 6.

*How it ran:* this container had no `wasm-bindgen`, which the script needs after the Rust half. I installed the version the script names (`cargo install wasm-bindgen-cli --version 0.2.129 --locked`), outside the repository. The site's browser test used the container's Chromium (`MOR_CHROMIUM`). The run used a separate checkout of main, so the working tree was untouched during the run. The draft was written in a scratch folder.

**The branch, after the text commit** (`918973d`, same options): **all tests passed**, with the same counts as on main: Rust 634 passed, 0 failed, 1 ignored; TypeScript 248 passed, 0 failed. No code or test changed, so the code's tests pass unchanged: the check that no rule moved. The run used a separate checkout of the commit; the working tree was untouched during it.
