# Nakišib (mor-nakisib)

**Nakišib** (𒎎𒈩, "stone seal"; *na₄* is a silent determinative in the texts, so the reading is built, not attested: chosen by Nobody, allegedly, knowing it): **Kišib's offline companion**, for a Mac that never connects again. It gives the air-gapped chain-key signer Module (`modules/module-airgap-chain-key-signer-draft-6.md`, its code `modules/airgap`) a face. Decided by Nobody, allegedly, on 23 October 2026: "an offline companion to kišib is the right approach, since the rotation begins online." Built in the Nakišib round (`docs/nakisib-report.md`, F394).

**Test identities only, until the step 17 rehearsal.** Written "Nakisib" in file and folder names. **Optional**: Kišib keeps everything it does; Nakišib is an extra layer of safety for whoever wants it ("Kišib can still do all it does, for user who wish for an extra layer of safety there is now a compagnon app").

## In plain words

An identity's **chain key** is the key that changes its other keys: it lives on paper (24 words), and is typed only when the keys change. Typed into Kišib, it passes through a computer that goes online. Typed into Nakišib, it never does: **Nakišib runs on an old Mac that is wiped once and never connected again**. Files travel between the two Macs on a USB stick.

**A change of keys, step by step:**

1. **On the everyday Mac, in Kišib:** Paper › **Change keys with Nakišib**. Kišib reads the identity, every line of its acts, the cards and the vault, and reads it all back, as for any change of keys; it asks no paper. Confirmed, it makes the new signing key and **writes the request for Nakišib** to a file you choose (on the USB stick). It shows the new signing key's fingerprint.
2. **On the offline Mac, in Nakišib:** **Change keys** › choose the file. Nakišib **believes none of it**: it reads the exact bytes itself and shows what they say, **the dangerous parts first, in capitals** (new homes, a new vault, a successor, closing a home, giving up old acts), the new signing key's fingerprint among them (compare it with Kišib's). Kišib's own words are shown apart, marked as not checked.
3. **Your paper:** type its 24 words, the only form Dubsar apps take (H104, decided: "Chain key, only words in dubsar apps"; the hex paper is no longer taken nor drawn). The Module checks everything again with it. A wrong paper, or an earlier one already spent, is refused, said plainly.
4. **The new paper:** Nakišib draws a fresh one (every change of keys makes a new chain-key paper), shows its words, hides them, and asks three back. A wrong word is refused; nothing is signed before they match.
5. **Type SIGN.** Above the box, the Module's own summary of the exact bytes it signs. Nakišib signs, writes its memory, and **forgets both papers' words**.
6. **Write the signed rotation** to the USB stick (choose where).
7. **Back in Kišib:** **Read Nakišib's answer**. Kišib checks it is exactly the change it asked for (anything else is refused, said plainly, and nothing is sent), sends it to every home, and, once the homes accept it, shows the new signing key's words, as at any change of keys. "Send it again" sends the same bytes.

**A new identity** (the step 17 rehearsal): in Nakišib, **A new identity** draws its first paper (shown, hidden, three asked back) and writes only its **commitment** to the stick; in Kišib, Identities › **Make one with Nakišib** reads that file and makes the identity from it (its homes, its relays, its signing key), showing the same commitment to compare.

**One's own identity only** (round 8, decided: its first version is one's own identity only). A collective is not made or rotated with Nakišib. MOR now makes a collective with no signing key, its first act signed by a chain key dealt to its members; the Module can do that on an offline machine (`mor-signer deal-genesis … --plan FILE`), but Nakišib does not offer it this round. Collectives are rotated in Kišib, from their members' papers.

**What it keeps.** Nothing secret: a paper's words are typed for one use and overwritten once used (or after fifteen minutes without a step). It keeps only **its memory of what it signed** (the Module's rule 3.4: per chain key, each change it signed and its signed bytes), so it **never signs two different changes for one key**, and gives the same bytes when asked again (from **What it signed**, without the paper). **A stolen offline Mac gives nothing.**

