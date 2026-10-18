# Test vectors: core library, part 1

Published test vectors for the pieces every act is made of. Any implementation of MOR should reproduce every value here. They are drafts until the freeze: the spec hashes they use are stand-ins, since the MIR hashes are fixed only then.

Made by `cargo run -p mor-core --example gen_vectors`, checked by the Rust library (`core/tests/vectors.rs`) and by an independent Python implementation (`check.py`). All byte strings are lowercase hex.

| File | What it pins | Defined in |
| --- | --- | --- |
| `tagged-hash.json` | `tagged_hash(tag, x)` for each tag the core uses. | Identity, "Hashes" |
| `cbor.json` | Encodings that must be accepted (and re-encode to the same bytes), and encodings that must be rejected, one reason each. | Identity, "Encoding" (RFC 8949 §4.2.1); Envelopes rule 1a |
| `canonical-text.json` | Strings as code points, whether each is canonical text, and the first rule it breaks. Includes a string using two marks new in Unicode 17.0 that only a verifier with the pinned tables rejects. | Text, "Canonical text" |
| `lock.json` | XChaCha20-Poly1305 with no associated data, and the locked hash. | Envelopes, "How it fits together" |
| `running-summary.json` | The running summary over 0 to 11 stand-in act ids. | Envelopes, "Sequences" |
| `sequence-three-acts.json` | **The three-act vector (F78).** Three public text acts in one sequence: each inside, its commitment, the locked bytes, the outside, the act id, and the running summary each act carries; then the summary including the third act. | Envelopes, "Sequences"; Text, "Act format" |
| `open-act.json` | Sealed acts, and the first check that fails when each is opened, or `ok`. | Envelopes, validity rules 1–5 |
| `textual-forms.json` | The textual forms (F349): each label's short form (`mid`, `mact`, `mkey`, `mspec`, `mwork`) and its data; one in capitals; the where-it-lives form with its hints; bare hex; and strings refused, each with why: a character mistyped, the string cut, an `mact` where an `mid` is wanted, mixed case, a label the core does not define. Checked by the Rust library (`core/tests/textual.rs`, also against the `bech32` crate) and by `check.py`. | Identity draft 14, "Written for people" |
| `sealed.json` | A sealed container in Envelopes draft 10's format (F293), `[to, locked-act]`, with no one-time key and no signature: every input fixed (the recipient's X-Wing secret, the inner act, the container key, the nonce, the eseed), the container's bytes, and what the recipient opens. Checked by the Rust library only: `check.py` has no X-Wing. | Envelopes, "Sealed container" |

No signatures appear: they are part 2 (roadmap step 3). The act id does not depend on the signature, so every id here is final for its outside.

The readings these vectors depend on are decided and written into Envelopes draft 5: how the running summary's peaks are bagged (F89), that the lock uses no associated data (F90), and the 128-level nesting limit (F91, in `cbor.json`).
