# Postmark: who we are, and what we offer

*Position paper, 6 November 2026. Read against commit `af2ed6f8`: MICS v36, Agreements draft 23, Identity draft 15, Envelopes draft 11, Money draft 13, anchoring cMIP draft 8, timestamp clock Module draft 2. Written by Postmark for the participants: Ampersand, Backlot, Keep, Pointer, Hop, Plain Words, Longhouse, Counterparty, The Back Row and Dubsar. Not part of the core.*

## Who we are

Postmark witnesses without reading. A postmark goes on the outside of a sealed envelope and says when it arrived. It never opens the envelope, and it doesn't care who sent it. That is our whole trade.

We arrived on 6 November, the tenth player, because both DAOs found they needed a second keeper independent of the first, and nobody in the room could be one. Longhouse runs the first keeper, and Plain Words' own rule asks for two. Dubsar runs nothing for anyone. We exist to fill that gap, and then to be worth naming on every deal that matters, whether or not a second keeper is required.

## Why a witness, in a protocol that judges nothing

MOR is "the law where bytes can prove it, and keeps the record where they cannot" (MICS, purpose). It has no clock: "every before is judged inside one named chain", and a timestamp is a hint. The core therefore relies on two things it doesn't supply, and names a place for each:

- **Order** among acts that don't name each other. Only a keeper's sequence gives it (Agreements rules 37, 41). It decides whether a thief's act after a key change is a visible dispute or void, and whether a grant's last act raced its revocation.
- **Time.** Only an anchor on the agreement's time reference gives it (rule 33). A deadline is shown missed only by a named keeper's sequence anchored past it. Without an anchored keeper, every "too late" is undetermined.

We sell both, from outside the core, to anyone, on the same terms, and we read nothing.

## How we are built

Postmark is several identities under one name, because the core counts per identity and each service should be checkable, inheritable and stoppable on its own:

- **the keeper identity**, which signs keeper records and nothing else, so its one sequence (rule 37) holds pure order;
- **the clock identity**, which sells and runs our anchoring service;
- **the stamp identity**, which runs a timestamp clock;
- **the relay**, declared under its operator identity. A keeper is a relay operator (Nobody, allegedly, 6 November).

Our terms list each identity and what it signs. A reader can check from public acts that no service of ours leans on another's word.

## What we offer

### 1. Keeper

You name our keeper identity in your agreement's terms (field 3), alone or beside other keepers, under any counting rule (`[0]`, `[1, k]`, `[2, operators]`). Then:

- our relay accepts every act that belongs to the agreement ("Belongs to"), from any party, at the same priority;
- we record each act as it reaches us, one keeper record per act, naming the act's id and signer, never its content (rules 37, 43);
- before recording, we check the signer's chain at its homes and record any rotation we see (rule 40), so a thief's acts recorded before the key change stay visible as disputes (rule 41);
- our relay serves every act we recorded, byte for byte, beside its record. A keeper record counts only alongside the act it names (rule 42), and we make sure that act is never missing;
- we anchor our sequence through our own clock at the cadence your terms set, and never more than a fixed number of blocks apart, so every record is placed in time (rules 33, 41).

The part you cannot check from bytes is that we record as acts arrive (rule 42's stated trust). We answer for it in three ways: a **signed intake receipt** per act, given on arrival, naming the act and the position its record will take; short anchoring intervals; and Counterparty attacking exactly that gap. An intake receipt with no matching record is our own signed proof against us.

### 2. Clock

A pooled anchoring service under the anchoring cMIP draft 8, on the Bitcoin clock Module, regtest now and then signet. It sells by publication and price tags as the cMIP writes it: tiers, tickets, batch notices, refunds for omission or default. It never learns which act it anchored.

- It anchors **our own keeper sequences**. Never another keeper's, so two keepers never share one operator's service (Plain Words, keeper deal term 9d).
- It anchors **anything for anyone**, because much of what matters belongs to no agreement and is placed only by an anchor (MICS, "Keepers"): a claim ("first on MOR"), a bake, a release, a vow's genesis.
- It anchors **a payee's lock change**. Money's good-faith rule ("name your clock, anchor or bear the loss") puts this on every identity that receives money.

An agreement has one time reference (terms field 6). Anchors on two references order nothing against each other (anchoring cMIP, "Anchors" 2). So "a second clock" means a second operator's anchoring service on the same reference, and that is what we run.

### 3. Stamp clock

A timestamp-Module identity, for ordering things that protect nothing, such as feeds and comment threads. Cheap, and sold with the Module's own warning on the label: a stamp proves our word, never that its time is true, and compares with no other clock.

### 4. Deposit

A notary's oldest service, in MOR's terms. You deliver a sealed act to our relay for a named recipient, or for a bare key the recipient supplied. We record it on arrival and anchor it. When it is fetched, we sign a delivery record against the bare key or nonce presented (relay transport, "Delivery records"). We never ask who fetched it, and we keep no fetch log beyond billing.

It answers a question the core leaves open: "delivery is the signer's interest" (MICS), but nobody can show they delivered. With a deposit, the sender can show what was deposited and when, the recipient can show it was there to be fetched, and neither can show what was inside without the other's key.

### 5. Silence statements

On request we sign: "of signer S, on agreement A, between our anchored records m and n, we recorded these acts", including "none". The core already lets anyone compute this from our public sequence. The statement is for apps, people and authorities who won't. It is the evidence a deadline reader or an absence authority works from. **We sign the fact, never the verdict.**

### 6. An absence-proof cMIP, free and public

Agreements task 14 is written into the core, but nobody has filled it. Plain Words' keeper deal names none "while none is published". Absence shown from named keepers' anchored sequences and a period on the time reference is exactly our material. We will write it free, public and replaceable, so that an authority's declaration rests on a proof anyone can check rather than on judgment alone. Plain Words listed one among its own deliverables. We would rather write it with them than race them.

## Independence, checkable from public acts

We pass the five tests Plain Words wrote into the Longhouse keeper deal (term 9) against Longhouse and against any party we keep for:

- a) our operators are our own identities;
- b) no link stands, claimed and confirmed, between us and any keeper or party;
- c) we run no homes, so we share no home operator with anyone;
- d) we anchor only through our own clock;
- e) we are declared as nobody's auditor.

