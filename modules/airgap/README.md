# mor-airgap

The air-gapped safety key Module (`modules/module-airgap-safety-signer-draft-4.md`) and its two seed Modules (`modules/module-safety-seed-words-draft-1.md`, `modules/module-safety-seed-hex-draft-1.md`), in Rust. Roadmap step 6.

**A prototype, for test identities.** The real identity is created with it only at step 17, after review.

## In plain words

Every MOR identity has two keys. The everyday key lives on your phone and signs your posts. The safety key lives on a second device that never goes online, and is used only to replace the everyday key (a rotation) if it is lost or stolen. This is the software for that second device, and for the phone's side of the conversation with it.

- **The device checks, then signs.** Your phone prepares a rotation and hands it over, by USB stick or as a stream of QR codes on screen. The offline device never believes the phone: it reads what it is about to sign, builds its own summary, and puts the dangerous parts (new homes, a new vault, a successor, closing a home, giving up old acts) at the top, in capitals. It signs only if you type SIGN.
- **It chooses its own next key.** The next safety key is committed by the offline device, never by the phone. A phone that tries to slip one in is ignored, and you are told.
- **It remembers.** It signs one rotation per safety key. Asked again for the same one, it gives the same answer; asked for a different one, it refuses, except in the two cases the Identity MIP allows once each, which you must confirm.
- **Your backup.** The safety seed is written on paper, either as 24 words or as 72 characters: two competing seed Modules, both supported, so V1 shows several Modules living side by side. A device restored from paper finds its place in your chain by itself.
- **Collectives.** A collective's safety key can be split among its members, any three of four, say. The device rebuilds it from shares, signs, and deals the next key as new shares that every member can check alone. What no check can do is prove a device forgot a key it held: that is said plainly (finding F96).
- **A clean start.** If you fear your phone is compromised, the offline device can make your new everyday key itself, for a clean phone.

## Precisely

| Module | What | Where it is defined |
| --- | --- | --- |
| `seed` | The two seed Modules: 256-bit seeds written as 24 BIP-39 words (encoding only, not BIP-39's wallet derivation) or 72 hex characters with a tagged-hash checksum; safety keys derived as FIPS 205 key-generation seeds from `tagged_hash(module tag, seed ‖ scheme ‖ index ‖ 0/1)`. Seeds are overwritten when dropped. | Seed Modules, draft 1 |
| `msg` | The four messages (commitment export, pending rotation, signed rotation, share), strict: deterministic CBOR, closed maps, canonical text, 256 KiB at most, one kind at a time. | Module 2, 3.6 |
| `device` | The signer. `review` checks the previous act (3.2), refuses anything but a rotation of the Identity MIP with spec, type and payload only (3.5), finds its key by commitment, applies the memory (3.4), inserts its own next commitment (3.3), optionally generates the signing key (section 4), builds the whole act, and summarises the exact bytes (3.1). `sign` signs (hedged SLH-DSA) and records. `review_collective` does the same from shares and deals the next key. State as CBOR. | Module 2 to 5 |
| `summary` | The summary, prominent lines first; the key fingerprint (first 16 bytes of a tagged hash, 8 groups of 4). | Module 3.1 |
| `shares` | Shamir over the secp256k1 order with Pedersen commitments; share check; rebuild; the rebuild check against the dealing's SLH-DSA commitment. | Module 5; Law 36 (F96) |
| `online` | The phone's side: a genesis from a commitment export; a pending rotation; the check of a signed rotation before publishing (3.9). | Module 2, 3.9 |
| `transport` | Animated QR codes as multi-part Uniform Resources (`ur` crate, pinned), upper case, level M, 120-byte fragments (QR version ≤ 11); files, bytes only. | Module 6 |

`mor-signer` is the command-line signer for a laptop that never connects (`cargo run -p mor-airgap --bin mor-signer -- help`). The library builds to WebAssembly without it (`cargo build -p mor-airgap --lib --no-default-features --target wasm32-unknown-unknown`), for the genesis client.

The Identity and Finance MIPs' spec hashes are fixed at the freeze; until then the device takes them as a `Config` and the tests and `mor-signer` use test values. The seed Modules' spec hashes are test values until they are published.

## Tests

```
cargo test -p mor-airgap                          # 40 tests
python3 modules/airgap/vectors/check.py           # an independent check of the seed vectors
cargo run -p mor-airgap --example seed_vectors    # regenerates vectors/seeds.json (identical output)
```

- `tests/functional.rs`: the Module's functional tests, both seed Modules, and the published seed vectors against a second SLH-DSA implementation (RustCrypto's `slh-dsa`).
- `tests/attacks.rs`: the Module's attack tests and every device rule.
- `tests/collective.rs`: split safety keys, the dishonest dealer, a rotation through an escrowed share.
- `tests/cli.rs`: `mor-signer` driven as a user would.

