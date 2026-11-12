# cMIP: Terms reading (the facts a signer is shown)

*Draft 1, 11 November 2026. Founding cMIP for the task **terms reading** (proposed as task 16; F441, gate decision 1, decided by Nobody, allegedly), written by the Dubsar Suite **before the core's declarations exist**, so that the second rehearsal's players have something to attack. **EXPERIMENTAL. Not approved, not a product; test identities only until MOR is frozen.** Written against main at `fc624ab8`: Agreements draft 24, Development draft 12, Money draft 14, Identity draft 16; and against Fable's `fable-signed-facts.md` (pull request 135, sections 1, 2, 5 and 7) and `fable-fresh-eyes.md` (pull request 134, section 5). What it could not express is in `docs/terms-reading-draft-1-report.md`.*

*Reading this document: normal text is the specification. Italic text is commentary. Choices no decision fixed are marked **(mechanic, this draft's)**. Where a fact needs a declaration the core has not yet defined, it is marked **(waits on the core)** and listed in section 7.*

## In plain words

*Before you sign something that binds you, your app shows you what you are agreeing to. Not the whole text again: the few facts that decide what can happen to you. Who can declare you gone. Who can pay you less. Who can end your place, and who can change the rules without you. Where the money goes. Who judges. And, every time, what you can always do whatever you sign.*

*This cMIP decides which facts those are, how each is written as data so any app can show it in any language, and in what order: the plainest danger first. It never tells you whether to sign. It forecasts nothing, scores nothing, compares nothing, and says nothing about the people on the other side. It says, on its face, that it is a summary and not the terms.*

*Your app chooses this reader, never the agreement. The side being protected picks its own reader, the way you bring your own adviser. Anyone may write another reader for the same task; this is the first one.*

## 1. The task, and where this cMIP sits

1.1. **Terms reading** is a task chosen by the signer's client, never named by an agreement (as a client chooses its naming cMIP, Identity task 2). An agreement, a publication or a grant naming this cMIP in any field names nothing: the field is read as the core reads an unknown extension. *(The core's rule for that case is not written yet: section 7, item 7.1.)*

1.2. The core's client sentence this cMIP serves, as decided (F441, gate decision 1): *before a signature that binds a person to terms, the client shows what its terms-reading cMIP produces from them, names that cMIP, and shows what the person can always do.*

1.3. **The signatures it reads for** (mechanic, this draft's, from Fable's section 3): a party's signature on founding terms or on a clone (type 1); a party's signature naming a publication it becomes a party of (a partner, a split service, a backup, an owners' side's member); a buyer's side of a stake transfer (type 4), which is buying in. **Not** a purchase (a payment accepts the sale, never the terms), and **not** a way-out act (section 6).

1.4. **What it accepts.** As decided: the terms, and the declarations of the cMIPs they name. To produce the facts of section 3 it also needs the following, each handed to it as data, never fetched by it (mechanic, this draft's; the report asks whether the task's "accepts" should name them):

- **the reader**: the identity hash of the person about to sign, so that "your place" can be read;
- **the parent**, for a clone: the version it clones, so that what changes can be marked;
- **for a publication**: the publication itself, and the ownership agreement its field 1 names;
- **for a buyer of a stake**: the publications in force over the stake that the client holds, marked as found, never as all of them;
- **the obligations the client holds** that arise from the agreement (Money type 1, field 4 naming it), marked as found;
- **for a collective**: the control model's query answer (Agreements rule 99, `query-answer`), where the client holds the model.

1.5. **What it produces**: one reading (section 2), and nothing else. It signs nothing, writes no act, and stores nothing. Two clients holding the same inputs and this cMIP produce the same reading, byte for byte (deterministic encoding, as the core's).

*Why the reader is the client's: a summary named by the agreement is chosen by whoever drafted it, the first pattern, the thing that decides signed by the wrong party (Fable, section 1).*

## 2. The reading, as data

2.1. A reading is data, never prose. Every value is a hash, a number, a field path into the inputs, a code from this document, or a structure from the core's own grammar (the terms' `rule`, `power`, `holders-rule`, `layer-rule`). **A reading carries no text it wrote.** Where a fact is text the parties wrote (a partner's label, the terms' words), the reading points at it by its path in the inputs, and the client shows it in place, as written, under Text rule 6.

