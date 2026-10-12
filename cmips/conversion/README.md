# mor-conversion

**Experimental**: an instrument for testing the core, never for real money. The conversion cMIP (`../cmip-conversion-draft-2.md`; draft 1 kept as the record): Money's conversion task, a rail swap sold as a proven offer (Agreements rule 11, F261), with receipts per hop; where the next payee signs nothing, the service's claim of the onward payment names the hop it carries on (F267).

- `src/lib.rs`: the terms (the rail and unit it pays out on, a rate fixed or quoted per order no worse than a floor, a fee, the most blocks to a deadline), sold under an Agreements standing offer, a lone seller's, in the access form; the order the service signs under it before each payment, binding the forward, what the onward hop follows and the deadline; the payer's client check of an order before paying; the judgment: delivered, late, a default (the forward owed under the offer, Money rule 27), contradicted, or not paid; the clock it reads deadlines on (`DeliveryClock`); its checker for the core (`Checker`).
- `src/route.rs`: Money's route rules (draft 7, rules 24 to 28) read over receipts and claims (F267, one payment serving one forward, rule 12): a route complete as one chain, stopped where a forward was not carried on (the hop and agreement named, the forward that hop's open obligation), or broken; read from its first receipt, or back from its last as the final creditor reads it.

Tested on the Bitcoin clock in `../../modules/onchain/tests/conversion.rs` (Lightning in, real BOLT 11 invoices signed by a test node key; on-chain out, a regtest chain built with rust-bitcoin; the core's Agreements view asking the checker), and end to end on regtest in `../../harness/tests/conversion.rs`:

```
MOR_BTCD=/path/to/btcd-dir cargo test -p mor-harness --test conversion -- --nocapture
```

With the Lightning regtest network of `../../modules/lightning/regtest/up.sh` running, add `MOR_LN_REGTEST=RUN_DIR` and the Lightning hops move over real lnd nodes.
