# The round-two postman and the players' kit: report

*15 November 2026. Dubsar Suite, a build session for the suite lead, branch `claude/round-2-postman` on `claude/agreements-verifier-2` (at f1a13feb). A record of work, not a decision. Test identities only, regtest only; no server address, port, key or seed in the repository.*

**The wishes** (Nobody, allegedly): "I wanted the attack to focus on the code they create (can include relay) and the core loopholes. No attacks on hardware". On wallets: "Second is fine for this simulation, I agree".

## What was built

All in `tools/postman/`; nothing in `spec/`, `core/`, `wasm/`, `relay/` or `clients/` changed.

- **The postman** (`postman.mjs`, `lib/`): Node.js 20+, no dependencies. Carries letters from each tray's `out/` to the relays named in the hosts' configuration and writes the answers, verbatim, to `in/`; Fable's six rules as listed in its README. Commands: `run`, `once`, `check`, `fund`, `bank`, `kit`.
- **The bank** (`lib/bank.mjs`, `kit/BANK-ORDERS.md`): one account per identity, kept for the tray that opened it.
- **The players' kit** (`kit/`): plain JavaScript (`mor.mjs`), the core library's WebAssembly binding in `kit/core/` (built on GitHub with the pinned tools; byte for byte the binding of `clients/kishib/built` on f1a13feb; CI compares it with a fresh build). Test identities and rotations, posts, any everyday act, the new Agreements acts (Terms, Statement, report: built by the binding's builders, checked with a throwaway key before signing and again after, nothing that fails signed), the grammar's read-only answers, letters, signed bank orders, chain letters, reading answers.
- **The tray guide** (`kit/TRAY-GUIDE.md`, one page; `postman kit --send` puts it in `from-the-hosts/tray-guide.md`).
- **Tests** (`npm test`, 15, all passing here): see the README. On GitHub, a regtest step runs the bank against the real lnd and btcd.

## The design of money

Option (a) of the brief, simplified where it could be. A ledger of accounts, one per identity, over the hosts' three nodes. Starting money is a ledger credit backed by alice's coins (`postman fund`), which replaces `_hosts/fund.sh`. A payment to another player is a real Lightning payment: the payee's order makes an invoice on bob or carol (whichever alice can reach best), the payer's order pays it from alice; the payee is credited when the node shows it settled. The preimage, payment hash and fees come back verbatim, so Lightning rail proofs are real. Sends to any address are real `sendcoins` from alice, with the actual fee debited. An `address` order gives an alice address whose confirmed deposits are credited. Orders are everyday acts of a stand-in spec, signed by the identity's signing key, numbered, naming their tray, checked with the core library against the identity's chain (receipts included after a rotation). Whole sats are enforced in the kit, in the bank's reading of the order, and on invoices (millisats refused, fees rounded up).

## What does not hold, or holds only partly

1. **The on-chain rail between players does not close the loop.** MOR's on-chain rail pays to an address derived from the payee's own key and the payment's commitment (`onchainPayTo`). The bank can send there for real, and the chain letters let anyone check it, but the coins then sit at a key the payee holds offline with no way to spend them: the kit signs no Bitcoin transaction and the bank does not watch such addresses. Lightning is whole; on-chain between players is one-way.
2. **Lightning liquidity.** All payments leave alice toward bob and carol; up.sh opens 5,000,000-sat channels. Seventeen companies at 2,000,000 each can move about 10,000,000 sats in total before payments fail for want of room. Payments fail cleanly (released, said), but the hosts will need larger channels, or to move coins back from bob and carol between windows. Not built: a rebalancing command.
3. **An unsettled payment** (the node says neither yes nor no) stays held; the hosts settle it by hand. Direct regtest channels should not produce it.
4. **The bank follows a rotation only from its homes' receipts.** That is MOR's own rule, but it means that, until a player shows the receipts (`identity evidence`), a thief holding the old signing key can still spend. The tray guide says so.
5. **Races in the trays.** The checks for links are made before each opening and again by the opening itself, but a player swapping `in/` for a link at the exact moment between the check and the write could still redirect one answer. That needs control of timing inside the shared folder, which is the machine, not MOR.
6. **`/probe` is off** by default: it makes a relay fetch addresses a player chooses, which on one machine are its local ports, the hardware Nobody, allegedly, put out of bounds. Enabling it is the hosts' choice.
7. **The kit is JavaScript, not TypeScript** (CLAUDE.md: TypeScript for clients): the windows' Node version is unknown and no package can be installed there, so the kit avoids any build step or type stripping. Stated, not hidden.
8. **The public windows' `addresses.md`** must name identity hashes. A line naming a person by a nickname is skipped and said; the old address column is ignored.

## For the decision of Nobody, allegedly (through the suite lead)

1. Whether on-chain payments between players should be possible this round (point 1): leave it one-way, or have the bank watch rail addresses and credit them.
2. Channel sizes, or a rebalancing step between windows (point 2).
3. Whether `/probe` is allowed (point 6).
4. Whether fund.sh has already run; if so, which coins count.

## After window one (second edition, 15 November, evening)

Built from the players' reports, as the suite lead listed them:
- **Sealing.** `identity enckey` makes an encryption key: version 1 first, each later one naming the one before, the secret kept in `keys/`. `post --private --to … --via RELAY` and `seal` seal an act to each recipient's published key, using the binding's `seal()` and the key's own version history as the core library's verifier reads it from the `/identity` records held. They write a `POST /sealed` letter in the relay's `{0: bytes}` form. A recipient with no key held is refused with the next step to take, before anything is signed. `open` opens a container or a `/feed?to=` page with every secret the identity holds. It was tested end to end through the reference home.
- `post --refs`. `sign` and `post` now refuse non-canonical text, as the Agreements builders do. `agreements ask` with no ask lists the asks.
- **Chain answers carry no error output** (it named a path on the hosts' machine): it goes to the hosts' log only. Bank answers keep a node's message with paths and addresses replaced.
- `relays` and `help` show `from-the-hosts/relays.md`.
- **No temporary folder.** Nothing in the kit or the postman writes outside the player's folder or the postman's own; a test reads the sources to keep it so, and the tray guide says never to use `/tmp`.
- `postman kit --send --update` replaces the kit's files only.

## After window two (third edition, 15 November, night)

Built from window two's reports, as the suite lead listed them:
- `--acts A B C` and `--held A B` take every file up to the next flag.
- Anything in `keys/` that is not an identity file is skipped with a note. A window-one encryption-key file is taken into its identity when its secret's public half matches an encryption-key act in `acts/` signed by that identity; the file is left where it is.
- `identity show` reads the identity's evidence and the `/identity` records held in `in/`.
- **Sealing to someone whose key is not held** no longer fails. The kit writes the record letters (to the relay named and to the signer's own homes known by name), signs nothing, and says to run again after the next pass.
- Sealing is refused for an act not addressed to its recipients (they could not open it).
- Sealing is refused at a relay that has already refused a sealed container (404, 405, 501). The tray guide says that the hosts' reference relays and homes take sealed containers and other relays may not. *The kit cannot know before a first refusal:* the first container sent to such a place is lost.
- `kit/AGREEMENTS-FIELDS.md`: one worked example per act. Each shape is signed and checked in the tests. `previous` is one id or `null`, never `[]`.
- **The author's assent:** when the signer of Terms is one of their parties, the kit says plainly that the Terms are not in force (G4.1) and writes the assent's fields, with the one command that signs it.
- `identity new --home NAME` reads the operator and address from a held `/info` answer at that name, writing the letter first.
- `spec hash FILE --creator ID`: the hash comes from the core library's own `decodeSpec`, over `{0: kind, 1: creator, 9: text}` (kind 0 unless `--kind`), the file read as Development rule 26 reads it.

**A finding while building (for the suite lead, and for Kišib).** Draft 25, section 3.2: "an author who signed the Terms names them in the `previous` of their assent". An author's assent with `previous: null` passes the checker (the bytes are well formed), but it forks the author's own line with the Terms act: the grammar verifier then answers *not shown* for in force (G4.1). With `previous` naming the Terms, it answers *shown*. The kit now offers the assent with `previous` set. Kišib's own test (`clients/kishib/test/agreements-new.test.ts`, the assent after Terms) signs an author's assent with `previous: null`, and its screen does not warn of it. Kišib should look at this. This may be part of what the five windows met.

## After window three (fourth edition, 16 November, night)

**Encryption keys missing from records: what was found.** It was reproduced on the reference home, step by step (genesis, rotation, key; in each order).
1. **The record serves every encryption-key act the home holds for the identity** (`relay/src/node.rs`, `identity_record`: every public act of the Envelopes spec, type 4, signed by the identity, in arrival order). No case was found where an accepted key was left out.
2. **A key signed under a rotation that has not yet reached the home is refused**: 409, error 3, "send the chain first". It is not stored, so it is not in the record. This is the relay doing what the transport cMIP asks. Players who publish their key before (or without) the rotation at a given home get exactly this. The kit's `publish` sent only what it was given. **Fixed in the kit:** `identity enckey` now writes the letters to each home in the right order: the chain acts first, then the key.
3. **A key signed under a rotation counts for a reader only once the rotation does.** A rotation counts only from its homes' receipts, and a reader checks those receipts against each home operator's own chain. That chain is not in the identity's record: it comes from `GET /identity/OPERATOR`. A reader holding only the identity's record sees the rotation pending and the key "unknown" (Counterparty's report, exactly). **Fixed in the kit:** when a recipient's record is held and no key counts, the kit asks for the records of that identity's homes' operators, says why, and seals on the next try.
4. **The kit ignored a record fetched with a query** (`/identity/ID?parts=…`). Worse, the postman refused such a letter, since commas were not allowed in a query. Both are fixed. This may explain "found by some senders and not others".

Not verifiable from here: whether Ampersand's and DubPay's keys were answered 200 or 409 at each home. Their trays' `in/` answers to those letters will say. An "accepted" key that is still missing would be new; I found no such case. For the MOR lead, an observation, not a bug: the identity record carries the receipts but not the chain of the operator who signed them. Every reader therefore needs a second request before a rotated identity's encryption key, routes or anything signed under the rotation counts. The cMIP could serve the operator's chain acts in the record (part 10, "carried", already does this for inclusion proofs).

**Also fixed:**
- `--refs`, `--to` and `--acks` refuse an id that is not written whole, and say so ("a short id is not enough").
- `agreements words` names its hash exactly (`tagged_hash("MOR/work", bytes)`) and offers `--sha256`, choosing neither: draft 25, section 9, item 5, open.
- `post --file FILE` posts the file's exact bytes. **Finding:** a final line break is not canonical text (Text rule 10), so a text act can never carry the bytes of a words file that ends with one. The kit refuses such a file plainly, `agreements words` reports it (`postable: false`), and the guide tells the player to remove the break. It does not quietly remove it.

## After window three, second pass (fifth edition, 16 November, night)

**The keys, reproduced at three homes** (the reference relay, `tests`: "encryption keys and rotations at three homes, in each order"). Identity made at home-1; a key; a rotation adding home-2 and home-3; the key published again or not; and the reverse order (rotation first, key under it, sent before the rotation reached a home).
- Every key a home answered 200 for is in that home's `/identity` record. No case of "accepted but missing" was found on the reference relay.
- A key signed under a rotation, sent to a home that serves the identity but lacks the rotation: **409**, not kept, missing from the record. Sent again after the rotation: 200, in the record.
- A key sent to a home the rotation adds, before the rotation: **200**. That home does not yet serve the identity, so it does not check the binding (cMIP, "Publishing an act", 1, as written); it keeps the act and serves it once the rotation arrives. A player who sees 200 there and 409 at the old home could fairly report "accepted".
- A key signed under the genesis, then a rotation adding homes: the new homes' records have **no key** until it is sent to them. The old kit's next step did not say to. This matches "absent from the record" for a key that was accepted somewhere else.
- **Why Counterparty read "unknown".** A rotation counts only from the receipts of the homes the identity had *before* it. A home the rotation added carries only its own receipt in its record. A reader holding only that record, even with every operator's record, cannot count the rotation. So a key signed under it is "unknown". The kit asked for operators' records only. It now also asks for the recipient's record at each of its homes it can name.

What happened to Ampersand's f355512a… and DubPay's 09b6b898… cannot be settled from here. Their trays' answers to those letters (200 or 409, at which home) will say. The steps above are the likely causes, all on the players' and the kit's side.

**For the MOR lead, a finding, not a fault:** an identity record at a home a rotation added does not carry the receipts that make the rotation count (those of the homes before it), nor the operators' chains that check them. Every reader therefore needs two to three more requests, at the right homes, before anything signed under a rotation counts. The cMIP could have a home serve the receipts it holds for the identity from other homes (the rotation's quorum), as part 10 ("carried") does for inclusion proofs. Nothing in `relay/` was changed.

**Changed in the kit:**
- `identity rotate` writes the letters to every home before and after the rotation: chain acts, then every encryption key held, then the record asks. Its next step names the exact `identity evidence` command. Homes the kit cannot name are listed, to be sent by hand.
- `identity enckey --to HOME` was broken by the whole-id check (it read `--to` as identity ids). Fixed. Homes given as OPERATOR@ADDRESS are named from held `/info` answers.
- Sealing reads every encryption-key act in every held record. Where a newer version than the one that counts is held, the kit asks for the missing records (the recipient's record at each named home, each operator's record), never asking twice for one still waiting. When nothing more can be asked, it seals to the newest key that counts and says so (`newerKeyNotCounting`), never silently.
- The tray guide says plainly what a player must do after a rotation, and why.
- `--refs` with a short id: the message now says "refs need full 64-character act ids" and where to copy them from.
- `post --file`: its note no longer claims a final line break is kept (such a file is refused, Text rule 10).

**Funding of DAO members.** A tray in both `companies` and `public` was already credited the company sum once (its first account) and each `addresses.md` line once, across runs. But within one run, an identity listed twice in `addresses.md`, or a tray named twice in `public`, was credited twice. **Fixed:** an identity is credited once, from its first line; the second is skipped and said. The company's own identity, if listed in `addresses.md`, gets both the company sum and its line: they are two credits, as configured. Tested, with a dry run first.

## State

A draft pull request against `claude/agreements-verifier-2`, not to be merged. CI: in the pull request.
