# Shower cMIPs, test 1: four foundation cMIPs on Agreements from scratch, draft 1

12 November 2026. A record of work and a set of test drafts by Claude, for Nobody, allegedly, to read. Nothing here is a decision. These are test drafts for documents only, not cMIPs for `cmips/`.

**The wish** (Nobody, allegedly, `docs/decisions.md`): "I've decided for a total rewrite of agreements from scratch." "No translation, fresh from the research we had all agreed was excellent direction." On testing it: "only building cMIPs above it will confirm it to my eyes"; "Foundation cMIPs are for the “shower” model"; "the focus is: this is how I PERSONALY would use it".

**Read for this test, and nothing else:** `docs/thank-you-for-the-shower.md`; `docs/strangers-2026-11/` (README, `agreement-tasks.md`, `agreement-grammar.md`); `docs/agreements-from-scratch/draft-1.md` (branch `claude/agreements-from-scratch-3ibcsy`, pull request 147); and, only to see how a payment is proven, `spec/MIR-money-draft-14.md`. No other Agreements draft, finding, review, inventory, marking, `core/` or `cmips/` was opened.

"Draft 1" below always means `docs/agreements-from-scratch/draft-1.md`. Rule numbers (rule 1 to rule 8) and task numbers (K1 to K11) are draft 1's. Task numbers with a hash, such as #20 Acknowledge, are the 49 tasks of `agreement-tasks.md`.

---

## 0. In plain words

The shower text follows warm water back up the pipes to everyone whose work reached the one standing under it: plumbers, builders, engineers, miners, the Romans, teachers, parents. It ends: "To all of you I say ‘thank you’, for the shower, and everything else."

MOR, used that way, needs four things from an agreement:

1. **Lineage.** A work says who made it and what it stands on. The people named say "yes, that is me, and that is what I did".
2. **Division.** When money comes in for the work, everyone can see how it is cut, and anyone can redo the sum and get the same answer.
3. **Arrival.** A thank-you, or a share of the money, counts as having arrived when the one it was for says so, in their own signature. Not when the sender says so.
4. **Paying the parents.** Each work chooses, in its own signed words, how much goes to the works it stands on. A choice of zero is written down too, so "we chose not to pay them" is visible and cannot be passed off as an oversight. What a parent receives becomes that parent's own income, divided by the parent's own agreement, and so on upwards.

Each of these is written below as a cMIP filling exactly one of draft 1's eleven tasks, using only the two acts draft 1 gives (Terms and Statement) and only their fields. Then one scenario is walked from end to end with named people, with draft 1's verifier answers at every step. Then the finding: where draft 1 was enough, and where it was not.

**The short answer, before the detail.** Draft 1 carried most of it. Signed words, assents, the per-signer chain, the place to look, "say who said it" and "unchecked is not passed" did the work without strain, and they gave the shower model something it badly needs: every cut is signed by the people it cuts, and every arrival is signed by the one who received. Four things were missing or unclear, and each one sits exactly where the shower model is different from a two-party deal: **strangers speak inside agreements they never entered** (the thanker, the parent who acknowledges); **one agreement must read another** (a child must find who now receives for its parent); **money arrives outside the agreement** (in Money's receipts, which no draft 1 rule reads); and **Money draft 14 points at an Agreements text that draft 1 replaces**. Section 7 quotes the sentences.

---

## 1. The four cMIPs at a glance

| cMIP | Name | Fills | Question it answers | Trust |
|---|---|---|---|---|
| SH-1 | Lineage | K1 Body | Who made this work, what does it stand on, and how is what comes in cut? | none: format only |
| SH-2 | Division | K4 Rule | Of this income, how much is owed to whom? | none: anyone can recompute |
| SH-3 | Arrival | K9 Delivery | Did this thank-you or this share reach the one it is for? | the recipient |
| SH-4 | Crossing | K11 Kind | What do the Statements of the shower model state: income, thanks, receipt of either, a claim to have contributed? | none: definition only |

Paying the parents is not one cMIP alone; it is what the four do together. SH-4 is where it lives most: its `income` Statement is the act that turns one level's payout into the next level's income. That is why SH-4 carries the fourth item of the request. Section 5 says this plainly rather than hiding it.

Why the kinds are gathered in one K11 cMIP: draft 1 says a Statement's `kind` is "`assent`, or the fingerprint of a cMIP filling task K11". Every Statement in the shower model that is not an assent needs such a fingerprint. SH-4 defines all four kinds the suite uses, and tells them apart with a `sort` entry inside `content` (section 7, item E7).

**The acts used, all from draft 1 section 3, and no other:**

- **Terms**: `replaces`, `agreement`, `parties`, `authors`, `body`, `relies_on`, `in_force`, `powers`, `place`, `previous`.
- **Statement**: `agreement`, `terms`, `kind`, `content`, `for`, `under`, `previous`, `answers`.

Money draft 14's settlement receipt (type 2) and payment claim (type 3) are used as the proof that money moved, as draft 1's rule 7.3 requires ("whether Control obeyed is the controller's or the receiver's signed word"). They are Money's acts, not Agreements acts; only their fields 0 to 5 are read, and Money's link back into Agreements is not relied on (section 7, item M4).

---

## 2. SH-1 Lineage (fills K1 Body)

### In plain words

A work's agreement is a Terms act whose words are a short, fixed description of the work: who did what, which earlier works it stands on, who receives money for it, and the cut for every name on the list. Each person named as a contributor must assent; until they all do, nothing is in force (draft 1's default, rule 3.1). So a contributor cannot be named against their will or left with a cut they did not sign.

