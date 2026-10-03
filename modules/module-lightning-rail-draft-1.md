# Module: Lightning rail

*Draft 1, 2 October 2026 (roadmap step 12). **Not yet approved.** A rail Module under the payment cMIP draft 1 (`cmips/cmip-payment-draft-1.md`), which its field 5 names. Its hash stays a draft hash until its creator is named at step 17; until then it is named by a test value. Written against the Finance MIP draft 6, the Production MIP draft 5, the payment cMIP draft 1, BOLT 11 (Lightning invoices) and findings F1 to F112. Not core: frozen at publication, competing with any other Lightning rail Module.*

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

The invoice's description hash (BOLT 11 field `h`) is the payment commitment hash. The invoice MUST carry `h`, MUST NOT carry a plain description (field `d`), and MUST carry an amount, equal to the amount's value in satoshis times 1,000 millisatoshis.

## The rail proof

```cddl
ln-proof = [ invoice: tstr, ? preimage: bstr .size 32 ]   ; a BOLT 11 invoice, lower case, and the preimage of its payment hash
```

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
- **A node on the route** learns the preimage as the payment settles, and could present the proof; it cannot claim to be the payer, because the commitment names the payer, and a claim's signer must be that payer. *For an anonymous payment the commitment names nobody, and the proof alone does not show who paid: flaw L1 of the step 12 report, unsettled.*
- **A thief with the payee's everyday key** can point the flow at its own node (the theft window, Finance rule 15), but not the vault, which the safety key alone changes.

*The binding of node to identity is only as strong as the payee pointer that names it: an invoice proves payment to whoever controls the node, and the payee's signed pointer says that is the payee.*

## Reference implementation

`modules/lightning` (crate `mor-lightning`): the BOLT 11 decoder, written from BOLT 11 and checked against a second, independent decoder (`lightning-invoice`) and against lnd's; the rule; and, under the feature `lnd`, a client for an lnd node, with which the end-to-end test pays on regtest (`harness/tests/lightning_rail.rs`, `modules/lightning/regtest/up.sh`). Regtest and signet only before step 17: no real money.

## Open

- **Its RV32IM program** (Production rule 12): secp256k1 key recovery and SHA-256 within a step budget, once the profile is published.
- **Invoice requests** over HTTP or the inbox, with a published form.
- **BOLT 12 offers**, whose invoices may be signed by keys derived per offer: a later Module, or a later draft, if lnd or the payer's node supports them.
- **Multi-path and overpayment.** A payer may pay up to twice an invoice's amount on Lightning; the proof shows the invoice's amount only, and only that counts.

## Freeze scenarios

As the payment cMIP's, on Lightning.
