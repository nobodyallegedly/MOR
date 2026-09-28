# MOR

**Media Over Relays.** A protocol for media, money and agreements between people.

MOR has a small core that will be frozen, six MIPs in layers (Identity; Envelope and Text; Finance; Law; Production), and an open, competitive layer above it (cMIPs and Modules) where adoption decides.

It is built to be a good ancestor: identities, agreements and history can always leave, including to a successor protocol.

## Status

The core is in draft and has been through two independent reviews. This repository is where MOR V1, the first release, is being built:

- a core library (Rust);
- a home relay and a basic relay, with their management clients;
- a genesis client that creates identities;
- a JPEG module and a barebone client for text with a picture;
- a long-form module and a long-form web reader.

See [docs/build-brief-v1.md](docs/build-brief-v1.md) for the plan, the order of work and what is still open. The protocol itself is in [spec/](spec/), and a plain-language overview in [docs/07-MOR-in-one-page-v4.md](docs/07-MOR-in-one-page-v4.md).

## This repository and MOR

This repository is the workshop, not the record. Each release and each specification will also be published on MOR itself as a signed, read-only act, named by its hash. Nothing is updated: a new release is a new act naming the one before.

## License

The code is licensed under either of the [MIT license](LICENSE-MIT) or the [Apache License 2.0](LICENSE-APACHE), at your option. Unless you state otherwise, any contribution you submit is licensed the same way.

The license of the specifications and documents (`spec/`, `cmips/`, `modules/`, `docs/`) is still to be decided.
