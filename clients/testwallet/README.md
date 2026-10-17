# Test wallet (mor-testwallet)

**A test wallet**, regtest only (F338): a plain page over the three lnd nodes that `modules/lightning/regtest/up.sh` starts on this computer (alice pays; bob and carol are paid). It stands in for a person's own wallet while trying Damgar, which holds no wallet. It is not Damgar, not part of MOR, and never a real wallet: there is no wallet connect, and no real money.

## In plain words

Choose a node. **Pay an invoice**: paste it, read what it asks (the amount, the node paid, the description hash Damgar checks), then pay it: the page shows the preimage, the proof to paste back into Damgar. **Make an invoice**: an amount and the description hash Damgar shows the payee. **On-chain**: send to an address, get the transaction's id; a fresh address of the node; a Bitcoin key of the node's wallet (x-only, for Damgar's Settings, On-chain); mine blocks (six make an on-chain payment final for Damgar). A red band on top says it is a test.

It refuses to start unless every node says it is on regtest.

## Precisely

| File | What |
| --- | --- |
| `src/lnd.ts` | An lnd node's REST interface, its certificate pinned and its admin macaroon read from its folder: info, balances, decode, pay, invoice (with a description hash), a Taproot address, a key of its wallet (x-only), send; btcd asked only to mine. |
| `src/server.ts` | The program on 127.0.0.1: the regtest check; the requests, each checked (whole amounts above zero, a 64-hex description hash, a known node, at most 200 blocks); its page under a strict content policy. Two guards against other web pages: the Host must be its own address (no DNS rebinding), and every request carries a header a plain form cannot send. |
| `src/cli.ts` | `npm start -- RUN_DIR [--port N]` (port 8478). |
| `static/` | The page: plain HTML, CSS and JavaScript, no build. |

## Tests

`npm test`: the refusal off regtest; each request's checks; the guards; the page by clicks in headless Chromium over nodes in memory (`MOR_SCREENSHOTS=DIR` keeps its screens). `test/regtest.test.ts` runs against the real network when `MOR_LN_REGTEST` names its folder: an invoice made by bob, read and paid by alice; an on-chain send mined.

## Using it

`docs/damgar-regtest.md`.
