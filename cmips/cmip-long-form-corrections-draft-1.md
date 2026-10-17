# cMIP: Long-form corrections

*Draft 1, 17 October 2026, written by the Edubba agents session (`docs/edubba-agents-report.md`) for F348, for Nobody, allegedly, to approve. **F348**, decided by Nobody, allegedly ("Agreed"): "the long-form correction is its own small cMIP, 'long-form corrections', which the corrections cMIP names; every value of a text's format field stays the hash of a specification anyone can fetch." It serves **F347**, question 1 ("a correction in long form, whose text is long-form"): a MIP draft in Ummia, or any long-form document, corrected as a document.*

*Founding cMIP, EXPERIMENTAL. Not approved, not a product; test identities only until MOR is frozen.* Written against the Text MIR draft 10 (field 1, the format; rule 4; the Text format task), the corrections cMIP draft 2 (`cmip-corrections-draft-2.md`) and the long-form text format cMIP draft 1 (`cmip-long-form-draft-1.md`). It fills task 4 of the Text MIR (a text format). Its hash stays a draft hash until its creator is named at step 17; until then it is named by a test value, `sha256("Long-form corrections cMIP, draft 1, test value until publication")`. Its code: `clients/barebone/src/corrections.ts` (`LONG_FORM_CORRECTION`).

*Reading this document: normal text is the specification. Italic text is commentary.*

## In plain words

*A long document is corrected as a long document: the correction keeps its headings, emphasis, lists and links. This cMIP is only a name for that format, so that a text's format is always a specification anyone can fetch. What makes the text a correction is said by the corrections cMIP; how it reads is said by the long-form text format.*

## 1. The format

1.1. A text act (Text MIR, type 0) whose format (field 1) is this cMIP's hash is a **long-form correction**.

1.2. **How it reads.** Its text is read and rendered exactly as the long-form text format cMIP draft 1 reads and renders a document: its blocks and inline content, its markup declaration (the characters it may hide and where), its rules 12 to 15, under the Text MIR's floor. This cMIP declares no markup of its own: a rendering hides exactly what that cMIP's markup declaration declares, in the positions it declares. *Two names, one reading: a client that renders long-form documents renders these the same way.*

1.3. **What it means.** It is a correction under the corrections cMIP draft 2 (rules 1.2 to 1.5, section 2): it corrects the act it names first in `refs` where that act is its own signer's, and is labelled **Correction** wherever shown. Where it names first no act of its own signer, it is an ordinary long-form text naming that act.

1.4. **When it is used.** A client correcting a long-form act (one in the long-form text format, or itself a long-form correction) SHOULD use this format (the corrections cMIP, 1.1b).

## 2. Costs, stated

- A client that knows the long-form text format but not this cMIP shows a long-form correction plain, markup and all (Text MIR, rule 4).
- A client that knows this cMIP but not the corrections cMIP renders it as long form, with no label.
- One more specification to publish and approve, for one case.
