# The Dubsar runner, draft 3; Kišib's seal in the menu bar; Rely and Anchor in Damgar: report

*22 October 2026. The Dubsar Suite session that built the runner's draft 3, Kišib's seal in the macOS menu bar, and Rely and Anchor in Damgar's act menu, from the answers Nobody, allegedly, gave to the questions of `docs/runner-draft-2-report.md` and `docs/damgar-r3-report.md`. Finding **F382**. The cMIP: `cmips/cmip-runner-draft-3.md` (drafts 1 and 2 kept). Test identities only; regtest only.*

*The brief named the design note's section "The runner's draft 2", items 6 to 8, as the decisions this round builds. `docs/design/suite-redesign.md` on main has no such section; the decisions were built as the brief quotes them, word for word, and the cMIP quotes them the same way.*

## 1. In plain words first

**What changed for the person:**

- **Opening, one identity at a time.** When you approve Dub in Kišib, each identity Dub may use has its own box: "may open what is sealed to this identity". You can let Dub read one identity's private messages and not another's. Runner › Apps shows a No / Yes beside each identity, for each app.
- **Your collectives' keys, in Kišib.** For an identity Dub uses through Kišib, Dub can act as one of your collectives:
  - Choosing **A collective under it** in Dub asks Kišib to hold your key for that collective. You approve it in Kišib (Held here, or Waiting).
  - From then on, each post as the collective shows Kišib's panel in Dub's window, every time, and Kišib signs it with that key.
  - The key never goes to Dub, and it is kept encrypted with your identity's own key.
- **Lanes work through Kišib.** A payment Dub makes under its own lane from Damgar now has its record kept in Damgar (Account › Under the lanes). To do that, Kišib signs one kind of act without asking you: the payment's key, delivered to your identity itself. It moves no money, and Kišib lists each one in Signed.
- **Kišib's seal in the Mac's menu bar.** A small seal beside the clock shows whether the runner is off (hollow), locked (a padlock) or on (full), with a number while something waits for you. Its menu offers **Open Kišib**, **Lock now**, **Quit Kišib** and **Turn off** (which asks first, because it erases everything).
- **Quit Kišib**, on the page too. Lock now and Quit Kišib are now both in the seal's menu and on Kišib's page (Runner › On or off). Closing Kišib's window still does not end it; quitting does, and it locks the runner.
- **Rely on it and Anchor it in Damgar.** In Damgar's act menu, below the line, on every act:
  - Each asks which of the card's acts you mean: its receipt first, then its claim, then the request that began it.
  - **Rely on it** signs a witness act once you type RELY.
  - **Anchor it** reads an anchoring service's offer. Once you choose a tier, Damgar prepares the payment and signs its request at once; you pay the invoice in To pay. The anchor shows in **Account › Anchors**.

**What the Mac session must check on the screen.** GitHub's macOS machines compiled the seal and ran its talk with Kišib's program (the states, Open Kišib, Lock now, Quit Kišib, Turn off). No machine there has a menu bar to look at, so a person on a Mac must check:
1. The seal appears in the menu bar once Kišib is opened.
2. Its look changes with each state: hollow while off, a padlock while locked, full while on, a number while a request waits.
3. Each item of its menu works by click:
   - Open Kišib opens the page.
   - Lock now locks.
   - Quit Kišib ends the program and the seal.
   - Turn off asks first, then erases.
4. Quitting from the page leaves the seal hollow within two seconds, saying "Kišib is not running"; its Open Kišib then starts Kišib again.
5. Without Apple's command-line tools, `make-app.sh` says plainly that the seal is not built, and Kišib works without it.

The steps are in section 5.

## 2. Each decision, and how it is built

### Decision 1. Opening per identity, per app ("since an app can run multiple identities, per identity, per app")

- **The pairing.** It now keeps the identities whose sealed acts it may have opened (`opens`). A pairing from draft 2, whose one choice covered all its identities, is read as that choice for each (`opensOf`).
- **Kišib's page.** Approving has a box beside each identity. Each app's line under Apps has a No / Yes per identity (`setOpen` with the identity).
- **The refusal.** `open` refuses an identity not chosen, with the plain words "it may send, not read", and says how to allow it.
- **Dub and Damgar** check their own identity (`p.opens.includes(me.id)`).
- **Tested.** Two identities used through Kišib by Dub, one allowed and one not. One's private message is read, the other's is not, said plainly. Then the second is allowed for that app alone, and read.