As in the core's tests, every SLH-DSA signature a device makes in these tests is checked by the second implementation, and the two agree.

QR frames are drawn as images and read back by an independent decoder (`rqrr`), including with dropped frames and simulated poor light.

### Run and not run

| Module test (section 7) | |
| --- | --- |
| Commitment export and rotation round trip, by file and by QR; both variants | Run |
| Dropped frames | Run |
| Poor light, older cameras | Simulated (low contrast, uneven light, small frames); **not run on a real camera** |
| Retried rotation re-exported identically | Run |
| Clean-device mode | Run |
| Collective rotation from k shares, next shares verifiably dealt | Run |
| All eight attack tests | Run; "a device keeps a copy" is not testable (F96) |

Not in this step: a phone app with a camera (with the genesis client, step 5, per Nobody, allegedly, 28 September 2026); how the key grammar names holders (Law formats, step 5a): the share message's holder is a role and an identity hash for now.

## Decided while building

1. **The offline device's platform (Nobody, allegedly):** the rules in one Rust library, a command-line signer for an offline laptop now; the phone app with the genesis client.
2. **Seeds (Nobody, allegedly):** two seed Modules, words and hex, both defined and both supported, to test several Modules side by side.
3. **F96 (Nobody, allegedly):** verifiable dealing stops sole control of a collective's key, not a copy; Pedersen dealing plus one rebuild check on a second device. Law draft 5, Module draft 4.

## Readings, for confirmation

Where the Module was silent, the library takes the reading below; each is written into draft 4 and waits for confirmation.

1. **Key index** is the key's number in the identity's life: key n signs the rotation at position n + 1. The online device always knows it, even across a fresh seed.
2. **The pending inside** carries spec, type and payload only, without salt and next commitment. The device refuses any other inside field, since it could not show it.
3. **"The same rotation" (3.4)** is the request: the inside as sent, without salt and next commitment, plus the previous act's id. The same homeless rotation asked again as an escape is the same request, re-exported: the endorsement is a separate act.
4. **The exceptions** are recognised from the last rotation the key signed: homeless then normal (after a voided homeless rotation), or normal then homeless with an escape announced. Each once, confirmed on the device, naming the earlier rotation.
5. **Clean-device mode** is chosen on the offline device, not requested by the phone, and the device does not keep the key: a re-export does not carry it.
6. **Fingerprint:** first 16 bytes of `tagged_hash("MOR/module/airgap/fingerprint", scheme ‖ key)`, 8 groups of 4 hex characters.
7. **The vault** is read with the Finance MIP's spec hash; a unit removed is named when the previous act declared the vault, otherwise the device says every unlisted unit is undeliverable (fail closed).
8. **The online device checks what comes back** (3.9) before publishing: that is what catches a swapped file.
9. **Transport:** the UR types `mor-commitment-export`, `mor-pending-rotation`, `mor-signed-rotation`, `mor-share`; 120-byte fragments; files at most 256 KiB.
10. **Memory after a restore** starts empty: rule 3.4 holds per device (cost stated in 3.4).
11. **Holders of shares** are named by role (member, custodian, escrow) and identity hash until Law's key-grammar formats exist (step 5a).

## New dependencies

- `ur` 0.5.2 (pinned): Uniform Resources and fountain codes, one maintainer, no dependencies of its own. The Module named the standard; this is its Rust implementation.
- `bip39` 2.2 (rust-bitcoin): the English word list and checksum only.
- `qrcode` 0.14: drawing QR codes. `k256` with `arithmetic`: the Pedersen commitments.
- Tests only: `rqrr` (reading QR codes back), `slh-dsa` (the second SLH-DSA implementation, as in the core), `serde_json`.
