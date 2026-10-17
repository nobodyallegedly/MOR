# Real collectives: report

*16 and 17 October 2026 (`docs/state-of-mor.md`, open item 1; H18 in `docs/human-tests-v1-findings.md`). A GitHub session: test identities only; nothing touched the servers. Branch `claude/real-collectives`, one pull request, not merged.*

## In plain words

Until now, every member of a collective, and every share of its chain key, was held in the founder's own Edubba, and members' consent was simulated. Now a collective can be founded by real people, each on their own device:

- **In Edubba**, the founder keeps a **contacts list** (identities added by ID with a name, kept on the Mac, plus those the agents follow), chooses the members from it or by ID, and **proposes the founding**. The terms are read back in plain words first. Each other member is sent the proposal, sealed to them, in their inbox. Edubba shows who has signed and who has not, and **founds the collective only once every member has signed**.
- **In Dub**, on any device (the web client included, so a phone), a **Signing** tab, off by default and labelled *even more experimental*, turned on in the identity window. While it is off, proposals wait. In it, each proposal is read in plain words before anything is signed (who is bound, who decides what, the stakes, how it ends, the risks, the words everyone signs), then **signed or declined**.
- **The chain key** is dealt by the founder's Edubba once everyone has signed: one share per member. Each member's share reaches their Dub **sealed to a one-time key** their Dub made when they signed. Dub shows it once, as a number and 24 words, labelled as the collective's chain key share; hides it; asks three words back; then **destroys the one-time key**, so the copy left on the relays can never be opened again, by anyone. A member in the same room can instead have their share shown on the founder's screen, hand to hand. The founder's own share is shown in Edubba once. **No app keeps any share.**
- **A member change** is proposed and signed the same way; its rotation needs enough members' paper shares and **waits for Kišib**.
- **A release** of the collective is published from Edubba and signed by members in their own Dubs; Edubba says when it counts.
- **Test mode** (every member held in Edubba, consent simulated) stays, labelled as such, for quick trials and the existing tests.

## The questions asked, and their answers

Asked one at a time, each changing what a person signs or keeps:

1. **How does a share travel to its member?** Nobody, allegedly (recorded under H18): **sealed to a one-time key, never to the member's usual encryption key**, since the usual one is derived from the signing words and a sealed copy stays on the relays; Dub makes the one-time key when the member accepts, holds its secret until the share is shown, then destroys it; also offer **hand to hand** on the founder's screen. Tests: the share opens once with the one-time key; afterwards the relay's copy opens with nothing the member holds; no folder or browser storage keeps a share or the secret.
2. **What does a member write on paper?** **"Number + 24 words"**: the share's number and its value as 24 words. The blinding value (used only to check a share against the dealing) is checked once by Dub when the share arrives, then dropped. At a rotation, the key is rebuilt from the papers and checked against the key the collective's own chain commits to; no published dealing is needed. *Cost:* a wrong paper is caught as "these shares do not rebuild the collective's chain key", without saying which one (each block of 24 words still has its own checksum against typos).
3. **Who does a member change's rotation until Kišib exists?** **"Wait for Kišib."** Member changes are proposed and signed in this session; the rotation is done only in the tests, with the repo client's code standing in for Kišib.

## What was built, precisely

