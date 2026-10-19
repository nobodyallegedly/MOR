# The human tests, as one walkthrough

*18 October 2026. For Nobody, allegedly. The same steps as `docs/human-tests-v2.md`, rearranged into one continuous run with a fixed cast. Every button, command and path is copied from version 2, which was checked against the READMEs. Where version 2 said **(to check)**, the mark is kept. Marks added here say **(to check, added here)**.*

*Why this version: make each identity once, write its words once, and reuse it everywhere.*

*Updated 19 October 2026, after Damgar round 2 (pull request 78) and round 3 (pull request 80): human test 14 is folded in as Sitting 13, human test 15 as Sitting 16; the old Damgar sittings follow as 14 and 15; the key changes are last, as Sitting 17. Steps from those two tests are numbered (14.x) and (15.x): report them that way.*

---

## The rules

- **Test identities only.** Never your real identity, never a real collective.
- **Regtest only.** No real money, ever. The coins on regtest exist only on your Mac.
- **Never paste signing words or keys into a chat** (Claude included). Words go on paper, and into the app that asks for them, nowhere else.
- **One line per observation:** what you did, what you expected, what happened, how it felt.
- **Mark** anything that was not in plain words, and anything that was not verified.

IDs are not secret. Words are. Keep every ID in one note on the Mac, called "MOR cast IDs", and send it to yourself so the iPad and iPhone have it too.

On the iPad and iPhone: no private browsing.

---

## The Cast card (fill it in once)

*Write the papers' places here, never the words themselves. Copy this card onto one sheet and keep it with the papers.*

