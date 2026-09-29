# MOR V1: Roadmap

*28 September 2026. Each step is one working session ("window"), and ends with something that can be checked. Start each window with: read `CLAUDE.md`, `docs/build-brief-v1.md` and this roadmap, then do step N. A step found necessary along the way is inserted with a letter (1a), so the numbers used elsewhere never change.*

## The rule (Nobody, allegedly)

**What we build is separate from what we show. Nothing is shown before every step below is built and tested.** The order therefore follows dependency and risk, not what is seen first: the riskiest part, identity under attack, comes early, so that flaws in the MIPs surface before anything is built on top of them.

Until step 17, every identity is a **test identity**, and every relay holds test acts only. When everything is ready to show, the relays are wiped and the first acts are made fresh: the author's real identity is born then, with the air-gapped safety key Module, so its genesis is itself one of the first acts.

**Help from others (F85).** Nobody, allegedly and Claude build and freeze V1. Others help through targeted questions to specialists, drawn from the draft freeze report once testing shows what is real and what exists only on paper (step 15). One person, one question on their field. They decide nothing, and no one is shown the whole before step 18, with one exception: Semisol, who attacks it before the freeze (step 16).

## Steps

### Foundations

**0. Decisions** *(short, can run alongside steps 1 and 2)*
Cryptography libraries (with the Rust specialist), especially SLH-DSA and ML-KEM; the license.
*Done when:* both are recorded in the build brief.
*License done, 28 September 2026:* MIT or Apache 2.0, for code. *The libraries are needed before step 3, not step 2 (Nobody, allegedly): step 2 uses only established cryptography (SHA-256, XChaCha20-Poly1305, deterministic CBOR); the young libraries serve the signatures and key delivery of step 3.*

**1. Relay transport cMIP** *(a document)*
How a client publishes, fetches and follows acts, delivers to an inbox, finds deliveries addressed to it, and asks a home for a receipt; how a home is queried for chains, receipts, routes, names and links (open in Identity).
*Done when:* Nobody, allegedly approves it, in `cmips/`.
*Done, 28 September 2026:* `cmips/cmip-relay-transport-draft-1.md`, approved. It exposed F86 and F87 (Identity), written in by step 1a.

**1a. Identity draft 8** *(a document; inserted after step 1, can run alongside steps 0 and 2)*
Write the findings from step 1 into the texts: F86 (receipt check 3 counts a homeless rotation's receipts from the new homes) and F87 (a homeless rotation accepted only on the verifier's own failed attempt is never final by the next rotation; an objection voids it whenever it surfaces). Identity draft 8, the matching lines of the core document (v13), and the freeze test suite (v13), including the addition to scenario 5.7c, a censored reader and a thief's second rotation that does not make the first final (approved by Nobody, allegedly, 28 September 2026).
*Done when:* Nobody, allegedly approves the three texts, before step 3 begins, since the identity-chain checks are built from them.
*Done, 28 September 2026:* `spec/MIP-identity-draft-8.md`, `spec/02-MOR-core-v13.md`, `spec/03-MOR-freeze-test-suite-v13.md`. Writing them in exposed F88 (an escape endorsement is never judged by the rotation it endorses), decided by Nobody, allegedly and written into Identity draft 8. Nobody, allegedly approved the three texts, with the readings that "never final" also lets a late receipt for a rotation under the old home rule win (step 2 keeps applying), and that a later closure of the old home makes the homeless rotation final.

**2. Core library, part 1** *(Rust)*
Deterministic CBOR, tagged hashes, act ids, locking and the inside commitment, canonical text, running summaries.
*Done when:* published test vectors pass, including the three-act running summary.
*Done, 28 September 2026:* `core/` (crate `mor-core`), with its test vectors published in `core/vectors/`, the three-act running summary among them. They pass in the library and in a second, independent implementation (`core/vectors/check.py`); rule 6 of canonical text passes Unicode's own 17.0 conformance file. It builds to WebAssembly. Building it exposed three places the drafts left open, decided by Nobody, allegedly: the running summary's bagging side (F89), no associated data in the lock (F90), and a nesting limit of 128 levels for every verifier (F91). They are written into `spec/MIP-envelope-draft-5.md` and `spec/02-MOR-core-v14.md`. Nobody, allegedly approved the two texts.

