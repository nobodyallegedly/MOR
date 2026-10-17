# Regtest on the Mac, for Damgar

*17 October 2026, for Nobody, allegedly (F338). A private Bitcoin and Lightning network that lives on your Mac only: its coins are made by your Mac, worth nothing, and never leave it. No real money, ever. The same network is what the GitHub run uses (`.github/workflows/test.yml`, job `regtest`).*

## In plain words

**Regtest** is Bitcoin's practice mode: a chain that only your computer runs, where you make new blocks whenever you like. On it run three Lightning nodes, each a small program: **alice** pays, **bob** and **carol** are paid. One script starts all of it and funds alice; another stops it.

Then three things use it:

- **the test wallet** (`clients/testwallet`), a plain page that stands in for your own wallet: it pays an invoice from alice, makes an invoice on bob, sends on-chain, and mines blocks;
- **Damgar**, which follows the regtest chain to check on-chain payments;
- **the test anchoring service** (`clients/anchoring-service`), which sells anchors on carol's node, and **Edubba**, which checks them against the chain.

Damgar never touches a node: you pay in the test wallet and paste the proof back into Damgar, as you would with a real wallet.

## Once: the programs, checked

btcd (the Bitcoin node) and lnd (the Lightning node) come from their projects' release pages on GitHub. Each project publishes a list of fingerprints (a "manifest"); check that what you downloaded matches it before running anything.

In Terminal (on an Apple-silicon Mac; on an Intel Mac write `amd64` for `arm64` in the four names, and use the Intel fingerprints below):

```
mkdir -p ~/mor-regtest-tools && cd ~/mor-regtest-tools
curl -sSfLO https://github.com/btcsuite/btcd/releases/download/v0.24.2/btcd-darwin-arm64-v0.24.2.tar.gz
curl -sSfLO https://github.com/lightningnetwork/lnd/releases/download/v0.18.5-beta/lnd-darwin-arm64-v0.18.5-beta.tar.gz
shasum -a 256 btcd-darwin-arm64-v0.24.2.tar.gz lnd-darwin-arm64-v0.18.5-beta.tar.gz
```

The two fingerprints must be exactly these (from `manifest-v0.24.2.txt` and `manifest-v0.18.5-beta.txt` on the same release pages):

| File | SHA-256 |
| --- | --- |
| `btcd-darwin-arm64-v0.24.2.tar.gz` | `ece9c7084d22b198761ab007f37ff7748deaa2b489d1b6bb9880ed5f281b1d05` |
| `lnd-darwin-arm64-v0.18.5-beta.tar.gz` | `f62d4e88142ebcb1a477ef64393667a095513f795e804a48db743c1c1ae34654` |
| `btcd-darwin-amd64-v0.24.2.tar.gz` (Intel) | `3cf3f5feeb1a35c5ef88b5c4a0625ce7e08b6e19311c6195f818b29f7e77087e` |
| `lnd-darwin-amd64-v0.18.5-beta.tar.gz` (Intel) | `591fb4b2a4710f416925fa23e74e5bc650e60a649893434a1ebb5eab15d8e07e` |

If one differs, stop: do not run it. If they match:

```
tar xzf btcd-darwin-arm64-v0.24.2.tar.gz && tar xzf lnd-darwin-arm64-v0.18.5-beta.tar.gz
```

*Files fetched with `curl` carry no quarantine mark, so macOS runs them without asking. The manifests are themselves signed by the projects' release keys; checking those signatures (`gpg --verify`) is the stronger check, and optional here, since nothing of value is at stake on regtest.*

## Each time: start the network

From the MOR folder:

```
BTCD_DIR=~/mor-regtest-tools/btcd-darwin-arm64-v0.24.2 LND_DIR=~/mor-regtest-tools/lnd-darwin-arm64-v0.18.5-beta \
  modules/lightning/regtest/up.sh ~/mor-regtest
```

It takes a minute or two and ends with "regtest Lightning network ready in …/mor-regtest". `~/mor-regtest` holds everything: it is emptied each time the script starts, so each start is a new chain. Stop it with:

```
modules/lightning/regtest/down.sh ~/mor-regtest
```

*Ports it uses, on 127.0.0.1 only: btcd 18334 (and 18444); lnd 10009 to 10011, 9735 to 9737, and REST 18080 to 18082. Close anything else using them first.*

## The test wallet

```
cd clients/testwallet && npm install && npm start -- ~/mor-regtest
```

Open the address it prints (`http://127.0.0.1:8478/`). A red band says it is a test wallet. Choose the node (alice to pay; bob to be paid on Lightning), then: **Pay an invoice** (read it first, then pay it: it shows the preimage, the proof to paste into Damgar); **Make an invoice** (an amount, and the description hash Damgar shows); **On-chain** (send to an address; a Bitcoin key of the node's wallet, for Damgar's Settings; mine blocks: six make a payment final for Damgar's on-chain rail).

## Damgar on the regtest chain

Once, so Damgar follows the network's chain (it remembers the folder):

```
cd clients/damgar && npm install && npm start -- --regtest ~/mor-regtest
```

Without it, Damgar still pays and is paid on Lightning; on-chain payments are then shown paid, not checked against a chain. Each new network (after `up.sh`) is a new chain: payments recorded on an earlier one no longer verify, as they should.

## The test anchoring service (for Edubba's anchors)

```
cd clients/anchoring-service && npm install && \
  npm start -- --regtest ~/mor-regtest --homes https://home1.dubsar.org --relays https://home1.dubsar.org
```

It prints its identity: give it to Edubba's **Anchor one of its acts on Bitcoin**. Its folder is `~/mor-anchoring-service` (its test identity's keys). Start Edubba with `npm start -- --regtest ~/mor-regtest` (in `clients/desk`) once, so it checks anchors on this chain.

## The tests on it

```
MOR_LN_REGTEST=~/mor-regtest cargo test -p mor-harness --test lightning_rail
cd clients/testwallet && MOR_LN_REGTEST=~/mor-regtest node --import tsx --test test/regtest.test.ts
cd clients/damgar && MOR_LN_REGTEST=~/mor-regtest node --import tsx --test test/regtest.test.ts
```

Damgar's: a tip prepared in Dub, signed in Damgar, its invoice made by bob's node, paid by alice from the test wallet, the claim and the receipt verified by both Damgars; an on-chain payment to an address bound to it, mined to six confirmations; and a collective's act anchored through the test service on carol, checked in Edubba. Homes and a relay run on the Mac for these tests, on local ports.
