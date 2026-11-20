# "One witness, one hand", attacked with the recorded attacks

*Fable, 11 November 2026. Input: `fable-after-the-task-list.md` (pull request 138), sections 3, 5 and 6; the stranger's `agreement-grammar.md` and `agreement-tasks.md` on `claude/lead-records-2`; Identity 16 (words, rules 2, 4, 10, 18 to 30, 33 to 35, sections 9 to 13); Envelopes 12 (rules 13 to 20, the anchoring task); Money 14 (words, rules 1 to 3, 5, 7 to 12, 24 to 29, the vault and the clock); Agreements 24 (words, rules 7, 10, 15 to 32, 33 to 44, 73 to 80, "Made before, made after", the tasks, the keeper record); Development 12's task table; the two findings logs. Read, not run. The logs are long: I searched them by phrase and read the findings I name, so "none found" means none found by that search, not none exists. Nothing here is decided.*

## In plain words

The hypothesis fails as I wrote it, and I am glad it was attacked before anyone drafted on it.

The five "witnesses" are not one thing. They are three: an outsider who signs what it holds, in order (a home, a keeper); a line that the parties themselves draw, where what the line does not cite counts as after it (a collective's line, and more than I had listed); and a clock, which is a proof checked by a rule and has nobody to convict (an anchor, read on a time reference). Almost every rule that treats them differently was written against a recorded attack.

What does hold is narrower and, I think, more useful: they all answer one question, "was this before that line?", and the core allows four kinds of evidence for it, each with a different liar.

The hands are not one thing either, and here my own sentence in pull request 138 was wrong. I wrote that the split service is an agent that holds money and may need no rules other agents lack. The log shows the opposite was decided, twice, on purpose: a hand must receive in its own name and must never be able to sign the receipt that discharges it. An agent under a grant signs as its principal. So a hand and an agent are two things, and the difference is the guarantee.

Of the sentence "say what it saw, in its own sequence, and be convicted by its own fork", the last third is true of none of the five. And "convicted by a missing receipt" is, in the texts, "shown owing", with "late" needing a time reference, a named keeper and an anchor.

Verdict in one line: **holds with named exceptions, once restated as one question and two roles; fails as one rule.**

## 1. The witnesses, difference by difference

The five mechanisms are H (a home), K (a keeper), L (a collective's line), A (an anchor), T (the time reference). I give each difference once, with the rules quoted, then the pairs it separates.

Marks: **guarantee** (merging lets the attack back), **accident** (it could go), **unclear**.

### W1. Who names it

- H: "A home is declared by its operator's identity hash plus the relay's address." (Identity, words). Changed by the chain key alone.
- K: "Keepers are chosen by the parties when they sign, so neither side can later substitute a friendly one." (Agreements rule 36); "Only the named keepers' records count as testimony." (rule 38).
- L: "A line is a record (type 17), a rotation of the collective, a fork or a closing." (Agreements, section 10). A member draws it.
- A: "Anyone may anchor any act." (Envelopes, tasks).
- T: "An agreement that needs deadlines names its time reference." (Agreements rule 33); for money, "Anchors are compared on the clock the payee's chain declared before the lock change" (Money rule 29).

Attack: F58, a thief buys "disputed" for any bytes from any keeper; F179, a payer anchors on a reference the owner did not name. **Guarantee.** An anchor may be anyone's because a proof gains a liar nothing; a signed statement must come from someone named in advance by those it binds.

### W2. Required for an act to count, or only placing it

- H: "A rotation counts once receipts from the homes required by the home rule show they hold it. Until then it is pending" (Identity rule 28).
- K: "A record counts against a rotation only if it sits before the keeper's own record of that rotation, in the keeper's sequence." (Agreements rule 41). No act needs a record to be valid.
- A: "An anchor shows a deadline met, never missed." (rule 33).

Attack: F16 (a vanished single home is the death of the identity), F62 (the self-hosted identity that could never rotate), pattern 3. **Guarantee.** A witness that is required needs a way out of it: the homeless rotation, closure, the escape. Making keepers required would import that whole machinery into every agreement; making homes optional is Identity rule 4's trust model, where "a thief holding its chain key can serve a rotation of its own".

### W3. Powers beyond witnessing: only a home has them

- "The first valid rotation a home holds wins at that home, and its receipt fixes that order." (Identity rule 30)
- "A home MAY apply its own conditions before accepting a rotation" (rule 24)
- "A single valid objection from a live home of the old set voids a homeless rotation" (rule 49)
- Against: "A keeper's sequence is a signed order and nothing more" (Agreements rule 37); and of forks, "never an automatic "first wins"" (rule 47).

Attack: F92 (a thief with an old chain key, after the home closed, replaces three genuine rotations); F16 and rule 49's own reasoning (a thief with the chain key walks past careful homes by the homeless path); F87 (a censor makes a theft final). **Guarantee.** A home is a witness and a gate. A keeper is only a witness.

### W4. What convicts it

- H: "Two receipts that pass receipt check 1, from the same home, for different acts at the same position of the same identity chain are a conflict." (Identity rule 44), proven dishonest as rule 45 says. Of its own log: "Two such summaries carry no verdict on any receipt" (section 13).
- K: "records of two operators, or of two sequences, are not ordered against each other by their keepers" (keeper record). No rule convicts a keeper.
- L: "Two lines neither of which is before the other are concurrent." (section 10, 3). A fork of records is settled, nobody is convicted.
- A: "anchors on clocks that cannot be compared order nothing." (Envelopes, tasks).

Attack: F15 (one stolen operator key froze every identity the home served; hence "contested, not frozen" and proof position by position), F53. For keepers: **none found.**

**Mark: guarantee for the home; unclear for the keeper.** Two things to note. First, "convicted by its own fork" describes no mechanism: a home is convicted by two statements about one position of someone else's chain, and a fork of its own log convicts it of nothing. Second, a gap: a keeper that forks its one sequence. One branch can hold a record of an act before a record anchored by the deadline's point (rule 33: met); the other a record anchored past the point with no record of the act (rule 33: missed). I did not find the sentence that decides between them for a single keeper. "Met" should win, since it is a proof and "missed" an inference from silence, but the text should say so.

### W5. What the witness's own later rotation does to its statement

- H: "A receipt that lies outside the kept ancestry of a later counting rotation of the home's operator is void, unless it is included under a cosigned log summary, or it counted toward the home rule at its position." (receipt check 5)
- H, objections and the like: "One voided by its signer's rotation, or bound to a rotation its signer's escape abandons, is shown, as a dispute, and decides nothing, acknowledged or not" (Identity, "Evidence counts only while its signer's chain keeps it").
- K: "A keeper's own later rotation never undoes what its records placed." (Agreements rule 42)
- L: an act a line placed "keeps, for that collective, the effect the line gave it, whatever its signer's later rotation kept or disowned." (section 10, 4)

Attacks: F297 (a thief with an operator's signing key objects, an accomplice witnesses, the operator disowns, and the owner never leaves); F45 and F95 (receipts); F364.2 ("a witness chosen in advance cannot un-witness"); F302 (one member's rotation unwinding a collective's year); F436 (the operator's rotation, from the rehearsal). **Guarantee**, and already one principle said in four places: a statement others counted on stays; a statement that blocks someone is its signer's to withdraw. The rewrite can say it once.

### W6. What silence means

- H: "A withheld receipt leaves no evidence" (rule 28); a home is gone only by closure, auditors' absence statements, or the reader's own failed attempt (homeless procedure, step 4).
- K: "A keeper's word alone never says late" and "A deadline is shown missed only by a keeper's anchored sequence" (rule 33).
- L: "Every other act for the collective counts as made after it, whenever it was really made." and "While an act the line's history names is not held, whether an act is before that line is unknown; nothing is void on it." (section 10, 1)
- A: "An anchor shows only that something existed by a point, never that it did not exist before." (rule 33)

Attacks: F364.1 and F358 (a keeper alone cannot show a deadline missed); F304 (a verifier with one hole voided what another kept); F87; F109. **Guarantee, each one.** This is the parameter with the most values: nothing, pending, after, unknown, never. No single sentence covers it.

### W7. Time

- H: "The home's log position is a sequence number, never a time." (words); finality needs "No clock, no anchor, no higher layer." (section 12)
- K: "it places no act on a time reference." (rule 37)
- L: "Before and after among acts done for a collective are judged on the collective's own chain" (words, time reference)
- Money joins two of them: "The lock change's point is when its home quorum is met and anchored" (rule 29).

Attacks: F63 (Identity's finality depended on an anchor a lower layer could not compute, pattern 2); F358; F109 (every ordering of members' own sequences against a collective event opened another gap); F177 (an owner anchors a lock change on Monday and publishes it on Saturday). **Guarantee.**

### W8. Whose acts it may speak of

- H: only where "The home is declared in the home set in effect for that chain position" (receipt check 3).
- K: only where "the keeper is one named by the version, in force for the act, of an agreement the act belongs to" (rule 42); "An act that belongs to none (a post, a claim alone, a bake, a rotation) has no keeper of its own: only an anchor places it." (words)
- L: "Keepers place only acts for the collective: never a member's signature act, or one line against another, which only what the lines cite orders." (section 10, 5); "An Identity witness act, on neither chain, places nothing and counts for nothing in Agreements." (section 10, 2)

Attacks: F58, F363, F109, F142 and F156. **Guarantee.**

### W9. What it may open

- K: "A client MUST NOT deliver an act's content key to a party because it is a named keeper." (rule 43)
- H: "A home MUST check a rotation's validity before storing it" (Identity rule 18); the acts it reads are public.

Attack: none found; F37 is a design decision. **Accident**, in the sense that one sentence covers both: a witness reads only an act's outside, and what is public.

### W10. How its own record is hardened

- H: "Log summary. A home's signed summary of its whole log of receipts, as a Merkle tree root." (words), cosigned by auditors the owner declares.
- K: "A keeper MUST keep one sequence for its records" (rule 37) and "A keeper MAY anchor its own sequence" (rule 41).

Attacks: F15 and F45 for the audit; F364.4 for the one sequence. None found that needs the two structures to differ. **Accident in origin, but verdict-bearing**: receipt check 4 reads inclusion proofs, rule 33 reads anchors. F363 shelved the bridge ("an anchored keeper sequence might count as clock evidence for anyone") as not for before the freeze. Under F441 both formats stay.

### W11. How several count

- H: "one named authoritative home, or a threshold greater than half the distinct operators of the declared homes" (Identity rule 2).
- K: "any one, a threshold, or all" and "Each keeper's record is judged alone" (rule 38).

Attack: F59; and rule 40's reasoning, that at most one of two competing rotations may ever count. **Guarantee**, following from W2: a gate needs a majority, a witness that only adds may be any one.

### W12. The way out when it is gone

- H: the homeless rotation, closure, the escape (Identity sections 10 to 12).
- K: "If a keeper disappears, its records survive in every copy." (rule 39), and the chain of judgment, whose periods run "as the agreement's time reference judges it" (rule 35).

Attacks: F16, F63, F87, F121. **Guarantee.** They differ because Identity has no clock to count a period on.

### W13. Naming a clock, and its fallback

- Money: a main reference and a backup, by the chain key; where the lock change is anchored on the backup, "a claim anchored on the main reference also counts as made, whatever its point" (rule 29).
- Agreements: the time reference is a judge; "A condition cMIP's "unknown" and a time reference's "undetermined" are such answers." and pass to the next link (rule 35).

Attacks: F179, F177, F121. **Unclear.** F179 itself calls these "the same pattern", with the split service's backups and the vault's entries. Four fallbacks, four rule sets, and the verdicts differ.

### The ten pairs

| Pair | Differences | Mark |
|---|---|---|
| H, K | W1, W2, W3, W4, W5, W8, W9, W10, W11, W12 | guarantee, save W9 and W10 (accident) and the keeper's side of W4 (unclear) |
| H, L | W1, W2, W3, W4, W6; and a member's rotation registered on the line, which softens Identity's theft protection for the collective (section 10, 4; F302) | guarantee |
| H, A | W2, W6, W7; F177 uses both together | guarantee |
| H, T | W7 | guarantee |
| K, L | W6, W8; the line is drawn by a party, the record by an outsider | guarantee |
| K, A | W1, W6; rule 33 uses both together for "missed" | guarantee |
| K, T | W7 | guarantee |
| L, A | "Nothing else places." (section 10, 6); rule 79's stated cost, that any cure "would let something uploaded after a fork reopen it" (F131, F303) | guarantee |
| L, T | the time reference "judges deadlines and absence", never order among a collective's acts (F109) | guarantee |
| A, T | one is the proof, the other the rule that reads it; W13 | unclear on W13 only |

## 2. The hands, the same way

The brief lists a split service, a held share or escrow, a guarantor's pledge, a vault and its grantee. What the five MIRs hold is different, and that is the first finding:

- **a split service** (Agreements rules 15 to 32);
- **a conversion service** on a route (Money rules 24 to 28), a hand I had not listed;
- **a grantee** (Agreements rules 73 to 80);
- **a vault** (Money rules 2 and 3), which is the owner's own safer address and a limit on the owner's own everyday key, not someone holding for another;
- **a custodian of a share of a chain key**, "a custodian holding a share under grant, or an escrowed share released by the abandonment authority" (Agreements rule 59);
- **a guarantor's pledge: none found.** The words do not occur. Escrow of money occurs only as a condition a cMIP evaluates ("an escrow's "only once X"", rule 73) over money a split service holds.

### D1. In whose name it signs

- Split service: "The service receives in its own name." and "no service signs in anyone else's name" (rule 16).
- Grantee: "What the grantee signs with it is the person's own act" (rule 73).
- And: "Grants to a split service are retired" (rule 73).

Attack: F129 (H5), F130 (H7) and F235: a service holding a grant key could sign, as the payee, the receipt of its own payout. Decided: "a payout without the payee's own receipt stays the service's open obligation". **Guarantee**, and the one the whole of "missing receipt" rests on. **It contradicts the stranger's "Hold collapses into acting for another" and my section 4 of pull request 138.** A hand is whoever must not be able to speak for those it pays.

### D2. Who computes what it owes

- Split: "A split that does not sum exactly is invalid." (rule 21); "It MUST NOT change the plan" (rule 27); and an incoming payer's claim alone creates the debt (rule 30, first bullet).
- Conversion: "the core sees a forward only in the conversion service's receipt; a service that signs no receipt declares no forward the core can read" (Money rule 27).

Attack: for the split, rule 32's reasoning (hiding income needs the payer's silence). For the route: none found; the text states it as a cost and leaves the order to the conversion cMIP. **Unclear.** The same payer's claim that binds a split service does not bind a conversion service.

### D3. What shows it paid

- Split: "Each payout is paid as a simple Money payment ... with its own receipt naming the split in its field 5" (rule 23); "every payout without a receipt" is an open obligation (rule 30).
- Route: "where the next payee signs no receipt, the paying hop's claim with a valid rail proof shows the money arrived" (Money rule 24).

Attack: F129 for the split. **Unclear**, and it needs a sentence. Read strictly, a holder who was paid and signs nothing keeps the split service owing for ever, while Money rule 11 says a claim with the rail's proof "alone shows the money arrived". I did not find which wins for a payout.

### D4. How its scope is written

- Grant: limits "by a cMIP (fields 3, 4)" (rule 73).
- Split service: "any limits the parties choose in the publication's terms (for example how long it may hold money, or which rails it may use)" (rule 16).
- Vault: "a single payment in a unit counts as paid to the flow only if the vault has an entry for that unit and the payment is no larger than that unit's limit" (Money rule 3), changed only by the chain key.

Attack: F67 for the vault (a thief with the everyday key picks an uncovered unit). **Guarantee for the vault**, which guards an owner against its own lower key. **Unclear** between a grant's limits and a service's: two ways to write "within these limits".

### D5. What its end leaves

- Grantee: the tie rule, and adoption: "The grantor may adopt a void or disputed act under its grant as its own." (rule 76).
- Split service: "The old service still owes payouts on everything it received before." (rule 31); it leaves by a terminating act, "the old service's signature is not needed".

Attack: F359 and F365 (a thief with a grant key and an accomplice signs the victim into a debt). **Guarantee**: revocation and adoption exist because a grantee speaks as someone else. A hand speaks only as itself, so its end needs neither.

### D6. It never judges what it holds

- "The split service is no judge" (rule 35); "a judge never handles what it judges" (tasks, absence proof).

Attack: F121 (one judicial tier, so no majority picks a friendlier judge afterwards). **Guarantee.**

### D7. A hand over a key

- "A single custodian likewise needs a recovery path held by another." (rule 59)

Attack: pattern 3; rule 59's own reasoning. **Guarantee**, and it belongs with the way out, not with money.

### The pairs

| Pair | Differences | Mark |
|---|---|---|
| split service, conversion service | D2, D3 | unclear |
| split service, grantee | D1, D4, D5, D6 | guarantee, save D4 (unclear) |
| conversion service, grantee | D1, D5 | guarantee |
| vault, any of them | D4; the vault is no third party | guarantee |
| custodian, grantee | D7; a custodian is a grantee who also holds a share | guarantee |
| custodian, split service | nothing shared but the word "hold" | none found |

## 3. What a single witness rule would need

For each mechanism to stay expressible, the rule needs these parameters. Where two values differ, merging them moves a verdict.

| Parameter | Home | Keeper | Line | Anchor on a time reference |
|---|---|---|---|---|
| Named by | the subject's chain key | every party, in the terms | the collective's own agreement: any member draws | the terms (judicial tier), or the payee's chain key |
| May speak of | that identity's chain acts | acts that belong to the agreement | acts for the collective, by citation | any act |
| Which sequence | its log of receipts | its one sequence of records | none: what the line cites | the clock's own |
| What it says | "I hold this, first at this position" | "I recorded this, here in my order" | "these are before me" | "this existed by this point" |
| Needed to count | yes | no | no; but what it leaves out is after it | no |
| Which contradiction convicts | two receipts at one position of the subject's chain | none stated | none: a fork, settled | none |
| Its later rotation | voids, unless cosigned or already counted; always for an objection | never undoes what it placed | never undoes what it placed | no signer |
| Silence means | pending; "gone" only by three named proofs | nothing; "missed" only with anchors on both sides | after; unknown where the history has a hole | nothing, ever |
| Several | majority of operators, or one authoritative | any one, a threshold, all | concurrent lines are a fork | main, then backup |
| When it is gone | homeless rotation, escape | copies; the chain of judgment | any member draws the next | the backup |

Ten parameters, and in seven of them the four columns do not agree. A rule with seven switches is four rules.

**Would any verdict move?** If the texts are only reorganised, with each column kept, none. If any column is made to match another, yes, in every row marked guarantee above. The two rows where a merge looks safe are W9 (what it may open) and the statement of W5 (said once, both halves).

## 4. Where "convicted by a missing receipt" depends on a witness and a time

Written out, for a split service that received a payment and should pay a holder.

1. **That it received.** Shown by the service's own receipt, or without it by "every payer's claim showing money arrived" (rule 30). So the first witness against a hand is the payer, and behind the payer the rail Module's rule, which may rest on "a named trusted party's signed confirmation" (Money rule 9). Rule 32 says it plainly: hiding income "requires the payer's silence or collusion".
2. **What it owes.** Computed by any verifier from the plan, the shares and the amount. No witness.
3. **That it has not paid.** No valid receipt of the holder naming the split. This is an absence, and the core gives it one meaning only: an open obligation, "naming exactly one receiver and one agreement" (rule 30). Money says the same of a route: a forward still being paid "shows as owed at once".
4. **That it is late.** Nothing in steps 1 to 3 says late. For that the agreement must name a time reference (rule 33); state the period ("how long it may hold money", rule 16, or the batching terms, "measured on the publication's time reference", rule 26); and name keepers, because "A deadline is shown missed only by a keeper's anchored sequence". The keeper must have anchored a record past the point and hold no record of the holder's receipt before it. And that rests on the keeper recording acts as they arrive, "trust in keepers, accepted and stated" (rule 42).
5. **Where that chain is missing.** "a lone seller's publication has none, and its deadlines can be shown met by anchors but never missed" (publication format). There a hand can be shown owing for ever and never shown late.
6. **The receiver's silence.** By D3, a paid holder who signs no receipt leaves the hand owing. So the missing receipt convicts the hand on the word of the party it paid. Money's double entry (the hand's own claim with the rail's proof) is the natural answer; the sentence joining it to rule 30 is the one I did not find.

So the honest sentence is: **a hand is shown owing from the payer's claim until the receiver's receipt; it is shown late only on the agreement's time reference, by a named keeper's anchored silence.** "Convicted" is too strong for the first half and needs three other mechanisms for the second.

## 5. My view

**The hypothesis fails as one rule and holds as one question.**

It fails because the differences are guarantees. Of thirteen differences among the witnesses I mark ten guarantee, two accident (W9, W10) and one unclear (W13), with one gap inside W4. Of seven among the hands, four guarantee, three unclear or partly so. No attack I found is one the hypothesis could absorb by "the agreement picks which".

Three corrections to pull request 138 follow.

1. **Not five witnesses, three kinds.** A named outsider who signs what it holds in order (home, keeper). A line the parties draw themselves, which is not a witness at all but the stranger's closed-world rule: what the line does not cite counts as after it. And a clock, which is a proof and a rule, with no signer.
2. **The line is the larger family.** The same reading, "before it if its history holds it; the ending wins a tie; unknown where the history has a hole; what it placed stays placed", is used for a collective's records, forks and closings, for a revocation's history (rule 76), for a deal's declaration, and for a stake's transfers on the seller's own chain (rule 10, F224). Draft 24 explains it once for collectives and again, shorter, for each of the others. This is where saying a rule once would save the most.
3. **A hand is not an agent.** It is the opposite: the one party that must never be able to sign for those it pays.

One point of scope. F441 rewrites Agreements. Homes live in Identity 16 and the money clock in Money 14. A rewrite of Agreements cannot merge them with anything, and should not try: it should point at them.

**What parts 4 and 5 of the skeleton would then say.** As a proposal.

*Part 4, "Before a line", in place of "What a witness may do".*

- A line is an act that ends or changes a power: a rotation, a revocation, a record, a fork, a closing, a declaration; and a deadline is a line on a clock.
- One question: was this act before that line? Four kinds of evidence, and no other:
  - **the line's own citations.** The liar is the line's signer, who can leave an act out. So: the cost of what it leaves out falls on its signer unless others relied; what it placed stays placed; the ending wins a tie; a hole in its history answers unknown.
  - **a named keeper's order.** The liar is the keeper, who can record late. So: named in advance by everyone it binds; it speaks only for acts that belong to that agreement; its record counts only beside the valid act; its later rotation undoes nothing it placed; several are counted as the terms say.
  - **a clock.** No liar, and so it says the least: this existed by this point. Never that something did not.
  - **a keeper's order with a clock on both sides**, the only evidence of absence by a point: a deadline missed.
- Homes are Identity's, and gate a rotation; Agreements reads what Identity answers.

*Part 5, "A hand", in place of "What a hand may do".*

- A hand receives in its own name and never signs for those it pays.
- What it owes is computed from the signed plan and what the payer or the hand itself shows it received.
- It is discharged by the receiver's own receipt (and, if Nobody, allegedly so decides for D3, by its own claim carrying the rail's proof).
- Until then it owes, visibly, one receiver under one agreement. It is late only as part 4's last bullet shows.
- It follows only the plan and judges nothing it holds.
- Acting for another is not this part: a grant is words between people (part 1), and its end is a line (part 4).

**What I would ask Nobody, allegedly, one at a time, the first only:** for a payout, does the service's own claim with the rail's proof show it paid where the holder signs no receipt (D3)? Everything else here is a reading; that one is a verdict the texts leave open.

## What I read and what I reason

Read: the rules and sections named at the top, each quote copied from the texts on main at `fc624ab8`, and the findings F11, F15, F16, F37, F45, F57, F58, F59 (by title), F60, F62, F63, F67, F87, F92, F95, F109, F110, F121 (by title and mentions), F123, F129, F130, F142, F156, F177, F179, F181, F224, F226, F235, F297, F299, F302, F303, F304, F358, F359, F363, F364, F365, F375, F400, F441. I did not reread Agreements 24 whole for this, nor the Text MIR, nor the MICS beyond searching it; a rule that treats two mechanisms differently in a section I did not open is not here. Reasoned, not read: the marks; the claim that a keeper's forked sequence has no stated verdict (I searched for one and found none); the reading of the line as one family across rules 10, 76 and section 10; and the proposal of section 5.