### Decision 2. Opening returns only the act and its content key ("Understood and agreed")

As built in draft 2. The cMIP now says it as decided (8.4), and adds that a member key is never returned.

### Decision 3. Kišib holds your keys for your collectives ("kišib should be able to hold your key and the keys you hold for your collectives")

- **The ask.** An app asks over `POST /runner/member`, naming the identity, the collective and where it reads the collective. The ask waits in Held here and Waiting.
- **Add it.** Kišib, which holds the identity's words:
  - opens the member keys sealed to the identity at its homes, with the member keys cMIP's own `readMemberKeys`, as any app holding the words does;
  - takes the one whose founding is the collective's (`memberKeyFor`);
  - keeps it with the identity, encrypted under the passphrase (`members` on the held identity).
- **Signing as the collective.** An app asks with `as: collective`, on the member key's own strand (`line: member`). Kišib:
  - checks that the binding is the signature naming the key it holds;
  - shows its panel, always ("as the collective …, with Max's own member key"; no box for a standing yes);
  - signs with the member key.
- **What the app learns.** Only the key's public parts (`paired` lists the founding, the signature and the position), so it can build its request.
- **Dub.** Its existing paths, through Kišib:
  - **A collective under it** asks Kišib to add the key, and says so;
  - choosing the collective checks again once it is approved;
  - posting as the collective asks Kišib (`RunnerLink.request`).
- **Without the runner, nothing changes.**
- **Tested** with a collective founded in Edubba:
  - its member, used through Kišib by Dub, has its key asked and added;
  - a post as the collective is signed through the panel, signed by the collective and bound to the member's signature;
  - no member key is in Kišib's folder in the clear, nor any in Dub's;
  - an act as a collective whose key is not held is refused.

### Decision 4. Lanes through Kišib ("Yes, if establishing lanes it has to be setup this way")

- **What Kišib signs without a panel.** One kind of act: a key delivered to the identity itself, for an act Kišib reads at the identity's homes and finds to be:
  - opened by that key;
  - the identity's own act;
  - signed under another binding than its key's (a grant);
  - valid, as any reader would judge it (`underOwnLane`).

  Signed with the lane's key, the act shows the app holds the lane. Each one is listed in Signed: "signed without asking: a lane's record, to the identity itself". Any other key delivery asks, as before.
- **The app's side** (`laneRecordThroughKisib`, in Damgar's engine, which Dub's lane payments run through; Dub now hands it the runner): the locked act goes to the homes first, then the key delivery is asked of Kišib, sealed to the identity's own key, and left there.
- **Tested.** A lane is asked from a Dub using Alice through Kišib (its panel) and granted in Alice's Damgar.
  - A tip under it shows no panel at all; its record is counted in Kišib's Signed.
  - Alice's Damgar keeps the payment's record, with nothing left sealed.
  - A key delivery for an act that is no lane's still asks.

### Decision 5. The seal in the menu bar ("can it be shown in the top bar on macOS, so one knows it is active?"; "Yes, I do want it"; "accessible from both")

- **The helper** (`clients/kishib/seal/main.swift`) is plain AppKit and Foundation.
  - Its look follows the runner's state: SF Symbols `seal`, `lock.fill` and `seal.fill`, and a number while something waits.
  - Its menu: Open Kišib, Lock now, Quit Kišib, and Turn off (an alert asks first).
  - Its command-line modes (`--state`, `--lock`, `--quit`, `--off`, `--open`) make the same calls as the menu.
