# MOR V1: Roadmap

*28 September 2026. Each step is one working session ("window"), and ends with something that can be checked. Start each window with: read `CLAUDE.md`, `docs/build-brief-v1.md` and this roadmap, then do step N.*

## The rule (Nobody, allegedly)

**What we build is separate from what we show. Nothing is shown before every step below is built and tested.** The order therefore follows dependency and risk, not what is seen first: the riskiest part, identity under attack, comes early, so that flaws in the MIPs surface before anything is built on top of them.

Until step 17, every identity is a **test identity**, and every relay holds test acts only. When everything is ready to show, the relays are wiped and the first acts are made fresh: the author's real identity is born then, with the air-gapped safety key Module, so its genesis is itself one of the first acts.

**Help from others (F85).** Nobody, allegedly and Claude build and freeze V1. Others help through targeted questions to specialists, drawn from the draft freeze report once testing shows what is real and what exists only on paper (step 15). One person, one question on their field. They decide nothing, and no one is shown the whole before step 18, with one exception: Semisol, who attacks it before the freeze (step 16).

## Steps

### Foundations

**0. Decisions** *(short, can run alongside steps 1 and 2)*
Cryptography libraries (with the Rust specialist), especially SLH-DSA and ML-KEM; the license.
*Done when:* both are recorded in the build brief.

**1. Relay transport cMIP** *(a document)*
How a client publishes, fetches and follows acts, delivers to an inbox, finds deliveries addressed to it, and asks a home for a receipt; how a home is queried for chains, receipts, routes, names and links (open in Identity).
*Done when:* Nobody, allegedly approves it, in `cmips/`.

**2. Core library, part 1** *(Rust)*
Deterministic CBOR, tagged hashes, act ids, locking and the inside commitment, canonical text, running summaries.
*Done when:* published test vectors pass, including the three-act running summary.

**3. Core library, part 2** *(Rust)*
Identity-chain checks: genesis, rotation, receipts, conflicts, which rotation counts, homeless rotation, escape. Builds to WebAssembly.
*Done when:* hand-made test chains give the answers the Identity MIP requires.

### Identity, proven

**4. Relays** *(Rust)*
The basic relay and the home relay, sharing most of their code: storage, verification on arrival, receipts, log summaries. One deployment on a public server, one on a home machine.
*Done when:* acts go in and come back verified; homes sign receipts and summaries.

**5. Genesis client** *(TypeScript)*
Creates test identities with the safety key in software, clearly labelled; publishes genesis, routes and encryption key; signs rotations.
*Done when:* a test identity exists, rotates, and its homes serve it.

**6. Air-gapped safety key Module** *(`modules/`)*
The offline signer: commitment export, pending and signed rotations, by file and animated QR, with the device rules of the Module.
*Done when:* the Module's own functional and attack tests pass.

**7. Freeze-suite harness and the identity gauntlet** *(Rust)*
Scenario 5, steps 6 to 7d, against the real homes: majority and self-hosting, a stolen safety key, a forged receipt, closure by rotation, homeless rotation, escape with both keys, a genuine conflict settled by audit.
*Done when:* the gauntlet passes.

### Content

**8. Long-form text format** *(cMIP, then module code)*
*Done when:* the specification is approved and a formatted text renders, with its plain text always available.

**9. JPEG module and barebone client**
*Done when:* a test identity posts text with a picture and another client shows it, verified.

**10. Web reader** *(TypeScript)*
Opens by link, fetches acts from a relay, verifies them, renders long-form documents and posts, shows who signed each one and its fingerprint, and offers a way to reach Nobody, allegedly. Domain and hosting.
*Done when:* a link opened on a fresh device shows a verified document.

**11. Management clients**
For the home relay and the basic relay.
*Done when:* an operator can run each without a terminal.

### Friction in Finance and Law *(F84)*

Each of these is small on purpose: enough for every layer to meet real use before it freezes.

**12. Lightning integration module** *(Module, then code; Finance)*
How a Lightning payment becomes a Finance receipt and a payout. Nobody, allegedly: "probably the easiest module".
*Done when:* the specification is approved, and a test identity pays another over Lightning and both hold a verified receipt.

**13. Split Module** *(Module, then code; Law)*
A split over stakes: a payment divided among test identities, exactly.
*Done when:* the specification is approved, and a payment is split, balances to the unit, and each share is paid and receipted.

