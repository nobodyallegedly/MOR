# mor-harness

The freeze-suite harness, in Rust. Roadmap step 7: the identity gauntlet, freeze test suite scenario 5, steps 6 to 7d.

## In plain words

The gauntlet attacks identities the way the freeze test suite says a thief, a lost phone, a hostile home or a censor would, and checks that the rules hold. Each attack runs against real homes (the same `mor-relay` program that runs the deployed homes), and every verdict comes from a fresh reader. The reader holds only what homes and relays handed it, and judges it with the core library's verifier. Nothing a relay says is trusted.

Two test identities live on the three homes named as real:

- **A**, homed at all three under three operators, with no rule declared, so the majority rule applies. Its rotations count on two of three receipts, including while the home on the author's machine is switched off.
- **B**, self-hosted on a home it runs itself, with the two public homes as backups (Identity rule 22a). Its rotations count on its own signature.

Everything no one may do to a deployed home runs on **throwaway homes** the harness starts on the same machine, from the same program: stealing an operator's key, rotating or closing an operator, switching a home off at will, approving rotations as its operator, playing a thief's own home. The report says where each check ran.

## Running it

A local run, every home on this machine (what the build window runs, and `cargo test`):

```
cargo run --release -p mor-harness --bin mor-gauntlet -- local
cargo test -p mor-harness
```

A live run, on the author's machine where the onion home runs (a human test: the keys never leave the machine). Tor must be running.

```
cargo build --release -p mor-harness
target/release/mor-gauntlet live \
  --home https://home1.dubsar.org --home https://home2.dubsar.org \
  --home http://YOUR-ADDRESS.onion \
  --tor-proxy socks5h://127.0.0.1:9050 \
  --machine-dir ~/mor-home --out gauntlet-report.txt
```

- The third `--home` is the home on this machine. With `--machine-dir`, the harness lists A at that home itself; without it, it asks you to run `mor-relay allow`.
- Twice it stops and asks you to switch the home on this machine **off**, then back **on** (stop and start its login agent), and waits for Enter.
- A and B are new test identities on the deployed homes: test acts only, wiped with everything else at step 17. B's own home is a throwaway home on this machine, at a local address, for the length of the run.
- The report ends with the number of checks passed. The program exits with 0 only if every check passed.

## What it checks

