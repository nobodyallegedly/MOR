# Damgar (mor-damgar)

**Damgar** (𒁮𒃼, Sumerian dam-gàr, "the merchant"; F338): a money app that **holds no wallet**. It gathers the money acts other apps and people propose, reads each in plain words and offers it for signing; it checks payments from the rails' own evidence; and it keeps the account. On the Mac and Linux, a program and its page, as Dub; the same page as a web client, **for testing only** (to be served at `damgar.dubsar.org`), with a banner stating the risks on every screen. Dub's look (F332), tinted with gold `#e8b33a` by Kišib's rule (H36: separators 22%, outlines 30%, accents 60% over `#06080c`; red only for alarms; `src/page/view.ts`, `TINT`).

**Test identities and test networks only, until MOR is frozen. No real money.** The report of its first round: `docs/damgar-report.md`. Regtest on the Mac: `docs/damgar-regtest.md`.

## In plain words

Money in MOR is two records of each payment, each signed by one side: the payer's **claim** ("I paid") and the payee's **receipt** ("I was paid"). Both carry the proof the payment method itself gives (on Lightning, a secret only the payment reveals; on-chain, the transaction in its block), so anyone can check them without trusting either side. Money moves only in your own wallet: Damgar never holds a wallet, a node or a Bitcoin key.

**First use.** Bring an identity you have, by its ID and its signing key's words, as in Dub (Damgar never makes one). Then choose what you accept: each payment specification and Module, with its version and what it does (payments, the Lightning rail, the on-chain rail, Bitcoin's units, split, conversion, anchoring, the Bitcoin clock, the money messages). A money act under something you do not accept is shown **unknown** and is never signed. Your choice is sealed to your identity and kept at its homes, so every app holding the identity reads the same list (F340); you can change it in Settings.

