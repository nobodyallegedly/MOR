# cMIP: Payment

*Draft 2, 3 October 2026 (the core pass, core v21). **Experimental, not approved:** an instrument for testing the Finance MIP, not a product (build brief, 2 October 2026). Draft 1 (2 October 2026, roadmap step 12) with the answers to flaws L1 and L4 and question c written in, as far as testing the core needs: an anonymous payer's commitment names a bare key of its own, and a refund goes to whoever signs with it (F113); a receipt or claim counts only on a rail Module the payee's pointer or vault names, and, under an agreement, one implementing this cMIP (F115). *Revised in place, 4 October 2026, for F126:* a purchase carries the claim it pays under in the commitment, as an optional eighth element, so the rail binds it too; a payment that is no purchase commits to exactly what it did before. Its hash stays a draft hash until its creator is named at step 17; until then it is named by a test value. Written against core v21, the Identity MIP draft 11, the Envelope MIP draft 7, the Text MIP draft 6, the Finance MIP draft 6, the Law MIP draft 9, the Production MIP draft 6 and findings F1 to F117. Not core: a founding cMIP, frozen at publication, competing with any other payment cMIP.*

*Reading this document: normal text is the specification. Italic text is commentary, reasoning and examples.*

## In plain words

*When one identity pays another, two records are signed: the payee's receipt ("I received this") and the payer's claim ("I paid this"). Both carry the same proof from the payment system that moved the money, the rail. This cMIP is the common language for that proof. It does not move money, and it signs nothing.*

*Its central idea is the payment commitment: before money moves, the payee's side commits, on the rail itself, to one fingerprint of what the payment is: who is paid, by whom, how much, in what unit, for what, and where. On Lightning the payee's node signs that fingerprint inside the invoice. Afterwards, anyone holding the receipt or the claim recomputes the fingerprint from what the act says, and the rail's own rule checks that the rail carried exactly that payment. The payer cannot invent it, because only the payee's declared node can sign the invoice; the payee cannot deny it, because the payer holds the proof that the invoice was paid.*

*Each rail (Lightning, on-chain bitcoin, and others later) is a rail Module under this cMIP: it says how its addresses look, what its proof is, and how the proof is checked.*

## Purpose

This cMIP fills the Finance MIP's task 6, payment (Production, task table; Finance, "Tasks", F112). It defines:

- how rail Modules plug in under it;
- the payment commitment, by which a payment on a rail carries what the receipt and claim say, including the id of the obligation, agreement, offer or payee-pointer act it follows (Finance, open parameter);
- the proof a receipt or claim carries in its field 1;
- how a receipt or claim is verified;
- how a payer chooses where to pay, and what it does when it cannot (Finance rules 14a, 14b and 16).

An agreement names it for task 6 (Law, terms field 2). A payment that follows only a payee pointer, under no agreement, may use it too.

## Dependencies

Identity, Envelope, Text and Finance.

## Rail Modules

A rail Module is a specification of kind 1 (Module) whose field 5 ("implements") names this cMIP, and whose field 6 names its verification rule. Its text MUST define:

1. **Its rail address**: the bytes of a payee pointer's `rail` entry `address` for this Module, and the unit each address carries.
2. **Its vault source**: the bytes of a vault entry's `source`, and how a fresh receiving address is obtained under it for each payment (derived from it, or issued by a node it names).
3. **How it carries the commitment**: where, on its rail, the payment commitment (below) is bound to the payment by the payee's side, so that the rail's proof shows it.
4. **Its rail proof**: the bytes of `rail-proof` (below).
5. **Its verification rule**: given the commitment, the amount, the address or source the payee signed, and the rail proof, it answers valid, invalid, pending or unknown, and names the trusted party it relied on, if any (Finance rules 2 and 3).

A rail Module signs nothing, holds no key and moves no money: the payee's software issues what the rail needs, the payee signs the receipt and the payer signs the claim (F112).

## The payment commitment

```cddl
commitment = [
  rail: hash,              ; the rail Module
  payee: hash,             ; the identity paid
  amount,                  ; Finance's amount: unit and value
  fulfils: hash,           ; the obligation, agreement, offer or payee-pointer act the payment follows
  payer: hash / signing-key / null,  ; the payer's identity; an anonymous payer's bare key (Finance, F113); or null
  paid-to,
  salt: bstr .size 16,     ; chosen by the payer, fresh for each payment
  ? purchase               ; a purchase only: the claim it pays under, Finance's `purchase` (F126)
]

paid-to = [ 0, pointer: hash, rail: uint ]       ; the payee's flow pointer act, and the index of its rail
        / [ 1, declared-by: hash, entry: uint ]  ; the genesis or rotation declaring the payee's vault in force, and the index of its entry
```

