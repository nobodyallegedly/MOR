# mor-onchain

**Experimental**: an instrument for testing the Finance MIP, never for real money; its costs are stated in its text. The on-chain Bitcoin rail Module (`../module-onchain-rail-draft-2.md`), under the payment cMIP (`../../cmips/cmip-payment-draft-2.md`, crate `mor-payment`).

- `src/p2c.rs`: pay-to-contract on Taproot: the payee's key tweaked by the payment commitment gives the payment's address (BIP 341). Roadmap step 14a (anchoring) reuses it.
- `src/tx.rs`, `src/block.rs`: a transaction without its witness, block headers, targets and Merkle branches, as the rule reads them.
- `src/block.rs` also holds the canonical index (F200): where the tree repeats a node, only the node's own position is a proof.
- `src/chain.rs`: the headers of the chain a verifier follows, handed to the rule as data (F204), from the network's genesis (any start on regtest).
- `src/clock.rs`: the Bitcoin clock Module (`../module-bitcoin-clock-draft-1.md`): an on-chain payment's proof as its anchor, the point its block (F201, F202).
- `src/lib.rs`: the rail address, the rail proof and the verification rule (six confirmations, or more where the request names more, F205; on the chain followed; pending before); "the same payment" is the output the transaction created (F200).
- `src/btcd.rs` (feature `btcd`): a client for a btcd node on regtest, which builds a payment's proof from the chain as a payer's wallet or a payee's watcher would.
- `tests/rule.rs`: the decoders and the tweak against a second, independent implementation (rust-bitcoin), and the rule through the payment cMIP: valid, pending, invalid, unknown; neither side alone can fake or relabel a payment; a payment to an address not tweaked by the commitment is refused.
- `tests/finance.rs`: the rail against Finance: a vault holding one unit on Lightning and on-chain takes the smaller limit (F114); on a clock that is not Bitcoin, the earliest claim of the same payment counts once one is valid (F203); on the Bitcoin clock, the payment's block is its anchor (F201); one payment mined again after a reorganisation counts once (F200).
- `tests/review.rs`: Fable's hostile review (`docs/reviews/onchain-rail-review-2026-10-10.md`), its tests rewritten to pin F200 to F205.

## The end-to-end test, on regtest

No real money: regtest coins exist only on the machine that makes them. Download `btcd` (github.com/btcsuite/btcd releases), check it against its release manifest, then:

```
MOR_BTCD=/path/to/btcd-dir cargo test -p mor-harness --test onchain_rail -- --nocapture
```

The test (`harness/tests/onchain_rail.rs`) starts two btcd nodes itself, in a temporary directory, both mining to the payer, and stops them at the end. It makes two test identities on a throwaway home and pays: a tip of 1,234 to Bob's flow, pending when broadcast, pending at one confirmation, valid at six, when both hold the same proof (Bob then spends it with his key tweaked by the commitment); 50,000 above Bob's vault limit, to his vault's address; 500 signet satoshis, a unit his vault does not cover, refused; an address not tweaked by the commitment, refused by the wallet before paying, and, paid anyway by a careless wallet, refused by the rule; and 3,000 confirmed six times on one node, then taken back by a reorganisation from the other node, where the payer spent the same coins again: checked against the chain the node now follows, the receipt and the claim answer unknown (F204); against the chain they were counted on, valid (the open question of `docs/onchain-rail-f200-f205-build-2026-10-10.md`). Every check reads the node's headers as the chain followed. Bob sweeps the tip to a fresh key, never his declared key's own address. Without `MOR_BTCD` it says so and passes.

Built with btcd 0.24.2 (`btcd-linux-amd64-v0.24.2.tar.gz`, SHA-256 `f7ee4005a0f597d0486eb5cb17218eb51fcb9bed93bbb4d416a57f3975df69e5`, as its release manifest states).