```cddl
reading = {
  0 => face,                 ; section 2.2: what this is, and what it is not
  1 => [* fact],             ; the facts, in the order section 4 gives; every fact of section 3 that applies, none left out
  2 => [+ always],           ; section 5: what the reader can always do, from their place; never empty
  3 => [* wait],             ; section 7: each fact this reading could not give, and why
}

face = {
  0 => hash,                 ; this cMIP
  1 => hash,                 ; the act read: the terms, clone, publication or transfer about to be signed, by its act id
  2 => hash,                 ; the reader: whose place the facts are read for
  3 => 0,                    ; the face: "a summary, not the terms" (section 8); always 0, always shown
  4 => [* hash],             ; the specifications whose declarations this reading used, ascending
  5 => [* path],             ; what it did not read: the terms' words (field 1) always; any parameters of a cMIP it
                             ; does not hold
}

fact = [
  kind: uint,                ; section 3's number
  value: any,                ; the kind's value, as section 3 writes it, or [ 9, why ] where it is unknown
  changed: bool,             ; for a clone: true where this fact differs from the parent's reading; false otherwise
]

path = [+ uint]              ; a path into the inputs: input index, then field keys and list indices
                             ; (input 0 the act read, 1 the parent, 2 the publication, 3 the ownership agreement)

who = [ 0, hash ]            ; this identity alone
    / [ 1, rule, among: [+ hash] ]   ; a rule of the core's grammar, counted among these parties
    / [ 2 ]                  ; nobody
    / [ 3 ]                  ; every party, you among them: nothing happens without your signature

why = [ 0, hash ]            ; a cMIP this client does not hold
    / [ 1, hash ]            ; a cMIP held, with no declaration this reading can read (section 7)
    / [ 2, uint ]            ; a declaration the core has not defined yet, by section 7's item number
    / [ 3 ]                  ; an input the client does not hold
```

2.2. **The face** (key 0) is shown first and with every fact, on every screen that shows any part of the reading. Section 8 says what it says.

2.3. **Unknown is never safe.** A fact whose value is unknown is shown at its place in the order, as unknown, with its reason; it is never left out and never shown as the fact's harmless value. *The core's own rule: "answers unknown, never valid".*

2.4. **Every fact is shown.** A fact whose value is the safe one (`[3]`: nothing without your signature; `[2]`: nobody) is shown too, at its place. *A reader who reads literally learns as much from "nobody may declare you absent" as from its opposite, and an omitted line reads as an unasked question.*

## 3. The facts

Each fact below names its kind number, the value it carries and the fields it reads. **(mechanic, this draft's: the kind numbers and value shapes.)** A fact applies where its inputs exist; one that does not apply (a split for a collective's founding, say) is not produced.

### Without your signature

3.1. **Who may declare you absent** (kind 1). From the abandonment clause (terms field 9):

```cddl
absence = [ 0 ]                                  ; no clause: nobody may declare anyone absent
        / [ 1, {
            0 => who,                            ; the authority (key 0): a named identity, or a threshold of the others
            1 => [+ uint],                       ; the outcomes it may declare (key 1), Agreements rule 89's codes
            2 => proof,                          ; what stands between its word and your stake
            3 => bool,                           ; you can be its subject (you are a party it reaches)
          } ]
proof   = [ 0 ]                                  ; no absence-proof cMIP: the authority decides alone, on no proof
        / [ 1, cmip: hash, absence-declared ]    ; an absence-proof cMIP (key 3), and what it says counts as absence
absence-declared = [ 9, why ]                    ; (waits on the core: section 7, item 7.3)
```

*`[0]` in `proof` is the plainest fact in the list where it is true: the authority decides alone, on no proof (Fable, section 2). A client renders it in those words or their equivalent, never softened.*

