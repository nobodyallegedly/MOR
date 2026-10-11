# The rename, carried into the remaining documents (11 October 2026)

*Wording only: no rule changed, nothing on the wire changed, no code changed. It answers question 4 of the rename pass (`docs/rename-pass.md`, section 3, "Not in this pass's list"): the layer names of F212 (Identity, Text, Envelopes, Money, Agreements, Development) and the key names of "The two keys renamed" (the chain key, the signing key; "everyday act" stays) are brought into four documents the pass left. Each is published as a new version beside the old one, which is kept as it was. The rename pass's rules are followed as written: ordinary English and quotations keep their wording; records (findings, reviews, build reports, the roadmap) are not touched; "announcement" stays where a text uses it.*

**In plain words.** Four documents still used the old names: the one page, the paper, the run guide and the project-lead prompt. Each now has a new version that uses the new names, with a line at its head saying so; the old versions stay as they were. Where a sentence only needed a name swapped, it was swapped. Where swapping a name would have meant changing what the sentence says, or where the sentence is a dated record inside the document, it was left, and it is listed below. No sentence needed a rule changed to read right.

## 1. `docs/07-MOR-in-one-page-v11.md` (from version 10)

**Changed:**
- A new head line for version 11; version 10's head line follows it, and the older histories below it, unchanged.
- The list of rulebooks: "(Envelope, Text) … (Finance) … (Law) … (Production)" became "(Envelopes, Text) … (Money) … (Agreements) … (Development)".
- The note from the author: "Working through Law, the layer of agreements, collectives, forks and debts" became "Working through Agreements, the layer of agreements, collectives, forks and debts".

**Left, and why:**
- In the author's note, "it needs eyes other than mine" stays singular: "it" refers to "the layer", not to the name Agreements, so the plural rule of the rename pass does not apply. The phrase now reads "Agreements, the layer of agreements"; it is accurate (the core's table says the same), but if the repetition reads badly to Nobody, allegedly, rewording it is a choice of style, not a substitution, so it is left for them.
- Version 9's history keeps "Law rule 17, field 24": the histories describe earlier versions in the names of their day, as records do.
- No sentence names a key by its old name. The page speaks of "a key kept offline" and "a second key kept offline"; bringing in "chain key" there would add a name, not replace one, so nothing was added.

## 2. `docs/paper/mor-paper-draft-3.md` (from draft 2)

**Changed:**
- A new head line for draft 3, saying that no claim, figure or test result changed and that every figure stays as of 5 October 2026; draft 2's line follows it.
- The abstract: the layer list "(Identity; Envelopes and Text; Money; Agreements; Development)", and "invariant testing of Agreements".
- Section 2: "Agreements were then stress-tested by invariant hunting" (plural, as in the rename pass).
- Section 3.2: the layers table now reads as the core's does (Ground, Identity; Communication, Envelopes and Text; Money; Agreements; Development), and "Every client implements Identity, Envelopes and Text".
- Section 4.1: the note "The draft specifications still call the chain key the 'safety key' … the rename is decided and not yet applied" was no longer true. It now says that until the rename of 10 October 2026 the specifications used the old names, and that older records keep them, so a reader following the paper's references into the records can still place them.
- Section 4.2: "(by an Identity, Money or Agreements act)". Section 5.1: "Money defines how a payment moves".
- Section 6.2: "*Run for Agreements*", "(Money rule 15, …)", "in Agreements' count of what pays a debt", and every "Law invariants" became "Agreements invariants" (the test is now `agreements_invariants`). Two test paths renamed by the pass: `core/tests/finance.rs` → `core/tests/money.rs`, `core/tests/law_collective.rs` → `core/tests/agreements_collective.rs`.
- Section 6.3: "(Envelopes, 'Sealed containers')".
- Section 7: "writing Agreements' promises as invariants", "the Agreements gaps on grants", "parts of Money, Agreements and Development".
- Section 9: "Formal verification of Agreements", and in open problem 8, "everyday keys are not" became "signing keys are not".

