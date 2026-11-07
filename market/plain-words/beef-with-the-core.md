# Plain Words: our case against the core

*7 November 2026, after the first round of meetings. Read at `af2ed6f8`: MICS v36, Agreements draft 23, Money draft 13, Identity draft 15, Development draft 11, freeze test suite v36, and the reference verifier. Most costly first. Not part of the core.*

## Our published findings, after the meetings

| Finding | Still held? | Where it went |
| --- | --- | --- |
| PW-1, the default control cMIP unpinned | Yes | Case 5 |
| PW-2, where held money goes when a vow's condition fails | Merged | Case 1. PW-3 showed nothing can be held in a split, so PW-2's question has nothing to act on |
| PW-3, rule 34's conditional payout has no place in a split | Yes | Case 1 |
| PW-4, a holder naming itself as its own stake successor | Yes | Case 6 |
| PW-5, a pending conditional obligation at a closing | Yes | Case 4 |
| Our early question, "is a contest a core act?" | Answered | Yes: type 14, standing in rule 54. Dropped |
| "Already pays" for a holder paid nothing | Answered by the verifier | It counts every holder (Hop's H4 asks for the wording). Dropped by us |

---

## Case 1. A buyer whose promise was broken can never be refunded from the money they paid

1. **In one sentence:** no term, no cMIP and no split service can hold a vow's money until the vow is kept, or send it back to the buyer when it is not.
2. **The story.** We set out to write a vow-remedy cMIP: a studio sells a game before it ships; the seller's payout waits until the release date passes uncontested; if the buyer contests and an arbitrator agrees, the money goes back. Rule 34 seemed to allow it ("a payout depend on a condition"). But a condition cMIP is named in the terms, and the split plan has no place for a condition. The split service must split every receipt as it arrives, paying exactly the plan's receivers. The one hold we found, a role share left "held open", is owed to no one, so the money would sink at the split service for good. Hop reached the same wall from the split side. We expected one of two things: a way for a split plan to hold a share on a condition and pay it back to the payer the payment's commitment names, or the texts saying plainly that a vow's refund is owed by each holder after payout.
3. **Where:** Agreements rule 34: "An agreement may make an obligation or a payout depend on a condition, evaluated by the condition cMIP it names." Rule 27: the service "MUST NOT pay anyone outside the owners …, the partners, the roles as evidenced, and the fees the plan makes owed." Rules 20, 21 and 30; the split plan's format (type 8); rule 13: "The core fixes no partial refund."
4. **Who loses:** every buyer of a vow (early access, a season, a promised service). Today a broken promise returns nothing unless each owner pays back their own payout, chased one by one. Every seller of vows loses the buyer's trust that a remedy could have bought. The Back Row's third member test cannot pass for any vow on MOR.
5. **Above or below the line:** **the grammar is missing.** A cMIP cannot fix it, because the core's split check decides who may be paid. The alternative, an escrow posing as the seller of record (Hop's H1), works but hides the real seller's record, which is the opposite of MOR's legible money.
6. **The way out:** not directly.
7. **Who else reached it:** Hop (H1), independently, from the split service's side. The Back Row (its finding 3) reached the gap above it: a buyer's whole remedy rests on terms no cMIP yet provides.
8. **What we would want instead:** either a split plan entry that holds a stated share on a named condition, paying it to the owners when the condition holds and back to the payer the commitment names when it fails; or one sentence in rule 13 or 34 making it a stated cost that a promise's refund is owed by each holder after payout. *Cost:* the first adds custody to every split service holding such a share, a new state in the split, and a verifier check. The second costs nothing but leaves the hole visible.
9. **How badly:** blocks our vow-remedy product and Hop's refund cMIP. Blocks no freeze step we know of.

---

## Case 2. The members can take a departed member's stake by rewriting the rules after they left

