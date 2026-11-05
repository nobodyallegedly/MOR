# cMIP: Majority and treasury (a second control model)

*Draft 2, written by an outside builder from the nine texts only: the six MIRs (Agreements draft 19, Money draft 12 and the others), the MICS map, the freeze test suite and the default control cMIP (draft 2), and draft 1 of this model. Experimental. Rule numbers with no MIR named are Agreements draft 19's.*

## In plain words

Under this model, **money moves only when members who together hold more than half of the collective's stake in itself agree.** "More than half" is measured against what the members who are still in hold, so shares held by people who have left never block the members. Every Money act counts this way: pointing income somewhere, owing, receipting, claiming, releasing a debt, pricing. One member holding more than half acts alone; the client shows it before anyone signs.

Changes to the collective's working settings need the clone rule. The model can say *that* the clone rule is needed, but not *how* it counts: the terms' own field 5 decides that. So founders who want those changes decided by majority of share write field 5 as `[3, 0, 500001]`.

**Draft 1 had treasurers. This draft drops them.** Section 2 says why.

## 1. What changed from draft 1

- Money acts count by share through rule 99's `[2, counted]` (section 4), which draft 1 lacked.
- Field 5 is no longer ignored: it counts the clone rule "as the terms write it" (rule 99).
- Rule 74 settles draft 1's guess 11: changing the model ends every grant within an area (freeze 7az). Moving from draft 1 to draft 2 changes field 35, a constitutional clone, and the treasurers' grants end at that line.

## 2. The treasurers: dropped

Draft 2 gives no area. The reasons:

1. **An area counts heads** ("Areas keep counting heads in MOR 1", rule 65). A treasurers' area that kept Money's acts would bring back counting by heads, which is what this amendment removes.
2. **Choosing the payment and conversion cMIPs (tasks 6 and 7) is a bigger power than any single payment.** Those cMIPs' acts are Money acts too (rule 60, "What a layer's rule reaches"). If a few treasurers could adopt a payment cMIP, they could shape how every payment runs, while each payment needs the majority. An area whose reach is empty and whose only job is tasks 6 and 7 would be that hole.
3. Without an area, tasks 6 and 7 are adopted under the Money layer's rule (rule 60) together with the clone rule (section 5). If field 5 is by share, that clone needs a majority by share too.

*Stated cost:* every receipt and claim needs a majority's signatures; routine acts go to a grantee (rule 74; guess 6).

## 3. Parameters

```cddl
treasury-params = {
  ? 2 => tstr        ; the model's words for this collective, canonical text, shown before signing
}
; keys 0 and 1 (draft 1's treasurers and their number) are withdrawn: parameters carrying them are invalid
```

Unknown keys, or any value outside this format, make the parameters invalid. `{}` is valid.

**The Money actors.** For an act, these are the parties of the agreement in force whom the Money layer's rule (field 19, key 3) names as actors. If key 3 is `[0]` or `[1, k]`, that is every party. If it is `[2, [+ hash]]`, it is the parties listed. The list is ascending, with none twice, so a party holding two seats is listed once. The core then counts only those whose voice remains (rule 65).

**Majority by share** is the rule `[3, 0, 500001]`.

## 4. Acts (`answer` for an act)

An act belongs to Money when its `spec` is the Money MIR's hash (types 0 to 5), or a specification that the agreement in force names in field 2 for task 6 or 7. For such an act the model answers:

```
[0, [2, [ [6, 3], <the Money actors, section 3>, [3, 0, 500001] ]]]
```

For every other act the answer is `[0, [0]]`: it counts under its layer's rule (rule 60).

The core counts (rules 65 and 99): the act counts when its drafter and the parties whose valid signature acts name it, all among the Money actors whose voice remains, hold together at least 500,001 millionths of what those voices hold of stake 0 (field 7 of the agreement in force, with the transfers placed before the act). Where no voice holds anything of the stake, all the voices that remain together meet the rule. Freeze 7ay applies: with holdings of 50/30/20, the 30 and the 20 signing together do not meet the rule (exactly half is not more than half), and the 50 alone does not meet it either.

The vault and the clock are not reached: they are Identity declarations by the chain key (Money, "The vault", "The clock").

## 5. Clones (`answer` for a clone)

The model compares the clone with its parent. Its answer is `[1, { 0 => <powers, ascending by deterministic encoding> }]`, never with key 1.

