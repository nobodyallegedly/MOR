# MOR Identities (mor-desk)

**MOR Identities**, the owner's desk: a client for several identities, in TypeScript, with the core library through WebAssembly. Roadmap step 11c: "a way for me to approve and direct" (Nobody, allegedly). Kept separate from the collective client for now ("can always be combined in a single app later").

**Test identities only.** Every key is held in software in the program's folder. The real identity's signer plugs in at step 16b.

## In plain words

A small program runs on your Mac and holds your test identities: yours, "Machine, allegedly", and any other. You use it from a page in your browser, on that Mac only. Double-click **MOR Identities** and the page opens, already paired with the program; nothing is typed in a terminal.

- **Drafts waiting for you.** When Claude prepares something for an identity you linked to it (a post, a picture, a withdrawal, a message), it lands here. Each draft is read again by the desk, from its own bytes, and shown in plain words: who signs, what it does, the text character for character, the picture exactly as it will be published, and its digest, the same one Claude showed. Claude's note to you is shown apart, as Claude's words. Then you choose:
  - **Approve and sign:** the desk signs it as the next act of that identity and sends it: to the relays, or sealed into the recipient's inbox for a message. What each relay answered is shown.
  - **Send back,** with a note saying what to change: nothing is signed; Claude reads your note and prepares a new draft, which the desk shows beside your note and the earlier text.
  - **Decline:** nothing is signed.
- **Identities, and what they received.** For each identity, **Look for what it received** opens its inbox: messages, replies to its acts, acknowledgements that its acts were received, and payments. Each is checked with the core library and shown with who sent it. You sort each one into **To answer**, **Answered** or **Ignored**; new ones wait under **New**.
- **Claude may prepare drafts for this identity: On / Off.** A question on each identity's card, answered on or off. Claude can prepare drafts only for identities set to On; set one to Off, and its drafts are refused. The answer is said on the card, where you clicked.
- **Copy ID**, beside each fingerprint: copies the whole ID, without the spaces it is shown with, to paste where an identity is asked for (for example, to tell Claude whom to write to).
- **New drafts appear by themselves:** the page looks in the drafts folder every few seconds, even while another window covers it (the folder only; relays are asked only when a new draft is there to read). **Look for new drafts now** does the same at once.
- **What you answered:** every approval, decline and note, newest first.

Claude prepares acts of the Text and Envelope layers only: posts, publications, withdrawals and messages. A Law act (a signature on a release, an agreement) is never prepared by Claude, and the desk refuses one if a draft of it appears; those are signed in the collective client.

## Precisely

| File | What |
| --- | --- |
| `src/desk.ts` | Everything the desk does: identities (genesis, routes with an inbox, an encryption key), linking, the drafts waiting and their readings (the connector's `readDraft`, from the bytes), approve, decline, send back, send again; gathering and reading what an identity received; sorting. |
| `src/store.ts` | The program's folder (default `~/mor-desk`, owner-only): `book.json` (names, linked), `settings.json` (homes, relays, other addresses, the drafts folder), `identities/` (the genesis client's format), `signed/` (each act signed from a draft, to send again), `received/` (what each identity received, and its sorting), `history.jsonl`, `access.json`. |
| `src/specs.ts` | The Finance MIP's test spec hash, to recognise a payment. |
| `src/server.ts` | The program: `127.0.0.1` only, the page built at start, not minified, under a content security policy; requests signed by a paired browser (the collective client's `access.ts`, with the desk's own domain line `MOR desk, version 1`). |
| `src/cli.ts` | `open` (start the program if needed, open the page with a one-time pairing link), `run`, `stop`. Port 8471. A program left running from an older version of the code is stopped and started again by `open`. |
| `src/version.ts` | The program's version: a fingerprint of every source file it runs (here and in the clients it uses), its page and the core library's WebAssembly, given by `/hello` and in `run.json`. |
| `src/page/` | The page. |
| `scripts/make-app.sh` | Makes `~/Applications/MOR Identities.app` on macOS, which runs `open` (and removes the same app made under its earlier name, `MOR Desk.app`). |

*Renamed 2 October 2026 (Nobody, allegedly):* the app, the page and its headings say "MOR Identities". The program's folder stays `~/mor-desk` and the code stays in `clients/desk`, so existing test identities and pairings carry over; the local format labels (`MOR desk, version 1` and the drafts folder's) are unchanged for the same reason.

