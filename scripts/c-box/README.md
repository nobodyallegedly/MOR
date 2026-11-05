# MOR: the texts and the vectors

This repository holds a fixed snapshot of MOR's core, and nothing else:

- `spec/`: the eight texts of the core, as they stand before the freeze: the MICS document (the map), the six MIRs (Identity, Text, Envelopes, Money, Agreements, Development) and the freeze test suite.
- `cmips/`: the default control cMIP, a collective's control model (Agreements rule 99), beside the eight texts. It is no part of the core: the core defines what a control model accepts and produces, and this cMIP is one model meeting it. It is here because the freeze test suite runs some of its steps against it, and because a builder writing a second control model needs one model to read. Its handover to its owners is left out; nothing of its specification is.
- `vectors/`: published test vectors for every layer, with their own README.
- `MANIFEST.sha256`: the SHA-256 fingerprint of every file above. `SNAPSHOT.md` says when the snapshot was taken.

The texts define the protocol. The vectors are values an implementation of the texts should reproduce. Where the two seem to disagree, that is worth recording, not resolving silently.