3.2. **Who may pay you less, or dilute your share** (kind 2). For each stake you hold or are buying (terms field 7):

```cddl
paid-less = {
  0 => uint,                 ; your share, in millionths
  1 => issuance,             ; who may issue more of the stake, reducing every holder's share
  2 => who,                  ; who signs the stake's release to the public domain (field 24; absent: every holder)
  3 => bool,                 ; an absence outcome redistributing stakes is allowed (field 9, key 1 holds 1)
  4 => [* hash],             ; stake successors named in your own succession plan (field 16), if any
}
issuance = [ 3 ]                                 ; no holders' rule: every holder signs, you among them
         / [ 1, holders-rule ]                   ; a holders' rule you accept by signing (rule 99, query key 1)
         / [ 9, why ]                            ; the model not held, or "by whom" not declared (section 7, item 7.4)
```

*Rule 98.2: an issuance is a reduction of every holder's share, and counts only under a holders' rule the holder accepted, by signing a version carrying it or by buying under it. That is exactly the consent this reading exists to make visible.*

3.3. **Who may end your place** (kind 3). The defaults by kind (Agreements, "Termination"), and the termination terms where named (terms field 36; publication field 13):

```cddl
end-place = {
  0 => who,                  ; who may end your place by default: a publication's owners' side alone, at once, for a
                             ; partner, service, backup or measurer; every party in a deal, you among them
  1 => termination,          ; what the termination terms add, or [ 0 ] none named
}
termination = [ 0 ]                              ; none named: the default stands
            / [ 1, cmip: hash, declared ]        ; termination terms (task 15)
declared = [ 9, why ]                            ; (waits on the core: section 7, item 7.2)
```

3.4. **Who may change the rules without you** (kind 4). A deal: `[3]` (rule 47). A collective: its constitutional change rule (field 18; absent, every party), with `you` marked where you are among those it counts; the judicial tier, `[3]` (rule 67). A publication: who signs a later version that is not a terminating act, `[3]`; who signs a terminating one, as 3.3.

```cddl
rules-change = { 0 => who, 1 => bool }           ; the constitutional or clone rule; you among those it counts
```

