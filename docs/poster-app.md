# MOR Post: a standalone posting app for the Mac (roadmap step 9b)

*GitHub session, 12 October 2026. Branch `claude/step-9b-poster`, not merged. Client and Module work; the core unchanged; the released WebAssembly unchanged, byte for byte.*

## In plain words

There is now an app called **MOR Post**. You double-click it on the Mac, a page opens in your browser, and you can write a text, add a photo, press Post, and see your post as anyone would see it: fetched back from the relay and checked, with the word "verified". Below it, the list of your posts, newest first, and a button to withdraw a picture. Nothing else: no inbox, no drafts, no Claude, no agreements, no payments. The first screen says "Test identities only, until MOR is frozen".

The first time it opens, it offers two doors.

- **Make a new identity.** You give a home address. The app makes an identity with the genesis client's code and shows you 24 words, once. You write them on paper. Before anything is published, it asks you for three of them, at random places, so you show you wrote them down. Get one wrong and nothing happens; get all three right and the identity is born at its homes.
- **Bring an identity you have.** You type its ID and its 24 words, and one address where it lives. The app reads the identity from its homes and checks that the words give the key that currently signs for it. If they do not, it refuses and keeps nothing.

The 24 words are a new Module: **identity carry, by words**. They are the identity's signing key written in the same kind of words as the chain-key backup. Whoever holds them can post as you, until the signing key is changed. The chain key, the one that changes the signing key, never travels: it stays where it is.

Two apps posting as one identity is allowed: each keeps its own line of acts, and all their posts are valid. The cost is the one Identity's rule 17 warns of: when the signing key is changed, the change must name every app's line, or the posts of a line it leaves out become void. A test shows exactly that happening, because the genesis client, when it changes the key, names only its own line. That is a question for you below (Q1).

## What was built

| Where | What |
| --- | --- |
| `modules/module-identity-carry-words-draft-1.md` | **The Module.** Founding, experimental, draft 1. What travels: the ID and the signing seed (the 32-byte secret of the Schnorr signing key), the seed written as 24 words in the words seed Module's encoding (BIP-39's English list and checksum, never its wallet derivation). It says plainly that the chain key never travels, that whoever holds the words can sign as the identity, that each app keeps its own line, and gives rule 17's warning before any rotation; its costs are stated. |
| `modules/carry/` | The Module in TypeScript, used by the app. |
| `modules/airgap/src/carry.rs`, `vectors/carry.json`, `examples/carry_vectors.rs` | The Module in Rust, beside the seed Modules, and the vectors both implementations are tested on. Behind its own cargo feature, `carry`, on by default and off for the core library's WebAssembly: adding it plainly to the crate changed the WebAssembly's bytes (found and checked), which would have forced a release of the display client for no change in what it does. |
| `clients/poster/` | **MOR Post.** Its README says what each file does. |
| `clients/desk/src/local.ts`, `launch.ts`, `version.ts`, `page/api.ts` | Shared, not copied: the desk's server, launcher and version fingerprint were moved out of its `server.ts` and `cli.ts` so MOR Post runs on the same code, and the page client takes another program's domain line. The desk works as before (12 of 12 tests). |
| `scripts/test-all.sh`, `.github/workflows/test.yml` | MOR Post and the Module's code tested with everything else. |

How it runs, as the desk does: a program on `127.0.0.1` only (port 8472), the page built at start and not minified, under a content security policy, every request signed by a browser paired once by the app's link; opened by double-click; settings and keys in `~/mor-poster`, owner-only, never in the repository.

## Readings taken

Where the texts are silent. *To be confirmed by Nobody, allegedly.*

1. **The words hold the signing key itself,** not a seed it is derived from. That is what lets an identity already made by the genesis client be carried without being remade. The cost: the words are only good for the current key; after a rotation, new words.
2. **The ID carries no checksum.** A mistyped ID simply finds no identity: a genesis is found only under its own hash.
3. **Three words typed back, at random places,** before anything is published; the words are never shown again (a reload asks for the three; "Start again" makes a new identity, never published).
4. **A new identity's chain key is kept in the app's folder, in software,** as the genesis client keeps test identities' chain keys ("the chain key's backup as the genesis client already handles it"). *This differs from the roadmap's mechanics written on the morning of 12 October* ("the safety seed shown once … the seed words Module"): the brief for this session asked for the signing seed's words instead. See Q2.
5. **An identity brought into the app publishes no routes, names or encryption key.** Those come in numbered versions, and a second app writing them would fork them. It uses the relays its routes already name, and asks for relays only where they name none. A new identity's routes name its relays as where its posts are, and no inbox (the app has none).
6. **Before every act it signs, the app looks the identity up** and refuses if the key it holds is no longer the current one. One look-up per post.
7. **The list shows the posts of every line** (this app's and any other's) at the identity's relays, newest first.
8. **Withdraw only pictures this identity published,** from any line.

## Questions for Nobody, allegedly

Each checked against the working rule "core business, or the participants' choice". None is core business: the core already says what it needs to (rules 17 and 37).

**Q1. Before a key change, who finds the other apps' lines?** *(Area: presentation and clients; Identity rule 17 is client conformance.)* Rule 17 says clients SHOULD track every line the owner started, on any device, and warn before a rotation that leaves one out. The genesis client, the desk and the collective client know only their own line. The test shows the result: the genesis client rotates, and MOR Post's posts become void. Options:
- (a) The client preparing a rotation reads every act of the identity from its homes and relays, finds each line's latest act, shows them, and keeps them unless the owner leaves one out on purpose. *Cost:* a thief's line looks the same as another app's (F152), so the owner must recognise their own; MOR Post shows its line's latest act for that.
- (b) The owner carries each app's line to the rotating device by hand: MOR Post shows it on its card.
- (c) Leave it as a stated cost: warnings only, as now.

