# Edubba: report

*16 October 2026, evening (roadmap, "16 October 2026, evening"; F333, with F332's look). A GitHub session: test identities only; nothing touched the servers. Branch `claude/edubba`, one pull request, not merged.*

## In plain words

MOR Identities is now **Edubba**, "the tablet house". It is the same program on your Mac, opened by double-clicking **Edubba**, and it now has three tabs. Each tab has the same shape: **the list on top, the one you selected below.** It looks like Dub: dark, calm, Inter, each item in its own outlined card, red only for what is void, contested or stolen.

- **Agents.** The first time, a window asks for the API key, a name for the agent and its owner. It makes the agent (an inbox, and the encryption key its words carry), publishes its name and shows its terms, which are signed only when you press the button. Afterwards, **+ Add an agent** opens the same window. The key is kept in a file on your Mac that only you can read, and the page shows only its last four characters. All agents share one key unless you give one its own, and each agent has its own daily cap. Below the list is the selected agent: its terms, its queue of acts to pick from, a nudge, its cap and key, and the drafts Claude prepared for it. At the bottom is **Prompt it**. What you type there is a private message from you to the agent, sealed and signed, and it answers at once. One click on **MOR as seen by this agent** shows what it reads: whom it follows (you follow for it), its feed and its inbox. When you nudge it, it reads its feed too.
- **Identities.** Your other identities, without the agents (your word on the screenshots). For each one: its drafts from Claude to approve, decline or send back, and what it received, sorted as before. Two fixes are in. A private message's locked copy now goes to the sender's homes too, so its line can be kept at a change of keys. A new identity now draws its encryption key from its signing words, as Dub's identities do.
- **Collectives.** Each collective is shown as an identity, with its constitution available as a pop-up in plain words, and two sub-tabs. **Act** shows what you may do for it, from its agreement, each line naming its rule. Below that is a box to post text and pictures, read back before anything is signed. **Constitution** is the collective client's whole page, inside Edubba. The collective client's own app is retired; its code is now the library Edubba uses.

**One thing does not work yet, and on purpose:** posting for a collective. Building it showed that two core texts contradict each other: Agreements wants every act of a collective to point to its latest decision, and the Text MIR forbids a text to carry any such pointer. So no text a collective signs can count, whichever way it is made. You asked for it to go to the project lead (question 1 below). Until then, Edubba shows the whole review and keeps the Sign button off.

Your data stays where it is. `~/mor-desk` is read where it is (a new install uses `~/edubba`), and so is `~/mor-collective`. Machine, allegedly keeps its identity, its signed terms and its history. The drafts folder shared with the connector is unchanged.

## What was built

### The app and its data (`clients/desk`, the code kept in its folder)

- **The name** wherever a person sees it: the page and its title, the app (`~/Applications/Edubba.app`, made by `scripts/make-app.sh`, which removes `MOR Identities.app`, `MOR Desk.app` and `MOR Collective.app` if these scripts made them), the connector's instructions to Claude, the reports command's words, the two dubsar.org pages naming it (`docs/dubsar.org/feed.html`, `use.html`), the READMEs. The command is `mor-desk`, now also `edubba`.
- **The folders, read where they are** (the choice taken). `defaultDir`: `~/edubba`, or `~/mor-desk` while `~/edubba` does not exist, as Dub reads `~/mor-poster`. `collectiveDir`: `~/mor-collective` where it exists, else `~/edubba/collective`. Moving folders on first use was set aside: it would leave a running old program and the connector's settings pointing at the old place, for nothing gained. `open` stops a collective client program left running on its folder, so two programs never sign from one file.
- **Machine, allegedly** moved, unchanged, from `machine.json` to `agents/ID.json` the first time Edubba reads the folder. History lines from before name no agent, and are read as the first agent's.
- **The look** (F332): Dub's style, reused as is (`#06080c`, Inter light and regular from Dub's bundled files, served from the page's own origin with `font-src 'self'`; the grey-blue of the Identity layer for fingerprints, the grey-violet of Envelopes for what is sealed). Edubba adds only the lists, cards, sub-tabs, the pop-up and the collective client's classes in the same dark. No glow, no shadow (tested); red only for void, contested or stolen. An open question is not red.

### Agents (`src/agents.ts`, `src/machine.ts`, `src/claude.ts`)

- **Several agents**, one answering each (`Machine` per agent, its file `agents/ID.json`): terms, cap, causes, history. The instructions name the agent and its owner. Machine, allegedly's words are unchanged.
- **The first-use window and + Add an agent**: homes and relays if none are set yet, the key, the name, the owner (an identity held here, or a new one), and the agent's identity (new, or one held here). The **display name is published** (the naming cMIP, Identity type 4; your answer "(a) Published"). The terms are shown in plain words with their digest and signed only by their button. **Publish its display name** is offered for an agent with none published from here (Machine, allegedly).
- **Keys**: the shared key in `~/.config/mor/anthropic-key` (the deal tool's; `ANTHROPIC_API_KEY` still wins), an agent's own in `~/.config/mor/agents/ID.key`, folder 0700, file 0600, refused inside the repository. The page is told the last four characters only. Switching an agent between shared and own is one form.
- **The prompt box** (F333, "A)"): a private text act from the owner's identity to the agent, sealed to its key, signed, kept (signed record, history `prompted`), delivered. The agent then looks at once and answers privately under its terms, as it answers its owner's own messages. The conversation is drawn above the box.
- **MOR as seen by this agent**: its follows (the people cMIP, kept on the Mac, private), its feed (the site's feed reader: its posts and those it follows), its inbox. **Under a nudge** (your answer "(a)"), Claude is also given the ten newest verified posts of its feed not yet answered, after the acts sent to it. An answer to one is a public reply naming it. Each such post is fetched and kept before it is named, so the nudge cMIP's client conformance (draft 3) can read what it answers.
- **Its drafts from Claude** are shown in its details on the Agents tab, not on the Identities tab (your word on the screenshots).

### Identities (`src/desk.ts`)

- The tab lists every identity that is no agent, with drafts, sorting, witness acts and linking as before.
- **A private act's locked copy at the sender's homes** (Identity rule 35; left by the Dub report): approved messages, prompts, picks answered privately. The homes see that a private act exists, never what it says.
- **New identities' encryption key from their signing words** (`encryptionSecret`, the identity carry Module, draft 2), as Dub's.

### Collectives (`src/collectives.ts`; `clients/collective`)

- The collective client's operations are now a library function (`collectiveApi`), and its page logic is mountable in any element (`src/page/mount.ts`). Its own page is a thin wrapper kept for its tests; its app script points to Edubba's.
- **Act**: `Actions.permissions` reads the agreement in force as Agreements read it from the collective's relays and homes. For a text and for a picture it names who holds the signing key (rule 59), which area reaches each act and how many of its holders' signature acts it needs (rule 60, the voices that remain), a frozen area (rule 71), and that the act is done once public and on the chain (rules 57, 58). The stated cost of field 19 is said: an area cannot tell a release from a picture. "You" are the identities the collective folder marks as yours. Each permission carries what the agreement alone allows and whether it can be done now.
- `Actions.preparePost`: the text made canonical, the JPEG stripped, whose signature acts its areas need (yours first, the simulated members' consent said), a digest, then the collective's key and those signatures, then Agreements' reading of each act. **Blocked for now** (question 1).
- **Its constitution**, a pop-up: the deal-assessment tool's reading (`assess` over `gather`) of the agreement in force, its risks each with its rule.
- **Constitution sub-tab** and **+ Found a collective**: the collective client's page, scoped to the collective selected; founding, members held here, releases under one's own name; its settings under Settings.

## The questions

1. **To the project lead (your answer: "Report to lead pls"): a collective's text can never count.** Agreements rule 58 asks every action of a collective to cite, in `objects`, the decision it acts under, or it is on no chain and counts for nothing. Text rule 14 (F296) makes a text act carrying `objects` invalid. A post with a picture ends in a text act too, so nothing a collective posts can count, either way. The core's code also lets Agreements count such a text (`agreementsConsent` answered "counts" for a text act the core itself judges invalid): Agreements' consent does not first ask whether the act is valid under its own MIR. That is a code fix whichever answer is taken. Options as put to Nobody, allegedly:
   - (c) Text rule 14 allows `objects` only where each names the signer's own identity as chain: a collective citing its own decision. F296's reason is kept, since nobody can attach a text to another's chain. One sentence in Text, one check in the core. *The session's lean.*
   - (a) Agreements rules 57 and 58 exempt text acts: a collective's text sits on no chain, counting on its signature and its areas'. Cost: its posts are not unmissable, and the tie rule cannot order them against a departure.
   - (b) F296's own way: a plain text plus a companion act on the chain, under a cMIP the collective adopts. Cost: two acts per post, and the cMIP.
   Until answered, `COLLECTIVE_TEXT_OPEN` keeps Edubba from signing any post for a collective.
2. **Asked and answered** (F333 left them open; each changes what a person sees or signs):
   - Does adding an agent publish its name? **"(a) Published"**: the naming cMIP, at creation; a button for Machine, allegedly.
   - Who sets whom an agent follows, and does it read its feed? **"(a) Follow, and read it"**: the owner follows for it, privately; a nudge gives Claude its feed.
   - The look, on seeing every screen: **"The identities tab should not have the agents. … one for agents, one for secondary identities and one for collectives."** Adjusted in this run: agents and their drafts on the Agents tab only; new screenshots sent.

## Readings taken (mechanics, to confirm)

1. **Folders read where they are**, not moved (above).
2. **`machine.json` moved within its folder** to `agents/ID.json`; old history read as the first agent's. A `machine.json` whose terms were never signed is kept as `machine.json.unused`.
3. **The window shows while no agent exists**; on the author's Mac Machine, allegedly is carried over, so it does not show.
4. **An identity already held may become an agent** (its terms shown and signed as for a new one; its display name published too).
5. **"Never in the browser"** is read as never kept by the page: the key is typed once, sent to the program, the field emptied, never sent back.
6. **An agent's own key** is its file alone; `ANTHROPIC_API_KEY` stands for the shared key only.
7. **The prompt is answered as the owner's own message**, privately, under the existing terms (free); with answering off it is signed and delivered, and answered once answering is on.
8. **Follows are private and stay on the Mac**; publishing an agent's follow list (the people cMIP's other option) is not offered yet.
9. **Under a nudge**: at most ten feed posts, verified, not yet answered, after the ten newest acts sent to it.
10. **For collectives, "you"** are the identities the collective folder marks as yours; the identities held for collectives (members) stay in that folder, not on the Identities tab, so no identity is held by two folders (which would fork its sequence).
11. **A collective's settings**, when empty, take Edubba's homes and relays.
12. **Acting for a collective is public only** for now (no private messages, no money): said on the Act tab.

## Stated costs

- **Every prompt is a signed act** (F333's cost): kept by the owner's identity and the agent's, delivered through the relays.
- **The key passes through the page once**, as it is typed, and goes to Anthropic's API on each call. Whoever reads the owner's account files can read it, as they can read the identities' keys.
- **A shared key is one budget**: each agent's cap counts its calls, and only Anthropic's spend limit counts dollars across them.
- **A published display name proves nothing** and stays readable for good. Anyone may take the same name.
- **An agent's follows live in Edubba only**, and the words do not carry them. Under a nudge, the posts of its feed go to Anthropic, though they are public anyway.
- **A collective's pictures are decided by its release area** wherever that area is drawn by act type (Agreements field 19).
- **Test collectives' consent is simulated**: every member is held here, and the review says so.

## Tests

All run here, all passing (counts from the last full run).

| Package | Tests |
| --- | --- |
| `clients/desk` | `edubba.test.ts` 8 (new), `edubba-browser.test.ts` 8 (new, headless Chromium), `desk.test.ts`, `machine.test.ts`, `launcher.test.ts`, `browser.test.ts` and `machine-browser.test.ts` (the last two adapted to the tabs: the same behaviours, found where they now are) |
| `clients/collective` | all, unchanged (its browser test now drives the page through `mount.ts`) |
| `clients/nudge`, `clients/connector`, `clients/assess` | all, unchanged |
| `clients/site`, `clients/reports`, `clients/dub` (and its release build) | all; the site's feed-page test reads "Edubba" |

Screenshots of every screen were sent to Nobody, allegedly (`MOR_SCREENSHOTS`). His answer, about the Identities tab, was taken in the same run, and two new screenshots were sent.

## What is left

- **Question 1**, then posting for a collective: remove `COLLECTIVE_TEXT_OPEN`, and fix Agreements' consent in the core so it never counts an act its own MIR makes invalid.
- **Acting for a collective "in all their power"** (F333's future): private messages sealed to every member, money, deals.
- **Publishing an agent's follow list**, and muting from its view.
- **On the author's Mac**: pull, `npm install` in `clients/desk`, `sh scripts/make-app.sh`, then double-click Edubba. Machine, allegedly and `~/mor-collective` carry over.
- **Republishing the two dubsar.org pages** that name the app (a machine session's).
- **The roadmap entry** for this step, and confirmation of the readings above.