**No network.** Nakišib opens no connection, ever: not to a home, a relay, a font or an update. Its page is served by its own program on 127.0.0.1 (this Mac alone) and shown in Nakišib's own window, which keeps nothing on disk. Its first screen says: **"This Mac should never connect again."**

**Round 9 (F411): words only.** The signing key as a string (`modules/module-signing-key-string-draft-1.md`) is offered by the TypeScript apps (Dub, Damgar, Ummia, Edubba, Kišib); Nakišib, Rust and offline, still writes and reads the signing key as 24 words this round. The words and the string are the same key, so a key Nakišib wrote can be brought into any app as its words, and the app shows its string on request.

## Precisely

| File | What |
| --- | --- |
| `src/sitting.rs` | The steps, each through the Module's own code: `read` (the Module's strict decoding of the pending rotation, rule 3.6; Nakišib's reading of the bytes before the paper with the Module's own `summary::describe`, rule 3.1; the memory looked up by the Module's `request_hash`, rule 3.4), `paper` (`Seed::restore`, then `Signer::review` with no choice: the Module's checks, its fresh seed, its own next commitment, its summary), `show`, `hide`, `typed` (`Review::asked`, `Review::confirm_backup`, rule 3.3), `sign` (`Signer::sign`; the memory written before anything leaves), `write`, `same_again` and `write_again` (the same signed bytes, rule 3.4), `first` (`Signer::new_seed`, `ask_places`, `export_commitment`, message 2.1), `memory`, `forget`. Words typed and shown are overwritten (`scrub`); every seed overwrites itself when dropped (the Module's `Seed`). Its own tests run the whole sequence with the Module's online side. |
| `src/main.rs`, `src/http.rs` | The program: its page carried inside it (`built/`), served on **127.0.0.1** only, port 8475 (a second start finds it taken and shows the page again); an operation answered only when addressed to `127.0.0.1:PORT` and carrying Nakišib's header (`x-nakisib`), which another origin cannot send without asking first, never answered; every body overwritten once used; the page's policy loads from its own origin only. The Mac's own file dialogs by AppleScript (`osascript`, part of macOS); elsewhere a path typed. |
| `src/page/` | The page on the suite's kit (`clients/kit`), its colour **stone** (`STONE`): `view.ts` (the first screen and its three tiles, Change keys, A new identity, What it signed; the steps; the Module's summary, its consequential lines first under "CONSEQUENTIAL — READ BEFORE SIGNING"; the papers shown and asked back; SIGN), `app.ts` (clicks and forms; fields holding words emptied as soon as sent; no browser storage at all). |
| `window/main.swift` | Nakišib's window and the app's own program: starts `nakisib-program` beside it, shows its page in a web view with a **non-persistent store** (no cache, cookies, history or form state saved), goes nowhere but that address, and ends the program when the window closes. |
| `scripts/build.ts`, `built/` | The page built (`npm run build`), reproducible, not minified; the program carries `built/` (`include_bytes!`). **No web client, ever.** |
| `scripts/make-app.sh` | On the everyday Mac: `~/Applications/Nakisib.app` (shown as Nakišib) for Apple silicon (arm64), its window built where Apple's command-line tools are present, and beside it `Nakisib.zip` and `Nakisib.zip.sha256`. |
| `static/icon/` | The icon: a stone cylinder seal alone, its name carved once down it, mirrored, 𒎎𒈩 (NA4 above MES, read na₄ kišib), in the family's style and Nakišib's stone (`nakisib.svg`; values in the drawing's own comment), made into `nakisib.png` and `nakisib.icns` by `clients/dub/scripts/make-icons.ts`. *The NA4 sign is the session's own drawing of its wedges, to confirm against the ePSD or Borger.* |

**Its folder** (`~/mor-nakisib`, or `--dir`) holds **`memory.cbor` alone**: the Module's device state (`Signer::to_bytes`) with its list of seeds always empty, so only its memory: per chain key (by its commitment, not secret), each request answered, its signed rotation (public once published) and whether it was homeless. Nothing is written there before a first change of keys is signed; a new identity's first paper writes nothing there. A memory file holding a seed is refused, not read.

**The Module, as it stands.** Nakišib changes nothing in `modules/airgap`: it calls it as a Rust library (compiled into Nakišib's own program, its own Cargo workspace, nothing in the suite's shared WebAssembly). The spec hashes are the test values until the freeze (`sitting::config`, as `mor-signer`). What it leaves to `mor-signer` in this first version (decided: "Yes, keep it simple"): the two exceptions of rule 8a (refused here, said plainly), collectives' shares (section 5), clean-device mode (section 4), QR codes.

**Round 8 (F407): the Module moved, Nakišib did not need to.** `modules/airgap` (S7h-2) now deals a collective's keyless genesis (`device::deal_genesis` with a genesis plan; `mor-signer deal-genesis K OUTDIR HOLDER... --plan FILE`, writing `OUTDIR/genesis.mor`) and enforces Identity rotation check 4 (a keyless identity's rotation carries no signing key and keeps no tip; a keyed one's must carry a key). Nakišib signs only changes of one's own identity, which always carry a signing key, so its program is unchanged; its tests build the rotation's `signing_key` as `Some(...)`, the field now being optional (`src/sitting.rs`, the test helper `rotation`). **Not offered this round** (decided: its first version is one's own identity only): the collective's keyless genesis, `deal-genesis … --plan FILE`. Kišib writes a request for Nakišib only for one's own identity.