3.5. **What one member may do alone** (kind 5), a collective only, **Money first**, then Agreements, Development, Envelopes, Text (mechanic, this draft's: the order). For each layer, its rule (field 19); and for each area the control model gives (query key 0) whose number lets fewer act than the layer's rule, the area, its holders and its number.

```cddl
alone = [+ [ layer: uint, layer-rule, areas: [* [ area: uint, holders: [+ hash], number: uint ]] / [ 9, why ] ]]
```

*From today's "before a party signs a founding, its client shows, layer by layer, what the rule lets one member do alone, Money first" (rule 60) and rule 98.5's "the founders' choice, which the client shows before they sign, Money first". A collective of two artists should not find that either can point its income at themselves because they never thought about it.*

3.6. **What a succession plan gives** (kind 6). For each succession plan the terms carry (field 16): whose plan it is, its stake successors and shares, its seat successors, and where it lets one identity hold two seats or act alone in a layer (from 3.5's rules applied to the parties after the plan). *From rule 83's "before a party signs a succession plan, its client shows what each successor would hold after it".*

### What binds you

3.7. **What you owe** (kind 7). Each obligation the client holds whose field 4 names this agreement or publication and whose debtor is you: its creditor, amount, unit, and whether a condition cMIP decides it (task 9, by hash). Marked as found: `[ found: [* obligation], 0 ]`, the trailing 0 meaning "the ones this client holds". An obligation in the terms of a party who has not signed is shown as unsigned, never as open (Agreements rule 1). *What the terms' words promise in prose is not data: the face's key 5 says the words were not read, and Agreements rule 4 shows them.*

3.8. **How you get out of it** (kind 8), from your place: a deal: no termination alone (`[3]`), your own way out your transfer; a publication's partner, service or backup: as 3.3, and termination terms where they widen who may terminate; a collective's member: resignation, alone. With termination terms named, their declaration (section 7, item 7.2), including a minimum term and a notice, each marked checkable only where the terminating act names a block or cites an anchor (Agreements, "Termination", F438.3).

3.9. **Until when a refund is claimable** (kind 9): refund terms (terms field 17; publication field 8), the point and its time reference; absent, "no lapse set" (`[ 0 ]`).

### Where the money goes

3.10. **The split, as numbers** (kind 10). From the publication's split plan (field 4) and partners (field 2): each partner's share and the path of its label; each role share and metric share (with its Module and measurer); the owners' line, as what is left; and, for the reader, their own part of each payment, in millionths, by every route that reaches them (a partner share, a role, the owners' line by their share of the stake).

3.11. **A worked example** (kind 11): the split cMIP's payouts on one payment of an amount the client chooses and shows as an example, never an expectation (Development rule 13: "on a sale of 10, this publication pays…"). `[ amount, [+ [ receiver: hash, amount ]] ]`, computed by the split cMIP (task 8) where the client holds it; otherwise `[ 9, [0, hash] ]`. *Arithmetic on a stated amount is the Apply operation, not a forecast: no number of sales is ever assumed.*

3.12. **Where an unfilled share goes** (kind 12): plan key 3 (`[0]` to the owners' line, the default; `[1]` held open; `[2, party]`).

3.13. **Fees** (kind 13): each fee's Module, part and scope (plan key 9); who bears rail fees (key 5); the maximum fee per payout (key 6), or `[ 0 ]` **none: any fee may come off a receiver's payout** (rule 25's flag).

3.14. **Who holds the money** (kind 14): the split service (field 3) and its backups in order (field 11), and the identity designated to sign price tags (field 10).

3.15. **Where the money goes if a promise fails** (kind 15): for a publication selling a vow, its refund terms (3.9) and the refund's destination. `[ 9, [2, 5] ]` until the core says where a broken vow's refund waits (section 7, item 7.5).

### Who judges and keeps

3.16. **Keepers** (kind 16): the keeper operators and the rule for what counts as recorded (terms field 3); for a lone seller's publication, `[ 0 ]` none, so its deadlines can be shown met by anchors but never missed (Agreements, publication format).

3.17. **Who may read sealed content to judge it** (kind 17): the arbitrators or verifiers named (terms field 13), who receive keys to judge content. *Placed here and not under "without your signature" (mechanic, this draft's); the report asks whether it should move up.*

3.18. **The chain of judgment** (kind 18): for each judge, those that take over, in order, with their periods (field 21); and the judge of forks (field 27), or none.

3.19. **The time reference** (kind 19): its cMIP and parameters (field 6), by hash; whether this client holds it.

### Who is who

3.20. **The parties, and your place** (kind 20): each party (field 0), with seats where a party holds two; your place: party, holder, both, or neither yet (a buyer about to step in); for a collective, the departed members entry (field 22).

3.21. **Which cMIPs decide anything** (kind 21): every specification the inputs name, by task: terms field 2, 6, 35, 36, field 9 key 3, extensions (field 15); publication field 9, 13; plan key 1, each metric's Module, each fee's Module. Each as `[ task: uint / null, hash, creator: hash / null, held: bool ]`, the creator read from its specification where the client holds it (Development rule 13: "the specification's creator and enough of its hash to tell it apart").

3.22. **What this version changes** (kind 22), for a clone: the terms fields whose value differs from the parent's, ascending; and the mark (field 4), the change rules claimed and who signed under each. The other facts carry `changed` (2.1).

## 4. The order, plainest danger first

4.1. A client shows a reading in this order: **the face; then the facts "without your signature" (3.1 to 3.6); then what you can always do (section 5); then what binds you (3.7 to 3.9); then where the money goes (3.10 to 3.15); then who judges and keeps (3.16 to 3.19); then who is who (3.20 to 3.22).** For a clone, kind 22 comes directly after the face, so that a person signing a change sees first what changes. **(mechanic, this draft's)**

4.2. **Within "without your signature"**, the order is fixed: absence, your share, your place, the rules, one member alone, succession. *Absence comes first because the person this order is written for (who reads literally, does not negotiate, does not see the trap nobody names, and needs to leave without a confrontation) is the person an abandonment clause removes: "a person who withdraws to avoid a conflict, and does not know to sign a liveness act" (Fable, fresh eyes, section 5).*

4.3. **Within a fact**, values are ordered so that what one identity may do alone comes first, then a threshold of some, then every party; and `[0]` (no proof) before any proof.

4.4. **The order is fixed by kind and by value, never by the reader's judgment of the terms.** No fact is promoted because these terms seem worse than others; no fact is demoted because they seem usual. *This is the line between an order and a score. "Plainest danger first" is decided once, here, for every reading, by what each kind of fact can do to a person who did not sign it; it never weighs one agreement against another.*

4.5. **What you can always do comes directly after the dangers**, so that each danger is seen beside the way out that no term reaches.

4.6. A client may show the reading across several screens, in this order. It may not reorder it, hide a fact behind another's screen without showing that more follow, or show a later fact before an earlier one. **(mechanic, this draft's)**

## 5. What you can always do

5.1. Every reading carries, in key 2, what the reader can always do from their place, whatever these terms say, each with the rule that keeps it. **(mechanic, this draft's: the list and its codes.)**

```cddl
always = [ 0, rule: uint ]   ; leave the collective by resignation, alone, with nobody's permission (Agreements rule 70)
       / [ 1, rule: uint ]   ; transfer your own share to a buyer, without the others' permission (rule 10)
       / [ 2, rule: uint ]   ; be shown any declaration of absence naming you, and contest it (rule 88)
       / [ 3 ]               ; keep everything owed to you and placed before your place ends ("Termination", "What stands")
       / [ 4 ]               ; change your homes and keys by your own rotation (Identity), taking your identity elsewhere
       / [ 5, rule: uint ]   ; with the other owners, each signing for themselves, release the work to the public domain (rule 55)
```

5.2. Which apply: 0 to a collective's member; 1 to a holder or a buyer of a stake; 2 to a party any abandonment clause reaches; 3 and 4 to every reader; 5 to an owner. Never empty: 3 and 4 always apply.

5.3. **None of these waits on any reading.** A client never makes a resignation, a transfer of one's own share, a contest, a rotation or a release wait for, depend on, or carry a reading (section 6).

## 6. Before a way-out act

6.1. A reading is never a condition of a way-out act: a resignation, a transfer of one's own share, a contest, a rotation, a release. A client never blocks one, delays one, or asks for anything to be read before it.

6.2. **(waits on a decision, section 7, item 7.6)** Today's Agreements carries two warnings before a resignation (rule 70): "the last voice" and "the last constitutional voice", each in plain words, each never blocking. They are not before a signature that binds a person to terms, so the decided client sentence does not reach them. This draft offers them as a **notice**, which a client MAY show before a resignation and never waits on:

```cddl
notice = [ 0 ]               ; you are the last voice that remains: the collective's works freeze as they stand
       / [ 1 ]               ; you are the last constitutional voice: nobody will be able to change its rules again;
                             ; the other members keep acting in their areas
```

*The person leaving without a confrontation should not find, afterwards, that leaving froze the work of everyone they left. The sign at the entry of a danger zone, never a gate.*

## 7. Where it waits on the core

Each item names a fact this reading cannot yet give, and what it needs. Until then, the fact reads `[ 9, why ]` (2.1), shown at its place.

7.1. **The task row itself.** Development's task table has no task 16, terms reading, and no rule that an agreement naming a client-chosen cMIP names nothing (1.1). *Needed before the freeze (Fable, section 7: what a task produces and which tasks exist cannot change afterwards).*

7.2. **Termination terms' declaration (task 15)** (facts 3.3, 3.8): for each place, may its holder terminate alone: yes; after a point on the time reference; never (a veto); and what the terms add: a notice, a minimum term, a payment owed and to whom, a signature required. Today's text has a client show "the cMIP's own declared summary", but no format for one.

7.3. **Absence proof's declaration (task 14)** (fact 3.1): which acts of the party break absence, for how long, on which time reference.

7.4. **The control model's issuance answer** (fact 3.2): whether a stake may be issued without each holder's signature, and by whom. The query's key 1 gives each stake's holders' rule; it does not say who may make the offer.

7.5. **Where a broken vow's refund goes** (fact 3.15): the fourth destination asked for in `fable-after-the-rehearsal.md` and reached by five players in the first rehearsal; not decided.

7.6. **The warnings before a resignation** (section 6.2): whether they stay in the core as client conformance, move here as a notice a client may show, or go. *A question for Nobody, allegedly.*

7.7. **The client sentence's "names that cMIP"**: how a client names a terms-reading cMIP on screen, by creator and enough of its hash, is Development rule 13's for signing what a rule computes; this draft assumes the same.

## 8. Its own face

8.1. **Every reading says of itself that it is a summary, not the terms** (face key 3), and a client shows that on every screen that shows any part of it, in the reader's language. *As the Creative Commons deed says of itself: "This deed highlights only some of the key features and terms of the actual license. It is not a license and has no legal value."*

8.2. Rendered in English (an example, not a requirement): **"A summary of what these terms let others do, and what you can always do. It is not the terms: the terms are what you sign. It does not say whether to sign."**

8.3. The face names this cMIP by creator and enough of its hash (7.7), and the act read by enough of its id, so that the person, or anyone they show it to, can compute the same reading from the same bytes.

## 9. What it never says

9.1. A reading never carries, and a client following this cMIP never shows as part of it:

- **a forecast**: what you will earn, how many will buy, a share's value, a scenario;
- **a judgment**: fair, usual, unusual, risky, safe, recommended, a score, a colour that grades;
- **anything about the other party**: reputation, history, how many others signed, who they are beyond their identity hash and display name;
- **a comparison** with other agreements, with a template, with "what most people sign";
- **a paraphrase of the terms' words** (field 1), or of a cMIP's description;
- **advice**: sign, do not sign, negotiate, ask for.

9.2. *Fable's line, which is the core's own: what arithmetic settles is in; what it does not is left in view and unsummarised. A facts list that forecasts is the investment key-information document with its performance scenarios, which had to be rewritten.*

9.3. **A reading is never evidence that it was shown.** Nothing in it is signed, and no act carries its hash (F441: "the summary's hash in the signature, not at all"). A client never writes, publishes or seals a reading, or a record of having shown one, into any act. *A committed summary would read as consent the signer can never rebut.*

## 10. Reasoning

10.1. *Why facts and not prose: so that any client renders them in any language, a second client or an association can recompute them from the same bytes, and a translation can be checked against data rather than against another translation.*

10.2. *Why a fixed order: a reader who does not negotiate reads from the top and stops. What can be done to them without their signature is what they cannot undo by reading further.*

10.3. *Why "every fact shown": the stranger's reader "does not see the trap nobody names". A list that shows only what is dangerous asks them to trust the list's notion of danger; a list that always shows the same kinds, safe or not, lets them see the shape of every agreement the same way.*

10.4. *Why the way out sits beside the dangers: "Leaving is one act, alone, with no permission and no meeting" (fresh eyes, section 5) is the single most important protection for this person, and it is the one a person frightened by the list above it most needs to see next.*

## 11. Open parameters

- the kind numbers, value shapes and `always` codes (all mechanics of this draft);
- the order of layers in 3.5 after Money;
- whether 3.17 (who may read sealed content) belongs under "without your signature";
- whether grants (type 9) are a signature this cMIP reads for (1.3);
- the amount a client uses for 3.11's example.

## 12. To attack

*For the second rehearsal's players. Each is a place this draft may be wrong.*

- An agreement whose most dangerous fact sits below a screen's fold under this order.
- A fact this list does not have that decides a signer's fate (the report names the ones found so far).
- A value shape that a hostile drafter can make read as safe while it is not.
- An agreement where "every fact shown" buries the one that matters.
- A reading that two clients holding the same inputs produce differently.
- A way to make this reading, or its absence, count as consent.
