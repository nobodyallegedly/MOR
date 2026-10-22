# Every line of acts can be found by Kišib: the report

*21 October 2026, a Dubsar Suite session. Branch `claude/private-lines-at-homes`, from main after pull request 81 (H80). Finding F373. Answers H80's question 2 (`docs/h80-report.md`). Author: Nobody, allegedly.*

## 1. In plain words

**What was wrong.** Each app keeps its own line of acts for an identity. When Kišib changes the identity's keys, it keeps each line by naming that line's latest act, which each app shows as its "card". Kišib can tie a card to the identity only if the identity's homes hold that act. And after the change, anyone checking that an act on the line still counts (Damgar checking your member key, for one) must follow the line back, act by act, opening each one.

Three things stood in the way:

1. **The messages sent while founding a collective never reached your own homes.** That covers the invitations, the word that it was founded, a member's answer, and the asks to another holder for a second key. They all went through one shared piece of code (`negotiate`, in `clients/repo/src/proposals.ts`) that left the message only in the other person's inbox. When the message was an app's latest act (Edubba's after a founding, Damgar's after a promise for a collective), the app's card named an act your homes never had. That is exactly what H80 found.
2. **A message you sealed to someone else could be opened by no other app of yours**, even when its locked form was at your homes. Damgar, reading your member key after the change, could not follow Edubba's line through Edubba's invitations. So the key counted as "cannot tell", and Damgar said "No key of yours for this collective".
3. **Kišib cannot open private acts**, so each private act that follows another private act looked like a line of its own. Once the messages were at the homes, Kišib listed seven such "lines" in the H80 test and offered to leave them all out.

**What is fixed.**

- **Every private act every app signs now goes to the identity's own homes in two forms.** The first is the locked act: anyone can see that it exists, no one what it says. The second is a way for your own apps to open it. An act addressed to yourself (a draft, a note, a list, a member key) is sealed to you, as before. An act addressed to someone else has its key delivered to you, sealed to you, by a separate small act kept off the app's line. MOR's rules allow nothing else: a message to someone cannot be sealed to anyone it does not name. If a home is away, the act waits in the identity's file and is sent again before the app next shows its card.
- **A collective's chain-key shares are the one exception.** No app of the founder may open them (F337), so they are signed on a line of their own and never left at the homes. They are void after the founder's next change of keys, by which time each member has already opened theirs once.
- **Each app's card names only an act the homes hold.** It also says how many acts of its line Kišib cannot place by reading, and which app it is: `<latest act> <position> <summary> <count> <App>`. Where the latest act is not at the homes yet, the app shows no card. It says so, and sends the act again each time its window is read. Where acts of the line are missing from the homes for good (sent before this fix and no longer held), the card says how many (`missing 2`), and Kišib says so in red.
- **Kišib places every line.** It ties each card to an act the homes hold. It adds up the apps' counts and compares the total with what the homes hold. When they agree, every private act it cannot read lies on a line whose card was given: those acts are kept with their lines, nothing is left out, and nothing needs ticking.
- **Kišib says in red, before anything is signed, when it cannot place a line.** It names the app whose line it is, what lives on it, and what leaving it out would mean. This covers a card whose latest act is not at the homes, an app that reports acts missing, or counts that fall short. The person must tick that they have read it, or nothing is signed.

The H80 case, rebuilt in a test: after A's change of keys, every line is placed, nothing is left out, Damgar still finds A's member key, and it signs the collective's promise with it.

**What is not fixed, and is the first question below.** A **public** act that comes after a private act on the same app's line (a founding signed in Edubba after a payment draft, say) becomes **unknown** to everyone else after a change of keys. Only your own apps can open the private act behind it, so no other reader can follow the line back. Found while writing the test, reproduced, and put to Nobody, allegedly, as question 1. It is not new: it has held since apps first mixed private and public acts on one line.

## 2. Every app, every kind of private act

"Locked act at the homes" is what Kišib needs. "Opened by your other apps" is what Damgar needs to follow a line. **Before** is how it was on main; **now** is this branch. Each app is one code on the Mac and on the web, so each row holds for both.

### Dub (`clients/dub`)

