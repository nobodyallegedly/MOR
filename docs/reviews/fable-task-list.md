# The guarantees the core keeps and the task list above them

*Fable, 10 November 2026. Input: F441 on `claude/lead-records-2` (the rewrite and its three gate decisions); `fable-agreements-rewrite.md`, `fable-signed-facts.md`; the stranger's `fable-fresh-eyes.md`, sections 3 and 6; Agreements draft 24, rules 9 to 17, 20 to 32 and 48 and the publication, split plan and split formats, read whole again for this; Development 12's task table and rules 6 to 9; the split cMIP's draft 4 and its crate's README; `core/vectors/verdicts.json`, every Agreements and Money case by its question and rule. Read, not run; a recommendation, nothing decided.*

## In plain words

The line can be drawn as asked, and it falls in one place: **the core holds what is fixed when people sign; a cMIP holds what is computed when money arrives.** Who the parties are, who the holders are and what each owns, who receives the money, what is being sold: fixed at signing, the core's. Who helped with this sale, what was measured, which fee applies, which service was reachable, when to pay out, how much each share comes to: computed at payment time, a cMIP's. Draft 24 already half-says this ("How much each share gets is the split cMIP's: a verifier without it shows the amounts as unknown"); the publishing model grew in the core because each computed thing was given its own field and its own rule there.

So the answer to "what is the underlying task list" is shorter than expected: **the whole publishing model fits under one existing task, the split (task 8)**, with its metric and fee Modules under it as rail Modules sit under the payment cMIP. One new task is needed, **delivery**, which merges two things draft 24 leaves without a task (the proof checker of a proven delivery, and "everything about the substance" of a vow). With terms reading (16), already decided, that is the list.

Of the 618 verdict cases published, 269 are Agreements'. **Seven move to the founding split cMIP, one is shared between it and the core, 261 stay, and none lands in neither**, provided two things hold that I name below. The 291 vectors the Python check runs (the pieces, and 113 verdict cases decidable from encodings, signatures, Text and Envelopes) all stay: none touches the model.

