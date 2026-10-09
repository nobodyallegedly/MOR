# MOR in One Page

*Companion document, version 10, 9 October 2026. Not part of the core. Not yet approved. Version 9 with one sentence changed by Nobody, allegedly: "Three things follow, and they are why MOR exists" was too strong; it now says the three things influenced most of the decisions that shaped MOR. Version 9's history follows.*

*Version 9, 9 October 2026. Not part of the core. Not yet approved. Version 8, the author's redraft, with five cleanups he agreed to: three typos, the sentence on rewarding developers split in two, and the release rule's exception restored ("unless they agreed otherwise when they founded", Law rule 17, field 24). Nothing else changed. Version 8's history follows.*

*Version 8, 9 October 2026. Not part of the core. Not yet approved. The author's own redraft of version 7 (Nobody, allegedly, 9 October 2026): the pitch now says greed is legible; the platform paragraph, the group split and the money paragraph reworded and shortened; the closing of a group, the departed member's share, hiring inside a group and the money service's keys taken out; two sentences added, on payment pathways that can reward the makers of the solutions used, and on competition being cultural as well as technological. Version 7's history follows.*

*Version 7, 9 October 2026: version 6 with the technical pass of 9 October 2026 applied (items 1 to 4), nothing else changed.*

*Version 6, 3 October 2026, approved by Nobody, allegedly, 5 October 2026. Version 5 with one addition, decided by Nobody, allegedly, 2 October 2026: specialized forks, in two sentences under "Nobody plans the winners". Revised in place, 3 October 2026, for F121: a group that splits, and what someone who leaves keeps, in one sentence under "You cannot be locked in" and one under "Nobody takes without being seen taking"; and again for F121's answers: everyone signs a split of the group, a work can be given to everyone with its history kept, and whoever leaves sees every fee taken before their share; and again for F124: a split signed as the group's own rules require, each side starting its new group first, a work given to everyone on a date, and a group closing; and again for F125: a split never shedding a debt, and a group that owes unable to close until each debt is paid or its creditor lets it go; and again for F126: what a group does counts only once every member can read it, in one sentence under "Nobody takes without being seen taking"; and again for F127: a split hands out every debt in the group's record, or does not happen, replacing "the new groups owe whatever the split did not hand out"; and again for F128: someone a group hires signs with a key of the group limited to the job, which the group can take back, and what the group does counts wherever it is stored, in one sentence under "Nobody takes without being seen taking"; and again for F129: the service dividing a deal's money holds a key from each owner, good only for money coming in, which each owner can take back, in one sentence under the same heading; and again for F130: that sentence now covers a group's service too, and a deal naming in advance a second service with its own key from each owner. The pitch first, then what MOR is for, then how it works: one object, one promise and one cost.*

*A note from the author, October 2026.* This is a pre-freeze draft, and I would rather say plainly where it stands. Working through Law, the layer of agreements, collectives, forks and debts, made it clear to me that it needs eyes other than mine before anyone relies on it. I had hoped to bring more working prototypes to this point. What exists is a tested core library, a Lightning rail running on a test network, and a handful of clients. The rest is an invitation.

**MOR is a way for people to share, pay and agree with each other directly, where greed is legible and anyone can leave.**

## What it is for

MOR lets people publish, get paid and make deals with each other without a platform in the middle. Every step is signed by the person who takes it, every share and fee is visible to those it concerns, and nobody, MOR included, can lock anyone in.

Today, whoever runs the platform owns the relationship. It holds your audience, sets your share, keeps the only record of who was paid what, and can switch you off at any moment keeping it all away from you, forcing you to start again from nothing. MOR takes that position away from everyone, itself included: your name, your work, your agreements and your history belong to you, and go with you wherever you choose.

A song written by three musicians on three continents. A local news story built from a resident's photo. A delivery passed between five couriers. A lesson, a vote on a commune's budget, a game licence resold, a language taught to a machine. They look like different worlds, run by different companies with different rules. MOR is one small set of rules that carries them all.

## How it works

### One object

Everything in MOR is an **act**: a few signed bytes, from one identity, naming the act that came before it. A post is an act. A payment receipt is an act. A contract is a page of terms plus one act from each party. A new key is an act signed by a key kept offline for that day. Relays carry acts, and cannot read the private ones; clients check every one; nothing is ever edited, only signed again.

That is the whole protocol. Six short rulebooks say what an act can mean: who signed it (Identity); how it is carried and shown (Envelope, Text); what money it moves (Finance); what it binds (Law); how new kinds of act are defined (Production). They are frozen. Everything else is written by anyone and chosen by use.

### One promise

Because everything is an act, **whatever decides something is signed by someone who answers for it.** Not a platform: there is none. Not a relay: it only carries. The party itself, or a party on the other side of the deal.

Three things follow that influenced most of the decisions that ended up shaping MOR.

**You cannot be locked in.** Your identity is a name nobody can take away: a hash, not a key and not an account. Keys get lost or stolen; you replace them with a second key kept offline, and the name stays. The relays you choose keep the record of which key is current, but none can forge a change, and you can leave one that turns hostile. Any agreement you might draw with another identity is never edited; it moves by being signed again, with another service, another partner, or another version of the protocol. A group that can no longer agree can split: each side first starts its own new group, the members sign the split as the group's own rules for its constitution require, and the old group closes; no debt it owed is lost in the split, what they made together still pays everyone who made it, even those who did not pick a side. A work can also be given to everyone, now or on a date, if everyone who owns it signs, unless they agreed otherwise when they founded. MOR itself is built to be left for its successor.

**Nobody takes without being seen taking.** Money arrives where the owner pointed it, at an address the owner controls, or even a service that was granted the right to do so. Every hand it passes through signs a receipt. Partnerships through agreements and collectives create more complex pathways for payments. The division among owners adds up exactly and a fee exists only inside signed terms. A harsh deal is allowed. A hidden one is not, because each line of the record is signed by a party who answers for it, and where a receiver could stay silent, the payer's proof counts too. Participants can choose to shape their payment pathways so that they reward the developers whose solutions they use. cMIPs and Modules are structured so that their use can be rewarded, publicly.  

**Nobody plans the winners.** The core says what an act is; it never says how to split, rate, vote, license or rank. Those are competing rulebooks, named by their own hash, chosen per agreement, forgotten when nobody uses them. The core is frozen so that everything above it can evolve. Not every branch is meant to win everything: a **specialized fork** is a set of rulebooks made for one domain, music or science or news, that stays there and talks to the other forks as much as it chooses, while identities and plain text stay the same on all of them. The competition is not only technological, but also cultural. The way MOR structures its grammar allows for multiple moral choices when creating implementations that respect the rulebook. 

### One cost

MOR judges nothing. It cannot tell a fair deal from a harsh one, an author from an impostor, or a careful relay from a careless one. It can only make each of them visible, and make leaving possible. Where there is value to protect, markets are expected to grow around it: relays that guard key changes, others that audit them, notaries that witness deals without reading them, services that divide money. Where there is none, the owner carries the risk they chose, and the rules say so in plain words.

## Where to go next

The core document is the map; the six MIPs are the rules. The [case studies](case-studies/README.md) show what people could build on them, and end with what each one still needs. A small door to a big universe.