| Private act | Before | Now |
| --- | --- | --- |
| A sealed message (`message`) | locked act at the homes; opened by no other app | **fixed**: its key delivered to you, sealed, at the homes |
| The follow list, sealed to yourself | at the homes, sealed to you; its locked act left only if the sealed form went first | **fixed**: the locked act always left |
| An answer to a proposal: accept, decline, a resignation's word (`negotiate`) | **never at the homes** | **fixed**: locked act, key delivered |
| A member key (`sealMemberKey`) | at the homes, sealed to you | at the homes (unchanged; the locked act's leaving shared) |
| A key delivered to a buyer of a sealed post (`delivery.ts`) | locked act at the homes; opened by no other app | **fixed**: key delivered to you |
| A lane request to Damgar (`sendToSelf`) | at the homes, sealed to you | unchanged, shared code |
| Tips, buys, payments under a lane | signed with the lane's grant key: on the grant's strand, not the identity's line | not affected (Identity: a rotation judges only acts signed with the key it replaces) |

### Edubba (`clients/desk`; the web Edubba runs the same code)

| Private act | Before | Now |
| --- | --- | --- |
| A sealed message, an agent's prompt, an answer, a nudge, a pick (`Desk.signAndSend`, private) | locked act at the homes; opened by no other app | **fixed**: key delivered to you |
| An agent's notes and diary, a retirement (`Desk.sealToSelf`) | at the homes, sealed to you | unchanged |
| A member key, at a founding or member change (`real.ts`) | at the homes, sealed to you | unchanged |
| Invitations to a founding or member change, the word that it was founded (`negotiate`) | **never at the homes** | **fixed** |
| The founder's sealed shares (`sealShare`) | on the founder's line, **never at the homes**, opened by no app of the founder | **moved off the line** (a line of their own, never at the homes, F337) |
| The payee pointer's ask to the other holders (`signAndAsk`, `negotiate`) | **never at the homes** | **fixed** |
| A payment, an anchoring, a sale's confirmation prepared for Damgar (`sendDraft`) | at the homes, sealed to you | unchanged, shared code |
| A key delivered to a buyer (`deliverKey`, Dub's code) | locked act at the homes | **fixed**: key delivered to you |
| A collective's key delivery, signed with a member key | the collective's act, not the member's line | not affected |
| A collective's own private acts, test mode (`collectives.ts`) | a collective's line, not a member's | not affected; a collective's rotation is Kišib's other path |

### Damgar (`clients/damgar`)

| Private act | Before | Now |
| --- | --- | --- |
| The accepted list (`writeAccepted`, shared with Ummia) | at the homes, sealed to you; locked act only if the sealed form went first | **fixed**: the locked act always left |
| Drafts, sales, lane requests sealed to yourself (`sendToSelf`) | as above | **fixed** the same way |
| Every sealed send: answers, invoice requests, requests, receipts, obligations, claims (`deliver`) | locked act at the homes; opened by no other app | **fixed**: key delivered to you |
| An ask to another holder for a collective's promise (`signAndAsk`) | **never at the homes**: H80's Damgar case | **fixed** |
| A vault transfer's record (`keepAtHomes`) | sealed to you at the homes | unchanged (its claim went through `deliver`, now with its key delivered) |
| Acts under a lane (grant key) | the grant's strand | not affected; left at the homes as before |

### Ummia (`clients/ummia`)

| Private act | Before | Now |
| --- | --- | --- |
| The accepted list | as Damgar's | **fixed**, shared code |
| An anchor's payment prepared for Damgar (`sendDraft`) | at the homes, sealed to you | unchanged |
| An ask to another holder for a collective's release (`negotiate`) | **never at the homes** | **fixed** |
| Specifications, MIP drafts and discussion, bug reports, releases | public | not affected |

### Kišib, and the rest

- **Kišib** signs a starter's announcement to the members and a member's share for a collective's rotation (`kishib/src/collective.ts`). Each starts a line of its own that no app continues, and its README already states the cost ("leaving it out of the member's next rotation voids nothing of value"). These stay off the homes (`negotiate`'s `home: false`), so they do not show up in the member's next change of keys as acts on no line.
- **The genesis client** (command line, `TestIdentity.deliverKey`) is not an app of the Suite: unchanged. Its private acts wait in the file's `unsent` until it sends them.
- **A collective's own identity** keeps nothing in `unsent`: its lines are the collective's, kept by its own rotation.

### The card each app shows

Dub's identity window ("This app's line"), Edubba's Identities tab ("This desk's line"), and Damgar's and Ummia's identity windows each show:

- the card, whole, ending with the app's name, but only once the homes hold its latest act;
- otherwise, that the latest act is not at the homes yet (the app sends it again each time the window is read) and not to change keys until the card shows;
- or that the homes did not answer.

What waits is sent in the app's own turn, so that no save overtakes an act being signed. The reading is remembered for a minute while the line does not move.

## 3. For the MOR lead

**Nothing that changes a rule.** Identity rule 35 is unchanged; no verdict of the core changes; nothing in `core/`, `relay/` or `spec/` was touched. Two points, for information:

- **Envelopes' addressing check holds, and shaped the fix.** An act addressed to someone else does not open for a recipient it does not name, and an act sent to a bare key must name no one. So a message cannot be sealed to its own signer. The apps deliver its content key to the identity by a key delivery (Envelopes type 1) addressed to the identity, signed on a line of its own. That is an ordinary use of the type.
- **A line that mixes private and public acts can be followed after a change of keys only by those who can open its private acts.** That is the identity's own apps, now that the keys are delivered. Every other reader answers unknown for the public acts behind the first private act (F298, rules 33 to 35), as the rules say. The apps can avoid it (question 1). If Nobody, allegedly, prefers a protocol answer instead (for one, a private act's position and predecessor readable on its outside), that would be the MOR lead's. My lean is that it is not needed.

## 4. Questions for Nobody, allegedly

One at a time; the next only once the one before is answered.

**Question 1. Public acts behind private acts on one line.** After a change of keys, a public act that comes after a private act on the same app's line is unknown to everyone but the identity's own apps. In the test: A's terms and signature for a collective, signed in Edubba after a payment draft, read unknown, and Damgar then cannot read the collective's agreement in force. Options:

- (a) Each app keeps two lines: its public acts on one, which anyone can follow, and its private acts on the other, kept by its card. Existing lines stay as they are, kept by their cards. *Cost:* two lines per app; the card only for the private one; a rule for the apps, not the protocol.
- (b) Each app sends nothing public after its first private act. *Cost:* absurd.
- (c) A protocol answer (the MOR lead's): something readable on a private act's outside that lets a reader follow the line through it. *Cost:* a frozen-text change, and every private act tells the homes more.
- (d) Leave it as a stated cost.

*My lean: (a), built by a Suite session, with a test that a founding signed after a private act stays valid for every reader after the founder's change of keys.*

*Answered by Nobody, allegedly, 21 October 2026: "Agreed", option (a). Built by the next Suite session (F376, `docs/two-lines-report.md`): each app keeps its public acts and its private acts on two lines; existing lines stay as they are, kept by their cards.*

**Question 2 (after question 1). The cost of your own apps reading your sent messages.** Each message you send is now readable again by whoever holds your encryption key, which your signing words carry: they reach its content key through the key delivered to you at your homes. Your member keys, drafts and accepted list were already readable that way. *My lean: accept it as a stated cost (it is what lets any of your apps follow your lines and keep your member keys), and say it in Dub's and Edubba's READMEs, as this branch does.* *Accepted as leaned, 21 October 2026: a stated cost, said in the READMEs (F376).*

**Question 3 (after question 2). Kišib trusts the apps' counts.** When the counts add up, Kišib keeps the private acts it cannot read with the cards' lines, with nothing to tick. A count is the app's own word; Kišib cannot check it. A thief's private act at the homes makes the counts fall short, so it is said in red and left out. An app that overcounts could hide one. *My lean: accept. The count changes only what Kišib says, never what the rotation keeps, and an app that lies about its own line could equally give a wrong card.* *Accepted as leaned, 21 October 2026: a stated cost, said in Kišib's README (F376).*

## 5. Human test steps (on the Mac)

*Checked against the READMEs of Dub, Edubba, Damgar, Ummia and Kišib as updated here. Test identities only; regtest only. Lines broken before this branch (messages that never reached the homes, no longer held by any app) cannot be mended: Kišib says so in red ("missing"). So start with new test identities.*

1. **Bring the Mac up to this branch.** In Terminal, from the MOR folder: `git pull`, then `cd clients/genesis && npm install && npm run wasm`, then `npm install` in `clients/desk`, `clients/dub`, `clients/kishib`, `clients/damgar` and `clients/ummia`, and rebuild each app as its README says (`sh scripts/make-app.sh`).
2. **Three test identities.** In Dub, make an identity **A** and write its chain key's 24 words on a paper. In two more Dubs (or Dub's web client), make **iPa** and **iPh**. Bring A into Edubba (Identities, by its ID and signing words), into Damgar and into Ummia.
3. **Private acts in every app.**
   - Dub (as A): send iPa a private message; follow iPa.
   - Edubba: found a real collective with iPa and iPh, its Money area held by A and iPa, one key, two above 10,000 (Collectives, Constitution). iPa and iPh sign it in Dub's Signing tab; gather and found it in Edubba. Then "Pay someone" from A, a small amount.
   - Damgar (as A): choose what you accept; add the collective ("For a collective") and sign a promise above the cap to iPa (iPa must have published where it is paid, in its own Damgar). Damgar says iPa was asked for their key.
   - Ummia (as A): accept one more specification.
4. **The four cards.** In each app's identity window (Dub: "This app's line"; Edubba: Identities, "This desk's line"; Damgar: "Damgar's line"; Ummia: "Ummia's line"), the line shows "its card, for Kišib" ending with the app's name. If an app says its latest act is not at the homes yet, read the window again: it sends it. Copy each card whole.
5. **The change of keys, in Kišib.** "Change an identity's keys": A's ID, a home, the chain paper's words; open "Lines another app made that cannot be read here" and paste the four cards, one per line. "Read it back": each app's line is said by name and **Kept**, one line says the other acts Kišib cannot read "lie on the lines kept by the cards given", and **nothing is in red**. Sign it, with the new paper and the new signing words, as Kišib's README says.
6. **The member key kept.** In Damgar, take the new signing words; sign the collective's promise again: "Signed for the collective with your own key". In Ummia, take the new words; the accepted list still reads.
7. **The red warning (optional).** Before step 5, copy only Dub's and Damgar's cards and leave out Edubba's: the review says in red that acts at the homes lie on no line whose card was given. "Sign it" is refused until the box under the red text ("I have read this: go on as it says") is ticked. Go back without signing.

## What changed, file by file

- `clients/genesis`: `src/private.ts` (new: `leaveAtHomes`, `sendWaiting`, `lineAtHomes`, `lineReader`, `ownActs`, `noLine`), `src/card-words.ts` (new: what the identity windows say), `src/lines.ts` (`unplaced`, `cardText`, the app names and what lives on each line, cards read with their count and app, `planLines` placing lines and saying in red what it cannot place), `src/identity.ts` (`unsent`, `signApart`); tests `test/cards.test.ts` (new), `test/world.ts` (`drop`: one item removed from a test home).
- `clients/repo/src/proposals.ts`: `negotiate` leaves its act at the signer's homes (unless `home: false`); `sealShare` signs apart.
- `clients/grants/src/member.ts`: the member key's locked act shared; `readMemberKeys` judges with every act the identity's apps can read; `resealMemberKeys` seals again every act sealed to the identity, both ways.
- `clients/dub`: `src/dub.ts`, `src/delivery.ts`, `src/shapes.ts`, `src/page/view.ts` (the line's words only); README.
- `clients/desk`: `src/desk.ts` (`lines`), `src/ops.ts` (`state`), `src/page/api.ts`, `src/page/view.ts` (the line's words only); README.
- `clients/damgar`: `src/damgar.ts`, `src/messages.ts`, `src/accepted.ts`, `src/shapes.ts`, `src/page/view.ts` (the line's words only); `test/collective.test.ts` (H80's case: every line placed, the member key kept); README.
- `clients/ummia`: `src/ummia.ts`, `src/shapes.ts`, `src/page/view.ts` (the line's words only); tests `test/private-lines.test.ts` (new), `test/kishib.test.ts` (the card copied whole); README.
- `clients/kishib`: `src/read.ts` (`placing`), `src/kishib.ts`, `src/collective.ts` (its own acts off the homes), `src/page/view.ts`, `src/page/ui.ts` (words only); README.
- Records: `docs/h80-report.md` (question 2 answered), F373 in `docs/findings/MOR-findings-log-round-2.md`.

No layout changed: in each window, only the words inside the existing line entry, and two labels in Kišib.

**The web clients.** Edubba's web release is rebuilt on this branch (`clients/desk/built`, the same bytes GitHub's machine builds, as its pull-request check requires). Dub's, Damgar's, Ummia's and Kišib's web releases are rebuilt on main only by a commit carrying `[release dub web]`, `[release damgar web]`, `[release ummia web]` and `[release kishib web]`: the merge should carry them, or the web clients keep today's behaviour until a machine session releases them. On the Mac, the apps run from source and need nothing more.
