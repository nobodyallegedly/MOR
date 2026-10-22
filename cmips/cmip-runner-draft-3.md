# cMIP: Dubsar Runner

*Draft 3, 22 October 2026, written by the Dubsar Suite session that built the runner's draft 3 (`docs/runner-draft-3-report.md`), for **F382**, for Nobody, allegedly, to approve. A Dubsar cMIP: the Suite lead's, not core. Drafts 1 and 2 (`cmips/cmip-runner-draft-1.md`, F377; `cmips/cmip-runner-draft-2.md`, F378) are kept as they were.*

***Decided by Nobody, allegedly*** *(the redesign, 20–21 October 2026, `docs/design/suite-redesign.md`, "The Dubsar runner cMIP"; H61 brought forward: "a good thing to have early"): inspired by Amber and nsecbunker; the connection initiated in the app, approved in Kišib, then Kišib signs for it; Kišib's approval panel shown **inside the asking app's window** ("it needs to show it in Dub"); the gap of a malicious app covering or tricking a click accepted ("We're building experimental tools for an experimental protocol. So I can live with that gap"); **off by default, no key stored**; on, with the risk stated, Kišib keeps signing keys, the chain key never ("only on Mac yes… with stated risk, and risk is optional"); the working rule stands, the runner its one exception.* ***Accepted*** *(the lead's proposals, agreed): the panel drawn by Kišib in a frame the app cannot read or change; standing yeses per app and kind, money, agreements and keys always asking; the runner keeping its own line of acts for each app it signs for (mockups, question 10: "Yes, good idea").*

***Decided by Nobody, allegedly, 22 October 2026*** *(the five questions of draft 1's report, `docs/kishib-runner-report.md`, section 5), which make this draft:*
1. *The keys protected at rest: "Agreed, it needs to be protected", option (b): a passphrase each time Kišib starts, the keys encrypted under it (section 6).*
2. *Opening what is sealed to an identity: "Yes", a choice when approving an app, off unless chosen; no panel per opening; each opening counted (section 8).*
3. *Relying always asks: "Ok, agreed" (section 5).*
4. *Locked and off, two states: "Yes, agreed" (section 6).*
5. *"Mac only" means never in the web client: "Correct, I meant not on web" (section 1.4).*

***Decided by Nobody, allegedly, 22 October 2026*** *(the questions of draft 2's report, `docs/runner-draft-2-report.md`, section 4, and of Damgar's round 3, `docs/damgar-r3-report.md`, section 5), which make this draft:*
1. *Opening chosen per identity, per app: "since an app can run multiple identities, per identity, per app" (section 8.1).*
2. *Opening returns only the act and its content key, never the identity's keys: "Understood and agreed" (section 8.4).*
3. *Kišib holds an identity's own keys for its collectives and signs with them through its panel: "kišib should be able to hold your key and the keys you hold for your collectives" (section 9).*
4. *Lanes through Kišib, the one act signed without a panel added: "Yes, if establishing lanes it has to be setup this way" (section 7.5).*
5. *Kišib's seal in the macOS menu bar: "can it be shown in the top bar on macOS, so one knows it is active?"; "Yes, I do want it"; Lock now and Quit Kišib in both the seal's menu and Kišib's page: "Yes, accessible from both sounds good" (section 10).*

*Founding cMIP, EXPERIMENTAL. Not approved, not a product; test identities only until MOR is frozen.* Written against the Identity MIR draft 15 (the signing key, bindings, sequences and rule 35, the lines a change of keys keeps), the Envelopes MIR draft 11 (everyday acts, private acts and the sealed container), the Agreements MIR draft 17 and the Money MIR draft 11 (what always asks), and the identity carry Module, draft 2 (the encryption key a signing key's words carry). It fills no task and puts nothing on MOR: it is how two programs on one computer talk. Its hash stays a draft hash until its creator is named at step 17. Its code: `clients/kishib/src/runner.ts` (the runner), `clients/kishib/src/server.ts` (its doors), `clients/kishib/seal/main.swift` (the seal in the macOS menu bar), `clients/dub/src/runner.ts` (the first app to use it), `clients/damgar/src/damgar.ts` (a lane's record).

*Reading this document: normal text is the specification. Italic text is commentary. Choices the decisions did not fix are marked **(mechanic, this draft's)**. What changed since draft 1 is marked **New in draft 2**, and since draft 2 **New in draft 3**, each with its reason.*

## In plain words

*Today every app holds the signing words of the identities it uses. The runner is a second way: you give an identity's signing words to Kišib once, on your computer, and the apps you approve ask Kišib to sign for them. The app never holds the key. Each time it asks, Kišib draws a small panel inside the app's own window, says in plain words what it will sign, and waits for your click. For small things (posts, messages, names, your contacts list) you may say "always yes" for one app and one kind; money, agreements, relying on another's act, and keys always ask.*

*It is off until you turn it on, and Kišib says the risk first. When you turn it on, you choose a passphrase, typed twice. What the runner keeps (the keys, the apps you paired, what it signed) is written on this computer encrypted under that passphrase, never in the clear. Close Kišib, or restart the computer, and the runner is* ***locked****: everything stays, encrypted; reopening Kišib asks the passphrase, and everything is back, no app paired again. Turn it* ***off****, and everything is erased. Forget the passphrase, and the way out is to turn it off and give the signing words again.*

*New in draft 2: you may also let an app* ***open what is sealed to an identity****: then Dub reads the private messages sent to the identity, and keeps its contacts list sealed to it, through Kišib. Opening signs nothing, so there is no panel each time; each opening is listed in Kišib.*

*New in draft 3: that choice is made* ***for each identity, in each app****. Kišib also holds* ***your own keys for your collectives****, as it holds your own key: an app asks Kišib to add one, you approve it in Kišib, and acting as the collective, the app asks and Kišib's panel shows each act before Kišib signs it; the key never goes to the app. A payment made under an app's own* ***lane*** *has its record kept in Damgar: Kišib signs that one kind of act without a panel, and lists it. And on the Mac,* ***Kišib's seal in the menu bar*** *shows whether the runner is off, locked or on, and offers Open Kišib, Lock now, Quit Kišib and Turn off.*

*Why the apps talk to Kišib directly.* The working rule says apps talk through MOR: what one app prepares for another travels as acts, sealed to oneself where private (17 October 2026). The runner is its one exception (decided), for the reason Nobody, allegedly, gave: **the asking app holds no key, so it cannot put a draft on MOR.** Every act on MOR is signed; an app with no key cannot sign even the request. So the request travels from the app to Kišib on this computer alone, and only the act Kišib signs goes to MOR, as any act does. *An opening is the same exception, for the same reason: the app holds no key that opens what is sealed to the identity.*

## 1. The two programs, and where they talk

1.1. **The runner** is a program on the person's computer (Kišib's program) holding signing keys of identities given to it (section 6). **An app** is another program on the same computer (Dub's, first) that uses an identity through it.

1.2. **On this computer only.** They talk over the loopback interface (`127.0.0.1`); no network, no relay, no home. The runner answers nothing that arrives by another address or names another host. *How an app finds the runner is the app's: Kišib's folder names the port its program listens on.* **(mechanic, this draft's)**

1.3. **Two doors.** The runner has a door for apps (sections 2 to 5 and 8: pairing, requests, answers, openings) and a door for the panel (section 4), which only a browser frame inside a paired app's window opens. The runner's own page (Kišib's) approves pairings, answers what waits, keeps standing yeses, and asks the passphrase, under the runner's own access rules.

1.4. **Never in the web client.** *New in draft 2, said as decided: "Correct, I meant not on web."* A runner is a program that keeps running and keeps keys out of the browser. **The computer's programs carry it, on the Mac and on Linux (Kišib's program on either); a web client neither runs one nor uses one.** *Draft 1 said "Mac only"; Nobody, allegedly, meant "not on the web". The Linux program is the same program as the Mac's, so it carries the runner as built.*

## 2. Pairing

2.1. **Started in the app.** The app asks to pair, naming itself (its name, as people know it: "Dub") and **its origin**, the address its own page is served from (`http://127.0.0.1:PORT`). The runner answers with a **pairing code** (eight characters, in two groups) and a **token**, a secret the app keeps. The token is good for nothing until the pairing is approved. **(mechanic, this draft's)**

2.2. **Approved in the runner.** The runner's page shows the app's name, its origin and the code; the app shows the same code. The person compares them, chooses **which identities held here the app may use**, **and, for each of them, whether the app "may open what is sealed to this identity"** (section 8; **new in draft 2**, off unless chosen; **chosen per identity, new in draft 3**), and approves, or refuses. *The code is what ties the app on screen to the pairing on screen: a second program asking at the same moment shows another code.*

2.3. **What a pairing holds.** The app's name and origin; the token's hash (never the token); the identities it may use; its standing yeses (section 5), none at first; **for which of them it may have what is sealed to them opened** (new in draft 2; per identity, new in draft 3); when it was approved.

2.4. **The app learns the answer** by asking with its token: waiting, refused, approved (with the identities it may use, each with its ID and current signing key and **the public parts of the member keys Kišib holds for it** (section 9; new in draft 3), **and which of them it may have opened**; and the member keys it asked Kišib to add, still waiting), or revoked.

2.5. **Revocable.** The person revokes a pairing in the runner's page at any time: its token stops working at once, its waiting requests are dropped, **its openings end** (new in draft 2), and the app is told "revoked" at its next request. An app may also unpair itself. The opening choice is changed in the runner's page, for each app and each identity, at any time. Removing an identity from an app only unlinks it there: the runner keeps the key until the identity is removed from the runner or the runner is turned off.

## 3. A request

3.1. **What the app sends.** A request names **the identity** (an ID the pairing allows), **the line** it goes on (`public` or `private`, F376; or `apart`, an act on a line of its own, section 7.3), and **the act to be signed**, field by field, as the Envelopes MIR builds an everyday act: its specification, type and payload (the payload's exact bytes), public or private, `to`, `objects`, `refs`, `acks`, the binding it is signed under, and the line's act IDs so far, oldest first (its sequence). The app's name is the pairing's, never the request's word.

3.1a. **As a collective** (new in draft 3, section 9). A request may instead name **a collective the identity is a member of** (`as`), on **its member key's own strand** (`line: member`), its binding the identity's signature naming that key, its sequence the strand so far, its objects the decision it acts under: the member keys cMIP's act of a collective. Any other request naming a collective, or a member line without one, is refused (3.4).

3.2. **The runner builds the act.** It builds the act from exactly these fields (salt, content key and nonce its own) and signs it with the identity's signing key: what it shows is read from the bytes it signs, never from a summary the app gives. It sends nothing to MOR: it returns **the signed act, its ID and, for a private act, its content key**, and the app sends it, seals it, keeps its line, as for an act it signed itself.

3.3. **Its fingerprint.** A request's fingerprint is the SHA-256 of its fields in deterministic CBOR (`[identity, line, spec, type, payload, public, to, objects, refs, acks, binding, sequence]`, absent fields as null; **new in draft 3**: followed by the collective, for an act as one). The same request asked again (the app restarted, the panel closed) is the same request: the runner answers it once, and gives the same signed act again rather than signing twice. **(mechanic, this draft's)**

3.4. **Refused before anything is shown**, each said in plain words, nothing signed:
- the runner is off; **or locked (new in draft 2: "Kišib is locked: its runner signs and opens nothing until its passphrase is given in Kišib", section 6.4)**; or the token is not a pairing's, or the pairing is waiting, refused or revoked;
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
- **Sign it**, **Decline**; and "Money, agreements, relying on another's act, and keys always ask."

4.4. **The approval.** The person's click is a form sent from inside the frame to the runner, carrying a single-use value the runner wrote into that panel and nowhere else: the app's page, which cannot read the frame, cannot make the click itself. Signed, the frame says so; declined, it says nothing was signed. **(mechanic, this draft's)**

4.5. **The signature returned.** The app asks for its request's answer, and may wait for it: **signed** (the act, its ID and content key), **declined**, **waiting**, or **expired**. A panel closed without an answer leaves the request **waiting** in the runner's page, where it can be answered; the app that still waits then has its answer. A request waits ten minutes; then it expires, nothing signed. Requests waiting live in memory only: closing Kišib drops them, nothing signed. **(mechanic, this draft's)**

4.6. **The gap, accepted (decided).** A malicious app can cover the frame, or trick a click on it. The runner's page lists every act signed (section 6), so a click tricked shows there. *The frame protects the panel from the app's page, not from a program running as the person on the same computer while the runner is unlocked (section 9).*

## 5. Kinds of act, and standing yeses

5.1. **Each act's kind is the runner's reading of its bytes**, never the app's word:

| Kind | What | A standing yes |
| --- | --- | --- |
| Posts | Public text acts (posts, replies, corrections); public publications (a picture, a film, a document) and their withdrawal | allowed |
| Messages | Private text acts | allowed |
| Names | A display name, and its withdrawal (the naming cMIP) | allowed |
| Contacts | The follow list, sealed to oneself or published (the people cMIP) | allowed |
| Money | The Money MIR's acts; the payment, anchoring, grant-limits and money messages cMIPs' (a draft for the money app, a lane asked) | **never: always asks** |
| Agreements | The Agreements MIR's acts (terms, signatures, offers, contests, records, resignations); **relying on another's act** (a witness act, Identity type 15) | **never: always asks** |
| Keys | Every other Identity MIR act (routes, a successor's confirmation); an encryption key published; a key delivered to anyone but the identity itself; a member key | **never: always asks** |
| Other | An act of a specification the runner does not read | **never: always asks** |

**(mechanic, this draft's: the kinds' edges.)**

5.2. **A standing yes** is per pairing and per kind: "Dub's posts". Given from the panel's box or the runner's page, withdrawn in the runner's page. Under it, the runner signs a request of that kind for that app at once, without a panel, after every check of section 3, and lists it in what it signed.

5.3. **Money, agreements, relying on another's act, and keys always ask**, whatever was said before: no box offers it, and a standing yes stored for them is ignored, as is a box ticked in a crafted form.

5.4. **Relying always asks.** *New in draft 2, said as decided: "Ok, agreed".* Relying on another identity's act (Dub's Rely, a witness act) keeps that act standing should its author ever disown it: a commitment more than a post. It is in the group that never takes a standing yes, with money, agreements and keys, and its panel always shows, whatever the app's standing yeses. *As built in draft 1; draft 2 says it in the words the person reads ("Money, agreements, relying on another's act, and keys always ask").*

5.5. **An act as a collective always asks** (new in draft 3; decided: Kišib "signs with them itself through its panel"). No standing yes is offered or kept for it, whatever its kind; the panel says "as the collective …, with *the identity's* own member key".

## 6. What is kept, and when: off, locked, on

6.1. **Three states.** *New in draft 2, decided: "Yes, agreed".*
- **Off**: nothing kept. No key, no pairing, no record. It refuses every request ("the runner is off"). Off by default.
- **On**: the runner signs (and opens, section 8) for its apps. What it keeps is in its folder, encrypted (6.3), and, while on, also in the program's memory.
- **Locked**: Kišib closed (its program quit), or the computer restarted, while the runner was on; or **Lock now**, in the runner's page and, on the Mac, its seal in the menu bar (section 10) **(mechanic, draft 2's; new in draft 3: Quit Kišib beside it, and in the seal)**. What it keeps stays in its folder, **encrypted under the passphrase**: keys, pairings, the log of what it signed and opened. It signs and opens nothing, and refuses every app's request, saying Kišib is locked (6.4).

6.2. **Turned on with the risk said first**, and read, **and a passphrase chosen** (new in draft 2):
- the passphrase is typed twice, the same both times, at least 8 characters **(mechanic, this draft's)**, and asked each time Kišib starts with the runner on;
- **forgotten, it cannot be found again**: the runner's keys stay unreadable; the way out is to turn the runner off (6.5), which erases everything, then turn it on with a new passphrase and give the signing words again, and pair each app again. This is said when it is chosen;
- the risk, said before it is turned on (**new in draft 2**, now true as written): the signing keys of the identities given to it are kept on this computer, encrypted under the passphrase; **whoever gets into the computer while Kišib is open and unlocked can sign as them through Kišib, within what was allowed**; the folder alone gives nothing without the passphrase; **still at risk: someone who saw the passphrase typed, or guesses it, and a computer taken, or a program running as the person, while Kišib is open and unlocked**; forgetting the passphrase means the words given again; closing Kišib locks it; an app allowed to open reads private messages without asking each time; turning it off erases everything. The risk is optional: the runner may stay off for good.

6.3. **Encrypted at rest** (new in draft 2, decided: "Agreed, it needs to be protected", option (b)). The runner's file, in its folder, readable by its owner only, holds **nothing in the clear** but how to open it:
- **the key**: 32 bytes derived from the passphrase (Unicode NFC) with **scrypt** (RFC 7914), a memory-hard function: N = 2¹⁷, r = 8, p = 1, about 128 MiB of memory; a random 16-byte salt chosen each time the runner is turned on;
- **the seal**: everything it keeps, as JSON, sealed with **AES-256-GCM**, an authenticated cipher: a fresh random 12-byte nonce at each write, the 16-byte tag appended, and the file's label, the derivation's parameters and the cipher's name authenticated with it (additional data), so that none of them can be changed unseen;
- **the file**: `{label, kdf: {name, N, r, p, salt}, cipher, nonce, sealed}`, the salt, nonce and sealed bytes in base64;
- **inside the seal**: each identity given to it (its ID, **its signing key**, its current binding and homes, **and its member keys for its collectives**, new in draft 3, section 9); each pairing (section 2.3); the member keys apps asked it to add, waiting; and **what it signed and opened**, each with when, for which app, its kind, its words as shown, its ID, its line and position (for an act signed) or how many times (for an opening);
- **in memory only**: the requests waiting, and, while on, the key derived from the passphrase; never written.

**(mechanic, this draft's: scrypt and AES-256-GCM, rather than Argon2id and another cipher. Both are standard and memory-hard or authenticated as decided; scrypt and AES-256-GCM are in the computer program's own standard library, so the runner adds no dependency. The parameters are written in the file, so a later draft may raise them.)**

6.4. **Locked, and opened again.** *Kišib's program runs apart from its window: closing the window alone leaves the program running, and the runner unlocked. So the runner's page says so, and offers* ***Lock now*** *(and, new in draft 3,* ***Quit Kišib****, here and in the seal in the menu bar, section 10),* which forgets the key and everything opened from memory, keeps the file as it is, and drops the requests waiting, nothing signed.* Kišib started with a runner file asks the passphrase first, on its first screen and in the runner's page, and shows **"Runner locked"** top right. Given, the file is opened and everything is back as it was when Kišib closed: the keys, the apps paired (none pairs again), their standing yeses and opening choices, the log. **A wrong passphrase opens nothing**, and is said ("That passphrase does not open Kišib's runner: nothing was opened"); the runner stays locked. While locked, the runner answers each app's request, signing or opening, with: "Kišib is locked: its runner signs and opens nothing until its passphrase is given in Kišib (Runner). Open Kišib and give it; nothing has to be paired again."

6.5. **Turned off**, from on or from locked, it **erases everything** of 6.3: the file is overwritten, then removed; every pairing ends; nothing of it remains. Turned on again, it starts from nothing: the risk read, a passphrase chosen, the words given again, each app paired again. *"Turn it off" is said as erasing everything, never as pausing.*

6.6. **Never the chain key.** The runner is given an identity by its **signing key's words**, checked against the key its homes serve (the carry Module), and refuses a chain key's words, said plainly.

6.7. **Removing an identity** from the runner forgets its key and its record; the pairings that named it lose it.

6.8. **Draft 1's file**, found when Kišib starts (its keys in the clear): the runner is locked until a passphrase is chosen, typed twice; then everything is sealed under it, and the clear file overwritten. **(mechanic, this draft's)**

## 7. Lines

7.1. **The app's lines, signed by the runner.** An identity used through the runner signs, for each app, **on that app's lines**: its public line and its private line (F376), as if the app held the key. The app keeps them, as for any identity it holds, and names them in each request (3.1); the runner checks that an act goes on the line of its kind. *So a change of keys finds and places every line as before: the public line read by anyone, the private one by its card (F373).*

7.2. **The cards.** The app shows its cards as for any identity (Dub: the identity's menu, Line and homes). The runner, while on, also knows the latest act it signed on each app's line, and **gives these cards itself** to a change of keys made in Kišib for an identity it holds: written into the review's cards, said as coming from the runner, to be checked and completed with the other apps' cards. *A card is the app's or the runner's word (F376's stated cost); the runner's is the same as the app's, since it signed the line's latest act.* **(mechanic, this draft's)**

7.3. **The key delivered to oneself.** An app leaves each private act at the identity's homes with its content key delivered to the identity itself (F373), an act on a line of its own (`apart`). The runner signs it **with the act it belongs to**, without a panel, where it delivers to the identity itself exactly the content key of a private act the runner signed for the same app and identity; any other key delivery is a key (5.1).

7.4. **After a change of keys**, the runner's held key no longer counts (3.5): given the new words, it signs under the new binding, and the app starts new lines under it (3.4).

7.5. **A lane's record, without a panel** (new in draft 3; decided: "Yes, if establishing lanes it has to be setup this way"; Damgar's round 3, question 2). An app holding a lane of the identity (a grant of the identity to itself, granted in Damgar) signs its payments with the lane's key, not through the runner. For Damgar to keep the record of each, the act's content key is delivered to the identity itself, which takes a signature with the identity's own key. The runner signs **that one kind of act without a panel**: a key delivery (Envelopes type 1) **to the identity itself**, of the content key of an act that the runner reads at the identity's homes, opens with that key, finds to be the identity's own act signed under another binding than its key's (a grant), and judges valid as any reader of its homes would. *Signed with the lane's key, the act shows that the app holds the lane.* It moves no money and gives nothing to anyone else. Each is listed in Signed ("signed without asking: a lane's record, to the identity itself"). Any other key delivery is a key act, asked in the panel (5.1). **(mechanic, this draft's: the check.)** *The app leaves the act, locked, at the homes first, then asks for its key's delivery.*

## 8. Opening what is sealed to an identity

*New in draft 2, decided: "Yes". Draft 1 signed and opened nothing, so an app using an identity through the runner sent private messages but could not read the answers.*

8.1. **The permission.** When approving an app, the person may choose **"may open what is sealed to this identity"**, **off unless chosen**, **for each identity the app may use** (new in draft 3; decided: "since an app can run multiple identities, per identity, per app"). It is shown, and changed, per identity, in each app's line in the runner's page. Revoking the app ends it. *A pairing from draft 2, whose one choice covered every identity it may use, is read as that choice for each of them.*

8.2. **The request.** An app allowed to sends the runner **the identity** (one the pairing allows) and **the sealed containers** it found addressed to it (the Envelopes MIR's sealed container, in base64), at most 100 at once. **(mechanic, this draft's)**

8.3. **No panel.** An opening signs nothing, so the runner shows no panel for it. It opens each container as the identity, with **the encryption key the identity's signing words carry** (the carry Module, draft 2), after the checks of 3.4 that apply (off or locked, the token, the pairing, the identity), and refuses where the app may not open: "Kišib does not open what is sealed to this identity for this app: it may send, not read. To allow it, in Kišib: Runner, Apps, 'may open what is sealed to this identity'." *The key check of 3.5 is not made: an opening puts nothing on MOR, and a key a change of keys retired still opens what was sealed to it.*

8.4. **What is returned**, for each container, in order: **the act inside, and its content key** where the act is private (the key that opens that act alone, as the sender sealed it), or nothing where the container does not open with the identity's key. **What is never returned: the identity's encryption key, its signing key, a member key (section 9), or anything that opens another container.** The app reads the act and judges it with the core library, as for an act it opened itself. *Said as decided, new in draft 3: "Understood and agreed". A member key sealed to the identity is an act holding a key; Kišib holds member keys itself (section 9), and an app using an identity through Kišib asks Kišib to add one rather than opening it.*

8.5. **Each opening counted.** The runner lists each container it opened in what it signed (Kišib's Signed), said as an opening: **which app, what kind of act** (the kinds of 5.1, read from the act inside: "Opened for Dub: a private message, from mid1…. Nothing was signed."), when last, and how many times the app had it opened. A container opened again is counted on its line, not listed twice.

8.6. **Dub, the first.** For an identity used through Kišib, Dub opens through the runner, where allowed, the private messages sent to the identity (its inbox) and **its contacts list sealed to itself** (the people cMIP, section 3), which it then keeps sealed as for an identity it holds. Where it may not, Dub says plainly that it can send but not read, and how to allow it in Kišib; where Kišib is locked or not running, it says that. Containers it could not open for that reason are read again once it can.

## 9. Member keys held, and acts as a collective

*New in draft 3, decided: "kišib should be able to hold your key and the keys you hold for your collectives". A member of a collective holds its own key for it (the member keys cMIP; F353), sealed to the member at its homes; an app holding the member's signing words opens it and acts as the collective with it. An app using the identity through Kišib holds no words: Kišib, which does, holds the member key too.*

9.1. **Added, from the app's ask, approved in Kišib.** An app asks the runner to hold the identity's key for a collective, naming the identity (one the pairing allows), the collective, and the places it reads the collective at. The ask waits in the runner's page (Held here, and Waiting): "Dub asks Kišib to hold Max's key for a collective". Approved, the runner opens the member keys sealed to the identity at its homes with the encryption key the identity's signing words carry (the member keys cMIP, as any app holding the words does), takes the one whose founding is the collective's, and **keeps it with the identity, encrypted at rest under the passphrase** (6.3). Not found, it is said, and nothing kept. Refused, nothing is kept. **(mechanic, this draft's: the ask, its places.)**

9.2. **Signing as the collective.** An app acting as the collective sends a request as a collective (3.1a). The runner refuses where it holds no key of the identity for that collective, or where the request names another member key than the one it holds; otherwise it shows its panel, always (5.5), and signed, it returns the signed act, as for any act. **The member key never leaves the runner**: an app learns of it only its public parts (the founding that named it, the signature naming it, its position), to build its request.

9.3. **Held here.** The runner's page lists, under each identity held, the collectives whose key it holds, each with when it was added and **Remove**.

9.4. **Forgotten** with the identity (6.7), when removed, when the runner is turned off (6.5), and, from memory, when it is locked (6.4). The member key itself stays sealed to the identity at its homes, untouched.

9.5. **Without the runner, nothing changes.** An app holding the identity's words finds the member key itself, as before.

## 10. Kišib's seal in the macOS menu bar

*New in draft 3, asked by Nobody, allegedly: "can it be shown in the top bar on macOS, so one knows it is active?"; "Yes, I do want it". Described as the Mac program's, not a part of the protocol: no other runner need have it.*

10.1. **Why.** Kišib.app on the Mac is a launcher with no Dock icon, and closing a Mac window never ends its program ("Closing a Mac window never ends its program. To end it one must close the app"). The seal gives Kišib a place to be seen and to be quit; quitting locks the runner (6.4).

10.2. **Its look** follows the runner: **off**, a hollow seal; **locked**, a padlock; **on**, a full seal; and **a number** beside it while something waits for the person (a request, a pairing, a member key's ask). **Its menu:** Open Kišib (its page, paired by a one-time link; the app started where its program is not running), **Lock now**, **Quit Kišib**, and **Turn off** (asked first: it erases everything, 6.5). **Lock now and Quit Kišib are in both the seal's menu and Kišib's page** (decided: "Yes, accessible from both sounds good").

10.3. **Its door.** A small native helper (Swift, the only way to reach the menu bar), its source in Kišib's folder, built by Kišib's `scripts/make-app.sh` where Apple's command-line tools are present (said plainly where they are not). It talks to Kišib's own program on this computer only (1.2): the port from Kišib's folder, and a token Kišib's program writes there at each start, readable by its owner only, sent in a header no web page may send without asking first. It reads the runner's state and asks for Open, Lock now, Quit and Turn off; it holds no key and keeps nothing. Never on Linux, never on the web. **(mechanic, this draft's)**

## 11. Costs, stated

- **Closing Kišib's window does not lock it.** Its program keeps running, unlocked, until it is quit, the computer restarts, or **Lock now** is pressed (in the page, or in the seal in the menu bar): said where the runner is on, and in the risk.
- **Keys on the computer, encrypted.** While on or locked, signing keys are kept in the runner's folder, encrypted under the passphrase (6.3). **Still at risk** (new in draft 2): someone who saw the passphrase typed, or guesses it (the file can be tried offline; scrypt makes each guess slow, not impossible: a long passphrase is the defence); and, **while Kišib is open and unlocked**, whoever gets into the computer, or any program running as the person, can sign through Kišib within what was allowed, read the program's memory, or watch the passphrase typed.
- **A forgotten passphrase.** Nothing recovers it: the runner is turned off, and the words are given again (6.2).
- **The click.** A malicious app can cover or trick a click (decided, accepted). What was signed is listed in the runner's page.
- **Member keys on the computer** (new in draft 3): held with the identity, encrypted at rest as its key is, and at the same risks (6.2); an app acts as the collective only through the panel.
- **A lane's record without a panel** (new in draft 3): Kišib signs, unasked, key deliveries to the identity itself of acts signed under its lanes; they move no money and give nothing to anyone else. Each is listed.
- **The seal's token** (new in draft 3): any program running as the person can read Kišib's folder and so lock, quit, or turn off the runner (the last erasing everything) through the seal's door, as it can already stop the program; it cannot sign through it.
- **Opening without asking.** An app allowed to open reads every private message sealed to the identity, and its sealed contacts list, without a panel each time (decided). Each opening is listed; revoking the app ends it. The content key of each act opened is given to the app, as the act itself is.
- **The app's words on the line.** The app chooses the line and its sequence; the runner checks the line's kind, not its history. An app that lies about its line harms only its own line.
- **One computer.** The runner serves apps on the same computer only: a phone signs with its own words.
- **The runner must be running, and unlocked,** for its apps to sign and open.

## 12. Tests

Run (`clients/kishib/test/runner.test.ts`, `runner-lines.test.ts`, `runner-draft-2.test.ts`, and `runner-browser.test.ts`, by clicks; Dub's side is run through them, Dub's program beside Kišib's). Draft 1's, kept: off by default, nothing kept; turned on, the risk read first; Dub paired from its identity panel and approved in Kišib; a post signed through the runner, its panel drawn inside Dub's window, unreadable from Dub; a standing yes for posts, then a post signed with no panel; money and an agreement always asking; Waiting after a closed panel; what was signed; Revoke, then Dub refused; turned off, every key gone (Kišib's folder read whole); after a change of keys, the runner refusing until the new words are given; an unpaired origin refused by the slot, and the panel refused in another app's frame; an identity held by the runner posting and messaging from Dub, then changing keys from paper, every line placed, nothing in red.

**New in draft 2**: the passphrase chosen when the runner is first turned on, typed twice (two that differ refused, by clicks too); Kišib's folder read whole holding no key in the clear, nor the identity's ID; Kišib restarted asking it ("Runner locked" top right, its first screen asking); a wrong passphrase refused, nothing opened; a forgotten one: the keys unreadable, the runner turned off, on again from nothing, the words given again. Locked: Kišib closed with the runner on, reopened, the passphrase given: pairings, standing yeses and the log back, Dub signing again with no new pairing; while locked, Dub's request refused, said plainly. Off: every key, pairing and log entry gone (the folder read whole); turning on again starts from nothing. Opening: Dub approved with "may open", a private message from someone else read in Dub for an identity used through Kišib, counted in Signed; its contacts list sealed to the identity through the runner, read back with the identity's own key; Dub approved without it, the reply not readable, said plainly, then read once allowed; the identity's key never returned; revoked, refused. Rely through the runner: always the panel, no standing yes offered or kept. A draft 1 file sealed under a passphrase chosen. The web client: no runner, as before (`web-build.test.ts`).

**New in draft 3** (`clients/kishib/test/runner-draft-3.test.ts`, `seal-door.test.ts`, `desktop.test.ts`, and `test/mac/seal.test.ts` on GitHub's macOS machines; `clients/damgar/test/act-menu.test.ts`): opening per identity, two identities used through Kišib by Dub, one allowed and one not, one's private message read and the other's not, said plainly, then allowed for that identity alone; a member key: an identity used through Kišib, a member of a collective founded in Edubba, its key asked by Dub and added in Kišib, a post as the collective from Dub signed through the panel (no standing yes offered) with the member key, the act signed by the collective and bound to the member's signature, Kišib's folder holding no member key in the clear and Dub's none at all; an act as a collective whose key Kišib does not hold refused; a lane's record: a lane asked from a Dub using the identity through Kišib (its panel), granted in Damgar, a tip under it with no panel at all, its key delivered to the identity by Kišib unasked and counted in Signed, Damgar keeping the payment's record, nothing left sealed; any other key delivery to the identity still asking; the seal's door: its token new at each start, the states (off, locked, on, a number while something waits), Open Kišib, Lock now, Turn off, Quit Kišib from the seal and from the page, each quitting locking the runner; the seal compiled on GitHub's macOS machines and run against Kišib's program in its command-line modes; make-app.sh starting the seal, and saying plainly where Apple's tools are not there to build it. Not run by a machine: the seal seen in the menu bar and its menu clicked (a person on a Mac).