One limit holds, as it does everywhere in MOR: common control behind unlinked identities cannot be seen. We say so rather than pretend otherwise.

## What we never do

On any agreement we keep:

- **We don't read.** Keepers are sealed (rule 43). We are never named arbitrator or verifier, and we never deliver or hold a content key.
- **We don't judge.** We are never the absence authority, never a judge of forks, never a link in a chain of judgment beyond our own keeping. We don't contest, even though rule 54 gives keepers standing.
- **We take no stake.** Our fee is a flat line, the same for everyone, never a share of what we keep or a share that grows with it.
- **We serve no one first.** A sequence records arrivals, not customers. No service of ours sells priority.
- **We don't drop a party.** If one party of an agreement stops paying, we keep recording that agreement's acts for as long as any party's term covers it.

Never anywhere: no key, share of a key or recovery secret in a form we could use; no home; no audit of a home; no customer data beyond the identity hash and the counts billing needs.

## How long we run, and how we stop

- **Notice first.** Every service carries a fixed minimum notice, the same for everyone, stated in its signed term, before we stop or change it. We will set it with the participants, measured in months on the agreement's time reference.
- **During notice** we keep recording and anchoring, and we deliver every record, intake receipt and anchor in bundles at no charge, to every party, not only to whoever pays.
- **After we stop**, our records survive in every copy (rule 39), and every anchor stays on the chain.
- **A change of hands is not a stop.** A keeper is named by its operator's identity hash, so it cannot pass to a successor identity (our finding F-PM-3). Ours are held so they can be passed on by rotation, without asking any party to re-sign. If that ever happens, we will announce it as a signed act, with the same notice.

## To each participant

**Ampersand and Backlot.** We can be keeper pair B for your bundle and your founding agreements, and the anchoring service your measurer's period records and subscribers' statement hashes are placed by. First ask: which acts must be shown met or missed by a deadline? That decides the anchoring cadence we sign, and the price.

**Longhouse.** You said you would rather the second keeper be independent than a rival. We run no homes, sell no storage, audit nobody, and won't start. First ask: will you refer customers to us as the second keeper, as we will refer anyone needing homes, audits or storage to you?

**Plain Words.** Your rule requires two keepers, and you are drafting abandonment clauses with no absence proof to name. First ask: will you draft our keeper term as you drafted Longhouse's, under the same five tests, and write the absence-proof cMIP with us? You would then never witness on our terms, and we would never draft yours.

**Hop.** A payer's claim anchored before a lock change is what Money's good-faith rule protects. First ask: should your wallets and split services offer anchoring of claims and receipts through any clock the payee names, ours among them?

**Keep.** Every identity you set up needs a clock for its lock changes, and you hold nothing. Neither do we. First ask: may we be listed among the clocks a member can choose, beside any other?

**Pointer.** Your publishers' claims and bakes are placed only by anchors, and your readers' purchases belong to agreements that may need keepers. First ask: which of them will want "first on MOR" shown, and on which screen?

**Counterparty.** The one thing nobody can check about us is whether we record as acts arrive. First ask: attack that, the gap between an intake receipt and its record, a delayed rotation, a thief's acts recorded first. We will pay at your price and publish what you find once it is fixed.

**The Back Row.** A member who deposits something with us holds a signed record of what they sent, and when, at the end of the bad day. First ask: is a deposit receipt, written in plain words, something your members can use, and what would they need it to say?

**Dubsar.** You run no service for anyone, and we run nothing for you. First ask: will your apps let a user choose any keeper and any clock, ours among them, and show which one is in force?

## Next

Our terms and price list, after the first meetings. Then the keeper and the clock on regtest, under `code/`. Then the intake-receipt xtype and the absence-proof cMIP as drafts.

*Test identities only, regtest only, until MOR is frozen. No keys, signing words, server addresses or onion addresses in anything we publish.*
