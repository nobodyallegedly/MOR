# cMIP: Majority and treasury (a second control model)

*Draft 1, written by an outside builder from nine texts only: the six MIRs (Agreements draft 19, Money draft 12 and the others), the MICS map, the freeze test suite, and the default control cMIP (draft 2). Experimental. Rule numbers with no MIR named are Agreements draft 19's.*

## In plain words

A collective that names this model works like this. Changes to the collective's working settings (which payment cMIP it uses, which extensions it adopts) need members who together hold **more than half** of the stake the members hold in the collective. Everything about Money is run by named **treasurers**: a fixed number of them sign each Money act together, and they choose the collective's Money cMIPs. Everything else works as the core says. This model has no owners' votes, no issuance offers and no proxies of its own: an owner who is not a member signs for itself whenever the core asks for its consent.

**I changed the suggested model on one point.** The task asked for *everyday acts* to count by majority of share. Rule 99's answer for an act allows only two answers: "the layer's rule" (`[0, [0]]`) or "this area" (`[0, [1, area]]`), and an area counts heads ("Areas keep counting heads in MOR 1", rule 65). Field 19's layer rules have no form by share either. So no control model in MOR 1 can make an everyday act count by share. In this model, **majority by share governs operational clones**, the Money area governs Money's everyday acts, and every other everyday act counts under its layer's rule (field 19). This is guess 1 below.

## 1. What it fills

This cMIP is a control model (rule 99), named in terms field 35 as `[ this cMIP's hash, params ]`. It is asked only about two things: an act for the collective (rule 58), and a clone that makes no constitutional change, or the operational part of one that does. It is never asked about the way out (rule 98) and never answers for it.

## 2. Parameters

```cddl
treasury-params = {
  0 => [* hash],     ; the treasurers: parties of the terms, ascending, none twice;
                     ; empty only in a clone (terms with field 11): the Money area then stands frozen (rule 71)
  1 => uint,         ; how many treasurers sign together: at least 1; in founding terms at most the
                     ; number of treasurers; a clone may keep a number above the treasurers who remain,
                     ; counted as rule 65 says
  ? 2 => tstr        ; the Money area's words, canonical text, shown before signing
}
```

Unknown keys, or any value outside this format, make the parameters invalid.

**Who counts as a treasurer.** At each act or clone, the treasurers are those listed in key 0 who are (a) parties of the agreement in force, and (b) among the actors of the Money layer's rule there: any party where field 19's key 3 is `[0]` or `[1, k]`, or a party it names where it is `[2, [+ hash]]`. A listed identity that fails (a) or (b) is read out, and the parameters stay as they are. This follows the default model's practice after a removal or a succession (rules 69, 83), and rule 98.5's "narrowing": an area names "among the layer's actors, who acts for the acts it reaches".

**The Money area.** It has the fixed id **0**. Its reach is every act type of the Money MIR's specification: payee pointer (0), obligation (1), settlement receipt (2), payment claim (3), creditor's release (4), price tag (5). It decides the cMIPs of field 2 for the Money tasks: **6 (payment) and 7 (conversion)**. The vault and the clock are not in its reach. They are Identity declarations made by the chain key (Money, "The vault", "The clock"), so the key grammar governs them.

**Majority by share** is the rule `[3, 0, 500001]`: the parties whose voice remains, holding together at least 500,001 millionths of what those parties hold of the collective's stake in itself (field 7, index 0), counted by the core as rule 65 counts any rule by share, its fewer-voices clause included.

This model ignores terms field 5. Power `[1]` under this model always means majority by share. Founders should write field 5 as `[3, 0, 500001]` anyway, so that the terms say on their face what `[1]` means.

## 3. Queries (`query-answer`)

For the agreement in force, the model answers:

```
{ 0 => [ { 0 => 0,
           1 => <treasurers as read in section 2, ascending>,
           2 => <parameter 1>,
           3 => [ [MONEY, 0], [MONEY, 1], [MONEY, 2], [MONEY, 3], [MONEY, 4], [MONEY, 5] ],
           4 => [ 6, 7 ] } ],
  1 => [ ] }
```

Here `MONEY` is the Money MIR's specification hash. Key 1 is empty, so every stake's holders' rule is "every holder" (`[0]`). The core therefore asks each holder who has no say to sign for itself (rules 48, 98).

With invalid parameters, the query answer is `{ 0 => [ ], 1 => [ ] }`. There is then no area, and everyday acts fall back to the layer rules.

## 4. Acts (`answer` for an act)

