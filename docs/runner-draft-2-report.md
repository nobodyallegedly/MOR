# The Dubsar runner, draft 2: report

*22 October 2026. The Dubsar Suite session that built the runner's draft 2 from the five answers Nobody, allegedly, gave to round 2's questions (`docs/kishib-runner-report.md`, section 5). Finding **F378**. The cMIP: `cmips/cmip-runner-draft-2.md` (draft 1 kept as it was). Test identities only; regtest or signet only.*

## 1. In plain words first

**What changed for the person using the runner:**

- **A passphrase.** Turning the runner on in Kišib now asks you to choose a passphrase, typed twice. Kišib tells you, before you choose it, that a forgotten passphrase cannot be found again. Everything the runner keeps (the signing keys you gave it, the apps you paired, the list of what it signed) is written on your computer **encrypted under that passphrase**, never in the clear. Someone who copies Kišib's folder gets nothing readable without it.
- **Locked, not lost.** When Kišib's program stops (you quit it, or the computer restarts), the runner is **locked**. Reopen Kišib: top right says **Runner locked**, and its first screen asks the passphrase. Give it, and everything is back: no app has to pair again. You can also lock it at once with **Lock it now**. While it is locked, Dub is told plainly: "Kišib is locked…".
- **Closing the window is not quitting.** Kišib's program keeps running after its window is closed, and the runner stays unlocked. Kišib now says so where the runner is on, and in the risk. This is question 1 below.
- **Off means erased.** **Turn it off** erases everything: keys, apps, the log. Kišib says it in those words. Turned on again, it starts from nothing. That is also the way out of a forgotten passphrase: off, on with a new passphrase, the signing words given again, each app paired again.
- **Dub can read the answers.** When you approve Dub in Kišib, you can tick **"Dub may open what is sealed to this identity"**. It is off unless you tick it, and you can change it later under Runner › Apps.
  - With it ticked, Dub reads the private messages sent to an identity it uses through Kišib, and keeps that identity's contacts list sealed to it, as for an identity it holds itself.
  - Dub still holds no key. No panel appears for an opening, because an opening signs nothing. Each opening is listed in Kišib's Signed, saying which app and what kind of act.
  - Without it, Dub says plainly that it can send but not read, and how to allow it. What it could not read is read once you allow it.
  - Revoking Dub ends it.
- **Relying always asks**, as before. It is now said in the words you read: "Money, agreements, relying on another's act, and keys always ask."
- **Never on the web.** The runner is in Kišib's program on the Mac and on Linux, never in the web client. "Mac only" now reads this way everywhere.

**What did not change.** The panel inside Dub's window, the standing yeses, the key check, the lines and the cards all work as in draft 1. The chain key is still never given to the runner.

## 2. Each of the five answers, and how it is built

### Answer 1. The keys protected at rest: "Agreed, it needs to be protected", option (b)

- **The passphrase.** It is chosen when the runner is turned on, typed twice, and must be at least 8 characters (a mechanic of this draft). Kišib's page shows two password fields under the risk, with what forgetting it means.
- **When Kišib starts** with a runner file present, the runner is **locked**. The passphrase is asked on Kišib's first screen and in Runner › On or off.
- **The scheme** (cMIP 6.3):
  - **The key:** derived from the passphrase with **scrypt** (RFC 7914), a memory-hard function: N = 2¹⁷, r = 8, p = 1, about 128 MiB of memory. Its 16-byte salt is new each time the runner is turned on.
  - **The cipher:** **AES-256-GCM**, an authenticated cipher, with a fresh 12-byte nonce at every write. The label, the derivation's parameters and the cipher's name are authenticated with the content, so none of them can be changed unseen.
  - **On disk:** the file holds only `{label, kdf, cipher, nonce, sealed}`.
  - **In memory only:** the derived key, while the runner is on; never written.
  - *Why scrypt rather than Argon2id:* both are standard and memory-hard. scrypt and AES-256-GCM are in Node's standard library, so the runner adds no dependency. The parameters are written in the file, so a later draft can raise them.
