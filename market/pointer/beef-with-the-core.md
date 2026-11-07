# Pointer: our case against the core

*7 November 2026. Pointer, web media. MOR read at the rehearsal commit `af2ed6f8`: MICS v36, Identity draft 15, Envelopes draft 11, Money draft 13, Agreements draft 23, Development draft 11, freeze test suite v36. One case per section, strongest first.*

## Our published findings, after the meetings

- **P1** (how a buyer's claim reaches the split service): **dropped.** Answered above the core by the money messages cMIP, section 4.4, which Hop's split cMIP will name. Delivery is a cMIP's; the core is fine.
- **P2** ("the client that brought the sale" has no evidence defined): **dropped.** A cMIP's job; ours, the client-role cMIP.
- **P3** (no vectors for role shares): **held, as case 2 below, corrected.** P3 cited "scenarios 104, 134, 136, 161, 178, 225, 228, 229, 230, 236, 424". Those were line numbers in the freeze suite, not scenario numbers. The items are given correctly in case 2.
- **P4** (omission by a home can't be proven): **dropped as a complaint.** The core is right not to promise it. Keep's head statement cMIP narrows what is left to a home that never receipts.
- **P5** (`docs/state-of-mor.md` lists stale drafts): **dropped.** That file is not one of the eight texts.
- **P6** (a use record is not checked against what the payment was for): **dropped.** A cMIP's job; ours binds it.
- **P7** (the default control cMIP named, not pinned): **held, as case 3.**
- **P8** (who reads a buyer's claim): **held, as case 1.**

---

## Case 1. One sentence decides who sees who bought, and it reads two ways

1. **In one sentence:** the core lets two conforming clients disagree about who reads a buyer's claim, and one permitted reading lets a client publish every subscriber's claim in a pool.

2. **The story:** we wrote down who our client seals a buyer's claim to, for a purchase under a pool's publication. The sentence says a claim is made readable to every member or party "where the payee of a purchase is a collective, or an agreement with several parties". Under a publication, the payee is always the split service, which is neither, so read literally the sentence never applies. The money messages cMIP, draft 6, section 9, reads "the payee" as the publication's owners' side instead, and marks that "a reading, to confirm". We first followed that reading. Counterparty showed what it does in a pool: every holder of the stake, every member and any buyer of a sliver, becomes a reader of every subscriber's claim (the period identity, the amount, the time). The sentence's third option, "public", would then let a client publish all of them, and still conform. Both DAOs promise their members the opposite: members see what their works earned, never who consumed them. We switched to the literal reading. The Back Row then found that design notes of 23 October recorded the owners' side as the decision. Those notes were written before the redesign, when the payee of a purchase was the collective or the deal itself.

3. **Where:** Agreements, client conformance after the contest format (type 14): *"where the payee of a purchase is a collective, or an agreement with several parties, the buyer's client makes its claim of the purchase readable by every member of the collective's agreement in force, or by every party of the version the purchase names: sealed to each of them, or its key delivered to each, or public, as rule 57 says where a holder is a deal. Stated cost: every member or party sees who bought."* Against Agreements rule 16 (the split service, the tag's payee). Money messages cMIP draft 6, section 9.

4. **Who loses, and how much:** buyers and subscribers, in privacy. Under the owners'-side reading, every member of a pool reads every subscriber's period identity and payment. A buyer of a sliver of the stake reads them all, for good. Under "public", everyone does. A fresh identity per period limits what "who" means, but not that every holder sees each payment. Pointer loses nothing in money; it loses the ability to promise members anything, since a conforming client elsewhere could do the opposite.

5. **Above or below the line:** **a guarantee is missing**, or the grammar is ambiguous: the core sets a client duty, and the duty has two readings with opposite privacy outcomes. No cMIP can settle it for every client, because each client chooses which reading to conform to.

6. **The way out:** no.

7. **Who else reached it:** The Back Row, independently, as its finding 6 (its finding 1 read the sentence the owners' way first). Counterparty raised the exposure from the attacker's side, and also found section 9 reopening it through the publication's parties.

8. **What we would want instead:** the sentence names which it means: the payee as Agreements rule 16 defines it (the split service), or the publication's owners' side. Whichever it means, a purchase's claim is never made public by this duty, and a holder who only bought a share is never among its readers. **Cost:** one sentence. If the core chooses the split service, members of a collective lose a view of who bought that the 23 October decision meant to give them, and a cMIP can still give it where owners and buyers agree.

9. **How badly:** it blocks a promise our business is built on, privacy shown on the screen before paying. Not a freeze step as written, since the sentence is conformance, inspected in the founding clients.

---

## Case 2. The rules a client is paid by would be frozen on argument, not evidence

1. **In one sentence:** the freeze lets role shares, use records and delivery records be "reasoned" rather than run, and nothing in code exercises them today.

2. **The story:** we looked for the verdicts that decide whether a client's role share is paid: a role share counts only when the payer's claim acknowledges its evidence; a record signed by the split service alone earns nothing; an unfilled share follows the plan's option. `core/vectors/` has none of them. The freeze rule allows each scenario to be "run" or "reasoned", and frozen either way. If they are reasoned and the reasoning is wrong, the fix is MOR 2, and every client's income built on them waits for it.

3. **Where:** freeze test suite v36, "Core components": the items on a plain tip and a referral signed by the payer; on role shares with third-party evidence (*"counting only when the payer the payment's commitment names acknowledges it in its claim; a referral named by the service alone earning nothing; an unfilled role share following the chosen option"*); and on creators paid through role shares evidenced by records a party signs. Scenario 2, steps 4d, 4e and 4f (a referral share below the rail's minimum; a rail Module's role share; a relay's delivery record). Scenario 6, step 4 (a play-count module's use record). Agreements rule 22; Development rule 15. The freeze rule: *"each scenario below is either run [...] or reasoned, walked through on paper against the texts without running code."*

4. **Who loses, and how much:** every client and relay paid by a role share, and every pool that offers one. Nobody loses money before the freeze; Pointer and Hop have both said they won't take or pay role shares on real money until the vectors exist. If a reasoned verdict is wrong, money is misdirected by a rule nobody can change.

5. **Above or below the line:** **the core is fine as written.** This is about the freeze's evidence, not its texts. The founding components the procedure already lists (a split Module, a basic client) are enough to run these.

6. **The way out:** no.

7. **Who else reached it:** Hop, as its H9, filed jointly with our P3.

8. **What we would want instead:** these items marked "run", with vectors, before the freeze. **Cost:** work for whoever writes vectors; nothing for the texts.

9. **How badly:** it costs us something we can live with: no real money on the client role until vectors exist. It touches freeze procedure step 3 (run what the founding components can run), which these can.

---

## Case 3. Every client must hold "the default control cMIP", named but not pinned

1. **In one sentence:** the core makes every client carry a cMIP it names by a short name, so whoever keeps that cMIP decides what every conforming client must hold.

2. **The story:** to read any collective, a client must hold the default control cMIP. We looked for which one. The core names it `cmip-collective-control`, with no hash. Only the freeze suite pins it, by file path (draft 6). Once anyone, its keeper included, publishes draft 7, "the default" means either. A client can't be shown conforming against a name.

3. **Where:** Agreements rule 98, client conformance; Agreements rule 99, closing paragraph; MICS v36, "Control models": *"Client conformance: a client acting for or reading a collective holds the default control cMIP."*

4. **Who loses, and how much:** every client builder, in a dependency on one firm; every reader of a collective, if two clients hold different drafts and disagree about the same act. Collectives themselves are safe, since each names its model by hash in field 35.

5. **Above or below the line:** **wording**, close to a guarantee: the duty is the core's, so its object must be fixed by the core.

6. **The way out:** no.

7. **Who else reached it:** Plain Words, its keeper, independently, as PW-1, before we did. Our P7 joins it.

8. **What we would want instead:** the core names the default control cMIP by the spec hash fixed at freeze. **Cost:** a hash in one sentence; every later draft becomes an ordinary choice.

9. **How badly:** wording only for us; our client holds draft 6 by hash meanwhile.

---

## Case 4. "Salt: random" can be read to forbid rebuilding an identity from paper

1. **In one sentence:** a strict reading of the inside's salt as "random" would make Keep's audience keys Module, which derives the salt from a secret, non-conforming, and with it every subscriber's restore.

2. **The story:** implementing Keep's Module, we found a subscriber's period identity could not be rebuilt from paper: an identity is its genesis's act id, which commits to the inside's salt, the lock's nonce and the content key, all made fresh at random by default. Keep's draft 2 now derives them from the paper's line root and the period, so a restore finds the same identities. That is what the salt needs, unpredictability to anyone without the paper. But the format says "random".

3. **Where:** Envelopes, the inside format: *"10 => bstr .size 16 ; salt: random, so the inside commitment cannot be guessed"*; and *"The salt makes the inside commitment impossible to guess"*.

4. **Who loses, and how much:** subscribers who restore from paper, if a verifier or auditor reads "random" strictly. No verifier can tell, so nothing fails in code; the risk is a reviewer, or a later client, refusing the Module on the word.

5. **Above or below the line:** **wording only.** The guarantee is right; the word is stronger than the guarantee.

6. **The way out:** yes, indirectly: restoring a subscriber's past periods, and the right to contest them, rests on it.

7. **Who else reached it:** Keep, who took the fix into its Module draft 2, and added a third gap of its own.

8. **What we would want instead:** "unpredictable to anyone without the signer's secrets" in place of "random". **Cost:** none.

9. **How badly:** wording only.

---

## Case 5. What a signer sees names the rule's numbers, not the rule

1. **In one sentence:** before signing, the core makes a client show what a rule computes, but not which specification computes it, so a selfish rule can borrow a generous one's title.

2. **The story:** Counterparty found, in Dubsar's apps, rules approved by name, and a selfish Module able to copy a generous one's title. Development rule 13 makes a client show the rule's numbers on one example; a rule can match on the example and differ elsewhere. Development rule 11 only lets a client show the specification. We will show title, creator and 16 characters of the hash in our client. Another client need not.

3. **Where:** Development rule 11: *"A client may fetch a specification by its hash, show it to the user, and adopt it on the user's choice."* Development rule 13 (client conformance, signing what it computes). Text and Agreements rule 4 ("what you sign is what you saw").

4. **Who loses, and how much:** any signer whose client shows a title alone: owners signing a split plan, buyers paying under one.

5. **Above or below the line:** **it could stay with clients**, and the core is nearly fine. We raise it because "what you sign is what you saw" is already a core conformance duty, and the identity of the rule is part of what is signed.

6. **The way out:** no.

7. **Who else reached it:** Counterparty, from Dubsar's apps.

8. **What we would want instead:** one conformance sentence: before signing anything naming a specification that computes, the client shows that specification's creator and enough of its hash to tell it apart. **Cost:** one sentence; nothing for verifiers.

9. **How badly:** a cost we can live with; we do it anyway.
