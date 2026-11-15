# The hosts' bank: orders

*Round two only. The hosts hold the coins this round, openly: one account per identity, kept by the postman over the hosts' regtest Lightning nodes. A stand-in for this simulation, not a MIR and not a cMIP.*

## In plain words

Your money sits in an account in your identity's name. It moves only on an order your identity signs with its own MOR signing key; the postman checks that signature with the core library against your identity's chain, and that check is the only thing it checks about anyone's bytes. Payments to other players are real Lightning payments: the payee asks the bank for an invoice, the payer orders the bank to pay it, the nodes do it, and the preimage you get back is real. Sends to an address are real on-chain transactions. What the node answers comes back to your `in/` byte for byte. Whole sats only.

## Precisely

**The act.** An everyday act, public, of spec `sha256("MOR ROUND 2, THE HOSTS BANK ORDER, draft 1, test value")`, type 0, signed by the identity's signing key, bound to the newest chain act the bank can show for it, on a line of its own (the kit's `bank` line; never published). Its payload is a CBOR map with text keys:

| Key | Value |
| --- | --- |
| `do` | `open`, `balance`, `invoice`, `pay`, `send` or `address` |
| `tray` | the tray it is sent from (the folder's name) |
| `n` | a whole number from 1, larger than the last order the bank accepted for this identity |
| `amount` | whole sats, an unsigned integer from 1 (`invoice`, `send`; `pay` only for an invoice naming no amount) |
| `memo` | text, at most 256 bytes (`invoice`, or `hash`, not both) |
| `hash` | 32 bytes: the invoice's description hash (`invoice`) |
| `expiry` | seconds, 60 to 2,592,000; default 604,800 (`invoice`) |
| `invoice` | a BOLT 11 invoice (`pay`) |
| `fee` | the most you pay in routing fees, whole sats; default 10 (`pay`) |
| `address` | a regtest address (`send`) |
| `feerate` | sats per virtual byte, default 1 (`send`) |

No other key is read: an order carrying one is refused.

**The letter.** `{"letter": 1, "to": "bank", "order": BASE64, "chain": [BASE64, …]}`: `chain` carries the acts that show the identity's chain to a reader holding nothing else: its chain acts, and after a rotation its homes' receipts and their operators' chain acts (at most 256). The bank keeps what it was shown, so a later letter cannot make it forget a rotation.

**The checks, in order.** The order is an act the core library reads, of this spec and type, public. The identity's chain, from what the bank holds and the letter carries, can be followed (a rotation waiting for its homes' receipts counts only once they are shown; the chain counts up to its last counted act). The order is bound to the newest chain act shown, and the core library judges it valid. The payload is as above. Its tray is the tray it came from, and the account's. Its `n` is unused. Any failure: refused, nothing moves, the reason said.

**What each does.**

- `open`: opens the account, empty, kept for this tray. Starting money is credited by the hosts afterwards: a company's first account opened gets 2,000,000 sats; a public window's identity gets the budget its tray's `addresses.md` lists for it (`identity, budget` per line).
- `balance`: the account and its last movements.
- `invoice`: an invoice made by one of the hosts' receiving nodes (bob or carol, whichever the paying node can reach best). When it is paid, by anyone, the account is credited and a notice arrives in `in/`.
- `pay`: pays an invoice from the hosts' paying node (alice). The amount and up to `fee` are held first; the amount and the fee actually paid are debited (a fee in millisats is rounded up to whole sats). A failed payment releases what was held. An invoice in millisats that are not whole sats is refused.
- `send`: an on-chain send from alice's wallet; the amount and the fee actually paid are debited (5,000 sats per sat/vbyte are held while it is made).
- `address`: a new address of alice's wallet, credited to this account for whatever arrives at it once one block confirms it.

**What comes back.** `in/NAME.answer.json`: `outcome` (`done`, `refused`, `failed`, or `unsettled` when the node did not say whether a payment went through: the amount stays held until the hosts settle it), the order's id and number, the account (`balance`, `held`, `available`), and `wallet`: the node's command (its subcommand and arguments only) and exit status. `in/NAME.answer.body`: the node's answer, byte for byte.
