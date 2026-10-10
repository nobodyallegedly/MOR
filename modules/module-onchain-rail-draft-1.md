# Module: On-chain Bitcoin rail

*Draft 1, 9 October 2026 (roadmap step 12a). **EXPERIMENTAL. Not approved, not a product, not for real money.** An instrument for throwing real use at the Finance MIP, as the Lightning rail Module is (F117). Its costs are stated below, under "Costs, stated", and a client using it MUST show them before the owner declares an on-chain rail in a pointer or vault. A rail Module under the payment cMIP draft 2 (`cmips/cmip-payment-draft-2.md`), which its field 5 names. Its hash stays a draft hash until its creator is named at step 17; until then it is named by a test value. Written against the Finance MIP draft 6, the Production MIP draft 6, the payment cMIP draft 2, the Lightning rail Module draft 2, the Bitcoin units draft 1, BIP 340 and BIP 341 (Schnorr signatures and Taproot), and findings F1 to F182. Not core: frozen at publication, competing with any other on-chain rail Module.* *Decided before the build by Nobody, allegedly, 9 October 2026: **a request rail**, the payee's side committing to each payment by **pay-to-contract** (a fresh Taproot address tweaked by the payment commitment), **no OP_RETURN**; and the on-chain vault is an ordinary Bitcoin key (a single key or a multisig) the owner declares, and changes only by a rotation the safety key signs. Bitcoin never verifies MOR's safety key.* *Questions this draft raises for Finance are listed under "Open, for Finance" and in `docs/onchain-rail-step-12a.md`; where Finance is silent, this draft does not choose.*

*Reading this document: normal text is the specification. Italic text is commentary, reasoning and examples.*

## In plain words

*A Bitcoin address is, underneath, a key: whoever can sign for the key can spend what was sent to it. Taproot lets anyone take a key and "tweak" it by a fingerprint: the tweaked key gives a new address that nobody can tell apart from any other, and the owner of the original key can still spend from it, once told the fingerprint. Pay-to-contract is exactly that: the payee's key, tweaked by the payment commitment of the payment cMIP (who pays whom, how much, for what, and where), gives the address for that one payment.*

*So the transaction itself carries the commitment, invisibly: nothing extra is written on the chain, and the address is fresh for every payment, since every commitment carries a fresh salt. Afterwards, anyone holding the receipt or the claim recomputes the commitment, tweaks the payee's declared key by it, and checks that the confirmed transaction paid exactly that address, exactly the amount. A payer cannot relabel a payment afterwards: another label gives another address, which it did not pay.*

*Before the payer pays, the payee's side signs the commitment with a key the payee declared for that purpose, its request key: that signature is the payee's request, which makes this a request rail. The money does not go to the request key: it goes to the payee's own Bitcoin key, tweaked. So the request key can stay online, and a vault's Bitcoin key can stay offline.*

*A Bitcoin payment is not final when it is sent: it is final, in practice, once enough blocks are built on top of the block holding it. The proof therefore carries the block headers on top of it; with fewer than this Module's number, the answer is "pending". What a chain reorganisation does to a payment already counted is a question for Finance, not answered here (below).*

## The rail

**Units.** This Module carries one unit per network, each a unit specification of its own (`modules/units-bitcoin-draft-1.md`), the same units the Lightning rail Module carries: the satoshi on Bitcoin, and the satoshi of each test network (testnet, signet, regtest), which are not satoshis. *One name per unit (Finance): a regtest satoshi on-chain and a regtest satoshi on Lightning are the same unit, so a payee may hold both rails for it, and a vault's several entries for it take the smallest limit (F114).* An amount's value counts whole satoshis.

**Rail address and vault source.** Both are, encoded in deterministic CBOR:

```cddl
onchain-address = [
  network: uint,              ; 0 Bitcoin, 1 testnet, 2 signet, 3 regtest
  key: bstr .size 32,         ; the x-only Taproot internal key the payee's money goes to, before the tweak
  request: bstr .size 32,     ; the x-only key that signs the payee's side's requests (BIP 340)
  ? tree: bstr .size 32,      ; the Merkle root of the owner's own Taproot scripts, for a script multisig
  ? endpoint: tstr            ; where the payee answers address requests: a hint, never load-bearing
]
```

The address carries the unit of its network. `key` is a single key, or a key aggregating several (an n-of-n MuSig2 key, a FROST threshold key): Bitcoin sees one key either way. *For a k-of-n multisig written as a script, `key` is a key nobody holds (a "nothing up my sleeve" point) and `tree` the root of the owner's scripts; the owner spends by the script path.* `request` may equal `key` for a flow; for a vault it SHOULD be a different key, kept online. *In a payee pointer it names the payee's flow; in a vault entry, the vault, declared under the safety key: an ordinary Bitcoin key or multisig, which Bitcoin protects with its own signatures, never with MOR's.*

