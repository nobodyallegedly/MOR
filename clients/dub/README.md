# Dub (mor-dub)

**Dub** (𒁾, "tablet"; called MOR Post until 13 October 2026): the barebone client as an app on the Mac, for one person alone. Write a text, add a picture if you like, press Post, and see what was published, read back from the relays and verified. Roadmap step 9b ("Let's think about others too a bit here", Nobody, allegedly). The same page also runs on its own in a browser, as **Dub's web client**, for testing only (F281), to be served at `dub.dubsar.org`: see "The web client" below.

**Test identities only, until MOR is frozen.** Every key is held in software in the program's folder.

## In plain words

A small program runs on your Mac and holds one identity. You use it from a page in your browser, on that Mac only. Double-click **Dub** and the page opens, already paired with the program; nothing is typed in a terminal.

The first time, it offers two doors:

- **Make a new identity.** You give a home address (where anyone can check the identity) and, if you like, relays (where your posts go; the home if you leave it empty). The app makes the identity and shows you 24 words, once. Write them down on paper. They are the identity's signing key: whoever holds them can post as you, and you can type them into another app to post from there too. Before anything is published, the app asks you to type three of them back. The identity's chain key, which changes the signing key if it is ever stolen, is kept in the app's folder, as the genesis client keeps it for test identities.
- **Bring an identity you have.** You give its ID, its 24 words and one address where it is found. The app reads the identity from its homes, checks that the words give its current signing key, and refuses otherwise. It asks for relays only if the identity names none. The chain key never comes here: it stays on the device that holds it.

Then one window: **Write**, a picture if you want one, **Post**. The post appears under **Published**, exactly as the barebone client's reader shows it, with "verified" when its signer's identity chain counts it. Below, **Your posts, newest first**, from every app that posts as this identity. Under each picture of yours, **Withdraw this picture**: readers stop showing it, and the post stands.

Every picture is stripped before it leaves (the JPEG Module): no location, no camera data, no preview. The app says what it took out.

**One identity, several apps.** Each app that posts as one identity keeps its own line of acts, and all of them are valid. But if the signing key is ever changed (with the chain key), the change must name every app's line, or the posts of a line it leaves out become void (Identity rule 35, was 17). The client that changes the key (the genesis client, a collective's) reads every line from the homes and relays and keeps them all, this app's included, unless the owner leaves one out after a warning. The card **This identity** shows this app's line (its latest act, position and summary): what that client reads it by, and what to give it if it cannot read it. If the key was changed elsewhere, this app says so and signs nothing more.

Not here, on purpose: no inbox, no drafts, no Claude connector, no agreements, no payments.

## Precisely

| File | What |
| --- | --- |
| `src/dub.ts` | What the app does, on the Mac and in the web client alike (a `Keep` says where it keeps things): `begin` (an identity made with the genesis client's `TestIdentity.create`, its signing seed's words, three positions), `confirm` (three words typed back, then the genesis to the homes and routes naming the relays), `bring` (the carry Module, section 4: the chain read with the genesis client's `lookUp`, the words' public key checked against the current signing key), `post`, `posts`, `show` and `withdraw` (the barebone client's `post`, `readPost`, `listPosts`, `withdraw` and `renderPost`), and a look-up before every act signed. |
| `src/store.ts` | The program's folder (default `~/mor-dub`, or `~/mor-poster` from before the rename, owner-only): `identity.json` (the genesis client's format), `settings.json`, `pending.json` (a new identity until three words are typed back), `access.json`, `run.json`. |
| `src/server.ts` | The program: the desk's server (`../desk/src/local.ts`): `127.0.0.1` only, the page built at start, not minified, under a content security policy, requests signed by a paired browser with Dub's own domain line, `MOR post, version 1`. |
| `src/cli.ts` | `open` (start the program if needed, open the page with a one-time pairing link: the desk's `../desk/src/launch.ts`), `run`, `stop`; `words --file FILE`, which prints a genesis-client test identity's ID and words, to bring it in; and `check URL`, which compares the web client a server serves with the release in `built/`. Port 8472. |
| `src/version.ts` | The program's version (the desk's fingerprint), so the app restarts a program left running from older code. |
| `src/page/` | The page: `ui.ts` its screens, clicks and forms, shared with the web client; `view.ts` its HTML; `app.ts` its start on the Mac, whose requests are signed by the desk's page client (`../desk/src/page/api.ts`, `keystore.ts`). |
| `src/chainwords.ts` | The web client's chain key: a 256-bit seed written as the words seed Module's 24 words, and the chain key derived from it exactly as the air-gapped chain key Module derives key 0 (scheme 3). |
| `src/web/` | The web client: `app.ts` (Dub's code run in the browser), `keep.ts` (IndexedDB), `headers.ts` (its content security policy), `released.ts` (its files), and two shims the build puts in place of `node:crypto` and `node:fs` for the two shared files that import them. |
| `scripts/build-web.ts`, `static/web.html`, `built/` | The web client's build (`npm run build` into `dist-web/`; `npm run release` into `built/`, with `BUILT-WITH.txt`: the tools, and each file's work hash and SHA-256). |
| `scripts/make-app.sh` | Makes `~/Applications/Dub.app` on macOS, which runs `open`, and removes the `MOR Post.app` an earlier run made. |

