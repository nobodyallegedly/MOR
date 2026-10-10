# Module: On-chain Bitcoin rail

*Draft 2, 10 October 2026 (findings F200 to F205; `docs/onchain-rail-f200-f205-build-2026-10-10.md`). **EXPERIMENTAL. Not approved, not a product, not for real money.** An instrument for throwing real use at the Money MIP, as the Lightning rail Module is (F117). Its costs are stated below, under "Costs, stated", and a client using it MUST show them before the owner declares an on-chain rail in a pointer or vault. A rail Module under the payment cMIP draft 2 (`cmips/cmip-payment-draft-2.md`), which its field 5 names. Its hash stays a draft hash until its creator is named at step 17; until then it is named by a test value. Written against the Money MIP draft 6, the Development MIP draft 6, the Envelopes MIP draft 7, the payment cMIP draft 2, the anchoring cMIP draft 1 and the Bitcoin clock Module draft 1, the Lightning rail Module draft 2, the Bitcoin units draft 1, BIP 340 and BIP 341, and findings F1 to F205. Not core: frozen at publication, competing with any other on-chain rail Module.* *Decided before draft 1 by Nobody, allegedly, 9 October 2026: **a request rail**, the payee's side committing to each payment by **pay-to-contract**, **no OP_RETURN**; the on-chain vault an ordinary Bitcoin key the owner declares and changes only by a rotation the chain key signs.* *Draft 2 builds the decisions of 10 October 2026: the proof is canonical and the rail says what "the same payment" is (F200); on a Bitcoin clock the payment's block is its anchor (F201, through the Bitcoin clock Module, F202); on another clock the owner bears what F203 states; proofs are checked against the real chain's headers, handed to the rule as data, and the floor is gone (F204); a payment is final once counted, and a payee's request may name more confirmations (F205). It also settles, as wording, stated costs or client conformance, the smaller findings of Fable's review (`docs/reviews/onchain-rail-review-2026-10-10.md`, findings 5, 6, 7a to 7c, and section 8 on privacy).*

*Reading this document: normal text is the specification. Italic text is commentary, reasoning and examples. The common case comes first; rare cases (reorganisations, theft windows, forged chains) after, marked as such.*

## In plain words

*A Bitcoin address is, underneath, a key. Taproot lets anyone "tweak" a key by a fingerprint: the tweaked key gives a fresh address nobody can tell apart from any other, and the key's owner can still spend from it, once told the fingerprint. Pay-to-contract is that: the payee's key, tweaked by the payment commitment of the payment cMIP (who pays whom, how much, for what, where), gives the address for that one payment. Nothing extra is written on the chain.*

*Before paying, the payer asks the payee's side for a "request": the payee's request key signs the commitment. The payer pays the address the commitment gives. Once the payment is in a block with six blocks on top (about an hour), anyone holding the receipt or the claim can check it: the right key, the right fingerprint, the right amount, in a block of the chain Bitcoin actually follows. Until then it is "paid, not yet settled".*

*Three things are new in this draft. **One payment is one payment**: Bitcoin's way of hashing blocks used to let one payment carry two different-looking proofs; now only one is accepted, and in any case Money asks this Module which payment a proof shows (the transaction's output), so two proofs of one payment count once. **The proof is checked against the real chain**: a verifier hands the rule the block headers of the chain it follows, and a proof whose block is not on that chain is "unknown", however much work its own headers carry. **A payment counted stays counted**: a rewrite of Bitcoin deeper than six blocks is a stated cost, not something the record follows; a payee asking for a large sum may ask for more confirmations.*

## The rail

**Units.** This Module carries one unit per network (`modules/units-bitcoin-draft-1.md`), the same units the Lightning rail Module carries: the satoshi on Bitcoin, and the satoshi of each test network (testnet, signet, regtest), which are not satoshis. An amount's value counts whole satoshis.

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

`key` is a single key, or a key aggregating several (an n-of-n MuSig2 key, a FROST threshold key): Bitcoin sees one key either way. *For a k-of-n multisig written as a script, `key` is a key nobody holds and `tree` the root of the owner's scripts; the owner spends by the script path, at a cost in privacy stated below.* `request` may equal `key` for a flow, which puts the flow's Bitcoin key online to sign requests, as a flow's key is anyway; for a vault it SHOULD be a different key, kept online, while the vault's Bitcoin key stays offline.

