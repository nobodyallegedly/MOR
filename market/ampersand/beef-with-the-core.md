# Ampersand: our case against the core

*7 November 2026. Read against the texts at `af2ed6f8`: MICS v36, Agreements draft 23, Money draft 13, Identity draft 15. Ampersand builds nothing; these cases come from designing a bundle with the players. One case per section, most severe first. Quotes are from Agreements draft 23 unless named otherwise.*

## Findings we raised or backed earlier, and where they stand

| Finding | Ours or backed | After the meetings |
| --- | --- | --- |
| Counterparty C12 (a sliver sold to a deal) | backed | **Held, and worse:** case 1, case 2 |
| Hop H3 (a buyer-measured metric has no grammar) | joint question with Backlot | Held, lower: case 3 |
| Counterparty C1 (a fee names no receiver) | backed | Held: case 4 |
| Counterparty C13 (a subscriber cannot contest a metric record) | backed | Held, with a workaround: case 5 |
| Hop H1, Plain Words PW-2 (a refund has nowhere to wait) | backed | Held: case 6 |
| Hop H5 (an unmeasured share can only fall to the owners' line) | filed jointly | **Dropped for us.** Our design now wants exactly that; Hop keeps it as a general question |
| Longhouse's omission question | backed jointly with Backlot | Not ours to argue. We accept Counterparty's reading: the core decides alike on the same evidence and does not promise the same evidence. Please say it once as a stated cost |
| Counterparty C2 (an escape can unmake a transfer) | backed | Held: case 7 |

---

## Case 1. One member can make Ampersand's money, and possibly who bought a pass, public for good

1. **In one sentence:** any holder of a collective's stake can sell a sliver of it to a deal, and from then on every Money act of the collective must be public, with nothing the collective can do to stop it.
2. **The story:** our members hold Ampersand's stake in itself, so the metric can pay them (case 2). Counterparty showed that any member can transfer one millionth of that stake to a deal, a rival's included. We tried to block it in the founding terms, by the holders' rule, by release on departure. None reaches it: a holder's transfer of its own share is a way-out act. Once a deal holds the stake, rule 57 makes every Money act of Ampersand public, and the buyer's client must make its claim of a purchase from a collective readable as rule 57 says, so who bought a pass may become public too. We expected that a way out would protect the holder leaving, not hand them a lever over everyone's privacy.
3. **Where:** Rule 57: "**where a holder is a deal, the act is public.**" And: "a Money act for it (a receipt, an obligation, a payout, a payee pointer, a price tag) is done only once it is sealed to every holder of that stake, members and others, or public." Rule 98, the way-out list: "a holder's transfer of its own share (rule 10) … each is judged by this MIR alone, whatever model the collective names." "Contest (type 14)", client conformance: the buyer's client makes its claim readable "as rule 57 says where a holder is a deal."
4. **Who loses, and how much:** every subscriber, whose purchase may be shown; every member, whose income is shown to anyone; Ampersand, whose founding we have stopped. Any collective whose stake has more than a handful of holders carries the same risk. Privacy, permanently, at the price of one millionth of a stake.
5. **Above or below the line:** **a guarantee is missing.** No cMIP can reach it: the transfer is a way-out act, and the publicity is rule 57's.
6. **The way out:** yes, first. The lever is the way out itself: a holder's right to transfer its own share. We do not want that right narrowed. We want its side effect on everyone else removed.
7. **Who else reached it:** Counterparty (C12), independently; The Back Row's finding 1 reaches the same claim conformance from the buyer's side.
8. **What we would want instead:** a holder that is a deal reached by sealing to the parties of the version it named when it bought, or by its own published delivery point, rather than by forcing the collective's acts public. *Cost:* rule 57 gives its reason: a deal has no line, so no verifier can tell which version was in force. The fix costs a rule for which version a deal holder is reached through, and a reader's trust that the deal's parties at that version are the right ones.
9. **How badly:** **it blocks our business.** We will not found while it stands.

## Case 2. The only defence against case 1 stops the metric from paying our members

1. **In one sentence:** the core lets a metric pay only identities the plan already pays, so members must hold the stake directly, and holding it directly is what case 1 attacks.
2. **The story:** Plain Words built our pool so that members can join without everyone re-signing: Ampersand alone sells the pass, members hold its stake, and holders count as "already paid", so the metric can pay them (Hop's H4 confirms the verifier reads it so). Counterparty's defence against case 1 is to have the stake held by a holding collective, since rule 57 seals to a collective holder's members, not its holders. But then the plan pays only the holding collective, and the metric cannot pay our members at all. Members as partners of the pass publication would work, but every admission would then need a new version signed by every party: the problem the pool was built to avoid. We expected the core to let a pool both pay its members by use and admit new ones without a signature from everyone.
3. **Where:** Rule 30: "**A metric's measurer is none of the identities the metric divides among, nor the split service** (rule 29). A metric pays only identities the plan already pays." Rule 57 as in case 1. Rule 47: a deal changes only with every party.
4. **Who loses, and how much:** any pool that pays members by use: our bundle, Backlot's, any label or cooperative paying by plays. The choice today is between privacy (case 1) and admission without unanimity.
5. **Above or below the line:** **the grammar is missing.** No cMIP can make a metric pay an identity the plan does not pay.
6. **The way out:** it touches joining and leaving a pool: whether a member can come and go without every other party signing.
7. **Who else reached it:** nobody yet, to our knowledge. It appears only when Counterparty's C12 defence is laid over Plain Words' pool structure; both readings are due on 16 November, and we raise it now so it is read with them.
8. **What we would want instead:** a metric may pay the members of a collective that the plan pays, through it, by the metric's record; or the fix in case 1, which makes the holding collective unnecessary. *Cost:* the first adds a second level to "already paid" and to what a split delivers to whom; the second is case 1's cost.
9. **How badly:** **it blocks our business,** together with case 1. Fix either and the other loses its sting.

## Case 3. A subscriber's own client cannot be the measurer of its own payment

1. **In one sentence:** a metric's measurer must be one identity named in advance, so a bundle cannot be divided by what each payer's own client counts.
2. **The story:** we wanted each subscriber's money to follow what that subscriber used, measured on their own phone, so nobody else holds their viewing. Hop showed the metric names one measurer in advance; a subscriber joining later cannot be it. We redesigned: a measurer running a published fixed function, checked by every client, possibly only countersigning what the client computes. It works, at the cost of a third party in the path and a promise to delete statements nobody can check.
3. **Where:** split plan format: `metric = [ module: hash, measurer: hash, ? params: any ] ; the measurer named in advance (rule 29)`. Rule 30, as in case 2.
4. **Who loses, and how much:** subscribers, whose statement passes through a third party; every bundle, which needs a measurer nobody in the market offers yet.
5. **Above or below the line:** **the grammar is missing** for a payer-measured metric. A cMIP cannot name the payer of each payment as measurer.
6. **The way out:** no.
7. **Who else reached it:** Hop (H3), and Backlot, who chose a named measurer because of it. Both DAOs asked jointly.
8. **What we would want instead:** a metric whose measurer is the payer the payment's commitment names, its record counting only for that payment, as a referral's evidence already counts only when the payer acknowledges it (rule 22). *Cost:* a second kind of measurer, and a payer able to tilt its own payment among members (which only moves its own money).
9. **How badly:** it costs us something we can live with, now that the measurer is a published function.

## Case 4. A fee names no receiver, so a builder's reward can be taken by the split service

1. **In one sentence:** a fee entry names a Module and a part, never who is paid, and the verifier accepts any receiver.
2. **The story:** our statement with Backlot pays the maintainers of the shared media rulebooks by fee entries in both DAOs' splits. Counterparty showed a split service can pay that fee to itself and the verifier sees no mismatch. We moved maintainers to named partners, which costs a new version of the plan whenever a maintainer changes.
3. **Where:** `fee = [ module: hash, part: uint, ? scope ]`. "Split plan and split": "Any payout to anyone else is a mismatch: **never an address the parties did not sign.**" and "Every fee it takes is a payout naming its module and its receiver." The fee's receiver is an address no party signed.
4. **Who loses, and how much:** every maintainer of a rulebook or Module paid by fee; every model that rewards builders by use, which MOR in one page names as a purpose.
5. **Above or below the line:** **a guarantee is broken.** Rule 27 and the sentence above promise that nobody is paid at an address the parties did not sign. No split cMIP can fix it, because the core's check decides.
6. **The way out:** no.
7. **Who else reached it:** Counterparty (C1), confirmed in code and test; Pointer's P2 and P3 bear on the same reward path.
8. **What we would want instead:** a fee entry names its receiver, or the Module's own receiver field is read and checked. *Cost:* one more field per fee, and a fee receiver that changes by a new version, as a partner's does.
9. **How badly:** it costs us something we can live with (named partners); it blocks the "reward the builders" model as written.

## Case 5. A subscriber cannot contest the record that divides their own payment

1. **In one sentence:** the buyer has standing only to contest its purchase, never the measurer's record that decides where its money went.
2. **The story:** every recommended client checks its own record each period. When it finds a lie, the subscriber can contest the purchase in words, but cannot name the record. Members can, as holders the record pays, but a member would have to see a subscriber's statement to prove it. We named a verifier, The Back Row, so that someone with standing can contest the record.
3. **Where:** Rule 54: "the buyer of a purchase, for a contest of that purchase"; "a keeper, arbitrator or verifier the agreement names".
4. **Who loses, and how much:** subscribers, who must reveal one period's statement to a verifier to prove a lie; every bundle, which must find a verifier.
5. **Above or below the line:** **it could be a cMIP or a term,** and the core is nearly fine: a named verifier works. We ask only for a stated cost, or for buyer standing that reaches the evidence of its own payment's split.
6. **The way out:** no.
7. **Who else reached it:** Counterparty (C13).
8. **What we would want instead:** the buyer's standing extended to any record the split of its own payment rests on. *Cost:* one line in rule 54.
9. **How badly:** wording, or a cost we live with.

## Case 6. A refund the terms promise is not shown to be a debt, and has nowhere to wait

1. **In one sentence:** the texts do not say whether a refund a publication's own terms promise counts toward a collective's "owes nothing", and a split service can never pay it from the money it holds.
2. **The story:** The Back Row asked us to make the bad day a debt, not a promise: the unused days of a paid period owed back, shrinking each day, so that a closing on day ten fails until they are paid. The core creates a refund only where a payment received nothing, raced an ending or named a wrong tag; publication field 8 sets only how long a refund stays claimable. The closing counts "a refund owed on a payment to it … while that refund is not ended (rule 11)". Whether a refund our terms write is such a refund, the texts do not say. And during the period the subscriber's money sits with Hop, which may pay no one outside the plan, so a refund must come from Ampersand's own reserve.
3. **Where:** Rule 11: "A payment that receives neither … creates an obligation to refund it." "The publication's terms MAY say how long a refund stays claimable … A refund past the terms the buyer accepted by paying is ended: … it does not block a closing." Closing (type 20): "a refund owed on a payment to it among them, while that refund is not ended (rule 11)." Rule 27: "A split service MUST NOT pay anyone outside the owners …, the partners, the roles as evidenced, and the fees the plan makes owed."
4. **Who loses, and how much:** subscribers, on the day a service stops mid-period. With the debt counted, they wait but are paid; without it, they hold a signed promise.
5. **Above or below the line:** **a guarantee is missing**, or a sentence. The closing's guarantee already exists; it may simply not reach refunds that terms write.
6. **The way out:** yes. Closing and forking: whether a collective can close, or a split shed, what it promised to repay.
7. **Who else reached it:** Hop (H1), Plain Words (PW-2), The Back Row (finding 3), each from a different side.
8. **What we would want instead:** a sentence saying that a refund the publication's terms make owed, and not yet ended, counts toward "owes nothing" and passes to a fork's successors; and, from H1, a split plan able to name money owed back to the payer its commitment names. *Cost:* refund terms become checkable debts, so a verifier must read them; the split format gains one payout kind.
9. **How badly:** it costs us a mark we want: "checked by readers" falls to "signed promise".

## Case 7. An escape can undo a stake's release or transfer that others relied on

1. **In one sentence:** a holder holding both keys can sell or release a share, then sign an escape at the same position that abandons the chain signature placing it.
2. **The story:** our design needs a departing member's release of its stake to stay released, and a sliver's transfer (case 1) to be at least placed and visible. Counterparty showed an escape at the same position wins over the chain signature, and Agreements protects only against a later rotation.
3. **Where:** Identity rule 29 and section 11 ("the escape then wins"); Agreements rules 10 and 91 ("no later rotation voids it").
4. **Who loses, and how much:** a buyer of a stake, a collective relying on a release, a fork's successors.
5. **Above or below the line:** **a guarantee is broken**: what others relied on stands.
6. **The way out:** yes. Transfers, releases and forks are the way out.
7. **Who else reached it:** Counterparty (C2).
8. **What we would want instead:** a chain signature Agreements relies on stands against an escape at the same position, as an acknowledged act does. *Cost:* the escape loses some reach over a stolen chain key's last act.
9. **How badly:** it blocks a freeze step in Counterparty's reading; for us, a cost we can state until it is decided.

## Case 8. Every member sees each subscriber's mix

1. **In one sentence:** every split is delivered to every holder it pays, so each member sees the spread of every subscriber's payment across members.
2. **The story:** fresh identities keep periods apart, but a member with few subscribers, or a subscriber with an unusual mix, can be recognised from the split alone.
3. **Where:** Rule 9: "**The split service delivers every receipt for a stake to every holder of it, paid or not** (client conformance)." "Split plan and split": "A split is delivered to every holder and partner it pays."
4. **Who loses, and how much:** subscribers of small members, a little privacy.
5. **Above or below the line:** **the core is fine.** Owners' sight of their income is a guarantee we want. We state the cost on our screen.
6. **The way out:** no.
7. **Who else reached it:** The Back Row (finding 1), from the purchase side; Counterparty (target 5).
8. **What we would want instead:** nothing changed; a stated cost said where a subscriber of a collective would read it.
9. **How badly:** wording only.

## Case 9. Departed holders make a collective's Money acts public by default

1. **In one sentence:** once a collective's stake has a holder who is no member, its Money acts must be sealed to that holder too, and the client makes them public by default.
2. **The story:** members who leave Ampersand keep their stake unless released. We asked Plain Words for a release on departure under a holders' rule each member accepts at admission. Rule 98 seems to allow it ("consents under a rule binding it that it accepted"), but no text says a holders' rule may bind a holder to release its whole stake on leaving.
3. **Where:** Rule 57: "**Owners without a say see the collective's Money acts.** … *Client conformance:* the member's client makes those acts public by default." Rule 98.2.
4. **Who loses, and how much:** the same as case 1, by default rather than by attack, the day the first member leaves.
5. **Above or below the line:** **it could be a cMIP or a term** (the holders' rule), if the texts allow it. We ask only for a sentence.
6. **The way out:** yes. Leaving.
7. **Who else reached it:** nobody independently; Plain Words is checking.
8. **What we would want instead:** one sentence confirming that a holders' rule may bind a holder to release its stake on leaving, the release placed like any other. *Cost:* none in the core.
9. **How badly:** wording only, if the answer is yes.
