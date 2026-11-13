# Agreements, from scratch: seams 1

13 November 2026. Written by Claude. A record of work and a set of proposals, for the MOR lead and for Nobody, allegedly, to read. Not a decision. Nothing here changes `spec/`, `draft-17.md`, `report-block-2.md`, code or vectors.

**The wish** (Nobody, allegedly, `docs/decisions.md`, branch `claude/lead-records-2`): "I've decided for a total rewrite of agreements from scratch." "No translation, fresh from the research we had all agreed was excellent direction." On what must hold: "can I with a single click reward all the people that contributed to the service or good via MOR". And: "Building blocks over solutions."

**What this file is.** Draft 17 of the new Agreements leans on the layers under it, and on a block (the report) that is in no spec yet. A "seam" is a place where the new text touches another text. This file walks every seam once, so that a full box can later be sealed. It has five parts:

1. Section 8.1 of draft 17, item by item: is the need met below, met under another name, or missing.
2. The report block, written as a proposed section of the MICS document.
3. The thirteen tasks, K1 to K13, as data shapes, so that a stub can stand in for any cMIP.
4. Where the lower layers still point at the old Agreements.
5. What a full box needs after this, in order, and how vectors could be generated.

**What was read.** `draft-17.md`, all of it. `docs/lead/proposals/report-block-2.md` (branch `claude/lead-records-2`). Section 7 of `docs/reviews/fable-agreements-draft-14.md` (branch `claude/fable-agreements-draft-14`). And, on main, the current texts `spec/README.md` names: the MICS document version 37, Identity draft 16, Text draft 11, Envelopes draft 12, Money draft 14 and Development draft 12. Of the MICS document, the section "MIR: Agreements" was read only as far as its first three subsections, enough to see that it is the old Agreements told again; nothing in it is used here. Of Identity and Money, the parts section 8.1 touches were read in full and the rest by heading and search.

**What was not opened.** The old Agreements MIR (any draft), `docs/findings/`, `docs/agreements-inventory/`, `docs/agreements-marking/`. The freeze test suite was not in the reading list and was not opened either; where an answer might be there, this file says so.

**How to read it.** "Met" means a sentence of a current lower text already gives what draft 17 asks; the sentence is quoted, with its text and place. "Met under another name" means the thing is there, called something else. "Missing" means no current lower text gives it. Each proposal is numbered A1, A2 and so on, says which text it would belong in, and is the smallest addition Claude found. Each place where reading the lower texts showed that two texts cannot both be read as written is numbered X1, X2 and so on: those are not proposals, they are things to resolve, and Claude resolves none of them.

---

## 0. The short version, in plain words

Seven things a reader should know before the detail.

1. **The lower layers already give most of the plain machinery.** A fingerprint, a signed act, one signer's line of acts, a way to name a cMIP, a way to write an amount, a signed record that money arrived, a way to hand over what was bought, and a place where rules for clients are kept: all are there, and most under other names than draft 17 uses.
2. **Draft 17's five layer names are not the core's.** Draft 17 says State, Sign, Deliver, Order, Control. The core has six layers: Identity, Text, Envelopes, Money, Agreements, Development. Four of draft 17's names land on a layer. One does not: there is no Order layer (item N2).
3. **The "place" has no home.** The nearest thing to a place in the current core is the keeper, and the keeper is defined inside the old Agreements. If the old Agreements goes, so does the keeper, unless something is written for it. And the core says outright that nobody can sign "nothing is later": "no verifier can prove an omission; completeness and freshness are the market's" (Identity draft 16, rule 20).
4. **The baker is not what G14 needs** (X1). In the core, a bake says only "I uploaded this", and "Anyone may bake the same file; each bake is its uploader's." So someone who copies a work's bytes and bakes them is the baker of their own bake. G14 means to expose exactly that person, and as the core stands it cannot.
5. **Money already has the buyer's confirmation, and reads a disagreement differently** (X3, X4). Money's settlement receipt is the receiving side's signed word of what it received. But where the two sides state different amounts, Money says "the greater amount counts", and the report block says "both shown, neither chosen".
6. **A task means two things** (X2). In the core a task is a numbered hand-off, and "An agreement, or a publication, names at most one cMIP per task". Draft 17's Terms name several rules (K4) and one spot cMIP for each role (K12).
7. **The report block can be written into the MICS document as it is**, in that text's voice (part 2). Its seams stay open; they are set out after it.

---

## 1. Section 8.1, item by item

The items follow the order of section 8.1 of draft 17, numbered N1 to N19 here. Draft 17 does not number them.

### Before the items: draft 17's five operations, and the core's six layers

Draft 17, section 1: Agreements "names those operations (State, Sign, Deliver, Order, Control) where it needs them." The MICS document, "Structure": "The core is six layers, one per MIR, each depending on those beneath it. They are numbered in this order wherever a format names a layer: 0 Identity, 1 Text, 2 Envelopes, 3 Money, 4 Agreements, 5 Development."

| Draft 17 says | Where it lands in the current core | Should draft 17 use the core's name? |
|---|---|---|
| State (how words are fixed) | Text (canonical text) and Envelopes (the act, its id, the work hash) | Yes, where it names a layer |
| Sign ("the Sign layer") | Identity | Yes |
| Deliver ("the Deliver layer") | Envelopes (key delivery, the sealed container, "How acts reach people") with Identity's routes | Yes |
| Control ("the layer that holds value") | Money | Draft 17 already says "the Money layer" beside it |
| Order ("the Order layer") | No layer. Order is spread over Envelopes (chains, rule 16), Identity (a home's log and receipts), the anchoring task (Envelopes), and the keeper (old Agreements) | See N2 |

This is a naming matter and Claude's reading. The five operations are the research's words; whether draft 17 keeps them as names of operations and adds the core's layer names beside them is for the MOR lead, as technical wording.

### N1. The core's act format

Draft 17: "The core's act format: whether it already gives fingerprints, a per-signer line of acts (which would make G6 redundant), acts signed by several people at once, and field names."

In plain words: four questions. Does the core already give every act an identifier made from its bytes? Yes. Does every signer already keep their acts in a line? Yes, but not one line for each agreement. Can several people sign one act? No. Are there field names? Yes, and they are not draft 17's.

**(a) Fingerprints: met, under another name.** The core's word is **act id**. Envelopes draft 12, "The act": "The act id is `tagged_hash("MOR/act", outside)`. The signature signs the act id." And the outside "commits to both: the hash of the locked bytes, so relays can check what they store, and the hash of the unlocked inside, so a reader can check that what they opened is exactly what was signed." There are three more fingerprints, each with its own tag so that none can pass for another: the **spec hash** of a specification (Development, "Words used in this MIR"), the **work hash** of a work's plaintext (Envelopes, section 8), and the **identity hash** (Identity). Whether draft 17 should say "act id" where its fingerprint is of an act is the MOR lead's wording. What matters for a box: draft 17's "fingerprint" is one of four different things depending on what is named, and each field of section 3 should say which (part 3 does, as a least reading).

**(b) A per-signer line: met in part, and G6 is not redundant.** Envelopes rule 13: "An everyday act MUST carry a position and a running summary consistent with the line before it (the empty summary for the first act of a sequence), and `prev` (empty for the first act of a sequence), with at most one entry." Identity, "Words used in this MIR": "**Sequence.** A line of everyday acts by one identity, each naming the previous act in the line. An identity may keep one sequence or several; the split is the owner's choice." So the core's line is the signer's line across everything they sign, and a signer may honestly keep several ("Parallel devices keep separate sequences", Envelopes, section 4). G6's line is "its signer's previous act within the same agreement". The two are different lines. A signer with two devices has two core sequences and still one line in each agreement, so G6 exposes something `prev` does not.

What the core does give G6 is the way to write it. Envelopes rule 14: "An act that belongs to an object's chain names, in `objects`, that chain and the act it follows in it". And rule 15: "Two valid acts naming the same predecessor in the same chain are a fork, provable from their signatures and insides. Whether a fork is normal or a conflict is defined by the MIR that defines the object." So draft 17's `previous`, `replaces` and `agreement` are **met under another name**: each would be one entry of `objects`, `[ chain, predecessor ]`.

- **A1 (proposal, for draft 17 or the act formats written after it).** Say how draft 17's three line fields are carried: the agreement's chain of Terms as an `objects` entry whose chain is the root and whose predecessor is the Terms replaced; one signer's line within an agreement as a second entry. *Not said, and needed:* what names the chain of one signer's line within an agreement, since two entries with the same chain are read as "a merge of two branches" (Envelopes, "The act"). The least reading Claude found is a payload field for `previous`, leaving `objects` for the agreement's chain alone; that is a choice, listed in part 3.

**(c) An act signed by several people at once: the core says no.** The MICS document, "Common conventions": "**One signer per act.** Anything that needs two identities is two acts, the second naming the first." Identity, "The envelope": "Every act has exactly one signer". So where draft 17 has an agreement sign "by every one of its signers" (G1.2), that is one act for each signer. This agrees with the least reading draft 17 itself gives in P17 ("an act by each of them"). Nothing is missing; P17's first point can be read as answered by the core, if Nobody, allegedly, takes that reading.

**(d) Field names: met, and they differ.** The core's names are in Envelopes, "The act": outside `signer`, `binding`, `to`; inside `spec`, `type`, `prev`, `objects`, `payload`, `position`, `acks`, `refs`, `hint`, `salt`. Everything of draft 17's section 3 would sit inside `payload` ("payload, defined by the type"), except what `objects`, `refs` and `to` already carry. Formats are written in CDDL, "every map a format defines closed", with small unsigned integers as keys (Identity, "Encoding and conventions").

**One thing draft 17 does not ask and a box will meet.** Draft 17, section 1: "Every grammar rule is checked from copies of acts alone". Envelopes rule 10: "Rules about an act's inside can only be checked by those who hold its key. A client MUST NOT treat a private act as valid for anything that depends on its inside unless it has opened and checked it." So "copies of acts" means, for a private act, the act and its content key. A verifier that holds a private act without its key is where G9 applies (**unchecked**). No addition is proposed; draft 17 could say so in one sentence.

### N2. What a place can answer, and how it is identified

Draft 17: "What the Order layer's place can answer: in particular whether it can sign "nothing later than this", and how a place is identified without a server address."

In plain words: a place is somewhere everyone looks, so that "there is nothing later" can be said by someone other than the parties. The core has no such thing under that name, and the nearest thing lives in the old Agreements.

**Missing, as a place.** What the lower layers have:

- Order inside one chain, and no more. Envelopes rule 16: "A chain's order records when acts were added to it, never when the things they refer to were created. Hints are never load-bearing. Every "before" in the core is judged inside one named chain, by reference to a specific act."
- A home's log, for identity acts only. The MICS document, "Receipts": "For every identity-chain act it accepts, a home signs a receipt: which act, at which position, at which point in the home's own log (a counter, never a time), and that it was the first it accepted there."
- Anchoring, which gives "by a point on a named clock" and never "nothing later" (Envelopes, "Tasks").
- The keeper. Envelopes rule 26: "Homes and keepers are relays in particular roles". The keeper's rules are in the old Agreements (the MICS document's "Keepers" cites its rules 36 to 44). *Not followed here.* It is noted because it is the nearest thing to draft 17's place, and it will go with the old text unless it is written again.

