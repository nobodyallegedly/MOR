# cMIP: Money messages

*Draft 1, 17 October 2026, written by Damgar's build (`docs/damgar-report.md`) for F338, for Nobody, allegedly, to approve. Its form was asked as the build's open question: option (A), a small cMIP of its own, was approved by Nobody, allegedly, on 17 October 2026; this text is not yet approved. **F338**, decided by Nobody, allegedly: "the other apps need to be able to offer to create the acts without signing them"; a draft travels "on MOR", as "a private act sealed to one's own identity at its homes, as the sealed follow list"; "It's absurd for the UX, but it's intentional for testing and demonstration." And the working rule of 17 October 2026: the test apps keep the layers apart and talk through MOR. The Lightning rail Module leaves open how an invoice is asked for ("over HTTP or the inbox, with a published form", its Open); this draft writes the inbox form, and the on-chain rail Module's address requests with it.*

*Founding cMIP, EXPERIMENTAL. Not approved, not a product; test identities and test networks only until MOR is frozen.* Written against the Money MIR draft 8, the payment cMIP draft 3, the Lightning and on-chain rail Modules draft 3, the anchoring cMIP draft 5, the Envelopes MIR draft 10 (private acts, the sealed container, inbox routes) and the findings to F340. It fills no task: an xtype (Development rule 18), defining four act types. It changes nothing in Money: receipts, claims and obligations are Money's own acts, and travel as the payment cMIP says ("Delivery"). Its hash stays a draft hash until its creator is named at step 17; until then its acts name a test value, `sha256("Money messages cMIP, draft 1, test value until publication")`. Its code is in Damgar (`clients/damgar/src/messages.ts`), Dub and Edubba (each through Damgar's file).

