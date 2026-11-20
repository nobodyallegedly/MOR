# Prices without a currency: prior art

*Written by Claude, for the MOR lead. A record of work, not a decision.*

*Research window, session 2, 17 November 2026. Public sources only. This is for the voucher exchange, the first project Nobody, allegedly, means to build on MOR; it is not core work. It proposes no design, no rule and no recommendation for MOR.*

## The wish

Nobody, allegedly, `docs/decisions.md` on branch `claude/lead-records-2`:

> "I've decided for a total rewrite of agreements from scratch."
>
> "No translation, fresh from the research we had all agreed was excellent direction."

On what must hold: "can I with a single click reward all the people that contributed to the service or good via MOR". And: "Building blocks over solutions." On the budget: "Once that is over, we.ll focus the rest of the budget on reviewing, no redrafts, no recode."

## His words on this question

The exchange headed "The voucher exchange is a pricing mechanism" (16 November) is in the ledger. I read it whole. The MOR lead had read "that thing in the back" as the cMIPs and Modules a voucher exchange needs, each a business. He answered:

> "No, what makes it interesting is this… Exchange goods for goods, at first. Then later bring in services. That.s the economy everything else is smoke. So, a silly voucher exchange true task is to be the pricing mechanism. Someone traded x grams of sugar against y grams of eggs. Someone else traded half a beef against x kgs of eggs. What's the of beef in sugar at the moment? Then, what if I gave sugar, wanna buy beef with it, but there is none selling beef for sugar, they accept eggs though, can I hop through other offers without having to ever hold the eggs? It.s the research. What is being built? A moneyless commodity exchange. Whatever is being built to run it, to « price » that is « money » not the bills and coins and bits we use right now."

The ledger's line under it ("Arrived at (to check)") is the MOR lead's wording, not his. The two questions and the frame below are also the MOR lead's wording.

