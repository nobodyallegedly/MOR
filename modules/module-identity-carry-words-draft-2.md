# Module: Identity carry, by words

*Draft 2, 16 October 2026 (F332 and its amendment). Draft 1 (`module-identity-carry-words-draft-1.md`, kept beside it) with the identity's **encryption key carried too**, so an identity brought into an app can open its own private messages: the author's answer, "Ideally import it. All this business of moving keys won't work like this long term but for now…"; the mechanics left to the session (F332, "Mechanics to the session (development layer)"), and taken by it under the working practice on development-layer mechanics, each marked **(mechanic, this draft's)**. Also from F332's amendment: the carry words are labelled as the signing key's words, and an app whose key a rotation replaced takes the new words (4.6). Changes are marked **new in draft 2**. **Founding Module, EXPERIMENTAL. Not approved, not a product; test identities only until MOR is frozen.** Written against the MICS v28, the Identity MIR draft 13, the Envelopes MIR draft 10 (encryption key, type 4; X-Wing) and the findings to F332. Implemented in `modules/airgap/src/carry.rs` (Rust) and `modules/carry/` (TypeScript, used by Dub, `clients/dub/`); test vectors in `modules/airgap/vectors/carry.json`, with the encryption key added. Its hash stays a draft hash until its creator is named at step 17.*

*Reading this document: normal text is the Module itself. Italic text is commentary.*

## In plain words

*An identity in MOR has three keys. The signing key signs everyday acts. The encryption key opens what others seal for it: its private messages. The chain key is kept back, on paper or on a device that never goes online, and is used only to change the signing key (a rotation).*

*This Module carries the first two to another app, written as 24 words, and never the third. **Whoever holds these words can post as you and read your private messages**, until the keys are changed with the chain key. Keep them like a house key and a letterbox key on one ring.*

*New in draft 2: the encryption key is not written separately. It is made from the signing key, so the same 24 words carry both, and when a rotation changes the signing key, the encryption key changes with it.*

## 1. What is carried

1.1. The identity's **ID** (its genesis act's id, 32 bytes), and its **signing seed**. *New in draft 2:* the signing seed also gives the identity's **encryption key** (section 2a). Nothing else.

1.2. The signing seed is the 32-byte secret key of the identity's current signing key, under Identity's founding signing scheme 1 (BIP-340 Schnorr). A signing key of another scheme is not carried by this Module.

1.3. **The chain key never travels.** It is not written, carried, derived or checked by this Module. An app MUST NOT ask for a chain-key backup in the place of these words.

## 2. How it is written

2.1. **The ID** is written as 64 hexadecimal characters, which a reader MAY show in groups of four. Spaces and letter case do not matter when it is typed.

2.2. **The signing seed** is written as 24 words in the words seed Module's encoding: BIP-39's English word list; the first 8 bits of SHA-256 of the seed are appended, and the 264 bits are read as 24 numbers of 11 bits, each naming a word of the list.

2.3. Letter case and spacing do not matter when the words are typed; anything else does. Words whose checksum fails, a word not on the list, or a count other than 24 are refused, saying which. Words that decode to 256 bits which are not a Schnorr secret key are refused.

2.4. Only BIP-39's encoding is used, never its wallet derivation. *These words are not a Bitcoin wallet, and not a chain-key backup. Say both to users.*

## 2a. The encryption key the words carry (new in draft 2)

2a.1. The X-Wing secret key (Envelopes, "Encryption key": 32 bytes) carried by a signing seed is

```
tagged_hash("MOR/module/carry/encryption", signing seed)
```

