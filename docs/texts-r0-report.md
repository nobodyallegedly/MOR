# Three texts, and one with its code: the report

*21 October 2026, a Dubsar Suite session. Branch `claude/texts-r0-airgap-payment-audio`. Finding F370 (Dubsar Suite). Author: Nobody, allegedly. Every cMIP and Module is the Dubsar Suite lead's ("Modules and cMIPs are handled by the suite lead. The idea is that it is not core."); nothing in `spec/` was changed.*

*Read with:* F361 and F355 (on main), and F362 with `docs/h80-report.md`, which are on pull request 81 (H80 and H79), not yet merged when this was written. This branch cites F362 as that pull request writes it.

## 1. In plain words

### The air-gapped chain-key signer: new chain-key paper at every change of keys

An identity's **chain key** lives on paper (24 words) and is used only to change the identity's keys. This Module says how an offline device, one that never touches the internet, holds that paper's key and signs a change of keys for the online phone or computer.

**What it said before:** the next chain key came from the same paper, unless you thought the paper might have been seen. **What it says now** (your decision: "A rotation generates two new sets of keys, chain and signing"): every change of keys makes **a new chain-key paper**. The offline device draws a new secret, shows its words, hides them, and asks you to type three of them back. **Only then does it sign the change** (your decision: "confirming the new chain key comes before signing the rotation, confirming the new signing key can come after"). Next, once the homes have accepted the change, the online device shows the new signing key's words, to write down and type back in the same way. The old paper still works until the homes accept the change, and then it is spent. If you walk away before typing the words back, nothing was signed, and the paper you wrote is worthless.

**One exception, kept and labelled.** You may still choose, on the offline device itself and for that one change, to keep your current paper. This suits someone whose one paper is stamped in steel in a safe and whose phone was lost, while the paper was never seen. The device never offers this by default. It refuses it after a theft (an escape) and for a collective, and it shows its cost in large type: **anyone who has ever seen that paper can make every later key, so a change made this way does not undo a stolen paper.** (Question 1 asks whether you want to keep this exception at all.)

**Which key is used.** The keys are counted over the identity's whole life (0 at its creation, then 1, 2, 3 at each change). A new paper made at the third change gives "key 3" of that paper, not "key 0". This is how Kišib already does it. Nobody needs to know the number: the app finds it.

The two paper formats (words, and hexadecimal characters) each had one sentence that was now wrong: "the one secret from which a device derives *every* chain key". Each gets a draft 2 that says a paper gives the one key that counts until the next change. Nothing else changes: an existing paper still gives the same keys.

### The payment cMIP: a transfer to one's own vault says so

Damgar's **Transfer to vault** moves your own money into your own vault (the safer place only the chain key can change). Every payment carries a fingerprint of what it is for (`fulfils`). Until now a transfer to yourself had to say it was for "your payee pointer" (where your everyday payments go), which you may not have. It is also the wrong thing to name, since the money goes to the vault, not there. **What it says now:** a transfer to yourself names **the act that declared your vault**. It is then a transfer to yourself and nothing else: the payer and the payee are both you, it buys nothing, and it owes nothing to anyone. A transfer made the old way still counts. Damgar and the payment code follow once you approve.

### The audio Module: songs and voice notes, checked and cleaned

A new Module for **recordings**: songs, voice notes, talks. A recording on MOR is **one M4A file**, the kind every phone records and every music program writes, holding **one sound track coded as AAC (AAC-LC), mono or stereo, and nothing else**.

**What it accepts:** one whole M4A file, at most 64 MiB, at most two hours, sampled at most 48,000 times a second; mono or stereo AAC-LC; written as M4A or as a plain MP4 (programs write either for the same sound).

**What it refuses, and what it says:** a file that is damaged or not an M4A ("damaged or of another kind"); a QuickTime file ("save it again as M4A"); a file with **pictures** ("it is a film, for the video Module"); chapters, lyrics or text beside the sound; two sound tracks, or none; Apple Lossless, MP3 or another codec ("save it again as AAC"); another kind of AAC, or surround sound; locked (encrypted) sound; sound stored at an address elsewhere; a live stream's fragmented file; anything beyond the limits.

**Cleaning before publishing:** like a photo, a song carries more than the sound: its title, the artist, the album, dates, where it was recorded, a cover picture, the program's name, and room where anything can hide. Before an app publishes a recording for you it removes all of that. **Nothing is re-encoded:** every piece of sound is copied byte for byte, so it sounds exactly the same. If you want a cover picture, the app publishes your own picture beside the recording, under your name.