**A fresh receiving address** is the address of the output key the payment commitment gives (below): fresh for every payment, by protocol design, since every commitment carries a fresh salt (payment cMIP). *Nothing is derived by index, and no address is ever reused. Nobody watching the chain can link two payments to the same payee, or an output to the payee's declared key, without the commitment, which only the payer and the payee hold.*

**Address requests.** The payer sends the payee's endpoint the commitment's fields (payment cMIP), and receives the request signature; the address follows from the commitment. The way it is asked does not matter: the signature proves itself. *In the reference implementation the request is a direct call; an HTTP or inbox form is for a later draft, as for Lightning.*

## Carrying the commitment

**A request rail** (payment cMIP, F128 W4; F140 item 1). Every payment on this Module is made to the address the commitment gives, on a request the payee's side signed for that commitment, the purchase's claim included. *So, as on Lightning, a buyer pays the version of a work's claim the seller's side committed to.* **It binds payee and purpose** (Finance rule 10, F168): the commitment is inside the address, so a claim and a receipt that disagree in payee or in what the payment fulfils cannot both carry the payment's proof. *Format open (F140 item 1): the Production specification format has no field yet for a rail's kind; until it has, a client states it, and this text declares: request rail, binding payee and purpose.*

**The request.** The payee's side signs, with the address's request key, a BIP 340 Schnorr signature over:

```
request-message = tagged_hash("MOR/module/onchain/request", commitment-hash)
```

The payee's side MUST sign only as the payment cMIP says (step 1): a commitment naming the payee, and a `paid-to` that is the payee's own pointer or vault with this address or source.

**Pay-to-contract.** For the commitment hash `c`, the payment's output key is BIP 341's Taproot output key for the internal key `key` and the Merkle root:

```
root = c                                   ; without a tree
root = TapBranch(tree, c)                  ; with a tree: BIP 341's branch hash, the two sorted
t    = TapTweak(key || root)               ; BIP 341's tagged hash; t must be below the curve order
Q    = lift_x(key) + t·G                   ; Q not the point at infinity
```

and the payment's output is a Taproot output (witness version 1) paying the x coordinate of `Q`. Nothing else is written on the chain: **no OP_RETURN**. *To the chain it is an ordinary Taproot output. The owner spends it by the key path with the secret key tweaked by `t` (BIP 341, with `root` as the Merkle root), or by its script path, with `c` as the branch beside its own scripts. Either way the owner needs `c`, which the receipt or the claim gives: the payee's software MUST keep each commitment it signs, or recompute it from the receipt.* *The same tweak serves anchoring (roadmap step 14a), which reuses it with a batch's Merkle root in place of a payment commitment.*

## The rail proof

```cddl
onchain-proof = [
  request: bstr .size 64,          ; the request: the payee's side's BIP 340 signature over the request message
  ? paid: [
    tx: bstr,                      ; the transaction, serialised without its witness (the bytes its txid is the hash of)
    output: uint,                  ; the index of its output paying the commitment's address
    ? block: [
      index: uint,                 ; the transaction's position in the block
      branch: [* bstr .size 32],   ; the Merkle branch from the transaction to the block's root
      headers: [+ bstr .size 80]   ; the block's header, then the headers built on it, in order, at most N
    ]
  ]
]
```

*A payer checks the request before paying with `paid` absent; a payer who has broadcast holds `paid` without `block`; once mined, `block` grows with each header up to N. Hashes are in Bitcoin's own byte order (the order hashed, not the reversed order block explorers show).*

**N, the confirmations a payment needs: 6**, on every network. *A parameter of this Module, not of Finance: another on-chain Module may choose another number. On a test network blocks cost nothing, so six confirmations there prove only that the test ran.*

**One payment, one proof.** For a payment confirmed in a given block, the valid proof is unique: the request signature the payee's side gave, the transaction without its witness, its output, its position, its branch, and exactly N headers. *So the payer's claim and the payee's receipt carry the same bytes, as Finance's rules 8a, 10 and 15 compare them (receipts and claims "naming the same rail proof"). A payment that a reorganisation moves into another block has a second valid proof: see "Open, for Finance".*

## The verification rule

Given the commitment hash, the amount, the address or source the payee signed, and the rail proof, the rule answers, in this order:

1. **Invalid** if the address is not an `onchain-address`, or the rail proof not an `onchain-proof`.
2. **Invalid** if the amount's unit is not the unit of the address's network.
3. **Invalid** if the request signature does not verify, under the address's request key, over the request message for the commitment hash.
4. **Invalid** if `key` is not the x coordinate of a point on the curve, or the tweak fails (`t` not below the curve order, `Q` at infinity).
5. **Pending** if the proof carries no `paid`: the payment is not made. *This is the answer a payer's wallet requires before paying (payment cMIP, step 2).*
6. **Invalid** if `tx` is not exactly one transaction serialised without witness, with no bytes left over, or is 64 bytes long; if it has no output at `output`; if that output does not pay the Taproot output key `Q` (the script `OP_1 <x(Q)>`): **paid to an address not tweaked by this payment's commitment**; or if its value is not the amount's value, in satoshis.
7. **Pending** if the proof carries no `block`: the transaction is not shown confirmed.
8. **Invalid** if the branch, from the transaction's txid at `index`, does not give the first header's Merkle root; if a header does not name the one before it as its previous block; or if a header's hash is above the target its own `bits` state.
9. **Unknown** if a header's target is above this network's floor (below): this rule cannot tell such a header from one made without real work.
10. **Pending** if the proof carries fewer than N headers: the payment is confirmed k times, not N.
11. **Invalid** if it carries more than N headers: one payment has one proof.
12. **Valid** otherwise. No trusted party is relied on.

**The floor** is the easiest target a header may state:

| Network | Floor (`bits`) | What it means |
| --- | --- | --- |
| Bitcoin | `0x170fffff`, a difficulty of about 2^44 | Forging N headers costs at least N × 2^76 hashes: about 0.8 of a block's work in 2026 for N = 6 |
| testnet, signet, regtest | the network's own proof-of-work limit (`0x1d00ffff`, `0x1e0377ae`, `0x207fffff`) | Nothing: anyone can make such headers, as anyone can make such coins |

*The rule runs on nothing but its inputs (Production rule 12): no clock, no network, no node. So it cannot know whether the block the proof names is on the chain everyone else follows today; it knows only that the proof shows a transaction paying the commitment's address, inside a block with N headers of work on top. Signet's blocks are also signed by its operator; a header alone does not show that signature, so the floor is all the rule checks there.*

## What a verifier ties together (pattern 1)

- **The payee alone** can sign a request and a receipt, but cannot make the payer's claim, nor a transaction from the payer's coins.
- **The payer alone** cannot produce a valid proof: the request must be signed by the request key the payee declared, and the transaction must pay the payee's own key tweaked by the commitment; the money goes there, and nowhere the payer can take it back once confirmed.
- **Anyone watching the chain** sees an ordinary Taproot output. Without the commitment, which carries a fresh salt, it cannot link it to the payee, nor recompute the address. *Unlike Lightning's preimage, nothing in the proof is learnt by a third party in the course of payment: only the payer and the payee hold the commitment.* A claim's signer that is not the committed payer recomputes another commitment, so another address, and the rule refuses it (payment cMIP, step 5).
- **A thief with the payee's everyday MOR key** can point the flow at its own Bitcoin keys (the theft window, Finance rule 15), but not the vault, which the safety key alone changes.
- **A thief with the vault's request key** can make the payee's side commit to payments, but every such payment still goes to the vault's own Bitcoin key: it can sign requests, never spend. *The vault's Bitcoin key can stay offline: only the request key is online, and only to sign.*
- **A thief with the flow's Bitcoin key** takes what is in the flow; the vault is another key.

*The binding of key to identity is only as strong as the payee pointer or vault that names it: a proof shows payment to whoever holds the key, and the payee's signed pointer, or its vault under the safety key, says that is the payee.*

## Payments not yet confirmed, and reorganisations

*How receipts and claims look on this rail, under the rules as they stand (Finance draft 6, the payment cMIP draft 2):*

- **Before the transaction is mined.** The payer's wallet writes its claim at the moment it pays (Finance rule 15, client conformance), carrying `paid` without `block`: the answer is **pending**. The payee signs no receipt yet: it signs once the rail shows the payment complete (payment cMIP, "Delivery"). Rule 4 keeps every client from treating the claim as valid: the obligation it names stays **open**. *A client shows it as "paid, not yet settled: pending, unconfirmed".*
- **Mined, fewer than N blocks.** A proof with k headers answers **pending** ("k of 6"). Nothing counts yet. *Shown as "paid, not yet settled: k of 6 confirmations".*
- **N confirmations.** The proof with exactly N headers answers **valid**. The payee signs its receipt with it, and the payer, who holds the same proof, signs a second claim with it: the claim written at payment stays pending forever, since an act never changes. The payment counts, and discharges what it fulfils (Finance rule 7).
- **A reorganisation before N.** The transaction may be mined again in another block; its proofs from the abandoned block stay pending, and a proof from the new block is made as before. *Nothing counted, so nothing is undone.*
- **A reorganisation after N.** The rule's answer for the proof the parties hold stays **valid**: its headers still carry their work, and the rule sees nothing else. Where the transaction was mined again in another block, a second valid proof of the same payment exists. Where the payer spent the same coins elsewhere in the new chain, **the money is gone, and every record still says it was paid.** *Finance has no rule for either case: see "Open, for Finance". A client that runs a Bitcoin node can see that the proof's block is not on its best chain; what it then shows, beside the answer, is the question.*

