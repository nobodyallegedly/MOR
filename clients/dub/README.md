# Dub (mor-dub)

**Dub** (𒁾, "tablet"; called MOR Post until 13 October 2026): the app for one person's public and private life on MOR. **Rebuilt on the Dubsar Suite's kit (`clients/kit`) on 21 October 2026**, as the redesign Nobody, allegedly, and the Suite lead drew and approved (`docs/design/suite-redesign.md`; the pictures in `docs/design/mockups/`; the session's report, `docs/kit-dub-report.md`). On the Mac, a program and its page; the same page runs on its own in a browser as **Dub's web client**, for testing only (F281), served at `dub.dubsar.org`.

**Test identities only, until MOR is frozen.** Every key is held in software.

## In plain words

**No tiles.** At the top, a switch: **Public · Private · Notes · Purchases**. **Contacts** top left. The identity in use top right. Dub always opens on Public.

**The first screen.** Dub opens once an identity is here. **Make a new identity**: a home address, relays if you like, a display name if you like (published right after the genesis, H12; a malformed one refused before anything is made). Dub shows **the chain key's 24 words**, once: write them on paper; they are the only way to change the identity's keys, in Kišib, never in Dub. Dub keeps nothing of the chain key. When you say they are written, the words disappear, and only then are three asked back (H3). **Bring an identity you have**: its ID and **the signing key's 24 words**; Dub checks they give its current key; they carry its encryption key too, so its private messages open here (the carry Module, draft 2), unless the identity was made by an app that did not make its encryption key from its words, which is said.

**Public.** Three lenses above the feed box: **Following · To you · Relay**.
- **Following**: your posts and those of the people you follow, muted ones left out.
- **To you**: replies to your posts, and public messages and mentions addressed to you, with a count until seen.
- **Relay**: every public act at this identity's relays, anyone's; **text and envelope acts by default**, the other layers (Identity, Agreements, Money, Development, other) behind a filter of chips (H55).
- The feed box fills the window and scrolls inside, never the page (H42). Under it, **whose clock orders it** (H54): **the Dubsar clock** (decided by Nobody, allegedly, 23 October 2026: "For now, the dubsar suite relies on the dubsar timestamp clock module with optional anchoring to BTC"), the timestamp clock dubsar.org's feed names, "Ordered by the Dubsar clock"; where it stamped nothing shown, each signer's own sequence, said as not a time. Each card shows the clock's time, faint, "… · by the Dubsar clock"; where the clock has not stamped the act, the signer's own hint, labelled; with neither, no time. No choice of clock on the screens for now: This app names the Dubsar clock (the earlier form and its `clock` operation are kept, not read, for when better clocks come). **Which clock**: the Dubsar clock, identity `1c743854ba1884b470f02221395d18d1abe977631bf86f0f221e32e6d83cf453` (its genesis, at home1 and home2; a public identity, not an address), written in `clients/barebone/src/clock.ts` and dubsar.org's feed page (decided by Nobody, allegedly, 23 October 2026: "The clocks is a Dubsar feature, so yes in app stored hash works"). A lane's **Until…** is prefilled with it, shown in the lane's words (decided: "Yes"), since the grant signs it.
- **The typing box** stays at the bottom: a text, a **picture** (a JPEG, stripped of what it carries) a **film** (an MP4 the video Module plays, stripped, H52) or a **recording** (Audio: an M4A the audio Module plays, stripped of its title, artist, cover and the rest), **@** to mention someone **by name** (a mention addresses the post to them and leaves it in their inbox), **To…** the same by a field. Names come from your contacts, never hashes; a faint short ID shows only where two names collide (H57, H78). Enter posts; Shift and Enter goes to a new line.
- A long-form document shows its title and a link to the reader.

**The act card** (the kit's, the same in every app). The signer's short ID and name **top left**, the act's short ID **bottom right**; each opens **its own menu**, by a click or a tap, never on hover (H49, H68, H77).
- The **signer's menu**: Copy ID, Copy ID link, Open profile; below the line, Follow (adds to contacts) or Following, **Message**, Mute.
- The **act's menu**: Copy act ID, Open what it answers or corrects, Why it's valid; below the line, Dub's own: **Reply**, Repost (a sealed post, where Dub can repost it), **Rely on it**, **Anchor it**, **Correct it** (your own acts), **Tip**, **Buy** (a sealed file or a vow for sale), **Withdraw the picture / the film / the recording** (your own); on a vow you bought, after a line, **Confirm: it was kept** and **Contest it…** (decided, question 5: only on vows you bought).
- One ✓ on a verified card; a void or contested act keeps its alarm line in red. Quiet labels: answers…, correction of…, corrected by…, signed under a grant (on whose authority, F343), **a pick or a nudge and who gave it** (H65), to you.
- **Open what it answers or corrects** (H50, H74): a pop-up holding a small feed box, the act fetched from where its signer lives; opening something inside replaces it, with a back arrow; closing returns where you were.
- **Why it's valid**: what it is, who signed it, its signer's identity chain, its standing in plain words, what it names; a verdict never rests on a clock or a relay.
- **Rely on it**: read back first, then RELY typed, as Edubba asks; a witness act signed (Identity), public: it keeps that act visible as disputed should its author ever disown it.
- **Anchor it**: name an anchoring service, read its standing offer, choose a tier: the payment is prepared for Damgar (the anchoring cMIP: anyone may anchor any act); the blind that ties the anchor to the act is kept here.
- **Correct it**: a new post naming yours, labelled "Correction" (the corrections cMIP); the original stays as signed.

**A profile** (from Open profile, or a contact): light and friendly. The name, its own display name beneath if it differs, one line on where it lives (and since when, where the Dubsar clock stamped its genesis), the ID link to copy, a red line only when there is trouble (its homes disagree about its keys), **Follow**, **Message**, **Pay**, its posts, and quietly "Full record in Kišib".

**Contacts** (top left): one list, the people you follow (the people cMIP's list sealed to yourself, H29), names first, found by name; each opens its profile, or Message. Below: add by ID (an ID, an ID link, or an ID with a home beside it) with a name sealed to you; the muted, to unmute; whether to publish whom you follow (private by default, the warning shown first). The same list in Public and Private.

**Private: a mailbox.** Conversations on the left, one per identity; the thread; the typing box at the bottom. A message to someone new opens an empty thread first. Every message is sealed to each recipient (F293).
- **Cc** (optional): others sealed in as well; every recipient sees who else received it (decided).
- **A collective appended** (the appended collective cMIP, draft 1, `cmips/cmip-appended-collective-draft-1.md`): written in your own name, "+ of Collective Y" adds the collective; it binds nothing; the reader's Dub shows "of Collective Y" only where your membership checks (its agreement in force, read from its places).
- **+ Ask to be paid**: a request prepared for Damgar.
- Where proposals to sign wait in the inbox, Private says so: they are signed in Edubba, Collectives › To sign.
- On a phone, the conversations come first and fold away once one is open, with a back arrow.

**Purchases.** Files bought and vows purchased, one feed box, **All · Files · Vows**: a file opened once its key arrived (checked against its fingerprint; a film or a recording sold from Edubba's Publishing checked again by its Module, the video's or the audio's, and played from those bytes only when asked: **▶ Play the film**, **▶ Play the recording**), a vow with its sale (pending, confirmed, contested), confirmed or contested from its menu. **A file bought and paid is contested from its menu too** (S7d, F386): **Contest it…**, below the line, the promise not kept in words if you say it. The contest names the purchase (your own claim of its payment), is signed in public with your own key, and is shown beside the purchase, in red, to you and to the seller (Edubba's Sales). It undoes nothing: no payment, refund or key moves. A vow keeps its own form (Confirm: it was kept / Contest it…), since that is what marks its sale. Where the core cannot say whether a payment is a purchase, the card says "unknown", never "none". Cards show **the signer's own hint** (the act's field 9) where one was written and no clock stamped the act, faint and labelled "the signer's own hint": never a time Dub vouches for, never used to order anything. Dub writes no hint when it signs (not decided yet).

**Paying from Dub: three ways** (decided: "Dub has no money signing by default, everything has to be done in Damgar… now we're looking at using more to do something closer to a prototype"). **Tip**, **Buy** (and unlocking a sealed file), and **Pay** (on a profile) open **one chooser**, the ways open shown, the others greyed with why:
1. **Under Dub's lane**, with what is left of it: at most the cap per payment, **"In all: … left of …"** where the lane was asked with a cap in all (the grant limits cMIP, draft 3; since Damgar's round 3, F379), until its expiry, and what was paid under it so far (Dub's own count). Dub signs with the lane's key, never your own, and **refuses to sign past the cap per payment or past the cap in all**, saying what is left. The cap in all is kept by Dub and counted in Damgar, never judged by verifiers. The invoice to pay in your wallet is shown at once, and the proof taken back to sign the claim. Each act Dub signs under the lane has its content key delivered to the identity itself (where Dub holds its key), so **its record is kept in Damgar's Account, Under the lanes**.
2. **Ask Damgar**: a money message sealed to yourself, which Damgar queues in Waiting, reads to you and signs there. **On the Mac, Damgar pops up** (since Damgar's round 3): Dub then only wakes Damgar's program (the identity and the draft's id; nothing else travels outside MOR), and Damgar draws **its panel inside Dub's window**, in the kit's slot, striped gold, "Drawn by Damgar · Dub cannot read or change this frame"; you authorise it there. Dub learns only the answer, and closes the frame. Damgar not running, or the web client: it waits in Damgar's Waiting, said.
3. **By hand**: the payment written out (the money messages cMIP's draft, in base64, beside its words) to copy into Damgar, **Waiting, + Paste an act to sign**; nothing is signed or sent from here.
A purchase names the seller's offer, which a money message cannot carry yet: a file or a vow is bought under the lane.

**The identity panel** (top right): the identities held, the one in use marked, **the collectives under each** (acting as a collective is the same gesture as switching: a public post is then signed with your own member key, F353, where its agreement gives you an area reaching posts; a collective writes in public only from Dub), **+ Add** (make one, bring one, **use one from Kišib**, below), and each identity's menu: **Name**, **Relays** (shown, and changed with a new routes act read back first, for an identity Dub made, H39, H53), **Words** (the signing key's), **Line and homes** (where it lives, and **its line** (F373): the card to give Kišib at a change of keys, copied whole, shown only once the homes hold the line's latest act, ending with how many of its acts Kišib cannot read and Dub's name; until then it says the act is being sent again), **A lane from Damgar** (asked here, granted in Damgar; its payments waiting for your wallet), **A collective under it** (added by ID), then a line and **Remove from Dub…**, said plainly first (H58): Dub forgets that identity's words and what it kept on this device; the identity itself, its acts and its homes are not touched. The panel's foot, **This app**: paired browsers (the Mac), the clock feeds are ordered by, and the test notice.

**Use one from Kišib** (the Dubsar runner, `cmips/cmip-runner-draft-3.md`; in the program only, on the Mac and Linux, never the web client, which shows the place, empty, said). Kišib's runner keeps the identity's signing key on this Mac; **Dub holds none of its keys**. From the identity panel's + Add, or the first screen: **Ask Kišib to pair** (Kišib's runner must be on); Dub shows a code; approve it in Kišib (Runner › Apps), comparing the code; then **Use it** on an identity Kišib lets Dub use. From then on, each act Dub would sign for it is a request to Kišib, and **Kišib's panel appears inside Dub's window**, in the kit's slot: a frame striped in Kišib's blue, "Drawn by Kišib · Dub cannot read or change this frame", the act in plain words, Sign it or Decline. Signed, Dub sends it as any act. A standing yes given in Kišib for a kind (posts, messages, names, contacts) signs without the panel; money, agreements, relying on another's act, and keys always ask. Closing the panel leaves the request waiting, in Kišib too (Runner › Waiting): **Show the panel again**, or **Do not sign**. Dub keeps the identity's lines (public and private) and shows their cards in Line and homes, as for any identity. **Remove** only unlinks it here: Kišib keeps its key until it is removed there or the runner is turned off. **Words** says the words are in Kišib. **Its private messages** (draft 2): where you ticked, in Kišib, "Dub may open what is sealed to this identity" (beside that identity: per identity, per app, draft 3), Dub reads the private messages sent to it and keeps its contacts list sealed to it, through Kišib (no panel: an opening signs nothing; each opening listed in Kišib's Signed). Where you did not, Dub says plainly that it can send but not read, and how to allow it in Kišib (Runner › Apps); messages it could not read are read once you allow it. **Acting as a collective** (draft 3): the identity's menu, **A collective under it**: Dub asks Kišib to add the identity's own key for it; approve it in Kišib (Held here, or Waiting), then choose the collective in the identity panel. Each act as the collective is then Kišib's panel in Dub's window, always, signed by Kišib with that key, which never comes to Dub. **A lane from Damgar** works the same for an identity used through Kišib: each payment under it is signed with the lane's key, and its record reaches Damgar by a key Kišib delivers to the identity without a panel (draft 3). **Kišib locked** (closed, or the computer restarted, and its passphrase not given yet): Dub says so plainly, and signs and opens nothing until the passphrase is given in Kišib; no pairing again. After a change of keys from paper, Dub refuses until Kišib's runner has the new signing words, then goes on in new lines. Dub's policy frames Kišib's origin, and nothing else.

**When your key is changed elsewhere.** If the identity's signing key is changed with its chain key (in Kišib), the words Dub holds stop counting. Dub says so in plain words, under the top, on opening and before every act, signs nothing more with them, and takes the new signing key's words. Every path that signs checks the key first (H80), the new ones too (relying, anchoring, correcting, posting as a collective, a message with a Cc); the lane signs with its own key, and the way by hand signs nothing.

**Disclaimers** in one line with a "?" that opens the rest; no finding number on any screen (H76).

**Removed (decided):** the **Signing tab** ("it existed only because lead refused to let me have Edubba on web… from my bathtub"): members sign proposals, see their shares once, leave a collective and give a second key in **Edubba, Collectives › To sign**, which runs the same code (`src/dub.ts` and `src/signing.ts` are Edubba's member code too, `clients/desk/src/member.ts`); vows bought are confirmed or contested in their menu here. **Pay-per-view sealing** ("Seal a post with a price"): a protected file is published in Edubba's Publishing; Dub buys and opens it.

Not here, on purpose: no rotation (Kišib's), no founding or proposing (Edubba's), no money signed with your own key (Damgar's), no likes or zaps, no notification hub.

**A work shared under a deal** (splits between separate people, 23 October 2026). Buy and Tip on a work whose post names a deal (a protected file or a vow sold under one, or a plain post naming it) say in one line, before paying: "This work is shared: X (50%), Y (30%), Z (20%). The split service answers for it." (by the names you give them). Buying pays the deal's own payee, as its offer says, through its split service; **a tip goes to the deal, not to whoever posted it** (decided: "with a tip IF there is a split the target is the agreement not the act"): under the lane it follows the deal itself, a tip divided like a sale, no purchase; through **Ask Damgar** the draft names the post and Damgar reads the deal from it; **by hand** is refused for a shared work (a draft copied by hand carries no post). A tip to a person's own post is unchanged. In Purchases, the buyer's contest of a shared work's purchase shows beside it as for any other.

## Precisely

| File | What |
| --- | --- |
| `src/dub.ts` | What Dub does, on the Mac and in the web client alike (a `Keep` says where): identities (`begin`, `confirm`, `bring`, `renew`, `use`, `forget`, `carry`, `setName`, `check`); Public (`post` with a picture, a film, a recording, `to` as a list (To… and @), a `reply`, or as a collective; `feed` ordered by the clock named; `relay` with its layers; `withdraw`); `inbox` (to you; private messages with their Cc and the collective appended, checked); `message` (sealed to each recipient, a Cc, a collective appended); the act menu's (`open`, `why`, `relyRead`, `rely`, `anchorOffers`, `anchor`, `correct`, `film`, `recording`); `profile`; `setClock`; collectives under the identity (`collectiveAdd`, `collectiveRemove`, `actAs`); `purchases`; paying (`payWays`, `pay`: the lane, Ask Damgar, by hand); the people cMIP (`follow`, `unfollow`, `callIt`, `mute`, `unmute`, `listOption`, `seen`); money (`moneyDraft`, `laneAsk`, `lanes`, `tipNow`, `payments`, `paidNow`, `buy`, `buyVow`, `vowsBought`, `confirmVow`, `contestVow`, `repost`, `moneyLook`); relays (`relaysReview`, `relaysPublish`). Kept, with no screen in Dub: the Signing tab's operations (`setSigning`, `proposals`, `signProposal`, `declineProposal`, `leaveRead`, `leaveCollective`, `shareShow`, `shareConfirm`, `shareByHand`), which Edubba's To sign runs, and `sell`, which Damgar's tests of a pay-per-view sale use. |
| `src/appended.ts` | The appended collective cMIP: its format, reading it from a text act, and the membership check. |
| `src/damgar-link.ts` | Ask Damgar on this computer (2A): Damgar's origin from its folder, the wake-up (`wake`: the identity and the draft's id, Damgar looking a few times while the homes catch up), and the answer (`answer`). Program only. |
| `src/money.ts` | The lane (`askLane`, `lanes`), payments under it through Damgar's code (`tip`, `payments`, `paid`), sealed files bought, read and opened (`buy`, `read`, `keysArrived`, `repost`), vows (`readVowRef`, `buyVow`, `vowsBought`, `confirmVow`, `contestVow`), and the seller's side kept for tests (`sell`, `deliver`). |
| `src/carryin.ts`, `src/chainwords.ts`, `src/names.ts`, `src/people.ts`, `src/signing.ts`, `src/vows.ts`, `src/delivery.ts` | As before: bringing an identity by its words; a new identity's chain key as words; the naming cMIP; the people cMIP (the list sealed to oneself); the proposals read in plain words (Edubba's To sign); vows; a sold work's key delivered (shared with Edubba, the app's key check required, H80). |
| `src/runner.ts` | The program's side of the Dubsar runner (the program only, never the web client): Kišib's origin from its folder (`run.json`; `~/mor-kishib` unless told), the pairing kept in Dub's folder (`kishib.json`: a token, never shown; `pair`, `paired`, `unpair`), and the signer an identity used through Kišib signs by (`signer`): each act a request to Kišib, signed at once under a standing yes or waiting for the person's answer (`asking`, for the page's slot), declined, withdrawn (`drop`) or expired; and, where Kišib lets Dub, what is sealed to the identity opened through it (`open`, draft 2: the acts inside, a hundred containers at a time). |
| `src/ops.ts` | Dub's operations by name, the same for the program and the web client. |
| `src/shapes.ts` | What the page is told: plain data, no import. |
| `src/page/view.ts` | Dub's page as HTML strings on the kit: the top, the first screen, Public (lenses, the Relay lens's layers, the typing box), Private (the mailbox), Purchases, the cards (`itemAct`, `messageAct`, `purchaseAct`), the pay chooser, the pop-ups of the act menu and of the identity's menu, Contacts' own lines, the web banner in one line with its "?". `PAGE_STYLE`: the kit's style and Dub's few pieces. |
| `src/page/ui.ts` | Its clicks and forms: the kit's menus answered for Dub (`attachCards`), the pop-up thread, the panels, names for @, To… and Cc, the three ways to pay, films and recordings played from bytes checked. |
| `src/page/family.ts` | What the other apps still take from Dub's former page until they move onto the kit: the family's base `STYLE`, and the Signing tab's pieces Edubba draws (`proposal`, `share`, `leaveRead`, `shareTypeBack`, `SIGNING_LABEL`), re-exported by `view.ts`. |
| `src/page/app.ts`, `src/web/` | The page's start on the Mac (requests signed by the desk's page client) and the web client (Dub's code in the browser, IndexedDB, its headers, its files, two shims). |
| `src/store.ts`, `src/server.ts`, `src/cli.ts`, `src/version.ts`, `src/fonts.ts` | The program's folder, the program (`127.0.0.1` only, its policy adding `font-src 'self'`, `media-src blob:` and `frame-src` with Kišib's origin and nothing else, requests up to 96 MiB for a film or a recording, Dub's icon beside its name), its commands, its version, the suite's type (H123). |
| `scripts/` | The web client's build and release, the Mac app, the Linux entry, the icons. |

The words are the identity carry Module's (`modules/module-identity-carry-words-draft-2.md`). The program's pairing domain line is still `MOR post, version 1`: changing it would unpair every browser already paired.

### The look

The kit's (`clients/kit`, decided 20–21 October 2026): dominantly black, Dub's warm pearl (`#e9dfcd`, its pastel `#efe8dc`) in fills (the switch's part, the lens chosen, the main button) and little in outlines, thin lines kept, red only for alarms. Dub's icon (H25, H36): a clay tablet carrying its name **𒁾** (`static/icon/dub.svg`), beside its name at the top.

### The suite's type, bundled (H123)

*Decided by Nobody, allegedly (hand test v3, H123), replacing Inter (F332).* **Atkinson Hyperlegible Next** for words, its **Mono** for IDs, hashes, signing words and amounts, and the app names in **Gentium Book Plus italic**: woff2, unchanged, in `../kit/fonts/` with their licences, the **SIL Open Font License 1.1** (the fonts are under that licence, not Dub's). Served from the page's own origin and nowhere else (`src/fonts.ts`); the kit's style declares them. Every app of the suite serves the same files.

## Fix round 7 (F403, hand test v3)

### In plain words

- **Notes** (H122), a fourth part beside Private: notes to yourself, sealed so that only your identity opens them, kept at its homes, so any app holding it reads them. Laid out as Private: your notes on the left, latest first, **+ New note** at the top; the one chosen on the right. **Edit** signs a new version, the earlier ones kept under **Earlier drafts**; **Retire** marks a note dropped, still readable.
- **Rules I follow** (H93), in the identity's gear menu: the cMIPs and Modules Dub runs, and whether you follow each, **on your list** (every app reads it) or **in Dub only**. A rule not followed yet is asked about in a line under the top.
- **Names** wherever an identity is shown (H96, H106): your nickname first, the name it published small beside it, its short ID under them; "Loading…", "No name published" or "Name not reached" where there is none to show.
- **Contacts** (H100, H109, H119): one list for every app; **Follow: add to contacts** asks a nickname (optional, only you see it); each contact has **Nickname…**; a **Contacts** button beside every field that takes an ID.
- **Short IDs** (H95, H121): tap one to see it whole, tap again to copy it. In a reply, the act it answers opens above it, checked.
- **Corrections** (H103): a corrected post shows its correction in its place, marked **Corrected**; tapping it shows the original above.
- **Your own ID** (H87, H88): a gear beside each identity; on the one in use, its ID whole with **Copy ID** and **Share your ID link**, also at the end of making or bringing one.
- The feed places a post the Dubsar clock has not stamped yet by its signer's own order, said faint (H110); a warning that a key changed elsewhere follows the identity in use (H82, H83); pop-ups stack, the last opened on top, each with × and Escape (H102, H91); the @ suggestions stay above the iPad's keyboard and Cc wraps (H84, H85); **What is MOR?** beside the banner (H94).

### Precisely

| File | What |
| --- | --- |
| `src/notes.ts` | The notes cMIP, draft 1 (`cmips/cmip-notes-draft-1.md`): `readNotes` (the containers at the homes addressed to the identity, opened here or through Kišib, kept where valid, signed by the identity, in the notes format, to it alone; chained by their first reference) and `writeNote` (signed, sealed to the identity's own key, left at its homes, its locked act beside it; empty text retires). Ops `notes`, `note write`, `note retire`. |
| `src/dub.ts` | `rules`, `approveRules` (H93): the kit's `engine/rules.ts`, the rules Dub runs (`DUB_RULES`), Dub's own approvals in its settings (`rulesHere`); the money rules approved in Dub only are given to Damgar's code in Dub as its "Damgar only" choice. `names_` (the kit's name reader), `openerFor` (Edubba's rules read through it). |
| `src/page/view.ts`, `src/page/ui.ts` | `notesPart`; the identity menu's **Rules I follow**; the kit's `rulesAsk`, `who`, `actId`, `attachIds`, `attachContactsButtons`, `askNick`, `ownId`. |

*Reading taken (H93):* rule 10's "unknown until adopted" is applied where Dub already judged by the list, money (Damgar's code in Dub); for people, names, corrections, collectives and notes, Dub asks and records the approval but does not yet hide acts or refuse to sign under a rule not followed (`docs/fixes-r7-report.md`, question 1).

Tests: `test/notes.test.ts` (H122, by clicks: a note, a new version, Earlier drafts, Retire; another Dub holding the identity reading the same notes; nothing in the clear at the homes); `../desk/test/every-app.test.ts` (H93 across Dub, Edubba and Ummia; H102, H82, H83, H105 in every app).

## Tests

```
cd ../genesis && npm install && npm run wasm && cd ../desk && npm install && cd ../site && npm install && cd ../dub
npm install
npm test            # real homes and a relay from target/debug/mor-relay (built if needed); Chromium at /opt/pw-browsers or MOR_CHROMIUM
npm run test:build  # the web client built here is the release in built/ (needs the tools BUILT-WITH.txt names)
MOR_SCREENSHOTS=DIR npm test   # also keeps a picture of every screen
```

- `test/dub.test.ts`, against three homes and a relay and the app's program, through a client signing exactly as the page does: as before (a new identity and its words; several identities; a public message; two people, replies, to you, follow and mute; the follow list; display names; a private message sealed, opened by an identity carried by its words; an identity made elsewhere, rotated, refused, renewed; a long-form document; unpaired requests refused), with the Relay lens showing text and envelope acts by default (H55) and a sent message's card signed by its sender in the conversation with its recipient; H80's paths refused after a change of keys.
- `test/browser.test.ts`, headless Chromium, by clicks and typing alone, the new screens in turn, at a Mac's size then a phone's: the first screen, a malformed name refused, the chain key's words hidden before three are asked (H3); Public, its three lenses, Relay third, the typing box below the feed; a post, a picture (stripped), **a film played from bytes checked** (H52); **a recording**, Audio beside Picture and Video, stripped (the bytes published are the stripped file's), played after the check, one the Module refuses refused with nothing published, and a damaged one another client published not played, said; Contacts, three added by ID, two called Pa; **@ by names**, the two Pa told apart by a faint short ID, River alone with none, the post addressed and left in River's inbox (H57, H78); Copy act ID and Copy ID (H68); **a reply** from the act's menu; **the pop-up thread**, Why it's valid inside it, Back, Close (H50); **Rely on it**, RELY refused in lower case, then the witness act naming the act (H77); **Correct it** on one's own post, "corrected by" on the original, absent on another's; **the three ways to pay** as Dub alone opens them (no lane, said; by hand shown to copy; Ask Damgar prepared); **a profile**, and Pay from it; counts on the switch and To you; **the Relay lens's filter** (no display name by default, then the Identity layer); **Private**: a conversation, an answer sealed, **someone new** in an empty thread, **a Cc** seen by every recipient; Purchases, empty, said; mute from the signer's menu, unmute in Contacts; **the identity panel**: its menu, a name, the signing key's words; **a second identity brought** from + Add (Kišib's place empty), **its key changed elsewhere: a post refused, nothing signed** (H80), the new words taken; **Remove said first** (H58); then at a phone's size the public feed, an act's menu as a sheet, the mailbox's back arrow, the panel; no console error, nothing the content security policy refused (`media-src blob:` and `font-src 'self'` in it), no finding number (H76).
- `test/web.test.ts`: the web client (below).
- The runner, with Kišib's program beside Dub's: `../kishib/test/runner.test.ts`, `runner-browser.test.ts` (by clicks: Use one from Kišib from Dub's first screen, the panel in Dub's slot, a standing yes, a closed panel shown again, an unpaired origin refused, the policy's `frame-src`, at a phone's size, revoked; draft 2: a private message read in Dub's Private through Kišib, Kišib locked said plainly in Dub, Dub signing again after the passphrase with no new pairing), `runner-lines.test.ts` (posting and messaging through the runner, then a change of keys: every line placed) `runner-draft-3.test.ts` (opening per identity; a post as a collective through Kišib's panel with the member key Kišib holds; a tip under Dub's lane, its record delivered by Kišib with no panel) and `runner-draft-2.test.ts` (Dub's inbox and sealed contacts list opened through Kišib where allowed; not readable, said plainly, where not, then read once allowed; Kišib locked, said; revoked).
- `test/names.test.ts`, `test/people.test.ts`, `test/across.test.ts`, `test/launcher.test.ts`, `test/chainwords.test.ts`, `test/desktop.test.ts`, `test/web-build.test.ts`, `test/build/`: as before.
- Beside the apps Dub works with, `../desk/test/dub-redesign.test.ts`, by clicks in Dub's page on the Mac: **the three ways to pay** (a lane asked from the identity's menu and granted in Damgar; a tip under it, its invoice paid and its claim signed; Ask Damgar, queued in Damgar; by hand, copied), **a picture bought under the lane and opened in Purchases**, **two vows bought, one confirmed and one contested from their menus**, **an act anchored from its menu** (the anchoring service's offer, a tier, the payment waiting in Damgar); and **a collective under the identity**: added by ID, **appended to a private message and checked by the reader's Dub**, then acted as from the identity panel, a post signed with the member's own key, a private message as it refused. Members sign proposals in Edubba: `../desk/test/real-browser.test.ts` and `../desk/test/web-browser.test.ts` carry each member by clicks from its Dub into an Edubba of its own.

## Using it (a human test, on the author's Mac and phone)

*The build window cannot reach the deployed homes, and keeps no keys.* Steps for this round are also in `docs/kit-dub-report.md`, section 6.

1. Once, in Terminal, from the MOR folder:
   ```
   git fetch origin && git checkout main && git pull
   cd clients/genesis && npm install && npm run wasm
   cd ../desk && npm install && cd ../site && npm install && cd ../kit && npm install
   cd ../dub && npm install && sh scripts/make-app.sh
   ```
2. Double-click **Dub** in `~/Applications`. The page opens, paired. An identity Dub held before opens as it was, on Public.
3. **Make a new identity** if none is here; or from the identity top right, **+ Add**.
4. Post a text, a phone photo, a short MP4 film, a short M4A recording. Open Contacts top left and add someone by their ID link; mention them with @ and their name.
5. Open a card's two menus (its short ID top left, the act's bottom right): reply, open what it answers, why it's valid, rely on it, correct your own.
6. Private: a conversation, someone new, a Cc. The identity's menu: A lane from Damgar, then a tip under it.
7. **On the phone**, the web client (below) at `dub.dubsar.org`: the same screens, the menus as sheets, the mailbox's back arrow.
8. **On Linux:** `sh scripts/make-desktop.sh` in place of `make-app.sh`.
9. To bring a test identity made with the genesis client: `node --import tsx src/cli.ts words --file ~/mor-test/a.json` (test identities only).

## Moving from MOR Post

Dub was MOR Post, in `clients/poster`, until 13 October 2026. On a Mac that has it: `git pull`, then `cd clients/dub && npm install && sh scripts/make-app.sh` (this removes **MOR Post**). Dub keeps using `~/mor-poster` for as long as `~/mor-dub` does not exist; to rename it, quit Dub (`node --import tsx src/cli.ts stop`) and `mv ~/mor-poster ~/mor-dub`.

## Signing and notarising (an open choice for Nobody, allegedly)

`scripts/make-app.sh` makes the app on the Mac it runs on, not signed or notarised; it needs this repository, Node 22 and the core library's WebAssembly there. For other people's Macs: a self-contained app (not built), and signing and notarising with an Apple developer account in a person's or an organisation's name (shown to everyone who opens the app). Whose name is the choice.

## The web client (F281: "With risks stated, for testing purpose only")

*Decided by Nobody, allegedly, 13 October 2026; served at `dub.dubsar.org`.*

### In plain words

The same Dub page, nothing to install: a few files, everything run in the visitor's browser, every act checked by the core library compiled to WebAssembly. At the top of every page, one line, **For testing only**, with a "?" that opens two risks in plain words: whoever serves the page's code when an identity is made could copy its keys; the browser's storage, where the signing and encryption keys are kept, can be lost, or read by what runs in the page. It makes an identity as Dub on the Mac does: the chain key's words shown once, never in the browser's storage; the way out is the identity's menu, **Words**.

### Precisely

- **A new identity** (`Dub.begin`, the same on the Mac): a 256-bit seed; its 24 words; the chain key derived as the words seed Module derives key 0 under scheme 3; the genesis committing it; the seed held in memory only until three words are typed back.
- **Kept** in IndexedDB, database `dub`: `identity:ID`, `settings:ID`, `people:ID`, `signing:ID`, `money-…:ID`, `active`. `WebKeep.saveIdentity` refuses a file holding a chain key. Every signing step runs under a Web Lock.
- **The banner** is in the page's HTML itself (`static/web.html`), so it shows even when the script does not run.
- **Its icon (H35)**: `icon.png` and `apple-touch-icon.png`, files of the release.
- **`dub.json`** beside the page, optional, https only: `{"homes": [...], "relays": [...], "reader": "https://…/"}`; trusted for nothing else.
- **The build** (`scripts/build-web.ts`): Dub's code, the kit and the shared client code with the reader's browser core library, not minified, reproducible. **The release**: `built/`, the suite's type and its licences included, with `BUILT-WITH.txt`; `mor-dub check URL` compares a server with it.

### Tests

- `test/web.test.ts`, headless Chromium, the built page served with its headers, real homes and a relay: the banner in one line on every screen, its "?" opening both risks; a display name given in the make form, published at birth (H12); the chain key's words, hidden before three are asked (H3); **nothing of the chain key in the browser's storage** nor on the page, before and after; the genesis committing the key the words give; an encryption key at once; a post, a reload, a second post in the same line; **the signing key's words** from the identity's menu, not the chain key's; **brought into Dub on the Mac**, its own line, the identity's private messages opening there; a message from a third identity in its conversation, with the count on the switch; **the follow list sealed on the Mac read here with its names**, in Contacts; Remove leaves no key in storage; the suite's type from the page's own origin; no console error, nothing the policy refused. And an identity made by Dub on the Mac brought here, its chain key's words refused where the signing key's are asked.

### Putting it behind Caddy

1. Build the release (`npm run release` with the tools `BUILT-WITH.txt` names, or on GitHub with "[release dub web]"), and copy every file of `built/` but `BUILT-WITH.txt` to `/srv/dub` on the server. Optionally a `dub.json`.
2. DNS: `dub.dubsar.org`, A and AAAA, to the server (the author's to add).
3. Caddy, then `sudo systemctl reload caddy`:
   ```
   dub.dubsar.org {
       root * /srv/dub
       file_server
       header {
           Content-Security-Policy "default-src 'none'; script-src 'self' 'wasm-unsafe-eval'; style-src 'self'; font-src 'self'; img-src 'self' data:; media-src blob:; connect-src 'self' https:; base-uri 'none'; form-action 'none'; frame-ancestors 'none'"
           X-Content-Type-Options nosniff
           Referrer-Policy no-referrer
           Strict-Transport-Security "max-age=31536000"
           Cache-Control no-cache
       }
   }
   ```
   **What changes on a server already serving Dub (the redesign, 21 October 2026):** one line, the `Content-Security-Policy` inside Dub's `header` block, which gains `media-src blob:;` right after `img-src 'self' data:;` (films play from bytes checked in the page; without it a film is refused and the page says nothing plays). Then reload Caddy and copy the release's files again.
4. From another machine: `node --import tsx src/cli.ts check https://dub.dubsar.org/` in `clients/dub` says SAME.