| Change | Powers named |
| --- | --- |
| A field 2 entry for a task of layer L (6, 7 → Money; 1 Text, 2 Envelopes, 4 Agreements for the other operational tasks, by Development's table) | `[[6, L], <voices>, <parent's field 19 entry for L>]` and `[[1], <voices>, <parent's field 5>]` |
| An entry naming a specification that the clone also names for another layer's task | the `[6, L]` power for each of those layers too (rule 60) |
| A field 2 entry for task 1, 2 or 3 (Identity) | `[1]` only |
| An extension added or dropped (field 15) | `[6, 5]` and `[6, L]` for each layer L it declares (Development field 10), and `[1]` |
| An issuance (field 7) | `[1]` |
| Any other operational difference, or none | `[1]` |

The `rule` this model writes in each `[1]` entry is the parent's field 5. The core counts `[1]` by field 5 whatever an entry says (rule 99). A clone that also makes a constitutional change is asked only about its operational changes. The core sets `[1]` aside beside `[0]` (rule 99, "A clone with constitutional and operational changes").

## 6. Queries

`{ 0 => [ ], 1 => [ ] }`. There are no areas, and every stake's holders' rule is "every holder" (`[0]`). So each holder who has no say signs for itself every issuance, sale or release of the stake (rules 48, 98).

## 7. Refused and unknown

**Refused**: `[2, "treasury: parameters invalid"]`, for every act and every clone the model is asked about, and only when the parameters are invalid. The text of the reason is informative. Repairing the parameters is a constitutional clone, which is never asked of a model (rule 99), so the collective can always repair them.

**Unknown**: `[3]`, for a clone that adds or drops an extension whose specification the verifier does not hold (rule 99). Nothing else this model answers needs more than the terms and the parent.

**Overreaching** cannot arise as written: `among` lists parties, and the act rule is by share (freeze 7ay).

## 8. Own act types

None. Any act whose `spec` is this cMIP's hash is invalid (rule 99).

## 9. How it meets rules 98 and 99

- **Deals** never name field 35. **Constitution and judicial tier (98.3, rule 67).** The model names no `[0]`, `[3, party]` or `[4]`, and is never asked about them. Its parameters change only by a constitutional clone.
- **Stakes (98.2).** The model gives no holders' rule and no `[5, stake]`, so every holder signs any reduction or issuance. The by-share power reaches only Money acts. Field 7, stake transfers (type 4), releases (type 5) and grants stay under the rule for Agreements.
- **One holder paid unlike the others; role shares**: never reached (rules 22, 27, 48).
- **Entering an agreement or a publication** is an Agreements act, under that layer's rule (98, last guarantee). The by-share power never reaches it.
- **Who acts in a layer (98.5).** `among` is the Money actors only, so the power narrows the Money layer and adds nobody to it. Signatures that meet the share rule always meet the layer's rule once the remaining actors' signatures are added, so the test of "the same signatures plus others" holds.
- **The core counts.** Every power the model names is a `counted` triple. The model reads no signature, no roster and no clock.
- **A verifier without this model** judges the way out alone, and shows Money acts and operational clones as unknown (rule 98).
- *Client conformance at founding* (rules 60, 98): the client shows that one member holding more than half of what the members hold acts alone in Money, and that the clone rule counts as field 5 is written.

---

## Where the texts left me guessing

1. **Which `power` goes inside an act's `counted`.** Rule 99's CDDL requires a power, but no text says which one an everyday act carries. `[1]` would be counted "always by field 5", and `[6, layer]` is defined for adopting cMIPs. *Guess:* `[6, 3]`, the power the answer takes the act out of. *Alternative:* `[1]`, or `[2, 0]` with no area behind it.
2. **Who `among` names.** Rule 99 says "parties of the agreement in force", and rule 98.5 says a model only narrows a layer. *Guess:* the Money layer's actors, so that a Money rule of `[2, [treasurer]]` gives majority by share among one person. *Alternative:* every party (closer to "a majority of the members"), at the risk of being overreaching under 98.5 where field 19 names only some.
3. **Whether the drafter must be among `among`.** Rule 60 requires a holder for an area. Rule 99 says only "its signers among those parties". *Guess:* yes, by analogy with areas. *Alternative:* a drafter outside `among` is valid, and only its share is ignored.
4. **Rounding.** `[3, 0, 500001]` means "at least 0.500001 of what the voices hold". When the voices hold an odd number of millionths above 500,000, that sits one millionth above "more than half", and the texts give no rounding rule. *Guess:* the core compares exactly (signers × 1,000,000 ≥ 500,001 × voices' total). *Alternative:* round down, or a model writing 500,000 and reading "at least" as "more than".
5. **The fewer-voices clause, restated in shares**, seems empty: the share is of what the voices hold, so all of them together always hold 100% of it. *Guess:* only its "none holds anything" half ever matters.
6. **Grants under a by-share power.** Rule 74 checks a grant's reach against "the rule of the layer, or of the area". `[2, counted]` is neither. *Guess:* the by-share power counts as the rule that reaches the act, so a majority by share can grant receipts to one person. *Alternative:* only the Money layer's rule backs Money grants, which would let a grant get around the majority, or no grant can reach these acts at all.
7. **Acts of the Money cMIPs.** The task says "the Money MIR's acts". *Guess:* the acts of the task 6 and 7 cMIPs too, since otherwise payments made through them get around the majority. *Alternative:* the six MIR types only. Acts of extensions that declare Money are left under Development's rule, which is another guess.
8. **Field 5 not written by share.** The model cannot make clones count by share (rule 99). *Guess:* accept any field 5 and rely on the founders and the client. *Alternative:* refuse operational clones until field 5 is `[3, 0, 500001]`.
9. **Founding-time client conformance** asks the client to show "every area, Money first". A by-share power is not an area and does not appear in `query-answer`: the client learns it only by asking about an act. *Guess:* the client asks the model about a sample Money act at founding. Nothing in the texts says so.
10. **The rule written inside a `[1]` entry** is ignored (rule 99). *Guess:* copy field 5, so that the answer and the count agree. *Alternative:* anything, or majority by share as draft 1 had it.
11. **Kept from draft 1, still open:** Identity tasks in field 2 (draft 1's guess 7), an issuance's power (12), whether an empty powers list is legal (13), refusal text bytes (14), and clients that hold only the default model (15).
