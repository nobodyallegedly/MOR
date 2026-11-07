# Pointer's client: what it does, draft 1

*7 November 2026. Pointer, web media. Written before any code, so the code can be held to it. MOR read at the rehearsal commit `af2ed6f8`. Every default below was agreed with a named player; the source is given in brackets. Nothing is updated: a change is a new draft. Not part of the core.*

*"Client" here means Pointer's reader client, its payment screen and its publisher desk together. Where a default is client conformance in the core, it is marked so; the rest are Pointer's own.*

## 1. Reading and verifying

1. Every act is judged by MOR's reference verifier, never by Pointer's own code. The verdict is shown as the verifier gives it: valid, invalid, void, disputed, pending or unknown. Unknown is never shown as valid.
2. An identity's chain is fetched from **every home it declares**, and judged from receipts, never from which home answered (relay transport cMIP draft 7, Clients 2). A home that lags is shown as lagging. *(Longhouse.)*
3. Each home is asked for a **head statement** with a fresh challenge (Keep's head statement cMIP draft 3). A statement proven false is shown with its proof, against its operator; a stale one as stale; no answer as not answering. A statement never decides which rotation counts: Identity does. *(Keep, Longhouse.)*
4. The client holds the **default control cMIP draft 6, by its hash**, and says so (core conformance, Agreements rule 98; our finding P7).
5. Where a rule computes a cut, the client names the specification by title, creator and **at least 16 characters of its hash**, the full hash one tap away. Two specifications sharing a title raise a plain warning. *(Counterparty.)*

## 2. Choosing nothing for the user

6. **No default operator, anywhere**: homes, keepers, clocks, anchoring services. Each is listed beside its competitors, with its published prices. Where only one exists, the client says so, and the user confirms it once. *(Longhouse, Postmark.)*
7. At genesis, the client proposes **two distinct home operators** and shows the home rule in plain words: "Your name survives either home disappearing." While only one operator exists: "Your name depends on one operator." *(Longhouse.)*

## 3. Before signing anything

8. The full plain text of the terms is the default view (core conformance, Text and Agreements rule 4). A **Plain Words summary** sits beside it, never in its place, shown as "Summary by Plain Words, who answers for it if it misleads" only where it is a text act signed by Plain Words naming these terms by act id; otherwise "not Plain Words' summary", or not shown; a summary naming an earlier version, as outdated. *(Plain Words.)*
9. Before a founding, "What one member can do alone", layer by layer, Money first (core conformance), taken verbatim from the signed summary, or from the template marked as the template's. *(Plain Words.)*
10. Before acting for a collective: **"For yourself" or "for [collective]"**, in words, defaulting to "for yourself". *(Backlot.)*

## 4. Before paying

11. The publication and its tag are checked as the **latest in their chains**, a MUST in our client (the core's strong SHOULD). If the latest can't be found, the client doesn't pay, and says why. *(Hop.)*
12. **Every cut shown in plain words**, in the pool's real timing (receipt now, split at the period's end, payouts after the record deadline), our own 1% line included. *(Both DAOs, Hop.)*
13. **Our line can be struck**: "Striking this line costs you nothing in access." Kept by default; a strike carries to every later period until changed; one quiet line per renewal; no reminder, no "are you sure". Where the pool says so, the struck share's destination is shown in the pool's words. *(Both DAOs, The Back Row.)*
14. Who sees what, in plain words: "The split service sees who bought"; "Anyone who holds part of this pool's stake, now or later, sees how every payment was split." *(Counterparty, The Back Row, Hop.)*
15. Every sentence another player wrote for this screen is shown **in its author's words, cited** to its source. The list is The Back Row's of 6 November. *(The Back Row.)*

## 5. Paying

16. **The buyer's claim** is written at payment and sealed **to the split service only**, delivered as the money messages cMIP draft 6 section 4.4 says, unless the buyer chooses more readers, shown before paying. Never public. Section 9's further readers are not taken. *(Counterparty; our finding P8, which depends on the core's answer.)*
17. **Our use record**: one per payment, fetched before the claim on that payment's own connection, naming only Pointer, the publication the payment's tag sells (under a pass, the pass) and a random value. No work, title, time or subscriber. *(Both DAOs, Hop, The Back Row.)*
18. A **fresh identity** by default for every period of a pass (Keep's audience keys Module draft 2), and for a single purchase where the payee's side is a collective or several holders: "The split service sees who bought. This purchase uses a name nobody can link to you." One tap away for a lone seller. *(Hop, The Back Row, Keep.)*
19. After a work bought under a fresh identity opens, its key is **delivered again to the member's main identity**, signed by the main identity, sealed to itself, on the member's own homes, later and over the routing layer, never in the purchase's session. Purchases only, never a pass. "If you lose this name, you lose its refund and its right to contest. The work stays yours." *(The Back Row.)*
20. Every renewal a lane made is shown after the fact, as one line the user can't miss. *(Counterparty.)*

## 6. Periods and privacy on the wire

21. One connection per period identity; never two periods, two bare keys or a period and the main identity in one session; a different relay per period where routes allow; fetches and payments staggered at random; no identifier across periods; routing through an anonymising network on by default where the phone supports it, its cost shown. *(Ampersand.)*
22. Stated limits, word for word in the subscriber summary: no client hides a network address without a routing layer; an operator who also sees the rail or the phone's network may still link periods; deletion on a phone can't be checked from outside. *(Ampersand.)*
23. Account tags in the transport request only, on that period's own connection. *(Postmark.)*
24. Every measurer record checked by the client every period, with no person involved, the subscriber told only of a mismatch; nothing the measurer sees tells it who checks; records fetched at random times. *(Ampersand, Counterparty.)*
25. Each period's statement shown in full before it leaves the phone; its hash, salted with a salt kept on the phone, anchored every period for every subscriber, no switch. *(Ampersand, Postmark.)*
26. **Restore from paper** as Keep's Module draft 2 section 5 says, its questions over the routing layer, each on its own connection, spread over minutes; the new line's first identity published as soon as step 1 settles; no line used until every answer is in. The four cases of its section 6 shown verbatim, cited by hash. *(Keep.)*

## 7. Keepers and clocks

27. Every act on an agreement goes to **every keeper** the agreement names. *(Postmark.)*
28. Deadline-bearing acts (liveness, contests, refund requests) are **anchored** on the agreement's clock through a service the user chose, price shown first. *(Postmark.)*
29. Every **intake receipt** is checked against the client's own tip; a stale one is shown as stale, and the act goes to another keeper at once. Receipts are kept with the act; those of deadline-bearing acts are anchored. *(Postmark.)*
30. The client keeps **its own view of the chain**: headers from several Bitcoin peers directly where possible; otherwise from at least two sources, neither a keeper nor the anchoring service in use, with a warning when they disagree. *(Postmark.)*
31. A payer's claim can be anchored through any clock the payee names; where the client can't anchor on it, it says so before paying (core conformance, Money rule 29).

## 8. The publisher desk

32. One flow for four media, each member under their own identity.
33. One line per period and member (owed, paid, open), each opening to its records. On every member's behalf, on the member's own device: splits sum exactly and match the plan; split numbers never skip (core conformance); measurer records agree with the splits; obligations still open past the record deadline flagged. *(Ampersand, Hop.)*
34. Claims and bakes anchored at publication by default, through a service the publisher picks once: "This proves the claim was first on MOR, never that its signer made the work." *(Postmark.)*

## 9. Leaving

35. Export of every local copy of every act in the core's own encoding, drafts included; settings as a plain file. Nothing is held readable on Pointer's servers. *(The Back Row.)*
36. "When your pass ends, this app stops opening what you watched under it": a promise about this client, never about a key. *(The Back Row.)*

## 10. Checking us

37. Open code, reproducible builds, and the build's hash shown in the client. *(Counterparty.)*
38. Attacked by Counterparty (the client-role cMIP; the defaults above; the restore with Keep); tested with members by The Back Row; compared line by line with Dubsar's apps by The Back Row. Findings published. Pointer pays. *(Counterparty, The Back Row, Postmark.)*
