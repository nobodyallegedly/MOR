# The report: a block for all of MOR (proposal 3)

*Written by Claude, 14 November 2026, for the MOR lead to take or change: it is his. Proposal 2 (`report-block-2.md`, the MOR lead, 13 November 2026) published again with only the changes that draft 20 of Agreements needs for it to be read as written: the four places the second C session found where the text and the block do not read alike (`QUESTIONS.md`, repository `MOR-CBOX`, branch `claude/agreements-c-2`, "Where the text and the block do not read alike", items 1 to 4), under the ledger's exchange "After box 2" ("the report block's seams with the text are closed in a third proposal", the MOR lead's arrived-at line, to check). Each change is marked [3]. `report-block-2.md` is not changed. Not a decision. Not yet written into any spec text.*

*Proposal 2's own heading note: the MOR lead, 13 November 2026. Proposal 1 (`report-block-1.md`) published again, after the exchanges "A person who receives for others", "Who signs the deal, and who can call", "The payer's seat", "The contest" and "Reports are data" in `docs/decisions.md` (branch `claude/lead-records-2`).*

**The wish** (Nobody, allegedly): "can I with a single click reward all the people that contributed to the service or good via MOR". And: "Building blocks over solutions."

## In plain words

A report is data, and in the words of Nobody, allegedly: "Data needs to move along paths that people agree, with signature." The one path the core gives is the **leg**: two sides, the one who carries out an obligation and the one it is carried out for, whether or not they signed anything together [3]. So a report moves **leg by leg only**, in every layer.

Any task may **call for a report**, or not. Where it does, the call says **from whom**: the side that carried out the obligation, the side that received, or both. It does not say where: the **where is implied by the leg**, since a report goes to the other side of its own leg, where that side receives. Only those who signed the act that holds the task can make the call. A task may also define a call as **made by default** by the act that holds it, so that nothing needs writing: a payment calls for the receiving side's confirmation that way [3].

A report carries three things, whatever the task: **the call it answers, the acts it relied on, and who signs it.** It answers one call. It names that call directly, or, where the call was made by default and has no bytes of its own, by naming the act that holds it (for a payment, its settlement) [3]. Everything else (amounts, a holder's own part, a fee kept, what is still owed) is the task's to define.

Each side signs its own half; an act both name (for a payment, the settlement) ties the halves. Where the act that holds the call is itself one side's signed word of the act both name, it is that side's half: a payment, signed by the buyer, is the buyer's half [3]. Matching halves are a knot; halves that do not match are shown side by side; a half with no answer is shown as one side only. A call nobody answered is shown as unanswered; a task with no call, as no report called for.

A receiver who holds for others then carries out the next obligation, within their own agreement, and the same exchange happens there: every leg is the same exchange. Seeing beyond one leg (a partner who wants the end of the waterfall, a request from further up) is another path, and moves only where the people whose data it carries agreed to it with their signature, built as a data cMIP. The core gives no call that names an outside reader.

## Precisely (second wording)

- **R1. Call.** An act that names a task MAY attach a call to it. A call states the task and from whom a report is expected (the side carrying out the obligation, the receiving side, or both, as the task defines those sides). A call binds only the signers of the act that holds it. A task MAY define a call as made by default by the act that holds it; that call is read as attached, with nothing written, and binds only that act's signers [3].
- **R2. Report.** A report is a signed act carrying: the call it answers; the acts it relied on, by fingerprint; its signer. It names the call it answers by fingerprint, or, for a call made by default (R1), by naming the act that holds it, or the act the task says stands for it (for a payment, its settlement) [3]. A report answers one call [3]. A task MAY define further content. A report that names no call is no report.
- **R3. One leg.** A report is addressed to the other side of its own leg, and to no one else, whether or not that side signed the act that holds the task [3]. A call cannot name any other reader.
- **R4. Halves.** Where a call expects reports from both sides, or where the act that holds the call is itself one side's signed word of the act both name (a payment) [3], a verifier shows, for each act both name: matched, mismatched (both shown, neither chosen), or one side only. Where a call expects one side only, and no such act holds it, each report is shown as stated, and no tie is answered [3].
- **R5. Silence.** A call with no report is shown as unanswered; a task with no call, as no report called for. A call made by default (R1) is a call [3]. Neither is read as anything else.

**Lie exposed.** "It went through", said by one side alone; "you never asked", said by a side whose signers did.

**Protects.** Both sides of every leg, who each hold the other's signed word. And everyone further along or further up, whose data moves nowhere they did not sign for.

## What changed from proposal 2 [3]

Each change answers one of the four places the second C session found, and closes it on the block's side; draft 20 of Agreements closes each on its own side (its section 8.1). Nothing else is changed. Each is the MOR lead's to take, change or refuse.

1. **A confirmation with no call written** (the C session's item 1; Agreements G11.7). A task may define a call made by default (R1, R5); a report may name such a call by naming the act that holds it, or the act the task says stands for it (R2). Without this, R2 read strictly makes a buyer's confirmation "no report".
2. **"two sides who both signed"** (item 2; Agreements G11.1). The plain words no longer say "who both signed"; R3 says a report goes to the other side whether or not it signed. In Agreements a receiving side may have signed nothing; the path to it is then not a signed one, and a cMIP closes it.
3. **Halves where the call expects one side** (item 3; Agreements G11.4(b), G11.7). R4 also compares halves where the act that holds the call is one side's signed word of the act both name (a payment is the buyer's half), and says that with one side expected and no such act, no tie is answered.
4. **One report, several calls** (item 4; the open point 3 below). R2 says a report answers one call, until open point 3 is answered.

## What changed from proposal 1

- The call no longer says where; the where is implied by the leg (R1, R3).
- Leg by leg only, in every layer; no call names an outside reader (R3). Paths beyond one leg are data cMIPs people signed for.
- The other content is unchanged.

## Open

1. Is a call per task, or per act holding several tasks?
2. How "where that side receives" is found without a server address (the Deliver layer's, and the security rules).
3. Whether a report can answer several calls at once (one batch, many payments; pools, P6). Until it is answered, a report answers one call (R2) [3].
4. Whether "unanswered" ever ends.
5. Names: "call", "report", "leg", "matched", "one side only", "unanswered" are the MOR lead's, as technical wording; "leg" is his word.
