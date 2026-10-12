# Module: Identity carry, by words

*Draft 1, 12 October 2026 (roadmap step 9b). **Founding Module, EXPERIMENTAL. Not approved, not a product; test identities only until MOR is frozen.** Decided by Nobody, allegedly, the same morning (area: development layer): an app may accept an identity made elsewhere, carried by a Module, "Yes, it's a module it does not have to be perfect." Its hash stays a draft hash until its creator is named at step 17; until then it is named by a test value. Written against core v21, the Identity MIP draft 11 (rules 12, 17 and 37; sequences), the words seed Module draft 1 (`module-chain-key-seed-words-draft-1.md`), whose encoding it borrows, and findings F1 to F266. An Identity Module (key storage and backup, core "Outside the core"): not core, competing with any other. Implemented in `modules/airgap/src/carry.rs` (Rust, beside the seed Modules) and `modules/carry/` (TypeScript, used by MOR Post, `clients/poster/`); test vectors in `modules/airgap/vectors/carry.json`.*

*Reading this document: normal text is the Module itself. Italic text is commentary.*

## In plain words

*An identity in MOR has two keys. The signing key signs everyday acts: posts, pictures, withdrawals. The chain key is kept back, on a device that never goes online, and is used only to change the signing key (a rotation). This Module carries the first to another app, and never the second.*

*What a person writes down is two things: the identity's ID, and 24 words that hold its current signing key. Typed into another app, they let that app sign as the identity. That is all they do, and it is a lot: **whoever holds these words can post as you**, until the signing key is changed with the chain key. Keep them like a house key.*

*Each app then keeps its own line of acts. Lines are allowed by the core: one identity may keep several, on several devices. But a key change names the lines it keeps, and a line it does not name is voided from that change on. So before the signing key is ever changed, the device holding the chain key must be told where every app's line has got to.*

## 1. What is carried

1.1. Two things, and nothing else: the identity's **ID** (its genesis act's id, 32 bytes), and its **signing seed**.

1.2. The signing seed is the 32-byte secret key of the identity's current signing key, under Identity's founding signing scheme 1 (BIP-340 Schnorr). A signing key of another scheme is not carried by this Module. *Identity names no signing seed format (core, "Outside the core"). This Module takes the secret key itself as the seed, so an identity made by any client that holds its signing key as a 32-byte Schnorr secret, such as the genesis client, can be carried without being remade.*

1.3. **The chain key never travels.** It is not written, carried, derived or checked by this Module. It stays on the device that holds it (for a real identity, the air-gapped chain key Module's signer). An app MUST NOT ask for a chain-key backup in the place of these words.

## 2. How it is written

2.1. **The ID** is written as 64 hexadecimal characters, which a reader MAY show in groups of four. Spaces and letter case do not matter when it is typed. *The ID needs no checksum: an app reads the identity's genesis by its ID, and a genesis is found only under its own hash.*

2.2. **The signing seed** is written as 24 words in the words seed Module's encoding: BIP-39's English word list; the first 8 bits of SHA-256 of the seed are appended, and the 264 bits are read as 24 numbers of 11 bits, each naming a word of the list.

2.3. Letter case and spacing do not matter when the words are typed; anything else does. Words whose checksum fails, a word not on the list, or a count other than 24 are refused, saying which. Words that decode to 256 bits which are not a Schnorr secret key (zero, or not below the curve's order) are refused.

2.4. Only BIP-39's encoding is used, never its wallet derivation. *These words are not a Bitcoin wallet, and not a chain-key backup. A wallet given them would make an empty wallet; a chain-key signer given them would derive keys whose commitments match nothing, and say so. Say both to users.*

## 3. Making the words

3.1. An app that shows the words SHOULD show them once, with a plain instruction to write them down, in order, on paper, and SHOULD ask for at least three of them, at positions it chooses at random, to be typed back before it goes on.

3.2. It MUST say plainly, where the words are shown: **whoever holds these words can sign as this identity**; the chain key is not in them; and they stop working when the signing key is changed.

## 4. Taking an identity in

4.1. An app given an ID and words reads the identity as any reader would (Identity, "Reaching an identity"): its genesis by its ID from an address given, then its chain and receipts from every home the chain names, and lets the core library decide which rotation counts.

4.2. It MUST refuse the words unless the public key they give is the **current signing key**: the key bound by the latest chain act that counts. Words for an earlier key, for another identity, or decoding to nothing are refused, and nothing is kept. It MUST refuse while the identity is contested or a rotation is waiting for its homes.

4.3. **It starts its own line.** Its first everyday act names no previous act (Identity, "Sequence"; F24), bound to the current signing key. It never continues another app's line: two apps signing in one line would fork it.

4.4. *Readings a client may take, stated:* it SHOULD NOT publish a new version of the identity's routes, names or encryption key, which are versioned and may only have one line of versions (a second writer forks them); it uses the addresses the identity's routes already name, and asks for relays only where they name none.

4.5. Before each act it signs, the app SHOULD look the identity up again, and MUST NOT sign once a rotation counts that bound another key: the words it holds are then spent. *An act signed with a key a rotation replaced is outside the kept ancestry (Identity rule 17).*

## 5. Each app keeps its own line, and rotations

5.1. **Rule 17's warning.** A rotation keeps only the lines it names (their latest acts, positions and running summaries). Every act of a line it does not name is void from that rotation on, unless another identity acknowledged it. So:

- An app holding carried words MUST show its line's latest act, position and running summary on request, so the owner can take them to the device that rotates.
- The device holding the chain key SHOULD find every line before a rotation (Identity rule 17: clients SHOULD track every sequence the owner has started, on any device, and warn before a rotation that omits one), and MUST say plainly, before signing a rotation, that a line it does not name is voided.
- An app SHOULD say, where it takes an identity in, that its posts survive a key change only if that change keeps its line.

5.2. *Seen from the device that holds the chain key, the acts of another app look exactly like acts signed by a thief who stole the signing key (F152: "acts its homes hold signed by this identity that this file did not make"). That is true, and it is the point: the words are the signing key. The owner who carried them knows which is which; nobody else can tell.*

5.3. After a rotation, the carried words are spent. To keep posting from the other app, the owner carries the new signing seed's words, and the app starts a new line under the new binding.

## Costs, stated

- **The words are the signing key, in the clear, on paper and in each app that took them.** Every app that holds them is another place it can be stolen from. A theft is ended only by a rotation, with the chain key; until then, whatever the thief signs counts as the owner's (Identity, "Status of an act after a rotation"). *Rule 37 asks clients to keep the two keys apart and to back up both seeds; this Module serves the first part by never carrying the chain key, and makes the second part a sheet of paper.*
- **One sheet, two meanings.** The signing words and a chain-key backup under the words seed Module look alike. A person who types a chain-key backup into an online app has put the chain key online. An app cannot tell a chain-key backup from wrong words without deriving chain keys, which this Module does not ask of it: it refuses them as words that do not give the current signing key, and SHOULD say "if these are your chain key's words, they must never be typed into an online device".
- **Lines are easy to forget.** A rotation from a device that does not know another app's line voids that app's posts. The warning of 5.1 is the only guard.

## Tests

- Words round-trip, whatever the case and spacing; a wrong word, a word off the list, a wrong count or a wrong checksum is refused. *Run, in Rust and in TypeScript, on the same vectors; the all-ones seed is refused as not a key, and its words are BIP-39's own.*
- An identity made by the genesis client is taken in by its ID and words, its current signing key checked; a wrong set (another identity's words) refused. *Run, `clients/poster/test/poster.test.ts`.*
- Two apps posting as one identity keep separate lines, both valid. *Run, same file.*
