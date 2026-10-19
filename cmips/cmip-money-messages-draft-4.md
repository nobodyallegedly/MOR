# cMIP: Money messages

*Draft 4, 19 October 2026, written by round 3 (`docs/round-3-report.md`), for Nobody, allegedly, to approve: draft 3 with **F357** written in (decided by Nobody, allegedly, 19 October 2026, on the session's lean), each change marked "new in draft 4 (F357)" where it stands. **Invoice requests reach a split service** (4.4): where the payee's agreement in force names a split service (Agreements terms field 14), the payer sends the invoice request to the service, sealed to the service's own encryption key; the collective stays the payee in the commitment; the service answers with an invoice from its node and later signs the receipt with the collective's grant key. The payer's money app reads field 14, as its pointer check already reads Agreements. **A purchase confirmed from another app** (2.3): a draft of a new kind, "confirm", prepared in Edubba and sealed to oneself, which the money app signs as a public claim of the payment acknowledging what was bought (a vow's sale, Agreements rule 13). With them, a mechanic this draft's, marked so: **a collective's sale told to its members** (7.2.3), so that a member's app delivers the work's key. Types and fields of draft 3 are unchanged; a reader of draft 4 reads drafts 1 to 3 as its own. Its test value: `sha256("Money messages cMIP, draft 4, test value until publication")`. Draft 3's header follows.*

*Draft 3, 18 October 2026, written by Damgar's round 2 (`docs/damgar-round-2-report.md`), for Nobody, allegedly, to approve: draft 2 with **F352** written in (decided by Nobody, allegedly, 18 October 2026, "Agreed", on the session's and the project lead's lean), marked "new in draft 3 (F352)" where it stands: **an answer names the amount it binds** (type 4, field 4), the commitment's, so a lane's cap is judged on the answer itself by the grant limits cMIP (its 2.1: "a draft's or request's amount where a money messages cMIP act carries one"), every act under a lane then judged by the core's reading rather than the app's word. Asked with it, and answered: this cMIP stays a cMIP, not core (F352, the admission test: a verifier never judges these messages, a lost one wrongs nobody, and they follow today's rails, an invoice per payment, which reusable offers would remove). Types 1, 2, 3, 5 and 6 are draft 2's, unchanged; an answer of drafts 1 and 2, naming no amount, is still read. Its test value: `sha256("Money messages cMIP, draft 3, test value until publication")`. Draft 2's header follows.*

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
  0 => uint,              ; what: 0 pay, 1 ask to be paid, 2 pay for an anchor, 3 confirm a purchase (new in draft 4, F357)
  1 => hash,              ; the other party: the payee (0, 2), or the payer asked (1)
  2 => amount,
  ? 3 => tstr,            ; what for
  4 => tstr,              ; the app that prepared it, as it names itself: "Dub", "Edubba"
  ? 5 => anchor           ; what 2 only
  ? 6 => [ claim: hash, [+ hash] ]   ; what 3 only (new in draft 4, F357): the identity's own public claim of the payment, and the acts the confirmation acknowledges
}
anchor = [ offer: hash, tier: uint, leaf: hash ]   ; the service's standing offer, a tier it states, the leaf (anchoring cMIP, item 5): never the act
```

Its `refs` name what it is about (a post tipped, a collective's act anchored).

2.2. **The reader** (the money app holding the same identity) shows it in plain words, with the rail it would use, and signs nothing until the person chooses: signing it sends an invoice request (0, 2) or a request to be paid (1); declining signs nothing. A draft signed by any other identity is not for it. Each draft is used once.

2.3. *New in draft 4 (F357).* **Confirm a purchase** (what 3): prepared in an app holding the identity but no money key (Edubba), for the money app to sign (decided by Nobody, allegedly, 19 October 2026: "Edubba prepares the confirmation, sealed to oneself, and Damgar signs it, as Dub's tips are prepared"). Field 6 names the identity's own public claim of a payment it made, and the acts to acknowledge: for a vow's sale (Agreements rule 13), the vow. Fields 1 and 2 repeat the claim's payee and amount, for reading. The reader fetches the claim by its id, checks that it is a claim this identity signed, of that payee and amount, and, once the person chooses, signs **the same claim again, in public, acknowledging the acts named** (Envelopes rule 4a): its rail, proof, payee, amount, fulfils and referral as the claim names them. *Nothing moves: it is a second claim of the same payment, which Agreements read as the buyer's confirmation.* A claim not found, not this identity's, or naming another payee or amount is refused, saying why.

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

4.4. *New in draft 4 (F357).* **A payee whose agreement names a split service.** Where the payee's agreement in force names a split service (Agreements terms field 14: in a collective, its grant; the grant's grantee is the service), the payer sends the invoice request **to the service**: its `to` the service, sealed to the service's own encryption key, left at the service's inbox route. The commitment is unchanged: **the payee in it stays the collective**, `paid-to` its pointer in force (whose addresses are the service's, Agreements rule 16). The service, the payee's side, answers (section 5), signed with its own key, with an invoice from its own node, and later signs the receipt with the collective's grant key (Agreements rule 16; Money draft 9, rule 7). The payer's money app reads field 14 from the agreement in force it already reads for the pointer check (Agreements rule 16), and says before paying that the service answers for the payee. *A payer's app that does not read Agreements sends to the payee, as before: the request reaches no one who can open it, and the payment waits, unknown, a stated cost.* A request to the service whose commitment's payee does not name the service in field 14 of its agreement in force is refused by the service, saying why.

## 5. An answer (type 4)

```cddl
answer-payload = {
  0 => hash,              ; the invoice request it answers
  1 => hash,              ; the commitment, as the payee's side recomputed it
  2 => bound,
  ? 3 => hash,            ; paying for an anchor: the ticket the service signed (anchoring cMIP, type 2)
  4 => amount             ; new in draft 3 (F352): the amount it binds, the commitment's
}
bound = [ 0, invoice: tstr ]                                   ; Lightning: a BOLT 11 invoice committing to the commitment
      / [ 1, request: bstr .size 64, ? confirmations: uint ]   ; on-chain: the request key's signature
      / [ 2, why: tstr ]                                       ; refused, and why
