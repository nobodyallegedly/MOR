# MOR 0.1: Roadmap

*28 September 2026. Each step is one working session ("window"), and ends with something that can be checked. Start each window with: read `CLAUDE.md`, `docs/build-brief-0.1.md` and this roadmap, then do step N.*

## The rule (Nobody, allegedly)

**What we build is separate from what we show. Nothing is shown before every step below is built and tested.** The order therefore follows dependency and risk, not what is seen first: the riskiest part, identity under attack, comes early, so that flaws in the MIPs surface before anything is built on top of them.

Until step 13, every identity is a **test identity**, and every relay holds test acts only. When everything is ready to show, the relays are wiped and the first acts are made fresh: the author's real identity is born then, with the air-gapped safety key Module, so its genesis is itself one of the first acts.

## Steps

### Foundations

**0. Decisions** *(short, can run alongside steps 1 and 2)*
Cryptography libraries (with the Rust specialist), especially SLH-DSA and ML-KEM; the license.
*Done when:* both are recorded in the build brief.

**1. Relay transport cMIP** *(a document)*
How a client publishes, fetches and follows acts, delivers to an inbox, finds deliveries addressed to it, and asks a home for a receipt; how a home is queried for chains, receipts, routes, names and links (open in Identity).
*Done when:* Nobody, allegedly approves it, in `cmips/`.

**2. Core library, part 1** *(Rust)*
Deterministic CBOR, tagged hashes, act ids, locking and the inside commitment, canonical text, running summaries.
*Done when:* published test vectors pass, including the three-act running summary.

**3. Core library, part 2** *(Rust)*
Identity-chain checks: genesis, rotation, receipts, conflicts, which rotation counts, homeless rotation, escape. Builds to WebAssembly.
*Done when:* hand-made test chains give the answers the Identity MIP requires.

### Identity, proven

**4. Relays** *(Rust)*
The basic relay and the home relay, sharing most of their code: storage, verification on arrival, receipts, log summaries. One deployment on a public server, one on a home machine.
*Done when:* acts go in and come back verified; homes sign receipts and summaries.

**5. Genesis client** *(TypeScript)*
Creates test identities with the safety key in software, clearly labelled; publishes genesis, routes and encryption key; signs rotations.
*Done when:* a test identity exists, rotates, and its homes serve it.

**6. Air-gapped safety key Module** *(`modules/`)*
The offline signer: commitment export, pending and signed rotations, by file and animated QR, with the device rules of the Module.
*Done when:* the Module's own functional and attack tests pass.

**7. Freeze-suite harness and the identity gauntlet** *(Rust)*
Scenario 5, steps 6 to 7d, against the real homes: majority and self-hosting, a stolen safety key, a forged receipt, closure by rotation, homeless rotation, escape with both keys, a genuine conflict settled by audit.
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

### The first freeze

**12. Freeze of the communication layers** *(F83)*
Settle the open parameters of Identity, Text and Envelope (test vectors, pinned Unicode version, key-delivery format, commitment construction, private links), decide where the specification format lives, rewrite the freeze rule as staged, and freeze the three layers. *Suggested (Claude):* a human adversarial review of the three layers before they freeze.
*Done when:* the three frozen texts and their hashes are published together, and the core library uses those hashes.

### Publication

**13. First acts and the repository on MOR**
The relays are wiped of every test act. the author's real identity is created with the air-gapped Module, and publishes the first short post ("Thank you for the shower…" with the planet), the full text as the first long-form document, the specifications, and the code releases as read-only acts.
*Done when:* everything the reader shows is signed by the author's identity and fetched from a relay.

**14. Final test pass**
Every component re-tested end to end; the door opened on devices it has never seen.
*Done when:* all passes. **Only then is anything shown.**

## Decisions due along the way

| Decision | Before |
| --- | --- |
| Cryptography libraries; license | step 2 |
| Domain and hosting | step 10 |
| Where the specification format lives (F83) | step 12 |
| Which identity publishes the repository on MOR | step 13 |

## After 0.1 (F83)

Stage 2: a small invited group works on Finance, Law and the rest of Production. Stage 3: those layers are frozen, and the complete core is sent to universities.

## If a step exposes a flaw in a MIP

Stop, name it, resolve it with Nobody, allegedly, and record it in the findings log. Writing code is also a review.
