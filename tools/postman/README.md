# The postman (round two)

*For the hosts of MOR's round-two simulation, Nobody, allegedly, and the Dubsar Suite lead. Test identities only, regtest only. Built on the decision of Nobody, allegedly: a courier ("I wanted the attack to focus on the code they create (can include relay) and the core loopholes. No attacks on hardware") and the hosts holding one wallet per player ("Second is fine for this simulation, I agree").*

## In plain words

The players' windows have no network. Each can write only its own folder. The postman is a small program on the Mac that looks into each player's folder, takes the letters it finds in `out/`, carries them to the relays and homes, and puts the answers in `in/`. It carries bytes and nothing else: what a player writes, even nonsense or an attack, reaches the relay exactly as written, and what the relay says comes back exactly as said. It never signs, never opens an act, never holds a player's key.

It also keeps the hosts' **bank**: an account per player identity, over the regtest nodes. A player moves money only by an order signed with its own MOR key; the postman checks that signature with the core library (the one thing it checks). Payments between players are real Lightning payments made by the nodes (invoice on bob or carol, paid from alice); sends to an address are real on-chain transactions. Whole sats only.

**Start it** (in Terminal, from the MOR folder; Node.js 20 or later, nothing to install):

```
node tools/postman/postman.mjs check --config ~/Documents/mor-round-2/_hosts/postman/hosts.json
node tools/postman/postman.mjs run   --config ~/Documents/mor-round-2/_hosts/postman/hosts.json
```

`check` first: it says whether every tray, relay and node answers. `run` then carries letters pass after pass (every 5 seconds by default) and prints one line per letter.

**Stop it:** Ctrl-C. It finishes the letter in hand, then stops. Ctrl-C twice stops at once (a letter cut off then is never carried again; its answer may be missing).

**Its log:** `~/Documents/mor-round-2/_hosts/postman/log/carried.jsonl`, one line per letter carried or refused: when, which tray, which letter, where to, the SHA-256 and size of what it sent and of what came back, the outcome. The bank's journal, every movement of money: `_hosts/postman/bank/journal.jsonl`; its accounts: `_hosts/postman/bank/state.json`. Players cannot write there (it is outside every player's folder; the postman refuses to start if its folder lies inside a tray).

**The relays' names:** in the hosts' configuration (`hosts.json`, copied from `hosts.example.json` and kept with the hosts, never in the repository), `"relays"` maps a name to the relay's local address, for example `"dubsar-home-1": "http://127.0.0.1:…"`. Players name relays only by these names; they never see an address or a port. Tell the players the names.

