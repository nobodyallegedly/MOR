# Module: Lightning rail

*Draft 2, 3 October 2026 (the core pass, core v21). *Revised in place, 10 October 2026, for F200: "the same payment" on this rail is the payment hash (`docs/onchain-rail-f200-f205-build-2026-10-10.md`).* **EXPERIMENTAL. Not approved, not a product, not for real money.** An instrument for throwing real use at the Finance MIP (build brief, 2 October 2026; F117: "I'm fine with presenting experimental stuff with plenty of disclaimers"). Its costs are stated below, under "Costs, stated", and a client using it MUST show them before the owner declares a Lightning rail. Draft 1 (2 October 2026, roadmap step 12) with questions a and b confirmed as built (F117), the anonymous payer's key (F113) and the costs written in. A rail Module under the payment cMIP draft 2 (`cmips/cmip-payment-draft-2.md`), which its field 5 names. Its hash stays a draft hash until its creator is named at step 17; until then it is named by a test value. Written against the Finance MIP draft 6, the Production MIP draft 6, the payment cMIP draft 2, BOLT 11 (Lightning invoices) and findings F1 to F117. Not core: frozen at publication, competing with any other Lightning rail Module.* *Revised in place, 4 October 2026, for F128 (Law draft 10, `docs/law-draft-10.md`, section 11): **this Module is a request rail** (W4): the payee's node issues each invoice, committing, through the description hash, to the whole payment commitment, the claim a purchase names among it; so the claim a purchase names on this rail is the one the seller's request committed to (Law rule 32a). No rule of the Module changes.*

*Reading this document: normal text is the specification. Italic text is commentary, reasoning and examples.*

## In plain words

*On Lightning, the payee's node issues an invoice: a short text, signed with the node's key, saying how much to pay and carrying the fingerprint (the payment hash) of a secret the node keeps. Paying the invoice reveals the secret (the preimage) to the payer. Holding the signed invoice and its secret is the proof that it was paid.*

*Two things tie that proof to MOR. The payee's own payee pointer, signed with its MOR key, names the node: so an invoice signed by any other node is not the payee's. And the invoice's description hash is the payment commitment of the payment cMIP: so the payee's node has signed exactly who pays, how much, and for what. A payer cannot forge the node's signature; a payee cannot take back the secret once paid.*

## The rail

**Units.** This Module carries one unit per network, each a unit specification of its own (`modules/units-bitcoin-draft-1.md`): the satoshi on Bitcoin, and the satoshi of each test network (testnet, signet, regtest), which are not satoshis. An amount's value counts whole satoshis: an invoice for a fraction of a satoshi cannot be a MOR payment.

**Rail address and vault source.** Both are, encoded in deterministic CBOR:

```cddl
ln-address = [
  network: uint,              ; 0 Bitcoin, 1 testnet, 2 signet, 3 regtest
  node: bstr .size 33,        ; the compressed secp256k1 key of the node that issues the payee's invoices
  ? endpoint: tstr            ; where the payee answers invoice requests: a hint, never load-bearing
]
```

The address carries the unit of its network. *In a payee pointer it names the payee's flow node; in a vault entry, the vault's node, which should be a different node from the flow's, since the vault is only as safe as the key of the node it names.*

**A fresh receiving address** is an invoice issued by the node the address or source names, with a payment hash never used before. *Nothing is derived offline: a payer asks the payee's side for each invoice, and checks it against the node key the payee signed (question b of the step 12 report).*

**Invoice requests.** The payer sends the payee's endpoint the commitment's fields (payment cMIP), and receives an invoice. The way it is asked does not matter: the invoice proves itself. *In the reference implementation the request is a direct call; an HTTP or inbox form is for a later draft.*

## Carrying the commitment

**A request rail** (payment cMIP, F128 W4). Every payment on this Module is made against an invoice the payee's side issued for it, committing to the payment commitment, the purchase's claim included. *So a buyer on Lightning pays the version of a work's claim the seller's side committed to: the seller cannot be paid under a version it has left unless its own node issued the invoice for it, and a split service whose grant has ended issues none (client conformance).*

The invoice's description hash (BOLT 11 field `h`) is the payment commitment hash. The invoice MUST carry `h`, MUST NOT carry a plain description (field `d`), and MUST carry an amount, equal to the amount's value in satoshis times 1,000 millisatoshis.

## The rail proof

```cddl
ln-proof = [ invoice: tstr, ? preimage: bstr .size 32 ]   ; a BOLT 11 invoice, lower case, and the preimage of its payment hash
```

**The same payment** (payment cMIP, item 6; F200): the invoice's payment hash, once the proof carries its preimage; a proof without a preimage shows no payment yet. *One payment hash is settled once, so two proofs with the same hash (another invoice for it, another encoding) are one payment.*