The words are the identity carry Module's (`modules/module-identity-carry-words-draft-1.md`, code in `modules/carry/` and `modules/airgap/src/carry.rs`).

The program's pairing domain line is still `MOR post, version 1`: changing it would unpair every browser already paired with an install.

The program's pairing domain line is still `MOR post, version 1`: changing it would unpair every browser already paired with an install.

Shared, not copied: the desk's server and launcher were moved into `clients/desk/src/local.ts` and `launch.ts`, its fingerprint into `fingerprint()` in `version.ts`, and its page client takes another program's domain line. The desk's own behaviour and tests are unchanged.

## Moving from MOR Post

Dub was MOR Post, in `clients/poster`, until 13 October 2026. On a Mac that has it:

1. In Terminal, from the MOR folder: `git pull`, then `cd clients/dub && npm install && sh scripts/make-app.sh`. This makes **Dub** in `~/Applications` and removes **MOR Post**, whose code is no longer where it pointed (double-clicking it after the pull would do nothing).
2. Nothing else: Dub keeps using `~/mor-poster`, its identity and its paired browsers, for as long as `~/mor-dub` does not exist. To give the folder the new name, quit Dub (`node --import tsx src/cli.ts stop`) and `mv ~/mor-poster ~/mor-dub`.

## Readings

Where the texts are silent, Dub takes these readings. *To be confirmed by Nobody, allegedly.*

1. **A program on the Mac, a page in the browser,** paired without typing, as the desk and the collective client.
2. **A new identity is the genesis client's,** with its chain key (SLH-DSA, scheme 3, as the desk makes them) held in `identity.json` in software, labelled a prototype. Its routes name the relays as its outbox only: the app has no inbox, and publishes no encryption key.
3. **The words are shown once,** in the answer to Make it, and never again; a reload asks for the three words. Starting again forgets the identity, never published.
4. **Three positions, drawn at random,** different, in order. Nothing is published before all three are right.
5. **An identity brought here publishes no routes, names or encryption key:** those are versioned, and a second writer would fork them (the carry Module, 4.4). It uses the relays its routes name, and asks for relays only where they name none.
6. **Before each act it signs, the app looks the identity up** at its homes and refuses if the signing key it holds is no longer the current one (the carry Module, 4.5). *Cost:* one look-up per post.
7. **The list shows every line's posts** at the identity's relays, in the order the relays received them, newest first, up to twenty.
8. **A picture can be withdrawn from here only if this identity published it,** from any line.

## Signing and notarising (an open choice for Nobody, allegedly)

`scripts/make-app.sh` makes the app on the Mac it runs on. It is not signed or notarised; macOS opens it without a warning there, since it was not downloaded. It also needs this repository, Node 22 and the core library's WebAssembly on that Mac: it runs the code where it is.

For other people's Macs, two things would be needed:

1. **A self-contained app:** Node, the code and the WebAssembly inside the app, built by a script, so nothing else is installed. Not built.
2. **Signing and notarising,** so macOS opens it without "cannot be opened because the developer cannot be verified": an Apple developer account (the Apple Developer Program, a yearly fee, in a person's or an organisation's name), a "Developer ID Application" certificate, signing with `codesign` under the hardened runtime, sending it to Apple with `xcrun notarytool submit`, and stapling the ticket with `xcrun stapler staple`. Without it, others must right-click the app and choose Open, or allow it in System Settings, Privacy & Security.

Whose name the account is in is the choice: it is shown to everyone who opens the app.

## Tests

```
cd ../genesis && npm install && npm run wasm && cd ../desk && npm install && cd ../dub
npm install
npm test            # real homes and a relay from target/debug/mor-relay (built if needed); Chromium at /opt/pw-browsers or MOR_CHROMIUM
npm run test:build  # the web client built here is the release in built/ (needs the tools BUILT-WITH.txt names)
```

