# Nakišib, Kišib's offline companion: report

*23 October 2026, Dubsar Suite, the Nakišib round, branch `claude/nakisib`, for Nobody, allegedly, and the Suite lead. Built from the decisions of 23 October 2026 (written in full in the brief, and in `docs/design/suite-redesign.md`, "Nakišib, Kišib's offline companion"). Finding **F394**. Test identities only; regtest only; no server address or key in the repository. The only suite session running; the MOR lead's S7g ran beside it, in its own branch.*

**Readings I took, running alone** (the brief: "take the most reasonable reading, say at the top of your report which reading you took"):

1. **Nakišib calls the Module as a Rust library, compiled into its own program.** The brief offered "by WebAssembly or by `mor-signer` as a bundled program". `mor-signer` as it stands keeps its seeds unencrypted in its state file (`mor-signer/state.cbor`), which "Keep nothing" rules out. It also speaks only through Terminal prompts. A WebAssembly for Nakišib would have needed bindings the shared one does not have. So Nakišib is a small Rust program of its own that links `modules/airgap` (and `mor-core`) as they stand. Every rule it applies is the Module's. Section 2 says why.
2. **Kišib reaches the Module's `online` side through a small WebAssembly of its own.** The brief says Kišib writes the request "via `online`" and checks the answer "as Module 3.9 says". The suite's shared WebAssembly (`mor-wasm`) compiles `modules/airgap` in, but binds only its share functions, not `online`. Adding bindings there would change the shared WebAssembly, which this round must not do. So `clients/kishib/airgap/` binds `online::pending`, `online::accept`, the strict reading of a commitment export, and the key fingerprint. It is built to `kishib_airgap_bg.wasm`, Kišib's alone, loaded only when a way with Nakišib is used. No rule is rewritten in TypeScript.
3. **The summary before the paper is Nakišib's reading of the bytes.** The Module's `Signer::review` finds the chain key before it builds its summary. So its summary cannot exist before the paper is typed, yet the brief's order puts the summary first. Before the paper, Nakišib shows its own reading of the request's exact bytes, built with the Module's strict decoding and the Module's own `summary::describe`. After the paper, the Module's review checks everything again, and its own summary is the one shown above SIGN. **The Module did not have to change** (the brief: stop before changing it). Question 1 asks about it.
4. **Kišib's own way is unchanged.** Kišib's tests changed only where they list its columns' parts, which now include the two new ways.
5. **S7g was not on main** when I last checked, just before the last push (main still at `5fe7f76`, the commit this branch started from). My branch's shared WebAssembly is main's, byte for byte. Only Kišib's web release is rebuilt (section 4 of the checks below).

## 1. In plain words first

### What Nakišib is

An identity has two keys. The **signing key** signs everyday acts, in Dub, Edubba and the other apps. The **chain key** exists only on paper (24 words), and it is the key that changes the others. Until now, changing keys meant typing that paper into Kišib, on a computer that goes online.

**Nakišib is a small app for an old Mac that is wiped once and never connected again.** The paper is typed there and nowhere else. Kišib, on the everyday Mac, prepares the change and later sends it. A USB stick carries one file there and one file back. Nakišib keeps nothing secret: a stolen offline Mac gives nothing. It is optional. Kišib's own way of changing keys stays exactly as it was.

Its first screen says **"This Mac should never connect again."** It has three tiles: **Change keys**, **A new identity**, **What it signed**. Its colour is stone, quiet, on the suite's dark kit.

### A change of keys with Nakišib, step by step

