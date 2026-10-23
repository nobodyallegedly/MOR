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
- **S7d** (the buyer's contest, and the signer's time hint written and exposed by the WebAssembly binding, Envelopes field 9) **is not on main** as this branch ends (main at `98e7c689`). Its prompt says round 4 shows the time hint in the kit's act card, labelled as the signer's own hint. **That is not built**: there is nothing to show yet. Once S7d is merged, the card gains one line (proposed: "the signer's own hint: …", never presented as a time someone checked), and the six web releases are rebuilt.
- **The WebAssembly is unchanged** (`mor_wasm_bg.wasm`, same bytes). The web releases are rebuilt because the kit and the sealed media code they bundle changed: **Edubba, Dub, Kišib, Damgar, Ummia and the display client**, each reproducible (`npm run test:build`, all green).
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

**Question 5 (after question 4). The time hint, once S7d lands.** Should the act card show the signer's own hint on every card, or only behind the act menu's "Why it's valid"?
- *My lean:* on the card, in the faint style, labelled "the signer's own hint", as S7d's prompt says.

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

**The brief, truncated.** The brief's Part 4 ended mid-sentence ("check main before your last merge, and read …"). I took it as: check main for S7d before the last commit and, if it has landed, merge it and show its time hint. Main was checked last at `98e7c689`: S7d had not landed.
