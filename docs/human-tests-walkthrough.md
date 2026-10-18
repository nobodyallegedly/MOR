# The human tests, as one walkthrough

*18 October 2026. For Nobody, allegedly. The same steps as `docs/human-tests-v2.md`, rearranged into one continuous run with a fixed cast. Every button, command and path is copied from version 2, which was checked against the READMEs. Where version 2 said **(to check)**, the mark is kept. Marks added here say **(to check, added here)**.*

*Why this version: make each identity once, write its words once, and reuse it everywhere.*

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

**T, the throwaway** (the only extra identity in the whole run)
- Made in Sitting 5. Device: the Mac (Dub, Edubba), the iPad (Dub's web client) for a moment
- Home: `https://home1.dubsar.org` only
- Chain-key paper kept at: ______________________
- Signing-key paper kept at: ______________________ (one sheet: cross out the old words and write the new ones under them each time they change)

**Throughout this sheet:** "the payer" and "the payee" mean whichever of iPa and iPh played that role this morning. Version 2 called them P and Q.

---

## Already done (18 October): skip unless you want to repeat

- **Part 1.1, updating the Mac** (all eight steps). *Done 18 October, skip unless you want to repeat.* After Damgar round 2 lands, repeat its steps 2 to 5 once (see the Damgar block at the end).
- **Part 1.2, the regtest network**, step 1 (the programs, checked) and step 4 (Damgar and Edubba follow the chain). *Done 18 October, skip unless you want to repeat.* Steps 2 and 3 (start the network, open the test wallet) come back in each Damgar sitting.
- **Test 1 (was v1 test 1): dubsar.org and the reader on a phone.** Passed. *Done 18 October, skip unless you want to repeat.*
- **Test 8 (was human test 11), steps 1 to 8**: iPa and iPh made, brought into Damgar, the payee's Settings, a tip, the invoice, the payment from the test wallet. *Done 18 October, skip unless you want to repeat.*

**If today's network is still running**, you may finish step 8.9 now (the receipt, five minutes; it is the first step of Sitting 13). Then stop the network: from the MOR folder,
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
10. **(5.1) The look.** Edubba's tabs read **Agents, Collectives, Publishing, Identities**. Publishing shows its card ("Coming after Damgar's round 2"). Check: lines and outlines faintly emerald. Open Dub: its lines faintly warm pearl.
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

## The Damgar block: may change after round 2

*Damgar round 2 is being built now. It will change Damgar and Dub (lanes, and how IDs are written for people). Every step below **may change after round 2**. Before Sitting 13: if round 2 has landed, repeat Part 1.1, steps 2 to 5, and check that the button labels below still match.*

**Each Damgar sitting starts the same way** (Part 1.2, steps 2 and 3):

1. From the MOR folder, start the network:
   ```
   BTCD_DIR=~/mor-regtest-tools/btcd-darwin-arm64-v0.24.2 LND_DIR=~/mor-regtest-tools/lnd-darwin-arm64-v0.18.5-beta \
     modules/lightning/regtest/up.sh ~/mor-regtest
   ```
   Check: after a minute or two, "regtest Lightning network ready in …/mor-regtest". Each start is a new chain.
2. In a second Terminal window, from the MOR folder:
   ```
   cd clients/testwallet && npm start -- ~/mor-regtest
   ```
   Open `http://127.0.0.1:8478/`. Check: a red band says it is a test wallet; alice has coins in channels, bob and carol have none.
3. Each start is a new chain. In the test wallet, look at bob's key, under its name. If it differs from the Lightning key in the payee's Damgar Settings, redo step 8.3 (where the payee is paid) before anything else (to check, added here).

**And each ends the same way** (Part 1.2, step 5): from the MOR folder,
```
modules/lightning/regtest/down.sh ~/mor-regtest
```
then Ctrl-C in the other Terminal windows.

---

## Sitting 13: Damgar, the rest of the money path (about 45 minutes). May change after round 2.

*From Test 8 (was human test 11, and v1 test 11). Dub, Damgar, the test wallet. Version 2's P is the payer, Q the payee.*

1. **(8.9) The receipt (the payee).** *(Skip if you did it on 18 October.)* Damgar as the payee, To sign, **Look again**: a receipt to sign; **Check it, and sign the receipt**. **The account**: came in 1 500 regtest satoshis, folded, "paid and confirmed"; open it: claim and receipt each VALID. As the payer, **Look again**, then the account: went out 1 500, both VALID. *(If the network was restarted since the payment, note whether this still works: to check, added here.)*
2. **(8.10) On-chain.** As the payee in Dub, post again; as the payer, tip it 40000. Damgar as the payer: **Sign it**. As the payee: **Look again** (Damgar answers the address request by itself). As the payer, **Pay**: an address bound to this payment; **Copy the address**. Test wallet, alice, **On-chain**: send 40000 to it; copy the transaction ID; **Mine** 1. Damgar: paste the ID, **Check it and sign my claim**. Check: "pending". Test wallet: **Mine** 6. Damgar: **Check the chain again**. Check: valid. As the payee, **Look again**, sign the receipt; check both accounts.
3. **(8.11) A request to be paid.** In Dub as the payee, Private tab, **Ask someone to pay you**: the payer's ID, 700, prepare it. Damgar as the payee: **Sign and send the request**. As the payer, **Look again**. Check: the request, with **Accept as a debt (sign an obligation)** and **Pay it**. Press **Accept as a debt** first (check: its state shown unknown, with the reason), then **Pay it**, and finish as in steps 8.7 to 8.9:
   - **(8.7) The invoice (the payee).** **Use this one** for the payee; To sign, **Look again**: an invoice to make, with its description hash. Copy the hash. Test wallet, node **bob**, **Make an invoice**: the amount and the hash; copy the invoice. In Damgar, paste it, **Check it and send it**.
   - **(8.8) Paid from the test wallet (the payer).** Damgar as the payer, **Pay**: the invoice; **Copy the invoice**. Test wallet, node **alice**: paste, **Read it** (check: the amount, bob's key, the same hash), **Pay it**; copy the preimage. In Damgar, paste it, **Check it and sign my claim**. Check: "says valid".
   - **(8.9)** The receipt, as above.
4. **(8.12) Something not accepted.** Damgar as the payer, Settings: untick **Bitcoin units**, **Save what I accept**. In Dub as the payer, tip the payee's post 100. Damgar, **Look again**. Check: the amount reads "100 of unit … (Bitcoin units, not accepted here)", never "satoshis", and only **Decline** is offered. Tick Bitcoin units again, save, and decline that draft.

**Checklist items 1, 14 and 15:** Damgar's **To sign** and Settings' **Read it back**; whether anything told the payer, before paying, that the payee's clock cannot protect the payment; whether an undeliverable payment was kept as an open obligation. One line each (14 and 15: **not in an app yet (to check)**, per version 2).

**Write down:** nothing on paper. Stop the network.

---

## Sitting 14: Damgar with Ummia and Edubba, and anchoring (about 45 minutes). May change after round 2.

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

**Write down:** nothing on paper. Stop the network, and Ctrl-C the anchoring service.

---

## Sitting 15: two key changes, last (about 45 minutes). May change after round 2.

*These change the signing words of iPa and iPh, so they come last. Have the payer's and payee's chain-key papers and signing-key papers at hand. Each new set of words goes to every app that holds that identity, including its web client on the iPad or iPhone (it will say the key was changed elsewhere, as T's did).*

1. **(9.13) Kišib keeps Ummia's line.** Ummia's identity window: copy its card. Kišib, **Change an identity's keys** for the payer with the payer's chain-key paper; paste the card where it asks for lines it cannot read. Check: the review says Ummia's line is kept. Sign, write the new words (cross out the old ones on the payer's paper). Give them to Dub, Damgar and Ummia (**Use the new words**), and to the payer's web client. Ummia, **Tracking**, **Look**. Check: the cMIP and MIP still verified, claimed by the payer.
2. **(8.14)** *(Optional, needs the network: start it first)* **The vault.** Kišib, **Change an identity's keys** for the payee with the payee's chain-key paper. Where it asks for lines it cannot read, paste Damgar's line card (Damgar's identity window, as the payee). Open **The vault**, **Declare it anew**: unit regtest, Lightning carol's node key (from the test wallet), limit 10000. Read the review, sign, write the new words (cross out the old ones). Give them to Dub (**Use the new words**), Damgar as the payee (**Give the new words**), and the payee's web client. Check: Damgar's Settings show the vault, read only. A tip of 20000 from the payer then goes to the vault: the payee's invoice on **carol**; the payer pays from alice; claim and receipt verify.
3. **(8.16) Stop** the network (Part 1.2, step 5).

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