**A**, your test identity, owner of Machine, allegedly
- Device: the Mac (Edubba; Dub from Sitting 1; Dub's web client on the iPhone from Sitting 2)
- Home: ______________________
- Chain-key paper kept at: ______________________
- Signing-key paper kept at: ______________________

**iPa**
- Device: the iPad (Dub's web client), and Damgar on the Mac
- Home: ______________________
- Role in Damgar this morning: payer / payee (circle one)
- Chain-key paper kept at: ______________________
- Signing-key paper kept at: ______________________

**iPh**
- Device: the iPhone (Dub's web client), and Damgar on the Mac
- Home: ______________________ (the same as iPa)
- Role in Damgar this morning: payer / payee (circle one)
- Chain-key paper kept at: ______________________
- Signing-key paper kept at: ______________________

**Machine, allegedly**: the agent in Edubba. Nothing to write.

**The collective**
- Reused from human test 10, or founded in Sitting 6 (circle one)
- Founder: ______________ Members: ______________
- Share papers kept at: ______________________

**C, the critic** (new with Sitting 13; plays **R**, the reposter, in Sitting 16)
- Made in Sitting 13. Device: the Mac (Dub, Damgar), linked to carol's node
- Signing-key paper kept at: ______________________

**B, the buyer** (new with Sitting 13; the buyer again in Sitting 16)
- Made in Sitting 13. Device: the Mac (Dub, Damgar); its relay only the second relay
- Signing-key paper kept at: ______________________

**The second collective** (founded with the grid in Sitting 16): A, iPa, iPh. Share papers kept at: ______________________

*If you named the cast differently in the apps (on 19 October: Max on the Mac, Pa on the iPad, Ph on the iPhone), read A as Max, iPa as Pa, iPh as Ph.*

**T, the throwaway**
- Made in Sitting 5. Device: the Mac (Dub, Edubba), the iPad (Dub's web client) for a moment
- Home: `https://home1.dubsar.org` only
- Chain-key paper kept at: ______________________
- Signing-key paper kept at: ______________________ (one sheet: cross out the old words and write the new ones under them each time they change)

**Throughout this sheet:** "the payer" and "the payee" mean whichever of iPa and iPh played that role on 18 October. Version 2 and human test 14 call them P and Q.

---

## Already done (18 and 19 October): skip unless you want to repeat

- **Part 1.1, updating the Mac** (all eight steps). *Done 18 October, skip unless you want to repeat.* After Damgar round 2 lands, repeat its steps 2 to 5 once (see the Damgar block at the end).
- **Part 1.2, the regtest network**, step 1 (the programs, checked) and step 4 (Damgar and Edubba follow the chain). *Done 18 October, skip unless you want to repeat.* Steps 2 and 3 (start the network, open the test wallet) come back in each Damgar sitting.
- **Test 1 (was v1 test 1): dubsar.org and the reader on a phone.** Passed. *Done 18 October, skip unless you want to repeat.*
- **Test 8 (was human test 11), steps 1 to 8**: iPa and iPh made, brought into Damgar, the payee's Settings, a tip, the invoice, the payment from the test wallet. *Done 18 October, skip unless you want to repeat.*

**Done 19 October** (a Mac session): the Mac on main after round 3, every app rebuilt, the regtest network running and the test wallet answering. *Do not restart the network: a restart empties it and starts a new chain, and every payee's Lightning key in Damgar would need setting again.* Before the money sittings, start Damgar and Edubba once on regtest, from the MOR folder:
```
cd clients/damgar && node --import tsx src/cli.ts stop && npm start -- --regtest ~/mor-regtest
```
```
cd clients/desk && node --import tsx src/cli.ts stop && npm start -- --regtest ~/mor-regtest
```
If a payment is refused because a node says "not synced", press **Mine** once in the test wallet. Also done on 19 October: the cast followed each other across homes, by the relay view and by the ID link (H56).

**If the 18 October network is still running**, you may finish step 8.9 now (the receipt, five minutes; it is the first step of Sitting 13). Then stop the network: from the MOR folder,
```
modules/lightning/regtest/down.sh ~/mor-regtest
```
and Ctrl-C in the other Terminal windows.

---

## Addresses (from version 2, Part 1.3 and 1.4)

Each web page carries a banner: **for testing only**. Keys live in the browser.

- `https://dub.dubsar.org` (Dub's web client)
- `https://kishib.dubsar.org` (Kišib's web client)
- `https://damgar.dubsar.org` (Damgar's web client)
- `https://ummia.dubsar.org` (Ummia's web client)
- `https://edubba.dubsar.org` (Edubba's web client: no Agents tab, no money)
- `https://dubsar.org` (the website) and `https://reader.dubsar.org` (the reader)

Homes for test identities: `https://home1.dubsar.org` and `https://home2.dubsar.org`. Kišib and the web pages cannot reach an onion address, so never give a test identity an onion home here. If a home refuses a new identity (its daily limit), allow it on that home's management page, as before.

**How each step is numbered.** "2.4" means version 2's Test 2, step 4. Report it the same way: *Test 2, step 4*.

---

## Sitting 1: A and iPa post (about 30 minutes)

*From Test 2 (was v1 tests 2 and 3). Devices: the Mac, the iPad, the iPhone.*

First, fill in the Cast card above. Then:

1. **(2.1 to 2.3) A in Dub on the Mac.** A already exists: do not make it. If Dub on the Mac does not hold A yet: open **Dub**, **Bring an identity you have**, A's ID and its signing words from paper.
   - In the identity window: **Show the signing key's words**. Check: it says plainly that whoever holds them can post as you and read your private messages. You need not write them again.
   - Version 2 also checked, while making an identity, that the chain words disappear *before* three are asked (H3). If you remember it from making iPa and iPh, write a line now. If not, you will see it when you make T in Sitting 5.
2. **(2.4)** **Public** tab: post a short text. Then a post with a phone photo. Check: both appear in the feed.
3. **(2.5)** To see a post in the reader: hold the pointer over its "act …" to see its full ID, then open `https://reader.dubsar.org/#` followed by that ID. Check: verified, signed by A's fingerprint, the display name beside it or not (H17 is open). Note how long it took to appear.
4. **(2.6)** **On the iPad**, open `https://dub.dubsar.org` in Safari. Check: the banner, "for testing only", and its two risks. Is it clear?
5. **(2.7)** Making B: skip. iPa is B. Make sure iPa's ID is in the "MOR cast IDs" note.
6. **(2.8)** Post from iPa. Open that post in the reader on the iPad (its ID, after `https://reader.dubsar.org/#`) (to check: how to copy a post's ID on a touch screen, with no pointer to hold over it).
7. **(2.9) The web client's icon (H35).** On the iPhone, open `https://dub.dubsar.org`, Share, **Add to Home Screen** (if it is already there, just look). Check: Dub's icon, filling the square.
8. **(2.10)** Check, as v1 found (H7): dubsar.org's feed shows only the author's posts, not A's or iPa's. That is expected.

**Write down:** A's and iPa's IDs in the note, if missing. Nothing on paper.

---

## Sitting 2: meeting on MOR (about 40 minutes)

*From Test 3 (was v1 tests 4 and 5). A on the Mac, iPa on the iPad, iPh on the iPhone.*

1. **(3.1)** On the Mac (A), Public tab, **Following**: follow iPa by its ID, with a name you choose ("iPa"). Check: iPa's posts appear in A's feed, the name beside the fingerprint.
2. **(3.2)** On the iPad (iPa): follow A the same way.
3. **(3.3)** On iPa, under A's post, **Reply**. Write something short.
4. **(3.4)** On A: check the **To you** filter: iPa's reply shows, with a count on the tab until you look.
5. **(3.5)** On A, **Public**, **To…**: click the field. Check: iPa is offered by name and fingerprint (H37). Address a public post to iPa.
6. **(3.6)** **Private** tab on A: write a message to iPa (offered by name). Send.
7. **(3.7)** On iPa, **Private** tab. Check: the message is there, with a count on the tab.
8. **(3.8) Can anyone else read it?** Version 2 made a third identity, C, for this. Use iPh instead: on the iPhone, iPh's **Private** tab. Check: A's message to iPa is not there.
   - Then on the Mac, Dub: **Switch identity**. Check (H28): switching left A first, then showed the identities held. Choose A again with **Use this one**.
9. **(3.9) The Relay filter (H29)**, on A: choose **Relay**. Check: every public act at A's relays, not only those followed; it says the order is each relay's arrival order, not a time; it is never the default (after a reload, Everyone again).
10. **(3.10)** **Mute** someone from the Relay view, then unmute them under Following. Check: muted posts are left out and counted.
11. **(3.11) The follow list is sealed (H29).** Under Following, read what it says about the list: private by default, sealed to yourself, at your homes. Bring A into Dub's web client on the iPhone (**Bring an identity you have**, A's ID and signing words, from paper). Check: the iPhone shows the same people followed, with your names for them. Then **Switch identity** back to iPh on the iPhone.

**Checklist (Part 3.1), item 4:** a reply names the post's signer; the reader shows the post the reply answers. One line.

**Write down:** on the Cast card, A is now also on the iPhone. Nothing new on paper.

---

## Sitting 3: Machine, allegedly, from the site (about 40 minutes)

*From Test 4 (was v1 tests 6 and 7) and the start of Test 5 (was human test 13). Safari on the iPhone, Edubba on the Mac.*

*Before: Edubba open, Machine, allegedly's terms already signed, answering On (already so).*

1. **(4.1)** On the iPhone, open `https://dubsar.org/feed.html`. Find **Write to them**. Choose Machine, allegedly, **public**. Read what each choice means. Send a short note.
2. **(4.2)** Write a second note, **private**, to Machine, allegedly. Then a third, to Nobody, allegedly (H5: where did it land last time? to check).
3. **(4.3)** On the Mac, **Edubba**, **Agents** tab, Machine, allegedly. Press **Look now for what it received**. Check: the notes are in its queue, and nothing was called yet.
4. **(4.4) One pick.** Press **Pick** on one note. Check: it answers at once; **What it did** shows the answer and its cause, "picked by".
5. **(4.5) Several picks in one approval.** Tick **Select** beside two notes, press **Pick the selected**. Check: they are shown together first, each with its sender and fingerprint, what the cap allows, and a digest. Then **Sign these picks**.
6. **(4.6)** On the iPhone, reload `feed.html`. Check: a public note now shows beside Machine, allegedly's answer, above it, labelled by who picked it. An unanswered note is never shown.
7. **(4.7) Nudge it**: a number of actions (1) and a few words. Check: it does at most that many, each naming your nudge.
8. **(4.8) Prompt it** (at the bottom): ask something short. Check: the conversation shows above the box; it is a private message, signed and kept.
9. **(4.9)** It never answered a stranger without your pick or nudge. This is **checklist item 6**: one line.
10. **(5.1) The look.** Edubba's tabs read **Agents, Collectives, Publishing, Identities**. Publishing is a real tab now (round 3): protected files and vows; look only, it is tested in Sitting 16. Check: lines and outlines faintly emerald. Open Dub: its lines faintly warm pearl.
11. **(5.2) Reading (H21).** Identities tab, A, **Its posts**: press **Copy act ID** on a post. Agents tab, Machine, allegedly, **Prompt it**: "Is act ‹paste the ID› genuine? Who signed it?" Check: it answers from the core library's verdict; **What it did** shows what it read.
12. **(5.3)** Prompt it: "Look up your own identity on MOR: which homes does it have?" Check: it answers from what it read.

*(Test 5's "Before": the three homes run the relay code with F346, done 17 October; A is held in Edubba, already so.)*

**Write down:** nothing on paper. **Leave Edubba running tonight, or simply open it on another day:** the diary check (5.7 and 5.8) needs a day to pass and is in Sitting 6.

---

## Sitting 4: memory, a grant, corrections (about 45 minutes)

*From Test 5 (was human test 13). Edubba and Dub on the Mac, Dub's web client on the iPad.*

1. **(5.4) Memory (H22).** Prompt it: "From now on, end every answer with — M." Open **Its notes**. Check: a standing instruction appears.
2. **(5.5)** Prompt it: "What did I ask you a moment ago?" Check: it knows.
3. **(5.6)** **Retire this note** (a reason if you like). Check: it moves to **Dropped**; the next answer no longer ends with "— M."
4. **(5.9) A grant.** **Its grants from you**: tick **Posts and messages**. Leave the cap empty or give one. Leave **Until** empty, or give a time and the timestamp clock's ID (from the private project note).
5. **(5.10)** **Read the grant back**. Read it all. Then **Sign and publish this grant**. Check: Machine, allegedly is asked and, if it accepts, signs its acceptance; it says so.
6. **(5.11)** **Nudge it** for one action: "Post a short note in my name, under the grant." Check: its post appears in **What it did**, with a line saying it was signed by Machine, allegedly in your identity's name, "backed". With an expiry: "unknown" until the clock stamps it (about thirty seconds), then backed.
7. **(5.12)** In Dub, an identity following A sees it: iPa on the iPad already follows A (Sitting 2). Check: the post shows the same line, on whose authority.
8. **(5.13)** Back in Edubba: **Revoke it**.
9. **(5.14) Corrections.** Identities tab, A, **Its posts**, **Correct this** on a post. Change the words, **Sign the correction**. Check: labelled **Correction**; the original shows **Corrected by**.
10. **(5.15)** In Dub as iPa (following A): check the same two labels.
11. **(5.16)** *(Optional)* A long-form document of A's (posted through Claude's connector as long form), corrected the same way. Check: Edubba says the correction is in long form; Dub links it as a document.
12. **(5.18) A pasted folder (H19).** Settings, the collective client's settings: in Terminal, drag a folder whose name has a space into the window and copy the path it writes (with `\ `). Paste it into the release folder field, or press **Choose a folder…**. Save. Check: it is taken.
13. **(5.19) Kišib named.** Dub's identity window and Edubba say a change of keys is done in Kišib (never "MOR Safety").

**Checklist item 1:** look at **Read the grant back**. One line.

**Write down:** nothing on paper. (5.17, a collective's correction, waits for the collective: Sitting 7.)

---

## Sitting 5: T, and changing its keys in Kišib (about 45 minutes)

*From Test 6 (was human test 9, and v1 test 9). Dub on the Mac and on the iPad, Edubba, Kišib.*

*T is the only extra identity in the run. It is used here, joins the collective in Sitting 7, and ends with the escape in Sitting 10.*

*One change from version 2: version 2 gave this identity home1 and home2. T has home1 only, so that the escape in Sitting 10 has a new home to move to (version 2 used a separate identity, E, for that).*

1. **(6.1) T, with three lines.** In **Dub** on the Mac: **Switch identity**, **Make a new identity**, homes and relays `https://home1.dubsar.org` only, display name "T".
   - Write the chain key's 24 words on paper, labelled "chain key, T". Press **I have written them down**. Check (H3, from 2.2): the words disappear *before* three are asked. Type the three asked.
   - **Checklist item 12:** the make form offers no "device" choice. One line.
   - Post "Before the rotation, from Dub".
2. **(6.2)** Identity window: **Show the signing key's words** (on paper, labelled "signing key, T") and **Copy ID** (into the note).
3. **(6.3)** On `dub.dubsar.org` (iPad): **Switch identity**, **Bring an identity you have**, with T's ID, its signing words and `https://home1.dubsar.org`. Post "Before, from the web client". Then switch back to iPa.
4. **(6.4)** In **Edubba**, Identities tab: bring T the same way (**+ A new identity**, **Bring an identity you have**). Then rely on one of iPa's posts: T's record, **Rely on an act**, give the act's ID, read it, type **RELY**. This is Edubba's own line.
   - **Checklist items 2 and 3:** Rely on an act writes every invisible control out, and signs only once **RELY** is typed. One line each.
5. **(6.5) Check the paper first** (nothing signed). Open **Kišib**, **Check paper words**. Give T's ID, `https://home1.dubsar.org` and the chain key's words. Check: "These are the right words", and "key 0 of these words".
6. **(6.6)** Try the signing key's words in the same place. Check: refused.
7. **(6.7) The rotation.** **Change an identity's keys**: T's ID, the address, the chain key's words. **Read it back**.
8. **(6.8)** Read it all. Under "Its lines of acts: what this rotation keeps" there must be **three lines, each "Kept."**: two texts and a witness act. If fewer, **stop and report**.
9. **(6.9)** **Sign it**. If it says "It does not count yet", press **Send it again (the same bytes)** until it counts.
10. **(6.10) The new words.** **Show the new signing key's words**. On T's signing-key paper, cross out the old words and write the new ones, labelled "signing key, after the rotation". **I have written them down**, then the three asked. Check: Kišib says it forgot them. Close it.
11. **(6.11) Give the new words to the apps.**
    - Dub on the Mac says the key was changed elsewhere: paste the new words, **Use the new words**.
    - Dub's web client on the iPad: the same (switch to T, then back to iPa).
    - Edubba, T's record: **Take the new words**. Check, before you do: Edubba said on opening that T's key was changed in Kišib, and refused to sign with the old key.
    - Post once from each.
12. **(6.12) Earlier posts still verified.** In Dub's Public tab on the Mac, the two posts made before. Check: no red mark. Open each in the reader (`https://reader.dubsar.org/#` + its ID). Check: **verified**, not void. (This was the rehearsal's failure; this is the fix.)
13. **(6.13) Nothing kept.** In Finder, open `~/mor-kishib`. Check: only `access.json`, `run.json` and `kishib.log`. Search it for any of your words: none.

**Checklist item 1:** Kišib's **Read it back**. One line.

**Write down:** T's chain key (once, the only time) and its signing words after the rotation. Fill T's lines on the Cast card.

---

## Sitting 6: the diary, then founding the collective (about 45 minutes)

*At least one day after Sitting 3.*

### The diary (from Test 5, was human test 13)

1. **(5.7)** Edubba has run past midnight, or you opened it the next day. Check: the card under **Its diary** says it costs one call a day under its cap.
2. **(5.8)** Open **Its notes**, press **Read Machine, allegedly's diary**. Check: it first tells you that you are about to read what it wrote for itself. Press **Yes, read**. Then **Close the diary**. Note how it felt to read it.

### The founding (from Test 7, part A, was human test 10 and v1 test 10)

*Since round 3, **+ Found a real collective** opens a grid: members as columns, areas (by layer or act type) as rows, each with its holders and keys needed. Here keep its defaults and note how it reads; the full grid is tested in Sitting 16.*

**If you reuse the collective from human test 10** (its paper shares kept): skip this part. **If its member change from 17 October waits for Kišib, keep those Safari tabs as they are and go to Sitting 8.** Its members were ColA and ColB: read iPa and iPh below as ColA and ColB.

| Who | Device and app | Homes and relays |
| --- | --- | --- |
| A, founder | the Mac, Edubba | A's home |
| iPa | the iPad, Dub's web client | iPa's home |
| iPh | the iPhone, Dub's web client | the same as iPa |
| The collective | made by Edubba | home1 and home2 |

*Version 2 put the founder and the two members on different homes, to test a proposal crossing homes. With this cast, that happens only if A's home differs from iPa's and iPh's (see the Cast card). If they share a home, write one line: "across homes not tested".*

**On the iPad and iPhone:** do each member's part in one go (Signing on, sign, receive the share, write it down). Between signing and receiving, the one-time key lives only in that Safari.

1. **(7.1) Edubba's places (A).** Settings: homes `https://home1.dubsar.org` only; relays the same. The collective's own settings (Constitution): home1 and home2.
2. **(7.2, 7.3)** The founder, made in Dub and brought into Edubba: skip. A is the founder, already in Edubba. From now on, sign as the founder in Edubba only.
3. **(7.4, 7.5)** The members, made on the iPad and iPhone: skip. iPa and iPh exist. Their IDs are in the note.
4. **(7.6) The proposal (A).** Collectives tab: check **Acting as** names the founder (H33). **+ Found a real collective**. Under **Contacts**, add iPa's and iPh's IDs with names. Name the collective, the founder, tick iPa and iPh, keep the rules (2 of 3). **Review the founding**, read it all, **Sign**. Check: "1 of 3 signed".
   - **Checklist item 2, to try:** put a "right-to-left override" character in the collective's name, from the Mac's Edit menu, **Emoji & Symbols** (to check: whether the name field accepts it). Read the proposal in Dub at the next step. The name stays odd; that is fine for a test collective.
   - **Checklist item 8:** does the founding form let you write a constitution with no share and no custodian under the owners' control? (to check). One line.
5. **(7.7) Signing off waits (iPa).** Private tab. Check: "A proposal to sign waits … Signing is off". *(If A's home differs: the proposal crossed homes.)*
6. **(7.8) Each member signs (iPa, then iPh).** Identity window: tick **Signing**, read the warning, accept. **Signing** tab: read the proposal in full (who is bound, who decides what, how it ends, the risks, the words). **Sign it**. Keep Safari open.
7. **(7.9) Founding (A).** On the founding, **Look for answers** (it also looks by itself, H32). Check: "3 of 3 signed", each with a one-time key received. Read the card **Before you found: what this device will hold** (F337). Tick **I have read what this device will hold**. Check: **Found it** was refused until you ticked. Press **Found it: deal the shares**.
8. **(7.10) Your share (A).** **Show** it: write its number and 24 words on paper, **It is written down**, three words.
9. **(7.11) Each member's share (iPa, iPh).** Signing tab, **Show my share of the chain key, once** (or **Look for my share** if it has not come). Write the number and 24 words. Compare the dealing's fingerprint on the three devices: the same. **I have written them down**, the three words: "the one-time key is destroyed".
10. **(7.12) Nothing kept.** On iPa, reload. Check: the share is not shown again, and the tab stays on Signing (H30).

**Checklist items 1 and 7:** **Review the founding**, Dub's Signing tab, and **Before you found: what this device will hold**. One line each.

**Write down:** three share papers (A's, iPa's, iPh's), labelled with the collective's name. This is the one sitting that writes three papers; Sitting 8 needs them. Fill the collective's lines on the Cast card. Copy the collective's ID into the note.

---

## Sitting 7: a release and a member change (about 30 minutes)

*From Test 7, part A (was human test 10), and one step of Test 5.*

1. **(7.13) A release.** On A, the collective's page, **A release**: **Choose a folder…** with one small text file, a name, version 1. **Review the release**, **Sign**. On iPa or iPh, Signing tab: read its files and fingerprints, **Sign it**. On A, **Check it as anyone would**. Check: it counts, signed by 2 members.
2. **(7.14) A member change.** On A, **Change its members**: keep all three, add a fourth test identity. **The fourth is T** (no new identity): add T's ID. **Review the change**, **Sign**.
   - iPa and iPh sign in their Signing tabs.
   - T signs in **Dub on the Mac**: **Switch identity** to T, tick **Signing** in its identity window, accept, then its **Signing** tab, **Sign it**.
   - On A, **Look for answers**. Check: every signature in, and it says it waits for Kišib. **Keep those Safari tabs' storage as it is**, and leave T as it is in Dub on the Mac.
3. **(5.17)** *(Optional)* A post of the collective: Collectives tab, the collective, **Act**, **Correct this**, read back, signed.

**Checklist item 1:** **Review the change** and **Review the release**. One line.

**Write down:** nothing on paper. Plan Sitting 8 soon: the one-time keys wait in Safari and in Dub.

---

## Sitting 8: the member change finished in Kišib (one hour, uninterrupted)

*From Test 7, part B (the end of human test 10). Have at hand: A's share paper, A's signing-key paper, iPa's share paper and signing-key paper. Once the rotation is signed, the second paper must come within the hour.*

1. **(7.15)** **On the Mac**, Edubba, the collective: under the member change, the note says where to start, and a box waits for the collective's new words. **Copy ID** of the collective.
2. **(7.16) The founder's words.** A's signing words: read them from A's paper (or in Dub on the Mac, as A: **Show the signing key's words**). Have your paper share at hand.
3. **(7.17) Start the rotation.** Open **Kišib**, **Rotate a collective**. Give the collective's ID and `https://home1.dubsar.org`; your share's number and 24 words; the founder's ID and signing words. **Read it back**.
4. **(7.18)** Read the red-bordered screen first, about what this device will hold, and tick it. Then read the change, its signatures, the lines, and who gets which new share. **Sign it**. Check: Kišib shows the rotation's fingerprint, "1 of 2 shares are in", and the hour's end.
5. **(7.19) A second paper, within the hour.** Choose one way:
   - **Remote** (iPa on the iPad):
     1. In iPa's Dub, Signing tab, the member change. Check: "A rotation of the collective … waits for your paper share, in Kišib", with the fingerprint.
     2. On the iPad, open `https://kishib.dubsar.org`, **Give my share to a collective's rotation**: the collective's ID, the fingerprint, and iPa's home (version 2: `https://home2.dubsar.org`). **Read the rotation first**. Compare the fingerprint, character by character.
     3. Type iPa's ID, iPa's share number and 24 words, and iPa's signing words (from paper, or iPa's Dub: **Show the signing key's words**). **Read it back**, **Sign it**.
   - **Same room, instead of step 3's way:** tick **Everyone is here** (no signing words), type your paper, sign, then iPa's paper in the next box (**Add this paper**). Every new share is shown on the Mac's screen.
6. **(7.20) Rotate (Mac).** Remote: **Look for the members' shares**, then **Rebuild, rotate and deal now**. If "does not count yet": **Send it again (the same bytes)**.
7. **(7.21) Your new share.** **Show it**, write number and 24 words on new paper, **I have written them down**.
8. **(7.22) The collective's new words.** **Show the collective's new signing key's words**, write them down, type the three asked.
9. **(7.23) Each member's new share.** In the Dubs of iPa, iPh and T (T in Dub on the Mac): Signing tab, the member change, **Show my share of the chain key, once**. Write it on new paper. Compare the new dealing's fingerprint across devices. (Same room: **I received my share by hand** instead, after writing the share shown on the Mac.)
10. **(7.24) Edubba.** The collective's page, under the member change: **Take the new words**. Check: "The member change is in force"; the members list shows the new members.
11. **(7.25) Destroy the old papers.** Once the rotation counts, they open nothing.
12. **(7.26) Check.** **A release** from Edubba, signed by one other member in their Dub, then **Check it as anyone would**. Check: it counts, signed with the new key.
13. **(7.27) Nothing kept.** `~/mor-kishib` holds only `access.json`, `run.json`, `kishib.log`.

**Checklist item 7:** Kišib's must-read screen in **Rotate a collective**. One line.

**Write down:** four new share papers (A, iPa, iPh, T) and the collective's new signing words. Destroy the old shares. Update the Cast card.

---

## Sitting 9: homes failing (about 30 minutes)

*From Part 3.2, A and B (decided 17 October). Nothing destructive.*

**What the apps should say, in general:** in plain words, which home did not answer; that the others hold the act; that nothing is lost; and that silence proves nothing (a home away is not a "no").

### A. Your Mac's home, home3, away for a while

home3 runs on your Mac, started at login by a login agent called `mor.home`. It is reached only through Tor (an onion address), so the apps here, which use home1 and home2, mostly never ask it. Nothing here touches its data.

1. **(3.2A.1)** Open home3's management page: `http://127.0.0.1:8080/manage/`. Check: it opens (to check: whether this browser is still paired).
2. **(3.2A.2)** Stop home3. In Terminal:
   ```
   launchctl bootout gui/$(id -u) ~/Library/LaunchAgents/mor.home.plist
   ```
3. **(3.2A.3)** Reload the management page. Check: it no longer answers.
4. **(3.2A.4)** On the iPhone, open `https://dubsar.org/feed.html`. Check: the posts still show, verified. The bar names the addresses it did not try (a browser never asks an onion home). Nothing should change.
5. **(3.2A.5)** In Edubba, prompt Machine, allegedly something short. Check: it still answers. Edubba's key check does not stop an act when a home is away (Edubba README, reading 38). Note anything it says about a home.
6. **(3.2A.6)** In Claude, ask: "Look up identity ‹your author identity's ID›: which homes does it have, and did each answer?" (to check: what the connector says about home3; it reads home1 and home2 by default). An ID is fine to paste; never words.
7. **(3.2A.7)** Start home3 again:
   ```
   launchctl bootstrap gui/$(id -u) ~/Library/LaunchAgents/mor.home.plist
   ```
8. **(3.2A.8)** Reload the management page. Check: it answers again. Look at its latest arrivals: are the acts made while it was away there? (to check: observation only, not a pass or fail.)

**Never** run `mor-relay rotate`, `init`, `--closure` or `unpair` on home3 for this test.

### B. Homes that cannot be reached (Dub's web client)

*Version 2 used test identity C. Use iPh.*

1. **(3.2B.1)** On the iPhone, open `https://dub.dubsar.org` as iPh. Let the page load fully.
2. **(3.2B.2)** Turn on airplane mode.
3. **(3.2B.3)** Follow someone by ID (T is a good choice). Check: Dub says the follow list was not sealed to the homes, which did not answer, and that it is kept here and sealed at the next change (Dub README, reading 18).
4. **(3.2B.4)** Try to post. Check: it says plainly that the homes or relays did not answer (to check: the exact words).
5. **(3.2B.5)** Turn airplane mode off. Unfollow and follow again. Check: the list is now sealed (a Bring on another device shows it). The post can be sent again.

**Checklist item 17:** a home's refusal told to the person. One line, whenever you saw one.

**Write down:** nothing on paper.

---

## Sitting 10: T's last day: Kišib with the homes away, then the escape (about 30 minutes)

*From Part 3.2 C and Test 6, step 14 (was human test 9). After this sitting, T is finished. Have T's chain-key paper and signing-key paper at hand.*

### C. Kišib with the homes away

*Version 2 made a throwaway identity "F" for this. Use T.*

*Kišib reads the homes before it signs, and "Send it again" sends the exact same bytes, never a second rotation (Kišib README, readings 3 and 4).*

1. **(3.2C.1)** Making F: skip. T is the throwaway.
2. **(3.2C.2)** Kišib, **Change an identity's keys** for T, **Read it back**.
3. **(3.2C.3)** Turn the Mac's Wi-Fi off. Press **Sign it**.
4. **(3.2C.4)** Check one of two outcomes, and write which:
   - Kišib refuses before signing, because it could not read the homes. Nothing was signed.
   - Or it signed and says "It does not count yet". Then turn Wi-Fi on, and press **Send it again (the same bytes)** until it counts.
5. **(3.2C.5)** Check: Kišib told you, while waiting, to keep it open, and what happens if it is closed (the next change from the same paper repairs it).
6. **(3.2C.6)** Finish: **Show the new signing key's words**, on T's paper (cross out the old ones), the three words. You need not give them to the apps: T ends below.

*(to check: whether step 3's timing gives the second outcome; the session's own test reached it with two of three homes switched off, which is not possible on these homes.)*

*Wi-Fi back on before the next part.*

### The escape (from Test 6, step 14, optional)

*Version 2 made a throwaway identity "E", with home1 only, for this. T has home1 only, so use T.*

1. **(6.14a)** In Kišib, change T's keys with its chain-key paper, as a thief would (**Change an identity's keys**), and do not give the new words anywhere. Do not write them down either.
2. **(6.14b)** Then in Kišib, **Escape a contested position, with both keys**: the chain words and T's old signing words (the last ones on T's paper), new home `https://home2.dubsar.org` (to check: the form's exact fields).
3. **(6.14c)** Check: it counts as an escape; T's earlier post still verifies; Kišib advises moving to new paper.

**Write down:** nothing new. Mark T on the Cast card as "finished, escaped". Its papers can be destroyed.

---

## Sitting 11: Ummia, a release and a specification (about 40 minutes)

*From Test 9 (was human test 12, and v1 test 8). Ummia and Edubba on the Mac.*

*The payer is the developer (version 2's P). The payee stands in for the reporting identity (version 2's Q).*

1. **(9.1) First use (the payer).** Open **Ummia** (check its icon). **Bring it** with the payer's ID, signing words and `https://home1.dubsar.org` (or the payer's home, from the Cast card). Check: the **Who acts** card, yourself ticked, and a line saying collectives come in a second round. Open the identity (top right): Ummia's line and its card for Kišib.
2. **(9.2) Settings.** Relays your acts go to: `https://home1.dubsar.org`. Tracking: `https://home1.dubsar.org` and `https://home2.dubsar.org`, one per line. The reporting identity: the payee's ID. **Save**.
3. **(9.3) A release.** In Finder, make a folder `~/Projects/testrelease` with two small text files. In Terminal, a hidden file:
   ```
   echo x > ~/Projects/testrelease/.secret
   ```
   In Ummia, **Releases**, **Choose a folder…**: Home, Projects, testrelease, **Use this folder**. Version `1.0`. **Read it back**. Check: every file with size and fingerprint, no `.secret`, "starts a new release line". **Sign and publish**. Then **Check it as anyone would**. Check: VERIFIED, 2 of 2 files.
4. **(9.4) Edubba no longer releases under one's own name.** Edubba, Identities, the payer (bring it if it is not there). Check: the card says releases are in Ummia. Collectives tab: a real collective's release is still there (the one from Sitting 7).
5. **(9.5) A specification.** **Specifications**: kind cMIP; text `# cMIP: Human test notes, draft 1`, an empty line, `Notes, for human test 12.` (no space at a line's end, no final line break). Open **Act types it defines**, write `0 note note = tstr`. **Read it back, with its hash**: write down the hash's first 8 characters. **Sign and publish**. Check: the same hash.
6. **(9.6) Tracking.** **Tracking**, **Look**. Check: the limit in plain words first ("sees public agreements only…"); your cMIP under Xtypes and under cMIPs and Modules, by you, its hash the one written down. **Accept it**.
7. **(9.14) The web client.** Open `https://ummia.dubsar.org`. Check: the red banner on every tab; **Releases** says releases need a computer.

**Checklist item 1:** Ummia's **Read it back**. One line.

**Write down:** the hash's first 8 characters (not a secret). Nothing on paper.

---

## Sitting 12: Ummia, a MIP and a bug report (about 35 minutes)

*From Test 9 (was human test 12, and v1 test 8). Ummia on the Mac; Dub as the payee on its own device.*

1. **(9.8) A MIP.** **MIPs**: title `Text, with footnotes`, forks **Text MIR**, **Start it in the MIP shape**. **Write it**: change a line, **Keep it here** (read the shape notes). **Publish this draft for discussion**.
2. **(9.9)** In Dub as the payee: follow the payer by ID. Check: the draft shows as a link to the reader. **Reply** to it ("Why footnotes?").
3. **(9.10)** Ummia, **Replies**. Check: the payee's reply, valid. Then **I am ready: publish it as a MIP…**: read the review (it forks the Text MIR, you are its creator), **Sign and publish**. **Tracking**, **Look**. Check: the MIP under "MIPs, by what they fork".
4. **(9.11) A bug report (v1 test 8).** **Reports**: write `Ummia: human test 12 report` and a line under it. **Sign and send it**. In Dub as the payee: **To you**: the report. **Reply** "Thank you". Ummia, **Reports**. Check: the answer shown, valid. Were the instructions clear without help? Compare with dubsar.org's report page (`https://dubsar.org/report.html`): does what it says match what the apps show?

**Checklist item 5:** a long document shown as plain text: the reader (plain text one tap away), Dub (a link to the reader, never raw markup). One line.

**Write down:** nothing on paper.

---

## The money sittings: how each starts and ends

*The regtest network has been running since 18 October (see "Already done"). **Leave it running between sittings**; stop it only at the end of Sitting 17. If it was stopped anyway, restart it as below; each start is a new chain, so in the test wallet look at bob's (and carol's) key and redo the Lightning settings in Damgar for every payee before anything else.*

1. *(Only if stopped)* From the MOR folder:
   ```
   BTCD_DIR=~/mor-regtest-tools/btcd-darwin-arm64-v0.24.2 LND_DIR=~/mor-regtest-tools/lnd-darwin-arm64-v0.18.5-beta \
     modules/lightning/regtest/up.sh ~/mor-regtest
   ```
2. The test wallet: in a second Terminal window, `cd clients/testwallet && npm start -- ~/mor-regtest`, and open `http://127.0.0.1:8478/` (if it is not already open). Check: a red band says it is a test wallet.
3. Damgar and Edubba on regtest: the two commands in "Already done", once.

---

## Sitting 13: lanes, pay-per-view and finding each other (about 75 minutes)

*Human test 14, from Damgar round 2's report. Dub, Damgar, Kišib, the test wallet. P is the payer and Q the payee of 18 October (iPa and iPh, held in Damgar on the Mac); C and B are new (see the Cast card). Its steps 1, 2 and 20 (updating the Mac, starting and stopping the network) are already covered.*

3. **(14.3)** **Three test identities.** Use P (the payer) and Q (the payee) from human test 11, or make them again in Dub. Make a third, **C** (the critic), display name "C". For each, write down its signing key's words. Bring all three into Damgar (**Bring an identity you have**), and **Accept these** with everything ticked. Check: the new entry "grant limits" is in the list.
4. **(14.4)** **The forms (F349).** In Dub, Q's identity window: **Copy ID** gives `mid1…`, and **Copy ID with where it lives** gives `mid1…?r=…`. Paste each into a note. Change one letter of the first, then try to **Follow** it as P: refused, "checksum does not hold". Follow Q with the true one: Q's posts appear. In Damgar, Kišib and Edubba, check that IDs are shown as `mid1…`.
5. **(14.5)** **Where Q is paid, and the receive-only link (as Q, in Damgar).** Settings: Lightning, bob's node key (from the test wallet), network regtest, **Read it back**, **Sign and publish it**, as in human test 11. Then "Making invoices by itself (receive-only)": `https://127.0.0.1:18081`, `~/mor-regtest/bob/receive.macaroon`, `~/mor-regtest/bob/tls.cert`, **Check it and keep it**. Read its cost. First try `~/mor-regtest/bob/data/chain/bitcoin/regtest/admin.macaroon`: refused, since it can read the balance.
6. **(14.6)** **Q's own lane (as Q).** **Lanes**, "Receipts and invoices, by itself": at most 5000, unit regtest, Until empty, **Read it back**. Read every line, then **Sign this lane**. Check: it is listed as in force, its key held by this Damgar.
7. **(14.7)** **Dub's lane (as P).** In Dub as P, identity window, "Paying from Dub: a lane from Damgar": keep "Dub on this computer", at most 2000, regtest, Until empty, **Ask Damgar for this lane**. In Damgar as P, **To sign**, **Look again**: the lane, in plain words (what it may sign, the cap, that it is public, how to end it). **Grant this lane**. Back in Dub, the fold shows it in force.
8. **(14.8)** **A tip from Dub (as P).** On a post of Q's: **Tip**, 1500, **Pay now, under the lane**. In Damgar, **Use this one** for Q and leave **To sign** open: it looks every 20 seconds (or press **Look again**), and answers by itself with an invoice from bob's node. Check: nothing was asked of Q. Back in Dub as P, Private tab, "Payments, under the lane": the invoice. **Copy the invoice**, pay it from **alice** in the test wallet, paste the preimage, and **Check it and sign the claim, under the lane**.
9. **(14.9)** **The receipt, by itself.** In Damgar as Q, **Look again**: "signed your receipt by itself". The account: came in 1 500, and the claim says "Signed under a lane of …" (P, a grant to itself), backed. As P: went out 1 500, the claim signed under "Dub on this computer". In **Lanes**, P's lane lists the acts signed under it.
10. **(14.10)** **Past the cap.** In Dub as P, tip 3000, **Pay now, under the lane**: refused: "3000 is above the grant's cap of 2000 per act". **Prepare it for Damgar** still works, as in round 1. Try it with 6000: sign it in Damgar as P, then **Look again** as Q: Q's Damgar does not answer by itself and says why ("6000 is above the grant's cap of 5000 per act", judged on the answer, F352); the invoice to make waits in To sign. Decline it, or make it by hand.
11. **(14.11)** **Every step by hand (as Q).** Settings, tick "Follow every step by hand". Tip Q 500 from Dub as P. Q's Damgar now waits: in **To sign**, an invoice to make, by hand as in human test 11, step 11. Untick it afterwards.
12. **(14.12)** **A sealed post (as Q in Dub).** Public tab, "Seal a post with a price": the text "The recipe: two parts clay, one part reed.", what everyone sees "A recipe, sealed.", price 1000, referral 10, **Seal it and post it**. In Damgar as Q, Lanes, "Referral shares, by itself": at most 500, **Read it back**, **Sign this lane**.
13. **(14.13)** **The repost (as C in Dub).** C's relays: in its identity window, "Change its relays", add a second relay (any test relay Q does not use), **Read it back**, read "A new routes act", **Sign and publish the new routes**. Follow Q, then **Repost** Q's sealed post. *(Optional: also try "Change its relays" on an identity brought into Dub: it says it publishes no routes for it.)*
14. **(14.14)** **C's receipt lane and link (as C in Damgar).** Settings: Lightning, carol's node key, **Read it back**, **Sign and publish it**. The receive-only link with `https://127.0.0.1:18082`, `~/mor-regtest/carol/receive.macaroon` and `~/mor-regtest/carol/tls.cert`. Lanes: "Receipts and invoices, by itself", at most 5000, signed.
15. **(14.15)** **The buyer reads only the other relay.** Make a fourth identity in Dub, **B**, its relay only the second one. Bring it into Damgar, and give it a lane as in step 7. In Dub as B, follow C by its ID (`mid1…`). The repost appears with its price; Q's original is not at B's relay. **Buy it, under the lane**: Dub says to name the repost you followed, and does. In Damgar, **Use this one** for Q, **Look again**: it answers with an invoice from bob's node. In Dub as B, Private tab, "Payments, under the lane": pay the invoice from **alice** in the test wallet, paste the preimage, **Check it and sign the claim, under the lane**.
16. **(14.16)** **The key, delivered.** Damgar as Q: **Look again** ("signed your receipt by itself", "A sale of your offer", "your offer promises 10% to the reposter"). Then in Dub, switch to Q (opening Dub's main screen looks for sales and delivers the key), then switch to B. The post opens in B's feed with its text.
17. **(14.17)** **The referral share.** Damgar as Q, **Look again**: "the referral share to C is asked for by itself". **Use this one** for C, **Look again** (it answers with an invoice from carol's node); back to Q, **Look again**, then **Pay**: 100 regtest satoshis. Pay it from **alice** in the test wallet (bob's channel cannot: its reserve), and paste the preimage. Damgar as C, **Look again**, then the account: came in 100, the claim "Signed under a lane of …" (Q), backed.
18. **(14.18)** **Revoke a lane (as P).** Damgar, **Lanes**, "Dub on this computer", **Revoke it**: the revocation is read back first, with how many acts it cites and its cost (public, every act's id listed, a long lane a long revocation, an act not found void). **Sign the revocation**. In Dub, tip again: refused, "“Dub on this computer” was revoked. Nothing was signed". The earlier tips stay paid in both accounts.
19. **(14.19)** **Kišib: Change the vault (H40).** Open Kišib: the first screen has the door **Change the vault**. Open it and read the first words (a change of keys, the chain key's paper needed). Stop there, or go on as in human test 11, step 18.

**On the web pages**

21. **(14.21)** **Dub on the web.** Make an identity, as above. Check: **Copy ID** gives `mid1…`, and **Copy ID with where it lives** carries `?r=`. Follow P by P's ID with where it lives (copied on the Mac in step 4's way): P's posts appear. Ask for a lane: its words say "Dub on the web".
22. **(14.22)** **Damgar on the web.** Bring the web identity, grant its lane. Settings, "Making invoices by itself (receive-only)": it says the web client never makes a link. The **Lanes** tab lists the lane, and **Revoke it** works.
23. **(14.23)** **Kišib on the web.** The door **Change the vault** is on the first screen. An identity's record shows `mid1…` and its acts as `mact1…`, with the hexadecimal beside.

**Write down:** C's and B's signing words, on their papers. Copy their IDs into the note.

---

## Sitting 14: Damgar, the rest of the money path (about 45 minutes)

*From Test 8 (was human test 11, and v1 test 11). Dub, Damgar, the test wallet. Version 2's P is the payer, Q the payee.*

1. **(8.9) The receipt (the payee).** *(Skip if you did it on 18 October.)* Damgar as the payee, To sign, **Look again**: a receipt to sign; **Check it, and sign the receipt**. **The account**: came in 1 500 regtest satoshis, folded, "paid and confirmed"; open it: claim and receipt each VALID. As the payer, **Look again**, then the account: went out 1 500, both VALID. *(If the network was restarted since the payment, note whether this still works: to check, added here.)*
2. **(8.10) On-chain.** As the payee in Dub, post again; as the payer, tip it 40000. Damgar as the payer: **Sign it**. As the payee: **Look again** (Damgar answers the address request by itself). As the payer, **Pay**: an address bound to this payment; **Copy the address**. Test wallet, alice, **On-chain**: send 40000 to it; copy the transaction ID; **Mine** 1. Damgar: paste the ID, **Check it and sign my claim**. Check: "pending". Test wallet: **Mine** 6. Damgar: **Check the chain again**. Check: valid. As the payee, **Look again**, sign the receipt; check both accounts.
3. **(8.11) A request to be paid.** In Dub as the payee, Private tab, **Ask someone to pay you**: the payer's ID, 700, prepare it. Damgar as the payee: **Sign and send the request**. As the payer, **Look again**. Check: the request, with **Accept as a debt (sign an obligation)** and **Pay it**. Press **Accept as a debt** first (check: its state shown unknown, with the reason), then **Pay it**, and finish as in steps 8.7 to 8.9:
   - **(8.7) The invoice (the payee).** **Use this one** for the payee; To sign, **Look again**: an invoice to make, with its description hash. Copy the hash. Test wallet, node **bob**, **Make an invoice**: the amount and the hash; copy the invoice. In Damgar, paste it, **Check it and send it**.
   - **(8.8) Paid from the test wallet (the payer).** Damgar as the payer, **Pay**: the invoice; **Copy the invoice**. Test wallet, node **alice**: paste, **Read it** (check: the amount, bob's key, the same hash), **Pay it**; copy the preimage. In Damgar, paste it, **Check it and sign my claim**. Check: "says valid".
   - **(8.9)** The receipt, as above.
4. **(8.12) Something not accepted.** Damgar as the payer, Settings: untick **Bitcoin units**, **Save what I accept**. In Dub as the payer, tip the payee's post 100. Damgar, **Look again**. Check: the amount reads "100 of unit … (Bitcoin units, not accepted here)", never "satoshis", and only **Decline** is offered. Tick Bitcoin units again, save, and decline that draft.

**Checklist items 1, 14 and 15:** Damgar's **To sign** and Settings' **Read it back**; whether anything told the payer, before paying, that the payee's clock cannot protect the payment; whether an undeliverable payment was kept as an open obligation. One line each (14 and 15: **not in an app yet (to check)**, per version 2).

**Write down:** nothing on paper. Leave the network running.

---


## Sitting 15: Damgar with Ummia and Edubba, and anchoring (about 45 minutes)

*Since round 3, a collective's releases and their anchoring are made in Ummia (acting for the collective with a member's own key); Edubba's anchoring of a collective act stays.*

*From Test 9 step 7 and step 12, and Test 8 steps 13 and 15.*

1. **(9.7) The accepted list, between apps.** Ummia, **Accepted**: your cMIP is there, and Damgar's entries from test 8, marked as Damgar's part. Remove **Lightning rail** here. After a minute, Damgar as the payer, Settings. Check: Lightning unticked. Tick it again in Damgar, save. Back in Ummia, **Accepted**. Check: Lightning is back, your cMIP still there.
2. **(8.13)** *(Optional, needs the collective)* **Anchoring.** In a third Terminal window, from the MOR folder:
   ```
   cd clients/anchoring-service && npm start -- --regtest ~/mor-regtest --homes https://home1.dubsar.org --relays https://home1.dubsar.org
   ```
   Copy the identity it prints. Bring the collective's founder (A) into Damgar by its signing words; accept all. Edubba, Collectives, the collective, **Anchor one of its acts on Bitcoin (optional)**: paste the service's identity, **Read its offer**, a tier, **Prepare the payment for Damgar**. Check: no release is offered. Damgar as the founder: **Look again**, read it (an anchor of the act's fingerprint, never the act), **Sign it**; after a few seconds, **Look again**, **Pay**: the invoice and the ticket. Pay from alice, paste the preimage. Edubba: asked, then pending; test wallet **Mine** 6; Edubba: anchored at its block.
3. **(9.12)** *(Optional, on regtest)* **Anchoring a release.** With the network and the anchoring service still running, from the MOR folder:
   ```
   cd clients/ummia && npm start -- --regtest ~/mor-regtest
   ```
   Close the tab, use the app. **Releases**, testrelease 1.0: **Anchor it on Bitcoin (optional)**, the service's ID, **Read its offer**, a tier, **Prepare the payment for Damgar**. Damgar as the payer: **Look again**: "Prepared in Ummia"; sign, pay from alice, paste the preimage. Ummia, **Releases**: asked, then pending; **Mine** 6; anchored at its block.
4. **(8.15)** *(Optional)* **The web client.** Open `https://damgar.dubsar.org`. Check: the banner on every screen; an on-chain payment there says "Not checked here".

**Write down:** nothing on paper. Ctrl-C the anchoring service; leave the network running.

---


## Sitting 16: a collective and its money (about 2 hours, or two sittings: stop after step 17)

*Human test 15, from round 3's report. A on the Mac (Edubba, Dub, Damgar, Ummia, the test wallet, the split service); iPa on the iPad and iPh on the iPhone, in Dub's web client. iPa's and iPh's money is received on the Mac: their Damgar runs there. Copying from the iPad or iPhone to the Mac is easiest by Universal Clipboard. C plays R, the reposter; B is the buyer of Sitting 13. Its steps 1, 2 and 33 (updating the Mac, starting and stopping the network) are already covered.*

**Setting up**

*In step (15.4), A, iPa and iPh already exist: use them, do not make them again; bring them into Damgar only if not there yet.*

3. **(15.3)** **The split service.** In a third window:

   ```
   cd clients/split-service && npm start -- --regtest ~/mor-regtest --homes HOMES --relays RELAY --payer alice
   ```

   HOMES is the test homes, separated by commas, and RELAY the test relay. It prints its identity (`mid1…`): copy it into a note. Leave it running; it says what it does each round.

4. **(15.4)** **The cast's identities.**
   - A: in Dub on the Mac, A as in human test 14 (or make A again). Write down its signing key's words.
   - iPa: on the iPad, in Dub's web client, make **iPa**. Write down its signing words; Dub shows them on request.
   - iPh: on the iPhone, make **iPh** the same way.
   - On the Mac, bring all three into Damgar (**Bring an identity you have**, by their signing words) and **Accept these**, everything ticked.
5. **(15.5)** **Where each is paid.** In Damgar, for each of A, iPa and iPh in turn (switch identity):
   - Settings: Lightning, bob's node key (from the test wallet), regtest, **Read it back**, **Sign and publish it**.
   - The receive-only link: bob's REST port, `~/mor-regtest/bob/receive.macaroon`, `~/mor-regtest/bob/tls.cert`, **Check it and keep it**.
   - **Lanes**, "Receipts and invoices, by itself": at most 10000, **Sign this lane**.
6. **(15.6)** **Edubba.** Open Edubba and bring A by its words (Identities tab). In the Agents tab, use an agent you already have (Machine, allegedly) as the keeper: copy its ID.
7. **(15.7)** **The grid (Edubba, Collectives tab, + Found a real collective).**
   - Members: A (the founder), iPa and iPh by their IDs.
   - Areas:
     - **Publishing**: posts and publications, all three boxes, 1 key.
     - **Offers and deals**: agreements (the whole layer), A and iPa, 1 key.
     - **Money**: A and iPa, 1 key, **Above 10000 regtest sats, one more key**.
   - Read every band and each member's column. **Review**, read it, then sign.
8. **(15.8)** **Signing on the iPad and the iPhone.** In Dub's web client, turn the Signing tab on (its warning). Read the founding in plain words and sign it. Check: "your own key" is said, made as you sign. Write down the share when it is shown, then type back the three words asked.
9. **(15.9)** **Found it** (Edubba): tick "I have read what this device will hold", then **Found it: deal the shares**. Write down A's share.
10. **(15.10)** **A's key from Damgar.** On the Mac, Damgar as A, **For a collective**: give the collective's ID.
    - Check: "Its Money area, “Money”: … 1 key; above 10,000 an act, one more".
    - A promise to iPh, 2000, "clay": **Read it back**, then **Sign it for the collective, with my own key**. It counts.
    - Then 50000, "a kiln": it says it needs 2 keys.
11. **(15.11)** **iPa's second key, on the iPad.** In Dub's Signing tab, the money act: read it, sign it. Back in Damgar as A: both promises count, the second "2 of 2 keys, each a member's own".
12. **(15.12)** **A's key from Ummia.** Ummia, A brought by its words. **Act for it**, the collective's ID, then choose it under Who acts. Release a small folder. Check: one key of Publishing counts, signed with A's own key.

**The collective's money**

13. **(15.13)** **The service's key for the collective.** In a fourth Terminal window:

    ```
    cd clients/split-service && node --import tsx src/cli.ts key COLLECTIVE_ID
    ```

    COLLECTIVE_ID is the collective's ID. It prints a key of 64 hexadecimal characters.
14. **(15.14)** **Its money (Edubba, the collective's page, "Its money: who owns its income, who divides it").**
    - Fill in: A 50, iPa 30, iPh 20; referral 10; the service's ID and the key from step 13; the keeper's ID (the agent), 1.
    - **Review it**, and read each section: who owns its income, how each payment is divided, who divides it, who keeps its record, what it changes, the risks.
    - Try 50 / 30 / 10 first: refused, "add up to 90%".
    - Then sign it.
15. **(15.15)** **iPa and iPh sign it in Dub on the web** (Signing tab).
16. **(15.16)** **Record it.** Back in Edubba, on its card, **Look for answers**, then **Record it**. Check: "Its payee pointer now leads to the split service …, signed with A's own key in its area “Money”" (F358: the Money area signs it, never the collective's own key), and "One key of the area". In the service's window: "grant … accepted".
17. **(15.17)** **The keeper.** The collective's page, **Its keepers**: the agent, **Record what arrived**. It lists each record. Press it again: nothing new to record.

**A protected file, bought through a repost**

18. **(15.18)** **Publishing (Edubba).** Who acts: the collective. A text, "Three verses, by three hands.", title "Verses, by the collective", price 3000. **Read it back**: it says it is the collective's, under its agreement in force. Sign it.
19. **(15.19)** **The reposter.** In Dub on the Mac, make **R**, bring it into Damgar, and link it to carol's node as A was linked to bob's in step 5 (carol's REST port, `~/mor-regtest/carol/…`). As R, follow the collective, then **Repost** its post.
20. **(15.20)** **The buyer.** In Dub on the Mac, make **B**; bring it into Damgar and give Dub a lane as in human test 14, step 7. As B, follow R only. The repost shows its price. **Buy it, under the lane**: Dub says the split service answers for the collective.
21. **(15.21)** **Paying.**
    - The service's window: "An invoice of its node sent".
    - Damgar as B: **Look again**.
    - In Dub as B, Private tab: copy the invoice, pay it from **alice** in the test wallet, paste the preimage, **Check it and sign the claim, under the lane**.
22. **(15.22)** **The split.** The service's window, within a few rounds:
    - "its receipt signed with … grant key";
    - "naming the repost by …";
    - "Split …: 300 … (referral), 1350 …, 810 …, 540 …";
    - "The sale told to 3 parties".

    In Damgar, switch to A, then iPa, iPh and R, pressing **Look again** each time: each answers its payout's invoice request by itself. The service pays each one ("Paid … to …").
23. **(15.23)** **The accounts.** Damgar, each of A, iPa, iPh, R: came in 1 350, 810, 540 and 300, from the split service, receipted.
24. **(15.24)** **The key.** Edubba, Publishing tab: open it, and it delivers the key "as the collective". In Dub as B, the post opens with its text.

**A vow, and the referral judged as yourself (optional)**

25. **(15.25)** **A vow of A's.** Publishing tab, Who acts: A. A vow, "A seat at the reading of the tablets, on the first evening.", title "A seat, vowed", price 500. Read it back, then sign.
26. **(15.26)** **Two buyers on the iPad and the iPhone.**
    - In Dub on the web as iPa and as iPh: each asks Dub for a lane (on the Mac, Damgar as iPa or iPh: **To sign**, **Grant this lane**). Each follows A and **Buy it, under the lane**.
    - On the Mac, Damgar as A, **Look again**.
    - Each invoice: copy it from the iPad or iPhone, pay it from alice on the Mac, paste the preimage back on the device.
27. **(15.27)** **One kept, one not.**
    - On the iPad (iPa): Signing tab, **Vows you bought**, **Confirm: it was kept**.
    - On the iPhone (iPh): **Contest it**, "The seat was given to someone else."
    - Edubba, **Look up an identity's vow sales**: A, the test relay. One confirmed, one contested.
28. **(15.28)** *(Optional)* **A judged referral as yourself.** Run `key` with A's ID instead of the collective's. Publish a text as A with referral 20, then open **Judge the referral: paid by a split service**: the service and that key. Read the new section, "The deal, before the offer". Buy it as B through R's repost: 200 to R and 800 to A, paid by the service, and the key delivered by Edubba.

**Keepers, a resignation, a dispute**

29. **(15.29)** **The keeper again.** **Record what arrived**: the sale's acts of the collective.
30. **(15.30)** **iPh resigns, on the iPhone.** Dub's Signing tab, the founding, **Leave this collective…**. Read it (you resign alone; it takes effect at the collective's line; you keep your stake). Then **Sign my resignation**.
31. **(15.31)** **Registered.** Edubba, the collective's page: "Leaving alone", **Register it at the collective's line**. Then **Record what arrived**: the resignation and the line are recorded.
32. **(15.32)** *(Optional; it changes iPa's keys)* **A dispute, not a void.**
    - In Kišib on the Mac, change iPa's keys from iPa's chain key paper (the words written when iPa was made). Read which lines it keeps; leave out the one that holds iPa's signature on the money terms, and read the warning. A line Kišib cannot read (a private act made on the iPad) is left out by itself: the warning names it.
    - In Edubba, **Record what arrived**, then the keepers' card: "Disputes, not voids". iPa's signature is void under Identity and shown as a dispute, recorded before the rotation, and the money terms are still in force.
    - On the iPad, give Dub iPa's new signing words.

**Write down:** the second collective's three share papers; its ID in the note. If you did step 32, iPa's new signing words (cross out the old ones).

---

## Sitting 17: two key changes, last (about 45 minutes)

*These change the signing words of iPa and iPh, so they come last. Have the payer's and payee's chain-key papers and signing-key papers at hand. Each new set of words goes to every app that holds that identity, including its web client on the iPad or iPhone (it will say the key was changed elsewhere, as T's did).*

1. **(9.13) Kišib keeps Ummia's line.** Ummia's identity window: copy its card. Kišib, **Change an identity's keys** for the payer with the payer's chain-key paper; paste the card where it asks for lines it cannot read. Check: the review says Ummia's line is kept. Sign, write the new words (cross out the old ones on the payer's paper). Give them to Dub, Damgar and Ummia (**Use the new words**), and to the payer's web client. Ummia, **Tracking**, **Look**. Check: the cMIP and MIP still verified, claimed by the payer.
2. **(8.14)** *(Optional)* **The vault.** *(Since round 2, Kišib's first screen also has **Change the vault**, opening this same flow.)* Kišib, **Change an identity's keys** for the payee with the payee's chain-key paper. Where it asks for lines it cannot read, paste Damgar's line card (Damgar's identity window, as the payee). Open **The vault**, **Declare it anew**: unit regtest, Lightning carol's node key (from the test wallet), limit 10000. Read the review, sign, write the new words (cross out the old ones). Give them to Dub (**Use the new words**), Damgar as the payee (**Give the new words**), and the payee's web client. Check: Damgar's Settings show the vault, read only. A tip of 20000 from the payer then goes to the vault: the payee's invoice on **carol**; the payer pays from alice; claim and receipt verify.
3. **(8.16) Stop** the network, now that every sitting is done: from the MOR folder, `modules/lightning/regtest/down.sh ~/mor-regtest`, and Ctrl-C in the other Terminal windows.


### Closing (five minutes)

4. **The recovery custodian path (Part 3.3).** Waits: not in an app yet. The freeze test suite's step 3.7ae says the owners of a collective may vote its operators out, and where the constitution gave the owners a custodian of the recovery path, the rotation is made through that custodian. The suite marks this "to build". No app builds it today: Kišib rotates a collective only from its members' paper shares, and no founding form in Edubba names a recovery custodian (to check). Nothing to run. Write one line if anything you saw in Edubba or Kišib suggested otherwise.
5. **The checklist.** Read the list below. Any item without a line yet: write "seen", "not seen" or "not clear".

**Write down:** the new signing words of the payer (and the payee, if you did the vault). Update the Cast card.

---

## The client conformance checklist (Part 3.1), filled as you go

*Some rules only the signer's own app can honour: no verifier can see them from the acts. The freeze test suite marks them "conformance" (`spec/03-MOR-freeze-test-suite-v28.md`). For each: one line, "seen", "not seen", or "not clear". The sitting says where to look.*

1. **What you sign is what you saw.** Every app shows the exact act in plain words before anything is signed, and nothing is signed until you press. Look at: Edubba's **Review the founding**, **Review the change**, **Review the release**, **Read the grant back**; Dub's Signing tab; Kišib's **Read it back**; Damgar's **To sign** and Settings' **Read it back**; Ummia's **Read it back**. *(Sittings 4, 5, 6, 7, 11, 13.)*
2. **Invisible and bidirectional characters shown before signing.** Look at: Dub's Signing tab and Edubba's **Rely on an act**, which write every invisible control out. To try it: a "right-to-left override" in a test collective's name, from the Mac's Edit menu, **Emoji & Symbols** (to check: whether the name field accepts it), then read the proposal in Dub. *(Sittings 5, 6.)*
3. **A witness act is never signed as a side effect, and is explained first.** Look at: Edubba's **Rely on an act** (it signs only once **RELY** is typed). *(Sitting 5.)*
4. **A reply names the post's signer, and the app fetched the post first.** Look at: Dub's **Reply**; the reader shows the post the reply answers. *(Sitting 2.)*
5. **A long document is shown as plain text by an app that cannot render it.** Look at: the reader (the plain text one tap away); Dub (a link to the reader, never raw markup). *(Test 1, done; Sitting 12.)*
6. **An agent signs nothing to a stranger without your pick or nudge** (the nudge cMIP). Look at: Edubba's Agents tab, **What it did**. *(Sitting 3.)*
7. **The founding warning** (F337). Look at: Edubba's **Before you found: what this device will hold**; Kišib's must-read screen in **Rotate a collective**. *(Sittings 6, 8.)*
8. **The owners' founding warning** (step 3.7ae). The wording exists in the collective library Edubba reads constitutions with. Whether any founding form today lets you write such a constitution: **(to check)**. Otherwise: **not in an app yet**. *(Sitting 6.)*
9. **A split shown with its payouts before signing.** **Not in an app yet** (Damgar round 3).
10. **A key delivery with a wrong key: valid, its key ignored, and "shown so".** **Not in an app yet** (the suite says so).
11. **The censored reader's warning.** The words are in the reader's message box, but the reader never accepts such a rotation, so it cannot appear in these tests. **Not reachable in an app yet.**
12. **Never defaulting to a device-bound policy** (Identity rule 25). Check that Dub's make form, Edubba's new identity and Kišib offer no "device" choice at all. Otherwise **not in an app yet**. *(Sitting 5; Edubba's new identity form whenever you open it.)*
13. **Keepers never hold content keys.** **Not in an app yet** (keepers come with Damgar round 3).
14. **A payer told, before paying, that the payee's clock cannot protect the payment.** **Not in an app yet (to check)**: not found in Damgar's code. *(Sitting 13.)*
15. **An undeliverable payment kept as an open obligation, the payee told.** **Not in an app yet (to check).** *(Sitting 13.)*
16. **The seller's alarm, no silent second successor, the newcomer's check** (deals). Built in Edubba's received items, but no app here makes deals. **Not reachable in these tests.**
17. **A home's refusal told to the person.** Look at: what Dub and Kišib say when a home refuses (its daily limit). *(Sittings 5, 9, 10.)*

---

## Free play (was v1 test 12)

Anything you are curious about, after the run. From version 2:

- **Show an identity's record** in Kišib, and compare it with Edubba's record of the same identity (A works).
- **MOR as seen by this agent**, in Edubba: what Machine, allegedly follows and sees.
- Kišib's web client on the iPad (`https://kishib.dubsar.org`): **Check paper words** only. Check: the banner; nothing kept in the browser.
- The listing page (`https://dubsar.org/listing.html`): does "One listing among any" read clearly?
- **Name or confirm a successor** in Kišib. This one needs two throwaway identities, so it is left out of the run. Skip it unless you want to make them.

## How to report

One line per observation, in a note on your Mac:

*Test N, step M: what I did / what I expected / what happened / how it felt.*

(The step numbers in this sheet, like "6.8", are Test 6, step 8. Add the sitting if it helps.)

- Add **"not plain words"** where an app's words were unclear.
- Add **"not verified"** where something that should verify did not.
- Add **"(to check)"** steps you could not follow, with what you saw instead.
- For anything not found across homes: name the act, the device and the home.
- Never put words from your papers in the note.

**Where findings go.** Bring the note to the project lead. The lead turns each line into a finding (H38 onward, in `docs/human-tests-v1-findings.md` or its successor), and asks you the questions one at a time, before the freeze-ready drafts.