| Step | Where | Checks |
| --- | --- | --- |
| 5.5, 5.6 | real homes | A born at three homes; a routine rotation counts by majority and keeps the history before it; with the author's machine off, a rotation counts on two receipts and acts under the new key are valid; the home comes back and receipts the same bytes; one home of three is pending; B self-hosted rotates with no receipt, the client stating the cost (conformance) |
| 5.7 | real homes | a thief holding A's safety key arrives second at every home: error 4 with A's rotation and receipt; A's rotation counts |
| 5.7 | throwaway | two strict homes refuse the thief's rotation, the lax home receipts it; the owner's approved rotation wins by majority; the thief's acts are invalid; the lost phone at a strict home, and the escape with both keys, made final by the next rotation |
| 5.7b | throwaway | a forged receipt naming a made-up act and a pair of non-extending summaries change nothing; the auditor stops cosigning that home; the thief cannot close the home |
| 5.7c | throwaway | closure by rotation and the homeless rotation, final by the next; declared auditors' absence statements, with the proofs the owner carried (F101), and a late objection that changes nothing; a thief's homeless rotation voided by the live home's objection, carried back by a relay; rule 8a's exception; a hostile home and the escape, the abandoned rotation never counting; the audit requirement dropped; a used first safety key after a closure (F92); a thief dropping auditing (F93); the censored reader (F87), labelled re-homed without audit (conformance), the thief's second rotation not final, both undone by a bundle; a redirected inbox and encryption key, and the re-delivery after rotation |
| 5.7d | throwaway | contested until the operator rotates; with audit, the cosigned receipt settles it; both receipts under cosigned summaries prove the home dishonest at that position only, the earlier receipts surviving; the auditor stops cosigning the home |
| all | — | every SLH-DSA signature the readers meet is checked by both implementations (fips205 and RustCrypto's `slh-dsa`), and they agree |

## Modules

| Module | What |
| --- | --- |
| `person` | Test identities as their owner, or a thief holding their keys, sees them: keys from the run's random seed, and every act they sign. |
| `net` | Deployed homes by address (Tor for an onion address), throwaway homes started in this process, a thief's home that forwards and probes nothing. |
| `reader` | A reader that trusts no relay: follows an identity to every home its chain names, fetches operators' chains and sequences, inclusion proofs (from the home, carried, or rebuilt from receipts and checked against the root), tries a home twice and asks relays to probe before treating it as unreachable. |
| `auditor` | Cosigns a summary only after a consistency proof from the last one it cosigned; stops cosigning a home shown two summaries of which neither extends the other; signs absence statements after trying a home twice. |
| `carry` | What an owner's client keeps while a home answers, and hands to its new homes: inclusion proofs of its audited receipts and the acts they rest on (F101). |
| `gauntlet` | The steps. |
| `report` | Each check, passed or not, and where it ran. |

## Found while building

**F101, a flaw in Identity, decided by Nobody, allegedly: inclusion proofs travel.** An identity that requires audit counts a rotation only with an inclusion proof of its receipt under a cosigned summary, and only the home served those proofs. Once the home vanished, a reader who never reached it could prove nothing past genesis, so the homeless rotation that both auditors' absence statements should let count could not count either; a reader who had read it earlier still counted it. Now anyone may carry proofs, a home keeps and serves carried ones, and the owner's client keeps its own and hands them to its new homes. Written into Identity draft 10, the relay transport cMIP draft 2 and freeze test suite v16, awaiting approval.

**Friction: proving receipts after an operator rotates.** A receipt signed before a home operator's rotation counts only if it lies in the rotation's kept ancestry, and the verifier proves that from every act id of the operator's line. The identity record does not carry them, so the reader fetches the operator's whole sequence through the feed. It works; it grows with the home. The cMIP's open parameter (an inclusion proof for a kept ancestry) would shrink it.

## Readings, for Nobody, allegedly, to confirm

Where the texts are silent, the harness takes the reading below. None changes a MIP.

1. **Where each check runs.** A and B on the three real homes; everything no one may do to a deployed home on throwaway homes on the same machine, marked as such in the report. *Cost, stated:* strict homes, closures, stolen operator keys and the audited paths are run on the program the deployed homes run, but not on the deployed homes themselves.
2. **A strict home is an operator's approval** (decided by Nobody, allegedly): per identity, at the owner's choice; the device check itself is simulated. A hostile home is a strict home whose operator never approves.
3. **B's own home** is a home the harness runs on the author's machine under B's own identity (its key file holds B's everyday key, never the safety key), at a local address, for the length of the run. *Cost, stated:* it cannot be reached from outside that machine, so only a reader on that machine follows B to it.
4. **Switching the author's machine off** in a live run is done by hand when the harness asks; in a local run the harness stops the home itself.
5. **A thief's own home forwards and probes nothing.** An honest home forwards a homeless rotation to the old homes and brings the objection back; a home run by the thief would not. The harness's thief homes are the same program with forwarding and probing turned off.
6. **How a stolen operator key gets a rival receipt into shared history (5.7d).** The thief signs a summary that extends the one the auditor last cosigned, with the rival receipt appended, and shows it to the auditor with a correct consistency proof. The auditor, checking all it can, cosigns. Both receipts then sit under cosigned summaries, and the home is proven dishonest at that position only. The home's next real summary does not extend the thief's, so the auditor stops cosigning it. *The protocol cannot tell a stolen key from a dishonest operator, and the verdict never reaches backwards.*
7. **An auditor "closes"** by no longer cosigning; its identity does not rotate.
8. **Evidence nobody's home serves** (forged receipts, a thief's summaries, cosignatures of them) is published to relays; the reader asks relays for everything signed by the identities involved.
9. **Keys** come from a random seed drawn at each run, so no two runs share keys; safety keys use SLH-DSA-SHA2-128f (scheme 3) for speed, as the core's own tests do.
