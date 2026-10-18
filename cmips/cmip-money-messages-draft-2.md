# cMIP: Money messages

*Draft 2, 18 October 2026, written by Damgar's round 2 (`docs/damgar-round-2-report.md`), for Nobody, allegedly, to approve: draft 1 with two more messages, a **lane asked** (type 5, section 7.1) and a **sale** (type 6, section 7.2), for F338's lanes and the pay-per-view post (F351), and the costs changed where the receive-only link and lanes change them. Types 1 to 4 are draft 1's, unchanged, byte for byte; a reader of draft 2 reads draft 1's acts as its own. Its test value: `sha256("Money messages cMIP, draft 2, test value until publication")`. Draft 1's header follows.*

*Draft 1, 17 October 2026, written by Damgar's build (`docs/damgar-report.md`) for F338, for Nobody, allegedly, to approve. Its form, decided by Nobody, allegedly, 17 October 2026: option (A), "a small experimental cMIP draft for the money messages (requests to be paid, and money acts prepared in one app for another, sealed to oneself), marked experimental like the nudge cMIP, its costs stated"; "keep it minimal: what each message carries, who signs it, and what a reader does with one it cannot read (shown as unknown, never guessed)". **F338**: "the other apps need to be able to offer to create the acts without signing them"; a draft travels "on MOR", as "a private act sealed to one's own identity at its homes, as the sealed follow list"; "It's absurd for the UX, but it's intentional for testing and demonstration."*

*Founding cMIP, **EXPERIMENTAL**: an instrument for testing, not a product; test identities and test networks only until MOR is frozen. Not core: frozen at publication, competing with any other cMIP for the same job.* Written against the Money MIR draft 8, the payment cMIP draft 3, the Lightning and on-chain rail Modules draft 3, the anchoring cMIP draft 5 and the Envelopes MIR draft 10 (private acts, the sealed container, inbox routes). It fills no task: an xtype (Development rule 18), six act types (four in draft 1). It changes nothing in Money: claims, receipts and obligations stay Money's own acts. Its hash stays a draft hash until its creator is named at step 17; until then its acts name a test value, `sha256("Money messages cMIP, draft 1, test value until publication")`. Code: `clients/damgar/src/messages.ts` (Damgar, Dub and Edubba).

