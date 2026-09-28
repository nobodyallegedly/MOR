# mor-core

The MOR core library, in Rust. Part 1, roadmap step 2; part 2, roadmap step 3.

## In plain words

Every act in MOR is built from a few small pieces. This library makes those pieces, and checks them strictly, so that two programs given the same act always reach the same answer:

- **One way to write data (deterministic CBOR).** Any value has exactly one correct byte form. The library writes that form, and refuses any other, even if it means the same thing.
- **Labelled fingerprints (tagged hashes).** Each kind of fingerprint carries its own label (`MOR/act`, `MOR/inside`, and so on), so one kind can never be passed off as another.
- **The act.** A small outside that relays can read, and a locked inside. The library locks an inside, builds the outside that vouches for it, computes the act's id, and opens an act again, checking that what opens is exactly what was vouched for.
- **Canonical text.** The rules every piece of text in an act must meet, including the Unicode 17.0 normalization check the Text MIP pins.
- **Running summaries.** A short fingerprint of everything a person has signed so far in one line of acts, so it is cheap to prove that one act led to another.

Part 2 adds the signatures and the identity rules:

- **Signatures.** Everyday acts are signed with a Schnorr key (the kind Bitcoin uses). Rotations are signed with a post-quantum safety key (SLH-DSA), committed in advance by its hash, revealed and used once.
- **Which rotation counts.** Given the acts a verifier holds, the library decides, position by position, which act of an identity chain counts: from the homes' receipts under the owner's home rule, a self-hosted home's own word, or a homeless rotation (closure, auditors' absence statements, the reader's own failed attempt, or an escape with both keys). A home caught receipting two genuine rotations at one position counts for nothing there, and is proven dishonest only at that position, never backwards.
- **What a rotation keeps.** Every other act gets a standing: valid, pending, void, or disputed (voided, but someone else acknowledged it or a keeper recorded it). A rotation keeps the whole line behind each tip it names, which anyone can check from the running summary alone, even when the tip is private.

## Precisely

| Module | What | Where it is defined |
| --- | --- | --- |
| `cbor` | RFC 8949 §4.2.1 core deterministic encoding. The decoder rejects non-shortest arguments, indefinite lengths, unsorted or duplicate map keys, non-preferred floats (NaN included), invalid UTF-8, nesting deeper than 128 levels, malformed input and trailing bytes; a final round-trip check backs this up. | Identity, "Encoding"; Envelope rule 1a |
| `hash` | SHA-256; `tagged_hash(tag, x) = SHA-256(SHA-256(tag) ‖ SHA-256(tag) ‖ x)`; work hash, spec hash. | Identity, "Hashes"; Envelope, "Media"; Production |
| `act` | `Outside`, `Inside`, `Act` in the exact CDDL shape (an unknown key is invalid); act id `tagged_hash("MOR/act", outside)`; inside commitment `tagged_hash("MOR/inside", inside)`; `seal` and `open`; `Sequence`, which checks `prev`, position and running summary. | Envelope, "The act", "Sequences", validity rules 1–5 |
| `lock` | XChaCha20-Poly1305, 32-byte key, 24-byte nonce, no associated data; locked bytes are ciphertext ‖ 16-byte tag. | Envelope, "How it fits together" |
| `text` | Canonical text rules 1–6; rule 6 by full comparison with NFC under Unicode 17.0 tables (`unicode-normalization` pinned to `=0.1.25`, checked at compile time). `check_value` checks every text string in a decoded value, map keys included. | Text, "Canonical text", validity rules 1–2 |
| `mmr` | The running summary: a Merkle mountain range over act ids, leaves `MOR/mmr-leaf`, nodes `MOR/mmr-node`, peaks bagged right to left; empty summary 32 zero bytes. | Envelope, "Sequences" |
| `sig` | Scheme 1, Schnorr BIP-340 over the 32-byte act id (`k256`); schemes 2 and 3, SLH-DSA-SHA2-128s and 128f, pure FIPS 205 signing with context `MOR` (`fips205`, pinned `=0.4.1`); a scheme named by spec hash is unknown, never valid. Safety commitment `tagged_hash("MOR/safety", scheme ‖ key)`. Signing from caller-given seeds and randomness. | Identity, "Signature schemes" |
| `merkle` | A home's receipt log: RFC 9162 §2.1 tree over receipt act ids, inclusion and consistency proofs. | Identity, "Log summary" |
| `identity` | Every Identity payload (types 0, 1, 2, 9, 10, 12, 13, 14; 3 to 8 recognised), closed maps, encoding and decoding; genesis checks 1–5; rotation checks 1, 4, 5; home rules and the default of rule 5, homes counted per operator; the chain state a rotation leaves (keys, homes, rule, audit, declarations, succession). | Identity, "Act formats", "Verification procedures" |
| `chain` | `Verifier`: holds acts, inclusion proofs, the operators the reader failed to reach, and keeper records; resolves identity chains ("Which rotation counts", receipt checks 1–6, conflicts, dishonesty by position, audits, homeless procedure, escape, finality, operator loops on own signatures) and gives every act its status (everyday checks, validity rules 15–17, F88). | Identity, "Verification procedures", "Validity rules" |

The library never draws randomness itself. Content keys, nonces and salts are given by the caller, so test vectors can be reproduced; a client must draw them fresh for every object (Envelope rule 9).

It builds to WebAssembly (`cargo build -p mor-core --target wasm32-unknown-unknown`) for the TypeScript clients. The JavaScript bindings come with the first client that needs them (the genesis client, roadmap step 5), so their shape follows real use.