- **Its door in Kišib's program** (`/seal/state`, `/seal/open`, `/seal/lock`, `/seal/quit`, `/seal/off`) takes a token that Kišib writes in its folder at each start (`seal.json`, owner only) and removes when it stops.
- **Quit Kišib** locks the runner, then ends the program (`quit` in `serve`, wired to exit in the command line).
- **The page.** Kišib's page gains **Lock now** and **Quit Kišib** (Runner › On or off), with what closing a window does not do.
- **`make-app.sh`** builds the seal into Kišib.app when `xcrun swiftc` is there, and says plainly when it is not. The app's launcher starts the seal once.
- **The new CI job** (`.github/workflows/kishib-seal-macos.yml`, on GitHub's macOS machines):
  - compiles the seal;
  - checks it says "not running" with no program;
  - builds the core library;
  - runs `test/mac/seal.test.ts` (the compiled seal against Kišib's program: the states, Open, Lock now, Quit locking the runner, Turn off) and the door's test.

  It passed on its first run.
- **Other tests.** `seal-door.test.ts` runs everywhere: the token, the states, Quit from the seal and from the page each locking the runner. `desktop.test.ts` checks the launcher.

### Decision 6. Rely and Anchor in Damgar's act menu ("Agreed")

- **The menu.** Damgar's cards now offer the kit's Rely on it and Anchor it below the line (`signs: true`). Each card keeps its acts, receipts first, then claims, then the request that began it, and both forms ask which one.
- **Rely** (`rely`) refuses one's own act, checks the key (H80, through Kišib where used through it), and signs the witness act once RELY is typed.
- **Anchor** (`anchorOffers`, `anchor`) reads the service's standing offers and prepares the anchor's draft as a pasted draft is, keeping its blind (`book.anchored`). It signs the invoice request at once: one step. The service's invoice is then paid in To pay, and the payment, with its ticket, shows in Account › Anchors.
- **Tested** (`clients/damgar/test/act-menu.test.ts`, against a test anchoring service on a fake chain):
  - an act anchored from Damgar, paid, and shown in Anchors;
  - its receipt relied on: RELY needed, and one's own claim refused;
  - after a change of keys made in Kišib, Rely refused until Damgar has the new words, then allowed;
  - the receipt itself anchored, a second entry in Anchors.

### Releases, and every test

- **Web releases.** Every web release that bundles the core's WebAssembly is rebuilt as its README says, on main merged in after S7b and S7c changed the core (the MOR lead's request, 22 October 2026): the display client (`clients/site`), Edubba, Ummia, Dub, Kišib and Damgar. Each is built with `npm run release` and the tools its `BUILT-WITH.txt` names (rustc 1.97.0, wasm-bindgen 0.2.129). All six share one WebAssembly, each `npm run test:build` is green, and no source changed.
- **The site's test 15** (`clients/site/test/browser.test.ts`, line 612), *the MOR lead's decision, 22 October 2026*: the refusals it expects on the hostile page now include "inline event handler". GitHub's runner image of 21 October has a newer Chrome, which reports the hostile page's `onload` and `onerror` while the display client parses the page. The older image passed, the new one failed, on this branch and on pull request 96 alike. The test's other assertions still check that nothing ran and that no handler is left. `clients/site/README.md` says so where it lists the refusals.
- **Every test.** Every existing suite is green locally. The one exception is `clients/assess`'s two quote checks, which fail the same way on main and are not run by CI.

## 3. For the MOR lead

**Nothing for the MOR lead.** No MIR, MICS, freeze test or verifier's verdict changed.
- Acts as a collective are the member keys cMIP's acts, unchanged.
- A lane's record is an ordinary key delivery to oneself (Envelopes type 1).
- The seal is the Mac program's, not a part of the protocol.
- Code outside the four apps' own: none (`clients/grants` and `clients/kit` were read, not changed). Outside them, only the rebuilt releases of the display client, Edubba and Ummia, and the one line of the site's test 15, both at the MOR lead's request (section 2, Releases).

## 4. Questions for Nobody, allegedly

One at a time, each with my lean.

**Question 1. Signing a collective's proposal with the member key held in Kišib.** In Dub's Signing tab, a collective's act that waits for a second key is signed, where the app holds the member key, with that key (F353). For an identity used through Kišib, Dub signs instead with the identity's own key, through Kišib's panel, which counts as before.
*My lean:* bring it to Kišib's panel in a later round, the same way as posting as the collective. It is one more request of the same kind.

**Question 2 (after question 1). Which member keys Kišib holds.** Built: a key is added only when an app asks for that collective and you approve it. Kišib could instead take every member key sealed to the identity when you give it the words.
*My lean:* keep it per ask. Kišib then holds only the keys you use through it, and each was approved by you.

**Question 3 (after question 2). The seal at login.** Built: the seal starts with Kišib, when Kišib.app is opened, and goes when Kišib quits. It could also start at login, showing a hollow seal ("Kišib is not running") until Kišib is opened.
*My lean:* not yet. The seal means "Kišib is here"; a seal without Kišib would say less.

**Question 4 (after question 3). A lane's record when the homes do not answer.** Kišib signs a lane's record without a panel only once it has read the act at the identity's homes. When they do not answer, the delivery is asked in the panel instead, and one click lets it through.
*My lean:* keep it. Silence proves nothing (as for the key check), and the panel is the safe fallback.

## 5. Human test steps

*Test identities only, regtest only. On the Mac, as Kišib's, Dub's and Damgar's READMEs say ("Using it"). The build window cannot reach the deployed homes.*

1. **Install once**, from the MOR folder, in Terminal:
   - `git pull`;
   - `cd clients/genesis && npm install && npm run wasm`;
   - `npm install` in `clients/desk`, `clients/site`, `clients/kit`, `clients/dub`, `clients/damgar` and `clients/kishib`;
   - **Apple's command-line tools**, if not yet installed: `xcode-select --install`;
   - `sh scripts/make-app.sh` in `clients/dub`, `clients/damgar` and `clients/kishib`. Kišib's prints "made Kišib's seal in the menu bar". Without the tools, it says plainly that the seal is not built.
2. **The seal through each state.**
   - Double-click **Kišib**: the seal appears in the menu bar, **hollow** (off).
   - Runner › On or off: read the risk, choose a passphrase twice, **Turn it on**. The seal is **full**.
   - Pair Dub (Dub: + Add › Use one from Kišib, Ask Kišib to pair). While it waits, a **1** shows beside the seal.
   - Approve it in Kišib (next step).
3. **Lock now and Quit, from the seal and from the page.**
   - The seal's menu › **Lock now**: a **padlock**. In Kišib's page, give the passphrase: **full** again.
   - Runner › On or off › **Lock now** on the page: a padlock. Give the passphrase again.
   - The seal's menu › **Quit Kišib**: the page stops answering and the seal goes away. Double-click Kišib: the seal is a **padlock**, and the first screen asks the passphrase.
   - Runner › On or off › **Quit Kišib** on the page: "Kišib has quit", and the seal turns hollow: "Kišib is not running". Its menu › **Open Kišib** starts it again.
   - Finally, the seal's menu › **Turn off…**: it asks first, then erases everything. The seal is **hollow**.
4. **Opening per identity.**
   - Turn the runner on again and give it two test identities (Identities › Held here).
   - In Kišib, Runner › Apps: approve Dub for both, ticking "may open what is sealed to this identity" beside **one** only.
   - From another identity, send each a private message.
   - In Dub, use the first: Private shows the message. Use the second: Private says Dub can send but not read, and how to allow it.
   - In Kišib, tick **Yes** beside the second: Dub reads it.
5. **Acting as a collective's member through Kišib.**
   - With an identity that is a member of a collective founded in Edubba, used through Kišib in Dub: its menu › **A collective under it**, then the collective's ID. Dub says it asked Kišib.
   - In Kišib, Held here (or Waiting): **Add it**. The collective shows under the identity.
   - In Dub, choose the collective in the identity panel and post: Kišib's panel says "as the collective …, with … own member key". **Sign it**: the post is the collective's.
6. **Rely and Anchor on a receipt in Damgar.**
   - In Damgar, open a payment's card (Account › Payments) › its act ID › **Rely on it**: choose the receipt, type RELY, **Sign the witness act**.
   - Then **Anchor it**: choose the receipt, give the test anchoring service's ID, **Read its offer**, choose a tier, **Anchor it: sign the payment's request**.
   - When the service answers, pay its invoice in Waiting › To pay. **Account › Anchors** lists the anchor.
