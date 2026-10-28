# The Dubsar Suite, fix round 7: hand test v3's rows (H82 to H126)

*28 October 2026. Branch `claude/dubsar-fixes-round-7-8jw1bq`. Finding **F403** (`docs/findings/MOR-findings-log-round-2.md`). App-only: nothing compiled into the shared WebAssembly changed; its hash is the same in every release, `604aa9b5632d0bef8b17687e664317d7f841767d26f5ea4e7a13d553b30dd8fb`. Test identities only, regtest only.*

**Readings taken, where a row left a choice** (each said again at its row):
1. **H93, Development rule 10.** "Unknown until adopted" is applied where the apps already judge by the list: money, in Damgar and in Damgar's code inside Dub. For the other rules (people, naming, corrections, collectives, notes, long form, releases), every app **asks**, in this app only or added to the list, and records the answer, but does not yet hide what was done under a rule not followed, nor refuse to sign under it. Question 1 below.
2. **H100 in Kišib.** Kišib shows the one contacts list and **changes none**: changing it signs an act, and the runner cMIP lets Kišib sign only for the apps paired with it. Question 2.
3. **H120.** The grid offers the five layers decided (Text, Envelopes, Money, Agreements, Development) and **Text and Envelopes together**: the core counts them as one area layer, and the founding's Publishing area needs both. The kinds of act are read from the core's **Rust type tables** (`core/src`, each layer's `pub mod types`) by a script, at build time, into a generated file a test keeps current. The shared WebAssembly exposes no type table, and changing it is outside this round. The Development MIR defines no act type of its own, so Development is chosen whole.
4. **"Titles say Dubsar".** No page or window title named the suite. The desktop entries (Linux) said "MOR: …"; they now say "Dubsar Suite, on MOR: …". Page titles stay the app's own name.
5. **H117's QR code.** Installing a QR library was refused in this session, so the kit draws its own (`clients/kit/src/qr.ts`, byte mode, versions 1 to 40). It was checked module for module against the Rust `qrcode` crate the repository already vendors (all eight masks, five texts, versions 2 to 13, every level).

## 1. In plain words

### Every app (the kit)
- **Names everywhere.** Wherever an identity shows, its names come first: your **nickname** for it, then the name it published (small, faint), then its short ID. Where there is no name: "Loading…", "No name published" or "Name not reached" (with Ask again).
- **One contacts list**, top left in every app but Nakišib. Contacts are sealed to you at your homes, so a contact or nickname added in one app is there in all. **Follow** asks a nickname (optional). Each contact has **Nickname…**. Every field that takes an ID has a **Contacts** button beside it. Edubba's own Mac list was carried in once.
- **Short IDs are taps.** One tap shows the ID whole; a second copies it ("Copied"). A person's ID also gets Open profile. In a reply, the act it answers opens above it, checked.
- **Your own ID.** A gear replaces the ⋯. On the identity in use, its ID shows whole with **Copy ID** and **Share your ID link**, also at the end of making or bringing one.
- **Pop-ups stack.** The last opened is on top. Each has an ×, Escape and a tap outside close the top one, and a form you have typed in asks first. Removing an identity asks in a box on top of the panel.
- **Two signs.** "?" only opens an explanation; a chevron (›) opens a panel to work in.
- **Rules I follow**, in each app's settings (not Kišib or Nakišib). Each rule the app runs is on your list, in this app only, or asked about in a line under the top.
- **A key changed elsewhere** is a pop-up with the box for the new words. Once closed, it stays as one line under the top, and it follows the identity in use.
- **What is MOR?** beside the banner's "?" opens dubsar.org's front page in a new tab.
- **Type:** Atkinson Hyperlegible Next, its Mono for IDs and amounts, and the app names in Gentium Book Plus italic. All bundled; dubsar.org's display client uses the same pair.
- **Feeds:** a post the Dubsar clock has not stamped yet is placed by its signer's own order, said faint. A corrected post shows **Corrected**, the original opening above it.
- The tiles never put an icon over their words at a phone's width.

### Dub
- **Notes**, a fourth part: notes to yourself, sealed so that only your identity opens them. **Edit** makes a new version, the earlier ones under **Earlier drafts**. **Retire** drops a note but keeps it readable.
- The @ suggestions stay above the iPad's keyboard, and Cc names wrap as chips.
- An identity's profile shows the rails and currencies it is paid in.

### Damgar
- **Where you are paid:** choose the rail first; the page then asks only what that rail needs. **+ Add a rail**, each on its own card, removable.
- **Open in wallet:** an invoice is handed to your wallet, which asks you to approve it.
  - If your browser has a wallet of its own (WebLN), it is offered first, and the proof comes back by itself.
  - Otherwise a `lightning:` link, and its QR code for a phone's wallet.
- **Under the lanes** says each payment's stage first, and the cap's total counts paid apart from asked. A tip under a lane now reaches the payee (H107).
- **Rules I follow** is the new name for "What you accept". First use never locks you in: **Later**, and a way back.
- The tabs draw at once, then fill in. The Mac icon has no white square.

### Kišib
- **Add an identity to the runner** is in the Runner tile now.
- In **Apps**, a newly approved app stays open where it is, newest first. Beside "may open what is sealed", the app's own words on why it needs it and what it cannot do without it; the box stays unticked.
- A **rotation waiting for you** is listed under Waiting for you, filled in from the starter's message.
- The panel says which **member key** signs for a collective.
- The runner turns off from the page as from the seal, and the page follows the seal. The Runner tile shows the seal.

### Edubba
- Agents and Collectives follow the identity in use. **The test collectives are gone.**
- **Founding** starts with you and one other, then **+ Add a member**. **Change its members** is the same.
- **Who decides what:** one choice per layer, and under "Only some kinds of act" every kind the core defines, in words.

### Ummia, Nakišib, the test wallet, dubsar.org
- **Ummia:** names, contacts and its own rules.
- **Nakišib:** takes the chain key's paper as its 24 words only.
- **The test wallet:** shows what Damgar's receive-only link asks for, each with Copy.
- **dubsar.org's display client:** uses the suite's type.

### Screenshots to look at first
Taken by the tests (`MOR_SCREENSHOTS=DIR`), kept in `docs/fixes-r7/`:

1. `h93-dub-rules.png`, `h93-ummia-rules-approved.png`: Rules I follow, asked; approved, one in the app only, one on the list.
2. `h122-note-edited.png`, `h122-retired.png`: Dub's Notes.
3. `h92-two-rails.png`, `h117-open-in-wallet.png`, `h117-webln.png`: Damgar's rails, Open in wallet with its QR, the browser's wallet first.
4. `h120-agreements-kinds.png`: Edubba's grid, every kind of act under Agreements from the core's own types.
5. `h97-waiting-for-you.png`: Kišib's Waiting for you, the rotation filled in from the starter's message.
6. `h102-stack-remove-on-top-phone.png`, `h102-edubba-remove-phone.png`: Remove asked on top of the panel.
7. `h82-dub-key-changed.png`: a key changed elsewhere, the pop-up with the box for the new words.
8. `h105-kishib-tiles-390x664-dark.png`, `h105-edubba-tiles-390x844-light.png`: the tiles at a phone's width.
9. `h84-mention-ipad-keyboard.png`: the @ suggestions above the iPad's keyboard.
10. `h99-signs.png`: the "?" and the chevron, tapped.

## 2. Row by row

| Row | State | What, and where |
| --- | --- | --- |
| H82 | Built | The key-changed warning a pop-up with the new words' box; closed, a line under the top (kit `keyChanged`); every app. `desk/test/every-app.test.ts`. |
| H83 | Built | The warning follows the identity in use, in every app. Same test. |
| H84 | Built | @ suggestions anchored to the typing box, placed by the visual viewport above the keyboard. `kit/test/kit.test.ts` (iPad size, keyboard up; WebKit in CI). |
| H85 | Built | Cc as wrapping chips, each removable. Dub's tests. |
| H86 | Not built | Out of this round (the conversations cMIP, after the freeze). |
| H87 | Built | A gear in place of ⋯, in the kit's identity panel. |
| H88 | Built | Own ID whole with Copy ID and Share your ID link: in the panel, and at the end of making or bringing an identity in Kišib, Dub, Damgar, Edubba and Ummia. Each app's `names-contacts` test. |
| H89 | Built | Runner › Add an identity to the runner; the top right as in every app. `kishib/test/names-contacts.test.ts`, `runner-browser.test.ts`. |
| H90 | Built | Questions asked in the page (never `confirm()`); the page follows the runner's state. `kishib/test/runner-browser.test.ts`. |
| H91 | Built | × on every pop-up, sheet and panel. `kit/test/kit.test.ts`. |
| H92 | Built | The rail first, from the rail Modules accepted; a card per rail with its own fields (`RAIL_FIELDS`); + Add a rail; Remove; the order kept. `damgar/test/wallet-rails.test.ts`. |
| H93 | Built in part | Rules I follow in Dub, Edubba, Ummia, Damgar; in this app only or added to the list; asked under the top. Rule 10 enforced for money only (reading 1). `desk/test/every-app.test.ts` (H93). |
| H94 | Built | What is MOR? beside the banner's "?" (as text in Nakišib). |
| H95 | Built | In a reply, `mid1…` opens the profile, `mact1…` expands the act answered above it. Dub; Edubba's labels as taps. |
| H96 | Built | One name reader (`kit/src/engine/names.ts`), the four states, the nickname first. |
| H97 | Built | The rotation notice cMIP, draft 1; Waiting for you prefilled (on the Mac with the runner at once, elsewhere after the words), checked against the chain. `kishib/test/rotation-notice.test.ts`. |
| H98 | Not built | Out of this round (splits and shares wait for F398's texts). |
| H99 | Built | "?" only on explanations; chevron folds on panels to work in, swept in every app. `kit/test/kit.test.ts` (tapped, WebKit in CI). |
| H100 | Built | Contacts top left everywhere but Nakišib; one list (the people cMIP's); Edubba's Mac list carried once; rails and currencies on Dub's profile (`pointerOf`). Kišib read-only (reading 2). |
| H101 | Not built | Out of this round. |
| H102 | Built | One stack; Remove confirmed on top, in every app, at a Mac's and a phone's size. `desk/test/every-app.test.ts`, `kit/test/kit.test.ts`. |
| H103 | Built | Corrected in place, labelled, the original above; only the original's signer corrects. |
| H104 | Built in part | Nakišib: the chain key's paper as words only (its Rust and page; drawing a hex paper refused). The signing key as a string: not built (out of this round; below). |
| H105 | Built | Tiles: icon in the flow, never over the words, at 390 px, tall and short, light and dark, every app. |
| H106 | Built | Ummia (and every app) names its identities. |
| H107 | Built | A lane's invoice request reaches the payee's To receive; a payment whose expiry the clock has not stamped waits and is judged again; Under the lanes stage first. `damgar/test/web-lane-tip.test.ts`, `lane-expiry.test.ts`. |
| H108 | Not built | Out of this round (after the freeze). |
| H109 | Built | Follow asks a nickname; Nickname… on each contact. |
| H110 | Built | Unstamped acts placed by the signer's own sequence, said faint (`newestFirst`). |
| H111 | Built | The Runner tile shows the seal, following its state. |
| H112 | Built | The accepted list's failure names the cause and the way; Later and a way back on first use. |
| H113 | Built | Damgar's Mac icon on its own dark square. |
| H114 | Built | The test wallet's node cards: address, receive-only permission file, certificate, each with Copy; never the admin one. `testwallet/test/wallet.test.ts`. |
| H115 | Built | Damgar's parts drawn at once from what was held, "Looking…", then filled. `damgar/test/tabs-timing.test.ts`. |
| H116 | Not built | Out of this round (after the freeze). |
| H117 | Built | Open in wallet (`lightning:` link and QR), WebLN first with the proof taken back; the test wallet reads a pasted `lightning:` link and says it cannot answer such links. |
| H118 | Built | Founding: you and one other, + Add a member; Change its members the same. `desk/test/edubba-kit-browser.test.ts`, `real-browser.test.ts`, `web-browser.test.ts`. |
| H119 | Built | A Contacts button beside every field taking an ID, in every app. |
| H120 | Built in part | One choice per layer; every kind from the core's own type tables, named in words; claims under Agreements (reading 3). The renamed withdrawals and kinds wait for F398's texts. `desk/test/core-types.test.ts`. |
| H121 | Built in part | Every short ID an app draws is a tap. Left: the kit's own menu buttons (a card's signer and act, the top right, the panels' rows) open menus rather than showing the ID whole; some engine read-backs keep an 8…4 fingerprint as text. |
| H122 | Built | Notes (the notes cMIP, draft 1). `dub/test/notes.test.ts`. |
| H123 | Built | Atkinson Hyperlegible Next and Mono, Gentium Book Plus italic, bundled in every app and every web release; the display client the same pair. |
| H124 | Built | Apps: approved stays open in place; newest first. `kishib/test/runner-needs.test.ts`. |
| H125 | Built | Agents and Collectives follow the identity in use; the test collectives removed. |
| H126 | Built | The runner cMIP, draft 4: stated needs in the pairing request (Dub, Damgar, Edubba), shown beside the box, unticked. `kishib/test/runner-needs.test.ts`. |

**Also asked by the build prompt:** the member key shown in Kišib's panel where Edubba acts for a collective (built); the test collectives removed from Edubba (built); the windows' titles (reading 4); the web releases rebuilt (Dub, Damgar, Ummia, Edubba, Kišib, and the display client), the shared WebAssembly unchanged. Kišib's own air-gapped WebAssembly is kept as released from GitHub, since its sources did not change. Cargo's crate hashes follow the checkout's folder, so a build in another folder gives other bytes. That predates this round.

**WebKit.** The kit's browser tests (H84, H99 tapped, H102, H105, the type at 390 px) also run in WebKit on GitHub's machines (`.github/workflows/suite-webkit.yml`); Playwright's WebKit cannot be downloaded in this session's container. The app-by-app tests run in Chromium.

**CI, after opening the pull request.** Two checks failed on the first run, and both are fixed:

- **browsers (WebKit).** WebKit knows no clipboard permissions, so the kit's tests could not open a page there. In WebKit the test now keeps what the page copies and reads it back from the page. The words the kit copies are checked exactly as in Chromium. The second run brought two differences that are WebKit's own, not the kit's: a name line ends in a line break in its `innerText`, and the host's deliberate read of the sandboxed frame is refused with a console error. The test now allows both, in WebKit only.
- **all (Damgar), a check that failed only sometimes.** Damgar's names test (`clients/damgar/test/names-contacts.test.ts`, H96) failed once on GitHub's machine and passed here. The reason: it waited for Bob's nickname, which is kept on the device, then read his own name once. That name comes from his profile at the homes and can arrive a moment later; on GitHub it had not yet ("Loading…"). The test now waits for his name too, up to a minute, as it already did for Alice's. The app was right; the test read too early.
- **seal (macOS).** This round did not cause it. GitHub's macOS machines now start without Cargo's home folder (`~/.cargo`), and the WebAssembly build scripts (`clients/genesis/scripts/build-wasm.sh`, `clients/kishib/scripts/build-airgap-wasm.sh`) went into it to name it. The scripts now make it first, the way Cargo would on its first download. The shared WebAssembly comes out byte for byte the same (604aa9b5…8dd8fb). The job ran here only because Kišib's files changed. On main it passed on 24 October, before the machines changed.

## 3. For the MOR lead

Nothing for the MOR lead to change. One note:

- **H104, the signing key as a string.** It would take a Module draft of its own, beside the identity carry Module (`modules/module-identity-carry-words-draft-2.md`, code `modules/carry/`, TypeScript): the signing key's 32 bytes as a string with a checksum, so a typo is caught, the same key either way. It would not touch the shared WebAssembly: the carry Module is TypeScript and is not in the core. `modules/` is outside this round. The apps would then offer "words or string" at making and at bringing.

## 4. Questions for Nobody, allegedly

One at a time.

1. **Rules I follow: should an app hide what was done under a rule you don't follow, and refuse to sign under it, for every rule, not only money?** Today every app asks (in this app only, or added to your list) and records the answer. A rule you have not approved still works in that app, except money, where Damgar already shows such acts as unknown and signs nothing.
   - *Lean:* yes, but only after a first try on your devices. Enforcing it everywhere means a fresh identity in Dub cannot follow anyone or publish a name until it approves People and Naming. The approval should be offered at the end of making or bringing the identity, so it never comes as a surprise.

2. **Kišib's contacts: may Kišib sign changes to your contacts itself, with the key its runner holds?** Today Kišib shows your contacts and changes none, because the runner cMIP lets Kišib sign only for the apps paired with it.
   - *Lean:* no, keep Kišib read-only. Kišib is the place keys are kept, not where everyday acts are made, and the other four apps already change the list.

3. **Edubba's grid: is "Text and Envelopes, together" right as a sixth choice?** The core counts the two as one area layer, and the founding's Publishing area needs both, so I kept it beside the five you named.
   - *Lean:* keep it, until F398's texts say how layers split.

4. **The cMIP drafts: approve them as written?** The runner cMIP draft 4, the notes cMIP draft 1, and the rotation notice cMIP draft 1.
   - *Lean:* yes for all three. Each is small and changes nothing core.

## 5. Human test steps

On the Mac (the programs), the iPad and the iPhone (the web clients), with test identities only, as each README says.

**Every app**
1. Open each app. Contacts is top left, your name top right. Make or bring an identity; its last screen shows its ID whole, with Copy ID and Share your ID link.
2. In Contacts, add someone by ID with a nickname. Open another app: the same contact is there, with the same nickname. In Kišib it is shown but cannot be changed there.
3. Tap a short ID anywhere. It shows whole; tap again and it says Copied.
4. Open the identity panel, then the gear, then Remove. The box asking is on top: Keep it returns to the panel, Escape closes only the box.
5. On the iPhone, look at the tiles: no icon covers its words. On the iPad, type @ in Dub's typing box: the suggestions stay above the keyboard.
6. Open Rules I follow (Dub: the gear; Edubba: This app; Ummia: Choose › Ummia's own rules; Damgar: Settings). Approve one rule "in this app only" and another "add to my list". Another app shows the second as on your list, and still asks about the first.

**Dub**
7. Notes: + New note, write it, Sign and keep. Edit it and sign the new version: the earlier one is under Earlier drafts. Retire it. Bring the same identity into Dub on another device: the notes are there.
8. Open a profile of someone with a payee pointer: it says what they are paid on.

**Damgar**
9. Settings › Where you are paid › Change it: choose Lightning, + Add a rail (On-chain), remove it, Read it back, sign.
10. A tip to pay: Open in wallet opens your wallet app, and the QR code reads in a phone's wallet. With a WebLN browser wallet, "Pay with your browser's wallet" comes first and the claim is signed by itself.
11. A tip under a lane, from Dub on the iPad to Damgar on the iPhone: it reaches Waiting › To receive, and Under the lanes says "Asked: waiting for … invoice".

**Kišib (Mac)**
12. Runner › Add an identity to the runner. Pair Damgar: its stated need shows beside "may open", unticked. Approve: Damgar stays open at the top.
13. Start a member change of a collective. On the other member's Mac, with the runner on, Collectives › Waiting for you lists it, filled in.

**Edubba**
14. + Found a collective: you and one other, + Add a member. In an area choose Agreements, tick Only some kinds of act: work claims, negotiation messages and others are listed in words.

**Nakišib, the test wallet**
15. Nakišib draws only a paper of 24 words, and refuses 72 hex characters.
16. In the test wallet, each node's card shows "For Damgar's receive-only link", each value with Copy.
