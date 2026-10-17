# Damgar: report

*17 October 2026 (F338, F340). Round 1 of Damgar. A GitHub session: test identities only; regtest only; no real money; nothing touched the servers (homes and relays ran on local ports, the regtest network in the session's own folder). Branch `claude/damgar`, one pull request, not merged.*

## In plain words

Damgar is built: a money app that **holds no wallet**. Like Dub and Kišib, it is a program on the Mac and Linux with its page, and the same page as a web client for testing only (a banner stating the risks on every screen). It has Dub's look, tinted gold by Kišib's rule, and its own icon: a clay tablet with a resting duck carved into it.

What it does:

- **First use.** Bring an identity you have, by its ID and its signing key's words (Damgar never makes one). Then choose what you accept: each payment specification and Module, with its version and what it does. A money act under anything you did not accept is shown **unknown** and is never signed. The choice is sealed to your identity at its homes, so every app holding the identity reads the same list (F340).
- **To sign.** What Dub and Edubba prepared (a tip; a request to be paid; a payment from an identity; the payment for anchoring a collective's act), each a draft sealed to your own identity; requests to be paid that others sent; invoices to make; receipts to sign. Each is read in plain words, with its rail, then signed or declined.
- **Pay.** The invoice, or an on-chain address bound to that one payment. You pay in your own wallet and paste the proof back; Damgar checks it and signs your claim.
- **The account.** In, out, pending, owed: each payment with its claim and receipt, and whether each verifies. Totals per unit, never added across units.
- **Settings.** Where you are paid (your node, your Bitcoin key: the payee pointer, each rail's costs read back first); what you accept; the vault (shown; set in Kišib); homes and relays.

And beside it:

- **Dub** prepares a tip on a post, and a request to be paid. **Edubba** prepares a payment, and the anchoring of a collective's act on Bitcoin (never a release). Neither signs money.
- **Kišib** sets the vault, in a change of keys.
- **A test wallet**: a plain page over the regtest nodes, labelled as a test, standing in for your own wallet. No wallet connect.
- **A test anchoring service** on regtest, selling anchors through MOR acts only.
- **Regtest on the Mac**: `docs/damgar-regtest.md`, a short guide.

Every check is the core library's: the payment's commitment, the rail's proof, the route and the vault, the anchoring ticket. Damgar asks; the core answers.

## The questions asked, and their answers

1. **What a payer signs, and when.** Answered by Nobody, allegedly: before paying, an obligation ("I owe you this amount", Money type 1), signed by the one who owes, only when the payer accepts a debt to settle later; a request to be paid is not a debt by itself. After paying, a payment claim, by the payer; the payee signs the receipt. So a request in To sign offers: **Accept as a debt (sign an obligation)**, only if one means to owe it; **Pay it**, in one's wallet; then **Check it and sign my claim** with the proof. Most tips skip the first step. Built so.
2. **Payments to a collective.** Answered: "a round 2 matter; focus on simple identities for now." Splits and collective payments are not built; Damgar shows the split cMIP as not used in round 1.
3. **The vault.** Answered: "It can be shown, but its setting belongs in Kišib and should be added if not there already." Kišib's change of keys now keeps, declares anew or removes the vault (Money rules 2 and 3); Damgar shows it.
4. **The on-chain request key.** Answered (option A, on the project lead's lean): Damgar makes and keeps the request key beside the signing key, and answers address requests by itself as they arrive through MOR; the Bitcoin key stays in the wallet. The cost is said on the screen where the key is made (it moves no money; a thief holding it could commit this side to payments not intended, the money still reaching the person's Bitcoin key), and how to replace it, in plain words: a new payee pointer naming a new request key, after which the old one no longer counts. Built so (`REQUEST_KEY_SAY`).
5. **How drafts, requests and invoice requests travel between apps and people.** Answered: option A, "a small experimental cMIP draft for the money messages (requests to be paid, and money acts prepared in one app for another, sealed to oneself), marked experimental like the nudge cMIP, its costs stated", kept minimal: "what each message carries, who signs it, and what a reader does with one it cannot read (shown as unknown, never guessed)". Written so: the money messages cMIP, draft 1 (`cmips/cmip-money-messages-draft-1.md`), four private acts, each sealed to its one reader (a draft, a request to be paid, an invoice request, an answer), a table of who signs each, and section 6: a message a reader cannot read (a type it does not define, a payload not as written, a key it does not define) is shown unknown in To sign, nothing taken from it, nothing signed for it, and may be set aside, which signs and sends nothing. Damgar does this, and its tests send it both kinds. Its text is for Nobody, allegedly, to approve.
6. **Units** (from the project lead, after the author's question): as pluggable as rails. Every amount names its units Module and is shown with it; accepting a units Module is part of what one accepts; amounts in different units are never summed or compared in the account except through a conversion act, otherwise side by side. Round 1 has only the Bitcoin units Module; nothing assumes satoshis. Built so (`clients/damgar/src/units.ts`); what a second Module needs is below.
7. **The accepted cMIPs and Modules** (F340, on main): one list, a private act sealed to the person's own identity at its homes, read by any app holding the identity, each applying the part it understands; any app may change its part, writing on the latest version it read and checking again before sending, a fork shown and merged, never dropped; private by default, publishing it the other option (F59). Written as the accepted cMIP, draft 1 (`cmips/cmip-accepted-draft-1.md`); its format below.
8. **Anchoring kept simple in Damgar** (from the project lead, decided by Nobody, allegedly, 17 October): its only purpose in round 1 is that the interface shows anchoring exists. One anchoring request from Edubba appears in To sign, is paid on regtest against the existing pooled service, and its ticket is shown. Nothing more is built for the pool: no tier picker beyond what the offer states (Edubba lists the offer's own tiers, nothing else), no refund or default handling in the interface. The pool stays as built and tested (step 14a, F225, F226, F228). Checked: that is what is built; nothing was added.
9. **Payments folded once paid and confirmed**, with the option to expand them to see the record. In the account, a payment that is settled, its claim and receipt each valid by the rail's evidence and counting, is one line ("To … · Lightning · 1 500 regtest satoshis · paid and confirmed"); opening it shows the whole record. Anything else stays open.
10. **The icon**: "a bit less rubber duck, longer neck, but folded in rest position". Redrawn as the Mesopotamian duck weights show it: a duck at rest, its long neck turned back, its head laid on its back, its bill toward its tail, one carving in one colour, clay left inside the fold; no eye.

## Open question for Nobody, allegedly

1. **The anchoring publication does not say which key its batch's output is tweaked from.** The anchoring cMIP draft 5 publishes, for each batch, `{ 0 offer, 1 batch, 2 leaves, 3 tx, 4 output }`. With pay-to-contract, the output's address is a key tweaked by the batch's root: to check that the output commits to the root, a reader needs that key (and the script tree, if any). The publication does not carry it, so no reader can check an anchor from the acts alone.
   - **(A) the build's lean, built:** two more fields in the publication: `5` the x-only key the output is tweaked from, `6` the script tree's root where there is one. Small, and the check stays with the acts.
   - (B) the key in the offer's terms, once for every batch: fewer bytes, but every batch then shares one key on the chain, which links them more tightly.
   - (C) out of band: the check then needs something outside MOR.

   Until answered, the test service and Edubba use (A), as test values; a draft 6 of the anchoring cMIP is not written. *Since then, decided: anchoring in Damgar stays simple and nothing more is built for the pool (answer 8). This question does not block round 1; it stays for the anchoring cMIP's next draft.*

## What was built, precisely

| Where | What |
| --- | --- |
| `wasm/src/money_js.rs` | The Money layer for the clients, through WebAssembly: payloads and readers; the vault; the payment cMIP's commitment, proof and rail check; the Lightning rail (address, invoice read, proof); the on-chain rail (address, pay-to-contract, the request signed with BIP 340, proof, Merkle branch); anchoring (offer, ticket and its check, publication, leaf, batch, the batch anchor and its check); the verifier's judgment of a money act (`moneyJudge`), the pointer, the vault, the route (`moneyChoose`). A Money-only view: holding and payment counts unknown (M5). |
| `clients/damgar/` | Damgar: its code, program and page, web client and release (`built/`), the Mac app and Linux entry, the icon, its tests. The README says each file. |
| `clients/testwallet/` | The test wallet. |
| `clients/anchoring-service/` | The test anchoring service. |
| `clients/dub/` | Tip and ask to be paid, as drafts sealed to oneself (`moneyDraft`). |
| `clients/desk/` | Edubba: pay someone; anchor a collective's act (never a release), its offer read, its anchor checked against the chain (`src/money.ts`). |
| `clients/kishib/` | The vault in a change of keys (`vaultPlan`). |
| `cmips/cmip-money-messages-draft-1.md`, `cmips/cmip-accepted-draft-1.md` | The two cMIPs written for this round. |
| `modules/lightning/regtest/up.sh` | Writes `nodes.json` (each node's name, REST port and folder) for the programs using the network. |
| `docs/damgar-regtest.md` | Regtest on the Mac. |
| `.github/workflows/test.yml`, `release-damgar-web.yml` | Damgar, the test wallet and the service in the run; a job on a real regtest network (btcd and lnd, checked against their manifests' fingerprints); the web client's release, as Kišib's (`[release damgar web]`). |

## The accepted list's format (F340: "say in your report the format you gave it")

The accepted cMIP, draft 1. **Private** (the default): a private act of type 1, signed with the signing key, addressed to the identity itself, sealed to its own encryption key and left at every home of the identity (as the people cMIP's sealed follow list):

```cddl
accepted-list-payload = {
  0 => uint,                 ; version: 1, then the highest version it follows plus one
  ? 1 => hash,               ; the act it follows (absent only for version 1)
  2 => [* accepted],         ; the specifications accepted, each once, in ascending order of hash
  ? 3 => [+ hash]            ; the other acts it merges: the other branches of a fork
}
accepted = [hash, ? tstr]    ; a spec hash, and a label (its name and draft, at most 120 characters)
```

The versions form a tree from version 1. Its tips are the acts no other act follows or merges: one tip counts; several are a fork, shown with each tip's difference from their last common act and merged against it (an entry any branch added is in, one any branch removed is out, the rest the base's), never dropped. A writer reads the tips, merges, applies its own part only, **reads the tips again just before sending**, and writes the next version. **Published** (by choice): a public act of type 0 at the identity's outbox relays, the same payload with `? 4 => true` for withdrawn. Nothing accepted is the default: a client never signs under a specification the person did not choose. Each app applies the part it understands and keeps every other entry unchanged.

## What a second units Module and its rail would need (round 2)

1. **Its specification**: a units Module naming each of its units by its own hash, each with its name and how a whole number of it is read (as the Bitcoin units Module draft 1 does, one unit per network so that a test payment never pays a real debt).
2. **A rail that carries it**: a rail Module whose amounts name that unit, with its own proof (no Bitcoin rail can carry a unit that is not Bitcoin's; the Lightning and on-chain rail Modules name Bitcoin's units by network). Without a rail, an amount in it can be owed and shown but never paid.
3. **The core**: the vault's limit and the route are per unit already (Money rules 2 and 3); the core needs the new units Module's code to judge a vault naming it, and the new rail Module's code to check its proofs.
4. **Damgar**: one more entry in `UNITS_MODULES` (`src/units.ts`) and in what can be accepted (`src/specs.ts`); amounts already name their unit, totals are already per unit, and an amount in a unit not known or not accepted is already said as "of unit … (not accepted here)", never as satoshis.
5. **To read two units together**: a conversion act under the conversion cMIP (draft 3), whose offer names the rate; Damgar would show the conversion with its rate, and still never add the two.

## Found while building (writing code is also a review)

1. **A payer's "receipt" does not exist** (Money rule 7): the payer signs a claim, the payee the receipt. The brief's "the receipt verified by the payee's Damgar" is built as: the payee's Damgar verifies the payer's claim, then signs the receipt, which the payer's Damgar verifies.
2. **Damgar's line, for Kišib** (Identity rule 35). Most of Damgar's acts are sealed, so Kišib cannot read Damgar's line from the homes and refused to change the keys. Damgar's identity window now shows its line's card (latest act, position, summary) to give Kišib; Kišib's change of keys then keeps the line (tested).
3. **A renewed encryption key.** After a change of keys, Dub renews the encryption key; Damgar, holding the old one, could not open what was sealed to the new. Damgar now takes the key the new words carry ("Use the new words") and says how many sealed acts it could not open.
4. **A message it cannot read** was only a passing problem line; it is now kept and shown unknown in To sign (the messages cMIP, section 6), to be set aside.
5. **The ticket's deadline needs a chain.** The web client follows no chain, so it cannot check that an anchor's deadline is within its tier's reach: said on the payment's screen, "Not checked here".
6. **Two bugs found by the tests on real nodes**: Damgar asked btcd for a block with a verbosity of `true` where btcd wants a number (fixed); the anchoring service read `nodes.json` as a list (fixed). And one in the page: a form with a field named `id` answers `form.id` with that field, so the program's page could not bring an identity (fixed: the form's own attribute is read).

## Readings (to confirm), and costs

- **The payee's Damgar answers an on-chain address request by itself**; a Lightning invoice it cannot make (it holds no node): the payee makes it in their wallet with the description hash Damgar shows, and Damgar checks it (the node the pointer names, the amount, the hash, no plain description) before sending it.
- **On-chain: a claim at payment, then a second at six confirmations** (pending, then valid), the receipt signed after the second.
- **Anchoring is offered for a collective's acts only**, never a release; the payment for it goes through Damgar like any other.
- **The program trusts the regtest node it is given** as a header service, and says so (on-chain rail Module, client conformance 6).
- **The web client holds the signing key and the request key in the browser's storage**, and follows no chain: stated on every screen.
- **Spending a pay-to-contract output** needs a wallet told each payment's commitment; round 1 keeps the commitments in the account, and does not show spending.

## Tests

- **Damgar** (`npm test`, Node and headless Chromium): a tip, end to end through MOR; requests to be paid and debts; the accepted list (two apps at once, merged; published by choice); on-chain with a test chain; anchoring with a test node and chain; the vault; by clicks in Chromium, the web client and the program's page from a tip to its receipt, Settings, nothing of a chain key kept; Edubba's payment and anchor; Kišib's vault fields; the launcher, the web build, its reproducibility.
- **On regtest, with real btcd and lnd** (`test/regtest.test.ts`, `MOR_LN_REGTEST`): a tip prepared in Dub, signed in Damgar, its invoice made by bob's node, paid by alice from the test wallet, the claim verified by the payee's Damgar and its receipt by the payer's; an on-chain payment to bob's wallet key, bound to the payment, mined to six confirmations; a collective's act anchored through the test service on carol and checked in Edubba. Run here, and in the GitHub run's `regtest` job.
- **The test wallet** (`npm test`; on regtest too), and the Lightning rail Module's own regtest test (`cargo test -p mor-harness --test lightning_rail`), both in that job.
- **Every existing test**: the Rust workspace and every client.

## Human test 11: Damgar on the author's Mac

*For Nobody, allegedly. Test identities only; regtest only: the coins exist only on the Mac. The identities live on the test homes, as in human test 10. Write one line per observation: what you did, what you expected, what happened, how it felt.*

1. **The Mac.** In Terminal, from the MOR folder: `git pull` (or `git checkout claude/damgar` before the merge). Then `cd clients/desk && npm install && cd ../dub && npm install && sh scripts/make-app.sh && cd ../kishib && npm install && cd ../damgar && npm install && sh scripts/make-app.sh && cd ../testwallet && npm install && cd ../anchoring-service && npm install && cd ../..`.
2. **The regtest network.** Follow `docs/damgar-regtest.md`, "Once: the programs, checked" (download btcd and lnd, compare the two fingerprints, stop if one differs), then "Each time: start the network": `up.sh ~/mor-regtest`. Wait for "ready".
3. **The test wallet.** In a second Terminal window: `cd clients/testwallet && npm start -- ~/mor-regtest`, and open `http://127.0.0.1:8478/`. Check: the red band; alice with coins in channels, bob and carol with none.
4. **Damgar and Edubba on the regtest chain, once.** `cd clients/damgar && npm start -- --regtest ~/mor-regtest` (Damgar opens: close the tab), then `cd ../desk && npm start -- --regtest ~/mor-regtest` (the same).
5. **Two test identities in Dub.** Open Dub. Make **P** (the payer), homes and relays `https://home1.dubsar.org`, display name "P". In its identity window, **Copy ID** and **Show the signing key's words**: write them down. **Switch identity**, and make **Q** (the payee) the same way, display name "Q"; copy its ID and its signing words too.
6. **First use of Damgar (as Q).** Open Damgar (its icon: check the tablet with the duck carved in it). The identity window: **Bring it** with Q's ID, signing words and `https://home1.dubsar.org`. Read the list of what can be accepted, each with its version and what it does; tick all; **Accept these**. Check: the note says the list is sealed to the identity and kept at its homes.
7. **Where Q is paid.** Settings. In the test wallet, choose **bob**: copy bob's key (under its name), and press **A Bitcoin key of this node's wallet** and copy that too. In Damgar: Lightning, bob's node key; On-chain, the Bitcoin key; network regtest. **Read it back**: read every cost, and the on-chain request key's: what it is, what a thief could do with it, how to replace it. **Sign and publish it**.
8. **Bring P too.** In Damgar, the identity (top right) → **Bring an identity you have**: P's ID and signing words; tick all; **Accept these**. (Damgar now holds both: **Use this one** switches.)
9. **A tip, prepared in Dub.** In Dub, as Q, post something. Switch to P; follow Q by ID; on Q's post, **Tip**: 1500, **Prepare it for Damgar**. Check: "Prepared, not signed".
10. **Signed in Damgar (as P).** Damgar, as P, **To sign**, **Look again**: the tip, prepared in Dub, in plain words: amount in regtest satoshis, to Q, on Lightning. **Sign it**.
11. **The invoice (as Q).** **Use this one** for Q; To sign, **Look again**: an invoice to make, with its description hash. Copy it. In the test wallet, node **bob**, **Make an invoice**: 1500 and the description hash; copy the invoice. In Damgar, paste it, **Check it and send it**.
12. **Paid from the test wallet (as P).** Damgar as P, **Pay**: the invoice; **Copy the invoice**. Test wallet, node **alice**: paste it, **Read it** (check: 1 500, bob's key, the same description hash), **Pay it**; copy the preimage. In Damgar, paste it, **Check it and sign my claim**: "says valid".
13. **The receipt (as Q).** Damgar as Q, To sign, **Look again**: a receipt to sign; **Check it, and sign the receipt**. The account: came in 1 500 regtest satoshis; the payment is folded, "paid and confirmed"; open it: the claim and the receipt each VALID. As P, **Look again** in To sign, then the account: went out 1 500, folded the same way; open it, both VALID.
14. **On-chain.** As Q in Dub, post again; as P, tip it 40000. Damgar as P: **Sign it**. As Q: **Look again** (Damgar answers the address request by itself: nothing to do). As P, **Pay**: an address, bound to this payment; **Copy the address**. Test wallet, node **alice**, **On-chain**: send 40000 to it; copy the transaction's id; **Mine** 1. Damgar: paste the id, **Check it and sign my claim**: "pending". Test wallet: **Mine** 6. Damgar: **Check the chain again**: valid. As Q, **Look again**, sign the receipt; both accounts.
15. **A request to be paid.** In Dub as Q, Private tab, **Ask someone to pay you**: P's ID, 700, prepare it. Damgar as Q: **Sign and send the request**. As P, **Look again**: the request, with **Accept as a debt (sign an obligation)** and **Pay it**. Press **Accept as a debt** first (check: its state is shown unknown, with the reason), then **Pay it**, and finish as in steps 11 to 13.
16. **Something not accepted.** Damgar as P, Settings: untick **Bitcoin units**, **Save what I accept**. In Dub as P, tip Q's post 100. Damgar, **Look again**: the draft's amount is "100 of unit … (Bitcoin units, not accepted here)", never called satoshis, and it offers only **Decline**. Tick Bitcoin units again, save, and decline that draft.
17. **Anchoring (with the collective of human test 10, or skip).** In a third Terminal window: `cd clients/anchoring-service && npm start -- --regtest ~/mor-regtest --homes https://home1.dubsar.org --relays https://home1.dubsar.org`; copy the identity it prints. Bring the collective's founder into Damgar by its signing words (written in human test 10) and accept all. In Edubba, Collectives, the collective, **Anchor one of its acts on Bitcoin (optional)**: paste the service's identity, **Read its offer**, choose a tier, **Prepare the payment for Damgar**. Check: no release is offered. Damgar as the founder: **Look again**, read it (an anchor of the act's fingerprint, never the act), **Sign it**; after a few seconds, **Look again**, **Pay**: the invoice and the ticket (batch, tier, block). Pay it from alice, paste the preimage. In Edubba the anchor goes from asked to pending; in the test wallet, **Mine** 6; in Edubba, anchored at its block.
18. **The vault (optional).** Open Kišib, **Change an identity's keys** for Q with Q's chain-key paper. Where it asks for lines it cannot read, paste Damgar's line card (Damgar's identity window, as Q). Open **The vault**: **Declare it anew**, unit regtest, Lightning: carol's node key (from the test wallet), limit 10000. Read the review (the vault's line: above 10 000 regtest satoshis, to the vault), sign, and write the new signing words. Give them to Dub (Q's identity window) and to Damgar as Q (**Give the new words**). Damgar's Settings show the vault, read only. A tip of 20000 from P is then routed to the vault: Q makes its invoice on **carol** in the test wallet; P pays it from alice; the claim and the receipt verify, "as the vault in force allows".
19. **Stop.** `modules/lightning/regtest/down.sh ~/mor-regtest`; Ctrl-C in the other windows.
20. **Report.** One line per observation. Mark anything that was not in plain words, any button whose effect surprised you, and any proof not verified.
