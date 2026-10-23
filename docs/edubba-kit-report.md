# Edubba on the kit, the agreements hub: report

*23 October 2026, Dubsar Suite, round 4 of the redesign, branch `claude/edubba-kit-agreements`, for Nobody, allegedly, and the Suite lead. Built from the redesign drawn and approved (`docs/design/suite-redesign.md`; the mockups `docs/design/mockups/edubba-*`; `docs/design/mockups-report.md`, its function table). Test identities only; regtest only; no server address or key in the repository. No finding number taken (below, "For the MOR lead").*

## 1. In plain words

### What Edubba looks like now

Edubba opens on **four big tiles** on the Mac, **three on the web** (no Agents), each with its danger marks as decided: **Agents** (two bars), **Collectives** (three), **Publishing** (two), **Vows** (two). A tile opens with **its column on the left**; tabs across the top move between tiles; Edubba's name, top left, brings back the tiles. On a phone the tiles stack, a tile opens on its first part, and ← Back shows its column. It looks like Dub, Kišib and Damgar now: the kit's dark page, Edubba's emerald turned pastel, red only for alarms, every disclaimer one line with a "?".

**Top right is the identity in use.** Its panel lists the identities held and **the collectives under each**: choosing a collective there is how you act as it (the old "Acting as" choice is gone). **+ Add** offers **Make one**, **Bring one** and **Use one from Kišib** (Mac only). Each identity's **⋯** menu: Name, Words, Line and homes, New words from Kišib, Remove from Edubba… (said plainly first). The panel's foot, **This app**, holds what Settings held: the homes and relays, the collective client's settings, the browsers paired. Where a key held here was changed in Kišib, the warning shows under the top **with the box for the new words right under it**.

- **Agents** (Mac only): the agents; **+ Add an agent**; **The API key**. For an agent, four tabs:
  - **Talk**: what it did and your conversation, as cards; you type at the bottom.
  - **Queue**: other people's acts waiting until you pick them; nudge it; look now.
  - **Mind**: its notes (Retire); "MOR as seen by it"; **its diary, behind a public act**.
  - **Terms**: answering or off; its terms, cap and key; its grants from you; the collectives that name it as a keeper.
- **Collectives**: the collectives; each founding in progress with its count ("2 of 3 signed"); **To sign**; **+ Found a collective**; **+ Found a test collective** (Mac); **+ Bring a collective**. For a collective: **"Its constitution, in plain words"** top right, and five tabs: **Act**, **Members**, **Money**, **Keepers**, **To sign**.
- **Publishing**: **A protected file** (who acts; a text, a picture, **a video**, or **an audio (M4A)**; a title, a price, under Details a referral and a split; read back, then signed), **Published here**, **Sales**.
- **Vows**: **Track** (point at people, collectives or relays; show all, vows, sales, confirmed or contested), **A new vow**, **Vows published here**.

### The diary behind a public act

In Agents › Mind, **Read it…** first shows the act you are about to sign: "I have read Machine, allegedly’s diary, on 23 October 2026.", from you, **to the agent, public**. **Sign it, then open the diary** checks your key first (H80), signs it, publishes it at the relays and your homes, puts a copy in the agent's inbox, and opens the diary **only once one of your homes accepted it**. **Not now** opens nothing. One line with its "?" says that **the rule is the app's, not the cryptography's**: whoever holds the agent's words can read its diary without signing anything.

The act is an ordinary post (the Text spec), addressed to the agent: **an existing act**, as asked; no new format. The agent memory cMIP needed one rule rewritten for it, so it has a **draft 2** (`cmips/cmip-agent-memory-draft-2.md`, rule 5.3 and the costs in section 6). **Draft 1 stays** as it was.

### Audio

- **In Dub**: the typing box has **Audio** beside Picture and Video. An M4A recording is checked by the audio Module and stripped to the sound alone before anything is signed. A card plays a recording **only after the Module has checked its bytes**; bytes it refuses are refused in plain words, and nothing plays.
- **In Edubba's Publishing**: a video or an audio is checked by its Module and **stripped before it is sealed** (titles, dates, places and covers removed; the work hash, locked hash and size are those of the stripped file). A file that is not a film or not a recording is refused in plain words, with nothing signed.
- **In Dub's Purchases**: a sealed film or recording bought plays there, checked again by its Module first. Without this, a buyer could not open what Edubba now sells. This goes beyond "audio in Dub", so it is question 6.

### Using an identity from Kišib

On the Mac, + Add › **Use one from Kišib** pairs Edubba with Kišib's runner (the code compared and approved in Kišib). Edubba then uses an identity Kišib holds **and holds none of its keys**. **To sign** signs for it **through Kišib's panel, drawn inside Edubba's window, with the identity's own key**. Every other signing path refuses it in plain words. Signing with the member key Kišib holds comes later, as decided.

