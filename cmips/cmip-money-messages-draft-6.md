# cMIP: Money messages

*Draft 6, 30 October 2026 (the Dubsar Suite's round 8, F407), on draft 5 (`cmip-money-messages-draft-5.md`), for Nobody, allegedly, to approve. **Experimental, not approved.** The core moved to the redesign (S7h: `docs/s7h-report.md`, steps 2 to 4; `wasm/README.md`, "For the Dubsar Suite"): the Agreements **standing offer is gone**; a price is a **price tag** (Money type 5), on a bare bake its uploader's, under a **publication** (Agreements type 6) its split service's; **the split service receives in its own name** (Agreements rule 16), so no grant key signs for a collective or a deal; terms fields 8, 14, 28 and 29 are withdrawn, a publication carrying the split service, the plan and the backups; Envelopes type 0 is a **bake**; and a collective has no key of its own. Draft 6 makes every sentence of drafts 4 and 5 that these make untrue true again, each marked **new in draft 6**: the sale's table row and fields 0 and 3 (7.2), the anchor's first item (2.1), a payment under a publication asked of its split service in its own name (4.4, rewritten), draft 5's "deal's payee" withdrawn (4.4.1), a tip to a shared work naming the publication (4.4.2, 4.4.3), a tip to a bare bake (4.4.4, new), a sale under a publication told to its parties and holders, its key delivered by the service or the designated party (7.2.3), how an app finds a shared work (8, rewritten), whom a purchase's claim is sealed to (9.1), and the costs. **No format changes**: every type and field is draft 4's; what field 0 of a sale and of an anchor names follows the core. **Its acts keep draft 4's test value** (mechanic, this draft's; a reading, to confirm, as draft 5's question 1 was). Draft 5's header follows.*

*Draft 5, 23 October 2026, written by the round "splits between separate people" (`docs/splits-reading.md`, `docs/splits-report.md`, F388), for Nobody, allegedly, to approve: draft 4 with three things written in, each marked "new in draft 5" where it stands:*

- ***A deal between separate people*** *(decided by Nobody, allegedly, 22 October 2026: "Edubba is the place"; "with a tip IF there is a split the target is the agreement not the act"): 4.4, 7.2.3 and a new section 8 read a deal's payee and parties where draft 4 says a collective; a tip to a work shared under a deal follows the deal itself, paid to the deal's own payee, through its split service; how an app finds that a work is shared under a deal.*
- ***A purchase's claim, readable by every member or party*** *(decided with the MOR lead, 23 October 2026: "where the payee of a purchase is a collective or an agreement with several parties, the buyer's client makes its claim readable by every member of the collective's agreement in force, or every party of the version the purchase names (sealed to each, or its key delivered to each)"; stated cost: "every member or party sees who bought"): a new section 9, following the MOR lead's core line of client conformance, in its words, once it is on main.*
- ***The sale names a vow too*** *(7.2.3): field 3 of a sale may name the vow an offer sells.*

***No format changes:*** *every act of draft 5 is an act of draft 4, byte for byte; its types and fields are draft 4's, and **its acts keep draft 4's test value**, `sha256("Money messages cMIP, draft 4, test value until publication")` (mechanic, this draft's; a reading, to confirm: question 1 of the report). What changes is what an app reads before it pays and whom it seals to. A reader of draft 4 reads every act of draft 5. Draft 4's header follows.*

*Draft 4, 19 October 2026, written by round 3 (`docs/round-3-report.md`), for Nobody, allegedly, to approve: draft 3 with **F357** written in (decided by Nobody, allegedly, 19 October 2026, on the session's lean), each change marked "new in draft 4 (F357)" where it stands. **Invoice requests reach a split service** (4.4): where the payee's agreement in force names a split service (Agreements terms field 14), the payer sends the invoice request to the service, sealed to the service's own encryption key; the collective stays the payee in the commitment; the service answers with an invoice from its node and later signs the receipt with the collective's grant key. The payer's money app reads field 14, as its pointer check already reads Agreements. **A purchase confirmed from another app** (2.3): a draft of a new kind, "confirm", prepared in Edubba and sealed to oneself, which the money app signs as a public claim of the payment acknowledging what was bought (a vow's sale, Agreements rule 13). With them, a mechanic this draft's, marked so: **a collective's sale told to its members** (7.2.3), so that a member's app delivers the work's key. Types and fields of draft 3 are unchanged; a reader of draft 4 reads drafts 1 to 3 as its own. Its test value: `sha256("Money messages cMIP, draft 4, test value until publication")`. Draft 3's header is draft 4's, kept in `cmip-money-messages-draft-4.md`.*

*Founding cMIP, **EXPERIMENTAL**: an instrument for testing, not a product; test identities and test networks only until MOR is frozen. Not core: frozen at publication, competing with any other cMIP for the same job.* Draft 6 is written against MICS v30, the Money MIR draft 11, the Agreements MIR draft 17, the Envelopes MIR draft 11 and the Text MIR draft 11 as S7h rewrote them, the payment cMIP draft 5, the anchoring cMIP draft 6 and the split cMIP draft 4. It fills no task: an xtype (Development rule 18), six act types. It changes nothing in Money: claims, receipts, obligations and price tags stay Money's own acts. Code: `clients/damgar/src/messages.ts` (Damgar, Dub and Edubba), `clients/grants/src/deal.ts` (a deal, read), `clients/split-service`; none of it follows draft 6 yet.

*Reading this document: normal text is the specification; italic text is commentary. Every choice is **(mechanic, this draft's)** unless it cites a decision. Sections 1 to 7 are draft 4's (`cmip-money-messages-draft-4.md`) and sections 8 and 9 draft 5's (`cmip-money-messages-draft-5.md`), save where draft 5 or draft 6 changes them; every change of draft 6 is below, marked **new in draft 6**, and where draft 6 rewrites a part, draft 5's version of it no longer applies.*

## Reassessment (new in draft 6)

*In plain words: the messages are still needed; most of what drafts 4 and 5 added for splits is now the core's, and goes.*

**What it still does.** *Dub and Edubba prepare payments and never sign them; the money app does. The messages that carry a prepared payment to the money app, a request to be paid, an invoice request with the payment's fingerprint, its answer, a lane asked and a sale told to oneself, are still the only way those apps talk about money through MOR. The core has none of them, and the redesign added none.*

**What the redesign changed for it.** *Three things it relied on are gone or renamed. **The standing offer is gone**: a seller prices a bare bake by a **price tag** (Money type 5), and sells with others through a **publication** (Agreements type 6) whose price tag its split service signs. **The split service receives in its own name**: the tag names it as payee, it receipts with its own key, and it pays everyone; drafts 4 and 5 had the payer seal its request to the service while the commitment named the collective or a deal's own payee, and the service sign with a grant key: none of that remains, since no grant key names a service and no "deal's payee" is needed. And **a tip to a shared work names the publication itself**, which the core now reads (a tip through the publication, Agreements rule 12), where draft 5 had it follow the deal's version. So section 4.4 shrinks to one sentence, draft 5's "deal's payee" goes, and the sale names a price tag and a bake.*

**Should it retire?** *Not the messages: no other text carries a draft from Dub to Damgar or an invoice request. But its split sections (4.4, 7.2.3 to 7.2.5, 8 and 9) now mostly repeat the core and say how an app reads it. A later draft could keep them as client guidance only, or move them to the apps' own notes; draft 6 keeps them, shortened, because the apps' tests still name them.*

## In plain words (new in draft 6)

*A buyer pays a **price tag**. On a bare bake, the tag is its uploader's and pays them alone. Under a publication, the tag is the split service's, so the payment goes to the service, which asks for it in its own name and later divides it: partners first, then the owners by their shares. A tip to a work shared under a publication names the publication and also goes to the service. Every party who shares in a sale is told of it, and can read the buyer's claim.*

## Changes to draft 4 and draft 5

### The table: a sale (new in draft 6)

| Message | Signed by | Sealed to | Carries |
| --- | --- | --- | --- |
| **Sale** (type 6, draft 2) | the seller's money app, or the split service's | the seller itself, or each party told (7.2.3) | the price tag paid, the buyer, the receipt, the bake or vow it sells |

### 2.1. A draft for an anchor (new in draft 6)

`anchor = [ publication: hash, tier: uint, leaf: hash ]`: its first item names **the anchoring service's publication, by its first version** (the anchoring cMIP draft 6, items 3 and 10), where drafts 1 to 5 named the service's standing offer. The format is unchanged. The money app finds the latest version of the publication and of its tag (Agreements rule 11), and the commitment's `fulfils` is the tag's version (anchoring cMIP draft 6, item 10). A draft whose first item names no publication the money app can read is refused, saying why.

### 4.4. A split service, the tag's payee (rewritten in draft 6)

4.4. **A payment under a publication is asked of its split service, in its own name.** A publication's price tag names its split service as payee (Agreements rule 16; Money rule 18). So the payer sends the invoice request to **the tag's payee**, the service, as to any payee (4.3): its `to` the service, sealed to the service's own encryption key, at the service's inbox route; the commitment's payee is the service, `paid-to` the service's own pointer in force, `fulfils` the tag's version. The service answers (section 5) with an invoice from its own node, and later signs the receipt **with its own key, in its own name**, naming in field 9 the ownership agreement the publication names and the version whose shares it pays (Agreements rule 12). *Drafts 4 and 5 named the collective, or a deal's own payee, in the commitment, and had the service sign with a grant key: the core now gives no grant key to a service, and the service receives in its own name.* Before paying, the payer's money app says who answers: "The split service answers for this work." **(new in draft 6)**

4.4.1. **Draft 5's "deal's payee" is withdrawn** (new in draft 6). A work shared between separate people is shared by an ownership agreement targeting its claim (Agreements type 0, field 33) and sold or tipped through a publication naming it (field 1); the split service is the publication's (field 3). No party holding no stake is needed to receive for the others.

4.4.2. **A tip to a work shared under a publication** (rewritten in draft 6; decided, draft 5: "with a tip IF there is a split the target is the agreement not the act") **names the publication itself**: its commitment's `fulfils` (the receipt's field 5, the claim's field 4) is the publication, by its first version **(mechanic, this draft's: the first version, as a price tag names it)**; its payee the publication's split service (field 3); no purchase. The core reads it as **a tip through the publication**: no purchase, divided by its split plan as a sale is, owed back to nobody (Agreements rule 12). *The decision's "the agreement, not the act" is kept: the tip goes to the publication that shares the work, never to whoever posted it.* *A Money-only wallet cannot read field 3: it tips through a tag, or not at all (Agreements rule 12).*

4.4.3. **A tip drafted in another app** (a draft, section 2, what 0) is for a shared work where its `refs` name a post naming a publication (8.1) and its payee (field 1) is that publication's split service: the money app then makes the payment follow the publication (4.4.2). The draft's format is unchanged. A draft copied by hand, which carries no `refs`, cannot: an app refuses to prepare one by hand for a shared work, saying so. *As draft 5, with a publication in place of a deal.*

4.4.4. **A tip to a bare bake** (new in draft 6) names the bake (`fulfils` the bake) and is paid to its uploader's pointer, unsplit (Envelopes rule 23), whatever publication also sells it. *An app that found the bake through a publication tips the publication (4.4.2), not the bake.*

### 7.2. A sale (changed in draft 6)

```cddl
sale = {
  0 => hash,   ; the price tag followed (Money type 5), the version the payment named
  1 => hash,   ; the buyer: the payer the receipt names
  2 => hash,   ; the receipt this identity signed for the payment
  3 => hash    ; what the tag sells: the bake, or, under a publication selling a vow, the vow by its name
}
```

*New in draft 6: the format is draft 2's; field 0 names a price tag, where drafts 2 to 5 named a standing offer (once Agreements type 6, the publication's number now), and field 3 a bake, where they said "the publication sold" in the old sense of an upload.*

7.2.1. **A bare bake's sale** (rewritten in draft 6). Sent by the uploader's money app, sealed to the uploader itself, at its homes, once it has signed the receipt of a payment naming its own tag on its bake (Money rule 18). The uploader's own app for that layer (Dub) reads it and delivers the bake's key to the buyer (Envelopes type 1, a key delivery, sealed to the buyer). *The money app signs no Envelopes act; the Envelopes app learns of the sale through MOR, never a side channel.*

7.2.2. A sale names no amount and binds nobody: the receipt is Money's.

7.2.3. **A sale under a publication** (rewritten in draft 6, replacing draft 4's 7.2.3 and draft 5's 7.2.4). Where the payment names a tag a publication counts, its split service signed the receipt (4.4). The service tells, by a sale sealed to each, signed by the service: **every party of the publication** (its partners, its backups, and the owners' side) and **every holder of the ownership agreement's version the receipt names** (field 9): for a collective's, every member of its agreement in force (Agreements rule 57). Field 0 is the tag, field 3 the bake or vow. **The content key is delivered by the split service or the party the publication designates** (Agreements rule 11; field 10): by the service itself, or by the designated party's app on reading the sale. *Draft 4 had a member's app deliver the key "signed as the collective": a collective signs nothing, and the core now names who delivers.* *Every party and holder learns of every sale: a collective keeps no secret from its members (rule 57), and the parties of a deal accepted it, each receiving the split anyway.*

7.2.4. **Field 3** names a bake, or, for a publication selling a vow (`[3, vow]`), the vow by its name. A reader takes it as what the sale is about; an app delivers a key only for a bake. *Draft 5's 7.2.5, in the redesign's words.*

### 8. A work shared under a publication (rewritten in draft 6)

8.1. **How an app finds that a work is shared.** From the post that shows it, the acts its `refs` name, at the places the app already looks:

- **a publication** (Agreements type 6) selling the work, or naming its ownership agreement: a post about a shared work names it in `refs`. *A text act cannot name a publication in `objects` (Text rule 14), so it names it in `refs`; the post only points the tipper's app at it.*
- **a price tag** naming a publication (Money type 5, field 1): the publication is the one the tag names.
- *Draft 5's "deal's terms" and "standing offer whose field 0 names a deal's version": withdrawn, a publication carrying both.*

The version read is **the latest the app finds**: *client conformance, a strong SHOULD (Agreements rule 12):* a buyer's app finds the latest version of the publication and of its tag, at the places of every party, and warns where what it shows is outdated. A publication whose latest version sells nothing has ended: the app says so and pays nothing under it.

8.2. **What a tip follows**: the publication found in 8.1, by its first version (4.4.2).

8.3. **The one line before paying** (decided, draft 5's prompt: "This work is shared: X, Y, Z. The split service answers for it."): before signing an invoice request for a purchase or a tip under a publication, the payer's app says, in one line, **who shares in it**: each partner with its share and label, then the owners, each with their share of the stake of the ownership agreement's version in force (Agreements rule 12), by the names the payer gives them; and that the split service answers. *New in draft 6: partners are named first, since they are paid off the top (Agreements rule 15).*

8.4. **A tip to a person** (a post naming no publication) is unchanged: the person's own pointer, as before (Money rule 17: "for a tip, the version of the payee pointer it follows"). A tip to a bare bake goes to its uploader (4.4.4).

8.5. **What a reader does with a post naming something that is not a publication or a price tag**: nothing here: the tip goes to the post's signer, as before. *A post may name another's publication: tips then go to that publication's split service and are divided among its parties, never to whoever wrote the post; the line before paying (8.3) shows who they are. Nobody gains by it. (Draft 5 compared it with a false `for`; a bake carries no `for` any more, Envelopes "Bake (type 0)".)*

### 9. A purchase's claim, readable by every member or party (changed in draft 6)

*The MOR lead's core line is on main (Agreements, "Contest (type 14)", client conformance): "where the payee of a purchase is a collective, or an agreement with several parties, the buyer's client makes its claim of the purchase readable by every member of the collective's agreement in force, or by every party of the version the purchase names". Since the redesign, the payee of a purchase under a publication is always its split service; **this draft reads "the payee" in that line as the publication's owners' side** (mechanic, this draft's; a reading, to confirm).*

9.1. **Who** (new in draft 6): for a purchase (a payment naming a tag a publication counts; its claim's field 9 names the ownership agreement and the version the payer's app read), where the ownership agreement targets a collective, or names a collective among its holders, every member of that collective's agreement in force; where it is an ownership agreement of several holders, every holder of the version the claim's field 9 names. A purchase of a bare bake, or under a publication naming no ownership agreement (a lone seller's), adds no one.

9.2 to 9.4 are draft 5's, read with "the first recipient" the split service, the tag's payee (4.4).

## Costs, stated (new in draft 6, replacing draft 5's and draft 4's on splits)

- **Every party, holder or member sees who bought** (9), the decided cost, and every party of a publication learns of every sale (7.2.3).
- **A split service learns every payment under its publication**: the payer and the amount, as it must to split it; the payer's request names the service, never an owner.
- **A Money-only wallet tips a shared work only through a tag** (4.4.2): it cannot read a publication's field 3. A tip it sends to a person's own pointer, found on a post about a shared work, goes to that person alone.
- **A draft by hand cannot tip a shared work** (4.4.3): use the lane or Ask Damgar.
- **Draft 5's "deal's own payee held by its proposer" is gone**: the split service holds the money it receives, and its payouts are checked by every participant (Agreements rule 18); what it may hold, and for how long, are the publication's terms.
- **Old acts read under draft 6**: a sale or an anchor whose field 0 named a standing offer names an act the core no longer reads as an offer; a reader shows it unknown (6.1), never guesses.

## Freeze scenarios (new in draft 6, to be run once the code follows)

Not core. To run in Edubba's and Damgar's tests, with real homes and relays and test Lightning nodes: a bare bake priced by its uploader's tag, bought from Dub, the sale told to the uploader's Dub, the key delivered; an ownership agreement between three people and a publication naming it, its split service signing the tag; a protected file bought from Dub under it, the invoice request to the service, the receipt in the service's own name naming the agreement's version, the split published, partners first then each owner by their share, every party and holder told of the sale (7.2.3), the key delivered by the service; the buyer's claim sealed to every holder and their contest shown in each one's Sales (9); a vow under a publication bought and confirmed; a post naming the publication tipped from Dub under the lane and through Ask Damgar (4.4.2, 4.4.3), the tip divided, no sale told; by hand, refused; a tip to one person's own post paid to them alone (8.4); a tip to a bare bake paid to its uploader (4.4.4); an anchor drafted from Dub naming the anchoring service's publication. *Draft 5's scenarios with a deal's own payee no longer describe this draft.*
