# F402: who acts for a collective, named per layer

*Fable, 28 October 2026, a follow-up to the fourth review (pull request 110), on its first change. Input: F402 as recorded on `claude/lead-records`, the design note, and Agreements rules 58 to 64, 73, 74 and 91 and the record's format as they stand. Texts read, nothing run; a recommendation, nothing decided.*

## In plain words

Nobody, allegedly's version is better than mine, and I take it. Mine kept a default and carved money and decisions out of it; his removes the default, so that a founding that says nothing about a layer founds nothing. A silent one-of-n for the money was my worry, and a founding that cannot be silent answers it more completely than a carve-out does: whatever a layer's rule lets one member do alone, the members chose it and the client showed it. Stated risk, chosen, is the MOR way of doing this everywhere else.

It leaves one gap mine did not have, and it is a gap of wording rather than of design: "the Agreements layer" is one word for two kinds of act, the everyday ones (a publication, a signature, an obligation, a contest signed for the collective) and the decisions (records, grants, revocations, forks, closings). The texts already give most decisions a rule of their own, and the sentence for rule 60 should say which rule governs which, so that a layer's rule is never read as a way around the constitution. Two smaller points: the Identity layer has no everyday act a collective can sign, so naming a rule for it is naming a rule for nothing; and the format should carry the six rules as a map keyed by layer, so MOR 2 can add a key.

## 1. Does it close what change 1 closed?

Yes, and more. Change 1 closed two things: a member pointing the collective's money at themselves under a default nobody chose, and a member making a decision alone the same way. F402 closes both by removing the default: a founding names, for Money, who acts, and a founding that names "any one member" for Money has chosen it with the client showing what that means. The decisions are closed by what follows under 2.

The one gap mine did not have: mine named the constitutional rule for decisions outright, so a reader could not take the Agreements layer's rule as governing a record or a grant. F402 as recorded does not say, and a founding that writes "any one member" for Agreements could be read as letting any one member issue grants or write records. The texts already contain the answer, rule by rule; it needs collecting in one sentence (under 5).

## 2. Where decisions sit

Take them one at a time against the texts as they stand.

- **Clones** (membership, the constitution, the tiers): rule 64 gives them their powers from their changes, the constitutional change rule among them, judged by the mark. No layer rule reaches them, and none should. Unchanged.
- **Forks and closings**: rule 91 and the type table (line 2840) have a member draw the act with their own identity and the members complete it by chain signatures under the constitutional change rule. Already a member's act plus a rule of its own. Unchanged.
- **Records**: line 3705, "No area reaches a record, as none reaches a rotation. It is judged by the clone it names alone." Under F401 the question is who may draw one, since the collective's key no longer does. Any member, with their own key, naming the collective: the record decides nothing by itself (its clone counts by the clone's signatures, its registrations by the acts they name), so letting any member draw it gives nobody a power they lacked. What it gives is timing, the tips in field 1 that fix the line; the collective's key holder had that, and two members drawing concurrent records is a fork of records, which rule 90 already settles. So: any member, outside every layer's rule, and the text says so.
- **Grants and revocations**: these are the one kind the Agreements layer's rule should govern, and it is safe to let it, because rule 74 bounds what a grant can hand out to the power of whoever issued it. A member who acts alone in Money under the founding can grant that and no more; a member whose Money rule is "two together" cannot grant alone what they cannot do alone. Rule 74 does the work; the sentence names it.

So "Agreements as a layer" is the right home for the everyday acts and for grants (bounded by rule 74); clones, forks and closings keep the constitutional rule they already have; records are free to draw and decide nothing. Rule 60's sentence should say this in one breath, or a founding's "any one member" for Agreements will be read as "any one member may change the collective".

## 3. What the layer grain cannot express