*Reading this document: normal text is the specification. Italic text is commentary. Every choice is **(mechanic, this draft's)** unless it cites a decision.*

## In plain words

*A payment in MOR is two records, each signed by one side: the payer's claim and the payee's receipt (Money rule 7). Before the money moves, the two sides must agree on one fingerprint of the payment, the commitment (payment cMIP), which the payee's side binds to its invoice or address. And with the layers kept apart, an app that is not the money app (Dub, Edubba) may prepare a payment but never sign it: the money app does.*

*This cMIP is the four short messages that carry that between apps and between people, each a private act sealed to its one reader:*
- *a **draft**, from Dub or Edubba to one's own identity: "pay X this much for that", or "ask X to pay me";*
- *a **request to be paid**, from the payee to the payer;*
- *an **invoice request**, from the payer's money app to the payee: the commitment, so the payee's side can bind it;*
- *an **answer**, from the payee back: the invoice, or the signed on-chain request, or a refusal.*

## 1. Common to every message

1.1. Each is a **private** everyday act of this cMIP, signed with the signing key, its `to` naming its one recipient. It is put in a sealed container to the recipient's current encryption key and left at the recipient's inbox route (Envelopes, "How acts reach people"); a **draft** (type 1) is the exception, left at the sender's own homes, as the people cMIP's sealed follow list (its 3.2), since its recipient is the sender. The locked act goes to the sender's homes too, so the sender's line can be kept by whoever changes its keys (Identity rule 35).

1.2. **Amounts** are Money's `amount`, `[ unit, value ]`: the unit by its specification's hash, the value in its smallest part. A client shows every amount with its unit's name, from the units Module it accepts, never as a bare number, and never adds or compares amounts of different units. *Nothing here assumes a satoshi.*

1.3. **What for** (`tstr`): canonical text (Text MIR), at most 280 characters, shown as written; never read by any rule. **References** (`refs`, as an act's key 8 carries them, Envelopes): the acts a message is about, a public act named with its signer (F272).

1.4. **Nothing in a message binds anyone.** A draft is not a payment; a request is not a debt (F66: a creditor's statement of what it is owed is never an obligation); an invoice request is not a claim. Only Money's acts, signed by the party Money names, decide anything.

## 2. A draft (type 1)

2.1. **Sent by** an app that prepares money acts without signing them (Dub, Edubba) **to the identity itself**, for the money app holding the same identity to read, check and sign or decline.

```cddl
draft-payload = {
  0 => uint,              ; what: 0 pay, 1 ask to be paid, 2 pay for an anchor (the anchoring cMIP)
  1 => hash,              ; the other party: the payee (0, 2), or the payer asked (1)
  2 => amount,
  ? 3 => tstr,            ; what for (1.3)
  4 => tstr,              ; the app that prepared it, as it names itself: "Dub", "Edubba"
  ? 5 => anchor           ; what 2 only
}
anchor = [ offer: hash, tier: uint, leaf: hash ]   ; the service's standing offer, the tier chosen, and the leaf (anchoring cMIP, item 5): never the act anchored
```

The draft's own `refs` name what it is about (a post tipped, a collective's act anchored).

2.2. **The money app** shows it in plain words with what it would do (a payment: on which rail, to the flow or the vault, Money rules 1, 3 and 5; a request: to whom it goes), checks the other party's pointer, vault and rails against the person's accepted Modules (the accepted cMIP), and **signs nothing for it until the person chooses**; declining signs nothing at all. A draft under a specification not accepted is shown unknown and not signed (F338).

2.3. **A draft is used once**: the money app keeps which drafts it signed or declined, by act id.

## 3. A request to be paid (type 2)

3.1. **Sent by** the payee **to** the payer.

```cddl
request-payload = {
  0 => amount,
  ? 1 => tstr,            ; what for
  2 => hash               ; the payee-pointer act in force for the payee when it asked
}
```

3.2. **The payer's money app offers three things** (decided by Nobody, allegedly, 17 October 2026): **accept it as a debt**, by signing a Money obligation (type 1: debtor the payer, creditor the payee, the amount, key 3 the pointer in key 2), only if the payer means to owe it; **pay it**, in the payer's own wallet, after an invoice request (section 4) whose `fulfils` is the obligation where one was signed, otherwise the payee pointer of key 2; then **record the payment**, by signing a payment claim (Money type 3) with the rail's proof. *Most tips skip the first.* An obligation signed is delivered to the payee as Money acts are (payment cMIP, "Delivery").

3.3. *Stated cost (Money draft 8, rule 15, Fable's M5): a Money-only client shows every state of an obligation as unknown, an obligation naming no agreement included; and a payment to the flow counts toward such an obligation only once the payee acknowledges it with an act of its own holding a pointer, which an Agreements client checks (Money rule 17). The money app says so where the debt is signed and wherever it shows it.*

## 4. An invoice request (type 3)

4.1. **Sent by** the payer's money app **to** the payee, before paying: the commitment the payer computed (payment cMIP, "The payment commitment", step 1), for the payee's side to bind.

```cddl
invoice-request-payload = {
  0 => commitment,        ; the payment cMIP's commitment, whole, its salt drawn fresh by the payer (128 random bits)
  ? 1 => tstr,            ; what for
  ? 2 => hash,            ; the request to be paid it answers (type 2), if any
  ? 3 => ticket-asked     ; a payment for an anchor: what the anchoring cMIP's request endpoint is given (its item 10)
}
ticket-asked = [ leaf: hash, tier: uint ]
```

4.2. **Its signer is the commitment's payer**, and its recipient the commitment's payee: otherwise the payee's side refuses it.

4.3. **The payee's side answers** (section 5) only as the payment cMIP's step 1 allows: a commitment naming the payee, its `paid-to` the payee's own pointer or vault, on a rail Module of the payee's own, carrying the amount's unit; otherwise it refuses, saying why. *The salt travels sealed to the payee, who learns it anyway from the rail; only the rail's onlookers must not.*

## 5. An answer (type 4)

5.1. **Sent by** the payee's side **to** the payer.

```cddl
answer-payload = {
  0 => hash,              ; the invoice request it answers
  1 => hash,              ; the commitment's hash, as the payee's side recomputed it
  2 => bound,
  ? 3 => hash             ; for a payment for an anchor: the ticket (anchoring cMIP, type 2) the service signed for it
}
bound = [ 0, invoice: tstr ]                          ; Lightning: a BOLT 11 invoice its node issued, committing to the commitment (the Lightning rail Module)
      / [ 1, request: bstr .size 64, ? confirmations: uint ]   ; on-chain: the request key's signature (the on-chain rail Module, "The request")
      / [ 2, why: tstr ]                              ; refused, and why
```

5.2. **The payer's money app checks it** before showing anything to pay: the Lightning invoice under the rail Module's rule with no preimage, which must answer pending; the on-chain request under the on-chain rule with no payment, which must answer pending (payment cMIP, step 2). Only then does it show what to pay: the invoice, or the address the commitment gives.

5.3. *On Lightning, the payee's money app holds no node (F338: "no wallet inside"): the payee makes the invoice in its own wallet, with the commitment's hash as its description hash and no plain description, and pastes it back; its money app checks it (the node the payee's pointer names, the description hash, the amount) before answering. On-chain, the payee's money app holds the request key and answers by itself (decided by Nobody, allegedly, 17 October 2026).*

## 6. After paying

6.1. The payer's money app takes the rail's evidence the payer pastes back (on Lightning the preimage; on-chain the transaction, its block found from the chain it follows), runs the rail Module's rule, and, on an answer of valid or pending, signs the **payment claim** (Money type 3) at once (Money rule 29's client conformance: the claim written at payment), delivered sealed to the payee (payment cMIP, "Delivery"). On a rail whose answer was pending, a second claim once it is valid (F203).

6.2. The payee's money app verifies the claim from the rail's evidence and offers the payee to sign the **settlement receipt** (Money type 2), delivered sealed to the payer. *The receipt is the payee's own admission; nothing in this cMIP signs it for the payee.*

## Costs, stated

- **Relays see** that a private act passed between two identities, and when; never what it holds. The inbox relays of each see the other's ID only where they are named on the outside (Envelopes).
- **Manual on Lightning:** the payee pastes an invoice by hand. *Intentional for testing and demonstration (F338).*
- **The payee's money app must be opened** for an invoice request to be answered; until then the payer waits.
- **The request key is online** in the payee's money app (the on-chain rail Module, "Costs, stated"; decided by Nobody, allegedly).

## Freeze scenarios

Not core. Run in Damgar's tests (`clients/damgar/test/`), with real homes and relays, and end to end on regtest: a tip prepared in Dub, signed in Damgar, paid from the test wallet, the payer's claim verified by the payee's Damgar, which signs the receipt, verified by the payer's; a request to be paid, accepted as a debt and paid; an invoice from another node refused; an invoice request naming another payee refused; a draft under a Module not accepted shown unknown and not signed.