The Identity MIP's spec hash (`IDENTITY`) is fixed only at the freeze, so the `Verifier` takes it as a parameter; the tests use a fixed test value.

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
- `tests/signatures.rs`: Schnorr against BIP-340's own vectors 0 to 14. SLH-DSA, both variants, against a second, independent implementation (RustCrypto's `slh-dsa`, a dev-dependency): the same seeds give the same keys, the same act id gives byte-identical signatures, deterministic and hedged, and both reject every broken signature, key and context.
- `tests/chain.rs`: hand-made identity chains (36 tests) and the answers the Identity MIP requires: genesis checks; pending until receipted; majority, authoritative and default rules, per operator; self-hosting and its cost; routine rotation keeping years of posts behind a private tip; disowned and excluded acts void unless acknowledged or recorded; the thief at the lax home (5.7); forged receipts, stolen operator keys, audits and dishonesty by position (5.7b, 5.7d); closure, absence statements, objections, escape, finality and the censored reader (5.7c); operator loops; an unknown everyday scheme (8.4); succession and declarations. Every SLH-DSA signature that enters a verifier in these tests is also checked by the second implementation (`tests/common/mod.rs`), and the two must agree.

SLH-DSA is slow unoptimised, so the workspace builds the cryptography crates optimised even in tests (`Cargo.toml`, `[profile.dev.package.*]`); `tests/signatures.rs` still takes about a minute, mostly SHA2-128s signing.

## Readings the drafts left open, now decided

Building this exposed three places where the drafts did not fix the bytes, or where verifiers could disagree. Nobody, allegedly decided each, and each is written into Envelope draft 5.

1. **Bagging the running summary (F89).** Start from the rightmost peak, and hash each peak to its left as `node(peak, bagged so far)`, so left stays left. A single peak is its own root, with no extra hashing.
2. **No associated data in the lock (F90).** The outside already commits to both the locked bytes and the unlocked inside.
3. **Nesting depth (F91).** No data item is nested more than 128 levels below the outermost one, in an act or in an inside; deeper is invalid for every verifier. An application that needs deeper data carries it in a byte string or a media object.

Also noted for the freeze, with no change now: an act's payload is `{ * any => any }`, so floats, tags and simple values are allowed wherever a type does not restrict them. The library handles them exactly as RFC 8949 §4.2.1 says, but they are extra surface on which implementations can disagree (NaN payloads, what a tag means). Whether the frozen core should forbid them is for step 16.

## Part 2: decided while building (F92 to F95)

Building the identity checks as a function of the acts a verifier holds exposed one flaw and three open places. Nobody, allegedly decided each; each is written into Identity draft 9 (and core v15, freeze test suite v14, for F92 and F93).

1. **F92, finality.** A rotation that counts under the old home rule beats a homeless rotation at the same position, even once the next rotation has made it final. Otherwise a used safety key found on an old backup, after the home closed, rewrote every rotation since (run as a test).
2. **F93, absence.** Absence statements, and whether a reader's own failed attempt counts, are judged by the audit requirement in force before the homeless rotation, never the one it declares.
3. **F94, home rules.** A home rule a rotation leaves in place must fit the new homes, or the rotation is invalid.
4. **F95, receipt check 6.** A voided receipt someone acknowledged is shown as contesting its position, and blocks nothing.

## Part 2: readings, not yet decided

Where the drafts are silent and the answer seemed forced, the library takes the reading below. Each is listed for Nobody, allegedly to confirm or change; none changes a MIP text yet.

1. **"Names X in `objects`."** An objection, absence statement or escape endorsement names the homeless rotation as `[identity hash, rotation]`: the chain is the identity chain, whose root act is the genesis. A cosignature is accepted with any chain whose predecessor is the log summary; which chain it should name (the summaries' own chain, rooted at the home's first summary) is left open.
2. **Self-hosted "serves".** A self-hosted home's "rotation it serves" is the rotation the verifier holds at that position; two held there are a conflict (rule 22a, "Which rotation counts" step 2). A verifier cannot tell served from held.
3. **"Cosigned" for receipt check 5 and conflicts.** A receipt is under a cosigned summary when it meets check 4: an inclusion proof under a summary of its home with at least the threshold of cosignatures from the auditors of the audit requirement that judges it. An identity with no audit requirement has no declared auditors, so nothing protects its receipts from the operator's rotation (Identity, "Protected history").
4. **Proven dishonest.** A home is proven dishonest at a position when two of its receipts there, for different genuine rotations, are each either under a cosigned summary or kept through a rotation of the operator. A conflict whose receipts are both still under the operator's current key is a standing conflict, not yet proof.
5. **Operators, summaries and cosignatures are not judged by later rotations.** A log summary or cosignature counts if its key is bound by a counting act of its signer; a later rotation of that signer does not void it, since the receipts under a cosigned summary must survive the operator's rotation (receipt check 5).
6. **Closure ends the receipts too.** A receipt signed under the key a closing rotation set, or a later one, counts for nothing (rule 8c: closure ends the role "for good").
7. **The reader's own failed attempt is per operator.** `failed_to_reach` names an operator, as homes are counted per operator.
8. **Two homeless rotations that could both count at one position** leave the identity contested there.
9. **An acknowledgement counts** when the acknowledging act is validly signed by another identity under a key a counting act of its signer bound; the acknowledging act's own standing after its signer's rotations is not judged in turn.
10. **Status of identity-chain acts.** A genesis or rotation is `Valid` when it counts, `Pending` when it waits at the next position, and `Invalid` otherwise, including a genuine rotation that lost.
