# MIP: Finance

*Draft 5, 27 September 2026. Written against core v12, Identity MIP draft 7, Envelope MIP draft 4, Text MIP draft 5 and findings F1 to F82. Draft 5 applies review round 2: double entry (a payer's claim is evidence on equal footing with a receipt); one rail proof per batch; obligations signed by the debtor; the vault as per-unit, per-rail entries with derived addresses and flow off; payment for a publication to the identity it is made for; refunds claimable by proof; referral evidence signed by the payer.*

*Reading this document: normal text is the protocol itself. Italic text is commentary, reasoning and examples.*

## Purpose

Finance defines how a simple payment moves through MOR: never the rails themselves, and nothing about who owns what. A payer pays a payee pointer; Finance's job ends when the money reaches it. How the money is then divided among owners is defined by their agreement, in Law.

Finance defines what a settlement means to the protocol, whatever rail it happened on. Every rail module, whether Lightning, stablecoin or fiat, emits the same settlement receipt. When payer and payee use different rails, a conversion service carries the money in between, and the payment reads as one verifiable chain of receipts. If a route breaks, the receipts show exactly which hop and which agreement failed. And because every payment can be recorded from both ends, a receiver cannot make money invisible by staying silent.

It also gives every client a shared language for:

- who owes whom, how much, in what unit (obligations);
- where payment to an identity (a person, an organisation or a collective) goes (payee pointers), with a flow that is easy to change and a vault that is not.

A payment to a work or a person, such as a tip, needs only this MIP and the payee pointer.

## Dependencies

Identity, Envelope and Text. Finance never depends on Law or Production: a Finance-only client, such as a wallet that sends tips, is a complete client. Where a Finance state depends on Law, a Finance-only client shows it as unknown (F32).

## Definitions

- **Rail.** A payment system outside MOR (Lightning, on-chain Bitcoin, ecash, stablecoins, cards, bank transfers), used through a payment module.
- **Unit.** What an amount is counted in, in its smallest indivisible part. A unit is a small specification of its own, which payment modules reference, so the same unit has one name on every rail that carries it.
- **Obligation.** A signed statement by a debtor that it owes a creditor an amount, in a unit.
- **Hop.** One movement of money on one rail, from one party to the next.
- **Settlement receipt.** The common proof of one hop, signed by its receiver, the same for every rail: who paid whom, how much, in what unit, under which agreement.
- **Payment claim.** A payer's record of a payment, carrying the rail's proof. Evidence on equal footing with a receipt.
- **Route.** One simple payment carried in several hops, across rails or units, through conversion services. Each receipt names the previous one.
- **Discharge.** A complete route, or several, that bring the owed amount to the creditor's payee pointer.
- **Verification answer.** The result of checking a receipt or claim against its rail: valid, invalid, pending or unknown, with the hash of the module that computed it, and the trusted party it relied on, if any.
- **Payee pointer.** Where payment to an identity goes: one or more rails in order of preference.
- **Flow pointer.** An identity's payee pointer for ordinary incoming payments, changed with the signing key.
- **Vault.** An identity's declared set of safer receiving entries, per unit and per rail, changed only with the safety key. The vault is the grammar for setting up safer pointers, if the owner wishes to.
- **Batch.** A set of payouts a split service pays with one rail payment, as its grant allows (Law).

## Act formats

All acts are Envelope MIP acts. Payee pointers are public; obligations, receipts and payment claims are private by default, visible to their parties.

```cddl
amount = [ unit: hash, value: uint ]      ; unit: the unit's specification; value in its smallest part
rail   = [ module: hash, address: bstr ]  ; a payment module and the rail-specific address data
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
; source: what the rail module needs to derive a receiving address (a descriptor, an extended key, or a fixed address for rails without derivation)
; limit: the largest single payment in this unit that may go to the flow; 0 means flow off for this unit
```

Several entries may share a unit, on different rails, so a dead rail does not make the vault unreachable until the next rotation. A rail module derives a fresh receiving address from the source for each payment where the rail allows it, so a vault never reuses an address by protocol design. *The core does not know what a source is; the rail module does.* A null value for kind 0 removes the vault (Identity).

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
  0 => hash,               ; rail: the payment module that carried this hop
  1 => bstr,               ; the rail's proof, as that module defines it
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
  0 => hash,               ; rail: the payment module used
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

1. Every rail module MUST emit receipts in the format above. The rail's proof is the only part that differs between rails.
2. A receipt or claim is verified by running the published rule of its rail module against the rail's proof. The answer is valid, invalid, pending or unknown, with that module's hash. Anyone can run the same rule independently.
3. Where a rail cannot give a proof anyone can check, as with card and bank rails, the module's rule MAY rest on a named trusted party's signed confirmation. The verification answer MUST name that party, so everyone sees what the answer rests on.
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
14a. **Vault limits, per unit, fail closed.** An identity that declares no vault has no vault rule: every payment goes to its flow, and the owner has chosen no protection. Where a vault is declared: a single payment in a unit counts as paid to the flow only if the vault has an entry for that unit and the payment is no larger than that entry's limit; above the limit it MUST be paid to the vault, under any entry of that unit; a limit of zero means every payment in that unit goes to the vault. A payment in a unit for which the declared vault has no entry MUST NOT be paid to the flow: it is undeliverable until the owner adds an entry by rotation, and stays an open obligation (rule 16). The vault is public, so a payer's client MUST check it and pay where the rules say (F67, F79). *Fail closed is the safe side: a thief with the everyday key cannot open a unit the vault does not cover.*

### Good faith

15. A receipt or payment claim names the payee-pointer act it followed, directly or through the obligation or agreement. A payment that followed both the published pointer and the published vault counts as made, even if a later rotation invalidates that pointer. The loss from a theft window falls on the owner, never on a payer who followed the published rules. A payment that did not follow them (for example, paid to the flow above the limit) is not protected.

### Undeliverable payments

16. When a receiver has no payee pointer, or no rail the payer shares, or the vault rules leave nowhere to pay, the obligation stays open: a visible debt owed to that hash until it can be paid. Conversion services may bridge rails. How long an obligation stays open, and whether it is redirected, is for the agreement to define (Law).

### Receivers and senders

17. A receiver's identity is always public. The visibility of its incoming flows is its choice, from counterparties only (the default) to fully public; public views SHOULD aggregate.
18. The core never requires a sender's identity. A receipt's payer field MAY be absent; delivery then goes to a key the payer supplies (Envelope: a bare device or application key). A payer's claim, when published, is the payer's own choice of disclosure.

### Fees

18a. **Payouts net of fees.** A payout (Law) counts as discharged when its receipt shows the amount minus the rail fee the split plan says the receiver bears, and no more than the maximum fee the plan states per payout; a shortfall beyond that maximum is an open obligation of the split service (F64). Amounts below a rail's minimum are held as open obligations until they can be moved (F50).
19. A plain payment in Finance carries no module fees beyond what the rail itself charges. Modules earn where there is an agreement (Law).

### Attention

20. MOR only ever sees a payment and, in Law, its split. Tracking plays or views belongs to the cMIPs that choose it.

## Tasks

- **Payment (per rail).** A cMIP accepts an obligation, offer or payee pointer and an amount, carries the hop on its rail, and produces a settlement receipt in the common format, with its rail's proof and a published rule that verifies it (valid, invalid, pending, unknown, and the trusted party relied on, if any). For a vault entry, it derives a receiving address from the entry's source.
- **Conversion.** A payment cMIP that receives on one rail and forwards on another, at the rate its agreement defines, producing a receipt with a forward in the next unit.

Splits are a Law task. A custodial flow service that holds an identity's hot pointer and enforces a rate off-protocol is a Module, and the owner points the flow at it.

## Reasoning

- **Finance ends at the payee pointer.** *A payment goes to the pointer set by the owners of what is paid for. How it is then divided is the owners' agreement, which is Law. That keeps Finance simple enough for any wallet, and keeps every rule about sharing in one place.*
- **One receipt, every rail.** *Rails come and go; the core must outlive them. If every rail module speaks the same receipt, a route across Lightning, a stablecoin and a bank transfer reads as one chain. Only the rail's proof differs.*
- **Honest about fiat.** *Card and bank rails cannot give proofs anyone can check. Naming the trusted party in the verification answer keeps that visible instead of pretending otherwise.*
- **Double entry.** *The receiver signs the receipt, and the receiver is the party that benefits from silence. A payer's claim is the other half of the ledger: private by default, published by choice, and admitted as equal evidence. A mismatch between the two is itself the alarm. The measured promise is this: hiding income requires the payer's silence or collusion. Nothing more can be promised by a protocol that cannot see payments made outside it, and payer-side splitting cMIPs, where each owner is paid directly, are the models that need no service's honesty.*
- **Chained hops name where things break.** *When a route breaks, the last valid receipt and the missing next one point at exactly one hop and one agreement. Finance says where; Law says what follows.*
- **The vault is a grammar for safer pointers.** *The flow is easy to change and easy to steal; the vault is where a thief with the phone cannot point payments. Three ways a thief takes money through the flow: the backlog, closed because an obligation names the flow version in force when it arose and only the debtor signs one; the large payment, closed by a per-unit limit; and the stream between theft and rotation, which no clockless rule can cap. So the core gives the two ends of the range, per-payment limits and flow off, and leaves the middle to services that hold the hot pointer and enforce a rate for owners who need one. Detection is shortened by the payer's claim and the inbox: the owner's client sees money land where it did not point.*
- **Per unit, fail closed.** *A limit in one unit cannot be compared with a payment in another, and a thief with the everyday key chooses the unit. So every unit has its own limit, and a unit with none goes to the vault.*
- **One name per unit.** *A satoshi is a satoshi on every Lightning module. Naming units by their own small specification stops every hop between two modules from looking like a conversion.*
- **Good faith protects payers.** *A payer who followed the published pointer and vault did everything right. Theft is the owner's risk, and protection against it is a market.*
- **Private by default.** *Receipts and claims are acts like any other, locked (F29), and disclosed only as far as the route, or the payer's choice, requires.*
- **Payments, not attention.** *Rewards attach to settlements, never to attention: MOR's iron law.*

## Open technical parameters

- The unit specification format.
- How a payment on a rail carries the id of the obligation, agreement or payee-pointer act it follows (for Lightning, the invoice description or payment metadata), to be confirmed for each founding rail module.
- Rail proof formats, and vault source formats: defined by each payment module.

## Freeze scenarios

- Obligation signed by the debtor, and discharge, unit-agnostic, possibly by several routes: 1, 4.
- Verification answers, including a trusted party named for a fiat rail: 1, 2.
- Receiver visibility dial; sender never required; a payer's claim published by choice: 2, 5.
- Payment for a publication to the identity in `for`; a Finance-only wallet and a full client pay the same identity; the wallet checks the vault: 2, 3.
- Flow and vault; a thief changing the flow pointer cannot collect obligations that name an earlier version, nor re-issue them; a unit switch goes to the vault; a dead vault rail is covered by another; flow off: 1, 5.
- Good-faith payment to an invalidated pointer counts as made; a payment that ignored the vault is not protected: 1.
- Undeliverable payment kept as an open obligation; refund to an anonymous payer claimable by proof: 2, 5.
- A cross-rail route through a conversion service, read as one chain of receipts; one hop fails to forward, and the receipts name that hop and its agreement: 2.
- Double entry: a receiver under-reports, the payer's claim exposes the gap, the greater amount counts; a payout arrives short of the plan's maximum fee: 2.
- One proof claimed against two obligations counts for neither; one batched payout proof covers several payouts: 2, 7.
- A referral signed by the payer earns a role share; one named by the service alone earns nothing: 2.
- Moved to Law: conservation and remainder rule; module fees and omitted fees; splits by attention metrics.