- **A forgotten passphrase.** It cannot be recovered. The runner is turned off, which erases everything, then turned on with a new passphrase, and the signing words are given again.
- **The risk, as said before turning on** (`RISK_SAY`). It is now true as written:
  - whoever gets into the computer **while Kišib is open and unlocked** can sign as the identities through Kišib, within what you allowed;
  - the folder alone gives nothing without the passphrase;
  - **still at risk:** someone who saw your passphrase typed, or guesses it; a Mac taken, or a program running as you, while Kišib is open and unlocked.
- **A file left by draft 1** (keys in the clear): Kišib starts with the runner locked and asks for a passphrase to be chosen, typed twice. The file is then sealed, and the clear copy overwritten (cMIP 6.8; tested).
- **Where it lives:** `clients/kishib/src/runner.ts` (`turnOn`, `unlock`, `lock`, `save`, `derive`); the page's parts in `src/page/view.ts` (`unlockBox`, `runnerOnOff`) and `src/page/ui.ts`.

### Answer 2. Opening what is sealed to an identity: "Yes"

- **The choice.** It is a box when approving an app, **"Dub may open what is sealed to this identity"**, off unless ticked. Each app's line under Runner › Apps shows it as No / Yes, changeable at any time (`setOpen`). Revoking the app ends it.
- **The request** (cMIP section 8). Dub sends `POST /runner/open` with the identity and up to 100 sealed containers found addressed to it. The runner opens each one as the identity, with the encryption key its signing words carry (the carry Module).
  - **Returned:** for each container, the act inside and that act's content key, or nothing.
  - **Never returned:** the identity's encryption key, its signing key, or anything that opens another container. A test checks this.
  - The content key is question 2 below.
- **No panel**, since an opening signs nothing. **Each opening is counted in Signed:** "Opened for Dub: a private message, from mid1…. Nothing was signed.", with the kind and how many times. A container opened again is counted on its line, not listed twice.
- **Dub** (`clients/dub/src/dub.ts`, `opener`; `people.ts`, `Opener`; `runner.ts`, `open`):
  - **What it reads:** its inbox (the replies to its private messages) and its sealed contacts list are now read through the runner where allowed. The contacts list is then kept sealed as for any identity: a new version is signed through the panel (kind: contacts) and sealed to the identity's published encryption key.
  - **Where it may not read:** it says plainly that it can send but not read, and how to allow it in Kišib (`RUNNER_NO_OPEN_SAY`). Containers left unopened for that reason are marked and read again once it can.
  - **When Kišib is locked or not running:** it says that.

### Answer 3. Relying always asks: "Ok, agreed"

Relying was already in the group that never takes a standing yes, with money, agreements and keys. Kept. It is now said wherever the person reads it:
- the panel's foot ("Money, agreements, relying on another's act, and keys always ask");
- Waiting and Apps;
- the risk and the refusal of a standing yes;
- the cMIP (5.3, and 5.4 with the decision quoted).

Tested: with every allowed kind given a standing yes, a Rely still shows the panel. No box is offered, and a box ticked in a crafted form is still not kept.

### Answer 4. Locked and off, two states: "Yes, agreed"

- **Locked** (`state: 'locked'`). The file stays, encrypted. The runner refuses every app's request, signing or opening, with "Kišib is locked: its runner signs and opens nothing until its passphrase is given in Kišib (Runner). Open Kišib and give it; nothing has to be paired again."
  - Top right says **Runner locked**, and the Runner tile says it too.
  - Given the passphrase, the pairings, their standing yeses and opening choices, and the log are all back. No app pairs again.
  - A wrong passphrase opens nothing, and says so.
  - Requests that were waiting for an answer lived in memory only. They are dropped when Kišib stops, nothing signed.
- **Off** (`turnOff`), from on or from locked. The file is overwritten, then removed: keys, pairings and the log are gone. Turned on again, it starts from nothing.
  - The button reads "Turn it off, and erase everything".
  - Its box says what is erased and that turning on again starts from nothing; the confirmation says it again.
