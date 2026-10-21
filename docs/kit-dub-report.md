# The kit, and Dub rebuilt on it: report

*21 October 2026, Dubsar Suite, branch `claude/dubsar-kit-dub-rebuild-u8zik3`, for Nobody, allegedly, and the Suite lead. Built from the redesign they drew and approved (`docs/design/suite-redesign.md`, the mockups in `docs/design/mockups/`). Test identities only; regtest only; no server address or key in the repository.*

## 1. In plain words

**The kit** (`clients/kit`) is one set of pieces every Dubsar app will share, so they stop drifting apart: the dark look with Inter in its light weights and each app's pastel; tiles with danger marks and a column that folds on a phone; the feed box that scrolls inside, never the page, with whose clock orders it said underneath; **the act card**, with the signer's short ID and name top left and the act's short ID bottom right, each opening **its own menu by a click** (never a hover), the top half the same in every app and never signing; the pop-up thread with its back arrow; the profile; the identity panel with the collectives under each identity and Remove said plainly first; contacts and **@ by names**; one-line disclaimers with a "?"; and an empty, sealed-off place where another app's panel will appear in round 2. It holds no app's logic. Its README is `clients/kit/README.md`.

**Dub** is rebuilt on it. No tiles: a switch at the top, **Public · Private · Purchases**; Contacts top left; the identity top right; it always opens on Public.