The drafts folder it shares with the connector is documented in `clients/connector/DRAFTS.md`. The collective client's `access.ts` gained a parameter for another program's domain line and code label; the genesis client's `TestIdentity` can now acknowledge acts (`acks`), and the WebAssembly bindings make and describe `acks`.

## Readings

Where the texts are silent, the desk takes these readings. *To be confirmed by Nobody, allegedly.*

1. **A program on the Mac, a page in the browser,** paired without typing, as the collective client (its readings 1 and 2).
2. **One click approves.** The draft is fixed by its digest, so the card shown is the review; Approve sends that digest, and the desk reads the file again, refuses it if its bytes no longer hash to its name, and reads it again before signing. *Set aside:* a second review step, as the collective client has.
3. **The desk signs only for identities it holds and the owner linked,** only once per draft, never while a rotation of that identity waits.
4. **An identity made here gets an inbox and an encryption key** at once (routes at the relays in Settings), so it can receive messages; its genesis goes to the homes in Settings.
5. **What an identity received** is what its inbox relays hold addressed to it, sealed or not. A **reply** is a text naming one of its acts in `refs`; an **acknowledgement** names one in `acks`; a **message** is any other text; a **payment** is a Finance act. A Finance act is shown as received, never as paid: no rail's proof is checked before step 12.
6. **Sorting is the owner's alone:** nothing is marked answered by itself, and nothing about the sorting leaves the Mac.
7. **Names stay on the device,** except the names of identities linked to Claude, written to the drafts folder.

## Flaw found while building

**F1. A publication's size: Envelope and the JPEG Module disagree.** The Envelope MIP's media map says field 3 is the "size of those bytes", right after field 2, the hash of the media "as stored", that is, locked. The JPEG Module says "the work hash, the locked hash and the size in the publication are those of the stripped file", and a reader "checks the plaintext against the work hash and the size"; the barebone client and the reader, deployed, use the size of the unlocked picture. The desk and connector follow the Module and the deployed code, so their pictures show in the reader; the conflict is not resolved here. Options: (a) Envelope says field 3 is the size of the plaintext (the locked size is already fixed by the locked hash); (b) the Module and the two clients change to the locked size. *Lean: (a), a wording change in Envelope's next draft.*

## Questions for Nobody, allegedly

