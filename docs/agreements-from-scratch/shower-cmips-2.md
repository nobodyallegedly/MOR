# Shower cMIPs, test 2: six foundation cMIPs on Agreements from scratch, draft 3

12 November 2026. A record of work and a set of test drafts by Claude, for Nobody, allegedly, to read. Nothing here is a decision. These are test drafts for documents only, not cMIPs for `cmips/`.

**The wish** (Nobody, allegedly, `docs/decisions.md`, branch `claude/lead-records-2`): "I've decided for a total rewrite of agreements from scratch." "No translation, fresh from the research we had all agreed was excellent direction." On what must hold: "The shower is an idea, the exact text does not need to hold. What needs to hold is: can I with a single click reward all the people that contributed to the service or good via MOR". And: "only building cMIPs above it will confirm it to my eyes".

**Read for this test, and nothing else:** `docs/thank-you-for-the-shower.md`; `docs/strangers-2026-11/` (README, `agreement-tasks.md`, `agreement-grammar.md`, and `late-roles.md` from branch `claude/lead-records-2`); `docs/agreements-from-scratch/draft-3.md` (branch `claude/agreements-draft-3-8me7i3`, pull request 153); `docs/agreements-from-scratch/shower-cmips-1.md` (branch `claude/shower-cmips-1`), as a result to compare against; and, only to see how a payment is proven, `spec/MIR-money-draft-14.md`. No other Agreements draft, finding, review, inventory, marking, `core/` or `cmips/` was opened.

"Draft 3" below always means `docs/agreements-from-scratch/draft-3.md`. Rule numbers (rule 1 to rule 11), task numbers (K1 to K13) and open parameters (P1 to P12) are draft 3's. Task numbers with a hash, such as #20 Acknowledge, are the 49 tasks of `agreement-tasks.md`. "Test 1" is `shower-cmips-1.md`; its gaps are M1 to M5. "Money" is Money draft 14; its rules are written "Money rule 20".

---

## 0. In plain words

The shower text follows warm water back up the pipes to everyone whose work reached the one standing under it. Nobody, allegedly, says the text itself need not hold; what must hold is that one click can reward everyone who contributed.

Test 1 built four cMIPs on draft 1 and found it carried most of the shower, with four gaps:

1. **Strangers speak inside agreements they never entered** (the one who says thank you, the parent who acknowledges a share).
2. **One agreement must read another** (a child must find who receives for its parent now).
3. **Money arrives outside the agreement** (in Money's receipts, which no Agreements rule reads).
4. **Money points at an Agreements text that the rewrite replaces.**

Draft 3 adds three things the shower can use: **spots** (a place kept for someone not yet known: whoever did X, received Y, holds Z, fits W, or a fifth open kind), **a work as a party** (an agreement can name another agreement as a party, and what is owed to it goes to that agreement's receiver now), and **counts seen by the agreed witness**.

This test writes six cMIPs on draft 3, each answering one of its tasks: lineage, division, arrival, paying the parents, a referrer spot and a relay spot. Then it walks one click by Fen, who pays for a song that stands on two other works, reached through a referrer and fetched from a relay, until the money and the thanks have climbed two levels. Then it says, gap by gap, what changed.

**The short answer, before the detail.** One click now reaches everyone the money is meant for, in the scenario, with every cut computed by anyone, every arrival signed by the one who received, and every stranger who earned a spot named with whoever confirmed it. The biggest change is that test 1's second gap is closed for money: draft 3 rule 10.4 is exactly the step test 1 had to do outside every rule. The referrer and the relay are no longer strangers: filling a spot makes them parties. Two of test 1's gaps are narrowed and two stand.

But the click reaches everyone **only as far as each receiver pays on**. Fen pays once. Ines, Bo and Eli each pay on from their own level, by their own act. Nothing makes them do it, and a receiver who does not is visible but not stopped. And three new limits showed up, all where draft 3's new rules meet each other or meet its open parameters: "receiver now" rests on "Terms in force", and nothing in draft 3 ever ends Terms; a referrer is a seat for many people, and a spot holds one; and a division rule can take a receiver now as input, but not who fills a spot. Section 8 quotes the sentences.

---

## 1. The six cMIPs at a glance

| cMIP | Name | Answers | Question | Trust |
|---|---|---|---|---|
| SH2-1 | Lineage | K1 Body | Who made this work, what does it stand on, and how is what comes in cut? | none: format only |
| SH2-2 | Division | K4 Rule | Of this income, how much is owed to whom? | none: anyone can recompute |
| SH2-3 | Arrival | K9 Delivery | Did this share, or this thank-you, reach the one it is for? | the recipient |
| SH2-4 | Climb | K11 Kind | What do the shower's Statements state, and how does what a parent receives become the parent's income? | none: definition only |
| SH2-5 | Referrer | K12 Spot, kind **done** | Who brought the payer to this payment, on whose word? | the payer |
| SH2-6 | Relay | K12 Spot, kind **holding** | Who holds the work's bytes, on whose word? | a party who checked |

Paying the parents lives in SH2-4, with help from the other three. It is where the money a child pays its parent turns into the parent's own income, divided again by the parent's own words. Like test 1, all Statement kinds the suite uses are in this one K11 cMIP, told apart by a `sort` inside `content` (draft 3's `kind` holds "`assent`, or the fingerprint of a cMIP answering task K11", and K11 produces "the meaning of `content`"). That includes the two sorts the relay spot reads.

**A seventh, tiny cMIP is needed and is not one of the six.** Draft 3 rule 3.2: "Terms that name a party by role MUST carry `in_force`." Every work here has spots, so every one must name an `in_force` rule, even where the default of rule 3.1 would do. The test uses **IF-1**, a K4 rule that says: "in force when there is an assent in the name of every party named as a signer", rule 3.1's own default, written as a cMIP so that it can be named. Section 8, N6.

**The acts used, all from draft 3 section 3, and no other:**

- **Terms**: `replaces`, `agreement`, `parties` (signers, roles, agreements), `authors`, `body`, `relies_on`, `in_force`, `powers`, `place`, `receiver`, `previous`.
- **Statement**: `agreement`, `terms`, `kind`, `content`, `for`, `under`, `previous`, `answers`, `settlement`.

From Money, only these are read: the settlement receipt (type 2, fields 0 to 5), the payment claim (type 3, fields 0 to 4 and 6, the referral), and Money's verification answer (Money rule 8). They are Money's acts, used as the proof that money moved, as draft 3 rule 7.3 requires ("whether Control obeyed is the controller's or the receiver's signed word").

---

## 2. SH2-1 Lineage (answers K1 Body)

### In plain words

A work's agreement says, in a short fixed form, who did what, which works it stands on, and the cut for every name. Since draft 3, the works it stands on are **parties of the agreement** (rule 10): named by their root, never bound, never asked to sign, and paid through whoever their own agreement names as receiver. The people who receive the money for this work are named in a grammar field, `receiver`, not in the body.

Every parent gets a line in the cuts, even if the line says zero. So "we chose not to pay them" is written down and signed by everyone it cuts.

The strangers the work will need (whoever referred the buyer, whoever holds the bytes) are spots, each with its own cut. Their test is fixed before anyone claims.

### Precisely

**Accepts:** the bytes the Terms' `body` names by fingerprint.

**Produces:** a reading for people (the title, every contribution and every parent in words), and these parts for machines:

| Part | Holds | Read by |
|---|---|---|
| `work` | fingerprint of the work itself | SH2-3, SH2-6 |
| `contributions` | each entry is **signed** (a party of the Terms named as a signer, and what they did, in words) or **named** (a name and what they did, in words; no party) | readers; SH2-4 for thanks |
| `stands_on` | each parent is an **agreement** (a root that is also in `parties`, what was used, in words, and the parent's Terms read when this body was written, for the record only) or a **work only** (a fingerprint or a name, with no agreement) | SH2-2, SH2-4 |
| `unit` | the unit the cuts count in, as Money names units | SH2-2 |
| `cuts` | one line per signed contribution, per parent and per spot, in parts of 10 000; a line may be 0 and may carry a `why` in words | SH2-2 |
| `spot_terms` | for each spot's line, when it counts (SH2-5 and SH2-6 give the two used here) | SH2-2 |
| `unfilled_to` | the party who receives a spot's line when the spot is not filled for that income | SH2-2 |
| `remainder_to` | the party who receives what rounding leaves | SH2-2 |
| `division` | fingerprint of SH2-2 | verifiers |

**Format rules** (SH2-1 answers "not a Lineage body" if one fails):

- L1. Every signed contribution, `unfilled_to` and `remainder_to` is a party of the Terms named as a signer.
- L2. Every parent of the agreement sort is a party of the Terms named as an agreement, and every party named as an agreement is a parent. (So a work cannot name a party it pays and then not call it a parent, or the reverse.)
- L3. Every signed contribution, every parent and every role in `parties` has exactly one line in `cuts`. A named contribution may have a line; it must be 0.
- L4. The lines add up to exactly 10 000.
- L5. The Terms name a `receiver`, and it is a party named as a signer. (Draft 3's cost: "A work that names no receiver cannot be paid.")
- L6. The `work`, SH2-2, SH2-3, SH2-4 and every `what` a role names are in `relies_on`, or named in `parties`, by fingerprint (rule 1.1).

**How the Terms are written with it:**

| Terms field | In a Lineage agreement |
|---|---|
| `parties` | every signed contributor (signer); every parent with an agreement (agreement, by root); every spot (role: its kind, its `what`, its K12 cMIP) |
| `authors` | whoever wrote the body's words (rule 2) |
| `body` | the Lineage body, and SH2-1 |
| `relies_on` | as L6 |
| `in_force` | required by rule 3.2 when there is a spot: IF-1 |
| `powers` | none in the simplest case: changing a cut needs every signer's assent again ("There is no default power", rule 4) |
| `place` | recommended; without it, "receiver now", "latest" and "all the income stated" are only "as shown" (rule 6.3) |
| `receiver` | the one signer who receives income for the work and pays it out |
| `previous` | none for the first Terms act |

**What a verifier says.** Who contributed is a deed in the world: "the parties stated, and X assented, that X did this" (rule 7.1). A named contributor who never signed: "named by the authors". A parent: "stated as stood on by the parties". A parent is never bound: draft 3 rule 10.2, "A party named as an agreement never assents, is never counted by rule 3.1, and is never bound by any act of these Terms."

**What it cannot do.** It cannot make the list of parents complete. A work that omits a parent is wrong about the world, and no format can show that.

---

## 3. SH2-2 Division (answers K4 Rule)

### In plain words

Every time the receiver states money coming in, SH2-2 says how much each person, each parent and each spot is owed from it. It is arithmetic on signed numbers; anyone redoes it and gets the same answer. Since draft 3, a parent's line is owed to a person and not only to a work: the rule takes the parent's receiver now as an input, as draft 3 allows.

A spot's line is different. The rule cannot take as an input who fills a spot, so it can only say "owed to whoever fills the referrer spot for this income, and if nobody does, to Ines". The verifier answers the "whoever" separately. Section 8, N3.

### Precisely

**Accepts** (K4: "a rule's parameters, the acts held, the place's answers, and receivers now (rule 10.5)"):

- **Parameters:** from SH2-1, on the body of the Terms in force: `unit`, `cuts`, `spot_terms`, `unfilled_to`, `remainder_to`, `stands_on`; and the Terms' `receiver`.
- **Acts held:** the agreement's Terms acts and assents, its `income` Statements (SH2-4), and the `held` and `check` Statements SH2-6 reads.
- **The place's answers:** the position of each act, where the Terms name a place.
- **Receivers now:** for each party named as an agreement, its receiver now, as rule 10.4 answers it, with its qualifier.

**Counts an `income` Statement only if:**

- D1. It is signed by the Terms' `receiver`, in their own name (no `for`, no `under`: rule 4.3), and those Terms were in force at its position (per place) or as shown.
- D2. Its unit is the body's `unit`.
- D3. No other counted `income` Statement names the same `settlement`. (Two different receipts for one payment are told apart only by Money's rail Module, Money rule 12, which K4 does not receive. Draft 3 keeps this as E8.)

**Produces**, for each counted `income`: lines `(to, amount)`, where `to` is

- a signer party;
- for a parent, **the parent's receiver now**, with the qualifier rule 10.4 gives it (per that parent's place, or as shown), or **not shown** or **unchecked** where rule 10.4 says so;
- for a spot, **the role**, with the line's condition from `spot_terms` and the fallback `unfilled_to`; the verifier answers who fills it with the spot's K12 cMIP (rule 9.2).

And:

- each amount is `floor(income × cut ÷ 10 000)`; rounding goes to `remainder_to`;
- **every line of `cuts` gives a line, zero lines included**, so "visibly not paying" is computed every time;
- the lines add up to exactly the income.

**What it does not do.** It does not pay: draft 3 K8 (Control) is "the controller's signed evidence". The receiver pays each line with an ordinary Money payment. It does not decide fees: here, the receiver's own line bears rail fees, as the Lineage reading says in words.

---

## 4. SH2-3 Arrival (answers K9 Delivery)

### In plain words

"I sent it" proves nothing. A share has arrived when the one paid signs a Money receipt for it and says, in a Statement, "this was my share of that income". A thank-you has arrived when the one thanked says so.

Since draft 3, two of the people paid are no longer strangers. A referrer or a relay who fills a spot becomes a party (rule 9.3), so their acknowledgment is a party's act within the agreement. A parent's receiver is still not a party of the child; SH2-3 lets them acknowledge **in their own agreement**, by the same act that books the money as the parent's income (SH2-4). That avoids a stranger's act in the child, at the cost of an `answers` that points from one agreement into another, which draft 3 neither allows nor forbids (section 8, M1).

### Precisely

**Accepts** (K9: "an act, a recipient"): an `income` Statement and one of its SH2-2 lines; or a `thanks` Statement and one person. The recipient is the line's `to`: a signer; for a parent, its receiver now (rule 10.4); for a spot, its filler (rule 9.2).

**Produces** (K9: "the recipient's signed acknowledgment, or the Deliver layer's evidence"):

- **For a signer or a spot's filler:** a `received` Statement (SH2-4) by the recipient, in their own name, within the same agreement, `answers` naming the `income`, `content` naming the recipient's Money receipts.
- **For a parent's receiver:** an `income` Statement with source **child** (SH2-4), by the recipient, **within the parent agreement**, `answers` naming the child's `income`, `settlement` naming the recipient's Money receipt.
- **Otherwise:** whatever the Deliver layer shows, and the payer's Money claim, each reported as said by its signer.

**Checks for a share** (all must hold for "arrived, stated by the recipient"):

- A1. The acknowledgment is signed by the recipient in their own name, and its `answers` names the `income`.
- A2. Each receipt it names is signed by the recipient, names the recipient as payee (receipt field 3) and the line's unit, and names the child's `income` in field 5 ("fulfils").
- A3. The receipts' amounts (field 4) add up to at least the line.
- A4. Money's verification answer for each receipt (Money rule 8) is valid. Pending or unknown: the share is not reported as arrived, and Money's answer is named. The receipt's rail Module not held: **unchecked** (rule 8.1).
- A5. For a parent: the recipient is the receiver now of the parent, per that parent's place or as shown (rule 10.4), at the position of the child's `income`. (Which moment "now" is read at is draft 3's open P8b. SH2-3 picks the position of the act that owes, and says it is a choice; section 8, N1.)

**Answers a verifier gives with SH2-3:**

| Situation | Answer |
|---|---|
| Acknowledgment and receipts pass A1 to A5 | **shown**: arrived, stated by the recipient; Money's answer valid; qualified per place or as shown where A5 needed rule 10.4 |
| No acknowledgment; the payer's Money claim with a valid rail proof | **not shown** by the recipient; Money says "the claim alone shows the money arrived" (Money rule 11); reported as the payer's word (rule 7.1) |
| Nothing | **not shown** |
| A rail Module, a parent's acts, or one of SH2-1 to SH2-6 not held | **unchecked** (rule 8.1) |
| A thank-you, `received` present | **shown**: reached them, stated by them |
| A thank-you to a named contributor who cannot sign | **not shown**, and it cannot be (draft 3 cost: "Those who cannot sign") |

---

## 5. SH2-4 Climb (answers K11 Kind): where paying the parents lives

### In plain words

A parent is paid by the child's receiver, with an ordinary payment, to the parent's receiver now. That person then writes the money into **the parent's** agreement as income, saying where it came from. The parent's own cuts divide it again, including for the parent's own parents. So the money climbs one level at a time, each level cut by words its own contributors signed.

The choice stays with the people. Whether a level pays its parents, and how much, is a line its own contributors signed. A parent cannot demand it (nobody is bound without their own signature, rule 4; a party named as an agreement is never bound, rule 10.2). A child cannot quietly drop it: a zero line is a signed, visible zero. Draft 3 says the same: "No grammar rule makes a work pay the works it stands on. Rule 10 makes it possible, rule 7 makes it visible, and the choice stays with those who sign."

A thank-you climbs the same way: each receiver who gets it may pass it on into their own agreement, where their own co-contributors can acknowledge it.

### Precisely

One Statement kind, SH2-4. Its `content` begins with a `sort`, one of six.

#### `income`

| | |
|---|---|
| States | "I, the receiver, received this amount for this agreement." |
| Signed by | the Terms' `receiver`, in their own name |
| `content` | `sort: income`; `amount`; `unit`; `receipts`; `source`: **outside** (the payer, as Money names them, or none for a gift) or **child** (the child's root, the child's Terms, the child's `income` that owed it) |
| `settlement` | the receiver's own Money receipt for it (draft 3 rule 11.4: "A Statement MAY name a `settlement` it is tied to") |
| `answers` | for source child, the child's `income` |
| Read by | SH2-2 (D1 to D3); SH2-3 (for a parent, it is the acknowledgment); SH2-5 (it names the settlement whose claim names the referrer) |

A verifier reports it, by rule 7.3, as "the receiver states they received this", and checks the receipt with Money.

#### `received`

| | |
|---|---|
| States | "This reached me", and for a share, "these Money receipts are mine for it". |
| Signed by | the recipient, in their own name: a signer party, or a spot's filler (a party by rule 9.3) |
| `content` | `sort: received`; for a share, `receipts` |
| `answers` | the `income` or `thanks` Statement |
| Read by | SH2-3 |

#### `thanks`

| | |
|---|---|
| States | "Thank you", from its signer, for the work. |
| Signed by | anyone (section 8, M1: one of the two acts left that a stranger must make within the agreement) |
| `content` | `sort: thanks`; `words`; `to`: persons, or `lineage` with a depth |
| Read by | SH2-3 |

#### `thanks_on`

| | |
|---|---|
| States | "This thank-you, given to the child, reaches this work too." |
| Signed by | the parent's receiver, within the parent agreement |
| `content` | `sort: thanks_on`; the child's root; the child's `thanks` Statement; the depth left (one less) |
| `answers` | the child's `thanks` |
| Read by | SH2-3, for the parent's own parties |

#### `held` and `check` (read by SH2-6)

| | `held` | `check` |
|---|---|---|
| States | "I hold the bytes of this work, and serve them." | "I fetched this work from that holder, and the bytes match its fingerprint." |
| Signed by | the one who holds | a party named as a signer |
| `content` | `sort: held`; the `work` fingerprint | `sort: check`; the `work`; the `held` Statement it tested |
| `answers` | none | the `held` Statement |

**How paying the parents runs, with SH2-1 to SH2-4:**

1. The child's cuts (SH2-1) carry a line for each parent, zero allowed, signed by every child contributor.
2. Each child `income` is divided (SH2-2); a parent's line goes to its receiver now (rule 10.4, 10.5).
3. The child's receiver pays that person with Money, the receipt's field 5 naming the child's `income`.
4. The parent's receiver writes an `income` with source **child** in the parent agreement, `answers` the child's `income`, `settlement` their receipt. That is both the arrival (SH2-3) and the parent's new income.
5. The parent's `income` is divided by the parent's own cuts; step 3 repeats one level up.

**Visibly not paying** is step 2's zero line, computed for every income.

---

## 6. The spots

### 6.1 SH2-5 Referrer (answers K12 Spot, kind done)

#### In plain words

A referrer earns a cut only when the person they brought actually paid. And the one who says "this person brought me" is the payer, in their own signed Money claim. Not the referrer, not the seller. Money already works this way: "A referral counts as evidence for a role share (Agreements) only when it is signed by the payer, in a claim; a referral the receiver or its split service names on its own earns nothing" (Money rule 20). The research found that the counterparty's own acknowledgment "is the cheapest and appears least" (`late-roles.md`); here it is the whole test.

This is Nobody, allegedly's example as draft 3 reads it, "Show me referees that lead to settlement only", where he meant referrers: a referrer counts only through a settlement.

#### Precisely

**The role**, in `parties`: kind **done**; `what`: the fingerprint of the words "brought the payer to a settled payment for this work"; K12: SH2-5.

**Accepts** (K12: "the role (its kind and `what`), the acts held, the place's answers"): the role, and among the acts held, one `income` Statement of the agreement, the Money receipt its `settlement` names, and the payer's Money claim of the same payment.

**Fills** the spot, for that `income`, with the signer `r` if, and only if:

- R1. The `income` is counted by SH2-2 and names a `settlement` (draft 3 rule 11.4).
- R2. A Money claim (type 3) is held, signed by the payer the receipt names in field 2, of the same payment (Money rule 12, through the rail Module), with field 4 ("fulfils") naming this agreement's root, and field 6 (`referral = [ identity, evidence ]`) naming `r`.
- R3. Money's verification answer for that claim is valid (Money rules 8 and 10).

**Produces:** `r`, or none, with the acts it rests on: the claim, by the payer; the receipt, by the receiver; the `income`, by the receiver. Reported (rule 7.4) as "filled on the payer's word, Money's answer valid".

**When the line counts** (its `spot_terms` in SH2-1): only for an `income` for which SH2-5 fills the spot. Otherwise the line goes to `unfilled_to`, shown as such.

**What it cannot do.** It cannot see a referral the payer did not sign; a payer who forgets the referral leaves the referrer unpaid, and the line goes to `unfilled_to`, visibly. It cannot stop a payer naming a friend as referrer; that is the payer's word, labelled so. It holds one signer per income, not one for the whole work: draft 3's K12 produces "the signer who fills it", and P7 leaves open "Whether one spot can be filled by many signers (every referrer)". SH2-5 reads one `income` among "the acts held" to get a single answer, which K12 does not name as an input (section 8, N2).

### 6.2 SH2-6 Relay (answers K12 Spot, kind holding)

#### In plain words

A relay keeps the song's bytes and hands them to whoever asks. It earns a small cut of each sale made while it held the work. It says itself that it holds the work, and that is not enough: one of the work's own signers must fetch the bytes from it and check that they match the song's fingerprint. Anyone can check a fingerprint, so the check is cheap to make and hard to fake for long, and it is said by someone who signed the cuts and so has every reason not to over-pay.

This test pays the relay **per sale while holding**, not per delivery. Paying per delivery would be a reward "for being seen" in draft 3's definition, which includes "delivery to an audience", and rule 11.1 would then require a named witness in advance (section 8, N5).

#### Precisely

**The role**, in `parties`: kind **holding**; `what`: the `work` fingerprint; K12: SH2-6.

**Fills** the spot, for an `income` at position *n*, with the signer `k` if, and only if:

- H1. A `held` Statement by `k` within the agreement names the `work`.
- H2. A `check` Statement by a party named as a signer `answers` that `held`, naming the same `work`.
- H3. Both are at the place at positions before *n* (rule 6.2), or, with no place, are held (as shown).
- H4. No later `check` by a signer party says the bytes did not match. (SH2-6 defines a `check` with `match: no`; it is never needed in the scenario.)

**Produces:** `k`, or none, with the acts: the `held` by `k`, the `check` by its signer, their positions. Reported (rule 7.4) as "filled on `k`'s own word, checked by the signer named".

**Who signs `held`.** The relay signs `held` before it fills the spot, so its first act within the agreement is by someone not yet a party. That is test 1's M1 again, in its smallest form (section 8, M1). Once the spot is filled, the relay's later acts are a party's (rule 9.3).

**What it cannot do.** It shows that the bytes were there when the signer checked, not that they stayed there; draft 3 itself lists "How a holding (a relay holding data, for example) can be shown by anyone other than the holder" as something it did not have.

---

## 7. The scenario: one click

### 7.1 Who is who

All names are invented. Fingerprints are short labels (`TW1`, `I1`); a place is written `⟨place W⟩`, since this test names no server address. Amounts are in an invented unit, `u`.

| Person | In this story |
|---|---|
| **Eli** | wrote *Roman Notes*, about how aqueducts were built; no place |
| **Bo** and **Chen** | made *Pipes*, a melody standing on *Roman Notes*; Bo is its receiver; ⟨place P⟩ |
| **Dara** | drew *Aqueduct*; Dara is its receiver |
| **Ines** and **Gil** | made *Warm Water*, a song standing on *Pipes* and *Aqueduct*; Ines is its receiver; ⟨place W⟩ |
| **Rafa** | shared *Warm Water* with Fen; the referrer |
| **Kai** | runs a relay holding *Warm Water*'s bytes |
| **Fen** | listens under the shower and clicks once |
| **Hana** | a third person, in none of it, who checks |

Two levels up: *Warm Water* → *Pipes* → *Roman Notes*.

### 7.2 Before the click: the parents

**Roman Notes**, by Eli. No place.

- `TR1`, Terms by Eli. `parties`: [signer Eli]. `authors`: [Eli]. `body`: (`BR`, SH2-1). `relies_on`: [work `WR`, SH2-2, SH2-3, SH2-4]. `in_force`: absent (no spot, so rule 3.1's default applies). `place`: absent. `receiver`: Eli. `previous`: none.
  - `BR`: contributions signed Eli ("wrote it"), named "the builders of the Roman aqueducts"; `stands_on`: work only, "the Roman aqueducts"; cuts Eli 10 000, the builders 0 (`why`: "nobody can receive for them; thanked in words"), the aqueducts 0; `remainder_to` Eli.
- `aE`: Eli's assent. `previous` TR1.

**Pipes**, by Bo and Chen, in ⟨place P⟩.

- `TP1`, Terms by Bo. `parties`: [signer Bo, signer Chen, agreement TR1]. `authors`: [Bo]. `body`: (`BP`, SH2-1). `place`: ⟨place P⟩. `receiver`: Bo.
  - `BP`: contributions Bo ("wrote the melody"), Chen ("played it"); `stands_on`: agreement TR1 ("the chapter on lead pipes"); cuts Bo 4 000, Chen 4 000, *Roman Notes* 2 000.
- `aB`, `aC`: assents by Bo and Chen, lodged in ⟨place P⟩. Eli, through TR1, signs nothing here and is bound by nothing (rule 10.2).

**Aqueduct**, by Dara: `TA1`, signer Dara, receiver Dara, assented, in Dara's own place.

### 7.3 Step 1. Ines and Gil publish Warm Water

*In plain words:* Ines writes down who made the song, what it stands on, and how money is cut, including a cut for whoever referred a paying listener and a cut for whoever holds the bytes. Gil reads it and agrees. Together they pay *Pipes* a fifth and *Aqueduct* nothing: Dara asked for thanks, not money, and they wrote that down.

Acts signed:

- `TW1`, Terms by Ines.
  - `parties`: signer Ines; signer Gil; agreement TP1; agreement TA1; role **referrer** {kind done, `what` `XR` ("brought the payer to a settled payment for this work"), K12 SH2-5}; role **relay** {kind holding, `what` `WW`, K12 SH2-6}.
  - `authors`: [Ines]. `body`: (`BW`, SH2-1). `relies_on`: [`WW`, `XR`, SH2-2, SH2-3, SH2-4, IF-1]. `in_force`: IF-1 (rule 3.2). `powers`: none. `place`: ⟨place W⟩. `receiver`: Ines. `previous`: none.
  - `BW`: contributions Ines ("wrote and sang it"), Gil ("mixed it"); `stands_on`: TP1 ("the melody"), TA1 ("the cover drawing"); `unit` u; cuts Ines 5 500, Gil 1 000, *Pipes* 2 000, *Aqueduct* 0 (`why`: "Dara asked to be thanked, not paid"), referrer 1 000, relay 500; `spot_terms`: referrer as SH2-5, relay as SH2-6; `unfilled_to` Ines; `remainder_to` Ines; `division` SH2-2.
- `aI` (Ines, `previous` TW1) and `aG` (Gil, `previous` none): assents. All lodged in ⟨place W⟩.

What Hana can check:

| Question | Answer | Why |
|---|---|---|
| Are TW1 in force? | **shown**, per ⟨place W⟩ | IF-1: assents by both signers; rule 3.1 |
| Who is bound? | Ines and Gil, each by their own assent | rule 4.1(a) |
| Are Bo, Chen, Eli or Dara bound by anything here? | **not shown**; TP1 and TA1 are parties that are "never bound" | rule 10.2 |
| Who receives for Warm Water? | Ines, per ⟨place W⟩ | `receiver`; rule 6.2 |
| Who receives for *Pipes* now? | Bo, per ⟨place P⟩ | rule 10.4 |
| Who receives for *Roman Notes* now? | Eli, **as shown**: no place | rules 10.4, 6.3 |
| What does *Aqueduct* get? | 0, with the reason, signed by both | SH2-1; rule 1 |
| Who fills the referrer and relay spots? | **not shown**: none yet | rule 9.2 |
| Is the body well formed? | yes: L1 to L6 | SH2-1 |

### 7.4 Step 2. The relay comes forward

*In plain words:* Kai's relay says it holds the song. Gil fetches it from Kai, checks the fingerprint, and signs that it matched.

- `Hd1`, Statement by Kai within TW1: `kind` SH2-4, `content` {`sort` held, `work` WW}; `previous` none. Lodged in ⟨place W⟩.
- `Ck1`, Statement by Gil within TW1: `content` {`sort` check, `work` WW, `match` yes}; `answers` [Hd1]; `previous` aG. Lodged in ⟨place W⟩.

| Question | Answer | Why |
|---|---|---|
| Who fills the relay spot? | Kai, filled on Kai's own word (`Hd1`), checked by Gil (`Ck1`), per ⟨place W⟩ | rule 9.2; rule 7.4; SH2-6 |
| Is Kai a party now? | yes, from then on; bound by nothing until Kai assents | rule 9.3 |
| Was Kai's first act made by a party? | no: `Hd1` came before the fill | section 8, M1 |

### 7.5 Step 3. Fen clicks once

*In plain words:* Rafa shared the song. Fen fetched it from Kai's relay, listened under the shower, and clicked "pay and thank". Fen's client did three things on that one click: it read Warm Water's receiver (Ines, per ⟨place W⟩) and paid her 1 000 u; it signed Fen's own Money claim, naming Rafa as the one who led Fen there; and it signed Fen's thank-you, to the whole lineage, two levels deep. Ines's client then signed the receipt and wrote the income in.

Acts signed:

- `R1`, Money settlement receipt, by Ines: field 0 the rail Module; 1 the rail's proof; 2 payer Fen; 3 payee Ines; 4 1 000 u; 5 fulfils TW1.
- `C1`, Money payment claim, by Fen: field 0 the rail Module; 1 the proof; 2 payee Ines; 3 1 000 u; 4 fulfils TW1; 6 referral [Rafa, Rafa's repost of `WW`]. Fen gives it to Ines and Rafa.
- `I1`, Statement by Ines within TW1: `kind` SH2-4; `content` {`sort` income, `amount` 1 000, `unit` u, `receipts` [R1], `source` outside, payer Fen}; `settlement` R1; `previous` aI. Lodged in ⟨place W⟩, after `Ck1`.
- `Th1`, Statement by Fen within TW1: `content` {`sort` thanks, `words` "Thank you, for the shower, and everything else.", `to` lineage, depth 2}; `previous` none. Lodged in ⟨place W⟩.

**Where Money plugs in.** `R1` and `C1` are two records of one payment (Money rule 12). Money's answer for each is computed by the rail Module's rule (Money rule 8). Money gives `C1`'s field 6 its only weight as a referral (Money rule 20). Field 5 of `R1` names TW1, an agreement; Money says a payment means something only where "a rule of Money or Agreements gives a payment following it a meaning", and draft 3 has no such rule, so `R1` "fulfils nothing in Money's sense" (section 8, M4). That does not stop anything here: SH2-3 and SH2-4 read `R1`'s signer, payee and amount, and the meaning comes from `I1`.

What Hana can check:

| Question | Answer | Why |
|---|---|---|
| Did Ines receive 1 000 u? | Ines states so (`R1`, `I1`); Fen states the same (`C1`); Money's answer for `R1`: valid | rule 7.3; Money rules 8, 11 |
| Is `I1` tied to a settlement? | `I1` names `R1` in `settlement`, reported on Ines's word | rule 11.4 |
| Is 1 000 u all of Warm Water's income? | **shown**, per ⟨place W⟩, *of the income Ines has stated* | rule 6.2; section 8, M3 |
| Who fills the referrer spot for `I1`? | Rafa, on Fen's word (`C1` field 6), Money's answer valid | SH2-5; rule 7.4 |
| Who fills the relay spot at `I1`'s position? | Kai: `Hd1` and `Ck1` are before `I1`, per ⟨place W⟩ | SH2-6; rule 6.2 |
| If Hana does not hold the rail Module for `C1` | referrer spot **unchecked**; Rafa's line **unchecked** | rule 8.1 |
| Did Ines tell two stories about income? | no fork among the acts held | rule 5.2 |

### 7.6 Step 4. Division of Fen's 1 000 u

*In plain words:* nobody signs anything. Anyone runs SH2-2 on `I1`.

| To | Cut | Amount | Who that is |
|---|---|---|---|
| Ines | 5 500 | 550 | signer |
| Gil | 1 000 | 100 | signer |
| *Pipes* | 2 000 | 200 | receiver now: Bo, per ⟨place P⟩ (rule 10.4) |
| *Aqueduct* | 0 | 0 | receiver now: Dara; nothing owed |
| referrer | 1 000 | 100 | the role; filled for `I1` by Rafa (SH2-5); else Ines |
| relay | 500 | 50 | the role; filled at `I1` by Kai (SH2-6); else Ines |
| remainder | | 0 | Ines |
| **Total** | 10 000 | **1 000** | |

| Question | Answer | Why |
|---|---|---|
| What is Gil owed? | 100 u, from TW1 and `I1` | K4: "the same output for the same inputs, every time, for anyone" |
| To whom is *Pipes*'s 200 owed? | Bo, per ⟨place P⟩ | rules 10.4, 10.5 |
| Is the referrer line part of the rule's output? | the line is; the name in it is the verifier's K12 answer, not the rule's | section 8, N3 |
| Was *Aqueduct* paid nothing by choice? | **shown**: a zero line, assented by both, with its reason | SH2-1; rule 4.1(a) |

### 7.7 Step 5. Ines pays out, one level

*In plain words:* Ines's client runs the division and makes four payments: Gil, Rafa, Kai, and Bo for *Pipes*. Each one signs a receipt. Gil, Rafa and Kai acknowledge in Warm Water, where they are now parties. Bo acknowledges in *Pipes*, where Bo is a party, by writing the money in as *Pipes*'s income.

- Ines pays Gil 100 u. `R2`, receipt by Gil: payer Ines, payee Gil, 100 u, fulfils `I1`. `Rc1`, by Gil within TW1: {`sort` received, `receipts` [R2]}; `answers` [I1]; `previous` Ck1.
- Ines pays Rafa 100 u. `R3`, receipt by Rafa, fulfils `I1`. `Rc2`, by Rafa within TW1: `answers` [I1]; `previous` none. Rafa is a party since the fill (rule 9.3).
- Ines pays Kai 50 u. `R4`, receipt by Kai, fulfils `I1`. `Rc3`, by Kai within TW1: `answers` [I1]; `previous` Hd1.
- Ines asks ⟨place P⟩ for *Pipes*'s Terms in force: TP1, receiver Bo. She pays Bo 200 u. `R5`, receipt by Bo: payer Ines, payee Bo, 200 u, fulfils `I1`.
- `I2`, Statement by Bo **within Pipes**: `agreement` TP1; `terms` TP1; `kind` SH2-4; `content` {`sort` income, `amount` 200, `unit` u, `receipts` [R5], `source` child: root TW1, Terms TW1, income I1}; `settlement` R5; `answers` [I1]; `previous` aB. Lodged in ⟨place P⟩.

| Question | Answer | Why |
|---|---|---|
| Did Gil's, Rafa's and Kai's shares arrive? | **shown**, each stated by its recipient, per ⟨place W⟩; Money's answers valid | SH2-3 A1 to A4 |
| Did *Pipes*'s 200 u arrive? | **shown**, stated by Bo, receiver now of TP1 per ⟨place P⟩ at `I1`'s position; Money's answer for `R5` valid | SH2-3 A1 to A5; rule 10.4 |
| Did it enter *Pipes*'s record? | **shown**, per ⟨place P⟩: `I2`, source TW1's `I1` | SH2-4 |
| Is `I2`'s `answers` (an act of another agreement) read? | by SH2-3, yes; draft 3 does not say whether `answers` may name an act of another agreement | section 8, M1 |
| Did any stranger act within Warm Water? | Fen (`Th1`), and Kai once (`Hd1`), before filling the spot | section 8, M1 |

### 7.8 Step 6. Pipes divides, and the second level

SH2-2 on `I2`, under TP1: Bo 80, Chen 80, *Roman Notes* 40 (receiver now: Eli, **as shown**, since TR1 names no place).

- Bo pays Chen 80 u. `R6`, by Chen, fulfils `I2`. `Rc4`, by Chen within TP1, `answers` [I2], `previous` aC.
- Bo pays Eli 40 u. `R7`, by Eli, fulfils `I2`.
- `I3`, Statement by Eli **within Roman Notes**: `agreement` TR1; `terms` TR1; `content` {`sort` income, `amount` 40, `receipts` [R7], `source` child: root TP1, Terms TP1, income I2}; `settlement` R7; `answers` [I2]; `previous` aE. Not lodged anywhere: *Roman Notes* has no place.

SH2-2 on `I3`, under TR1: Eli 40; the builders 0; the aqueducts 0.

| Question | Answer | Why |
|---|---|---|
| Did Chen's 80 u arrive? | **shown**, stated by Chen, per ⟨place P⟩ | SH2-3 |
| Did *Roman Notes*'s 40 u arrive? | **shown**, stated by Eli; Money's answer for `R7` valid | SH2-3 |
| Was Eli the right one to pay? | Eli is receiver of TR1, **as shown** | rules 10.4, 6.3; draft 3 cost: "\"Now\" is as wide as the other agreement's place." |
| Is 40 u all *Roman Notes* has received? | **as shown** only | rule 6.3 |
| Were the Roman builders paid? | 0, by the body's own signed line | SH2-1 L3 |

### 7.9 Step 7. The thanks climbs

*In plain words:* Fen's thank-you is in Warm Water. Ines and Gil acknowledge it there. It cannot reach Chen or Eli directly: draft 3 lets a verifier ask another agreement who its receiver is now, not who all its people are. So the thanks climbs like the money: Bo, who received for *Pipes*, passes it into *Pipes*, where Chen acknowledges it; Eli, who received for *Roman Notes*, passes it on there.

- `Rc5` by Ines and `Rc6` by Gil, within TW1: {`sort` received}; `answers` [Th1].
- Dara: receiver now of TA1, may acknowledge too; Dara is not a party of TW1, so this is a stranger's act within it, or (as for Bo) a `thanks_on` within TA1. Say Dara signs `Tn0` within TA1: {`sort` thanks_on, child TW1, `Th1`, depth 1}; `answers` [Th1].
- `Tn1`, by Bo within TP1: {`sort` thanks_on, child TW1, `Th1`, depth 1}; `answers` [Th1]. `Rc7` by Chen within TP1: `answers` [Tn1].
- `Tn2`, by Eli within TR1: {`sort` thanks_on, child TP1, `Tn1`, depth 0}; `answers` [Tn1].

| Question | Answer | Why |
|---|---|---|
| Did Fen's thanks reach Gil? | **shown**, stated by Gil | SH2-3 |
| Did it reach Dara, who was paid nothing? | **shown**, stated by Dara in TA1 | SH2-3; SH2-4 |
| Did it reach Chen? | **shown**, stated by Chen, through Bo's `Tn1`, per ⟨place P⟩ | SH2-3 |
| Did it reach Eli? | **shown**, stated by Eli, as shown | SH2-3 |
| Did it reach the Roman builders? | **not shown**, and it cannot be | draft 3 cost: "Those who cannot sign" |
| Had Bo not passed it on, could Chen be reached? | **not shown**: only Bo is readable as *Pipes*'s person, by rule 10.4 | section 8, N4 |

### 7.10 What Hana sees, end to end

Starting from Fen's claim `C1` and the two places, Hana can follow every unit of Fen's one click:

| Where | Amount | Proven by | Confirmed by |
|---|---|---|---|
| Ines, her own line | 550 | `I1` | Ines |
| Gil | 100 | `R2`, `Rc1` | Gil |
| Rafa, referrer | 100 | `R3`, `Rc2`; spot by `C1` field 6 | Rafa; the spot on Fen's word |
| Kai, relay | 50 | `R4`, `Rc3`; spot by `Hd1`, `Ck1` | Kai; the spot checked by Gil |
| Bo, for *Pipes* | 200 | `R5`, `I2` | Bo, receiver now per ⟨place P⟩ |
| of which Bo | 80 | `I2` | Bo |
| of which Chen | 80 | `R6`, `Rc4` | Chen |
| of which Eli, for *Roman Notes* | 40 | `R7`, `I3` | Eli, as shown |
| *Aqueduct* | 0 | the zero line in TW1 | signed by Ines and Gil; thanks acknowledged by Dara |

And with a K13 cMIP, anyone holding these acts can compute what each receiver did with what they were owed: Ines paid four of four lines, Bo two of two, each confirmed by the one paid. "Reputation tracking no platform owns or computes" reads exactly these acknowledgments.

What Hana cannot see: money a receiver received and never stated, unless its payer publishes a claim; for *Roman Notes*, whether anything later exists; and what would have happened had Ines or Bo not paid on. The answer to that last one is the computed line with no acknowledgment: **not shown**, visible to all, enforced by nothing.

---

## 8. The finding

Each item quotes draft 3 (or Money draft 14) exactly. No new core rule is proposed; each item says what was enough and what was missing.

### 8.1 Does one click now reach everyone?

**For the money: yes, in the scenario, two levels up.** Fen made one payment and three signatures, all from one click. Every person the cuts name got their line, each arrival is signed by the one who received, every cut is signed by those it cuts, every number can be recomputed, and each stranger who earned a spot is named with whoever confirmed it.

**But "one click" is Fen's, not everyone's.** The money climbs only because Ines, then Bo, each pays on, by their own act. Draft 3's cost holds: "Words can order a release; something must obey." A receiver who keeps a parent's share is shown by a computed line with no acknowledgment, and K13 can count it; nothing makes them pay. Draft 3 also has no way for Fen's client to pay every line directly and have it count: SH2-2 divides only `income` Statements signed by the work's own receiver (D1), and nothing in draft 3 says how a payment by Fen straight to Bo would count as *Warm Water*'s income divided. Where a rail needs a pool before dividing, draft 3's P6 is open.

**For the thanks: yes, but by passing it on.** It reaches each level's receiver directly, and everyone else only if their receiver passes it into their own agreement (section 8.3, N4).

### 8.2 Test 1's four gaps

#### M1. Strangers speaking inside agreements they never entered: **narrowed**

Draft 3 keeps it: "F20, M1 | Anyone may make a Statement within any agreement; whether an act by a non-party is within it. The shower model depends on it (a thank-you, a parent's receiver acknowledging). | kept".

But it shrank in the scenario, for two reasons.

- **Spots made two strangers parties.** Rule 9.3: "A signer who fills a spot is a party in it from then on." Rafa's and Kai's acknowledgments are a party's acts. Rafa signs nothing at all to fill the spot: Fen's claim does it.
- **The parent's receiver acknowledges at home.** Bo and Eli never act within the child: each acknowledges by an `income` Statement in their own agreement, where they are parties. The cost is an `answers` that points from one agreement into another. Draft 3 says `answers` holds "fingerprints of acts this one replies to", read by "tasks K9, K10", and says nothing on whether those acts may be in another agreement.

What still needs a stranger's act within the agreement: **Fen's own thank-you** (`Th1`), **the relay's first `held`** (`Hd1`, made before the fill), and any outsider's "this stands on mine". What is still missing: whether an act signed by someone who is not a party is within the agreement; and whether `answers` may name an act of another agreement.

#### M2. One agreement reading another: **closed for the receiver; open for the rest**

Draft 3 closes test 1's step: rule 10.4, "Whatever an act or a rule of one agreement gives or owes to a party named as an agreement, it gives or owes to that agreement's **receiver now**: the `receiver` named by its Terms in force", with 10.5, "A rule (task K4) MAY take a receiver now, so answered, as an input", and K4 accepting "receivers now (rule 10.5)". Draft 3 says of itself: "rule 10.4 is that step, inside the grammar." It held: in steps 4, 5 and 6, *Pipes*'s line was owed to Bo, inside SH2-2, labelled per ⟨place P⟩, and *Roman Notes*'s to Eli, labelled as shown. Rule 8.1's "lacks the acts of an agreement named as a party" gave the right answer for a verifier without them.

What is still open is everything about another agreement other than its receiver: who its other people are (needed by the thanks, N4), and two things rule 10.4 rests on (N1).

#### M3. Money arriving outside the agreement: **still open, narrowed in one place**

Draft 3 keeps it: "Money arrives outside the agreement: only the holder's own Statement brings income into the record. Rule 11 lets a rule count only counts tied to settlements; it does not bring settlements in."

Narrowed: `settlement` is now a grammar field ("fingerprint of a settlement this act is tied to"), so the tie from an `income` to its receipt is something rule 11.4 and K4 read, not only something inside a cMIP's `content`. And the referrer spot gives a third person, Rafa, a reason to hold the payer's claim: if Rafa holds `C1` and no `income` names its payment, the gap is visible to Rafa.

Still open: income the receiver never states is outside every act of the agreement, so "is this all the money that came in for this work?" still has only the answer "all the receiver stated".

#### M4. Money pointing at a replaced Agreements text: **still open**

Draft 3 keeps it: "The Money text points at an Agreements text that draft 1 replaces (publication, split, line, collective). Rule 10 needs no collective; the rest is outside this text." with "kept; listed for whoever writes the link", and "A work's income received by a group together: `receiver` names one party."

In the scenario: no collective was needed (rule 10). But `R1`'s field 5 names TW1, and Money gives a payment meaning only "where it names an act to which a rule of Money or Agreements gives a payment following it a meaning"; draft 3 gives none, so "A payment whose field 5 names any other act fulfils nothing in Money's sense". Ines's four payouts could not be one batch: Money's batch is "A set of payouts a split service pays with one rail payment, as its publication allows (Agreements)". And Money rule 20's referral counts "for a role share (Agreements)": draft 3 has spots, not role shares. The fit was close (section 8.4), but it is not written.

M5 (Money's answers and draft 3's not meeting) was test 1's fifth item. It also stands: draft 3 section 8 lists it, and SH2-3 again had to choose what Money's "pending" means for "did it arrive?".

### 8.3 New

**N1. "Receiver now" rests on "Terms in force", and nothing ends Terms.** Rule 10.4 reads "the `receiver` named by its Terms in force". But draft 3 P10: "Rule 3 says when Terms come into force and nothing says when they stop", and section 9.3: "F1 | Nothing makes Terms stop being in force: replacing, ending and revoking have no computed effect" and "F4 | Two replacements of the same Terms can both be in force." So if *Pipes* replaced TP1 by a TP2 naming Chen as receiver, both TP1 and TP2 would be in force, and *Pipes* would have two receivers now. The scenario worked only because nothing was replaced. Rule 10.4 does not say "latest" Terms, which rule 6.2 could answer per place. Add P8b, "When \"now\" in rule 10.4 is read": SH2-3 had to pick a moment, and whether Ines paid the right person can change answer after she paid. For the shower, P10 and P8b are no longer side questions: they decide whether the climb pays the right person at each level.

**N2. A referrer is a seat for many; a spot holds one.** Every sale may have a different referrer. K12 produces "the signer who fills it, or none", and P7 leaves open "Whether one spot can be filled by many signers (every referrer)". SH2-5 could answer only by reading one `income` among "the acts held" and filling the spot *for that income*, which K12's inputs ("the role (its kind and `what`), the acts held, the place's answers") do not name. With two buyers and two referrers, either the spot is filled twice (P7) or the test fails. The relay has the same shape in time: several relays, or one that stops holding.

**N3. A division can take a receiver now, but not who fills a spot.** K4 accepts "receivers now (rule 10.5)" and nothing like it for spots. So SH2-2 could only say "owed to the referrer role, if filled for this income, else to Ines", and the verifier filled in the name from the K12 answer. That is the shape test 1's M2 had for parents, now for spots. And SH2-5 and SH2-6 read Money's receipts and claims as "the acts held"; draft 3 defines an act as "a signed statement in the core's sense" and never says whether another layer's acts, and Money's verification answer, are among a K4 or K12 rule's inputs (draft 3 keeps E8 for one case of this).

**N4. The thanks climbs less far than the money.** Rule 10.4 answers one thing about another agreement: its receiver. Thanking everyone in a parent needs the parent's parties now, and no rule answers that across agreements. The scenario passed the thanks on through each receiver (`thanks_on`), which works and stays within each agreement's own parties, but it depends on each receiver, as the money does.

**N5. A relay sits on the line between holding and being seen.** Draft 3's "Seen" includes "delivery to an audience". A relay paid per delivery is rewarded for being seen, and rule 11.1 requires: "A role rewarded for being seen MUST name its `witness`, a signer or a role, in `parties`." The natural witness of a delivery is the one delivered to, who is unknown in advance, so it could only be another role, with its own K12 cMIP, filled by someone who is a stranger until then. SH2-6 avoided rule 11 by paying per sale while holding, checked by a party. Draft 3 does not say where holding stops and being seen begins, and its section 8 lists "How a holding (a relay holding data, for example) can be shown by anyone other than the holder". A party's fingerprint check was enough for this test; it shows the bytes were there once.

**N6. Every work with a spot must name an `in_force` rule.** Rule 3.2: "Terms that name a party by role MUST carry `in_force`." In the shower, nearly every work has a referrer or a relay spot, so nearly every work needs a K4 cMIP that says what rule 3.1 already says by default. Not a flaw; a cost every shower work pays.

**N7. `receiver` is defined for being named by another agreement, not for being paid from outside.** Draft 3: "**Receiver**: the one party that Terms name, in the field `receiver`, as receiving on the agreement's behalf when another agreement names it as a party (rule 10)." Fen paid *Warm Water* directly, as a listener, not through an agreement naming it. The scenario read TW1's `receiver` for that too, and SH2-2 (D1) counts income only from the receiver. That reading is natural but not written.

### 8.4 What was enough

- **Parents as parties, never bound.** Rule 10.2 and rule 3.4 let *Pipes* and *Aqueduct* be named, cut and paid with no one from them signing anything in *Warm Water*.
- **A zero is still a signed zero.** Rule 4, "There is no default power", and rule 1, unchanged from draft 1.
- **The referrer's test is the payer's word.** Spot kind done, plus Money rule 20 and claim field 6, `referral = [ identity, evidence ]`, plus rule 11.4's `settlement` and draft 3's reading 9.4(c), "a rule may reward only the referrers whose referral led to a settlement". Nothing new was needed. The cheapest confirmer in the research is the one draft 3 and Money together give.
- **Who filled a spot is reported with who confirmed it.** Rule 7.4: "A verifier MUST report them with whoever confirmed them." Every answer about Rafa and Kai carried it.
- **Places that differ by level.** Rule 6.3 and draft 3's cost "\"Now\" is as wide as the other agreement's place" made *Roman Notes* honest: as shown, never latest.
- **Unchecked is not passed.** Rule 8.1 covered a missing rail Module and a parent's missing acts.

---

## 9. Not done here

- No rule of draft 3 was changed. No core rule is proposed.
- Choices inside the six cMIPs (parts of 10 000, floor and remainder, the receiver bearing fees, `unfilled_to`, one K11 cMIP with six sorts, the relay paid per sale, the moment "now" is read in SH2-3) are a test author's choices to make the cMIPs runnable, not decisions.
- IF-1 is written only so that rule 3.2 can be met; it is not one of the six.
- Nothing here goes into `cmips/`.
