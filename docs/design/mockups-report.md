# The Dubsar Suite redesign, drawn: the mockups' report

*21 October 2026. For Nobody, allegedly, through the Dubsar Suite lead. A design session: pictures only. No app code, no cMIP, no Module and nothing in the core was changed. Drawn from `docs/design/suite-redesign.md` (the design note of the powwow of 20–21 October).*

## 1. In plain words first

**What was drawn.** Each app's screens as they would look after the redesign: 52 static pages, each photographed at two sizes (a Mac window, 1280×800, and a phone, 390×844). Beside them are 168 pictures of the apps as they are today, the "before".

The new screens:
- every app's home: four tiles, or for Dub the Public | Private switch;
- every tile opened, with its column on the left;
- the act card and its two menus, in Dub, Damgar and Ummia;
- the feed boxes, the pop-up thread and the profile page;
- Dub's mailbox, with a collective appended and a Cc;
- the identity panel;
- Kišib's runner panel inside Dub, and Damgar's tip panel inside Dub;
- Kišib's quiet door to Paper, and the change of keys ending with both new sets of words;
- the diary's public act.

The look follows the apps' own:
- mostly black, with Inter in its light weight (the apps' own font files);
- each app's colour turned to pastel and used in fills: the open tab, the main button, the selected part, a wash over the tiles;
- thin neutral lines for outlines;
- red only for alarms: a contest, a contested identity.

Every name and ID is invented: Max, Pa, Ph, T, Machine, allegedly, and Collective Y. IDs are written short (`mid1qx7…m4k`, `mact1r8d…4kq`, `mspec1s4…8kw`).

**How to look at it.** Open **`docs/design/mockups/index.html`** in a browser (from a checkout, or GitHub's "view raw" of the folder).
- The page opens with eight screenshots to look at first. Then come the apps one by one, each new screen with its phone version and today's screens beside it. At the end is every screen of today.
- Each new screen can also be opened on its own (its `.html` file). Making the browser window narrow turns it into the phone version.

**Look at these first:**
1. Dub's home (`dub-home`).
2. The act's menu in Dub, then in Ummia (`dub-act-menu`, `ummia-act-menu`). The top half is the same in both; the bottom half is each app's own.
3. Kišib's home (`kishib-home`): the tiles and their danger marks.
4. Kišib's runner panel inside Dub (`dub-runner`).
5. The new chain-key paper after a change of keys (`kishib-paper-chain-words`).
6. Dub's mailbox (`dub-private`).
7. The diary (`edubba-diary`).

**The "not decided" tag.** A small dashed tag reading NOT DECIDED marks two kinds of thing on the screens:
- what the note marks *lead's, not discussed*;
- what the note is silent on, where I chose the plainest option.

Section 2 lists each one. Everything without a tag is the note's *decided* or *accepted*.

**Today's screens, and how they were taken.** Each app's own browser walkthrough (`clients/*/test/*browser*.test.ts`) was run with screenshots turned on (`MOR_SCREENSHOTS`). They ran on local test homes and relays (`target/debug/mor-relay`), with test identities made by the tests themselves, and no live home. All 11 walkthroughs passed.
- **Edubba's Agents tab ran:** the Mac program's page was driven locally in Chromium with a fake API key, as its tests do. So its screens are included.
- **No picture of today exists for some screens,** because no walkthrough visits them: Dub's Signing tab, lanes, sealed-post form and vows; Damgar's Lanes, For a collective and vault transfer; Ummia's anchoring; Kišib's "Change the vault" door. The function table below still places them.

**Size.** 272 PNG files, 14.6 MB in all:
- before: 168 files, 11 MB. The long pages are kept whole, scaled to 560 pixels wide, 32 colours.
- after: 104 files, 3.6 MB, 64 colours.
- fonts and pages: 0.3 MB.

**How it was made, to redraw it.**
- `docs/design/mockups/tools/` holds the generator: `lib.mjs` and `screens.mjs` write the pages, `shoot.mjs` photographs them, `squeeze.py` shrinks the pictures and `index.mjs` writes the index.
- To redraw everything: `sh docs/design/mockups/tools/make.sh`.
- The act card, the menus and the identity panel are each one piece of code, so they are the same on every screen.

## 2. Every place I had to choose (each tagged on the screens)

**From the note's *lead's, not discussed*, drawn as proposed:**
1. Disclaimers reduced to one line with a "?" (every home: "Test identities only, until MOR is frozen ?"; one-line notes with "?" in panes).
2. A verification shown as one mark: ✓ at the bottom left of every act card (`suite-act-card`).
3. A faint short ID when two names collide, in the @ list (`dub-mention`: two people called Pa).
4. Cc for anyone, not only members (`dub-private`: "+ Cc").
5. Buy in the act menu (`dub-act-menu`).
6. Payments made under Dub's lane moved to Damgar: Account › "Under the lanes" (`damgar-account`).
7. Edubba's Agents with four tabs, Talk · Queue · Mind · Terms (`edubba-agents`, `-agents-queue`, `-agents-terms`, `edubba-diary`).
8. Claude's drafts to the agents, proposed dropped. Kept and tagged in Agents › Queue, count 0 (`edubba-agents-queue`).
9. Edubba's received-items piles, proposed dropped. Kept as the sort filters (new, to answer, answered, ignored) on Dub's To you lens (`dub-to-you`).
10. Edubba's Pay someone, proposed dropped. Kept as an entry in Damgar's Waiting column (`damgar-waiting`).

**Where the note is silent, my choice:**
11. **Danger levels** (three bars, filled to the level; the edge thickens with it; never red). *Decided by Nobody, allegedly, 21 October 2026 (question 2), Edubba's included: "I think so, yes." Tags removed.*
    - Kišib: Identities 1, Runner 2, Paper 3, Collectives 3.
    - Damgar: Waiting 3, Account 1, Lanes 2, Settings 2.
    - Edubba: Agents 2, Collectives 3, Publishing 2, Vows 2. The note leaves Edubba's marks open, Vows' level included.
    - Ummia: Look 1, Discuss 1, Publish 2, Choose 2.
12. Damgar's four tiles: **Waiting, Account, Lanes, Settings**. The note names three columns, and Settings survives the move of the clock and the node link.
13. Dub's three lenses: **Following · To you · Relay**, Relay third. *Decided by Nobody, allegedly, 21 October 2026 (question 1): "Yes, but relay should be the third option." Tag removed.*
14. Kišib's identity at top right: "Holds nothing · runner off" while the runner is off. The runner's identities appear there when it is on.
15. Each column's parts, on every tile opened, are taken from today's functions (one quiet tag at the foot of each column).
16. The tabs across a selected collective: Act · Members · Money · Keepers · To sign. The note's "sketch" is not in the repository.
17. The bottom half of the act menu, per app. Rely and Anchor are in every app; Correct appears on one's own acts.
    - **Dub:** Reply, Repost, Tip, Buy.
    - **Damgar:** Tip, and "Show it in the account".
    - **Ummia:** "Add to accepted list" (decided), and "Discuss it".
    - **Edubba:** "Confirm: it was kept" and "Contest it" (on a vow).
18. The bottom half of the signer's menu: Follow: add to contacts, and Mute, in every app.
    - **Dub and Edubba:** Message.
    - **Damgar:** Tip.
    - **Ummia:** "Follow their releases".
19. Dub's "Ask someone to pay you" placed as a chip in the private typing box.
20. In the identity panel:
    - each identity's menu holds Name, Relays, Words, "Line and homes", Dub's "A lane from Damgar", then a line, then Remove;
    - the panel's foot says where the app's paired browsers and its homes and relays live.
21. Remove said plainly in its own confirmation: "Dub forgets Max's signing words on this device. Max itself is not touched…" (`dub-identity-remove`).
22. The runner's panel frame: a striped edge in Kišib's colour, with "Drawn by Kišib · Dub cannot read or change this frame". Damgar's frame is the same, in gold.
23. The tiles are a pastel wash over black, and the full pastel solid is kept for the open tab, the main button and the selected part. I read "still dominantly black" as winning over "big solids" for tiles this large.
24. The change of keys as five steps: the words · read back · signed · new chain paper (1 of 2) · new signing words (2 of 2). Each set is shown once, then three words are asked back.
25. The quiet door to Paper: a plain card with "Open Paper" / "Not now", and nothing else on the screen.

## 3. Every function of today, and where it lives in the new screens

"Kept" means the screen stays as it is today, reached from the new place. Rows marked † are tagged *not decided* on the screens.

| App | Function | Today's place | New place |
| --- | --- | --- | --- |
| all | Pair a browser; a code for another; unpair | Pairing screen; identity window / Settings | Identity panel › foot "This app" † |
| all | Make an identity (chain words once, three back) | Dub identity window; Edubba Identities | Identity panel › + Add › Make one (kept screens). Damgar gains Make (accepted) |
| all | Bring an identity (ID, signing words, address) | Each app's identity window | Identity panel › + Add › Bring one |
| all | Use an identity held in Kišib (runner) | (new) | Identity panel › + Add › Use one from Kišib |
| all | Switch identity; act as a collective | Identity window; Edubba "Acting as"; Ummia "Who acts" | Identity panel: identities, collectives under each (decided) |
| all | Forget / remove an identity | "Forget it here", "Leave it" | Identity menu › Remove…, said plainly |
| all | Show the signing key's words | Identity window | Identity menu › Words |
| all | Take new words after a change of keys | `#spent` note; renew folds | Kept: the same note at the top, and Identity menu › Words |
| all | Copy ID, copy ID with where it lives | Identity window; heads | Signer's menu › Copy ID / Copy ID link (decided); identity menu |
| all | Rely on an act (witness, type RELY) | Edubba Identities › Rely | Act menu › Rely on it, in every app (decided) |
| all | Correct one's own act | Edubba posts; Ummia | Act menu › Correct it, in every app (decided) |
| all | Anchor an act on Bitcoin (paid in Damgar) | Edubba collective; Ummia releases | Act menu › Anchor it, in every app (decided); Ummia › Publish › Anchoring |
| Dub | Display name | Identity window › Save | Identity menu › Name |
| Dub | Change its relays (routes act) | Identity window fold | Identity menu › Relays |
| Dub | This app's line, homes, relays | Identity window fold | Identity menu › Line and homes † |
| Dub | Ask Damgar for a lane | Identity window fold | Identity menu › A lane from Damgar † |
| Dub | Signing on/off | Identity window checkbox | Removed with the Signing tab (decided) |
| Dub | Post text, picture, addressed post | Public › compose | Typing box at the bottom (Picture, @, To…) (decided) |
| Dub | @ mention | (none) | Typing box, by names (decided) (`dub-mention`) |
| Dub | Reply | Post › Reply | Act menu › Reply |
| Dub | Repost | Post › Repost | Act menu › Repost |
| Dub | Withdraw own picture | Own post › Withdraw picture | Act menu on one's own picture (not drawn) † |
| Dub | Follow, unfollow, rename followed, mute, unmute | Post row; Following fold | Signer's menu › Follow: add to contacts / Mute (decided); Contacts panel |
| Dub | Follow by ID | Following fold | Contacts › + Add by ID |
| Dub | Publish whom one follows | Following fold checkbox | Contacts › "Publish whom Max follows" |
| Dub | Everyone / To you / Relay views; look again | Public filters | The three lenses, Following · To you · Relay (decided, question 1) |
| Dub | Long-form document link | Feed post | Act card, a link to the reader (`dub-home`, T's card) |
| Dub | Tip: prepare for Damgar, or pay under the lane | Post › Tip | Act menu › Tip → Damgar's panel inside Dub (decided) |
| Dub | Pay-per-view: seal a post with a price | Public fold | Removed (decided) |
| Dub | Buy a sealed post or a vow | Feed box › Buy it, under the lane | Act menu › Buy † |
| Dub | Confirm / contest a vow bought | Signing › Vows you bought | Act menu of the vow (decided 17 Oct that contests run via Dub too) † placement; Edubba › Vows |
| Dub | Ask someone to pay you | Private fold | Private typing box › + Ask to be paid † |
| Dub | Payments under the lane (invoice, preimage, claim) | Private fold | Damgar › Account › Under the lanes † |
| Dub | Private message, sealed; reply; inbox | Private tab | Mailbox: conversations left, thread, typing box at the bottom (decided) |
| Dub | Private message to someone new | Private form | An empty feed (decided) (`dub-private-new`) |
| Dub | Proposals, shares, leaving (Signing tab) | Signing tab | Edubba › Collectives › To sign (Signing tab removed, decided) |
| Kišib | Change an identity's keys | Start › door | Paper › Change keys (after the quiet door); ends with both new word sets (F361) |
| Kišib | Change the vault | Start › door | Paper › Change the vault |
| Kišib | Escape a contested position | Start › door | Paper › Escape |
| Kišib | Name a successor | Start › door | Paper › Name a successor |
| Kišib | Confirm a succession | Start › door | Identities › Confirm a succession (accepted) |
| Kišib | Check paper words | Start › door | Paper › Check paper words |
| Kišib | An identity's record | Start › door | Identities › An identity's record; the record moves here from Edubba (decided) |
| Kišib | Rotate a collective (remote or same room) | Start › door | Collectives › Start a rotation |
| Kišib | Give my share | Start › door | Collectives › Give my share |
| Kišib | Check a share | (new, accepted) | Collectives › Check a share |
| Kišib | The runner: on/off, apps, standing yeses, what it signed | (new, decided) | Runner tile |
| Damgar | What you accept (first use; change; publish) | First-use screen; Settings | Settings › What you accept; also Ummia › Choose |
| Damgar | To sign: drafts from Dub, Edubba, Ummia | To sign tab | Waiting › To sign |
| Damgar | Requests: pay, accept as a debt, refuse; invoices; receipts; addresses | To sign tab | Waiting › To sign and Requests and debts |
| Damgar | Grant a lane asked by an app | To sign › Grant this lane | Waiting › To sign; Lanes |
| Damgar | Pay an invoice or address; proof; check the chain | Pay tab | Waiting › To pay |
| Damgar | Account: totals, payments, proofs, debts, what it does not judge | The account | Account tile |
| Damgar | Lanes: list, revoke, Damgar by itself | Lanes tab | Lanes › Your lanes / Damgar by itself |
| Damgar | The clock for lanes; the node link | Settings | Lanes (accepted) |
| Damgar | Collective money: promise to pay | For a collective tab | Waiting › For Collective Y, when acting as it in the identity panel † |
| Damgar | Where you are paid (payee pointer) | Settings | Settings › Where you are paid |
| Damgar | The vault (read only); transfer to the vault | Settings | Settings › The vault |
| Damgar | Relays; every step by hand | Settings | Identity menu › Relays; Settings › Every step by hand |
| Damgar | Tip, sign, authorise when woken by an app | (Dub's draft found later) | Damgar's panel inside the asking app (decided) |
| Edubba | Agent: first use, API key, its identity, name, owner, terms | First-use window | Agents › + Add an agent; The API key |
| Edubba | Answering on/off; terms; cap; shared or own key | Agent folds | Agents › Terms † tabs |
| Edubba | Queue: pick one or several, retry, look now, nudge | Agent folds | Agents › Queue † tabs |
| Edubba | Grants: read back, sign, revoke, ask again | Agent fold | Agents › Terms † tabs |
| Edubba | Notes, retire; diary | Agent fold | Agents › Mind; diary only after the public act (decided) |
| Edubba | What it did; prompt it | Agent fold; card | Agents › Talk (feed box and typing box) |
| Edubba | MOR as seen by the agent; follow for it | Separate view | Agents › Mind › "MOR as seen by it" |
| Edubba | Claude's drafts for an agent / identity | Folds | Agents › Queue, count † proposed dropped |
| Edubba | Received items, sorted into piles | Identities › What it received | Dub › To you lens, sort filters † proposed dropped |
| Edubba | Pay someone (for Damgar) | Identities fold | Damgar › Waiting › Pay someone † proposed dropped |
| Edubba | Identities tab (record, lines) | Identities tab | Gone (decided); the record in Kišib |
| Edubba | Found a real collective (grid, review) | Collectives › + Found | Collectives › + Found a collective (kept screens) |
| Edubba | Found a test collective; its Constitution tab | Collectives (Mac) | Collectives › + Found a test collective (kept screens) |
| Edubba | Bring a collective, read only | Collectives › + Bring | Collectives › + Bring a collective |
| Edubba | Founding in progress: answers, hand to hand, deal shares | Collectives entry | Collectives › Collective Z (column entry) |
| Edubba | Show a share once | Collectives | Collectives › To sign (kept screens) |
| Edubba | Members; change members; leave; register a resignation | Real collective folds | Collectives › Members † tabs |
| Edubba | Permissions; constitution in plain words | Real collective | Collectives › Act (permissions as chips); "Its constitution, in plain words" at top right |
| Edubba | Money terms; record it; pay a member | Real collective folds | Collectives › Money † tabs |
| Edubba | Keepers; record what arrived | Real collective fold | Collectives › Keepers † tabs; noted in Agents › Terms |
| Edubba | Post for a collective | Test collective › Act | Collectives › Act (typing box) |
| Edubba | Contacts (for founding) | Found form card | Dub's Contacts, the same list (decided "available from both") |
| Edubba | Protected file: text, picture, price, referral, split | Publishing | Publishing › A protected file; video and audio added (decided) |
| Edubba | Vow; look up vow sales; confirm or contest | Publishing | Vows › A new vow; Track (decided) |
| Edubba | Deliver keys to buyers | Publishing › Published here | Publishing › Published here |
| Edubba | Homes, relays, drafts folder; collective client settings | Settings | Identity panel foot † |
| Ummia | Who acts (self or a collective) | Every tab | Identity panel (decided) and "Who acts" chips in Publish |
| Ummia | A release from a folder; checked; the previous one | Releases | Publish › A release |
| Ummia | Does it count for the collective | Releases | Publish › A release (as Collective Y) |
| Ummia | Anchoring: offer, tier, prepared for Damgar | Releases | Publish › Anchoring; act menu › Anchor it |
| Ummia | cMIP or Module, hash first | Specifications | Publish › A cMIP or Module |
| Ummia | Tracking relays: cMIPs, Modules, extensions, xtypes, MIPs | Tracking | Look: point at, filter by (decided) |
| Ummia | The acts of one specification | Tracking | Look › point at a release or a specification |
| Ummia | Following a dev's releases; a release line | (new, decided) | Signer's menu › Follow their releases; Look's saved points |
| Ummia | What changed between versions | (new, accepted) | Look: a release's card |
| Ummia | MIPs: start, write, discuss, publish | MIPs | Discuss › MIP drafts |
| Ummia | Bug reports and answers | Reports | Discuss › Bug reports |
| Ummia | Accepted list: add, remove, publish, by layer | Accepted | Choose (by layer, decided); act menu › Add to accepted list (decided) |
| Ummia | Settings: relays, tracking relays, reporting ID | Settings | Identity menu › Relays; Look's point at; Discuss › Bug reports † |

No function of today was dropped from the pictures. The decided removals are Dub's Signing tab (its contents move to Edubba), Pay-per-view sealing, and Edubba's Identities tab (its contents spread out as above).

## 4. Questions for Nobody, allegedly

*One at a time, each with my lean. All of them are for the Suite lead; none touches the core.*

1. **Dub's three lenses: are they Following, Relay and To you?** These are today's three filters, renamed only from "Everyone" to "Following". *Lean: yes.* **Answered, 21 October 2026: "Yes, but relay should be the third option."** Drawn as Following · To you · Relay.
2. **The danger levels in section 2, item 11: right as drawn?** The note accepts danger marks but gives no levels. *Lean: yes. Edubba's levels stay open until you look at the picture.* **Answered, 21 October 2026, the question naming Edubba's levels too: "I think so, yes."** The levels stand as drawn, Edubba's included; this settles the note's open item "Dub's and Edubba's danger marks" for Edubba (Dub has no tiles).
3. **Damgar's fourth tile: Settings?** It would hold where you are paid, the vault and what you accept. *Lean: yes.*
4. **Kišib's identity at top right: "Holds nothing" while the runner is off, the runner's identities when it is on?** The note puts an identity top right in every app, and also says Kišib works differently. *Lean: yes.*
5. **Contesting a vow bought from Dub: in the vow's act menu?** On 17 October you decided contests also run via Dub. Today they live in the Signing tab, which the redesign removes. *Lean: yes, as "Confirm: it was kept" and "Contest it" under the line.*
6. **The three things proposed dropped: Claude's drafts, the received-items piles, Pay someone.** Drop them, or keep them where they are drawn (Edubba Agents › Queue; Dub's To you lens; Damgar's Waiting)? *Lean: drop Claude's drafts and the piles; keep Pay someone in Damgar, since Damgar is the money hub.*
7. **The act menu's bottom halves (section 2, item 17): right per app?** *Lean: yes, but Damgar's "Show it in the account" and Ummia's "Discuss it" are the weakest; drop them if they feel invented.*
8. **The tiles' fill: pastel enough?** The tiles are a pastel wash over black; full pastel is kept for the open tab, the main button and the selected part. *Lean: as drawn. Say "more" and the tiles take a stronger wash.*
9. **Collective Y's tabs (Act, Members, Money, Keepers, To sign): do they match your sketch?** *Lean: they follow today's folds; your sketch wins.*
10. **The runner and lines of acts.** When the runner signs for Dub, it signs on its own line per app; Kišib's change of keys already finds every line. *Lean: say so in the runner cMIP. The core already allows an identity several lines (Identity, "Sequence"), so it is not a question for the MOR lead.*

## For the MOR lead

Nothing for the MOR lead. Three points were checked against the texts while drawing:
- **A Cc on a private message** fits the sealed container. It carries one capsule per recipient, and the inner act's `to` lists them all (Envelopes draft 10, rule 11 and the container's format).
- **Anchoring anyone's act** is allowed: "Anyone may anchor any act" (anchoring cMIP draft 5, rule 3).
- **A runner keeping its own line** is the owner's choice of sequences (Identity draft 14, "Sequence").