1. **Moving existing test identities into the desk.** The same identity held by two programs (the desk and the collective client) would fork its sequence the first time both sign. Options: (a) the desk makes its own identities only, as now; (b) an import that moves the file, so the other program no longer holds it; (c) wait for the combined app. *Lean: (a) until the combined app.*
2. **Should Claude see what an identity received,** to draft replies? Options: (a) never: the owner tells Claude; (b) per identity, a second tick, off by default; (c) always for linked identities. *Lean: (b), not built yet.* Messages are private; whatever Claude sees leaves the Mac.
3. **Marking "answered" by itself** when the owner approves a reply that names a received item. Options: (a) manual only, as now; (b) automatic; (c) suggested, with one click. *Lean: (c).*
4. **Replies and acknowledgements not delivered to the inbox are not found.** A reply published on the replier's own relays, naming the identity's post, cannot be asked for: relays filter by signer and recipient, not by what an act refers to or acknowledges. Options: (a) a client delivers every reply and acknowledgement to the inbox of the identity it concerns (Envelope's "should reach that counterparty"); (b) a `refs`/`acks` filter in the relay transport's next draft, beside the one raised for later agreements. *Lean: both; (a) is already what the desk expects.*
5. **A post with a picture is two approvals** (the picture, then the post naming it). Options: (a) keep; (b) one draft holding several acts, signed in order. *Lean: (a).*
6. **Finance's test spec hash** is taken as `sha256("FINANCE, test value until the freeze")`, after the other MIPs. *Lean: confirm; step 12 uses the same.*

## Tests

```
cd ../genesis && npm install && npm run wasm && cd ../connector && npm install && cd ../desk
npm install
npm test            # real homes and a relay from target/debug/mor-relay (built if needed); Chromium at /opt/pw-browsers or MOR_CHROMIUM (on a Mac: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome")
```

- `test/desk.test.ts`, against three homes and a relay on local ports, the desk's program, and the connector run as its own process, driven over MCP as Claude's app drives it:
  - Claude prepares only for identities linked at the desk, knowing them by name;
  - **a draft from Claude reaches the desk** with the same digest, read in plain words with Claude's note apart; **sent back with a note**, nothing signed; the connector returns the note to Claude; **reworked**, naming the old draft, shown beside the note and the old text; **approved**, signed as the next act of the identity's sequence, **accepted by the relay**, verified by any reader; the connector fetches it back and finds it exactly the draft; never answered twice;
  - **a Law act cannot be prepared:** the connector has no tool for one, and a Law signature written into the folder by hand is refused by the desk and cannot be approved; an Identity act and a key delivery likewise;
  - a draft file changed after it was shown is refused;
  - a picture (location and camera data stripped), a post showing it, verified by the barebone reader, and its withdrawal; a withdrawal of someone else's publication refused before any draft;
  - **received interactions:** a message from one desk identity to another (prepared by Claude, sealed at approval), and from an outsider a reply, an acknowledgement and a payment claim; each read, verified and told apart; **sorted** into to answer, answered and ignored; looking again finds nothing new and keeps the sorting;
  - unlinking stops Claude preparing for an identity, and the desk refuses its drafts.
- `test/browser.test.ts`: the step's "done when" in headless Chromium on a fresh profile, from the launcher's link, by clicks and typing alone, with the connector beside it: the page named MOR Identities; "Settings saved" said beside the button; identities made, the Claude question answered On and Off by clicks and said on the card; Copy ID copying the whole ID without spaces; a draft from Claude appearing without a click or a reload, sent back with a note, reworked, approved and accepted by the relay; a message from "Machine, allegedly" to the author's unlinked identity, by its ID, approved and found in that identity's inbox; what each received sorted into the piles by clicks; no console error. `MOR_SCREENSHOTS=DIR` keeps a picture of each step. A second test: a new draft appears by itself while the browser reports the page hidden, as macOS did with Claude's window over the browser.
- `test/launcher.test.ts`: `mor-desk open`, as the app runs it, stops a program left running from an older version (one that gives no version, as before 4 October 2026) and starts one from the code on disk; opened again, the same program stays.

## Using it (a human test, on the author's Mac)

*The build window cannot reach the deployed homes, and keeps no keys.*

1. Once, in Terminal, from the MOR folder:
   ```
   git fetch origin && git checkout main && git pull
   cd clients/genesis && npm install && npm run wasm
   cd ../desk && npm install && sh scripts/make-app.sh
   cd ../connector && npm install && npm run add-to-claude
   ```
   The last line installs the connector outside Documents, where Claude's app may start it (`clients/connector/README.md`).

   Once, check the saved copy of Claude's settings by eye. It is meant to be the file as it was before MOR was ever added, and it is never overwritten, so a copy made by an earlier, faulty run stays wrong. In Terminal:
   ```
   cat ~/Library/Application\ Support/Claude/claude_desktop_config.json.before-mor
   ```
   Under `"mcpServers"` there should be no `"mor"` entry. If there is one, the copy was made after MOR was first added (as on the author's Mac, by a run before 2 October 2026) and is not the original: should you ever put Claude's settings back from it, take that `"mor"` entry out first. If the file does not exist, Claude had no settings file before MOR.
2. From then on, double-click **MOR Identities** in `~/Applications`. The page opens, paired. After a pull, the app restarts a program left running from the older code by itself.
3. Under **Settings**: homes `https://home1.dubsar.org` and `https://home2.dubsar.org`; relays the same two. Leave the drafts folder as it is (`~/mor-drafts`).
4. Under **A new test identity**: yourself, with "Claude may prepare drafts for it" left unticked; then "Machine, allegedly", with it ticked. Claude prepares for "Machine, allegedly" only (decided by Nobody, allegedly, 1 October 2026).
5. Quit Claude completely and open it again. Ask: "Prepare a post for Machine, allegedly, saying …". Claude shows a digest.
6. In MOR Identities the draft appears by itself, with the same digest. Write a note and **Send back**. Tell Claude "see what the desk said, and rework it". The new draft appears beside your note; **Approve and sign**: the relays answer "accepted".
7. On your own identity's card, press **Copy ID**. Ask Claude for a message from "Machine, allegedly" to that ID (paste it). Approve it; then on your own card, **Look for what it received**, and sort what came in. Your identity stays Off: Claude writes to it by its ID, never for it.

## Not yet

- **Drafts from others** than Claude (the collective, anyone): the roadmap names them; only the connector writes drafts now.
- **The real identity's signer** (step 16b), and moving identities in from other programs (question 1).
- **Reading Finance acts** and checking a payment's proof (step 12).
- **Answering from the desk directly,** without Claude: today a reply is asked of Claude.
