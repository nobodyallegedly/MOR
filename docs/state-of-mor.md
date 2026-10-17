# The state of MOR, now

*A living file: what exists today, not how it came to be. Updated by the project lead at every merge. Every session reads it first. The history is in `docs/roadmap-v1.md`; the reasons are in `docs/findings/`. If this file and the code disagree, the code's own README wins, and this file is corrected.*

*Last updated: 17 October 2026, after pull request 74 (Kišib); before that, pull request 73 (after human test 10: icons, folds, the sealed follow list, acting as and member signing in Edubba).*

## Where we are

The human tests (`docs/human-tests-v1.md`, findings in `docs/human-tests-v1-findings.md`, H1 to H12) found that the apps needed a look from a user's point of view. Decided by Nobody, allegedly: clean the apps first, then finish the tests on the cleaned apps. Dub and Edubba are done; the site and Kišib are next.

The order to the freeze: the human tests; a session on the site's structure and look; the freeze-ready drafts, corrected by the findings; the step 17 rehearsal on the frozen texts; the freeze.

## The apps a person uses

| App | Where | What it does today | What it does not do |
| --- | --- | --- | --- |
| **Dub** | Mac (`Dub.app`), Linux (`make-desktop.sh`) and dub.dubsar.org (testing only) | An identity window (make, bring, switch, display name, signing words); a Public tab (feed of oneself and the followed, posting with a picture, optionally addressed, reply, follow, mute, a "to you" filter); a Private tab (inbox, sealed messages). Shows the chain key's words once at creation and keeps nothing of it. A Signing tab, off by default and labelled even more experimental: proposals read in plain words, signed or declined; a collective's chain-key share received once, shown as a number and 24 words, kept on paper. | No rotation (Kišib's); no money; no long form in the feed (a link to the reader). The name at creation (H12) and the Signing tab are served at dub.dubsar.org since 17 October. |
| **Edubba** | Mac (`Edubba.app`), Linux (`make-desktop.sh`) | Agents tab (API key on the Mac only, agents with their own terms and caps, queue, nudge, a prompt box that signs a sealed message, "MOR as seen by this agent"); Identities tab, the identity setup page (make or bring an identity; its record of homes, routes, keys, names and lines; relying on an act, typed RELY; releases under its own name, the folder chosen each time, the previous release pre-set by name; drafts from Claude); Collectives tab (Act: permissions from the agreement, folding, posting text and pictures; Constitution: founding, members, collective releases, leaving; the agreement as a pop-up; bring an existing collective, read only). | Acting for a collective is public only (no private messages, no money, no deals); real collectives founded with members on their own devices (contacts, proposals, signatures gathered, shares dealt to one-time keys and kept on paper; member changes wait for Kišib), test mode kept and labelled; a brought collective is read only; an agent's follow list is never published. |
| **dubsar.org** | The website, verified in the visitor's browser | Films, the feed (posts of the identities the page names), a box to write to Nobody, allegedly or Machine, allegedly, the report page, the listing of specifications. | No links yet to the feed, report or listing (H1); the feed shows long-form documents (H2); the reader shows only the author's own posts (H7). For the site session. |
| **reader.dubsar.org** | Web | Opens one act by link, verifies it, renders posts and documents, offers a way to write to the owner. | Not a feed of anyone. |
| **The management page** | `/manage/` on each home and relay | Approvals, lists, a limit on new identities, the operator's rotation, pairing. | |
| **The Claude connector** | Inside Claude's app | Reads and verifies acts; prepares drafts for Edubba. | Never holds a key, never signs. |

**Command line only, no app:** rotating an identity (the genesis client, until Kišib); the reports mirror; the Lightning harness on regtest; publishing the site.

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

*Decided by Nobody, allegedly, 17 October 2026: "All human tests wait for the break, build until then." Build Kišib, Damgar and Ummia (and the agents and site sessions if tokens allow) until the weekly token limit stops the work; the human tests (9, 10's end, 11, free play, and recruiting a few non-developers) are run during the pause.*

Done: Kišib merged (pull request 74, `docs/kishib-report.md`): rotation from paper, collective rotation, escape, succession, paper check; Edubba takes new words; readers now ask an escape's new homes (a client correction, F299's way out made countable); Kišib's sign 𒈩. A server session later: dubsar.org (the display client, rebuilt), dub.dubsar.org (its icons), kishib.dubsar.org (new). Human tests 9 and 10's end: steps at the end of the Kišib report, during the break.

1. Damgar, a money app (F338): gathers proposed money acts and offers them for signing, with the accepted cMIPs and Modules chosen by the person; no wallet inside; round 1 on regtest on the author's Mac (payments and receipts, prepared in Dub or Edubba and signed in Damgar; Bitcoin anchoring as an option for releases and collectives' acts, asked in Edubba, paid in Damgar); three rounds (decided by Nobody, allegedly, 17 October 2026: "First add complexity for a single user, then last the multi user scenarios"): round 2, apps paying with permission: Damgar grants lanes (per-act cap, act types, expiry), and a pay-per-view envelope for testing is the first use of a lane (a sealed post with a price set in Dub, paid from Dub through its lane, the key delivered on the receipt, opened in Dub); round 3, collectives' money: the split service, defined in Edubba's Collectives tab, and money held or paid as a collective. The pooled anchoring service (step 14a, F225, F226, F228; tiers, tickets, refunds, visible custody, the conversion hop) stays as built and tested on regtest: nothing more is built for it (decided by Nobody, allegedly, 17 October 2026). Damgar only pays an anchoring request, kept simple: enough for the interface to show that anchoring exists ("It's just so that the UI shows it exists").
2. Ummia, the developers' app (F339): tracking Modules and cMIPs by asking public relays; releasing cMIPs and Modules; a path to drafting MIPs; bug reports; tracking extensions and xtypes; releases of code and their anchoring (moved out of Edubba); acting as oneself or as a collective one belongs to.
3. An Edubba session for agents: reading and verifying any public act (H21); memory, the exchange handed on and notes sealed to itself on MOR (H22); a pasted Terminal path and a folder picker (H19).
4. The site session (structure and look; H1, H2, H7; the reader showing display names, H17). Nearer release: the KI tab icon's fit and the tablet in the footer (H13).
5. The remaining human tests on the cleaned apps.
6. The freeze-ready drafts, including: Agreements' count aligned with every MIR's format (F295, found under F334); MICS and suite naming Text 9. And **published conformance vectors for every layer** (asked by Nobody, allegedly, 16 October: the first useful test of a frozen MOR is someone rebuilding a verifier from the texts alone, in another language): today `core/vectors/` has part 1 only (tagged hash, CBOR, canonical text, lock, running summary, the three-act sequence, opening acts, the sealed container), checked by an independent Python implementation; missing are signatures (part 2) and verdict vectors (these exact acts give valid, invalid or unknown) for Identity (rotations, contests, receipts, succession), Text, Money, Agreements and Development.
7. An independent verifier in C, written only from the texts and the vectors, passing every vector (F336: "it will show proof of work").
8. The step 17 rehearsal, then the freeze. Before the first wave, when the repository goes public: tighten main's protection (pull requests and passing checks required, the release workflows allowed to commit); for now only force pushes and deletion of main are blocked (17 October 2026).

## Working rules for sessions

- Read this file, then `CLAUDE.md`, then the README of every client you touch. Ask Nobody, allegedly, before guessing a rule.
- Never write the author's personal name; write "Nobody, allegedly".
- No server addresses, onion addresses or keys in the repository.
- Test identities only; regtest or signet only.
- The test apps keep the layers apart and talk through MOR: what one app prepares for another travels as acts (sealed to oneself where private), never a shared file or a side channel (working rule, 17 October 2026).
- Work on a `claude/` branch, open a pull request, do not merge.