### Pictures to look at first

In `docs/edubba-kit/`:
1. `mac-03-home.png`, `phone-01-home.png`, `web-home.png`: the tiles (beside `edubba-home`).
2. `mac-12-agent-talk.png`, `mac-15-agent-queue.png`, `mac-10-agent-terms.png`: an agent's tabs (beside `edubba-agents`, `-agents-queue`, `-agents-terms`).
3. `mac-13-diary-act.png`, then `mac-14-diary-open.png`: the public act, then the diary (beside `edubba-diary`).
4. `mac-22-collective-act.png`, `mac-23-constitution.png`, `web-collective-act.png`: a collective's Act, its constitution (beside `edubba-collectives`).
5. `real-edubba-member-proposal.png`, `real-web-proposal.png`: To sign (beside `edubba-collectives-to-sign`).
6. `mac-30-publishing-audio.png`, `mac-31-publishing-review.png`, `mac-33-publishing-refused.png`: an audio stripped, read back; a file refused (beside `edubba-publishing`).
7. `mac-40-vows-track.png`, `web-vows-track.png`: Track (beside `edubba-vows`).
8. `mac-50-identity-panel.png`, `mac-51-identity-menu.png`, `mac-53-this-app.png`: the panel, its menu, its foot (beside `edubba-identity-panel`).
9. `mac-61-key-changed-box.png`: a key changed in Kišib, the box for the new words under the warning.

## 2. Every function of Edubba, and where it lives now

| Function | Before | Now |
| --- | --- | --- |
| Make an identity (chain words once, three typed back) | Identities | first screen; panel › + Add › Make one |
| Bring an identity by its words | Identities | first screen; + Add › Bring one |
| **Use one from Kišib** | none | + Add › Use one from Kišib (Mac; new) |
| Name, words, line and homes, new words after Kišib, forget it here | Identities | the identity's ⋯ menu |
| Acting as an identity, or as a collective | "Acting as" | identity panel: an identity, a collective under it |
| An identity's record (homes, receipts, lines, contests) | Identities | **Kišib › Identities › An identity's record** (checked: there) |
| Releases under one's own name | Identities | **Ummia** (checked: there) |
| Rely on an act (type RELY) | Identities › Rely | every card's act menu › Rely on it |
| Correct one's own act | Identities, posts | the act menu › Correct it |
| Anchor an act, paid in Damgar | collective folds | the act menu › Anchor it; Collectives › Money (anchor one of its acts) |
| **Pay someone** (prepared for Damgar) | Identities fold | **Dub › the payee's profile › Pay** (checked, not rebuilt: round 3); Edubba's own form removed |
| Received items sorted into piles | Identities | **removed** (decided); received acts show in Dub |
| The seller's alarm (Agreements rule 45b, client conformance) | Identities, the piles | **kept**: red, under the top, with "Seen" |
| Claude's drafts; "Claude may prepare drafts"; the drafts folder | folds; Settings | **removed** (decided) |
| Homes, relays, the collective client's settings, paired browsers | Settings | identity panel's foot, **This app** |
| Agent: first use, API key, name, owner, terms | first-use window | Agents › + Add an agent; The API key |
| What it did; prompt it | agent fold | Agents › Talk (feed box, typing box) |
| Queue: pick, pick several, retry, look now, nudge | agent folds | Agents › Queue |
| Notes, retire; MOR as seen by it; follow for it | agent fold; separate view | Agents › Mind |
| **The diary** | agent fold, open | Agents › Mind, **only after the public act** |
| Answering on or off; terms; cap; shared or own key; grants; keepers noted | agent folds | Agents › Terms |
| Found a real collective (grid, review) | Collectives | + Found a collective |
| Found a test collective; its own page | Collectives (Mac) | + Found a test collective; its tabs Act, and Members, money and endings |
| Bring a collective, read only | Collectives | + Bring a collective (tabs Act, To sign) |
| A founding in progress: answers, hand to hand, shares dealt | Collectives entry | its own column entry, "2 of 3 signed" |
| Permissions; constitution in plain words | real collective | Act (chips); "Its constitution, in plain words" top right |
| Post for a collective | test collective › Act | Act, the typing box (a real one: Dub's posting as a collective) |
| Members; change members; resignations; shares shown once | real collective folds | Members |
| Money terms; record it; pay a member | real collective folds | Money |
| Anchor a collective's founding or agreement | real collective | Money (until Ummia's round) |
| A collective's releases | Ummia (round 3) | Ummia; signed here in To sign |
| Keepers; record what arrived; disputes | real collective fold | Keepers |
| Proposals, shares, leaving | To sign | Collectives › To sign (all), a collective's To sign tab (its own) |
| Contacts for founding; follow lists sealed in Dub | found form | unchanged, in the found form |
| Protected file: text, picture, price, referral, split | Publishing | Publishing › A protected file; **video and audio added** |
| Deliver keys to buyers | Publishing | Publishing › Published here |
| Buyers | Publishing | Publishing › Sales |
| Vow; look up its sales; confirm or contest | Publishing | Vows › A new vow; Track; the act menu (confirm, contest) |
| Pairing this browser | pairing screen | unchanged |
| The web client's banner | a paragraph | one line with its "?" |

