# mor-reader

The web reader (roadmap step 10), the door: a page that opens by link, fetches an act from relays, verifies it in the visitor's browser with the core library, and renders it, a long-form document or a post with its pictures. It shows who signed it, by the whole fingerprint of the identity, and offers two ways to reach the identity it is the door of: email, and a message over MOR. It lives at `reader.dubsar.org`.

## In plain words

The page is three files and the core library. When someone opens a link, their browser (not the server) asks the relays for the act, checks its signature and its signer's identity chain with the same Rust code the relays use, compiled to WebAssembly, and only then shows it, saying whether it verified. The server that serves the page never learns what is read: the act's id is in the part of the link after `#`, which a browser never sends.

A visitor who wants to write can use email, or MOR. Over MOR, the message is sealed in their browser so that only the owner's key opens it, and left in the owner's inbox. Every act on MOR has a signer, and a visitor has no identity, so the page makes a one-time identity for that message and forgets its keys once it is sent. The owner reads the inbox with the genesis client.

## What is here

| File | What |
| --- | --- |
| `src/link.ts` | The link: `https://reader.dubsar.org/#ACT_ID`, optionally `?r=RELAY` after the id for relays beside the reader's own. |
| `src/settings.ts` | The deployer's settings (`reader.json`, beside the page), checked. |
| `src/read.ts` | Showing an act (the barebone client's reading, step 9, which renders the long-form format of step 8); the owner's documents; the fingerprint; standings in plain words. |
| `src/message.ts` | A message over MOR: the recipient looked up, a one-time identity, a private text act sealed with X-Wing, put in the inbox. |
| `src/view.ts` | The pages as HTML, and the stylesheet. |
| `src/app.ts` | The page in the browser. |
| `src/web/core.ts`, `src/web/common.ts` | The core library in a browser: the build puts them in place of `clients/genesis/src/core.ts`. |
| `src/headers.ts` | The content security policy it is served with. |
| `scripts/build.ts` | Builds `dist/`: `index.html`, `reader.js` (not minified, so anyone can read it), `reader.css`, `mor_wasm_bg.wasm`. The build fails if anything from Node reaches the bundle. |
| `reader.example.json` | Settings to copy and fill in. |

## Run

Build the core library's WebAssembly first (see `clients/README.md`), then:

```
npm install
npm test          # the logic against real relays, then the built page in headless Chromium
npm run build     # dist/
```

The browser test uses the Chromium at `/opt/pw-browsers` or the one `MOR_CHROMIUM` names; `MOR_SCREENSHOTS=DIR` keeps a picture of each page.

## What the tests show

- The settings and links are checked, never guessed: relays only over https (or plain http on the machine itself), links only https or mailto, an act id of 64 hex digits.
- The browser's helpers give the same answers as the genesis client's core, on the same inputs.
- A long-form document shows verified, by the identity the reader names, with its title, the signer's whole fingerprint, the plain text one tap away, and both ways to reach the owner. A post by another identity with a picture shows verified, and says it is not by the reader's identity. An act not found, or not a text act, is not shown, with the reason.
- The front page lists the owner's text acts, newest first, from every relay asked, each once; a relay that is away proves nothing.
- A visitor sends a message: the relays hold a container addressed to the owner that names neither the sender nor the text; the owner opens it with the genesis client, and the sender's act verifies; no other key opens it. From the command line, invisible and control characters in a message are shown as escapes. Nothing private is sent to an identity with no encryption key, or when no home takes the one-time identity. Every key exchange agrees with a second implementation (noble).
- **In headless Chromium**, on a fresh profile each time, with the page served under its content security policy: a link opens and shows the document verified; a post shows its picture upright, at the size the JPEG Module says; the front page lists the documents and opens them; a link to nothing, or to no act, says so; a visitor sends a message from the page and the owner opens it, verified. The policy refused nothing.

## Readings

Where the texts are silent, the reader takes these readings. *Confirmed by Nobody, allegedly, 30 September 2026.*

1. **The act id travels in the fragment.** `#ACT_ID` is never sent to the server that serves the page, so it learns that someone opened the reader, not what they read. The relays asked do learn which act is fetched: they serve it.
2. **The reader's own relays first,** then those the link names (`?r=`, https only). The act id is checked on arrival wherever it comes from, so the order is about privacy, not trust.
3. **The fingerprint is the whole identity hash,** in sixteen groups of four hex digits. The identity hash is the identity (Identity, "Definitions"); nothing shorter is shown as if it were it. *No fingerprint format is defined for identities; the air-gapped Module's is for keys.*
4. **The name is the deployer's word.** The page names the identity with the name in its settings, and says that the name is a setting and the identity is what was checked. Anything signed by another identity is marked "Not the identity this reader names". *Identity's name acts could later replace the setting.*
5. **The front page lists the owner's text acts** found in the feeds of the reader's relays, newest first, up to 30. Silence proves nothing: a document on a relay the reader does not ask is not listed.
6. **A message is a private text act** (Text MIP, type 0), addressed to the owner, sealed with X-Wing to the owner's current encryption key and put in the inbox route for the Text MIP (or the general inbox). No new act type: a direct message does not stand out by kind (Envelopes, "Reasoning").
7. **A one-time identity signs each message** (decided by Nobody, allegedly, 30 September 2026: messages over MOR, with a throwaway identity made in the browser). Its genesis is sent to the homes in the settings (`messageHomes`), which receipt it; its chain key is committed and wiped at once, so it can never rotate; its signing key is wiped once the message is signed; nothing is stored in the browser. The genesis is carried to the inbox relays too, so the owner finds it where the message is. *Stated cost:* every message leaves a genesis at the homes (until the test relays are wiped at step 17), and no reply can reach it; the page says so and suggests writing how to be reached. How many a home accepts is its policy (Envelopes: the relay market).
8. **The message is composed as canonical text** (Text MIP, rule 6) and checked by the core library before it is signed; at most 10,000 characters.
9. **"Re-homed without audit"** (relay transport cMIP, client conformance): if the owner's current state rested on a homeless rotation accepted on this browser's own failed attempt, the page would say what that means and ask before sending. The reader's lookup never records a failed attempt of its own, so it never accepts such a rotation; the warning stays for when one does.
10. **Email is outside MOR.** The address is a setting, and the page says nothing about it is signed or checked.
11. **Messages are read with the genesis client:** `mor-genesis inbox` prints each message's text, with control and bidirectional characters written as visible escapes, so a sender cannot reach the owner's terminal or reorder what it shows (in the spirit of Text MIP, rule 5a).
12. **The page's own code is not signed.** A browser trusts whoever serves `reader.dubsar.org`: a hostile server could serve a reader that lies about what verifies. *Stated cost; the website cMIP of step 10a is where it is settled.* Meanwhile the script is not minified, the content security policy lets the page run only its own script and the core library, load nothing else and not be framed, and the page is built from the released source.

For it, the shared client code no longer needs Node outside `clients/genesis/src/core.ts`: looking an identity up moved to `clients/genesis/src/lookup.ts` (re-exported by `identity.ts`); `core.ts` gained `sha256` and `base64`, and the Text MIP's spec hash (`SPECS.text`), which the long-form client now takes from it; the transport and the specs of the long-form and barebone clients hash through it. The genesis client's `inbox` shows messages' text.

## Deploy at reader.dubsar.org

*A human test: the build window cannot reach the server.* On the Infomaniak server that runs the two homes, behind the same Caddy.

1. **The owner's test identity can receive.** On the author's machine, if the test identity has no inbox route or encryption key yet:
   ```
   cd clients/genesis
   npm run cli -- routes --file me.json --outbox https://home1.dubsar.org --inbox https://home1.dubsar.org --inbox https://home2.dubsar.org
   npm run cli -- enckey --file me.json
   ```
   (`routes` replaces the whole routes act: list every route the identity keeps.) And at least one document, for example the long-form sample:
   ```
   cd clients/barebone
   npm run cli -- post --file ../genesis/me.json --relay https://home1.dubsar.org --relay https://home2.dubsar.org --text-file ../longform/examples/sample.md --longform
   ```
2. **Build**, where the clients are built (`npm install && npm run build` here), and copy `dist/` to the server:
   ```
   ssh SERVER 'sudo install -d -m 755 /srv/reader'
   scp dist/* SERVER:/tmp/ && ssh SERVER 'sudo mv /tmp/index.html /tmp/reader.js /tmp/reader.css /tmp/mor_wasm_bg.wasm /srv/reader/'
   ```
3. **Settings:** copy `reader.example.json` to `/srv/reader/reader.json` on the server and put the test identity's hash in `identity`. For the release, change `email` to the dubsar.org address there; nothing needs rebuilding.
4. **DNS:** `reader.dubsar.org`, A and AAAA, to the server, as for `home1`.
5. **Caddy** (`/etc/caddy/Caddyfile`), then `sudo systemctl reload caddy`:
   ```
   reader.dubsar.org {
       root * /srv/reader
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
6. **Check on a fresh device** (a phone off the home network, in a private window): open `https://reader.dubsar.org/`, open a document, and see "Verified" and the fingerprint, the same as `mor-genesis show` gives. Send a message from the page, then on the author's machine `npm run cli -- inbox --file me.json --at https://home1.dubsar.org` in `clients/genesis` shows it, `valid`.
