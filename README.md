# MOR

**Media Over Relays.** A protocol for media, money and agreements between people.

MOR has a small core, meant to be frozen: six MIPs in layers (Identity; Envelope and Text; Finance; Law; Production). Above it sits an open, competitive layer of cMIPs and Modules, where adoption decides. Every act is signed, named by its hash, and never updated: a new version is a new act naming the one before.

It is built to be a good ancestor. Identities, agreements and history can always leave, including to a successor protocol. Only the way out has to be right; everything else can be fixed by MOR 2.

## Status: pre-freeze draft, open for breaking

**Experimental. Not frozen. Test identities and test money only (regtest or signet), never real funds.**

- The core drafts are complete and approved by their author (5 October 2026), after two independent review rounds and 132 recorded findings ([docs/findings/](docs/findings/)), each saying why a rule exists.
- A Rust core library implements all six MIPs. It is tested against the freeze test suite and by invariant hunting: Law's promises checked over about 13,000 random histories of collectives and deals, replayed in shuffled orders ([docs/law-invariants.md](docs/law-invariants.md)). Rust workspace: 328 tests; TypeScript clients: 113 tests.
- A Lightning rail runs end to end on regtest.
- **Round 3, the human adversarial review, has not happened yet.** That is the invitation: break it. What you break is the most useful contribution there is.

What is run and what is only reasoned is stated, scenario by scenario, in the freeze test suite ([spec/03-MOR-freeze-test-suite-v21.md](spec/03-MOR-freeze-test-suite-v21.md)).

## Where to start reading

1. [docs/07-MOR-in-one-page-v6.md](docs/07-MOR-in-one-page-v6.md): MOR in one page, in plain words.
2. [spec/02-MOR-core-v21.md](spec/02-MOR-core-v21.md): the core document, the map of the six MIPs.
3. [spec/](spec/): the MIPs themselves, and the freeze test suite.
4. [docs/findings/](docs/findings/): why each rule is the way it is.
5. [docs/case-studies/](docs/case-studies/): what MOR could be, as invitations to build.

Reading convention in the specifications: normal text is the protocol; italic text is commentary, reasoning and examples.

## What is in this repository

| Folder | What |
| --- | --- |
| [spec/](spec/) | The core: the core document, six MIPs, the freeze test suite. |
| [core/](core/) | The core library, in Rust: every act made and judged by one implementation. |
| [wasm/](wasm/) | The core library for TypeScript, through WebAssembly; reproducible builds. |
| [relay/](relay/) | Relays and homes, with their management page. |
| [cmips/](cmips/) | cMIPs: relay transport, long form, release manifest, payment, website. |
| [modules/](modules/) | Modules: the air-gapped signer, seed formats, JPEG, the Lightning rail, Bitcoin units. |
| [clients/](clients/) | Clients in TypeScript: genesis, repo, long form, barebone, reader, site, management, collective, Claude connector, owner's desk. |
| [harness/](harness/) | The freeze-suite harness: the identity gauntlet against real homes, the ordering simulation, the Lightning regtest test. |
| [docs/](docs/) | The plan, the roadmap, findings, case studies, companions, and the reports of each building session (see [docs/README.md](docs/README.md)). |

cMIPs and Modules here are instruments for testing the core, not products: a working but inelegant one is an invitation for a developer.

## Build and test

Rust (stable) for the workspace:

```
cargo test --workspace
```

The clients need Node 22 or later, Rust's `wasm32-unknown-unknown` target and `wasm-bindgen-cli` 0.2.129; see [clients/README.md](clients/README.md) and [wasm/README.md](wasm/README.md). The Lightning test on regtest is optional; its steps are in [docs/core-pass-v21.md](docs/core-pass-v21.md), section 5.

## Open work

Wanted, by anyone: each is described in [docs/roadmap-v1.md](docs/roadmap-v1.md).

- **Break the core** (round 3): the texts and the running code. Report what you find with the smallest example you can.
- **An on-chain rail Module**, with "paid, not yet settled" receipts (roadmap 12a).
- **A split Module**, exact to the unit (13), and **a deal-assessment tool** that reads an agreement in plain words (14).
- **Pooled anchoring**: a cMIP anchoring batches of hashes on-chain, paid over Lightning (14a).
- **The remaining technical parameters for freeze**: the RV32IM profile and vectors, test vectors, the pinned Unicode version, exact formats for Finance, Law and Production.
- **A second Law verifier written from the text alone**, never reading the existing code: every disagreement is a finding.
- **The key rename**, decided and not yet applied: the safety key becomes the *chain key*, the everyday key the *signing key*.

There is no committee and nobody appointed to decide what comes next. A successor is anyone's to build, and users move to it by choice, as the core already provides.

## This repository and MOR

This repository is the workshop, not the record. Each release and each specification is meant to be published on MOR itself as a signed, read-only act, named by its hash.

## License

The code is licensed under either of the [MIT license](LICENSE-MIT) or the [Apache License 2.0](LICENSE-APACHE), at your option. Unless you state otherwise, any contribution you submit is licensed the same way.

The specifications and documents (`spec/`, `cmips/`, `modules/`, `docs/`) are licensed under [Creative Commons Attribution 4.0](LICENSE-DOCS) (CC BY 4.0): use, adapt and build on them freely, crediting Nobody, allegedly.

*Author: Nobody, allegedly.*