- **Public** has three lenses, **Following · To you · Relay**. Relay shows text and envelope acts by default, the other layers behind a filter. At the bottom, one typing box: text, a picture, **a film**, **@ by name**, **To…**.
- Every card's two menus give: copy the ID, the ID link, the act ID; open the profile; **open what it answers or corrects**; **why it's valid**; and below a line, what changes something: follow, message, mute; reply; **rely on it**; **anchor it**; **correct it** (your own); tip; buy.
- **Private is a mailbox**: conversations on the left, the thread, the typing box. A message to someone new opens an empty thread. **Cc** is visible to everyone who receives it. A member can **append a collective** ("of Collective Y"): written in one's own name, binding nothing, and shown by the reader's Dub only if the membership checks (a new cMIP, draft 1, F374).
- **Purchases**: files and vows bought, **All · Files · Vows**; a vow is confirmed or contested from its own menu.
- **Paying: three ways in one chooser** (Tip, Buy, Pay, unlocking): under Dub's lane (with what is left of it), Ask Damgar, or by hand.
- **Removed, as decided**: the Signing tab (members sign in Edubba, Collectives › To sign) and pay-per-view sealing (Edubba's Publishing does it; Dub buys and opens).
- Every path that signs checks the key first (H80), the new ones included.

**Pictures.** Every new screen at a Mac's size and a phone's is in `docs/kit-dub/` (listed in section 3 beside the mockup it follows); the kit's pieces are in `docs/kit-dub/kit/`.

## 2. Every Dub function, and where it lives now

Nothing was dropped but the two removals decided.

| Function (old Dub) | Where now |
| --- | --- |
| Make a new identity (chain key's words once, three back once hidden) | First screen; identity panel › + Add › Make |
| Bring an identity by its signing key's words | First screen; + Add › Bring |
| Show the signing key's words | Identity's menu › Words |
| Display name | Identity's menu › Name |
| Switch identity | Identity panel: choose one (a collective under it the same way) |
| Forget it here | Identity's menu › **Remove from Dub…** (said plainly first, H58) |
| Line and homes, where it lives | Identity's menu › Line and homes |
| Relays shown and changed (H39) | Identity's menu › Relays (H53) |
| Pair another browser, unpair (Mac) | Identity panel foot (This app) |
| Post: text, picture, To… | Public typing box (+ film, + @) |
| Reply | Act menu › Reply |
| Follow, Mute | Signer menu (Follow adds to contacts) |
| To you | Lens "To you" |
| Withdraw a picture | Act menu (own posts) › Withdraw the picture / the film |
| Follow list sealed to oneself; publish it | Contacts, its foot |
| Unmute | Contacts › Muted |
| Follow by ID, ID link, or ID with a home | Contacts › + Add by ID |
| Copy ID, Copy ID with where it lives | Signer menu › Copy ID, Copy ID link (H51) |
| Corrections and grants shown | Quiet labels on the card; Open what it answers or corrects (H74) |
| Private inbox and a message to one identity | Private (mailbox, conversations, Cc) |
| Ask someone to pay you | Private typing box › + Ask to be paid |
| Tip (prepared for Damgar) | Act menu › Tip › the pay chooser (three ways) |
| A lane from Damgar | Identity's menu › A lane from Damgar |
| Payments under the lane (invoice, proof, claim) | In the pay chooser's pop-up, and under A lane from Damgar |
| Buy a sealed file, read it | Act menu › Buy; Purchases › Files |
| Repost a sealed post | Act menu › Repost (sealed posts) |
| Buy a vow | Act menu › Buy |
| Confirm or contest a vow sale (was Signing tab) | Purchases › the vow's menu |
| Keys delivered and arrived | Looked for on opening and on Look again |
| Key changed elsewhere, new words taken (H80) | A red box under the top, on opening and before every act |
| Proposals waiting (said in Private) | Private says so; signed in Edubba › To sign |
| The web client's banner | One line with its "?" |
| **Signing tab** | **Removed (decided)**: Edubba, Collectives › To sign (the same code) |
| **Seal a post with a price** | **Removed (decided)**: Edubba, Publishing |

**New:** Relay lens and its layers; Purchases; profile page; pop-up thread; Why it's valid; Rely on it; Anchor it; Correct it; film; @; Cc; a collective appended; acting as a collective in public; Pay from a profile; the pay chooser's three ways; the clock named (identity panel foot) and said under each feed.

## 3. Differences from the mockups, and why

Each screen beside its mockup (`docs/design/mockups/shots/after/`):

| Built (`docs/kit-dub/`) | Mockup | Difference, and why |
| --- | --- | --- |
| `mac-03-public.png`, `phone-01-public.png` | `dub-home` | **No time on a card unless the clock named stamped it.** The mockup shows a time on every card; no act carries a signed time today (the core library writes no field 9, section 4), and the website cMIP says a hint never orders a feed, so Dub shows a time only from a clock's stamp. **Added under the feed**: the clock line (H54 asks it said) and Look again. **Added in the typing box**: Video (H52). |
| `mac-12-relay.png` | `dub-relay` | The layers filter is a row of chips under the lenses, text and envelopes chosen; two short lines under the feed say what Relay is and how many acts of other layers are behind the filter. |
| `mac-07-thread.png`, `mac-08-why.png` | `dub-thread` | As drawn. Why it's valid is a pop-up of its own in the same frame, with its back arrow. |
| `phone-02-act-menu.png`, `mac-06-replying.png` | `dub-act-menu`, `dub-act-signer-menu` | As drawn; on a phone the menu is a sheet from the bottom. The heading over the app's own items reads "Dub's own". |
| `mac-25-vow-menu.png` | `dub-vow-menu` | As drawn: Confirm and Contest after a line, only on vows bought. |
| `mac-10-profile.png` | `dub-profile` | Where it lives names its homes' hosts; the feed carries its clock line. "Since when" shows only where the clock named stamped the genesis (none named in the pictures). |
| `mac-04-contacts.png`, `mac-05-mention.png` | `dub-contacts`, `dub-mention` | As drawn. Adding by ID, the muted and publishing the list sit at the foot of Contacts. |
| `mac-13-private.png`, `mac-14-private-new.png`, `mac-15-private-cc.png`, `mac-28-private-appended.png`, `phone-03-private.png` | `dub-private`, `dub-private-new` | **Cc and "of Collective Y" show as quiet labels above the text**, the kit's one place for labels, not at the card's foot or beside the name. A line under the thread says its order is this app's own (no signed time). A collective with no display name shows by its short ID. |
| `mac-09-pay-chooser.png`, `mac-22-pay-chooser-lane.png`, `mac-23-by-hand.png` | `dub-pay-chooser`, `dub-damgar-tip` | **"In all: … left" is not shown**: the grant-limits cMIP has no total cap until its draft 3 (decided, not yet written); the lane line says the cap per payment, the expiry, and what Dub has paid under it so far. **By hand** shows the payment to copy; **Damgar has no place to paste it yet** (Damgar's round), said. **Ask Damgar** does not pop Damgar up (round 2), said. A tip has an amount and a unit to choose. |
| `mac-16-purchases.png`, `mac-24-purchases.png` | `dub-purchases` | The state and price sit above the item's words, as labels. No audio yet (no audio in Dub). Look again under the box. |
| `mac-17-identity-panel.png`, `mac-27-identity-panel-collective.png`, `phone-04-identity-panel.png` | `dub-identity-panel` | As drawn; "use one from Kišib" is an empty place (round 2). |
| `mac-18-identity-menu.png`, `mac-20-identity-remove.png` | `dub-identity-menu`, `dub-identity-remove` | The menu adds Line and homes, A lane from Damgar, A collective under it (the mockup's "This app" items live in the panel's foot). |
| `mac-21-lane.png`, `mac-26-anchor.png`, `mac-29-acting-as-collective.png`, `mac-19-key-changed-elsewhere.png`, `mac-01-first-screen.png`, `mac-02-chain-words.png`, `web-*.png` | none | New screens the mockups do not draw; built in the same pieces. |
| none | `dub-runner`, `dub-profile-pay` | Kišib's runner in the slot is round 2 (the slot is in the kit, empty). Pay from a profile opens the same chooser (`mac-09`). |

**Found while building, fixed here** (not in the mockups): the proof box was offered for payments already claimed; the payment under a lane now waits for the seller's invoice by itself; Purchases has Look again. In Edubba (tests moved there from Dub's Signing tab): after a share's words were typed back, To sign was never read again, so a later proposal (a release) never showed; fixed by clearing the form once checked (`clients/desk/src/page/ui.ts`, one line). After merging the private lines (pull request 86), two races showed under CI's load, both fixed: a film whose check ended after its card was drawn again never played (now it plays in whichever card shows it); in Damgar's To sign, a pasted invoice could be lost when two refreshes overlapped (now what is typed is kept by form and field until that form is sent, `clients/damgar/src/page/ui.ts`). Reading films makes the shared post reader (`clients/barebone/src/post.ts`) import the video Module, so dubsar.org's display client grows by it: its release is rebuilt on main, as it already differs there. Some words in the pay pop-up are Damgar's own (its code runs the lane: "Asked of mid1…, under the lane"), to name by contact name in Damgar's round.

## 4. For the MOR lead

1. **No act carries its signer's own time, so H54's fallback cannot be shown.** H54's note asks feeds to fall back to "the signer's timestamp hint (field 9, said as the signer's word)" where no clock stamped an act. The core library's WebAssembly binding neither writes field 9 when it signs nor exposes it when it reads, so no client can show it. Dub falls back to each signer's own sequence and says so ("not a time"). No MIR, MICS, freeze test or verdict changes; this asks whether the binding should write and expose the hint (Envelopes field 9). *Lean:* yes, as a later binding change, display only, never ordering a verdict, as the website cMIP says.

Nothing else for the MOR lead: the appended collective is a Dubsar cMIP (F374), binding nothing; every rule touched is a client's.

## 5. Questions for Nobody, allegedly

One at a time; each with the session's lean.

1. **A collective appended to a public post too?** The cMIP allows it (its mechanic 1.4); Dub offers it only in Private, as the redesign drew. *Lean:* keep it to Private until someone asks for it in public; posting **as** the collective already exists there.
2. **Cc and "of Collective Y": above the text, or at the card's foot as drawn?** The kit has one place for quiet labels, above the text. *Lean:* keep one place, every app the same.
3. **Times on cards without a clock.** Show none (built), or show "found at …" (the app's own time, said as such)? *Lean:* none: a time that is not signed looks like one that is.
4. **A clock named by default?** The clock is named per identity in the panel's foot; none until named. *Lean:* name the servers' clock by default once its ID is published, said in the clock line.
5. **Repost** is offered only on sealed posts (the money cMIP's reposter share). *Lean:* keep it so; a plain repost is a reply quoting the act.

## 6. Human test steps

**On the Mac** (Terminal, from the MOR folder):

```
git fetch origin && git checkout claude/dubsar-kit-dub-rebuild-u8zik3 && git pull
cd clients/genesis && npm install && npm run wasm
cd ../desk && npm install && cd ../site && npm install && cd ../kit && npm install
cd ../dub && npm install && sh scripts/make-app.sh
```

1. Open **Dub** from `~/Applications`. It opens on **Public**, paired, with the identity it held.
2. **Contacts** (top left): add someone by their ID link, with a name. Check the name shows, not a hash.
3. In the typing box: write "Hello @" and choose them by name; post. Post a phone photo; post a short MP4 film and press Play.
4. On any card: click the short ID top left (the signer's menu), then the act's short ID bottom right (the act's menu). Nothing should open on hover. Try Copy act ID, Open what it answers, Why it's valid.
5. On someone's post: **Rely on it** (type RELY). On your own: **Correct it**; see "correction of…" and open the original from its menu.
6. **Relay** lens: only texts and envelopes; tick another layer in the filter.
7. **Private**: + A new conversation, someone new: an empty thread; send; then + Cc someone; check the Cc label.
8. Identity top right › your identity's **…** › **A lane from Damgar**: ask; grant it in Damgar. Then **Tip** a post: choose Under Dub's lane, pay the invoice in your wallet (regtest), paste the proof. Tip again with Ask Damgar (it waits in Damgar), and By hand (copy it).
9. Buy a picture or a vow published in Edubba; open **Purchases**; confirm or contest the vow from its menu.
10. Change the identity's keys in Kišib, then try to post in Dub: refused, with the box for the new words.
11. Identity's menu › **Remove from Dub…**: read what it says first; cancel.

**On the phone** (the web client, once the release is served at `dub.dubsar.org`, with the one Caddy line in `clients/dub/README.md`):

1. Open it in Safari; the banner is one line with a "?".
2. Make or bring a test identity; post; @ someone by name: the names are Dub's own list, not the keyboard's.
3. Tap a card's IDs: each menu comes up from the bottom as a sheet.
4. Private: a conversation opens full screen; the back arrow returns to the list.
5. Open a profile; Message; Pay (the chooser).