1. **Kišib, everyday Mac:** Paper › **Change keys with Nakišib**. Give the identity and one of its homes. No paper is asked. Kišib reads every line of the identity's acts, the cards, the vault, and reads it all back, as for any change of keys. Press **Sign it**: Kišib signs nothing with a chain key. It makes the new signing key and shows its fingerprint. Then **Write the request for Nakišib** saves a file. Put it on the USB stick.
2. **Nakišib, offline Mac:** **Change keys**, then choose the file. Nakišib believes none of it. It shows what the bytes say, under **CONSEQUENTIAL — READ BEFORE SIGNING**: the new signing key's fingerprint (compare it with Kišib's), and any new homes, new vault, successor, closing of a home or acts given up. What Kišib wrote about the change is shown apart, marked "NOT checked, never trusted".
3. **Your paper:** type its 24 words. A wrong paper, or an older one already used up, is refused, said plainly.
4. **The new paper:** Nakišib draws a fresh one and shows its 24 words. Write them down, then press **I have written it down**. The words hide, and three are asked back. A wrong word is refused; nothing is signed until they match.
5. **Type SIGN.** Above the box is the Module's own summary of exactly what it signs. Nakišib signs, writes its memory, and forgets both papers.
6. **Write it** to the USB stick.
7. **Kišib:** **Read Nakišib's answer**. Kišib checks that it is exactly the change it asked for. If not, it refuses in plain words and sends nothing. If so, it sends the change to every home. Once the homes accept it, Kišib shows the new signing key's words, as always. **Send it again** sends the same bytes.

**A new identity** (for step 17): in Nakišib, **A new identity** draws the first paper. It is shown, hidden, and three words are asked back. Then Nakišib writes only its **commitment** to the stick. In Kišib, Identities › **Make one with Nakišib** reads that file, shows the same commitment to compare, and makes the identity from it.

### Which screenshots to look at (`docs/nakisib/`)

- **Nakišib** (from `test/screens.test.ts`, clicked through): `nakisib-01-first-screen` (the first screen and its line); `-02-summary` (what the bytes say, the consequential part first, Kišib's words apart); `-03-wrong-paper`; `-05-new-paper`; `-06-three-asked`; `-07-sign` (the Module's own summary above SIGN); `-09-written`; `-11-first-paper` and `-12-commitment` (a new identity); `-13-signed-list` (its memory); `-14-phone-first-screen`.
- **Kišib** (from `test/kishib-web.test.ts`, its web client): `kishib-nakisib-1-form` (Change keys with Nakišib, said what it protects and that it is optional); `-2-review`; `-3-request` (the request to write, the fingerprint, the answer to read); `-4-answer` (checked and sent); `-6-make-form` and `-7-make-review` (Make one with Nakišib, the commitment to compare).

## 2. How it is built

### The Module, through which path, and why

