# Stranger's reading: Agreements draft 17

*A subagent read `spec/MIR-agreements-draft-17.md` with access only to the core texts (the MICS and the suite as v29). Its lists, condensed; what the session did in brackets: **[fixed]**, **[Q]**, **[gap]**, **[as designed]**, **[other text]**.*

## 1. Rules it could not understand or check

**Keepers and the keeper record**
- Rule 42's third condition: a record counts only from a keeper named by "an agreement the act's `objects` names"; rotations, founding terms, Money receipts (their claim is in field 9), work claims and posts name none, so their records could never count. [Q 37: the condition predates this draft; widening it could change verdicts]
- The record names no agreement, so "for that purpose" is computed from the act, not the record. [Q 37]
- Rule 38's "any one, a threshold, or all" against the `rule` codes in the `keepers` format; how "recorded before the rotation" combines under a threshold. [Q 38]
- The keeper's sequence: an operator with two devices has two sequences, unordered; must keeper records stand in a sequence of their own? [Q 25]
- Rule 33: an anchor shows an act existed by a point; how "an anchor of the act itself" shows a deadline missed. [Q 39: written as decided; the mechanism for an act's own anchor is unstated]
- "Valid as an act" (rule 42) undefined: format and signature, or Identity's status? [gap]
- Rule 40 "keepers check homes" is not checkable by a verifier and not marked conformance. [gap]
- A deal with no keeper: a declaration's line, and "every signature act ... counts as made after it". [Q 40]
- Point 5's "never a grantee's act" against rule 76's keeper record before a revocation; which keepers count for a revocation. [Q 24]
- "A keeper's record that a version's completeness relies on" listed among what a line places, though that is a deal's. [gap]
- Release field 4 named `keeper` but no keeper. [gap: wire name, unchanged]
- A keeper's operator as a judge: of what question. [gap]
- The MICS and suite's "an anchor or keeper" against rule 33. [other text: MICS v30 and suite v30 say anchors only]

**Rule 76 beside Identity rule 34** [Q 24]
- The tie rule, rule 79, point 2, point 5 and two freeze scenarios state void without rule 76's exception, or say "may be shown disputed".
- Only a revocation gets the exception, not a departure emptying an area, a fork or a closing.
- What "valid and shown as disputed" confers: does it bind, must a fork hand it out, does it block a closing (the MICS calls disputed a display).
- An Identity witness act counts as acknowledgement here, while Identity's everyday acts "count for nothing in Agreements".
- An act signed after the revocation saved by an accomplice's acknowledgement: the stated cost does not say so outright.

**Member keys and a grant to oneself** [Q 20 and Q 41]
- A member key's grant is the founding or clone, which carries no scope, limits or expiry; "holder" (area or stake); deals.
- How a member key is removed (revocation names a grant; here the grant is the version).
- Which areas count: those the naming version gives, or those in force for the act.
- "Counts from the moment the founding or clone is complete" against rule 72's record putting a clone in force.
- The agreement in force for a member-key act (its binding is a signature act, not a chain act).
- A later version on a forked line; the member rotating and disowning the installing signature; resignation.
- A grant to oneself: whether type 1 acceptance is still needed; for a collective granting to itself.

**"Only acts valid in their own format count"** [Q 42]
- Against delivery, use and metric records (cMIP acts) "no verifier needs telling which specification defines it".
- Transfer field 3 "at most what the seller still holds" as a format rule against an over-sale being valid and owing a refund.
- Format validity against status validity.

**Made before, made after** [gap, listed in the report]
- What a line is (records and rotations; also forks and closings; decisions including genesis).
- Point 4 restricted to acts the key holders also signed, then listing single-signer acts.
- "Keepers named by the agreement in force for the line" for a rotation (before or after it).
- Point 1 and point 5's keeper exception; position and running summary proof needing whole lines.
- A grantee's acceptance "placed as a member's signature is".

**Other** [gap unless marked]
- Abandonment outcomes against a holder who is no party with a named stake successor stated three ways (outcome 0 alone; never outcome 0; none). [Q 43]
- Areas over Identity: "governs rotations and key events" against "genesis and rotations never in an area's reach". [Q 43]
- Judicial tasks 9, 10, 11 in three places, with 14 in others. [Q 43]
- Fork completeness lists no check of non-member holders' chain signatures. [Q 43]
- Record field 3: take-ups in the CDDL comment, not in the prose list. [Q 43]
- Time reference answers "a fact the caller states"; task 10 takes a point and an act; how a request is placed on the time reference; "undetermined is a purchase" against "no payment is undetermined".
- Ties ordered "by the hash of the fork act with each side" not defined.
- Rule 70's split service tied to no area, "still to be checked". [Q 29]
- The notice's reply has no format.
- "Holds nothing" on the latest versions held. [Q 30]
- A plan naming the collective off the top invalid "where the collective declares no vault": judged at which point.
- Grant-key acts judged at "the latest link of the collective's identity chain": rule 72's records.
- "A grant survives the collective's rotations" against a person's grant void at a rotation that does not keep it, and rule 93.
- A person's revocation "cites the collective's chain".
- The formats allowed to cite the collective's chain omit grants, revocations, transfers, offers, splits, issuance offers and notices.
- The field tiers table omits fields 26 and 27; field 28 against `field-ref`'s comment.
- "Closed by clone" and "redirected" (Money) not defined here.
- "Reinstated by cloning" a grant.

## 2. Terms used two ways

pending (several states, and "unrecorded" in the freeze scenarios); disputed and dispute; void; valid (five senses); invalid, refused, rejected, "no X"; unknown; contested; record (keeper record, collective record, negotiation record, delivery and use records); line; chain; layer (MOR's layers, money layers of nesting); decision; act and action; everyday act; grant, grant key, member key, scoped key; keeper; time reference; holder; member; owner. [In the glossary and the report's term question.]

## 3. Cross-references

- "Open technical parameters" [fixed: "Parameters"]; "Open in this draft" [fixed: pointer removed; the open point is Q 27]; "(rules 36, 60)" for prices [fixed: rule 60]; "(rule 74)" for a grant key signing no grant [fixed: rule 73]; "(rule 91)" for how a closing reads a receipt [fixed: "Closing (type 20)"]; "Money field 5" for a claim [fixed: the receipt's field 5, the claim's field 4]; "terms field 21" for the time reference [fixed: field 6, the chain field 21]; "(rule 33, a notice's deadline)" [fixed]; "(rule 11)" for the vault limit [as designed: Agreements rule 11 says it]; "clause key 2" [fixed: retired key no longer named]; "Development, table of tasks" [fixed]; Identity "Scoped keys" [as designed: Identity rule 8's title]; the MICS's "Agreements glossary" [other text: the MICS says "as the Agreements MIR uses them"]; Money's "as rule 7 says" [as designed: Money rule 7].
- Pointers outside the texts: the relay transport, live media and provenance cMIPs, FROST [as designed: named by role or as the external standard]; "(Flaws E and F)" [fixed]; test identities' names in the freeze scenarios [as designed: they resolve in the suite].

## 4. History left

"To confirm" readings [Q 26]; "mechanics" [fixed: "rare cases"]; change language ("Rule 7 is unchanged", "No new field", "format is unchanged", "no new format", "no change of format", "for now", "may now do", "as before") [fixed]; "were refused" [fixed]; other past-tense reasoning ("was the cost", "kept the collective from ever closing", the time checks "tried") [kept: reasoning, in italics]; the concurrency rule [fixed: its vocabulary entry a retired line]; `[ 1, work ]` "not defined" [Q 27]; "still to be checked" [Q 29]; quotes read as the author's [fixed: written as plain commentary]; a doubled comma [fixed].
