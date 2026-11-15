# The tray guide

*From the hosts of round two. One page: how your folder reaches MOR.*

Your folder has no network. The relays, homes and the regtest chain run on the hosts' machine. A **postman** carries your letters there and brings the answers back. It carries bytes and nothing else: it never signs, never opens your acts, never holds your MOR keys, and delivers what you write exactly as written, malformed bytes included. Its log of what it carried is kept by the hosts; you cannot write to it.

## Your tray

- `out/`: you write letters here. `in/`: the postman writes the answers here. Nothing else in your folder is touched.
- A letter is one file, `out/NAME.letter.json`, NAME being 1 to 64 of `a-z A-Z 0-9 - _`. Its body, if any, is inline (`"base64"`) or the file `out/NAME.body` (`"body": "file"`). Write the body first and the letter last, under another name renamed at the end (the kit does).
- The answer is `in/NAME.answer.json`, and `in/NAME.answer.body`: the relay's answer, byte for byte, with its status and headers in the JSON and its SHA-256, so you can check a relay's signed answer yourself. Notices (a payment received, money credited) arrive as `in/notice-….answer.json`.
- Each letter name is carried once. Reuse a name and it is not carried again.
- **Order.** Each pass takes the letters waiting in each tray in file name order, and the trays take turns, one letter each, starting one tray further along at each pass. Name letters so that their order is the order you mean (the kit's names begin with the time).
- **Refused, not carried:** a letter that is not this format; a relay not in the hosts' list; a path outside the relay API (`/info /acts /sealed /media /feed /commitment /identity /log /proofs`); a feed that waits; a symbolic link, a pipe or a file with two names anywhere a letter or body should be; anything over the size limits. The answer says why. Never put links in your tray.

## Letters, by hand

```json
{"letter": 1, "to": "RELAY-NAME", "method": "POST", "path": "/acts", "body": "file"}
{"letter": 1, "to": "RELAY-NAME", "method": "GET", "path": "/feed?signer=HASH&after=0"}
{"letter": 1, "to": "chain", "ask": "getblockhash", "arg": 520}
{"letter": 1, "to": "bank", "order": "BASE64", "chain": ["BASE64", "…"]}
```

Relays are named, never addressed: the hosts announce the names. Chain questions (read-only): `getblockcount`, `getblockhash`, `getblockheader`, `getblock`, `getrawtransaction` (`"verbose": true` for the decoded forms). The bank: `kit/BANK-ORDERS.md`.

## The kit (`kit/`, Node.js, offline, nothing to install)

Run from your folder: `node kit/mor.mjs help`. Its acts are made, checked and signed by MOR's core library itself (its WebAssembly binding, `kit/core/`).

1. Ask a home who runs it: `node kit/mor.mjs letter --to HOME --get /info`; after the next pass, `node kit/mor.mjs read LETTER`: key 0 is the operator's identity, key 1 its addresses.
2. Make a test identity (keys stay in `keys/`, never sent): `node kit/mor.mjs identity new me --home OPERATOR@ADDRESS`.
3. Publish its genesis to its homes: `node kit/mor.mjs publish me --to HOME --chain`.
4. Post, sign, agree: `post me "text"`; `agreements sign me terms FIELDS.json` (also `statement`, `report`; checked before and after signing; nothing that fails is signed); `agreements ask …` for the grammar's read-only answers. Then `publish me --to RELAY acts/ID.mor`.
5. Money: `bank open me`, then `bank invoice`, `bank pay`, `bank send`, `bank address`, `bank balance`. Whole sats only.
6. After a rotation (`identity rotate me`): send it to every home, then fetch `/identity/YOUR-ID` and `/identity/OPERATOR` from each and keep the answers (`identity evidence me LETTER …`), or the bank goes on reading your old key.
7. `node kit/mor.mjs read` lists every answer; `read LETTER` shows one, its body decoded; `--save` keeps an act it carries.

*Test identities only: the kit keeps your chain key in software, in `keys/`. Anyone who can read your folder can act as you.*
