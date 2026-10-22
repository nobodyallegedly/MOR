# cMIP: Dubsar Runner

*Draft 1, 22 October 2026, written by the Dubsar Suite session that moved Kišib onto the kit and built the runner (`docs/kishib-runner-report.md`), for **F377**, for Nobody, allegedly, to approve. A Dubsar cMIP: the Suite lead's, not core.*

***Decided by Nobody, allegedly*** *(the redesign, 20–21 October 2026, `docs/design/suite-redesign.md`, "The Dubsar runner cMIP"; H61 brought forward: "a good thing to have early"): Mac only; inspired by Amber and nsecbunker; the connection initiated in the app, approved in Kišib, then Kišib signs for it; Kišib's approval panel shown **inside the asking app's window** ("it needs to show it in Dub"); the gap of a malicious app covering or tricking a click accepted ("We're building experimental tools for an experimental protocol. So I can live with that gap"); **off by default, no key stored**; on, with the risk stated, Kišib keeps signing keys, the chain key never ("only on Mac yes… with stated risk, and risk is optional"); the working rule stands, the runner its one exception.* ***Accepted*** *(the lead's proposals, agreed): the panel drawn by Kišib in a frame the app cannot read or change; standing yeses per app and kind, money, agreements and keys always asking; the runner keeping its own line of acts for each app it signs for (mockups, question 10: "Yes, good idea").*

*Founding cMIP, EXPERIMENTAL. Not approved, not a product; test identities only until MOR is frozen.* Written against the Identity MIR draft 15 (the signing key, bindings, sequences and rule 35, the lines a change of keys keeps), the Envelopes MIR draft 11 (everyday acts, private acts and the sealed container), the Agreements MIR draft 17 and the Money MIR draft 11 (what always asks). It fills no task and puts nothing on MOR: it is how two programs on one computer talk. Its hash stays a draft hash until its creator is named at step 17. Its code: `clients/kishib/src/runner.ts` (the runner), `clients/kishib/src/server.ts` (its door), `clients/dub/src/runner.ts` (the first app to use it).

*Reading this document: normal text is the specification. Italic text is commentary. Choices the decisions did not fix are marked **(mechanic, this draft's)**.*

## In plain words

*Today every app holds the signing words of the identities it uses. The runner is a second way: you give an identity's signing words to Kišib once, on your Mac, and the apps you approve ask Kišib to sign for them. The app never holds the key. Each time it asks, Kišib draws a small panel inside the app's own window, says in plain words what it will sign, and waits for your click. For small things (posts, messages, names, your contacts list) you may say "always yes" for one app and one kind; money, agreements and keys always ask.*

*It is off until you turn it on, and Kišib says the risk first: while it is on, the signing keys of the identities you gave it are kept on this Mac, and whoever gets into the Mac can sign as them. Turning it off forgets every key, every pairing and every record of what it signed. The chain key, on paper, is never given to it.*

*Why the apps talk to Kišib directly.* The working rule says apps talk through MOR: what one app prepares for another travels as acts, sealed to oneself where private (17 October 2026). The runner is its one exception (decided), for the reason Nobody, allegedly, gave: **the asking app holds no key, so it cannot put a draft on MOR.** Every act on MOR is signed; an app with no key cannot sign even the request. So the request travels from the app to Kišib on this Mac alone, and only the act Kišib signs goes to MOR, as any act does.

## 1. The two programs, and where they talk

1.1. **The runner** is a program on the person's computer (Kišib's program, on the Mac) holding signing keys of identities given to it (section 6). **An app** is another program on the same computer (Dub's, first) that uses an identity through it.

1.2. **On this computer only.** They talk over the loopback interface (`127.0.0.1`); no network, no relay, no home. The runner answers nothing that arrives by another address or names another host. *How an app finds the runner is the app's: on the Mac, Kišib's folder names the port its program listens on.* **(mechanic, this draft's)**

1.3. **Two doors.** The runner has a door for apps (section 2 to 5: pairing, requests, answers) and a door for the panel (section 4), which only a browser frame inside a paired app's window opens. The runner's own page (Kišib's) approves pairings, answers what waits, and keeps standing yeses, under the runner's own access rules.

1.4. **Never on the web.** A runner is a program that keeps running and keeps keys out of the browser (decided: "Agents and runner are Mac only"). A web client neither runs one nor uses one.

## 2. Pairing

2.1. **Started in the app.** The app asks to pair, naming itself (its name, as people know it: "Dub") and **its origin**, the address its own page is served from (`http://127.0.0.1:PORT`). The runner answers with a **pairing code** (eight characters, in two groups) and a **token**, a secret the app keeps. The token is good for nothing until the pairing is approved. **(mechanic, this draft's)**

2.2. **Approved in the runner.** The runner's page shows the app's name, its origin and the code; the app shows the same code. The person compares them, chooses **which identities held here the app may use**, and approves, or refuses. *The code is what ties the app on screen to the pairing on screen: a second program asking at the same moment shows another code.*

2.3. **What a pairing holds.** The app's name and origin; the token's hash (never the token); the identities it may use; its standing yeses (section 5), none at first; when it was approved.

2.4. **The app learns the answer** by asking with its token: waiting, refused, approved (with the identities it may use, each with its ID and current signing key), or revoked.

2.5. **Revocable.** The person revokes a pairing in the runner's page at any time: its token stops working at once, its waiting requests are dropped, and the app is told "revoked" at its next request. An app may also unpair itself. Removing an identity from an app only unlinks it there: the runner keeps the key until the identity is removed from the runner or the runner is turned off.

## 3. A request

3.1. **What the app sends.** A request names **the identity** (an ID the pairing allows), **the line** it goes on (`public` or `private`, F376; or `apart`, an act on a line of its own, section 7.3), and **the act to be signed**, field by field, as the Envelopes MIR builds an everyday act: its specification, type and payload (the payload's exact bytes), public or private, `to`, `objects`, `refs`, `acks`, the binding it is signed under, and the line's act IDs so far, oldest first (its sequence). The app's name is the pairing's, never the request's word.

3.2. **The runner builds the act.** It builds the act from exactly these fields (salt, content key and nonce its own) and signs it with the identity's signing key: what it shows is read from the bytes it signs, never from a summary the app gives. It sends nothing to MOR: it returns **the signed act, its ID and, for a private act, its content key**, and the app sends it, seals it, keeps its line, as for an act it signed itself.

3.3. **Its fingerprint.** A request's fingerprint is the SHA-256 of its fields in deterministic CBOR (`[identity, line, spec, type, payload, public, to, objects, refs, acks, binding, sequence]`, absent fields as null). The same request asked again (the app restarted, the panel closed) is the same request: the runner answers it once, and gives the same signed act again rather than signing twice. **(mechanic, this draft's)**

3.4. **Refused before anything is shown**, each said in plain words, nothing signed:
- the runner is off, or the token is not a pairing's, or the pairing is waiting, refused or revoked;
- the identity is not one the pairing allows, or not held here;
- **the key check fails** (section 3.5);
- the binding named is not the identity's current binding (the app must read the identity again, and start new lines under the new binding: the carry Module, 4.3);
- a public act on the private line, or a private act on the public line (F376);
- an act of the Identity MIR's chain (a genesis, a rotation, a chain signature): the runner has no chain key and never will;
- a request larger than 96 MiB (a film, the video Module's 64 MiB, in base64).

3.5. **The key check (H80), before signing for any app.** The runner reads the identity from its homes as any reader would, and signs only where the signing key it holds is the one the homes serve now, and the homes do not disagree (contested). After a change of keys made from paper, it refuses, says that the identity's signing key was changed with its chain key, and asks for **the new signing key's words, given in the runner's page**; it signs nothing for that identity until then. Where no home answers, it refuses: silence proves nothing, and an act signed with a retired key would be void. **(mechanic, this draft's: stricter than the apps, which let an act through when no home answers.)**

## 4. The panel: what is shown, and where

4.1. **Inside the asking app's window.** Where a request needs the person (section 5), the runner answers **asks**, with the request's fingerprint and the address of its panel. The app draws the panel in **its slot** (the Dubsar kit's `openSlot`): a frame of the runner's page, sandboxed without same-origin, so the app cannot read or change what is inside, and what is inside cannot reach the app's page. Its edge is striped in Kišib's colour and says "Drawn by Kišib · Dub cannot read or change this frame". The app frames only the runner's origin it was given; any other is refused and nothing is drawn (the slot's rule 1).

4.2. **Only inside paired apps.** The runner serves a panel only into a frame (never as a page of its own), only for a request waiting, and only to be framed by **the origin of the pairing that asked** (`frame-ancestors`); a browser refuses it anywhere else.

4.3. **What the panel shows**, read by the runner from the bytes it will sign:
- who asks ("Dub asks Kišib to sign a post") and for whom ("As Max · mid1… · public" or "private");
- **the act in plain words**: a post's or message's text, whole; what it answers, corrects or names; to whom it is addressed (each ID, written for people); a picture or film by its size and work hash; a display name; a contacts list's length; for money, agreements and keys, what kind of act it is under which specification, its amounts and parties where the runner reads them, and where it does not, that it cannot read it, with its specification and type;
- on which of the app's lines it goes, and at which position;
- "Always yes for Dub's posts" (the kind's name), only where a standing yes is allowed (section 5);
- **Sign it**, **Decline**; and "Money, agreements and keys always ask."

4.4. **The approval.** The person's click is a form sent from inside the frame to the runner, carrying a single-use value the runner wrote into that panel and nowhere else: the app's page, which cannot read the frame, cannot make the click itself. Signed, the frame says so; declined, it says nothing was signed. **(mechanic, this draft's)**

4.5. **The signature returned.** The app asks for its request's answer, and may wait for it: **signed** (the act, its ID and content key), **declined**, **waiting**, or **expired**. A panel closed without an answer leaves the request **waiting** in the runner's page, where it can be answered; the app that still waits then has its answer. A request waits ten minutes; then it expires, nothing signed. **(mechanic, this draft's)**

4.6. **The gap, accepted (decided).** A malicious app can cover the frame, or trick a click on it. The runner's page lists every act signed (section 6), so a click tricked shows there. *The frame protects the panel from the app's page, not from a program running as the person on the same computer, which can read the runner's folder itself (section 8).*

## 5. Kinds of act, and standing yeses

5.1. **Each act's kind is the runner's reading of its bytes**, never the app's word:

| Kind | What | A standing yes |
| --- | --- | --- |
| Posts | Public text acts (posts, replies, corrections); public publications (a picture, a film, a document) and their withdrawal | allowed |
| Messages | Private text acts | allowed |
| Names | A display name, and its withdrawal (the naming cMIP) | allowed |
| Contacts | The follow list, sealed to oneself or published (the people cMIP) | allowed |
| Money | The Money MIR's acts; the payment, anchoring, grant-limits and money messages cMIPs' (a draft for the money app, a lane asked) | **never: always asks** |
| Agreements | The Agreements MIR's acts (terms, signatures, offers, contests, records, resignations); a witness act relying on another's act (Identity type 15) | **never: always asks** |
| Keys | Every other Identity MIR act (routes, a successor's confirmation); an encryption key published; a key delivered to anyone but the identity itself; a member key | **never: always asks** |
| Other | An act of a specification the runner does not read | **never: always asks** |

*Relying on another's act is read with agreements: it keeps that act standing should its author disown it, a commitment more than a post.* **(mechanic, this draft's: the kinds' edges.)**

5.2. **A standing yes** is per pairing and per kind: "Dub's posts". Given from the panel's box or the runner's page, withdrawn in the runner's page. Under it, the runner signs a request of that kind for that app at once, without a panel, after every check of section 3, and lists it in what it signed.

5.3. **Money, agreements and keys always ask**, whatever was said before: no box offers it, and a standing yes stored for them is ignored.

## 6. What is kept, and when

6.1. **Off by default.** While off, the runner keeps nothing: no key, no pairing, no record. It refuses every request ("the runner is off").

6.2. **Turned on with the risk said first**, and read: the signing keys of the identities given to it are kept on this computer while it is on; whoever gets into the computer can sign as them, within what was allowed through the runner, and anything at all by reading its folder; turning it off forgets them all. The risk is optional: the runner may stay off for good.

6.3. **While on**, in the runner's folder, readable by its owner only: each identity given to it (its ID, **its signing key**, its current binding and homes); each pairing (section 2.3); and **what it signed**, each act with when, for which app, its kind, its words as shown, its ID, its line and position. And, in memory only, the requests waiting.

6.4. **Never the chain key.** The runner is given an identity by its **signing key's words**, checked against the key its homes serve (the carry Module), and refuses a chain key's words, said plainly.

6.5. **Turned off**, it forgets everything of 6.3: the folder's file is overwritten, then removed; every pairing ends; nothing of it remains. Turned on again, it starts empty.

6.6. **Removing an identity** from the runner forgets its key and its record; the pairings that named it lose it.

## 7. Lines

7.1. **The app's lines, signed by the runner.** An identity used through the runner signs, for each app, **on that app's lines**: its public line and its private line (F376), as if the app held the key. The app keeps them, as for any identity it holds, and names them in each request (3.1); the runner checks that an act goes on the line of its kind. *So a change of keys finds and places every line as before: the public line read by anyone, the private one by its card (F373).*

7.2. **The cards.** The app shows its cards as for any identity (Dub: the identity's menu, Line and homes). The runner, while on, also knows the latest act it signed on each app's line, and **gives these cards itself** to a change of keys made in Kišib for an identity it holds: written into the review's cards, said as coming from the runner, to be checked and completed with the other apps' cards. *A card is the app's or the runner's word (F376's stated cost); the runner's is the same as the app's, since it signed the line's latest act.* **(mechanic, this draft's)**

7.3. **The key delivered to oneself.** An app leaves each private act at the identity's homes with its content key delivered to the identity itself (F373), an act on a line of its own (`apart`). The runner signs it **with the act it belongs to**, without a panel, where it delivers to the identity itself exactly the content key of a private act the runner signed for the same app and identity; any other key delivery is a key (5.1).

7.4. **After a change of keys**, the runner's held key no longer counts (3.5): given the new words, it signs under the new binding, and the app starts new lines under it (3.4).

## 8. Costs, stated

- **Keys on the computer.** While on, signing keys are kept in the runner's folder, unencrypted, readable by the owner's account. Whoever gets into the computer, or any program running as the person, can sign as those identities. *Draft 1 does not encrypt them at rest (as nsecbunker does with a passphrase at each start): a question for Nobody, allegedly.*
- **The click.** A malicious app can cover or trick a click (decided, accepted). What was signed is listed in the runner's page.
- **The app's words on the line.** The app chooses the line and its sequence; the runner checks the line's kind, not its history. An app that lies about its line harms only its own line.
- **No reading.** Draft 1 signs; it opens nothing. An app using an identity through the runner holds no encryption key either, so it sends private messages but does not open them. *A later draft may let a pairing open what is sealed to an identity, as NIP-46 does: a question for Nobody, allegedly.*
- **One computer.** The runner serves apps on the same computer only: a phone signs with its own words.
- **The runner must be running** for its apps to sign.

## 9. Tests

Run (`clients/kishib/test/runner.test.ts`, `clients/dub/test/runner.test.ts`, `clients/kishib/test/runner-lines.test.ts`; the browser by clicks): off by default, nothing kept; turned on, the risk read first; Dub paired from its identity panel and approved in Kišib; a post signed through the runner, its panel drawn inside Dub's window, unreadable from Dub; a standing yes for posts, then a post signed with no panel; money and an agreement always asking; Waiting after a closed panel; what was signed; Revoke, then Dub refused; turned off, every key gone (Kišib's folder read whole); after a change of keys, the runner refusing until the new words are given; an unpaired origin refused by the slot, and the panel refused in another app's frame; an identity held by the runner posting and messaging from Dub, then changing keys from paper, every line placed, nothing in red.
