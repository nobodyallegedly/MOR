# Agreements from scratch, draft 1, walked through the ten situations

11 November 2026. A record of work by Claude, not a decision. It decides nothing, proposes no rule and does not change the draft.

**The wish this stint serves** (Nobody, allegedly, `docs/decisions.md`): "I've decided for a total rewrite of agreements from scratch." "No translation, fresh from the research we had all agreed was excellent direction."

**Read for this:** only `docs/strangers-2026-11/` (its README, `agreement-tasks.md`, `agreement-grammar.md`) and `docs/agreements-from-scratch/draft-1.md` (branch `claude/agreements-from-scratch-3ibcsy`, pull request 147). Nothing in `spec/`, `docs/findings/`, `docs/reviews/`, `docs/agreements-inventory/`, `docs/agreements-marking/`, `core/` or `cmips/` was opened.

Rule numbers (rule 3, 4.1(b)) and task numbers (K4, K9) are draft 1's. Task numbers with a hash (#23 Hold) are the research's 49 tasks.

---

## In plain words

Draft 1 was written from the research alone. This document tests it the way the research built its own task list: by ten everyday situations. For each one it tells a short story with named people, first as it usually goes and then as it goes wrong. It writes down the acts each person would sign, and then asks the questions a third person (a buyer, an heir, a judge) would ask. For each question it names the rule or task of draft 1 that answers it, and what a verifier would answer.

Where no rule answers, or a rule can be read two ways, or two rules pull against each other, or one of the draft's own stated costs hurts in practice, that is written down, with the draft's own sentence quoted, and with how sure I am.

The short version: the draft holds up well for **making** an agreement and for **binding** people, and very well for **saying honestly what it does not know**. It goes quiet at the other end of an agreement's life: nothing in the rules makes Terms **stop** being in force, so replacing, ending, revoking and withdrawing have no effect a verifier can compute. The list at the end ranks everything found.

### How each situation is written

1. **Scenario**: the usual case, then one way it goes wrong.
2. **Acts**: who signs what, with only the fields that matter. `T` is a Terms act, `S` a Statement.
3. **Questions**: what a third person asks, the rule or task that answers it, and the verifier's answer (**shown**, **not shown**, **fork**, **unchecked**; **per place** or **as shown** where the answer is about what is latest or what else exists).
4. **Where draft 1 goes quiet**, each with a certainty: **high** (the text plainly says it, or plainly says nothing), **medium** (one reasonable reading leads there, another does not), **low** (it depends on what other layers turn out to give).

Findings are numbered F1 to F20 in no order of weight; the ranking is at the end. Later situations refer back to them instead of repeating them.

---

## 1. Selling

### Scenario

**Usually.** Bea sells her bicycle to Cal for 200. She writes the terms, both sign, Cal pays, Bea hands over the bicycle, Cal signs a receipt.

**Going wrong.** Bea sells the same bicycle a second time, to Dov, a week later, in a separate agreement. Each buyer is shown only his own papers.

### Acts

| # | Signer | Act | Fields that matter |
|---|---|---|---|
| 1 | Bea | `T1` (root) | `parties`: Bea, Cal (signers). `authors`: Bea. `body`: words + K1 cMIP. `previous`: none. No `in_force` (default), no `powers`, no `place`. |
| 2 | Bea | `S` assent | `agreement`, `terms`: T1. `kind`: assent. `previous`: T1. |
| 3 | Cal | `S` assent | `agreement`, `terms`: T1. `kind`: assent. `previous`: none. |
| 4 | Cal | `S` "paid 200" | `kind`: a K11 kind. `previous`: his assent. |
| 5 | Cal | `S` "received the bicycle" | `kind`: a K11 kind. `answers`: Bea's handover statement if any. `previous`: act 4. |

The second sale is a different root `T1'` (Bea, Dov) with its own acts.

### Questions a third person asks

| Question | Answered by | Verifier's answer |
|---|---|---|
| What exactly was agreed? | rule 1, K1 | shown, if the verifier holds the body and the K1 cMIP; otherwise unchecked (rule 8) |
| Are both bound? | rule 3.1 default, rule 4.1(a) | shown once both assents are held |
| Who wrote the words? | rule 2 | shown: Bea |
| Was it Bea's to sell? | #11 Title lands on "K4 over acts per place; rule 6" | no place is named: as shown at best. And see F5: Bea's title came from an earlier agreement no rule reaches |
| Was the bicycle what was said? | K5, rule 7 | shown only as "Cal said so" (or a named witness said so) |
| Was Cal paid / did Cal pay? | rule 7.3, K8 or the receiver's word | shown only as a signed claim; never as "value moved" |
| Did Cal get the bicycle? | rule 7, act 5 | shown as "Cal said so" |
| Has Bea sold it to anyone else? | rule 5, rule 6 | **not answered**: see F5 |

