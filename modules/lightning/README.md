# mor-lightning

The Lightning rail Module (`../module-lightning-rail-draft-2.md`), under the payment cMIP (`../../cmips/cmip-payment-draft-2.md`, crate `mor-payment`).

- `src/bolt11.rs`: decodes a BOLT 11 invoice and recovers the node key that signed it.
- `src/lib.rs`: the rail address, the rail proof and the verification rule.
- `src/lnd.rs` (feature `lnd`): a client for an lnd node's REST interface, pinning the node's own certificate.
- `tests/rule.rs`: the decoder against a second, independent decoder (`lightning-invoice`), and the rule through the payment cMIP: valid, pending, invalid, unknown; neither side alone can fake a payment.
- `regtest/`: a private Lightning network on regtest for the end-to-end test.

## The end-to-end test, on regtest

No real money: regtest coins exist only on the machine that makes them. Download `btcd` (github.com/btcsuite/btcd releases) and `lnd` (github.com/lightningnetwork/lnd releases) for your machine, check them against their release manifests, then:

```
BTCD_DIR=/path/to/btcd-dir LND_DIR=/path/to/lnd-dir modules/lightning/regtest/up.sh /tmp/mor-regtest
MOR_LN_REGTEST=/tmp/mor-regtest cargo test -p mor-harness --test lightning_rail -- --nocapture
modules/lightning/regtest/down.sh /tmp/mor-regtest
```

The test (`harness/tests/lightning_rail.rs`) makes three test identities on a throwaway home, and pays: a tip from Alice to Bob's flow (both then hold a verified receipt and claim, delivered through their inboxes); 50,000 above Bob's vault limit, which goes to his vault node; 500 in a unit his vault does not cover, refused, with Bob told in his inbox; and 20,000 to Dana, whose vault is on-chain only, refused, with Dana told. Without `MOR_LN_REGTEST` it says it did not run, and passes.

Built with btcd 0.24.2 and lnd 0.18.5-beta.