**The questions (the MOR lead's wording).** Can prices exist without a currency, read only from signed trades of goods for goods? And can someone holding sugar reach beef through offers that want eggs, without ever holding the eggs?

**The frame (the MOR lead's wording).** Every system that lets a trade hop through others' offers ends up with one of three things in the middle: a common unit of account, a party that carries the risk, or a lock that makes all the deals happen or none.

## How to read the marks

- **sourced**: a source says it; the key in brackets points to the list at the end.
- **disputed**: sources disagree; both sides are given and not settled.
- **inferred**: my reading; I say from what, and give my confidence as a range out of 100.
- In the source list, **(A)** means I confirmed the source and the cited point in this session, through search results or the abstract. **(B)** means I could not open it in this session and cite it from what I know of it; check before relying on it. This session's network blocked several hosts, so few full texts were read here. That limit is restated under "What these sources cannot tell".

## Plain words first

1. **Prices without a currency: yes as ratios, no as a habit.** A trade of sugar for eggs is already a price: so much sugar per egg. Theory has long held that prices are only ratios between goods and that the good used to express them is an arbitrary pick (sourced: [Walras], [Shapley-Scarf]).
2. In practice, every system I found that priced many unlike goods named one unit to express them in. Often nobody ever handed that unit over: Egyptian traders valued goods in weights of copper and then swapped goods; medieval merchants kept books in a pound that was never coined; Swiss, Sardinian and American barter circles count in a unit pegged to the national money (sourced: [Janssen], [Einaudi], [Studer], [Littera], [IRTA]).
3. So a unit of account and a currency are two different things. The sources show units with no currency behind them. They do not show a large market for unlike goods with no unit at all.
4. Reading "beef in sugar" from a sugar-for-eggs trade and an eggs-for-beef trade is arithmetic. Whether the answer agrees with the next direct trade depends on someone trading away the difference (inferred, 85 to 95 in 100, from how cross-rates work in any market).
5. **Sugar to beef without holding eggs: yes, and it has been done four ways.** (a) A ring: all three swap at the same moment, as in a three-way kidney exchange. (b) One shared record that moves all the claims in one stroke, as on the Stellar and XRP ledgers. (c) A middleman who holds the eggs, or the debt, for a moment and is paid for the risk. (d) Locks on separate records that open with one secret, as in atomic swaps.
6. In every one of these, what hops is a claim on the good (a promise, a voucher, an entry), or else the people must be in the same place at the same hour. Physical goods do not hop.
7. **The frame held in four families of five, and bent in one.** Clearing circles have a unit and a risk-carrier. Ripple has units and risk-carriers at every hop. Atomic swaps have the lock. Barter theory predicts the unit.
8. **The bend is kidney chains.** They ran at scale (1,748 transplants in one registry, 2008 to 2016) with no unit, no lock and nobody paid to carry risk. What made that possible: each chain starts with a gift, so nobody gives before receiving, and a break costs the next person a hope, not a kidney already given (sourced: [Rees], [Cowan]).
9. Two cautions on that case. It trades one kind of good for the same kind, so it forms no prices. And a registry sits in the middle, choosing the matches and mending breaks.
10. Two things the frame does not name showed up everywhere: someone or something that finds the path, and a record that all parties to the deal accept.

## 1. The double coincidence of wants and the origin of money

**a. How prices or cross-rates are formed.**

- Barter needs each side to want what the other has. Jevons named this and added a second trouble: with no common measure, every pair of goods has its own rate, so 100 goods have 4,950 rates (sourced: [Jevons], ch. 1).
- Menger's account: no one sets a unit. Traders accept goods that are easy to resell, the most resaleable good becomes the one everything is priced in, and no state is needed (sourced: [Menger]). Later models reproduce this: a good that is cheap to store becomes the go-between (sourced: [Kiyotaki-Wright]). In a prisoner-of-war camp, cigarettes became both the unit and the go-between within months, with no one deciding it (sourced: [Radford]).
- The other account: the unit comes first, from an authority or from debts. Temples and palaces in Mesopotamia and Egypt fixed units (a weight of silver, a measure of barley, a weight of copper) for their accounts; people priced in them and often paid in other goods (sourced: [Powell], [Janssen]). Credit theorists hold that money began as a record of debts, not as a traded good (sourced: [Mitchell-Innes], [Knapp]).
- **Disputed: did barter economies come before money?** Smith, Jevons and Menger tell it that way (sourced: [Smith], [Jevons], [Menger]). Humphrey wrote that no pure barter economy has ever been described, and Graeber built on her: people who knew each other ran on credit and gifts, and barter appears between strangers or where a money has collapsed (sourced: [Humphrey], [Graeber]). Selgin answers that Menger's theory needs barter to be costly, not a recorded barter age, and that missing records do not settle it (sourced: [Selgin]). I do not settle it.
- One theoretical result bears directly on "signed trades": in a class of models, anything money achieves can also be achieved by a complete, shared memory of who gave what to whom. Money stands in for that memory where it is missing (sourced: [Kocherlakota]). It is a result inside models, not a field report.

**b. How a hop settles, and who carries the risk.**

- In barter with a go-between good: the sugar-holder takes eggs he does not want, holds them, and trades them on. He carries everything: the eggs may spoil, their price may move, the beef-seller may be gone (sourced: [Menger], [Jevons]).
- In the credit account: the giver hands over goods against a neighbour's debt. The giver carries the default risk, held in check by the community (sourced: [Graeber]).
- Theory on doing without either: getting to the right final holdings through two-party swaps alone, with no central coordinator, takes either a go-between good or far more information and rounds (sourced: [Ostroy-Starr]).

**c. What failed, and what limited size.**

- Large-scale barter is on record where a money failed, and it kept a unit. In Russia the share of industry's sales paid in kind rose from under 10 in 100 (1992) to about 50 in 100 (1998) (sourced: [Mumssen]). Those deals were still priced in roubles, and middlemen and company IOUs carried the chains (sourced: [Woodruff]).
- Size limit, by all accounts: the number of rates grows with the square of the number of goods, and the search for a match grows with the number of traders (sourced: [Jevons]; inferred for search, 85 to 95 in 100).

## 2. Barter cycles and kidney-exchange chains

**a. How prices or cross-rates are formed.**

- There are none in use. Each person ranks what is on offer; an algorithm finds cycles in which everyone gets something they rank higher. Shapley and Scarf showed such a cycle outcome always exists and that it can be backed by prices, but the prices come out of the proof and nobody trades at them (sourced: [Shapley-Scarf]).
- In kidney exchange the law forbids paying for an organ, so a unit is ruled out on purpose (sourced: [RSU 2004]). The matching is set by a registry's algorithm.
- Where the goods differ in worth, a unit crept back. Timeshare swaps began as direct exchange through a deposit pool and their inefficiency is documented; the industry added points (sourced for the deposit and request systems: [Wang-Krishna]; the move to points is inferred from industry practice, 75 to 90 in 100).

**b. How a hop settles, and who carries the risk.**

- **Cycles.** A's donor gives to B, B's donor to C, C's donor to A. All operations are done at the same time, because a promise to give a kidney cannot be enforced. That needs two operating rooms and two teams per pair at once, which is why cycles of two and three are the norm (sourced: [RSU 2004], [RSU 2007]). Nobody carries risk in the middle; everyone can walk away until the surgery starts, and nobody after.
- **Chains.** A donor with no patient gives first. That patient's donor gives to the next patient, days or months later, and so on. The donor waiting to give is called a bridge donor (sourced: [Rees]). If a bridge donor backs out, the chain stops; nobody upstream has lost a kidney without a transplant. The loss falls on the patients who would have come next, and on the pool.
- **Vouchers.** Since 2014 one registry lets a donor give now and name a person who gets priority for a kidney later. The registry carries that promise (sourced: [Veale]).
- The path-finder is a central registry. Finding the best set of short cycles is a provably hard computing problem at scale (sourced: [Abraham]).

**c. What failed, and what limited size.**

- Breaks are rare but real: 20 broken chains out of 344, and bridge donors who chose not to go on were 1.5 in 100 of 407 (sourced: [Cowan]). All patients left stranded were later transplanted, per the same study.
- The market split up: 62 in 100 of exchange transplants were arranged inside one hospital, and hospitals kept easy matches for themselves, which cost transplants overall (sourced: [Agarwal]).
- Short cycles leave hard-to-match patients behind; long chains were the answer (sourced: [Ashlagi]).
- Size limits: simultaneity caps cycle length; the pool must be large for matches to exist; the longest chain on record is 35 transplants (sourced: [Guinness]).

## 3. Multilateral clearing: WIR, Sardex, commercial trade exchanges

**a. How prices or cross-rates are formed.**

- All three price in the national money by decree of the operator: 1 WIR is 1 Swiss franc, 1 Sardex credit is 1 euro, 1 trade dollar is 1 US dollar. Sellers set their own prices in that unit (sourced: [Studer], [Littera], [IRTA]).
- The same pattern is old. Merchants at the medieval exchange fairs cleared their bills against each other in a unit that existed only in the books and paid only the remainder in coin (sourced: [Einaudi]; for the fairs, [Boyer-Xambeu]).
- Between states: the European Payments Union (1950 to 1958) netted each country's balance against all the others monthly, in a unit defined by a weight of gold (sourced: [CVCE]).

**b. How a hop settles, and who carries the risk.**

- There is no hop to arrange. The baker sells to anyone in the circle, gets credits, and spends them with anyone else. The circle's books are the middle.
- Who carries the risk: (1) the circle as a whole, when a member in debt leaves or fails; WIR covers this by lending against collateral, and Sardex and the trade exchanges by credit limits set per member (sourced: [Studer], [Littera]); (2) each member holding credits, who may find nothing worth buying with them; (3) all members, if the operator spends credits it has not earned.
- In the Payments Union, creditor countries carried part of the risk by quota, part was settled in gold, and capital from the United States stood behind it (sourced: [CVCE], [Eichengreen]).
- A variant with no credit at all: Slovenia has cleared company invoices in cycles since 1991. A central office finds loops of mutual debts and cancels them; it carries no risk (sourced: [Fleischman]).

**c. What failed, and what limited size.**

- Operators over-issuing: trade-exchange owners have spent newly made credits on themselves until members' balances lost their worth; the industry body's own guidance warns that this ends in collapse and total loss of balances (sourced: [Forbes-Healey], [IRTA]).
- Argentina's barter clubs, which ran on paper credits, reached about 2.5 million people in 2002 and fell to about 150,000 by 2006, with forged credits and lost trust among the named causes (sourced: [Gómez]).
- WIR shrank: turnover of 2.1 billion in 1997, 1.43 billion in 2014, 1.12 billion in 2017 (sourced: [Studer], [WIR reports]). WIR credits have at times traded below a franc (sourced: [Studer], B). The cause of the decline is not established in what I read.
- Sardex stayed regional: about 3,200 firms and 43 million euros a year in 2018, roughly a tenth of its members' trade (sourced: [Fleischman]). Its operator spoke in 2022 of internal difficulties and old debts (sourced: [Italia che Cambia]).
- Size limit, common to all: credits can only be spent inside the circle, so each member accepts them for only a part of its sales.

## 4. Ripple's original routing through trust lines

This is Fugger's design of 2004, before the later ledger and its token.

**a. How prices or cross-rates are formed.**

- There is no shared unit. Each pair of people who trust each other opens a line and chooses the unit their IOUs are counted in. A payment travels in one unit; where two units meet, the person at that point exchanges at a rate of their own (sourced: [Fugger], B for this detail).
- So there are many units, set pair by pair, and cross-rates are set by whoever stands at the crossing.

**b. How a hop settles, and who carries the risk.**

- A wants to pay D. A is trusted by B, B by C, C by D. The payment is three changes of debt: A owes B more, B owes C more, C owes D more. D is paid with C's IOU, which D trusts. No IOU of A's ever reaches D (sourced: [Fugger]).
- Each person in the middle ends level in amount but exposed: B now holds A's debt and owes C. B carries A's default, up to the limit B set for A.
- Making all three changes happen or none was the unsolved part, known as the decentralised commit. The project's own notes list the options: a registry everyone trusts, a plain commit that is not all-or-nothing, or a blockchain. With time limits instead, a middle person can be left having paid forward and not been paid (sourced: [Ripple wiki], through [fiatjaf], a secondary account).

**c. What failed, and what limited size.**

- The original stayed small (inferred, 80 to 95 in 100: I found no usage figures, and the later history treats it as a prototype).
- The later ledger (2012) solved the commit by putting every line on one shared record, and added a token as a bridge between units. A payment through several offers there is all-or-nothing (sourced: [XRPL docs]).
- What then showed on that ledger in 2017: the network hung on a few hubs, and removing about 10 would split it; about 13 million dollars of credit was exposed because ordinary users had been left as go-betweens without knowing it, letting others swap good IOUs for weaker ones through them; 4.9 million dollars was stuck at one faulty hub; 84 wallets gained over 4.5 million dollars in a month from stale offers (sourced: [Moreno-Sanchez]).
- Size limit: a payment gets through only if every line on the path has room, and that depends on how densely people trust each other (sourced: [Dandekar]). People extended trust to few, so hubs formed, and a hub is a party carrying the risk (inferred, 70 to 85 in 100, from [Moreno-Sanchez]).

## 5. All-or-nothing settlement across separate deals

**a. How prices or cross-rates are formed.**

- They are not formed here at all. The two sides agree a rate somewhere else, then lock. No unit is needed; each leg is in its own asset (sourced: [Nolan], [Herlihy]).

**b. How a hop settles, and who carries the risk.**

- **Two-party swap.** Alice picks a secret and locks her coins so that Bob can take them only by showing the secret, with a refund to her after, say, two days. Bob sees this and locks his coins for Alice on the same secret, with a refund after one day. Alice takes Bob's coins, which shows the secret; Bob uses it to take hers (sourced: [Nolan]).
- **Many parties.** The same works around any set of swaps that closes into loops, with some parties as secret-holders and time limits that grow with the length of the longest path (sourced: [Herlihy]).
- **A chain of payments.** Lightning uses the same lock hop by hop, with shorter time limits toward the receiver (sourced: [Poon-Dryja]).
- **Who carries what.** Nobody carries default. The risks are: delay, for everyone who has locked; a free option, for the secret-holder, who can watch the price until the deadline and walk away at no cost; and loss for anyone who is offline when their deadline passes (sourced: [Han], [ZmnSCPxj]). The missing price of that option has been put at 2 to 3 in 100 of the amount for volatile assets (sourced: [Han]).
- **The lock is not nothing in the middle.** Fair exchange between two parties with no trusted third party is proven impossible; in these designs the ledgers and their clocks are the third party (sourced: [Pagnia-Gärtner], [Zamyatin]).
- Ordinary finance met the same problem (one side of a currency deal paid, the other failed, 1974) and answered it with a party in the middle (sourced: [BIS], B).

**c. What failed, and what limited size.**

- Lightning's builders argued the free option makes hops across different assets unworkable for the middle parties, and the network stayed single-asset (sourced: [ZmnSCPxj]; "stayed" is inferred, 80 to 95 in 100).
- Locked funds can be tied up by others at almost no cost, since a failed payment pays no fee (sourced: [Shikhelman-Tikhomirov]). Deadlines can be attacked by crowding the ledger (sourced: [Harris-Zohar]).
- A hop-by-hop protocol that began with both a notary mode and a time-limit mode says in its own paper that the time-limit mode leaves the middle party with risk (sourced: [Interledger]).
- Size limits: capital sits locked for the whole wait; every party must stay online; time limits add up along the path. I found no report of multi-party swaps (Herlihy's kind) in use at scale.

## The shared building blocks

Findings, not proposals. These are the pieces that appear in every family that worked, under different names.

| Piece | Barter and money | Kidney exchange | Clearing circles | Trust lines | Locks |
|---|---|---|---|---|---|
| An offer naming both sides | haggling | a pair's listing | a price list | a line and a rate | the locked terms |
| Something that finds the path or ring | the trader, on foot | the registry's algorithm | not needed inside the circle; brokers | the router | the parties, beforehand |
| A claim that moves in place of the good | a debt, a coin | none (the good moves); later a voucher | a credit balance | an IOU | a locked output |
| A cap on exposure | personal trust | the gift at the head of a chain | credit limit, collateral, quota | the line's limit | the amount locked, the deadline |
| An order of settlement | hand to hand | same hour, or gift first | book entry | hop by hop | secret, then deadlines |
| A record all parties accept | memory, tally | the registry | the operator's books | each pair's books; later one ledger | each ledger |
| What happens on a break | the creditor's loss | priority for the stranded | the circle absorbs | the neighbour absorbs | refund after the deadline |

The smallest set shared by all five (inferred, 75 to 90 in 100, from the table): an offer naming both sides; a path-finder; a cap on exposure; an order of settlement; a record all parties accept; a rule for breaks.

Two pieces are shared by four of five and absent where the frame bent. A unit of account is absent from kidney exchange, which prices nothing. A claim that moves in place of the good is absent from kidney cycles, which is why they need everyone in surgery at once.

## Settling several agreements as one

Does any family settle several separate agreements as one, with no party in the middle? Not strictly. Each case has something in the middle: a shared record with a clock, or people present at the same hour. What differs is whether the thing in the middle carries money risk.

| Way | What is in the middle | Who waits | Who locks what | Who can walk away, and when |
|---|---|---|---|---|
| Same-hour ring (kidney cycles) | a registry that matches; it carries no risk | all, until a common date | nothing; all must be present | anyone, until it starts; nobody after |
| Gift-first chain (kidney chains) | a registry; the pool absorbs breaks | each next patient, days to months | nothing | the waiting donor, at any time; cost falls on the next patient |
| One shared record (XRP ledger, Stellar path payments) | the record's keepers, and the issuers of each claim | nobody | nothing beyond the instant | anyone, until the stroke; nobody after |
| Loop cancelling (Slovenia) | a central office; it carries no risk | until the next clearing run | nothing | not applicable: only existing debts are cancelled |
| Hash locks, two parties | each ledger and its clock | both, up to the deadlines (hours to days) | both lock the full amount | the secret-holder, free, until the first deadline |
| Hash locks, many parties | each ledger and its clock | all; longer with path length | all lock the full amount | each secret-holder, until its deadline |
| Notaries (Interledger's first mode) | a chosen group that decides commit or abort | all, until the notaries decide | all | nobody once the notaries commit |

Sources for the rows: [RSU 2004], [Rees], [Cowan], [XRPL docs], [Stellar docs], [Fleischman], [Nolan], [Han], [Herlihy], [Interledger]. The time ranges for hash locks are inferred from how the deadlines are set (80 to 95 in 100).

Costs in one line each:

- Same-hour ring: no risk, but short rings only.
- Gift-first chain: long, but someone must give first for nothing, and about 6 in 100 chains broke ([Cowan]: 20 of 344).
- One shared record: instant and all-or-nothing, but every good must first exist as a claim on that one record, and the claim is only as good as its issuer.
- Hash locks: no shared record needed, but capital waits, someone holds a free option, and all must stay online.

## What these sources cannot tell

- **Whether a market for many unlike goods can run with no unit at all.** I found no such case at scale. That is an absence in what I read, not proof it cannot be done. Kidney exchange is the only large case without a unit, and it has one kind of good.
- **Whether prices read from goods-for-goods trades agree with each other.** No source measured this, because every system at scale quoted in one unit. I found no dataset of pure barter rates.
- **Who should carry the wait.** The sources show who did. They do not rank the ways.
- **Anything about perishable or bulky goods hopping.** Every hop in these sources moved a claim, or else a kidney under a surgeon's hands. What a claim on eggs is worth when the eggs are a week older is outside all five families.
- **The barter-before-money question.** It stays open; see family 1.
- **Recent numbers.** WIR after 2017, Sardex after 2022 and kidney exchange after 2016 are not covered here.
- **Full texts.** This session's network refused several hosts, among them Fugger's own site, the Ripple users' list, and the host of Studer's WIR study. Sources marked (B) were not opened here. The account of Ripple's commit problem rests on a secondary summary of the project's notes. A second pass with those hosts open would firm up families 3 and 4 most.
- **My own search.** I looked for a case that breaks the frame in: kidney chains, Russian barter in the 1990s, ancient economies with units but no coin, the Payments Union, Slovenia's loop cancelling, gift economies as the anthropologists describe them, and single-ledger path payments. Kidney chains bend it. The others each have a unit, a risk-carrier or a lock. A search of this length can miss a case.

## Sources

Family 1

- [Jevons] W. S. Jevons, *Money and the Mechanism of Exchange*, 1875, ch. 1. https://www.econlib.org/library/YPDBooks/Jevons/jvnMME.html (B)
- [Smith] A. Smith, *The Wealth of Nations*, 1776, book I ch. 4. https://www.econlib.org/library/Smith/smWN.html (B)
- [Menger] C. Menger, "On the Origin of Money", *Economic Journal* 2(6), 1892. https://doi.org/10.2307/2956146 (B)
- [Walras] L. Walras, *Éléments d'économie politique pure*, 1874 (the numéraire). (B)
- [Mitchell-Innes] A. Mitchell-Innes, "What is Money?", *Banking Law Journal*, May 1913. (B)
- [Knapp] G. F. Knapp, *The State Theory of Money*, 1905, English 1924. (B)
- [Radford] R. A. Radford, "The Economic Organisation of a P.O.W. Camp", *Economica* 12(48), 1945. https://doi.org/10.2307/2550133 (B)
- [Ostroy-Starr] J. Ostroy and R. Starr, "Money and the Decentralization of Exchange", *Econometrica* 42(6), 1974. https://doi.org/10.2307/1914220 (B)
- [Humphrey] C. Humphrey, "Barter and Economic Disintegration", *Man* 20(1), 1985. https://doi.org/10.2307/2802221 (A, through secondary quotation)
- [Kiyotaki-Wright] N. Kiyotaki and R. Wright, "On Money as a Medium of Exchange", *Journal of Political Economy* 97(4), 1989. https://doi.org/10.1086/261634 (B)
- [Kocherlakota] N. Kocherlakota, "Money Is Memory", *Journal of Economic Theory* 81(2), 1998. https://doi.org/10.1006/jeth.1997.2357 (B)
- [Graeber] D. Graeber, *Debt: The First 5,000 Years*, Melville House, 2011, ch. 2. (A for his use of Humphrey; B for the rest)
- [Selgin] G. Selgin, "The Myth of the Myth of Barter", Alt-M, 2016. https://www.cato.org/blog/myth-myth-barter (A for the piece; B for the argument as summarised)
- [Janssen] J. J. Janssen, *Commodity Prices from the Ramessid Period*, Brill, 1975. (B)
- [Powell] M. Powell, "Money in Mesopotamia", *Journal of the Economic and Social History of the Orient* 39(3), 1996. (B)
- [Einaudi] L. Einaudi, "The Theory of Imaginary Money from Charlemagne to the French Revolution", 1936, English 1953. https://econpapers.repec.org/RePEc:pal:palchp:978-0-230-52297-8_13 (A)
- [Boyer-Xambeu] M.-T. Boyer-Xambeu, G. Deleplace, L. Gillard, *Private Money and Public Currencies: The Sixteenth Century Challenge*, 1994. (B)
- [Mumssen] C. Mumssen, paper on non-monetary payments in Russia, IMF seminar, 2000. https://www.imf.org/external/pubs/ft/seminar/2000/invest/pdf/mumssen.pdf (A)
- [Woodruff] D. Woodruff, *Money Unmade: Barter and the Fate of Russian Capitalism*, Cornell, 1999. (B)

Family 2

- [Shapley-Scarf] L. Shapley and H. Scarf, "On Cores and Indivisibility", *Journal of Mathematical Economics* 1(1), 1974. https://doi.org/10.1016/0304-4068(74)90033-0 (B)
- [RSU 2004] A. Roth, T. Sönmez, U. Ünver, "Kidney Exchange", *Quarterly Journal of Economics* 119(2), 2004. https://doi.org/10.1162/0033553041382157 (B)
- [RSU 2007] A. Roth, T. Sönmez, U. Ünver, "Efficient Kidney Exchange: Coincidence of Wants in Markets with Compatibility-Based Preferences", *American Economic Review* 97(3), 2007. https://econpapers.repec.org/RePEc:aea:aecrev:v:97:y:2007:i:3:p:828-851 (A)
- [Abraham] D. Abraham, A. Blum, T. Sandholm, "Clearing Algorithms for Barter Exchange Markets", ACM EC, 2007. https://doi.org/10.1145/1250910.1250954 (B)
- [Rees] M. Rees and others, "A Nonsimultaneous, Extended, Altruistic-Donor Chain", *New England Journal of Medicine* 360, 2009. https://doi.org/10.1056/NEJMoa0803645 (A)
- [Ashlagi] I. Ashlagi, D. Gamarnik, M. Rees, A. Roth, "The Need for (Long) Chains in Kidney Exchange", NBER working paper 18202, 2012. https://www.nber.org/papers/w18202 (A)
- [Cowan] N. Cowan and others, "Broken Chains and Reneging: A Review of 1748 Kidney Paired Donation Transplants", *American Journal of Transplantation* 17(9), 2017. https://www.kidneyregistry.com/wp-content/uploads/2021/03/Broken-Chains-and-Reneging_-A-Review-of-1748-Kidney-Paired-Donation-Transplants.pdf (A)
- [Veale] J. Veale and others, "Vouchers for Future Kidney Transplants to Overcome 'Chronological Incompatibility' Between Living Donors and Recipients", *Transplantation* 101(9), 2017. https://escholarship.org/uc/item/4rq2x3hp (A)
- [Agarwal] N. Agarwal, I. Ashlagi, E. Azevedo, C. Featherstone, Ö. Karaduman, "Market Failure in Kidney Exchange", *American Economic Review* 109(11), 2019. https://www.nber.org/papers/w24775 (A)
- [Wang-Krishna] Y. Wang and A. Krishna, "Timeshare Exchange Mechanisms", *Management Science* 52(8), 2006. https://doi.org/10.1287/mnsc.1060.0513 (A)
- [Guinness] Guinness World Records, "Longest kidney transplant chain" (35, verified 2015). https://guinnessworldrecords.com/world-records/107374-longest-kidney-transplant-chain (A)

Family 3

- [Studer] T. Studer, *WIR and the Swiss National Economy*, WIR Bank, 1998. https://base.socioeco.org/docs/wir_and_the_swiss_national_economy.pdf (A for the 1997 turnover; B for the rest)
- [Stodder] J. Stodder, "Complementary Credit Networks and Macroeconomic Stability: Switzerland's Wirtschaftsring", *Journal of Economic Behavior & Organization* 72(1), 2009. https://econpapers.repec.org/RePEc:eee:jeborg:v:72:y:2009:i:1:p:79-95 (A; background)
- [WIR reports] WIR Bank annual reports 2014, 2015, 2017. https://gb.wir.ch/de/2017/r%C3%BCckblick and https://www.wir.ch/fileadmin/downloads/Publikationen/Geschaeftsbericht/investor-relations-geschaeftsbericht-2014-fr.pdf (A)
- [Littera] G. Littera, L. Sartori, P. Dini, P. Antoniadis, "From an Idea to a Scalable Working Model: Merging Economic Benefits with Social Values in Sardex", *International Journal of Community Currency Research* 21, 2017; and L. Sartori and P. Dini, https://researchonline.lse.ac.uk/id/eprint/67135/ (A for figures; B for the credit-limit detail)
- [Fleischman] T. Fleischman, P. Dini, G. Littera, "Liquidity-Saving through Obligation-Clearing and Mutual Credit", *Journal of Risk and Financial Management* 13(12), 2020. https://www.mdpi.com/1911-8074/13/12/295 (A)
- [Italia che Cambia] interview with SardexPay, December 2022. https://www.italiachecambia.org/2022/12/sardexpay-crisi-cambiamento-valori/ (A)
- [Forbes-Healey] C. Forbes and N. Healey, "Barter Exchanges and Small Business: An Investigation of the Transferability of the US Model to Europe", *Journal of Enterprising Culture* 7(4), 1999. https://ideas.repec.org/a/wsi/jecxxx/v07y1999i04ns0218495899000194.html (A)
- [IRTA] International Reciprocal Trade Association, library and guidance on exchange deficits. https://irta.com/library/ (A)
- [Gómez] G. Gómez, *Argentina's Parallel Currency: The Economy of the Poor*, 2009. https://www.cambridge.org/core/books/argentinas-parallel-currency/smaller-scale-trueque/9C7FFABE441FA6051CDA3EF15918911E (A for the collapse; figures through secondary accounts)
- [CVCE] "The OEEC and the EPU", CVCE, University of Luxembourg. https://www.cvce.eu/education/unit-content/-/unit/en/026961fe-0d57-4314-a40a-a4ac066a1801/22243aaf-3f7c-429e-b98c-283989b2b5e9 (A)
- [Eichengreen] B. Eichengreen, *Reconstructing Europe's Trade and Payments: The European Payments Union*, 1993. (B)

Family 4

- [Fugger] R. Fugger, "Money as IOUs in Social Trust Networks & A Proposal for a Decentralized Currency Network Protocol", 2004. https://ripple.ryanfugger.com/decentralizedcurrency.pdf (A for title, date and the hop through a trusted go-between; B for the rest)
- [Ripple wiki] The original project's protocol notes. https://ripple.ryanfugger.com/Protocol/Introduction.html (B)
- [fiatjaf] "Ripple and the problem of the decentralized commit", a secondary account. https://fiatjaf.com/3cb7c325.html (A, through search summary)
- [Dandekar] P. Dandekar, A. Goel, R. Govindan, I. Post, "Liquidity in Credit Networks: A Little Trust Goes a Long Way", ACM EC, 2011. https://arxiv.org/abs/1007.0515 (B)
- [Moreno-Sanchez] P. Moreno-Sanchez, N. Modi, R. Songhela, A. Kate, S. Fahmy, "Mind Your Credit: Assessing the Health of the Ripple Credit Network", WWW 2018. https://arxiv.org/abs/1706.02358 (A)
- [XRPL docs] XRP Ledger documentation: cross-currency payments, rippling, auto-bridging. https://xrpl.org/cross-currency-payments.html https://xrpl.org/rippling.html https://xrpl.org/autobridging.html (A)
- [Stellar docs] Stellar documentation: path payments. https://developers.stellar.org/docs/encyclopedia/path-payments (A)

Family 5

- [Nolan] T. Nolan, "Alt chains and atomic transfers", Bitcoin Forum, 2013. https://bitcointalk.org/index.php?topic=193281.msg2224949#msg2224949 (B)
- [Poon-Dryja] J. Poon and T. Dryja, "The Bitcoin Lightning Network", 2016. https://lightning.network/lightning-network-paper.pdf (B)
- [Interledger] S. Thomas and E. Schwartz, "A Protocol for Interledger Payments", 2015. https://interledger.org/interledger.pdf (A)
- [Herlihy] M. Herlihy, "Atomic Cross-Chain Swaps", PODC 2018. https://arxiv.org/abs/1801.09515 (A)
- [ZmnSCPxj] "HTLCs as American Call Option, or, How Lightning Currently Cannot Work Across Assets", lightning-dev list, December 2018. https://lists.linuxfoundation.org/pipermail/lightning-dev/2018-December/001758.html (A)
- [Han] R. Han, H. Lin, J. Yu, "On the Optionality and Fairness of Atomic Swaps", ACM AFT, 2019. https://eprint.iacr.org/2019/896 (A)
- [Pagnia-Gärtner] H. Pagnia and F. Gärtner, "On the Impossibility of Fair Exchange without a Trusted Third Party", TU Darmstadt report TUD-BS-1999-02, 1999. (B)
- [Zamyatin] A. Zamyatin and others, "SoK: Communication Across Distributed Ledgers", Financial Cryptography 2021. https://eprint.iacr.org/2019/1128 (A)
- [Harris-Zohar] J. Harris and A. Zohar, "Flood & Loot: A Systemic Attack on the Lightning Network", 2020. https://arxiv.org/abs/2006.08513 (A, title and subject)
- [Shikhelman-Tikhomirov] C. Shikhelman and S. Tikhomirov, "Unjamming Lightning: A Systematic Approach", 2022. https://eprint.iacr.org/2022/1454 (A, through secondary summary)
- [BIS] Committee on Payment and Settlement Systems, "Settlement Risk in Foreign Exchange Transactions", Bank for International Settlements, 1996. (B)