The commitment hash is `tagged_hash("MOR/cmip/payment/commitment", commitment)`, over the commitment encoded in deterministic CBOR.

1. **Before paying**, the payer computes the commitment and asks the payee's side for a receiving address committing to it, as the rail Module defines. The payee's side MUST issue one only for a commitment naming the payee, and a `paid-to` that is the payee's own pointer or vault, with the address or source that `paid-to` names.
2. **The payer checks** the address against the payee's own pointer or vault before paying: a conforming wallet runs the rail Module's rule on it, without the completing part of the proof, and pays only on the answer the rule gives an unpaid payment (pending, for Lightning).
3. **The salt** keeps the commitment from being guessed by anyone who sees the rail: on Lightning, the invoice is visible to every node on its route.
4. **A purchase** (F126; Finance rule 10c, Law rule 32a) puts the claim it pays under, the claiming agreement and the line at which the payer's client read it current, as the commitment's last element; the payee's side commits to it like the rest. A payment that is no purchase leaves it out, so its commitment is the seven elements above. *Client conformance:* a split service whose grant has ended issues no receiving address for any commitment (Law rule 32a), and a payee's side issues one for a purchase only naming the claim it serves.
5. **An anonymous payer** who wants a refund to stay claimable puts a fresh bare signing key of its own in `payer` (Finance, F113), and, before paying, recomputes the commitment from what the payee's side signed, so the payee's side cannot swap the key. A payer that commits `null` can never be refunded: nobody can claim for it.

*This answers Finance's open parameter for every rail at once: what the payment follows (`fulfils`) is inside the commitment, which the rail carries; each rail Module says only where.*

## The proof

A receipt's or claim's field 1 holds, encoded in deterministic CBOR:

```cddl
proof = [ paid-to, salt: bstr .size 16, rail-proof: bstr ]
```

`rail-proof` is defined by the rail Module named in field 0. Every other part of the commitment is read from the act itself: field 0 (rail), the payee (receipt 3, claim 2), the amount (receipt 4, claim 3), `fulfils` (receipt 5, claim 4), the purchase where the act names one (receipt 9, claim 9), and the payer: a receipt's field 2 (an identity or a bare key), or null where it is absent; for a claim, the key in its field 8 where present (Finance, F113), otherwise the claim's signer.

## Verifying a receipt or claim

A verifier first checks the act as Finance requires (its signer: the receipt's payee, F112; the claim's payer). Then:

1. **The rail Module.** If the verifier has not adopted the rail Module named in field 0, the answer is unknown (Production rule 9).
2. **The proof** decodes as above, or the answer is invalid.
3. **Where it was paid, and on a rail the payee accepts** (Finance rule 12a, F115). For `[0, pointer, rail]`: the verifier holds that payee-pointer act, valid and signed by the payee, or the answer is unknown; its payee is the act's payee, its rail at that index names this rail Module, and the address carries the amount's unit, or the answer is invalid. For `[1, declared-by, entry]`: the verifier holds that genesis or rotation, counting on the payee's identity chain, declaring a vault, or the answer is unknown; it is the payee's, and the entry at that index names this rail Module and the amount's unit, or the answer is invalid.
4. **The commitment** is recomputed from the act and the proof.
5. **An anonymous claim.** A claim carrying field 8 is checked as Finance requires: the signature verifies under the key it names, over the claim's fields, or the answer is invalid. A claim's signer that is not the committed payer (an identity where the commitment names a key, or a key where it names an identity) recomputes a different commitment, which the rail's rule then refuses: *a routing node that learnt the preimage cannot claim the payment, nor its refund.*
6. **The rule.** The rail Module's rule is run on the commitment hash, the amount, the address or source found in step 3, and the rail proof. Its answer, with the rail Module's hash and the trusted party it relied on, is the verification answer.
7. **Under an agreement** (F115). Where the payment falls under an agreement, the verifier also checks that the rail Module implements this cMIP (its specification's field 5 names this cMIP's hash); a rail Module that does not counts for nothing there, whatever its rule answers. A verifier that does not hold the rail Module's specification answers unknown.

