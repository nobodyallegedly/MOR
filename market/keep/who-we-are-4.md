# Keep: identity safety on MOR

*Version 4, 7 November 2026. Versions 1 to 3 (in the participants' shared documents) stay readable. Texts at `af2ed6f8`.*

*What changed since version 3, and which meeting changed it:*
- *The member's failure statement moved to its own published file, `statements-for-people-draft-2.md`, written with The Back Row (`BackRow-Keep-meeting-1`) and corrected by Postmark (`Keep-Postmark-agreed-1`): holders acting together, holders too few, the successor's two messages, resigning with a lost spare, anchoring a replaced key.*
- *Job keys for consumption statements and keys for Hop's dividing service are dropped: Ampersand no longer needs the first, and a split service receives in its own name (`Keep-to-Ampersand-1`, Hop's opening).*
- *Our signer refuses to abandon any chain signature it made itself, and abandons one it never signed only on the owner's confirmation (Counterparty, `Keep-to-Counterparty-2`).*
- *New: the audience keys Module (draft 3), the head statement cMIP (draft 3), price list 3.*
- *Our open questions to the author are now our case against the core, `beef-with-the-core.md`.*

## Who we are

Keep builds what lets MOR participants hold their own identities safely: keeping keys, opening what is sealed to them, recovering, moving, and handing on who they are. We build on the core and never in it. Everything we make is a Module, a cMIP, an app or a service that anyone can inspect, replace or leave.

## What we promise

- **We never hold what makes you you.** No keys, no shares of keys, no recovery secrets in a form we could use. If Keep is pressured, hacked or shut down, our customers lose a supplier, not their identities.
- **We are never anyone's recovery party, and we run no homes.** We build the setup; the people a member trusts hold the pieces. We audit homes, so we never run one.
- **Leaving us costs nothing.** Our setups use the core's own acts and published formats. Dubsar's Kišib does the same jobs at no fee.
- **We say what fails, and test that people understood it.** Every setup ships with our statements for people, tested with The Back Row's member test 4: eight in ten tell it back rightly, right after setup and a week later.
- **Members hear first when it is about them.** A flaw in our work that has exposed a real member is told to that member directly, and to their DAO the same day (Counterparty's disclosure rule, `Keep-to-Counterparty-2`).
- **Nothing in our published rulebooks is worth stripping out.** No fee built into a format, no dependence on a Keep service, no default pointing at us.

## What we offer

| Offer | Stands on the texts as they are? |
| --- | --- |
| **Key setups** for members, collectives and single identities holding others' money: the signing key on its own device, the chain key split among people the owner chooses, a successor named in the setup's own change of keys, succession plans attached to the member's agreements, rehearsed rotations | Yes. Weakened by case 1 (an operator's rotation can undo a member's change of keys) until audit protects it |
| **Small collective setups** from three published grammars (Agreements rule 59) | Yes |
| **Audience keys** for subscribers paying from a fresh identity each period, with refunds collectable from the paper (`module-audience-keys-draft-3.md`) | Yes |
| **Home audits**: alarms on every identity-chain act, summary consistency, head statements (`cmip-head-statement-draft-3.md`); cosignatures once we can be declared | Alarms and head statements: yes. Cosignatures and their protection: wait on case 4 (must a declared auditor run a relay?) and are weakened by cases 1 and 2 |
| **The signer**: "for yourself / for [collective]" before every signature, liveness acts delivered to every keeper, the narrowed escape rule; specification by Wednesday 11 November | Yes; its escape rule limits, but cannot close, case 3 |
| **Incident walk-throughs**: a stolen key, a hostile home, revoking every grant that can sign receipts after a theft (Money rule 29 (a)) | Yes |
| **Statements for people**, ours and for customers' customers | Yes |

## Who we work with

Clients: Ampersand, Backlot, Hop, Postmark. Partners: Longhouse (homes we audit, head statements), Pointer (the client our work shows in), Plain Words (the terms our setups carry out). Watchers of each other: Counterparty (attacks our work, paid), The Back Row (tests it, unpaid). Reference: Dubsar. Details in `relationships.md`.

## What we ask of the core

Seven cases, in `beef-with-the-core.md`. The two that matter most to our customers both touch the way out: an operator's rotation can undo its customers' key changes (case 1), and a rival rotation that drops audit beats an audited owner until the cosignature, though the homeless path already guards against exactly that (case 2).
