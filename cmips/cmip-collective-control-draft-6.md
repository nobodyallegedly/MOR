# cMIP: A collective's control

*Draft 6, 6 November 2026, for Nobody, allegedly, to approve: draft 5 naming the Agreements MIR draft 23, no rule of its own changed. Draft 5: draft 4 with two pointers aligned to the Agreements MIR (draft 22): a model's answer that reaches what it may never decide is overreaching, and rule 67 is the core's. Draft 4: draft 3 with each rule said once, no meaning changed. Draft 3: its query answer's key 2, empty; draft 2: its answers in Agreements rule 99's format, its own acts (types 26 to 28) under its own specification, a clone with constitutional and operational changes, and an area's holders read after a removal or a succession. **Experimental, not approved.** The default control model (Agreements rule 99): today's models of deciding in a collective, moved out of the Agreements MIR unchanged in substance, as this cMIP's terms and parameters.*

*Founding cMIP, EXPERIMENTAL. Not approved, not a product; test identities only until MOR is frozen.* Written against the Agreements MIR draft 23 (rules 45, 46, 48, 60, 65, 98 and 99; terms field 35).

*Reading this document: normal text is the specification. Italic text is commentary. Where a rule below cites "rule N" with no MIR named, N is this cMIP's rule where this cMIP has one (rules 62 to 64, 66 to 68, 94 to 97), and the Agreements MIR's otherwise.*

## For the Dubsar Suite

*A handover, written by the core session that moved these models out of the core. By Nobody, allegedly's decision, the MOR Law Firm team under the Dubsar Suite lead owns this cMIP once merged; the core session made the first move only.*

- *What it is:* the rules the Agreements MIR draft 17 held as tiers (rules 62 to 64, 66 to 68; rule 67, the judicial tier, has since returned to the core, Agreements rule 67, and this cMIP's rule 67 is a pointer to it), areas finer than a layer (rule 60's area part; terms field 34, with field 20's words), the owners' matters, the holders' rule by share, issuance with pre-emption and proxies (rules 94 to 97), each moved here verbatim, save that a field these rules read from the terms is now a parameter of the same number (section 2), and the issuance offer and proxies (types 26 to 28) are this cMIP's acts, under its own specification (section 7).
- *What stayed in the core, as guarantees this cMIP meets:* Agreements rule 98's. Counting a power (rule 65) stays the core's: this cMIP names powers, the core counts them.
- *What it must never do* (Agreements rule 99): decide anything in Agreements' parts two and three, or the last resort. An answer of it that did would be overreaching for every verifier, and set aside (Agreements rule 99).
- *Open for its lead:* the questions in `docs/s7m-report.md`; its code is the crate `cmips/control` (see that report for how far the code moved).

## In plain words

*A collective's constitution says who is in, how its rules change and who acts in each layer. This cMIP adds what most collectives have used so far: every field of the terms belongs to a tier, and a change needs the power that owns its tier; some members may hold an area of the collective's acts and decide there alone; the judicial clauses change only with every member; owners who are not members can agree together, by share, on what hits them all alike, take part first in any issuance, and hand their vote to a proxy. A collective that names this cMIP in its terms (Agreements field 35) works exactly as a collective worked before control models were handed out.*

## 1. What it fills

This cMIP is a control model (Agreements rule 99). A collective names it in its terms' field 35 as `[ this cMIP's hash, params ]`. It answers the task as rule 99 asks:

- **for a clone making no constitutional change** (Agreements rule 98, which alone judges one), the powers it needs are those rule 64 gives, each counted as Agreements rule 65 counts it among the parties, an area's holders or a stake's holders this cMIP names; and, for a change that is an owners' matter (rule 95), whether the stake's holders' rule stands in for each holder's signature (rule 94);
- **for an act for the collective**, whether an area reaches it (section 3; Agreements rule 60), and then that area's holders and its number;
- **refused** where the parameters are outside section 2's format, or the clone or act breaks a rule below that makes it invalid; **unknown** where a check it needs reads an act or a fact the verifier does not hold.

Each answer is in Agreements rule 99's format (`answer`, `query-answer`): for an act, `[0, [1, area]]` where an area reaches it, `[0, [0]]` otherwise; for a clone, `[1, clone-answer]`, its powers each counted among the parties, an area's holders or a stake's holders this cMIP names, by the rule this cMIP gives; refused, `[2, reason]`; unknown, `[3]`. Its query answer gives its areas (key 0) and holders' rules (key 1), and **no power by share for any act type: key 2 is empty**, every act counting under its layer's rule or one of its areas. An answer of this cMIP that a verifier finds overreaching (Agreements rule 99) is set aside like any other's.

It decides nothing Agreements rule 98 or rule 99 keeps for the core: where a rule below seems to, the core's rule decides. **Every rule below that speaks of a constitutional field or of the judicial tier is a pointer to Agreements rules 98 and 67**: such a change needs the constitutional change rule, `[0]`, and, for the judicial tier, the judicial tier's rule, `[4]`; this cMIP names no power for it and adds none.

## 2. Parameters

The parameters are a map. Each key keeps the number the terms field it replaces had, so "field 34" in a rule below reads "parameter 34".

```cddl
control-params = {
  ? 20 => { + uint => tstr },  ; each area's own words, as canonical text, by area id (only with parameter 34)
  ? 30 => [+ [ stake: uint, holders-rule, ? waived: true ]],
                               ; the holders' rules: per stake, by its index (0, the one stake), how its holders
                               ; consent together to the owners' matters; ascending by stake, none twice; a stake
                               ; not listed: every holder (rules 94, 95); `true` third: a standing waiver of
                               ; pre-emption on that stake (rule 96)
  ? 32 => hash / [ 0 ],        ; issues under: in a clone that is an issuance, the issuance offer (type 26) it
                               ; follows (rule 96); `[0]`, no offer, under the stake's standing waiver (parameter 30)
  ? 34 => [+ area]             ; areas finer than a layer, powers of members
}

area = {
  0 => tstr,                ; its name, as canonical text, shown before signing
  1 => [* hash],            ; holders: parties; empty only in a clone, the area then standing frozen
  2 => uint,                ; how many of the holders decide together: at least 1, and at most the number of holders,
                            ; except in a clone that keeps the number the parent's entry for that area has, which
                            ; may then exceed the holders, counted as rule 65 says
  ? 3 => [+ kind],          ; the acts for the collective it reaches, each by act type
  ? 4 => [+ field-ref],     ; the operational fields of the terms it reaches
  5 => uint,                ; its id: permanent, unique among the agreement's areas, never reused
  ? 6 => [ cmip: hash, any ] ; a cMIP judging limits on its holders' acts, and its parameters
                            ; (rule 60)
}                           ; an area reaches at least one act kind or one field; it is identified by its id, never
                            ; by its place in parameter 34