**3. Core library, part 2** *(Rust)*
Identity-chain checks: genesis, rotation, receipts, conflicts, which rotation counts, homeless rotation, escape. Builds to WebAssembly.
SLH-DSA through the `fips205` crate (IntegrityChain), adopted by Nobody, allegedly on one testable condition: the tests check every SLH-DSA signature, both variants, against a second, independent implementation, and the two must agree.
*Done when:* hand-made test chains give the answers the Identity MIP requires, and the two SLH-DSA implementations agree on every signature in the tests.
*Done, 28 September 2026, approved by Nobody, allegedly:* `core/` part 2: signatures (`sig`), the receipt log (`merkle`), the Identity formats (`identity`) and the identity-chain checks (`chain`). 36 hand-made chains pass (`core/tests/chain.rs`), covering scenario 5's identity steps 5 to 7d and 8.4. SLH-DSA via `fips205`: every signature in the tests, both variants, is checked against RustCrypto's `slh-dsa`, and the two agree; same seeds give byte-identical keys and signatures. It builds to WebAssembly. Building it exposed a flaw and three open places, decided by Nobody, allegedly: a rotation counting under the old home rule beats even a final homeless rotation, otherwise a used safety key found after a closure rewrote history (F92); absence statements are judged by the audit requirement in force before the homeless rotation (F93); a home rule left in place must fit the new homes (F94); an acknowledged voided receipt contests a position without blocking it (F95). Written into `spec/MIP-identity-draft-9.md`, `spec/02-MOR-core-v15.md` and `spec/03-MOR-freeze-test-suite-v14.md` (5.7c gains two thieves). Ten smaller readings, listed in `core/README.md`, confirmed by Nobody, allegedly.

### Identity, proven

