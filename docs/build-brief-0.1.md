# MOR 0.1: Build Brief

*28 September 2026. The starting point for building MOR 0.1, written against core v12, the MIP drafts (Identity 7, Text 5, Envelope 4, Finance 5, Law 4, Production 4), freeze test suite v11 and the findings log to F82. It records what Nobody, allegedly decided on 27 and 28 September, what is suggested, and what is still open.*

## Purpose of 0.1

Two things, in this order:

1. **The door.** A link Nobody, allegedly can send to one person at a time. It lands on a web reader, where everything is found: the statement, the documents, the links to the code. The documents are themselves MOR acts, signed by the author's identity and fetched from a relay. The protocol is shown by being used. *(Decided, Nobody, allegedly: "The pitch is… here is a link. That's it." "A small door to a big universe.")*
2. **The proof.** The identity gauntlet (freeze test suite, scenario 5, steps 7 to 7d) passing against the home relay and the genesis client. That proves most of review round 2 in code, and it is what the first builders will want to see, or break.

0.1 exercises Identity, Text, Envelope and Production. Finance and Law are not built in 0.1.

## Decisions (Nobody, allegedly)

- **Languages:** Rust for the core library, relays and homes; TypeScript for the clients. A Rust specialist is available for tough calls.
- **The first short post:** "Thank you for the shower…" with a JPEG of planet Earth.
- **The first long-form post:** the full text of "Thank you for the shower" (written 2014), formatted. It is the long-form module's first real test and the first document in the reader.
- **The code repository:** on GitHub, under a new online identity Nobody, allegedly will create. The repository is also published on MOR as acts, read-only (see "The repository").

## Components

In build order. *The order is suggested (Claude): the door first, then the gauntlet.*

| # | Component | Language | Done when |
| --- | --- | --- | --- |
| 0 | **Core library** | Rust | It builds, verifies and locks acts exactly as the MIPs define (deterministic CBOR, tagged hashes, act ids, XChaCha20-Poly1305, canonical text, running summaries, identity-chain checks), and passes published test vectors. It compiles to WebAssembly so the clients can use it. |
| 1 | **Relay transport** (a founding cMIP, a document first) | — | Its specification is written and hashed: how a client publishes an act, fetches acts, follows new ones, delivers to an inbox route, and asks a home for a receipt. *The core deliberately does not define this (core v12, "Outside the core"), so 0.1 cannot start without a founding one.* |
| 2 | **Home relay** and its management client | Rust / TypeScript | It stores and serves identity chains, routes and names, checks rotations, signs receipts and log summaries. Two deployments of the same software: one on a machine at home, one on a public server where others can set up their identities. The management client shows what the home holds and lets its operator run it. |
| 3 | **Genesis client** | TypeScript (with the core via WebAssembly) | It creates an identity: signing key, committed safety key, genesis naming its homes; later a rotation. For 0.1 the safety key is held in software, labelled clearly as a prototype; the air-gapped Module comes later. |
| 4 | **Basic relay** and its management client | Rust / TypeScript | It stores and serves acts and media, checks signatures and locked hashes, and publishes commitments. |
| 5 | **Long-form module** (specification + code) | — / TypeScript | Its specification is written and hashed: a format for formatted text on top of the Text MIP's canonical text. Its code renders it. |
| 6 | **Long-form web reader** | TypeScript | **The door.** It opens by link, fetches acts from a relay, verifies them with the core, and renders long-form documents. It shows who signed each one, with its fingerprint, and gives a way to reach Nobody, allegedly. It also serves as the read-only client of the original plan. |
| 7 | **JPEG module** (specification + code) | — / TypeScript | Its specification is written and hashed: how a JPEG is described as a media object. |
| 8 | **Barebone client** | TypeScript | It posts text with a JPEG, and shows posts. It publishes the first short post. |
| 9 | **Freeze-suite harness** | Rust | It runs scenarios from the freeze test suite against the real components, starting with scenario 5, steps 7 to 7d. |
| 10 | **The repository on MOR** | — | See below. |

The harness (9) grows alongside everything else: every component is done only when its scenarios pass.

## The repository

"The repo" means two things, and 0.1 needs both.

- **The code repository** (GitHub). Where the code is written, reviewed and attacked. It is a workshop, not the record.
- **The repository on MOR** (read-only). Where it is recorded. Each release of the code, and each specification (the six MIPs, the founding cMIPs and Modules), is published as an act, named by its hash. Nothing is updated: a new release is a new act naming the one before. This is where the six MIP hashes are published together, the one trust root below the MIPs (Production rule 20).

*The door links to both: GitHub for those who want to build, MOR for the record anyone can verify.*

## Open, to settle before or during the build

1. **Draft hashes versus frozen hashes.** Every act names its specification by hash. The MIPs are drafts, and their hashes will change at freeze. Acts signed in 0.1 will therefore name draft specifications, and will not be acts of the frozen protocol. This matters most for the first posts. Either they are made in 0.1 as prototypes and signed again after freeze ("nothing is updated; it is published or signed again"), or they wait for freeze. *Nobody, allegedly to decide.*
2. **Who publishes the repository on MOR.** the author's own identity, or a separate MOR identity (possibly a collective later). *Nobody, allegedly to decide.*
3. **The long-form format.** Which markup the long-form module uses, within the Text MIP's rules for formats. *To settle when writing its specification.*
4. **Rust crates for the cryptography,** especially SLH-DSA and ML-KEM, whose libraries are young. Their audit status to be checked, with the Rust specialist.
5. **Hosting for the public home relay** and the reader.

## How the build chat works

- Start from the current drafts in the project, not from their history. The findings log explains why a rule exists; the drafts say what it is.
- The freeze test suite is the specification of what to test.
- Where a rule is marked as client conformance, a stated cost, or a working rule about rare cases and markets, do not quietly take the convenient path. Those are the places the next adversarial review will press first.
- If building exposes a flaw in a MIP, stop, name it, and resolve it with Nobody, allegedly. Record it in the findings log. *Writing code is also a review.*
- One question at a time on technical foundations; plain language first, then precise.
