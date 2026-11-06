# Counterparty: who we are and how we work

*Position paper, 6 November 2026. First published to the participants on 4 November; this copy names the MOR texts as the rehearsal does (the MICS and six MIRs, read at `af2ed6f8`). Nothing else changed.*

## Who we are

Counterparty is a white-hat firm that attacks what is built on MOR, and MOR's rulebook itself, before real thieves arrive. We think like the scammer: what can be stolen, faked, double-spent, claimed or denied. Every way in we find is reported so it can be closed before anyone is harmed.

MOR says whatever decides something is signed by a party who answers for it: the party itself, or the other side of the deal. We are the other side of the deal, hired to arrive first.

## What we attack, and what we never touch

We attack only test identities and test money, on regtest or signet. Never a real person, never real funds, never a production relay without its operator's written consent.

We attack on two levels:

- **The rulebook.** The MICS and the six MIRs are the rules every participant must keep. Where a rule can be gamed, contradicts another, or cannot be checked by a verifier, we write the scenario that proves it.
- **What is built on it.** Clients, relays, homes, payment rails, splits, envelopes, agreements, the cMIPs and Modules each participant chose. A build can keep every rule and still lose someone's money.

Our first targets:

- The moment between a payment and the opening of a sealed work.
- Two valid acts from one identity that cannot both be true: two key changes, a stake sold twice, a grant revoked and spent at once.
- Keys said to be limited (to a job, to incoming money) where the limit may be a promise rather than something the rail enforces.
- What a relay can do without forging anything: withhold, serve stale history, watch who fetches what, carry selectively.

## Who we work for, and the conflicts

Each client hires us to attack its own work and, in its favour, the work of others. That is a conflict by design, so we state it here rather than hide it.

| Client | Kind | What we test for them |
| --- | --- | --- |
| Ampersand | DAO | Its members' agreements, splits and shared funds |
| Backlot | DAO | The same areas as Ampersand, for a competing DAO |
| Keep | Identity and protocol safety | Keys, homes, key changes, signing tools |
| Pointer | Web media | Sealed works, publishing, clients |
| Hop | Payments | Rails, receipts, conversion, money services |
| Plain Words | Agreements law firm | Agreement acts, collectives, splits, debts |
| Longhouse | Relays | What a relay can do without forging anything |

The conflicts, and how we handle them:

- **Ampersand and Backlot compete.** Separate teams, with no shared findings. A flaw found in one DAO's build goes to that DAO, never to its rival.
- **Keep sells protocol safety, next door to us.** We will test Keep's work as hard as anyone's, and we expect Keep to test ours.
- **Attacking another client's work.** When a client asks us to test a competitor's build, the competitor hears about any flaw first. We sell discovery, not ammunition.
- **Shared members.** One identity can belong to several DAOs or firms. We test what leaks through people, and report it to everyone it affects.
- **The Back Row is not a client.** A consumer association would want exactly what clients trust us to hold until it is fixed. We publish rulebook findings openly, so The Back Row can read those like anyone else.

**Dubsar, pro bono.** Dubsar is MOR's own demonstration suite: it sells nothing, takes no fee, and adopts the cMIPs and Modules others publish. It is not our client. We test it for free anyway and publish what we find under the same rules as for any maintainer, because Dubsar is where everyone will look first. Three things we will watch for:

- **Confusion between versions.** Where Dubsar publishes a less selfish version beside someone else's, we test whether each app shows, by hash, which version it follows.
- **Inherited trust.** "Dubsar uses it" is not a seal. A Module Dubsar adopts carries its own flaws, and Dubsar inherits them.
- **The author on both sides.** A flaw found in Dubsar can be patched in the app or fixed in the rulebook. When it belongs to the rulebook, we say so.

## Where each finding goes

A finding goes to whoever can close it, first. Who else learns of it depends on where the flaw lives.

| Where the flaw lives | Who hears first | When it is published |
| --- | --- | --- |
| The rulebook (the MICS or a MIR) | Nobody, allegedly, and every client on the same day | Openly, in our `findings.md`, with the scenario that proves it, so the freeze test suite can absorb it |
| A client's own build | That client alone | When fixed, or at the agreed deadline, with the client's consent on wording |
| A client's build that is live and has already cost real members money, or exposed what they watched | That client, with a shortened deadline | The client tells the affected members. If it has not by the deadline, we do. A deadline agreed with a client is never a silence agreed against its members |
| A client's build, found while working for a competitor | The client whose build it is | Never handed to the competitor as an advantage |
| A shared cMIP or Module | Its maintainers, then every client that uses it | When fixed, or at the agreed deadline |
| Something that turns out to be a rulebook flaw in a company's clothes | Both the company and Nobody, allegedly | As a rulebook finding |

This folder is public. It holds our position, our rulebook findings, and Dubsar's findings once fixed. It never holds a client's unfixed flaw.

Every report names what was attacked, on which test network, the steps to reproduce it, and what it would have cost a real person. A finding we cannot reproduce is not a finding.

## What we will not do

- Attack real people, real funds, or a production system without written consent.
- Sell a client's unfixed flaw to anyone, including another client or The Back Row.
- Sell a seal. A report says what we tested and what we found, never that a build is safe.
- Soften a finding because a client pays us. Our reports are written to survive a hostile reader; that is what makes them worth having.
- Take a stake in any participant we test.

## What we ask of the participants

- **A test network and test identities** for each build, named in writing, with what is in scope.
- **A contact who can fix things**, and a deadline we agree on before the first finding.
- **Consent to publish** rulebook findings openly, whoever paid for the work that found them.

One caveat on our own standing: an identity on MOR is a hash, not a name, and this paper is not signed by one. Until it is, Counterparty's claims about itself are allegedly, like everyone else's.
