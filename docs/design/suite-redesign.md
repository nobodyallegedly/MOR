# The Dubsar Suite, redesigned: the powwow of 20–21 October 2026

*Nobody, allegedly, with the Dubsar Suite lead, from 23:19 to 01:47. Same functions, one coherent design. Three marks, kept strictly:*
- ***Decided***: *his idea or his words.*
- ***Accepted***: *the lead's proposal, agreed with a word ("Yes", "Agreed", "Not that I can see"), often late at night. Re-read these first.*
- ***Lead's, not discussed***: *proposed and never answered either way. Not decided.*

*Decide twice (his own method, from the first lead's letter): read this once more, fresh, without the conversation open. Where the two readings agree, it is built; where they differ, there is something to look at.*

## In his words
- "The idea was simply to have tools to test the protocol." Now: "The apps are for me, and for anyone who wants to get a feel of MOR."
- "Right now the apps are patchworks of various bits and rounds and lack a cohesive feel, even within themselves."
- "A whole lot of space is used in disclaimers and verifications. One easily gets lost scrolling up and down and everything sort of looks the same."
- "Each app should be able to work on its own; if people want to wait to need Kišib to install it, their choice."
- "We're building experimental tools for an experimental protocol. So I can live with that gap."
- "Want to seal? Go to Edubba, where agreements are born."
- "Unless an area is defined, the founder is king. It's ok. Makes sense."
- "That was to force the sessions to think about transfer via MOR. I think we should keep it. It's just a way to have Dub or another app wake up Damgar."
- "Delivering an encrypted message is always easier when you have the key. That is why Kišib needs a different mechanism."
- On the lead: "Slow down… you're trying to do too much at once"; "I can sense you wanna build, but slow down."

## Outside the redesign
**H80** (Edubba's Rely signing with a retired key): a short fix session of its own. Cause found by the lead in the code: `Desk.witness` (`clients/desk/src/desk.ts`) skips the key check (`keyCurrent`) the name, correction and post paths make. Open for that session: a home accepted the act; if a verifier would call it valid, it goes to the MOR lead.

## The map (decided)
Kišib, the identity hub. Dub, to interact with others. Damgar, the money hub. Edubba, the agreements hub ("a mess at the moment… born as a way to manage multiple test identities"). Ummia, for developers: tracking, publishing, managing cMIPs and Modules and the accepted list.
- Edubba's Identities tab goes (decided: "it's a desk that was useful for tests"). The identity record moves to Kišib (decided); rely in every app (decided: "an all apps feature"); corrections everywhere (decided, superseding "via Ummia or Edubba"). Claude's drafts to the agents, the received-items piles and Pay someone dropped: *lead's, not discussed.*

## Every app stands alone (decided)
Each app makes or brings an identity the hard way (its ID and words).

## The Dubsar runner cMIP (decided; H61 brought forward: "a good thing to have early")
- Mac only. Inspired by Amber and nsecbunker. Connection initiated in the app, approved in Kišib; then Kišib signs for it.
- Kišib's approval panel shown **inside the asking app's window** (decided: "it needs to show it in Dub"), drawn by Kišib (a frame the app cannot read or change: *accepted*). The gap (a malicious app covering or tricking a click) accepted (decided).
- Standing yeses per app and kind; money, agreements and keys always ask: *accepted.*
- **Off by default, no key stored** (decided). On, with the risk stated, Kišib keeps signing keys; the chain key never (decided: "only on Mac yes… with stated risk, and risk is optional").
- **The working rule stands** (decided): apps talk through MOR. Kišib's runner is the one exception, for the reason he gave: the asking app holds no key, so it cannot put a draft on MOR.
- **Damgar on the Mac** (decided): "Damgar should act as Kišib for money acts, it should pop up and authorise." Its mechanism stays (drafts on MOR); the app only wakes it.

## The identity panel (decided: storing multiple keys, switching, deleting; Kišib works differently)
- The identity **top right** in every app (decided). Collectives listed under the identity that belongs to them, so acting as a collective is the same gesture (decided: "It solves it everywhere, even on Dub").
- Its contents (identities, + Add with make, bring, use from Kišib; each identity's name, relays, words, Remove said plainly first): *accepted* in substance. Damgar gaining Make follows from "every app stands alone".

## Collectives and keys (understood together)
- Edubba gives the collective's signing key to the founder alone (Agreements rule 59 allows one holder, a threshold or a custodian). Where no area reaches an act, that key counts alone: "the founder is king" (decided as acceptable). The founder can also stall decisions by withholding the key. Every member holding a copy: set aside on the lead's arguments (solo actors, unknown signer, theft, departed members, rule 59 does not list it).

## Private mail and collectives (decided)
- A member writes in their own name and **appends their collective** (decided: "the person signs in their own name, and append their collective"). Binds nothing; the reader's app shows the label only if the membership checks: *accepted.*
- **Cc**: optional, and every recipient sees it (decided: "That's a cc, and it's therefore optional and all parties see it"). Cc for anyone, not only members: *lead's, not discussed.*

## Acts
- **Two IDs per card, two menus** (decided: "the act displays two hashes, one top left the ID, one bottom right, the act. Each lead to two menus"). No hovering, only click or tap (decided).
- In each menu, what you take above a line, what you do below: *accepted* ("Looks great"). Signer: Copy ID, **Copy ID link** (decided), Open profile / **Follow = add to contacts** (decided: the same action), Message, Mute. Act: Copy act ID, Open what it answers or corrects, Why it's valid / Reply, Repost, Rely, **Anchor** (decided: beside Rely, on any act), Correct (one's own), Tip, Buy (*lead's, not discussed*).
- **Open the signer**: a profile page with a feed (decided). Its contents "light and friendly" (decided); the list (name, one line on homes, ID link, a warning only on trouble, Follow, Message, the feed, "Full record in Kišib"): *accepted* ("Yup").
- **Open what it answers**: a pop-up holding a small feed box (decided: "a pop up or a feed box?", then "Yes sounds good" to the pop-up with a feed box and a back arrow).
- **@** autocompletes in the typing box (decided), **by names, not hashes** (decided). A faint short ID when two names collide: *lead's, not discussed.*

## The feed (decided)
"The feed needs to look the same, which was not the case before… box with scrollable feed, upper left lower right menus."

## Look
- Tiles: "Big in your face, an icon and text. With icons that show the level of danger of the various areas" (decided). Marks and edge weights, red kept for alarms: *accepted* ("I like it").
- "Keep the dominant colour themes for the various apps, use it less in the outlines and more in the fillers… but still dominantly black" (decided). "Go way more pastel for big solids of colours. Still use lines and outlines where possible" (decided). Supersedes part of H36.
- "Tabs, and then inside the tab a column menu to pick the various parts" (decided).
- Disclaimers to one line with a "?", a verification as one mark: *lead's, not discussed.*

## Kišib
- Four clusters and tiles (Identities, Runner, Paper, Collectives), each tile's column: *accepted* ("Not that I can see", "Sounds good").
- Confirm a succession moved from Paper to Identities: *accepted* ("Agreed").
- Check a share (new): *accepted.*

## Dub (decided)
- "It should always open on the public feed, with option to go relay view. With option to post." Three lenses: *accepted* ("Ok for the three lenses").
- "A scrollable box that fills the screen nicely and typing box always in the same place, preferably bottom of screen, a pop up to write is not needed. A private message to someone new opens an empty feed."
- Private "should behave more like a mailbox… one place to access multiple feeds, one per ID we communicate with." Contacts "available from both".
- **No tiles**: "simple switch at the top. Contacts as a menu top left."
- The Signing tab removed (decided: it existed only "because lead refused to let me have Edubba on web… from my bathtub"). Pay-per-view sealing removed (decided). Payments under the lane moved to Damgar's log: *lead's, not discussed.*

## Damgar
- Clusters (*accepted*: "Yes, looks right"); "same approach as Kišib?" (his question, answered yes); danger ranking (*accepted*: "It feels right").
- Account, Waiting, Lanes columns: *accepted* ("Yes"). Settings: the clock for lanes and the node link moved to Lanes: *accepted* ("Agreed on changes and columns").
- The list of accepted cMIPs and Modules read as a map of what was built (his prompt): Conversion is accepted but used by nothing on screen.

## Edubba
- Agents, Collectives, Publishing kept as tiles (decided: "They're different enough. I think it's inside each one that there is much work and clutter"). **Vows** a tile of its own (decided: "it will evolve in the future. Now, use it to create simple vows. And to track contests by pointing at people, collectives or relays").
- Collectives' layout: the sketch (decided: "I don't know. I like what I see"). Its column: *accepted.*
- Publishing: video and audio added (decided); its column: *accepted.*
- **An audio Module** (decided: "let's have an audio module"); M4A as its format: *accepted* ("Fine for me yes").
- Agents: their four tabs (Talk, Queue, Mind, Terms) were proposed; **he did not answer them**: he answered the diary instead. *Lead's, not discussed.*
- **The diary** (decided): "I can open it and read it only on one condition. I need to first sign a public act that states that I have done so." Addressed to the agent and public (decided: "Yes, both, everyone should see it"). Stated limit: the rule is the app's, not the cryptography's.

## Ummia
- "The cleanest of the lot. It needs a feed, that you can point at people or relays" (decided); "more a poking tool… see all sorts of acts and filter by their type" (decided).
- Four tiles "to keep the shape of the other apps" (decided, his request); their split into Look, Discuss, Publish, Choose: *accepted.*
- Look (decided): "One feed, point at (relay, single ID, contact list, release) filter by (releases, cMIPs, modules, xtypes)", and extensions (decided). Following a dev's releases and a release line (decided): "the same follow list, but here it filters". What changed between versions: *accepted.*
- Discuss and Publish columns: *accepted.* Choose: *accepted*, filtered by layer (decided).
- cMIP hashes easy to copy everywhere, and "add to accepted list" in the act menu (decided).

## Answered on the mockups (decided, 21 October, afternoon)
*Answered in the design session; its report, `docs/design/mockups-report.md`, has every answer in full.*
- **Dub's lenses**: Following · To you · Relay ("Yes, but relay should be the third option").
- **Danger marks as drawn**, Edubba's included ("I think so, yes"): Kišib Identities 1, Runner 2, Paper 3, Collectives 3; Damgar Waiting 3, Account 1, Lanes 2, Settings 2; Edubba Agents 2, Collectives 3, Publishing 2, Vows 2; Ummia Look 1, Discuss 1, Publish 2, Choose 2. *This replaces the Damgar ranking of the night before (Account 1, Waiting 2, Lanes 3, Settings 2).*
- **Damgar's fourth tile, Settings**: "It's a lot more than what settings offer elsewhere."
- **Kišib top right**: "Kišib is different, the only place where an ID can be held is the new runner."
- **Confirm or contest a vow bought**: in the vow's act menu in Dub, below the line.
- **Claude's drafts removed**: "Drafts can be removed." **The received-items piles removed for now**: "It's a mailbox behavior type of things." **Pay someone** kept, as **Pay on the profile** of the identity to pay, waking Damgar's panel.
- **The act menus' bottom halves** as drawn, without Damgar's "Show it in the account" and Ummia's "Discuss it" ("Agreed").
- **The tiles' pastel wash**: "they're not aggressive, I like it."
- **A collective's tabs** as drawn (Act, Members, Money, Keepers, To sign): "building is like working with clay… the more you move forward the more it gets defined."
- **Edubba's agent tabs** Talk, Queue, Mind, Terms: "They work for me."
- **Dub gains Purchases**: the switch reads **Public · Private · Purchases**; files bought and vows purchased, All · Files · Vows.
- **Three ways to pay from Dub** (decided): "Dub has no money signing by default, everything has to be done in Damgar… That was the experiment, now we're looking at using more to do something closer to a prototype." (1) by hand: the act copied and signed in Damgar; (2) a money message Damgar queues, (2A) popping Damgar up on the Mac; (3) a lane "with a cap on total, and a cap per act". "Damgar remains the money hub. It grants other apps rights. The rights are requested by the apps, and approved in Damgar. When moving info from app to app simply use private messages. If a new format is needed we create a new cMIP." The cap in all ("Yes, add it") is kept by the apps, not judged by verifiers (the grant-limits cMIP leaves a total out on purpose: it would need private acts); a payment under the lane is finished in Dub, its record in Damgar's Account.
- **Settled by the design session** on "Decide what you can yourself. If unsure, ask": disclaimers in one line with "?", one ✓ per card, a faint short ID only when names collide, Cc for anyone, Buy in Dub's act menu, the columns' parts, Tip in Damgar's signer menu, Ask to be paid in Dub's private box, the identity menu's items, Withdraw a picture beside Correct.

## Mac only (decided, 21 October)
"Agents and runner are Mac only." The agents need a program that keeps running and keeps the API key and their words out of the browser (the reasons of H18); the runner keeps signing keys on the Mac. The web clients carry neither.

## Still open
- Question 2 of the H80 report: private lines Kišib cannot place (apps leaving each private act's locked act at the identity's homes).
- The four items the MOR lead handed over (`claude/MOR-lead-for-the-suite.md`): the chain-key signer Module's next draft, "Dubsar" titles, the payment cMIP's vault transfer, the regtest quirks kit.

## Next
H80: built (pull request 81). The mockups: drawn and answered (pull request 82). Next: the build rounds, from the approved pictures.