**Three things are Nobody, allegedly's to decide before the inventory**, each a place where the move as literally stated would change a verdict or lose a guard: whether a party's *fixed share* leaves with "partners" (I think it should stay, as language: it is the same sentence as a holder's share of a stake); how "no stake is paid less without its holder" is judged once the plan's details are a cMIP's parameters; and that a sale must never depend on the split cMIP.

## 1. The guarantees the core keeps

Each in one sentence, with why no cMIP can hold it: who would be harmed without having chosen that cMIP.

**On money and its division:**

1. **A split sums exactly.** A split's payouts sum to the amount its receipt shows, to the smallest unit. *Why the core's:* a reader without the cMIP must still be able to see that money went missing; conservation is the one check of a split that needs no knowledge of the plan.
2. **One receipt, one split, by the one who received.** Every receipt of a named service is matched by a split it signs, delivered to everyone it pays; a receipt without one, and a payout without its receipt, is that service's open obligation, visible until paid. *Why:* the holders and the payer did not choose how the service runs; legibility cannot be a cMIP's option.
3. **The stake's line is the holders' alone, by their shares.** Whatever part a split assigns to an ownership agreement's stake is divided among its holders in the version in force for the receipt, by their shares, to the unit as rule 9 rounds, layer by layer where a holder is itself an agreement or a collective; nobody else is paid on it. *Why:* a holder with no voice (a buyer of a share, a departed member, a successor) signed no publication and chose no cMIP.
4. **Only the signed are paid.** A split pays only the stake's holders, the parties the publication names, and the receiver a Module's own specification declares for a payout naming that Module; any other receiver only as the split cMIP the parties signed answers for that payment, shown as such, unknown to a reader without it. *Why:* "never an address the parties did not sign" protects every party from the service; a cMIP may add receivers found at payment time, never replace the signed ones.
5. **No stake is paid less without its holder.** A version that pays a stake less binds a holder with no voice in it only with that holder's signature, or under a rule that holder accepted (section 5.2 says how "pays less" is judged). *Why:* it is the guarantee the voiceless holder has against everyone who does have a voice, the choosers of the cMIP among them.
6. **Money is received only by a service the publication names.** A price tag counts for a publication only where signed by one of its named services or the party it designates; a pointer that bypasses them is shown as bypassing, and what it received is its receiver's open obligation. *Why:* the buyer and the holders did not choose the receiver's honesty; they can at least see that the money went where the agreement said.

**On the sale:**

7. **A payment naming a counted price tag is a purchase, under one version, settled where the payment took place** (rule 12), **and a sale never depends on the split cMIP.** *Why:* the buyer chose a price, not a cMIP; a wallet reading only Money must be able to buy.
8. **What is paid for nothing is owed back to the payer the payment names**: a payment racing an ending, past a deadline, naming a tag that does not count, or receiving neither key nor receipt; by whoever holds it, then by each party in the share it actually received. *Why:* the buyer's protection cannot depend on the seller's choice of rules.
9. **Each sale of a promise is pending, confirmed or contested, by those who signed onto it**, and a contest is shown and voids nothing. *Why:* it is the shared language of "was it kept"; what was promised is above the core.
10. **A sale is tied to the ownership agreement its publication names, and one outside the claim's ownership agreement is shown so; a vow's signer holds the whole stake of an agreement claiming it at founding.** *Why:* the owner of a work or a vow did not choose the publication someone else signed over it.

**And, unchanged by this move:** what others relied on stands; the way out and everything rule 98 lists; termination and its defaults; unknown never rounded up.

## 2. The task list

Every task, with what moves under it. "Declaration" means an answer in the core's vocabulary that the task must produce because it decides someone's fate.

| # | Task | Accepts | Produces | From draft 24 into a cMIP under it |
| --- | --- | --- | --- | --- |
| 6 | Payment (Money) | as now | as now | nothing moves |
| 7 | Conversion (Money) | as now | as now | nothing moves |
| **8** | **Split** | a publication's plan parameters; a receipt and the stake's version in force for it; the evidence the payer's claims acknowledged and the records its Modules define; for a payment, the attempts made | **(a)** the receiver for this payment, one of the services the publication names; **(b)** for a split: the payouts it should carry beyond the stake's line, each with its receiver and amount, or unknown; **(c)** when a split is due | role shares and their evidence (rule 22, nearly whole); metric shares, the measurer and "already pays" (rules 29, 30); fee entries and when each applies (rule 28, the receiver rule staying core); the destination of an unfilled or unmeasured share (plan key 3); backups' order and what a failed attempt is (rule 17, field 12); batching and timing (rule 26); recoupment and every other shape; a collective's own part and its vault (rule 22); what a bypassing receiver owes of the other shares (rule 16) |
| | *its declarations* | | **(d)** for two versions of a plan under the same cMIP: pays the stake less, not less, or unknown; **(e)** for terms reading: the most the plan takes before the stake's line; where the money of an unfilled share or an undelivered sale goes; who holds the money and until when | |
| 9 | Condition | as now | as now | nothing; scoped to obligations (F437.3) |
| 10 | Time reference | as now | as now | nothing |
| 11 | Anchoring (Envelopes) | as now | as now | nothing |
| 12 | Grant limits | as now | as now | nothing |
| 13 | Work claims | as now | as now | provenance and resale registries, if anyone builds them, go here or to a client's own choice |
| 14 | Absence proof | as now | as now, **and the declaration**: which acts break absence, for how long, on which time reference | nothing |
| 15 | Termination terms | as now | as now, **and the declaration**: for each party, may terminate alone, after a point, never | nothing |
| 16 | Terms reading (client-chosen) | terms or an offer, and the declarations of the cMIPs they name | facts, never forecasts or judgments | the "show before signing" family (F441.1) and, I suggest, its twin "show before paying" (section 3) |
| **17** | **Delivery** (new) | what a publication sells in a proven-delivery form or as a vow, its parameters, and the acts about one sale | for a proven delivery: proven, not proven or unknown, checked from data alone; for a promise: what was promised, in parts where it has parts, and what is owed back when a part fails; never the sale's state, which is the buyer's alone | the proof checker (today "not a task"); a vow's substance: quantities, seats, kinds, delivery points, streams (rule 13's list, the live media cMIP); a bundle's partial refund; tiers and price schemes of a service sold under a cMIP's terms |
| 18 | Collective control (today a hook with no number) | as rule 99 | as rule 99, **with one more answer in its query**: may the stake be issued without each holder's signature, and by whom | nothing new |