For an act for the collective whose `spec` is the Money MIR's hash and whose type is 0 to 5, the answer is `[0, [1, 0]]`: the Money area reaches it. For any other act, the answer is `[0, [0]]`: it counts under its layer's rule (rule 60).

The core then counts. A Money act counts when at least `number` of the treasurers whose voice remains sign it, its drafter among them (rules 60, 65). Grants within the area and their revocations are the core's (rule 74). An area with no treasurer left stands frozen (rule 71).

## 5. Clones (`answer` for a clone)

The model compares the clone with its parent. It looks only at the entries it governs:

- **field 2**, entry by entry, for tasks other than 8, 9, 10, 11 and 14;
- **field 15**, entry by entry (each extension added or dropped);
- **any other difference that is no constitutional or judicial field** (rule 98.3's list, rule 67's list). In MOR 1 the only such difference is field 7 changed by an issuance.

It builds the set of powers below, then answers `[1, { 0 => <those powers, each as counted, ascending by deterministic encoding> }]`. It never includes key 1.

| Change | Power, `among`, rule |
| --- | --- |
| An entry for task 6 or 7 | `[2, 0]`, among the treasurers (section 2), rule `[1, number]` |
| An entry for another task of layer L (1 Text, 2 Envelopes, 4 Agreements; task-to-layer from Development's table) | `[6, L]`, among the voices, rule = parent's field 19 entry for L; **and** `[1]` |
| An entry naming a specification that the clone also names for a task of another layer | the power above for each of those layers too (rule 60) |
| An entry for task 1, 2 or 3 (Identity) | `[1]` only; Identity has no key in field 19 |
| An extension added or dropped | `[6, 5]`, and `[6, L]` for each layer L its specification declares (Development field 10), with the Money area's `[2, 0]` standing in for `[6, 3]`; **and** `[1]` |
| An issuance (field 7) | `[1]` |
| No change at all | `[1]` |

Each `[1]` is `[[1], <the voices, ascending>, [3, 0, 500001]]`. A clone whose only changes are Money tasks needs the treasurers alone. A clone that changes anything else operational also needs majority by share.

Where the clone also makes a constitutional change, the model answers in the same way. The core asks `[0]` and sets `[1]` aside (rule 99: "the clone rule, `[1]`, is never asked beside `[0]`"), so in that clone the constitutional change rule replaces the majority.

## 6. Refused and unknown

**Refused**, `[2, reason]`, is answered only for invalid parameters (section 2), and then for every act and every clone it is asked about. The reason is `"treasury: parameters invalid"`. The reason text is informative only. Because constitutional clones are never asked of a model, the collective can always repair its parameters.

**Unknown**, `[3]`, is answered for a clone that adds or drops an extension whose specification the verifier does not hold, since its declared layers cannot be read. Nothing else in this model needs an act the line might lack: it reads no roster, signatures, model acts or time facts.

## 7. Own act types

None. This specification declares no act type. Any act whose `spec` is this cMIP's hash is invalid (rule 99, "A model's own acts").

## 8. How it meets rules 98 and 99

- **Deals** never name field 35, so this model never meets one (rule 47).
- **Constitution and judicial tier.** The model is never asked about them, never names `[0]`, `[3, party]` or `[4]`, and adds nothing to them. Its own parameters change only under the constitutional change rule, because field 35 is constitutional.
- **Stakes and pay (98.2).** The model gives no holders' rule and never names `[5, stake]`. Every holder signs any reduction or issuance. Its area reaches no Agreements act, so field 7, transfers (type 4) and releases (type 5) stay under the rule for Agreements, and each holder who has no say signs each sale or release (rule 98's guarantee).
- **What one holder is paid unlike the others.** Not reachable. The split agreement is constitutional and outside every model.
- **Role shares on the record.** These are the split's, judged by the core (rules 22, 27).
- **Entering a publication or agreement** (type 6, signature acts) is outside the area's reach and counts under the rule for Agreements.
- **Who acts in a layer (98.5).** The area takes only Money MIR act types out of the Money layer's rule. Its holders are read only from among that layer's actors.
- **The way out, absence, forks, closings, rollback.** Never asked, never answered.
- **The core counts.** Every power named is a `counted` triple. The model counts no signature and reads no clock.
- **A verifier without this model** judges the way out alone, and shows Money acts and operational clones unknown (rule 98).
- *Client conformance at founding* (rules 60, 98): where `number` is 1, the client warns that one treasurer acts alone in Money.

---

## Where the texts left me guessing

