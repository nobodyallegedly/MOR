# Module: The signing key as a string

*Draft 1, 31 October 2026 (the Dubsar Suite's round 9, F411), beside the identity carry Module (`module-identity-carry-words-draft-2.md`). Decided by Nobody, allegedly, 25 October 2026 (H104): "Chain key, only words in dubsar apps. Signing key, users choses." **Experimental, not approved; test identities only until MOR is frozen.** Every choice below that the decision leaves open is marked **(mechanic, this draft's)**. Code: `modules/carry/src/string.ts` (TypeScript, not in the core), tests `modules/carry/test/string.test.ts`. Its hash stays a draft hash until its creator is named.*

*Reading this document: normal text is the Module itself. Italic text is commentary.*

## In plain words

*Your signing key can be written two ways: as 24 words, or as one string of letters and digits that starts with `morsk1`. Both are the same key: whoever holds either can post as you and read your private messages, until the key is changed with the chain key. Choose the one you find easier to keep. The string has a check built in, so if one character is copied wrong, the app says so instead of bringing in a wrong key.*

*Your chain key is never written as a string in the Dubsar apps: its words only.*

## 1. What is written

1.1. The **signing seed** the identity carry Module carries (its section 1: the 32-byte secret key of the identity's current Schnorr signing key, scheme 1), and nothing else. *The encryption key it gives (that Module's section 2a) comes with it, as with the words.*

1.2. **The chain key is never written this way.** An app MUST NOT show a chain key, or a share of one, as a string under this Module, nor take one in. *H104: "Chain key, only words in dubsar apps."*

## 2. How it is written

2.1. **The string** is Bech32m (BIP-350): the human-readable part `morsk`, the separator `1`, then the seed's 256 bits as 52 characters of Bech32's alphabet (the last carrying 4 zero bits of padding), then Bech32m's 6 checksum characters: 64 characters in all. **(mechanic, this draft's)**

*Why Bech32m: it is the checksum Bitcoin's newer addresses use, designed for strings people copy by hand. Any one wrong character is caught, and so are up to four; its alphabet leaves out the characters most often confused (b, i, o and 1 after the separator). A plain hexadecimal string would carry no check, and a typo would bring in another key.*

2.2. **Shown**, an app MAY group it in fours after `morsk1`, for copying by hand. **Typed back**, spaces and dashes do not matter, nor letter case unless it is mixed (Bech32 refuses mixed case).

2.3. **Refused, saying which:** a string not starting with `morsk1`; a character outside the alphabet, naming its position; a length other than 64; a checksum that fails ("a character was written or read wrong"). Like the words (carry Module 2.3), a string that decodes to 256 bits which are not a Schnorr secret key is refused where the key is used.

## 3. Words or a string: the same key

3.1. **An app that makes or brings an identity offers both:** the 24 words of the carry Module, or this string, the person's choice (H104: "Signing key, users choses"). Either brings the same identity; neither is preferred.

3.2. **Shown in the other form on request.** Where an app shows the signing key's words, it offers the string beside them, on request, and the reverse: one tap, the same key. It labels both as **the signing key**, as the carry Module's 3.3 labels the words, and says once that holding either is holding the key.

3.3. **Taking it in,** one box takes either: an entry starting with `morsk1` (spaces and dashes aside) is read as the string, anything else as 24 words. **(mechanic, this draft's)**

3.4. The carry Module's warnings hold for the string word for word: whoever holds it can sign as the identity and read its private messages; the chain key is not in it; it stops working when the signing key is changed.

## 4. Conformance

- An app showing the string SHOULD show it once at the moment it is made, as the carry Module's 3.1 asks for the words, and ask for part of it back once hidden: *the apps of round 9 ask the words back at the making (unchanged) and show the string on request after.*
- **Client conformance:** an app MUST refuse a string whose checksum fails; it MUST NOT "correct" one silently, even where Bech32's code could locate the error. *A key guessed back is a key no one wrote down.*

## 5. Tests

`modules/carry/test/string.test.ts`: BIP-350's valid test vectors check and changed ones do not; a seed and its string read back to the same 32 bytes, and the same key as its 24 words; spaces, dashes, one case and the grouped form read back; a changed character, two swapped, one missing or extra, a wrong prefix, a character outside the alphabet and mixed case each refused, saying which; one box taking words or the string to the same seed.

*Built in round 9 (F411): Dub, Damgar, Ummia, Edubba and Kišib take either form wherever a signing key is brought, and show the string beside the words on request. Nakišib, Rust and offline, shows words only this round (said in its README).*