**Its code** checks and cleans recordings, with test recordings made from pure tones (never anyone's real sound) and checked by a second, independent program (ffmpeg). It uses the video Module's own code for everything the two share, so a fix to one reaches both. The video Module accepts exactly what it did, and the website's player is byte for byte as released. No app uses the audio Module yet; the Publishing and Dub rounds will.

## 2. Each change, rule by rule

### The air-gapped chain-key signer Module, draft 6 (`modules/module-airgap-chain-key-signer-draft-6.md`)

Draft 5 kept as it is. Each change is marked "new in draft 6".

| Where | Draft 5 | Draft 6 | Why |
| --- | --- | --- | --- |
| Title | "Spec Note: Pending Rotation and Air-Gapped Chain keys" | "Module: Dubsar Air-Gapped Chain-Key Signer" | F356, the house prefix. |
| Section 2, key index | key *n* for the rotation at position *n*, "even across a fresh seed" | Kept, and spelled out: a fresh seed drawn for the rotation at position *n* gives its key *n*, never its key 0; under the rule each seed gives one key that counts; a device finds its key by one derivation per seed, at the index the pending rotation gives (field 3) | As built in Kišib on 21 October (F362); the Module's code already derives a fresh seed's first key at index *n* (`Signer::review`). |
| Rule 3.1, the summary | — | Says where the next key comes from: a fresh seed (the rule) or the current seed (the exception, prominent, with its cost) | The exception must never pass unseen. |
| **Rule 3.3** | the next key "from its current seed, or from a fresh seed if the current one may be exposed", the backup notice after | **A fresh seed at every rotation.** Its backup shown, hidden, three words (or three groups of four characters) asked back; **only then is the rotation signed**; a review abandoned signs nothing and its seed is overwritten; the earlier backup kept until the rotation counts (rule 3.4's exceptions sign with it), then spent. **The exception:** the current seed, only by the owner's choice on the device for that rotation, never the default, never chosen by the online side, never at rule 3.4's exceptions or for a collective, MUST NOT be chosen where the backup may have been exposed; its cost stated | F361 ("A rotation generates two new sets of keys, chain and signing"); F362 ("confirming the new chain key comes before signing the rotation"). Kept as an exception rather than removed: see question 1. |
| **Rule 3.7** | "Back up both seeds", no order | **The chain-key seed first, the signing seed after:** the chain-key seed before anything commits to it (the genesis's commitment export, a rotation's signature); the signing seed once the act installing it counts (after the receipts; in clean-device mode, on the clean device); under the exception, no new chain-key backup, said | F362, in the order Kišib now uses. |
| Rule 3.8, restoring | matching commitments | The same, at the pending rotation's index; a spent backup gives no matching key, said in plain words, nothing signed | Kišib says the same of an old paper ("These words are spent"). |
| Section 7, tests | — | Two new lines: the fresh-seed default with its confirmation, and the exception. Both **not run** in the Module's code (which implements draft 5); the first **run in Kišib** (`clients/kishib/test/identity.test.ts`) | Code and text are honest about which is built. |

**Not changed:** the messages (no field added: the backup and its confirmation happen on the offline device's own screen), rule 3.4, collectives (already a fresh dealt seed at every rotation), transport.

**The code, `modules/airgap/`**, still implements draft 5's rule 3.3: `Choices::fresh_seed` is the user's choice, and the backup notice is a line in the summary, not a confirmation before signing. This session wrote the texts only, as asked. Building draft 6 there is a separate step: make a fresh seed the default, add the confirmation before `sign`, and add the exception with its prominent warning. *Kišib, which signs from paper without this Module's messages, already does what draft 6 says (pull request 81).*

### The seed Modules, draft 2 each (`modules/module-chain-key-seed-words-draft-2.md`, `…-hex-draft-2.md`)

| Where | Draft 1 | Draft 2 | Why |
| --- | --- | --- | --- |
| Title | "Seed Module: Words" / "Hex" | "Seed Module: Dubsar Words" / "Dubsar Hex" | F356. |
| Purpose | "the one secret from which a signing device derives every chain key of an identity" | "…derives a chain key of an identity: … each seed gives the one key that counts until the next change (rule 3.3), or, by the owner's exception there, every later key" | Now wrong under draft 6's rule 3.3. |
| Deriving chain keys | — | "The index is the identity's, not the seed's": a seed drawn at the rotation at position *n* gives its key *n* | The same point as the signer Module's section 2. |

Backup, checksum, derivation and tags are unchanged: a draft 1 backup restores the same seed and keys. The code's test values for their hashes still say draft 1 (`modules/airgap/src/seed.rs`), as the drafts are not yet published.

### The payment cMIP, draft 4 (`cmips/cmip-payment-draft-4.md`)

Draft 3 kept as it is. Each change is marked "new in draft 4 (F355)".

| Where | Draft 3 | Draft 4 | Why |
| --- | --- | --- | --- |
| Title | "cMIP: Payment" | "cMIP: Dubsar Payments" | F356 (its own example). |
| The commitment, `fulfils` | "the obligation, agreement, offer or payee-pointer act" | Adds: "for a transfer to oneself, the genesis or rotation declaring the vault paid to" | F355 (c). |
| The commitment, new item 6 | — (a reading: one's own pointer) | **A transfer to oneself:** payer and payee one identity, `paid-to` `[1, declared-by, entry]`, `fulfils` the same act as `declared-by`, no purchase; any other commitment with that `fulfils` is not one, and the vault's side issues no address for it; draft 3's reading stays valid | F355 (c): needs no payee pointer, and names no flow for money going to the vault. |
| Verifying, new step 4a | — | Where `fulfils` equals `paid-to`'s `declared-by`: the payer is the payee's identity, it signed, no purchase, **or invalid**; checked from the act alone | So the case is unambiguous for every verifier (question 3). |
| New paragraph, judged | — | Shown as "a transfer to your vault": discharges nothing, follows nothing, pays no one; its record kept sealed to its owner | F355 (a)'s screens, said in the text. |
| Freeze scenarios | — | H46 (F355): to build | `cmips/payment` and Damgar. |

**Not built here:** step 4a in `cmips/payment` (Rust) and Damgar's Transfer to vault naming the vault declaration (today it names one's own pointer, draft 3's reading, and refuses without one: `clients/damgar/src/damgar.ts`, `vaultTransferRead`). No app code was changed in this session, as asked.

### The audio Module, draft 1 (`modules/module-audio-draft-1.md`), and its code (`modules/audio/`)

The rules are numbered as the video Module's, so that the same subject sits under the same number in both. Rule 6 (which way up) has no counterpart and is left empty, saying so.

| Rule | What | Against the video Module |
| --- | --- | --- |
| 1 | One file, whole; the boxes fill it exactly | Same. |
| 2 | `ftyp` first, not QuickTime; a brand of `M4A `, `isom`, `iso2`–`iso6`, `mp41`, `mp42`; one `moov`, at least one `mdat`; only metadata beside; fragments refused | Same, with `M4A ` added and `avc1` (a film's brand) left out. |
| 3 | Exactly one track, of sound; no picture (`vide`, `pict`, `auxv`), text, chapters, timecode, metadata or hint track; one sample description, one data reference | The video Module requires one picture track; here none. A track's kind is read first, so a picture track is refused as one, whatever codec it holds. |
| 4 | AAC-LC in `mp4a` version 0, MPEG-4 audio, mono or stereo | Same (the shared code). Apple Lossless, MP3, AAC Main and surround refused, each tested. |
| 5 | The track's and the movie's matrices the identity | The video Module allows quarter turns on a track; a sound track has no pictures to turn. |
| 7 | The index holds together | Same (the shared code). |
| 8 | Nothing from elsewhere, nothing that runs | Same (the shared code); the one refusal worded "which a film may not" is said here "which a recording may not". |
| 9 | 64 MiB less 16 bytes; **two hours**; 48,000 Hz | Size and rate the same; the video Module's ten minutes would cut most talks short (question 2). |
| 10 | Stripping: the video Module's rule 10 on one sound track | The same code (`stripped`), byte for byte. |
| 11–12 | On the listener's action; a cover only the publisher's own JPEG, never from the file; what a player cannot play, said | The poster's rule, for a cover. |
| 13 | By reference in a post | Same; not built (no app uses it yet). |

Also in the text: the refusals in plain words (a table), the stated costs (whole file before the first sound; lossless and MP3 refused; iTunes' gapless tag removed, the edit list kept; bytes inside the AAC stream stay), and the reasoning (sound only, so one file is never read two ways by two Modules).

**The code.** `modules/audio/src/audio.ts` imports from `modules/video/src/video.ts` the box reader, the track reader (with its AAC reading, sample tables and data reference checks), the metadata inspection and the stripping, and adds the brands, the one-sound-track rule, the matrix, the limits and its words. Two changes to the video Module's code made that possible, neither changing what it accepts:
- `export` on what is shared, and `strip` split into reading (`parse`) and writing (`stripped`), with `samplesOf` beside `trackData`.
- **Proof that nothing changed:** the video tests pass; `npm run vectors` rewrites every video vector and stripped film byte for byte as before; `vectors/check.py` passes 19 of 19. The part of `video.ts` the website's display client bundles was built before and after with the same esbuild settings: byte for byte the same, and the same as the released `clients/site/built/gateway.js` apart from esbuild's numbering of names (`strip` is not in the bundle). So the display client needs no new release.

Tests (`npm test`, 8 tests): every fixture read or refused exactly as its vector says (19 fixtures: 5 played, 14 refused, each refusal checked against its rule); the shared refusal said in this Module's words; a turned sound track refused; **the video Module refuses every recording this one plays, and this one refuses the video Module's films**; stripping keeps every sample byte for byte, leaves no `udta`, `ilst`, cover, place, free space, `uuid`, handler name, encoder name or hidden data, puts the index first, and changes nothing the second time; 20,000 damaged recordings each read or refused as not a recording, never anything else, and every one read strips clean. `python3 vectors/check.py` (ffprobe and ffmpeg): 19 of 19, the same packets and the same decoded sound before and after stripping, one sound stream left, no tags. One refusal is checked by the script's own reading of the movie header rather than by ffprobe: `too-long.m4a` is a short tone whose header says 7,201 seconds (an hour of real sound would be megabytes), and ffprobe reports the stream's own length.

CI: a `modules/audio` step beside `modules/video` (`.github/workflows/test.yml`, `scripts/test-all.sh`).

### Records

F370 in the shared log (F367 to F369 were taken on main during the session; F362 is pull request 81's). `cmips/README.md` and `modules/README.md` list the new drafts and `audio/`. No server addresses or keys.

## 3. For the MOR lead

**One question, about the Money MIR; nothing changed in the core.**

**What a payment "fulfils", for a transfer to oneself.** Money draft 10 (and draft 11 on pull request 83) describes a receipt's field 5 and a claim's field 4 as "the obligation, agreement, offer or payee-pointer act this hop follows", and the payment task as accepting "an obligation, offer or payee pointer". The payment cMIP's draft 4 lets a transfer to oneself name **the genesis or rotation declaring the vault** there (F355 (c), decided by Nobody, allegedly). The payment cMIP checks it from the act alone (payer and payee the same identity, `fulfils` equal to `paid-to`'s vault declaration). The question for Money:

- **(a) The list is descriptive, not closed** (the session's lean). Money judges `fulfils` only where it names an act Money or Agreements reads (an obligation to discharge, an agreement or offer to follow, a pointer for rule 17). A `fulfils` naming a genesis or rotation is then a payment that fulfils nothing in Money's sense: it discharges nothing, and nothing changes in any verdict. At most one sentence in Money 11 saying so, or none.
- **(b) The list is closed:** Money's field 5 and 4 comments, and the task's sentence, add "or, for a payment whose payer is its payee, the genesis or rotation declaring the vault paid to".

Either way, no verdict changes for anyone else: a transfer to oneself has no counterparty.

## 4. Questions for Nobody, allegedly

**Question 1. A change of keys from the same paper: keep it as an exception, or drop it?** Draft 6 makes a new paper the rule at every change of keys, as you decided. It keeps one exception: on the offline device, for one change, you may choose to keep your current paper (for someone whose one paper is stamped in steel in a safe, changing keys after losing a phone, the paper never seen). It is never the default, refused after a theft and for a collective, and shown with its cost: whoever has seen that paper makes every later key, so such a change does not undo a stolen paper. Kišib does not offer it. **My lean: keep it, as written.** The commonest change of keys follows a lost phone, not a lost paper, and a person who keeps one guarded paper for life should have that choice, with its cost said. If you would rather a change of keys always make a new paper, with no exception, the exception comes out and nothing else moves.

*(Questions 2 and 3, one at a time, after question 1.)*

**Question 2. How long may a recording be?** Draft 1 says two hours (with 64 MiB and 48,000 Hz, as for films). Ten minutes, the films' limit, would cut most talks and long conversations; at ordinary quality, 64 MiB already stops a stereo recording at about seventy minutes. **My lean: two hours**, and the size limit decides before it does for music. Chapter tracks are refused, as subtitles are in films; and a file written as M4A or as plain MP4 is read alike.

**Question 3. A payment naming your vault declaration but paid by someone else: refused, or ordinary?** Draft 4 says a payment whose "for what" (`fulfils`) is the act that declared the payee's vault must be a transfer to oneself, payer and payee the same, or it is invalid. The other choice reads it as an ordinary payment into someone's vault that fulfils nothing. **My lean: invalid.** One meaning per form, checked from the act alone. Someone paying into your vault names what they pay (a debt, an offer, your pointer), as before.
