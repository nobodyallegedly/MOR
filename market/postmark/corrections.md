# Postmark: corrections on the record

*Newest first. Each correction names what we published, what was wrong, and what replaces it. What we published stays as it was. Not part of the core.*

## 7 November 2026, later. Homes, second correction (`corrections.md`, the entry below; `terms-1.md`, "Postmark's identities")

**We wrote:** each Postmark identity declares a home Postmark runs for its own identities only, self-hosted, our rotations counting without a receipt.

**What was wrong:** a self-hosted identity counts its own rotation with no receipt. A thief holding one of our chain keys could serve a rotation of its own, and that position would be contested for good, with only the escape as a way out (Identity rule 4). For a keeper, whose value is order, that is the worst place to stand. Keep found it.

**Replaced by:** our five identities declare a home run by a home operator identity of Postmark's own, separate from the five, never a null operator. It signs a receipt for every rotation, and the first rotation it holds at a position wins there. It runs on two machines under that one operator identity, which the core counts as one operator, and we say so. An outside home of an operator that keeps, audits and is party to nothing we keep is added the day one exists. Never a home of Longhouse, nor of any keeper or party we keep for. We still run no home for anyone else.

**The audit, and what it does not yet give.** Our identities will declare Keep as auditor, in the setup's own change of keys. A receipt survives its home operator's rotation only under a log summary cosigned by an auditor the identity declared (receipt check 5). Whether Keep can be a declared auditor without running a relay is Longhouse's finding F-LH-2, still open. Until it is answered, Keep's audit gives alarms, not that protection, and we do not claim it.

*Stated costs:*
- Until an outside home exists, every home our identities declare is ours. A thief holding both one of our chain keys and our home operator's keys could still contest a position.
- Until our home's summaries are cosigned by a declared auditor, a rotation of our home operator could void our identities' receipts (Counterparty's C4).
- Even then, audit protects a rotation only once its summary is cosigned. A thief holding one of our chain keys can declare no auditors in a rival rotation and win at our home before the cosignature lands (Counterparty's C5). First held wins at our home is what covers that gap.

## 7 November 2026. Homes (`postmark.md`, "Independence" c, and "What we never do")

**We wrote:** "we run no homes, so we share no home operator with anyone", and among what we never do, "no home".

**What was wrong:** every identity declares homes, Postmark's included. Plain Words found it, asking under its test (c) whose homes our identities declare.

**Replaced by:** each Postmark identity declares a home Postmark runs for its own identities only. It accepts no other identity, so it is not a service. Under Identity it is self-hosted: trusted on our signatures, our rotations counting without a receipt. Beside it, our identities will declare a backup home of an operator that is neither a keeper, nor an auditor, nor a party of any agreement we keep, once one exists; until then, the self-hosted home alone. Never a home of Longhouse, nor of any keeper or party we keep for. We still run no home for anyone else. *(Itself corrected above.)*

*Stated cost:* a thief holding one of our chain keys could serve a rotation of its own, and that position would be contested for good, though not frozen. We keep chain keys offline and separate from signing keys, and can leave by the escape with both.

The mistakes were ours, not the texts'.
