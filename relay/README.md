# mor-relay

MOR relays and homes, in Rust. Roadmap step 4.

## In plain words

A relay is a web server that keeps acts. A home is a relay with a few more duties: it keeps identity chains, gives a signed receipt for every genesis and rotation it accepts, keeps a numbered log of those receipts, and signs a fingerprint of the whole log (a log summary) each time it grows. This program is both: the same code runs as a basic relay or as a home.

It speaks the relay transport cMIP (`cmips/cmip-relay-transport-draft-2.md`), request by request: publish an act, a sealed container or media; fetch them; follow what is new, waiting for it; ask a home for a receipt; ask a home for everything it holds about an identity; ask for log summaries and the proofs that go with them; ask a relay to try a home on your behalf (a probe).

Three things hold throughout:

- **Nothing is trusted.** Everything that matters comes back as signed acts, which the reader checks with the core library. A relay that lies can only withhold. The tests never take a relay's word: every answer that matters is judged by the core library's verifier from what the relays hand back.
- **The relay checks what it can on arrival.** An act must be in the exact shape, its locked bytes must match, its signature must be valid, and, where the relay holds the act that bound the signer's key, the key must be that one. A home checks a rotation fully before it keeps it, and keeps the first valid rotation it holds at each position.
- **An operator is an ordinary identity.** A home runs under an identity made elsewhere, like anyone's, and holds only its everyday signing key and the act that bound it: the safety key never goes on the server. Until the genesis client exists (step 5), `init --new-test-operator` can instead create a test identity for it, with its safety key in a file labelled as a prototype. Every relay says in its policy that everything on it will be wiped before the first real acts (roadmap step 17).

## Precisely

| Module | What |
| --- | --- |
| `wire` | The cMIP's messages (`info`, `put-result`, `put-sealed`, `feed-page`, `identity-record`, `error`, `probe`, bundles, the summary answer, proofs), strict both ways: deterministic CBOR, closed maps, canonical text. Sealed ids and pickup tags. |
| `store` | One SQLite file per relay. Items stored byte for byte with their arrival numbers; indexes on what a relay can read (the outside, and the inside of public acts). A home's chains, receipt log, summaries, objections and its operator's sequence. Every write is flushed before it is answered. |
| `operator` | A home's operator: an ordinary identity whose receipts, log summaries and objections are everyday acts in a sequence of the home's own; its key file; and the stopgap test operator. |
| `node` | What happens to each request, independent of HTTP. |
| `http` | The requests over HTTP, with `Access-Control-Allow-Origin: *` on every answer, feeds that wait, media by range, probes, and forwarding homeless rotations to the old homes. |
| `client` | A client for the cMIP that recomputes the id of everything it fetches. Used by relays to probe and forward, by the tests, and later by the freeze-suite harness (step 7). |

**On arrival, every relay** checks the act's shape (deterministic CBOR, Envelopes' shape, canonical text), the locked hash, the signature where it implements the scheme, that a public act opens and matches its inside commitment, that a public Identity act passes the checks that need no other act, that an act signed with a safety key is a rotation (Identity rule 2), and the binding where it holds the act the binding names. It never refuses an act for its specification (Envelopes rules 11, 12; scenario 2.5). Private acts are carried unopened.

