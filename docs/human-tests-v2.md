# The author's human tests, version 2

*18 October 2026. For Nobody, allegedly. Written by the project lead's session from `docs/state-of-mor.md`, `docs/human-tests-v1.md`, the findings H1 to H37, and the human test steps at the end of each session's report. Every button, command and path below was checked against the apps' READMEs, the reports, or the apps' own code. Where a step could not be checked, it says **(to check)**.*

## What this sheet is

This sheet **replaces version 1** (`docs/human-tests-v1.md`). Version 1 named apps that are retired ("MOR Identities", now Edubba; "the collective client", now inside Edubba). This sheet also gathers, in one place, the human tests written at the end of each session's report: Kišib (9 and the end of 10), Damgar (11), Ummia (12) and Edubba's agents (13).

The machines already check that the rules hold. These tests check something they cannot: whether MOR makes sense to a person using it. Nothing needs to pass. Everything you notice counts.

**The rules.**

- **Test identities only.** Never your real identity, never a real collective.
- **Regtest only.** No real money, ever. The coins on regtest exist only on your Mac.
- **Never paste private keys or signing words into a chat** (Claude included). Words go on paper, and into the app that asks for them, nowhere else.
- **One line per observation:** what you did, what you expected, what happened, how it felt.
- **Mark** anything that was not in plain words, and anything that was not verified.

**Your devices.** The Mac (Apple silicon), the iPad and the iPhone (Safari). On the iPad and iPhone: no private browsing, and write each identity's signing words on paper too, since Safari may clear a site's storage after weeks without a visit.

---

## Part 1. Setup, once

### 1.1 Update the Mac

1. Open Terminal and go to the MOR folder (where you cloned it).
2. Get the latest code:
   ```
   git checkout main && git pull
   ```
   Check: it ends without an error.
3. Rebuild the core library for the apps (Rust 1.97.0; rustup fetches it the first time if it is missing):
   ```
   (cd clients/genesis && npm install && RUSTUP_TOOLCHAIN=1.97.0 npm run wasm)
   ```
   Check: no red error at the end. It can take a few minutes.
4. Install every client's parts (one long line):
   ```
   for p in grants desk dub kishib damgar ummia site longform barebone repo collective assess nudge manage connector reader reports testwallet anchoring-service; do (cd clients/$p && npm install); done
   ```
5. Make the five Mac apps:
   ```
   for p in desk dub kishib damgar ummia; do (cd clients/$p && sh scripts/make-app.sh); done
   ```
   Check: `~/Applications` now holds **Edubba**, **Dub**, **Kišib**, **Damgar** and **Ummia**, each with its own icon. Look at each icon: Dub's tablet with 𒁾, Edubba's house of tablets, Kišib's seal with 𒈩, Damgar's sleeping duck, Ummia's round tablet with 𒌝𒈪𒀀.
6. Update Claude's connector:
   ```
   (cd clients/connector && npm run add-to-claude)
   ```
7. **Quit Claude completely** (Claude menu, Quit), then open it again. Check: in Claude's Settings, Developer, "mor" is listed.
8. Open each app once by double-clicking it. Each opens a page in the browser, already paired. Close the tabs.

### 1.2 The regtest network (for tests 8 and 9 only)

Everything here is in `docs/damgar-regtest.md`. Follow it; this is the short version.

1. **Once: download btcd and lnd, and check them.** Follow "Once: the programs, checked" in `docs/damgar-regtest.md`, using the Apple-silicon (`arm64`) names. Compare the two fingerprints `shasum` prints with the table there, character by character. **If one differs, stop: do not run it.**
2. **Each time: start the network.** From the MOR folder:
   ```
   BTCD_DIR=~/mor-regtest-tools/btcd-darwin-arm64-v0.24.2 LND_DIR=~/mor-regtest-tools/lnd-darwin-arm64-v0.18.5-beta \
     modules/lightning/regtest/up.sh ~/mor-regtest
   ```
   Check: after a minute or two, "regtest Lightning network ready in …/mor-regtest". Each start is a new chain.
3. **The test wallet**, in a second Terminal window, from the MOR folder:
   ```
   cd clients/testwallet && npm start -- ~/mor-regtest
   ```
   Open `http://127.0.0.1:8478/`. Check: a red band says it is a test wallet; alice has coins in channels, bob and carol have none.
4. **Damgar and Edubba follow the regtest chain, once.** From the MOR folder:
   ```
   cd clients/damgar && npm start -- --regtest ~/mor-regtest
   ```
   Damgar opens: close the tab. Then:
   ```
   cd ../desk && npm start -- --regtest ~/mor-regtest
   ```
   The same. Both remember the folder.
5. **At the end of the day**, stop it all. From the MOR folder:
   ```
   modules/lightning/regtest/down.sh ~/mor-regtest
   ```
   Then Ctrl-C in the other Terminal windows.

### 1.3 The web pages for testing

Each carries a banner: **for testing only**. Keys live in the browser.

