# The report: a block for all of MOR (proposal 1)

*The MOR lead, 13 November 2026. A proposal for the shared language, from the exchange "The report, after the click test" in `docs/decisions.md` (branch `claude/lead-records-2`). Not a decision. Not yet written into any spec text.*

**The wish** (Nobody, allegedly): "can I with a single click reward all the people that contributed to the service or good via MOR". And: "Building blocks over solutions."

## In plain words

Some work handed to a cMIP is worth hearing back from: a service that passed money on, a payee that received it. Most is not. So any task may **call for a report**, or not. Where it does, the call says **from whom** (the one who did the work, the one it was done to, or both) and **where** each report is expected. Only those who signed the act that holds the task can make that call; it binds nobody else.

A report is a signed act that answers a call. It carries three things, whatever the task: **the call it answers, the acts it relied on, and who signs it.** Everything else (amounts, what was kept, what is still owed) is the task's to define.

Each side signs only its own half. Where both are called for, an act both halves name (a settlement, for a payment) ties them together: matching halves are a knot; halves that do not match are shown side by side; a half with no answer is shown as one side only. With each agreement saying where its reports are expected, the trail can be walked both ways: down from a payer, up from a contributor.

Nothing makes anyone report. A call no one answers is visible as unanswered; a task with no call is visibly silent. That is what a payer reads before paying.

## Precisely (first wording)

- **R1. Call.** An act that names a task MAY attach a call to it. A call states: the task it is attached to; from whom a report is expected (the doer, the receiver, or both, as the task defines those roles); where each report is expected. A call binds only the signers of the act that holds it.
- **R2. Report.** A report is a signed act carrying: the call it answers, by fingerprint; the acts it relied on, by fingerprint; its signer. A task MAY define further content. A report that names no call is no report.
- **R3. Halves.** Where a call expects reports from both sides, a verifier MUST show, for each act both reports name: **matched**, **mismatched** (both shown, neither chosen), or **one side only**. What "match" means beyond naming the same act is the task's.
- **R4. Silence.** A verifier MUST show a call with no report as **unanswered**, and a task with no call as **no report called for**. Neither is read as anything else (not "kept", not "failed").

**Lie exposed.** "It all went through", said by one side alone; "we passed it on", said where nobody on the other side can contradict it; and "you never asked", said by a leg whose signers did.

**Protects.** Those further along a sequence and the payer, who did not sign the legs before them: they can read, before and after paying, which legs called for reports and which answered. And every signer, whom no one outside their act can oblige to report.

## What it changes

- **Agreements draft 10, rule 11** shrinks to its use of the block: the Control task (K8) may carry a call; a leg report is a report answering it. The test's three flaws are answered: the link is the shared act (3b), the pointer is where the call says (3a), and amounts are Control's content (3c). Kept versus still owed (3d) is Control's content too.
- **Where it sits.** In the shared conventions, above every layer, so that Identity, Money and the rest use the same block.

## Checked against the core in force

The current MICS (v37) has its own receipts and acknowledgements: a home's receipt (Identity), a receiver's settlement receipt and a payer's claim, "double entry" (Money), an acknowledgement "I received this act" (Envelopes). This proposal does not translate them. It is noted so that, when the lower layers are written again from the new Agreements, each decides whether its receipt becomes a report under this block. Until then there is no conflict, since the block is not in the MICS.

## Open

1. Is a call per task, or per act holding several tasks?
2. How "where" is written without a server address (the Deliver layer's, and the security rules).
3. Whether a report can answer several calls at once (one batch, many payments; pools, P6).
4. Whether "unanswered" ever ends, or stays unanswered for good.
5. Names: "call", "report", "matched", "one side only", "unanswered" are the MOR lead's, as technical wording.