*Lean: (a), with (b) as the way to tell a line apart. Not built: it changes the genesis client's rotation, beyond this step.*

**Q2. A new identity's chain key: paper too?** *(Area: presentation and clients.)* As built, MOR Post writes the new identity's chain key only to its folder; lose the Mac's folder and the key can never be changed (the words still post). Options:
- (a) As built, for test identities: the folder is the backup.
- (b) Also show the chain key as a seed in the chain-key words Module, once, to write down. *Cost:* deriving chain keys from a seed in the app needs the seed Module's derivation in the core library's WebAssembly, which changes it and asks for a release of the display client.
- (c) Leave it to the air-gapped signer, for real identities (steps 16b and 17).

*Lean: (a) now, (c) for real identities.*

**Q3. Two sheets that look alike.** *(Area: development layer, this Module.)* The signing words and a chain-key backup are both 24 words of the same list. Someone who types the chain key's words into an online app has put the chain key online. As built, the app refuses them (they do not give the signing key) and says "if these are your chain key's words, they must never be typed into an online device", but cannot tell. Options:
- (a) Keep the same scheme, as asked, with the cost stated (as in draft 1).
- (b) Make the signing words unmistakable (for example a different number of words), departing from the chain-key words' scheme.
- (c) The app derives chain keys from the words it is given and refuses loudly when they match the identity's chain-key commitment (needs Q2 (b)'s derivation).

*Lean: (a) for draft 1: "it's a module it does not have to be perfect".*

**Q4. MOR Post for other people's Macs.** *(Area: presentation and clients; already "not decided" in the roadmap.)* The app made by the script runs the code where it is: it needs this repository, Node 22 and the built WebAssembly on that Mac, so today it is for the author's Mac. For anyone else: (a) as now; (b) a self-contained app (Node and the code inside it), unsigned, opened by right-click and Open; (c) (b), signed and notarised, which needs an Apple developer account (the Apple Developer Program, a yearly fee, in a person's or an organisation's name, shown to everyone who opens the app), a Developer ID certificate, `codesign`, `xcrun notarytool` and `xcrun stapler`. *No lean: it is an operational choice, and the account's name is yours to choose.*

No flaw in a MIP found. The one place the building pressed (Q1) is a client not yet doing what rule 17 asks of it.

## The tests

Before writing anything, `scripts/test-all.sh` on main (`b0c2087`): **all passed** (Rust workspace; barebone 9, collective 41, connector 12, desk 12, genesis 17, longform 26, manage 7, reader 16, repo 18, site 42, jpeg 14, video 6). A first run stopped at the WebAssembly step because this container lacked `wasm-bindgen-cli`, which the script lists as needed; installed, the second run passed.

New:

- **The Module's words** (`modules/carry/`, 6 tests; `mor-airgap` `carry`, 1 test): the Rust and TypeScript code give the same words, seed and public key on the vectors; BIP-39's own words for zero bytes; round trips whatever the case and spacing; **a wrong word or checksum refused**, a word off the list, a wrong count; the all-ones seed refused as not a key.
- **MOR Post** (`clients/poster/`, 7 tests): **a new identity refuses to go on until three words are typed back**, publishing nothing before; **an identity made by the genesis client brought in by its words, its current signing key checked, a wrong set refused**; **a post with and without a picture, published to a test relay and read back verified**; **the picture stripped** (location, preview and camera data out, nothing left for the reader to find); **a withdrawal**; **two apps posting as one identity keep separate lines, both valid** (and a third); a rotation elsewhere voids the line it leaves out, and the app then refuses to sign; **requests from an unpaired browser refused**; **nothing listens beyond 127.0.0.1**. The same in headless Chromium by clicks alone, and the launcher as the app runs it.
- The desk after the sharing: 12 of 12.

The full `scripts/test-all.sh` on this branch: **all passed** (Rust workspace, with the Module's Rust test; every client as before, plus poster 7 and carry 6). The core library's WebAssembly built from this branch has the same SHA-256 as the released one in `clients/site/built/` (`09901e60…`).

## How Nobody, allegedly, tries it on his Mac

Once, in Terminal, from the MOR folder (after this branch is merged):

```
git fetch origin && git checkout main && git pull
cd clients/genesis && npm install && npm run wasm
cd ../desk && npm install
cd ../poster && npm install && sh scripts/make-app.sh
```

Then:

1. Double-click **MOR Post** in `~/Applications`. The page opens, paired, and says "Test identities only, until MOR is frozen".
2. **Make a new identity:** the home addresses you use for test identities, one per line; relays the same, or leave them empty. Write the 24 words on paper. Type back the three asked. Try a wrong one first: it is refused, and nothing is published.
3. Post a text. Then a photo from your phone that has its location on: the app says what it took out, and the post shows "verified". Withdraw the picture: the post stays, the picture is gone.
4. **The second door**, in a second copy of the app (this one step needs Terminal, from `clients/poster`): `node --import tsx src/cli.ts open --dir ~/mor-poster-2 --port 8473`. Choose **Bring an identity you have**: the ID (press Copy ID on the first copy's card), your 24 words from the paper, one home address. Try one word wrong first: refused. Then post from the second copy, and see both copies' posts in each list, all verified.
5. Tell me what reads wrong, and your answers to Q1 to Q4 when you have them.

Test identities only; never type a real identity's words or keys into it.