**A home also**, for a genesis or rotation: holds the chain of each identity it knows, by position; checks a rotation against the act it holds at the position before (predecessor, revealed safety key, rotation check 5); answers error 3 when it lacks the predecessor, error 4 with the rotation it holds and its receipt when another rotation is already held there (rule 11), and error 5 when its policy refuses; objects to a homeless rotation of an identity whose old home set names it, keeping the rotation as evidence and never as the identity's (rule 11a); signs a receipt for each chain act it holds for an identity it serves (rule 10a), at the next log position, and a log summary over the whole log after each receipt. For an identity it serves, it checks every everyday act's binding against the chain it holds (the cMIP's MUST).

**The identity record** serves the chain and this home's receipts, the whole routes chain and encryption-key chain, names, links, evidence (objections, refused homeless rotations, escape endorsements, absence statements, and cosignatures of this home's summaries by the identity's declared auditors), and other homes' receipts delivered to it.

## Found while building

**A bug in the core library, fixed.** The verifier indexed an act again each time it was given it. A reader fetches the same chain from every home, so it holds the same rotation several times, and the verifier then saw one rotation as two rivals and showed the identity as contested. The fix (`core/src/chain.rs`): the same act is held once; if a copy with an invalid signature arrived first, a copy with a valid one replaces it (the signature is not part of the act id, so copies of one act can differ only there). A core test covers it (`the_same_act_from_several_homes_is_one_act`). No MIP text changes.

## Readings, confirmed

Where the texts are silent, the program takes the reading below. None changes a MIP; each is for Nobody, allegedly, to confirm. All twelve confirmed.

1. **What a newly named home holds.** A home named for the first time in a rotation receives the earlier chain acts first, oldest first (cMIP, error 3). It holds them as the start of that identity's chain and checks each against the one before, but receipts only acts from the first one that names it: before that, it does not serve the identity. It adopts the chain the owner's client sends; it does not judge earlier positions by the other homes' receipts. *Confirmed by Nobody, allegedly, 28 September 2026.*
2. **An outvoted home refuses the winner's everyday acts.** A home left holding a losing rotation (rule 22) cannot hold the winning one (rule 11), so it cannot check the binding of acts under the winning key, and answers error 3. The owner drops it at the next rotation, as rule 22 says. *Stated cost:* until then it still accepts the thief's everyday acts under the losing rotation's key; readers judge them void from all the homes' receipts. *Confirmed by Nobody, allegedly, 28 September 2026 ("scenario is really rare"). Considered and not taken: accepting unchecked (it would weaken the cMIP's MUST), and learning the winner from other homes' receipts (kept in mind if the identity gauntlet, step 7, shows friction).*
3. **A summary after every receipt.** Every log size has a summary, so auditors and readers can ask for any size. *Costs, stated:* one more act per receipt; auditors may co-sign only some summaries, since a co-signed summary covers every receipt before it; a receipt is protected against the operator's rotation only once an auditor co-signs a summary covering it, as with any schedule; the program recomputes the whole tree each time, fine at V1's scale, to be made incremental if a home ever holds millions of receipts. *Confirmed by Nobody, allegedly, 28 September 2026.*
4. **An operator is an ordinary identity in a role.** Any identity becomes an operator when a genesis names it as a home's operator; the protocol has no class of operator identities, and neither has this program. A home runs under an identity made elsewhere: `init` takes its key file (the everyday signing key and the act that bound it) and its identity-chain acts as a bundle, checks that they match, and serves that chain beside its receipts. The safety key never goes on the server. Where the operator's own homes are is up to its genesis, like anyone's; the operator adds this home's addresses to its routes itself (cMIP, "Addresses"). *Cost, stated:* the everyday signing key sits on the server, since the home signs around the clock; someone running a home under their main identity puts that key there, so many will prefer a separate identity, which is their choice. *Stopgap until step 5:* `init --new-test-operator` creates a new test identity, self-hosted at the home, with its safety key in the key file and a routes act naming the home; for test homes only. *Decided by Nobody, allegedly, 28 September 2026. The first draft took a shortcut, every home creating its own self-hosted operator, which made operators a class in practice; Nobody, allegedly, countered it. An operator can be linked to its owner's main identity (Identity link claim and confirmation; a link gives no authority, rule 25), which for the three simulated operators would make visible that one person runs them.*
5. **Evidence a home keeps** (objections, absence statements, cosignatures, other homes' receipts) is checked for shape and signature, and for binding only where the home holds the signer's chain. It does not resolve other operators' or auditors' chains; readers do. *Cost, stated:* a stranger can get a false act stored and served (for example a receipt under a made-up key); readers ignore it (scenario 5.7b), and it costs the home only space. Fetching every signer's chain first would risk refusing real objections when those servers cannot be reached. *Confirmed by Nobody, allegedly, 28 September 2026.*
6. **Cosignatures in the identity record** are those of this home's summaries signed by the auditors the identity declared at any position of the chain the home holds. Past auditors too, since a receipt for an older rotation is judged under the audit requirement in force for it (rule 10e). Every co-signature of a summary is also served with the summary itself (`GET /log/summary`). *Confirmed by Nobody, allegedly, 28 September 2026.*
7. **No commitments yet.** Their Merkle construction is still open in Envelopes; `GET /commitment` answers error 8. *Confirmed by Nobody, allegedly, 28 September 2026: left open until needed, at the freeze (step 16) or at the first step that runs scenario 4. A likely proposal then: the receipt log's RFC 9162 tree over the relay's act ids in sorted order.*
8. **Error codes and HTTP status** (an open parameter of the cMIP): 0 → 400, 1 → 422, 2 and 8 → 404, 3 and 4 → 409, 5 and 7 → 403, 6 → 413, 9 → 501, 10 → 429. A fault of the relay itself answers 500 with code 10 ("try later"). Clients read the code in the body, never the status. *Confirmed by Nobody, allegedly, 28 September 2026; to be written into the cMIP at the freeze, so other implementations answer the same.*
9. **Default limits** (the cMIP's "limits a relay must accept at the least" is open): acts and sealed containers up to 256 KiB, media up to 64 MiB, 500 items per feed page, 60 seconds of waiting. Each operator may change the act and media limits at setup. *Confirmed by Nobody, allegedly, 28 September 2026. The minimum every relay must accept is left to the freeze (step 16); suggested then: at least 64 KiB per act, over three times the largest rotation (scheme 3, about 17 KB).*
10. **Refusals of a rotation.** A rotation naming a predecessor other than the one the home holds at the position before is invalid (error 1). A rotation under a safety scheme the home does not implement is answered error 9: a home must check a rotation before holding it (rule 9), and cannot. Error 1 rather than 3 for the first, since the home already holds another act at that position and more history cannot help; error 9 rather than 1 for the second, since the rotation may be valid and the home cannot tell. *Confirmed by Nobody, allegedly, 28 September 2026.*
11. **Probes and forwarding** contact at most 8 addresses each, and only a base address's `/acts` and `/identity/…` paths: `https`, onion addresses through Tor, and plain `http` only when the relay runs with `--allow-http`, for local tests. *Cost, stated:* an identity with more than 8 old homes has only its first 8 contacted. *Confirmed by Nobody, allegedly, 28 September 2026 ("5 homes is plenty of safety and/or redundancy").*
12. **The allowlist policy** (for the home on the author's machine): genesis and rotations only of listed identities (error 5 otherwise); other acts only if signed by a listed identity or the operator, or if they are evidence about a listed identity (error 7 otherwise); sealed containers only addressed to a listed identity; media only for a publication the relay holds. *Cost, stated:* a sealed delivery to a bare key carries no recipient on the outside, so this home refuses it; such deliveries go to open relays. *Confirmed by Nobody, allegedly, 28 September 2026, for the home on the author's machine.*

## Added for the identity gauntlet (roadmap step 7)

- **Operator rotation and closure.** `mor-relay rotate --dir DIR [--closure]` rotates a test operator whose key file holds its safety key: new keys, the home's own acts kept as the rotation's kept tip, the key file replaced. With `--closure` the home closes for good (Identity rule 8c): it holds no new identity-chain acts, signs no receipts and no objections (error 5), and still serves what it held, so readers find the closure. An operator whose safety key is kept elsewhere rotates there and gives the home the rotation and its new key file: `mor-relay rotated --dir DIR --operator-key FILE --rotation FILE.mor`. After its operator rotates, a home signs nothing under the old key until it has the new one. Stop the home before either command.
- **Strict homes: the operator approves each rotation.** `mor-relay strict --dir DIR IDENTITY` makes the home accept a rotation of that identity only once its operator has approved it, with `mor-relay approve --dir DIR ROTATION-ID`; otherwise error 5. It stands in for "proof from a registered device" (Identity rule 12): the device check itself is simulated by the operator's approval, per identity, at the owner's choice (decided by Nobody, allegedly, 29 September 2026). Nothing is added to the transport: the owner's client still sends only the act.
- **Carried inclusion proofs (F101).** `POST /proofs` keeps inclusion proofs for other homes' receipts, for identities this home serves, each checked against the signed summary it names; the identity record serves them (part 9) with the acts they rest on (part 10). Bundles carry them (key 2).
- **The operator's whole sequence.** `Client::acts_by` pages through the feed by signer. A reader needs a home operator's whole sequence to prove that receipts signed before the operator's rotation lie in its kept ancestry (cMIP draft 2, "Checked against the core", 14).

## The management page (roadmap step 11)

Every relay and home serves a page at `/manage/` on its own address, where its operator runs it from a browser without a terminal: what it holds, rotations waiting for approval, approval per identity, the list of identities, a limit on new identities (for a public home), the latest arrivals, the operator's rotation and closure, and paired browsers. A browser pairs once with a one-time code (`init` prints one; `mor-relay pair --dir DIR` makes another, valid for an hour), then signs every request with a key it keeps. The page is built from `clients/manage/` into `relay/manage/` and served by the program itself (`src/manage.rs`); its readings and tests are in `clients/manage/README.md`. From the command line too: `mor-relay managers`, `unpair --dir DIR KEY`, `limit --dir DIR [N]`.

## An address added after setup (roadmap step 10a)

`init` fixes a relay's addresses; the server's homes also need an onion address, a second address for the same homes. `mor-relay address --dir DIR` lists them; `mor-relay address --dir DIR --add URL` adds one (https, or an onion address), with the relay stopped, and it answers under it from its next start. Clients find a home's addresses in its operator's routes (relay transport cMIP, "Addresses"), so a home whose test operator it holds itself (made with `--new-test-operator`, as at home1 and home2) also signs the operator's next routes, version n + 1 naming version n, with the new address added to its outbox route for `IDENTITY` and every other route kept. A home whose operator was made elsewhere signs no routes, since the operator's own client signs them and two signers could fork the chain: it adds the address to its settings and says so; the routes are then published where the operator's identity is kept. *The genesis client cannot yet publish an outbox route scoped to `IDENTITY` (its `routes` command writes null scopes); not needed for the server's homes.* Tested in `tests/address.rs` and at the end of the test of a home under an identity made elsewhere.

## Not yet

- **Commitments** (reading 7).
- **Operator links.** `mor-relay` cannot yet sign a link claim to its owner's main identity (step 5, once the main identity can exist).
- **One home per operator** in this program: each home keeps its own log, so two homes of one operator would each count log positions from zero.

## Tests

```
cargo test -p mor-relay
```

Real relays and homes on local ports, test identities built with the core library, and the core library's verifier judging what comes back (`tests/common/mod.rs`).

- `tests/relay.rs`: acts in and back byte for byte, idempotent publishing, batch fetch, what a relay refuses on arrival (malformed, broken locked bytes, bad signatures, a key other than the binding's, a safety key signing anything but a rotation) and what it carries (private acts, unknown specifications, unknown everyday schemes where it cannot tell); limits; the feed by signer, recipient, spec and type, paged, unfiltered for mirroring, and waiting for new acts; sealed containers found by recipient, pickup tag and scanning; media by range; CORS for browsers; bundles.
- `tests/address.rs`: an onion address added to a home after setup: the home answers under both, its operator's routes (version 2 naming version 1, then version 3) name every address, as judged by the core library from the whole routes chain the home serves, and it still receipts; the same address twice refused; a basic relay adding an address.
- `tests/manage.rs`: the management page's requests (step 11), listed in `clients/manage/README.md`.
- `tests/home.rs`: three homes under three operators, the majority rule by default, a rotation that counts with one home switched off, and the home catching up when it comes back (the step's "done when", in the build window); one home of three is not a majority; first held wins, and the thief arriving second is shown the owner's rotation and receipt (5.7); a newly named home receiving the chain oldest first; invalid rotations and forged everyday acts refused; the log, summaries, inclusion and consistency proofs checked against signed summaries (5.7d's tools); a homeless rotation objected to by the live old home, the objection voiding it for a reader who could not reach the home, found through a relay's probe, and carried back by a relay that forwarded the rotation (5.7c); the allowlist home; a home running under an identity made elsewhere, with no safety key on the server, and a key file that does not match its chain refused; a home surviving a restart with its operator's sequence unbroken; finding an inbox through the home (5.3); a strict home accepting a rotation only once its operator approves it; a home signing on under its operator's new key, its earlier receipts still counting; a closed home refusing everything new while its identities leave homeless; a home keeping and serving carried inclusion proofs (F101).

## Running a home

*Three homes on three hosts, under three simulated operators, all test identities (roadmap step 4). Each home runs under its own operator identity, whose hash is what a genesis names in its home list. Until the genesis client exists (step 5), `--new-test-operator` creates one at `init` and prints its hash; after that, give `--operator-key FILE --operator-chain FILE.mor` instead.*

Build it (Rust from <https://rustup.rs>):

```
cargo build --release -p mor-relay
# the program is target/release/mor-relay
```

### On the author's own machine, at an onion address

Nothing is opened on the router, and the machine's address stays hidden: Tor carries the traffic.

1. Install Tor (macOS: `brew install tor`; Debian or Ubuntu: `sudo apt install tor`).
2. Add to Tor's configuration file (`torrc`), with a folder of your choice:
   ```
   HiddenServiceDir /Users/you/mor-onion
   HiddenServicePort 80 127.0.0.1:8080
   ```
   Restart Tor. The file `hostname` in that folder now holds the onion address, `….onion`.
3. Set up the home, for listed identities only:
   ```
   mor-relay init --dir ~/mor-home --role home --base http://YOUR-ADDRESS.onion --allowlist --new-test-operator
   ```
   Keep `~/mor-home/operator.key` secret and backed up: it holds the test operator's keys.
4. Run it, reachable only through Tor:
   ```
   mor-relay run --dir ~/mor-home --listen 127.0.0.1:8080 --tor-proxy socks5h://127.0.0.1:9050
   ```
5. List each test identity it should serve, once the genesis client has created it (step 5):
   ```
   mor-relay allow --dir ~/mor-home IDENTITY-HASH
   ```

### On a public server (Infomaniak, 1984 Hosting)

A small Linux server, and a name for it (for example `home1.` under a domain) pointing at its address, so that it can have an HTTPS certificate.

1. Install Caddy, which fetches the certificate by itself, and Tor (so the home can reach the onion home for probes and forwarding).
2. Caddy's configuration (`/etc/caddy/Caddyfile`):
   ```
   home1.example.org {
       reverse_proxy 127.0.0.1:8080
   }
   ```
3. Set up the home, open to anyone, under an account of its own that can write only its own folder (not `root`, so that a flaw in the program cannot reach the rest of the server):
   ```
   useradd --system --home-dir /var/lib/mor-home --no-create-home --shell /usr/sbin/nologin mor
   install -d -o mor -g mor -m 700 /var/lib/mor-home
   sudo -u mor mor-relay init --dir /var/lib/mor-home --role home --base https://home1.example.org --new-test-operator
   ```
4. Run it, and keep it running (a systemd unit, `/etc/systemd/system/mor-home.service`):
   ```
   [Unit]
   Description=MOR test home
   After=network-online.target tor.service
   Wants=network-online.target

   [Service]
   User=mor
   Group=mor
   ExecStart=/usr/local/bin/mor-relay run --dir /var/lib/mor-home --listen 127.0.0.1:8080 --tor-proxy socks5h://127.0.0.1:9050
   Restart=always
   RestartSec=5
   NoNewPrivileges=yes
   ProtectSystem=strict
   ProtectHome=yes
   ReadWritePaths=/var/lib/mor-home
   PrivateTmp=yes

   [Install]
   WantedBy=multi-user.target
   ```
   Then `systemctl enable --now mor-home`.

If the server cannot fetch the private repository, build from a copy sent from a checkout (`git archive`, then `scp`), and compare its hash on both sides. The build needs Rust, a C compiler (`build-essential` on Debian) and, on a server with 2 GB of memory or less, a temporary swap file.

`mor-relay show --dir …` prints a home's settings and its operator. A basic relay is set up the same way with `--role relay`.

Once it runs, open `/manage/` at its address (on the author's machine, `http://127.0.0.1:8080/manage/`) and pair the browser with the code `init` printed, or a new one from `mor-relay pair --dir …` (on a server, `sudo -u mor mor-relay pair --dir /var/lib/mor-home`). From then on it is run from the page.
