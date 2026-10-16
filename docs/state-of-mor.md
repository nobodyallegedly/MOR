# The state of MOR, now

*A living file: what exists today, not how it came to be. Updated by the project lead at every merge. Every session reads it first. The history is in `docs/roadmap-v1.md`; the reasons are in `docs/findings/`. If this file and the code disagree, the code's own README wins, and this file is corrected.*

*Last updated: 16 October 2026, evening, after pull request 70 (Edubba) and the evening's Mac session.*

## Where we are

The human tests (`docs/human-tests-v1.md`, findings in `docs/human-tests-v1-findings.md`, H1 to H12) found that the apps needed a look from a user's point of view. Decided by Nobody, allegedly: clean the apps first, then finish the tests on the cleaned apps. Dub and Edubba are done; the site and MOR Safety are next.

The order to the freeze: the human tests; a session on the site's structure and look; the freeze-ready drafts, corrected by the findings; the step 17 rehearsal on the frozen texts; the freeze.

## The apps a person uses

| App | Where | What it does today | What it does not do |
| --- | --- | --- | --- |
| **Dub** | Mac (`Dub.app`) and dub.dubsar.org (testing only) | An identity window (make, bring, switch, display name, signing words); a Public tab (feed of oneself and the followed, posting with a picture, optionally addressed, reply, follow, mute, a "to you" filter); a Private tab (inbox, sealed messages). Shows the chain key's words once at creation and keeps nothing of it. | No rotation (MOR Safety's); no money; no long form in the feed (a link to the reader); no name at creation yet (H12). |
| **Edubba** | Mac (`Edubba.app`) | Agents tab (API key on the Mac only, agents with their own terms and caps, queue, nudge, a prompt box that signs a sealed message, "MOR as seen by this agent"); Identities tab (other identities, drafts from Claude to approve); Collectives tab (Act: permissions from the agreement, posting text and pictures; Constitution: founding, members, releases, leaving; the agreement as a pop-up). | Acting for a collective is public only (no private messages, no money, no deals); an agent's follow list is never published. |
| **dubsar.org** | The website, verified in the visitor's browser | Films, the feed (posts of the identities the page names), a box to write to Nobody, allegedly or Machine, allegedly, the report page, the listing of specifications. | No links yet to the feed, report or listing (H1); the feed shows long-form documents (H2); the reader shows only the author's own posts (H7). For the site session. |
| **reader.dubsar.org** | Web | Opens one act by link, verifies it, renders posts and documents, offers a way to write to the owner. | Not a feed of anyone. |
| **The management page** | `/manage/` on each home and relay | Approvals, lists, a limit on new identities, the operator's rotation, pairing. | |
| **The Claude connector** | Inside Claude's app | Reads and verifies acts; prepares drafts for Edubba. | Never holds a key, never signs. |

**Command line only, no app:** rotating an identity (the genesis client, until MOR Safety); the reports mirror; the Lightning harness on regtest; publishing the site.

**Retired:** MOR Identities (now Edubba); the collective client's app (its code is Edubba's library); MOR Post (now Dub).

## The pieces underneath (`clients/`, `modules/`)

genesis (identities, routes, keys, rotation, key delivery, look-up), barebone (posts and pictures), longform, repo (collectives, releases), assess (agreements in plain words), nudge (the nudge cMIP), site (signed sites, the gateway, the display client), reader, reports (the GitHub mirror). Modules: airgap, carry, jpeg, video, lightning, onchain, timestamp. Every client uses the core library through WebAssembly.

## The texts, current drafts

Core (`spec/`): **MICS v28**, **freeze test suite v28**, Identity **13**, Text **9** (F334), Envelopes **10**, Money **8**, Agreements **14**, Development **10**. Not yet freeze-ready; MICS and suite do not yet name Text 9.

cMIPs (`cmips/`): anchoring 5, conversion 3, live media 1, long form 1, **naming 1**, nudge 3, payment 3, **people 1**, relay transport 4, release manifest 4, split 3, website 11.

Modules (`modules/`): airgap chain-key signer 5, airgap safety signer 4, bitcoin clock 3, clock timestamp 2, **identity carry words 2**, JPEG 1, video 1, Lightning rail 3, on-chain rail 3, the seed Modules 1, units bitcoin 1.

Awaiting Nobody, allegedly's approval: Text 9; the naming and people cMIPs; carry Module draft 2; Dub's and Edubba's readings (in their READMEs and reports).

## The servers (no addresses here: those are in the private project note)

Three homes (home1, home2 on servers; home3 on the author's Mac, onion only; home2 also by onion), the gateway serving dubsar.org (https only, no onion: decided 16 October), the reader, Dub's web client, a timestamp clock. **All on main after pull requests 68 to 70 (16 October, evening):** the homes with F334's core, the reader with Text draft 9, Dub reshaped with Inter, site version 836bc0bd naming Edubba. The clock runs its own code copy of the morning, still stamping.

## Open, in order

1. A small session for Dub and Edubba: a display name at creation in Dub (H12); Edubba's "What you may do for it" folding and unfolding (H14); bringing an existing identity or collective beside making one (H15); releases under one's own name moved to the Identities tab, the folder chosen at each release (H16); the Identities tab made an identity setup page (its record of routes, homes, keys and lines; relying on an act; drafts from Claude) with releases (F333); a Linux desktop icon for both, and a Linux test run.
2. The site session (structure and look; H1, H2, H7; the reader showing display names, H17). Nearer release: the KI tab icon's fit and the tablet in the footer (H13).
3. MOR Safety, the rotation app (F332, amended).
4. The remaining human tests on the cleaned apps.
5. The freeze-ready drafts, including: Agreements' count aligned with every MIR's format (F295, found under F334); MICS and suite naming Text 9.
6. The step 17 rehearsal, then the freeze.

## Working rules for sessions

- Read this file, then `CLAUDE.md`, then the README of every client you touch. Ask Nobody, allegedly, before guessing a rule.
- Never write the author's personal name; write "Nobody, allegedly".
- No server addresses, onion addresses or keys in the repository.
- Test identities only; regtest or signet only.
- Work on a `claude/` branch, open a pull request, do not merge.