## Costs, stated

*A client MUST show these before an owner declares an on-chain rail in a pointer or vault.*

- **Slow, and not final until confirmed.** A payment counts after six blocks, about an hour on Bitcoin; until then it is pending.
- **A reorganisation deeper than six blocks** is not seen by the rule. *On Bitcoin it has not happened by accident since 2013; it takes a miner with a large share of the world's hash rate, spending it on the attack. What Finance does with it is open.*
- **The proof's strength is its work.** A valid-looking proof can be forged by mining N headers at this network's floor without publishing them: on Bitcoin about 0.8 of a block's work, in 2026. *A payment worth more than that is protected by the proof alone only as far as that; a verifier running its own node sees that a forged block is on no chain.* On test networks proofs are free to forge, as their coins are.
- **The payer is visible on the chain.** The transaction's inputs are the payer's coins: an anonymous payer (Finance rule 10a, F113) is as anonymous as its coins, which chain analysis may trace. *The payee's side is not visible: the output is a fresh Taproot key.*
- **Fees and dust.** The payer pays the network's fee on top of the amount, from its own change. An amount below what the network relays (330 satoshis for a Taproot output) cannot be paid on this rail.
- **Exact amounts.** The output must hold exactly the amount: an overpayment or underpayment is no payment under this Module, though the coins still reach the payee's key.
- **The payee must keep its commitments.** To spend, the payee's key needs each payment's commitment: its software keeps them, or recomputes them from its receipts. An offline vault signer is given the commitment with each payment it sweeps.
- **A vault's request key must stay reachable.** A vault whose request key is lost cannot be paid on this rail until the next rotation; a second entry for the unit covers it (Finance, "a dead vault rail").

## Reference implementation

`modules/onchain` (crate `mor-onchain`): the transaction and header decoder, written from Bitcoin's serialisation and checked against a second, independent implementation (`bitcoin`, rust-bitcoin); the pay-to-contract tweak, checked against rust-bitcoin's Taproot output keys; the rule; and, under the feature `btcd`, a client for btcd nodes, with which the end-to-end test starts two nodes on regtest, pays, and shows a reorganisation (`harness/tests/onchain_rail.rs`; `modules/onchain/README.md`). Regtest only before step 17: no real money.

## Open

- **Its RV32IM program** (Production rule 12): secp256k1 point arithmetic, BIP 340 verification and SHA-256 within a step budget, once the profile is published.
- **Address requests** over HTTP or the inbox, with a published form.
- **The floor's value on Bitcoin**, and **N**: parameters stated here, for Nobody, allegedly, to confirm.
- **Batches** (Finance rule 8a): one transaction may pay several commitments, one output each; each output is its own payment under this draft. A batch's commitment is the payment cMIP's open item.

## Open, for Finance

*Raised by this Module, not answered by it (`docs/onchain-rail-step-12a.md`, questions 1 to 3):*

1. **A payment counted, then undone by a reorganisation.** The rule answers from the proof alone, so a proof with N confirmations stays valid after the block is abandoned, even where the payer spent the same coins again. Finance has no rule for a counted payment the rail later takes back.
2. **The claim written at payment is pending.** Finance rule 15 protects a payer whose claim is anchored by a lock change's point; on this rail, the claim written at the moment of payment is pending, and the valid claim exists only N blocks later. Whether the pending claim's anchor counts, once the same payment is proven, Finance does not say.
3. **One payment, two proofs.** After a reorganisation that mines the same transaction again, the payment has two valid proofs, and Finance tells payments apart by their proofs' bytes.

## Freeze scenarios

As the payment cMIP's, on-chain; and the scenarios of `docs/onchain-rail-step-12a.md`, run on regtest: a tip to the flow, pending, then valid; a payment above the vault's limit to the vault's address; a payment to an address not tweaked by the commitment, refused; a reorganisation undoing a confirmed payment.