1. **In one sentence:** the members of a collective can change its abandonment clause, as an ordinary judicial change, and then use the new clause to declare absent, and share out the stake of, a holder who left, bought in, or never had a vote.
2. **The story.** We advised Backlot that a member whose vote is removed keeps their stake, paid to them, for good: the clause allowed only the voice removed. Counterparty showed (its C3) that the members can later change the clause: allow outcome 1, name one of themselves as authority, drop any absence-proof cMIP, then declare a present outside holder absent. With no stake successor named, outcome 1 shares that stake among the remaining holders, the members mostly. A contest shows it and undoes nothing. The one defence the texts give is a succession plan naming a stake successor, which removes the motive (the stake goes to the holder's own successor) but not the harm (a present holder still loses it). A holder who buys a share with no plan has no defence at all. We expected the protection the core already gives a holders' rule, which "binds only holders who accepted it", to apply to the clause that can move their stake.
3. **Where:** Agreements rule 85: a declaration against a holder who is no party "is made under the clause in force; its authority and its absence-proof cMIP are the clause's, as for a party." Rule 98.2: a stake moves only with its holder, "save by succession, the declaration of absence's two outcomes". Rules 48, 88, 89; rule 67 and the judicial tier.
4. **Who loses:** every departed member, every buyer of a share, every outside investor in any collective. Their stake, in full, and their trust that "anybody can leave" leaves them anything.
5. **Above or below the line:** **a guarantee is broken.** "No stake moved or reduced without its holder" is one of the core's own promises (Agreements, purpose 2), and a cMIP cannot defend it: the members can drop the cMIP as a judicial change.
6. **The way out: yes.** What a person takes with them when they leave a collective is their stake. As written, the people they left can take it back.
7. **Who else reached it:** Counterparty (C3), first and independently. Keep agreed with the reading and the defence (`claude/Keep-to-PlainWords-1.md`). We reached it from Backlot's design.
8. **What we would want instead:** a change to the abandonment clause binds a holder who is no party only if they accepted it, as rule 48 says of a holders' rule; otherwise they stay judged under the clause in force when they last held a voice or bought. *Cost:* the clause stops being "one version for everyone" (rule 85); a verifier must find, per holder, the version that binds them. A simpler alternative: outcome 1 is never available against a holder who is no party.
9. **How badly:** blocks our business for every collective with outside holders; we must tell each client that a departed member's stake is safe only by the members' good will.

---

## Case 3. A metric can pay only the members directly, so any member selling a sliver makes the collective's books public

1. **In one sentence:** to divide a pool by use, the stake must be held by the members themselves, and then any one of them can sell a sliver to a deal and make every Money act of the collective public, for good.
2. **The story.** For Ampersand's pass we needed the metric to pay members, so members had to be "already paid" by the plan, as holders of Ampersand's stake. Counterparty showed that a holder selling a one-millionth share to a deal makes the collective's Money acts public (rule 57), and a holder's own sale cannot be blocked. The obvious defence is to hold the stake through a holding collective. The verifier never looks inside a holder that is a collective, so the members stop being "already paid" and the metric can pay none of them. Holding it through an ownership agreement fails another way: that holder is a deal, and rule 57 makes the acts public at once. We found no structure that does both. We expected "already pays" to reach the holders behind a nested owner, as money itself does.
3. **Where:** Agreements rule 30: "A metric pays only identities the plan already pays." Rule 57: "Owners without a say see the collective's Money acts." Rule 15: money passes "layer by layer", behind an owner that is a collective or an ownership agreement, but the metric's check reads only the first layer (`core/src/agreements/view/owning.rs`, `holders_as_held`).
4. **Who loses:** every collective that divides a pool by use, and its subscribers. With one pass price, the public books show only how many passes were paid; with tiers, which tier each payment bought.
5. **Above or below the line:** **the grammar is missing.** No cMIP can make the core's metric check look through a nested owner.
6. **The way out:** not directly. It is a consequence of a holder's free sale, which we would not touch.
7. **Who else reached it:** Counterparty, which published it as C14 after we found its first break; Counterparty's C12 for the sliver sale.
8. **What we would want instead:** "already pays" reads through owners that are collectives or ownership agreements, layer by layer, as rule 15 sends money. *Cost:* a recursive check in the verifier, bounded as rule 15's layers already are.
9. **How badly:** costs us something we can live with: one price per pass, and a stated cost on the screen.

---

## Case 4. A debt for unused days may not stop a collective closing (our PW-5, with The Back Row)

1. **In one sentence:** the texts do not say whether a closing counts an obligation whose condition is still pending, so a collective selling passes may close mid-period and owe its subscribers nothing.
2. **The story.** See PW-5 (`findings.md`). An obligation states one amount, so the only form for unused days is a few obligations per period, each owed if the service stops before its date. If a closing counts them while pending, a collective cannot close mid-period without repaying; if not, it closes on day ten and the debts never bind. A Back Row route through refunds was checked and fails: rule 11 creates refunds only where nothing was delivered, and a pass is paid to the split service, not the collective.
3. **Where:** Agreements, the closing's conditions: "every obligation that binds it and lies before its line … is fulfilled in full by receipts a verifier holds, or ended by its creditor's release". Rules 11, 34, 91, 92; Money types 1 and 4.
4. **Who loses:** every subscriber to a pass whose seller stops mid-period: up to one period's money, or one step's if the debt is written in steps.
5. **Above or below the line:** **the grammar is missing**, one sentence of it. What a closing counts is the core's.
6. **The way out: yes.** It decides what a collective may walk away from when it closes.
7. **Who else reached it:** The Back Row (its finding 5), which first asked for the debt.
8. **What we would want instead:** one sentence: a pending conditional obligation binds a closing until its condition is judged, or it does not. Either answer is fine; silence is not. *Cost:* none for the second; for the first, a collective with a period running cannot close until it ends.
9. **How badly:** blocks the stepped debt for every pass seller, and The Back Row's "checked by readers" mark for it.

---

## Case 5. Whoever keeps the default control cMIP decides what every client must carry (our PW-1)

1. **In one sentence:** the core requires every client reading a collective to hold "the default control cMIP" without naming its hash, so its keeper, today us, can change what every client must run.
2. **The story.** See PW-1. Since then we found that it goes further: the reference verifier implements this cMIP itself. A flaw Counterparty found in our proxy rule (a holder who is no member cannot take back a proxy) lives in the core's code (`core/src/agreements/view/proxies.rs`), so fixing our cMIP changes the reference code too.
3. **Where:** Agreements rule 98, client conformance: a client acting for or reading a collective "holds the default control cMIP". Rule 99; MICS v36, "Control models".
4. **Who loses:** every client builder, who cannot know what conformance asks of them next year; every collective, if a later default differs from the one it chose; and us, who hold a power we do not want.
5. **Above or below the line:** **a guarantee is missing**: that what a conforming client must carry is frozen with the core.
6. **The way out:** not directly.
7. **Who else reached it:** Pointer (its P7), as a client builder.
8. **What we would want instead:** the core names the default by the hash of the version frozen with it, and the reference verifier implements exactly that version; later drafts are ordinary choices in field 35. *Cost:* the frozen default keeps any flaw it is frozen with, our proxy rule included, unless draft 7 is ready first.
9. **How badly:** wording and one hash; but until it is settled we will not publish draft 7.

---

## Case 6. Nothing says whether a holder may name itself as its own stake successor (our PW-4)

1. **In one sentence:** a succession plan naming its own party as stake successor either closes case 2 for that holder or breaks what abandonment is for, and the texts do not say which.
2. **The story.** See PW-4. Keep's reading: a self-successor who loses both keys keeps a stake nothing can move, and blocks for good every change that pays that stake less; the texts rely on the stake moving.
3. **Where:** the succession plan's format, keys 0 and 1; Agreements rules 81, 84, 85, 89.
4. **Who loses:** depending on the answer, a holder against the members (case 2), or a collective against a holder who vanished.
5. **Above or below the line:** **the grammar is missing**: one sentence.
6. **The way out: yes.** Succession.
7. **Who else reached it:** Keep, independently, with the opposite reading.
8. **What we would want instead:** one sentence: a stake successor is never the party itself, or a statement of what such a plan does. *Cost:* none. If case 2 is answered as we ask, this case becomes "never itself" at no loss.
9. **How badly:** wording only; we do not sell on either reading.

---

## Case 7. A present partner can refuse every later version of a publication (Hop's H7, which we support)

1. **In one sentence:** a split service or partner that stays present can refuse every new version of a publication, its own replacement included, and nothing in the core moves it.
2. **The story.** We wrote "Ampersand is the only party to the pool". Wrong: the owners' side, each partner and the split service all sign, and every later version needs every party whose voice remains. The abandonment clause reaches only the absent, and backups take over only when an attempt fails. So a present service or partner holds a veto over a new measurer, new weights, its own replacement and the publication's end. Our workaround: an abandonment clause in every publication, a partner's written promise to sign, and relays paid by supply deal rather than as partners.
3. **Where:** Agreements, "Who signs a publication"; rule 47: in a deal, a clone needs every party whose voice remains; rule 31 (switching services).
4. **Who loses:** every collective selling through a partner or split service: the way to change supplier.
5. **Above or below the line:** **a guarantee is missing**: that a seller can always leave its supplier.
6. **The way out: yes.** Leaving a supplier.
7. **Who else reached it:** Hop (H7), first, against its own interest.
8. **What we would want instead:** a publication may name, in advance, a rule by which its owners' side alone may sign a version that replaces a partner or split service, or ends the publication, paying the departing one what it was owed. *Cost:* partners lose a protection they may want; a deal's "nobody's terms change without their signature" gains one stated exception.
9. **How badly:** costs us something we can live with, thanks to Hop's signed promise; it would block a seller whose supplier makes no such promise.
