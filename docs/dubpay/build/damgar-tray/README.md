# Damgar, the tray app (DubPay)

Damgar is the money hub DubPay ran in round two. This is its tray version, for a folder that holds the round's kit.

## 0.2.3: the fault

The lurker found it on day three: Damgar never checked a payment report's key against its signer's chain, so a forged report showed as real. Since 0.2.3, the core library's verifier judges every report against its signer's identity chain, from what the folder holds:
- the identity records in `in/`;
- the acts in `acts/`;
- every act in the answers read.

## 0.2.4: corrections after an independent review

The review is W3-F, on branch `claude/dubpay-check-w3f`.
- The verdict is the core's *binding* status, the one it gives for payments and the discharge of debts.
- Only a report valid as held here confirms a payment or closes a still-owed line.
- "Valid" is said to be **valid as held here**: a key change you have not fetched would not show.
- A report by anyone other than the receiver a line names is never shown as that receiver's receipt, and its lines are not shown there.
- A receiver's report that is held but does not count yet is said to be held, not missing.
- A closing report that does not count yet gives "STILL OWED as far as checked", not "NOT PAID".
- A forged or void report's lines are hidden in `flow` and in `reports`.
- Labels are given for "disputed", "not counting" and "scoped".
- Damgar still runs, counting nothing, when the kit has no `lib/kit.mjs`.

## Test

`node damgar-flow.test.mjs KIT_DIR damgar.mjs`. It covers twelve cases, using test identities made in memory and sending nothing; its temporary folders are removed at the end.
- On 0.2.2, the first four fail.
- On 0.2.3, six fail.
- On 0.2.4, all pass.

Two mutations show that the tests guard the two paths the review found unguarded:
- removing the check from the closing path fails two cases;
- showing forged lines again fails one.

## Known limits (findings for the leads, not fixed here)

- **A stolen old key.** A report signed with an identity's old key still shows as valid, and confirms, until the reader holds that identity's key change with its homes' receipts. Damgar fetches nothing by itself. It says "as held here" and tells you how to fetch the signer's record.
- **Claiming someone else's payment.** A receiver's report names only an amount and a settlement. So anyone can sign a report of their own saying "passed on" that payment, and the receiver's report then confirms it. The confirmation proves the receiver was paid; it does not prove who paid. Whether the report format should bind the payer is a question of the rules.
- **Whether a disputed report should ever confirm.** Damgar refuses it: the cautious reading.
- **`check ACT`** (before `pay`) still names the signer without the verifier. This is the same class of fault on another path, and was not part of this fix.
- **Speed.** Over a folder holding a few thousand answers, `flow` and `reports` take minutes. Use `--from LETTER` to read fewer.

Not released as media. Nothing is merged or released without the word of Nobody, allegedly. Test identities and regtest only.
