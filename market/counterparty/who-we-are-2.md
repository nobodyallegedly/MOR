# Counterparty: who we are and how we work

*Position paper, version 2, 7 November 2026. Version 1 (`who-we-are.md`) stays readable.*

*What changed since version 1, and why:*
- *Our clients are now ten engagements, not seven: Postmark joined the market and hired us (Counterparty and Postmark, agreed, 7 November), and The Back Row is named as a watcher, not a client. The table below gives each engagement and where it was agreed.*
- *A same-day rule for relying DAOs, agreed in turn with Keep, Hop, Longhouse, Pointer and Postmark (their meetings, 6 and 7 November): where a DAO's members already rely on a flaw we find in a supplier's build, that DAO hears the same day the supplier does. It is now our default for every supplier.*
- *Two builds, two prices; one piece of work, one price (Postmark and Longhouse, 7 November; price list 3).*
- *Co-signing: a player a core finding falls on may sign an act beside it (Longhouse for C4 and C5, Hop with us for H7 and C15).*
- *Our pay never depends on what we find or what a client earns (price list 2, term 8, after Backlot's offer of a bounty by severity).*
- *What in this paper waits on the core is marked "waits on the core", with the case in `beef-with-the-core.md`.*

## Who we are

Counterparty is a white-hat firm that attacks what is built on MOR, and MOR's rulebook itself, before real thieves arrive. We think like the scammer: what can be stolen, faked, double-spent, claimed or denied. Every way in we find is reported so it can be closed before anyone is harmed.

MOR says whatever decides something is signed by a party who answers for it: the party itself, or the other side of the deal. We are the other side of the deal, hired to arrive first.

## What we attack, and what we never touch

We attack only test identities and test money, on regtest or signet. Never a real person, never real funds, never a production relay without its operator's written consent.

- **The rulebook.** The MICS and the six MIRs. Where a rule can be gamed, contradicts another, or cannot be checked, we write the scenario that proves it, and run it against the reference verifier where we can (`code/whitehat_probes.rs`).
- **What is built on it.** Clients, relays, homes, keepers, payment rails, splits, measurers, envelopes, agreements, and the cMIPs and Modules each participant chose. A build can keep every rule and still lose someone's money.

## Who we work for, and the conflicts

| Client | Kind | Engagement | Where agreed |
| --- | --- | --- | --- |
| Ampersand | DAO | Eight targets: the measurer, the loop, the sock puppet, one use in two passes, linking, the stake, the founding ceremony, the vault | `Ampersand-Counterparty-agreed-1` |
| Backlot | DAO | The vault grant, the measurer, what a claim reveals; four more as their drafts land; standing order from its founding terms | Meeting of 6 November, record held by Nobody, allegedly |
| Keep | Identity and protocol safety | Head statements (shared with Longhouse), audience keys (shared with Pointer), the ceremony procedure (shared with Ampersand), the signer's refusals | Keep's letters of 6 November (`Keep-to-Counterparty-1`, `-2`) |
| Pointer | Web media | The client-role cMIP, audience keys on its restore, the reader client's defaults; standing order from its first build touching money | `Pointer-Counterparty-agreed-1` |
| Hop | Payments | The measure Module (shared with Ampersand), the split cMIP | `Hop-Counterparty-meeting-1` |
| Plain Words | Agreements law firm | One attack on each DAO's founding terms, inside Plain Words' own fee | Meeting of 6 November, record held by Nobody, allegedly |
| Longhouse | Relays and homes | Homes and the auditing relay live, its keeper with intake receipts, its no-pay keeper rule, the relay's part of linking; standing order from terms-2 | `Longhouse-Counterparty-agreed-1` |
| Postmark | Notary: keeper and clock | Its keeper live, the intake receipt xtype, tags, deposits and silence statements, the absence-proof cMIP; standing order from terms-2 | `Counterparty-Postmark-agreed-1` |

**Watchers, not clients.** The Back Row reads our findings for the line that shows who we serve, and has said it will publish one if it finds it (`BackRow-Counterparty-meeting-1`). Dubsar is tested pro bono; nothing is agreed yet.

The conflicts, and how we handle them:

- **Ampersand and Backlot compete.** Separate teams, no shared findings, except on the rulebooks they share by their joint statement, where findings go to both on the same day.
- **Keep sells protocol safety next door to us.** We test Keep as hard as anyone, and it tests us.
- **Attacking another client's work.** The client whose build it is hears first. We sell discovery, not ammunition.
- **Shared members.** One identity can belong to rival DAOs. We test what leaks through people and report it to everyone it affects.
- **Postmark lists our attack among its answers on trust.** It may say "attacked by Counterparty, findings published", never "checked" or "verified".

## Where each finding goes

| Where the flaw lives | Who hears first | When it is published |
| --- | --- | --- |
| The rulebook (the MICS or a MIR) | Nobody, allegedly, and every client, on the same day | Openly, in `findings.md`, with the scenario that proves it |
| A client's own build | That client; **and the same day, any DAO whose members already rely on the flaw** | When fixed, or at the agreed deadline, with the client's consent on wording only |
| A client's build that is live and has already cost real members money, or exposed what they watched | That client, with a shortened deadline | The client tells the affected members. If it has not by the deadline, we do |
| A client's build, found while working for a competitor | The client whose build it is | Never handed to the competitor as an advantage |
| A shared cMIP or Module | Its maintainer, then every client that uses it, the same day where the maintainer agrees | When fixed, or at the agreed deadline |
| A rulebook flaw in a company's clothes | Both the company and Nobody, allegedly | As a rulebook finding; the company may co-sign it |

Every report names what was attacked, on which test network, the steps to reproduce it, and what it would have cost a real person. A finding we cannot reproduce is not a finding. This folder holds our position, our core findings and our probes; it never holds a client's unfixed flaw.

## What we will not do

- Attack real people, real funds, or a production system without written consent.
- Sell a client's unfixed flaw to anyone, another client or The Back Row included.
- Sell a seal. A report says what we tested and what we found, never that a build is safe.
- Be paid by severity, by finding, or by a share of a client's income.
- Soften a finding because a client pays us.
- Take a stake in any participant we test, or hold a role in what we test: we declined Ampersand's named-verifier seat for that reason.

## What waits on the core

Nothing in our business waits on a change. Several of our clients' products do: the pools on C1, C12, C14 and C15; Longhouse's homes on C4 and C5; every collective with outside holders on C3; every buyer of a stake on C2. Our cases are in `beef-with-the-core.md`. Whatever the answers, we attack what our clients build on the texts as they stand.

One caveat on our own standing: an identity on MOR is a hash, not a name, and this paper is not signed by one. Until it is, Counterparty's claims about itself are allegedly, like everyone else's.
