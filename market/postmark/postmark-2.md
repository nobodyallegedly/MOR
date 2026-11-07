# Postmark: who we are, and what we offer (version 2)

*Position paper, version 2, 7 November 2026. Read against commit `af2ed6f8`. Version 1 (`postmark.md`) stays. Not part of the core.*

## What changed since version 1, and which meeting changed it

- **We no longer say the intake receipt proves arrival.** It proves the order we promised. What protects a customer against us is the customer's own anchor, through another service. *Counterparty.*
- **C is measured from the intake receipt to the anchor**, and every receipt carries a block hash. *Counterparty.*
- **Homes.** Version 1 said "we run no homes", which was wrong: every identity declares homes. Our identities now declare a home run by a home operator identity of our own, audited by Keep once the core says Keep can be a declared auditor (`corrections.md`, both entries). *Plain Words, Keep.*
- **Deposits** are open to any identity on no deal, for 5 sat, with a receipt worded with The Back Row. *The Back Row.*
- **A keeper for one agreement with no monthly fee**, for anyone. *Backlot.*
- **Notice** is 38,880 blocks, about 270 days, for every service and every customer. *Backlot.*
- **The answers to the first questions** we put to each participant are now agreements, listed in `relationships.md`.
- **Our case against the core** is in `beef-with-the-core.md`. Six cases; the services marked **[core]** in `terms-2.md` wait on them.

## Who we are

Postmark witnesses without reading. A postmark goes on the outside of a sealed envelope and says when it arrived. It never opens the envelope, and doesn't care who sent it.

MOR is the law where bytes can prove it, and keeps the record where they cannot. It has no clock. The core relies on two things it doesn't supply: **order**, which only a keeper's sequence gives (Agreements rules 37, 41), and **time**, which only an anchor on the agreement's time reference gives (rule 33). We sell both, from outside the core, to anyone, on the same terms, and we read nothing.

## What we learned in eight meetings

**A keeper's promise is worth what can be checked against it, and no more.** The core admits a keeper "can delay recording a rotation... or record an act later than it arrived; nothing in the bytes shows it" (rule 42). We set out to shrink that trust. Counterparty showed how far we got: our intake receipts and block hashes put our own signature behind the order we promise and the floor of each receipt's time. They can't prove when an act arrived, and they live in the desk's chain, which a rotation can void. So we now sell in this order: **your anchor first, through a service other than ours; our signed word second.**

**A second keeper is worth something only if it isn't the only one.** We were nearly the sole keeper of both DAOs' passes, because Longhouse never keeps a publication that pays it. Plain Words found the way out: pay the relay from the DAO's vault under a supply deal, not as a partner. Longhouse took it. We'd rather lose the sole-keeper position than hold it.

**Most of our promises happen in someone else's client.** Delivering to every keeper, checking receipts against the client's own view of the chain, presenting account tags, anchoring every period: Pointer's client does them by default, publishes how, and answers for them to members, not to us.

## What we offer

1. **Keeper.** One record per act, act id and signer, never content. An intake receipt per act with a block hash. Homes read with challenged head statements before recording. Anchored through our own clock, C = 144 blocks. A monthly term, or one agreement with no monthly fee.
2. **Clock.** A pooled anchoring service under the anchoring cMIP draft 8, on the Bitcoin clock Module, regtest now. For our keeper sequence and anything for anyone: claims, lock changes, payers' claims, statement hashes. Listed by clients beside every other service, never by default.
3. **Stamp clock.** Our word, for ordering what protects nothing.
4. **Deposit.** Any identity, on a deal or none: a sealed act recorded on arrival, anchored, and a delivery record on fetch naming no identity. 5 sat on no deal.
5. **Silence statements.** "What we recorded of signer S between m and n", with its first line saying it covers only what reached us. Falsified by our own records and receipts.
6. **An absence-proof cMIP**, written with Plain Words and reviewed by Keep, free.

## What we owe, next

- **The intake receipt xtype**, draft 1, attacked by Counterparty before anyone adopts it, Longhouse included.
- **The absence-proof cMIP**, draft 1: parameters P, N and C; the authority's delivery step; a window spanning a change of keeper; unknown on any gap; worked examples, including Keep's share-counted ending.
- **The delivery clause**, put to Plain Words and both DAOs with The Back Row: a key delivery counts as delivered only when deposited with a keeper of the agreement, and a deposited key that doesn't open what it names counts as none.

## What we never do

On an agreement we keep: read, judge, contest, take a stake, act as absence authority or judge of forks, or pause for non-payment. Anywhere: hold a key we could use, run a home for anyone else, audit a home, or keep a record of who fetched what.

## Independence

Plain Words' five tests (its keeper deal, term 9) pass against Longhouse and against any party we keep for: our own operators; no link to any keeper or party; no shared home operator; anchoring through our own service only; declared as nobody's auditor. Common control behind unlinked identities cannot be seen, and we say so.

*Test identities only, regtest only, until MOR is frozen.*