- `https://dub.dubsar.org` (Dub's web client)
- `https://kishib.dubsar.org` (Kišib's web client)
- `https://damgar.dubsar.org` (Damgar's web client)
- `https://ummia.dubsar.org` (Ummia's web client)
- `https://dubsar.org` (the website) and `https://reader.dubsar.org` (the reader)

### 1.4 Homes for test identities

Use `https://home1.dubsar.org` and `https://home2.dubsar.org`. Kišib and the web pages cannot reach an onion address, so never give a test identity an onion home here.

If a home refuses a new identity (its daily limit), allow it on that home's management page, as before.

---

## Part 2. The tests, in an order that builds

Each test says what it tests, which app, the steps, and what to check. The number in brackets is where it came from, so findings stay traceable.

### Test 1 (was v1 test 1): dubsar.org and the reader on a phone

*Tests: whether the site reads as verified and clear to someone new. App: Safari on the iPhone.*

1. Open `https://dubsar.org`. Check: the bar says "Verified: signed by Nobody, allegedly".
2. Tap **Who signed it, and how to check**. Check: the whole fingerprint, the version, the acts shown.
3. Play the main film, then each small film button. Check: it plays inline, nothing starts by itself with sound; the pop-up closes with its close control and with a tap outside.
4. Open the other pages by typing them (they are not linked yet, H1): `https://dubsar.org/feed.html`, `https://dubsar.org/report.html`, `https://dubsar.org/listing.html`. Check: each verified. Note anything unclear to someone who never heard of MOR.
5. Open `https://reader.dubsar.org/`. Check: it lists the owner's documents; open one; it says verified, with the whole fingerprint, and the plain text one tap away.

### Test 2 (was v1 tests 2 and 3): two identities, Dub on the Mac and on the web

*Tests: making an identity, posting, the web client's warning. Apps: Dub on the Mac, Dub's web client on the iPad.*

1. **Dub on the Mac.** Open **Dub**. **Make a new identity**: homes `https://home1.dubsar.org` and `https://home2.dubsar.org`, one per line; relays the same; display name "A".
2. Write the chain key's 24 words on paper, labelled "chain key, A". Press **I have written them down**. Check: the words disappear *before* three are asked (H3). Type the three asked.
3. In the identity window: **Copy ID**, and keep it in a note. **Show the signing key's words**: write them on a second paper, labelled "signing key, A". Check: it says plainly that whoever holds them can post as you and read your private messages.
4. **Public** tab: post a short text. Then a post with a phone photo. Check: both appear in the feed.
5. To see a post in the reader: hold the pointer over its "act …" to see its full ID, then open `https://reader.dubsar.org/#` followed by that ID. Check: verified, signed by A's fingerprint, the display name beside it or not (H17 is open). Note how long it took to appear.
6. **Dub on the web, iPad.** Open `https://dub.dubsar.org` in Safari. Check: the banner, "for testing only", and its two risks. Is it clear?
7. Make a new identity there: homes home1 and home2, display name "B". Write the chain key's words on paper, **I have written them down**, the three words. Copy B's ID and send it to yourself. Show B's signing words and write them on paper.
8. Post from B. Open that post in the reader on the iPad (its ID, after `https://reader.dubsar.org/#`) (to check: how to copy a post's ID on a touch screen, with no pointer to hold over it).
9. **The web client's icon (H35).** On the iPhone, open `https://dub.dubsar.org`, Share, **Add to Home Screen**. Check: Dub's icon, filling the square.
10. Check, as v1 found (H7): dubsar.org's feed shows only the author's posts, not A's or B's. That is expected.

### Test 3 (was v1 tests 4 and 5): following, replies, To you, private messages, Relay

*Tests: two people meeting on MOR. App: Dub on the Mac (A) and on the iPad (B).*

1. On the Mac (A), Public tab, **Following**: follow B by its ID, with a name you choose ("B"). Check: B's posts appear in A's feed, the name beside the fingerprint.
2. On the iPad (B): follow A the same way.
3. On B, under A's post, **Reply**. Write something short.
4. On A: check the **To you** filter: B's reply shows, with a count on the tab until you look.
5. On A, **Public**, **To…**: click the field. Check: B is offered by name and fingerprint (H37). Address a public post to B.
6. **Private** tab on A: write a message to B (B is offered by name). Send.
7. On B, **Private** tab. Check: the message is there, with a count on the tab.
8. **Can anyone else read it?** On the Mac: **Switch identity**, make a third identity "C" (homes as before; its chain words on paper). Open C's Private tab. Check: A's message to B is not there. Switch back to A with **Use this one**. Check (H28): switching left A first, then showed the identities held.
9. **The Relay filter (H29)**, on A: choose **Relay**. Check: every public act at A's relays, not only those followed; it says the order is each relay's arrival order, not a time; it is never the default (after a reload, Everyone again).
10. **Mute** someone from the Relay view, then unmute them under Following. Check: muted posts are left out and counted.
11. **The follow list is sealed (H29).** Under Following, read what it says about the list: private by default, sealed to yourself, at your homes. Bring A into Dub's web client on the iPhone (**Bring an identity you have**, A's ID and signing words). Check: the iPhone shows the same people followed, with your names for them.

### Test 4 (was v1 tests 6 and 7): writing to Machine, allegedly, from the site; picks and nudges in Edubba

*Tests: the site's writing box, and approving what an agent answers. Apps: Safari, Edubba (Agents tab).*

*Before: Edubba open, Machine, allegedly's terms already signed, answering On.*

1. On the iPhone, open `https://dubsar.org/feed.html`. Find **Write to them**. Choose Machine, allegedly, **public**. Read what each choice means. Send a short note.
2. Write a second note, **private**, to Machine, allegedly. Then a third, to Nobody, allegedly (H5: where did it land last time? to check).
3. On the Mac, **Edubba**, **Agents** tab, Machine, allegedly. Press **Look now for what it received**. Check: the notes are in its queue, and nothing was called yet.
4. **One pick.** Press **Pick** on one note. Check: it answers at once; **What it did** shows the answer and its cause, "picked by".
5. **Several picks in one approval.** Tick **Select** beside two notes, press **Pick the selected**. Check: they are shown together first, each with its sender and fingerprint, what the cap allows, and a digest. Then **Sign these picks**.
6. On the iPhone, reload `feed.html`. Check: a public note now shows beside Machine, allegedly's answer, above it, labelled by who picked it. An unanswered note is never shown.
7. **Nudge it**: a number of actions (1) and a few words. Check: it does at most that many, each naming your nudge.
8. **Prompt it** (at the bottom): ask something short. Check: the conversation shows above the box; it is a private message, signed and kept.
9. **Conformance, by looking** (see Part 3): it never answered a stranger without your pick or nudge.

### Test 5 (was human test 13): Edubba's agents

*Tests: an agent that reads and verifies, remembers, keeps a diary, acts under a grant, and corrections. Apps: Edubba, Dub, Claude. Steps from `docs/edubba-agents-report.md`.*

*Before: the three homes run the relay code with F346 (done 17 October, per `docs/state-of-mor.md`). A test identity of yours is held in Edubba (bring A: Identities tab, **+ A new identity**, **Bring an identity you have**, A's ID and signing words).*

1. **The look.** Edubba's tabs read **Agents, Collectives, Publishing, Identities**. Publishing shows its card ("Coming after Damgar's round 2"). Check: lines and outlines faintly emerald. Open Dub: its lines faintly warm pearl.
2. **Reading (H21).** Identities tab, A, **Its posts**: press **Copy act ID** on a post. Agents tab, Machine, allegedly, **Prompt it**: "Is act ‹paste the ID› genuine? Who signed it?" Check: it answers from the core library's verdict; **What it did** shows what it read.
3. Prompt it: "Look up your own identity on MOR: which homes does it have?" Check: it answers from what it read.
4. **Memory (H22).** Prompt it: "From now on, end every answer with — M." Open **Its notes**. Check: a standing instruction appears.
5. Prompt it: "What did I ask you a moment ago?" Check: it knows.
6. **Retire this note** (a reason if you like). Check: it moves to **Dropped**; the next answer no longer ends with "— M."
7. **The diary.** Leave Edubba running past midnight, or open it the next day. Check: the card under **Its diary** says it costs one call a day under its cap.
8. Open **Its notes**, press **Read Machine, allegedly's diary**. Check: it first tells you that you are about to read what it wrote for itself. Press **Yes, read**. Then **Close the diary**. Note how it felt to read it.
9. **A grant.** **Its grants from you**: tick **Posts and messages**. Leave the cap empty or give one. Leave **Until** empty, or give a time and the timestamp clock's ID (from the private project note).
10. **Read the grant back**. Read it all. Then **Sign and publish this grant**. Check: Machine, allegedly is asked and, if it accepts, signs its acceptance; it says so.
11. **Nudge it** for one action: "Post a short note in my name, under the grant." Check: its post appears in **What it did**, with a line saying it was signed by Machine, allegedly in your identity's name, "backed". With an expiry: "unknown" until the clock stamps it (about thirty seconds), then backed.
12. In Dub (as A, or any identity following the Edubba identity that granted): follow the granting identity by its ID (**Copy ID** in Edubba). Check: the post shows the same line, on whose authority.
13. Back in Edubba: **Revoke it**.
14. **Corrections.** Identities tab, A, **Its posts**, **Correct this** on a post. Change the words, **Sign the correction**. Check: labelled **Correction**; the original shows **Corrected by**.
15. In Dub, following A: check the same two labels.
16. *(Optional)* A long-form document of A's (posted through Claude's connector as long form), corrected the same way. Check: Edubba says the correction is in long form; Dub links it as a document.
17. *(Optional)* A test collective's post: Collectives tab, the test collective, **Act**, **Correct this**, read back, signed.
18. **A pasted folder (H19).** Settings, the collective client's settings: in Terminal, drag a folder whose name has a space into the window and copy the path it writes (with `\ `). Paste it into the release folder field, or press **Choose a folder…**. Save. Check: it is taken.
19. **Kišib named.** Dub's identity window and Edubba say a change of keys is done in Kišib (never "MOR Safety").

### Test 6 (was human test 9, and v1 test 9): changing an identity's keys in Kišib

*Tests: rotation from paper, every line kept, earlier posts still verified. Apps: Dub (Mac and web), Edubba, Kišib. Steps from `docs/kishib-report.md`.*

*Use a fresh test identity, so A, B and C stay as they are.*

1. **A test identity with three lines.** In **Dub** on the Mac: **Make a new identity**, homes and relays home1 and home2, display name "K". Write the chain key's 24 words on paper, labelled "chain key, test identity 9". Type the three asked. Post "Before the rotation, from Dub".
2. Identity window: **Show the signing key's words** (on paper) and **Copy ID**.
3. On `dub.dubsar.org` (iPad): **Bring an identity you have**, with K's ID, its signing words and `https://home1.dubsar.org`. Post "Before, from the web client".
4. In **Edubba**, Identities tab: bring K the same way. Then rely on any post of another test identity: K's record, **Rely on an act**, give the act's ID, read it, type **RELY**. This is Edubba's own line.
5. **Check the paper first** (nothing signed). Open **Kišib**, **Check paper words**. Give K's ID, `https://home1.dubsar.org` and the chain key's words. Check: "These are the right words", and "key 0 of these words".
6. Try the signing key's words in the same place. Check: refused.
7. **The rotation.** **Change an identity's keys**: K's ID, the address, the chain key's words. **Read it back**.
8. Read it all. Under "Its lines of acts: what this rotation keeps" there must be **three lines, each "Kept."**: two texts and a witness act. If fewer, **stop and report**.
9. **Sign it**. If it says "It does not count yet", press **Send it again (the same bytes)** until it counts.
10. **The new words.** **Show the new signing key's words**. Write them on paper, labelled "signing key, after the rotation". **I have written them down**, then the three asked. Check: Kišib says it forgot them. Close it.
11. **Give the new words to the apps.**
    - Dub on the Mac says the key was changed elsewhere: paste the new words, **Use the new words**.
    - Dub's web client on the iPad: the same.
    - Edubba, K's record: **Take the new words**. Check, before you do: Edubba said on opening that K's key was changed in Kišib, and refused to sign with the old key.
    - Post once from each.
12. **Earlier posts still verified.** In Dub's Public tab on the Mac, the two posts made before. Check: no red mark. Open each in the reader (`https://reader.dubsar.org/#` + its ID). Check: **verified**, not void. (This was the rehearsal's failure; this is the fix.)
13. **Nothing kept.** In Finder, open `~/mor-kishib`. Check: only `access.json`, `run.json` and `kishib.log`. Search it for any of your words: none.
14. *(Optional, a throwaway identity only)* **An escape.** Make an identity "E" in Dub with home1 only (chain words on paper; also its signing words). In Kišib, change E's keys with its paper, as a thief would, and do not give the new words anywhere. Then in Kišib, **Escape a contested position, with both keys**: the chain words and E's old signing words, new home `https://home2.dubsar.org` (to check: the form's exact fields). Check: it counts as an escape; E's earlier post still verifies; Kišib advises moving to new paper.

### Test 7 (was human test 10 and its end, and v1 test 10): a real collective on three devices

*Tests: founding with members on their own devices and homes, a release, a member change, and its rotation in Kišib. Apps: Dub, Edubba, Kišib. Steps from `docs/human-test-10-steps.md` and `docs/kishib-report.md`.*

**If you ran part A on 17 October** (H24: it passed) **and the member change waits for Kišib, keep those Safari tabs as they are and go to part B.** The members were then called ColA and ColB; below they are B and C.

| Device | App | Homes and relays |
| --- | --- | --- |
| A, the Mac (founder) | Dub to make, Edubba to found | home1 only |
| B, the iPad | Dub's web client | home2 only |
| C, the iPhone | Dub's web client | home1 and home2 |
| The collective | made by Edubba | home1 and home2 |

**On the iPad and iPhone:** do each member's part in one sitting (make, Signing on, sign, receive the share, write it down). Between signing and receiving, the one-time key lives only in that Safari.

**Part A: the founding**

1. **Edubba's places (A).** Settings: homes `https://home1.dubsar.org` only; relays the same. The collective's own settings (Constitution): home1 and home2.
2. **The founder, made in Dub on the Mac.** **Make a new identity**, home1 only, display name "Nobody, allegedly (test)". Chain words on paper. **Copy ID**, **Show the signing key's words** (on a second paper).
3. **Brought into Edubba.** Identities tab, **+ A new identity**, **Bring an identity you have**: its ID and signing words. Check: nothing signed by bringing it; its record shows its homes, display name and Dub's line. From now on, sign as the founder in Edubba only.
4. **B (iPad)**, at `https://dub.dubsar.org`: homes and relays `https://home2.dubsar.org` only, display name "B". Chain words on paper. **Copy ID**, send it to yourself.
5. **C (iPhone)**: the same, both homes as prefilled, display name "C".
6. **The proposal (A).** Collectives tab: check **Acting as** names the founder (H33). **+ Found a real collective**. Under **Contacts**, add B's and C's IDs with names. Name the collective, the founder, tick B and C, keep the rules (2 of 3). **Review the founding**, read it all, **Sign**. Check: "1 of 3 signed".
7. **Signing off waits (B).** Private tab. Check: "A proposal to sign waits … Signing is off". *(Across homes: the proposal from home1 reached home2.)*
8. **Each member signs (B, then C).** Identity window: tick **Signing**, read the warning, accept. **Signing** tab: read the proposal in full (who is bound, who decides what, how it ends, the risks, the words). **Sign it**. Keep Safari open.
9. **Founding (A).** On the founding, **Look for answers** (it also looks by itself, H32). Check: "3 of 3 signed", each with a one-time key received. Read the card **Before you found: what this device will hold** (F337). Tick **I have read what this device will hold**. Check: **Found it** was refused until you ticked. Press **Found it: deal the shares**.
10. **Your share (A).** **Show** it: write its number and 24 words on paper, **It is written down**, three words.
11. **Each member's share (B, C).** Signing tab, **Show my share of the chain key, once** (or **Look for my share** if it has not come). Write the number and 24 words. Compare the dealing's fingerprint on the three devices: the same. **I have written them down**, the three words: "the one-time key is destroyed".
12. **Nothing kept.** On B, reload. Check: the share is not shown again, and the tab stays on Signing (H30).
13. **A release.** On A, the collective's page, **A release**: **Choose a folder…** with one small text file, a name, version 1. **Review the release**, **Sign**. On B or C, Signing tab: read its files and fingerprints, **Sign it**. On A, **Check it as anyone would**. Check: it counts, signed by 2 members.
14. **A member change.** On A, **Change its members**: keep all three, add a fourth test identity (made in Dub on any device). **Review the change**, **Sign**. B, C and the fourth sign in their Signing tabs. On A, **Look for answers**. Check: every signature in, and it says it waits for Kišib. **Keep those Safari tabs' storage as it is.**

**Part B: the member change finished in Kišib**

15. **On the Mac**, Edubba, the collective: under the member change, the note says where to start, and a box waits for the collective's new words. **Copy ID** of the collective.
16. **The founder's words.** In Dub on the Mac (the founder): **Show the signing key's words**. Have your paper share at hand.
17. **Start the rotation.** Open **Kišib**, **Rotate a collective**. Give the collective's ID and `https://home1.dubsar.org`; your share's number and 24 words; the founder's ID and signing words. **Read it back**.
18. Read the red-bordered screen first, about what this device will hold, and tick it. Then read the change, its signatures, the lines, and who gets which new share. **Sign it**. Check: Kišib shows the rotation's fingerprint, "1 of 2 shares are in", and the hour's end.
19. **A second paper, within the hour.** Choose one way:
    - **Remote** (B on the iPad):
      1. In B's Dub, Signing tab, the member change. Check: "A rotation of the collective … waits for your paper share, in Kišib", with the fingerprint.
      2. On the iPad, open `https://kishib.dubsar.org`, **Give my share to a collective's rotation**: the collective's ID, the fingerprint, `https://home2.dubsar.org`. **Read the rotation first**. Compare the fingerprint, character by character.
      3. Type B's ID, B's share number and 24 words, and B's signing words (B's Dub: **Show the signing key's words**). **Read it back**, **Sign it**.
    - **Same room, instead of step 17's way:** tick **Everyone is here** (no signing words), type your paper, sign, then B's paper in the next box (**Add this paper**). Every new share is shown on the Mac's screen.
20. **Rotate (Mac).** Remote: **Look for the members' shares**, then **Rebuild, rotate and deal now**. If "does not count yet": **Send it again (the same bytes)**.
21. **Your new share.** **Show it**, write number and 24 words on new paper, **I have written them down**.
22. **The collective's new words.** **Show the collective's new signing key's words**, write them down, type the three asked.
23. **Each member's new share.** In the Dubs of B, C and the fourth: Signing tab, the member change, **Show my share of the chain key, once**. Write it on new paper. Compare the new dealing's fingerprint across devices. (Same room: **I received my share by hand** instead, after writing the share shown on the Mac.)
24. **Edubba.** The collective's page, under the member change: **Take the new words**. Check: "The member change is in force"; the members list shows the new members.
25. **Destroy the old papers.** Once the rotation counts, they open nothing.
26. **Check.** **A release** from Edubba, signed by one other member in their Dub, then **Check it as anyone would**. Check: it counts, signed with the new key.
27. **Nothing kept.** `~/mor-kishib` holds only `access.json`, `run.json`, `kishib.log`.

### Test 8 (was human test 11, and v1 test 11): Damgar, on regtest

*Tests: a money app with no wallet inside; tips, invoices, on-chain, requests, what you accept. Apps: Dub, Damgar, the test wallet, Edubba, Kišib. Steps from `docs/damgar-report.md`.*

*Before: Part 1.2 done (the network up, the test wallet open, Damgar and Edubba started once with `--regtest`).*

1. **Two test identities in Dub.** Make **P** (the payer): homes and relays home1, display name "P". **Copy ID**, **Show the signing key's words** (on paper). **Switch identity**, make **Q** (the payee) the same way, display name "Q"; its ID and signing words too.
2. **First use of Damgar, as Q.** Open **Damgar** (check its icon). **Bring it** with Q's ID, signing words and `https://home1.dubsar.org`. Read what can be accepted, each with its version and what it does. Tick all, **Accept these**. Check: the note says the list is sealed to the identity and kept at its homes.
3. **Where Q is paid.** Settings. In the test wallet, choose **bob**: copy bob's key (under its name), and press **A Bitcoin key of this node's wallet**, copy that too. In Damgar: Lightning, bob's node key; On-chain, the Bitcoin key; network regtest. **Read it back**: read every cost, and the on-chain request key's (what it is, what a thief could do with it, how to replace it). **Sign and publish it**.
4. **Bring P too.** Damgar, the identity (top right), **Bring an identity you have**: P's ID and signing words; tick all; **Accept these**. Check: **Use this one** switches between P and Q.
5. **A tip, prepared in Dub.** In Dub, as Q, post something. Switch to P; follow Q by ID; on Q's post, **Tip**: 1500, **Prepare it for Damgar**. Check: "Prepared, not signed".
6. **Signed in Damgar (P).** **To sign**, **Look again**. Check: the tip in plain words: amount in regtest satoshis, to Q, on Lightning. **Sign it**.
7. **The invoice (Q).** **Use this one** for Q; To sign, **Look again**: an invoice to make, with its description hash. Copy the hash. Test wallet, node **bob**, **Make an invoice**: 1500 and the hash; copy the invoice. In Damgar, paste it, **Check it and send it**.
8. **Paid from the test wallet (P).** Damgar as P, **Pay**: the invoice; **Copy the invoice**. Test wallet, node **alice**: paste, **Read it** (check: 1 500, bob's key, the same hash), **Pay it**; copy the preimage. In Damgar, paste it, **Check it and sign my claim**. Check: "says valid".
9. **The receipt (Q).** Damgar as Q, To sign, **Look again**: a receipt to sign; **Check it, and sign the receipt**. **The account**: came in 1 500 regtest satoshis, folded, "paid and confirmed"; open it: claim and receipt each VALID. As P, **Look again**, then the account: went out 1 500, both VALID.
10. **On-chain.** As Q in Dub, post again; as P, tip it 40000. Damgar as P: **Sign it**. As Q: **Look again** (Damgar answers the address request by itself). As P, **Pay**: an address bound to this payment; **Copy the address**. Test wallet, alice, **On-chain**: send 40000 to it; copy the transaction ID; **Mine** 1. Damgar: paste the ID, **Check it and sign my claim**. Check: "pending". Test wallet: **Mine** 6. Damgar: **Check the chain again**. Check: valid. As Q, **Look again**, sign the receipt; check both accounts.
11. **A request to be paid.** In Dub as Q, Private tab, **Ask someone to pay you**: P's ID, 700, prepare it. Damgar as Q: **Sign and send the request**. As P, **Look again**. Check: the request, with **Accept as a debt (sign an obligation)** and **Pay it**. Press **Accept as a debt** first (check: its state shown unknown, with the reason), then **Pay it**, and finish as in steps 7 to 9.
12. **Something not accepted.** Damgar as P, Settings: untick **Bitcoin units**, **Save what I accept**. In Dub as P, tip Q's post 100. Damgar, **Look again**. Check: the amount reads "100 of unit … (Bitcoin units, not accepted here)", never "satoshis", and only **Decline** is offered. Tick Bitcoin units again, save, and decline that draft.
13. *(Optional, needs test 7's collective)* **Anchoring.** In a third Terminal window, from the MOR folder:
    ```
    cd clients/anchoring-service && npm start -- --regtest ~/mor-regtest --homes https://home1.dubsar.org --relays https://home1.dubsar.org
    ```
    Copy the identity it prints. Bring the collective's founder into Damgar by its signing words; accept all. Edubba, Collectives, the collective, **Anchor one of its acts on Bitcoin (optional)**: paste the service's identity, **Read its offer**, a tier, **Prepare the payment for Damgar**. Check: no release is offered. Damgar as the founder: **Look again**, read it (an anchor of the act's fingerprint, never the act), **Sign it**; after a few seconds, **Look again**, **Pay**: the invoice and the ticket. Pay from alice, paste the preimage. Edubba: asked, then pending; test wallet **Mine** 6; Edubba: anchored at its block.
14. *(Optional)* **The vault.** Kišib, **Change an identity's keys** for Q with Q's chain-key paper. Where it asks for lines it cannot read, paste Damgar's line card (Damgar's identity window, as Q). Open **The vault**, **Declare it anew**: unit regtest, Lightning carol's node key (from the test wallet), limit 10000. Read the review, sign, write the new words. Give them to Dub (**Use the new words**) and Damgar as Q (**Give the new words**). Check: Damgar's Settings show the vault, read only. A tip of 20000 from P then goes to the vault: Q's invoice on **carol**; P pays from alice; claim and receipt verify.
15. *(Optional)* **The web client.** Open `https://damgar.dubsar.org`. Check: the banner on every screen; an on-chain payment there says "Not checked here".
16. **Stop** the network (Part 1.2, step 5).

### Test 9 (was human test 12, and v1 test 8): Ummia, and a bug report

*Tests: releases, specifications, tracking, the accepted list across apps, a MIP draft, and bug reports (now sent from Ummia). Apps: Ummia, Dub, Damgar, Edubba, Kišib. Steps from `docs/ummia-report.md`.*

*Use P and Q from test 8. P is the developer; Q stands in for the reporting identity, which is made only at step 17 (dubsar.org's report page says so).*

1. **First use (P).** Open **Ummia** (check its icon). **Bring it** with P's ID, signing words and `https://home1.dubsar.org`. Check: the **Who acts** card, yourself ticked, and a line saying collectives come in a second round. Open the identity (top right): Ummia's line and its card for Kišib.
2. **Settings.** Relays your acts go to: `https://home1.dubsar.org`. Tracking: `https://home1.dubsar.org` and `https://home2.dubsar.org`, one per line. The reporting identity: Q's ID. **Save**.
3. **A release.** In Finder, make a folder `~/Projects/testrelease` with two small text files. In Terminal, a hidden file:
   ```
   echo x > ~/Projects/testrelease/.secret
   ```
   In Ummia, **Releases**, **Choose a folder…**: Home, Projects, testrelease, **Use this folder**. Version `1.0`. **Read it back**. Check: every file with size and fingerprint, no `.secret`, "starts a new release line". **Sign and publish**. Then **Check it as anyone would**. Check: VERIFIED, 2 of 2 files.
4. **Edubba no longer releases under one's own name.** Edubba, Identities, P (bring it if it is not there). Check: the card says releases are in Ummia. Collectives tab: a real collective's release is still there.
5. **A specification.** **Specifications**: kind cMIP; text `# cMIP: Human test notes, draft 1`, an empty line, `Notes, for human test 12.` (no space at a line's end, no final line break). Open **Act types it defines**, write `0 note note = tstr`. **Read it back, with its hash**: write down the hash's first 8 characters. **Sign and publish**. Check: the same hash.
6. **Tracking.** **Tracking**, **Look**. Check: the limit in plain words first ("sees public agreements only…"); your cMIP under Xtypes and under cMIPs and Modules, by you, its hash the one written down. **Accept it**.
7. **The accepted list, between apps.** **Accepted**: your cMIP is there, and Damgar's entries from test 8, marked as Damgar's part. Remove **Lightning rail** here. After a minute, Damgar as P, Settings. Check: Lightning unticked. Tick it again in Damgar, save. Back in Ummia, **Accepted**. Check: Lightning is back, your cMIP still there.
8. **A MIP.** **MIPs**: title `Text, with footnotes`, forks **Text MIR**, **Start it in the MIP shape**. **Write it**: change a line, **Keep it here** (read the shape notes). **Publish this draft for discussion**.
9. In Dub as Q: follow P by ID. Check: the draft shows as a link to the reader. **Reply** to it ("Why footnotes?").
10. Ummia, **Replies**. Check: Q's reply, valid. Then **I am ready: publish it as a MIP…**: read the review (it forks the Text MIR, you are its creator), **Sign and publish**. **Tracking**, **Look**. Check: the MIP under "MIPs, by what they fork".
11. **A bug report (v1 test 8).** **Reports**: write `Ummia: human test 12 report` and a line under it. **Sign and send it**. In Dub as Q: **To you**: the report. **Reply** "Thank you". Ummia, **Reports**. Check: the answer shown, valid. Were the instructions clear without help? Compare with dubsar.org's report page (`https://dubsar.org/report.html`): does what it says match what the apps show?
12. *(Optional, on regtest)* **Anchoring a release.** Start the network and the anchoring service (test 8, step 13). Then, from the MOR folder:
    ```
    cd clients/ummia && npm start -- --regtest ~/mor-regtest
    ```
    Close the tab, use the app. **Releases**, testrelease 1.0: **Anchor it on Bitcoin (optional)**, the service's ID, **Read its offer**, a tier, **Prepare the payment for Damgar**. Damgar as P: **Look again**: "Prepared in Ummia"; sign, pay from alice, paste the preimage. Ummia, **Releases**: asked, then pending; **Mine** 6; anchored at its block.
13. **Kišib keeps Ummia's line.** Ummia's identity window: copy its card. Kišib, **Change an identity's keys** for P with P's chain-key paper; paste the card where it asks for lines it cannot read. Check: the review says Ummia's line is kept. Sign, write the new words. Give them to Dub, Damgar and Ummia (**Use the new words**). Ummia, **Tracking**, **Look**. Check: the cMIP and MIP still verified, claimed by P.
14. **The web client.** Open `https://ummia.dubsar.org`. Check: the red banner on every tab; **Releases** says releases need a computer.

---

## Part 3. Three additions (decided 17 October 2026)

### 3.1 The client conformance checklist

*Some rules only the signer's own app can honour: no verifier can see them from the acts. The freeze test suite marks them "conformance" (`spec/03-MOR-freeze-test-suite-v28.md`). You check them by looking, during the tests above. For each: one line, "seen", "not seen", or "not clear".*

1. **What you sign is what you saw.** Every app shows the exact act in plain words before anything is signed, and nothing is signed until you press.
   Look at: Edubba's **Review the founding**, **Review the change**, **Review the release**, **Read the grant back**; Dub's Signing tab; Kišib's **Read it back**; Damgar's **To sign** and Settings' **Read it back**; Ummia's **Read it back**. (Tests 5 to 9.)
2. **Invisible and bidirectional characters shown before signing.** A hidden character that reorders text must be written out visibly before you sign terms.
   Look at: Dub's Signing tab (the words everyone signs) and Edubba's **Rely on an act**, which write every invisible control out. To try it: name a test collective with a "right-to-left override" character, from the Mac's Edit menu, **Emoji & Symbols** (to check: whether the name field accepts it), and read the proposal in Dub.
3. **A witness act is never signed as a side effect, and is explained first.**
   Look at: Edubba's **Rely on an act** (it signs only once **RELY** is typed). (Test 6, step 4.)
4. **A reply names the post's signer, and the app fetched the post first.**
   Look at: Dub's **Reply**; the reader shows the post the reply answers. (Test 3.)
5. **A long document is shown as plain text by an app that cannot render it.**
   Look at: the reader (the plain text one tap away); Dub (a link to the reader, never raw markup). (Tests 1, 9.)
6. **An agent signs nothing to a stranger without your pick or nudge** (the nudge cMIP).
   Look at: Edubba's Agents tab, **What it did**. (Test 4.)
7. **The founding warning** (F337): before the shares are dealt, the founder's device says what it will hold.
   Look at: Edubba's **Before you found: what this device will hold**; Kišib's must-read screen in **Rotate a collective**. (Test 7.)
8. **The owners' founding warning** (step 3.7ae): where no share of the chain key and no custodian is under the owners' control, the founding app warns.
   The wording exists in the collective library Edubba reads constitutions with. Whether any founding form today lets you write such a constitution: **(to check)**. Otherwise: **not in an app yet**.
9. **A split shown with its payouts before signing.** **Not in an app yet** (Damgar round 3).
10. **A key delivery with a wrong key: valid, its key ignored, and "shown so".** **Not in an app yet** (the suite says so).
11. **The censored reader's warning:** an identity "re-homed without audit" is shown so, and nothing private is sent without a plain warning. The words are in the reader's message box, but the reader never accepts such a rotation, so it cannot appear in these tests. **Not reachable in an app yet.**
12. **Never defaulting to a device-bound policy** (Identity rule 25). No app offers such a policy. Check that Dub's make form, Edubba's new identity and Kišib offer no "device" choice at all. Otherwise **not in an app yet**.
13. **Keepers never hold content keys.** **Not in an app yet** (keepers come with Damgar round 3).
14. **A payer told, before paying, that the payee's clock cannot protect the payment.** **Not in an app yet (to check)**: not found in Damgar's code.
15. **An undeliverable payment kept as an open obligation, the payee told.** **Not in an app yet (to check).**
16. **The seller's alarm, no silent second successor, the newcomer's check** (deals). The seller's alarm is built in Edubba's received items, but no app here makes deals, so it cannot be reached. **Not reachable in these tests.**
17. **A home's refusal told to the person.** Look at: what Dub and Kišib say when a home refuses (its daily limit, part 3.2).

### 3.2 Homes failing, live

*Tests: what each app says when a home is away. Nothing destructive: no rotation of real data, no command that changes a home's settings. Throwaway test identities only.*

**What the apps should say, in general:** in plain words, which home did not answer; that the others hold the act; that nothing is lost; and that silence proves nothing (a home away is not a "no").

**A. Your Mac's home, home3, away for a while.**

home3 runs on your Mac, started at login by a login agent called `mor.home`. It is reached only through Tor (an onion address), so the apps on this sheet, which use home1 and home2, mostly never ask it. This part shows what that means. Nothing here touches its data.

1. Open home3's management page: `http://127.0.0.1:8080/manage/`. Check: it opens (to check: whether this browser is still paired).
2. Stop home3. In Terminal:
   ```
   launchctl bootout gui/$(id -u) ~/Library/LaunchAgents/mor.home.plist
   ```
3. Reload the management page. Check: it no longer answers.
4. On the iPhone, open `https://dubsar.org/feed.html`. Check: the posts still show, verified. The bar names the addresses it did not try (a browser never asks an onion home). Nothing should change.
5. In Edubba, prompt Machine, allegedly something short. Check: it still answers. Edubba's key check does not stop an act when a home is away (Edubba README, reading 38). Note anything it says about a home.
6. In Claude, ask: "Look up identity ‹your author identity's ID›: which homes does it have, and did each answer?" (to check: what the connector says about home3; it reads home1 and home2 by default).
7. Start home3 again:
   ```
   launchctl bootstrap gui/$(id -u) ~/Library/LaunchAgents/mor.home.plist
   ```
8. Reload the management page. Check: it answers again. Look at its latest arrivals: are the acts made while it was away there? (to check: observation only, not a pass or fail.)

**Never** run `mor-relay rotate`, `init`, `--closure` or `unpair` on home3 for this test.

**B. A test identity whose homes cannot be reached (Dub's web client).**

1. On the iPhone, open `https://dub.dubsar.org` with test identity C (or make one). Let the page load fully.
2. Turn on airplane mode.
3. Follow someone by ID. Check: Dub says the follow list was not sealed to the homes, which did not answer, and that it is kept here and sealed at the next change (Dub README, reading 18).
4. Try to post. Check: it says plainly that the homes or relays did not answer (to check: the exact words).
5. Turn airplane mode off. Unfollow and follow again. Check: the list is now sealed (a Bring on another device shows it). The post can be sent again.

**C. Kišib with the homes away (a throwaway identity).**

*Kišib reads the homes before it signs, and "Send it again" sends the exact same bytes, never a second rotation (Kišib README, readings 3 and 4).*

1. Make a throwaway identity "F" in Dub on the Mac, homes home1 and home2. Chain words on paper.
2. Kišib, **Change an identity's keys** for F, **Read it back**.
3. Turn the Mac's Wi-Fi off. Press **Sign it**.
4. Check one of two outcomes, and write which:
   - Kišib refuses before signing, because it could not read the homes. Nothing was signed.
   - Or it signed and says "It does not count yet". Then turn Wi-Fi on, and press **Send it again (the same bytes)** until it counts.
5. Check: Kišib told you, while waiting, to keep it open, and what happens if it is closed (the next change from the same paper repairs it).
6. Finish: **Show the new signing key's words**, on paper, the three words.

*(to check: whether step 3's timing gives the second outcome; the session's own test reached it with two of three homes switched off, which is not possible on these homes.)*

### 3.3 The recovery custodian path

**Waits: not in an app yet.**

The freeze test suite's step 3.7ae says the owners of a collective may vote its operators out, and where the constitution gave the owners a custodian of the recovery path, the rotation is made through that custodian. The suite marks this "to build". No app builds it today: Kišib rotates a collective only from its members' paper shares, and no founding form in Edubba names a recovery custodian (to check). The warning that goes with it is item 8 of the checklist above.

Nothing to run. Write one line if anything you see in Edubba or Kišib suggests otherwise.

---

## Part 4. Free play, and how to report

### Free play (was v1 test 12)

Anything you are curious about. Some ideas:

- **Name or confirm a successor** in Kišib, with two throwaway identities (each side's screen should say what it signs).
- **Show an identity's record** in Kišib, and compare it with Edubba's record of the same identity.
- **MOR as seen by this agent**, in Edubba: what Machine, allegedly follows and sees.
- Kišib's web client on the iPad (`https://kishib.dubsar.org`): **Check paper words** only. Check: the banner; nothing kept in the browser.
- The listing page (`https://dubsar.org/listing.html`): does "One listing among any" read clearly?

### How to report

One line per observation, in a note on your Mac:

*Test N, step M: what I did / what I expected / what happened / how it felt.*

- Add **"not plain words"** where an app's words were unclear.
- Add **"not verified"** where something that should verify did not.
- Add **"(to check)"** steps you could not follow, with what you saw instead.
- For anything not found across homes: name the act, the device and the home.
- Never put words from your papers in the note.

**Where findings go.** Bring the note to the project lead. The lead turns each line into a finding (H38 onward, in `docs/human-tests-v1-findings.md` or its successor), and asks you the questions one at a time, before the freeze-ready drafts.
