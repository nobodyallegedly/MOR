# MOR

**Media Over Relays.** Research into a protocol for media, money and agreements between people.

MOR has a small core, meant to be frozen: six MIPs in layers, **Identity, Text, Envelopes, Money, Agreements and Development**. Above it sits an open, competitive layer of cMIPs and Modules, where adoption decides. Every act is signed, named by its hash, and never updated: a new version is a new act naming the one before.

*The layers were renamed on 10 October 2026 (F212): Envelope became Envelopes, Finance became Money, Law became Agreements, Production became Development. The files and the code still carry the old names until one rename pass applies them; older records keep their wording, so "Finance rule 15" there means Money rule 15.*

It began with a text written in 2014, before MOR had a name: [Thank You For the Shower](docs/thank-you-for-the-shower.md).

It is built to be a good ancestor. Identities, agreements and history can always leave, including to a successor protocol. Only the way out has to be right; everything else can be fixed by MOR 2.

## Status: pre-freeze, building, open for breaking

**Experimental. Not frozen. Test identities and test money only (regtest or signet), never real funds.**

- **The core texts** were complete and approved by their author on 5 October 2026. Since then each building step and each hostile review has found more, and the texts are revised in place, finding by finding, for the author to approve again. The findings log runs to F220 ([docs/findings/](docs/findings/)): each finding says why a rule exists, and the log records which decisions were the author's and which were suggested.
- **The core library**, in Rust, implements all six MIPs: 516 tests, plus invariant hunting, where Law's promises are checked over thousands of random histories of collectives and deals, replayed in shuffled orders ([docs/law-invariants.md](docs/law-invariants.md)). The TypeScript clients run on it through WebAssembly: 203 tests across eleven packages.
- **Two payment rails run end to end on regtest.** Lightning; and on-chain bitcoin by pay-to-contract, with proofs checked against the chain the verifier follows ([modules/module-onchain-rail-draft-2.md](modules/module-onchain-rail-draft-2.md)). A first clock, Bitcoin, sits under one anchoring cMIP ([cmips/cmip-anchoring-draft-1.md](cmips/cmip-anchoring-draft-1.md)).
- **The project's website is published on MOR itself**, as signed acts, served by a gateway that checks them; its display client is built reproducibly on Linux, byte for byte.
- **Building steps are attacked by a separate AI reviewer**, and its reports are kept ([docs/reviews/](docs/reviews/)).
- **The human adversarial review (round 3) has not happened yet.** That is the invitation: break it. What you break is the most useful contribution there is.

What is run and what is only reasoned is stated claim by claim in the paper ([docs/paper/mor-paper-draft-2.md](docs/paper/mor-paper-draft-2.md), section 6.2). The freeze test suite ([spec/03-MOR-freeze-test-suite-v21.md](spec/03-MOR-freeze-test-suite-v21.md)) is the specification of what to test; marking each scenario is the freeze report, still to be written.

## Where to start reading

1. [docs/07-MOR-in-one-page-v10.md](docs/07-MOR-in-one-page-v10.md): MOR in one page, in plain words.
2. [spec/02-MOR-core-v21.md](spec/02-MOR-core-v21.md): the core document, the map of the six MIPs.
3. [spec/](spec/): the MIPs themselves, and the freeze test suite.
4. [docs/findings/](docs/findings/): why each rule is the way it is.
5. [docs/case-studies/](docs/case-studies/): what MOR could be, as invitations to build, from a cat video to academic publishing.
6. [docs/companions/](docs/companions/): who can earn on MOR, and the principle of legible greed.

Reading convention in the specifications: normal text is the protocol; italic text is commentary, reasoning and examples.

## What is in this repository