**To sign.** Payments prepared in Dub (a tip on a post; a request to be paid), in Edubba (a payment from an identity; the payment for anchoring a collective's act) and in Ummia (the payment for anchoring a release), each a draft sealed to your own identity; requests to be paid that others sent; invoices to make when someone pays you; receipts to sign once a payment to you is proven. Each is read in plain words, with its rail, then signed or declined.

**Pay.** The invoice to pay, or an on-chain address bound to that one payment. You pay in your own wallet and paste the proof back (the preimage, or the transaction's id); Damgar checks it and signs your claim.

**The account.** What came in, what went out, what is pending, what is owed: each with its claim and receipt, and whether each verifies. A payment paid and confirmed (settled, its claim and receipt each valid) is folded to one line; open it to see its record. Totals are per unit, never added across units.

**Settings.** Where you are paid (a Lightning node, a Bitcoin key: your payee pointer, with each rail's stated costs read back before it is signed), what you accept, the vault limit (shown; set in Kišib), homes and relays.

## Precisely

| File | What |
| --- | --- |
| `src/damgar.ts` | The `Damgar` class. The identity: `bring` (by its signing words, as Dub; its encryption key from the words), `renew`, `use`, `leave`, `forget`, `carry`, `check`. The accepted list: `setAccepted`, `publishList`. `look`: the sealed acts at the identity's homes and inbox, opened (a renewed encryption key adopted; seals that do not open counted). The payee's side: `onInvoiceRequest` (on-chain: answered by itself with the request key), `answerInvoice` (the invoice checked: the node the pointer names, the amount, the description hash, no plain description), `refuseInvoice`. The payer's side: the route chosen by the core (`moneyChoose`), the commitment, `onAnswer` (an anchor's ticket checked first). `toSign`, `signDraft`, `decline`, `acceptDebt` (an obligation, only when the payer means to owe it), `payRequest`. `paid` (the proof checked by the rail Module, the claim signed), `recheck` (on-chain: a second claim at six confirmations), `signReceipt` (the claim checked from the rail's evidence first). `account`, `pay`. Settings: `rails`, `railsReview`/`publishRails` (the payee pointer; the request key made, with its cost said, and replaced by a new pointer), `setRelays`. The texts said on screen: `REQUEST_KEY_SAY`, `LIGHTNING_COSTS`, `ONCHAIN_COSTS`, `DEBT_SAY`, `ACCOUNT_NOTES`. |
| `src/messages.ts` | The money messages cMIP (`cmips/cmip-money-messages-draft-1.md`): drafts, requests to be paid, invoice requests and answers, each a private act sealed to its one reader; `sendDraft` for Dub and Edubba. |
| `src/accepted.ts` | The accepted cMIP (`cmips/cmip-accepted-draft-1.md`, F340): reading the sealed list at the homes, changing it on the latest version read and reading again before sending, a fork shown and merged. |
| `src/specs.ts` | What can be accepted (`ACCEPTABLE`), each with its version, what it does and what Damgar does with it; the spec hashes from the core library (`moneySpecs`), never typed. |
| `src/units.ts` | Units as pluggable as rails: the Bitcoin units Module's four units; an amount always said with its unit; totals per unit, never summed across units. |
| `src/chain.ts` | The chain Damgar follows for the on-chain rail: a regtest btcd node over its JSON-RPC, its certificate pinned, trusted as a header service and said so (on-chain rail Module, client conformance 6). The web client follows none. |
| `src/store.ts`, `src/ops.ts`, `src/server.ts`, `src/cli.ts` | The program: its folder (`~/mor-damgar`), the operations by name, the local server on 127.0.0.1 (requests signed by a paired browser, domain line `MOR Damgar, version 1`), the command. |
| `src/page/` | The page: `view.ts` (every screen), `ui.ts` (what each click does), `app.ts` (the program's page). |
| `src/web/`, `scripts/build-web.ts` | The web client: the same page and Damgar's code in the browser, its keep in IndexedDB; built into `built/` with the pinned tools, reproducibly (`BUILT-WITH.txt`). |
| `static/icon/damgar.svg` | The icon (a clay tablet, gold-tinted, with a sleeping duck carved into it as on the Mesopotamian duck weights: an egg-shaped body, the neck turned back, the head laid along the back, the bill toward the tail; a thick gold edge, a silver line beneath; made into `damgar.png`, `.icns` and the touch icon by `clients/dub/scripts/make-icons.ts`). |

The core library does every check: payloads, commitments, rail proofs, the route and the vault, the anchoring ticket (`wasm/src/money_js.rs`, through `clients/genesis/src/core.ts`).

## Readings

- **A request to be paid is not a debt** (answer of Nobody, allegedly). In To sign it offers: accept it as a debt (sign an obligation, Money type 1), only if one means to owe it; pay it, in one's wallet; then record the payment (a claim with the proof). Most tips skip the first step.
- **The payer signs a claim, the payee a receipt** (Money rule 7). A payer's "receipt" does not exist.
- **Obligation states are unknown here** (Money rule 15, M5): Damgar keeps to the Money layer. Said wherever a debt is shown.
- **The on-chain request key** (option (A), on the project lead's lean): Damgar makes it and keeps it beside the signing key, and answers address requests by itself as they arrive through MOR; the Bitcoin key stays in the wallet. Its cost is said where it is made; replacing it is a new payee pointer naming a new key.
- **The vault** is set in Kišib (it changes what the identity's chain declares); Damgar shows it.
- **Collective payments and splits** are round 2.
- **Anchoring** is asked in Edubba for a collective's acts, and in Ummia for a release under one's own name (F339), and kept simple (decided by Nobody, allegedly): it shows that anchoring exists. A request from Edubba appears in To sign, is paid on regtest to the pooled service, and its ticket is shown; no tier beyond what the offer states, no refund or default handling here.
- **A money message it cannot read** is shown unknown in To sign, never guessed, nothing signed for it; it may be set aside (the messages cMIP, section 6).

## Costs, stated

- The signing key and the request key are held in software, in the program's folder or the browser's storage: a prototype, never for a real identity.
- The web client follows no chain: an on-chain payment there is shown paid, not checked; an anchor's ticket deadline is shown unchecked, said on its screen.
- The chain Damgar follows on a computer is a regtest node it trusts, said where it is used.
- The rails' own costs, shown before a rail is declared (`LIGHTNING_COSTS`, `ONCHAIN_COSTS`).

## Tests

`npm test` (Node, and headless Chromium for `browser.test.ts`; `MOR_CHROMIUM` names the browser):

| Test | What |
| --- | --- |
| `tip.test.ts` | A tip prepared in Dub, signed in Damgar, its invoice made by a test node (real BOLT 11), paid, claimed, verified, receipted; invoices from another node, for another amount, or with a plain description, refused. |
| `requests.test.ts` | A request to be paid, asked in Dub and sent from Damgar: accepted as a debt (the obligation), paid, the debt shown unknown (M5). Under a Module not accepted: shown unknown, never signed; an invoice request on a rail the payee does not accept, refused, saying why. A message it cannot read (an undefined type, an undefined key): shown unknown, nothing signed, set aside. |
| `accepted.test.ts` | The accepted list: asked at first use, sealed at the homes, read by a second Damgar, another app's part kept, nothing in the clear; two apps writing at once (the fork shown and merged against the last common version, an addition and a removal both kept); private by default, published only by choice, and withdrawn. |
| `onchain.test.ts` | On-chain: the address bound to the payment, answered by the payee's Damgar with its request key; pending, then valid at six confirmations; the receipt; the request key replaced. The web client says it follows no chain. |
| `anchor.test.ts` | An anchor of a collective's act: asked in Edubba, its ticket checked, paid from Damgar, anchored by the test service, checked in Edubba; the unchecked deadline said where no chain is followed. |
| `vault.test.ts` | A vault declared in Kišib, shown in Damgar; above its limit, a payment goes to the vault and verifies there. |
| `browser.test.ts` | By clicks, in Chromium: the web client and the program's page, a tip from Dub to a receipt, Settings, nothing of a chain key kept; Edubba's payment and anchor; Kišib's vault fields. `MOR_SCREENSHOTS=DIR` keeps every screen. |
| `regtest.test.ts` | On regtest, with real btcd and lnd (skipped unless `MOR_LN_REGTEST` names the network's folder): a tip, an on-chain payment and an anchor, each paid from the test wallet. |
| `desktop.test.ts`, `web-build.test.ts`, `build/reproducible.test.ts` | The Mac app and the Linux desktop entry; the release in `built/` (fingerprints, banner, icons), built twice the same, the page asking only for operations both sides answer, `check`, the tint (H36); the release rebuilt byte for byte (`npm run test:build`). |

## Using it

On the Mac: `npm install` here and in `../desk` and `../dub`, then `sh scripts/make-app.sh` (Damgar in `~/Applications`). On Linux: `sh scripts/make-desktop.sh`. For on-chain payments on regtest, once: `npm start -- --regtest RUN_DIR` (`docs/damgar-regtest.md`).

## The web client (testing only)

As Dub's (`clients/dub/README.md`, "The web client"): `npm run release` (or the GitHub workflow `release-damgar-web.yml`, on a merge message containing `[release damgar web]`), then serve `built/` as Kišib's is. `node --import tsx src/cli.ts check URL` says SAME. Not done here: a later machine session.
