# cMIP: Money messages

*Draft 1, 17 October 2026, written by Damgar's build (`docs/damgar-report.md`) for F338, for Nobody, allegedly, to approve. Its form, decided by Nobody, allegedly, 17 October 2026: option (A), "a small experimental cMIP draft for the money messages (requests to be paid, and money acts prepared in one app for another, sealed to oneself), marked experimental like the nudge cMIP, its costs stated"; "keep it minimal: what each message carries, who signs it, and what a reader does with one it cannot read (shown as unknown, never guessed)". **F338**: "the other apps need to be able to offer to create the acts without signing them"; a draft travels "on MOR", as "a private act sealed to one's own identity at its homes, as the sealed follow list"; "It's absurd for the UX, but it's intentional for testing and demonstration."*

*Founding cMIP, **EXPERIMENTAL**: an instrument for testing, not a product; test identities and test networks only until MOR is frozen. Not core: frozen at publication, competing with any other cMIP for the same job.* Written against the Money MIR draft 8, the payment cMIP draft 3, the Lightning and on-chain rail Modules draft 3, the anchoring cMIP draft 5 and the Envelopes MIR draft 10 (private acts, the sealed container, inbox routes). It fills no task: an xtype (Development rule 18), four act types. It changes nothing in Money: claims, receipts and obligations stay Money's own acts. Its hash stays a draft hash until its creator is named at step 17; until then its acts name a test value, `sha256("Money messages cMIP, draft 1, test value until publication")`. Code: `clients/damgar/src/messages.ts` (Damgar, Dub and Edubba).