- `test/dub.test.ts`, against three homes and a relay on local ports and the app's program, through a client signing exactly as the page does:
  - the first screen's words, "Test identities only, until MOR is frozen";
  - **a new identity** refuses to go on until three words are typed back (two words, a wrong word: refused, no genesis at any home); then the genesis at each home, the words the identity's signing key, the folder and the identity file owner-only;
  - **a post without a picture and one with a phone photo,** published to the relay and read back verified by the barebone reader in this process; the picture **stripped** (it carried a location, a preview and camera data; the reader finds nothing left), upright; the list newest first;
  - **a withdrawal:** the picture no longer shown, the post standing; someone else's picture cannot be withdrawn;
  - **an identity made by the genesis client, brought in by its words,** its ID typed in groups of four, the current signing key checked; **a wrong set refused** (another identity's words, a changed word, a word off the list, twelve words, a short ID), nothing kept; no chain key held;
  - **two apps posting as one identity keep separate lines, both valid** (the genesis client's line goes on at positions 2 and 3, Dub's starts at 1), and a second Dub makes a third line, also valid;
  - **rule 17 (now 35), shown:** the genesis client reads the three lines (its own and two copies of Dub), the one it reads for this app the same as this app's card, and rotates keeping all of them: every post stays valid, and Dub refuses to sign with the spent key (before that build, MOR Post's posts became void);
  - **requests from an unpaired browser refused,** as are a key signing with another program's domain line, an unsigned request, and a pairing code asked without the owner's secret; the page under its content security policy;
  - **nothing listens beyond 127.0.0.1:** the program's address, no answer at the machine's other addresses, another host name refused.