**Can anything sign "nothing later than this"? The core says not as a fact.** Identity draft 16, rule 20: "The core decides alike on the same evidence and does not promise the same evidence: a home's compliance with rules 19 and 20 shows only through its receipts, its cosigned summaries and the other homes, and no verifier can prove an omission; completeness and freshness are the market's." What can be signed is a narrower thing: that among what the place had recorded when it signed, nothing follows that act. That is a statement by the place, as of one position in its own line. Draft 17 already reads it that way ("qualified **per place**"; G8.1 lists "the place" among those who state things), so the two agree in spirit. What is missing is the act.

**Identified without a server address: met, by the way the core identifies a home.** The MICS document, "Homes": "Homes are declared by operator identity plus address, so a home can move servers without anyone rotating". Identity, "A home's address": "An address hint is where the home can currently be reached. It is not checked: the operator's identity is what counts, and the operator announces a new address through its own routes". So a place can be named by its operator's identity hash, and found through that identity's routes.

- **A2 (proposal; where it belongs is itself a question).** The smallest addition that would give draft 17 its place: a place is an identity (its operator) that keeps one line of the acts it was shown, in the order it was shown them; a place's answer is an act of the operator that says, of an act or of an agreement's root, whether it is in that line, at which position, and whether anything of the same agreement comes after it, as of the answer's own position. Terms name a place by its operator's identity hash. *This is written from draft 17's own definition of a place (section 2) and K6's row. It was not taken from the keeper, which this file did not open; if it turns out to be the keeper again, that is something for Nobody, allegedly, to know before it is written, since nothing of the old Agreements is to be translated.* Which text it belongs in is not obvious: Envelopes holds chains, order and relays' roles; the new Agreements is the only layer that needs it. Draft 17 says it "does not define ... how a shared order is kept", which points at Envelopes. Putting an act type into Envelopes changes a text that is not Agreements, and that is for Nobody, allegedly.
- **X5 (to resolve).** Until A2 or something like it is written, G7, and every "per place" in draft 17, has nothing under it that a box could build.

### N3. A key replaced or lost

Draft 17: "What the Sign layer does when a key is replaced or lost, since that decides whether G6 sees a fork."

In plain words: when someone changes their key, are they still the same signer? Yes. And does a change of key look like a fork? It can, and the core has a word for the losing side that draft 17 does not have.

**Met.** The MICS document, "MIR: Identity": "An identity is the hash of its genesis act. It never changes. Keys are only the pens that sign for it". A replaced signing key is a **rotation**; the identity is the same. A lost chain key: "An owner who loses the chain key can never rotate or leave; back up both seeds."

**What a rotation does to acts.** Identity rule 33: "If it lies within the rotation's kept ancestry and is not listed as disowned, it is valid, however old." Rule 34: "If it lies outside the kept ancestry, or within it but listed as disowned, it is void, unless" another identity acknowledged it, "or a named keeper recorded it before recording the rotation"; "then it is valid and shown as disputed."

Three things follow for draft 17, none of them an addition to a lower layer.

- **Draft 17's "signer" should be an identity, not a key.** Section 2 has "as a **signer**: a person, by the key the Sign layer gives them". By the core, a party named by a key stops being that party at the next rotation. Met under another name: **identity hash**. Claude's reading is that draft 17 should say so; it is the MOR lead's wording.
- **Does G6 see a fork after a rotation? Not said, and it decides verdicts.** After a theft, the thief's act and the owner's next act can both name the same previous act within one agreement. By G6.2 that is a fork and "Both tips stop". By Identity rule 34 the thief's act is void, or, if someone relied on it, "valid and shown as disputed". Draft 17 has no word "void". The least reading: an act that Identity answers void is not an act for G6 and is no tip; an act that Identity answers disputed is. That is Claude's reading, for the MOR lead to confirm, and it leaves a signer able to end their own fork by a rotation that disowns one tip, where no one relied on it.
- **X6 (to resolve): "disputed" is two words.** In the core it is a display for an act that would be void but that someone relied on (the MICS document, "The verdict vocabulary, said once"). In draft 17 it is a qualifier on what rests on a tip set aside (G12.5). The ideas are close (what others relied on stands, and is shown so) and the conditions are not the same. See N11.

### N4. How cMIPs are identified

Draft 17: "How cMIPs are identified in practice, so that "named by fingerprint" in G2 can be met."

**Met.** Development draft 12, rule 1: "A specification is identified by its spec hash, and labelled under its creator's identity, so names cannot collide. There is no registry." And its words: "**Spec hash.** `tagged_hash("MOR/spec", content)`, where `content` is the deterministic CBOR encoding of the specification's content map (Part three). It is what acts name in their `spec` field and what agreements name per task." Rule 4: "A changed specification is a new specification, with a new hash." A cMIP with its parameters is written elsewhere in the core as a pair, `[hash, any]` (Envelopes, "Vow (type 5)": "a cMIP and its parameters").

Draft 17's "fingerprint of a cMIP" is the core's **spec hash**. G9's "lacks a cMIP named by fingerprint" is the core's "a verifier that does not implement the specification shows it as unknown" (the MICS document, "Common conventions"); see N11 for the word.

- **X2 (to resolve): the word "task".** Development: "**Task.** A point where a MIR hands work to a cMIP that an agreement or a publication may name by the task's number ... Tasks exist only where the MICS defines them." Rule 6: "Every task has one global number". Rule 8: "An agreement, or a publication, names at most one cMIP per task". Draft 17's K1 to K13 have no global numbers, and its Terms name several K4 rules at once (`in_force`, each entry of `powers`, `condition`) and one K12 cMIP for each role. As written, rule 8 forbids that. Either rule 8 is changed for the new Agreements, or K4 and K12 are not tasks in Development's sense but something a field names directly, as a vow names its cMIP. Development's table also lists tasks 8 to 10 and 12 to 15 as the old Agreements' (part 4). Which way is not Claude's to choose.
- **Noted for K4.** Development rule 22 fixes what a rule that "anyone can run" is: "a program for one frozen machine, RV32IM", with "the output (valid, invalid, pending or unknown)". K4's rule "computes; it trusts nobody" and produces "yes, no, a list of who, or amounts". The machine is there; the output it allows is narrower than K4's. And: "Until a profile is uploaded, no rule is uploaded under this rule." So today a K4 rule is "a reference implementation", by that text's own words.

### N5. The report block

Draft 17 lists what it needs from the block, and what the block has not yet said. The block is in no spec, so nothing here is "met" by a lower text. Part 2 writes the block as a proposed section of the MICS document. What follows is only what the lower texts already give toward each thing the block has not said. None of it closes a seam.

