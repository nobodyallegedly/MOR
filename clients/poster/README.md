# MOR Post (mor-poster)

**MOR Post**: the barebone client as an app on the Mac, for one person alone. Write a text, add a picture if you like, press Post, and see what was published, read back from the relays and verified. Roadmap step 9b ("Let's think about others too a bit here", Nobody, allegedly).

**Test identities only, until MOR is frozen.** Every key is held in software in the program's folder.

## In plain words

A small program runs on your Mac and holds one identity. You use it from a page in your browser, on that Mac only. Double-click **MOR Post** and the page opens, already paired with the program; nothing is typed in a terminal.

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
| `src/poster.ts` | What the app does: `begin` (an identity made with the genesis client's `TestIdentity.create`, its signing seed's words, three positions), `confirm` (three words typed back, then the genesis to the homes and routes naming the relays), `bring` (the carry Module, section 4: the chain read with the genesis client's `lookUp`, the words' public key checked against the current signing key), `post`, `posts`, `show` and `withdraw` (the barebone client's `post`, `readPost`, `listPosts`, `withdraw` and `renderPost`), and a look-up before every act signed. |
| `src/store.ts` | The program's folder (default `~/mor-poster`, owner-only): `identity.json` (the genesis client's format), `settings.json`, `pending.json` (a new identity until three words are typed back), `access.json`, `run.json`. |
| `src/server.ts` | The program: the desk's server (`../desk/src/local.ts`): `127.0.0.1` only, the page built at start, not minified, under a content security policy, requests signed by a paired browser with MOR Post's own domain line, `MOR post, version 1`. |
| `src/cli.ts` | `open` (start the program if needed, open the page with a one-time pairing link: the desk's `../desk/src/launch.ts`), `run`, `stop`; and `words --file FILE`, which prints a genesis-client test identity's ID and words, to bring it in. Port 8472. |
| `src/version.ts` | The program's version (the desk's fingerprint), so the app restarts a program left running from older code. |
| `src/page/` | The page. Its requests are signed by the desk's page client (`../desk/src/page/api.ts`, `keystore.ts`). |
| `scripts/make-app.sh` | Makes `~/Applications/MOR Post.app` on macOS, which runs `open`. |

The words are the identity carry Module's (`modules/module-identity-carry-words-draft-1.md`, code in `modules/carry/` and `modules/airgap/src/carry.rs`).

Shared, not copied: the desk's server and launcher were moved into `clients/desk/src/local.ts` and `launch.ts`, its fingerprint into `fingerprint()` in `version.ts`, and its page client takes another program's domain line. The desk's own behaviour and tests are unchanged.

## Readings

Where the texts are silent, MOR Post takes these readings. *To be confirmed by Nobody, allegedly.*

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
cd ../genesis && npm install && npm run wasm && cd ../desk && npm install && cd ../poster
npm install
npm test            # real homes and a relay from target/debug/mor-relay (built if needed); Chromium at /opt/pw-browsers or MOR_CHROMIUM
```

- `test/poster.test.ts`, against three homes and a relay on local ports and the app's program, through a client signing exactly as the page does:
  - the first screen's words, "Test identities only, until MOR is frozen";
  - **a new identity** refuses to go on until three words are typed back (two words, a wrong word: refused, no genesis at any home); then the genesis at each home, the words the identity's signing key, the folder and the identity file owner-only;
  - **a post without a picture and one with a phone photo,** published to the relay and read back verified by the barebone reader in this process; the picture **stripped** (it carried a location, a preview and camera data; the reader finds nothing left), upright; the list newest first;
  - **a withdrawal:** the picture no longer shown, the post standing; someone else's picture cannot be withdrawn;
  - **an identity made by the genesis client, brought in by its words,** its ID typed in groups of four, the current signing key checked; **a wrong set refused** (another identity's words, a changed word, a word off the list, twelve words, a short ID), nothing kept; no chain key held;
  - **two apps posting as one identity keep separate lines, both valid** (the genesis client's line goes on at positions 2 and 3, MOR Post's starts at 1), and a second MOR Post makes a third line, also valid;
  - **rule 17 (now 35), shown:** the genesis client reads the three lines (its own and two MOR Posts'), the one it reads for this app the same as this app's card, and rotates keeping all of them: every post stays valid, and MOR Post refuses to sign with the spent key (before this build, MOR Post's posts became void);
  - **requests from an unpaired browser refused,** as are a key signing with another program's domain line, an unsigned request, and a pairing code asked without the owner's secret; the page under its content security policy;
  - **nothing listens beyond 127.0.0.1:** the program's address, no answer at the machine's other addresses, another host name refused.
- `test/browser.test.ts`: the same in headless Chromium on a fresh profile, by clicks and typing alone: the two doors, the words shown and not shown again after a reload, a wrong word refused, the identity born, a post, a picture (what was taken out said), the list, a withdrawal, this app's line counted on the card, no console error. `MOR_SCREENSHOTS=DIR` keeps a picture of each step.
- `test/launcher.test.ts`: `mor-poster open`, as the app runs it, starts the program and prints a pairing link; opened again, the same program stays; `stop` stops it.

## Using it (a human test, on the author's Mac)

*The build window cannot reach the deployed homes, and keeps no keys.*

1. Once, in Terminal, from the MOR folder:
   ```
   git fetch origin && git checkout main && git pull
   cd clients/genesis && npm install && npm run wasm
   cd ../desk && npm install
   cd ../poster && npm install && sh scripts/make-app.sh
   ```
2. Double-click **MOR Post** in `~/Applications`. The page opens, paired.
3. **Make a new identity:** the home addresses you use for test identities (as in MOR Identities' Settings), one per line; relays the same, or empty. Write the 24 words on paper, type back the three asked, Go on.
4. Write a text, add a photo from your phone (one with a location), Post. Check: "verified", and the line saying the location was taken out. Post a text alone. Withdraw the picture.
5. **Bring it into a second copy** (to try the second door): in Terminal, from `clients/poster`, `node --import tsx src/cli.ts open --dir ~/mor-poster-2 --port 8473`. In the page that opens, **Bring an identity you have**: the ID (Copy ID on the first copy's card), the words from your paper, one of its home addresses. Post from it, and see both copies' posts listed in each, all verified.
6. To bring a test identity made earlier with the genesis client, print its words with `node --import tsx src/cli.ts words --file ~/mor-test/a.json` (only for test identities; the words are its signing key).
