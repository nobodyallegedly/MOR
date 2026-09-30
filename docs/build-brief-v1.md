# MOR V1: Build Brief

*28 September 2026. The starting point for building MOR V1, the first release, frozen at inception (F85). Written against core v12, the MIP drafts (Identity 7, Text 5, Envelope 4, Finance 5, Law 4, Production 4), freeze test suite v12 and the findings log to F85. It records what Nobody, allegedly decided on 27 and 28 September, what is suggested, and what is still open.*

## Purpose of V1

Two things. Nothing is shown before both are built and tested (Nobody, allegedly): the build order is in `docs/roadmap-v1.md`.

1. **The door.** A link Nobody, allegedly can send to one person at a time. It lands on a web reader, where everything is found: the statement, the documents, the links to the code. The documents are themselves MOR acts, signed by the author's identity and fetched from a relay. The protocol is shown by being used. *(Decided, Nobody, allegedly: "The pitch is… here is a link. That's it." "A small door to a big universe.")*
2. **The proof.** The identity gauntlet (freeze test suite, scenario 5, steps 7 to 7d) passing against the home relay and the genesis client. That proves most of review round 2 in code, and it is what the first builders will want to see, or break.

V1 exercises all six layers, so every one meets friction (F84): Identity, Text and Envelope through the door and the gauntlet; Finance through a Lightning integration module; Law through a Split Module and a deal-assessment tool; Production throughout, since every specification published runs through it. All six MIPs are frozen together at the first release. It is tested in more detail (F85): every scenario the components can run is run, the rest are reasoned on paper, and the freeze report says which.

## Decisions (Nobody, allegedly)

- **Build versus show:** what is built is separate from what is shown; nothing is shown before every step of the roadmap is built and tested.
- **Safety key in V1:** in software for test identities; the air-gapped safety key Module before the identity gauntlet, as the freeze test suite requires. the author's real identity is created only with the Module, at the first acts, after the relays are wiped of test acts.
- **Repository layout:** `spec/` for the core, `modules/` and `cmips/` for founding specifications above it, `docs/` for the brief, overviews and findings.

- **Languages:** Rust for the core library, relays and homes; TypeScript for the clients. A Rust specialist is available for tough calls.
- **The first short post:** "Thank you for the shower…" with a JPEG of planet Earth.
- **The first long-form post:** the full text of "Thank you for the shower" (written 2014), formatted. It is the long-form module's first real test and the first document in the reader.
- **The code repository:** on GitHub, under a new online identity Nobody, allegedly will create. The repository is also published on MOR as acts, read-only (see "The repository").
- **Freeze the lot (F84):** "Whatever we release is the first, however we wanna call it. So, we'll freeze the lot at presentation, some purely theoretically." All six MIPs freeze together; F83's staged freeze is withdrawn. The order: build solutions that test each layer, "so we experience friction"; then Fable reviews everything with a larger budget, "breaks things and fixes them"; then the freeze. The freeze report marks each scenario run or reasoned.
- **License (step 0):** the code is dual-licensed, MIT or Apache 2.0 at the user's choice. Anyone may build on it, closed products included; the protocol, not the license, protects users (portable identities, a frozen core named by hash). *(Decided, Nobody, allegedly, 28 September 2026, on Claude's suggestion.)* The license of the specifications and documents is still open.
- **Second payment rail: on-chain bitcoin (from the brainstorm):** after Lightning, an on-chain module. No mint and no third party; the payer's side of the record is public on the chain, so double entry is built in; it is the natural rail for the vault; and a payment is not final until confirmed, so receipts must handle "paid, not yet settled". Cashu is not considered. *(Decided, Nobody, allegedly, 28 September 2026.)* Roadmap step 12a; a pooled anchoring cMIP follows at step 14a.
- **The versions (case study 21):** MOR is the experiment, MOR2 the prototype, MOR3 the protocol. The name is written MOR3 (the stylised MORƎ reads the same). *(Decided, Nobody, allegedly, 30 September 2026.)*
- **Pictures (step 9):** the JPEG Module accepts any JPEG; a posting client strips it to the picture alone before publishing (no location, camera data, previews or hidden pictures), copying the compressed picture byte for byte. A strict subset was set aside. *(Decided, Nobody, allegedly, 30 September 2026.)*
- **Reaching the author (step 10):** the reader offers both email and a message over MOR, sealed in the visitor's browser and signed by a one-time identity. The address is a setting of the deployment, a Proton address until the dubsar.org one exists for the release. *(Decided, Nobody, allegedly, 30 September 2026.)*
- **Management page access (step 11):** the browser makes its own key, which even the page cannot read out, and pairs it once with a single-use, expiring code the relay prints; every request is signed with it and names the relay, the time and a single-use number. Operator identity keys play no part; nothing on the page is an act. *(Decided, Nobody, allegedly, 30 September 2026.)*
- **Publishing MOR's documents (step 17):** published once, by the author's identity, and co-signed, as a second act naming each document, by the identity of a machine agent the author manages and whose keys he holds, as its first act says openly. It is not Claude's or its makers' identity and must not claim to be. The agent is named "Machine, allegedly"; its first act discloses that the author holds its keys and that its signature is credit, not a second witness. *(Decided, Nobody, allegedly, 30 September 2026.)*
- **The story:** "A man with a concept and a machine with code built MOR1, that's it, that is the story."
- **Frozen at inception (F85):** "You and me build V1, with help through questions in segmented fashion to other people. It's an ideological decision. Frozen at inception, no debate about who decides the next step. That is a problem they can deal with if they become curious and excited… and they can do so without me. I can move on to other things." Nobody, allegedly and Claude build and freeze V1; others help by answering segmented questions and decide nothing. "By the time we're done testing we will know what is real and what only exists on paper. From that we can devise targeted questions to specialists." The circle of five (decided earlier the same day) is withdrawn. One human breaks it before the freeze: Semisol ("Yo Semi, can you help me break this?"), the core's round 3; he decides nothing. What comes after V1 belongs to whoever takes it up.
- **A collective, then the exit:** after the first acts, Nobody, allegedly sets up a collective of developers with its rules, adds members on proof of contribution, and leaves once it reaches a certain diversity and mass (roadmap, "After V1"). *(Decided, Nobody, allegedly, 28 September 2026; details open.)*

