# Seed Module: Words

*Draft 1, 28 September 2026. A founding seed Module for the air-gapped safety key Module (draft 4, rule 3.8), written with the hex seed Module so that V1 runs two seed Modules side by side (decided by Nobody, allegedly). Implemented in `modules/airgap/` (`seed.rs`); test vectors in `modules/airgap/vectors/seeds.json`.*

*Reading this document: normal text is the Module itself. Italic text is commentary.*

## Purpose

A safety seed is the one secret from which a signing device derives every safety key of an identity. This Module says how the seed is written down, so a person can back it up on paper, and how keys come from it, so that any device implementing this Module restores the same keys from the same backup.

## The seed

A seed is 256 bits.

## The backup

The backup is 24 words from BIP-39's English word list (Bitcoin Improvement Proposal 39), encoding the seed with BIP-39's checksum: the first 8 bits of SHA-256 of the seed are appended, and the 264 bits are read as 24 numbers of 11 bits, each naming a word of the list.

- Letter case and spacing do not matter when restoring; anything else does.
- A backup whose checksum fails is refused: a word was written or read wrong.
- Only BIP-39's encoding is used, never its wallet derivation (PBKDF2, passphrases). *These words are not a Bitcoin wallet. A wallet given them would make one, holding nothing; a MOR device would not know that wallet. Say so to users, so nobody enters their safety seed into a wallet.*

## Deriving safety keys

The safety key with key index `i` (the air-gapped Module, section 2) under SLH-DSA scheme `s` (2 or 3) is the FIPS 205 key pair generated from the three 16-byte seeds `sk_seed`, `sk_prf` and `pk_seed`, which are the first 48 bytes of

```
tagged_hash("MOR/module/seed-words/key", seed || s || i || 0x00)
|| tagged_hash("MOR/module/seed-words/key", seed || s || i || 0x01)
```

in that order, with `s` one byte and `i` 8 bytes, big-endian. `tagged_hash` is the Identity MIP's.

*The scheme is in the hash, so the same index under the two variants gives unrelated keys. A scheme named by specification hash is not derived by this Module; a later seed Module may.*

## Restoring

A device restored from the words holds the seed and nothing else. To find which key to use, it derives keys from the seed and compares their commitments with the commitment in the previous identity-chain act (the air-gapped Module, rule 3.8). *The memory of what the lost device signed is not in the backup: see the air-gapped Module, rule 3.4, cost stated.*

## Why two seed Modules

*The core names no seed format: key storage and backup are Identity Modules (core, "Outside the core"). V1 ships two, words and hex, so that a device is built to recognise a Module by its specification hash, to say which one a backup follows, and to refuse one it does not implement, from the first release.*

## Tests

- Backups restore to the same seed, whatever the case and spacing; a wrong word fails the checksum. *Run.*
- The published vectors: seeds, backups, key-generation seeds, public keys and commitments. *Run, in the library, in a second, independent SLH-DSA implementation (key pairs), and in an independent Python check (derivation and commitments); the all-zero seed gives BIP-39's own published words.*
- The same 256 bits under this Module and the hex Module give unrelated keys. *Run.*
