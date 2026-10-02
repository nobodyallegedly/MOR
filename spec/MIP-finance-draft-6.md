# MIP: Finance

*Draft 6, 2 October 2026 (roadmap step 12, the Lightning rail). Draft 5 with rule 14a confirmed as drafted, F111 and F112 applied. Rule 14a stays fail closed: a payment in a unit the vault does not cover is undeliverable, and the debt stays open until the owner adds the unit (rule 16), confirmed by Nobody, allegedly, 2 October 2026. F111: the owner learns of what the vault refuses, by client conformance (rule 14b). F112: the payment task is filled by one payment cMIP per agreement, and each rail is a Module under it, a **rail Module**, with its own verification rule; receipts are signed by receivers and claims by payers, and no specification signs or "produces" anything; conversion and custodial flow services are identities, parties to agreements, not cMIPs or Modules. **Not yet approved.** Written against core v19, Identity MIP draft 10, Envelope MIP draft 6, Text MIP draft 6, Law MIP draft 8, Production MIP draft 5, the payment cMIP draft 1, the Lightning rail Module draft 1 and findings F1 to F112.*

*Draft 5, 27 September 2026, applied review round 2: double entry (a payer's claim is evidence on equal footing with a receipt); one rail proof per batch; obligations signed by the debtor; the vault as per-unit, per-rail entries with derived addresses and flow off; payment for a publication to the identity it is made for; refunds claimable by proof; referral evidence signed by the payer.*

*Reading this document: normal text is the protocol itself. Italic text is commentary, reasoning and examples.*

## Purpose

Finance defines how a simple payment moves through MOR: never the rails themselves, and nothing about who owns what. A payer pays a payee pointer; Finance's job ends when the money reaches it. How the money is then divided among owners is defined by their agreement, in Law.

Finance defines what a settlement means to the protocol, whatever rail it happened on. Whatever the rail, Lightning, stablecoin or fiat, the receiver signs the same settlement receipt, and only the rail's proof differs, checked by the rule of the rail Module that defines it. When payer and payee use different rails, a conversion service, an identity that receives on one rail and pays on another, carries the money in between, and the payment reads as one verifiable chain of receipts. If a route breaks, the receipts show exactly which hop and which agreement failed. And because every payment can be recorded from both ends, a receiver cannot make money invisible by staying silent.

It also gives every client a shared language for:

- who owes whom, how much, in what unit (obligations);
- where payment to an identity (a person, an organisation or a collective) goes (payee pointers), with a flow that is easy to change and a vault that is not.

A payment to a work or a person, such as a tip, needs only this MIP and the payee pointer.

## Dependencies

Identity, Envelope and Text. Finance never depends on Law or Production: a Finance-only client, such as a wallet that sends tips, is a complete client. Where a Finance state depends on Law, a Finance-only client shows it as unknown (F32).

## Definitions

- **Rail.** A payment system outside MOR (Lightning, on-chain Bitcoin, ecash, stablecoins, cards, bank transfers), used through a rail Module.
- **Payment cMIP.** The cMIP that fills the payment task for an agreement (task 6): it defines how rail Modules plug in, how a receipt and a claim carry a rail's proof, and how they are checked. An agreement names at most one (Law, Production rule 7).
- **Rail Module.** A Module under a payment cMIP for one rail: the rail's address and vault-source formats, its proof format, and its verification rule. Several rail Modules work under one payment cMIP, one per rail (Production rule 8, F112). *A Module is a specification: it signs nothing and holds no money; the identities acting under it do.*
- **Unit.** What an amount is counted in, in its smallest indivisible part. A unit is a small specification of its own, which rail Modules reference, so the same unit has one name on every rail that carries it.
- **Obligation.** A signed statement by a debtor that it owes a creditor an amount, in a unit.
- **Hop.** One movement of money on one rail, from one party to the next.
- **Settlement receipt.** The common proof of one hop, signed by its receiver, the same for every rail: who paid whom, how much, in what unit, under which agreement.
- **Payment claim.** A payer's record of a payment, carrying the rail's proof. Evidence on equal footing with a receipt.
- **Route.** One simple payment carried in several hops, across rails or units, through conversion services. Each receipt names the previous one.
- **Conversion service.** An identity that receives on one rail or unit and pays on another, at the rate of its own offer: it signs a receipt as receiver, with a forward, and is the payer of the next hop. A party, not a specification.
- **Discharge.** A complete route, or several, that bring the owed amount to the creditor's payee pointer.
- **Verification answer.** The result of checking a receipt or claim against its rail: valid, invalid, pending or unknown, with the hash of the rail Module whose rule computed it, and the trusted party it relied on, if any.
- **Payee pointer.** Where payment to an identity goes: one or more rails in order of preference.
- **Flow pointer.** An identity's payee pointer for ordinary incoming payments, changed with the signing key.
- **Vault.** An identity's declared set of safer receiving entries, per unit and per rail, changed only with the safety key. The vault is the grammar for setting up safer pointers, if the owner wishes to.
- **Batch.** A set of payouts a split service pays with one rail payment, as its grant allows (Law).

## Act formats

All acts are Envelope MIP acts. Payee pointers are public; obligations, receipts and payment claims are private by default, visible to their parties.

```cddl
amount = [ unit: hash, value: uint ]      ; unit: the unit's specification; value in its smallest part
rail   = [ module: hash, address: bstr ]  ; a rail Module and the rail-specific address data, which only that Module reads
```

### Payee pointer (type 0)

```cddl
payee-pointer-payload = {
  0 => hash,               ; payee: the identity this pointer is for, which is also its only signer
  1 => uint,               ; version: 1, then the previous version plus one
  ? 2 => hash,             ; the previous payee pointer for this payee (absent for version 1)
  3 => [+ rail]            ; rails in order of preference
}
```

For an identity, this is the **flow pointer**. Pointers form a chain: each names the one it replaces and carries its version plus one, so nobody can jump ahead, and a fork is visible and contested (F31). A fork behind an act the owner's later rotation kept is settled by that rotation.

**Only identities have payee pointers (F46).** A payee pointer is valid only if signed by the identity it is for, with that identity's own key; collectives sign their own. A publication has no pointer of its own: it carries a price, and payment goes to the pointer of the identity named in its `for` field, or, if none, of its signer (Envelope, F68). *A Finance-only wallet needs nothing else: it reads `for`, follows that identity's pointer, and pays. Whether a grant backs the `for` is Law's business.* Where there are splits, that identity's pointer leads to its split service (Law).

```cddl
price = amount   ; carried in a publication's media entry (Envelope, key 7)
```

The publication's price is the plain-payment price, for Finance-only clients. Where the owners also publish a standing offer, the offer governs deals made under Law.

### The vault

Declared in the Identity MIP's declarations slot, in genesis or a rotation, so only the safety key can change it (F10, F79):

```cddl
vault       = [ FINANCE, 0, [+ vault-entry] ]
vault-entry = [ unit: hash, rail-module: hash, source: bstr, limit: uint ]
; source: what the rail Module needs to obtain a fresh receiving address: a descriptor or extended key to derive one from, the key of a node that issues one (Lightning), or a fixed address for rails with neither
; limit: the largest single payment in this unit that may go to the flow; 0 means flow off for this unit
```

Several entries may share a unit, on different rails, so a dead rail does not make the vault unreachable until the next rotation. For each payment, a fresh receiving address is obtained under the source as its rail Module defines: derived from it where the rail allows derivation, or issued by the node the source names, so a vault never reuses an address by protocol design. *The core does not know what a source is; the rail Module does. On Lightning, the source names the vault's own node, whose invoices a payer verifies against it; nothing is derived offline (Lightning rail Module draft 1).* A null value for kind 0 removes the vault (Identity).

### Obligation (type 1)

```cddl
obligation-payload = {
  0 => hash,               ; debtor: identity or collective; the signer
  1 => hash,               ; creditor: an identity
  2 => amount,
  3 => hash,               ; the creditor's payee-pointer act in force when the obligation arose
  ? 4 => hash              ; the agreement or offer it arises from (Law)
}
```

An obligation is signed by the debtor. A creditor's statement of what it is owed is a claim, never an obligation (F66).

### Settlement receipt (type 2)

```cddl
receipt-payload = {
  0 => hash,               ; rail: the rail Module that carried this hop
  1 => bstr,               ; the rail's proof, as the payment cMIP and that rail Module define it
  ? 2 => hash,             ; payer: identity or collective; absent if the payer stays anonymous
  3 => hash,               ; payee: who received on this hop
  4 => amount,             ; how much was received, in this hop's unit
  5 => hash,               ; fulfils: the obligation, agreement, offer or payee-pointer act this hop follows
  ? 6 => hash,             ; the previous hop's receipt (absent on the first hop)
  ? 7 => forward,          ; conversion hops only: what is passed on to the next hop
  ? 8 => hash              ; batch: the batch this receipt belongs to, when one rail proof covers several payouts (Law)
}

forward = [ next-payee: hash, amount, agreement: hash ]   ; amount in the next hop's unit
```

A receipt is signed by the **payee of the hop**: the party that received the money. The previous hop's receipt is also named in `objects`, so a route is a chain in the Envelope MIP's sense. *Draft 4's referral note, bytes passed along unread, is removed: no receipt carries bytes nobody checks, and a referral is evidence only when the payer signs it (rule 10b, F75).*

A receipt carries no split. The final payee is the payee pointer; if that pointer belongs to a split service, the split and each payout are defined by the owners' agreement, in Law, and each payout is itself a simple Finance payment with its own receipt.

### Payment claim (type 3)

```cddl
claim-payload = {
  0 => hash,               ; rail: the rail Module used
  1 => bstr,               ; the rail's proof
  2 => hash,               ; the payee paid
  3 => amount,
  4 => hash,               ; the obligation, agreement, offer or payee pointer followed
  ? 5 => hash,             ; the receipt this claim disagrees with, if any
  ? 6 => referral,         ; referral: who led the payer to this payment, signed here by the payer (Law, role shares)
  ? 7 => rail              ; where a refund owed on this payment is to be paid (F80)
}

referral = [ identity: hash, evidence: hash ]   ; the referrer, and the act (a repost, a page) the payer followed
```

A payment claim is the payer's side of the record. It carries the rail's proof, so anyone can verify that the money reached the payee's rail address. It is private by default like every act; publishing it, to a counterparty or more widely, is the payer's choice and reveals the payer only to whom the payer chooses.

## Validity rules

### Receipts and claims

1. Receipts and claims on every rail use the formats above. The rail's proof is the only part that differs between rails, in the format the payment cMIP and the rail Module define. A receipt is signed by the receiver of the hop, a claim by the payer; a specification never signs one (F112).
2. A receipt or claim is verified by running the published rule of the rail Module named in its field 0 against the rail's proof. The answer is valid, invalid, pending or unknown, with that Module's hash. Anyone can run the same rule independently.
3. Where a rail cannot give a proof anyone can check, as with card and bank rails, the rail Module's rule MAY rest on a named trusted party's signed confirmation. The verification answer MUST name that party, so everyone sees what the answer rests on.
4. A client MUST NOT treat a receipt or claim as valid unless its verification answer is valid.

### Routes and discharge

5. A route is valid when every receipt in it is valid, each names the previous hop's receipt, and each hop's received amount equals the previous hop's forward.
6. Only conversion hops forward. A conversion hop forwards in the next unit, at the rate its agreement defines.
7. An obligation is discharged when valid routes ending at the creditor's payee pointer, each naming the obligation, sum to the owed amount. Its states are: unsigned (Law: the debtor has not signed the agreement), open, discharged, past its terms, closed by clone, redirected. The last three depend on Law; a client that does not implement Law MUST show them as unknown.
8. Each hop's receipt MUST be disclosed at least to the next payee and to the final creditor, so the creditor can verify the whole route. Everything else may stay private.
8a. **One proof, one payment.** Receipts or claims MAY share a rail proof only if they name the same batch, and their amounts together do not exceed what the proof shows. Otherwise a verifier holding both counts neither until the receiver signs a receipt that resolves them (F65).

### Failure attribution and double entry

9. **A hop that forwarded nothing.** When a receipt declares a forward but no valid receipt from the next payee names it, the route stops at that hop. The forward stays an open obligation of that hop, under the agreement named in the forward.
10. **Double entry.** A payment claim is admitted as evidence on equal footing with a receipt. A payer MAY publish one at any time. Where a claim and a receipt name the same rail proof and disagree in amount, payee, or what the payment fulfils, the disagreement is shown as an open question on the receiver, and the greater amount counts as received until the receiver signs a receipt matching the proof. Where a payer holds a valid rail proof and the payee has signed no receipt, the claim alone shows the money arrived (F64).
10a. **Refunds claimable by proof.** A refund owed on a payment whose payer is not named is owed to whoever presents the rail proof of that payment, by a claim naming where to be paid (key 7). Only the payer holds that proof. The obligation stays open and visible until claimed and discharged (F80). Whether an unclaimed refund ever lapses is for the offer's terms (Law); the core sets no lapse.
10b. **Referrals.** A referral counts as evidence for a role share (Law) only when it is signed by the payer, in a claim; a referral the receiver or its split service names on its own earns nothing (F75).
11. In every case, the receipts and claims name the exact hop and agreement that failed. What follows (refund, penalty, contest) is Law's business.

### Payee pointers and the vault

12. The payee pointer that counts is the latest of an unbroken, unforked chain. Two pointers naming the same predecessor are contested: clients use the last pointer before the fork and warn the owner (F31).
13. A flow pointer is changed with the signing key. The vault is changed only in genesis or a rotation.
14. A payment to an identity's flow pointer counts only for obligations and acts that name that flow pointer's version or a later one. Anything that arose under an earlier flow pointer counts only if paid to the vault. The version an obligation names MUST be one that counted when the obligation's agreement act was made; a Law client checks that (F66).
14a. **Vault limits, per unit, fail closed.** An identity that declares no vault has no vault rule: every payment goes to its flow, and the owner has chosen no protection. Where a vault is declared: a single payment in a unit counts as paid to the flow only if the vault has an entry for that unit and the payment is no larger than that entry's limit; above the limit it MUST be paid to the vault, under any entry of that unit; a limit of zero means every payment in that unit goes to the vault. A payment in a unit for which the declared vault has no entry MUST NOT be paid to the flow: it is undeliverable until the owner adds an entry by rotation, and stays an open obligation (rule 16). The vault is public, so a payer's client MUST check it and pay where the rules say (F67, F79). *Fail closed is the safe side: a thief with the everyday key cannot open a unit the vault does not cover. Confirmed as drafted (Nobody, allegedly, 2 October 2026): a missed payment is acceptable as long as the debt can be honoured later; it stays open and is paid once the unit is added (rule 16).*
14b. **The owner is informed** (F111). *Client conformance: whether a notice arrived can never be checked, so these are not validity rules; the inbox already carries them.*
    - **Before signing.** The owner's client SHOULD warn before the owner publishes a standing offer, or signs terms, priced in a unit the owner's declared vault does not cover: nobody could pay it.
    - **Debts.** The owner's client SHOULD show an obligation owed to the owner in a unit the vault does not cover as "owed in a unit your vault cannot receive", with the way to add it (a rotation).
    - **Spontaneous payers.** A payer's wallet that refuses a payment under rule 14a, or finds nowhere to pay under rule 16, SHOULD send the payee an ordinary message to its inbox route (Identity; Envelope, "How acts reach people"), saying what it tried to pay, in which unit, for what, and why it could not. The message is a text act like any other: it creates no obligation and no act type.

### Good faith

15. A receipt or payment claim names the payee-pointer act it followed, directly or through the obligation or agreement. A payment that followed both the published pointer and the published vault counts as made, even if a later rotation invalidates that pointer. The loss from a theft window falls on the owner, never on a payer who followed the published rules. A payment that did not follow them (for example, paid to the flow above the limit) is not protected.

### Undeliverable payments

16. When a receiver has no payee pointer, or no rail the payer shares, or the vault rules leave nowhere to pay, the obligation stays open: a visible debt owed to that hash until it can be paid. Conversion services may bridge rails. How long an obligation stays open, and whether it is redirected, is for the agreement to define (Law).

### Receivers and senders

17. A receiver's identity is always public. The visibility of its incoming flows is its choice, from counterparties only (the default) to fully public; public views SHOULD aggregate.
18. The core never requires a sender's identity. A receipt's payer field MAY be absent; delivery then goes to a key the payer supplies (Envelope: a bare device or application key). A payer's claim, when published, is the payer's own choice of disclosure.

### Fees

18a. **Payouts net of fees.** A payout (Law) counts as discharged when its receipt shows the amount minus the rail fee the split plan says the receiver bears, and no more than the maximum fee the plan states per payout; a shortfall beyond that maximum is an open obligation of the split service (F64). Amounts below a rail's minimum are held as open obligations until they can be moved (F50).
19. A plain payment in Finance carries no fees for specifications beyond what the rail itself charges. The creators of cMIPs and Modules earn where there is an agreement (Law).

### Attention

20. MOR only ever sees a payment and, in Law, its split. Tracking plays or views belongs to the cMIPs that choose it.

## Tasks

- **Payment.** One payment cMIP per agreement fills this task (F112). It accepts an obligation, offer or payee pointer, an amount, and the payee's flow pointer or vault entry the payment goes to. It defines how rail Modules plug in under it, one per rail; how a payment on a rail carries what the receipt and claim will say (who is paid, how much, for what, by whom); how a receipt and a claim carry a rail's proof; and how a verifier checks them, by running the named rail Module's rule (valid, invalid, pending, unknown, and the trusted party relied on, if any). Each rail Module defines its rail's address and vault-source formats, how a fresh receiving address is obtained under a vault entry's source, its proof format, and its verification rule. The receiver signs the receipt; the payer signs the claim; the cMIP and its Modules sign nothing.
- **Conversion.** A cMIP defining how a conversion is offered and evidenced: a conversion service, an identity, receives on one rail or unit and pays on the next at the rate of its own offer, and signs a receipt with a forward in the next unit; its onward payment is a hop like any other, under the payment cMIP.

Splits are a Law task. A custodial flow service, which holds an identity's hot pointer and enforces a rate off-protocol, is an identity, a party the owner points the flow at; it may run any Module it likes, and it is not one.

## Reasoning

- **Finance ends at the payee pointer.** *A payment goes to the pointer set by the owners of what is paid for. How it is then divided is the owners' agreement, which is Law. That keeps Finance simple enough for any wallet, and keeps every rule about sharing in one place.*
- **One receipt, every rail.** *Rails come and go; the core must outlive them. If every rail speaks the same receipt, a route across Lightning, a stablecoin and a bank transfer reads as one chain. Only the rail's proof differs.*
- **Rails are Modules under one payment cMIP (F112).** *An agreement names one cMIP per task; if each rail were a cMIP, every agreement would be confined to one rail. So the payment cMIP is the common language of an agreement's payments, and the rails plug in beneath it, as many as the parties use. A text cannot sign: receipts are signed by the people who received, claims by the people who paid. Services that convert or hold money are parties with their own offers, not specifications.*
- **The owner is told what the vault refuses (F111).** *Fail closed protects the owner from a thief, at the cost of payments that cannot arrive. A failed payment leaves no act behind, so nothing can make its absence a rule; the owner's own client and the payer's wallet tell the owner instead, through the inbox that already exists.*
- **Honest about fiat.** *Card and bank rails cannot give proofs anyone can check. Naming the trusted party in the verification answer keeps that visible instead of pretending otherwise.*
- **Double entry.** *The receiver signs the receipt, and the receiver is the party that benefits from silence. A payer's claim is the other half of the ledger: private by default, published by choice, and admitted as equal evidence. A mismatch between the two is itself the alarm. The measured promise is this: hiding income requires the payer's silence or collusion. Nothing more can be promised by a protocol that cannot see payments made outside it, and payer-side splitting cMIPs, where each owner is paid directly, are the models that need no service's honesty.*
- **Chained hops name where things break.** *When a route breaks, the last valid receipt and the missing next one point at exactly one hop and one agreement. Finance says where; Law says what follows.*
- **The vault is a grammar for safer pointers.** *The flow is easy to change and easy to steal; the vault is where a thief with the phone cannot point payments. Three ways a thief takes money through the flow: the backlog, closed because an obligation names the flow version in force when it arose and only the debtor signs one; the large payment, closed by a per-unit limit; and the stream between theft and rotation, which no clockless rule can cap. So the core gives the two ends of the range, per-payment limits and flow off, and leaves the middle to services that hold the hot pointer and enforce a rate for owners who need one. Detection is shortened by the payer's claim and the inbox: the owner's client sees money land where it did not point.*
- **Per unit, fail closed.** *A limit in one unit cannot be compared with a payment in another, and a thief with the everyday key chooses the unit. So every unit has its own limit, and a unit with none goes to the vault.*
- **One name per unit.** *A satoshi is a satoshi on every rail that carries it, Lightning or on-chain. Naming units by their own small specification stops every hop between two rail Modules from looking like a conversion. A test network's coin is a unit of its own: a regtest satoshi is not a satoshi.*
- **Good faith protects payers.** *A payer who followed the published pointer and vault did everything right. Theft is the owner's risk, and protection against it is a market.*
- **Private by default.** *Receipts and claims are acts like any other, locked (F29), and disclosed only as far as the route, or the payer's choice, requires.*
- **Payments, not attention.** *Rewards attach to settlements, never to attention: MOR's iron law.*

## Open technical parameters

- The unit specification format.
- How a payment on a rail carries the id of the obligation, agreement or payee-pointer act it follows. *Proposed in the payment cMIP draft 1: a payment commitment, one hash over the payee, payer, amount, what it fulfils and where it was paid, which each rail Module carries on its rail (for Lightning, as the invoice's description hash, signed by the payee's node). To be confirmed.*
- Rail proof formats, and vault source formats: defined by each rail Module.
- Two flaws found while building the Lightning rail, awaiting decision (`docs/lightning-rail-step-12.md`): **L1**, rule 10a's "only the payer holds that proof" does not hold on Lightning, where the payee and every node on the route learn the preimage; **L2**, rule 14a does not say which limit applies when several entries of one unit carry different limits.
- How an agreement, or its payment cMIP, says which rail Modules count for it, so that a collective's lanes (Law, F106, Q16) and two clients agree on a receipt naming a rail Module (F112). *Open; options in the step 12 report.*

## Freeze scenarios

- Obligation signed by the debtor, and discharge, unit-agnostic, possibly by several routes: 1, 4.
- Verification answers, including a trusted party named for a fiat rail: 1, 2.
- Receiver visibility dial; sender never required; a payer's claim published by choice: 2, 5.
- Payment for a publication to the identity in `for`; a Finance-only wallet and a full client pay the same identity; the wallet checks the vault: 2, 3.
- Flow and vault; a thief changing the flow pointer cannot collect obligations that name an earlier version, nor re-issue them; a unit switch goes to the vault; a dead vault rail is covered by another; flow off: 1, 5.
- Good-faith payment to an invalidated pointer counts as made; a payment that ignored the vault is not protected: 1.
- Undeliverable payment kept as an open obligation; refund to an anonymous payer claimable by proof: 2, 5.
- A payment refused under rule 14a or 16: the payer's wallet sends the payee an ordinary inbox message; the debt stays open (F111): 5.
- A cross-rail route through a conversion service, read as one chain of receipts; one hop fails to forward, and the receipts name that hop and its agreement: 2.
- Double entry: a receiver under-reports, the payer's claim exposes the gap, the greater amount counts; a payout arrives short of the plan's maximum fee: 2.
- One proof claimed against two obligations counts for neither; one batched payout proof covers several payouts: 2, 7.
- A referral signed by the payer earns a role share; one named by the service alone earns nothing: 2.
- Moved to Law: conservation and remainder rule; module fees and omitted fees; splits by attention metrics.