Nothing else was dropped. The functions removed are the three the design note removed: the piles, Claude's drafts, and Pay someone (which moved to Dub).

## 3. Where the build differs from the mockups, and why

| Built (`docs/edubba-kit/`) | Mockup | Difference, and why |
| --- | --- | --- |
| `mac-22-collective-act.png` | `edubba-collectives` | **A test collective has two tabs, not five**: Act, and "Members, money and endings", which is the collective client's own page, kept as it was. Its members, money and endings are not real acts by other people, so Members, Money, Keepers and To sign would show nothing true. A brought collective has Act and To sign (no key held, nothing else to do). |
| `mac-12-agent-talk.png`, all cards | all | **No time on a card**, as in Dub and Damgar: no act carries a signed time, and a time not signed looks like one that is. S7d's signer's time hint is not on main yet (section 4). |
| `mac-22-collective-act.png` | `edubba-collectives` | The permissions are **chips**, as drawn, each naming what it needs ("with others' keys", "not now"). The rule numbers moved behind "Its constitution, in plain words": the kit never shows a number in the page. The fold that kept them open or shut (H14) is gone with the list; the chips replace it. |
| `mac-03-home.png` | `edubba-home` | As drawn. The Collectives tile says the collectives in plain words ("None yet. Agreements are born here.") when there are none. |
| column | `edubba-collectives` | **To sign is also in the column**, above the + entries: it lists every proposal sent to the identity in use, from any collective, including one not yet founded (a founding has no collective tab to sit in). A collective's own To sign tab lists its own. |
| `mac-13-diary-act.png` | `edubba-diary` | As drawn, with a second line under the "?": what you are about to read, and that nothing shows until you choose. |
| `mac-50-identity-panel.png` | `edubba-identity-panel` | As drawn. The menu adds **New words from Kišib** (as in Damgar). A runner identity has no Words or New words: Edubba holds none of its keys. |
| `mac-30-publishing-audio.png` | `edubba-publishing` | As drawn. The mockup's duration ("3 min 12 s") is not shown: the audio Module reads the M4A's structure and keeps the sound byte for byte, but no part of the build decodes the sound. The line under the file says what the Module checks and strips. |
| `mac-40-vows-track.png` | `edubba-vows` | As drawn, but with no time on the cards (above). The points start with your homes and relays; a person or a collective is added by name or ID. |

**Found while building, and done:**
- **A redraw could empty the box being typed in**: a reading that landed late redrew the pane and lost what was typed. What the person is typing now survives a redraw, and a click on the tab already open redraws nothing. The earlier rounds already promised this for forms being filled (H32).
- **To sign through Kišib's runner**: Dub's member code signed some acts synchronously, which a runner identity cannot do. Every signature in it now goes through the asynchronous path (`signNow`), and the member key check accepts an identity whose encryption key's secret half is held in Kišib. With a key held here, nothing changes.
- **Dub read a sealed recording as a locked public one** and showed it as broken. It now knows it as a sealed post to buy.
- The visible finding numbers left in Edubba's texts (F337, F339, F353 and others) are gone from the page. The kit shows none, so a reader sees a rule's words, not its number.

## 4. For the MOR lead

**Nothing for the MOR lead.** No MIR, MICS, freeze test or verdict of the core changed, and no finding number was taken. S7d's F386 is the next one used.
- **S7d** (the buyer's contest, and the signer's hint written and exposed by the WebAssembly binding, Envelopes field 9) was not on main when this report was first written. It has since been merged (pull request 100, F386), merged into this branch, and built on: see section 8, "After S7d".
- **The WebAssembly**: in the first part of this round it was unchanged. Since the merge it is S7d's (SHA-256 `ed6825783977961b…`, 5,051,909 bytes), the same bytes in all six releases (section 8).
- **The agent memory cMIP, draft 2** (a Dubsar cMIP): rule 5.3 now says the diary opens only after a public act from its owner to it, accepted by one of the owner's homes. That is the app's rule, said as such. No verdict changes, and the test value is unchanged.
- **The audio Module draft 1**: its "not yet used" lines now say Dub and Edubba use it. No rule changed.

## 5. Questions for Nobody, allegedly

One at a time; the next only once the one before is answered.