with the Identity MIR's `tagged_hash`. Its public key is X-Wing's public key for that secret. **(mechanic, this draft's)**

2a.2. **An app making an identity under this draft** publishes, as the identity's encryption key, the one its signing seed carries. *So its words carry it from the start.*

2a.3. **An app taking words in** (section 4) compares the identity's current encryption key (the one that counts, Envelopes) with the one the words carry. Equal: it keeps the secret, and opens the identity's private messages with it. Not equal (an identity made by an app that drew its encryption key at random, or one whose key was not yet renewed after a rotation): it keeps the signing key alone and says plainly that the identity's private messages cannot be opened here. It MUST NOT publish an encryption key of its own in its place (4.4).

2a.4. **After a rotation,** the identity's encryption key is renewed from the new signing seed by the app that published the last version, once it holds the new words (4.6): the next version, naming the last. An app that did not publish the last version does not publish the next. *One writer per version chain, as for routes. Until the renewal, messages sealed to the identity go to the key the old words carry, which a thief holding them can open: the rotation's window, said where the new words are taken.*

2a.5. An app keeps every encryption secret it held, the old ones included, to open what was sealed before a renewal.

*Why derived, not written beside: a second set of 24 words would carry any identity's encryption key, including those drawn at random, but would double what a person writes and keeps, and would not change when the signing key does; a thief who once held both sheets would read the identity's messages for good. Derived, a rotation ends it.*

## 3. Making the words

3.1. An app that shows the words SHOULD show them once at the moment they are made, with a plain instruction to write them down, in order, on paper, and SHOULD ask for at least three of them, at positions it chooses at random, to be typed back **once the words are hidden** (new in draft 2, from the author's human tests, H3: "it is useless if the words are still displayed when asked"). An app MAY show them again on request.

3.2. It MUST say plainly, where the words are shown: **whoever holds these words can sign as this identity and read its private messages** (new in draft 2); the chain key is not in them; and they stop working when the signing key is changed.

3.3. **Labels (new in draft 2, F332's amendment: "Both should be labeled properly in the app").** Wherever an app shows or asks for these words, it calls them **the signing key's words**; wherever it shows a chain-key backup (another Module's), it calls it **the chain key's words**. It never shows the one under the other's name.

## 4. Taking an identity in

4.1. An app given an ID and words reads the identity as any reader would (Identity, "Reaching an identity"): its genesis by its ID from an address given, then its chain and receipts from every home the chain names, and lets the core library decide which rotation counts.

4.2. It MUST refuse the words unless the public key they give is the **current signing key**: the key bound by the latest chain act that counts. It MUST refuse while the identity is contested or a rotation is waiting for its homes.

4.3. **It starts its own line.** Its first everyday act names no previous act, bound to the current signing key. It never continues another app's line.

4.4. *Readings a client may take, stated (corrected in draft 2):* it SHOULD NOT publish a new version of the identity's **routes** or **encryption key**, which are versioned and may only have one line of versions (a second writer forks them; 2a.4 is the one exception, for the app that wrote the last version). **Names are not versioned** (Identity, "Which value counts", 4: each name counts until withdrawn), so an app holding the words MAY publish and withdraw names. *Draft 1 listed names among the versioned values: a slip.*

4.5. Before each act it signs, the app SHOULD look the identity up again, and MUST NOT sign once a rotation counts that bound another key: the words it holds are then spent.

4.6. **New words after a rotation (new in draft 2, F332's amendment).** An app that finds its key spent says so in plain words: the identity's signing key was changed elsewhere, so this app signs nothing more with the old words; to go on, give it the new signing key's words. It then takes the new words for the same identity as 4.2 checks them, starts a new line under the new binding (4.3), and keeps what it held of the identity (its people, its old encryption secrets). *It never rotates: the chain key is not here.*

## 5. Each app keeps its own line, and rotations

5.1. **Rule 35's warning** (Identity rule 35, was 17). A rotation keeps only the lines it names. Every act of a line it does not name is void from that rotation on, unless another identity acknowledged it. So:

- An app holding carried words MUST show its line's latest act, position and running summary on request, so the owner can take them to the device that rotates.
- The device holding the chain key SHOULD find every line before a rotation, and MUST say plainly, before signing a rotation, that a line it does not name is voided.
- An app SHOULD say, where it takes an identity in, that its posts survive a key change only if that change keeps its line.

5.2. *Seen from the device that holds the chain key, the acts of another app look exactly like acts signed by a thief who stole the signing key (F152). The owner who carried the words knows which is which; nobody else can tell.*

5.3. After a rotation, the carried words are spent (4.6).

## Costs, stated

- **The words are the signing key and the encryption key, in the clear, on paper and in each app that took them (new in draft 2).** Whoever holds them can post as the identity **and read its private messages**, those already received included, until a rotation and the encryption key's renewal (2a.4). Every app that holds them is another place they can be stolen from. *The author's answer, F332: "for now".*
- **A rotation does not take back what was read.** Messages sealed to the old encryption key stay readable by whoever held the old words.
- **The renewal window (new in draft 2).** Between a rotation and the renewal of the encryption key (2a.4), messages are sealed to a key the old words carry.
- **An identity whose encryption key was drawn at random** (made by the desk or the genesis client before this draft) is carried without it: an app taking its words posts as it, and cannot read its private messages (2a.3).
- **One sheet, two meanings.** The signing words and a chain-key backup under the words seed Module look alike. A person who types a chain-key backup into an online app has put the chain key online; the app refuses them as words that do not give the current signing key, and SHOULD say "if these are your chain key's words, they must never be typed into an online device". The labels of 3.3 are the other guard.
- **Lines are easy to forget.** A rotation from a device that does not know another app's line voids that app's posts. The warning of 5.1 is the only guard.

## Tests

- Words round-trip, whatever the case and spacing; refusals as draft 1. *Run, in Rust and in TypeScript, on the same vectors.*
- **The encryption key the words carry:** the same secret and the same public key in Rust and TypeScript (new vectors in `carry.json`). *Run, `modules/airgap/src/carry.rs`, `modules/carry/test/carry.test.ts`.*
- An identity made by Dub publishes the encryption key its words carry; brought into another Dub by its words, that Dub opens a private message sealed to it. *Run, `clients/dub/test/dub.test.ts` and `web.test.ts`.*
- An identity whose encryption key was drawn at random is brought in, posts, and says its private messages cannot be opened here. *Run, `clients/dub/test/dub.test.ts`.*
- The words hidden before three are asked back (H3). *Run, `clients/dub/test/browser.test.ts`, `web.test.ts`.*
- After a rotation made elsewhere, the app says its key is spent, refuses to sign, takes the new words, starts a new line and renews the encryption key it published. *Run, `clients/dub/test/dub.test.ts`.*
