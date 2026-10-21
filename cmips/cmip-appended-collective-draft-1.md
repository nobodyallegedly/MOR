# cMIP: Appended collective

*Draft 1, 21 October 2026, written by the Dubsar Suite session that rebuilt Dub on the kit (`docs/kit-dub-report.md`), for **F374**, for Nobody, allegedly, to approve. **Decided by Nobody, allegedly** (the redesign, 20–21 October 2026, `docs/design/suite-redesign.md`, "Private mail and collectives"): "the person signs in their own name, and append their collective". **Accepted** (the lead's proposal, agreed): it binds nothing; the reader's app shows the label only if the membership checks. A Dubsar cMIP: the Suite lead's, not core.*

*Founding cMIP, EXPERIMENTAL. Not approved, not a product; test identities only until MOR is frozen.* Written against the Text MIR draft 10 (field 1, the format; rule 14, `refs`), the Envelopes MIR draft 10 (rule 20, references; rule 32, a format adds meaning, never hides the words) and the Agreements MIR draft 16 (a collective's agreement in force, its parties, departed holders). It fills no task: a text format. Its hash stays a draft hash until its creator is named at step 17; until then a message appending a collective names a test value, `sha256("Appended collective cMIP, draft 1, test value until publication")`. Its code: `clients/dub/src/appended.ts`, used by Dub.

*Reading this document: normal text is the specification. Italic text is commentary. Choices the decision did not fix are marked **(mechanic, this draft's)**.*

## In plain words

*A member of a collective often writes as "Max, of Collective Y". The collective did not sign it and is bound by nothing: Max wrote it, in Max's own name. This cMIP lets a message carry that "of Collective Y", and tells the reader's app when to show it: only where Max is, today, one of the collective's members by its agreement in force. An app that does not know this cMIP shows an ordinary message that names the collective's identity.*

## 1. A message appending a collective

1.1. A message **appending a collective** is a text act (Text MIR, type 0) whose format (field 1) is this cMIP's hash. Its text is plain text, the message as its signer wrote it.

1.2. **It names the collective first in `refs`**: the collective's identity, by its ID (the act id of its genesis). Any further references follow. *A genesis has no signer to name beside it (Envelopes rule 20 names an act's signer where it has one): the ID alone is the reference.* **(mechanic, this draft's)**

1.3. **Signed in one's own name.** Its signer is the member, never the collective; the collective signs nothing, is told nothing and is bound by nothing (decided: "the person signs in their own name").

1.4. **Private or public.** Draft 1 is written for private messages (Dub's Private, sealed to each recipient: Envelopes, the sealed container); a public text may carry it under the same rules. **(mechanic, this draft's)**

1.5. **With other formats.** One text act has one format: a message appending a collective is not a correction (the corrections cMIP) at once. **(mechanic, this draft's)**

## 2. How clients show it (client conformance)

2.1. **The membership check.** A reader's app shows the label "of" and the collective's name only where the message's signer is, now, a member of the collective: one of the parties of the collective's agreement in force (Agreements), read from the collective's own places (its homes and routes), and not a departed holder. *"Now" is when the reader reads it: a member who left later loses the label on messages written before. The check is the reader's, not a verdict.* **(mechanic, this draft's)**

2.2. **Where it does not check** (not a party, departed, the agreement not found or not readable), the label is not shown as the signer's; the app MAY say that a collective was appended and did not check, and why. *Nothing about the message itself changes: its standing is its signer's, as for any text.*

2.3. **Binds nothing.** No app shows a message appending a collective as the collective's act, nor counts it toward any area, threshold or decision of the collective.

2.4. A client that does not know this cMIP shows an ordinary text naming an act (the collective's genesis), as Envelopes rule 32 asks: nothing is hidden, only the label is missing.

## 3. Costs, stated

- A reader's app makes look-ups to check the membership (the collective's places, its agreement in force, its terms), once per member and collective for a while.
- The label says "a member when read", not "a member when written": a message written before a member left loses its label.
- The collective's ID is visible to every recipient of the message; for a public text, to everyone.
- A client not knowing this cMIP shows no label.
