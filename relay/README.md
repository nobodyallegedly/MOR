# mor-relay

MOR relays and homes, in Rust. Roadmap step 4.

## In plain words

A relay is a web server that keeps acts. A home is a relay with a few more duties: it keeps identity chains, gives a signed receipt for every genesis and rotation it accepts, keeps a numbered log of those receipts, and signs a fingerprint of the whole log (a log summary) each time it grows. This program is both: the same code runs as a basic relay or as a home.

It speaks the relay transport cMIP (`cmips/cmip-relay-transport-draft-1.md`), request by request: publish an act, a sealed container or media; fetch them; follow what is new, waiting for it; ask a home for a receipt; ask a home for everything it holds about an identity; ask for log summaries and the proofs that go with them; ask a relay to try a home on your behalf (a probe).

Three things hold throughout:

- **Nothing is trusted.** Everything that matters comes back as signed acts, which the reader checks with the core library. A relay that lies can only withhold. The tests never take a relay's word: every answer that matters is judged by the core library's verifier from what the relays hand back.
- **The relay checks what it can on arrival.** An act must be in the exact shape, its locked bytes must match, its signature must be valid, and, where the relay holds the act that bound the signer's key, the key must be that one. A home checks a rotation fully before it keeps it, and keeps the first valid rotation it holds at each position.
- **Test identities only.** A home's operator is a test identity created by this program, with its safety key in a file beside the database, labelled as a prototype in the file itself. Every relay says in its policy that everything on it will be wiped before the first real acts (roadmap step 17).

## Precisely

| Module | What |
| --- | --- |
| `wire` | The cMIP's messages (`info`, `put-result`, `put-sealed`, `feed-page`, `identity-record`, `error`, `probe`, bundles, the summary answer, proofs), strict both ways: deterministic CBOR, closed maps, canonical text. Sealed ids and pickup tags. |
| `store` | One SQLite file per relay. Items stored byte for byte with their arrival numbers; indexes on what a relay can read (the outside, and the inside of public acts). A home's chains, receipt log, summaries, objections and its operator's sequence. Every write is flushed before it is answered. |
| `operator` | A home's operator: a test identity, self-hosted at its own home, whose receipts, log summaries, objections and routes are everyday acts in one sequence. |
| `node` | What happens to each request, independent of HTTP. |
| `http` | The requests over HTTP, with `Access-Control-Allow-Origin: *` on every answer, feeds that wait, media by range, probes, and forwarding homeless rotations to the old homes. |
| `client` | A client for the cMIP that recomputes the id of everything it fetches. Used by relays to probe and forward, by the tests, and later by the freeze-suite harness (step 7). |

**On arrival, every relay** checks the act's shape (deterministic CBOR, Envelope's shape, canonical text), the locked hash, the signature where it implements the scheme, that a public act opens and matches its inside commitment, that a public Identity act passes the checks that need no other act, that an act signed with a safety key is a rotation (Identity rule 2), and the binding where it holds the act the binding names. It never refuses an act for its specification (Envelope rules 11, 12; scenario 2.5). Private acts are carried unopened.