**4. Relays** *(Rust)*
The basic relay and the home relay, sharing most of their code: storage, verification on arrival, receipts, log summaries. Three homes, so that the majority rule is tested for real (Nobody, allegedly): one at Infomaniak, one at 1984 Hosting if it checks out, and one on the author's own machine. The two public homes are open to anyone; the home on the author's machine is reachable only at an onion address (nothing opened on his router, his address hidden) and accepts only his identities. Majority is counted per operator, so the three homes run under three test operator identities, all the author's: the operators are simulated (Nobody, allegedly). *The mechanics of the majority rule are run; the independence of operators is not, and the freeze report says so.*
*Order (Nobody, allegedly):* build and test the relays inside the build window first, since no host is needed for that; then deploy the home on the author's machine at its onion address; then Infomaniak and 1984 Hosting as their accounts are ready. *The step is done only when all three homes run.*
*Done when:* acts go in and come back verified; homes sign receipts and summaries.
*Built and tested in the build window, 28 September 2026:* `relay/` (crate `mor-relay`), one program for the basic relay and the home, speaking the relay transport cMIP request by request. 21 tests run real relays on local ports and judge what they hand back with the core library's verifier: three homes under three operators, a rotation counting by majority with one home switched off; first held wins (5.7); a newly named home receiving the chain; log summaries, inclusion and consistency proofs (5.7d); a live old home objecting to a homeless rotation, the objection found by probe and carried by a relay (5.7c); the allowlist home for the author's machine; a home running under an operator identity made elsewhere, with no safety key on the server. Building it found a bug in the core library, fixed: the verifier saw the same rotation, fetched from two homes, as two rivals. Twelve readings where the texts are silent, listed in `relay/README.md`, confirmed by Nobody, allegedly; one of them changed after Nobody, allegedly, countered a shortcut: a home runs under an operator identity made like anyone's, with no safety key on the server. How to run each home is in `relay/README.md`. *Still to do before the step is done:* the three homes deployed and running (the author's machine at an onion address, then Infomaniak and 1984 Hosting).
*Home 1 of 3 deployed, 29 September 2026:* on the author's machine (a Mac, Apple silicon), following `relay/README.md`, at an onion address kept out of the repository (Nobody, allegedly), allowlist policy, under the test operator `c529f9fa9a46a5495376ae104c9975e4b24cbe9ccb18f0678ebf0857f6b76ce0` (created with `--new-test-operator`). The relay's tests pass on that machine (25 of 25). Checked through the Tor network at its onion address: its `info` answer matches the local one byte for byte, and it serves its operator's identity record. Its log is empty until the first listed identity's genesis, so it has no log summary yet; the allowlist is filled once the genesis client exists (step 5). It runs while the machine is on, and starts at login, with Tor, as login agents of the user's own account, without administrator rights.
*Home 2 of 3 deployed, 29 September 2026:* at Infomaniak (Debian 13, 1 CPU, 2 GB), at `https://home1.dubsar.org` (IPv4 and IPv6, certificate from Let's Encrypt through Caddy), open to anyone, under the test operator `5cd1c622848d0e338dbd9ee1f355ef38a6c2512bc787aaa844e5a9cfc22d7831` (created with `--new-test-operator`). Built on the server from commit `76c54c5`; the relay's tests pass there (25 of 25). It runs as a service under an account of its own rather than `root`, now the setup in `relay/README.md`, and restarts by itself. Checked from outside: its `info` answer over IPv4 and IPv6 matches the local one byte for byte, it serves its operator's identity record, answers browsers (CORS), sends plain `http` to `https`, and reaches the onion home through Tor. The domain `dubsar.org` is registered with its owner's details hidden.
*Home 3 of 3 deployed, 29 September 2026:* at `https://home2.dubsar.org`, on the same Infomaniak server, in place of 1984 Hosting (decided by Nobody, allegedly: step 4 is done when it runs). Open to anyone, under a third test operator, `b366609ea90ec6b2f495280da6964b7f023d3687360b66fb63a82b38c01fc854`, with its own data, its own account and its own port behind the same Caddy, so neither home can read the other's key. Checked from outside as home 2 was, with its own certificate and an `info` answer of its own. *Stated cost:* two of the three homes share one host, so an outage there leaves one home of three, which is not a majority: a rotation cannot count until the host is back. The majority rule's mechanics run across three operators; independence of hosts, like independence of operators, is not tested, and the freeze report says so. A third host (1984 Hosting or another) can replace one of the two later without changing anything else.
**Step 4 done, 29 September 2026:** three homes running under three test operators.

**5. Genesis client** *(TypeScript)*
Creates test identities with the safety key in software, clearly labelled; publishes genesis, routes and encryption key; signs rotations.
The encryption key and key deliveries use X-Wing (F98): ML-KEM-768 through the `fips203` crate, X25519 through `x25519-dalek` (with `curve25519-dalek` 4.1.3 or later), adopted on the condition that the tests check every key exchange against a second, independent implementation. This step writes X-Wing into the Envelope MIP as the key-delivery format, including the bare-key form.
*Done when:* a test identity exists, rotates, and its homes serve it; a key delivered to it opens only with its key, and both implementations agree on every key exchange in the tests.

**5a. MOR governs its own code** *(cMIP or Module, then code; inserted 28 September 2026, from the brainstorm proposal, decided by Nobody, allegedly)*
A release manifest format (a founding cMIP or Module, a document first: every file with its hash, the previous release, the libraries it depends on); a repo client that publishes a release and fetches and verifies one (the signature, then every file against its hash); and a **test collective** of the author's simulated identities with a real founding agreement: key grammar, recovery path, abandonment clause, and a release rule requiring visible member signature acts, k of n (Law rule 36). From here on, every release of the code is published through it, in every window; GitHub stays the workshop and the mirror. This pulls the exact formats of the founding agreement, signature, clone and member change forward from step 16, on purpose, to give Law friction. It also writes F96 into the next Law draft (rule 36: a key grammar survives the loss of any one key holder), since the test collective is the first to use it.
*Choices (Claude, accepted by Nobody, allegedly):* visible member signatures, not threshold signing, so no new cryptography library; the collective's keys held under a grammar with a recovery path. A manifest is a plain Envelope publication made for the collective (`for`); what counts as a release is defined by the manifest cMIP, so no lower layer depends on Law.
*Run and not run:* every simulated member's key is held by a build window, so the mechanics are run (release rule, visible signatures, clone, rotation) but independent consent is not, as with the simulated home operators of step 4. The freeze report says so.
*Done when:* a release signed under the collective's release rule is published on the test relays, and a fresh machine fetches it and verifies every file; a simulated member joins and another leaves by clone and rotation, and the next release is signed under the new rules.

**6. Air-gapped safety key Module** *(`modules/`)*
The offline signer: commitment export, pending and signed rotations, by file and animated QR, with the device rules of the Module.
*Done when:* the Module's own functional and attack tests pass.
*Done, 28 September 2026, approved by Nobody, allegedly:* `modules/airgap/` (crate `mor-airgap`), with `mor-signer`, a command-line signer for an offline laptop; the phone app with a camera comes with the genesis client (step 5) (Nobody, allegedly). Two competing seed Modules, words and hex, both supported, to test several Modules side by side (Nobody, allegedly). The Module's functional and attack tests pass (40 tests), except the real-camera tests, simulated only; every SLH-DSA signature is checked by the second implementation. Building it exposed F97, decided by Nobody, allegedly: dealing a collective's next key verifiably stops sole control, not a copy; Pedersen dealing and a rebuild check on a second device. Written into `modules/module-airgap-safety-signer-draft-4.md`, `modules/module-safety-seed-words-draft-1.md`, `modules/module-safety-seed-hex-draft-1.md` and `spec/MIP-law-draft-5.md`, with eleven readings listed in `modules/airgap/README.md`, confirmed by Nobody, allegedly. Built before steps 4, 5 and 5a, as asked: it needs only the core library.

**7. Freeze-suite harness and the identity gauntlet** *(Rust)*
Scenario 5, steps 6 to 7d, against the three real homes, with two test identities: A, with three homes under the three simulated operators, for majority (two of three, including with the author's machine switched off); B, self-hosted on the author's machine with the two public homes as backups, for self-hosting (Identity rule 22a). Then a stolen safety key, a forged receipt, closure by rotation, homeless rotation, escape with both keys, a genuine conflict settled by audit.
*Done when:* the gauntlet passes.

### Content

**8. Long-form text format** *(cMIP, then module code)*
*Done when:* the specification is approved and a formatted text renders, with its plain text always available.

**9. JPEG module and barebone client**
*Done when:* a test identity posts text with a picture and another client shows it, verified.

**10. Web reader** *(TypeScript)*
Opens by link, fetches acts from a relay, verifies them, renders long-form documents and posts, shows who signed each one and its fingerprint, and offers a way to reach Nobody, allegedly. Domain and hosting.
*Done when:* a link opened on a fresh device shows a verified document.

**11. Management clients**
For the home relay and the basic relay.
*Done when:* an operator can run each without a terminal.

### Friction in Finance and Law *(F84)*

Each of these is small on purpose: enough for every layer to meet real use before it freezes.

**12. Lightning integration module** *(Module, then code; Finance)*
How a Lightning payment becomes a Finance receipt and a payout. Nobody, allegedly: "probably the easiest module".
*Done when:* the specification is approved, and a test identity pays another over Lightning and both hold a verified receipt.

**12a. On-chain module** *(Module, then code; Finance; inserted 28 September 2026, placement decided by Nobody, allegedly)*
The second payment rail: how an on-chain bitcoin payment becomes a Finance receipt and a payout, and how the vault holds large sums on-chain behind the safety key. A payment is not final until confirmed, so receipts must show "paid, not yet settled". *It forces Finance rule 14a (a unit the vault does not cover) and the settled state into the open.*
*Done when:* the specification is approved; a test identity pays another on-chain and both hold a verified receipt, shown as pending until confirmed; a payment above the vault's limit goes to the vault.

**13. Split Module** *(Module, then code; Law)*
A split over stakes: a payment divided among test identities, exactly.
*Done when:* the specification is approved, and a payment is split, balances to the unit, and each share is paid and receipted.

**14. Deal-assessment tool** *(Law)*
"Something to assess deals" (Nobody, allegedly). What it assesses is defined with Nobody, allegedly at the start of the step. *Suggested (Claude): it reads an agreement and shows, in plain words, who signed, what each party is bound to, the shares, and how the deal ends.*
*Done when:* defined with Nobody, allegedly at the start of the step.

**14a. Pooled anchoring cMIP** *(cMIP, then code; Identity, Finance, Law and Production at once; inserted 28 September 2026, placement decided by Nobody, allegedly: "a clusterfuck bound to reveal issues")*
An anchoring service paid per hash over Lightning pools the requests and commits each batch (a Merkle root) in one on-chain transaction, by pay-to-contract rather than OP_RETURN where it holds in practice. A real service with real reasons to cheat. It must settle, in the specification or in findings: paid now, anchored later (a pending state with a deadline on a time reference); omission (the Lightning receipt names the hash, inclusion is checkable against the chain, a paid hash missing after the deadline is a provable default and a refund); pooled funds as visible custody, and the conversion to on-chain with receipts per hop; who pays when a batch costs more than the pool, stated in advance, and exact division of one fee among many payers; urgency tiers as levels of a standing offer; how many confirmations make an anchor count, and what a chain reorganisation does to one already relied on.
*Done when:* the specification is approved; test identities pay for hashes, a batch is anchored on a test chain, anyone verifies inclusion from the chain; a hash paid for and left out becomes a provable default and is refunded.

### Review and freeze *(F84)*

**15. Machine review** *(Fable, larger budget)*
Every scenario the components can run is run; the rest are reasoned on paper; the draft freeze report marks each. Then Fable reviews everything, the texts, the code and the report: "breaks things and fixes them". A fix that changes a MIP is a finding. From the report's reasoned items, targeted questions go to specialists (F85).
*Done when:* every finding from the review is resolved with Nobody, allegedly and recorded, and the affected scenarios are rerun or re-reasoned.

**16. The freeze**
Settle the remaining open parameters of all six MIPs (test vectors, pinned Unicode version, key-delivery format, commitment construction, private links, exact formats for Finance, Law and Production). **Human adversarial review (round 3) by Semisol**, against the running prototypes as well as the texts: "Yo Semi, can you help me break this?" (Nobody, allegedly). What he breaks is resolved with Nobody, allegedly and recorded. Then freeze all six together, at inception (F85).
*Done when:* the six frozen texts, their hashes and the freeze report are published together, and the core library uses those hashes.

**16a. Name clean-up** *(inserted 28 September 2026, decided by Nobody, allegedly)*
Before the repository is ported to MOR or shown anywhere, every personal name and nickname of the author is replaced with "Nobody, allegedly": in every current file, and in the commit history, which is rewritten. *Rewriting history replaces main and every branch on GitHub; it is done once, with explicit approval at the time, after all other branches are merged or deleted.*
*Done when:* a search of every file and every commit finds no personal name of the author.

### Publication

**17. First acts and the repository on MOR**
The relays are wiped of every test act. Every server that carries on past the tests is reinstalled from scratch, not merely emptied: no test data, no build window key and no leftover settings reach the phase with real identities (decided by Nobody, allegedly). The home on the author's machine gets a fresh onion address, so the test one, still in old commits, leads nowhere (decided by Nobody, allegedly: "good hygiene"). the author's real identity is created with the air-gapped Module, and publishes the first short post ("Thank you for the shower…" with the planet), the full text as the first long-form document, the specifications, and the code releases as read-only acts. The real collective is created the same way as the test collective of step 5a, with its founding agreement, and the first real release is published through it.
*Done when:* everything the reader shows is signed by the author's identity and fetched from a relay.

**18. Final test pass**
Every component re-tested end to end; the door opened on devices it has never seen.
*Done when:* all passes. **Only then is anything shown.**

## Decisions due along the way

| Decision | Before |
| --- | --- |
| License of the specifications and documents | step 17 |
| Hosting for the public home relay (step 4 deploys on a public server). Plan: three homes on three hosts, Infomaniak, 1984 Hosting and the author's own machine at an onion address; three simulated operators. Both public hosts: an unmanaged VPS with root access, Debian 13, login by SSH key only. Access: the author's own key, made on the author's own computer and permanent; beside it, a temporary key generated by the build window itself, whose public half only is added to the servers, and which is removed before step 17. No private key ever travels between the two. 1984 Hosting was then set aside as too large and too dear for the test phase. **The third public home runs for now as a second home on the Infomaniak server**, at `home2.dubsar.org`, under the third test operator (decided by Nobody, allegedly: "as a test, it works; we already have to fake multiple operators"). The majority is counted per operator, not per server, so the test is the same. Later it moves to a host of its own, and that move is itself a test: a home changes servers through its operator's routes, without any owner rotating (Identity; relay transport cMIP, "Addresses"). The host for real identities is chosen again at step 17. A test server only; the host for real identities is chosen again at step 17 | step 4 |
| A name for each public home (for example two subdomains of one domain), so they can have HTTPS certificates. *Settled, 29 September 2026 (Nobody, allegedly):* `dubsar.org`, registered with its owner's details hidden; `home1.dubsar.org` and `home2.dubsar.org` | step 4 (deployment) |
| The long-form markup | step 8 |
| Domain for the reader | step 10 |
| Finance rule 14a: a payment in a unit the vault does not cover is undeliverable (fail closed); awaiting confirmation since the round 2 revision | step 12 |
| What the deal-assessment tool assesses | step 14 |
| Anchoring without OP_RETURN: pay-to-contract (the chain sees an ordinary payment; only holders of the hash and proof can verify). Suggested (brainstorm) as the target, and a specialist question (F85) | step 14a |
| Whether the frozen core forbids floats, tags and simple values in act payloads (extra surface where implementations can disagree; `core/README.md`) | step 16 |
| Which identity publishes the specifications on MOR (the brainstorm proposal suggests: the collective publishes code, the author's identity the specifications he wrote) | step 17 |

## After V1

*Decided by Nobody, allegedly, 28 September 2026 (F85), replacing the circle of five decided earlier the same day.*

V1 is frozen at inception, and nobody is appointed to decide what comes next. "That is a problem they can deal with if they become curious and excited… and they can do so without me. I can move on to other things." A successor is anyone's to build, and users move to it by choice, as the core already provides.

### The collective, and the author's exit *(decided by Nobody, allegedly, 28 September 2026)*

After the first acts, Nobody, allegedly sets up a collective of developers on MOR, gives it its rules in a founding agreement, and leaves. "I show that I can set up a collective, give it rules, and leave. They can change the rules if the agreement meets mine. I add people when they show proof of contribution to the project; once the collective meets a certain diversity and mass, I exit." It is the first live use of Law's collectives: a founding agreement with its key grammar, members joining by clone and rotation, and the founder leaving (Law rules 35 to 37, 45 to 46a).

**His rules do not outlive his membership (decided by Nobody, allegedly).** "The act of me leaving forces the rewrite of the rules." Leaving is a member change, so it takes a rotation and a clone of the founding agreement (Law rule 37): the remaining members write the rules at that moment. His founding agreement stays on record, so anyone can see whether a later clone still meets it. No change to the Law MIP.

**What it controls (decided by Nobody, allegedly).** "Collective controls a repo, nothing more, with core branches locked." A code repository, and nothing else; the branches holding the frozen core are locked. *Note (Claude): a lock on a hosted repository holds only as long as whoever administers the host keeps it; the frozen core itself cannot change in any case, since its texts and hashes are published as acts.*

**Contribution and diversity (decided by Nobody, allegedly).** A contributor implements a cMIP, a Module, a client, or a new type of relay ("new type of relay of course": running another instance of an existing one does not count). "Diverse enough is that there are contributors that cover all areas of development": cMIPs, Modules, clients and relays. *Note (Claude): the protocol cannot tell whether identities are distinct people, so one person could cover several areas; judging that is the author's call, stated as such.*

**Mass (decided by Nobody, allegedly):** no number. "It will be a feeling anyway. If ever… 'I can leave, the snowball is heading downhill.'"

*People Nobody, allegedly has named as natural to ask segmented questions, each with their own angle: Semisol, JB (Damus), Kirian, UTXO, Fishcake (nostr.build), hazard (Blossom), the people behind nostr.wine, Rock (Stemstr). None has a role.*

## If a step exposes a flaw in a MIP

Stop, name it, resolve it with Nobody, allegedly, and record it in the findings log. Writing code is also a review.