| Folder | What |
| --- | --- |
| [spec/](spec/) | The core: the core document, six MIPs, the freeze test suite. |
| [core/](core/) | The core library, in Rust: every act made and judged by one implementation. |
| [wasm/](wasm/) | The core library for TypeScript, through WebAssembly; reproducible builds. |
| [relay/](relay/) | Relays and homes, with their management page. |
| [cmips/](cmips/) | cMIPs: relay transport, long form, release manifest, payment, website, anchoring. |
| [modules/](modules/) | Modules: the air-gapped signer, seed formats, JPEG, the Lightning and on-chain rails, the Bitcoin clock, Bitcoin units. |
| [clients/](clients/) | Clients in TypeScript: genesis, repo, long form, barebone, reader, site, management, collective, Claude connector, owner's desk. |
| [harness/](harness/) | The freeze-suite harness: the identity gauntlet against real homes, the ordering simulation, the regtest rail tests. |
| [verifier2/](verifier2/) | A second verifier for collectives' endings, written from the text alone; every disagreement is a finding. |
| [docs/](docs/) | The roadmap, findings, reviews, case studies, companions, and the report of each building session (see [docs/README.md](docs/README.md)). |

cMIPs and Modules here are instruments for testing the core, not products: a working but inelegant one is an invitation for a developer.

## Build and test

Everything, with one command:

```
scripts/test-all.sh
```

It runs the Rust workspace's tests, builds the core library for the clients (WebAssembly), and runs every TypeScript package's tests. Add `--reproducible` to also rebuild the published display client and check it is the same, byte for byte. GitHub runs the same command on every change ([.github/workflows/test.yml](.github/workflows/test.yml)).

It needs Rust through rustup (the version is pinned in `rust-toolchain.toml`, installed on first use), Node 22 or later, and `wasm-bindgen-cli` 0.2.129 (`cargo install wasm-bindgen-cli --version 0.2.129 --locked`). The site's browser test needs Chromium or Chrome, named by `MOR_CHROMIUM`. The regtest rail tests are optional: Lightning's steps are in [docs/core-pass-v21.md](docs/core-pass-v21.md), section 5; the on-chain test runs with `MOR_BTCD` set ([modules/onchain/README.md](modules/onchain/README.md)). See also [clients/README.md](clients/README.md) and [wasm/README.md](wasm/README.md).

## Open work

Wanted, by anyone: each is described in [docs/roadmap-v1.md](docs/roadmap-v1.md).

- **Break the core** (round 3): the texts and the running code. Report what you find with the smallest example you can.
- **The open formats, as one set** (12b): every act in Money, Agreements and Development given an exact format. Decided on 10 October 2026, being built.
- **Pooled anchoring** (14a): batches of hashes anchored on Bitcoin, paid over Lightning, with omission made provable. Being built.
- **A split Module**, exact to the unit (13), and **a deal-assessment tool** that reads an agreement in plain words (14).
- **A forked deal**: two complete versions of one agreement, and how it is repaired, under exploration and review.
- **The remaining technical parameters for freeze**: the RV32IM profile and its programs, test vectors, the pinned Unicode version.
- **A second verifier for more of Agreements**, beyond collectives' endings, written from the text alone, never reading the existing code.
- **Two renames, decided and not yet applied**: the layers (above), and the keys (the safety key becomes the *chain key*, the everyday key the *signing key*).

There is no committee and nobody appointed to decide what comes next. A successor is anyone's to build, and users move to it by choice, as the core already provides.

## This repository and MOR

This repository is the workshop, not the record. Each release and each specification is meant to be published on MOR itself as a signed, read-only act, named by its hash.

## License

The code is licensed under either of the [MIT license](LICENSE-MIT) or the [Apache License 2.0](LICENSE-APACHE), at your option. Unless you state otherwise, any contribution you submit is licensed the same way.

The specifications and documents (`spec/`, `cmips/`, `modules/`, `docs/`) are licensed under [Creative Commons Attribution 4.0](LICENSE-DOCS) (CC BY 4.0): use, adapt and build on them freely, crediting Nobody, allegedly.

*Author: Nobody, allegedly.*
