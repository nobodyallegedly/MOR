# Five verdicts under "Majority and treasury", draft 2

*An outside verifier builder's reading. Sources: only the texts in `paper2/texts/` (Agreements draft 19, Money draft 12, the other MIRs, the MICS map, the freeze test suite, the default control cMIP) and `second-model-draft-2.md`, its section "Where the texts left me guessing" set aside. Rule numbers with no MIR named are Agreements draft 19's.*

## The collective, as the verifier reads it

- Parties and voices: Ana, Ben, Cy. All three voices remain (no resignation and no declaration is placed).
- Stake 0 (field 7): Ana 500,000, Ben 300,000, Cy 200,000. Together the voices hold 1,000,000.
- Field 5 (clone rule): `[3, 0, 500001]`, a rule by share. It is allowed for a collective's clone rule ("Rules by share, and 'all of'").
- Field 18 absent, so the constitutional change rule is every party. Field 19: `[1, 2]` for every layer, so the Money layer's rule is any two members.
- Field 2: task 6 → P1, task 4 → X1. Field 35: Majority and treasury draft 2, with valid parameters, so the model never refuses.
- Money actors (model section 3): field 19 key 3 is `[1, 2]`, so every party.

Below, `A`, `B`, `C` stand for Ana's, Ben's and Cy's identity hashes, and `[A, B, C]` means the three of them **ascending by hash**, whatever that order is.

Field 7 has no transfers placed, so every count uses 500,000 / 300,000 / 200,000. The test is exact: signers × 1,000,000 ≥ 500,001 × 1,000,000. That means a signer set needs at least 500,001 millionths, which is more than half.

---

## Act 1. Payee pointer drafted by Ben, signed by Cy

**Verdict: does not count.**

**Model's answer:** `[0, [2, [[6, 3], [A, B, C], [3, 0, 500001]]]]`

A payee pointer is Money type 0, so the model gives it the power by share (model section 4). Rule 99, "An everyday act by share", says this power takes the act out of the Money layer's rule, the way an area does. So the act's own `[1, 2]` no longer decides. The signers are Ben, the drafter, and Cy, by a signature act. Both are Money actors whose voice remains. Together they hold 300,000 + 200,000 = 500,000. That is exactly half, below 500,001, so the rule is not met. The fewer-voices clause does not apply, because the voices together hold the whole 1,000,000.

Freeze 7ay is this case word for word: the 30 drafts, the 20 signs, the pointer does not count, because half is not more than half.

The answer is not overreaching. Its rule is a rule by share, and `among` names only parties. It also only narrows the layer (rule 98.5): no single member holds more than half, so any signer set that meets the share rule has at least two members and also meets `[1, 2]`.

**Rules relied on:** 58, 60, 65 ("Counting by share", among the parties), 98.5, 99 (`[2, counted]`, "An everyday act by share"), Money rule 7 ("A collective's Money acts"), freeze 7ay.

**Unsure of:**
- Money's own sentence says a collective's Money act is "judged ... under the rule its founding names for Money (Agreements rule 60)". It does not mention a model's power by share. I followed Agreements rule 99 and freeze 7ay, which say plainly that the by-share power replaces the layer's rule. Read on its own, Money's wording would let the act count under `[1, 2]`.
- Rule 99 does not say which `power` an everyday act's `counted` carries. The model writes `[6, 3]`. For the verdict that does not matter, since the core counts the rule and `among`, not the power's label.

## Act 2. Payee pointer drafted by Ana alone

**Verdict: does not count.**

**Model's answer:** `[0, [2, [[6, 3], [A, B, C], [3, 0, 500001]]]]`

The power is the same as in act 1. The only signer is the drafter, Ana, who holds 500,000. That is half, not more than half, so the rule is not met. Freeze 7ay states this case too ("the member holding half drafting it alone does not count either").

It would not count under the layer's rule `[1, 2]` either, since that rule needs two members. So the verdict does not depend on which rule applies.

**Rules relied on:** 60, 65, 99, freeze 7ay.

**Unsure of:** nothing material. The model's plain-words section says "one member holding more than half acts alone". Ana holds exactly half, so that does not apply to her, and a client should show this at founding.

## Act 3. Payee pointer drafted by Ana, signed by Cy

**Verdict: counts.**

**Model's answer:** `[0, [2, [[6, 3], [A, B, C], [3, 0, 500001]]]]`