```

5.1. *New in draft 3 (F352).* Its amount (field 4) is the commitment's, refusal included. The payer's money app refuses an answer naming another amount, or, under this draft, none; an answer under drafts 1 and 2 names none and is read as before. Under a lane (section 7), the amount it names is what the grant limits cMIP judges (its 2.1 and 2.2): a receipts lane's cap is judged on the answer itself, before the app signs it and by every reader after.

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

7.2.3. *New in draft 4 (mechanic, this draft's, following F357; a reading, to confirm).* **A collective's sale.** Where the seller is a collective whose split service signed the receipt (4.4), the service tells each party of the collective's agreement in force: a sale sealed to each, signed by the service, its fields as above, field 0 the collective's offer (made under its agreement, Agreements rule 11). A member's app holding the work's key (sealed to every member, Agreements rule 57) delivers it to the buyer, signed as the collective. *Every member learns of every sale: a collective keeps no secret from its members (rule 57).*

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
- **An answer names its amount** (draft 3): whoever the answer is delivered to reads it, as they read the commitment already; nothing new leaves the two parties.
- **A lane's acts are signed by an app holding a key in the person's name**: whoever steals that app's key signs within the lane until it is revoked (Agreements, F128's stated cost); the cap bounds each act, not their sum.
- **The on-chain request key is online** in the payee's money app (the on-chain rail Module, "Costs, stated").
- **A split service answers for its collective** (draft 4): it learns the payer and the amount of every payment to the collective, as it must to split it; the payer's request names the collective, never a member.
- **A confirmation from Edubba waits for the money app** (draft 4): until Damgar signs it, the sale stays pending.
- **Unknown stays unknown:** a message from a newer app is not acted on until the reader understands it.

## Freeze scenarios

Not core. Run in Damgar's tests (`clients/damgar/test/`), with real homes and relays, and on regtest: a tip prepared in Dub, signed in Damgar, paid, claimed and receipted; a request to be paid, accepted as a debt and paid; an invoice from another node refused; a draft under a Module not accepted shown unknown and not signed; a message of an undefined type, and a draft with an undefined key, shown unknown, nothing signed, set aside. Draft 2: a lane asked in Dub, granted in Damgar, used and refused past its cap and expiry, revoked (`lanes.test.ts`); a sale told to the seller's Dub, the key delivered (`payperview.test.ts`); both on regtest (`regtest.test.ts`). Draft 3: an answer naming its amount, judged by the grant limits cMIP; above the receipts lane's cap, not answered by itself, saying why; within it, answered by itself (`answer-amount.test.ts`).