1. **Everyday acts cannot count by share.** Rule 99's `act-answer` is only `[0]` or `[1, area]`, and rule 65 says "Areas keep counting heads in MOR 1". Field 19's `layer-rule` has no form by share. *My guess:* move majority by share to operational clones only. *Another team might* answer `[2, reason]` (refused) for an everyday act that lacks a majority of share among its signatures. Rule 99 hands the model "the signatures" but also says it "counts no signature itself". They might also make a heads-majority area per layer, or put a by-share decision "behind an area's single holder" (rule 65's hint), for example by making a sub-collective the holder.

2. **Why is the model handed signatures it may not count?** Rule 99's inputs include "each signature act the line places on the act or clone", while "who signed: it counts no signature itself". The texts do not say what use of them is allowed. The default model uses them only for proxies.

3. **"More than half" is not a form the grammar has.** `[3, stake, share]` means "at least", and it is measured against what the voices hold together, not against the whole stake (rule 65). The task's "more than half of the collective's stake" suggests the whole stake, which only `[5, …]` measures, and that form is "field 18 only". *Guess:* `[3, 0, 500001]`. The texts give no rounding for share × total, so "at least 0.500001 of T" and "more than T/2" differ in a narrow band.

4. **`[1]` is dropped in mixed clones.** Rule 99 says `[1]` "is never asked beside `[0]`". Bundling an operational change with any constitutional change therefore skips the majority. That is fine when field 18 is stricter, and a hole when it is not (for example any two heads). The texts also conflict on whether the model is asked about such a clone at all: rule 99 says "a model is never asked about a constitutional change", yet the same rule says the operational part needs powers "as the model answers for them". *Guess:* the model answers the whole clone the same way, and the core drops `[1]`.

5. **The meaning of field 5 under another model.** Terms say field 5 is "read by its control model", but not whether a model may ignore it. *Guess:* ignore it. *Alternative:* `[1]` is counted by field 5's rule as written, and the model refuses terms whose field 5 is not by share.

6. **Extension layers are outside the model's inputs.** Rule 63 (default) and rule 60 need the extension's specification (Development field 10). Rule 99 says the model "reads no other act". *Guess:* treat the specification as data handed with the terms, and answer `[3]` where it is not held. *Alternative:* name `[6, 5]` only and trust the core to add the declared layers, which risks verifiers disagreeing.

7. **Identity tasks (1 to 3) in a collective's field 2.** Identity has no key in field 19, so no `[6, 0]` exists. *Guess:* `[1]`. *Alternative:* refuse such entries, or treat them as Agreements'.

8. **What narrowing means (98.5).** "Never a rule the layer's rule would not meet with the same signatures plus others" can be read as "the holders are a subset of the layer's actors" (my reading), or as "the area's number may not be below the layer's threshold". The second reading would forbid one treasurer under a Money rule of `[1, 2]`. The default model's single-holder areas suggest the first reading.

9. **Treasurers who are not, or are no longer, valid actors.** *Guess:* read them out silently, as the default model does. *Alternative:* refuse.

10. **The Money area's reach.** Does it cover only the Money MIR's six types, or also act types of the payment and conversion cMIPs? The model cannot list those types from its inputs. Is a creditor's release "traded for future terms" also an Agreements act, needing both rules? *Guess:* the six types; the core handles two-layer acts.

11. **Area ids across model changes.** Ids "never reused" is the default model's rule, not the core's. If a collective switches from the default model to this one, its old area 0's grants (which name the area by id, rules 71 and 74) might fall into my treasury area 0. *Guess:* none written. A second team might start ids above every earlier id, which the model cannot see without reading history.

12. **The power for an issuance.** Field 7 belongs to no tier, and rule 98.2 handles the holders. *Guess:* the members' consent is `[1]`. *Alternatives:* no power (empty list), or refusing every issuance.

13. **Is an empty powers list legal?** `0 => [* counted]` allows it, and it would mean "no signature needed". I never answer it, but nothing forbids it.

14. **Refusal reasons are free text.** It is unclear whether two implementations must produce the same bytes. *Guess:* informative only.

15. **Clients that hold only the default model.** The founding-time conformance rule says the client shows "every area, Money first", but only the default model is mandatory for clients. *Guess:* a client should not sign founding terms naming a model it does not hold (by analogy with the absence-proof rule). The texts do not say so.

16. **A grant's acts.** A grant is an Agreements act, so my answer for it is `[0, [0]]`, yet rule 74 judges a grant naming the area "by the area it names alone". *Guess:* the core's rule wins, and the model's answer for grants is ignored.
