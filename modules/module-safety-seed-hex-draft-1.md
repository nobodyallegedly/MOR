# Seed Module: Hex

*Draft 1, 28 September 2026. A founding seed Module for the air-gapped safety key Module (draft 4, rule 3.8), written with the words seed Module so that V1 runs two seed Modules side by side (decided by Nobody, allegedly). Implemented in `modules/airgap/` (`seed.rs`); test vectors in `modules/airgap/vectors/seeds.json`.*

*Reading this document: normal text is the Module itself. Italic text is commentary.*

## Purpose

A safety seed is the one secret from which a signing device derives every safety key of an identity. This Module says how the seed is written down, as characters any device can print and any person can copy, with no word list, and how keys come from it.

## The seed

A seed is 256 bits.

## The backup

The backup is 72 hexadecimal characters: the seed's 64, followed by 8 characters of checksum, the first 4 bytes of `tagged_hash("MOR/module/seed-hex/check", seed)`. It is written in groups of four characters, separated by spaces.

- Letter case and spacing do not matter when restoring; anything else does.
- A backup of the wrong length, with a character that is not hexadecimal, or whose checksum fails, is refused.

*Harder to copy by hand without a slip than words, and the checksum is what catches the slip. It needs nothing but the sixteen characters, which is its reason to exist.*

## Deriving safety keys

As in the words seed Module, with its own tag: the three FIPS 205 key-generation seeds of the key with index `i` under scheme `s` are the first 48 bytes of

```
tagged_hash("MOR/module/seed-hex/key", seed || s || i || 0x00)
|| tagged_hash("MOR/module/seed-hex/key", seed || s || i || 0x01)
```

in the order `sk_seed`, `sk_prf`, `pk_seed`, with `s` one byte and `i` 8 bytes, big-endian.

*Its own tag, so the same 256 bits give unrelated keys under the two Modules: a backup restores only under the Module it was made with, and says which.*

## Restoring

As in the words seed Module: the device finds its key by matching commitments in the chain.

## Tests

- Backups restore to the same seed, whatever the case and spacing; a changed character fails the checksum; a short backup is refused. *Run.*
- The published vectors, as for the words Module. *Run, in the library, in a second, independent SLH-DSA implementation, and in an independent Python check.*