**Question 1. The connector's draft tools.** Claude's drafts are removed from Edubba, but the connector (`clients/connector`) still offers Claude tools that write drafts to a folder, which no app reads any more.
- *My lean:* remove the connector's draft tools in the connector's next round, and say so in its README until then.

**Question 2 (after question 1). Where the seller's alarm shows.** The piles are gone, but the seller's alarm (rule 45b, client conformance) must still show. Built: red, under the top, on every tile, with "Seen" to put it away for the session.
- *My lean:* keep it there. It is the only place every tile shares.

**Question 3 (after question 2). The permissions' fold (H14).** H14 let you fold "what you may do" and remembered it per collective. The chips are one line, so the fold is gone.
- *My lean:* let H14 go; the chips are the decided form.

**Question 4 (after question 3). Which collectives sit under an identity.** Built: the real collectives it is a member of, and the collectives brought here that name it. Test collectives are not under any identity: their members are all held here, and they have their own column.
- *My lean:* keep it so.

**Question 5 (after question 4). The time hint, once S7d lands.** *Settled by the brief's Part 4, since:* on the card, faint, labelled "the signer's own hint", where no clock stamped the act (section 8).

**Question 6 (after question 5). Dub's Purchases play a sealed film or recording.** The brief named only Audio in Dub's typing box and the act card. Without Purchases playing what was bought, the video and audio added to Publishing could not be opened by any buyer, so I built it (Dub's Purchases › ▶ Play, checked by the Module first).
- *My lean:* keep it; it is the buyer's half of the same function.

## 6. Human test steps

*Test identities only, regtest only. Checked against Edubba's and Dub's READMEs ("Using it").*

**Install once**, on the Mac, from the MOR folder:
```
git fetch origin && git checkout claude/edubba-kit-agreements && git pull
cd clients/genesis && npm install && npm run wasm
cd ../kit && npm install && cd ../barebone && npm install
cd ../dub && npm install && sh scripts/make-app.sh
cd ../desk && npm install && sh scripts/make-app.sh
cd ../kishib && npm install && sh scripts/make-app.sh
```
(On Linux, `make-desktop.sh` in place of `make-app.sh`.) The homes and relays are those the READMEs name.

**Edubba on the Mac**
1. Open **Edubba** from `~/Applications`. The first screen: make or bring a test identity. Then the four tiles: Agents two bars, Collectives three, Publishing two, Vows two.
2. Top right: your identity by name. Open it: + Add shows Make one, Bring one, Use one from Kišib; the ⋯ menu; the foot, This app, with the homes and relays.
3. **Agents › + Add an agent** (the API key, Machine, allegedly, its owner yourself; read the terms, sign). In **Talk**, write to it; its answer appears in the feed. Look at **Queue** and **Terms**.
4. **Mind › its diary › Read it…**: read the act ("I have read …'s diary, on …", to the agent, public). Press **Not now** once: nothing opens. Then **Sign it, then open the diary**: the diary opens once a home accepted the act. In Dub, the act shows as a public post from you to the agent.
5. **Collectives › + Found a test collective**: three members held here. Open it: Act shows the chips; post a text, read it back, sign; open its card's act menu (Rely on it, Correct it). Open **Its constitution, in plain words**.
6. **Publishing › A protected file**: choose **An audio (M4A)**, pick a short M4A, a title, a price; **Read it back** (it says the recording was stripped by the audio Module), **Sign**. Try a file that is not an M4A: it is refused in plain words. Look at **Published here**.
7. **Vows › A new vow**: read it back, sign. **Track**: point at yourself; the vow shows.

**A real collective, three people** (as in round 1: three test identities, each in their own Dub and Edubba, the web client for one)
1. **+ Found a collective**: two members besides you. The column shows the founding "1 of 3 signed".
2. In each member's Edubba: **Collectives › To sign**: the founding in plain words; **Sign it**. The founder's column counts "2 of 3", then "3 of 3"; **Found it**; each share shown once, three words typed back.
3. The collective: tabs Act, Members, Money, Keepers, To sign. In the identity panel, choose the collective under your identity: you act as it. Post for it in Act: it is signed with your own member key.

**Use one from Kišib** (Kišib open, its runner on, an identity given to it)
1. In Edubba: + Add › **Use one from Kišib** › **Pair with Kišib**; compare the code; approve in Kišib (Runner, Apps), letting Edubba have what is sealed to the identity opened (To sign reads proposals sealed to it).
2. Take the identity. Try a vow: refused in plain words ("Edubba signs for it only in Collectives, To sign, through Kišib's panel").
3. Propose a founding to it from another Edubba. In To sign, **Sign it**: Kišib's panel appears inside Edubba's window, once per act; sign there. The founder's Edubba counts the signature.

**Audio in Dub**
1. In Dub, the typing box › **Audio**: pick an M4A, post. The card shows "▶ Play the recording"; it plays after the check.
2. Buy the protected audio from step 6 above in Dub (with another identity), pay in Damgar, let Edubba deliver the key (**Published here › Deliver keys to buyers**): in Dub's **Purchases**, **▶ Play**.

**The web client** (once released and served, as Edubba's README says): three tiles, no Agents; the banner one line with its "?"; bring a test identity; Collectives › To sign.

## 7. What changed, file by file

- `clients/desk` (Edubba):
  - `src/page/view.ts`: rewritten on the kit (tiles, columns, tabs, the identity panel, each tile's parts, the diary's act).
  - `src/page/parts.ts`: new, the earlier fragments kept, scoped under `.e-in`.
  - `src/page/ui.ts`: rewritten (navigation, the panel, each part, typed text kept across redraws).
  - Other page files: `src/page/api.ts`, `src/page/grid-view.ts`, `src/web/app.ts`.
  - `src/agents.ts`: the diary's public act.
  - `src/desk.ts`: an act's extra relays; refusals for a runner identity; forget.
  - `src/member.ts`: To sign through Kišib's runner; posting as a real collective.
  - `src/ops.ts`: drafts, piles and Pay someone removed; the diary, the runner, posting, correcting, words and forgetting added; the collectives under each identity.
  - `src/publishing.ts`: video and audio.
  - Smaller changes: `src/server.ts` (the runner link, Kišib framed), `src/store.ts`, `src/setup.ts`, `src/real.ts`.
  - Tests:
    - new: `edubba-kit-browser`, `edubba-kit-keys-browser`, `runner`;
    - rewritten: `web-browser`, `real-browser`, `machine-browser`;
    - updated: `agents-memory`, `desk`, `publishing`, `setup`, `web-build`;
    - removed (their screens are gone): `browser`, `agents-browser`, `edubba-browser`, `edubba-setup-browser`.
  - `built/` (rebuilt), README, `package.json`.
- `clients/dub`:
  - Audio in the typing box; the recording card.
  - Purchases play a sealed film or recording: `src/dub.ts`, `src/money.ts`, `src/ops.ts`, `src/shapes.ts`, `src/delivery.ts`, `src/page/ui.ts`, `src/page/view.ts`.
  - `src/server.ts` and `src/web/headers.ts`: comments.
  - `test/browser.test.ts`; `built/` (rebuilt); README.
- `clients/barebone`:
  - `src/post.ts`: posting and reading recordings.
  - `src/sealed.ts`: film and recording sealed, stripped first, checked before playing.
  - `src/specs.ts`: the audio Module's test value.
  - `src/cli.ts`; `test/post.test.ts`.
- `clients/kit/src/style.ts`: one line (an audio player in a card).
- `clients/repo/src/proposals.ts` and `clients/grants/src/member.ts`: signatures through `signNow`; the member key check accepts a key held in Kišib.
- `clients/connector/src/read.ts`: one line, so that a post playing a recording says so.
- `clients/damgar/test/browser.test.ts` and `clients/kishib/test/browser.test.ts`: their steps through Edubba's page reach it through the Collectives tile. Pay someone became Pay a member in a collective's Money. Nothing in Damgar or Kišib changed.
- `built/` of Kišib, Damgar, Ummia and the display client (`clients/site/built`): rebuilt, since they bundle the kit or the sealed media code.
- `cmips/cmip-agent-memory-draft-2.md` (new); `cmips/README.md`.
- `modules/audio/README.md`, `modules/module-audio-draft-1.md`: who uses the Module.
- Records: this report and `docs/edubba-kit/`.

**Every existing test.** Locally green: Edubba, Dub, Kišib, Damgar, Ummia, the kit, barebone, the repository client, grants. Each web release was rebuilt and is reproducible. CI on the branch is the record.

**The brief, truncated.** The brief's Part 4 ended mid-sentence ("check main before your last merge, and read …"). I took it as: check main for S7d before the last commit and, if it has landed, merge it and show its time hint. Main was checked last at `98e7c689`: S7d had not landed. Part 4 came afterwards, in full: section 8.

## 8. After S7d

*23 October 2026. S7d (the MOR lead's pull request 100, F386) is merged into main, and main into this branch. This is Part 4 of the brief.*

### In plain words

- **A buyer can contest any purchase in Dub, not only a vow's.** In Dub's **Purchases**, a file bought and paid has **Contest it…** in its act menu, below the line. You can say what was not kept, in words, if you want. The contest is signed in public with your own key, and is then shown **beside the purchase, in red**: to you in Dub, and to the seller in **Edubba › Publishing › Sales**. **It undoes nothing**: no payment, refund, key or file moves.
- **A vow keeps its own form.** Its sale is still confirmed (**Confirm: it was kept**) or contested (**Contest it…**) as before, because that is what marks the sale.
- **The same contest signed by anyone else shows nothing**, in Dub or in Edubba.
- **Where the core cannot say**, because a payment is not stated, the card says **"unknown"**, never "none".
- **The signer's own hint.** An act can now carry a hint its signer wrote, such as the time on their device. Where one was written and no clock stamped the act, the card shows it **faint, labelled "the signer's own hint: …"**. It is never a time the app vouches for, and nothing is ordered by it. **No app writes a hint when it signs yet: whether they should is not decided.**

Pictures, in `docs/edubba-kit/`:
- `dub-purchase-contested.png`: Dub's Purchases, the contest beside the purchase, and the act menu with **Contest it…** below the line.
- `mac-34-sales-contested.png`: Edubba's Sales, the buyer's contest beside the sale.

### Precisely

**1. The merge and the releases.**
- Main merged at `d2aebbca`. The only clashes were the six releases' `BUILT-WITH.txt`, which are rebuilt anyway.
- `npm run wasm` gives SHA-256 `ed6825783977961bde16c1a487f9061a845c16d766afd2ca1ba5c13a8fa07117`, 5,051,909 bytes, as S7d's.
- All six web releases are rebuilt from the merged branch, as their READMEs say: the display client (`clients/site`), Dub, Kišib, Damgar, Ummia and Edubba. They were rebuilt again after the changes below, since the kit and barebone code they bundle changed.
- Each carries that WebAssembly, and each `npm run test:build` (built twice, the same bytes) passes.

**2. The contest of a purchase.**
- **The purchase** is the buyer's own payer's claim of the payment.
  - For a file, it is sealed to the seller.
  - The buyer's Damgar keeps it with its content key. Dub reads it through a new `ownClaims(payment)` accessor in `clients/damgar/src/damgar.ts`.
- **The act** is signed by the buyer, public, at the relays and the buyer's homes:
  - payload: `purchaseContestPayload(purchase, promise?)`;
  - objects: `[[purchase, purchase]]`.
- **The reading** (`purchaseContests` in `clients/dub/src/vows.ts`), shared by Dub and Edubba:
  - The claim is given to the verifier with its key.
  - The parties' chains and public acts are held: the offer, the lanes.
  - The public contests naming the purchase are read from the relays, and the buyer's own from its homes.
  - Each claim's rail is checked by its rail Module and stated to the core (`railValid`, `railPayments`, and the lane's cap through the grant limits cMIP), exactly as for `agreementsVow`.
  - Then `Verifier.agreementsPurchaseContests(specs, purchase)`.
  - `law/payment-unstated` becomes `unknown`, with its reason, never "none".
  - `vowSales` now uses the same reader; it reads what it did before.
- **Dub** (`dub/src/money.ts`, `dub.ts`, `ops.ts`, `page/ui.ts`, `page/view.ts`):
  - A purchase carries `paid` and `contests`. Each contest is a red label beside it, or a warning label for "unknown".
  - **Contest it…** shows on a file bought once it is paid: a contest names the claim, which exists only then. The operation, `purchase contest`, refuses before that in plain words.
  - A vow's card keeps Confirm and Contest in the vow's form.
- **Edubba** (`desk/src/publishing.ts`, `ops.ts`, `page/ui.ts`, `page/view.ts`):
  - `publishing sales contests` reads each buyer's claim from the seller's inbox, by the offer it fulfils, and opens it with the seller's encryption key.
  - Sales shows each buyer's contests beside the row.
  - A buyer whose claim is not found reads "unknown", with why.
  - A collective's works are paid to its split service, which holds the claims, so they are not read here (question 8).
- **Nothing counted twice, nothing lost** (the changed format reading):
  - `agreementsDeclarationsNaming` is read only by the collective client, for abandonment declarations. Leaving out a contest that carries field 1 there removes nothing an app counted.
  - The core keeps the two forms apart. A purchase's contests are only those with no vow (`c.vow.is_none()`), and a vow's sale is marked only by the vow's form. So a vow-form contest is never also shown beside the purchase. The vow test now checks this: every sale's `beside` is empty while its vow-form contest marks it.
  - A contest of a vow's sale in the purchase's form (another client may sign one; Dub does not) marks no sale. So it is not lost, Track shows it beside the sale, labelled "contested beside the purchase, marking no sale", and Dub's vow card shows it too. *This path is built but not driven end to end by a test*: no app signs that form, and the core's own tests cover its reading (`core/tests/purchase_contest.rs`).

**3. The signer's hint.**
- `KitAct.hint` in the kit: drawn faint (`.k-hint`), labelled "the signer’s own hint: …", **only where the card has no `when`**, that is, where no clock stamped the act. It sorts nothing.
- Carried from `describeAct`:
  - barebone's shown post (`ShownPost.hint`);
  - Dub's feed and "to you" items;
  - Dub's messages (from `openSealed`'s `described`, kept with what was received);
  - Edubba's posts for a collective.
- The other apps' cards pass none yet: Edubba's Talk and Track, Damgar's payments, Ummia's releases. The kit draws it for any card that carries one.
- **No app writes one.** For the test alone, the genesis identity's `publish` passes an optional `hint` through to `makeEveryday`, and no app passes it. The runner's path does not carry it.
- An unrelated fix found on the way: the kit gave a "bad" label its class but no colour. It is now the alarm red (`--k-bad`), so the new contest labels read red, as an alarm does.

**4. Tests.**
- New: `clients/desk/test/purchase-contest.test.ts`. Real homes and relay, Damgar's programs, a test Lightning node:
  - a text published from Edubba, bought from Dub under its lane;
  - a contest refused while unpaid;
  - once paid and delivered, "none" beside it in Dub and in Edubba's Sales;
  - contested from Dub, with its promise: shown beside the purchase in Dub and in Edubba's Sales, the same act, its objects `[[purchase, purchase]]`, signed by the buyer;
  - by clicks: Dub's Purchases with the red label and **Contest it…** below the line, and Edubba's Sales in red;
  - **the same contest signed by another identity**: still only the buyer's, in both apps;
  - **an act with a hint**: Dub's feed carries it, and the card shows "the signer’s own hint: …";
  - **one without**: nothing; and with a clock's `when`, the hint is not shown.
- Changed: `clients/desk/test/publishing.test.ts`, the vow test. **A vow's sale is still confirmed and contested by its form**, and nothing of it shows beside the purchase.

### Files changed in this part

- Merged from main: S7d's core, binding, texts and genesis test, untouched.
- `clients/kit`: `src/html.ts` (`hint`), `src/style.ts` (`.k-hint`, the red of a bad label); README.
- `clients/barebone/src/post.ts`: the hint in a shown post.
- `clients/genesis/src/identity.ts`: `publish`'s optional `hint`, passed through (for tests; no app passes it).
- `clients/damgar/src/damgar.ts`: `ownClaims`.
- `clients/dub`:
  - `src/vows.ts` (the shared reader, `purchaseContests`, `contestPurchase`, Track's `beside`);
  - `src/money.ts` (`contestFile`, `filesContested`);
  - `src/dub.ts`, `src/ops.ts`, `src/shapes.ts`, `src/people.ts`, `src/page/ui.ts`, `src/page/view.ts`;
  - README.
- `clients/desk`:
  - `src/publishing.ts` (`salesContests`), `src/ops.ts`, `src/collectives.ts` (the hint);
  - `src/page/ui.ts`, `src/page/view.ts`, `src/page/parts.ts`;
  - tests (above); README.
- `built/` of all six web releases.

### The Dubsar clock (decided 23 October 2026)

*Decided by Nobody, allegedly, this morning:* "it is assumed that everyone would [use the dumb clock] unless more precise method is needed"; "For now, the dubsar suite relies on the dubsar timestamp clock module with optional anchoring to BTC"; a choice of clock comes "later when there are better clocks".

**In plain words.**
- Every app relies on the Dubsar clock: the timestamp clock dubsar.org's feed already names (website cMIP rule 13a; the timestamp clock Module, draft 2).
- Feeds are ordered by its stamps, each signer's own sequence kept.
- Each card shows its time, faint, top right: "23 Oct 2026, 10:10 UTC · by the Dubsar clock". On a phone, it is a line of its own: it is no longer hidden there.
- Where the clock has not stamped an act, the card shows the signer's own hint, labelled as the signer's. With neither, it shows no time.
- There is no choice of clock on the screens. Dub's This app now names the Dubsar clock in one line, with no form.
- Anchoring to Bitcoin is unchanged: optional, Anchor it, paid in Damgar.

**Its identity is not in the repository, so I did not add it.**
- dubsar.org's feed page names its clock by a placeholder (`docs/dubsar.org/feed.html`, `CLOCK-IDENTITY`), which the rehearsal fills only at publishing.
- The build therefore reads the clock from one place, `clients/barebone/src/clock.ts`, where `DUBSAR_CLOCK_ID` is **null until you give it** (question 9).
- Until then, no clock orders anything, and cards show the signer's hint or nothing, as today.
- A test names a test clock in the program's memory (`useDubsarClock`); nothing of it is kept.

**Precisely.**
- `clients/barebone/src/clock.ts` (new):
  - the clock's identity and name;
  - `clockTimes`, the earliest stamp of each act, by the timestamp Module's `readStamps`, each stamp judged through the clock's chain, read again at most once a minute;
  - `clockWords`, those times in words for the cards;
  - `timeWords` and `byClock`.
- **Dub.** The feed, the Relay lens and a profile read the Dubsar clock in place of the clock named in settings. That setting, its form's handler and its `clock` operation are kept but no longer read, and the operation's answer says so. A private message's card no longer shows this app's found time: it shows the signer's hint or nothing. The thread still says it is in the order this app found the messages.
- **Edubba.**
  - A collective's posts are read with the clock, ordered by it, each card with its time.
  - Every other card (Talk, Track, Published here, Vows published here) gets its time after drawing, from a new `clock words` operation, also on the web. Those lists keep their own order: an exchange, a vow and its sales.
- **Kišib** (only where it reads and shows the clock): the runner's log of what it signed gets each act's time by the clock (`clock words`, asked at the homes of the identities it holds). The log keeps Kišib's own record time.
- **Damgar** (only where it reads and shows the clock): each card drawn gets its time (`clock words`). Most Money acts are sealed, so the clock rarely holds them, and most show none.
- **Ummia**: it draws no act card, so nothing changed.
- **The kit**:
  - `cardsUntimed` and `stampCards` put the clock's time on cards already drawn, taking the signer's hint away there;
  - the phone shows `when`;
  - the clock line reads "Ordered by the Dubsar clock", no longer "…'s clock".
- **Not changed: Damgar's "clock for lanes" and Dub's "Until… on a clock" in a lane.** They name the clock a grant's expiry is judged on, inside the signed grant (the grant limits cMIP, 3.1). That is not display, so I did not default it (question 10).

**Test**, `clients/desk/test/clock.test.ts` (real homes and relay, a test clock):
- Two posts by two signers, the one signed second stamped later. In Dub's feed it is above the other, its time "· by the Dubsar clock". Run without the clock, that order fails: the test tells the two apart.
- A post not stamped, with a hint, shows "the signer's own hint: …" and no time.
- One with neither shows no time and no hint.
- Each signer's later, unstamped posts are never above its stamped one.
- This app names the Dubsar clock, with no form.
- Edubba's `clock words` gives the stamped act's time and nothing for the other.

### Questions (after question 6)

**Question 7. Contest it… before payment.** Built: shown once paid, since the contest names your claim of the payment, which exists only then. Before that, Purchases shows the purchase with no Contest it….
- *My lean:* keep it so. There is nothing to contest before paying.

**Question 8 (after question 7). A collective's sales.** A collective's works are paid to its split service, which receives the buyers' claims. Edubba's Sales does not read contests beside them yet.
- *My lean:* read them in the split-service round. The service already receives the claims, and could tell the members, as Damgar tells of a sale.

**Found while testing, and fixed.** In Dub, a recording the audio Module refuses was said in the card only until the next redraw of the feed. If a redraw landed while the Module checked, the refusal never showed, and Play was offered again: the browser test caught it once in a full run. The refusal is now kept and said again on every redraw, and the recording is never played.

**Question 9 (after question 8). The Dubsar clock's identity.** It is not in the repository's public files: the feed page names it by the placeholder `CLOCK-IDENTITY`. Shall I write its identity hash into `clients/barebone/src/clock.ts` (and the feed page), or keep it out and have the apps learn it another way, such as from dubsar.org's published feed page?
- *My lean:* write the hash in both. It is a public identity, not a server address, and every reader of dubsar.org's feed already sees it. Until you say, it stays out.

**Question 10 (after question 9). The clock a lane's expiry is judged on.** Damgar's "clock for lanes" and Dub's lane "Until…" still name a clock of your choosing, written in the signed grant. Should they default to the Dubsar clock too?
- *My lean:* yes, prefilled with the Dubsar clock and still shown in the lane's words, since the grant signs it. That is for the next Damgar session.

### Every test after S7d

Run locally on the merged branch, the kit, barebone, Dub, Kišib, Damgar, Edubba, Ummia and the reader again after the clock:

| Suite | Passed |
| --- | --- |
| barebone | 14 of 14 |
| collective client | 44 of 44 |
| connector | 13 of 13 |
| Edubba (`clients/desk`) | 101 of 101 (with the clock test) |
| genesis | 41 of 41 |
| grants | 5 of 5 |
| long-form | 26 of 26 |
| manage | 7 of 7 |
| the kit | 11 of 11 |
| Dub | 39 of 39 (after the fix above) |
| Kišib | 36 of 36 |
| Damgar | 34 (its 4 regtest tests run in CI's regtest job) |
| Ummia | 25 of 25 |
| test wallet | 4 of 4 |
| reader | 22 of 22 |
| repository client | 21 of 21 |
| reports | 9 of 9 |

- The jpeg, video, audio, carry and timestamp Modules all pass.
- The six releases are reproducible.
- **Two checks of `clients/assess` fail on this machine**, as in the earlier rounds: each quotes rules from `spec/`, which this branch does not change, and CI does not run that suite.
- The Rust workspace is S7d's, unchanged here: CI runs it.