## Readings

*Where the brief and the Module leave a choice, Nakišib takes these readings; to be confirmed by Nobody, allegedly.*

1. **The summary before the paper.** The Module's review needs the chain key before it can summarise (`Signer::review` finds the key first). Nakišib shows **its own reading of the request's bytes** before the paper, built with the Module's `summary::describe` from the Module's strict decoding, and once the paper is typed, the **Module's own review** checks everything again; its summary is the one above SIGN. A later Module draft could offer the summary without the key, and this reading would go.
2. **A first paper**: the words seed Module, words only (H104), under scheme 3 (SLH-DSA-SHA2-128f), as Kišib and Dub make an identity's chain key.
3. **The same request again**, from the request or from What it signed: the same bytes without the paper (rule 3.4: "whatever the user chooses this time"). With the paper typed, the Module answers the same.
4. **Words held at most fifteen minutes** without a step, as Kišib's reviews; Forget and Quit drop them at once.
5. **Nakišib's window ends Nakišib**: closing it ends the program, so nothing is held after the window is gone.

## Costs, stated

- **What software cannot forget.** Words are overwritten in Nakišib's program; a copy the system made elsewhere (memory swapped to disk, encrypted on Apple silicon; the web view's own process) is out of reach. The offline Mac is wiped first and never connected: that is the protection.
- **Without Nakišib's window** (Apple's command-line tools missing on the everyday Mac), the page opens in Safari, which may keep what a page shows in its own files: make-app.sh says so; build the window before carrying Nakišib.
- **A memory per Mac** (the Module's rule 3.4, its cost stated there): a second offline Mac, or this one wiped, starts with no memory.
- **The USB stick** carries files only; Nakišib reads nothing but the Module's messages, refuses anything else unread, and runs nothing it reads.

## Tests

```
cargo test --manifest-path Cargo.toml        # the sequence through the Module (its own tests)
cd ../kishib && npm install && npm run wasm   # the shared WebAssembly and Kišib's own
npm install && npm test                       # strace and Chromium needed (MOR_CHROMIUM)
MOR_SCREENSHOTS=DIR npm test                  # also keeps a picture of every screen
```

- `test/whole.test.ts`: **a whole change of keys** for an identity made in Dub: Kišib writes the request; Nakišib reads it, shows its own summary (the new signing key first, the same fingerprint as Kišib's), refuses a wrong paper, takes the paper, draws the fresh one, refuses a wrong word typed back, signs on SIGN, writes the answer; Kišib refuses a file that is not the answer, checks it and sends it; the homes accept; the new signing key's words; **the same bytes again** (without the paper, with it, and from the memory); the **next change from the new paper**; **the old paper refused**, said plainly; Kišib's own way says the old paper spent and the newest right. **A different change of the same key refused**, as the Module says; Kišib refusing Nakišib's answer to a request it did not write; **Kišib closed** between the request and the answer, the answer sent from both files, the lost signing key said. **A genesis**: Nakišib's commitment, Kišib's identity made from it, read back at the homes, then its first change through Nakišib. **After each, Nakišib's folder read whole**: its memory alone, no seed, words or chain key.
- `test/tampered.test.ts`: **a tampered request**: new homes slipped into Kišib's bytes, its words left as they were: Nakišib's summary shows the homes first, Kišib's words say nothing of them; **a next commitment slipped in**, ignored and said, by Nakišib's reading and by the Module's review; Kišib refusing the answer to the tampered request (rule 3.9), nothing sent; a file that is not a request refused unread.
- `test/screens.test.ts` (headless Chromium, by clicks): **every screen**, the first one saying "This Mac should never connect again."; a wrong paper and a wrong word refused; nothing secret on disk; Quit. **No network**: Nakišib run under strace: its only socket is the one listening on 127.0.0.1, no connection made; every request the page made went to its own address.
- `test/kishib-web.test.ts` (headless Chromium): **Kišib's half by clicks** in its web client: Change keys with Nakišib and Make one with Nakišib, Kišib's own WebAssembly fetched beside its page, nothing refused by its policy.
- `test/build.test.ts`: `built/` is what the sources give, twice the same; the page names no address; no network client in Nakišib's code or its dependencies; no web client.
- On GitHub (`.github/workflows/nakisib.yml`): all of the above on Linux; on macOS (Apple silicon), the app made by `make-app.sh`, its window compiled, its zip's fingerprint checked, the zip unpacked elsewhere and its program answering on 127.0.0.1 alone.

## Using it

### On the everyday Mac: make it

1. Once, in Terminal, from the MOR folder: `git pull`, then `cd clients/nakisib && sh scripts/make-app.sh`. (Rust is needed, as for Kišib's WebAssembly; Apple's command-line tools for its window: `xcode-select --install`, once.)
2. It ends by printing **Nakisib.zip's SHA-256**, 64 characters. **Write it on paper by hand** (or photograph it with your phone): the fingerprint must reach the offline Mac by another road than the stick, or it proves nothing.
3. Copy `~/Applications/Nakisib.zip` to the USB stick (Finder: Go › Home, Applications).

### The offline Mac: prepared once

1. **Wipe it**, while it is still allowed to reach Apple once (System Settings › General › Transfer or Reset › Erase All Content and Settings; or the recovery's Erase and reinstall). Set it up with **no Apple Account**, no Wi-Fi network joined, no Bluetooth, location services off.
2. From then on, **never connect it again**: Wi-Fi off (and its network forgotten), Bluetooth off, nothing plugged in but the USB stick and power. No updates.

### Carrying Nakišib, and checking its fingerprint

1. Plug the stick into the offline Mac. In Finder, copy `Nakisib.zip` into the offline Mac's own folder (Applications, or Documents).
2. Open **Terminal** (Applications › Utilities) and type: `shasum -a 256 ` (with a space), drag the copied `Nakisib.zip` onto the Terminal window, press Return.
3. **Compare the 64 characters with the ones written on paper**, every one. If one differs, delete the zip and start again from the everyday Mac: do not open it.
4. Double-click the zip: **Nakišib** appears beside it. Move it into Applications.
5. **The first time, macOS refuses an app that is not signed**: Control-click (or right-click) **Nakišib**, choose **Open**, then **Open** again in the dialog (on newer macOS: System Settings › Privacy & Security, "Open Anyway"). After that, it opens with a double-click.
6. Its first screen says "This Mac should never connect again." Its folder is `~/mor-nakisib` (its memory, nothing secret).

### A change of keys, and a new identity

As in "In plain words" above. Unplug the stick from one Mac before plugging it into the other; keep papers away from both screens' cameras.
