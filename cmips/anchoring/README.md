# mor-anchoring

**Experimental**: an instrument for testing the core, never for real money. The anchoring cMIP (`../cmip-anchoring-draft-2.md`), the Envelope's anchoring task; its first clock is the Bitcoin clock Module (`../../modules/module-bitcoin-clock-draft-2.md`, in crate `mor-onchain`). The core's own interface (`mor_core::envelope::anchoring`) is unchanged.

- `src/tree.rs`: the batch tree: leaves `H_leaf(act || blind)`, nodes and the root under three distinct tags, the count bound into the root, one canonical proof per leaf (F200 applied to the batch).
- `src/service.rs`: the pooled anchoring service: the offer (urgency tiers, each priced), the ticket for each paid hash (its batch and deadline), the publication of each batch (its leaves and transaction), and the judgment: delivered, provably omitted, late, a default, or not paid; and the payer's client check of a ticket before paying.
- `tests/batch.rs`: the tree: domain separation, one proof per leaf and its twin refused, a batch root never a payment commitment, an inner node never a leaf.

The service is tested on the Bitcoin clock in `../../modules/onchain/tests/service.rs` (Lightning payments per hash, real BOLT 11 invoices signed by a test node key), the batch anchors in `../../modules/onchain/tests/anchor.rs`, the theft rule with a batch-anchored lock change in `../../modules/onchain/tests/finance.rs`, and end to end on regtest in `../../harness/tests/anchoring.rs`:

```
MOR_BTCD=/path/to/btcd-dir cargo test -p mor-harness --test anchoring -- --nocapture
```