Every work it stands on must have a line in the cuts, even if the line says zero. Zero is allowed. Missing is not: a body with a parent and no line for it is not a Lineage body at all.

A contributor who cannot sign (the Roman builders, a teacher long dead) can be **named** without being a party. They are listed and thanked in words; they cannot be bound, receive, or acknowledge. That is the shower's own honesty: "countless people", most of whom will never hold a key.

### Precisely

**Accepts:** the bytes the Terms' `body` names by fingerprint.

**Produces:** a reading for people (the work's title and, in words, every contribution and every parent), and these parts for machines:

| Part | Holds | Read by |
|---|---|---|
| `work` | fingerprint of the work itself (the song, the text, the drawing) | readers; SH-3 for thanks |
| `contributions` | list of entries; each entry is either **signed** (a party of the Terms, as listed in `parties`, and what they did, in words) or **named** (a name and what they did, in words; no party, no signer) | readers; SH-3 |
| `stands_on` | list of parents; each parent is either an **agreement** (the parent's root fingerprint, the fingerprint of the parent Terms act that was read when this body was written, and what was used, in words) or a **work only** (a fingerprint or a name of something with no agreement) | SH-2; SH-3; readers |
| `holder` | the one party who receives income for the work and pays it out | SH-2; SH-4 |
| `unit` | the unit the cuts are counted in, named as Money names units | SH-2 |
| `cuts` | one line for every signed contribution and every parent, in parts of 10 000; a line may be 0 and may carry a short `why` in words | SH-2 |
| `remainder_to` | the party who receives what integer rounding leaves | SH-2 |
| `division` | the fingerprint of the K4 cMIP that divides (SH-2) | verifiers |

**Format rules (SH-1 reports "not a Lineage body" if any fails):**

- L1. Every signed contribution, the `holder` and `remainder_to` are among the Terms' `parties`, named as signers.
- L2. Every signed contribution and every `stands_on` entry has exactly one line in `cuts`. A named contribution may have a line; it must be 0, since nobody can receive for it.
- L3. The lines of `cuts` add up to exactly 10 000.
- L4. Every parent of the agreement sort, the K4 cMIP in `division`, the `work`, and SH-4 appear in the Terms' `relies_on`, by fingerprint (draft 1 rule 1.1).

**How the Terms are written with it:**

| Terms field | In a Lineage agreement |
|---|---|
| `parties` | every signed contributor, as signers (the holder is one of them) |
| `authors` | whoever wrote the body's words; usually the main author. They carry the unclearness of "what each person did" (rule 2) |
| `body` | fingerprint of the Lineage body, and fingerprint of SH-1 |
| `relies_on` | as L4 |
| `in_force` | absent: every signed contributor must assent (rule 3.1) |
| `powers` | absent in the simplest case: changing the cuts then needs every party's assent again (rule 4, "There is no default power") |
| `place` | recommended, named by the Order layer's identifier; without it, "is this all the income?" and "is this the latest version?" have only "as shown" answers (rule 6.3) |
| `previous` | the signer's previous act in this agreement, or none |

**What a verifier says about a Lineage agreement.** Who contributed is a claim about the world (a deed done), so by rule 7.1 the answer is never "X contributed" but "the parties stated, and X assented, that X did this". A named contributor who never signed is reported as "named by the authors; cannot confirm". A parent is reported as "stated as stood on by the parties"; whether the child really stands on it is a witness matter (K5), and SH-1 does not pretend otherwise.

**What SH-1 cannot do.** It cannot make the list complete. A child that omits a parent it stands on is lying about the world, and no format can catch that. Rule 1 only guarantees that what *is* named is pinned. The defence is social and visible: anyone can make a `claim` Statement (SH-4) saying "this stands on mine", and it is shown beside the Terms, said by its signer.

---

## 3. SH-2 Division (fills K4 Rule)

### In plain words

Every time the holder records money coming in, SH-2 says exactly how much each person, and each parent, is owed from it. The rule is simple arithmetic on numbers that are all signed, so anyone (a contributor, a parent, a stranger, a journalist) can redo it and must get the same answer. Nobody needs to trust the holder's sums; they need only trust that the holder told the truth about what came in, and SH-4 and Money make that visible from the payer's side as well.

### Precisely

**Accepts** (draft 1 K4: "a rule's parameters, the acts held, the place's answers"):

- **Parameters:** the parts SH-1 produces from the body of the Terms in force: `holder`, `unit`, `cuts`, `remainder_to`, `stands_on`.
- **Acts held:** the agreement's Terms acts and assents (to know which Terms were in force when), and its `income` Statements (SH-4).
- **The place's answers:** the position of each `income` Statement and of each Terms act, where the Terms name a place.

**Counts an `income` Statement only if:**

- D1. It was signed by the `holder` of the Terms it names in its `terms` field, in their own name (no `for`, no `under`: rule 4.3), and those Terms were in force at its position (per place) or as shown.
- D2. Its unit is the body's `unit`.
- D3. No other counted `income` Statement names the same Money receipt in `content`. (Sameness of two *different* receipts for one payment is Money's rail Module answer, Money rule 12, which K4 does not receive as input; see section 7, item E8.)

**Produces,** for each counted `income` Statement: a list of lines `(to, amount)`, where `to` is a party of the Terms or a parent from `stands_on`, and:

- each amount is `floor(income × cut ÷ 10 000)`;
- what rounding leaves goes to `remainder_to`, on its own line;
- **every line of `cuts` produces a line**, including the lines that are 0. A zero line is an output, not an absence: this is how "visibly not paying" is computed rather than merely written;
- the lines add up to exactly the income.

Also produces, over all counted income: the total owed to each `to`, and the total income counted, qualified **per place** or **as shown** (rule 6).

**What it does not do.** It does not pay; draft 1 lands #26 Divide as "K4 computes, K8 pays". The holder pays each line with an ordinary Money payment. It does not decide fees: in this test draft, the holder's own line bears any rail fee, and the Lineage reading says so in words. It does not resolve who receives for a parent: for a parent line, `to` is the parent's **root fingerprint**, an agreement, not a person (section 7, item M2).

---

## 4. SH-3 Arrival (fills K9 Delivery)

### In plain words

"I sent it" proves nothing about arriving. A thank-you has arrived when the person thanked signs that they received it. A share has arrived when the person paid signs a Money receipt for it and says, inside the agreement, "this was my share of that income". SH-3 defines that answer, and what a verifier says when it is missing.

When nobody acknowledges, SH-3 still shows what there is, labelled by who said it: the payer's own Money claim with the rail's proof, or the Deliver layer's evidence that the message was handed over. It never turns that into "arrived".

### Precisely

**Accepts** (draft 1 K9: "an act, a recipient"):

- an act: a `thanks` Statement (SH-4), or an `income` Statement whose SH-2 division owes this recipient a line;
- a recipient: a person (a signer). For a parent line, the recipient is the person the parent agreement names as its `holder`, in the parent's Terms in force (per the parent's place, or as shown).

**Produces** (draft 1 K9: "the recipient's signed acknowledgment, or the Deliver layer's evidence"):

- **Acknowledged:** a `received` Statement (SH-4) signed by the recipient in their own name, made within the same agreement as the act, with `answers` naming the act, and, for a share, `content` naming the recipient's own Money receipts for it.
- **Not acknowledged:** whatever the Deliver layer shows, and, for a share, the holder's Money claim, each reported as said by its signer.

**Checks for a share** (all must hold for "arrived, stated by the recipient"):

- A1. The `received` Statement is signed by the recipient, `answers` names the `income` Statement, and its `terms` are the Terms that income was divided under.
- A2. Each Money receipt it names is signed by the recipient, has the recipient as payee (receipt field 3), the line's unit, and names the `income` Statement in field 5 ("fulfils").
- A3. The receipts' amounts (field 4) add up to at least the line's amount.
- A4. Money's verification answer for each receipt (Money rule 8) is valid. Where it is pending or unknown, SH-3 reports so, and the share is not reported as arrived (section 7, item M5).

**Answers a verifier gives, with SH-3:**

| Situation | Answer |
|---|---|
| `received` Statement and receipts pass A1 to A4 | **shown**: arrived, stated by the recipient (rule 7.1), Money's answer valid |
| No `received` Statement, holder's Money claim with a valid rail proof | **not shown** by the recipient; the payer states it was paid, and Money says "the claim alone shows the money arrived" (Money rule 11). Reported as the payer's word |
| No acknowledgment and no claim | **not shown** |
| A receipt's rail Module, or SH-3, or SH-4 not held by the verifier | **unchecked** (rule 8) |
| Thanks, `received` Statement present | **shown**: the thanks reached them, stated by them |
| Thanks to a named contributor with no signer | **not shown**, and cannot be: nobody can sign for them |

**Who carries each piece.** The recipient carries the proof; a recipient who refuses to acknowledge cannot be forced, and SH-3 reports that refusal as an absence, not as a lie by anyone. The holder can protect themselves by keeping their own Money claim (Money rule 11).

---

## 5. SH-4 Crossing (fills K11 Kind): where paying the parents lives

### In plain words

A parent is paid by the child's holder, with ordinary money. When that money lands, the parent's holder writes it into the **parent's** agreement as income, saying where it came from: "this is the 200 that Warm Water's division owed us". From there the parent's own Lineage and Division cut it again, including for the parent's own parents. So the money climbs one level at a time, each level cutting it by rules its own contributors signed, and each crossing is visible from both sides: the child's record shows it was owed and acknowledged; the parent's record shows it came in and from where.

And the choice is always the people's own. Whether a level pays its parents, and how much, is a line in the cuts its own contributors assented to. A parent cannot demand it (nobody is bound without their own signature, rule 4). A child cannot quietly drop it: a zero line is a signed, visible zero, and changing it means new Terms with every party's assent.

Thanks climb the same way, but need no division: a thank-you can be addressed to the work's whole lineage, and each person on it can acknowledge.

### Precisely

SH-4 defines one Statement kind. Its `content` begins with a `sort`, one of four. For each, the table says what the Statement states, who signs it, and which rules read it (draft 1 K11: "the meaning of `content`, and how K4 rules may read it").

#### `income`

| | |
|---|---|
| States | "I, the holder, received this amount for this agreement." |
| Signed by | the holder named in the body of the Terms in `terms`, in their own name |
| `content` | `sort: income`; `amount`; `unit`; `receipts`: fingerprints of the holder's own Money receipts for it; `source`: either **outside** (the payer, as Money names them, or none for a gift) or **child** (the child agreement's root, the child Terms the share was divided under, and the child's `income` Statement whose division owed this share) |
| `answers` | the child's `income` Statement, where the source is a child |
| Read by | SH-2 (D1 to D3); SH-3 (as the act a share answers) |

A verifier reading an `income` Statement reports, by rule 7.3, "the holder states they received this", and checks the receipts with Money; it never reports the value as "in the agreement".

#### `thanks`

| | |
|---|---|
| States | "Thank you", from its signer, for the work. |
| Signed by | anyone |
| `content` | `sort: thanks`; `words` (inline, short, or by fingerprint); `to`: a list of persons, or `lineage` with a depth (everyone signed in this work's contributions and, through `stands_on`, in its parents' contributions, to that depth) |
| Read by | SH-3 |

#### `received`

| | |
|---|---|
| States | "This reached me." For a share: "and these Money receipts are mine for it." |
| Signed by | the recipient, in their own name |
| `content` | `sort: received`; for a share, `receipts` |
| `answers` | the `thanks` or `income` Statement |
| Read by | SH-3 |

#### `claim`

| | |
|---|---|
| States | "I contributed this to the work", or "this work stands on mine", from its signer. |
| Signed by | anyone not named in the Terms for that contribution or parent |
| `content` | `sort: claim`; `what`, in words; optionally the claimant's own agreement root |
| Read by | readers only. No K4 rule reads it: a claim binds nobody and moves nothing until the parties replace the Terms (rule 4.2) |

**How paying the parents runs, with all four cMIPs:**

1. The child's cuts (SH-1) carry a line for each parent, zero allowed, signed by every child contributor.
2. Each `income` in the child is divided (SH-2): a parent line names the parent's root.
3. The child's holder finds the parent's holder (in the parent's Terms in force) and pays them with Money, field 5 naming the child's `income`.
4. The parent's holder signs a `received` in the child (SH-3: arrival, from the child's side) and an `income` with source **child** in the parent (SH-4: income, from the parent's side).
5. The parent's `income` is divided by the parent's own cuts, and step 3 repeats one level up.

**Visibly not paying** is step 2's zero line: computed by SH-2 every time, for every income, so it shows up in every answer, not once at signing.

---

## 6. The scenario: Warm Water

All names are invented. Fingerprints are written as short labels (`TW1`, `I1`); a place is written by a label (`⟨place W⟩`), since this test names no server address. Amounts are in an invented unit, `u`.

### 6.1 Who is who

| Person | In this story |
|---|---|
| **Eli** | wrote *Roman Notes*, about how aqueducts were built |
| **Bo** and **Chen** | made *Pipes*, which stands on *Roman Notes*; Bo is its holder |
| **Dara** | made *Aqueduct*, a drawing |
| **Ines** | wrote *Warm Water*, a song that stands on *Pipes* and *Aqueduct*; Ines is its holder |
| **Gil** | mixed *Warm Water* |
| **Fen** | listens to *Warm Water* under the shower, pays, and says thank you |
| **Hana** | a third person who was in none of it, and checks |

Two levels up: *Warm Water* → *Pipes* → *Roman Notes*.

### 6.2 Before the story: the parents exist

**Roman Notes**, by Eli. No place.

- `TR1`, Terms, signed by Eli. `parties`: [Eli]. `authors`: [Eli]. `body`: (body `BR`, SH-1). `relies_on`: [work `WR`, SH-2, SH-4]. `in_force`: absent. `powers`: absent. `place`: absent. `previous`: none.
  - Body `BR`: `work` WR; `contributions`: signed Eli ("wrote it"); named "the builders of the Roman aqueducts" ("everything it describes"); `stands_on`: work only, "the Roman aqueducts", by name; `holder` Eli; `unit` u; `cuts`: Eli 10 000, the builders 0 (`why`: "nobody can receive for them; thanked in words"), the aqueducts 0 (same `why`); `remainder_to` Eli; `division` SH-2.
- `aE`, Statement, signed by Eli: `agreement` TR1, `terms` TR1, `kind` assent, `previous` TR1.

**Pipes**, by Bo and Chen, in `⟨place P⟩`.

- `TP1`, Terms, signed by Bo. `parties`: [Bo, Chen]. `authors`: [Bo]. `body`: (body `BP`, SH-1). `relies_on`: [work `WP`, root TR1, Terms TR1, SH-2, SH-4]. `place`: ⟨place P⟩. `previous`: none.
  - Body `BP`: contributions Bo ("wrote the words"), Chen ("built the instrument"); `stands_on`: agreement TR1, seen TR1, "the chapter on lead pipes"; `holder` Bo; `cuts`: Bo 4 000, Chen 4 000, *Roman Notes* 2 000; `remainder_to` Bo.
- `aB` (Bo, `previous` TP1) and `aC` (Chen, `previous` none): assents to TP1. Both lodged in ⟨place P⟩.

**Aqueduct**, by Dara: `TA1`, one party, Dara, holder Dara, in a place of Dara's choosing. Assented by Dara.

### 6.3 Step by step

#### Step 1. Ines publishes Warm Water

*In plain words:* Ines writes down who made the song and what it stands on, and how money is cut. Gil reads it and agrees. Both together chose to pay *Pipes* a fifth and to pay *Aqueduct* nothing: Dara asked for thanks, not money, and they wrote that reason down.

Acts signed:

- `TW1`, Terms, signed by Ines.
  - `parties`: [Ines, Gil]; `authors`: [Ines]; `body`: (body `BW`, SH-1); `relies_on`: [work `WW`, root TP1, Terms TP1, root TA1, Terms TA1, SH-2, SH-4]; `in_force`: absent; `powers`: absent; `place`: ⟨place W⟩; `previous`: none.
  - Body `BW`: `contributions`: Ines ("wrote and sang it"), Gil ("mixed it"); `stands_on`: agreement TP1 seen TP1 ("the melody"), agreement TA1 seen TA1 ("the cover drawing"); `holder` Ines; `unit` u; `cuts`: Ines 7 000, Gil 1 000, *Pipes* 2 000, *Aqueduct* 0 (`why`: "Dara asked to be thanked, not paid; chosen by Ines and Gil"); `remainder_to` Ines; `division` SH-2.
- `aI`, Statement by Ines: `agreement` TW1, `terms` TW1, `kind` assent, `previous` TW1.
- `aG`, Statement by Gil: `agreement` TW1, `terms` TW1, `kind` assent, `previous` none.
- All three lodged in ⟨place W⟩.

What Hana can check, with draft 1's answers:

| Hana's question | Answer | Why |
|---|---|---|
| Are TW1 in force? | **shown**, per ⟨place W⟩ | rule 3.1: assents by both signers present |
| Who is bound? | Ines and Gil, each by their own assent | rule 4.1(a) |
| Are Bo, Chen or Dara bound by anything here? | **not shown** | they signed nothing in TW1 (rule 4) |
| Who made Warm Water? | Ines and Gil stated, and each assented to, that Ines wrote and sang it and Gil mixed it | rule 7.1: a deed done, reported with who stated it |
| Does it stand on Pipes and Aqueduct? | stated by Ines and Gil | rule 7.1 |
| Is TW1 the latest Terms? | **shown**, per ⟨place W⟩ | rule 6.2 |
| What does Aqueduct get? | 0, with the stated reason, signed by both parties | SH-1 body; rule 1 |
| Is the body well formed? | yes: cuts add to 10 000; every parent has a line | SH-1 L1 to L4 |
| Whose unclearness is "the melody"? | Ines's | rule 2: `authors` |

#### Step 2. Fen, under the shower, pays and says thank you

*In plain words:* Fen pays 1 000 u to Ines for the song. Ines signs a Money receipt and then writes the income into the agreement. Fen also writes a thank-you addressed to the whole lineage, two levels deep, and publishes their own Money claim.

Acts signed:

- `R1`, Money settlement receipt, signed by Ines: field 0 the rail Module; 1 the rail's proof; 2 payer Fen; 3 payee Ines; 4 amount 1 000 u; 5 fulfils TW1.
- `C1`, Money payment claim, signed by Fen: payee Ines; 1 000 u; fulfils TW1. Fen publishes it.
- `I1`, Statement by Ines: `agreement` TW1; `terms` TW1; `kind` SH-4; `content` {`sort` income, `amount` 1 000, `unit` u, `receipts` [R1], `source` outside, payer Fen}; `previous` aI. Lodged in ⟨place W⟩.
- `Th1`, Statement by Fen: `agreement` TW1; `terms` TW1; `kind` SH-4; `content` {`sort` thanks, `words` "Thank you, for the shower, and everything else.", `to` lineage, depth 2}; `previous` none. Lodged in ⟨place W⟩.

What Hana can check:

| Question | Answer | Why |
|---|---|---|
| Did Ines receive 1 000 u? | Ines states so (R1, I1); Fen states the same (C1); Money's answer for R1: valid | rule 7.3; Money rules 8 and 11 |
| Is 1 000 u all the income of Warm Water? | **shown**, per ⟨place W⟩, *of the income Ines has stated*: one `income` Statement, I1 | rule 6.2. Whether Ines received money never stated is outside every act in the agreement (section 7, item M3) |
| Is Fen's payment stated as income? | **shown**: I1 names R1, and R1 matches C1 | SH-4; Money rule 12 |
| Did Ines tell two stories about income? | no fork among the acts held | rule 5.2 |

If Ines had not written I1, anyone holding Fen's published claim C1 would see a payment for TW1 with no `income` Statement per ⟨place W⟩ answering it: a visible gap, said by Fen. If Ines had shown Gil an `I1′` saying 500, with `previous` aI like I1, anyone holding both would answer **fork** for Ines (rule 5.2).

#### Step 3. The division of Fen's 1 000 u

*In plain words:* nobody signs anything here. Anyone runs SH-2 on I1 and gets the same lines.

SH-2 on I1, under TW1:

| To | Cut | Amount |
|---|---|---|
| Ines | 7 000 | 700 |
| Gil | 1 000 | 100 |
| *Pipes* (root TP1) | 2 000 | 200 |
| *Aqueduct* (root TA1) | 0 | 0 |
| remainder (Ines) | | 0 |
| **Total** | 10 000 | **1 000** |

| Question | Answer | Why |
|---|---|---|
| What is Gil owed? | 100 u, computed by SH-2 from TW1 and I1 | K4: "the same output for the same inputs, every time, for anyone" |
| Was Aqueduct paid nothing by choice? | **shown**: a zero line, from a cut both parties assented to, with its reason | SH-1, SH-2, rule 4.1(a) |

#### Step 4. Gil's share arrives

- Ines pays Gil 100 u by Money.
- `R2`, Money receipt signed by Gil: payer Ines; payee Gil; 100 u; fulfils I1.
- `Rc1`, Statement by Gil: `agreement` TW1; `terms` TW1; `kind` SH-4; `content` {`sort` received, `receipts` [R2]}; `answers` [I1]; `previous` aG. Lodged in ⟨place W⟩.

| Question | Answer | Why |
|---|---|---|
| Did Gil's share arrive? | **shown**: arrived, stated by Gil; Money's answer for R2 valid | SH-3 A1 to A4; rule 7.1 |

#### Step 5. Pipes's share crosses up one level

*In plain words:* Ines must pay "Pipes", which is not a person. Ines reads Pipes's own record to see who receives for it now: Bo. Ines pays Bo. Bo acknowledges in Warm Water's record, and writes the money into Pipes's record as income from Warm Water.

- Ines asks ⟨place P⟩ for the Terms of *Pipes* in force: TP1, holder Bo, nothing later. (A separate verifier question about the agreement TP1, answered per ⟨place P⟩.)
- Ines pays Bo 200 u by Money.
- `R3`, Money receipt signed by Bo: payer Ines; payee Bo; 200 u; fulfils I1.
- `Rc2`, Statement by Bo **within Warm Water**: `agreement` TW1; `terms` TW1; `kind` SH-4; `content` {`sort` received, `receipts` [R3]}; `answers` [I1]; `previous` none. Lodged in ⟨place W⟩. (Bo is not a party of TW1: section 7, item M1.)
- `I2`, Statement by Bo **within Pipes**: `agreement` TP1; `terms` TP1; `kind` SH-4; `content` {`sort` income, `amount` 200, `unit` u, `receipts` [R3], `source` child: root TW1, Terms TW1, income I1}; `answers` [I1]; `previous` aB. Lodged in ⟨place P⟩.

| Question | Answer | Why |
|---|---|---|
| Did Pipes's 200 u arrive? | **shown**, stated by Bo, holder of TP1 per ⟨place P⟩; Money's answer for R3 valid | SH-3; rule 6.2 for "holder now" |
| Was it Pipes's holder who received it? | **shown** per ⟨place P⟩: TP1 in force and latest, holder Bo | rule 6.2, asked of TP1 |
| Did it enter Pipes's record? | **shown**, per ⟨place P⟩: I2, source TW1's I1 | SH-4 |

#### Step 6. Pipes divides, and Roman Notes's share crosses up the second level

SH-2 on I2, under TP1: Bo 80, Chen 80, *Roman Notes* (root TR1) 40; total 200.

- Bo pays Chen 80 u: `R4` (Chen's receipt, fulfils I2); `Rc3`, Chen's `received` within Pipes, `answers` [I2], `previous` aC.
- Bo looks up *Roman Notes*: TR1, holder Eli. *Roman Notes* names no place, so "TR1 is the latest" is **as shown** only.
- Bo pays Eli 40 u: `R5`, Eli's Money receipt, fulfils I2.
- `Rc4`, Statement by Eli within Pipes: `agreement` TP1; `terms` TP1; `kind` SH-4; `content` {`sort` received, `receipts` [R5]}; `answers` [I2]; `previous` none. Lodged in ⟨place P⟩.
- `I3`, Statement by Eli within Roman Notes: `agreement` TR1; `terms` TR1; `kind` SH-4; `content` {`sort` income, `amount` 40, `unit` u, `receipts` [R5], `source` child: root TP1, Terms TP1, income I2}; `answers` [I2]; `previous` aE. Not lodged anywhere: Roman Notes has no place.

SH-2 on I3, under TR1: Eli 40; the builders 0; the aqueducts 0.

| Question | Answer | Why |
|---|---|---|
| Did Eli receive 40 u for Roman Notes? | **shown**, stated by Eli; Money's answer for R5 valid | SH-3 |
| Was Eli the right one to pay? | Eli is holder in TR1, **as shown**: no place can say nothing later replaced TR1 | rule 6.3 |
| Is 40 u all Roman Notes has received? | only **as shown**: no place | rule 6.3 |
| Were the Roman builders paid? | 0, by the body's own signed line and reason; they cannot receive | SH-1 L2 |

#### Step 7. Fen's thanks travels up

- Fen's client delivers Th1 to everyone signed in the lineage to depth 2: Ines and Gil (Warm Water), Bo and Chen (Pipes), Dara (Aqueduct), Eli (Roman Notes). It finds them by reading each parent's Terms in force, as in step 5.
- Each who acknowledges signs a `received` Statement **within Warm Water**, `answers` [Th1], lodged in ⟨place W⟩. Say Ines, Gil, Bo, Dara and Eli do; Chen does not.

| Question | Answer | Why |
|---|---|---|
| Did Fen's thanks reach Dara? | **shown**, stated by Dara | SH-3 |
| Did it reach Chen? | **not shown**; the Deliver layer's evidence, if any, is reported as that layer's word | SH-3; K9 |
| Did it reach the Roman builders? | **not shown**, and it cannot be: named, no signer | SH-1; SH-3 |

### 6.4 What Hana sees, end to end

Starting from Fen's published claim C1 and the two places, Hana can follow every unit of Fen's 1 000 u:

| Where | Amount | Proven by |
|---|---|---|
| Ines (Ines's own line) | 700 | Ines's own `income` I1; nothing to arrive |
| Gil | 100 | Gil's receipt R2 and `received` Rc1, per ⟨place W⟩ |
| Bo, for Pipes | 200 | Bo's receipt R3, `received` Rc2 (W), `income` I2 (P) |
| of which Bo (Bo's own line) | 80 | Bo's `income` I2 |
| of which Chen | 80 | Chen's receipt R4 and `received` Rc3, per ⟨place P⟩ |
| of which Eli, for Roman Notes | 40 | Eli's receipt R5, `received` Rc4 (P), `income` I3 (as shown) |
| Aqueduct | 0 | the signed zero line in TW1, and Dara's own acknowledgment of the thanks |

Every cut is signed by those it cuts. Every arrival is signed by the one who received. Every number can be recomputed. What Hana cannot see is money a holder received and never stated, unless its payer publishes a claim; and for Roman Notes, whether anything later exists.

---

## 7. The finding

Each item quotes draft 1 (or Money draft 14) exactly. No new rule is proposed; each item says only what was there, or what was missing.

### 7.1 Where draft 1 was enough

**E1. A work's lineage fits in a body.** Draft 1, K1 produces "a reading for people, and any parts for machines that rules read". SH-1 needed nothing more: contributions, parents, holder and cuts are parts for machines. And "A field no rule reads is not here." held: none of these needed a new field in Terms.

**E2. Nobody is named or cut against their will.** Rule 3.1: "If `in_force` is absent, they are in force when there is an assent to them in the name of every party named as a signer." Every signed contributor confirms both their naming and their cut, by default. Parents are not bound: rule 4.1(a), a person is bound if "they signed it in their own name".

**E3. The choice not to pay is fixed and visible.** Rule 4: "There is no default power." A zero line for a parent stays zero until every party signs new Terms; and rule 1.2, "Anything a Terms act refers to in another way is not part of those Terms", keeps a vague "we also owe X" from slipping in beside the cuts.

**E4. Contributions are reported as claims, never as facts.** Rule 7.1: "a verifier MUST report who stated it: the one who performed, the one who received, a named witness, the controller, or the place." This is exactly what "every contribution named" needs: named, and labelled by who named it.

**E5. Division needs no trust.** K4: "the same output for the same inputs, every time, for anyone". SH-2 is arithmetic on signed numbers; zero lines are computed, not merely written.

**E6. Arrival is the receiver's word.** Rule 7.3: "An act can instruct Control; whether Control obeyed is the controller's or the receiver's signed word." With K9's "the recipient's signed acknowledgment, or the Deliver layer's evidence" and #20 Acknowledge landing as "Statement with `answers`; K9", SH-3 needed nothing else to say "arrived, stated by the recipient", and to keep the payer's word apart from it.

**E7. A cMIP can define several kinds, with a tag.** The `kind` field holds "`assent`, or the fingerprint of a cMIP filling task K11". One fingerprint per kind would mean one cMIP per kind. SH-4 put a `sort` inside `content` instead; K11's "the meaning of `content`" allows it. Enough, though a reader of draft 1 might expect one kind per cMIP.

**E8. Lies about income are provable after the fact.** Rule 5.2: "A verifier holding both MUST answer **fork** for that signer, and MUST NOT choose between the branches." A holder who shows two contributors two different `income` Statements convicts themselves. And with a place, rule 6.2 makes "this is all the income stated" answerable. Without one, rule 6.3 ("a verifier MUST qualify every such answer **as shown**") made Roman Notes honest about what it cannot say. (One limit, inside SH-2 rule D3: two different Money receipts for one payment are told apart by Money's rail Module, which is not among K4's inputs. SH-2 counts by receipt fingerprint only. This did not stop the cMIP, so it is listed here, not below.)

**E9. Missing tools are reported, not passed.** Rule 8.1: a verifier "MUST answer **unchecked** for every answer that depends on it". A verifier without SH-4, or without a receipt's rail Module, says so.

### 7.2 Where a cMIP could not be written without the core giving something it does not

**M1. Can a stranger make a Statement within an agreement?** Draft 1: "**Statement**: any other act made within an agreement." and "**Agreement**: the first Terms act together with every Terms act that replaces it, directly or through others, and every Statement made within them." It never says who may make one. The shower model depends on strangers speaking inside agreements they never entered: Fen's thanks (Th1), Bo acknowledging a share within Warm Water (Rc2), Eli within Pipes (Rc4), every lineage member acknowledging thanks, anyone's `claim`. The scenario assumed they may. If they may, rule 6.2 ("an act within the agreement counts ... only once the place shows it") then lets any stranger's act count per place, and draft 1 does not say who may lodge in a place. If they may not, a thank-you cannot be acknowledged anywhere a third person can find it, and the request's "every thank-you able to arrive" cannot be written. What is missing: whether an act signed by someone who is not a party is within the agreement.

**M2. One agreement reading another.** A child must pay "whoever now receives for the parent". Draft 1 names the parent only as a fixed piece: `relies_on` holds "fingerprints of every other piece the Terms use", and rule 1 pins the root and the Terms seen, not the parent's current Terms. K4 accepts "a rule's parameters, the acts held, the place's answers" and produces "yes, no, a list of who, or amounts". It does not say whether "the acts held" may include another agreement's acts, and "the place's answers" reads as this agreement's place only. So SH-2 could not compute *who* is owed a parent's line; it could only say "owed to the agreement TP1", which is not a person. The step from "owed to TP1" to "paid to Bo" was done outside any rule, as a second verifier question about TP1 (scenario step 5), and the link between the two answers is held together only by Bo's acknowledgment. What is missing: whether a rule, or a verifier answering about one agreement, may take another agreement's acts and place as input, and whether an amount may be owed to an agreement rather than to a person.

**M3. Money arrives outside the agreement.** Draft 1 says, as a stated cost: "**The record holds no value.** Every act about value is a claim or an instruction." The cMIP could still be written, so this alone is not missing. What is missing is narrower: rule 6.2 covers only "an act within the agreement", and a Money receipt is not one. The only way income enters an agreement's record is the holder's own `income` Statement. A payer's Money claim (C1), the one act that could show income the holder never stated, enters the agreement only if strangers may make Statements there (M1), and then only if the payer chooses to restate it. "Every cut visible to all" holds for income the holder states; for income the holder hides, it holds only as far as payers publish. Draft 1 gives no way for a third person to ask "is this all the money that came in for this work?"; it gives only "is this all the money its holder said came in?"

**M4. Money draft 14 points at an Agreements text that draft 1 replaces.** Money says "How the money is then divided among owners is defined by their agreement, in Agreements.", and gives a payment's field 5 a meaning only "where it names an act to which a rule of Money or Agreements gives a payment following it a meaning". Draft 1 gives none: it has no publication, no split, no ownership agreement, no "line" (Money's `purchase = [ agreement: hash, line: hash ]`), no collective (Money rule 7: a collective's acts are "judged by Agreements under the rule its founding names for Money"). So by Money's own words, every receipt in the scenario "fulfils nothing in Money's sense"; "the receipt is otherwise judged as any receipt is". Arrival still worked, because SH-3 reads the receipt's signer, payee and amount, and the meaning comes from the `received` Statement. But two things could not be written: a work's income received by a group of contributors together (every holder had to be one person), and a Money payment that a Money-only wallet could recognise as a payment to a work under draft 1. What is missing: the link Money expects from Agreements does not exist in draft 1.

**M5. Two sets of answers that do not meet.** Draft 1's verifier answers are "shown", "not shown", "fork", "unchecked". Money's are "valid, invalid, pending or unknown". SH-3 had to say what "pending" means for "did Gil's share arrive?" and chose "not reported as arrived". Draft 1 itself lists this, in section 8: "Whether the verifier's answers (shown, not shown, fork, unchecked) are already named in another layer, so that the words match." The shower model is where they meet first. What is missing: how a Money answer becomes a draft 1 answer.

### 7.3 Limits the shower itself shows, not missing from the core

- **The ones who cannot sign.** Draft 1: "**Party**: a person named in Terms as one who may be bound. Named either as a signer, or as a **role**". The Roman builders, the teachers, the parents in the shower text are neither. SH-1 names them in words, with a zero line. A thank-you cannot arrive for them, and nothing in an agreement can change that.
- **An omitted parent.** Whether a work stands on another is a fact about the world; draft 1's "Deeds lean on witnesses" cost applies. A `claim` makes the dispute visible; it does not settle it.
- **A holder who does not pay.** Draft 1: "**Enforce beyond what was posted (#45).** Words can order a release; something must obey." A holder who keeps a contributor's share is shown by the missing acknowledgment and the computed line; nothing makes them pay.
- **The fourth level.** A level with no place (Roman Notes) can say only "as shown" about its latest Terms and its income. The climb gets less certain as it goes up, exactly where the shower's own lineage gets older and more scattered.

---

## 8. Not done here

- No rule of draft 1 was changed. No core rule is proposed.
- Choices inside the four cMIPs (parts of 10 000, floor and remainder, the holder bearing fees, the four sorts in one kind) are a test author's choices to make the cMIPs runnable, not decisions.
- Nothing here goes into `cmips/`.