**A fresh receiving address** is the address of the output key the payment commitment gives (below): fresh for every payment, since every commitment carries a fresh salt (payment cMIP). **The salt is the only secret in the commitment** (review, section 8): everything else is public or guessable. A payer's client MUST make each salt from 128 bits of a cryptographically secure random source, never from a counter, a clock or a hash of the act (client conformance). *With a guessable salt, anyone holding the payee's public pointer and a short list of likely payers recomputes the address and reads, from the bare output, who paid whom for what.*

**Address requests.** The payer sends the payee's endpoint the commitment's fields and receives the request; the address follows from the commitment. *In the reference implementation the request is a direct call; an HTTP or inbox form is for a later draft. A hosted endpoint learns every payment's commitment and holds the request key (stated below).*

## Carrying the commitment

**A request rail** (payment cMIP item 3, F128 W4). Every payment on this Module is made to the address the commitment gives, on a request the payee's side signed for that commitment, the purchase's claim included. It binds payee and purpose (Money rule 10, F168).

**The request.** The payee's side signs, with the address's request key, a BIP 340 Schnorr signature over:

```
request-message = tagged_hash("MOR/module/onchain/request", commitment-hash)                      ; at N confirmations
                / tagged_hash("MOR/module/onchain/request", commitment-hash || confirmations)    ; naming more: the number as 8 bytes, big-endian
```

**A payee's request may name more confirmations than N** (F205), for a large sum: the payment then counts only at that depth. The number is signed with the request, so a payer cannot drop it. A request naming fewer than N is invalid. The payee's side MUST sign only as the payment cMIP says (step 1): a commitment naming the payee, and a `paid-to` that is the payee's own pointer or vault with this address or source.

**Pay-to-contract.** For the commitment hash `c`, the payment's output key is BIP 341's Taproot output key for the internal key `key` and the Merkle root:

```
root = c                                   ; without a tree
root = TapBranch(tree, c)                  ; with a tree: BIP 341's branch hash, the two sorted
t    = TapTweak(key || root)               ; BIP 341's tagged hash; t must be below the curve order
Q    = lift_x(key) + t·G                   ; Q not the point at infinity
```

and the payment's output is a Taproot output (witness version 1) paying the x coordinate of `Q`. **No OP_RETURN.** *The owner spends it by the key path with the secret key tweaked by `t`, or by its script path with `c` as the branch beside its own scripts; either way it needs `c`, which the receipt or claim gives: the payee's software MUST keep each commitment it signs, or recompute it from its receipts.* *Anchoring (step 14a) reuses the tweak with a batch's Merkle root, which the anchoring cMIP domain-separates (a tagged hash), so a batch root can never equal a payment commitment (review, 7d).*

## The rail proof

```cddl
onchain-proof = [
  request: bstr .size 64                         ; the payee's side's BIP 340 signature over the request message
         / [ bstr .size 64, confirmations: uint ], ; the same, naming more than N confirmations (F205)
  ? paid: [
    tx: bstr,                      ; the transaction, serialised without its witness (the bytes its txid is the hash of)
    output: uint,                  ; the index of its output paying the commitment's address
    ? block: [
      index: uint,                 ; the transaction's position in the block: its canonical position (F200)
      branch: [* bstr .size 32],   ; the Merkle branch from the transaction to the block's root
      headers: [+ bstr .size 80]   ; the block's header, then the headers built on it, in order: exactly k for a valid proof
    ]
  ]
]
```

*A payer checks the request before paying with `paid` absent; a payer who has broadcast holds `paid` without `block`; once mined, `block` grows with each header up to k. Hashes are in Bitcoin's own byte order.*

**N, the confirmations a payment needs at least: 6**, on every network; **k** is N, or the number the request names. *On a test network blocks cost nothing, so six confirmations there prove only that the test ran.* A watcher or wallet MUST truncate the headers it collects to k: more than k is invalid (client conformance; review, 7a). *Invalid rather than valid keeps one proof per payment per block, so that payer and payee hold the same bytes; what Money counts is the payment, not the bytes (below).*

**The same payment** (payment cMIP item 6; F200): **the output the transaction created**, `[txid, output]` in deterministic CBOR. Every proof of the payment shows it, pending or valid, in whichever block holds it; a proof without `paid` shows no payment. *So the payment mined again in another block after a reorganisation is one payment; a second transaction paying the same commitment is another payment. Not the commitment, which a payer may pay twice, and which would let a pending claim stand for a payment made later (review, finding 2).*