**What verification does not decide.** Whether the payment discharges an obligation (Finance rule 7), and whether it followed the vault (rules 14a and 15), and whether the pointer it was paid to was in force for it (rules 12 and 14), are judged by the verifier from the same acts, beside the answer. A payment to the flow that the vault in force did not allow (rule 14a) can be valid on its rail and still not protected by good faith (rule 15).

## Choosing where to pay

A payer's wallet:

1. reads the payee's payee pointer in force (Finance rule 12) and vault in force;
2. applies Finance rule 14a to the amount: to the flow, to the vault (under any entry of the unit), or nowhere;
3. picks the first rail, of the flow pointer in order of preference or of the vault's entries for the unit, whose rail Module it has adopted and whose address carries the unit;
4. if there is none, or rule 14a leaves nowhere, refuses, and SHOULD send the payee an ordinary text message to its inbox route saying what it tried to pay, in which unit, for what, and why (Finance rule 14b, F111). *For example: "A payment to you was not sent. 539ec793 tried to pay you 500 in unit a652d37a for act 2fb21fe5, and its wallet refused: the payee's vault has no entry for this unit, so it cannot be paid to the flow (Finance rule 14a). The debt stays open (Finance rule 16): it can be paid once you can receive it, for this unit by adding it to your vault in a rotation."*

## Delivery

The payee signs the receipt once the rail shows the payment complete, and delivers it privately to the payer, where the payer is named (Finance rule 8). The payer signs the claim when it chooses to, and delivers it privately to the payee, or to whom it chooses (Finance rule 10). Both are private Finance acts; each travels in a sealed container to the counterparty's inbox route (Envelope, F99).

## Reasoning

- **One commitment, every rail.** *Each rail has its own way to attach data to a payment (an invoice's description hash, an on-chain contract, a bank reference). If each rail attached the receipt's fields its own way, every rail Module would re-invent the binding and get it wrong differently. One hash, carried however the rail allows, keeps the check the same everywhere.*
- **The payee's side commits, the payer's side proves.** *Pattern 1: no record of money should rest on one party's word. The payee's declared node commits before payment; only payment yields the completing proof (a preimage on Lightning). The payer cannot make the commitment; the payee cannot make the payer's claim.*
- **The payer is in the commitment.** *Otherwise anyone who learns the rail proof could claim to have paid. An anonymous payer is in it too, as a key nobody else holds, so a refund cannot be taken by whoever saw the proof (F113).*
- **The payee names its rails.** *A rail Module is chosen by the payee in its own pointer or vault, not by the payer or the agreement: an upgrade to a rail never needs a clone of an agreement (F115).*
- **No act types.** *Receipts and claims are Finance's acts; this cMIP adds nothing a Finance-only client cannot read. A client without it shows a receipt's proof as bytes it cannot check, and its answer as unknown.*

## Open

- **The verification rule's RV32IM program** (Production rule 12): the profile is not yet published, so this cMIP's steps 1 to 4 and each rail Module's rule are given as text and as a reference implementation (`cmips/payment`, `modules/lightning`). Step 15 or 16 compiles them for the profile.
- **Batches** (Finance rule 8a) and **conversion hops** (receipt fields 6 and 7): not yet defined here; a batch's commitment and a forward's binding are for a later draft.

## Freeze scenarios

| Scenario | What it shows | Run or reasoned |
| --- | --- | --- |
| 2.4 | A buyer pays on Lightning; the payee's receipt and the buyer's claim both verify | Run, regtest (`harness/tests/lightning_rail.rs`) |
| 2.4c | A claim and a receipt naming the same proof; a claim altered in amount or purpose no longer matches the commitment | Run, offline (`modules/lightning/tests/rule.rs`) |
| 2.6 | An anonymous payer commits a bare key; its claim signed with the key verifies; a routing node holding the preimage cannot claim the payment or its refund (F113) | Run, offline (`modules/lightning/tests/rule.rs`) |
| 3.7g | A receipt on a rail the payee's pointer never named, or by a rail Module implementing another payment cMIP, counts for nothing (F115) | Run, offline (`modules/lightning/tests/rule.rs`; `core/tests/law_collective.rs`) |
| 5.2 | A payment in a unit the vault does not cover, and one whose vault rail the payer lacks, refused, with the payee told in its inbox | Run, regtest |
| 1.5c | A payment above the vault's limit goes to the vault, under its entry, and verifies there | Run, regtest |
| 2.5 | Two clients run the rail's rule and get the same answer | Reasoned: one implementation so far; the RV32IM profile is open |
