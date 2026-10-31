# mor-carry

The identity carry Module (`../module-identity-carry-words-draft-2.md`; draft 1 kept) in TypeScript: an identity's signing seed written as 24 words (BIP-39's English list and checksum, the words seed Module's encoding), read back, and refused when a word or the checksum is wrong; and, from draft 2, the encryption key the words carry (`encryptionSecret`), checked against the Rust code's vectors. Used by Dub (`clients/dub/`, called MOR Post until 13 October 2026), on the Mac and in its web client. **Experimental; test identities only.** The chain key never travels.

| File | What |
| --- | --- |
| `src/carry.ts` | `toWords`, `fromWords` (refusals say which word, or that the checksum fails), `readId` and `groupId` for an ID typed by hand, `threePositions` and `typedBack` for the three words typed back. |
| `src/english.ts` | BIP-39's English word list, copied from the `bip39` crate the air-gapped signer uses; the tests check its SHA-256 against BIP-39's published list. |

The Rust code is `../airgap/src/carry.rs` (feature `carry`, on by default and off for the core library's WebAssembly), beside the seed Modules; `cargo run -p mor-airgap --example carry_vectors` writes `../airgap/vectors/carry.json`.

```
npm install
npm test     # needs the core library's WebAssembly (clients/genesis: npm run wasm), for the public keys
```

The tests: the Rust vectors give the same words, the same seed back and the same public signing key (through the core library); BIP-39's own words for 32 zero bytes; 200 random round trips whatever the case and spacing; a changed word refused by the checksum (an 8-bit checksum misses one in 256, so the test counts), a word off the list, a wrong count; three words typed back; an ID as typed.

## The signing key as a string (round 9, F411)

**In plain words.** The signing key can also be written as one string starting with `morsk1` instead of 24 words: the same key, a check built in so a copying mistake is caught. Apps take either, and show the other on request. The chain key stays words only.

**Precisely.** `module-signing-key-string-draft-1.md`. `src/string.ts`: `toKeyString(seed)` (Bech32m, BIP-350, prefix `morsk`), `fromKeyString(typed)` (refusing a wrong prefix, a character outside the alphabet, a wrong length, a failed checksum, mixed case, saying which), `groupKeyString`, `bothForms`, `fromCarried(typed)` (24 words or the string, to the same seed; never for a chain key). `src/key-html.ts`, with no import, for the pages: `keyStringHtml(key)`, the string folded under "Show the same key as a string", with `KEY_STRING_SAY`. Tests `test/string.test.ts` (BIP-350's vectors among them).