## Components

The components. *Their build order is in `docs/roadmap-v1.md`: foundations, identity proven by the gauntlet, content, friction in Finance and Law, review and freeze, publication.*

| # | Component | Language | Done when |
| --- | --- | --- | --- |
| 0 | **Core library** | Rust | It builds, verifies and locks acts exactly as the MIPs define (deterministic CBOR, tagged hashes, act ids, XChaCha20-Poly1305, canonical text, running summaries, identity-chain checks), and passes published test vectors. It compiles to WebAssembly so the clients can use it. |
| 1 | **Relay transport** (a founding cMIP, a document first) | — | Its specification is written and hashed: how a client publishes an act, fetches acts, follows new ones, delivers to an inbox route, and asks a home for a receipt. *The core deliberately does not define this (core v12, "Outside the core"), so V1 cannot start without a founding one.* |
| 2 | **Home relay** and its management client | Rust / TypeScript | It stores and serves identity chains, routes and names, checks rotations, signs receipts and log summaries. Two deployments of the same software: one on a machine at home, one on a public server where others can set up their identities. The management client shows what the home holds and lets its operator run it. |
| 3 | **Genesis client** | TypeScript (with the core via WebAssembly) | It creates an identity: signing key, committed safety key, genesis naming its homes; later a rotation. Test identities hold the safety key in software, labelled clearly as a prototype; the air-gapped Module (`modules/`) is implemented before the identity gauntlet is run, and the author's real identity is created with it, at the first acts. |
| 4 | **Basic relay** and its management client | Rust / TypeScript | It stores and serves acts and media, checks signatures and locked hashes, and publishes commitments. |
| 5 | **Long-form module** (specification + code) | — / TypeScript | Its specification is written and hashed: a format for formatted text on top of the Text MIP's canonical text. Its code renders it. |
| 6 | **Long-form web reader** | TypeScript | **The door.** It opens by link, fetches acts from a relay, verifies them with the core, and renders long-form documents. It shows who signed each one, with its fingerprint, and gives a way to reach Nobody, allegedly. It also serves as the read-only client of the original plan. |
| 7 | **JPEG module** (specification + code) | — / TypeScript | Its specification is written and hashed: how a JPEG is described as a media object. |
| 8 | **Barebone client** | TypeScript | It posts text with a JPEG, and shows posts. It publishes the first short post. |
| 9 | **Freeze-suite harness** | Rust | It runs scenarios from the freeze test suite against the real components, starting with scenario 5, steps 7 to 7d. |
| 10 | **The repository on MOR** | — | See below. |
| 10a | **Release manifest and repo client**, with a test collective | — / to settle | Roadmap step 5a: a manifest format (a founding cMIP or Module), a client that publishes and verifies releases, and a test collective under a real founding agreement whose release rule requires visible member signatures. Every release of the code is published through it from then on. |
| 11 | **Lightning integration module** (specification + code) | — / to settle | Its specification is written and hashed: how a Lightning payment becomes a Finance receipt and a payout. A test identity pays another over Lightning and both hold a verified receipt. *(Nobody, allegedly: "probably the easiest module".)* |
| 11a | **On-chain module** (specification + code) | — / to settle | Roadmap step 12a: on-chain payments and the vault, with receipts pending until confirmed. |
| 12 | **Split Module** (specification + code) | — / to settle | Its specification is written and hashed: a Law split over stakes. A payment is split among test identities, the split balances exactly, and each share is paid and receipted. |
| 13 | **Deal-assessment tool** | to settle | *What it assesses is to be defined with Nobody, allegedly at its step* ("something to assess deals"). Suggested (Claude): it reads an agreement and shows, in plain words, who signed, what each party is bound to, the shares and how the deal ends. |
| 13a | **Pooled anchoring cMIP** (specification + code) | — / to settle | Roadmap step 14a: a service anchoring paid hashes in batches on-chain; an omitted hash is a provable default and a refund. |