The signers are Ana (the drafter, 500,000) and Cy (by a signature act, 200,000). Together they hold 700,000, which is at least 500,001, so the rule is met. Both are parties of the agreement in force, signed it, and keep their voice (rule 60's three conditions). The act is done (rule 57), and it cites the latest decision (rule 58), so it counts for the collective.

The two signatures also meet `[1, 2]`, so rule 98.5's narrowing test holds. Rule 57's paragraph on owners without a say does not apply here, because every holder of the stake is a member.

**Rules relied on:** 57, 58, 60, 65, 98.5, 99, freeze 7ay (by analogy: there the 30 drafts and the 50 signs; here the 50 drafts and the 20 signs).

**Unsure of:**
- The model's ruling that the drafter must be one of the Money actors. That makes no difference here, since Ana is one.
- The same Money-versus-Agreements wording as in act 1. Here it makes no difference, because both readings give "counts".

## Act 4. Clone replacing P1 by P2 for task 6, signed by Ana and Ben, mark `[1]` and `[6, 3]` with Ana and Ben

**Verdict: in force** (once the record a member draws puts it there, which the scenario grants).

**Model's answer:** `[1, {0: [[[1], [A, B, C], [3, 0, 500001]], [[6, 3], [A, B, C], [1, 2]]]}]`

The powers are ordered by the power's deterministic encoding: `[1]` is 0x81 0x01 and `[6, 3]` is 0x82 0x06 0x03, so `[1]` comes first. There is no key 1.

Field 2 is not on rule 98.3's list of constitutional fields, and task 6 is not a judicial task (rule 67). So this is an operational clone, and the model is asked about it.

The model's table (section 5) treats a field 2 entry for a Money task as needing two powers:
- `[6, 3]`, counted under the parent's field 19 Money entry `[1, 2]`. Ana and Ben are two members, so it is met.
- `[1]`, which the core always counts by field 5 (rules 65 and 99). Field 5 is `[3, 0, 500001]`. Ana and Ben hold 800,000, which is at least 500,001, so it is met.

The mark names exactly these two powers, and for each it names signers who are among the parties counted and enough to meet it. So rule 46 finds nothing false. Rule 45's other conditions are empty for this clone: it adds no party, changes no stake, issues nothing, and leaves field 24 alone. The clone is therefore complete once Ana's and Ben's signature acts are held.

Rule 72 says a record of a complete clone whose parent is the agreement in force puts the clone in force. From the record on, P2 fills task 6, and acts under P1 belong to a specification the agreement in force no longer names for any task (rule 60).

**Rules relied on:** 45, 46, 60 ("A layer's rule decides what the collective adopts"), 65, 67, 72, 98.3, 99 ("A model says when the clone rule is needed, never by which rule"; "The core counts"), terms `mark` and `power` formats.

**Unsure of:**
- Whether `[1]` is really required beside `[6, 3]` for a change that rule 60 places under the layer's rule alone. Rule 99 lets a model say when `[1]` is needed, and rule 98 lets it govern "which operational changes need which power". So I accept the model's answer. Note that a collective naming no model would need only `[6, 3]` (rule 98, last resort). Under this model, then, the mark must name `[1]`, and a mark naming only `[6, 3]` would be false.
- Whether `among` for `[1]` should be "the voices" (the model's choice) or every party. Here they are the same people.

## Act 5. Same clone, signed by Ben and Cy, mark `[1]` and `[6, 3]` with Ben and Cy

**Verdict: invalid** (not a draft).

**Model's answer:** the same as act 4, `[1, {0: [[[1], [A, B, C], [3, 0, 500001]], [[6, 3], [A, B, C], [1, 2]]]}]`. The answer depends on the changes, not on who signed.

`[6, 3]` is met, since Ben and Cy are two members. `[1]` is counted by field 5, by share. Ben and Cy hold 500,000, which is below 500,001, so it is not met. The mark therefore "names too few of them to meet it (as rule 65 counts them, by share where the rule is by share)", and rule 46 makes the clone invalid, whatever signatures it gathers.

This is not a draft waiting for Ana. The mark names identities, and it cannot be amended. Ana's signature act would bind Ana (rule 46, last paragraph) but would not bring this clone into force. A record of it counts for nothing, because rule 72 requires the clone to be complete. P1 stays the payment cMIP. To adopt P2, the members must make a new clone whose mark names Ana, or Ana with Ben, or Ana with Cy, under `[1]`.

**Rules relied on:** 45, 46 (third bullet), 65 (by share), 72, 99 ("a mark naming it is checked as rule 46 checks any mark"; `[1]` counted by field 5).

**Unsure of:**
- Draft or invalid was the one real choice. Rule 45 calls a clone a draft until the signatures its mark names exist. Rule 46 calls it invalid when the mark itself names too few. Here every signer the mark names has signed, and the shortfall is in the mark itself, so I took rule 46.
- If a client read the share rule loosely ("half or more"), it would wrongly call this clone in force. Freeze 7ay rules that reading out for acts, and nothing suggests the clone rule counts differently.

---

## Summary

| # | Act | Verdict | Model's answer | One-line reason |
| --- | --- | --- | --- | --- |
| 1 | Pointer, Ben drafts, Cy signs | Does not count | `[0, [2, [[6,3], [A,B,C], [3,0,500001]]]]` | 300,000 + 200,000 = exactly half, not more (freeze 7ay); the by-share power replaces `[1, 2]` |
| 2 | Pointer, Ana alone | Does not count | same | 500,000 is half, not more; one signer would not meet `[1, 2]` either |
| 3 | Pointer, Ana drafts, Cy signs | Counts | same | 700,000 ≥ 500,001, and it meets `[1, 2]` too |
| 4 | Clone P1→P2, Ana and Ben | In force (on its record) | `[1, {0: [[[1], [A,B,C], [3,0,500001]], [[6,3], [A,B,C], [1,2]]]}]` | `[1]` by field 5: 800,000 meets it; `[6,3]`: two members meet it; the mark is true, so rules 45 and 72 put it in force |
| 5 | Clone P1→P2, Ben and Cy | Invalid | same as 4 | `[1]` by field 5: 500,000 is too few, so the mark is false (rule 46) and the clone is invalid, not a draft; a record of it does nothing |
