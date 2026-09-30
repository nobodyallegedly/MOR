# mor-manage

The management page for relays and homes, in TypeScript. Roadmap step 11.

## In plain words

Until now, whoever ran a relay or a home typed commands on the machine it runs on: `mor-relay allow`, `approve`, `rotate`… Now the relay serves a page, at `/manage/` on its own address, where its operator does all of that from a browser:

- see what it holds and whether it is running, closed, or waiting for something;
- see the rotations waiting for approval (for identities whose owners asked for it), and approve the owner's;
- choose which identities must have their rotations approved;
- keep the list of identities a list-only relay serves;
- limit how many new identities a public home takes in a day;
- see the latest arrivals;
- rotate the operator, close the home for good, or hand it a rotation the operator made elsewhere;
- pair another device, or unpair one.

**Who may use the page** (decided by Nobody, allegedly, 30 September 2026). The first time, the browser makes a key of its own for that address, kept so that even the page cannot read it out. The operator pairs it once, with a one-time code the relay prints (at `init`, or with `mor-relay pair`). From then on every request the page sends is signed with that key, and the relay answers only keys it has paired. The key is not an identity: the operator's identity keys play no part, and nothing here is a MOR act. How an operator runs a relay is outside the protocol, the program's own business, so no MIP is involved.

Setting a relay up and starting it stay one-time steps on its machine (`mor-relay init`, then a service or login agent), as does the first pairing code of a relay already running. Everything done day to day happens on the page.

## Precisely

| File | What |
| --- | --- |
| `src/api.ts` | Requests, as the relay checks them (`relay/src/manage.rs`): a JSON body `{relay, time, nonce, op, args}`, signed with Ed25519 (WebCrypto) over `"MOR relay management, version 1\n"` followed by the body's exact bytes; the key and signature in the `mor-key` and `mor-signature` headers. The page reads the relay's id and clock first (`GET /manage/hello`) and corrects for this device's clock. |
| `src/keystore.ts` | The key, in IndexedDB, made non-extractable: one per address (browser origin), so home1's key is never offered to home2. |
| `src/view.ts` | The page's sections, as HTML strings. Everything the relay sends is escaped, above all what strangers sent: a rotation waiting for approval may be a thief's, its addresses chosen by the thief. |
| `src/app.ts` | Pairing, then each section filled from the relay's answers; forms and buttons; the overview and waiting rotations kept current every 30 seconds. |
| `scripts/build.ts` | Builds the page into `relay/manage/` (not minified), which the relay program embeds and serves. |

The relay side is `relay/src/manage.rs`: `GET /manage/` (the page, under a content security policy that lets it run only its own script, talk only to this relay, and never be framed), `GET /manage/hello`, and `POST /manage/api`, which checks, in this order, the signature over the exact body, that the request names this relay, that its time is within five minutes of the relay's clock, and that its nonce is new; then that the key is paired (except to pair). The management routes carry no CORS headers, unlike the protocol's.

What a request may ask (`op`): `status`, `recent`, `identities`, `allowlist`, `allow`, `disallow`, `strict`, `pending`, `approve`, `limit`, `rotate` (with `closure`, and the typed confirmation `rotate` or `close`), `rotated` (a rotation bundle and a key file, as hexadecimal), `managers`, `unpair`, `code` (a pairing code for another device), and `pair`.

The command line gained `mor-relay pair`, `managers`, `unpair KEY` and `limit [N]`; `init` prints a first pairing code; `show` shows the limit on new identities.

## Readings

Where the texts are silent (here, where nothing is specified: running a relay is outside the protocol), the page and the relay take these readings. *To be confirmed by Nobody, allegedly.*