| What the block has not said (draft 17's words) | What a lower text already gives | Still open |
|---|---|---|
| "how a call is written, where it sits in the act that holds the task, and how a report names it by fingerprint" | A call is not an act, so it has no act id. What has one is the act that holds it. | How a report names one call among several in one act. The least reading: the act's id and the task. See seam S1 in part 2. |
| "how "where that side receives" is found without a server address" | **Met.** Envelopes, section 7: "Clients SHOULD deliver an act that concerns a counterparty to that counterparty's inbox route where one is declared (Identity). Any two identities can find each other without already sharing a relay, through identity, home and routes." And an identity "may declare no inbox" (the MICS document, "Reaching an identity"). | Where a side that declares no inbox receives. |
| A report "addressed to the other side of its own leg, and to no one else" | **Met as a mechanism.** The outside field `to` ("recipients' identity hashes"), and the sealed container: "A sealed container shows its recipients, never its sender, and only the recipients open the act inside" (the MICS document, "Public receiver, private sender"). | Nothing stops a recipient from showing it on: "its recipient may later show it to anyone" (Envelopes, section 3). R3 is then a rule about how a report is addressed and read, not a lock. |
| "how a report is written as an act, and whether it is a Statement of this text" | Every act names "the specification that defines its type by hash, and a type number within it" (Envelopes, section 1). The MICS document is a specification of kind 6 and defines no act types. | Which specification defines the report's type. See X7. |
| "whether a call is per task, or per act holding several tasks"; "whether one report can answer several calls at once (P6)"; "whether "unanswered" ever ends" | Nothing. Money has a batch, "named on receipts only" (Money, "Words used in this MIR"). | All three. |

- **X7 (to resolve): which layers may carry a report.** The block says "in every layer". Envelopes rule 18: "Only an act whose type is defined by the Identity, Money or Agreements MIR may carry `acks`." A report names the acts it relied on; that can be done with `refs` ("meaning only "look at this"") or in its payload, so `acks` is not needed. But a report's type must be defined by some specification, and if the block is "shared language" it belongs to all six or to none. The smallest reading: one act type, defined once (in Envelopes, where the act is defined, or in Agreements), which every layer's tasks use. That is a proposal about where, not about what, and is not decided here.

### N6. The seam between draft 17 and the block

Draft 17 names three places where it and the block "do not yet read alike". Reading the lower layers adds a fact to each. The three stay open; they are set out again in part 2, with the block.

1. **A confirmation with no call written (G11.7 against R2).** Money adds this: the receiving side's signed word already exists, and needs no call. Money, "Words used in this MIR": "**Settlement receipt.** The common proof of one hop, signed by its receiver, the same for every rail: who paid whom, how much, in what unit, under which agreement." So the question for Nobody, allegedly, may be simpler than draft 17 puts it: is the buyer's confirmation a report at all, or is it Money's receipt, which the grammar reads as it reads a settlement (G8.5)? If it is the receipt, R2 need not bend. Draft 17 asks this itself in N15 ("whether a settlement can itself be the confirmation").
2. **"two sides who both signed".** Nothing in the lower layers speaks to it. Money's two sides are "whoever received on that hop" and the payer, neither of whom signs anything the other signed.
3. **Which lines each side receives.** Money's nearest sentence is about a route: "the claim is disclosed to the final creditor as a receipt would be" (the MICS document, "Routes across rails", citing Money rule 26). That rule was not read as a model here.

### N7. Seeing beyond one leg

Draft 17 needs "that none of them carries a report further than its leg; that none lets a call name a place or a reader; that none lets anyone who did not sign an act call for reports on it; and that none gives, for its own tasks, a path for a report that the people it concerns did not sign for."

In plain words: no lower layer has a report or a call, so none carries one anywhere. But lower layers do carry *data about money* past one hop, by rules that are already there, and Nobody, allegedly, should see them before the sentence "in every layer" is written into the MICS document.

**Met, trivially, for reports and calls:** no lower text has either word in this sense.

**Not met for money data, in three places** (each is a current rule of a lower text, written for the old design, quoted so that it can be weighed):

- Money's route. The MICS document, "Routes across rails": "each receipt names the previous one and the agreement it fulfils, so the route reads as one chain", and "the claim is disclosed to the final creditor as a receipt would be". A route is several hops, and its far end is shown what happened at its near end.
- A payer may publish. Money rule 11: "A payer MAY make one public at any time." That is the payer's own record, published by its signer. It is also a record of what the other side received.
- A recipient may show anything it was given (Envelopes, section 3, quoted in N5).

Whether a route's hops are "legs", and whether disclosure along a route is a path people "agree, with signature" (each conversion service signs its own receipts, under its own offer), is not said anywhere. Claude does not read it either way.

**What draft 17 does not have** ("what a data cMIP focused on agreements is, which task it answers, how Terms name one"): the lower layers give the three ways any cMIP plugs in. The MICS document, "Xtypes": "So a cMIP plugs in three ways: a task, an extension, an xtype." An **extension** is "A cMIP an agreement names ..., outside the listed tasks, for work nobody foresaw. An extension may add rules, never relax the core's" (Development). A data cMIP that gives a path beyond one leg adds a path and relaxes nothing unless R3 is itself a rule of the core, in which case "never relax the core's" would forbid it. That turn is worth one sentence from Nobody, allegedly, when the block is written in.

### N8. What a settlement is, and what a payment is

Draft 17: "What a settlement is, as the layer that holds value gives it, so that the `settlement` field (G8.5) names the right thing; and what a payment is there: how it names the version of the work agreement it read".

In plain words: when money moves there are two signed records, one from each end. Draft 17 uses one word, "settlement", for the evidence, and one word, "payment", for the payer's act. Money has both, under its own names.

**Met under another name, twice.**

- Draft 17's **settlement** ("the signed evidence ... that a payment was made") is, in Money, either of two acts. The **settlement receipt** (type 2), signed by the receiver of the hop (quoted in N6). And the **payment claim** (type 3): "A payer's record of a payment, carrying the rail's proof. Evidence on equal footing with a receipt." Each is checked by "running the rule of the rail Module named in its field 0", and "The answer is valid, invalid, pending or unknown" (Money rule 8).
- Draft 17's **payment** ("an act of the layer that holds value, signed by the payer, which names the version it read") is Money's **payment claim**: "A claim is signed by the payer" (Money rule 7).

**How a payment names the version it read: met in the shape, with the old names on it.** A claim's field 4: "fulfils: the act this payment follows", and Money says "Money judges it only where it names an act to which a rule of Money or Agreements gives a payment following it a meaning: an obligation to discharge, an agreement, publication or price tag to follow ... The examples in the field's comment are not a closed list." So a claim can name a Terms act, by its act id, in field 4, and a receipt in field 5. There is also field 9, `purchase = [ agreement: hash, line: hash ]`, "the ownership agreement and the version the payer's client read, as information"; its words are the old Agreements' (part 4).

- **A3 (proposal, in draft 17 or its act formats; nothing in Money changes).** Say that the `settlement` field holds the act id of a Money settlement receipt or payment claim, and that a payment "names the version of the work agreement it read" means: its `fulfils` field holds the act id of that Terms act. Whether a payment must instead name a price tag (which names what it prices), as Money's purchase does today, is part of the later rewrite of Money's words, not of this.
- **X3 (to resolve): the tie.** Draft 17, G11.4(b): "Two reports that name the same act are tied by it: for a payment, the settlement by which one side passed on and the other received". In Money the two sides sign two different acts, a claim and a receipt. They do not name a common act; they are records of the same payment, and "What "the same payment" is, each rail Module says (for instance, on Lightning the payment hash; on-chain the output the transaction created)" (Money rule 12). So "the same act" has to be read as one of: the receiver's receipt, which the doer's report also names; or the same payment, as the rail Module answers. With the first, a doer cannot report before the receiver signs. With the second, the tie is a rail Module's answer and not a fingerprint. This decides what "matched" means, so it decides verdicts.
- **X4 (to resolve): the greater amount.** Money rule 11: "Where a claim and a receipt are of the same payment (rule 12) and disagree in amount ... the disagreement is shown as an open question on the receiver, and the greater amount counts as received until the receiver signs a receipt matching the payment." The block's R4: "mismatched (both shown, neither chosen)", and G11.4(c): "MUST NOT choose between them". Also Money rule 11: "Where a payer holds a valid rail proof and the payee has signed no receipt, the claim alone shows the money arrived", against G11.7: "it MUST NOT show a payment as received on the buyer's word alone". The second pair may only look like a clash: Money's claim is not the buyer's word alone, it carries a rail proof that a rule checks. The first pair is a real difference between what Money counts and what a verifier of reports shows. Both can stand if they are answers to different questions (what Money counts toward a debt; what a reader of reports is shown). Somebody has to say so.

### N9. How an amount is written

**Met.** Money draft 14, Part three: `amount = [ unit: hash, value: uint ]`, "unit: the unit's specification; value in its smallest part". And: "**Unit.** What an amount is counted in, in its smallest indivisible part. A unit is a small specification of its own, which rail Modules reference, so the same unit has one name on every rail that carries it."

That answers P20's first point ("how an amount is written so that every reader reads it alike") for money. It does not answer it for "a right", which draft 17 sets apart. Part 3 uses Money's `amount` in K4's and K8's shapes.

### N10. How much a proven liar must stand to lose

Draft 17: "The research's own open question: how much a proven liar must stand to lose, and where it is kept, for an evidence-only record to be enough."

**Missing, and not a lower layer's to give.** No lower text has a stake held against lying. What they have is the record: "its promise is not "nobody can take unfairly" but "nobody can take unseen"" (the MICS document, "The test"). The lower layers' sentences about stakes are about shares of ownership, in the old Agreements' sense, and are not this.

No addition is proposed. Draft 17 already places it: a cost (section 7, "Enforce beyond what was posted") and K13. It is listed here so that it is not counted as a seam a spec can close.

### N11. The verifier's answers, and "invalid"

Draft 17: "Whether the verifier's answers (shown, not shown, fork, valid and not valid, invalid, unchecked) are already named in another layer, so that the words match; in particular where "invalid" stops there (P19)."

In plain words: the core already has a set of answer words, said once, and they are not draft 17's. One of draft 17's seven matches. One nearly matches. Two words mean different things in the two texts.

The core's words, from the MICS document, "Common conventions" and "The verdict vocabulary, said once", and Identity, "A verifier that cannot tell answers unknown":

| Draft 17's answer | The core's nearest word | Do they match? |
|---|---|---|
| **invalid**: "an act cannot count as what it claims to be, and the act itself shows it" | **invalid**: "Invalid is only for a rule the verifier can apply and sees fail." An act "outside its specification's format" is invalid. | **Met**, on the line P19 draws. Both texts refuse to say invalid where a missing act could change the answer. But see the note on G14.3 below. |
| **unchecked**: "the verifier could not apply a rule it needed" | **unknown**: "One that does not [hold the acts a rule needs] ... answers unknown, never valid, void or invalid"; "a verifier that does not implement the specification shows it as unknown" | **Met under another name.** Should draft 17 say "unknown"? The core's rule "Invalid beats unknown" would then apply to it as written. The MOR lead's wording. |
| **not shown**: "the acts held do not establish it; an act not held might" | also **unknown** ("an act the verifier does not hold is unknown to it") | The core has one word where draft 17 has two. Draft 17's split is finer and is its own. |
| **fork** | **fork**: "Two acts naming the same predecessor are a fork, provable from signatures" (the MICS document, "Chains and forks") | **Met** as a word. What a fork *does* differs by object, as the core allows: "Whether a fork is normal or a conflict is defined by the MIR that defines the object." Elsewhere in the lower layers a fork leaves both acts standing (a vow's two versions: "the signer's fork, shown, both standing") or falls back to "the last before the fork" (a price tag; routes). Draft 17's "both tips stop" is like the second. |
| **valid**, **not valid**, of a proposed update | **valid** is said of an act, a rotation, a receipt's verification answer | **Different things under one word.** P19 already keeps "not valid" apart from "invalid"; "valid" has the same problem with the core's "valid". |
| **shown** | no one word; the core says an act "counts", or is "valid" | Draft 17's own. |
| **disputed** (qualifier, G12.5) | **disputed**: a display for an act void by its signer's rotation that another identity relied on | **Different conditions under one word** (X6). |
| **per place**, **per clock**, **per anchoring**, **as shown** | none; the core says "judged inside one named chain" and "undetermined" for time | Draft 17's own. |
| the block's **matched**, **mismatched**, **one side only**, **unanswered** | **mismatch** is a display word of the core for something else ("creator mismatch", a fee paid to the wrong receiver) | Close in spelling, different in meaning. |

Two more core words draft 17 does not have and will meet: **pending** ("waiting on something outside the act ... Money: a payment the rail has not answered") and **void** (N3). A payment whose rail has not answered is pending in Money; what a verifier of draft 17 answers for a settlement that is pending is not said. The least reading is **unchecked**.

**A note on G14.3's "invalid".** Draft 17 answers invalid for Terms for a baked work that "name neither the baker among their parties nor a succession". To know who the baker is, the verifier must hold the bake, which is another act. In the core's vocabulary that is not "invalid" (the Terms act is well formed) but the verdict it calls "no X": "an act claiming to be X that fails X's conditions is no X, and decides nothing as X". So G14.3's answer is **met under another name**: "no agreement for that work". Whether draft 17 should use it is the MOR lead's wording, and P19's.

### N12. Envelope, baking, baker

Draft 17: "What the core calls an envelope, baking and a baker (G14): whether an envelope has a fingerprint of its own, how it states who baked it, and whether a work may have several bakers."

In plain words: draft 17 uses "envelope" for the sealed bytes of a finished work and "baker" for whoever sealed them. The core uses "Envelopes" for something else, calls the act a "bake", and calls its signer the "uploader". And the core's bake does not say what G14 needs it to say.

**Met under another name, for the words.**

- Draft 17's **envelope** is the core's **bake**: "**Bake.** The act (type 0) that locks and stores media, and says one thing: "I uploaded this."" (Envelopes, "Words used in this MIR"). In the core, "Envelopes" is the layer and the container of every act ("**Envelopes.** The signed container of an act", Identity). Draft 17 should not call a baked work's act an envelope: a box reader will take it for the act container.
- On "whether an envelope has a fingerprint of its own": **yes, two.** The bake's act id, and the **work hash**: "The work hash is `tagged_hash("MOR/work", plaintext)`, over the complete plaintext of the work ... It is the same wherever the work travels and however it is locked or cut" (Envelopes, section 8).
- On "how it states who baked it": by its signer. "**Uploader.** A bake's signer: the one who uploaded it."
- On "whether a work may have several bakers": **yes, any number, and each on their own bake.** "Anyone may bake the same file; each bake is its uploader's."

**X1 (to resolve): the baker, as the core has it, does not carry G14.** G14's lie exposed is ""This work is mine to sell", said by someone who copied its bytes." Its test is that Terms naming an `envelope` count only if "the baker is one of their parties" or holds through a succession. In the core, the one who copied the bytes bakes them, and is then the baker of their own bake, with a different act id and the same work hash. Terms that name the copier's bake, with the copier as a party, pass G14.2(a) as written. The core says so of itself, as a stated cost: "whoever uploads a bake receives the tips and tag payments sent to it, a fan who re-uploads someone else's work included" (the MICS document, "The bake"), and "A bake is a neutral carrier: it says only that its uploader uploaded it, and never claims the work." G14.4 covers "a work edited and baked again"; it does not cover a work baked again unedited.

Draft 17 took "bake, envelope, baker" as "The core's words, named here and not defined", and was written without the core's text. The seam is real, and it sits under one of the four things section 5.1 says the grammar keeps. What G14 can honestly expose with the core as it is: that Terms name a bake whose uploader is not among their parties. What it cannot: who made the work. In the core that is the business of a **claim** ("I claim to have made this"), which is the old Agreements' act and is not followed here. How to resolve it is not Claude's to choose: G14 could name the work hash and say less; or something that says "first" (an anchoring, a place) could be asked for; or the cost could be stated. No addition is proposed.

### N13. The clock

Draft 17: "What a clock is, which layer gives it, and how it is identified without a server address (G7.4)."

In plain words: the core says it has no clock, and then gives a way to name one. That way is enough for draft 17's field.

**Met under another name.** The MICS document, "Common conventions": "**No clock.** Timestamps are hints, never load-bearing ... Agreements that need real time name a time reference, such as a block height." Envelopes draft 12, "Tasks", Anchoring: "A cMIP accepts any act id and produces a proof that the act existed by a point on a named clock ... **One anchoring cMIP; the clocks are Modules under it** ... a clock is named by a clock Module and its parameters." Money writes exactly that in a format: `[ hash, any ]`, "each a clock Module under the anchoring cMIP and its parameters, naming one clock" (Money, "The clock").

So: a clock is a clock Module, a specification named by its spec hash, with its parameters; the layer that gives it is Envelopes, through the anchoring task (task 11); and it is identified with no server address. Draft 17's `clock` field can hold `[ hash, any ]` as it stands.

Three limits a box must know:

- **What a clock answers.** An anchor shows that an act "existed by a point". It shows "before", never "nothing later", and "Two anchors are compared only on the same clock". G8.2's "What time it was is answered per the clock the agreement names" is met for an act that someone anchored. For an act nobody anchored the clock says nothing, and the answer falls back to **as shown**. Draft 17 could say so.
- **On "whether the place may also be the clock" (P16).** In the core they are different kinds of thing: a clock is a specification; a place (N2) would be an identity. An identity can anchor its own records on a clock; that is two things used together.
- **The time reference** (Development's task 10, "a point on the reference and an act", producing "before, after or undetermined") is listed as the old Agreements' task. It is the nearest shape to what K4 needs from a clock, and is noted, not followed.

### N14. An act signed by several, and the core's `for`

Draft 17: "Whether the core has an act signed by several people at once, for an agreement that signs by every one of its signers (G1.2; P17); and whether the core's `for`, if it has one, can hold an agreement's root."

**Several signers: no** (N1(c)).

**A `for`: missing in the core, with two near things, both of the old Agreements.** The core has no field `for`. It has two ways one identity's act is read as another's:

- a text or other act "signed for a collective by a member or a grantee of it with their own key", carrying one `objects` entry "`[collective, decision]`, naming the collective ... as chain and, as predecessor, the decision it acts under" (Text draft 11, rule 14);
- a **scoped key**, such as a grant key, where "the layer that installed the key says whether the act counts" (the MICS document, "Identity chain and sequences").

Both are judged by the old Agreements, and both rest on a collective being an identity with a chain key. Draft 17's agreement-as-party is named by its root and has no key. *Not followed.* What they show is only that the core's shape for "made for X, under Y" is an `objects` entry `[ X, Y ]`: the identity acted for, and the act acted under. Draft 17's `for` and `under` are the same pair.

- **A4 (proposal, in draft 17's act formats; nothing below changes).** Keep `for` and `under` as payload fields of the Statement, as draft 17 has them, `for` holding an identity hash or a root's act id. Whether they should instead be an `objects` entry is a format choice for whoever writes the CDDL of Terms and Statement (part 5). One caution: Text rule 14 makes any other `objects` on a text act invalid, so the words of Terms cannot be a text act that names its agreement; the `body` must be named from the Terms act, as draft 17 already does.

### N15. A receiving side's "automatic" report

Draft 17: "What a receiving side's "automatic" report is on a way of paying, as the layer that holds value gives it: who signs it, and whether a settlement can itself be the confirmation".

**Met under another name, in good part.** The receiving side's signed word of what it received is Money's settlement receipt (N6, N8). Who signs it: "A receipt is signed by the receiver of the hop", "with its own key, or with a grant key it granted whose grant reaches receipts" (Money rule 7). The second half is how it becomes automatic: "an application holding a person's grant to itself signs that person's claims, and a payee's application its receipts". The grant is the old Agreements' (*not followed*); in the new text it would be a delegation (G5.5), which is why this is "in good part" and not wholly.

What is never automatic in Money: "A specification never signs one", and "a rail Module ... signs nothing". The rail's proof is not a signature by the receiver. It is what lets the payer's claim stand alone: "Where a payer holds a valid rail proof and the payee has signed no receipt, the claim alone shows the money arrived."

On "whether a settlement can itself be the confirmation": by Money's own words the receipt is that, and it already carries the amount, the payer, the payee and what it fulfils. Whether the grammar should read Money's receipt as the confirmation of G11.7, in place of a report, is the question put in N6, item 1. It is for Nobody, allegedly.

### N16. A payment as an act, and the payer's call

Draft 17: "What a payment is as an act, in the layer that holds value: where the payer's call sits in it, and whether a payer can state that no confirmation is called for (G11.7)."

**What a payment is: met** (N8: the payment claim, type 3).

**Where a call sits in it, and a way to say "none called for": missing.** The claim's format is a closed map of keys 0 to 7, 9 and 10, and "Key 8 is reserved, never reused" (Money, "Payment claim (type 3)"). There is no place in it for a call, and a claim with an unknown key is invalid.

- **A5 (proposal; in Money, only if the default call of G11.7 stays a call).** One optional field of the payment claim: absent, the payer calls for the receiving side's confirmation, as G11.7 reads every payment; present with the one value it may hold, the payer states that none is called for. This is the smallest shape that lets a payer say so. It changes a Money format, and it is needed only if N6, item 1, is answered that the confirmation is a report. If it is answered that the confirmation is Money's receipt, nothing is needed here, and stating that none is called for has no meaning: a receiver signs a receipt or does not.

### N17. Access to what was bought

Draft 17: "What access to what was bought is, who gives it, and what shows that it was given or was not (G11.7, G11.8): the Deliver layer's evidence, or a recipient's acknowledgment (task K9)."

**Met, for bytes; for anything else, met only as someone's word.**

- What access is, for a baked work: the media key. "For media on sale, the bake is public (anyone can see what is sold) but the media key is absent, and is delivered to each buyer. After unlocking, a buyer checks the plaintext against the work hash" (Envelopes, section 8).
- Who gives it: whoever holds the key. "Anyone holding a key may deliver it" (Envelopes rule 11).
- What shows it was given: the **key delivery**, "An act (type 1) whose payload names the act whose content key it carries, or the bake whose media key it carries, and the key itself", signed by whoever delivered it and addressed to the recipient. This is K9's "the Deliver layer's evidence". It shows that the giver signed a delivery, and "its key is used only if it opens what it names". It does not show that the delivery arrived: "nothing forces propagation, and delivery is the signer's interest."
- What shows it was received: an **acknowledgement**. Envelopes rule 17: "An act acknowledges another identity's act by naming it in `acks`. It says only "I received this"." This is K9's "the recipient's signed acknowledgment". Only acts of types the Identity, Money or Agreements MIRs define may carry one; a Statement of the new Agreements would be among them if the new text keeps the layer's place.
- What shows it was not given: nothing can. That is the buyer's word, which is what draft 17's contest is (G11.8, G8.1).

For what MOR cannot hash (a service, a good), the core's word is a **vow**, and it keeps "only whether a sale is pending, confirmed or contested" (Envelopes, section 9). Those three states are defined in the old Agreements (*not followed*). They say the same thing draft 17 says: confirmation and contest are words of those who took part.

**A word to note.** Draft 17's vow is "the same thing [as an offer] but without bytes attached". The core's vow is an act of Envelopes that "names in words something MOR cannot hash, existing or to come". The two fit together closely enough that "without bytes attached" may simply mean that what is sold is a vow, in Envelopes' sense, and not a bake. That is Claude's observation, not a reading of his words; section 8.2 of draft 17 leaves it open, and it stays open.

### N18. Whether the core already has a contest

Draft 17: "Whether the core already has a contest. His words: "Contest is MOR act though. It is just extended.""

**In the lower layers: named, never defined.** The lower texts speak of a contest act and point upward for it:

- The MICS document, "Vows": "each sale is pending, confirmed (acts the buyer acknowledges) or contested (a contest act naming the sale, and optionally the promise not kept)". Envelopes, section 9, hands it up: "each sale's state ... are Agreements'".
- Identity, "Words used in this MIR": "*Agreements' contest act is none of these: an objection shown beside what it names, which changes no status here.*"
- Money rule 28: "What follows (refund, penalty, contest) is Agreements' business."

So the contest "MOR act" his words point at is an act of the old Agreements. This file does not open it. What the lower layers say of it, and no more: it names a sale; it is made by "someone who signed onto it"; it is "shown beside what it names" and "changes no status". Draft 17's contest (a Statement of kind `contest`, made against an offer or a vow, its signer's word, standing on the record) agrees with all four. What "extended" adds, by draft 17, is "that it is made against an offer or a vow".

**Missing below, and rightly so:** the contest is an Agreements act in the core's own layering. Nothing is proposed for a lower layer. The word **contested** is used in Identity for four other things (a position, a rotation, a receipt, routes) and in Money for a forked pointer or tag; draft 17's act is none of them, as Identity already says of the old one.

### N19. What a client is, and where its duties are kept

Draft 17: "What a client is, where the duties of clients are kept, and how a client is tested against them, since no verifier can check G12.8."

**What a client is, and where its duties are kept: met.** The MICS document, "Client conformance": "Every client implements Identity, Envelopes and Text. Every other MIR is optional per client, but all-or-nothing ... Rules that only the signer's own client can honour (what you sign is what you saw; showing what a rule computes; never choosing a device-bound policy by default) are marked as conformance, not validity: no verifier can check them, and the text says so." Each MIR marks such a rule where it stands: "*Client conformance* marks a rule for the client that locks or signs, which no verifier checks and no verdict reads" (Envelopes, "How to read this MIR"). The core does not define the word "client" beyond its use; draft 17's definition ("the software through which a person reads acts and signs them") fits every use read.

So G12.8 is written the core's way: marked "client conformance", in the rule's own place, saying that no verifier can check it. One difference: draft 17 says the duty "is written here and nowhere else", and the core's habit is one marked rule in each place it applies. They do not conflict.

**How a client is tested against them: not found in the texts read.** The six texts say such rules cannot be checked by a verifier, and say nothing of testing a client. The freeze test suite was not opened; if the answer exists it is there. Missing, as far as this reading goes; no addition is proposed, since a test of what a client shows is a test of software and not a rule of the protocol.

### The proposals and the things to resolve, gathered

| | What | Belongs in | From |
|---|---|---|---|
| A1 | Say how `previous`, `replaces` and `agreement` are carried (`objects` entries, or payload) | the new Agreements' act formats | N1 |
| A2 | A place: an operator identity, one line of the acts it was shown, a signed answer (present, at this position, nothing after it as of here) | Envelopes, or the new Agreements: a question | N2 |
| A3 | `settlement` holds the act id of a Money receipt or claim; "names the version it read" means its `fulfils` field holds a Terms act id | the new Agreements | N8 |
| A4 | Keep `for` and `under` as payload fields; `for` holds an identity hash or a root | the new Agreements' act formats | N14 |
| A5 | One optional field in the payment claim: "no confirmation called for" | Money, only if the buyer's confirmation is a report | N16 |

| | To resolve | Why it decides something |
|---|---|---|
| X1 | The baker is the uploader, and anyone may bake the same bytes | G14 cannot expose a copier (N12) |
| X2 | "Task", and "at most one cMIP per task" | Terms as written name several K4 rules (N4) |
| X3 | The tie between two halves: Money's two sides sign two acts | what "matched" is (N8) |
| X4 | "The greater amount counts" against "neither chosen" | what a mismatch shows (N8) |
| X5 | No place exists below | G7 and every "per place" (N2) |
| X6 | "disputed", "valid": one word, two meanings | what a reader is told (N3, N11) |
| X7 | Which specification defines the report's act type | whether a report can be an act in "every layer" (N5) |

---

## 2. The report block, as a proposed section of the MICS document

In plain words: this is `report-block-2.md` told again in the voice the MICS document uses: normal text is the protocol, italic text is commentary, a bold word opens each paragraph, and the exact formats are left to another text. Nothing is added. The block's five rules keep their names (Call, Report, One leg, Halves, Silence), so that draft 17's "R1" to "R5" still land: R1 is **The call**, R2 **The report**, R3 **One leg**, R4 **Halves**, R5 **Silence**.

**Where it would sit** is a proposal: in "Structure", after the paragraph "Tasks", since a call is attached to a task. The MICS document's own admission test would be what lets it in: "Something belongs in the core only if it is part of the shared language every act is written in, or a guarantee no module may be able to break." Whether the block passes that test is for Nobody, allegedly.

**What is not in it**, on purpose: every seam. They follow the block, set out and not closed.

### The proposed text

> **The report.** A report is data, and data moves along paths that people agree, with signature. The one path the core gives is the **leg**: two sides, the one who carries out an obligation and the one it is carried out for. A report moves leg by leg only, in every layer.
>
> **The call.** An act that names a task may attach a call to it. A call states the task and from whom a report is expected: the side carrying out the obligation, the receiving side, or both, as the task defines those sides. A call binds only the signers of the act that holds it. A call does not say where: the where is implied by the leg.
>
> **What a report carries.** A report is a signed act carrying the call it answers, by fingerprint; the acts it relied on, by fingerprint; and its signer. A task may define further content. A report that names no call is no report. *Everything else (amounts, a holder's own part, a fee kept, what is still owed) is the task's to define.*
>
> **One leg.** A report is addressed to the other side of its own leg, and to no one else. A call cannot name any other reader. *Seeing beyond one leg (a partner who wants the end of the waterfall, a request from further up) is another path, and moves only where the people whose data it carries agreed to it with their signature, built as a data cMIP. The core gives no call that names an outside reader.*
>
> **Halves.** Each side signs its own half; an act both name (for a payment, the settlement) ties the halves. Where a call expects reports from both sides, a verifier shows, for each act both reports name: matched, mismatched (both shown, neither chosen), or one side only.
>
> **Silence.** A call with no report is shown as unanswered; a task with no call, as no report called for. Neither is read as anything else.
>
> **Every leg is the same exchange.** A receiver who holds for others then carries out the next obligation, within their own agreement, and the same exchange happens there.
>
> *Lie exposed: "It went through", said by one side alone; "you never asked", said by a side whose signers did. Protects: both sides of every leg, who each hold the other's signed word; and everyone further along or further up, whose data moves nowhere they did not sign for.*

### What was changed in the telling, so that it can be checked against the source

- "Data needs to move along paths that people agree, with signature." is the words of Nobody, allegedly, quoted in the block. In the proposed text the sentence is told without quotation marks, because the MICS document's protocol text does not quote. If it is written in, whether it stays his sentence, word for word, is his to say. **The source has "Data needs to move"; the proposed text has "data moves".** That is a change of voice from a wish to a rule, and is the one place where the telling goes beyond copying. It is flagged for that reason.
- The block's plain words say the leg is "two sides who both signed". The proposed text says "two sides" and leaves "who both signed" out, because that phrase is one of the three seams draft 17 names (seam S2 below). Leaving it out does not close the seam: with or without the three words, somebody has to say what the two sides are. If the lead's wording is to be kept exactly until that is said, the three words go back in.
- "MAY" is written "may", as the MICS document writes it; the exact rules, with RFC 2119 words, would be in whichever MIR holds the format.
- "knot" (the block's plain word for matching halves) is left out, since the rule's word is "matched".
- "What changed from proposal 1" is history and is left out, as the freeze-ready texts carry none.
- The MICS document's "task" is a numbered hand-off to a cMIP; the block's is wider (X2). The proposed text uses the word as the block does.

### The seams, set out for Nobody, allegedly, and not closed

Each seam says, in plain words, what is not yet said, and what the choices appear to be. The choices are Claude's setting out; none is recommended over another.

**From draft 17, section 8.1: where it and the block do not read alike.**

- **S1. A confirmation with no call written.** A buyer pays; the one who receives confirms. Draft 17 reads every payment as carrying the buyer's call for that confirmation, by default (G11.7). The block says a call may be attached (so it may be absent), and that "A report that names no call is no report". As draft 17 puts it, the block "would need to say two things it does not say": that a task may define a call as made by default by the act that holds it; and that a report may name the call it answers by naming the act that holds it. *What reading Money adds:* the receiving side's signed word of a payment already exists, as Money's settlement receipt (N6, N15). So there appear to be two ways: the confirmation is a report, and the block says the two things; or the confirmation is Money's receipt, read by the grammar as a settlement is, and the block says nothing more.
- **S2. "two sides who both signed".** In draft 17 the two sides of a leg are whoever carries out the obligation and whoever receives it, "whether or not they signed anything together". A buyer and a receiver signed nothing together. The block "would need either to drop "who both signed" from its plain words, or to say what counts as each side having signed."
- **S3. Which lines each side receives.** One doer pays five people and writes one report. Does each of the five see all five lines, or only their own? Draft 17 leaves it to the task's cMIP (G11.3). "The block would need to allow a task to say so."

**From draft 17, section 8.1: what the block has not yet said.**

- **S4. How a call is written, and where it sits** in the act that holds the task; and **how a report names it by fingerprint**. A call is not an act, so it has no fingerprint of its own (N5).
- **S5. How "where that side receives" is found without a server address.** The lower layers give the inbox route, found through identity, home and routes (N5). Not said: a side with no inbox.
- **S6. How a report is written as an act, and whether it is a Statement** of Agreements. With it: which specification defines its type, if it is to exist "in every layer" (X7).
- **S7. Whether a call is per task, or per act holding several tasks.** (The block's open point 1.)
- **S8. Whether one report can answer several calls at once**: one batch, many payments; pools (the block's open point 3; draft 17's P6).
- **S9. Whether "unanswered" ever ends.** (The block's open point 4.)
- **S10. The words.** "call", "report", "matched", "one side only", "unanswered" are the MOR lead's, as technical wording; "leg" is the word of Nobody, allegedly (the block's open point 5).

**From draft 17, section 8.1: seeing beyond one leg.**

- **S11. What every layer must not do.** Draft 17 needs that no layer carries a report further than its leg, lets a call name a place or a reader, lets anyone who did not sign an act call for reports on it, or gives a path the people concerned did not sign for. The block's **One leg** says the first two. The third is in **The call** ("binds only the signers of the act that holds it") as a statement of who is bound, not of who may call; the block's plain words say it directly ("Only those who signed the act that holds the task can make the call"), and the proposed text keeps the rule's wording. Whether the plain sentence should be a rule too is open.
- **S12. What a data cMIP is.** Which task it answers, how Terms name one so that their signers have agreed to it, and whether it belongs to Agreements alone. *What reading Development adds:* a cMIP plugs in as a task, an extension or an xtype, and an extension "may add rules, never relax the core's". If **One leg** is a rule of the core, a cMIP that carries a report further would relax it, unless the block's own sentence about data cMIPs is read as the core allowing it (N7).

**Found by reading the lower layers (Claude's; not in draft 17 or the block).**

- **S13. The tie.** The halves are tied by "an act both name (for a payment, the settlement)". In Money the two sides sign two acts, a claim and a receipt; what they share is the payment, as the rail Module answers it (X3).
- **S14. Neither chosen, against the greater amount.** Money counts the greater amount where a claim and a receipt differ (X4).
- **S15. "In every layer", and what Money already discloses.** A route's far end is shown its near end; a payer may publish a claim (N7). Whether those are legs, reports, or neither.
- **S16. "Leg", beside Money's "hop".** A hop is "One movement of money on one rail, from one party to the next." A leg is one obligation carried out between two sides. A payment that crosses rails is one leg and several hops, if a conversion service is not a side; or several legs, if it is. Not said.

---

## 3. The tasks as data

In plain words: a cMIP is a document that answers one task. To test the grammar before any real cMIP exists, a stub must be able to stand in for one: something that takes exactly what the task says it accepts and gives back exactly what the task says it produces. For that, "accepts" and "produces" must be shapes of data, not sentences. This part writes those shapes.

**The style.** The MICS document gives each task in words only (Development's table, "A cMIP accepts ... and produces ..."); it uses CDDL for acts, not for tasks. So there is no existing style for a task as data. The shapes below are written in the style the core uses for acts: CDDL (RFC 8610) under the conventions of Identity's Part three ("Encoding and conventions"), every map closed, keys small unsigned integers, shared parts under the names they carry in the MIRs (`hash`, `amount`).

**What they are and are not.** They are the least shapes Claude found that fit draft 17's words, for stubs and vectors. They are proposals. They are not act formats and nothing here is signed or hashed. Where draft 17's words do not fix a shape, the least one is given and the choice is listed in 3.3. The key numbers mean nothing beyond this file.

### 3.1 Shared shapes

```cddl
hash   = bstr .size 32                 ; as Identity defines it
amount = [ unit: hash, value: uint ]   ; as Money defines it

act-id   = hash   ; an act, by its act id (Envelopes): draft 17's "fingerprint" of an act
spec-id  = hash   ; a cMIP, by its spec hash (Development): draft 17's "fingerprint" of a cMIP
identity = hash   ; a signer, by identity hash (Identity); draft 17 says "by the key" (N3)
root     = act-id ; an agreement, by the act id of its first Terms act

party-ref = [ 0, identity ]            ; a signer
          / [ 1, root ]                ; an agreement

cmip-ref = [ spec-id, params: any ]    ; a cMIP and its parameters, as a vow and a clock write it

held-act = [ act: bstr, ? key: bstr .size 32 ]
                                       ; one act the verifier holds, encoded whole, and its content
                                       ; key if it is private: the shape of a sealed container's contents
acts-held = [* held-act]               ; "the acts held"

; what a named place answered (K6's output, and an input to K4, K12 and K13)
place-answer = {
  0 => identity,          ; the place, by its operator (N2)
  1 => act-id / root,     ; what was asked about: an act, or an agreement
  2 => true / false,      ; is it there
  ? 3 => uint,            ; at what position (present exactly when 2 is true)
  4 => true / false,      ; is anything later, as of this answer
  ? 5 => held-act         ; the place's signed answer itself, where one is held
}

; what time it was, per a named clock or anchoring
clock-answer = {
  0 => cmip-ref,          ; the clock: a clock Module and its parameters (N13)
  1 => act-id,            ; the act asked about
  2 => any,               ; the point on that clock by which the act existed
  ? 3 => bstr             ; the proof, as the anchoring cMIP gives it
}

anchoring = {
  ? 0 => [* place-answer],
  ? 1 => [* clock-answer]
}                         ; both absent: every answer that needs one is "as shown"

; a receiver for an act, as G1.4 answers it (an input to K4, G1.5)
receiver-for-act = {
  0 => root,              ; the agreement owed
  1 => act-id,            ; the act that gives or owes
  ? 2 => identity         ; the party reached; absent: no one receives (not shown)
}

; what a leg report states (K8's output, and an input to K4, G1.5)
received-line  = [ amount, by: act-id ]                 ; an amount, and the act it came by (a settlement)
passed-on-line = [ amount, to: party-ref, by: act-id ]  ; an amount, to whom, and the act it went by
owed-line      = [ amount, to: party-ref ]              ; an amount still owed, and to whom

leg-report-doer = {
  0 => act-id,               ; the call it answers, named by the act that holds it (seam S4)
  1 => [* act-id],           ; the acts it relied on: the version passed on by, each settlement
  2 => [* received-line],    ; what was received
  3 => [* passed-on-line],   ; what was passed on
  ? 4 => [+ amount],         ; the doer's own part, where the leg's Terms give it one; not a fee
  5 => [* amount],           ; what was kept (a fee)
  6 => [* owed-line]         ; what is still owed
}

leg-report-receiving-side = {
  0 => act-id,               ; the call it answers (for a payment, the payment: G11.7)
  1 => [* act-id],           ; the acts it relied on
  2 => [* received-line]     ; what it received
}

leg-report = [ signer: identity, 0, leg-report-doer ]
           / [ signer: identity, 1, leg-report-receiving-side ]
```

### 3.2 The thirteen tasks

Each task is given as `kN-accepts` and `kN-produces`. A stub for task N is anything that, handed a `kN-accepts`, returns a `kN-produces`.

```cddl
; K1 Body: what do these words say?
k1-accepts  = { 0 => bstr }              ; the body bytes
k1-produces = {
  0 => tstr,                             ; a reading for people, as canonical text
  ? 1 => { * any => any }                ; parts for machines, that rules read
}

; K2 Identity: who is behind this signer?
k2-accepts  = { 0 => identity,           ; the signer
                ? 1 => root }            ; the agreement it is asked for
k2-produces = [* held-act]               ; signed statements by those who vouch

; K3 Assurance: what was done to make it likely a party was able, free and understood?
k3-accepts  = { 0 => act-id,             ; the Terms
                1 => party-ref }         ; the party
k3-produces = [* held-act]               ; signed statements of what was done; never a pass

; K4 Rule: what does this rule produce from these acts?
k4-accepts = {
  0 => any,                              ; the rule's parameters
  1 => acts-held,
  2 => anchoring,                        ; answers of the place and the clock the agreement names,
                                         ; or of the anchoring named where it names none
  ? 3 => [* receiver-for-act],           ; G1.5
  ? 4 => [* leg-report],                 ; what leg reports state, G1.5
  ? 5 => [ in-force: act-id, proposed: act-id ],        ; the update condition, G4.11
  ? 6 => [ earned-under: act-id, later: act-id ]        ; the update condition, of a filling, G10.6
}                                        ; at most one of 5 and 6
k4-produces = [ 0, true / false ]                          ; yes, or no
            / [ 1, [* party-ref] ]                         ; a list of who
            / [ 2, [* [ ? to: party-ref, amount ]] ]       ; amounts
            / [ 3, true / false, ground: [* k4-ground] ]   ; valid, or not valid, with the ground
k4-ground  = [ 0, act-id ]               ; an act (reported by who signed it, G8)
           / [ 1, clock-answer ]         ; a time (per the clock, G7.4)

; K5 Witness: what happened in the world?
k5-accepts  = { 0 => act-id,             ; the Terms that state the question
                1 => any,                ; the question, as those Terms state it
                2 => [+ identity] }      ; the named witnesses
k5-produces = [* held-act]               ; each witness's signed statement

; K6 Place: is this act in the place, at what position, and is anything later?
k6-accepts  = { 0 => identity,           ; the place's identifier
                1 => act-id / root }     ; an act, or an agreement
k6-produces = place-answer               ; a signed answer by the place

; K7 Tally: what did a vote decide, without showing who voted how?
k7-accepts  = { 0 => [* bstr],           ; the ballots
                1 => [+ identity] }      ; the list of who may vote
k7-produces = { 0 => any,                ; the result
                ? 1 => bstr }            ; whatever proof the method allows

; K8 Control: has the controller carried out this instruction?
k8-accepts  = { 0 => held-act,           ; the instruction
                1 => acts-held,          ; the acts behind it
                ? 2 => k4-produces }     ; the rule result behind it
k8-produces = { 0 => [* held-act],       ; the controller's signed evidence (settlements)
                ? 1 => [* leg-report] }  ; where the Terms that hold the task carry a call

; K9 Delivery: did this act reach this person?
k9-accepts  = { 0 => act-id,             ; the act
                1 => identity }          ; the recipient
k9-produces = [ 0, held-act ]            ; the recipient's signed acknowledgment
            / [ 1, held-act ]            ; the Deliver layer's evidence (a key delivery, N17)
            / [ 2 ]                      ; neither is held

; K10 Judge: what did the named judge decide?
k10-accepts  = { 0 => held-act,          ; the Terms, with their authors
                 1 => acts-held }        ; the acts of the dispute
k10-produces = [ ? held-act ]            ; the judge's signed decision, or none yet

; K11 Kind: what does a Statement of this kind state, and which rules read it?
k11-accepts  = { 0 => spec-id }          ; the kind
k11-produces = { 0 => tstr,              ; the meaning of content, in words
                 ? 1 => tstr,            ; the shape of content, as a CDDL rule
                 ? 2 => any }            ; how K4 rules may read it

; K12 Spot: who fills this spot, by which proof, on whose word; does it still take new identities?
spot-kind = 0 / 1 / 2 / 3 / 4            ; done, received, holding, fits, future
k12-accepts = {
  0 => act-id,                           ; the version in force
  1 => spot-kind,
  ? 2 => hash,                           ; the role's `what`; absent exactly for kind future
  3 => acts-held,
  4 => anchoring
}
filling = [ identity, proof: [+ act-id] ]   ; who fills it, and the acts that earned it
k12-produces = {
  0 => [* filling],                      ; each filling; empty: none
  1 => true / false,                     ; whether the spot holds many fillings (false: one)
  2 => true / false,                     ; whether it still takes new identities
  3 => any,                              ; why (its cause, as the cMIP gives it)
  ? 4 => any                             ; for kind future: what defines the participant
}

; K13 Standing: what do one signer's acts show about them, to anyone who looks?
k13-accepts  = { 0 => identity,
                 1 => acts-held,
                 2 => anchoring }
k13-produces = { * tstr => any }         ; whatever measures the cMIP defines
```

**What every stub must also be able to say.** Draft 17's G9 answers **unchecked** "Where a verifier cannot apply a rule it needs, because it lacks a cMIP". That is the verifier's answer when it has no stub, not an output of the stub, so no shape above carries it. Whether a cMIP may itself answer "I cannot tell" (as the core's rules may: "valid, invalid, pending or unknown", Development rule 22) is not said in draft 17. It is listed below.

**The three simplest stubs**, which are enough for most vectors: a constant (always the same `produces`); a table (a fixed map from an `accepts`, by its encoded bytes, to a `produces`); and absence (the cMIP is not held, so the verifier answers unchecked). Each is a specification like any other, with its own spec hash, so Terms name a stub exactly as they would name a real cMIP.

### 3.3 Where draft 17's words do not fix a shape

Each line is a place where a least shape was chosen. Each is open.

1. **What a fingerprint is of.** Draft 17 has one word. The shapes use four identifiers: act id, spec hash, identity hash, and (in `k12-accepts`, field 2) a bare `hash` for a role's `what`, which draft 17 says is "the X, Y, Z or W, by fingerprint" without saying of what kind of thing.
2. **A signer is written as an identity hash**, where draft 17 says "by the key" (N3).
3. **"The acts held"** is a list of encoded acts with their keys. Draft 17 does not say whether a cMIP is handed every act the verifier holds or only those of the agreement asked about (P5 is the wider question).
4. **K1, "any parts for machines that rules read".** No shape is said. Least: an open map.
5. **K2, "a signer, an agreement".** Not said whether both are always given. Least: the signer always, the agreement where there is one.
6. **K2, K3, K5, "signed statements".** Least: acts, whole, of any type. What type a vouching, an assurance or a witness statement is, is not said; each would be an act type of the cMIP's own (an xtype, in Development's word).
7. **K4, "amounts".** Not said whether each amount comes with a "to whom". Least: optional.
8. **K4, "a list of who".** Least: parties, as signers or agreements. Whether a role may be listed is not said.
9. **K4, valid or not valid "with the ground the cMIP gives".** Least: a list of acts and clock answers. G4.11(c) names "an act ... or a time".
10. **K4, which of its outputs is expected.** A rule is used for `in_force`, for a power, for dividing, for the update condition. Draft 17 does not say that a rule declares which kind of answer it gives. Least: the output says which it is, by its first item.
11. **K5, "the question as the Terms state it".** Least: the Terms, and the question as any data item.
12. **K6, "a signed answer by the place".** The shape of `place-answer` is Claude's (A2). "Is anything later" is read as "as of this answer" (N2).
13. **K7, "the ballots".** Least: each a byte string, opaque. "The result" and "whatever proof the method allows": any.
14. **K8, "an instruction".** Least: an act. Which act instructs Control is not said; G8.3 says only "An act can instruct Control".
15. **K8, a leg report's lines.** "What was kept (a fee)" and "the doer's own part" are written as lists of amounts, one for each unit, since a doer may hold more than one unit. Draft 17 says "its amount".
16. **K8, how a report names its call.** Written as the act id of the act that holds the call. That is seam S4, and for the buyer's confirmation, S1. It is a placeholder, not an answer.
17. **K8, which of a doer's lines each receiving side receives.** Not in the shape: the shape is the whole report. A cMIP that hands each side only its own lines would produce several `leg-report-doer` values, one for each side (seam S3).
18. **K9, "or the Deliver layer's evidence".** Least: an act (a key delivery). A third answer, "neither is held", is added so that a stub can say nothing was found.
19. **K10.** Least: the decision as an act, or none. That it "binds only through a power under G5" is the verifier's reading, not the cMIP's output.
20. **K11, "how K4 rules may read it".** No shape is said. Least: any.
21. **K12, the role "as the version in force states it".** Least: the version, the kind, the `what`. The role's own cMIP parameters, if a role's cMIP takes any (section 8.4 of draft 17, from draft 10's list, item 9), are not in the shape.
22. **K12, "on whose word".** The Trust column names who confirms; the output carries the proof's acts, each of which has its signer. No separate field is given.
23. **K12, "and why".** Least: any.
24. **K13.** Least: an open map from a name to anything, since "whatever measures the cMIP defines". The qualifier ("per place or as shown") is the verifier's, set from whether `anchoring` was given.
25. **Whether a cMIP may answer that it cannot tell.** Not said. Not in any shape.
26. **Whether these shapes are what a rule on the frozen machine is handed.** Development rule 22 says a rule's input is "the act and the data it names" in "the encoding the profile fixes", and no profile exists yet. The shapes here are for stubs and say nothing of that encoding.

---

## 4. Where the lower layers point at the old Agreements

In plain words: the five lower texts and the MICS document were written around the old Agreements, and name its rules, its acts and its ideas in many places. This is the list of those places, for whoever later rewrites those layers. Nothing in them is changed by this file, and nothing they say of the old Agreements was followed in parts 1 to 3.

Each table gives the section, how many times the word "Agreements" appears in it, the old rule numbers it cites, and what it leans on. The counts were made by a search and are a guide to where to look, not a measure.

### Identity draft 16 (45 mentions)

| Section | Mentions | Old rules cited | What it leans on |
|---|---|---|---|
| How to read this MIR; Dependencies | 2 | 73 | a citation given as an example |
| Words: Acts and keys | 3 | 58, 73, 80 | scoped keys; a grant key; a collective's acts |
| Words: Chains and sequences | 1 | | chain signatures for "forks, closings and stake transfers" |
| Words: Rare cases | 1 | | "Agreements' contest act is none of these" |
| Rule 1; The genesis checks | 3 | | a collective's genesis declares its founding agreement |
| Rule 8. Scoped keys | 3 | 73, 80 | the grant |
| Rule 9; The everyday checks | 2 | 58 | "a client that acts on agreements MUST implement Agreements"; acts for a collective |
| Rule 11; Rule 16 | 2 | | witness acts; a link gives no authority |
| Which value counts | 3 | 76 | a grant's revocation |
| Rule 23; The receipt checks | 2 | 42 | keepers |
| Rule 29 | 1 | 10, 91 | what a chain signature placed; a fork |
| Rule 34 | 4 | 41, 42 | "a named keeper recorded it before recording the rotation" |
| Evidence counts only while its signer's chain keeps it | 6 | 6, 42 | a collective's line; keeper records |
| 7. Chain signatures | 2 | | "a member's signature on a fork or closing" |
| A succession is declared ... | 3 | 84 | a collective confirms by chain signature; seats |
| Encoding and conventions | 1 | | the tag `MOR/law/leftover` |
| Tasks; Freeze scenarios | 5 | | a collective's key grammar |

### Text draft 11 (13 mentions)

| Section | Mentions | Old rules cited | What it leans on |
|---|---|---|---|
| Rule 14. What a text act carries | 6 | 58, 73, 80 | the two allowed `objects`: `[grantor, grant]` and `[collective, decision]` |
| Rule 6. What you sign is what you saw | 2 | | "terms, a grant or a clone" |
| Reasoning; Freeze scenarios | 5 | 58 | the same |

### Envelopes draft 12 (38 mentions)

| Section | Mentions | Old rules cited | What it leans on |
|---|---|---|---|
| How to read this MIR; Words: Acts | 2 | 58 | which MIRs' acts may acknowledge |
| 3. Private delivery; Rule 12 | 3 | 57 | sealing to a collective; key release through a grant; the negotiation record |
| Rule 14. Chains | 1 | 58 | a collective's two chains |
| Rules 17 to 19 | 7 | 52 | acknowledgements; the negotiation message, "Agreements type 18" |
| Rule 20. References | 1 | | a reposter's role share |
| 8. Media; Rule 23 | 7 | 12, 58 | claim, ownership agreement, publication; a purchase under a publication |
| 9. Vows | 5 | 7, 13, 58 | a sale's three states; publications selling a vow; a work claim |
| Rule 24 | 2 | 11 | a publication ended by a version that sells nothing |
| 13. Theft of the signing key | 1 | | what a seller owes after a hijack |
| The act (format) | 3 | 57, 60 | the `to` field's comment, for a collective's act |
| Bake; Types; Tasks; Reasoning | 6 | | selling under an agreement; deadlines and time references |

### Money draft 14 (89 mentions)

| Section | Mentions | Old rules cited | What it leans on |
|---|---|---|---|
| Purpose; Dependencies | 5 | 12 | "How the money is then divided among owners is defined by their agreement, in Agreements"; a purchase |
| Words | 5 | 12, 22, 92 | "the payer the payment commits to"; batch; release; purchase |
| Rule 4; Rule 5 | 4 | 60, 91 | a collective's rails |
| Rule 7 | 14 | 58, 60, 73, 76, 80, 99 | a collective's Money acts; grant keys; control models |
| Rule 12 | 1 | 12 | one push payment to several holders |
| Rule 15 | 8 | 33 | an obligation's states that "depend on Agreements" (past its terms, closed by clone, redirected) |
| Rule 16; Rule 17 | 3 | 92, 93 | the creditor's release; refunds |
| Rule 18 | 13 | 10, 12, 14 | the price tag under a publication; the split service; the purchase; a stake transfer |
| Rules 19 to 23 | 8 | 24, 25 | referrals, role shares, fees, attention |
| Rule 24; Rule 28 | 3 | 12 | "A contest of a purchase"; "refund, penalty, contest" |
| Formats: payee pointer, obligation, receipt, claim, release, price tag | 20 | 10, 23, 58, 92, 93, 99 | field 9 `purchase` (the ownership agreement and its line); `fulfils`; batch; "Agreements' type 21 is retired" |
| Tasks; Reasoning; Freeze scenarios ("Covered by Agreements") | 4 | | splits are an Agreements task |

Money says "Money never depends on Agreements". Its words depend on the old one's all the same: publication, split service, ownership agreement, stake, collective, grant.

### Development draft 12 (37 mentions)

| Section | Mentions | Old rules cited | What it leans on |
|---|---|---|---|
| How to read this MIR; Dependencies | 3 | 11 | |
| Words: Tasks, extensions and xtypes | 1 | | "Agreements, terms field 2, publication field 9"; "terms field 15" |
| Rule 3 | 5 | 58, 80 | a creator that is a collective or signs under a grant |
| Rule 6; Rule 8 | 3 | | tasks named by number in terms; one cMIP per task (X2) |
| The tasks the core defines | 10 | 11, 17 | tasks 8 (Split), 9 (Condition evaluation), 10 (Time reference), 12 (Grant limits), 13 (Work claims), 14 (Absence proof), 15 (Termination terms); the proof checker |
| Rule 12; Rule 14; Rule 15 | 7 | 22, 28 | moving off a cMIP by cloning; fees; evidence of use |
| Rule 27 | 1 | | agreements name a successor's specifications by cloning |
| Format: fields 10, 11, 12, 13 | 7 | 11, 22 | layers an extension acts on, for a collective's approval; the proof-of-delivery checker |

Development's task table is where the rewrite will be most visible: seven of its fifteen tasks are the old Agreements', and none of K1 to K13 is in it. Nearest pairs, for whoever redraws it (noted, not followed): K2 and task 1 (Identity proofs and credentials); K1 and task 4 (Text format), in part; K4 and task 9; the clock and tasks 10 and 11; K8 and tasks 6 and 8; K9 and the proof checker, which is "not a task".

### The MICS document, version 37 (93 mentions)

| Section | Mentions | What it leans on |
|---|---|---|
| The header; Structure | 13 | "Agreements draft 24"; the layer table's row 4; "From bake to publication" (bake, claim, ownership agreement, publication); "A collective acts through its members, and is judged in Agreements"; Tasks; Client conformance |
| Common conventions | 7 | "An act counts only where it is held" (a collective's line, keeper records, rules 6 and 42); the verdict vocabulary's Agreements words ("void, not done, uncited, outside an area and in a broken stretch"); "A like is never an acknowledgement" |
| MIR: Identity | 6 | scoped keys; grants (rule 76); chain signatures (rule 10); succession to a collective's seat |
| MIR: Text | 1 | rule 58 |
| MIR: Envelopes | 3 | vows' sale states (rule 13); anchoring (rule 33) |
| MIR: Money | 8 | publications, split service, collective's Money acts, "Termination" |
| MIR: Agreements, all of it | 31 | the whole section is the old Agreements: "Agreements and deals", "Claims and ownership", "Publications, splits and time", "Keepers", "Collectives", "Succession, grants and abandonment", "Disputes" |
| MIR: Development | (no count: the word is "an agreement") | tasks named by an agreement; extensions and a collective's approval |
| Outside the core; Glossary | 21 | control models (rule 99); the glossary's Agreements words |

Not opened, and sure to point at the old Agreements as well: the freeze test suite, version 37 (each MIR's "Freeze scenarios" names its scenarios), and `spec/README.md`'s own table.

### Ideas of the old Agreements that the lower layers use without always saying the word

For the rewrite, these are the nouns to search for, since a section may lean on one without citing a rule: **collective** (an identity with a chain key and no signing key, in Identity's genesis itself: "A one-way door in the format, written knowing it"); **keeper** and **keeper record**; **grant** and **grant key**; **publication**, **split service**, **split**, **partner**, **role share**; **ownership agreement**, **stake**, **holder**; **claim** (of a work); **clone**; **deal**; **decision** (a collective's); **negotiation message**; **time reference**; **contest** (as a sale's state); **purchase**; **obligation's states**.

Two of them matter to the new text more than the rest, and are in part 1: the **collective**, because draft 17 says "the grammar has no separate notion of a collective" while Identity's genesis format has one built in; and the **keeper**, because it is the only place-like thing the core has (N2).

---

## 5. What a full box needs after this

In plain words: a box is a sealed set of texts and test cases from which a stranger could build a verifier alone, and be checked. After this file, here is what still has to exist, in the order in which each thing unblocks the next. The list starts from Fable's six points (`docs/reviews/fable-agreements-draft-14.md`, section 7) and adds what this reading found.

### 5.1 In order

1. **Nobody, allegedly, on the seven things to resolve (X1 to X7).** They come first because each changes what a later text says: X1 what G14 is; X2 what a task is; X3 and X4 what "matched" means; X5 whether "per place" exists; X6 the answer words; X7 whether a report is an act of one layer or of all. One at a time.
2. **The report block, written into the MICS document**, with seams S1 to S16 answered or stated as costs. Until then a report "has no fields", in Fable's words, and nothing of G11 can be built.
3. **The lower-layer additions, decided**: a place (A2), and, only if needed, the payer's "no confirmation called for" (A5). And the wording choices of the table at the head of part 1 (the layer names; "identity" for "key"; "bake" for "envelope"; "unknown" for "unchecked", or not).
4. **The five open points that decide verdicts** (Fable's point 2): how an agreement signs (P17), what a fork removes (P9), what a verifier holds (P5), depth of powers through powers (P2), depth and loops of receivers (P8). This reading adds a reading for two of them, to confirm: the core's "One signer per act" for P17's first point (N1(c)); and what a rotation's void act is to G6, for P9 (N3).
5. **The act formats of the new Agreements, in CDDL**: Terms and Statement as payloads of an Envelopes act, with a spec hash and type numbers; how `agreement`, `replaces` and `previous` are carried (A1); `for` and `under` (A4); `settlement` (A3); `calls`; a role; a power; and the report, wherever it lands. Section 3 of draft 17 is tables of fields; a box needs bytes.
6. **The tasks as interfaces, confirmed.** Part 3's shapes, corrected by the 26 points of 3.3, and at least the three stubs (constant, table, absent) uploaded as specifications, so that each has a spec hash Terms can name.
7. **The rules alone, as one text** (Fable's point 5): the grammar rules without plain words or reasoning, each word with one meaning, each MUST and each answer with an identifier a vector can cite. Draft 17 is close to this already; what is missing is the identifiers at the grain of one testable sentence (G4.8 holds five).
8. **The lower layers' words, rewritten** where they point at the old Agreements (part 4), or else a short table in the box saying which of their sentences a builder ignores. A stranger handed Money draft 14 and the new Agreements, as they are, would build a split service.
9. **Vectors** (below).
10. **The seal**: the texts' hashes, the stubs' spec hashes, the vectors' hash, and the statement of what the box covers and does not.

What is ready before all of that, as Fable's review said and the small box `MOR-CBOX` took: the part with no agreement as a party and no report. This reading changes nothing there, except that items N1 and N3 now say how its acts and signers sit on the core.

### 5.2 How vectors could be generated from the texts

In plain words: a vector is one small test: these acts, this question, this answer. The danger with vectors is that they are made by running the same program they are meant to test. So the expected answers must come from the text, by reading, and only the bytes from a program.

A way to do it, once steps 5 to 7 exist:

1. **A table of sentences.** From the rules-alone text, pull every sentence that makes a verifier do or answer something: every MUST, every MUST NOT, and every place an answer word appears (shown, not shown, fork, valid, not valid, invalid, unchecked, and the qualifiers). Each gets an identifier (G4.8-a, G4.8-b). This table is made by hand, once, and is itself reviewed. It is the list of what must be tested: nothing is a vector unless it cites a row, and no row is covered until a vector cites it.
2. **A scenario, written in words and in a small script.** For each row, at least one case where the rule gives its answer and one where it nearly does and does not (the replacement with every signature; the same replacement lacking one). A scenario names people by role ("the first owner", "a stranger"), never by key, and says which acts exist, which the verifier holds, which stubs stand for which cMIPs, and what the place and the clock answered.
3. **The expected answer, written from the text before any code runs.** For each scenario: the question, the answer, its qualifier, who is reported as having said it, and the row it rests on. Written by one reader and derived again, without seeing the first, by another (a second session, or the box's C reader). Where the two differ, the text is unclear at that row, and that is a finding about the text, not about the vector.
4. **The bytes, from a generator.** A program builds each scenario's acts in the core's encoding, with test identities derived from the role's label so that every run gives the same bytes and no real key is ever used or stored. It emits, for each vector: the held acts, encoded; the anchoring answers; the table of stubs by spec hash; the question; and the expected answer from step 3, copied, never computed. The generator may use the core library's encoder. It must not use the verifier.
5. **Vectors made from vectors, mechanically.** Three kinds that need no new reading, because draft 17 states them as general promises:
   - *Any order.* Hand the same held acts over in every order, or in many random orders: the answer must be the same. (Draft 17, section 1: every grammar rule "is checked from copies of acts alone".)
   - *Take one away.* Remove one held act from a vector whose answer is **shown**: the answer may become **not shown** or **unchecked**, and must never become **invalid**. (Section 2, "The line between invalid and not shown".) Remove a cMIP: every answer resting on it must become **unchecked** (G9).
   - *Add the other branch.* To a vector with a line, add a second update of the same act: the answer must become **fork**, and nothing built on either tip may count (G12.2).
6. **A coverage table**, kept with the vectors: each row of step 1 against the vectors that cite it. The box is not sealed with an empty row unless the row is marked as one no verifier can check (G12.8, a client's duty) or as a cost.
7. **Every vector names the text it was written from**, by the hash of that text. When the text changes, the vectors written from the old hash are known to be stale, and step 3 is done again for the rows that changed.

What cannot be generated: vectors for what a cMIP says. A stub answers what it is told to answer. The grammar is tested with stubs; each real cMIP will need vectors of its own, from its own text.

---

## 6. What this file did not do

- It decided nothing. A1 to A5 are proposals; X1 to X7 and S1 to S16 are open.
- It did not open the old Agreements MIR, `docs/findings/`, `docs/agreements-inventory/` or `docs/agreements-marking/`. Where a lower text told the old Agreements' rules again (the MICS document's "MIR: Agreements"; the keeper; the grant; the collective), it is noted as pointing there and was not used.
- It did not open the freeze test suite, the small box (`agreements-box-1`), or the code.
- It ran nothing and tested nothing. The CDDL of part 3 was written by hand and has not been put through a CDDL tool.
- It read Identity and Money in part: in full where section 8.1 touches them, by heading and search elsewhere. A sentence that bears on a seam may have been missed there.
