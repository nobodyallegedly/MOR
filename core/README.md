# mor-core

The MOR core library, in Rust. Part 1, roadmap step 2.

## In plain words

Every act in MOR is built from a few small pieces. This library makes those pieces, and checks them strictly, so that two programs given the same act always reach the same answer:

- **One way to write data (deterministic CBOR).** Any value has exactly one correct byte form. The library writes that form, and refuses any other, even if it means the same thing.
- **Labelled fingerprints (tagged hashes).** Each kind of fingerprint carries its own label (`MOR/act`, `MOR/inside`, and so on), so one kind can never be passed off as another.
- **The act.** A small outside that relays can read, and a locked inside. The library locks an inside, builds the outside that vouches for it, computes the act's id, and opens an act again, checking that what opens is exactly what was vouched for.
- **Canonical text.** The rules every piece of text in an act must meet, including the Unicode 17.0 normalization check the Text MIP pins.
- **Running summaries.** A short fingerprint of everything a person has signed so far in one line of acts, so it is cheap to prove that one act led to another.

Signatures and the identity rules come next, in part 2 (roadmap step 3).

## Precisely

| Module | What | Where it is defined |
| --- | --- | --- |
| `cbor` | RFC 8949 §4.2.1 core deterministic encoding. The decoder rejects non-shortest arguments, indefinite lengths, unsorted or duplicate map keys, non-preferred floats (NaN included), invalid UTF-8, malformed input and trailing bytes; a final round-trip check backs this up. | Identity, "Encoding" |
| `hash` | SHA-256; `tagged_hash(tag, x) = SHA-256(SHA-256(tag) ‖ SHA-256(tag) ‖ x)`; work hash, spec hash. | Identity, "Hashes"; Envelope, "Media"; Production |
| `act` | `Outside`, `Inside`, `Act` in the exact CDDL shape (an unknown key is invalid); act id `tagged_hash("MOR/act", outside)`; inside commitment `tagged_hash("MOR/inside", inside)`; `seal` and `open`; `Sequence`, which checks `prev`, position and running summary. | Envelope, "The act", "Sequences", validity rules 1–5 |
| `lock` | XChaCha20-Poly1305, 32-byte key, 24-byte nonce, no associated data; locked bytes are ciphertext ‖ 16-byte tag. | Envelope, "How it fits together" |
| `text` | Canonical text rules 1–6; rule 6 by full comparison with NFC under Unicode 17.0 tables (`unicode-normalization` pinned to `=0.1.25`, checked at compile time). `check_value` checks every text string in a decoded value, map keys included. | Text, "Canonical text", validity rules 1–2 |
| `mmr` | The running summary: a Merkle mountain range over act ids, leaves `MOR/mmr-leaf`, nodes `MOR/mmr-node`, peaks bagged right to left; empty summary 32 zero bytes. | Envelope, "Sequences" |

The library never draws randomness itself. Content keys, nonces and salts are given by the caller, so test vectors can be reproduced; a client must draw them fresh for every object (Envelope rule 9).

It builds to WebAssembly (`cargo build -p mor-core --target wasm32-unknown-unknown`) for the TypeScript clients. The bindings come with part 2.

## Tests and published vectors

```
cargo test                                         # everything below
cargo run -p mor-core --example gen_vectors        # regenerate vectors/ (the output is identical)
python3 core/vectors/check.py                      # a second, independent implementation
```

- `vectors/`: the published test vectors, including the three-act running summary (F78). See `vectors/README.md`.
- `tests/vectors.rs`: the library against every value in the published vectors.
- `vectors/check.py`: an independent implementation in Python, written from the MIP texts and sharing no code with this library, checks the same vectors (freeze test suite, scenario 8.5: two clients compute the same running summary). It needs `cryptography` and `unicodedata2==17.0.0`.
- `tests/unicode.rs`: rule 6 against Unicode's own conformance file for the pinned version, `tests/data/NormalizationTest-17.0.0.txt` (© Unicode, Inc., distributed under the Unicode License v3), and every code point not listed in it.
- `tests/act.rs`: act shape, opening, private acts, and every way an act can break its place in a sequence.

## Readings the drafts left open

Building this exposed three places where the drafts do not fix the bytes. Each changes every vector it touches if decided otherwise.

**Decided**

1. **Bagging the running summary (Envelope, "Sequences"; F89, approved by Nobody, allegedly).** "The peaks are bagged right to left, each pair hashed as a node" did not say which side each goes on. Start from the rightmost peak, and hash each peak to its left as `node(peak, bagged so far)`, so left stays left. A single peak is its own root, with no extra hashing. To be written into the next Envelope draft.

**Awaiting the author's approval**

2. **No associated data in the lock (Envelope, "How it fits together").** XChaCha20-Poly1305 can bind extra data to a lock; the draft does not say. Taken: none. The outside already commits to both the locked bytes and the unlocked inside.
3. **Nesting depth.** The decoder stops at 128 levels of nesting to protect itself against hostile input, and reports this as a limit of its own, not as an invalid act. The core sets no bound, and leaves length limits to homes; no act in the MIPs comes near this depth.

Also noted for the freeze, with no change now: an act's payload is `{ * any => any }`, so floats, tags and simple values are allowed wherever a type does not restrict them. The library handles them exactly as RFC 8949 §4.2.1 says, but they are extra surface on which implementations can disagree (NaN payloads, what a tag means). Whether the frozen core should forbid them is for step 16.