- **An act of no layer.** A cMIP's act of a specification the agreement names for no task and as no extension: rule 60 already says it counts for nothing until adopted. Adoption is itself under the layer's rule ("an area reaching a layer decides what the collective adopts for that layer"). Nothing new.
- **An act two layers share.** Rule 60 already: reached by each, counts only when each layer's rule is met. Unchanged, and F402 should keep the sentence.
- **The Identity layer with no signing key.** A collective's chain acts are the chain key's (the key grammar's); its Identity everyday acts (names, routes, links, an encryption key, a witness act) have no key to sign them under F401, and a witness act of the collective counts for nothing in Agreements anyway (rule 58). So the Identity layer's rule governs no act. Requiring it is harmless and confusing; I would name five layers and say why: *Identity's acts of a collective are its chain acts, the key grammar's; it has no other.* If six are kept for uniformity, the text should say the sixth governs nothing today, so a founding client does not invent an act for it to govern.
- **A layer's rule naming a member who leaves.** A named member (not "any one", not "k of n") whose departure the line registers leaves the layer with no actor: today an area with no holder stands frozen (rule 71). The same should hold for a layer's rule, and the departure's clone should have to re-name it, which rule 64's "membership is constitutional" already forces into the clone.

## 4. Format

Terms field 19 ("Areas", constitutional) carries it today. Carry the layer rules as a map keyed by layer number, each value a rule in the grammar the terms already use for every other rule (`[0]` every member, `[1, k]` a threshold, `[2, [+ hash]]` named members; "any one member alone" is `[1, 1]`, so no new form). Areas finer than a layer stay as they are, a list of `[1, spec, type]` entries each with its rule and holders, narrowing within the layer's rule. Completeness is then a format rule decided from the bytes: a founding whose map lacks a key for a layer it must name is outside the format and founds nothing (rule 1; F295), which is what "deemed incomplete" should mean so that two verifiers refuse it alike. The door left open: a layer MOR 2 adds is one more key, with the texts saying a key not defined by the MIRs in force is refused, so that no one smuggles a seventh layer in before MOR 2 defines it.

## 5. Recommendation, and the sentence

His version, with the clarifications above folded into rule 60. In the texts' voice, replacing rule 60's "An act no area reaches counts on the collective's own signature":

*A collective's founding names, for each layer a collective acts in (Text, Envelopes, Money, Agreements, Development), who acts for it there: a rule in the form of every other rule of these terms. An act of the collective in a layer counts under that layer's rule, or under an area's rule where an area within the layer reaches it. A founding that leaves a layer unnamed is outside the format and founds nothing. Identity's acts of a collective are its chain acts, governed by the key grammar; it signs no other. The layer's rule governs the layer's everyday acts, and, in Agreements, grants and revocations, which reach no further than their issuer's power (rule 74); it never governs a clone, a fork or a closing, which take the rules their changes need (rules 64, 91), nor a record, which any member draws and which decides nothing by itself. A layer whose named actors have all left stands frozen (rule 71) until a clone names others.*

And one line of client conformance beside it, which is where the stated risk is made visible: *before a party signs a founding, its client shows, layer by layer, what the rule lets one member do alone, Money first.*

**Before the freeze:** yes, with F401; it is the shape of the founding and cannot change after.

## Addendum, the same evening, after Nobody, allegedly read it

Asked whether "those agreements fall under the constitution, not layer powers", I first drew the line too wide: I offered to put entering or leaving any agreement as a party (a publication, a work's ownership, a transfer, a release) under the constitutional rule, since it decides where the collective's income goes. Nobody, allegedly, meant something narrower and already in the texts: **the exception is the collective's own agreement, its founding and every clone of it, which dictate its constitution.** Rule 64 gives a clone its powers from its changes, the constitutional rule among them, and no layer's rule reaches it. The sentence under 5 says that and stands as written.

So the extra line is withdrawn. Entering a publication or a work's ownership agreement falls under the Agreements layer's rule like every other act of that layer. Where a founding names "any one member" for Agreements, one member can sign the collective into a publication alone: that is the stated risk his version accepts, chosen at the founding and shown by the client, layer by layer. Nothing more is added to the rule.
