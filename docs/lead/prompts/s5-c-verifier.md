Build a verifier for MOR in C, from the texts alone, in this repository (`nobodyallegedly/MOR-CBOX`).

**What you have, and all you have.** This repository holds a fixed snapshot of a protocol's core: eight texts in `spec/` (the MICS document, which is the map; six MIRs: Identity, Text, Envelopes, Money, Agreements, Development; and the freeze test suite) and published test vectors in `vectors/`, with `MANIFEST.sha256` fingerprinting every file. That is the whole of your material. There is no other implementation for you to read, no record of why the rules are as they are, and nobody to answer your questions.

**The insulation is the point.** The question this work answers is whether the texts alone are enough for a careful stranger to build a correct verifier. So:
- Do not look for MOR anywhere else: not on the web, not on GitHub, not in any other repository, not in any package registry. Attach no other repository. If you come across another implementation of MOR by accident, stop reading it and say so in your report.
- Never edit `spec/`, `vectors/` or `MANIFEST.sha256`. Check `sha256sum -c MANIFEST.sha256` at the start and at the end, and report the result.
- When the texts are unclear, silent, or seem to contradict each other or the vectors, do not wait for an answer: none will come. Choose the reading you judge the texts most support, write it down (below), and go on.

**What to build.** A library and a command-line tool in C that verify MOR acts as the texts define them: decode them strictly, check their signatures, and give the verdicts the texts give (valid, invalid, unknown, pending, contested, disputed, void, and the others the texts name), layer by layer, as far as you can take it. Then run it against every vector in `vectors/` and record, for each, whether your verifier agrees.

**Freedom.** You have freedom to build until the end: no check-ins, your own choice of structure, order and tools. Stop only when every vector is answered by your verifier, or when you can go no further, and say which.

**The floor, not negotiable:**
- C (C11 or C17), compiled with warnings as errors (at least `-Wall -Wextra -Werror` and the strictest your compiler offers that the code can meet).
- Tests and the vector run under AddressSanitizer and UndefinedBehaviorSanitizer, clean.
- Fuzzing of every decoder that reads untrusted bytes (libFuzzer or AFL++), run long enough to mean something, with the corpus and any crash kept.
- One plain memory discipline, stated at the top of your report and kept throughout (for instance: caller-owned buffers and arenas, no hidden allocation).
- Established libraries for cryptographic primitives and Unicode tables are allowed (pin each by version and say why you chose it): hashing, XChaCha20-Poly1305, BIP-340 Schnorr over secp256k1, SLH-DSA (FIPS 205), ML-KEM-768 and X25519 for X-Wing, bech32m, Unicode normalization at the version the texts pin. Everything that is MOR's own (encodings, acts, chains, sequences, verdicts) you write yourself from the texts.

**What to write down, as you go:**
- `QUESTIONS.md`: every question the texts left you, each with: the text and rule (or section) it comes from; the question in plain words; the readings you considered; the one you chose and why; and which vectors, if any, your choice decided. Number them. This file matters as much as the code.
- `RESULTS.md`: every vector, by file and case name, with your verifier's answer and whether it matches the published one; for each mismatch, what you think caused it (your code, your reading, the text, or the vector), without changing the vector.
- `PROGRESS.md`: where you are, kept current, so that if this session stops, another started with this same prompt can continue from it.
- `REPORT.md`, at the end: in plain words first (what the verifier does, how far it got, how many vectors agree, what the texts made hard), then precisely: the memory discipline, the libraries and versions, the sanitizer and fuzzing runs (how long, what they found), and the layers or rules not implemented and why.

**Work** on a branch `claude/c-verifier`, committing as you go; open a pull request when you stop; do not merge. No keys or secrets of any kind beyond the labelled test data already in `vectors/`.
