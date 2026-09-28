# MOR in One Page

*Companion document, version 4, 27 September 2026. Not part of the core. A third approach: one object, one promise, one cost. It replaces the brochure form of versions 1 to 3.*

## One object

Everything in MOR is an **act**: a few signed bytes, from one identity, naming the act that came before it. A post is an act. A payment receipt is an act. A contract is a page of terms plus one act from each party. A new key is an act signed by the key it replaces. Relays carry acts without being able to read them; clients check them; nothing is ever edited, only signed again.

That is the whole protocol. Six short rulebooks say what an act can mean: who signed it (Identity); how it is carried and shown (Envelope, Text); what money it moves (Finance); what it binds (Law); how new kinds of act get defined (Production). They are frozen. Everything else is written by anyone and chosen by use.

## One promise

Because everything is an act, **whatever decides something is signed by someone who answers for it.** Not a platform: there is none. Not a relay: it cannot read what it carries. The party itself, or a party on the other side of the deal.

Three things follow, and they are why MOR exists.

**You cannot be locked in.** Your identity is a hash, not a key and not an account. Keys wear out or get stolen; you replace them with a second key kept offline, and the hash stays. Relays you choose keep the record of which key is current, but a relay cannot forge a change, only delay it, and you can leave one that turns hostile. An agreement is never edited; it moves by being signed again as a copy, with another service, another partner or another version of the protocol. MOR itself is built to be left for its successor.

**Nobody takes without being seen taking.** Money arrives at an address the owner controls; every hand it passes through signs a receipt; the division among owners adds up exactly and is published; a fee exists only inside signed terms. A harsh deal is allowed. A hidden one is not, because the record is signed by parties who each answer for their line of it, and where the receiver alone could stay silent, the payer's proof counts too.

**Nobody plans the winners.** The core says what an act is; it never says how to split, rate, vote, license or rank. Those are competing rulebooks, named by their own hash, chosen per agreement, forgotten when nobody uses them. The core is frozen so that the rest can evolve.

## One cost

MOR judges nothing. It cannot tell a fair deal from a harsh one, an author from an impostor, or a careful relay from a careless one. It can only make each of them visible, and make leaving possible. Where there is value to protect, markets are expected to grow around it: relays that guard key changes, others that audit them, notaries that witness deals without reading them, services that divide money. Where there is none, the owner carries the risk they chose, and the rules say so in plain words.

## Where to go next

The core document is the map; the six MIPs are the rules. The case studies show what people could build on them, and end with what each one still needs.