- **Lock it now** (`lock`). *A mechanic of this draft, added because of what building showed:* Kišib's program runs apart from its window. Closing the window alone leaves the runner unlocked. See question 1.

### Answer 5. "Mac only" means never in the web client: "Correct, I meant not on web"

As built: Kišib's program carries the runner on the Mac and on Linux, and the web client has no Runner tile and no runner operation (`web-build.test.ts`, unchanged, green). The words now say "never in the web client" or "in the computer's program only":
- the cMIP (1.4);
- Kišib's and Dub's READMEs;
- the Runner tile;
- Dub's "Use one from Kišib" place;
- the code's comments.

### Tests

Kišib's suite (30 files, green) gains `test/runner-draft-2.test.ts` (six tests) and a second walk-through by clicks in `test/runner-browser.test.ts`:
- the passphrase: typed twice, two that differ refused, by clicks too;
- the folder read whole: no key, no words and no identity ID in the clear;
- restarted: locked; "Runner locked" top right and on the first screen;
- a wrong passphrase refused; a forgotten one handled;
- locked: Dub refused, said plainly; unlocked: everything back, Dub signing again without pairing; Lock it now;
- off: everything gone, on again from nothing;
- opening, approved with "may open": a message from someone else read in Dub (by clicks too), counted in Signed; the contacts list sealed through the runner and read back with the identity's own key;
- opening, approved without it: not readable, said plainly, then read once allowed; never the identity's key; revoked, refused;
- Rely always the panel;
- a draft 1 file sealed.

Draft 1's tests were adjusted only to type the passphrase and read the new risk words. Dub's suite (39) is green.

### The web releases

- **Kišib's** web release is rebuilt, as its README says (`npm run release`): its page changed. Its build check is green.
- **Dub's** web release is rebuilt too, as its README says. Its page changed, mostly in the words for an identity used through Kišib, which the web client never has; the one line the web client shows differently is its empty "Use one from Kišib" place ("…never in the web client" for "…on the Mac only").
  - This was possible because main released the display client, Dub, Damgar and Ummia from pull request 92's merge while this round was being built. Every web release now carries the same WebAssembly, the one this branch builds, as Dub's release test requires.
  - Both build checks are green on the merged branch.

### Building also showed

- **Closing Kišib's window does not quit Kišib.** The Mac app starts its program in the background, so "Kišib closed" in a person's sense does not lock the runner. Hence Lock it now, the words where the runner is on, and question 1.
- **A card's menu closed under the hand, in Dub.** After a post, Dub said "Posted." and only then read its feed again, drawing it anew, which closed a card's menu opened in between. CI caught it once in Dub's long browser test, which was also intermittent in round 2. Dub now reads the feed before saying "Posted." (`clients/dub/src/page/ui.ts`), and its release is rebuilt with it.
- **Dub frames Kišib's origin as it was when Dub started** (its policy's `frame-src`). Kišib always uses port 8474 on the Mac, so this holds. A Kišib moved to another port would need Dub restarted. Unchanged from draft 1; stated here.

## 3. For the MOR lead

**Nothing for the MOR lead.** No MIR, MICS, freeze test or verifier's verdict changed.
- The runner is a Dubsar cMIP and puts nothing on MOR but ordinary acts. Opening uses the sealed container as the Envelopes MIR defines it, with the encryption key the carry Module already derives from the signing words.
- Shared code touched: `clients/dub/src/people.ts` (`readSealedList` takes an opener as well as keys). `clients/desk` (Edubba) calls it with keys, unchanged.
- No file outside the brief's list was changed: `clients/kishib`, `clients/dub`, `cmips/`, the records. `clients/genesis` and `clients/kit` needed no change.

## 4. Questions for Nobody, allegedly

One at a time, each with my lean.

**Question 1. Should quitting Kišib be one gesture?** Today, closing Kišib's window leaves its program running, and the runner unlocked. To lock it, you press **Lock it now**, quit the program from Terminal, or restart the computer. Kišib says this where the runner is on, and in the risk.
- *My lean:* keep Lock it now, and add **a "Quit Kišib" button** beside it in a later round, which stops the program and so locks the runner.
- I would not lock automatically when the window closes: the program cannot tell a closed window from a phone's page going to sleep.