1. **The page is served by the relay itself,** built into the program, so there is nothing else to deploy and nothing else to trust: a server that could alter the page is the server being managed. The built files are committed in `relay/manage/`, so building the relay needs no Node; a test checks they are the build of this source.
2. **Pairing codes:** 20 characters (100 random bits), one browser each, for an hour; read leniently (case, dashes, I and L for 1, O for 0). A relay keeps only their hashes. Wrong codes are answered at most 10 times a minute, to spare the relay, not to protect the codes.
3. **Every paired browser is equal.** Any of them can make a code for another device and unpair any browser, itself included. *Cost, stated:* whoever holds a paired browser runs the relay; a lost device is unpaired from another, or on the machine with `mor-relay unpair`. If every browser is lost, `mor-relay pair` on the machine makes a new code.
4. **Replay:** a request names the relay (a random id the relay makes once) and is accepted within five minutes of the relay's clock, each nonce once. *Cost, stated:* the relay remembers nonces in memory, so a request captured on the wire could be replayed within five minutes after a restart; the page talks over https, an onion address, or the machine itself, where it cannot be captured.
5. **Rotations waiting for approval** are kept with their bytes, at most 8 per identity (the oldest go), newest first, until the home holds a chain act at that position; the operator approves one by its act id, and the owner's client sends it again, as before. The page shows the new homes each names, so the operator can tell the owner's from a thief's once the owner says which is theirs. *Cost, stated:* a stranger holding the safety key can push the owner's rotation off the list; the owner sends it again and it comes back first.
6. **A limit on new identities,** for the public homes (step 10: each message sent from the reader's page leaves a new identity there): at most N in any 24 hours, counting each genesis this home receipted for an identity it did not serve, the operator's own excepted; past it, a genesis is answered error 10, "try again later, or another home". No limit unless the operator sets one. Identities already served are never limited, nor an identity that arrives at a home newly named by its rotation. The times are the relay's own records, never part of what it signs.
7. **The operator's rotation and closure** run on the running home (no need to stop it, unlike the command line), each confirmed by typing a word, which the relay checks too. Rotating from the page is offered only when the key file holds the safety key (a test operator); otherwise the operator rotates where the safety key is kept and hands the home the rotation and the new key file through the page. *Cost, stated:* that key file then travels through the browser to the server, over the page's own connection (https, the onion address, or the machine itself).
8. **Settings made at `init` stay there:** the relay's addresses, its policy (open or listed identities) and its size limits. Changing them changes what the relay announces and is rare; the page shows them.
9. **A key per address:** a browser pairs separately with home1, home2 and the onion home. Clearing the site's data forgets the key, and that browser pairs again.

No flaw in a MIP found: nothing here touches the protocol.

## Tests

```
npm install
npm test
```

Needs the relay program (built by the tests with `cargo build -p mor-relay`), the genesis client's WebAssembly (`npm run wasm` in `clients/genesis`), and, for the browser test, the Chromium at `/opt/pw-browsers` or the one `MOR_CHROMIUM` names. `MOR_SCREENSHOTS=DIR` keeps a picture of each page.

- `test/manage.test.ts`: the committed page is the build of this source; a request is the exact JSON the relay reads, signed after the domain; a key made here cannot be read out, and pairs with a code from `mor-relay pair` against a real home, which then lists it; what strangers sent is escaped.
- `test/browser.test.ts`: headless Chromium on fresh profiles, the page served by a real home and a real relay, under its content security policy, with no console error beyond the refusals the test provokes. On the home, without a terminal: a wrong code refused, the relay's code pairs; an owner (the genesis client) chooses approval, its rotation is refused and shown waiting, approved on the page, sent again and counted; an identity listed and removed; a limit of 0 refuses a newcomer with error 10, lifted, and it is taken; a second device paired with a code made on the page, then unpaired and shut out; the operator rotated after a mistyped confirmation is refused, and the home still receipts. On the basic relay: pairing, no home sections, and an act published there among the latest arrivals.

The relay side has its own tests, `relay/tests/manage.rs`: the page without CORS; pairing once, loosely typed, a spent code, an expired code, a code made on the page, unpairing; a request replayed, altered, signed by another key, made for another relay, or too old; the allowlist, waiting rotations (the owner's and a thief's) and approval, the limit on new identities, the operator's rotation and closure, and a rotation made elsewhere handed over (a key file that is not the rotation's refused).

## Using it on the deployed homes

*A human test: the build window cannot reach the servers.* Each home runs the new program first (build and install it as in `relay/README.md`, then restart the service); its data is kept.

1. **home1 and home2** (Infomaniak): on the server, `sudo -u mor mor-relay pair --dir /var/lib/mor-home` (and the second home's folder), then open `https://home1.dubsar.org/manage/` in a browser, enter the code and a name for the browser.
2. **The onion home** (the author's Mac): `mor-relay pair --dir ~/mor-home`, then open `http://127.0.0.1:8080/manage/` on the Mac itself.
3. **The limit on new identities** at home1 and home2, from their pages, before the reader is deployed (step 10).