**Other commands** (each with `--config`): `once` (one pass); `fund` (shows the starting money it would credit; `fund --send` credits it: 2,000,000 sats to each company tray's first account opened, and to each public identity the budget its tray's `addresses.md` lists, once each); `bank` (every account, the total, and what the nodes hold); `kit` (shows, and with `--send` copies, the players' kit into each tray as `kit/`, and the tray guide into `from-the-hosts/tray-guide.md`, wherever there is none; with `--send --update`, replaces the kit's own files and the tray guide in every tray, and touches nothing else of the player's: not `keys/`, not `acts/`, not a file the player added inside `kit/`; a `kit/` that is a link is refused). The relay names players see come from `from-the-hosts/relays.md`, which the hosts write.

**Replaces `_hosts/fund.sh`.** fund.sh sent on-chain coins to addresses players wrote; with the bank, players hold no wallet, so those coins could not be spent. `postman fund` credits the bank accounts instead. If fund.sh already ran, its coins sit at the players' own addresses, outside the bank, and should not be counted again. `_hosts/mine.sh` stays as it is: the postman mines nothing.

## Precisely

| File | What |
| --- | --- |
| `postman.mjs` | The command line: `run`, `once`, `check`, `fund`, `bank`, `kit`. One postman at a time (a lock file in its folder). |
| `lib/courier.mjs` | A pass: the trays' waiting letters, carried in the stated order; answers written; the bank polled after. |
| `lib/trays.mjs` | The careful handling of trays (below). |
| `lib/bank.mjs` | The accounts, the signature check, the orders, polling invoices and deposits, funding. |
| `lib/wallet.mjs` | `LncliWallet` (lncli and btcctl, each called with an argument list, never a shell) and `MockWallet` (tests). |
| `lib/config.mjs` | The hosts' configuration, checked. |
| `kit/` | The players' kit: `mor.mjs`, the binding in `kit/core/` (`BUILT-WITH.txt`), `TRAY-GUIDE.md`, `BANK-ORDERS.md`. |

**Fable's six rules, as built.**

1. *Bytes and nothing else.* A relay letter's body is sent as read; nothing is parsed but the envelope. No key of any player is read (the kit keeps keys in `keys/`, which the postman never opens).
2. *No cleaning.* Malformed bytes go to the relay the letter names, under its path; the relay's own refusal comes back.
3. *Careful handling.* Fixed names only (`out/NAME.letter.json`, `out/NAME.body`, `in/NAME.answer.json`, `in/NAME.answer.body`); a strict envelope (any other field refused); a size limit on each (1 MiB envelope, 16 MiB body, 64 MiB answer, settable); symbolic links refused, never followed (checked before opening and again by opening with `O_NOFOLLOW`); pipes, devices and files with a second name (hard links) refused; `out/` or `in/` that is a link, or leads elsewhere, refused whole; nothing in `in/` is written over (new files only, `O_EXCL`); no path a letter names is ever opened; nothing from a tray is run; relay redirects not followed.
4. *One tray per player.* A letter's answer goes to its own tray; bank notices to the account's tray only; a signed order names its tray and an account is kept for one tray.
5. *Verbatim replies.* Status, every header, and the body bytes, with the SHA-256 of what was sent and what came back; the bank's answers carry the node's output byte for byte.
6. *A log players cannot write, and a stated order.* Each pass takes each tray's waiting letters in file name order (byte order, at most 50 per tray); the trays take turns, one letter each, in the configuration's fixed order, starting one tray further along at each pass. A letter name is carried at most once (marked as taken before it is sent).

**The paths a letter may name:** `/info`, `/acts…`, `/sealed…`, `/media…`, `/feed…`, `/commitment`, `/identity/…`, `/log/…`, `/proofs`: the reference relay's API (`relay/src/http.rs`). `/manage` is never allowed. `/probe` is off unless the hosts list it in `"paths"`: a probe makes a relay contact addresses a player chooses, which on one machine means its local ports (see the report). A feed that waits (`wait=` other than 0) is refused, since letters are carried one at a time.

**The bank:** `kit/BANK-ORDERS.md`. Chain letters (`"to": "chain"`): read-only btcctl questions (`getblockcount`, `getblockhash`, `getblockheader`, `getblock`, `getrawtransaction`). A chain answer carries the exit status and the answer only. The tool's error output names the hosts' machine, so it goes only to the hosts' log. In a bank answer, a node's error message is kept, with every path and address of the hosts' machine replaced.

## Tests

```
cd tools/postman && npm test
```

A real home (the reference relay, built by cargo), an echo relay that records what reaches it, and the stand-in wallet: an identity made offline, a post, Terms and an assent signed, letters carried and answers compared byte for byte with the relay's own; malformed bytes delivered unchanged; links, hard links, pipes, planted answers and a linked `in/` refused and logged; letters never crossing trays; the order of a pass; the bank's refusals (a forged signature, a replay, another tray, a key replaced by a rotation once the home's receipt is shown, a post given as an order); whole sats (text, a CBOR fraction, an invoice in millisats); payments, failures, sends and deposits; the public budgets; the exact lncli and btcctl arguments. On GitHub, `test/regtest.test.mjs` runs the bank against the real regtest network (step "tools/postman on regtest"), and the kit's binding is compared byte for byte with the one built from the branch.
