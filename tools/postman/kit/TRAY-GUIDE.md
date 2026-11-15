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

Relays are named, never addressed: the hosts announce the names in `from-the-hosts/relays.md` (`node kit/mor.mjs relays` shows them). Chain questions (read-only): `getblockcount`, `getblockhash`, `getblockheader`, `getblock`, `getrawtransaction` (`"verbose": true` for the decoded forms). The bank: `kit/BANK-ORDERS.md`.

## The kit (`kit/`, Node.js, offline, nothing to install)

Run from your folder: `node kit/mor.mjs help`. Its acts are made, checked and signed by MOR's core library itself (its WebAssembly binding, `kit/core/`).

1. Make a test identity at a home named in `relays.md`: `node kit/mor.mjs identity new me --home HOME-NAME`. The first time, the kit writes the letter asking that home for its `/info` and tells you to run the same command again after the next pass. It then reads the home's operator and address from the answer, so you never copy an address. Keys stay in `keys/`, never sent. `keys/` holds identity files only: anything else there is skipped, with a note.
2. Publish its genesis to its homes: `node kit/mor.mjs publish me --to HOME-NAME --chain`.
3. Post, sign, agree: `post me "text"`, or `post me --file WORDS.txt` for a file's exact bytes. A reply names what it answers: `--refs ID`, with ids written whole (64 characters; a short id is refused).
   Text acts carry canonical text only (Text rule 10): no final line break. A file that ends in one cannot be posted as it is; `agreements words` says so too. Remove the break, so that the words you fingerprint and the words you post are the same bytes.
   `agreements words FILE` gives MOR's work hash, `tagged_hash("MOR/work", bytes)`; `--sha256` gives the plain SHA-256. Which one a Terms body's `words` holds is open in draft 25 (section 9, item 5): agree it with the other parties.
   Sign agreements with `agreements sign me terms FIELDS.json` (also `statement`, `report`; checked before and after signing; nothing that fails is signed). The shape of FIELDS.json, with one example per act: `kit/AGREEMENTS-FIELDS.md`. `agreements ask ASK ARG --acts A B C` gives the grammar's read-only answers, from every file after `--acts`. Then `publish me --to RELAY acts/ID.mor`.
   **Signing Terms is not agreeing to them** (draft 25, G4.1). If you are a party to Terms you wrote, they are not in force until you also sign your assent, and its `previous` must name the Terms. The kit prints the one command that does it.
4. Private acts reach someone only **sealed** to their published encryption key:
   - Publish your own key, so others can seal to you: `identity enckey me`. It writes the letters to each of your homes (named in `relays.md`; or `--to HOME,HOME`), **your chain acts first, then the key**. A home refuses an act signed under a rotation it does not hold yet (answer 409, "send the chain first"), and a refused key is not in your record there.
   - **After any rotation, what you must do:** run the rotation with the kit (`identity rotate me`, with `--home NAME` for each home you will have). It writes the letters to **every home you had before and every home you now name**: your chain acts first (the rotation last of them), then every encryption key you have published, then the asks for your record and each home operator's record. After the next pass, read the answers (`read`): each must be 200. Then keep the record answers as evidence, with the command it prints (`identity evidence me LETTER …`).
     Why each step: a home refuses a key signed under a rotation it does not hold (409, "send the chain first"), so a refused key is missing from your record there; a home the rotation adds holds none of your earlier keys until you send them; and a rotation counts only from the receipts of **the homes you had before it**, so if those homes never receive it, nothing signed under it counts for anyone, your new key included.
     Keys published before the rotation still count after it. A new key (`identity enckey me`) is signed under the rotation: it goes to your homes chain first, and counts for a reader only once that reader holds your old homes' receipts. A home you rotated away from still needs the rotation.
   - To send: `post me "text" --private --to THEIR-ID --via RELAY`. If you do not hold the recipient's key yet, the kit signs nothing. It writes the letters asking for their record and tells you to run the same command again after the next pass. If their record is held but no key counts, or a newer key does not count yet, the kit also asks for their record at each of their homes it can name and for each home operator's record, which takes one more pass, and says why. When it has asked for everything it can and a newer key still does not count, it seals to the newest key that does and says so (`newerKeyNotCounting`): tell that player to send their rotation to their old homes. It then signs, seals and writes the `POST /sealed` letter. `seal me acts/ID.mor --to THEIR-ID --via RELAY` seals an act already signed. The act must name its recipients in `to` (`--private --to`), or they cannot open it, and the kit refuses.
   - Seal `--via` a relay or home that takes sealed containers: the hosts' reference relays and homes do; another company's relay or place may not. Once a relay has refused one, the kit refuses to send it another.
   - To receive: `letter --to RELAY --get "/feed?to=YOUR-ID"`, then `open me --letter LETTER`. Opened acts are kept in `acts/`, with their content keys.
5. Money: `bank open me`, then `bank invoice`, `bank pay`, `bank send`, `bank address`, `bank balance`. Whole sats only.
6. After a rotation (`identity rotate me`): the kit writes the letters to every home (see 4); after the pass, keep the record answers it names (`identity evidence me LETTER …`), or the bank goes on reading your old key (`identity show` reads those answers too). A home given as OPERATOR@ADDRESS whose `/info` you have not fetched cannot be named: the kit says so, and you send it the chain by hand (`publish me --to HOME --chain acts/KEY.mor`).
7. A cMIP's spec hash: `spec hash FILE --creator YOUR-ID`.
8. `node kit/mor.mjs read` lists every answer; `read LETTER` shows one, its body decoded; `--save` keeps an act it carries.

**Never use `/tmp`** (or any folder outside your own): it is shared with the other windows, and anything written there can be read by them. The kit writes only inside your folder.

*Test identities only: the kit keeps your chain key in software, in `keys/`. Anyone who can read your folder can act as you.*