The harness (9) grows alongside everything else: every component is done only when its scenarios pass, run or reasoned.

## The repository

"The repo" means two things, and V1 needs both.

- **The code repository** (GitHub). Where the code is written, reviewed and attacked. It is a workshop, not the record.
- **The repository on MOR** (read-only). Where it is recorded. Each release of the code, and each specification (the six MIPs, the founding cMIPs and Modules), is published as an act, named by its hash. Nothing is updated: a new release is a new act naming the one before. This is where the six MIP hashes are published together, the one trust root below the MIPs (Production rule 20).

**MOR governs its own code (roadmap step 5a, decided by Nobody, allegedly).** From step 5a, every release is published on the test relays as a manifest signed under a test collective's release rule; until the first builders join after V1, releases are signed by the author's own identity, and the real collective is founded with them (a collective of one would need a successor and an escrowed share, F96; decided by Nobody, allegedly, 30 September 2026). A release the collective did not sign is not a release. *Consequence (step 5a):* build windows keep no keys and cannot reach the public homes, so each window prepares the code, and the release is published and signed from the author's machine, where the test collective's files live.

*The door links to both: GitHub for those who want to build, MOR for the record anyone can verify.*

## Open, to settle before or during the build

1. **Draft hashes versus frozen hashes.** Settled by F84: all six MIPs freeze before the first acts, so the first acts are permanent. The specification format stays in Production, which freezes with the rest.
2. **Naming.** Settled by F85: the first release, frozen at inception, is V1.
3. **Who publishes the repository on MOR.** Code releases: the author's own identity at step 17, then the collective once the first builders found it (decided). Specifications: the author's own identity or the collective (the brainstorm proposal suggests Nobody, allegedly signs the MIPs he wrote). The same identity is named as creator of the founding cMIPs and Modules, whose hashes are draft hashes until then. *Nobody, allegedly to decide, at step 17.*
4. **The long-form format.** Which markup the long-form module uses, within the Text MIP's rules for formats. **Settled (Nobody, allegedly, 30 September 2026):** a strict subset of Markdown, `cmips/cmip-long-form-draft-1.md`.
5. **Rust crates for the cryptography,** especially SLH-DSA and ML-KEM, whose libraries are young. **SLH-DSA settled (Nobody, allegedly, 28 September 2026):** the `fips205` crate (IntegrityChain), suggested by the Rust specialist: pure Rust, no unsafe code, all parameter sets including SHA2-128s and 128f, context strings, WebAssembly; heavily reviewed but not audited, and called experimental by its authors. Adopted on one testable condition: step 3's tests check every signature against a second, independent implementation. Its audit status is a specialist question before the freeze (step 15). *SLH-DSA due before roadmap step 3, ML-KEM before step 5, asked one at a time (Nobody, allegedly). FROST, only if a collective's key grammar uses it, much later.* **ML-KEM settled (Nobody, allegedly, 29 September 2026):** the `fips203` crate (IntegrityChain) for ML-KEM-768 and `x25519-dalek` for X25519 (with `curve25519-dalek` 4.1.3 or later, which fixes RUSTSEC-2024-0344), chosen by the Rust specialist for auditability with a clean WebAssembly build; no FIPS 140-3 validation sought. Combined by X-Wing (F98). Same condition as SLH-DSA: a second implementation checks every key exchange in the tests. Both crates' audit status is a specialist question before the freeze.
6. **Hosting for the public home relay** and the reader. *Settled:* homes at `home1` and `home2.dubsar.org` (Infomaniak), the reader at `reader.dubsar.org`, and a website at `dubsar.org` published on MOR through a website cMIP (roadmap step 10a). `dubsar.org` is the scribe's own site; it stays when he leaves, and it is a gateway to everything built, but not a hub for MOR: it opens on the first act, then four doors (Read, Build, Run, Use), each leading to signed acts on MOR; the scribe is a footnote, which carries the way to reach him. MOR's documents live on MOR as signed acts. *(Decided, Nobody, allegedly, 30 September 2026.)*

## How the build chat works

- Start from the current drafts in the project, not from their history. The findings log explains why a rule exists; the drafts say what it is.
- The freeze test suite is the specification of what to test.
- Where a rule is marked as client conformance, a stated cost, or a working rule about rare cases and markets, do not quietly take the convenient path. Those are the places the next adversarial review will press first.
- If building exposes a flaw in a MIP, stop, name it, and resolve it with Nobody, allegedly. Record it in the findings log. *Writing code is also a review.*
- One question at a time on technical foundations; plain language first, then precise.