*Reading this document: normal text is the specification; italic text is commentary. Every choice is **(mechanic, this draft's)** unless it cites a decision.*

## In plain words

*With the layers kept apart, Dub and Edubba may prepare a payment but never sign it; the money app (Damgar) does. And before money moves, payer and payee must agree on one fingerprint of the payment (the payment cMIP's commitment), which the payee's side binds to an invoice or an address. These are the four short messages that carry that, each a private act sealed to its one reader. None of them is a payment, a debt or a promise: only Money's acts are.*

| Message | Signed by | Sealed to | Carries |
| --- | --- | --- | --- |
| **Draft** (type 1) | the identity, in the app that prepared it (Dub, Edubba) | the same identity, left at its own homes | "pay X this much for that", or "ask X to pay me" |
| **Request to be paid** (type 2) | the payee | the payer | an amount, what for, the payee's pointer |
| **Invoice request** (type 3) | the payer | the payee | the payment's commitment, for the payee's side to bind |
| **Answer** (type 4) | the payee | the payer | an invoice, a signed on-chain request, or a refusal |

## 1. Every message

1.1. A **private** everyday act of this cMIP, signed with the signing key, its `to` naming its one recipient, in a sealed container to the recipient's current encryption key, left at the recipient's inbox route (Envelopes, "How acts reach people"); a draft is left at the identity's own homes, as the people cMIP's sealed follow list. The locked act goes to the signer's homes too (Identity rule 35).

1.2. **Amounts** are Money's `[ unit, value ]`: the unit by its specification's hash, the value a whole number of its smallest part. Shown always with the unit's name from a units Module the reader accepts; never added to or compared with an amount in another unit. *Nothing here assumes a satoshi.*

1.3. **What for** (`tstr`): canonical text, at most 280 characters, shown as written, never read by any rule.

1.4. **Nothing in a message binds anyone.** A draft is not a payment; a request is not a debt (F66); an invoice request is not a claim.

## 2. A draft (type 1)

2.1. **What it carries:**

```cddl
draft-payload = {
  0 => uint,              ; what: 0 pay, 1 ask to be paid, 2 pay for an anchor
  1 => hash,              ; the other party: the payee (0, 2), or the payer asked (1)
  2 => amount,
  ? 3 => tstr,            ; what for
  4 => tstr,              ; the app that prepared it, as it names itself: "Dub", "Edubba"
  ? 5 => anchor           ; what 2 only
}
anchor = [ offer: hash, tier: uint, leaf: hash ]   ; the service's standing offer, a tier it states, the leaf (anchoring cMIP, item 5): never the act
```

Its `refs` name what it is about (a post tipped, a collective's act anchored).

2.2. **The reader** (the money app holding the same identity) shows it in plain words, with the rail it would use, and signs nothing until the person chooses: signing it sends an invoice request (0, 2) or a request to be paid (1); declining signs nothing. A draft signed by any other identity is not for it. Each draft is used once.

## 3. A request to be paid (type 2)

```cddl
request-payload = {
  0 => amount,
  ? 1 => tstr,            ; what for
  2 => hash               ; the payee pointer in force when it asked
}
```

The payer's money app offers (decided by Nobody, allegedly, 17 October 2026): **accept it as a debt** (a Money obligation, only if the payer means to owe it; its state shown unknown by a Money-only app, Money rule 15, M5), **pay it** (an invoice request), then **record the payment** (a Money claim with the rail's proof).

## 4. An invoice request (type 3)

```cddl
invoice-request-payload = {
  0 => commitment,        ; the payment cMIP's commitment, whole, its salt fresh (128 random bits)
  ? 1 => tstr,            ; what for
  ? 2 => hash,            ; the request to be paid it answers, if any
  ? 3 => [ leaf: hash, tier: uint ]   ; paying for an anchor (anchoring cMIP, item 10)
}
```

4.3. Its signer must be the commitment's payer and its recipient the payee. The payee's side answers only for a commitment naming it, paid to its own pointer or vault, on a rail of its own carrying the amount's unit; otherwise it refuses, saying why.

## 5. An answer (type 4)

```cddl
answer-payload = {
  0 => hash,              ; the invoice request it answers
  1 => hash,              ; the commitment, as the payee's side recomputed it
  2 => bound,
  ? 3 => hash             ; paying for an anchor: the ticket the service signed (anchoring cMIP, type 2)
}
bound = [ 0, invoice: tstr ]                                   ; Lightning: a BOLT 11 invoice committing to the commitment
      / [ 1, request: bstr .size 64, ? confirmations: uint ]   ; on-chain: the request key's signature
      / [ 2, why: tstr ]                                       ; refused, and why
```

5.2. The payer's money app checks it under the rail Module's rule (which must answer pending, nothing paid yet) before showing anything to pay.

5.3. *On Lightning the payee's money app holds no node: the payee makes the invoice in their own wallet, the commitment's hash as its description hash, and pastes it back; the app checks it before answering. On-chain the payee's money app holds the request key and answers by itself (decided by Nobody, allegedly, 17 October 2026).*

## 6. A message the reader cannot read

6.1. A message of this cMIP that a reader cannot read is **shown as unknown, never guessed**: a type this draft does not define, or a payload that does not decode as written here or carries a key it does not define. The reader shows who signed it and that it is unknown, takes no amount, party or purpose from it, and **signs nothing for it**; the person may set it aside, which signs and sends nothing.

6.2. A message it can read but under a specification the person does not accept (an amount's units Module, a rail Module) is shown unknown too, and nothing is signed for it: what it says is shown as it is (an amount as a number of a unit named by its hash, never by a guessed name).

6.3. A sealed container the reader cannot open (sealed to a key it does not hold) is counted and said, never guessed at.

*A newer app, or a later draft of this cMIP, may write what an older reader cannot read: it waits, unknown, until the reader is updated.*

## Costs, stated

- **Relays see** that a private act passed between two identities, when, and its rough size; never what it holds.
- **Whoever holds the signing key's words** reads every message sealed to that identity, its drafts included.
- **Manual on Lightning:** the payee pastes an invoice by hand. *Intentional for testing and demonstration (F338).*
- **The payee's money app must be opened** for an invoice request to be answered; until then the payer waits.
- **The on-chain request key is online** in the payee's money app (the on-chain rail Module, "Costs, stated").
- **Unknown stays unknown:** a message from a newer app is not acted on until the reader understands it.

## Freeze scenarios

Not core. Run in Damgar's tests (`clients/damgar/test/`), with real homes and relays, and on regtest: a tip prepared in Dub, signed in Damgar, paid, claimed and receipted; a request to be paid, accepted as a debt and paid; an invoice from another node refused; a draft under a Module not accepted shown unknown and not signed; a message of an undefined type, and a draft with an undefined key, shown unknown, nothing signed, set aside.
