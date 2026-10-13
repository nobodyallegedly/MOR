# MOR Identities (mor-desk)

**MOR Identities**, the owner's desk: a client for several identities, in TypeScript, with the core library through WebAssembly. Roadmap step 11c: "a way for me to approve and direct" (Nobody, allegedly). Kept separate from the collective client for now ("can always be combined in a single app later").

**Test identities only.** Every key is held in software in the program's folder. The real identity's signer plugs in at step 16b.

## In plain words

A small program runs on your Mac and holds your test identities: yours, "Machine, allegedly", and any other. You use it from a page in your browser, on that Mac only. Double-click **MOR Identities** and the page opens, already paired with the program; nothing is typed in a terminal.

- **Drafts waiting for you.** When Claude prepares something for an identity you linked to it (a post, a picture, a withdrawal, a message), it lands here. Each draft is read again by the desk, from its own bytes, and shown in plain words: who signs, what it does, the text character for character, the picture exactly as it will be published, and its digest, the same one Claude showed. Claude's note to you is shown apart, as Claude's words. Then you choose:
  - **Approve and sign:** the desk signs it as the next act of that identity and sends it: to the relays, or sealed into the recipient's inbox for a message. A reply to another identity's post also leaves a copy, sealed to that identity, in its inbox, so the author learns of it (see reading 8). What each relay answered is shown.
  - **Send back,** with a note saying what to change: nothing is signed; Claude reads your note and prepares a new draft, which the desk shows beside your note and the earlier text.
  - **Decline:** nothing is signed.
- **Identities, and what they received.** For each identity, **Look for what it received** opens its inbox: messages, replies to its acts, acknowledgements that its acts were received (since F110, carried only by Identity, Money and Agreements acts, such as a witness act), and payments. **Rely on this act…** on a received act first says what a witness act does ("I received this act and rely on it": it keeps the act visible as disputed even if its author later disowns it, and it is public); only **Sign the witness act** signs one (Identity draft 11, F110). An act of another kind carrying acknowledgements is shown as invalid. Each is checked with the core library and shown with who sent it. You sort each one into **To answer**, **Answered** or **Ignored**; new ones wait under **New**.
- **Claude may prepare drafts for this identity: On / Off.** A question on each identity's card, answered on or off. Claude can prepare drafts only for identities set to On; set one to Off, and its drafts are refused. The answer is said on the card, where you clicked.
- **This desk's line**, on each identity's card: how many acts this desk signed for it, the latest, and its running summary (F152). It tells the desk's acts from a thief's, and is the card a client changing the key reads this line by, or is given it by where it cannot read it (Identity rule 35, was 17).
- **Copy ID**, beside each fingerprint: copies the whole ID, without the spaces it is shown with, to paste where an identity is asked for (for example, to tell Claude whom to write to).
- **New drafts appear by themselves:** the page looks in the drafts folder every few seconds, even while another window covers it (the folder only; relays are asked only when a new draft is there to read). **Look for new drafts now** does the same at once.
- **What you answered:** every approval, decline and note, newest first; and everything Machine, allegedly's answering did, each answer with its words and its cause.
- **Machine, allegedly, plugged in** (decided by Nobody, allegedly, 12 October 2026; see "Machine, allegedly, plugged in" below): its terms, shown and then signed; your own messages and public acts to it answered at once; everyone else's in a **Notified** pile until you **Pick** one; a **Nudge** with its number of actions.

Claude prepares acts of the Text and Envelopes layers only: posts, publications, withdrawals and messages. An Agreements act (a signature on a release, an agreement) is never prepared by Claude, and the desk refuses one if a draft of it appears; those are signed in the collective client.

## Precisely