*Reading this document: normal text is the specification; italic text is commentary. Every choice is **(mechanic, this draft's)** unless it cites a decision.*

## In plain words

*With the layers kept apart, Dub and Edubba may prepare a payment but never sign it; the money app (Damgar) does. And before money moves, payer and payee must agree on one fingerprint of the payment (the payment cMIP's commitment), which the payee's side binds to an invoice or an address. These are the four short messages that carry that, each a private act sealed to its one reader. None of them is a payment, a debt or a promise: only Money's acts are.*

| Message | Signed by | Sealed to | Carries |
| --- | --- | --- | --- |
| **Draft** (type 1) | the identity, in the app that prepared it (Dub, Edubba) | the same identity, left at its own homes | "pay X this much for that", or "ask X to pay me" |
| **Request to be paid** (type 2) | the payee | the payer | an amount, what for, the payee's pointer |
| **Invoice request** (type 3) | the payer | the payee | the payment's commitment, for the payee's side to bind |
| **Answer** (type 4) | the payee | the payer | an invoice, a signed on-chain request, or a refusal |
| **Lane asked** (type 5, draft 2) | the identity, in the app asking (Dub) | the same identity, at its homes | a grant key the app made, the lane's words, what it may sign, its limits |
| **Sale** (type 6, draft 2) | the identity, by its money app (Damgar) | the same identity, at its homes | an offer of its, the buyer, the receipt, the publication sold |

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

## 7. Lanes and sales (new in draft 2)

### 7.1. A lane asked (type 5)

```cddl
lane-request = {
  0 => [1, bstr .size 32],     ; the grant key's public part, Identity's [scheme, key]: made and kept by the app asking
  1 => tstr,                   ; the lane's words: "Dub on the Mac" (at most 280 characters)
  2 => [+ [hash, uint]],       ; what it may sign: each a specification and a type (a grant's field 6, `[1, spec, type]`)
  ? 3 => any,                  ; the limits asked, in the grant limits cMIP's own format (its grant field 3)
  4 => tstr                    ; the app asking, as it names itself
}
```

7.1.1. Signed with the identity's own signing key by the app asking, sealed to the identity itself and left at its homes, as a draft is (1.1).

7.1.2. The money app reads it in plain words before anything is signed: what the lane may sign, its cap per act, its expiry and on which clock, that it is public, and that one revocation ends it. Granting it signs **a grant of the identity to itself** (Agreements draft 15, rule 73, F351), public, naming the key in field 0, its kinds those of field 2 and its limits those of field 3 under the grant limits cMIP, and **the identity's acceptance** (a signature act naming the grant). Both are left at the identity's relays and homes. Declining signs nothing.

7.1.3. The app asking finds the grant by its key among the identity's public acts, and signs only under it, and only within it: before each act it reads the grant's limits and refuses past the cap or the expiry (the grant limits cMIP, 5.1), and refuses under a revoked grant. *The lane's words travel only here and in the money app's record: a grant carries no words.*

7.1.4. A request asking for no cap is refused by the money app (mechanic, this draft's): a lane is a limit.

### 7.2. A sale (type 6)

```cddl
sale = {
  0 => hash,   ; the offer followed: a lone seller's standing offer (Agreements type 6) of this identity
  1 => hash,   ; the buyer: the payer the receipt names
  2 => hash,   ; the receipt this identity signed for the payment
  3 => hash    ; the publication the offer sells
}
```

7.2.1. Sent by the seller's money app, sealed to the seller itself, at its homes, once it has signed the receipt of a payment following one of its offers. The seller's own app for that layer (Dub) reads it and delivers the publication's key to the buyer (Envelopes type 1, a key delivery, sealed to the buyer). *The money app signs no Envelopes act; the Envelopes app learns of the sale through MOR, never a side channel.*

7.2.2. A sale names no amount and binds nobody: the receipt is Money's.

## 6. A message the reader cannot read

6.1. A message of this cMIP that a reader cannot read is **shown as unknown, never guessed**: a type this draft does not define, or a payload that does not decode as written here or carries a key it does not define. The reader shows who signed it and that it is unknown, takes no amount, party or purpose from it, and **signs nothing for it**; the person may set it aside, which signs and sends nothing.

6.2. A message it can read but under a specification the person does not accept (an amount's units Module, a rail Module) is shown unknown too, and nothing is signed for it: what it says is shown as it is (an amount as a number of a unit named by its hash, never by a guessed name).

6.3. A sealed container the reader cannot open (sealed to a key it does not hold) is counted and said, never guessed at.

*A newer app, or a later draft of this cMIP, may write what an older reader cannot read: it waits, unknown, until the reader is updated.*

## Costs, stated

- **Relays see** that a private act passed between two identities, when, and its rough size; never what it holds.
- **Whoever holds the signing key's words** reads every message sealed to that identity, its drafts included.
- **On Lightning, an invoice by hand or through a receive-only link** (F351): without the link, the payee pastes an invoice from their wallet; with it, the payee's money app asks the node for one, under its receipts lane. *The manual path is kept, labelled for those who want to follow every step.*
- **The payee's money app must be running** for an invoice request to be answered or a receipt signed by itself; until then the payer waits.
- **A lane's acts are signed by an app holding a key in the person's name**: whoever steals that app's key signs within the lane until it is revoked (Agreements, F128's stated cost); the cap bounds each act, not their sum.
- **The on-chain request key is online** in the payee's money app (the on-chain rail Module, "Costs, stated").
- **Unknown stays unknown:** a message from a newer app is not acted on until the reader understands it.

## Freeze scenarios

Not core. Run in Damgar's tests (`clients/damgar/test/`), with real homes and relays, and on regtest: a tip prepared in Dub, signed in Damgar, paid, claimed and receipted; a request to be paid, accepted as a debt and paid; an invoice from another node refused; a draft under a Module not accepted shown unknown and not signed; a message of an undefined type, and a draft with an undefined key, shown unknown, nothing signed, set aside. Draft 2: a lane asked in Dub, granted in Damgar, used and refused past its cap and expiry, revoked (`lanes.test.ts`); a sale told to the seller's Dub, the key delivered (`payperview.test.ts`); both on regtest (`regtest.test.ts`).