- `test/browser.test.ts`: the same in headless Chromium on a fresh profile, by clicks and typing alone: the two doors, the words shown and not shown again after a reload, a wrong word refused, the identity born, a post, a picture (what was taken out said), the list, a withdrawal, this app's line counted on the card, no console error. `MOR_SCREENSHOTS=DIR` keeps a picture of each step.
- `test/browser.test.ts` also brings an identity in **by clicks**: the bring form never submitted from the page before 13 October 2026 (its field named `id` hid the form's own id from the script), which the earlier tests, bringing through the program's API, did not see.
- `test/launcher.test.ts`: `mor-dub open`, as the app runs it, starts the program and prints a pairing link; opened again, the same program stays; `stop` stops it.
- `test/web.test.ts`, `test/chainwords.test.ts`, `test/web-build.test.ts`, `test/build/`: the web client (below).

## Using it (a human test, on the author's Mac)

*The build window cannot reach the deployed homes, and keeps no keys.*

1. Once, in Terminal, from the MOR folder:
   ```
   git fetch origin && git checkout main && git pull
   cd clients/genesis && npm install && npm run wasm
   cd ../desk && npm install
   cd ../dub && npm install && sh scripts/make-app.sh
   ```
2. Double-click **Dub** in `~/Applications`. The page opens, paired.
3. **Make a new identity:** the home addresses you use for test identities (as in MOR Identities' Settings), one per line; relays the same, or empty. Write the 24 words on paper, type back the three asked, Go on.
4. Write a text, add a photo from your phone (one with a location), Post. Check: "verified", and the line saying the location was taken out. Post a text alone. Withdraw the picture.
5. **Bring it into a second copy** (to try the second door): in Terminal, from `clients/dub`, `node --import tsx src/cli.ts open --dir ~/mor-dub-2 --port 8473`. In the page that opens, **Bring an identity you have**: the ID (Copy ID on the first copy's card), the words from your paper, one of its home addresses. Post from it, and see both copies' posts listed in each, all verified.
6. To bring a test identity made earlier with the genesis client, print its words with `node --import tsx src/cli.ts words --file ~/mor-test/a.json` (only for test identities; the words are its signing key).

## The web client (F281: "With risks stated, for testing purpose only")

*Decided by Nobody, allegedly, 13 October 2026; to be served at `dub.dubsar.org`.*

### In plain words

The same Dub page, but nothing to install: it is served as a few files, and everything runs in the visitor's browser. It makes an identity, posts, shows and withdraws, as Dub on the Mac does, checking every post with the core library compiled to WebAssembly. Every page carries a banner: **for testing only**, and two risks in plain words. Whoever serves the page's code at the moment an identity is made could copy its keys. And the browser's storage, where the signing key is kept, can be lost, or read by what runs in the page.

When it makes an identity, it shows 24 words once: the identity's **chain key**, the one that can change the signing key if it is stolen or lost. You write them on paper and type three back. The page then forgets them: they are never in the browser's storage, and a test reads that storage to check. They are the chain-key seed words Module's backup, so the air-gapped chain key Module restores the chain key from them.

The **signing key** stays in the browser, as it is: not locked, because the only lock the page could use is one it could open by itself. The way out is **Show the carry words**: the ID and 24 words of the identity carry Module, which bring the identity into Dub on the Mac, or another device. Each place keeps its own line of acts.

### Precisely

- **A new identity** (`Dub.begin` with `web`): a 256-bit seed from the browser's secure random source; its 24 words (BIP-39 encoding, the words seed Module); the chain key derived as the Module derives key 0 under scheme 3 (`chainwords.ts`, checked on the Module's published vectors); the genesis committing it, made by the genesis client's `TestIdentity.create`. The identity file never holds the chain key (`safety` empty). Until three words are typed back, the seed is held in the page's memory only (`keep.ts`): a reload forgets the new identity, never published. After, the seed is dropped.
- **Kept** in IndexedDB, database `dub`: the identity in the genesis client's format, with its signing key, and the settings. `WebKeep.saveIdentity` refuses a file holding a chain key. Every signing step runs under a Web Lock, so two tabs never sign at one position.
- **Bring an identity** by its ID and carry words, as on the Mac. No "other way to reach an address" (a browser has none); an onion home cannot be reached from a browser.
- **The banner** is in the page's HTML itself (`static/web.html`, written by the build from `WEB_BANNER`), outside what the script draws, so it shows even when the script does not run.
- **Suggested addresses**: a `dub.json` beside the page, `{"homes": [...], "relays": [...]}`, https only, fills in the form; it is optional and trusted for nothing else.
- **The build** (`scripts/build-web.ts`): the shared client code with the reader's browser core library in place of the Node one (`../reader/src/web/core.ts`), every package from this folder's `node_modules`, not minified, reproducible; anything from Node fails the build except `node:crypto` (for `identity.ts`'s sealing and the carry Module's checksum) and `node:fs` (for `identity.ts`'s file `load`/`save`, never called here), each replaced by a shim for those files only.
- **The release**: `built/` (`index.html`, `dub.js`, `dub.css`, `mor_wasm_bg.wasm`, the same WebAssembly as the display client's release), and `BUILT-WITH.txt` with the tools and each file's work hash and SHA-256. Built on GitHub by `.github/workflows/release-dub-web.yml` (a push to main with `[release dub web]`, or by hand), as the display client is. `mor-dub check URL` compares a server with it, byte for byte. *Signed:* the release is signed with the repository's releases at step 17, as the display client's.

### Tests

- `test/web.test.ts`, headless Chromium, a fresh profile, the built page served with its headers, real homes and a relay: the banner and both risks on every screen; **a new identity**, its chain-key words shown once; **nothing of the chain key in the browser's storage** (IndexedDB, local and session storage, caches, cookies, each read whole), before the words are typed back and after, nor on the page; the genesis committing the key the words give; a wrong word refused; **a post; a reload; a second post following the first in the same line**; **the carry words**, which are the signing key, not the chain key; **brought into Dub on the Mac**, which starts its own line (position 1) while the web client's goes on from its own last act; every post valid, both lines listed in each; forgetting it leaves no key in storage; no console error, nothing refused by the content security policy. And an identity made by Dub on the Mac brought into the web client, wrong words refused first.
- `test/chainwords.test.ts`: the words and derived keys equal the words seed Module's vectors (made by the Rust implementation).
- `test/web-build.test.ts`: `built/` complete, its fingerprints listed, the banner in the page, the WebAssembly the display client's; built twice in two folders, the same bytes; `mor-dub check` saying SAME, and catching an altered `dub.js`. `test/build/` (`npm run test:build`): built here, the same as `built/`.

### Putting it behind Caddy (a later machine session; not done here)

1. Build the release on GitHub (or `npm run release` with the tools `BUILT-WITH.txt` names), and copy `built/index.html`, `dub.js`, `dub.css`, `mor_wasm_bg.wasm` to `/srv/dub` on the server. Optionally a `dub.json` naming the test homes and relays.
2. DNS: `dub.dubsar.org`, A and AAAA, to the server (the author's to add).
3. Caddy, then `sudo systemctl reload caddy`:
   ```
   dub.dubsar.org {
       root * /srv/dub
       file_server
       header {
           Content-Security-Policy "default-src 'none'; script-src 'self' 'wasm-unsafe-eval'; style-src 'self'; img-src 'self' data:; connect-src 'self' https:; base-uri 'none'; form-action 'none'; frame-ancestors 'none'"
           X-Content-Type-Options nosniff
           Referrer-Policy no-referrer
           Strict-Transport-Security "max-age=31536000"
           Cache-Control no-cache
       }
   }
   ```
4. From another machine: `node --import tsx src/cli.ts check https://dub.dubsar.org/` in `clients/dub` says SAME.