**Merges considered.** *Done:* the checker and the vow's substance into one task, delivery: both answer "what was sold and was it delivered", one on proof and one on words. *Not recommended:* condition, absence proof, termination terms and grant limits share one answer shape (yes, not yet, no, unknown) and could be one task named in four fields; I would keep them four, because each decides a different person's fate and owes a different declaration, and S7r separated termination from condition on purpose. *Numbers for hooks:* delivery and collective control are hooks the core already has; giving each a number costs a row and makes "which task does it plug into" answerable for every cMIP without exception.

**Modules under the split cMIP**, each naming it in its field 5 as a rail Module names the payment cMIP: a metric and its record format; a fee-charging Module; a helper's record (a relay's delivery record, a service's use record). None is a task.

## 3. What is neither a guarantee nor a task

- **Descriptions of how things run:** rule 18 (each participant's check), rule 19 (what the service receives), rule 32 (the trust that remains), "self-publishing", "a compilation is a layer", "responsibility ends at the owner's pointer" as prose, the live-stream guidance of rule 11, the worker's-vow and budget examples of rule 14, "what a vow covers". To the **companion**, each entry naming the rule it explains.
- **Alternatives set aside and "guidance, not rule":** the companion.
- **Client conformance before paying:** showing a pointer that bypasses the service; checking that the publication and tag are the latest; showing the deadline; showing a publication as outside the claim's ownership agreement; "No owner". F441.1's sentence covers "a signature that binds a person to terms". A payment that accepts an offer binds too. I suggest one clause, *or a payment that accepts an offer*, so that the same terms-reading task covers the buyer, and these lines move to the **founding terms-reading cMIP** with the rest.
- **The partner's label:** shown, read by nothing; it can stay as an optional byte or move to the split cMIP's parameters. No verdict turns on it.
- **Part six** (reasoning, parameters, freeze scenarios), 8,000 words: out by F441.2.

## 4. The founding cMIPs, and the vectors

**What works today still works on day one with these, adopted by choice and carried by the reference apps:**

1. **The split cMIP, next draft** (draft 4 exists, with a crate and 26 tests): carries everything in the last column of task 8's row, unchanged in effect, and gains declarations (d) and (e). Its Modules: the stand-in metric the vectors use; fee Modules as they come.
2. **The delivery cMIPs:** the live media cMIP (draft 1 exists) for promised streams; a founding access cMIP for keys to bytes and subscriptions; the anchoring cMIP (draft 8) already sells a proven delivery under its own terms.
3. **The terms-reading cMIP** (new, F441.1).
4. **The collective control cMIP** (draft 6), with its one more query answer.
5. **A plain termination-terms cMIP** (notice, minimum term): today's vectors use answers the verifier is told; a founding one lets the reference apps offer what the rehearsal's players asked for.

**The vectors.** The corpus on main is `verdicts.json`, 618 cases (Identity 102, Text 35, Envelopes 34, Money 110, Agreements 269, Development 62, the MIR hashes 6), beside the piece vectors. The "291, of which 113 verdict vectors" is what the independent Python check runs; none of those reads a publication's plan, so all stay in the core.

Of the 269 Agreements cases:

- **Move to the founding split cMIP, 7:** the six "split judged" cases (a relay's role share evidenced and not; a delivery record for the object paid for and for another; a metric payout to a holder the owners' line pays nothing; a metric whose measurer is the split service), and the payment to a backup receipted in the backup's own name (rule 17), which is already unknown to a verifier without the cMIP.
- **Shared, 1:** "9.1, its split, following the complete transfer, paying Cy 400,000 of every million left on the owners' line": that the line goes to the holders by their shares after the transfer is the core's (guarantee 3); how much is "left" after the label's part is the cMIP's.
- **Stay, 261:** every deal, collective, grant, keeper, record, closing, fork, control-answer, declaration and work-owners case; all 22 "purchase" cases save the backup's; the vows; the contests of a purchase; "owed back by", which reads what each party actually received; and all 15 "termination" and 7 "publication" cases.
- **In neither: none**, on two conditions. (i) The publication's list of parties stays readable by the core, since "the owners' side alone drops the label" and "the same version also raising the partner's share, the partner not signing: it does not count" are judged from who is a party and who signed, never from a share. (ii) The first service the publication names stays the receiver a reader without the split cMIP assumes, as rule 17 says today.

Of Money's 110, all stay: price tags, purchases, vows' sales, refunds and routes are Money's and the purchase's grammar.

**Not mapped here:** the Rust tests beyond the published cases (`core/tests/`, `cmips/split/tests/`), which pin more of the model than `verdicts.json` does (the fee's receiver, plan formats the core refuses, the collective's own part). The inventory session should map them the same way; I expect most of the split's to move with the cMIP's crate, where they already live.

## 5. What could go wrong

**5.1 A party's fixed share: does it leave with "partners"?** F441.3 lists partners among what leaves. A partner as a business role (a label, a publisher, a host) should; but *a party of an agreement taking a fixed part of each payment* is not a business model, it is the same sentence as a holder owning a share of a stake, and it is fixed at signing. If it leaves, three things follow: the publication's counting check ("the shares off the top do not exceed 1,000,000") becomes the cMIP's, so whether a publication counts would depend on the cMIP (against guarantee 7); "a partner's share raised" can no longer be read by the core for guarantee 5; and the format's field 2 changes bytes for nothing. **My view: the parties and their fixed shares stay, under the plain name "a party's share"; everything conditional leaves.** One number then lets the core keep its own arithmetic: *the most the split cMIP may take off the top, in millionths* (today the sum of the role, metric and fee parts). With it the core still checks that the fixed shares and that maximum fit in a million, and that a split gives the stake's line at least what is left. That is the only new field I would add; it is today's sum written down.

**5.2 "Paid less" once the details are parameters.** Rule 48 lists what pays a stake less: a share added or raised, a role added, unfilled shares sent elsewhere, a fee added, the fee bearer or its maximum changed, "the split cMIP or its parameters changed". When the details become parameters the core cannot read the direction of a change. Three ways: (a) every change of the parameters counts, so a holder with no voice signs even a change in its favour, and one who is silent blocks it until declared absent: safe, and a rule that protects the holder traps everyone; (b) the core trusts the split cMIP's declaration (d), *for the same cMIP in both versions only*, a change of cMIP always counting; (c) nothing. I recommend (b): a holder is bound by the cMIP in force when it signed or bought, as by any rule it accepted, so that cMIP's own comparison is a rule the holder accepted; a new cMIP is not, and counts. Verdicts are then unchanged where the founding cMIP implements today's list, and the maximum of 5.1 gives the core a floor that needs no trust at all.

**5.3 A sale must not depend on the split cMIP.** Today a publication with a malformed plan does not count, its tag buys nothing and the buyer is owed a refund. If the plan's validity moved wholly into the cMIP, a reader without it could not say whether a purchase is a purchase. With 5.1's line the core still checks what it can (parties, fixed shares, the maximum), and a plan its cMIP cannot split leaves the *splits* wrong or unknown and the money the service's open obligation, never the sale in doubt. One sentence to write; no published case pins the old verdict.

**5.4 Guards that live inside the model today and move with it.** Each stays true under the founding cMIP and is no longer true of every split cMIP; said plainly so nobody discovers it later:

- *No service is paid on its own record alone* (a helper's evidence counts only when the payer's claim acknowledges it). Under another split cMIP a service's word might do. Who is exposed: a holder with no voice under a publication signed with such a cMIP, which rule 48 already calls a stated cost for a work's stake ("prices, partners and publications are no owners' matter"); a collective's own split agreement is protected by 5.2, a change of cMIP counting.
- *The measurer is neither a receiver nor the split service; a metric pays only whom the plan already pays.*
- *A fee is owed only by a plan's entry, and a split leaving one out is wrong.* The receiver rule stays the core's (guarantee 4).
- *The collective's own part goes to its vault, never its flow pointer* (else it is split again).
- *The maximum fee per payout and who bears it.* Money rule 21 reads the maximum to judge a payout discharged; I would keep those two keys in the core's plan for that reason, as fixed at signing.

**5.5 The way out, checked.** Rule 98's list reads nothing of the model. Termination's defaults read the parties and the named services, which stay. "A replaced service still owes payouts on everything it received" and "a payment racing the ending is owed back by each party in the share it received" read receipts and actual payouts, which stay. A transfer's effect on the next split is guarantee 3. **One new dependency:** whether a collective may close ("it cannot close while it owes anything") can now wait on a split cMIP's answer where the closing collective was itself a split service or received a bypassing payment, since what it owes under a plan is then the cMIP's to compute; the answer is unknown, never complete, which is rule 35's and the right side to err on. Rare, and worth one line.

**5.6 Bytes move.** F441's first sentence ("no byte of any format moves") cannot hold for the publication's plan and the split's payouts once the model leaves: the role, metric, fee and unfilled keys become the cMIP's parameters, and a payout's role, evidence and metric keys become one "under the cMIP" key carrying what the cMIP defines. Verdicts do not move; act ids in the vectors' fixtures do, as at every draft. Everything outside those two formats keeps its bytes.

## 6. My view

**The shortest core that keeps every guarantee,** for money and sales, is about this much: a publication names what it sells, its owners, its parties and each one's fixed share, the services that may receive, a split cMIP with its parameters and the most it may take, and its terms; payment of a counted tag is a purchase; the service that received signs one split per receipt, summing exactly, paying the stake's line to the holders by their shares and anyone else only as signed or as the cMIP answers; nothing paid for nothing is kept; no stake is paid less without its holder. Sections 3 and 13 of draft 24 are about 9,800 words; I would expect about 3,000 to remain, and the formats to lose a third.

**Can the line be drawn as asked?** Yes, at "fixed at signing, computed at payment", with the three decisions of section 5 (5.1, 5.2, 5.3) taken first. It needs no new mechanism: one task gains declarations, one hook gains a number and a merge, one field holds a sum the core already computes. What it asks of the project in return is a founding split cMIP that is now as carefully reviewed as a MIR, since most of what a publisher and a helper rely on day to day will live there; and the plain statement, in the core, that it is one way of doing business among others.

## What I read and what I reason

Read: F441; draft 24's rules 9 to 17, 20 to 32 and 48, and the publication, split plan and split formats, whole; Development's task table and rules 6 to 9; the split crate's README; every Agreements and Money case of `verdicts.json` by name, question and rule (379 lines), and the counts per layer. Reasoned: each guarantee against "who is harmed without choosing the cMIP"; each case against the line; the three places the literal move changes a verdict. Not done: the Rust tests' mapping; the split cMIP's draft 4 read in full; any count of the piece vectors beyond S7r-4's figure; nothing run.