| Where | What |
| --- | --- |
| `modules/airgap/src/shares.rs`, `wasm/src/lib.rs` | `paper` and `rebuild_from_paper`: a chain key rebuilt from share numbers and values alone (Lagrange at zero), checked against the commitment the collective's chain holds; a wrong or missing paper is `PaperMismatch`. WebAssembly: `shareOnPaper` (a share checked against its dealing, then its number and value) and `rebuildChainKeyFromPaper`. A Rust test. |
| `clients/repo/src/proposals.ts` | What travels, with nothing from Node: negotiation messages (`negotiate`, `readMessage`), the acceptance with its one-time key (`acceptanceText`, `oneTimeKeyOf`), a share sealed to a one-time key and found by its pickup tag (`sealShare`, `openShare`). |
| `clients/repo/src/collective.ts` | `foundingTerms`, `foundSigned` (founding once every party signed elsewhere; shares returned, never kept), `cloneFor` (a member change's clone, not signed), `rotateFromPaper` (the stand-in for Kišib). |
| `clients/repo/src/manifest.ts` | The release manifest's format moved out of `release.ts`, free of Node, so Dub can read a release. |
| `clients/dub/src/signing.ts`, `dub.ts`, `page/`, `web/` | The Signing tab: on and off per identity; proposals read in plain words; sign, decline; the share shown once, three words typed back, the one-time key destroyed; "received by hand". The web client's storage keeps the tab's state; its `node:crypto` stand-in now gives hexadecimal digests too (the repo client's spec hashes). |
| `clients/desk/src/real.ts`, `server.ts`, `page/` | Contacts; the founding, a member change and a release reviewed, then proposed and sent; answers gathered; founding and dealing; shares shown here once; test mode labelled. |

**Which messages carry what** (asked: "say which you use"):

- The proposal: an **Agreements negotiation message** (type 18, rule 52), private, sealed to the member's encryption key and left in its inbox, opening one thread per member; its first reference names the act to sign (founding terms, a clone, a release), its second the collective (after founding).
- The member's consent: the **Agreements signature act** (type 1), public, at the member's relays, where the act was found and, for a clone or release, at the collective's homes.
- The member's answer: a negotiation message in the thread, acknowledging the proposal, saying "Signed." (with its signature act, and for a founding or a member change the one-time key's public half) or "Declined." (with a reason if given).
- The founding's notice ("it is founded: …") is a negotiation message in each thread too.
- A share: a private Envelopes publication whose media is the air-gapped signer Module's share message (2.4), sealed to the one-time key alone, at the member's inbox relays, found by its pickup tag.

## Where the texts did not quite fit (readings, to confirm)

1. **Negotiation messages are defined for "two sides … that lead to a deal".** A founding is not a deal and has more than two sides. Reading: one thread per member, the founder one side and the member the other. They are talk, binding nothing, on neither of a collective's chains (rules 57 and 58, W6), which is what a proposal is.
2. **A negotiation message has no field for a key.** The one-time key's public half travels as a line of the acceptance's text (about 1,600 characters). A small field in the format, or a cMIP, would be cleaner.
3. **The Module's rebuild check on a second device** (5.1) is not made: the dealing Edubba checks that the shares rebuild the committed key itself, as test mode always did. With paper shares, any k members can make it later in Kišib. *Stated gap.*
4. **The founder's Edubba holds the collective's signing key** (the key grammar's one holder), as before.
5. **A share is lost if the app is lost before it is shown**: the one-time secret, in Dub, or the shares to show here, in Edubba's memory. The founding must then be dealt again (a member change, through Kišib).
6. **Fewer members need new numbers**: a member change that leaves the rules' numbers unfit (for example who judges absence) is refused in plain words; changing those numbers in the same proposal is not offered yet.

The full lists are in the READMEs: Dub's readings 14 to 17, Edubba's 17 to 22.

## Costs, stated

- **Two steps** to found: everyone signs, then the founder deals. The shares cannot be dealt earlier, since the key must not exist before the agreement does.
- **The one-time secret is held briefly**: in the member's Dub (its folder on the Mac, its browser storage on the web), from signing until the share is written down.
- **The founder's Edubba sees every share at dealing**, and the whole chain key for that moment: the air-gapped signer Module's stated price (F97). Nothing can prove it forgot them.
- **A lost paper share** weakens rotation as the collective's rule allows.

## Tests

- **Rust** (`modules/airgap`): paper shares rebuild the committed key from any two of three; one paper, a wrong paper, another key index, a duplicate are refused.
- **`clients/repo/test/proposals.test.ts`**: the whole exchange at the protocol level, with three identities; the rotation from two paper shares.
- **`clients/desk/test/real.test.ts`**: one Edubba and three Dubs, each its own program and folder: founding, shares, every folder read whole, a release, a decline, a member change, its rotation from two paper shares, the new shares.
- **`clients/desk/test/real-browser.test.ts`**: Edubba, Dub on the Mac and Dub's web client, each in its own headless Chromium, by clicks: founding, a waiting proposal, signing, shares, a release, every folder and the web client's storage read whole, a member change reviewed, test mode labelled.
- Every existing test passes (results in the pull request); the GitHub run is in the pull request.

Screenshots of every new screen were sent in the session.

## After the merge

- **Dub's web client** changed: its release must be rebuilt (a merge message containing `[release dub web]`, or the workflow by hand), then copied to the server in a server session, as before. Until then `dub.dubsar.org` has no Signing tab.
- The homes and relays need nothing new: the acts and sealed containers are of kinds they already take.

## The author's test with three devices (human test 10)

*Test identities only. Three devices: **A**, the Mac with Edubba (you, the founder); **B**, a second computer with Dub (Mac or Linux); **C**, a phone with Dub's web client at `dub.dubsar.org` (once it is updated after the merge; until then, use a third computer with Dub, as B).*

1. **Get the code**, on A and B, in Terminal, from the MOR folder:
   ```
   git fetch origin && git checkout main && git pull
   cd clients/genesis && npm install && npm run wasm
   cd ../desk && npm install && sh scripts/make-app.sh     # on Linux: sh scripts/make-desktop.sh
   cd ../dub && npm install && sh scripts/make-app.sh      # on Linux: sh scripts/make-desktop.sh
   ```
   On A, Edubba; on B, Dub. Each app restarts with the new code by itself.
2. **Places.** On A, Edubba, Settings: homes `https://home1.dubsar.org` and `https://home2.dubsar.org`, relays the same two. If a home limits new identities, allow each new test identity on its management page as before.
3. **Three identities, made separately.**
   - On A, Edubba, Identities tab, **+ A new identity**: "Nobody, allegedly (test)". Copy its ID.
   - On B, Dub: make a new identity (home and relay as above), write the chain key's words, type three back. Give it a display name, for example "B". In the identity window, **Copy ID**; send it to yourself.
   - On C, Dub's web client: the same, display name "C". Copy its ID.
4. **Contacts and the proposal**, on A, Edubba, Collectives tab, **+ Found a real collective**:
   - Under **Contacts**, add B's ID as "B" and C's as "C".
   - Name it, choose your test identity as founder, tick B and C. Keep the rules (any 2 of 3 rebuild the key; 2 sign a release; absence judged by 2).
   - **Review the founding**: read it all, then **Sign**. The founding appears in the list, "1 of 3 signed".
5. **Signing off waits**, on B: open the **Private** tab: "A proposal to sign waits … Signing is off". Nothing else shows it.
6. **Each member signs on their own device**, on B and then C:
   - Identity window: tick **Signing**, read the warning, accept. **Back to Dub**, then the **Signing** tab.
   - Read the proposal in full: who is bound, who decides what, how it ends, the risks, the words. Press **Sign it**, accept. It says "Signed", and that your share will come later.
   - (Optional, on one device, another time: **Decline** a proposal, to see the founder told.)
7. **Founding**, on A: press **Look for answers** on the founding: "3 of 3 signed", each with "one-time key received". (To try hand to hand, tick it for a member next to you.) Press **Found it: deal the shares**. Then **Show** your own share: write its number and 24 words on paper, press **It is written down**, type the three words asked.
8. **Each member's share**, on B and C, Signing tab: **Show my share of the chain key, once**. Write the share's number and 24 words on paper, labelled with the collective's name. Compare the dealing's fingerprint across the three devices: it must be the same. Press **I have written … down**, type the three words asked: "the one-time key is destroyed".
9. **Nothing kept**: on B, reload Dub: the share is not shown again ("Your share is written down"). Three papers, one per device, are now the only place the chain key exists.
10. **A release**, on A, the collective's page, **A release**: a small folder (a text file), a name and version 1. **Review the release**, **Sign**. Then on B or C, Signing tab: read the release (its files and fingerprints) and **Sign it**. On A: **Check it as anyone would**: it counts, signed by 2 members.
11. **A member change** (proposed and signed only; its rotation waits for Kišib): on A, the collective's page, **Change its members**: keep all three and add a fourth test identity by ID (made on any device), **Review the change**, **Sign**. Each of B, C and the fourth signs in their Signing tab. On A, **Look for answers**: every signature in, and "it waits for Kišib". Keep the new one-time keys' Dubs as they are: Kišib will send the new shares to them.
12. **Report**, as for every human test: what was clear, what was not, and anything that surprised you (`docs/human-tests-v1.md`, "How to report").