- **Nakišib's program** (`clients/nakisib/src/`, Rust) links `modules/airgap` and `core` as they stand, in a Cargo workspace of its own. The root workspace, its `Cargo.lock` and the shared WebAssembly are untouched. Each step calls the Module:
  - reading: `Message::decode_kind`, rule 3.6;
  - the paper: `Seed::restore`, then `Signer::review` with no choice made, which runs rules 3.1 to 3.5 and draws the fresh seed of rule 3.3;
  - the new paper: `Review::asked` and `Review::confirm_backup`;
  - signing: `Signer::sign`;
  - the memory: `Signer::to_bytes` with its seeds emptied, and `request_hash`;
  - a first paper: `Signer::new_seed`, `ask_places` and `export_commitment`.

  *Why not `mor-signer` bundled:* it keeps seeds on disk, and its face is a Terminal. *Why not WebAssembly:* a native program can overwrite what it held (the Module's `Seed` zeroes itself when dropped; Nakišib overwrites the words typed and shown, and every request and answer body). It needs nothing installed on the offline Mac, and it opens no network by construction (a test checks its dependencies).
- **Its page** (`src/page/`, TypeScript on the kit) is built into `built/` and carried inside the program (`include_bytes!`). It is served on 127.0.0.1 only. An operation is answered only when it is addressed to `127.0.0.1:PORT` and carries Nakišib's own header. The page's policy loads from its own origin only. On the Mac, files are chosen in the Mac's own dialogs (AppleScript, part of macOS).
- **Its window** (`window/main.swift`) is the app's own executable. It starts the program beside it, shows the page in a web view with a non-persistent store (no cache, cookies, history or form state on disk), refuses any other address, and ends the program when the window closes. Without Apple's command-line tools, `make-app.sh` makes the app open the page in the default browser, and says so plainly.
- **`scripts/make-app.sh`** builds `~/Applications/Nakisib.app` for Apple silicon (arm64), and beside it `Nakisib.zip` and `Nakisib.zip.sha256`. The README says, in plain steps, how to carry it and check its fingerprint.
- **Kišib's half** (`clients/kishib/airgap/`) is the Module's `online` code in Kišib's own WebAssembly. Kišib builds the change of keys exactly as it does today, as a rotation signed with a throwaway chain key: a *template*. From it, `online::pending` takes the fields and nothing else, as the Module's `online_side` example does for the step 17 rehearsal. Nakišib's answer is checked by `online::accept` (rule 3.9) before anything is sent. A commitment is read by the Module's strict decoding; the genesis is then made by Kišib's usual `makeGenesis`.

### What Nakišib keeps on disk, file by file

Its folder is `~/mor-nakisib` (or `--dir`), and it holds one file:

| File | What it holds | Secret? |
| --- | --- | --- |
| `memory.cbor` | The Module's device state (`Signer::to_bytes`), its list of seeds **always empty**. Per chain key (by its commitment): each change of keys it signed, the request it answered (`request_hash`), the signed rotation's bytes, whether it was homeless, and which of rule 8a's exceptions were used. Written only once a change is signed, before the signed rotation leaves. A file holding a seed is refused, not read. | No: commitments, request hashes and signed rotations (public once published). |

Nothing else is written there. A new identity's first paper writes nothing in the folder. The files written to the USB stick are the request's answer (the signed rotation) and the commitment. Both are public once used.

Kišib keeps nothing new: the request and the new signing key live in its memory while it waits for Nakišib's answer, as its sittings always do.

### What the checks found

- **Tests named in the brief, all run and green** (`clients/nakisib/test/`, against real homes and a relay, Kišib's program, Dub, and Nakišib's program):
  - `whole.test.ts`: a whole change of keys, with a dangerous part shown first, a wrong paper and a wrong word refused, signing on SIGN, Kišib checking and sending, the homes accepting, the new signing key's words; the same bytes asked again (without the paper, with it, from the memory); a different change of the same key refused; the next change from the new paper; the old paper refused, said plainly; a genesis from Nakišib's commitment read back at the homes, then its first change through Nakišib.
  - `tampered.test.ts`: new homes slipped into the request shown first; a next commitment slipped in ignored and said; Kišib refusing the answer to a request it did not write; a file that is not a request refused unread.
  - `screens.test.ts`: every screen by clicks.
  - Nothing secret on disk, checked after each of the above (Nakišib's folder read whole: no seed, no words, no chain key).
  - **No network** (`screens.test.ts`, under strace): the program's only socket listens on 127.0.0.1, and it made no connection; every request the page made went to its own address; nothing in its code or dependencies is a network client (`build.test.ts`).
  - `kishib-web.test.ts`: Kišib's two ways by clicks in its web client.
- **Nakišib's own Rust tests** (`cargo test`, 3): the whole sequence, with the Module's online side standing in for Kišib.
- **Kišib's existing tests**: 36 of 36 green. Two lines changed, listing its columns' parts (`test/browser.test.ts`). Its release: `npm run test:build`, the same bytes.
- **`modules/airgap`'s README:** lines that Nakišib makes untrue, left as they are (the brief):
  - "The library builds to WebAssembly without it … for the genesis client" and, in `src/online.rs`, "The genesis client (roadmap step 5) calls these through WebAssembly": nobody calls `online` through the shared WebAssembly. Kišib calls it through its own WebAssembly, for the ways with Nakišib.
  - "Decided while building, 1. … a command-line signer for an offline laptop now; the phone app with the genesis client": decided again on 23 October 2026. The offline device is an old Mac, Nakišib its app; transport by USB file, no QR this round ("QR would have been cool but apps on phones is a much closer environment").
  - The Module text (draft 6, section 1) still says "an old phone kept in flight mode, a laptop never connected": still true as a list of possible devices.
- **Not run here** (it needs a person or a Mac): the window clicked on a real Mac, the Mac's own file dialogs, Gatekeeper's first-open, the stick carried between two Macs. GitHub's macOS job builds the real app and checks it (section 5 has the steps for a person).
- **On GitHub, after the pull request was opened:** two failures were this round's, both fixed.
  - Kišib's program bundles its page with esbuild. The bundle reached the new loader of Kišib's own WebAssembly and failed wherever that WebAssembly was not built. The macOS seal job showed it; so would every app's tests that start Kišib's program. Kišib now imports it by a computed address (commit `fdc112f`), checked with the WebAssembly absent.
  - Nakišib's workflow did not install `clients/site`'s packages, which its typecheck reaches through Dub (`5b9ff78`), checked with only the workflow's packages present.
  - One test, run alone, depended on a file an earlier test wrote; it now makes its own.
- **Repeated runs:** one, on the seal job (macOS). It died before any test ran: the shared `clients/genesis/scripts/build-wasm.sh` found no `~/.cargo` on GitHub's machine, after passing on the same job's earlier run. Its re-run passed. Every check is green on the final head. Locally, one test of mine waited too briefly for Kišib's page after **Sign it**; it now waits for the page's answer.

## 3. For the MOR lead

**Nothing for the MOR lead** that changes a MIR, MICS, the freeze test suite, the core library or a verifier's verdict. One thing to know, for step 17:

- **Nakišib carries the Identity and Money MIRs' spec hashes as the test values** (`sitting::config`), as `mor-signer` and every client do until the freeze. The author's real genesis at step 17 is made on the frozen texts. So Nakišib must be rebuilt with the frozen hashes (and carried again, with its new fingerprint) before the rehearsal's real run, together with Kišib. Nothing else in it depends on the freeze.

## 4. Questions for Nobody, allegedly

*One at a time, each with my lean.*

**Question 1. Should the Module itself offer its summary before the paper?** Today, the summary Nakišib shows before you type your paper is Nakišib's own reading of the bytes. It uses the Module's own words and decoding, but the Module only checks everything once the paper is in (above SIGN, its own summary). A later draft of the Module (draft 7) could offer that first summary itself, without the key, and Nakišib's reading would go.
*My lean:* yes, in the Module's next draft. It is the Suite lead's text, but it is compiled into the shared WebAssembly, so it waits for a round that may touch it.

**Question 2. If Kišib is closed between writing the request and reading Nakišib's answer, should the answer still be sent?** Nakišib has then signed with your paper for that request alone, and it will sign no other change with it. But the new signing key Kišib made is gone. Today, Kišib sends the answer anyway (given both files) and says that key is lost. The next change, from the new paper Nakišib drew, gives you a key you hold.
*My lean:* keep it. It is the same cost Kišib already states when it is closed after sending.

**Question 3. Should Nakišib handle the two rare exceptions of rule 8a in this first version?** These are a second change after a homeless rotation was voided, and an escape after the homes refused a change. Today, Nakišib refuses them, said plainly, and points to the command-line `mor-signer`, which asks for them to be confirmed.
*My lean:* leave them to `mor-signer` for now ("keep it simple"), with collectives and the clean-device key.

**Question 4. For the rehearsal, should Nakišib's window be required?** Without Apple's command-line tools on the everyday Mac, Nakišib opens in Safari instead of its own window. Safari may keep what a page showed in its own files.
*My lean:* yes: install them (`xcode-select --install`) before making Nakišib for the offline Mac, and never carry the Safari version.

**Question 5. Is the NA₄ sign on the icon right?** The icon is a stone cylinder seal alone, carved once, down its side and mirrored: 𒎎 (NA4) above 𒈩 (MES, read kišib). The 𒈩 is the one traced for Kišib. The NA4 is my own drawing of its wedges (NI and UD side by side), not traced from a source.
*My lean:* check it against the ePSD or Borger, as for Ummia's name, and I or a later session redraw it if needed.

## 5. Human test steps, for two Macs

*Checked against `clients/nakisib/README.md` ("Using it") and `clients/kishib/README.md`. These become the step 17 rehearsal's steps, with test identities until then.*

### A. Prepare the offline Mac (once)

1. Take the old M1 Mac. While it may still reach Apple once: System Settings › General › Transfer or Reset › **Erase All Content and Settings** (or the recovery's Erase and reinstall).
2. Set it up with **no Apple Account**, **no Wi-Fi network joined**, Bluetooth off, location off.
3. From now on: Wi-Fi off and its network forgotten, Bluetooth off, no updates, nothing plugged in but power and the USB stick. *Look for:* the Wi-Fi icon in the menu bar crossed out.

### B. Make Nakišib on the everyday Mac, and carry it

1. In Terminal, from the MOR folder: `git pull`. Once: `xcode-select --install` (Apple's command-line tools, for Nakišib's window).
2. `cd clients/nakisib && sh scripts/make-app.sh`. *Look for:* "made Nakišib's window", then "made …/Nakisib.zip, its SHA-256:" and 64 characters.
3. **Write those 64 characters on paper by hand** (or photograph them with your phone). They must not travel on the stick.
4. Copy `~/Applications/Nakisib.zip` to the USB stick. Eject it.

### C. Check the fingerprint on the offline Mac, and open Nakišib

1. Plug in the stick. Copy `Nakisib.zip` into Documents.
2. Terminal (Applications › Utilities): type `shasum -a 256 ` with a space, drag `Nakisib.zip` onto the window, press Return.
3. **Compare every character with the paper.** One differs: delete the zip and go back to B.
4. Double-click the zip, move **Nakišib** to Applications. The first time: Control-click › **Open**, then **Open** (or System Settings › Privacy & Security › Open Anyway).
5. *Look for:* a window titled Nakišib (not Safari), the stone-grey seal icon in the Dock, the line **"This Mac should never connect again."** under the top, three tiles, and "Offline · keeps nothing secret" top right.

### D. A test identity made with Nakišib's commitment

1. **Nakišib:** **A new identity** › **Draw a paper of 24 words**. Write the 24 words on paper. **I have written it down**; type the three asked. A wrong one is refused: try one. *Look for:* the commitment shown in groups of four.
2. **Choose where to write the commitment…**: the Mac's dialog. Save it on the stick (`nakisib-commitment.mor`). Eject.
3. **Everyday Mac, Kišib** (rebuilt: `cd clients/kishib && npm run airgap`, then open Kišib): Identities › **Make one with Nakišib**. Choose the commitment file; give the homes and relays as for any identity (test homes only); **Read it back**. *Look for:* the same commitment as Nakišib's screen; the box saying what the offline way protects and that it is optional.
4. **Sign it.** Once its homes take it, **Show its signing key's words**: write them down, type three back. Bring the identity into Dub with its ID and these words, and post once.

### E. A change of keys through Nakišib

1. **Kišib:** Paper › **Change keys with Nakišib**. The identity from D, one of its homes; **Read it back**. *Look for:* its lines of acts, the vault, "No paper is typed here".
2. **Sign it**, then **Write the request for Nakišib** (save it on the stick). *Look for:* the new signing key's fingerprint.
3. **Nakišib:** **Change keys** › **Choose the file…**. *Look for:* "CONSEQUENTIAL — READ BEFORE SIGNING", the new signing key's fingerprint **the same as Kišib's**; Kišib's own words apart, "NOT checked".
4. Type the paper from D (try a wrong word first: refused, plainly). **Use this paper**.
5. **Show the new paper**: write the 24 new words. **I have written it down**; type the three asked (one wrong first: refused, nothing signed).
6. Read the Module's summary above the box (*look for* "FRESH SEED"), type **SIGN**, **Sign**. Then **Choose where to write it…**: the stick.
7. **Kišib:** **Read Nakišib's answer**, choose the file. *Look for:* "exactly the change Kišib asked for", "It counts" once the homes take it, then **Show the new signing key's words**. Write, type three back. Give them to Dub.
8. **Nakišib:** **What it signed**. *Look for:* one line, this identity at position 1. Read the request again: "signed this same request before"; **Answer it again** gives the same bytes.
9. Again, from step 1 (the second change): give Nakišib the **first** paper. *Look for:* refused, "it may be an earlier, spent one". Then the paper from step 5: it works.
10. **Quit Nakišib**, or close its window. *Look for* in Finder, Go › Home, `mor-nakisib`: one file, `memory.cbor`, and nothing else.

### What to look for throughout

- Nakišib never asks for a network, and the Wi-Fi stays off.
- Nothing is signed before three parts of the new paper match.
- Kišib refuses any file that is not Nakišib's answer to its own request.
- Words never show in Nakišib's window again once hidden.
- Closing the window ends Nakišib.