kind = [ 0, layer: uint ]                 ; every act of this layer ("Layer"): 1 Text, 2 Envelopes, 3 Money,
                                          ; 4 Agreements, 5 Development; in a grant's field 6 only (an area
                                          ; reaches act types, a layer's rule the whole layer)
     / [ 1, spec: hash, type: uint ]      ; every act of this type in this specification
field-ref = [ 0, field: uint ]            ; a whole operational field: none remains in MOR 1 (7, the stake,
                                          ; changes only as Agreements rule 98.2 says; 17 is constitutional)
          / [ 1, task: uint ]             ; one entry of field 2: the cMIP for this task, where the task is operational

```

`holders-rule` is the Agreements MIR's ("Terms (type 0)"); `kind` and `field-ref` are this cMIP's, above ("Terms (type 0)"). Parameters outside this format make every act and clone of the collective **refused** under this cMIP.

**The holders' rules** (parameter 30) appear only in terms carrying a key grammar: terms of a deal carrying parameter 30 are invalid. A holder is as the Agreements MIR's "Terms (type 0)" says. **The holders' rule every holder, `[0]` or no entry, means each holder, a collective counting once, and reads the same declared as by default**: each holder who is no member of the agreement in force signs, a member of the collective whose terms these are consenting through its own constitution (rules 48, 94). *Elsewhere, "every holder of the stake signs" (a change of parameter 30, of the release rule, of a waiver) means each holder by its own signature, members included, a collective once.* Each entry names the stake the terms' field 7 defines, index 0, once; a rule by share has its share above zero and at most 1,000,000. An entry may carry a standing waiver of pre-emption, `true` as its third element (rule 96), and parameter 32 written `[0]` is valid only where the parent's entry for the stake issued carries it. A clone whose entry for a stake differs from its parent's is a draft until every holder of that stake signs it (rule 45). **Parameter 32** appears only in a collective's clone, which is then an issuance and is judged as rule 96 says.

**An area's holders are distinct; in founding terms, parties.** In a clone, a holder who is no party of its terms is read out of the area: the area's holders are those of its list who are parties, and a list left with none stands frozen (rule 71). So a removal or a succession may leave these parameters as they are (Agreements rules 69, 83). *A clone that takes a party out of field 0 takes it out of every area's holders too, and founding terms never list an area without holders. A clone that takes a holder off an area need not lower its number: a number left above the holders that remain is met by all of them (rule 65), and the refit sets it again. A clone that changes an area's number sets it within its holders.*

**Areas** (parameter 34) appear only in terms that carry a key grammar (field 12) (scope). Area words (parameter 20) appear only for an area that exists. An area's kinds are act types, `[1, spec, type]`, never a whole layer: that is the layer's rule.

**No two areas reach the same act or the same field.** Two kinds overlap when some act could belong to both, as computed from the six MIR hashes and the terms' own fields 2 and 15 ("Layer"). So:

- two `[1, spec, type]` kinds overlap where they name the same type of the same specification;
- an area whose field references name a task overlaps another area naming the same task.

A field reference names an operational field or task ("Tiers").

Genesis and rotations are never in an area's reach: the key grammar governs them. Nor are records (type 17), which any member draws. An area whose kind names a genesis or a rotation (Identity's chain acts) or a record is invalid, never read as reaching nothing.

Terms breaking any of these are invalid.

**An area is followed by its id.** The ids of an agreement's areas (area key 5) are distinct. An area of a clone is the parent's area with the same id, wherever it sits in parameter 34. Grants (field 5), area words (parameter 20), steppings down (resignation field 1), marks (`[2, area]`) and a refit (rule 71) name an area by its id. A clone may drop an area, and adds one only under an id that no earlier version of the agreement, back to its founding terms, gave to an area. Terms breaking either are invalid. *An area keeps its id through any redraw, so removing or reordering areas never moves a grant, words or a refit onto another area.*

## 3. Areas within a layer

**An area's limits are a cMIP's.** An area may name a cMIP judging limits on its holders' acts, with its parameters (area key 6). It adds to this rule, never relaxes it: the act counts at the area's number only where the cMIP judges it within them, and as that cMIP asks beyond them. A verifier that does not hold the cMIP, or holds no verdict of it for the act, answers unknown for the area, and the act does not count there. *Capping an area is left to cMIPs; what the core keeps is this rule. A limits cMIP may add a second signature and make the first conditional: within its cap, the area's number; above it, one more holder's signature.*

*Layers and areas are one construct at two grains: a rule for a whole layer, named at founding for every layer; an area that narrows it for single act types or operational fields, held by some members, with one set of rules for holding it, granting within it and changing it.*

## 4. Words

- **Holders' rule.** For a stake of a collective, how its holders consent together to the owners' matters: every holder (the default), or owners holding together at least a stated share of the stake. It reaches only changes that hit every owner of the stake alike, binds only holders who accepted it by signing or buying, and changes only with every holder (rule 94, terms parameter 30). The release rule (field 24) is its first instance.
- **Owners' matters.** What a stake's owners consent to by their holders' rule, or each signing: what the stake is paid, an issuance in it, a collective's sale or release of a share it holds in a work, and a fork's successors' founding terms paying a kept holder less (rule 95).
- **Issuance.** A version adding new holders to a stake, every existing share scaled by the same factor, decided by the holders' rule and pre-emptive: each existing holder first offered its proportion on the same terms by an issuance offer (this cMIP's type 26), waived only by every holder (rule 96).
- **Proxy.** A holder's act handing its vote on the owners' matters of one stake to another identity, for one version or until revoked; never its money or property, nor anything needing every holder (rule 97, type 27).
- **Tier.** In a collective's founding agreement and its clones, each field of the terms belongs to one of three tiers ("Tiers"):
  - Constitutional: who decides. The parties (membership), the change rules, the key grammar, the layer rules and the areas, the constitution's words, the departed members entry.
  - Judicial: who judges, and by what. The protected clauses, changed only with every member's signature (rule 67).
  - Operational: everything else.

  Deals have no tiers (scope).
- **Protected clause.** In a collective, a clause that can move a party's stake or voice, or decide who wins a dispute. The protected clauses are: the abandonment clause, the succession plan, the keepers, the time reference, the arbitrators or verifiers, the condition and anchoring cMIPs, and the chain of judgment; and, outside the terms, the collective's own split agreement, which names the service that receives its income (rule 15).
  Together they are the judicial tier, which changes only with every member's signature, one version for everyone (rule 67). The collective's split agreement is operational in kind, and protected as a stated exception, since it can move money. A deal needs no protected clauses: no clone of it completes without every party.
- **Change rules.** The rules a collective's clone must meet, each covering part of the terms:
  - the **constitutional change rule** (terms field 18; every party when none was agreed);
  - the **judicial tier's rule**: every party whose voice remains, fixed by this MIR and never by the terms (rule 67);
  - the **clone rule** (field 5), for operational matters outside every layer rule and area;
  - the **rule of each layer** (field 19), for the cMIPs the collective adopts for that layer's tasks;
  - the **power** over each area.

  In a deal, the signing rule and the clone rule are every party.
- **Area.** A part of a collective's acts or operational fields, finer than a layer, that the constitution gives to some of its members, the area's **holders** (terms parameter 34). An area covers acts of the collective by act type, `[1, spec, type]`, within a layer, and operational fields of its terms; it narrows the layer's rule for the acts it reaches.
  - Its holders alone decide there, and may grant within it.
  - Its holders, and the rule they act by, change only by a constitutional change; a holder may step down from it at once (rule 71).
  - An area with no holder whose voice remains stands frozen; a clone may list none at all.

## 5. Tiers and clones

*Nobody loses their say by default. Each part of a collective's agreement is changed by the power that owns it. Which power that is follows mechanically from the fields a clone changes, so every verifier reaches the same answer and the mark (rule 46) can be checked.*

**Tiers and areas apply to collectives only** (scope): to a founding agreement carrying a key grammar, and its clones. A deal has none: every clone of it needs every party (rule 47).

*Deals stay as simple as possible while remaining rich; collectives are for when things get complicated. Two people who end up doing many deals together can found a collective.*

#### Rule 62. Every field belongs to one tier

Every field belongs to one tier. In the table, "constitutional, the core's" means: changed under the constitutional change rule alone (Agreements rule 98), and "judicial, the core's": changed only with every member whose voice remains (Agreements rule 67); for either, this cMIP names no power.

| Field | Content | Tier |
| --- | --- | --- |
| 0 | Parties | Constitutional, the core's |
| 1 | The words: the constitution's and general words | Constitutional, the core's |
| 2 | cMIPs, per task | Tasks 9 (condition evaluation), 10 (time reference), 11 (anchoring) and 14 (absence proof; its cMIP named in the abandonment clause's key 3): judicial, outside the rule for Agreements. Every other task: operational, under the rule of the task's layer (field 19), or in an area naming the task, and under the rule of each other layer the same specification serves. Task 8 (split) is never named here: it is a publication's. A specification named for a judicial task, or in field 6, is named for no other task and as no extension |
| 3 | Keepers | Judicial, the core's |
| 4 | Signing rule, or a clone's mark | None: each version states its own |
| 5 | Clone rule | Constitutional, the core's |
| 6 | Time reference | Judicial, the core's |
| 7 | The stake: its holders and their shares in the target | None: it changes only by a placed transfer, a succession, an absence outcome or an issuance (Agreements rule 98.2); no area reaches it |
| 8 | *Withdrawn*: once the split plan, now a publication's; never reused | — |
| 9 | Abandonment clause | Judicial, the core's |
| 10 | *Withdrawn*: once the concurrency rule; rule 90's default stands; never reused | — |
| 11 | Parent | None: every clone names its own |
| 12 | Key grammar | Constitutional, the core's |
| 13 | Arbitrators or verifiers | Judicial, the core's |
| 14 | *Withdrawn*: once the split service's grant, now a publication's split service; never reused | — |
| 15 | Extensions | Operational, per extension, added or dropped: under the rule of Development, and of each layer the extension declares in its specification (Development field 10) |
| 16 | Succession plans | Judicial, the core's |
| 17 | Refund terms | Constitutional, the core's |
| 18 | Constitutional change rule | Constitutional, the core's |
| 19 | Layers: who acts for the collective in each of the five layers | Constitutional, the core's |
| 20 | Area words, per area (a parameter of field 35) | Constitutional, the core's |
| 21 | Chain of judgment | Judicial, the core's |
| 22 | Departed members entry | Constitutional, the core's |
| 23 | Forked from | None: founding terms only |
| 24 | Release rule | Constitutional, the core's |
| 25 | *Withdrawn*: once the relays; never reused | — |
| 26 | Settles: the tips a deal's settling version drops | None: a deal's clone only; deals have no tiers |
| 27 | The judge of forks | None: a deal only; deals have no tiers |
| 28 | *Withdrawn*: once the fees, now a publication's split plan's; never reused | — |
| 29 | *Withdrawn*: once the split service's backups, now a publication's; never reused | — |
| 30 | Holders' rules, per stake (a parameter of field 35) | Constitutional, as every parameter, the core's. A stake it names no rule for: every holder signs, the core's default restated (Agreements rule 98.2); a change binds no holder without its signature (Agreements rule 45) |
| 31 | Transfers counted | None: a deal's clone states its own; deals have no tiers |
| 32 | Issues under (a parameter of field 35, per version) | None: each issuance names its own offer; an issuance is a reduction judged by Agreements rule 98.2 under rule 48, never a change of the constitution; this cMIP's rule 96 is its way of collecting that consent |
| 33 | Target: a claim, or the collective itself | None: founding terms set it, and every clone repeats it |
| 34 | Areas, finer than a layer (a parameter of field 35) | Constitutional, the core's |
| 35 | The control model: this cMIP | Constitutional, the core's |

An area's field references (area key 4) name only operational tasks: tasks of field 2 other than 8, 9, 10, 11 and 14 (fields 8, 10, 14, 25, 28 and 29 are withdrawn).

*Field 4 belongs to no tier: in a clone it is a mark of fact, written fresh each time; founding terms are signed by everyone, and the tiers govern only later changes. Who signs what for the collective is its layer rules and its areas, which are constitutional. Each area carries its own words; since they are the control model's parameters, they change only under the constitutional change rule (Agreements rule 98).*

#### Rule 63. What a clone changes

A clone changes a field when the field's deterministic encoding in the clone differs from the parent's, or the field is present in one and absent in the other.

Fields 2, 15, 19 and 20 are compared entry by entry: by task number, by extension, by layer and by area id. Each differing entry (added, removed or replaced) is one change.

Fields 4 and 11 are never compared, nor field 23: a clone never carries it ("Terms"). Nor are fields 31 and parameter 32, which each version states for itself, nor field 33, which a clone repeats; parameter 30 is compared entry by entry, by stake, each differing entry one change.

**A change of field 16 that only takes, for each party the clone takes out of the parties, the seat part of its succession plan (keys 2 and 3), is no change of its own.** This holds where the plan stays for its stake part, or goes where it has none, and every other plan stays as it was. It goes with the removal, as the party's areas do.

Each change is in the tier of its field or entry (rule 62). An operational change lies:
- for an entry of field 2: under the parent's rule for that task's layer, `[6, layer]`; or, where an area of the parent names that task by a field reference, `[1, task]`, in that area instead. Where the specification the clone names for that task is also named in the clone for a task of another layer, it lies under that layer's rule too. A clone naming one specification for a judicial task and for another task is invalid, whatever its mark;
- for an entry of field 15: under the parent's rule for Development, and the rule of each layer that the extension added or dropped declares in its specification (Development, field 10). Dropping an extension needs the same powers as adopting it. A clone naming as an extension a specification it names as a judge is invalid, whatever its mark;
- for an entry of parameter 20: none: a change of the control model's parameters is constitutional, the core's (Agreements rule 98);
- otherwise: in the parent's area whose field references name that field.

Any other operational change lies under no layer's rule and in no area.

#### Rule 64. Which powers a clone needs

1. If any change is constitutional (Agreements rule 98, which alone reads it): the constitutional change rule, `[0]`, and, where some change is also judicial, the judicial tier's rule, `[4]` (Agreements rule 67); and, for the clone's operational changes, the power of each layer's rule and each area 2 gives them (`[6, layer]`, `[2, area]`), never the clone rule (Agreements rule 99).
2. Otherwise:
   - the rule of each layer under which some change lies, `[6, layer]`, one for each such layer;
   - the power of each area in which some change lies, `[2, area]`, one for each such area;
   - the clone rule, `[1]`, if some operational change, or part of one, lies under no layer's rule and in no area, or if the clone changes nothing;
   - (a judicial change: the core's `[4]`, Agreements rule 67; this cMIP names none).

   So a clone that changes an area and something outside every area and layer's rule needs both, its mark naming both.
3. A clone that executes a party's succession plan: Agreements rule 83 (the core's), with no other power; this cMIP names none for it, and leaves its own parameters as they are, reading the departed party out of its areas itself.

4. **A reduction of a share** (an issuance, a sale or release of a work): each member is a holder too, signing it or bound by a holders' rule it accepted, as Agreements rule 98.2 says.
5. **The owners' matters**: where a change is an owners' matter of a stake (rule 95) whose holders' rule is by share (parameter 30), and that rule is how its holders consent, the clone needs that stake's holders' rule, `[5, stake]`, beside the members' powers above, its mark naming it with the holders whose signatures meet it, so that a false claim sinks the clone (rule 46). Where the stake's holders' rule is every holder, declared or by default, its holders who are no members of the agreement in force sign as rule 48 asks, outside the mark, its members consenting through the powers above. *No declared tier is needed: the owners' matters are counted among a stake's holders, not by moving a field among the members' powers.*

A clone needing several powers comes into force only when each is met, all at once or not at all.

*The clone rule does not reach into an area, and one area's holders do not reach into another: an area's power is exclusive, held by its holders or by the narrower rule that governs it. Its holders, and the rule they act by, change only by a constitutional change.*

#### Rule 65. Counting a power (the core's)

Counted as Agreements rule 65 counts a power: this cMIP names, for each power, the parties, the area's holders or the stake's holders it is counted among, and the rule (section 1).

#### Rule 66. Protections still hold

Whatever power brings a clone into force, it cannot:
- reduce a stake without its holder's signature (rule 48), a departed holder's included (rule 68), nor lower what it pays a departed holder without that holder's signature (rule 48), or the stake's holders' rule where that holder accepted one (rule 94);
- nor change the judicial tier without every member (Agreements rule 67); a constitutional change needs the constitutional change rule, and the judicial tier's rule beside it where it also changes the judicial tier (Agreements rules 67, 98).

*Stated cost: by default a member who is present but unwanted cannot be removed; the others can leave, each alone (rule 70), or use the abandonment clause where it applies. A group that wants expulsion writes a constitutional change rule below everyone at founding, where every founder signs it; even then, removal takes the voice, never the stake. A member who dies or vanishes never freezes the constitution: the abandonment clause every collective carries can remove their voice (rule 61).*

#### Rule 67. Protected clauses: the judicial tier

Agreements rule 67 (the core's): the judicial tier, field 2's judicial tasks included, changes only with every member whose voice remains, whatever field 18 says; this cMIP names no power for it and adds none.

#### Rule 68. Departed holders

Collectives only. A collective's departed members entry (terms field 22) records only who left, without voice. Their stake is in the collective's stakes (field 7), which decide what every holder is paid.

**A departed holder has no control and no veto:** it is counted in no change rule, no layer's rule and no area, and the collective's current rules and judges apply to it. Its one signature is on what lowers its own stake or its pay (rule 48), never on anything else. **It is paid, and consulted on the owners' matters** (rules 94, 95): what its stake is paid, an issuance in it, a sale or release of the collective's works, a fork's successors' plans, by the stake's holders' rule where it accepted one, else by its own signature; and it sees the collective's Money acts (rule 57). A constitution may also count it among the holders choosing members (rule 69).

Its stake never shrinks without its signature (rule 48). A clone that lowers its share in field 7, or drops it, is a draft until that holder signs it (rule 45), as for every holder. **Nor is what its stake is paid lowered without it:** a version of the collective's split agreement that pays its stake less, by raising a partner's share or a fee, adding a role or metric share, or changing the split cMIP, is a draft until it signs (rule 48). *This protects what it is paid; it gives it no say in anything else.*

The stake is a share of all the collective's income, not only of what was made while it was a member.

Every term applies equally to every stake, member or departed:
- a term may not treat a departed holder's stake worse than a member's of the same size;
- a fee raised for the departed is raised for the members;
- a fee paid to a service the members own is public. *Client conformance*: a verifier cannot see who owns a service, so the member's client MUST disclose it to the members.

The stakes decide every holder's money (field 7), and every payout matches its stake exactly, every fee alike for every stake ("Split plan and split", rule 27). Equal treatment is what following the stakes with uniform fees produces, not a separate test, and any deviation, either way, breaks the plan. *A member who wants to give income to another transfers part of a stake.*

Unpaid shares stay open debts (Money rule 5) until the holder can receive, for instance after setting up on a new rail the collective chose.

*A person who keeps a stake in a collective accepts having no control over its decisions; one who thinks the collective will not survive has the incentive to sell. The stake defines a share of income. A rail swap is the collective's decision: to get paid, past members accept it and set up accordingly. Equal treatment makes any creative accounting legible, and public.*

## 6. The owners' matters

#### Rule 94. The holders' rule

**A holders' rule per stake.** A collective's terms may say, for each stake they define, how its holders consent together (terms parameter 30). There are two forms only:

- **every holder**: each holder who is no member of the agreement in force signs for itself, as rule 48 asks, a member consenting through the collective's own constitution. This is the default, where parameter 30 says nothing for the stake (the forced default, one of the declared options);
- **owners holding together at least this share of the stake**, in millionths, counted by share.

**It reaches only the changes that hit every owner of the stake alike**: the owners' matters (rule 95). A change that treats one holder of the stake unlike another of the same size, or lowers one holder's share, still needs that holder's own signature, whatever the holders' rule says (rules 8, 48).

**It binds only the holders who accepted it**: by signing a version carrying it (a member, who may later leave; a stake successor, whose stake is born in a clone it signs), or by buying under it (a buyer, who accepts the holders' rule of the version in force where the collective's line placed its transfer, rule 10). A holder it does not bind signs for itself, as rule 48 asks.

**It is changed only by every holder of the stake** (rule 45), as the release rule is (field 24), and a holders' rule is added to a stake only so: the rule binds only those who chose it.

**How it is counted.** The holders' rule is counted among the stake's holders, members and holders who are no members alike, each by its share; the share asked for is of the whole stake, since no holder loses its say on the owners' matters by leaving the membership. A holder whose share is gone for good still counts against the rule until its stake moves (rule 85). The holders whose signatures meet it are named in the clone's mark under `[5, stake]`, and a false mark sinks the clone (rule 46). A proxy may cast a holder's vote as rule 97 says.

**Who holds what at the vote.** For the owners' matters, a transfer counts only where the collective's line placed it (Agreements rule 10). A vote counts **the roster at the line that puts the version in force**: the holders the version in force there and the transfers placed before that line name. **A version of the collective's split agreement**, a publication, is put in force by no line: it counts once every party has signed it, so its own history is its line, the transfers placed there counted, and each holder's signature act naming it, held and valid, its vote. So a seller and a buyer never both count: the line moves the share once. A transfer the line placed that the verifier does not hold leaves the vote **unknown**, never silently short. Money follows transfers as rule 10 says, unchanged: this is a vote, not money.

**A holders' vote registered by the collective's line is kept.** The signature acts completing an owners' matter are named by the record or rotation putting it in force (record field 2), and placed there; a holder's later rotation shows a dispute on the line and changes nothing. Owner votes are signed by signature acts, never by chain key.

**A deal carries no holders' rule.** A deal has no line, so nothing could keep a passed change from unpassing when one holder rotates: the holders' rule is a collective's only, and terms of a deal carrying parameter 30 are invalid. **In a deal, the version carrying an owners' matter names the transfers it counts** (terms field 31), as a settling version names the tips it settles; a transfer it does not name counts nothing toward it, and its seller holds for that version. *Agreements serve simple partnerships; more complex structures need collectives.*

*Stated cost:* *an owner bound by a holders' rule can be paid less without signing, where owners holding enough of the stake agree and the change hits every owner of the stake alike. What it keeps: no singling out (the change hits every owner alike), a vote in proportion to its share, its proportion in any issuance (rule 96), and the exit (rule 10). What it loses: the personal veto, and it bears its share of the majority's judgment. The majority paying a service it owns outside MOR is fixed by no rule, a stated cost judged by reputation (rule 68's disclosure). An owner to whom the veto mattered would not have accepted a rule by share.*

*Stated cost:* *a thief holding a holder's signing key can vote the holder's share once; once the line registers it, the holder's rotation does not undo the vote for the collective. The vote can pass only what hits every holder alike, the thief's victim included, so there is nothing to steal by it but the vote.*

*Stated cost:* *a buyer has no vote until the collective places its transfer; members can delay a hostile buyer's vote by not placing it, visibly, bounded by the next record any member draws.*

*Example: an owner holds 10% of a stake under a 60% rule; owners holding 70% take 5% off the top for a service; the owner voted no. Under every holder the no blocks it; under the rule the owner accepted it passes, and the owner is paid a little less, exactly as every other owner of the stake is.*

#### Rule 95. The owners' matters

**A stake's owners' matters** are the changes its holders consent to by its holders' rule (rule 94), or, where it is every holder, each holder who is no member of the agreement in force by its own signature:

1. **what the stake is paid** by the collective's split agreement (rule 48), the collective's own part off the top among it (rule 22);
2. **an issuance in it** (rule 96);
3. **a collective's transfer (type 4) or release (type 5) of a share it holds in a work**, for the holders of the collective's stake in itself;
4. **a fork's completeness, where a successor's founding terms pay a kept holder less** than the original's agreement in force at the fork's line, for the kept holders of the original's stake in itself (rule 91).

*Every one of them hits every holder of the stake alike, so a holders' rule can reach it (rule 94). The core cannot tell "substantially all" the works from one song, nor a fair price from a token one; what a rule can say is who consents.*

**A sale or release of a share in a work** (3). A transfer or release of a share a collective holds in a work counts only once the owners of the collective's stake in itself who have no say consent: holders of that stake meeting its holders' rule, or, where it is every holder, each holder who is no member of the agreement in force, by a signature act naming the transfer or the release. Those signature acts count where the collective's line placed them (an act of the collective acknowledging them, "Made before, made after", 2), the roster at that line (rule 94), and are kept there. *Without it, the members sell the works for a token sum to a collective of their own, and a departed holder's 25% of all the collective's income is "25% of nothing", unsigned.*

**A fork's successors** (4). A successor's founding terms that pay a kept holder less than the original's, as Agreements rule 91 compares them, complete the fork only once the kept holders consent, as that rule says: under this cMIP, holders of the original's stake in itself meeting its holders' rule, or, where it is every holder, each kept holder paid less, by a signature act naming the successor's founding terms, placed by the original's line. *A chain-key ceremony per kept holder per fork would weigh on passive owners.* *With the same plan the check is met at once; with no kept holders there is nothing to check.*

**The way out against an owner who vanished** is the declaration of absence, which may name a holder who is no party (rule 85): its stake moves to its stake successor, who consents or not, or by outcome 1.

*Stated cost:* *a members' collective with departed holders and no holders' rule waits for their signatures on its sales and releases of works, and on a fork whose successors' plans pay them less, as its fee changes already do. Shared ownership means shared fruits.*

**Prices and publications are no owners' matter** (Agreements rule 48, its stated cost included): the price of what a collective sells, and whether and with whom it publishes, are the collective's business, decided under its rules for each layer (rule 60). Owners who have no say are protected by sight (rule 57) and by the exit (rule 10), never by a vote on prices. *Stated cost:* *the members can price every work at a token price, or at none, or publish it with partners taking most of each sale; publications and price tags are public, so the owners see it, and can leave. A vote on every price is not one owners could cast.*

#### Rule 96. Issuance, with pre-emption

**An issuance is a version of a collective's agreement that adds new holders to one stake and scales every existing holder's share by the same factor**, within rule 9's rounding, so no existing holder's proportion to another changes. It names the issuance offer it follows (terms parameter 32), changes no other stake, and changes no holder of that stake otherwise. It is an owners' matter (rule 95), decided by the stake's holders' rule (rule 94), and, where the stake has none, by every holder of it, members included, as rule 8 asks.

**It is pre-emptive.** Each existing holder of the stake is first offered its own proportion of the new shares, on the same terms as everyone else, by an **issuance offer** (type 26), an act of the collective naming the stake, the size of the issuance, its terms, its new holders and its period. What the existing holders do not take up goes to the new holders the offer names, in its shares.

**The pre-emption is waived only by every holder of the stake**: an issuance every holder signs needs no offer. **The holders may also waive it standing**: a standing waiver in the stake's entry of the holders' rules (parameter 30), set or removed only by every holder of the stake, as the entry is changed (rule 94); a buyer accepts it by buying, as it accepts the holders' rule. Under it an issuance names no offer (parameter 32 written `[0]`), is decided by the stake's holders' rule, and is complete, besides the powers its mark names and that rule, once every new holder it adds signs it. *A standing waiver changed only by every holder is still "only by every holder"; a venture issuing often need not wait out an offer period each time.*

**What the core checks**:

- **the offer reached each holder**: it is public, or sealed to that holder among its recipients (Envelopes, `to`), as a declaration must reach the member it names; where a holder is itself an agreement, it is public (rule 57). **An offer that did not reach a holder starts no period for that holder**;
- **the offer names its period on the agreement's time reference** (terms field 6, or field 2's task 10); terms naming none carry no issuance offer, which counts for nothing under them;
- **the period's lapse is the time reference's answer**, a fact the caller states, as for every time reference (rule 33): the core reads no clock.

**The issuance is complete** (rule 45) only when, besides the powers its mark names and the stake's holders' rule:

- every new holder it adds signs it;
- for every holder of the stake the offer had to reach (the roster where the offer is placed on the collective's chain, rule 94), the offer reached it, and it either took up its proportion within its period, or its period lapsed;
- each holder that took up receives exactly its proportion of the new shares, and the rest goes to the offer's new holders in the offer's shares.

A holder the offer did not reach had no period: an issuance naming that offer stays a draft, and the collective makes a new offer, reaching every holder, and an issuance naming it. **A holder takes up** by a signature act naming the offer (type 1), within its period, with its payment where the offer names a price, a Money receipt or claim naming the take-up (the receipt's field 5, the claim's field 4), as a transfer's payment fulfils it, together at least its exact proportion of the price. **A take-up the agreement's time reference places within the period counts, placed by the collective's line or not**: a holder's protection is to anchor it, as a buyer anchors a transfer (rule 10); without an anchor, the time reference judges it where the collective's line placed it (an act of the collective acknowledging it, or a record naming it in field 3). Whether it lies within the period is the time reference's answer, which the caller states (rule 33). *Without it, the members issuing would decide whether an owner's paid take-up was placed in time.*

**The same terms are the offer's own**: one offer, its price and its words (fields 5 and 6), for every holder and every new holder; the core compares nothing beyond the offer. A transfer placed after the offer passes the seller's place in it to the buyer, the new holder inheriting the full position (rule 10).

**Any other form of issuance is a cMIP's, within this one**: staged issuance, vesting, other offer terms. A cMIP may offer more as a term of the issuance, never less: it is built within the pre-emption, never around it.

**Collectives only**: a deal carries no holders' rule (rule 94), so an issuance in a deal is signed by every holder, as rule 8 asks.

*Stated cost, as in law:* *an owner that does not take up its proportion within the period, or has no money for it, is diluted. The core cannot judge a price, so a token price dilutes an owner who cannot or does not pay. An owner who vanished for good is reached by the declaration of absence (rule 85). "Issuance below the last price needs every holder" and "a right that stays open" are not rules: the first no verifier can decide, and it restores the veto; the second restores the veto, or leaves a floating claim nothing can value or close.*

#### Rule 97. Proxies

**A proxy** (type 27) is an act of a holder of a stake naming a proxy identity and the stake, scoped either to one owners' matter, a version it names, or standing over the stake until revoked: the owner's choice when signing.

**The proxy's signature act on a version counts as the holder's vote under the stake's holders' rule** where all of these hold:

- the collective's line placed the proxy (an act of the collective acknowledging it, or a record naming it in field 3) before the line that puts the version in force;
- no revocation of it was placed before that line;
- it is the holder's latest proxy on the stake so placed: one proxy per owner per stake at a time, a new one replacing the old;
- **the holder placed no signature act of its own on that version at or before that line: the owner's own vote always beats the proxy's.** A signature of the holder's the line does not reach is no vote there, and leaves the proxy's standing. **On a version of the collective's split agreement**, whose own history is its line (rule 94), the proxy is placed in that history, and the holder's own signature act naming the version, held and valid, always beats its proxy.

**A proxy is revocable by the holder at any time**, by a revocation of the proxy (type 28), placed as the proxy was.

**The fence.** A proxy only votes, and only on matters a majority of the stake decides under a holders' rule: an owners' matter under the stake's holders' rule by share (rules 94 to 96); never a constitutional change, which is the core's alone (Agreements rule 98). Never:

- on anything that needs every holder: changing the holders' rule (parameter 30), waiving pre-emption (rule 96), or a change that needs the holder's own signature (rules 8, 48);
- on the owner's money or property: taking up an issuance, selling or transferring the stake, signing a deal;
- through another: **no sub-proxies**, as a grant key signs no grant (rule 73); a proxy act counts only signed by the holder.

**Owners' votes only**: a member's voice is not handed on; members vote in person. **No instructions**: an instructed proxy is the owner's own signed vote, which anyone may deliver. **Collectives only**, as holders' rules are.

*A proxy can add a voice to a majority decision, never give away what is the owner's alone. On MOR no attendance is needed, so proxies have little use, and they are fenced.*

## 7. This cMIP's acts

The issuance offer (type 26), the proxy (type 27) and the revocation of a proxy (type 28) are acts of this cMIP's specification, with these type numbers and formats: their `spec` field is this cMIP's hash, and the numbers are this specification's, not the Agreements MIR's. **They count for a collective whose terms name this cMIP in field 35** (Agreements rule 99), each in its type's format; an act of this specification of any other type, or outside its type's format, is invalid; an act of the Agreements MIR's specification with type 26, 27 or 28 is invalid (Agreements, "Part five: act formats"). A take-up of an issuance offer, and a holder's signature on one, is an Agreements signature act (type 1) naming the offer.

*Moved from the Agreements MIR's type table: the formats are unchanged; only the `spec` field of these acts changed, and with it their bytes and act ids.*

### Issuance offer (type 26)

```cddl
issuance-offer-payload = {
  0 => hash,                ; the version of the collective's agreement defining the stake, in force where the offer is made
  1 => uint,                ; the stake, by its index there
  2 => uint,                ; the size of the issuance: the new shares' part of the stake after it, in millionths, above zero
                            ; and below 1,000,000; every existing share is scaled by what is left
  3 => [+ [ holder: hash, share: uint ]],
                            ; the new holders, who take what the existing holders do not take up, and their parts of it,
                            ; in millionths summing to 1,000,000; ascending by holder, none twice
  4 => any,                 ; the period: a point on the agreement's time reference, until which each holder it reached may
                            ; take up its proportion
  ? 5 => amount,            ; the price of the whole issuance, each holder taking up paying its proportion of it; absent: none
  ? 6 => tstr,              ; the offer's words, canonical text: its terms, the same for every holder and new holder
  ? 7 => [ hash, any ]      ; a cMIP and its parameters, offering more as a term of the issuance: staged issuance,
                            ; vesting, other terms, never less than this offer
}
```

An act for the collective, drawn by a member: done once sealed to every member and on its chain (rule 57), counting under its rule for Agreements (rule 60). Its inside names the agreement as chain and predecessor, `[[agreement, agreement]]`, followed by its chain citations, as an action cites (rule 58).

**It reaches a holder** where it is public, or sealed to that holder among its recipients (Envelopes, `to`), as a declaration reaches the member it names; a holder that is a deal, only where it is public; a holder that is a collective, where it is sealed to each of its members or public (rule 57). Its period runs for a holder only where it reached that holder. Which holders it must reach, and their proportions, is the roster where the offer is placed on the collective's chain (rule 94).

**A holder takes up its proportion** by a signature act naming the offer (type 1), before the point field 4 names, as the time reference judges it, placed by the collective's line or not (rule 96), with its payment where field 5 names a price: a Money receipt or claim fulfilling the take-up (the receipt's field 5, the claim's field 4). A take-up takes the holder's whole proportion; a cMIP of field 7 may offer more.

**It counts** only under terms naming a time reference (field 6, or field 2's task 10), in a collective. Whether its point has passed is the time reference's answer, which a verifier states as it states every time reference's answer: the core reads no time reference (rule 33).

The issuance that follows it is a clone naming it in terms parameter 32, judged as rule 96 says.

### Proxy (type 27) and revocation of a proxy (type 28)

```cddl
proxy-payload = {
  0 => hash,                ; the version of the collective's agreement defining the stake
  1 => uint,                ; the stake, by its index there
  2 => hash,                ; the proxy: the identity whose signature act on a version counts as the holder's vote
  ? 3 => hash               ; scoped: the version, one owners' matter, it votes on; absent: standing, every owners'
                            ; matter on the stake until revoked or replaced
}
proxy-revocation-payload = {
  0 => hash                 ; the proxy (type 27) it revokes
}
```

A proxy is signed by a holder of the stake, with its own key. Its inside names the agreement as chain and predecessor, `[[agreement, agreement]]`, as a resignation does, and it is never a fork. A revocation is signed by the holder who signed the proxy, and names the proxy as chain and predecessor, `[[proxy, proxy]]`. Each counts only public, or sealed to the collective's members among its recipients, and only where the collective's line placed it: an act of the collective acknowledging it, or a record naming it in field 3 (rule 97).

A proxy whose signer holds nothing of the stake at its placement, or that names its signer as the proxy, counts for nothing. A proxy act signed by anyone but the holder, a proxy among them, counts for nothing: no sub-proxies (rule 97).

A later proxy of the same holder on the same stake, placed by the collective's line, replaces the earlier one from its placement on.

## 8. Reasoning

- **Protected clauses, one version for everyone.** *A stake cannot be reduced without its holder's signature. But the clause that decides absence, the keeper who judges it and the service that receives the collective's income could move the stake in two steps; and an arbitrator, a condition cMIP or an anchoring cMIP chosen after the fact could decide who wins. So in a collective they change only with every member's signature. Keepers and the collective's split agreement are protected for the same reason.*
- **A departed holder is paid, and consulted on the owners' matters by its holders' rule.** *A stake is a share of income, not a say, save on what touches every owner alike. Whoever keeps a stake after leaving accepts the collective's decisions, and is protected by what company law protects: the stake never shrinks without them, and no term treats it worse than a member's. Keeping their old judges would leave a split service keeping two sets of terms for one payment.*
- **A judge and the constitution together need both rules.** *Otherwise two members of three could change a judge by adding a one-word change to the constitution (Agreements rules 67, 98).*
- **Nobody is left holding an area they no longer have, and no hire outlives an emptied area.** *A clone that removes a member takes them off their areas, and an area may wait, empty and frozen, for the collective to refit it, keeping the founders' number for the refit. An empty area is an emergency: its grants end at the line that emptied it, which places every act under them like any act for the collective; the refit reinstates, by cloning, only what is still wanted.*
- **A judge is never chosen by one area.** *The time reference, the condition cMIP and the anchoring cMIP can decide who wins a dispute; they stay judicial, as every member signed them, whoever runs Agreements' other tasks. And a judge never handles what it judges: a specification chosen as a judge serves no other task and is no extension, however it is named and in a deal as in a collective. This removes a conflict of interest and keeps every area out of the choice of judges.*
- **Nobody loses their say by default.** *Protecting the abandonment clause guards one route to removing a party's voice; rewriting the clone rule is another, which would be unguarded. So the rules that decide who decides form their own tier, changed by their own rule, which is everyone unless the founders, all of them, agreed otherwise. What judges the members changes only with all of them. Everything else is operational, and can be handed to the members who run it, as areas: they decide there without asking the rest, and can hire, but never give more than they hold.*
- **The tier follows from the bytes.** *Which power a clone needs is read from which fields it changes, never from what it says about itself, so two verifiers cannot disagree, and a clone cannot slip a constitutional change past as an operational one.*
- **Owners consent together on what hits them alike.** *A company's owners who run nothing could only veto, each alone. A holders' rule they accepted lets owners holding enough of a stake agree, by share, on what hits every one of them alike; nothing reaches what one of them is paid unlike the others. Issuance keeps every owner's proportion within its reach; a sale of the works, and a fork's successors' plans, are owners' matters too. Weights are read from the stakes, never written as free numbers. Every addition is optional, its default the rule without it, so the members' collective the core keeps on its own is unchanged.*

## 9. Freeze scenarios

*Run against this cMIP; the scenario numbers after each colon are those of the freeze test suite.*

#### Tiers and clones

- A majority clone that rewrites the clone rule without the minority is incomplete under the default constitutional change rule; one whose mark claims the clone rule for it is invalid: 3.
- An area's power: its holder changes the area's fields alone, and grants within it; a grant beyond what its signers could do together is invalid; an act beyond a grant's reach is not backed: 3.
- A founding naming every layer's rule, the client showing first what one member can do alone in Money; a founding lacking a layer, or naming a seventh, founds nothing; under `[1, 1]` for Money one member's payee pointer counts, under `[1, 2]` it needs another member's signature; a grant from a member acting alone in Money reaching Money, valid, and from one whose rule is two together, invalid; a record any member draws: 3.
- A clone whose mark names a rule it did not meet, or another rule than the one its changes require, is invalid; a clone changing two areas, each area's power met and named, comes into force at once; an operational clone needs no rotation: 3.
- A clone changing an area and a judicial clause needs both powers: 3.
- A clone making a constitutional change and adopting a second payment cMIP needs the constitutional change rule and the rule for Money, its mark naming both; where field 18 counts by share, the owners alone do not bring it in: 3.
- A removal leaving parameter 34 as it was: the removed member is read out of its areas; an area it held alone stands frozen until the refit: 3.
- A version changing the constitution and a judge needs the constitutional change rule and every member for the judge, its mark naming both (Agreements rules 67, 98): 3.
- A mark whose signers are not ascending by hash is invalid: 3.
- The collective's receipts and price tags, Money acts, fall under its rule for Money, and count only on a rail Module its pointer or vault names, implementing the payment cMIP named for it; an act of a cMIP its terms name nowhere falls in no layer and counts for nothing, whoever signs it, until the layer's members adopt it: 3.
- The members named for Money adopt a second payment cMIP under its rule; the clone is recorded at once, without a rotation, and governs the collective's acts from the record on; a new rail needs no clone, only a payee pointer: 3.
- A rotation declaring nothing new: the payment cMIP adopted under the rule for Money by a record stays in force: 3.
- An extension adopted under the rule for Development; one acting on Money needs the rule for Money too; an under-declared extension binds nothing beyond the layers whose rule its adoption met: 3.
- An extension declaring Money in its specification (Development, field 10) is dropped only with the rule for Money met too: 3.
- A specification named for tasks of two layers under different rules: its acts need both rules met, and naming it for the second layer needs both layers' power: 3.
- The members named for Agreements adopt a grant-limits cMIP, and cannot replace the time reference or anchoring cMIP: 3.
- A holder leaves an area by nomination, by proposal or by redraw; a holder steps down at once and the area is frozen until the change: 3.
- A holder of an area held by two steps down: the other carries on, and the area's grants with it; the only holder steps down: the area and its grants stop until the refit: 3.
- A constitutional clone removes one area and reorders the others: a grant keeps falling in the area of its id; a clone giving a new area a retired id is invalid: 3.
- Owners choosing operators: a collective's constitutional change rule counted among its stake's holders by share; owners vote the operators out; the operators do not rotate; the clone stands complete and unexecuted, the collective running on; where the constitution gave the owners the recovery custodian, the rotation is made; a rotation by the operators without the owners' signatures breaks the collective; the founding client warned where no key share or custodian was under the owners' control: 3.
- A member removed keeps a quarter of the collective's income as a departed holder: no voice, the current judges applying; a clone lowering that stake without the holder's signature stays a draft; every payout matching its stake exactly, a deviation either way shown; every split delivered to every holder it pays, naming each fee and who received it (rule 68): 3.

#### The owners' matters

- A holders' rule: Dana holds 10% of a collective's stake in itself under a 60% holders' rule she signed; owners holding 70% take 5% off the top for a studio, the mark naming `[5, stake]` with them; she votes no and the clone comes into force, every holder paid alike less; a clone lowering her share alone stays a draft until she signs; a holder who never accepted the rule is still asked; a clone adding a holders' rule signed by every holder but one stays a draft: 3.
- A holder votes on an owners' matter, the record names the signature, the holder rotates and disowns it: the change stays in force, the vote shown disputed: 3.
- An issuance under a sixty per cent holders' rule: every existing share scaled alike; each holder offered its proportion by an issuance offer public or sealed to it; one declines by letting its period lapse, one takes up and pays, the rest goes to the new holders the offer names; an offer that did not reach a holder starts no period for it and the issuance waits; an issuance every holder signs needs no offer; one giving a holder that took up less than its proportion, or scaling one share unlike the others, is a draft; a share added any other way needs every holder: 3.
- A standing waiver of pre-emption: set in a stake's entry of parameter 30 by a clone every holder signs; an issuance under a sixty per cent holders' rule then names no offer (parameter 32 `[0]`) and is complete once owners holding 60% and its new holders sign; a clone setting or removing the waiver signed by every holder but one stays a draft; a buyer who bought under it is bound by it; a proxy's vote on it counts nothing; parameter 32 `[0]` without the waiver in the parent: the issuance is invalid: 3.
- The owners' matters: a collective selling its work to its members' new collective for a token price, with a departed holder and no holders' rule: the transfer waits for her signature, placed by the collective's line; under a holders' rule she accepted, holders meeting it carry it; the same for a release: 3.
- This cMIP's own acts: an issuance offer and a proxy under this cMIP's specification count for a collective naming it in field 35; the same payloads under the Agreements MIR's specification are invalid; an act of this specification of a type it does not declare is invalid: 3.
- Proxies: a holder names a proxy, standing over its stake, placed by the collective's line; the proxy's signature on an owners' matter counts as the holder's vote; the holder's own signature on the same version beats it; a proxy scoped to one version votes on no other; a revocation placed before the version's line, or a newer proxy, ends it; a proxy act placed after the version's line counts nothing there; a proxy's vote on changing the holders' rule, on waiving pre-emption, on taking up an issuance, or on a transfer of the stake counts nothing; a proxy act signed by the proxy counts nothing; a proxy in a deal counts nothing: 3.