### Where draft 1 goes quiet

**F5. A double sale in two agreements is no fork and has no place.** Rule 5 is confined to one agreement: "Two acts by one signer within one agreement that name the same `previous` (or that both name none) are a fork." Rule 6 is also per agreement: "It is made local: each agreement names its own place." Bea's sale to Cal and her sale to Dov are two agreements, so neither rule sees the conflict. The research names this lie first ("It is mine to sell") and finds scarcity is one of the two things a shared sequence is for. The draft can catch it only if the bicycle's holdings live inside one agreement (a register) whose transfers are Statements, which is how the landing table reads #13 Transfer: "Statement of a K11 kind under a power; rule 6; K8 if value moves". So the draft reads two ways: a sale as its own agreement (natural, unprotected) or a sale as a Statement inside the thing's register agreement (protected, but then Cal must become a party of the register, see F8). Nothing says which. **Certainty: high** that the rules are silent across agreements; **medium** on how often people would use the register shape.

**F15. A receipt for a thing is mapped to a task about acts.** #20 Acknowledge lands on "Statement with `answers`; K9", and K9 asks "Did this act reach this person?". Cal's receipt is about a bicycle, not an act. Rule 7 still handles it (reported as Cal's word), so nothing breaks, but the landing reads two ways. **Certainty: medium.**

---

## 2. Promising

### Scenario

**Usually.** Eli lends Fay 500. Fay promises to repay by 1 March. Gus guarantees it. Fay repays on 20 February; Eli signs that he was repaid.

**Going wrong.** Fay does not repay. On 10 March she says "it wasn't due yet, we never fixed a date that anyone can check", and Gus says he cannot pay either.

### Acts

| # | Signer | Act | Fields that matter |
|---|---|---|---|
| 1 | Eli | `T1` | `parties`: Eli, Fay, Gus. `authors`: Eli. `body`: words incl. "due 1 March". `relies_on`: a K4 rule for "late". `place`: P (or none, both cases below). |
| 2–4 | Eli, Fay, Gus | assents | `terms`: T1. Each `previous` as their chain requires. |
| 5 | Eli | `S` "lent 500" | K11 kind; rule 7 claim. |
| 6 | Fay | `S` "repaid 500" | K11 kind. |
| 7 | Eli | `S` "received 500" | `answers`: act 6. |

### Questions

| Question | Answered by | Verifier's answer |
|---|---|---|
| Is Gus bound as guarantor? | #24 Secure lands on "guarantor: assent"; rule 3, 4.1(a) | shown once his assent and the others' are held |
| Was the money lent / repaid? | rule 7.1, 7.3 | shown only as "Eli said so" / "Fay said so"; act 7 is the clean proof the research names |
| Is the repayment due? Was it late? | #16 Due lands on "date: K4 over positions; event: K5"; rule 6.2 "whether a period has passed"; rule 7.2 | with place P: per place, **but see F6**. Without a place: as shown; the dates inside acts are each signer's claim (7.2) |
| What happens if Fay does not pay? | #45 Enforce: "from posted value: K8; otherwise cost" | nothing was posted: the stated cost applies; the verifier shows who owes what, and nothing moves |

### Where draft 1 goes quiet

