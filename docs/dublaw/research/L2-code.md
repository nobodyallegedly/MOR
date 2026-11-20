# DubLaw research L2 of 5: agreements run by code, what could be checked and what broke

Written by Claude, for DubLaw, on 20 November 2026. A record of work. It informs DubLaw's constitution and way of working, and it decides nothing.

## The wish

As carried at the top of this session's prompt (Nobody, allegedly, 20 November 2026). I searched the repository for it and did not find it in `docs/decisions.md`, so it is given here as relayed:

> "First, I want you to work on your own constitution and workflow. For that, you can run research sessions first to inform you. You are the agreement specialist. Contracts, smart contracts, so much is out there and there must be research on them and how to best shape them. Agreements runs on cMIPs from a basic grammar there is a whole lot to do."

## How to read the marks

How far each source was checked:

- **read**: a research thread of this session opened the page and read it.
- **summary**: seen only in a search engine's summary of the page. The page itself could not be opened (see Limits). Every figure marked this way is to be confirmed on its page.
- **background**: not checked against any source in this session.

The ground of each finding:

- **counted**: taken from a source's own figures.
- **traced**: followed through the sources named.
- **inferred**: my reading.

Sources are named by a key in square brackets and listed at the end.

## Two things to know before reading

- **The two reports I was asked to read first could not be reached.** R1 (`claude/MOR-research-grammar-prior-art.md`) and R2 (`claude/MOR-research-order-without-ledger.md`) live in the MOR project, which this session cannot open, and they are not in this repository. I went on without them. Where this report touches Marlowe, Daml or other languages it keeps to practice and failure, and it may repeat what R1 holds without my knowing.
- **Most pages could not be opened.** This session's network allowed search and GitHub only. Specifications, proofs, audit responses and protocol documents kept on GitHub were read in full. Court opinions, regulators' releases, papers and press were seen as search summaries only. The courts section, where care with facts was asked for, rests entirely on summaries.

---

## 1. In plain words

1. **The frame is half right, and the evidence breaks it on both tests.** I say this first, as asked. The detail is in the next section.
2. **The shape guarantees did hold where they were small.** A Bitcoin timelock, a Discreet Log Contract's list of outcomes, Daml's rule that nobody is bound without their authority: I found no case where the guarantee itself failed.
3. **Large failures happened in code that never changed.** The DAO, the Parity freeze, Mango, Euler, Balancer: each would have passed a check of shape. The text was public and did what it said. What it said was not what people thought they had agreed.
4. **Most rescues depended on someone being able to change or stop things.** The DAO fork, court-ordered upgrades, validators freezing stolen funds. The same power that caused the worst losses also produced most of the recoveries.
5. **Since 2022 the biggest losses came from around the agreement:** stolen keys, and signers shown one thing while signing another. A shape check does not see this layer at all.
6. **Courts did not treat code as law. They looked for stated rules.** Where a platform had published no rules in words, two United States judges found nothing that had been misrepresented. Other courts bound people who had signed nothing.
7. **Audits and proofs help, inside their scope.** They prove the text meets a written property. They missed wrong properties, later changes, the tools underneath, and keys. No source can say how much safer an audited contract is.
8. **Where the designers proved the most, people used it the least.** Marlowe is the best-proven design and I found no usage count for it. The most-used design, Daml, lets code change under signed parties by an operator's consent.

### Does the evidence break the frame?

Yes, in three ways. All three are my reading (inferred), resting on the cases in section 2.

**Test one: major failures that a shape check would have passed.** There are many.

- The DAO's code was public, fixed, and its terms said the code governed. It ended, it balanced, every holder had joined by their own act.
- The Parity wallets were fixed too. They depended on a shared part that anyone could take over and delete.
- Mango's price source was named in advance. The named source could be moved by a trader with enough money.
- Balancer's code stood unchanged for about four years before its rounding flaw was used.
- Marlowe proved "what goes in comes out" and auditors then found the proof did not tell currencies apart.

**Test two: lasting successes that depended on code that could change.** There are several.

- The DAO's holders were made whole by a fork.
- A court used an upgrade key to recover funds taken from Wormhole.
- Validators and councils froze stolen funds on Sui and Arbitrum.
- The largest production use found, Broadridge's repo platform on Daml, runs on a system where code is upgraded under existing contracts.

**A third thing the frame does not name: the layer around the agreement.** Who holds the keys, what a signer's screen showed, and who is bound by taking part without signing. The largest single loss in the record (Bybit, about $1.5 billion) was signers approving something other than what they were shown.

**What survives of the frame.** Shape guarantees are necessary and they did hold where the text was small enough to read whole. They are not sufficient. "Code that could change" is better stated as "someone could change it without the signers' fresh consent". And "outside facts from a source named in advance" needs a second half: naming the source does not make it honest or hard to move.

---

## 2. Case by case

Each case gives: what was promised; whether a reader could check it before signing; what broke, who bore the loss and how it was settled; the figures.

### 2.1 Marlowe (Cardano)

**Promised.** A contract always ends, every wait has a deadline, money left at the end goes back to its accounts, and what goes in equals what comes out.

**Checkable before signing?**

- By reading: the language has no loops, no recursion, and deadlines are fixed numbers. Participants and logic cannot be changed after creation. (traced, read: [M1])
- Proven once for all contracts, in machine-checked proofs: after the last deadline an empty transaction closes the contract and empties its accounts, and that transaction cannot fail. (traced, read: [M2])
- Only by running a tool: warnings for a particular contract, such as a payment that cannot be made in full, and whether the contract fits Cardano's size and cost limits. For large contracts the analysis can take tens to hundreds of minutes. (traced, read: [M1])
- Two qualifications. The proof files for the static analyser itself leave its soundness and completeness stated but unproved. (traced, read: [M3]) And the first money-preservation proof added amounts without regard to currency. (traced, read: [M4])

**What broke.** Nothing on the live network that I could find. What the record shows is a gap between the proven model and the thing that runs, found by audit before much use:

- An audit in early 2023 raised 113 numbered findings: 10 high, 10 medium, 93 low. (counted, read: [M4], which is the designers' own response to the audit; the audit report itself was not opened)
- The proofs were about one piece of code and the chain ran another. The auditors said this made the proofs inapplicable to the running code. It was answered by review and tests, because carrying the proven code over would have exceeded the chain's limits. (traced, read: [M4])
- The changes made after the audit were not audited again. (traced, read: [M4])
- A contract can still be locked for good if every possible next step is too large or too costly for the chain to accept. The designers' own guide lists the closing step among those that can lock. A later change to the chain's limits could strand a contract valid today. (traced, read: [M1])

**Was it used, and how much?** Launched on the main network in mid-2023 (summary: [M5]). **No count of contracts, transactions or value was found.** A gallery lists about 19 demonstration contracts (counted, read: [M6]). In 2024 the designers' company stopped development and handed the work to an independent group (traced, read: [M7]). That no tally exists is suggested by a 2025 funding proposal promising to start one (inferred, summary: [M8]).

**Loss and settlement.** No loss found.

### 2.2 Daml

**Promised.** No party is made a signatory of a contract, and so bound by it, without their own authority. The usual way to gather it is propose and accept: one party proposes, the other accepts, and both authorities flow into the result.

**Checkable before signing?**

- By reading: who the signatories, observers and controllers are is written in the template. (traced, read: [D1])
- Not by reading the heading alone: a signatory also lends authority to whoever may exercise a choice on the contract. What that choice then does needs the body read. (inferred from [D1])
- Enforced when it runs: a transaction that binds someone without their authority is rejected. (traced, read: [D1], for the rule; that the running system enforces it is background)

**Production use.** (all counted, summary)

| What | Figure | Date | Source |
|---|---|---|---|
| Broadridge's repo platform | over $280 billion a day on average, about $5.9 trillion in the month | August 2025 | [D3] |
| The same | $357 billion a day, $7.5 trillion in the month | June 2026 | [D4] |
| Goldman Sachs platform, first issue | a €100 million two-year bond for the European Investment Bank | 29 November 2022 | [D5] |
| Hong Kong exchange's Synapse | launched; no usage figure found | 9 October 2023 | [D6] |
| Canton Network | live | mid-2024 | [D7] |

The Broadridge figures are the company's own.

**What broke.**

- **A project, not the guarantee.** The Australian exchange cancelled its Daml-based replacement of its settlement system on 17 November 2022 and wrote off A$245 to 255 million before tax. The outside review blamed design, scale and delivery. (counted, summary: [D8]) No source reports anyone bound without authority.
- **No failure of the authorization rule in production was found.**
- Auditors place Daml's faults in what templates say: balances that do not add up, the wrong controller, timing. (summary: [D9]) So the rule holds and a template can still hand over more than a signer meant. (inferred)
- I found no finished machine-checked proof of the authorization rule. (not found)

**Code does change under signed parties.** A new version of a package may change what a choice does, who controls it, and the condition a contract must satisfy. Existing contracts are then used with the newest version. Signatories must stay the same. Consent is given by each participant node "vetting" the new package, which is on by default when a package is uploaded. (traced, read: [D2]) So consent sits with whoever runs the node that hosts a party, and no fresh signature from each signatory appears in the document. (inferred)

### 2.3 Bitcoin

#### Timelocks and hash-locks

**Promised.** A coin cannot move before a set time; or it moves to whoever shows a secret, and goes back after a deadline.

**Checkable before signing?** Yes, by reading. The script is short and fixed, and each party can read all of it before paying in. (inferred; rule text read: [B1])

**What broke.** No failure of the primitive was found. Every failure found is around it: getting one's claim into a block before the deadline.

- A counterparty can keep pushing the victim's refund out of the waiting pool until the deadline passes (reported October 2023). The loss falls on a node forwarding payments for others. Use in the wild: not found. (traced, read: [B2])
- A node cut off from the network can be shown a slowed clock. Research only. (traced, read: [B3])
- In a swap between two chains, one side can walk away if the price moves and the other waits out the lock. Documented losses: not found. (summary: [B4])

**Settlement.** By the chain alone. No court case found.

#### Lightning's penalty

**Promised.** If your counterparty publishes an old state of the channel, you may take everything in it.

**Checkable before signing?** The rule, yes, by reading. (read: [B5]) What cannot be read off the text is the standing duty it puts on the honest side: watch the chain or pay a watcher, and keep every old revocation for as long as the channel lives. (traced, read: [B6])

**What broke.**

- **The penalty cannot tell a cheat from a mistake.** Restoring an old backup can publish an old state and forfeit the whole balance to an honest peer. A count of such cases: not found. (summary: [B7])
- One study in 2019 counted 241 penalty transactions claiming 2.22 BTC since late 2017, and said many may not have been theft attempts. The network then held about 911 BTC. (counted, summary: [B8])
- In 2019, software did not check that a channel's opening payment was real, so a node could accept payments it could never enforce. No use before the warning is known. (traced, read: [B9])
- In October and November 2022, two unusual transactions stopped one widely used implementation from following the chain, which left its channels unwatched. (traced, read: [B10])

**Loss and settlement.** By design the loss falls on whoever fell behind, lost data, or forwarded for others. No confirmed large theft was found. Settlement is by the chain.

**What the designers now want.** A replacement where publishing an old state costs only fees, so that a mistake is no longer punished as fraud and only the latest state need be kept. It needs a rule change to Bitcoin and is not deployed. (traced, read: [B11])

**Size.** Public capacity of roughly 3,200 to 3,500 BTC in late October and early November 2026; sources disagree. (counted, summary: [B12])

#### Discreet Log Contracts

**Promised.** Two parties lock funds. Every possible outcome is a payout prepared in advance. A named oracle publishes its key and its commitment to the event beforehand, and later signs the result; that signature unlocks exactly one payout. The oracle need not know the contract exists. If it never signs, a refund applies. (traced, read: [B13])

**Checkable before signing?** Yes, by reading and checking signatures: every outcome and its payout, the refund, the oracle's key and its announcement. (traced, read: [B13], [B14])

**Not checkable at all:** whether the oracle will tell the truth. The specification says it gives no protection against a party colluding with the oracle. An oracle that signs two different results reveals its private key, so that fault proves itself. A plain lie needs a person to show it. (traced, read: [B14])

**Use and failure.** First live contract on 8 September 2020, a 1 BTC bet. (summary: [B15]) One trading service built on them wound down by 3 November 2024, citing limits of scale. (summary: [B16]) Volumes: not found. **Oracle fraud or double-signing in practice: not found**, which with so little use proves little. (inferred)

#### Covenant proposals

**What they would allow.** A coin whose script limits where it may go next: vaults with a waiting period, many payouts committed in one step, shared pools, and the penalty-free channels above. (traced, read: [B17], [B18])

**What was objected to.** (traced, read: [B17], [B19], [B20])

- Coins bound for ever by rules that copy themselves forward, and the fear of an authority requiring only coins it can later seize.
- One proposal was presented as unable to do that; in 2025 a script was shown on a test network that could only pay back to itself.
- More room for miners to profit from ordering.
- Too narrow, or too little tried.
- The way of adopting it: in April 2022 one author announced software that would start enforcement if miners signalled; critics said changes to the common rules put risk on people who do not use them, and the software was withdrawn.

**State on 20 November 2026.** Nothing has activated. The proposals are still drafts in the proposals register. (counted, read: [B21]) An open letter in 2025 with 66 signatories asked for review within six months; the six months passed without it. (counted, read: [B20]) A later activation attempt is reported in summaries only and I treat it as unverified.

**What it teaches about agreements (inferred).** Changing the rules that every agreement runs on had no agreed procedure, and two pushes produced no change.

### 2.4 The DAO (2016)

**Promised.** The published terms said that the code on the chain set out the terms, and that any explanation in words was for information only. The wording as seen in a summary of a reproduction: "The DAO's code controls and sets forth all terms of The DAO Creation." (summary: [E1]; the original page could not be opened)

**Checkable before signing?** The code was public and the sentence was plain. What the code would do under attack could only be found by running or studying it. Whether the community would honour the sentence could not be checked at all. (inferred)

**What broke.** About 12 million ETH was raised between 30 April and 28 May 2016. (counted, summary: [E2]) About 3.6 million ETH, roughly a third, was drained in June 2016. (counted, summary: [E2]) A letter in the attacker's name claimed the ether as a rightful reward under the terms; its signature is reported as invalid. (summary: [E3])

**Who bore the loss, and how it was settled.** By a fork. At block 1,920,000 the balances were moved to a contract from which holders could withdraw, with no other rule changed. (traced, read: [E4]) Reports of the informal coin vote give about 85 to 87 percent in favour on a turnout near 5.5 percent of supply; sources conflict. (counted, summary: [E5]) Holders on the forked chain lost nothing. The chain that refused the fork carried on, and there the attacker kept the coins. (summary: [E6]) One year later, on 25 July 2017, the United States securities regulator reported that the tokens had been securities. (summary: [E2])

**The lesson for agreements (inferred).** "The code is the whole agreement" was written down, and overridden the first time it mattered.

### 2.5 The Parity multisig freeze (2017)

**Promised.** A wallet that moves only when enough of its owners sign.

**Checkable before signing?** By reading, in principle: the wallet's published code showed that its working part lived in one shared library. Almost nobody read it that way. (inferred) The proposal to restore the funds says the library was meant "to last forever". (read: [E7])

**What broke.** On 6 November 2017 the shared library was taken over and deleted. 587 wallets holding 513,774 ETH were frozen. (counted, summary: [E8]; mechanism read: [E7]) Value at the time is given as $150 to 280 million depending on source. An earlier flaw in July 2017 had let 153,037 ETH be stolen. (counted, summary: [E9])

**Who bore the loss, and how it was settled.** The wallet owners, and by nobody. A proposal to restore the library by a rule change was put to a coin vote in April 2018, reported as about 55 percent against, and withdrawn. (counted, summary: [E10]; status read: [E7])

**The lesson (inferred).** An agreement is only as fixed as everything it depends on. And the fork that rescued The DAO was not repeated: rescue by override is a favour, not a rule.

### 2.6 Upgrades, admin keys, and signers who did not see what they signed

**Promised.** That the published contract is the agreement.

**Checkable before signing?** A reader could see from the code that an upgrade key or a signing group existed. Who held the keys, how carefully, and what their screens would show them could not be checked. (inferred)

**What broke.** (all summary, counted from the sources named)

| Case | Date | Figure | What changed under the parties | Who paid |
|---|---|---|---|---|
| Compound, proposal 62 | 29 September 2021 | about 280,000 COMP at risk, about $80 million | An approved upgrade paid rewards wrongly; the fix had to wait out the same delay as any change | Partly returned by recipients [E11] |
| Ronin bridge | 23 March 2022 | about $620 million | 5 of 9 validator keys taken | The operator raised money and repaid users [E12] |
| Beanstalk | 17 April 2022 | $182 million | A borrowed majority of votes passed a proposal at once | Users [E13] |
| Nomad | 1 August 2022 | $186 to 190 million | A routine upgrade made a blank proof valid | Users [E14] |
| Tornado Cash governance | 20 May 2023 | 1.2 million false votes against about 700,000 real | A proposal claimed to match an earlier one and hid different code | Attacker offered control back [E15] |
| Multichain | July 2023 | about $125 to 130 million | Keys sat under one person's account; he was detained | Users [E16] |
| Munchables | 26 March 2024 | $62.5 million | A developer controlled the upgrade | Returned [E17] |
| Radiant Capital | 16 October 2024 | $50 to 58 million | Three signers' devices showed ordinary transactions | Users [E18] |
| Bybit | 21 February 2025 | about $1.4 to 1.5 billion | The signing interface was altered; signers approved something else | The exchange [E19] |
| Drift | 1 April 2026 | about $285 million | Signers were led to pre-sign hidden admin actions after the delay was set to zero | Not found [E20] |

**The figures on control.**

- A 2022 study found about half of the upgradeable contracts it examined were controlled by a single ordinary account. (counted, summary: [E21])
- In 2024, stolen private keys accounted for 43.8 percent of the value stolen that year. (counted, summary: [A12])
- In the first half of 2025, over 80 percent of stolen value came from attacks on keys and interfaces. (counted, summary: [A13])
- In one study of 110 people, up to 71.8 percent were surprised that a token's contract could be upgraded or could bar them. (counted, summary: [E22])

**Lasting successes that depended on the power to change.** (all summary)

- After the Wormhole theft (2 February 2022, about $320 million, replaced by the bridge's backer), an English court order in February 2023 had an upgrade key used to take back $140 to 225 million. [E23]
- On Sui, validators froze about $162 million of $223 million taken from Cetus in May 2025, and a vote of about 91 percent of stake returned it. [E24]
- On 21 April 2026 nine of twelve members of Arbitrum's council froze 30,766 ETH from another theft by a temporary upgrade. [E25]
- Tether reports about $4.2 billion frozen in total. [E26]

**Lasting successes without it.** Liquity's first version has had no admin key since April 2021 and still runs. (summary: [E27]) Uniswap's second version cannot be upgraded and still runs. (background)

**The lesson (inferred).** In most rows the contract did what it said. What changed was who could change it, or what signers believed they were signing. And the same layer produced most of the recoveries. This is the frame's second break.

### 2.7 Outside facts: oracle manipulation and Mango Markets

**Promised.** That a position is valued at a price from a named source.

**Checkable before signing?** The source's name, yes. How much money it takes to move that source, only by studying the market, and not from the text. (inferred)

**What broke.** On 11 October 2022 a trader pushed the price of the platform's own token up more than thirteen-fold in thirty minutes and borrowed over $110 million against it. (counted, summary: [C1]) He described it publicly as a "highly profitable trading strategy". (summary: [C2]) One firm counted $386.2 million lost in 41 oracle manipulations in 2022. (counted, summary: [E28]; one source) A study of 181 incidents to April 2022 put oracle attacks at 15 percent of incidents. (counted, summary: [A5])

**Who bore the loss, and how it was settled.** Three times over, three ways:

1. **By negotiation.** A vote of the platform's token holders let him return about $67 million and keep about $47 million. The platform's company later sued to undo that as made under duress; outcome not found. (summary: [C1], [C3])
2. **By a jury.** Convicted on 18 April 2024 of fraud and manipulation. (summary: [C4])
3. **By the judge.** On 23 May 2025 the convictions were set aside. Two counts fell on where the case was brought. On wire fraud he was acquitted: the platform had no rules, instructions or terms about borrowing, so nothing false had been represented to it. (traced, summary: [C5], [C6]) The government appealed in July 2025; no decision was found. (summary: [C7])

**The lesson (inferred).** The ruling does not say code is law. It says that where nothing is stated in words, there is nothing to lie about. The absence of written terms protected the taker, not the users.

### 2.8 Bridges

Only what they add: a bridge is an agreement that a small group of signers will attest what happened elsewhere. Ronin and Wormhole above show the two endings. Either the operator had the means and chose to repay, or users bore it. In April 2026 a forged message cost one protocol about $292 million. (summary: [A14]) The attested fact was the weak point each time, as with oracles. (inferred)

### 2.9 Ricardian clauses in practice: EOS

**Promised.** A constitution in words that every user accepted by transacting, with disputes going to a named arbitration forum.

**Checkable before signing?** The words, yes. Who would enforce them and how, no.

**What broke, in the first weeks of June 2018.** (traced, summary: [E29], [E30])

- The 21 block producers froze 7 accounts before the arbitrator had ruled.
- An order to freeze 27 more followed, with reasons promised later.
- A further order then circulated that proved to be forged.
- Within days the main author proposed dropping the constitution.

**How it was settled.** By replacement. The agreement adopted in 2019 describes what the code does, says those functions "do not require the consent of Users", lets 15 of 21 producers change it, and contains no arbitration clause. (traced, read: [E31])

**Were the clauses read or relied on?** I found no dispute or court case that relied on an EOS Ricardian clause, and no study showing users read them. (not found)

### 2.10 "Code is law" before courts and regulators

Every item here is from summaries. Dates are of the latest fact I could confirm.

| Matter | What was held | Date | Source |
|---|---|---|---|
| The DAO report (United States securities regulator) | Automation does not take tokens outside securities law | 25 July 2017 | [E2] |
| Quoine v B2C2 (Singapore, appeal) | Trades made by algorithms stand; mistake is judged by what the programmer knew when writing | 2020 | [C8] |
| Law Commission of England and Wales | Existing law can deal with smart legal contracts; no new statute needed | 25 November 2021 | [C9] |
| Tulip Trading (England, appeal) | Arguable that developers owe duties to owners; never tried, dropped April 2024 | 3 February 2023 | [C10] |
| Sarcuni v bZx (California, federal) | Token holders plausibly partners, each liable for the whole | 27 March 2023 | [C11] |
| Ooki DAO (California, federal) | The DAO is an association and can be penalised; $643,542; judgment by default | 8 June 2023 | [C12] |
| Platypus (Paris) | Two acquitted: the function was open to anyone to call | about 1 December 2023 | [C13] |
| Samuels v Lido (California, federal) | DAO plausibly a partnership; large holders plausibly partners | November 2024 | [C14] |
| Van Loon v Treasury (appeal, fifth circuit) | Contracts nobody can change or control are not property that can be sanctioned | 26 November 2024 | [C15] |
| Risley v Uniswap (appeal, second circuit) | The writer of a contract is not liable for others' misuse | 26 February 2025 | [C16] |
| Eisenberg (New York, federal) | No stated rules, so nothing misrepresented; appeal pending | 23 May 2025 | [C5] |
| Storm, Tornado Cash (New York, federal) | Convicted on one count, jury split on two; retrial set for 26 April 2027; a motion to acquit was still undecided on 7 October 2026 | 6 August 2025 | [C17] |
| EU Data Act, Article 36 | Contracts executing data-sharing agreements must allow safe ending and interruption; the Act applies from 12 September 2025 | 2025 | [C18] |
| Peraire-Bueno (New York, federal) | Acquitted by the judge after a hung jury: no promise had been made about the order of execution | 16 November 2026 | [C19] |

**What the table shows (inferred).**

- No court treated code as the whole of the law. Each asked an ordinary legal question and used the code as evidence.
- Where there were no stated rules, the taker went free (Eisenberg, Peraire-Bueno, Platypus). These are trial-level rulings and one is under appeal.
- Unchangeable code protected its writers (Van Loon, Risley). Changeable code and voting drew liability onto holders who had signed nothing (Ooki, Sarcuni, Lido). The three DAO rulings are early-stage or by default.
- One law now requires the opposite of unstoppable code for one kind of agreement (the Data Act).

### 2.11 Audits, verification, bounties and contests

**The share of exploited contracts that had been audited.** Sources disagree widely, because their samples differ. (all counted, summary)

| Source and who made it | Sample | Figure |
|---|---|---|
| Halborn, a firm that sells audits [A1] | the 100 largest thefts, 2014 to 2024 | 20% had been audited; those carried 10.8% of the value lost |
| CoinGecko, a data site [A2] | 245 incidents, January 2025 to July 2026, $3.63 billion | 60% audited beforehand, carrying 88.44% of losses; 11% of incidents were flaws inside ordinary audit scope |
| A 2026 preprint, two authors from a review firm [A3] | 135 incidents, first half of 2026 | of 68 with a known audit, 46 (67.6%) were attacked wholly outside what any audit covered, carrying 94.4% of those losses |

The two headline figures look opposed and are not. The first sample is weighted to early years; the second includes the Bybit loss, which was not a contract flaw. (inferred) **No source counts the audited contracts that were not exploited**, and the preprint says as much. So nobody can say how much safer an audit makes a contract. (traced, summary: [A3])

**What tools can find.** (counted, summary)

- Automated tools could have prevented about 8 percent of 127 attacks ($149 million of $2.3 billion). [A4]
- About 80 percent of 516 exploitable flaws could not be found by machine. [A6]
- Nearly half of 246 findings from 23 paid audits were unlikely ever to be found by tools. [A7]

**Formal verification in practice.** (traced, summary unless marked)

- *Held.* Ethereum's deposit contract was verified at the level of the code that actually runs, so the translator did not have to be trusted. The work found faults in the contract and in the translator, fixed before launch. [A8]
- *The property was wrong.* A central invariant of the DAI system, believed since launch, was shown false years later; no funds were at risk. [A9]
- *The code changed afterwards.* Euler had about ten audits from six firms. The function used to take about $197 million on 13 March 2023 was added after its formal verification. [A10]
- *The tool underneath was wrong.* In July 2023 pools written correctly lost $47 to 69 million because the translator's lock was broken. [A11]
- *Both sides assumed it could not happen.* One verifier's own post-mortem says none of its rules could have caught the failure, because the scenario had been ruled out as infeasible. [A15]
- *Time in use did not prove safety.* Balancer's second version ran for about four years with large sums, then lost $94.8 million by its own count on 3 November 2025 to a rounding flaw. [A16]
- Marlowe, above, is the same lesson in a second place: the proof was about a different artefact from the one that ran.

**Bug bounties.** (counted, summary; the platform's own figures)

- One platform reports $144.7 million paid by 30 September 2026. [A17]
- Largest single payment: $10 million in 2022 for a flaw in Wormhole's upgrade mechanism, found and fixed before use. [A18]
- The platform's standard is 10 percent of the funds directly at risk, up to a cap. [A17]
- Disputes over unpaid reports are documented, and the platform has added mediation. [A19]
- After a theft, a 10 percent offer brought back over $177 million of Euler's funds within 23 days. In another case the same offer brought nothing. [A20]

**Contests and attack windows before release.** (summary)

- Uniswap's fourth version held a $2.35 million open competition in autumn 2024, reported as finding nothing critical, then a $15.5 million standing bounty. No theft from its core was found to date; the losses were in parts added by others. [A21], [A22]
- Euler's second version held a $1.25 million contest and launched after about 30 audits; no theft found. [A23]
- Contest-reviewed protocols were also exploited (KyberSwap, $48.8 million, November 2023). [A24]
- No independent study comparing contests with firm audits was found. What exists comes from interested parties. (not found)

**After release.** One monitoring firm says it warned of the Euler attack 20 seconds before it began, which did not stop it. (summary: [A25]; the firm's own claim) The pauses that did save money were admin powers used quickly. (inferred)

**Losses by year,** for scale (counted, summary: [A12]): $3.3 billion in 2021, $3.7 billion in 2022, $1.7 billion in 2023, $2.2 billion in 2024, $3.4 billion in 2025.

---

### The table

One row per guarantee. "By running" means a reader needs a tool or a test, not only the text.

| Guarantee | Checkable before signing | Held in practice | The evidence |
|---|---|---|---|
| It ends (finite, every wait has a deadline) | Yes, where the language cannot loop (Marlowe, Bitcoin script) | Yes as proven; but "can end" was not "can be ended" | Marlowe's proofs; a contract can lock when its closing step exceeds the chain's limits (2.1); Lightning deadlines that cannot be enforced in time (2.3) |
| What goes in equals what comes out | By running, or by trusting a general proof | Partly | Marlowe's first proof ignored currency, fixed after audit (2.1); rounding flaws in Balancer and KyberSwap (2.11) |
| Money returns at the end | Yes for a DLC refund or a timelock; by running elsewhere | Yes where small | No primitive failure found in Bitcoin (2.3); Parity's funds never returned (2.5) |
| Nobody is bound without their own signature | Yes for the list of signatories; the reach of what they delegate needs the body read | Yes in the system; no in the courts | No Daml failure found (2.2); token holders treated as partners without signing (2.10) |
| Every outcome is listed in advance | Yes | Yes, on little use | DLC specification; no incident found; volumes not found (2.3) |
| Outside facts come from a source named in advance | The name: yes. Its honesty or how hard it is to move: no | No | Mango; $386.2 million in 41 cases in 2022; DLC specification admits no defence against collusion (2.3, 2.7) |
| A source that signs two answers is exposed | Yes, by reading the scheme | Not tested | DLC specification; no case found (2.3) |
| Cheating is punished by forfeit | Yes, the rule | Partly: it also punished mistakes | 241 penalties, 2.22 BTC to 2019; forfeits from stale backups (2.3) |
| The code is the whole agreement | Yes, it was stated | No | The DAO fork; Mango settled three ways (2.4, 2.7) |
| The code will not change after signing | Only if every dependency is fixed too; the existence of an upgrade key by reading; its holder's conduct not at all | No, as a general rule | Parity; ten cases in 2.6; Daml upgrades by operator consent (2.2) |
| Code that cannot change is safe | No | No | The DAO, Parity, Balancer, the Vyper case (2.4, 2.5, 2.11) |
| A change needs the signers' fresh consent | Yes where the rule says so | Rarely offered | Daml consent sits with the node operator (2.2); half of upgradeable contracts under one account (2.6) |
| What the signer sees is what the signer signs | No | No | Bybit, Radiant, Drift, the Tornado Cash proposal (2.6) |
| The text was audited | Yes, that a report exists; its scope by reading the report | Inside scope, mostly; outside, no | 67.6% of audited victims attacked wholly outside scope; 11% of incidents inside ordinary scope (2.11) |
| The text was formally verified | Yes, that a proof exists; what it proves by reading the property | Yes for the property proven | Deposit contract held; DAI, Euler, Vyper, Marlowe show the four gaps (2.11) |
| Someone can stop or reverse it in an emergency | Yes, that the power exists | Sometimes | Recoveries in 2.6; Parity not rescued; the same power is how most large thefts happened |
| A written constitution with a named arbitrator | Yes, the words | No | EOS, replaced within a year (2.9) |

---

## 3. What a cMIP verifier could give, and the testing discipline

Everything in this section is my reading (inferred). It rests on the cases above and on the prompt's description of MOR: the core proves a signature, a hash and an order and moves nothing; a cMIP is a published text that plugs into one task and returns an answer. I did not read the Agreements draft for this, and I propose no rule.

### 3.1 What a cMIP verifier could give

These are guarantees about shape or about the record, which need only the signed texts and their order.

- **It ends.** A cMIP could answer whether Terms written in its grammar have a deadline on every wait and no way to loop. The record adds a second question that is as important: whether the last step can always be taken by one party alone, with nothing from the other.
- **In equals out, on paper.** A cMIP could check that the amounts Terms name on the way in match those named on the way out, per unit. The Marlowe audit says: per unit, never one sum across units. This is a check on what the Terms say. What is actually held is a seam (3.3).
- **Nobody is bound without their own signature.** The core already proves the signature. A cMIP could answer the Daml question: for these Terms, list everyone who ends up owing something, and show each one's assent. It could also show what each signer lends to others by signing, since that was where Daml's faults lay.
- **The assent names exactly one text, and everything it depends on.** Hash and order give this. The Parity and Daml lessons are that it must reach every text the Terms rely on, including the cMIP that computes the answer. MOR's "nothing is updated, it is published or signed again" is the rule the record most often lacked.
- **A new version binds only those who sign it again.** Checkable from versions that each name the one before, plus assents.
- **Outcomes listed in advance, and the witness named in advance.** The DLC shape: the Terms list each outcome and name whose signed statement selects one.
- **A witness who signs two answers is exposed.** Two signed statements about one event, both valid, are a proof anyone can check with signature and hash alone. This needs no judge.
- **"Unchecked" as an honest answer.** Where the cMIP a text names is not held, saying so plainly is itself a guarantee the record lacked: readers of The DAO and of Parity had no such signal.

### 3.2 What needs someone outside, a witness or a judge

- **Whether an outside fact is true.** A verifier can prove who said it and that they said it once. It cannot prove it is so. Mango and the DLC specification agree on this.
- **Whether the named source is hard to move.** This is a judgment about a market or a person.
- **Mistake or fraud.** Lightning's penalty could not tell them apart and punished both. Singapore's court looked to what the programmer knew.
- **What was meant when the words and the computed answer differ.** The DAO said the code wins and was overridden. EOS said the words win and was abandoned. Neither order of precedence survived on its own.
- **Whether a signer saw what they signed.** No verifier of the record can know what a screen showed. This belongs to clients and to presentation.
- **Who is bound by taking part without signing.** Courts did this to token holders under ordinary partnership law, whatever the system's own rule said.
- **Rescue.** Every large recovery in the record needed someone with the power to stop or reverse. In MOR nothing moves and nothing is updated, so the question changes shape: who may publish what, so that parties can leave and carry on. That is DubLaw's own subject, and the record says it should be answered in advance and in words.
- **Acting in time.** Many Bitcoin failures were an honest party unable to act before a deadline. A verifier can say a deadline passed. It cannot say whether the party could have met it.

### 3.3 Seams with DubPay

Flagged only, not developed. Each concerns money held.

- Money returned at the end, and funds that can be locked for good.
- Forfeits and penalties.
- Hash-locks, timelocks and escrow.
- Freezing or pausing funds in an emergency, and who may.
- Fees and limits that make a valid step impossible to take in time.
- Making users whole after a loss.
- Bounty funds and their payment.
- Whether "in equals out" on paper matches what is actually held.

### 3.4 The testing discipline the record supports

**Before freezing a text**

1. **Check the thing that will run, not a model of it.** Marlowe's proofs were about different code from what ran. The deposit contract was verified as it ran and held. For a text, this means every independent reader works from the frozen text itself and shared test cases. I note as a fact of this repository, from `docs/state-of-mor.md`, that MOR already keeps an independent verifier written from the texts and vectors alone.
2. **Freeze after the last review, never before it.** Euler's flaw came in after verification. Marlowe's fixes were not audited again. Any change after review reopens the review.
3. **Write down the properties and the assumptions, and attack the assumptions.** The DAI and Silo cases broke where both sides had agreed something could not happen.
4. **Do not rely on tools alone.** They catch a minority (about 8 percent of attacks in one study; about 80 percent of flaws beyond machines in another). A hostile human reading is where the logic faults were found.
5. **Review outside the text.** Most audited victims were attacked wholly outside what was audited: keys, signers, interfaces. For MOR that points at clients, at what a signing screen shows, and at how a named cMIP is fetched.
6. **Test that every path can actually be walked, the way out above all.** Marlowe contracts could be valid and still impossible to close. Lightning refunds could be valid and still too late.
7. **Follow every dependency to its end.** Parity.
8. **Open an attack window with a reward before the freeze.** The two largest contests found were followed by no theft from the core they covered. That is two cases, from interested sources, and proves little alone.
9. **Start small.** Guarded launches with caps are recommended in the sources; I found no figures for their effect.

**After freezing**

1. **Keep a standing reward for flaws.** The largest payment in the record bought the fix of a flaw before anyone used it. Rules for payment must be plain, since disputes are documented.
2. **Do not treat age as proof.** Balancer, four years.
3. **Decide in advance what happens when a flaw is found in a frozen text.** A frozen text cannot be patched. The record's two answers were override (The DAO) and nothing (Parity). MOR's own answer would be a new version signed again, which leaves open who warns, and what holds for those who do not sign.
4. **Expect warning without the power to stop.** Monitoring saw Euler coming by seconds.
5. **Keep count.** The field cannot say whether audits work because nobody counted the contracts that survived. A register of what was reviewed, by whom, covering what, and what happened after, is cheap and was missing everywhere.

---

## 4. Questions

One at a time, each tagged. None is decided here.

1. **(core business)** When the words of Terms and the answer a cMIP computes disagree, which stands? The DAO chose the code and was overridden. EOS chose the words and was abandoned.
2. **(core business)** Does an assent reach every text the Terms depend on, including the exact version of each cMIP they name, so that nothing a signer relied on can change without a new signature?
3. **(core business)** If a cMIP is later shown to be flawed, what holds for agreements already signed under it, and for parties who do not sign the next version?
4. **(core business)** Can anyone be bound, or treated as a member of a collective, by taking part without signing? The courts did so for token holders. Should Terms say plainly that MOR's answer is no, knowing a court may still say yes?
5. **(core business)** Should Terms always carry their rules in words as well as in what a cMIP checks? Two United States judges found no fraud where no rules had been stated.
6. **(development layer: cMIPs, Modules)** Should a cMIP that reads Terms answer "can each party always leave alone", as a separate answer from "does it end"?
7. **(development layer: cMIPs, Modules)** Should a witness cMIP require the witness and the list of outcomes to be named before signing, and treat two signed answers to one event as proof against the witness?
8. **(development layer: cMIPs, Modules)** Where an outside fact decides an outcome, who judges a witness who lied only once? The record has no working answer.
9. **(development layer: cMIPs, Modules)** What review must a cMIP pass before a text may name it, and is a change after review a new text?
10. **(development layer: cMIPs, Modules)** Is a penalty or forfeit ever right as a remedy, given that the best-known one punished mistakes like fraud? (A seam with DubPay.)
11. **(presentation)** What must a client show at the moment of signing so that what is seen is what is signed, and should that be a conformance rule?
12. **(presentation)** How does a reader see, before signing, which guarantees were checked by a verifier, which rest on a named witness, and which are "unchecked"?
13. **(presentation)** Should DubLaw keep a public register of what was reviewed, by whom, covering what, and what happened after?

---

## 5. Limits

- **R1 and R2 were not read.** The MOR project could not be reached and the files are not in this repository. Overlap with R1 is possible.
- **Most sources were not opened.** The network allowed search and GitHub only. Marks say which is which. Every "summary" figure needs confirming on its page. A later session with wider network access could lift them; the hosts needed include court and regulator sites, the paper archives, and the main trade press.
- **The courts section rests wholly on summaries.** No opinion was read. The reasoning I report for the Eisenberg and Peraire-Bueno rulings comes from press and law-firm notes. Status after the dates given is unconfirmed, notably the Eisenberg appeal, the Storm motion and any appeal of the 16 November 2026 acquittal.
- **The research was done by five helper sessions** under my brief and then read by me. I did not re-check their summaries against the pages.
- **Many figures come from firms with something to sell:** audit firms, a bounty platform, a monitoring firm, a platform operator. Each is named where used.
- **No denominator.** No source counts audited contracts that were not exploited, so nothing here measures how well audits work.
- **Survivorship.** Failures are well recorded and quiet successes are not. "No failure found" for Daml's rule, for Bitcoin's primitives and for DLC oracles means only that.
- **Usage is uneven.** Marlowe and DLCs have little recorded use, so their clean records are weak evidence.
- **Not found:** Marlowe usage counts; DLC volumes; any court relying on a Ricardian clause; any court treating code alone as the whole contract; a finished machine proof of Daml's rule; totals for two contest platforms; the outcome of the suit to undo the Mango settlement.
- **Sources conflict** on The DAO's vote turnout, the dollar value of several thefts, Lightning's capacity, and the count of Kleros cases. Ranges are given where they do.
- **Quotes** are under fifteen words and one per source. Two of the four come from summaries and may not be word for word: The DAO's terms and the Mango trader's statement.
- I did not read MOR's Agreements draft for this report. Section 3 rests on the prompt's description of MOR and on `docs/state-of-mor.md` for one fact.

---

## 6. Sources

"read" and "summary" as defined at the top.

**Marlowe and Daml**

- [M1] Marlowe best-practices guide, legacy tree (read): https://github.com/input-output-hk/marlowe-cardano/blob/legacy-final/marlowe/best-practices.md
- [M2] Marlowe Isabelle proofs, `Timeout.thy`, `CloseSafe.thy` (read): https://github.com/input-output-hk/marlowe/tree/master/isabelle
- [M3] Marlowe Isabelle proofs, `StaticAnalysis.thy` (read): same repository
- [M4] Designers' response to the audit report (read): https://github.com/input-output-hk/marlowe-cardano/blob/legacy-final/marlowe/test/response-to-audit-report.md
- [M5] Launch announcement (summary): https://www.iog.io/news/marlowe-goes-live-be-the-first-to-explore-the-power-of-marlowes-smart-contract-toolset
- [M6] Gallery of contracts on the main network (read): https://github.com/input-output-hk/real-world-marlowe
- [M7] Transition note (read): https://github.com/marlowe-lang/.github/blob/main/profile/transition.md
- [M8] Funding proposal (summary): https://projectcatalyst.io/funds/12/cardano-use-cases-product/marlowe-2025
- [D1] Daml ledger model, integrity (read): https://github.com/digital-asset/daml/blob/main/sdk/docs/sharable/overview/explanations/ledger-model/ledger-integrity.rst
- [D2] Daml smart contract upgrades (read): https://github.com/digital-asset/daml/blob/main/sdk/docs/sharable/sdk/sdlc-howtos/smart-contracts/upgrade/smart-contract-upgrades.rst
- [D3] Broadridge volumes, August 2025 (summary): https://www.nasdaq.com/press-release/280-billion-average-daily-processed-trade-volumes-broadridge-distributed-ledger-repo
- [D4] Broadridge volumes, 2026 (summary): https://www.broadridge.com/resource/clear-fi
- [D5] Goldman Sachs platform and the bond (summary): https://www.businesswire.com/news/home/20230110005308/en/Goldman-Sachs-Tokenization-Platform-GS-DAP-Leveraging-Daml-Goes-Live
- [D6] Hong Kong exchange release (summary): https://www.hkex.com.hk/News/News-Release/2023/231004news
- [D7] Canton Network launch (summary): https://www.canton.network/canton-network-press-releases/the-canton-networks-global-synchronizer-and-canton-coin-go-live
- [D8] Australian exchange cancellation and review (summary): https://www.itnews.com.au/news/asx-axes-blockchain-based-core-replacement-587904 and https://download.asic.gov.au/media/ku2aa1kz/23-035-asx-chess-replacement-application-delivery-review-2022.pdf
- [D9] Auditor's note on Daml faults (summary): https://www.openzeppelin.com/news/smart-contract-security-for-institutional-finance-on-canton-an-entirely-different-problem

**Bitcoin**

- [B1] BIP 65 (read): https://github.com/bitcoin/bips/blob/master/bip-0065.mediawiki
- [B2] Optech, replacement cycling, and newsletter of 25 October 2023 (read): https://bitcoinops.org/en/topics/replacement-cycling/
- [B3] Optech newsletter, 10 June 2020 (read): https://bitcoinops.org/en/newsletters/2020/06/10/
- [B4] Papers on the swap "free option" (summary): https://eprint.iacr.org/2022/700
- [B5] Lightning specification, part 5 (read): https://github.com/lightning/bolts/blob/master/05-onchain.md
- [B6] Optech, watchtowers and static channel backups (read): https://bitcoinops.org/en/topics/watchtowers/
- [B7] Reports of forfeits from stale backups (summary): https://cointelegraph.com/news/guy-who-lost-4-bitcoin-has-recovered-most-funds-a-month-later
- [B8] BitMEX Research on penalty transactions, 2019 (summary): https://www.bitmex.com/blog/lightning-network-justice
- [B9] Optech newsletter, 2 October 2019 (read): https://bitcoinops.org/en/newsletters/2019/10/02/
- [B10] Optech newsletters, 19 October and 9 November 2022 (read): https://bitcoinops.org/en/newsletters/2022/10/19/
- [B11] Optech, eltoo (read): https://bitcoinops.org/en/topics/eltoo/
- [B12] Capacity trackers (summary): https://www.coinglass.com/pro/onchain/bitcoin-lightning-network-total-capacity and https://coinpaprika.com/education/bitcoin-lightning-network/
- [B13] DLC specification, introduction (read): https://github.com/discreetlogcontracts/dlcspecs/blob/master/Introduction.md
- [B14] DLC specification, oracle (read): https://github.com/discreetlogcontracts/dlcspecs/blob/master/Oracle.md
- [B15] First live DLC (summary): https://cointelegraph.com/news/massive-moment-as-first-ever-dlc-smart-contract-deployed-on-the-bitcoin-mainnet
- [B16] A DLC trading service winds down (summary): https://nobsbitcoin.com/10101-to-wind-down-operations-by-november-3rd
- [B17] Optech, covenants, and newsletter of 9 March 2022 (read): https://bitcoinops.org/en/topics/covenants/
- [B18] BIP 119 (read): https://github.com/bitcoin/bips/blob/master/bip-0119.mediawiki
- [B19] Optech newsletters, 27 April 2022 and 4 April 2025 (read): https://bitcoinops.org/en/newsletters/2022/04/27/
- [B20] Optech newsletter, 4 July 2025 (read): https://bitcoinops.org/en/newsletters/2025/07/04/
- [B21] Register of Bitcoin proposals, status table (read 20 November 2026): https://github.com/bitcoin/bips

**Ethereum-era cases and EOS**

- [E1] Reproduction of The DAO's terms (summary): https://bitlaw.com/blockchain/DAO.html
- [E2] Securities regulator's report on The DAO, 25 July 2017 (summary): https://www.sec.gov/litigation/investreport/34-81207.pdf
- [E3] On the attacker's letter (summary): https://www.bitmex.com/blog/audaocity
- [E4] EIP-779 (read): https://github.com/ethereum/EIPs/blob/master/EIPS/eip-779.md
- [E5] On the fork and the vote (summary): https://blog.ethereum.org/2016/07/20/hard-fork-completed and https://www.theblock.co/post/300733/heres-how-the-dao-attack-reshaped-ethereums-governance
- [E6] Two chains after the fork (summary): https://bravenewcoin.com/insights/ethereum-hard-fork-results-in-two-surviving-cryptocurrencies-both-are-now-trading/
- [E7] EIP-999 (read): https://github.com/ethereum/EIPs/blob/master/EIPS/eip-999.md
- [E8] Parity's post-mortem of the freeze (summary): https://medium.com/paritytech/a-postmortem-on-the-parity-multi-sig-library-self-destruct-63daca3a4cf7
- [E9] The July 2017 theft (summary): https://medium.com/parity-hack-trace/parity-hack-and-153-037-stolen-eth-2a7704f59f3b
- [E10] The April 2018 vote (summary): https://cointelegraph.com/news/ethereum-proposal-to-resurrect-disabled-360-mln-parity-contract-shut-down
- [E11] Compound proposal 62 (summary): https://www.theblock.co/post/119086/compound-bug-comp-risk-misreward
- [E12] Ronin (summary): https://roninchain.com/blog/posts/back-to-building-ronin-security-breach-6513cc78a5edc1001b03c364
- [E13] Beanstalk (summary): https://www.certik.com/blog/revisiting-beanstalk-farms-exploit
- [E14] Nomad (summary): https://www.coinbase.com/blog/nomad-bridge-incident-analysis
- [E15] Tornado Cash governance (summary): https://www.halborn.com/blog/post/explained-the-tornado-cash-hack-may-2023
- [E16] Multichain (summary): https://blockworks.co/news/multichain-founder-family-arrested
- [E17] Munchables (summary): https://www.halborn.com/blog/post/explained-the-munchables-hack-march-2024
- [E18] Radiant Capital (summary): https://medium.com/@RadiantCapital/radiant-post-mortem-fecd6cd38081
- [E19] Bybit (summary): https://www.securityweek.com/fbi-says-north-korea-hacked-bybit-as-details-of-1-5b-heist-emerge/ and https://www.nccgroup.com/research/in-depth-technical-analysis-of-the-bybit-hack/
- [E20] Drift (summary): https://trmlabs.com/resources/blog/north-korean-hackers-attack-drift-protocol-in-285-million-heist
- [E21] Study of upgradeable contracts, 2022 (summary): https://ar5iv.labs.arxiv.org/html/2206.00716
- [E22] Study of users' understanding (summary): https://arxiv.org/abs/2407.11440v2
- [E23] The court-ordered recovery (summary): https://www.citationneeded.news/oasis-defi-centralization/ and https://blockworks.co/news/wormhole-forces-multisig-scrutiny
- [E24] Sui and Cetus (summary): https://www.theblock.co/post/356347
- [E25] Arbitrum council action, 21 April 2026 (summary): https://forum.arbitrum.foundation/t/security-council-emergency-action-21-04-2026/30803
- [E26] Tether freezes (summary): https://cointelegraph.com/news/tether-freezes-4-2b-usdt-illicit-activity-report
- [E27] Liquity (summary): https://www.liquity.org/features/governance-free
- [E28] Oracle manipulation count, 2022 (summary): https://www.infosecurity-magazine.com/news/record-38bn-was-stolen-crypto/
- [E29] EOS freezes, June 2018 (summary): https://www.coindesk.com/markets/2018/06/22/eos-blockchain-arbitrator-orders-freeze-of-27-accounts/
- [E30] EOS arbitration and the proposal to drop the constitution (summary): https://cointelegraph.com/magazine/arbitration-on-a-governed-blockchain-eos-crisis-of-dispute-resolution
- [E31] EOS User Agreement text (read): https://github.com/EOS-Mainnet/governance/blob/master/eosio.system/eosio.system-clause-constitution-rc.md

**Courts and regulators** (all summary)

- [C1] Commodities regulator's release on Mango: https://www.cftc.gov/PressRoom/PressReleases/8647-23
- [C2] The trader's statement: https://fortune.com/2022/10/17/a-solana-hacker-calls-67m-he-stole-from-the-mango-platform-a-profitable-trading-strategy/
- [C3] The suit to undo the settlement: https://www.courtlistener.com/docket/66760250/mango-labs-llc-v-eisenberg/
- [C4] Conviction and later sentence on other charges: https://www.theblock.co/news/ecosystems/2025-05-01-mango-markets-exploiter-avraham-eisenberg-sentenced-to-four-years-inner-city-press-352835
- [C5] Opinion and order of 23 May 2025: https://nysd.uscourts.gov/sites/default/files/2025-05/23cr10%20Opinion%20and%20Order.pdf
- [C6] Law-firm notes on that ruling: https://www.venable.com/insights/publications/2025/06/venue-fatal-in-crypto-fraud-case-an-important
- [C7] The appeal: https://www.dlnews.com/articles/defi/prosecutors-appeal-acquittal-of-mango-markets-exploiter/
- [C8] Quoine v B2C2: https://www.elitigation.sg/gd/s/2020_SGCAI_2
- [C9] Law Commission advice: https://lawcom.gov.uk/?p=10225
- [C10] Tulip Trading: https://caselaw.nationalarchives.gov.uk/ewca/civ/2023/83
- [C11] Sarcuni v bZx: https://www.dechert.com/knowledge/onpoint/2023/4/federal-court-holds-dao-members-can-be-treated-as-general-partne.html
- [C12] Ooki DAO: https://www.cftc.gov/PressRoom/PressReleases/8715-23
- [C13] Platypus acquittals: https://www.theblock.co/news/regulation/2023-12-03-platypus-finance-hackers-cleared-of-criminal-charges-le-monde-265797
- [C14] Samuels v Lido: https://www.fenwick.com/insights/publications/the-legal-landscape-for-daos-key-lessons-from-lido-dao-and-ooki-dao
- [C15] Van Loon v Treasury: https://www.ca5.uscourts.gov/Opinions/pub/23/23-50669-CV0.pdf
- [C16] Risley v Uniswap: https://www.sheppard.com/insights/blogs/token-fraud-decision-sets-limits-on-crypto-platform-liability
- [C17] Storm: https://www.mayerbrown.com/en/insights/publications/2025/08/the-tornado-cash-trials-mixed-verdict-implications-for-developer-liability and https://thedefiant.io/news/regulation/tornado-cash-developer-roman-storm-awaits-judge-s-ruling-on-acquittal-bid
- [C18] EU Data Act, Article 36: https://www.springlex.eu/en/packages/data-act/data-act-regulation/article-36/
- [C19] Peraire-Bueno acquittal: https://www.coindesk.com/policy/2026/11/18/u-s-judge-says-ethereum-has-no-terms-of-use-clears-mit-brothers-of-usd25-million-fraud and https://decrypt.co/383408/judge-acquits-mit-brothers-in-25m-ethereum-mev-case-ending-prosecution

**Audits, verification, bounties** (all summary)

- [A1] Halborn, top 100 thefts, 2025 edition: https://www.halborn.com/reports/top-100-defi-hacks-2025
- [A2] CoinGecko security report, 2026: https://crypto.news/coingecko-crypto-hacks-cost-3-63b-in-19-months/
- [A3] Preprint on audit scope, 2026: https://arxiv.org/pdf/2608.13792
- [A4] Chaliasos and others, 2024: https://arxiv.org/abs/2304.02981v2
- [A5] Zhou and others, 2023: https://arxiv.org/pdf/2208.13035
- [A6] Zhang and others, 2023: https://www.cs.purdue.edu/homes/zhan3299/res/ICSE23.pdf
- [A7] Trail of Bits, 246 findings, 2019: https://blog.trailofbits.com/2019/08/08/246-findings-from-our-smart-contract-audits-an-executive-summary/
- [A8] Deposit contract verification: https://www.runtimeverification.com/blog/end-to-end-formal-verification-of-ethereum-2-0-deposit-smart-contract
- [A9] The DAI invariant: https://hackmd.io/@SaferMaker/DAICertoraSurprise
- [A10] Euler's audits: https://cointelegraph.com/news/euler-finance-hacked-despite-10-audits-in-2-years-says-ceo
- [A11] The Vyper case: https://hackmd.io/@vyperlang/HJUgNMhs2
- [A12] Yearly losses and the 2024 key share (Chainalysis, as reported): https://www.theblock.co/post/382477 and https://www.infosecurity-magazine.com/news/cryptohackers-steal-22bn-north/
- [A13] First half of 2025, attacks on keys and interfaces (TRM, as reported): https://www.theblock.co/post/360084/front-end-and-private-key-exploits-drove-over-2-billion-in-crypto-thefts-during-h1-2025-report
- [A14] The April 2026 forged message: https://www.coindesk.com/tech/2026/04/22/the-protocol-kelp-dao-exploited-for-usd292-million
- [A15] A verifier's own post-mortem: https://medium.com/certora/3b690fffeb08
- [A16] Balancer post-mortem: https://medium.com/balancer-protocol/nov-3-exploit-post-mortem-51dcbeb6b020
- [A17] Bounty platform totals and standard: https://www.theblock.co/amp/post/301025/web3-immunefi-ethical-hacker-payouts
- [A18] The $10 million bounty: https://www.theblock.co/post/148085
- [A19] Bounty disputes: https://cointelegraph.com/news/immunefi-suspends-trustsec-over-bounty-payment-dispute and https://tech.eu/2025/12/11/the-bug-bounty-court-bringing-order-to-defi/
- [A20] Euler's funds returned: https://theblock.co/post/224705/euler-hacker-returns-funds
- [A21] Uniswap competition and bounty: https://blog.uniswap.org/v4-security-competition and https://blog.uniswap.org/v4-bug-bounty
- [A22] On losses in added parts: https://blog.trailofbits.com/2026/07/30/building-secure-uniswap-v4-hooks/
- [A23] Euler's second version: https://www.theblock.co/amp/post/314655/euler-launches-v2-modular-defi-lending-protocol-following-hack
- [A24] KyberSwap: https://rekt.news/kyberswap-rekt
- [A25] A monitoring firm's claims: https://hypernative.io/blog/exploits-hacks-and-how-hypernative-detects-them