**One index where the tree repeats a node** (F200). Bitcoin's Merkle tree repeats the last node of a level with an odd number of nodes, so a transaction in that place has its own copy as sibling and a second index giving the same root with the same branch (CVE-2012-2459). The proof's index is canonical: wherever the sibling at a level equals the running hash, the index's bit at that level is 0. *About one transaction in eight in a block of ordinary size sits in such a place (review, finding 1); its twin is invalid. An honest block has no other equal siblings (Bitcoin Core refuses a block that has them as mutated), so no honest proof is refused.*

## The chain the verifier follows (F204)

A mined payment is checked against **the headers of the chain the verifier follows**, which the client hands the rule as data with the proof (Development rule 12): the input, never a network call. **A block not on that chain answers unknown, never valid.** *Mechanics chosen by the build under the delegation of F204, marked as such in the build report:*

- **What is handed over:** the headers of the client's best chain, in order, from a starting point to its tip. Each names the one before and meets the target it states; the first is a starting point this Module names for the network: **the genesis block** of Bitcoin, testnet and signet (their hashes in the reference implementation, `modules/onchain/src/chain.rs`). On regtest any start is accepted: a test network's chain is whatever the test makes.
- **How far back:** from the genesis block, about 75 MB of headers on Bitcoin in 2026, about 4 MB more a year. *A later starting point frozen in a later draft would let a client keep less; none is named in this draft.*
- **What the rule does not check:** Bitcoin's difficulty schedule and its timestamp rules. The client's header sync checks them as every Bitcoin node does, or the client relies on a header service for them (client conformance, below).
- **How two verifiers holding different tips agree:** the proof's block and the headers it carries must be those of the verifier's chain at their heights; a verifier whose chain goes further agrees; one whose chain holds the block with fewer than k headers on it answers pending ("j of k"); one whose chain has another header at a height the proof covers answers unknown.
- **An offline client** (no headers held, or none of the address's network) answers unknown for every mined payment, pending for a payment not yet mined. *A client shows "paid, not yet checked against the chain".*
- **The floor is gone.** Draft 1 refused headers easier than a fixed difficulty (about 2^44 on Bitcoin). Its two jobs, pricing a forged proof and telling one network's headers from another's, are done by the chain followed and its starting point; kept, it would refuse every honest proof if Bitcoin's difficulty fell below it, as it was until 2021 (review, finding 4). *A testnet header can never pass as Bitcoin's: it is on no chain that starts at Bitcoin's genesis (review, 7c).*

## The verification rule

Given the commitment hash, the amount, the address or source the payee signed, the rail proof, and the chain the verifier follows (or none), the rule answers, in this order:

1. **Invalid** if the address is not an `onchain-address`, or the rail proof not an `onchain-proof`.
2. **Invalid** if the amount's unit is not the unit of the address's network.
3. **Invalid** if the request names fewer than N confirmations, or its signature does not verify under the address's request key over the request message for the commitment hash (and the number, where it names one).
4. **Invalid** if `key` is not the x coordinate of a point on the curve, or the tweak fails.
5. **Pending** if the proof carries no `paid`: the payment is not made.
6. **Invalid** if `tx` is not exactly one transaction serialised without witness, with no bytes left over, or is 64 bytes long; if it has no output at `output`; if that output does not pay `Q`: **paid to an address not tweaked by this payment's commitment**; or if its value is not the amount's value.
7. **Pending** if the proof carries no `block`: the transaction is not shown confirmed.
8. **Invalid** if the branch, from the transaction's txid at `index`, does not give the first header's Merkle root; if `index` is not canonical; if a header does not name the one before it; or if a header's hash is above the target its own `bits` state.
9. **Unknown** if the verifier holds no chain of the address's network; if the first header is not on that chain; or if a later header of the proof differs from the chain's header at its height.
10. **Pending** if the proof carries fewer than k headers, or the chain holds fewer than k from the block: confirmed j times, not k.
11. **Invalid** if the proof carries more than k headers.
12. **Valid** otherwise. No trusted party is relied on; the chain's headers are the verifier's own input.

## The Bitcoin clock (F201, F202)

*Where an owner's declared clock is Bitcoin, an on-chain payment needs no claim act to be anchored: its proof is its anchor.* Under the anchoring cMIP, the **Bitcoin clock Module** (`modules/module-bitcoin-clock-draft-2.md`) reads a proof of this Module as the anchor of the receipt or claim whose commitment the transaction pays, its point the height of the payment's block on the chain followed, where this rule answers valid on that chain: at the same depth, one number for both (F205). Money rule 15 then compares "the payment's block before or at the lock change's block" (F201). This Module declares that the Bitcoin clock reads its proofs (in code `clock::reads`; *format open, F140 item 1, as for the rail's kind*).

## What a verifier ties together (pattern 1)

- **The payee alone** can sign a request and a receipt. **A receipt naming a payer proves only what the payee says** (review, finding 5, as the Lightning Module says of itself): the rule reads of the transaction its outputs, never whose coins it spends, so a payee paying its own address with a commitment naming someone else holds a valid receipt "X paid me". The claim is the payer's. *What such a receipt buys is little: it discharges the named payer's debt, a gift; in Agreements only the committed payer's claim acknowledges a delivery (F193), and no service is paid on its own record (F194).*
- **The payer alone** cannot produce a valid proof: the request must be signed by the request key the payee declared, and the transaction must pay the payee's own key tweaked by the commitment.
- **Anyone watching the chain** sees an ordinary Taproot output of an exact amount and the payer's coins. What it can learn, and when, is listed under "Costs, stated".
- **A thief with the payee's MOR signing key** can point the flow at its own Bitcoin keys (the theft window, Money rule 15), but not the vault.
- **A thief with the vault's request key** can make the payee's side commit to payments, but every such payment goes to the vault's own Bitcoin key. **It can also make the seller's side commit to any version of a work's claim** (review, finding 6): a buyer can be sold under terms the seller has left; the money still reaches the seller. Stated below.
- **A thief with the flow's Bitcoin key** takes what is in the flow; the vault is another key.

## Pending, counted, and reorganised

*How receipts and claims look on this rail (Money draft 6, the payment cMIP draft 2):*

- **Before the transaction is mined.** The payer's wallet writes its claim at the moment it pays (Money rule 15, client conformance), carrying `paid` without `block`: **pending**. The payee signs no receipt yet. The obligation stays open (Money rule 4). *Shown: "paid, not yet settled".*
- **Mined, fewer than k blocks.** **Pending** ("j of k"). *Shown: "paid, not yet settled: j of k confirmations".*
- **k confirmations, on the chain followed.** **Valid.** The payee signs its receipt; the payer signs a second claim with the same proof (client conformance, Money rule 15); the claim written at payment stays pending, and, on a clock that cannot see this rail, its anchor protects the payment (F203).
- **A reorganisation before k** *(rare)*. The transaction may be mined again in another block; that is the same payment (F200). Nothing counted, so nothing is undone.
- **A payment counted stays counted** (F205). *A rewrite of Bitcoin deeper than k blocks after a payment counted is a stated cost (below), not something Money follows: no counter-proof undoes an answer, and acts built on the payment (a discharged debt, a sale, a split's payouts, the next hop, an anchor) do not reopen. See "Open" for what a verifier holding only the rewritten chain answers.*

## Costs, stated

*A client MUST show these before an owner declares an on-chain rail in a pointer or vault.*

- **Slow, and not final until confirmed.** A payment counts after six blocks (about an hour on Bitcoin), or the more its request names.
- **A rewrite deeper than the confirmations** (F205) leaves a counted payment unpaid, or an anchor pointing at a block no longer on the chain; the payee's remedy is Agreements. *Never said to be impossible. It has happened on Bitcoin twice, from software faults rather than attacks: August 2010 (the value overflow, about 53 blocks) and March 2013 (the 0.8 database fork, about 24 blocks). An attack needs a majority of the world's hash rate for the length of the rewrite; a fault needs none. A payee asking for a large sum may name more confirmations in its request.*
- **Headers kept, or a header service trusted** (F204). A client checking proofs keeps Bitcoin's headers (about 75 MB in 2026, about 4 MB more a year) and syncs them from the network, or relies on someone who keeps them for it. **A client relying on a header service trusts it to hand over the real chain and MUST say so to its user** (client conformance). *Offline, every mined payment answers unknown.*
- **Forging a proof** now means getting a block onto the chain the verifier follows: the network's own work, or a verifier's header source that lies. *Draft 1's floor priced a forged proof at about 0.7 of a block in 2026, falling every year, aimed at the vault (review, finding 4); it is gone.*
- **On a clock that is not Bitcoin** (F203), the owner bears on-chain payments caught in a theft window: a thief and a payer together can anchor a pending claim in the window for a transaction they hold back, broadcast it after the lock change, and be protected. *Declaring Bitcoin as the clock closes it (F201).*
- **The request key is online** (review, finding 6). A thief with it makes the payee's side commit to payments it did not intend, and to any version of a work's claim; the money still reaches the payee's key. A vault's request key must also stay reachable: a vault whose request key is lost cannot be paid on this rail until the next rotation; a second entry for the unit covers it (Money, "a dead vault rail").
- **What the chain shows** (review, section 8). The transaction's inputs are the payer's coins, and **the amount is in the clear**: a payment of exactly a published price names the work, from the chain alone; with a relay's timing, it names the payer. An anonymous payer (F113) is as anonymous as its coins.
- **A script-path spend publishes the declared key and the commitment.** For an address with a `tree` (a k-of-n script multisig), spending by a script path puts `key` and the commitment hash on the chain, linking every payment so spent to the payee's public pointer or vault. *A vault wanting privacy aggregates its keys (MuSig2, FROST) and spends by the key path.*
- **Who else learns a payment** (section 8): a hosted request endpoint learns every commitment and holds the request key; the relay carrying the claim written at payment learns its signer, recipients and moment; a watcher asking a public explorer or Electrum server by address or txid hands it the payee's payments; in a collective every member and the split service can locate every buyer's coins; anyone shown a receipt or claim learns the payment and the payer's coins, for good.
- **Fees and dust.** The payer pays the network's fee from its own change. An amount below what the network relays (330 satoshis for a Taproot output) cannot be paid on this rail.
- **Exact amounts.** An overpayment or underpayment is no payment under this Module, though the coins still reach the payee's key.
- **The payee must keep its commitments**, or recompute them from its receipts, to spend.

## Client conformance, in one list

1. Salts from 128 random bits (above).
2. Truncate a proof's headers to k (7a).
3. **Never sweep a payment to the declared key's own address**, nor to any address the payee has shown to be its own (review, 7b); sweep to fresh keys. *A consolidation sweep links the payments swept together, though not to the key: a stated cost of sweeping.*
4. A watcher queries the payee's own node, not a public explorer by address or txid, or says that it does.
5. The claim written at payment MUST be written then (Money rule 15); its delivery through a relay MAY wait, so that the relay's timing does not mark the payment.
6. A client relying on a header service says so (F204).
7. A payer's wallet writes a second claim once the payment is valid (F203).

## Reference implementation

`modules/onchain` (crate `mor-onchain`): the transaction and header decoder and the pay-to-contract tweak, checked against rust-bitcoin; the canonical index (`block::canonical`); the chain handed to the rule (`chain::HeaderChain`); the rule; the Bitcoin clock Module (`clock`); and, under the feature `btcd`, a client for btcd nodes that reads a node's headers as the chain followed. The end-to-end test starts two nodes on regtest, pays, and shows a reorganisation (`harness/tests/onchain_rail.rs`; `modules/onchain/README.md`). Regtest only before step 17: no real money.

## Open

- **Counted, then rewritten deeper than k: what a verifier answers** (for Nobody, allegedly; the build report, question Q1). F205 says a counted payment stays counted; F204 says a block not on the chain followed answers unknown, never valid. After a rewrite deeper than k, a verifier holding only the new chain answers unknown for a payment others counted. As built, the rule follows F204 to the letter.
- **Its RV32IM program** (Development rule 12): secp256k1, BIP 340, SHA-256 and the header chain within a step budget, once the profile is published; a chain of 75 MB as input sets the budget's scale.
- **A later starting point** for the chain followed, frozen in a later draft, so a client keeps fewer headers.
- **Address requests** over HTTP or the inbox, with a published form that states what the operator learns.
- **Batches** (Money rule 8a): one transaction may pay several commitments, one output each; each output is its own payment under this draft.

## Freeze scenarios

As the payment cMIP's, on-chain; run offline in `modules/onchain/tests/` and on regtest in `harness/tests/onchain_rail.rs`: a tip to the flow, pending, then valid; a payment above the vault's limit to the vault's address; a payment to an address not tweaked by the commitment, refused; a twin index refused, one payment counted once (F200); a payment mined again after a reorganisation counted once (F200); on a Bitcoin clock, a payment mined before the lock change's block counts and one mined after does not, whatever claim was anchored before (F201); on another clock, the earliest claim of the same payment counts once one is valid, a transaction held back protected as F203 states (F203); a forged header chain unknown, an offline verifier unknown, a verifier behind pending (F204); a request naming twenty confirmations counting only at twenty (F205); a reorganisation after six, the proofs unknown on the chain now followed and valid on the chain they were counted on.