**14. Deal-assessment tool** *(Law)*
"Something to assess deals" (Nobody, allegedly). What it assesses is defined with Nobody, allegedly at the start of the step. *Suggested (Claude): it reads an agreement and shows, in plain words, who signed, what each party is bound to, the shares, and how the deal ends.*
*Done when:* defined with Nobody, allegedly at the start of the step.

### Review and freeze *(F84)*

**15. Machine review** *(Fable, larger budget)*
Every scenario the components can run is run; the rest are reasoned on paper; the draft freeze report marks each. Then Fable reviews everything, the texts, the code and the report: "breaks things and fixes them". A fix that changes a MIP is a finding. From the report's reasoned items, targeted questions go to specialists (F85).
*Done when:* every finding from the review is resolved with Nobody, allegedly and recorded, and the affected scenarios are rerun or re-reasoned.

**16. The freeze**
Settle the remaining open parameters of all six MIPs (test vectors, pinned Unicode version, key-delivery format, commitment construction, private links, exact formats for Finance, Law and Production). **Human adversarial review (round 3) by Semisol**, against the running prototypes as well as the texts: "Yo Semi, can you help me break this?" (Nobody, allegedly). What he breaks is resolved with Nobody, allegedly and recorded. Then freeze all six together, at inception (F85).
*Done when:* the six frozen texts, their hashes and the freeze report are published together, and the core library uses those hashes.

### Publication

**17. First acts and the repository on MOR**
The relays are wiped of every test act. the author's real identity is created with the air-gapped Module, and publishes the first short post ("Thank you for the shower…" with the planet), the full text as the first long-form document, the specifications, and the code releases as read-only acts.
*Done when:* everything the reader shows is signed by the author's identity and fetched from a relay.

**18. Final test pass**
Every component re-tested end to end; the door opened on devices it has never seen.
*Done when:* all passes. **Only then is anything shown.**

## Decisions due along the way

| Decision | Before |
| --- | --- |
| Cryptography libraries; license | step 2 |
| Domain and hosting | step 10 |
| What the deal-assessment tool assesses | step 14 |
| Which identity publishes the repository on MOR | step 17 |

## After V1

*Decided by Nobody, allegedly, 28 September 2026 (F85), replacing the circle of five decided earlier the same day.*

V1 is frozen at inception, and nobody is appointed to decide what comes next. "That is a problem they can deal with if they become curious and excited… and they can do so without me. I can move on to other things." A successor is anyone's to build, and users move to it by choice, as the core already provides.

### The collective, and the author's exit *(decided by Nobody, allegedly, 28 September 2026)*

After the first acts, Nobody, allegedly sets up a collective of developers on MOR, gives it its rules in a founding agreement, and leaves. "I show that I can set up a collective, give it rules, and leave. They can change the rules if the agreement meets mine. I add people when they show proof of contribution to the project; once the collective meets a certain diversity and mass, I exit." It is the first live use of Law's collectives: a founding agreement with its key grammar, members joining by clone and rotation, and the founder leaving (Law rules 35 to 37, 45 to 46a).

**His rules do not outlive his membership (decided by Nobody, allegedly).** "The act of me leaving forces the rewrite of the rules." Leaving is a member change, so it takes a rotation and a clone of the founding agreement (Law rule 37): the remaining members write the rules at that moment. His founding agreement stays on record, so anyone can see whether a later clone still meets it. No change to the Law MIP.

*Open, to settle with Nobody, allegedly:*
- *What counts as proof of contribution, and what diversity and mass mean. Note (Claude): the protocol cannot count distinct people, since one person can hold many identities; diversity is the author's judgement, stated as such.*
- *What the collective holds. F85 names no steward after V1, so the collective has no power over the frozen core. Suggested (Claude): it maintains code and founding cMIPs and Modules, competing like anyone else.*

*People Nobody, allegedly has named as natural to ask segmented questions, each with their own angle: Semisol, JB (Damus), Kirian, UTXO, Fishcake (nostr.build), hazard (Blossom), the people behind nostr.wine, Rock (Stemstr). None has a role.*

## If a step exposes a flaw in a MIP

Stop, name it, resolve it with Nobody, allegedly, and record it in the findings log. Writing code is also a review.