| File | What |
| --- | --- |
| `src/desk.ts` | Everything the desk does: identities (genesis, routes with an inbox, an encryption key), linking, the drafts waiting and their readings (the connector's `readDraft`, from the bytes), approve, decline, send back, send again; gathering and reading what an identity received; sorting. |
| `src/store.ts` | The program's folder (default `~/mor-desk`, owner-only): `book.json` (names, linked), `settings.json` (homes, relays, other addresses, the drafts folder), `identities/` (the genesis client's format), `signed/` (each act signed from a draft, or by the answering, to send again), `received/` (what each identity received, and its sorting), `history.jsonl`, `machine.json` and `machine/` (the answering's state and the acts it read), `access.json`. |
| `src/specs.ts` | The Money MIR's test spec hash, to recognise a payment. |
| `src/machine.ts` | Machine, allegedly's answering: its terms (shown, then signed by their digest), the look at what it received, the owner's acts answered, picks and nudges signed and acted on, the cap, the history. |
| `src/claude.ts` | The call to Anthropic's API: the key found as the deal tool finds it, the grounding (the newest MICS, case studies and companions, one cached block), the request, the answer checked against the length cap; errors in plain words, the key scrubbed. |
| `src/server.ts` | The program: `127.0.0.1` only, the page built at start, not minified, under a content security policy; requests signed by a paired browser (the collective client's `access.ts`, with the desk's own domain line `MOR desk, version 1`). The server itself is `src/local.ts`, shared with Dub (`clients/dub`). |
| `src/cli.ts` | `open` (start the program if needed, open the page with a one-time pairing link), `run`, `stop`. Port 8471. A program left running from an older version of the code is stopped and started again by `open`. The launcher itself is `src/launch.ts`, shared with Dub. |
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
5. **What an identity received** is what its inbox relays hold addressed to it, sealed or not. A **reply** is a text naming one of its acts in `refs`; an **acknowledgement** names one in `acks`; a **message** is any other text; a **payment** is a Money act. A Money act is shown as received, never as paid: no rail's proof is checked before step 12. **The seller's alarm** (Agreements rule 45b, F186, client conformance, 9 October 2026): where a payment names the claim it pays under (Money field 9) and that is a version of a deal, the desk reads the deal from the relays (its versions and every party's signatures) and raises the alarm, shown above the item, when the version named does not descend from the version this identity holds, the latest version of that deal it signed: it shows both branches, says the buyer is protected, and points to settling the fork by a version naming both branches (`../repo/src/deal.ts`, `sellerAlarm`). Where the identity's own signatures are on both branches, the fork itself is shown.
6. **Sorting is the owner's alone:** nothing is marked answered by itself, and nothing about the sorting leaves the Mac.
7. **Names stay on the device,** except the names of identities linked to Claude, written to the drafts folder.
8. **A reply reaches the identity it answers** *(the project lead's reading under the delegation, 12 October 2026, findings log, "Two identities on two homes: readings", and its correction; open question 4, option a; built in `docs/f272-build.md`)*. A post naming another identity's public act in `refs` names that identity among its recipients (`to`), and the desk, on approval, publishes it on the relays as any post and also leaves a copy, sealed to that identity, in its inbox: the relays there see whom it is for, never who sent it or which act it answers. The copy is made at signing and kept, so **Send again** sends the same bytes. An identity with no inbox or encryption key gets no copy, which the desk says; the reply is published all the same. *Why `to`:* the core opens a sealed container only if its inner act names the recipient (Envelopes, "Sealed container", step 5); a public act naming whom it answers shows nothing a reader of the act could not already see.
9. **A reference to a public act names its signer, and is made only to an act held** (F272, client conformance; Envelopes draft 9, rule 20). The connector fetches each act Claude names before writing the draft, and writes `[act, signer]` for a public act, the id alone for a private one (naming a private act's signer would expose the sender its sealed container hides: the writer's choice, and this desk's is not to). The desk checks it again from the draft's bytes: a public act named without its signer, with the wrong signer, or not found is refused.

## Flaw found while building

**F1. A publication's size: Envelopes and the JPEG Module disagree.** The Envelopes MIR's media map says field 3 is the "size of those bytes", right after field 2, the hash of the media "as stored", that is, locked. The JPEG Module says "the work hash, the locked hash and the size in the publication are those of the stripped file", and a reader "checks the plaintext against the work hash and the size"; the barebone client and the reader, deployed, use the size of the unlocked picture. The desk and connector follow the Module and the deployed code, so their pictures show in the reader; the conflict is not resolved here. Options: (a) Envelopes say field 3 is the size of the plaintext (the locked size is already fixed by the locked hash); (b) the Module and the two clients change to the locked size. *Lean: (a), a wording change in Envelopes' next draft.*

## Questions for Nobody, allegedly

1. **Moving existing test identities into the desk.** The same identity held by two programs (the desk and the collective client) would fork its sequence the first time both sign. Options: (a) the desk makes its own identities only, as now; (b) an import that moves the file, so the other program no longer holds it; (c) wait for the combined app. *Lean: (a) until the combined app.*
2. **Should Claude see what an identity received,** to draft replies? Options: (a) never: the owner tells Claude; (b) per identity, a second tick, off by default; (c) always for linked identities. *Lean: (b), not built yet.* Messages are private; whatever Claude sees leaves the Mac.
3. **Marking "answered" by itself** when the owner approves a reply that names a received item. Options: (a) manual only, as now; (b) automatic; (c) suggested, with one click. *Lean: (c).*
4. **Replies and acknowledgements not delivered to the inbox are not found.** A reply published on the replier's own relays, naming the identity's post, cannot be asked for: relays filter by signer and recipient, not by what an act refers to or acknowledges. Options: (a) a client delivers every reply and acknowledgement to the inbox of the identity it concerns (Envelopes' "should reach that counterparty"); (b) a `refs`/`acks` filter in the relay transport's next draft, beside the one raised for later agreements. **Answered, 12 October 2026:** (a), as the project lead's reading under the delegation (findings log, "Two identities on two homes: readings"), built: reading 8 above. (b), the direction from a post to its replies, is left to the relays' market and the relay transport cMIP: "a question for the people wishing to build a public square" (Nobody, allegedly, F272). *Not yet:* an acknowledgement is a witness act, which the desk signs itself and does not deliver to the acknowledged identity's inbox.
5. **A post with a picture is two approvals** (the picture, then the post naming it). Options: (a) keep; (b) one draft holding several acts, signed in order. *Lean: (a).*
6. **Money's test spec hash** is taken as `sha256("FINANCE, test value until the freeze")`, after the other MIRs. *Lean: confirm; step 12 uses the same.*

## Tests

```
cd ../genesis && npm install && npm run wasm && cd ../connector && npm install && cd ../desk
npm install
npm test            # real homes and a relay from target/debug/mor-relay (built if needed); Chromium at /opt/pw-browsers or MOR_CHROMIUM (on a Mac: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome")
```

- `test/desk.test.ts`, against three homes and a relay on local ports, the desk's program, and the connector run as its own process, driven over MCP as Claude's app drives it:
  - Claude prepares only for identities linked at the desk, knowing them by name;
  - **a draft from Claude reaches the desk** with the same digest, read in plain words with Claude's note apart; **sent back with a note**, nothing signed; the connector returns the note to Claude; **reworked**, naming the old draft, shown beside the note and the old text; **approved**, signed as the next act of the identity's sequence, **accepted by the relay**, verified by any reader; the connector fetches it back and finds it exactly the draft; never answered twice;
  - **an Agreements act cannot be prepared:** the connector has no tool for one, and an Agreements signature written into the folder by hand is refused by the desk and cannot be approved; an Identity act and a key delivery likewise;
  - a draft file changed after it was shown is refused;
  - a picture (location and camera data stripped), a post showing it, verified by the barebone reader, and its withdrawal; a withdrawal of someone else's publication refused before any draft;
  - **a reply** to an outsider's post, prepared by Claude, names the post's signer and the outsider among its recipients; approved, it is published and a copy sealed to the outsider is left in its inbox, which the outsider opens and verifies; a reference to an act nowhere found is never drafted; a draft naming a public act without its signer, or with the wrong one, is refused (F272, reading 8);
  - **received interactions:** a message from one desk identity to another (prepared by Claude, sealed at approval), and from an outsider a reply, an acknowledgement and a payment claim; each read, verified and told apart; **sorted** into to answer, answered and ignored; looking again finds nothing new and keeps the sorting;
  - unlinking stops Claude preparing for an identity, and the desk refuses its drafts.
- `test/browser.test.ts`: the step's "done when" in headless Chromium on a fresh profile, from the launcher's link, by clicks and typing alone, with the connector beside it: the page named MOR Identities; "Settings saved" said beside the button; identities made, the Claude question answered On and Off by clicks and said on the card; Copy ID copying the whole ID without spaces; a draft from Claude appearing without a click or a reload, sent back with a note, reworked, approved and accepted by the relay; a message from "Machine, allegedly" to the author's unlinked identity, by its ID, approved and found in that identity's inbox; what each received sorted into the piles by clicks; no console error. `MOR_SCREENSHOTS=DIR` keeps a picture of each step. A second test: a new draft appears by itself while the browser reports the page hidden, as macOS did with Claude's window over the browser.
- `test/launcher.test.ts`: `mor-desk open`, as the app runs it, stops a program left running from an older version (one that gives no version, as before 4 October 2026) and starts one from the code on disk; opened again, the same program stays.

## Machine, allegedly, plugged in

*Decided by Nobody, allegedly, 12 October 2026 (`docs/roadmap-v1.md`, "Claude through the API"); the nudge cMIP, draft 2 (`cmips/cmip-nudge-draft-2.md`, approved); report in `docs/machine-allegedly-plugged-in.md`.* The answering is part of the desk's program: it runs while MOR Identities runs, on your Mac, where Machine, allegedly's keys already are. The connector has no part in it: it still holds no key and sends nothing.

### In plain words

- **Its terms, first.** In the section **Machine, allegedly**, you choose which identity is Machine, allegedly, and which is you. The desk shows its terms in plain words: only you may nudge it, and only in public; your picks count; a public post, a reply to you and a message to you alone go out at once; a reply or a message to anyone else needs your pick; anything it does because you nudged it goes out at once, within the nudge's number. Nothing is signed until you press **Sign and publish these terms**; then they are signed with its key and published, and answering is on.
- **Your own messages and public acts to it are answered at once.** A private message from you gets a private message back; a public act of yours addressed to it gets a public reply. No approval step: only acts signed with your identity's key, checked through your identity chain, are answered this way. Nothing that arrived before the terms were published is answered.
- **Everyone else's are only notified.** They wait in the **Notified** pile, nothing drafted, no call made. **Pick** one that needs an answer: your pick is signed with your key and published ("picked by Nobody, allegedly"), and Machine, allegedly answers it at once, naming your pick and the message. You choose what it answers, never what it says. A private message is answered privately; if its sender cannot receive one (a one-time identity with no inbox), the desk says so and nothing is drafted.
- **Nudge it.** Give a number of actions, and words if you like: your nudge is a public act of yours. Machine, allegedly then chooses what to do, within the number: answer someone from the Notified pile, write a post of its own, write to you, or nothing. Each action names your nudge, never a pick.
- **The cap.** At most so many calls to Claude a day (20 to start) and so many characters an answer (1500 to start), both set on the desk. At the cap it stops, says so in red, and makes no call; what arrives meanwhile waits, and is answered the next day (by your Mac's date) or once you raise the cap. An answer longer than the cap is not sent. **Answering: Off** stops everything at once.
- **What it says rests on MOR's texts.** Each call gives Claude the newest MICS, the newest draft of each case study and the companions, and tells it to answer from them only and to say "Not claimed" rather than guess. The desk's history keeps every answer: its words, what caused it (your act, your pick, your nudge), what Claude marked as not claimed, and where it went.
- **No chat box.** Everything happens on MOR: your messages, its answers, your picks and nudges are all signed acts, delivered through the relays and the inboxes.

### Setting it up on your Mac

*Test identities only, as everywhere in the desk.*

1. **The code.** In Terminal, from the MOR folder:
   ```
   git fetch origin && git checkout main && git pull
   cd clients/genesis && npm install && npm run wasm
   cd ../desk && npm install
   ```
   Then double-click **MOR Identities** as usual: it restarts with the new code by itself.
2. **The API key.** If you already set it for the deal tool, there is nothing to do: the desk finds it in the same place, `~/.config/mor/anthropic-key` (`clients/assess/README.md`, "Setting the key on the Mac", says how). The key stays there: never in the repository, never on the page (the page says only where it was found), never in the history, a log or a report. A key file inside the repository is refused.
3. **A spending limit at Anthropic too.** In the Anthropic Console, in the account's limits or billing settings, set a monthly spend limit. The desk's daily cap counts calls; Anthropic's limit counts dollars, whatever happens on the Mac.
4. **The terms.** In **Machine, allegedly**, choose "Machine, allegedly" and your own test identity, press **Show its terms**, read them, and press **Sign and publish these terms**. The relays answer "accepted".
5. **A first try.** Someone else writes to Machine, allegedly (for now, another test identity). Press **Look now for what it received**: the message appears under **Notified**, and nothing is called. Press **Pick**: the desk says "Picked" and shows the answer's act; **What you answered** shows the words and "Cause: picked by …". Then **Nudge** it for one action, with a few words.
6. **It keeps going by itself** every minute while MOR Identities runs. If the Mac sleeps or the program is stopped, nothing is answered until it runs again.

*Not yet:* the desk has no box for you to write as yourself, so you cannot yet send Machine, allegedly a message of your own from the page; the automatic answers are tested in code until that is settled (question Q1 in the report).

### Precisely

- **Where it runs:** `src/machine.ts`, in the desk's program (`src/server.ts` runs a look every 60 seconds while answering is on; `machine look` runs one at once). One answering operation at a time; signing goes through the desk's one signing queue.
- **The terms** are Machine, allegedly's first terms as cMIP draft 2 writes them, built for the owner chosen (`firstTerms`), shown with `termsInWords` and the digest of their exact payload; `machine publish` signs only a payload whose digest is the one shown. A second publication names the first in field 2.
- **What is answered on its own:** a text act Machine, allegedly received, whose signer is the owner named in its terms, valid through his identity chain, found after the terms were published, and not answered before; an entry of the terms must let the answer go freely (a reply to him, or a message to him alone), which the first terms do. The answer names his act (by id alone where it was private: F272, the writer's choice) and is addressed to him.
- **Picks:** signed by the owner, public, addressed to Machine, allegedly and delivered to its inbox (cMIP items 7a and 6); acted on only if the nudge module's `mayAct` says so (allowed, under the latest terms); one answer per pick; the answer names the pick and the act picked, and is read back with the module (`within, by pick`, "Answered by Machine, allegedly, picked by Nobody, allegedly").
- **Nudges:** signed by the owner, public (field 4), the count from 1 to 20 and optional words; one call to Claude, which returns its chosen actions (a post, an answer to one of the ten newest notified acts, a message to the owner); no more than the count are signed, each naming the nudge and no pick.
- **The call:** `src/claude.ts`; the model `claude-opus-5-5`, adaptive thinking at medium effort, at most 8000 tokens a response, JSON answers by schema; the instructions, then the grounding as one block cached by Anthropic (five minutes), then the act and its thread, every word signed by others fenced as data. No silent fallback to another model. Every error is said plainly, the key scrubbed.
- **The cap:** each call is counted before it is made, in `machine.json` by the Mac's local date; at the cap, or with no key, or with the desk's folder inside the repository, nothing is called, nothing is recorded for what waits, and the reason is shown as "Stopped".

### Readings taken here

Where the decisions and the cMIP leave a choice, the answering takes these, to confirm with Nobody, allegedly (`docs/machine-allegedly-plugged-in.md`):

10. **Answers go in kind:** a public act gets a public reply, a private message a private message. A private message from a sender with no inbox is not answered (nothing could reach it, and answering it in public would show what it said).
11. **Picks are public,** so a reader can see "picked by" (the cMIP leaves it to the picker).
12. **What arrived before the terms were published is not answered.**
13. **What waits at the cap is answered once the cap allows,** the next day or after it is raised.
14. **A failure is not retried by itself** (an error from the API, a sender out of reach): it is listed under "Not answered" with **Try again**.

### Tests

- `test/machine.test.ts`, against three homes and a relay on local ports, the desk's program and a fake of Anthropic's API on another port (`clients/assess/test/fake-api.ts`): the terms shown, a wrong digest refused, then signed and published; **the author's own message answered on its own,** privately, with one call carrying the grounding, cached, and his words fenced; his public act answered publicly; nothing answered twice; **a stranger's message notified, no call, until picked,** then answered at once, naming the pick and the message, read as "picked by"; a visitor with no inbox, picked: not answered, no call; **a nudge for 2 producing at most 2** (three proposed), a nudged reply to a stranger naming the nudge and no pick, read as "under a nudge from Nobody, allegedly, its first of two"; an API error said plainly without the key, nothing signed; **the key in no output** (the page's state, the history, the desk's folder, the drafts folder, any request's body); **the cap stopping calls,** then answering the next day; an answer over the length cap not sent; answering off, nothing called.
- `test/machine-browser.test.ts`: the same at the desk in headless Chromium, by clicks alone: the terms shown, then signed; a notified message picked and answered; a nudge; the key never on the page; no console error.

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
- **Reading Money acts** and checking a payment's proof (step 12).
- **Answering from the desk directly,** without Claude: today a reply is asked of Claude.
- **Writing as yourself from the desk,** to Machine, allegedly or anyone (question Q1 of `docs/machine-allegedly-plugged-in.md`).
