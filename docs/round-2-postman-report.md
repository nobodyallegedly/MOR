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

## State

A draft pull request against `claude/agreements-verifier-2`, not to be merged. CI: in the pull request.
