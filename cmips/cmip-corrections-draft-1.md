# cMIP: Corrections

*Draft 1, 17 October 2026, written by the Edubba agents session (`docs/edubba-agents-report.md`) for F344, for Nobody, allegedly, to approve. **F344**, decided by Nobody, allegedly ("Agreed"): "a corrections cMIP, draft 1. A correction is a plain text act whose format (Text field 1) is that cMIP's hash, naming the corrected act first in `refs`, signed by the same signer (or by the collective, for a collective's act); clients label it 'Correction' and show 'corrected by' on the original, which stays signed. A client not knowing the cMIP sees an ordinary post naming the old act." Asked by Nobody, allegedly, before deciding: "The core already creates the connection, it simply does not label it, right?" It serves film 1 ("Corrections can be achieved via Ummia or Edubba and labeled as such", decided by Nobody, allegedly, 17 October 2026).*

*Founding cMIP, EXPERIMENTAL. Not approved, not a product; test identities only until MOR is frozen.* Written against the Text MIR draft 10 (field 1, the format; rule 32 of Envelopes draft 10, "a text's format": a format adds meaning, never hides the words) and the Envelopes MIR draft 10 (rule 20, references). It fills no task: a text format. Its hash stays a draft hash until its creator is named at step 17; until then corrections name a test value, `sha256("Corrections cMIP, draft 1, test value until publication")`. Its code: `clients/barebone/src/corrections.ts`, used by Edubba, Dub, the site's feed and the connector.

*Reading this document: normal text is the specification. Italic text is commentary. Choices F344 did not fix are marked **(mechanic, this draft's)**.*

## In plain words

*Nothing on MOR is changed once signed. To correct what you said, you say it again, rightly, in a new act that names the old one. The core already lets a new act name an old one (a reference); what it does not say is what the naming means. This cMIP says it: a text written in the "correction" format, naming an act of its own signer first, corrects that act. Apps that know it show "Correction" on the new act and "corrected by" on the old; apps that do not show an ordinary post that points at the old one. Both stay signed and readable.*

## 1. A correction

1.1. A **correction** is a text act (Text MIR, type 0) whose format (field 1) is this cMIP's hash. Its text is the corrected words, or what the correction says, as its signer wrote it.

1.2. **It names the act it corrects first in `refs`**, with that act's signer beside it where the act is public (Envelopes rule 20, F272). Any further references follow.

1.3. **Same signer.** A correction counts as one only where its signer is the signer of the act it names first. *A collective corrects its own acts: its signer is the collective, as the corrected act's.* A text in this format naming someone else's act first is no correction: a client shows it as an ordinary text naming that act, never "corrected by" on the other's act. *Correcting someone else's words is a reply, not a correction.*

1.4. **What may be corrected:** any act of the same signer a client can name: a post, a document, a message (privately, a correction sealed to the same recipients), a publication. *Edubba's first build corrects posts.* **(mechanic, this draft's)**

1.5. **Several corrections** of one act are each shown; the latest a client holds, by the signer's own order (its sequence), is the one shown first. A correction may itself be corrected. **(mechanic, this draft's)**

## 2. How clients show it (client conformance)

2.1. A correction is labelled **Correction** wherever it is shown, with a link to the act it corrects.

2.2. The corrected act is shown **as signed**, unchanged, with **corrected by** and a link to each correction the client holds. Never hidden, never replaced in place. *The original stays signed: what was said, was said.*

2.3. A client that does not know this cMIP shows a correction as an ordinary text naming the act (Envelopes rule 32: a format never hides the words). *Nothing is lost; only the label.*

2.4. **Finding corrections.** A client finds a correction where it finds the signer's other acts (its feed, its outbox). *Relays do not sort by what an act names (Envelopes rule 20); a correction published elsewhere than the original may be missed, as replies are.*

## 3. Costs, stated

- A correction is one more act; the corrected act remains, readable, forever.
- A client that does not know this cMIP shows no label.
- A correction not found by a reader leaves the original shown uncorrected: silence proves nothing.
