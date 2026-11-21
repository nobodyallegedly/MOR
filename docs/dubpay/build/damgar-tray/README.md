# Damgar, the tray app (DubPay)

Damgar is the money hub DubPay ran in round two. This is its tray version, for a folder that holds the round's kit.

**0.2.3 fixes a fault found by the lurker on day three.** Before this version, Damgar never checked a payment report's key against its signer's chain, so a forged report showed as real.
- Now the core library's verifier judges every report against its signer's identity chain. The chain comes from the identity records held in `in/`, the acts in `acts/` and every act in the answers read.
- Only a report judged "valid" can confirm a payment or close a still-owed line.
- A report whose chain is not held is shown as UNCHECKED, with the command that fetches the chain.
- A report whose signature fails is NOT COUNTED, and its lines are not shown.

**Test:** `node damgar-flow.test.mjs KIT_DIR damgar.mjs`. It covers four cases, using test identities made in memory and sending nothing:
- a genuine receiver report confirms the share;
- a forged one confirms nothing;
- a report whose chain is not held confirms nothing;
- the payer's own unchecked report is marked as such.

All four fail on 0.2.2 and pass on 0.2.3.

**Limits:**
- Over a folder holding a few thousand answers, `flow` and `reports` take minutes. Use `--from LETTER` to read fewer.
- Not released as media. Nothing is merged or released without the word of Nobody, allegedly.

Test identities and regtest only.
