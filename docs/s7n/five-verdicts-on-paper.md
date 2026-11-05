# Five verdicts under "Majority and treasury"

Judged from the six MIRs, the MICS map, the freeze test suite, the default control cMIP and the model's specification (sections 1 to 8 only). Rule numbers are Agreements draft 19's unless named otherwise. `MONEY` is the Money MIR's spec hash. In every answer below, a list of identities is written Ana, Ben, Cy. On the wire it is ascending by hash, and I do not know the hashes' order.

**What the model reads from the founding terms.** Parameters `{0: [Cy], 1: 1}` are valid. Cy is a party, and Money's layer rule `[1, 2]` makes every party an actor of Money, so Cy is a treasurer (model section 2). The query answer is `{0: [{0: 0, 1: [Cy], 2: 1, 3: [[MONEY,0]..[MONEY,5]], 4: [6, 7]}], 1: []}`. That is one area, id 0: Cy alone, number 1, reaching the six Money MIR act types and deciding tasks 6 and 7. Field 18 is absent, so the constitutional change rule is every party, `[0]`. The voices are Ana, Ben and Cy, who together hold 1,000,000.

## 1. Payee pointer drafted by Cy alone: counts

**Model's answer:** `[0, [1, 0]]` (model section 4: Money MIR, type 0).

The pointer is a Money MIR act, so area 0 reaches it and takes it out of Money's layer rule (rules 60, 99; Money "A collective's Money acts"). The core counts the area as rule 65 says: at least 1 of its holders, `[Cy]`. Cy is the drafter and signs with his own key, naming the collective (rule 58). He is a party, a holder of the area and a founder, and his voice remains (rule 60, "When an act counts"). Rule 98.5's narrowing is met: Cy is among Money's actors, and Cy plus one more member would meet `[1, 2]`. The act is done (rule 57). All holders of the collective's stake in itself are members, so the Money-act sealing requirement adds nothing.

**Unsure:** nothing about the verdict. A client must have warned at founding that one member acts alone in Money (rules 60, 98, client conformance). That bears on the founding, not on this act.

## 2. Payee pointer drafted by Ana, signed by Ben: does not count

**Model's answer:** `[0, [1, 0]]`.

The area reaches the act, so it counts only under the area's rule. Money's layer rule `[1, 2]` no longer applies (rule 60: an area "takes [acts] out of the layer's rule"; rule 98.5). Each signer must be "for an area, a holder of it there" (rule 60), and neither Ana nor Ben is a treasurer. The two signatures would have met the layer rule, but that rule no longer reaches the act. The act counts for nothing for the collective. Rule 58 shows it as an act that does not count, not as Ana's own act, because its bytes name the collective.

**Unsure:** whether a client should show it as "nobody's", as for a stranger's act, or only as "not counting". This does not change the verdict.

## 3. Clone X1 to X2 for task 4, Ana and Ben, mark `[1]` and `[6, 1]`: in force

**Model's answer:** `[1, {0: [ [[1], [Ana, Ben, Cy], [3, 0, 500001]], [[6, 1], [Ana, Ben, Cy], [1, 2]] ]}]`. The order is by deterministic encoding: `[1]` (0x81 01) comes before `[6, 1]` (0x82 06 01).

Task 4 is Text (Development task table), and field 2 is not constitutional (rule 98.3's list), so the change is operational. The model asks for Text's layer rule and majority by share (model section 5). The core counts both (rules 65, 99). `[6, 1]` needs any 2 of the 3 voices, and Ana and Ben meet it. `[1]` needs at least 500,001 of the 1,000,000 that the voices hold, and Ana and Ben hold 800,000. The mark names exactly the required powers, with signers among those counted, in ascending order, and enough of them (rule 46). Every signer the mark names has a signature act, and no party is added (rule 45). The clone is complete and comes into force through the record (rule 72).

**Unsure:** rule 60 says a layer's rule "decides what the collective adopts for that layer". The model asks for `[1]` as well, so adoption needs more than Text's rule alone. I read this as within the model's room, because rule 98 says the model governs "which operational changes need which power", and nothing on the never-decide list forbids asking for more. A stricter reader could call `[1]` overreaching. That would not change this verdict, because Ana and Ben meet both powers. It would make a mark naming `[6, 1]` alone valid where I would call it false.

## 4. Clone P1 to P2 for task 6, Cy alone, mark `[2, 0]`: in force

**Model's answer:** `[1, {0: [ [[2, 0], [Cy], [1, 1]] ]}]`.

Task 6 is Money's payment task, and area 0 decides it (area key 4). Rule 60 says "An area the control model gives a task decides that task's cMIP instead", and rule 99 names `[2, area]` as the power for an operational change lying under an area. The only change is to a Money task, so the model asks for the treasurers alone, with no `[1]` (model section 5). Cy is the one treasurer, his voice remains, and he meets `[1, 1]`. The mark names exactly `[2, 0]` with signer Cy (rule 46). Nobody is added and no stake changes (rule 45). The clone is complete and in force once recorded (rule 72).

**Unsure:** this is sound by the texts, but it lets one member change the collective's payment cMIP alone. That is the stated risk the founding warning exists for (rules 60, 98, client conformance). I found no core rule that keeps a Money layer rule of `[1, 2]` as a floor for adopting a payment cMIP once an area decides the task. Rule 98.5's narrowing reads as "holders among the layer's actors", and Cy is one.

## 5. Clone adding Dee and changing X1 to X2, mark `[0]` only: invalid

**Model's answer:** the model is asked about the operational part alone (rule 99). It answers `[1, {0: [ [[1], [Ana, Ben, Cy], [3, 0, 500001]], [[6, 1], [Ana, Ben, Cy], [1, 2]] ]}]`, the same as act 3. The voices are those of the parent at the line; Dee is not among them.

Adding a party changes field 0, which is constitutional (rule 98.3). The clone therefore needs `[0]`, every party of the parent: Ana, Ben and Cy. The core sets aside `[1]` beside `[0]` (rule 99). Rule 99 says that "where it also makes operational changes, it needs too the power of each layer's rule and each area those changes lie under … as the model answers for them (`[6, layer]`, `[2, area]`)". So `[6, 1]` is still required. The mark names only `[0]`. A mark must name exactly the powers the changes require (rule 46 and its note "names exactly the required powers"). The freeze suite says the same: a clone making a constitutional change and adopting a cMIP "needs the constitutional change rule and the rule for Money, its mark naming both", and a mark naming another rule than the one its changes require is invalid (default control cMIP scenarios, Agreements rule 46). The clone has a false mark and is invalid, whatever it gathers. It is not a draft: Ana's and Ben's signatures would meet `[6, 1]`, but the mark never claims it.

**Unsure:** two points.

- Rule 46's wording "names other powers than those its changes require" is plainest for a power named in excess. I read an omitted power under it through the "exactly" note and the scenarios, rather than as an incomplete draft.
- I assumed the abandonment clause also covers Dee once Dee is a party (rule 61). This holds if its authority is a threshold of the other parties. If it is a named identity that cannot declare Dee absent, the clone is invalid on that ground too.
