# mor-onchain

**Experimental**: an instrument for testing the Finance MIP, never for real money; its costs are stated in its text. The on-chain Bitcoin rail Module (`../module-onchain-rail-draft-1.md`), under the payment cMIP (`../../cmips/cmip-payment-draft-2.md`, crate `mor-payment`).

- `src/p2c.rs`: pay-to-contract on Taproot: the payee's key tweaked by the payment commitment gives the payment's address (BIP 341). Roadmap step 14a (anchoring) reuses it.
- `src/tx.rs`, `src/block.rs`: a transaction without its witness, block headers, targets and Merkle branches, as the rule reads them.
- `src/lib.rs`: the rail address, the rail proof and the verification rule (six confirmations; pending before).
- `src/btcd.rs` (feature `btcd`): a client for a btcd node on regtest, which builds a payment's proof from the chain as a payer's wallet or a payee's watcher would.
- `tests/rule.rs`: the decoders and the tweak against a second, independent implementation (rust-bitcoin), and the rule through the payment cMIP: valid, pending, invalid, unknown; neither side alone can fake or relabel a payment; a payment to an address not tweaked by the commitment is refused.
- `tests/finance.rs`: the rail against Finance: a vault holding one unit on Lightning and on-chain takes the smaller limit (F114); a payment confirmed after a lock change, whose claim at payment was pending (question 2 of `docs/onchain-rail-step-12a.md`); one payment with two proofs after a reorganisation (question 3).

## The end-to-end test, on regtest

No real money: regtest coins exist only on the machine that makes them. Download `btcd` (github.com/btcsuite/btcd releases), check it against its release manifest, then:

```
MOR_BTCD=/path/to/btcd-dir cargo test -p mor-harness --test onchain_rail -- --nocapture
```

The test (`harness/tests/onchain_rail.rs`) starts two btcd nodes itself, in a temporary directory, both mining to the payer, and stops them at the end. It makes two test identities on a throwaway home and pays: a tip of 1,234 to Bob's flow, pending when broadcast, pending at one confirmation, valid at six, when both hold the same proof (Bob then spends it with his key tweaked by the commitment); 50,000 above Bob's vault limit, to his vault's address; 500 signet satoshis, a unit his vault does not cover, refused; an address not tweaked by the commitment, refused by the wallet before paying, and, paid anyway by a careless wallet, refused by the rule; and 3,000 confirmed six times on one node, then taken back by a reorganisation from the other node, where the payer spent the same coins again: every record still shows the payment as valid (question 1). Without `MOR_BTCD` it says so and passes.

Built with btcd 0.24.2 (`btcd-linux-amd64-v0.24.2.tar.gz`, SHA-256 `f7ee4005a0f597d0486eb5cb17218eb51fcb9bed93bbb4d416a57f3975df69e5`, as its release manifest states).