## The verification rule

Given the commitment hash, the amount, the address or source the payee signed, and the rail proof, the rule answers, in this order:

1. **Invalid** if the address is not an `ln-address`, or the rail proof not an `ln-proof`.
2. **Invalid** if the invoice is not a valid BOLT 11 invoice: its bech32 checksum, its prefix (`lnbc`, `lntb`, `lntbs`, `lnbcrt`), its amount, its fields (exactly one payment hash), and its signature, from which the signing node key is recovered; where the invoice carries a node field (`n`), it must be that key.
3. **Invalid** if the invoice's network is not the address's, or the amount's unit is not the unit of the address's network.
4. **Invalid** if the key that signed the invoice is not the address's node key.
5. **Invalid** if the invoice carries a plain description, or its description hash is not the commitment hash.
6. **Invalid** if the invoice's amount is not the amount's value times 1,000 millisatoshis.
7. **Unknown** if the invoice requires a feature (an even feature bit) other than var_onion_optin (8), payment_secret (14), basic_mpp (16) and option_payment_metadata (48).
8. **Pending** if the proof carries no preimage: the payment is not shown complete.
9. **Invalid** if the SHA-256 of the preimage is not the invoice's payment hash.
10. **Valid** otherwise. No trusted party is relied on.

*The invoice's expiry is not read: the core has no clock. A claim without a preimage therefore stays pending; it is the payer who holds the completing proof and chooses to show it.*

*Keysend and AMP payments, whose secret the payer chooses, prove nothing: a payer holds their "proof" without paying. They are not MOR payments under this Module.*

## What a verifier ties together (pattern 1)

- **The payee alone** can sign a receipt (it is its own admission), but not the payer's claim. *Its receipt naming a payer proves only what the payee says; the claim is the payer's.*
- **The payer alone** cannot produce a valid proof: the invoice must be signed by the node the payee's pointer or vault names, and the preimage is learned only by paying it.
- **A node on the route** learns the preimage as the payment settles, and could present the proof; it cannot claim to be the payer, because the commitment names the payer, and a claim's signer must be that payer. *For an anonymous payment the commitment names the payer's bare key, and only a signature with that key claims it or its refund (Finance rule 10a, F113); a payment that committed no key can be refunded to nobody.*
- **A thief with the payee's everyday key** can point the flow at its own node (the theft window, Finance rule 15), but not the vault, which the safety key alone changes.

*The binding of node to identity is only as strong as the payee pointer that names it: an invoice proves payment to whoever controls the node, and the payee's signed pointer says that is the payee.*

## Costs, stated (F117)

*A client MUST show these before an owner declares a Lightning rail in a pointer or vault.*

- **A public node exposes its owner.** Naming the node in a payee pointer links the MOR identity to it publicly: its channels and the on-chain coins behind them are visible, its network address may be, and identities that share a node are linked by it. It is also a visible target.
- **A Lightning vault guards against one thief, not another.** It stops a thief holding the everyday MOR key, who cannot change the vault's node; it does not stop someone who takes the node, which must stay online to issue invoices. The vault's node should be a different node from the flow's.
- **Mitigations are the payee's choice:** an unannounced node, one node per identity, a hosted node, Tor.
- **Set aside:** a Lightning Address (name@domain), whose invoices a later verifier cannot tie to the payee. **Later:** a BOLT 12 offer (a reusable, checkable address that hides the node), as a second rail Module under the same payment cMIP, once lnd supports it; it would also exercise a payee choosing between rails (F115).
- **Other stated costs:** a claim without its preimage stays pending forever (no clock, no expiry); an invoice for a fraction of a satoshi cannot be a MOR payment; keysend and AMP payments prove nothing.

## Reference implementation

`modules/lightning` (crate `mor-lightning`): the BOLT 11 decoder, written from BOLT 11 and checked against a second, independent decoder (`lightning-invoice`) and against lnd's; the rule; and, under the feature `lnd`, a client for an lnd node, with which the end-to-end test pays on regtest (`harness/tests/lightning_rail.rs`, `modules/lightning/regtest/up.sh`). Regtest and signet only before step 17: no real money.

## Open

- **Its RV32IM program** (Production rule 12): secp256k1 key recovery and SHA-256 within a step budget, once the profile is published.
- **Invoice requests** over HTTP or the inbox, with a published form.
- **BOLT 12 offers**, whose invoices may be signed by keys derived per offer: a later Module, or a later draft, if lnd or the payer's node supports them.
- **Multi-path and overpayment.** A payer may pay up to twice an invoice's amount on Lightning; the proof shows the invoice's amount only, and only that counts.

## Freeze scenarios

As the payment cMIP's, on Lightning.