**F6. A place gives positions, not dates.** A promise is "a sale stretched in time", and most promises are due on a calendar date. K6 asks only "Is this act in the place, at what position, and is anything later?", and rule 7.2 says "A time written inside an act is reported as its signer's claim. Only a place gives a position." A position says "before" and "after", not "1 March". So "due on 1 March" has no source a K4 rule can read, unless position is taken to include a time, which the draft does not say. The research had "A date: read the shared clock (Order)"; the draft kept the order and is silent on the clock. **Certainty: medium** (it reads two ways; the answer may lie in what the Order layer gives, which draft 1's section 8 already lists as missing).

**Stated cost that bites: "Without a place, no scarcity and no freshness."** The usual loan between two people names no place, so "it isn't due yet" can never be answered except as shown. The draft says so honestly; in this situation that is most loans. **Certainty: high.**

---

## 3. Owning together

### Scenario

**Usually.** Hal, Ida and Jo buy a boat in thirds. Two years later Jo sells her third to Kit, with the others' consent; Kit takes on the existing terms.

**Going wrong.** Jo sells her third to Kit and also to Lev. Or: Kit later says he never agreed to share the mooring costs, because those were in the old terms.

### Acts

| # | Signer | Act | Fields that matter |
|---|---|---|---|
| 1 | Hal | `T1` | `parties`: Hal, Ida, Jo. `body`: thirds, costs shared. `powers`: (kind "transfer of a part", rule "the other two consent"). `place`: P. |
| 2–4 | each | assents to T1 | |
| 5 | Hal, Ida | `S` "consent to Jo → Kit" | K11 kind; `previous` in each chain. |
| 6 | Jo | `S` transfer of her third to Kit | K11 kind, made under the power. |
| 7 | Kit | assent to T1 | `terms`: T1. `previous`: none. |

### Questions

| Question | Answered by | Verifier's answer |
|---|---|---|
| Who holds which third now? | #11 Title: K4 over acts per place; rule 6.2 | per place P |
| Do the parts add up to the whole? | #12 Sum: K4; rule 6 | per place P; without a place, as shown |
| Did Jo sell twice? | rule 5 inside this agreement; rule 6 | if both sales are Statements in this agreement: either fork (same `previous`) or two transfers in one line, which the K4 Title rule reads in place order: per place. If the second sale is made outside it: F5 |
| Was Kit allowed in? | #14 Admit: power; rule 4 | shown if the K4 rule over acts 5 says yes |
| Is Kit bound by the cost-sharing? | #15 Bind: "newcomer's assent; rule 4" | **reads two ways**: see F8 |

### Where draft 1 goes quiet

**F8. Is a newcomer who is not named in `parties` a party at all?** The definition says a party is "a person named in Terms as one who may be bound." Kit is not named in T1. The draft also says "A newcomer is bound (#15 Bind) by their own assent to the Terms in force when they join". Rule 4.1(a) seems to agree (he signed his own assent), but rule 3.1's default counts only "an assent to them in the name of every party named as a signer", so Kit's assent is outside the count, and nothing says whether an assent by a non-party binds. Three paths seem possible and none is chosen: Kit's assent alone binds him; T1 must have named a role ("whoever is admitted under this power"), which then needs `in_force` by 3.2; or the Terms are replaced to name him (#47 Amend), which needs everyone again. **Certainty: medium-high.**

---

## 4. Acting together over time

### Scenario

**Usually.** A neighbourhood tool library: Mae, Ned, Oli, Pia and Quin. A treasurer, Ned, holds the shared money. Decisions are by majority. Notices are posted to the place. It runs for ten years.

**Going wrong.** In year six, Oli's phone is lost and he restores an old backup; his next vote points at an act he had already followed. Separately, Ned spends the library's money and says the group decided it.

### Acts

| # | Signer | Act | Fields that matter |
|---|---|---|---|
| 1 | Mae | `T1` | `parties`: the five. `powers`: (kind "decision", rule "majority of votes"), (kind "spend", rule "a decision exists and the amount is within it"). `place`: P. |
| 2–6 | each | assents | |
| 7… | each member | `S` votes | K11 kind "vote", `answers`: the proposal. |
| n | Ned | `S` "decision: buy a lathe" | `for`: ? `under`: T1 (see F7). |
| n+1 | Ned | `S` instruction to the bank | K8. |

### Questions

| Question | Answered by | Verifier's answer |
|---|---|---|
| Did the group decide this? | #30 Decide, #31 Count: the power's K4 rule over votes | open vote: shown per place; secret vote: the teller's word (K7) |
| Who was a member at the moment of the vote? | the Terms in force, rule 3 | per place, **but see F1 and F4** if members were added or removed by replacing Terms |
| Is everyone bound by the decision? | rule 4.1(b) | **see F7** |
| Were members told? | #32 Notify: "K9; by publication: rule 6" | per place |
| Did the bank pay? Is the library's money kept apart from Ned's? | K8, rule 7.3; #25 Separate: "K8; rule 7; cost" | the controller's or receiver's word only; separation is a stated cost |
| Can Oli's later votes still count? | rule 5.2 | **fork**, and then **see F2** |

### Where draft 1 goes quiet

**F7. One act that binds many people has a field for one.** `for` holds "the person in whose name the act is made", and 4.1(b) binds a person only if "the act's `for` names them". A group decision binds every member, including the outvoted. Either the decision is signed once per member (five acts for one decision), or `for` may name several, or the group's members are bound some other way; the draft says none of these. For replacing Terms, 4.2 avoids the problem ("Its `replaces` is read as its `under`"), so only ordinary decisions and judgments (situation 7) are affected. **Certainty: medium-high.**

**F2. After a fork, what counts?** Rule 5.2: "A verifier holding both MUST answer **fork** for that signer, and MUST NOT choose between the branches." It reads two ways: fork for the two conflicting acts only, or fork for every answer that involves that signer, from then on. Under the second reading, Oli's every later vote is lost and there is no way back; under the first, his later acts each point into one branch and the draft does not say whether they count. **Certainty: high** that it is unsettled.

**F2a. A party can fork on purpose.** The same rule lets a party who wants out make their own assent uncountable: sign any second act with the same `previous` as their assent (often "none", which needs nothing at all). If "fork for that signer" removes their assent, Terms that needed it are no longer in force by rule 3; if it does not, the fork means nothing. Either way the draft does not say. **Certainty: medium** (depends on F2).

**Stated cost that bites: "Honest forks."** Over ten years and five people, lost devices and restored backups are near certain. The draft says such a fork "looks exactly like a lie". In this situation it is not rare but expected. **Certainty: high.**

---

## 5. Acting for another

### Scenario

**Usually.** Rae gives Sol the power to sell her car for no less than 5,000. Sol sells it to Tia for 5,500, signing in Rae's name and saying so in the act.

**Going wrong.** Rae revokes Sol's power on Monday. On Tuesday Sol sells the car to Tia anyway. Tia says she had no way to know.

### Acts

| # | Signer | Act | Fields that matter |
|---|---|---|---|
| 1 | Rae | `G1` (grant, a Terms act) | `parties`: Rae, Sol. `authors`: Rae. `powers`: (kind "assent to a sale of the car", rule "price ≥ 5,000, signer is Sol"). `place`: P or none. |
| 2–3 | Rae, Sol | assents to G1 | |
| 4 | Sol | `T1` sale | `parties`: Rae, Tia. `body`: price 5,500. |
| 5 | Sol | assent to T1 | `for`: Rae. `under`: G1. |
| 6 | Tia | assent to T1 | |
| 7 | Rae | `S` "I end G1" | K11 kind "end". |

### Questions

| Question | Answered by | Verifier's answer |
|---|---|---|
| Did Rae give this power? | #27 Authorise: grant as Terms; rule 4 | shown, from Rae's own assent to G1 |
| Was the sale within it? | #28 Scope: the power's K4 rule over T1's body (K1 parts) | shown; unchecked if the verifier lacks the K1 or K4 cMIP (rule 8) |
| Was Sol acting for Rae, said at the time? | #29 Name: `for` and `under`; rule 4.3 | shown; an act without `for` can never later be relabelled |
| Is Rae bound by the sale? | rule 4.1(b) | shown, **if G1 is still in force**: see below |
| Was Sol still authorised on Tuesday? | rule 4.4 | per place or as shown, **but see F1 and F12** |
| Could Rae revoke alone? | rule 4, P3 | not under G1 as written: no power to end it is named. Open parameter P3, left to Nobody, allegedly |

### Where draft 1 goes quiet

**F1. Nothing in the rules makes Terms stop being in force.** This is the main finding of this document. Rule 3.1 defines being in force only by what is present: "Terms are in force when the assents their `in_force` rule requires are present." Assents are never withdrawn (acts are "Published or signed again, never updated"), so once in force, G1 stays in force by the letter of rule 3. The draft says "Revoking it is ending those Terms", and #48 End lands on "Statement of a K11 kind under a power; rule 4", but no rule reads an end Statement to change what rule 3 answers. Rule 4.4 speaks of "Terms that have been replaced or ended" and sends the verifier to rule 6, but rule 6 says where to look, not what "ended" means. The same holds for replaced Terms (situation 8) and an offer's withdrawal (situation 9). Rule 3.3 ("An assent binds its signer only while the Terms it names are in force") shows the draft meant there to be an end; the rules do not compute one. **Certainty: high.**

**F12. Which Terms' place?** Rule 4.4: "a verifier MUST answer from rule 6: per place if the Terms name one, otherwise as shown." Here there are two sets of Terms: the grant G1 (where the revocation would be lodged) and the sale T1 (where Tia looks). If G1 names place P and T1 names none, or a different one, "the Terms" reads two ways. **Certainty: medium.**

**Stated cost that bites: P3 together with "No default way out".** Rae wrote her grant without a power to end it, as most people would. The draft's own words: "with no power named, only by every party's assent, which lets an agent block their own dismissal." **Certainty: high** that this bites; whether it should is P3, Nobody, allegedly's to decide.

---

## 6. Someone is gone

### Scenario

**Usually.** Uma and Vic own a cabin together. Their Terms name Uma's daughter Wyn as her successor, to take effect when two named witnesses sign that Uma has died. Uma dies; the two witnesses sign; Wyn steps in.

**Going wrong.** Vic dies with no successor named, and his share is stuck. Or: Uma does not die but loses her capacity, and nobody can say whether her past and present signatures still count.

### Acts

| # | Signer | Act | Fields that matter |
|---|---|---|---|
| 1 | Uma | `T1` | `parties`: Uma, Vic. `powers`: (kind "succession for Uma", rule "two of witnesses X, Y say Uma has died; signer is Wyn"). `place`: P. |
| 2–3 | Uma, Vic | assents | |
| 4–5 | X, Y | `S` "Uma has died" | K5; non-parties signing within the agreement. |
| 6 | Wyn | `S` succession | `for`: Uma. `under`: T1. |
| 7 | Wyn | later acts | `for`: Uma? or her own name? (see F14) |

### Questions

| Question | Answered by | Verifier's answer |
|---|---|---|
| Is Uma dead? | #35 Alive: "absence: K5 or K4 waiting rule"; rule 7 | shown as "X and Y said so" |
| Is Vic alive? | #35: "presence: a fresh act, by K9 challenge" | shown if Vic signs a fresh challenge; absence by waiting: per place only (rule 6.2) |
| Who takes Uma's place? | #37 Succeed: "power named in advance; rule 4" | shown, under the power |
| What about Vic's share, with no successor named? | rule 4 (no default power); stated cost | not shown: "it is stuck" |
| Was Uma able when she signed last month? | #3 Able: "K3; cost" | K3's statements only; "never a pass" |

### Where draft 1 goes quiet

**F14. How a successor becomes a party.** The power lets Wyn sign "for Uma", but nothing says whether Wyn then acts for Uma forever (her acts all carry `for` Uma and `under` T1), or becomes a party in her own name (which needs replacing Terms, so Vic's assent or another power). Her chain under rule 5 is her own, not Uma's, so Uma's line simply stops. **Certainty: medium.**

**F17. A pending assent after death or loss of capacity.** Rule 3 counts assents present, with no check that the signer is still alive or able. If Uma assents to a replacement and dies before Vic assents, Vic's later assent puts it in force. Likewise an open offer outlives its author (situation 9). Capacity after the making is not a task the draft lands anywhere: #3 Able lands on "K3; cost", and K3 is about the making. **Certainty: medium** (the stated cost on Minds covers capacity at signing; it does not mention capacity later).

**Stated cost that bites: "No default way out."** "If a party is gone and no successor was named in advance (#37, #38), it is stuck." The research's own situation 6 found that what a dead person controlled "is stuck"; the draft keeps that as the outcome whenever nothing was designed. Most co-owners do not name successors. **Certainty: high.**

**Also:** absence by waiting needs a place (6.2: "whether a period has passed") and a date (F6). Without a place, Vic's long silence can never count as absence. **Certainty: high.**

---

## 7. Disagreeing

### Scenario

**Usually.** Xan hires Yul to paint a house. Terms name Zed as judge, decisions final after 30 days. Xan says two rooms were not done; Yul answers; Zed decides Xan owes 80% of the price.

**Going wrong.** Yul says he never received the complaint. Then, after Zed's decision, Xan says the word "finished" in the Terms meant something else, and that Zed was Yul's friend.

### Acts

| # | Signer | Act | Fields that matter |
|---|---|---|---|
| 1 | Yul | `T1` | `parties`: Xan, Yul. `authors`: Yul. `powers`: (kind "decision of the judge", rule "signer is Zed; final if no appeal within 30 days"). `place`: P. |
| 2–3 | Xan, Yul | assents | |
| 4 | Xan | `S` complaint | K11 kind "raise". |
| 5 | Yul | `S` "received" or `S` answer | `answers`: act 4. |
| 6 | Zed | `S` decision | K10. `for`: ? (see F7). `under`: T1. |

### Questions

| Question | Answered by | Verifier's answer |
|---|---|---|
| Was the complaint stated and delivered? | #41 Raise: "Statement of a K11 kind, delivered (K9)" | shown if Yul acknowledges; otherwise the Deliver layer's evidence, or per place by publication |
| Did each side get to answer? | #42 Hear: "K9 plus K4 waiting rule" | per place only (waiting), and see F6 for dates |
| Who decides, and did both accept them? | #43 Judge: "K10; power; rule 4" | shown: both assented to T1, which names Zed |
| Does the decision bind? | K10: "binds only through a power under rule 4" | shown, subject to F7 (whom `for` names) |
| Is it the last word? | #44 Final: "the power's K4 rule" | per place (30 days) |
| What did "finished" mean? | rule 2; K10 decides late | rule 2 shows Yul wrote it; **see F16** |
| Was Zed fair? | nothing | not reachable; the research: "the fairness is not provable" |
| Will Xan actually pay? | #45 Enforce | stated cost unless value was posted |

### Where draft 1 goes quiet

**F16. Rule 2 assigns, but no verifier answer depends on it.** "The authors are the parties who bear the failure of the words to mean one thing (#4 Align). A cMIP filling task K10 (Judge) MUST accept `authors` as an input." Accepting an input is not using it, and the judge's reasoning is outside what a verifier checks. When both parties are named authors, as in most negotiated contracts, the assignment falls on both, so on no one. The rule is honest and cheap; in disputes it may assign less than its plain words promise. **Certainty: medium.**

**F7 again**: the judge's decision binds both sides, and `for` holds one person.

---

## 8. Changing your mind

### Scenario

**Usually.** Ari rents a room to Bo. After a year they agree a higher rent: Ari writes new Terms replacing the old, both sign.

**Going wrong.** Ari writes replacement R2 (rent 600) and Bo writes replacement R2' (rent 550), both replacing R1. Each signs both at different moments, or each side shows a different one to a third person. Separately, Bo assents to R2 and on the next day wants to take his assent back before Ari has signed.

### Acts

| # | Signer | Act | Fields that matter |
|---|---|---|---|
| 1 | Ari | `R1` (root) | `parties`: Ari, Bo. No `powers`. |
| 2–3 | Ari, Bo | assents to R1 | |
| 4 | Ari | `R2` | `replaces`: R1. `agreement`: R1. `body`: rent 600. |
| 5 | Bo | `R2'` | `replaces`: R1. `agreement`: R1. `body`: rent 550. |
| 6 | Bo | assent to R2 | |
| 7 | Bo | `S` "I withdraw my assent to R2" | a K11 kind; no such kind is defined by the draft. |

### Questions

| Question | Answered by | Verifier's answer |
|---|---|---|
| Has it been changed, by those entitled? | #47 Amend: "replacing Terms; rule 4"; rule 4.2 | shown for R2 once both assent (no power, so each party's own assent) |
| Which Terms are now in force? | rule 3, rule 6 | **see F1 and F4** |
| Is R2 the latest? | rule 6 | per place, or as shown |
| Did Bo's withdrawal take effect? | stated cost "Withdrawing before in force" | **see F3** |
| Has everything owed been done? | #46 Complete: "Statement of a K11 kind" | shown as the signers' word |
| If ended early, who gets what back? | #48 End: "...then K4 and K8" | K4 computes; whether value moved: rule 7.3 |

### Where draft 1 goes quiet

**F1 again, here in its plainest form.** After R2 is in force, R1 is still in force by rule 3.1: its assents are still present. Nothing says replacing Terms ends the old ones.

**F4. Two replacements of the same Terms.** The definition makes both part of the agreement: "the first Terms act together with every Terms act that replaces it, directly or through others". If both R2 and R2' gather the assents they need, both are in force by rule 3. It is not a fork under rule 5: the two acts have different signers, and each assent by one person points at a different `previous`. Rule 6 gives an order between them if a place is named, but no rule says the later one, or the first, wins. **Certainty: high.**

**F3. Withdrawal has no act.** Rule 3 counts assents present; the default `in_force` reads no withdrawal. The draft names the race ("Withdrawal is a race that only a place, or an `in_force` rule with a deadline read from a place, settles"), but the race has only one runner: under the default, a withdrawal Statement changes nothing a verifier computes, so Bo cannot withdraw at all unless the Terms' own `in_force` rule reads a withdrawal kind. Whether this is meant (assent is final once signed) or an omission is not said. **Certainty: high** that no rule reads it; **medium** on whether it is intended.

---

## 9. Agreeing with anyone

### Scenario

**Usually.** Cyd publishes an offer: whoever returns her lost dog gets 100. Dex finds the dog and returns it; Cyd pays.

**Going wrong.** Cyd finds the dog herself and withdraws the offer on Friday; Dex returns a different dog on Saturday and says he never saw the withdrawal. Or a ticket seller's offer of "the first 100 seats" is accepted 140 times.

### Acts

| # | Signer | Act | Fields that matter |
|---|---|---|---|
| 1 | Cyd | `T1` | `parties`: Cyd (signer), role "whoever returns the dog" (description + K4 rule). `authors`: Cyd. `in_force`: K4 rule "Cyd's assent and a K5 statement that the dog was returned". `place`: P. |
| 2 | Cyd | assent to T1 | |
| 3 | Dex | assent to T1, or acceptance by act | #6 Commit "by act: K4 rule in `in_force` with K5 or K9" |
| 4 | a witness or Cyd | `S` "the dog was returned" | K5 |
| 5 | Cyd | `S` "offer withdrawn" | K11 kind "end" |

### Questions

| Question | Answered by | Verifier's answer |
|---|---|---|
| Who is the other party? | role and its rule; rule 3.2 | shown when the rule recognises Dex |
| Did Dex accept? | `in_force` rule, K5 | shown as the witness's word |
| Who bears unclear words ("the dog")? | rule 2 | Cyd, shown |
| Was the offer still open when Dex accepted? | rule 3, rule 6, stated cost "Revoking an open offer" | per place at best, and **see F9 and F1** |
| How many acceptances were there before the hundredth? | #12 Sum, rule 6 | per place only; without a place, as shown (the stated cost on scarcity) |
| Is each acceptor in the same agreement as the others? | definitions | **see F13** |

### Where draft 1 goes quiet

**F9. An open offer cannot be withdrawn alone unless it says so.** Rule 4: "There is no default power. An agreement that names no power to replace or end itself can be replaced or ended only by every party's own assent." In an open offer, one of the parties is the role "whoever does X". Every party's assent, for a role, cannot be gathered: the offeror cannot end it alone, nor can anyone. Together with F1, even an end Statement under a power changes nothing rule 3 computes. The draft states the race between withdrawal and acceptance as a cost; it does not state that under its own default there is nothing to race with. **Certainty: high.**

**F13. One agreement for all acceptors, or one each?** The offer is one root, so by the definition every acceptance is a Statement in one agreement. The Terms come into force on the first acceptance; nothing says whether the second acceptor joins that agreement (and sees the first's acts at the place), makes a new contract under the same Terms, or is turned away. This decides whether "the first 100" can be counted at all and who sees whom. **Certainty: medium.**

**F17 again**: if Cyd dies, her offer stays open; rule 3 has no check that the offeror is still there.

---

## 10. Keeping it private

### Scenario

**Usually.** Eva and Fen settle a dispute privately. Only the fingerprint is lodged at a place. Two years later Eva shows the settlement to a judge, Gil.

**Going wrong.** Eva shows Gil the settlement but not the later Statement in which she agreed to pay more. Or Fen tells his friends what the settlement says.

### Acts

| # | Signer | Act | Fields that matter |
|---|---|---|---|
| 1 | Eva | `T1` | `parties`: Eva, Fen. `body`: fingerprint only (words kept private). `relies_on`: two schedules. `place`: P. |
| 2–3 | Eva, Fen | assents | |
| 4 | Eva | `S` "I will pay 2,000 more" | `previous`: her assent. |
| — | Eva | delivers T1, body, schedules, act 2 to Gil | #40 Reveal: "Deliver the Terms; check against fingerprint (rule 1)" |

### Questions

| Question | Answered by | Verifier's answer |
|---|---|---|
| Are these the words that were signed? | rule 1 | shown, against the fingerprints |
| Is this all of the Terms? | #34 Whole: "rules 1 and 6" | the Terms: shown (everything named by fingerprint). Gil lacks a schedule: unchecked (rule 8) |
| Is this all the agreement's acts? | rule 5, rule 6 | Eva's hidden act 4: if Gil holds a later act of hers, the gap shows (rule 5); if act 4 is her last, rule 5 cannot show it. Per place, if the place holds the acts: shown missing. As shown, otherwise |
| Was it kept secret? | #39 Conceal: cost | not reachable |
| Can Gil see who acted and how often, without the words? | stated cost "Ordering and chaining show patterns" | yes, from the place |

### Where draft 1 goes quiet

**F18. What is lodged at the place: the act, or its fingerprint?** Rule 6.2 counts an act "only once the place shows it, and at the position the place gives it". The stated cost speaks of "their fingerprint lodged in a place". If only fingerprints are lodged, the place can answer "this act is here" but not "nothing else from Eva", unless the place also knows whose and which agreement each fingerprint is, which is what reveals the pattern. If whole acts are lodged, every field outside `body` (parties, powers, the `relies_on` list, every Statement's `content` if inline) is visible to whoever reads the place. The draft does not say which, and the answer decides how private "private" is. **Certainty: medium** (may be the Order layer's to answer).

**F19. Revealing a part.** The body is one fingerprint, so Eva can show Gil all of the words or none. The research asked only to reveal "to one chosen outsider", not a part, so this is a limit, not a gap. **Certainty: low** that it matters.

---

## Points that touch every situation

**F10. Does signing Terms, or any Statement, bind its signer?** Rule 4.1(a): a person is bound by an act if "they signed it in their own name". The definitions say "Stating Terms is not agreeing to them." Read literally, 4.1(a) binds Bea by her Terms act before she assents, and binds a witness by their witness statement, which the rest of the draft does not intend. "Bound by an act" is defined ("when rule 4 says so") but what being bound by a vote, a receipt or a Terms act means is not. **Certainty: medium.**

**F11. Must the acts that put Terms in force be at the place?** Rule 6.2 lists what counts only per place: "what is latest, what is whole, who holds what, whether a period has passed, or whether something was made public". Being in force (rule 3) is not on the list. So Terms naming a place can be in force from assents never lodged there, while the closed-world rule says what is not there does not count. **Certainty: medium.**

**F20. Anyone may make a Statement within any agreement.** Witnesses and judges must, and are not parties. Nothing limits who may, so strangers' acts sit in the agreement and, with a place, in its order. No rule counts them unless a K4 rule reads them, so this is harmless for the verifier and a matter for the place. **Certainty: low** that it matters.

**P5 bites everywhere.** Two verifiers holding different acts give different "as shown" answers to the same question. The draft keeps this open (P5); every situation without a place depends on it.

---

## Everything in point 3, most serious first

Ranked by how many situations it touches and whether the usual case, not only the bad one, is affected. None of these is decided here.

| Rank | Finding | Situations | Kind | Certainty |
|---|---|---|---|---|
| 1 | **F1.** Nothing makes Terms stop being in force: replacing, ending, revoking have no computed effect. "Terms are in force when the assents their `in_force` rule requires are present." | 4, 5, 6, 8, 9 | silent | high |
| 2 | **F4.** Two replacements of the same Terms can both be in force; it is not a fork and no rule picks. | 8, 3, 4 | silent | high |
| 3 | **F9.** An open offer with no power to end it can never be withdrawn, since "every party's own assent" includes a role. | 9 | two rules pull (rule 4's default and rule 3.2's roles) | high |
| 4 | **F2 / F2a.** What "fork for that signer" removes is unsaid; a party can fork on purpose to escape or block. | 4, all long-lived | reads two ways | high (F2), medium (F2a) |
| 5 | **F5.** A double sale in two agreements is invisible to rules 5 and 6; whether a sale is its own agreement or a Statement in a register is unsaid. | 1, 3 | silent | high |
| 6 | **F3.** Withdrawal of an assent has no act any rule reads. | 8, 9 | silent | high (no rule), medium (intent) |
| 7 | Stated cost **"No default way out"**, with **P3**: a gone party or an unwilling agent leaves the agreement stuck. | 5, 6 | stated cost that bites | high |
| 8 | Stated cost **"Honest forks"**: expected, not rare, in long-lived agreements; worsened by F2. | 4, 6 | stated cost that bites | high |
| 9 | **F7.** One act binding many people (a group decision, a judgment) has `for`, which holds one person. | 4, 7 | silent | medium-high |
| 10 | **F8.** A newcomer not named in `parties`: whether their assent binds them or counts. | 3 | two rules pull (definition of party, rule 3.1, the Bind paragraph) | medium-high |
| 11 | **F6.** A place gives positions, not dates; "due on 1 March" has no source. | 2, 6, 7 | reads two ways | medium |
| 12 | Stated cost **"Without a place, no scarcity and no freshness"**: most loans, sales and small offers name no place. | 1, 2, 6, 9 | stated cost that bites | high |
| 13 | **F10.** Rule 4.1(a) "they signed it in their own name" against "Stating Terms is not agreeing to them". | all | two rules pull | medium |
| 14 | **F11.** Whether the acts putting Terms in force must be at the place. | all with a place | silent | medium |
| 15 | **F12.** Rule 4.4's "the Terms" when the grant and the deal name different places. | 5 | reads two ways | medium |
| 16 | **F13.** One agreement for all acceptors of an offer, or one each. | 9 | silent | medium |
| 17 | **F14.** How a successor becomes a party. | 6 | silent | medium |
| 18 | **F17.** A pending assent or open offer survives its signer's death or loss of capacity. | 6, 9 | silent | medium |
| 19 | **F18.** What is lodged at the place (act or fingerprint), and so how private "private" is. | 10 | silent | medium |
| 20 | **F16.** Rule 2 assigns unclearness, but no verifier answer depends on it; co-authors share it with no one. | 7 | stated rule weaker than its words | medium |
| 21 | **F15.** A receipt for a thing is mapped to K9, which is about acts. | 1 | reads two ways | medium |
| 22 | **F20.** Anyone may make a Statement within any agreement. | all | silent | low |
| 23 | **F19.** The body can be revealed whole or not at all. | 10 | limit | low |

Two of these may be answered by layers draft 1 did not have (section 8 of the draft already lists them): F6 (what the Order layer gives) and F18 (what a place stores). The rest are inside Agreements' own rules.