**A home also**, for a genesis or rotation: holds the chain of each identity it knows, by position; checks a rotation against the act it holds at the position before (predecessor, revealed safety key, rotation check 5); answers error 3 when it lacks the predecessor, error 4 with the rotation it holds and its receipt when another rotation is already held there (rule 11), and error 5 when its policy refuses; objects to a homeless rotation of an identity whose old home set names it, keeping the rotation as evidence and never as the identity's (rule 11a); signs a receipt for each chain act it holds for an identity it serves (rule 10a), at the next log position, and a log summary over the whole log after each receipt. For an identity it serves, it checks every everyday act's binding against the chain it holds (the cMIP's MUST).

**The identity record** serves the chain and this home's receipts, the whole routes chain and encryption-key chain, names, links, evidence (objections, refused homeless rotations, escape endorsements, absence statements, and cosignatures of this home's summaries by the identity's declared auditors), and other homes' receipts delivered to it.

## Found while building

**A bug in the core library, fixed.** The verifier indexed an act again each time it was given it. A reader fetches the same chain from every home, so it holds the same rotation several times, and the verifier then saw one rotation as two rivals and showed the identity as contested. The fix (`core/src/chain.rs`): the same act is held once; if a copy with an invalid signature arrived first, a copy with a valid one replaces it (the signature is not part of the act id, so copies of one act can differ only there). A core test covers it (`the_same_act_from_several_homes_is_one_act`). No MIP text changes.

## Readings, to confirm

Where the texts are silent, the program takes the reading below. None changes a MIP; each is for Nobody, allegedly, to confirm. Confirmed so far: 1 to 3.

1. **What a newly named home holds.** A home named for the first time in a rotation receives the earlier chain acts first, oldest first (cMIP, error 3). It holds them as the start of that identity's chain and checks each against the one before, but receipts only acts from the first one that names it: before that, it does not serve the identity. It adopts the chain the owner's client sends; it does not judge earlier positions by the other homes' receipts. *Confirmed by Nobody, allegedly, 28 September 2026.*
2. **An outvoted home refuses the winner's everyday acts.** A home left holding a losing rotation (rule 22) cannot hold the winning one (rule 11), so it cannot check the binding of acts under the winning key, and answers error 3. The owner drops it at the next rotation, as rule 22 says. *Stated cost:* until then it still accepts the thief's everyday acts under the losing rotation's key; readers judge them void from all the homes' receipts. *Confirmed by Nobody, allegedly, 28 September 2026 ("scenario is really rare"). Considered and not taken: accepting unchecked (it would weaken the cMIP's MUST), and learning the winner from other homes' receipts (kept in mind if the identity gauntlet, step 7, shows friction).*
3. **A summary after every receipt.** Every log size has a summary, so auditors and readers can ask for any size. *Costs, stated:* one more act per receipt; auditors may co-sign only some summaries, since a co-signed summary covers every receipt before it; a receipt is protected against the operator's rotation only once an auditor co-signs a summary covering it, as with any schedule; the program recomputes the whole tree each time, fine at V1's scale, to be made incremental if a home ever holds millions of receipts. *Confirmed by Nobody, allegedly, 28 September 2026.*
4. **The operator is self-hosted at its own home,** and its first act is a routes act whose outbox route for the Identity MIP names the home's base addresses (cMIP, "Addresses").
5. **Evidence a home keeps** (objections, absence statements, cosignatures, other homes' receipts) is checked for shape and signature, and for binding only where the home holds the signer's chain. It does not resolve other operators' or auditors' chains; readers do.
6. **Cosignatures in the identity record** are those of this home's summaries signed by the auditors the identity declared at any position of the chain the home holds.
7. **No commitments yet.** Their Merkle construction is still open in Envelope; `GET /commitment` answers error 8.
8. **Error codes and HTTP status** (an open parameter of the cMIP): 0 → 400, 1 → 422, 2 and 8 → 404, 3 and 4 → 409, 5 and 7 → 403, 6 → 413, 9 → 501, 10 → 429. A fault of the relay itself answers 500 with code 10 ("try later"). Clients read the code in the body, never the status.
9. **Default limits** (the cMIP's "limits a relay must accept at the least" is open): acts and sealed containers up to 256 KiB, media up to 64 MiB, 500 items per feed page, 60 seconds of waiting.
10. **Refusals of a rotation.** A rotation naming a predecessor other than the one the home holds at the position before is invalid (error 1). A rotation under a safety scheme the home does not implement is answered error 9: a home must check a rotation before holding it (rule 9), and cannot.
11. **Probes and forwarding** contact at most 8 addresses each, and only a base address's `/acts` and `/identity/…` paths: `https`, onion addresses through Tor, and plain `http` only when the relay runs with `--allow-http`, for local tests.
12. **The allowlist policy** (for the home on the author's machine): genesis and rotations only of listed identities (error 5 otherwise); other acts only if signed by a listed identity or the operator, or if they are evidence about a listed identity (error 7 otherwise); sealed containers only addressed to a listed identity; media only for a publication the relay holds.

## Not yet

- **Operator rotation and closure.** A home's operator cannot yet rotate its keys or close its home by rotation. The identity gauntlet (step 7) needs both, for closure by rotation and a stolen operator key; they come then.
- **Commitments** (reading 7), and the **management client** (step 11): until then, a home is run from the command line.
- **One home per operator** in this program: each home keeps its own log, so two homes of one operator would each count log positions from zero.

## Tests

```
cargo test -p mor-relay
```

Real relays and homes on local ports, test identities built with the core library, and the core library's verifier judging what comes back (`tests/common/mod.rs`).

- `tests/relay.rs`: acts in and back byte for byte, idempotent publishing, batch fetch, what a relay refuses on arrival (malformed, broken locked bytes, bad signatures, a key other than the binding's, a safety key signing anything but a rotation) and what it carries (private acts, unknown specifications, unknown everyday schemes where it cannot tell); limits; the feed by signer, recipient, spec and type, paged, unfiltered for mirroring, and waiting for new acts; sealed containers found by recipient, pickup tag and scanning; media by range; CORS for browsers; bundles.
- `tests/home.rs`: three homes under three operators, the majority rule by default, a rotation that counts with one home switched off, and the home catching up when it comes back (the step's "done when", in the build window); one home of three is not a majority; first held wins, and the thief arriving second is shown the owner's rotation and receipt (5.7); a newly named home receiving the chain oldest first; invalid rotations and forged everyday acts refused; the log, summaries, inclusion and consistency proofs checked against signed summaries (5.7d's tools); a homeless rotation objected to by the live old home, the objection voiding it for a reader who could not reach the home, found through a relay's probe, and carried back by a relay that forwarded the rotation (5.7c); the allowlist home; a home surviving a restart with its operator's sequence unbroken; finding an inbox through the home (5.3).

## Running a home

*Three homes on three hosts, under three simulated operators, all test identities (roadmap step 4). Each home creates its own operator identity at `init`; its hash is printed, and is what a genesis names in its home list.*

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
   mor-relay init --dir ~/mor-home --role home --base http://YOUR-ADDRESS.onion --allowlist
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
3. Set up the home, open to anyone:
   ```
   mor-relay init --dir /var/lib/mor-home --role home --base https://home1.example.org
   ```
4. Run it, and keep it running (a systemd unit, `/etc/systemd/system/mor-home.service`):
   ```
   [Unit]
   Description=MOR test home
   After=network-online.target

   [Service]
   ExecStart=/usr/local/bin/mor-relay run --dir /var/lib/mor-home --listen 127.0.0.1:8080 --tor-proxy socks5h://127.0.0.1:9050
   Restart=always

   [Install]
   WantedBy=multi-user.target
   ```
   Then `systemctl enable --now mor-home`.

`mor-relay show --dir …` prints a home's settings and its operator. A basic relay is set up the same way with `--role relay`.