**Left, and why:**
- "Everyday acts" (abstract, sections 4.1, 4.2, 6.1, 8): Identity's term for the acts the signing key signs, which stays (rename pass, section 3, and its question 2).
- "Not safety for the counterparty" (claim 9), "a question for law and economics" (open problem 6), the reference title *Financial Cryptography*, and the title "Media, Money and Agreements over Relays": ordinary English.
- `docs/law-invariants.md`: a record, whose file name the rename pass did not move.
- `core/tests/finance_f133.rs` and the test name `a_debt_resigned_to_the_thiefs_pointer_its_agreement_never_cited_does_not_count` (claim 7): neither exists today, but not because of the rename (the file was gone before the rename pass, and no `money_f133.rs` replaced it). Bringing claim 7's citations up to the current tests is a revision of the claim's evidence, not a substitution of names, so it is left. **To note:** the paper's test citations, and its figures (132 findings, 330 Rust tests, the audit's counts), are as of 5 October 2026; draft 3 does not update them, and its head line says so.

## 3. `docs/run-guide-draft-2.md` (from draft 1)

**Changed:**
- A new head line for draft 2, before draft 1's.
- Section 2: "the identity's everyday signing key" → "the identity's signing key"; "The safety key stays in `operator.json`" → "The chain key stays in `operator.json`"; the stated cost, "the everyday signing key sits on the server" → "the signing key sits on the server".

**Left:** nothing else names a layer or a key. The file `operator.json` still holds its chain key under the field `safety` (rename pass, section 3: kept because files on disk carry it); the guide does not name the field, so nothing in it changes.

**Also changed:** the display client's test that checks the Run guide is canonical, private-detail-free long-form text (`clients/site/test/site.test.ts`) now reads draft 2, the version to be published. Draft 2 adds no character draft 1 did not already use and is NFC, and the test's other checks (no 64-hex id, no deployed address) were run on it by hand and pass. The test itself was not run here: it needs the WebAssembly build, which is not in this container; CI runs it.

## 4. `docs/project-lead-prompt-v3.md` (from version 2)

**Changed:**
- The title says version 3, and a new head line says what changed; version 2's note follows it.
- Section 5: "A rollback voids only what Agreements read as broken."
- Section 9: "the relay's delivery record in Agreements rules 19 and 22", "Agreements draft 10" (twice).
- Section 11: the MIPs row now reads "Identity 11, Envelopes 7, Text 6, Money 6, Agreements 10, Development 6" (the draft numbers did not change), and the one page row names version 11, published in this same pass.

**Left, and why:**
- Section 10, "the rename of safety and everyday keys (F132)", listed under "Later": it names the old keys as the thing being renamed, so the old names are the right words there. It is out of date (the rename was applied on 10 October), but changing it is a change of status, not of names. Sections 9 and 10 as a whole are a snapshot of 9 October, and the head line says so; bringing them up to date is a fresh "where things stand", for the project lead to write.
- The pronouns the prompt uses for Nobody, allegedly, are left as written: this pass changes names only.

## 5. Links updated

Living documents that pointed at the four replaced versions now point at the new ones: the root `README.md` (the paper and the one page), `docs/README.md` (the run guide and the paper) and `docs/companions/README.md` (the one page). `docs/roadmap-v1.md` and the reviews keep their links, as records. Not changed, because they did not point at a replaced version: `docs/README.md`'s "Start here" names the one page version 6 (the last approved one) and its list names `project-lead-prompt.md` (version 1); whether those should name the latest versions is a question for Nobody, allegedly.

## 6. Rules that would need changing to read right

None. Every sentence that needed a new name read correctly with only the name changed.

## 7. Questions for Nobody, allegedly

1. The one page's note from the author now reads "Working through Agreements, the layer of agreements, collectives, forks and debts". Keep it, or reword it (a style choice, yours to make)?
2. `docs/README.md` points "Start here" at the one page version 6, and lists the project-lead prompt version 1. Point them at the latest versions (11 and 3), or keep them as they are?