**Question 2. The content key of each act opened.** For each container it opens, the runner returns the act inside and that act's content key. That key opens that one act and nothing else, as the sender sealed it. It never returns the identity's encryption key or signing key.
- *My lean:* keep it. Dub needs the act and its key to judge it with the core library, as it does any message it opens itself.
- The alternative is for Kišib to judge the act and return only its words. Dub would then have to trust Kišib's verdict, and Kišib would carry more code.

**Question 3. The opening choice is per app, for all the identities that app may use.** You said "may open what is sealed to this identity". Built, the box is one per app, covering every identity you let that app use. With one identity, which is the usual case, they are the same.
- *My lean:* keep it per app until an app uses two identities through Kišib, then make it per identity.

**Question 4. The member keys sealed to an identity used through Kišib.** Dub reads a collective's member key from what is sealed to the identity. "May open what is sealed to this identity" could cover it, so that Dub posts as a collective's member through Kišib.
- *My lean:* yes, in a later round, under the same choice. It is the same opening, and acting as a member still signs through the panel.

## 5. Human test steps

*Test identities only. On the Mac, as Kišib's and Dub's READMEs say ("Using it"). The build window cannot reach the deployed homes.*

1. **Install once**, from the MOR folder: `git pull`, then `cd clients/genesis && npm install && npm run wasm`. Then run `npm install` in `clients/desk`, `clients/site`, `clients/kit`, `clients/dub` and `clients/kishib`. Then run `sh scripts/make-app.sh` in `clients/dub` and in `clients/kishib` (on Linux: `make-desktop.sh`).
2. **Choose the passphrase.**
   - Double-click **Kišib**, then open Runner › On or off. Read the risk: it says the keys are encrypted under your passphrase, and what is still at risk.
   - Type two different passphrases: refused, still off. Type the same one twice, tick "I have read the risk", then **Turn it on**.
   - In Terminal, `cat ~/mor-kishib/runner.json` shows only `label`, `kdf`, `cipher`, `nonce` and `sealed`: no ID, no words.
3. **Give an identity and pair Dub.**
   - In Kišib, Identities › Held here: the identity's ID, a home, and its **signing** words (Dub: the identity's menu › Words).
   - In Dub: the identity panel, **+ Add › Use one from Kišib**, Ask Kišib to pair.
   - In Kišib, Runner › Apps: compare the code, tick **Dub may open what is sealed to this identity**, then **Approve**.
   - In Dub: I approved it in Kišib, then **Use it**.
4. **Open a private message through the runner.**
   - From another identity (another Dub, or the web client on the phone), send this identity a private message.
   - In Dub, open Private and the conversation: the message reads in full.
   - In Kišib, Runner › Signed: "Opened for Dub: a private message, from …", "opened, nothing signed".
   - To see the other side: Runner › Apps › Dub may open… › **No**. Dub's Private then says it can send but not read, and how to allow it.
5. **Close and reopen Kišib.**
   - Quit Kišib's program: in Terminal, from `clients/kishib`, `node --import tsx src/cli.ts stop`. Or press Runner › **Lock it now**, or restart the Mac. Closing the window alone leaves it unlocked.
   - In Dub, post: Dub says **Kišib is locked**.
   - Double-click Kišib: top right says **Runner locked**, and the first screen asks the passphrase. A wrong one: "does not open". The right one: back to the tiles, the Runner tile on.
6. **Dub signing again without pairing.** In Dub, post. Kišib's panel appears in Dub's window; **Sign it**. No pairing was asked. Runner › Apps still lists Dub, and Signed still lists what came before.
7. **Turn the runner off.**
   - Runner › On or off, **Turn it off, and erase everything**. The confirmation says it erases everything.
   - `~/mor-kishib/runner.json` is gone. In Dub, posting says Kišib no longer knows this app.
   - Turning it on again asks for a new passphrase and starts from nothing.
