# MIR: Agreements

*Draft 17, freeze-ready, for Nobody, allegedly, to approve.*

## How to read this MIR

Normal text is the protocol. Italic text is commentary: reasons, examples and plain summaries. A summary that starts *In short* repeats what the rule says; where the two seem to differ, the rule's own text decides.

The rules are numbered in reading order, save rules 94 to 97, which stand beside rule 48, whose protection they complete. A rule of another MIR is cited by that MIR's name and the rule's number ("Money rule 19"). A retired rule, type or field keeps its number, which is never reused.

Some marks recur:

- *Client conformance:* a duty of clients (wallets, the collective's client, a split service's software). The protocol cannot check it from acts alone, so it is stated for builders.
- *Stated cost:* a weakness the rules accept knowingly, written down so nobody mistakes it for an oversight.

*Working rule:* where the core gives participants the means to choose, the choice is theirs; the core keeps only what no choice may break.

The MIR has five parts. Part one is agreements as they run most of the time: making and signing, claims and ownership, publications and splits, judges, keepers, changing a deal, defaults and the public domain. Part two is collectives: an identity its members act for under its ownership agreement, its tiers, members, grants, succession and abandonment. Part three is the rare cases: forks of records, how a collective ends, a broken collective, and how "before" and "after" are read in a collective. Part four is the act formats. Part five is the tasks, the reasoning and the freeze scenarios.

*From bake to publication, in four acts, each saying one thing:* a **bake** (Envelopes), "I uploaded this"; a **claim**, "I claim to have made this"; an **ownership agreement**, "we have agreed that this is how we claim joint ownership"; a **publication**, "this is how we agree to publish it with these specified partners". *Ownership is one thing, distribution another: one work has one ownership agreement and may have many publications, each with its own price, partners and split, the owners' shares read from the ownership agreement in all of them.*

## Purpose

Agreements is the language of verifiable agreements between identities. It defines:

- how an agreement is proposed, signed, recorded and changed (by cloning, never by editing);
- keepers: the notaries that record deals as they happen, so that a rotation cannot erase what someone relied on;
- claims, and the ownership agreements that write who owns a work, or a collective, in what shares, and how the owners decide;
- publications: how a work is sold, at which price tag, on which terms, with which partners, and how money that reached the publication's split service is divided, exactly, the owners' shares read by reference to their ownership agreement, module fees and shares assigned to roles included;
- conditions, and time;
- grants and collectives: acting for others, within limits;
- abandonment, and what happens when someone disappears from a deal;
- non-performance: the core never enforces, but it makes default impossible to hide.

Money ends when money reaches a payee pointer. Agreements say who owns what, how it is shared, and who failed when something breaks.

## Dependencies

Agreements builds on Identity, Text, Envelopes and Money.

Agreements are optional per client, but all or nothing: a client implements it fully, or shows its acts as unknown (core, client conformance). A client that acts on agreements implements Agreements.

No rule of a lower layer depends on Agreements. Where Agreements need a lower layer to carry something, it is a field there (the publication a price tag names, Money).

**Only acts valid in their own format count.** Every act a rule of this MIR counts, its own or another specification's (a receipt, a claim, a bake, a price tag, a rotation, a cMIP's act), counts only where it is valid under the specification that defines it. An act whose type its specification does not define, or whose payload is outside that specification's format, is invalid (Envelopes rule 30), and no rule of this MIR counts it; an act under a specification the verifier does not implement is unknown to it. The rule reaches the acts of the core's own types; a cMIP's act (a delivery, use or metric record) counts where the verifier reads its format, as the cMIP defines it. A format rule is one decided from the act's own bytes; a bound that needs other acts (a transfer's field 3, at most what the seller still holds) is a status rule, judged where this MIR says, never a format rule: an over-sale is a valid act that confers nothing (rule 10). *One rule for every layer, as the MICS's common conventions say: a verifier never counts here what the act's own MIR or cMIP refuses.*

## Words used in this MIR

### Agreements and signing

- **Terms.** An act proposing an agreement: its parties, its text, its cMIPs, its keepers and its rules.
- **Signature.** An act by one party naming terms (or a clone, a publication, a transfer, a release) as agreed. Each act has one signer, so every agreement is its terms plus one signature act per party.
- **Agreement.** Terms together with the signatures its rules require. Its id is the id of its terms act. An agreement commits identities, not keys: a later rotation changes the pen, never the promise. A party is bound only through its own signature act.
- **Agreement chain.** The acts on one agreement: signatures, clones, records, transfers, contests. Each names, in `objects` (Envelopes), the chain and the act it follows.
- **Deal.** An agreement that founds no collective: its terms carry no key grammar. A deal exists when every party has signed it, and changes only with every party's signature.
- **Position.** An agreement that confers income without ownership.
- **Proven delivery, promised delivery.** What a publication sells is delivered in one of two ways.
  - **Proven:** its delivery leaves a proof that any verifier can check from data alone, no one's word trusted: a hash in an anchoring batch; a key that decrypts to the promised hash; a rail swap's payment proof; a deterministic computation re-run to the same hash; a bounty whose answer checks itself. It is sold in the access form, `[ 2, [ cMIP, params ] ]` (rule 11).
  - **Promised:** its delivery rests on someone's word, so it names a vow, and each sale is confirmed or contested by those who signed onto it (rule 13). A service's signed word alone (counts, checks, quality) and anything ongoing (hosting over time) stay promised.
  - A cMIP may produce the proof; **the verifier checks the proof itself, never the cMIP's say-so.**
- **Negotiation message.** An Agreements act carrying text, by which two sides negotiate (type 18, rule 52). Each message names the previous message of its thread, and acknowledges the latest one received from the other side. Like every Agreements act it may carry acknowledgements (Envelopes rule 18); a text act never can.

### Claims and ownership

- **Claim.** An act binding a work's hash to its creators (type 3): "I claim to have made this." Its own act, never a mark on a bake. It records who says they made a work, and in what order; never legitimacy.
- **Ownership agreement.** Terms carrying a target (terms field 33): ownership only, saying who owns what share of the target, and how the owners decide (change rules, keepers, judges, succession, absence). One act type, with two targets, written `[kind, hash]`:
  - kind 0, **a claim**: a work's ownership agreement, built from the work's claim; a deal;
  - kind 1, **an identity it founds**: a collective's ownership agreement, its founding and every clone of it, which also carries the collective's key grammar, its rules for each layer and its finer areas, and founds the collective (Part two).

  A work's ownership agreement refuses the collective's fields; a collective's requires them ("Terms (type 0)"). It carries no split, no fees and no split service: those are a publication's.
- **Stake.** The shares in an ownership agreement's target: one stake per ownership agreement, on its target, its holders and their shares written in terms field 7, adding up to 100%. It is identified by that agreement and its index, 0. The current holder of a share is whoever field 7 and the transfer chain on the agreement name.
  A stake whose target is the collective itself is a share of all that collective's income, whoever earns it and whenever, and so a share of what every work the collective owns brings it. It decides what every holder is paid, member or departed.
- **Holders' rule.** For a stake of a collective, how its holders consent together to the owners' matters: every holder (the default), or owners holding together at least a stated share of the stake. It reaches only changes that hit every owner of the stake alike, binds only holders who accepted it by signing or buying, and changes only with every holder (rule 94, terms field 30). The release rule (field 24) is its first instance.
- **Owners' matters.** What a stake's owners consent to by their holders' rule, or each signing: what the stake is paid, an issuance in it, a collective's sale or release of a share it holds in a work, and a fork's successors' founding terms paying a kept holder less (rule 95).
- **Issuance.** A version adding new holders to a stake, every existing share scaled by the same factor, decided by the holders' rule and pre-emptive: each existing holder first offered its proportion on the same terms by an issuance offer (type 26), waived only by every holder (rule 96).
- **Proxy.** A holder's act handing its vote on the owners' matters of one stake to another identity, for one version or until revoked; never its money or property, nor anything needing every holder (rule 97, type 27).

### Publications and selling

- **Publication.** The act (type 6) that is the offer: "this is how we agree to publish it with these specified partners." It names what is sold, its terms (delivery, refund, contest), its partners, the split service that receives every payment and pays everyone, and its split plan; the owners' line is read by reference to the ownership agreement it names. Its price is a price tag (Money) that names it. Every party signs it: the owners' side, each partner and the split service (rule 11). Self-publishing included: an owner may be its own split service, with no partner. Ended by a later version that sells nothing.
- **Split agreement.** A publication's first version selling nothing (field 0 absent): it sells nothing, and divides what reaches its split service for the ownership agreement it names. A collective's own split service is named so, by a split agreement pointing at the collective's ownership agreement (rule 15).
- **Partner.** An identity a publication names to take a share of each payment, off the top: a publisher, a relay, a client, a split service; any identity. Each partner entry carries the identity, its share and an optional label. *Publisher* is the word for a partner who publishes.
- **Price tag.** A Money act (Money type 5) naming a bake or a publication, its price and its payee (Money rule 18). Under a publication, only a tag signed by its split service, or by the party it designates, counts.
- **Purchase.** A payment naming a price tag a publication counts, a purchase under that publication (rule 12; Money rule 18): its split service's receipt names, in field 9, the ownership agreement and the version on its line whose shares it pays.
  - On a request rail, the tag and the version of the publication it names are those the seller's request committed to.
  - On a push rail, the split service settles it on its own chain (rule 12).

  A payment of a bare bake's tag is a sale by the bake's uploader, unsplit (Envelopes rule 23; Money rule 18).
- **Vow.** An act naming in words something to come, something MOR cannot hash or cannot hash yet: its own chain, its genesis id its name for good (Envelopes type 5). Publications naming it sell it, and each sale of it is pending, confirmed or contested (rule 13). A vow covers anything MOR cannot hash, existing or to come, and every sale of a physical good or of a service names one, unless its delivery is proven; it holds one or more promises, which may be bundled; it names what is promised to the buyer, never the event itself; two vows on one event stay separate, each referencing the event where it exists on MOR, not each other.
- **Request rail, push rail.** A request rail is one on which the payee's side commits to each payment before it is made (the payment cMIP's commitment, which an invoice carries). A push rail is one on which the payer pays an address with no such request. The rail Module's specification says which it is (payment cMIP).

### Money and splits

- **Split plan.** The part of a publication that says how each incoming payment is divided (publication field 4): partners first, each by its share, then role shares and metric shares, all off the top, then a maximum fee per payout where it states one, what happens to unfilled roles, and the fees; **what is left is the owners' line**, divided among the owners by their shares, read by reference to the ownership agreement. **Every share paying anyone but the owners is paid off the top, as overhead; what is left goes to the owners alone.**
- **Owners' line.** What a payment leaves for the owners once every share off the top is paid, divided among the holders of the ownership agreement's stake by their shares in the version in force for the payment's receipt (rule 12).
- **Split service.** The identity a publication names to receive every payment under it (its price tags pay its own pointer), divide each one by the publication's split plan, and pay everyone. It can be a company, a collective, a friend running software, or the owners themselves; a sole creator is simply their own split service. No partner holds others' money: the split service pays everyone.
- **Split.** A split service's signed act dividing one incoming payment into payouts (type 8, rule 20). It is delivered to every holder and partner it pays, and names each fee and who received it.
- **Payout.** One receiver's part of a split, paid as a simple Money payment with its own receipt.
- **Role share.** A share assigned to a role rather than to a named party, filled when the payment happens. For example: the reposter who led to the sale, the relay that served the file, a service the payer chose, the rail Modules the payment ran through.
  Its evidence is an act signed by a party other than the split service and the payee. **That evidence counts only when the payer the payment commits to acknowledges it in its claim** (rule 22).
  The exception is a rail Module's role share: its evidence is the receipt or claim naming that rail Module, where the payee's own pointer or vault names it (rule 22).
  A helper the parties chose in advance is a partner instead, and needs no evidence.

### Judges, keepers and time

- **Keeper.** A relay, operated by an identity, that an agreement names to record the acts around a deal as they arrive, and to sign what it recorded: a notary stamping sealed envelopes. A keeper records act ids and signers, never content. A record counts only alongside the act it names, and only for an act that belongs to an agreement naming that keeper (rule 42).
- **Belongs to.** An act belongs to an agreement when it names, in `objects`, that agreement, an act of its chain or an act that belongs to it; or through the act it answers:
  - a Money receipt or payment claim, through the ownership agreement it pays the shares of (its field 9), and through what it fulfils or followed (the receipt's field 5, the claim's field 4): the agreement itself, or an obligation, price tag, publication or act that belongs to it;
  - an obligation, through the agreement or publication it arises from (its field 4);
  - a publication, through the ownership agreement it names (its field 1); a price tag, through the publication it names (its field 1).

  An act may belong to several agreements. An act that belongs to none (a post, a claim alone, a bake, a rotation) has no keeper of its own: only an anchor places it. A verifier follows "belongs to" from act to act, as far as the acts it holds allow, at no fixed depth: each act an `objects` entry names, chain and predecessor alike, and each act answered (a Money record's ownership agreement and what it fulfils, an obligation's agreement or publication, a publication's ownership agreement, a price tag's publication) is one step, whatever the act named is, save an Identity act (an identity's genesis, rotations and chain signatures, and its Identity everyday acts), at which the path ends. What it finds through acts it holds stands; where a step names an act it does not hold, whether the act belongs to anything beyond that step is unknown to it.

  **Its keepers are those of the version in force for the act.** For a deal, the latest complete version, on the line of the version the act names, that the act's history holds (what its `prev` and the predecessors its `objects` name, followed back), or the version it names where its history holds none on that line; for a collective, the agreement in force at the act (rule 60). Every act for a collective (an act naming it on its chain, rule 58) belongs to the collective's agreement, whatever else it names. Its genesis, its rotations and its Identity acts belong to none, as every identity's. *A keeper a clone removed no longer speaks for acts under the clone; a keeper a clone added speaks from the version naming it.* *Every party's acts on an agreement, the payer's and the payee's alike, fall under its keepers; a keeper chosen for one deal never speaks for acts outside it.*
- **Arbitrator or verifier.** A third party named by an agreement to judge content (escrow and milestones, arbitration, regulated checks). Unlike a keeper, it receives the keys of the acts it must judge, by ordinary key delivery.
- **Judge.** Either a specification named for a judicial task (9 condition evaluation, 10 time reference, 11 anchoring, 14 absence proof), or an identity named to judge or testify: a keeper's operator, an arbitrator or verifier, the abandonment authority. *The split service is not a judge: its backups are attempts per payment (rule 17).*
- **Chain of judgment.** For a judge the terms name: the ones that take over from it, in order, when it answers "unknown" or does not act within its period. The chain is named in the terms and signed by everyone, so that it passes with no new signature. Each link names its period, measured on the agreement's time reference (terms field 6; the chain itself is terms field 21; rule 35).
- **Time reference.** A source of time an agreement names, such as a block height. For that agreement, only it decides whether an act is before or after a point on its reference, and whether something is past its terms. *Before and after among acts done for a collective are judged on the collective's own chain ("Made before, made after"); the time reference judges deadlines and absence.*
- **Concurrency rule.** Retired: terms field 10 is withdrawn, never reused. A fork of records is settled by rule 90's default, the parent staying in force until a clone recorded after both lines resolves it.
- **Contest.** A signed objection to another act, by someone with standing. It changes nothing about any act's validity, status or selection; it makes disagreement visible. *"Dispute" is a different word: it is reserved for the status Identity gives an act after a rotation.*
- **Standing.** Who may contest an act: a party to its agreement, a holder of a stake it affects, or a keeper, arbitrator or verifier the agreement names; and, for a purchase, its buyer.

### Collectives

- **Collective.** Several identities acting together as one identity. A collective is an identity (Identity MIR) with its own genesis, homes and chain key, and **no signing key of its own**: its genesis declares its founding agreement in place of one (Identity rule 1). Its members act for it with their own keys, each act naming the collective, under the rules its ownership agreement names; Agreements judges them. *The collective grants powers to its members, not to keys.*
- **This collective.** In a collective's own terms, the target written `[1, null]` names the collective whose agreement it is: the identity whose genesis declares these terms, or the terms they clone. This is the same device by which Identity lets a genesis name itself as its home's operator by null. Founding terms can so name a collective that does not exist yet.
- **Key grammar.** The part of a collective's founding agreement that says how its chain key is held, and the way to rotate that needs less than every member.
- **Layer rule.** For each of the five layers a collective acts in (1 Text, 2 Envelopes, 3 Money, 4 Agreements, 5 Development), who acts for the collective there: a rule in the terms' grammar, written in terms field 19. A founding that leaves one unnamed founds nothing (rule 60).
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
- **Power.** The right to bring a change into force: the constitutional change rule, the judicial tier's rule, the clone rule, a layer's rule, or an area's holders meeting its threshold.
- **Mark.** A clone's terms field 4: which of the parent's change rules it claims to meet, and the parties whose signatures meet it.
- **Area.** A part of a collective's acts or operational fields, finer than a layer, that the constitution gives to some of its members, the area's **holders** (terms field 34). An area covers acts of the collective by act type, `[1, spec, type]`, within a layer, and operational fields of its terms; it narrows the layer's rule for the acts it reaches.
  - Its holders alone decide there, and may grant within it.
  - Its holders, and the rule they act by, change only by a constitutional change; a holder may step down from it at once (rule 71).
  - An area with no holder whose voice remains stands frozen; a clone may list none at all.
- **Layer.** One of MOR's six layers, one per MIR (core, "Structure"), numbered wherever a format names one: 0 Identity, 1 Text, 2 Envelopes, 3 Money, 4 Agreements, 5 Development. Which layer an act belongs to depends on its `spec`:
  - An act whose `spec` is a MIR belongs to that MIR's layer.
  - An act whose `spec` is a cMIP belongs to the layer of each task that the collective's agreement in force (rule 72) names that cMIP for (terms field 2). A task's layer is that of the MIR defining it (Development, "The tasks the core defines").
  - An act whose `spec` is an extension the agreement names (field 15) belongs to Development.
  - An act whose `spec` is a specification the agreement in force names neither for a task nor as an extension belongs to no layer, and counts for nothing for the collective, unless an area reaches it by a kind naming its type (rule 60).

  Development defines no act types of its own: specifications and releases of code are Envelopes bakes, in layer 2.
- **Extension.** A cMIP an agreement names outside the listed tasks (field 15), which adds rules and never relaxes the core's (Development). Its specification declares the layers it acts on (Development, specification field 10); its own acts belong to Development.
- **Voice.** A party's say in an agreement: it counts toward the agreement's change rules and, in a collective, toward its layer rules and the areas it holds.
  - A party loses its voice only by its own resignation (rule 70), by an abandonment declaration (rule 89), or by a constitutional clone that removes it (rule 69).
  - It loses its voice in one area by stepping down from it (rule 71), or by a constitutional clone that replaces it there.
  - It never loses its stake that way.

  In a collective, a resignation, a stepping down and a declaration take effect at the collective's line registering them ("Made before, made after"), and keep that effect for the collective whatever their signer's later rotation disowns. **A member's power ends at the collective's line that registers their departure; their own key continues to sign their own acts.**
- **Departed holder.** An identity that left a collective, by resigning or by being removed, and kept a share of its stake. Its share is in the collective's stake (field 7), which decides what it is paid; it is consulted on the owners' matters (rule 95), and may be declared absent though no party (rule 85). The collective's **departed members entry** records only that the identity is departed, without voice (terms field 22, rule 68).

### A collective's acts, in order

- **The collective's chain.** The acts done for a collective: each names the collective's identity as chain in `objects`, with the decision it acts under, and the other acts on the chain it knows (rule 58). Its members' own sequences are never read for it.
- **Record.** The collective's everyday line (type 17, rule 72), which any member draws with their own key. It is the act by which the collective:
  - writes a complete clone of its agreement on its chain, naming the signature acts that complete it, so that the collective's later acts are judged under it;
  - registers its members' departures and rotations.

  A record decides nothing by itself: its clone counts by the clone's own signatures, its registrations by the acts they name.
- **Line.** An act of a collective at which an event that changes who may act for it takes effect for its acts: a record (type 17), a rotation of the collective, a fork or a closing. What was done for the collective counts as made before or after a line by whether the history the line cites holds it ("Made before, made after").
- **Decisions chain.** A collective's decisions, in order:
  - its genesis (founding);
  - its rotations (members joining or leaving, every constitutional change);
  - its records (its other clones, the release rule among them, and the departures they register);
  - its grants and revocations;
  - its fork or closing.

  **Each decision names the previous decision in `objects`, as an action names the decision it acts under** (a rotation, which carries no `objects`, by the signature acts its declaration names, rule 58); a decision naming none, or one that is no decision of the collective, is no decision. Records, rotations, forks and closings are the lines.
- **Actions chain.** Every other act done for a collective: debts, payments, bakes, publications, releases, sales, and its grantees' acts. Each cites, in `objects`, on the collective's chain (the collective's identity as chain), the decision it acts under and the other acts it joins (rule 58). Negotiation messages are on neither chain, being talk.
- **History.** What a decision or an action cites on the collective's chain, transitively: the acts it names there, what each act reached names there, the tips of each record reached, and the signature acts each rotation reached names. An act is before a line when the line's history holds it.
- **Tie rule.** When a decision ending powers (a fork, a closing, a departure, a grant's revocation, a departure emptying an area) and an action using them cite neither each other, the ending wins: the action is void, or, against a grant's revocation, void or disputed under rule 76. *A counterparty protects itself by waiting until the collective's chain visibly moves past its act before delivering.*
- **Done.** An act for a collective is done once both hold (rule 57):
  - it is sealed to every member of the agreement in force for it (or public);
  - it is on the chain, citing the collective's latest decision as its signer knew it.

  Where the collective's stake in itself has holders who are no members, a Money act for it is done only once sealed to every holder of that stake as well, or public (rule 57).

  Before that, even signed, it is planning, and binds no one, its signer included. Where it is held is never a condition: relays are transport. This is so for records too, and for forks and closings: one rule for every act done for the collective. *One thing is to act, another to read.*

### Grants

- **Grant.** A delegation of authority, with limits, from an identity or collective to another identity. A grant never reaches beyond the power of whoever issued it. A collective's grant is a decision naming the grantee's own identity, which signs to accept it; the grantee then acts for the collective with its own key, naming the collective and the grant (rule 73). A person's grant hands its grantee a grant key.
- **Grant key.** A key of a person, scoped to one grant's reach (Identity's scoped key). The grant names it (field 9); the grantee makes and holds it. What it signs is the person's own act, citing the grant. A revocation removes it. *It is an extra key tied to both the person's and the grantee's identities.* *Stated cost:* *a stolen grant key acts within its scope until revoked.* A collective hands no grant key: it has no signing key to scope.
- *"This agreement" (null as the deal concerned in a payee's grant to a deal's split service) and the payee's grant in a deal are retired with terms field 14: a publication names its split service, which receives in its own name.*

### Ending

- **Release to the public domain.** An act ending a work's ownership, at once or at a point it names on the time reference (type 5, rule 55). After it:
  - nobody earns from the work as its owner any more;
  - its history, who made it and who owned it, stays named;
  - its content key is made public, or delivered at that point by the identity the act names.
- **Fork of a collective.** The end of a collective whose members split into sides that will not agree (type 19, terms field 23, rule 91).
  - Each side first founds its successor.
  - A fork act names the successors, signed by the members on its sides with their own identities under the constitutional change rule.
  - The fork act closes the original collective in Agreements and passes its ownership to the successors.
  - Each successor names the original in "forked from", a back-link only.

  Not to be confused with a fork of records or of an agreement chain (rules 6, 72, 90), which rule 90 settles.
- **Closing.** The end of a collective that holds nothing and owes nothing: every share it held sold or released, every debt paid or released by its creditor. It is a closing act, signed under the constitutional change rule. After its line, nothing done for the collective counts in Agreements (type 20, rule 91). The selling and releasing are ordinary acts before the closing. An absentee's money share follows the collective's own rules, and stays visible as an open obligation wherever they sent it; the closing names nothing for it.
- **A deal's end.** A deal has no closing act. It ends, or winds down, by a clone every party signs, stating its new conditions: where its stakes went, what is still owed, and to whom it now pays (rules 15, 47).
- **Creditor's release.** An act by which a creditor ends an obligation owed to it without full payment, for instance against stakes or a partial payment. Only the creditor signs it (rule 92). It is a Money act (Money type 4; Agreements type 21 retired). A collective creditor signs it under its rule for Money alone. A release traded for future terms is also an Agreements agreement, signed under the collective's rule for Agreements, which the release names. *MOR has no court and cannot force a creditor to let go: a debt ends by payment or by its creditor's word.*


## Part one: agreements as they run most of the time

### 1. Making an agreement

#### Rule 1. Proposal and signatures

An agreement begins as terms. Each party signs with a signature act naming the terms.

Founding terms exist once every party has signed them. This holds in a deal and in a collective's founding agreement alike: their signing rule (field 4) is every party. A clone comes into force by its mark (rule 45).

**A party is bound by an agreement only through its own signature act.** A rule decides when an agreement or a clone comes into force among those who signed, never who owes. An obligation in the terms of a party who has not signed is shown as unsigned, never as open.

#### Rule 2. cMIPs

Every agreement carries the hashes of the cMIPs it uses, at most one per task. An agreement that does not is invalid.

It may also name extensions (Development). A client that does not implement all of them cannot sign it.

#### Rule 3. Commitments of identities

An agreement names identity hashes, not keys. After a rotation, the party's new key signs for the same agreement.

#### Rule 4. What you sign is what you saw

*In short: before anything is signed, the client can show exactly what it says, as plain text.*

*Client conformance.* Before any terms, clone or grant is signed, the client:

- MUST be able to show its text as plain text;
- SHOULD do so by default;
- MUST show every bidirectional control visibly in that view (Text rule 6).

#### Rule 5. Positions

Positions are agreements that confer income without ownership.

#### Rule 6. Agreement chains

Every act on an agreement names the chain and the act it follows.

*In short: two acts following the same act are a fork. Most forks are settled by the agreement's own rule for acting independently, or by keeping the status quo.*

Two acts naming the same predecessor are a fork. The exception: acts naming the act they concern as both chain and predecessor, `[x, x]` (a signature naming what it signs, a publication naming the ownership agreement it reads, a transfer, a resignation, a proxy, a liveness, a request, an issuance take-up), are parallel acts on it, never a fork.

A fork is settled this way:

- where the agreement lets parties act independently, rule 90 settles it (the concurrency rule, terms field 10, is withdrawn);
- otherwise the status quo stands;
- save that two complete versions of one deal follow rule 47, as below.

Two complete versions of one deal:

- the version before the split is the reference;
- a new act may follow either branch;
- a tangled fork stays on the reference;
- a settlement settles it, final for everything its signers could see.

The settlement is one of:

- a version naming every tip it drops;
- or the judge of forks the reference names, or the link of its chain of judgment that took over, on a party's request.

*The rare case, in detail.* An act on an agreement chain that is void or disputed under Identity's rotation rules, or disputed under rule 76 as an act a grant's revocation does not hold, confers nothing: no stake, no obligation, no consent.

The one exception: a member's signature act that a collective placed before its line registering that member's rotation stays valid for the collective, as "Made before, made after" says. Its status under Identity is unchanged.

**What a collective's line placed stays placed for that collective.** The exception reaches every act of another identity that a line of a collective names, registers, or relies on to count what it registers: a resignation or stepping down, a declaration of absence and the signature acts completing it, the signature acts a declaration's field 1 is checked against, and every other act "Made before, made after", 4, lists. Such an act keeps, for that collective, the effect the line gave it, whatever its signer's later rotation kept or disowned; its status under Identity is unchanged, and every client shows it as a dispute on the line. *With rule 42's for a keeper's record, this is the exception Agreements makes to Identity's rule that another identity's evidence counts only while its signer's chain keeps it: what a collective's own line placed stays placed.*

**A deal's version, once relied on, stays complete**, as rule 47 says, the disowned signature shown as a dispute.

### 2. Claims and ownership

#### Rule 7. Binding a work

A work is bound to its creators only by an explicit claim:

- a sole creator, by its claim alone;
- several creators, by one creator's claim completed by signature acts from all the others, and bound only when all are present.

A bake is a neutral carrier: carrying or quoting a work, or pointing to a web resource, claims nothing. A bake says one thing only, who uploaded it (Envelopes rule 23).

The core records claims and their order, never legitimacy. Order is not evidence of authorship; a claim cMIP MAY carry a commitment made before upload. *A claim is used to build agreements and as a defence. Where no claim is made, and no agreement builds on one, nothing in Agreements speaks for the work; and a claim, even with an anchor, proves only "first on MOR": MOR is not a court.*

Where claims from different identities conflict, priority can only be decided where they meet: by anchoring, or by a keeper of an agreement both claims belong to that recorded both. Otherwise they remain openly contested.

**A claim counts only public or addressed to every creator it names.** It names no roles.

**A work's ownership agreement** is an ownership agreement whose target is the work's claim (terms field 33, `[0, claim]`). In MOR's eyes the owners are those its stake names, with the shares it gives. **Where no ownership agreement targets the claim, the default holder is the creator who opened the claim.** A client shows it "as recorded", any contest beside it, never as legitimacy.

**Ownership is one thing, distribution another.** An ownership agreement says only who owns what share, and how the owners decide; it carries no split, no fees and no split service. How the work is sold, at what price, with which partners and who takes what, is a publication's (rule 11), and one work may have many publications, the owners' shares read from the ownership agreement in each (rule 12).

**A manifest neither claims its parts nor is reached by their claims.** A manifest work (an album naming its songs) is a work of its own: its claim binds the manifest's hash, never the parts it names, and a claim on a part never reaches the manifest. The parts' owners take part in it by agreement: the manifest's ownership agreement has the parts' ownership agreements among its holders (rule 15).

#### Rule 8. Stake rule

Any act that changes the size of a share of a stake requires its holder's signature.

**The one exception is an issuance**: new holders added to a stake, every existing holder's share scaled by the same factor, decided by the stake's holders' rule and pre-emptive, as rule 96 says. A share added any other way still needs every holder whose share it lowers. **A holder is whoever field 7 and the transfers placed say** (rule 10): a buyer who completed a transfer is the holder of what it bought, for this rule as for rule 48.

A signature on an agreement is consent to everything it defines, including pre-authorised changes such as abandonment outcomes. Clients SHOULD make such terms prominent.

#### Rule 9. Stakes are written in millionths

Shares are written in millionths, summing to 1,000,000.

*In short: when a payment does not divide exactly, the few leftover units go to the holders whose exact shares were cut the most, and ties take turns. The holders keep the chain of receipts that proves it.*

Leftover units from dividing the owners' line go one each to the holders whose exact shares have the largest fractional remainders.

Holders with equal remainders take turns. A tied unit goes to the tied holder that has received the fewest leftover units from this stake so far, counted along the dividing split service's own receipts for the stake. Where that count is equal, it goes to the holder whose identity hash is smallest.

**The count runs along the service's receipts across every version of the ownership agreement, the same share being the same holder's share whatever its place in the list, and a new holder starting at zero.**

The order in which holders are listed decides nothing.

**The chain of receipts.** Each receipt of a split service carries, per stake, the running count of leftover units each holder has received, and cites the service's previous receipt for that stake. So a tie is checked from two acts.

- The count is split key 4, `[+ [ stake, [+ [ holder, count ]] ]]`: the count after this split, a holder not named counting zero.
- "Receipt" in this rule means the split act.

A verifier that does not hold the previous receipt shows that unit as unknown, never the rest of the payment.

**The split service delivers every receipt for a stake to every holder of it, paid or not** (client conformance). So each holder keeps the whole chain and checks each receipt as it arrives.

**A receipt that does not cite the latest receipt for its stake, or two receipts citing the same one, is a deviation that breaks the plan** (rule 68). Then:

- the break is shown on every split involved, and each holder's client names the one that arrived second;
- after a deviation, the reference stays the last split that continued the chain, so a deviating split never becomes the baseline.

Splits made from a payer's claim are in the chain. A new holder starts keeping the chain from its first split, with a warning.

*The holders build the chain's reference copy themselves: whoever has money at stake holds the record of how it was divided, and checks each new link against it, so a lie is caught at its first step and a reset or fork is shown.*

*The rare cases, in detail.*

**Where the payer divides** (a split from a payer's claim with no receipt), the payer decides each tied unit, at most one per tie (no hash, since the receipts do not exist when the payer divides). This is a stated cost, since a payer who is not a holder gains nothing by it.

**A fork's division** keeps ties among sides by the hash of the fork act with each side, which every member signs and any may refuse. Among members counted alike, it gives leftovers to the first as listed in the agreement in force, an order every member signed.

**While an ownership agreement stands forked, the turns stay per branch.** Each split is judged under the version its receipt names, and its stake's holders there take their turns along that branch's receipts.

**One numbering runs across every split the service makes under the publication, for any version of the ownership agreement.** Each split shows its number (split key 5), from 1, each one more than the service's split under the publication before it.

*Client conformance:* **a holder's client MUST raise the alarm when the numbers on the splits it receives skip.** Splits are then being made where it is not shown, and a gap reveals a hidden branch even to the party a bait branch was hiding from. *One count across both branches acts as an alarm.*

**A split that carries no number, or a number another split of the same service under the publication carries, is a deviation that breaks the plan**, as two receipts citing the same one are: shown on every split carrying it.

A gap stays the holder's alarm, not a deviation: the split missing may only not have reached that holder.

#### Rule 10. Transfer

By default, a share of a stake is sold or given by a transfer signed by the seller and completed by the buyer's signature. Other holders are notified, not asked.

**For a collective's owners' matters, a transfer counts only where the collective's line placed it** (rule 94): until then the seller holds, for the collective, what field 7 and the transfers already placed say. Money follows transfers as this rule says, unchanged. **The buyer accepts the holders' rule of the version in force at the placement** (rule 94), never of the version the transfer names in its field 0, which may be a stale one. **A collective's transfer of a share it holds in a work is an owners' matter** (rule 95).

The new holder inherits the full position. The transfers name the current holder of each share, and a split service MUST follow them: **a share's payouts become its buyer's once the transfer is complete, both signatures placed**, and every publication reading the ownership agreement by reference pays the buyer from then on.

**A sale takes effect on the seller's own line.** The seller signs the transfer by a chain signature too (Identity type 16), which fixes its place.

**Once the seller has signed it, a payout receipt the seller signs for that share after it on the seller's own line is a wrong receipt, counting for nothing.** That payout is owed to the buyer, in the share sold, as the split service's open obligation (rule 30), the service settling with the seller.

*Stated cost:* between the transfer and the service's first split following it (split key 8, the service's statement, never the moment), a colluding seller and service can keep paying the seller. The buyer's protection is to anchor the transfer. Otherwise the trail shows it, and the service is liable once it is shown.

*Client conformance:* a co-owner's and the buyer's client show a split paying a seller for a share the seller has transferred, beside the transfer.

*The rare cases, in detail.*

**"After" on the seller's own line.** Identity binds an everyday act to genesis or a rotation, never to a chain signature. So **a seller's payout receipt for a share it transferred is after the transfer, and wrong, once it is bound to a rotation later than the transfer's chain signature**, on the seller's identity line.

**Until then, what moves the money is the service.** From its first split citing the transfer (split key 8), every payout to the seller for that share is the service's debt to the buyer, receipted or not.

"First" and "from" are read on the service's split numbers under the publication: the citing split, and every split of the service under the same publication numbered above the lowest citing one. What is owed is what the payout gives the seller above its due once the transfer and those before it on the seller's line are followed, at most the share sold of what the split pays the stake.

*Stated cost, the window's second edge:* the window accepted as legible closes at the earlier of the service's first split citing the transfer and the seller's next rotation. Within it, a colluding seller and service can keep paying the seller, the trail showing it.

**A share sold twice is settled on the seller's own line**:

- a stake's transfers are ordered on the seller's own line, by their chain signatures' places;
- each is checked against what the seller still held at that point;
- transfers that fit are all valid, so two partial sales are not a fork;
- **an over-sale confers nothing, and its payment is owed back by the seller** (money received for nothing), paid as a refund (Money rule 19; stated here, not in Money rule 18).

What the seller still held is its share in the version the transfer names, less each transfer of the same stake (across the lineage) placed before it on its line that fitted what was left; an over-sale before it consumes nothing. An earlier transfer counts from the seller's chain signature, whether its buyer has completed it yet or not, so a later buyer's client sees it before paying.

The payment for a transfer is a Money receipt or claim fulfilling it (the receipt's field 5, the claim's field 4), or one the transfer's field 4 names. The over-sale's payment is owed back by the seller. *A transfer cannot name by hash a payment made after it; such a payment names the transfer it fulfils (field 5).*

*Client conformance*: **a buyer's client pays only once the seller's transfer is receipted by the seller's homes** (its chain signature counted on the seller's resolved line) **and checked against what the seller still holds.** Nobody polices it: it is prevented where it can be and undeniable where it cannot, a refund debt any wallet sees, with signed proof of the double sale.


### 3. Publications

#### Rule 11. Publications, accepted by payment

*In short: the publication is the offer. The owners, with whatever partners they choose, sign a publication saying what is sold, on which terms, who takes what and which split service pays everyone; its split service signs its price tag; a buyer accepts by paying the tag; the deal is complete when the seller's side delivers.*

*How it runs most of the time:* the owners of a work, under their ownership agreement, and their partners (a publisher, a relay, a client) sign a publication. The publication is always public. It names:

- what it sells: bakes; a vow (a promised delivery); or a delivery proven under a cMIP's terms (a proven delivery, the access form);
- the ownership agreement whose holders are its owners, by its founding version;
- its partners, each with its share and an optional label;
- its split service, which receives every payment and pays everyone, and its split plan;
- its terms: its words, its deadline, its refund terms, on its time reference.

Its split service signs its price tag (Money rule 18). A buyer's client finds the latest version of the publication and of its tag, and pays the tag. The split service receipts the payment, delivers the content key, and divides the payment: partners first, then the owners' line by their shares (rule 12).

*The owners and their partners sign a publication; anyone accepts by paying its price tag.*

**Who signs a publication.** A publication is a deal among its parties, each bound only by its own signature (rule 1):

- **the owners' side**: where it names an ownership agreement (field 1), that agreement, as a party consenting by its own rule (rule 15: in a deal every party; in a collective, under its rule for Agreements, rule 60); where it names none, its drafter alone, selling as the lone owner of what it sells;
- **each partner** it names;
- **its split service**, and each backup it names (field 11).

It counts, and sells, once every party has signed it: its drafter by drafting it, each other party by a signature act naming it (type 1). *Partners are any identity: the core does not define a publisher; it may be a curated relay, a client, a label.*

**Self-publishing** is a publication with no partners whose split service is the owner, or one the owners chose. **A lone seller's publication**, naming no ownership agreement, sells what its drafter owns alone: its owners' line is its drafter's. **Its split service's receipt carries no field 9**, there being no shares to read, and it belongs to itself ("Belongs to"). It carries its own words, its deadline and, if the drafter sets any, its own refund terms on its own time reference.

**A publication changes by versions on its own chain**, each a later version signed by every party of that version. A purchase under any version counts. Two versions of one previous are the parties' fork, shown.

**A publication is ended by a later version that sells nothing** (field 0 empty), signed by every party of it. Past sales stand. **A payment racing the ending** (one its split service receipts that the ending's history does not hold, as rule 12 reads it) **is owed back: by the split service from what it holds of it, and, past that, by each party of the publication in the share of it it received, each an open obligation** (rule 30). **Where the owners' side is an ownership agreement, each holder paid on its line owes back their own payout**: what the agreement received is what its holders were paid, and a holder that is itself an ownership agreement owes it back through its own holders in turn. This obligation is this rule's, as the split service's is, not one the terms write: it is open whether or not the holder signed the publication.

**Two stops, two different people's.** A publication's ending is a version every party signs, so no party ends a publication alone. **A price tag's withdrawal is its signer's alone** (Money rule 18): the publication's split service, or the party it designates to sign its tags. Withdrawing the tag stops sales at that price, and is the one-sided stop, held by the publication's side; ending the publication stops it for everyone, and needs everyone. *So a co-owner, or the uploader of a bake the publication sells, cannot stop the publication's sales alone; the publication's side can stop selling at once, and the parties together end it.*

A payment the time reference places past the publication's deadline (field 7) is owed back. A payment whose place is undetermined is a purchase: the seller who chose a push rail bears it.

The deal is complete when the publication's side either:

- delivers the content key: a key delivery by the split service or the party it designates, sealed to the payer, completes every purchase it reaches, a cMIP binding them tighter where it names one; or
- for a bake whose key is public, **receipts the payment naming the tag** (type 7 is retired).

That proves payment was verified and honoured.

A payment that receives neither, such as one arriving after the publication ended, creates an obligation to refund it.

A refund owed on a payment whose payer is not named is owed to whoever signs with the key the payment committed to as its payer. They claim it by a payment claim carrying that key's signature and naming where to be paid (Money rule 19). It is never owed to whoever presents the rail proof, which others on the route may hold too. A payment that committed to no key leaves its refund unclaimable by anyone.

The obligation stays open and visible until claimed and discharged. A seller who refuses a valid claim is visibly in the wrong.

**The vault's limit protects refunds too.** A refund paid to the refund rail a payer's claim names counts as repaid only up to the payer's vault limit for its unit; above it, only once it reaches the payer's vault (Money rule 17, with rule 3's limit). A payer that declares no vault has no vault rule (Money rule 3). *Why: a thief holding the payer's signing key during a theft window could sign a claim naming their own refund rail; the vault exists partly to protect large debts.* A refund owed to a bare key (Money rule 19) has no vault, so the limit does not reach it (Money rule 17).

The publication's terms MAY say how long a refund stays claimable, on its time reference. The core sets no lapse. **A refund past the terms the buyer accepted by paying is ended**: the obligation closes there, the owners keep the money, and it does not block a closing. The terms are a fixed point on the time reference (publication field 8). Terms written in bad faith are not refused: they stay public, for anyone to judge.

*Client conformance:* the buyer's client shows the deadline before paying.

Paid access to a live stream, which has no work hash until it ends, is sold by a publication selling a vow or a proven delivery, never by a bake. **The class follows what is sold.** A seller who promises the stream sells a vow, a promised delivery (rule 13; the live media cMIP): the key delivered in keeping the vow is a proof that sits in the sale as evidence (rule 13), and the buyer still confirms or contests. *A stream cut short: the key worked, the promise did not.* A seller selling only a key to what already exists, such as the recording, sells a proven delivery, under the access form. *A publication selling a stream's access under the access form with no vow sells the key only, and is read so.*

**Two classes of delivery: proven and promised.** What a publication sells is delivered either with a proof or on someone's word.

- **A proven delivery** leaves a proof any verifier can check from data alone, no one's word trusted. It is sold in the access form, `[ 2, [ cMIP, params ] ]`, under that cMIP's terms ("A service sold under a cMIP's terms"). The form is **widened from access to bytes to any delivery proven this way**: access to bytes (a key that decrypts to the promised hash, such as a subscription's keys), anchoring (a hash in a batch), a rail swap (the payment's proof), a deterministic computation (re-run to the same hash), a bounty whose answer checks itself.
- **A promised delivery** names a vow (`[ 3, vow ]`, rule 13). Each sale is confirmed or contested by those who signed onto the vow. A service's signed word alone (counts, checks, quality) and anything ongoing (hosting over time) are promised.
- **A cMIP may produce the proof; the verifier checks the proof itself, never the cMIP's say-so.** A delivery the verifier cannot check from data it holds is not proven, whatever the cMIP signs.
- **A pooled anchoring service is a proven delivery:** the hash is in the batch or it is not.
- **Each proven delivery names its checker**: the cMIP in its access form. The checker is not a task (Development, "The checker is not a task"): no agreement names one by a task number, so a collective sets no checker for all its publications. A cMIP that checks proofs of delivery declares so in its specification, by Development's field 12, for discovery only: a verifier asks the checker of whatever cMIP the publication names for the delivery.

*A proven delivery needs no one's confirmation, since its proof is the confirmation; a promised one needs its signer's.*

*The widening changes no format. A verifier tells the classes apart by what a publication sells, and asks the checker of the cMIP a proven delivery names, among those it holds, for a proof's verdict; with none held, the delivery is not proven for it.*

#### Rule 12. A purchase names a publication's price tag

*In short: a payment is a purchase under a publication when it names a price tag the publication counts; the split service's receipt names the version of the ownership agreement whose shares it pays, and the owners' line is divided by that version.*

**A payment is a purchase under a publication when its receipt or claim names, as what it fulfils** (the receipt's field 5, the claim's field 4), **a price tag the publication counts**: one signed by its split service or by the party it designates, naming it (Money rule 18). *A wallet that reads only Money can pay it, and its purchase is valid: the tag names the publication, and a verifier reading Agreements reads the rest.*

**A payment naming a tag the publication does not count** (a tag on it signed by anyone else, or a version carrying no price) **is no purchase: money received for nothing, owed back to the payer as a refund** by whoever received it (Money rule 19: the payer named, or whoever signs with the key the payment committed to; with neither, an open, visible debt nobody can claim). A payment naming the publication itself, and no tag, is **a tip through the publication**: no purchase, paid to the split service its field 3 names, divided by its split plan as a sale is, owed back to nobody. *A Money-only wallet cannot read field 3: it tips through a tag, or not at all.* *A tip to a work goes through the publication where it was found, which pays its partners and gives the owners their line.*

*Stated here alone: Money carries field 9 and the payment commitment, and pays the refund (Money rule 19); whether a payment is a purchase, and what is owed when it is not, is this rule's.*

**The owners' shares are read by reference, from one named version.** The split service's receipt of a purchase names, in field 9, the ownership agreement the publication names, by its founding version, and a version on that agreement's line. **The version in force for that receipt is the latest complete version on that line its history holds** (what its `prev` and the predecessors its `objects` name, followed back), or, where its history holds none later, the version it names; the owners' line of that payment is divided by that version's stake. **A receipt naming a version on no line of the agreement the publication names is a wrong receipt**, and so, until the fork is settled, **is one naming a version of a fork of the ownership agreement other than its reference** (rule 47). *One version, named in signed bytes, read by the rule "the version in force for the act" already has: checkable. A share change racing a payment applies from the next payment: a clone completing concurrently is on the line but not in the receipt's history. Nobody loses more than one payment's difference, and the trail shows which version paid.*

**A publication names an ownership agreement by its founding version, and reads its line.** Replaced by a clone, the line continues, and the publication follows it. Where the owners found a new ownership agreement for the same work, the publication keeps reading the old one, until its parties end it and publish anew.

**Which version of the publication a payment buys is settled where the payment truly takes place.**

**On a request rail**, the payee's side commits to each payment before it is made (the payment cMIP's commitment, which an invoice carries). There, **the tag and the publication's version a purchase names are those the seller's request committed to**, so a buyer cannot pay a version the seller has left. The payment is a purchase under it, whatever the publication became after.

**On a push rail**, the payer pays an address with no request. There, **the split service settles it on its own chain**: a receipt it records before its own signature on the version ending the publication is a sale under the publication; a receipt recorded after that signature, its own history holding it, is not, and is owed back as a payment racing the ending (rule 11). Until the split service has signed its receipt, the payment is **pending.**

**A sale before a price tag's withdrawal is a payment naming the tag's earlier version, the one carrying a price, settled as above.** On a request rail, the tag version the seller's request committed to decides. On a push rail, the split service settles it on its own chain: a receipt it records whose history does not hold the version with no price is a sale; a receipt whose history holds it is no purchase, owed back as a payment naming a tag the publication does not count, and so is a payment naming the version with no price. Past sales stand.

*The clock is when the split service records, the only one MOR has, and it belongs to the one answering for it. A receipt on another of the service's sequences than its signature is not after it: the service answers for its own devices.*

*The rare cases, in detail.*

*Wrong receipts.* **The payment decides.** **The tag, and the ownership version, are those the payment's commitment names** (the payment cMIP). **A receipt naming another tag or version is a wrong receipt, shown as such, counting for nothing**: neither a sale nor a refund. Its commitment, recomputed from it, is not the one the rail proof carries, so the rail shows it.

Until a verifier has the rail's answer, receipts of one payment naming different tags or versions are judged none of them a sale or a refund: the payment is **pending** (Money rule 18), and whether it is a purchase is unknown (Money rule 8).

*One payment shown as both a purchase and a refund cannot arise: of two receipts naming different tags, at most one carries the payment's commitment.*

*Owners that ended.* **A publication whose ownership agreement names a closed collective as owner, or names an ownership agreement that is itself closed, sells nothing from the closing's line; a payment after it is owed back**, as a payment racing an ending is (rule 11). An ownership agreement is closed when a release ends its target's claim (rule 55); a collective, by its fork or closing (rule 91). "After it" is read as the tie rule reads an ending ("Made before, made after", 7). *The closed collective's own publications and split agreement are such publications. A work's ownership agreement whose stake a fork passed to the successors is not: its owners' line follows them (rule 91).*

*Client conformance:* a split service whose publication has ended issues no payment request. So on rails where the payee's side issues each request (invoices), a payment to an ended publication cannot happen.

*Stated cost: a wallet that reads only Money can pay a publication's tag and make a valid purchase, but cannot itself tell whether the publication still counts: a payment racing its ending is owed back to it, and it can receive the refund (Money rule 19).*

*Client conformance, a strong SHOULD:* **before paying, a buyer's client finds the publication and its tag and verifies that each is truly the latest in its chain**, fetching the latest version from the seller's homes or relays, **and warns where what it shows is outdated.**

*What is already in place stands: a purchase names the tag and the version at which the client read it current; on a request rail the seller commits to the version sold; on a push rail the split service settles on its own chain. Guidance, not rule: sellers prefer request rails for sales; a publication may carry its own expiry on a named time reference.*

#### Rule 13. Vows: the state of each sale

*In short: for each sale of a vow, the core records only whether it is pending, confirmed or contested.*

The core keeps only the grammar:

- a vow (Envelopes type 5);
- publications naming it with their words (the publication format);
- **the state of each sale of it**: was what the publication promised respected.

**Each sale is pending, confirmed or contested.**

- **Confirmed:** the buyer acknowledges an act about the vow. For a payment, this is done in a payer's claim of that payment by the payer its commitment names (rule 22: never the payer a receipt names), its `acks` naming an act about the vow, held and valid (Envelopes rule 17).
- **Contested:** the buyer signs a contest naming the sale (type 14).
- Otherwise, **pending.**

**Only someone who signed onto the vow may confirm or contest it**, **at any price, including none.** They sign on:

- for a payment that is a purchase under a publication naming the vow (rule 12), by their own payer's claim;
- for a publication with no price tag, by a signature act naming the publication.

**A vow nobody signed onto carries no state.**

**What a vow covers.** A vow covers anything MOR cannot hash, existing or to come: a good in stock or to be made, a service, an hourly rate, storage, a seat. **Every sale of a physical good or of a service names a vow** (a publication's `[ 3, vow ]`), **unless its delivery is proven** (a proven delivery, under the access form, rule 11), so each such sale is pending, confirmed or contested. One form for one task. *MOR needs a structured way of selling something that has no bytes, or no bytes yet.*

**A proof may sit inside a vow as evidence.** A promised sale may carry a proof of delivery beside the buyer's confirmation or contest: it is evidence, shown, and replaces neither. The sale's state is still the signer's confirmation or contest alone. How a proof is carried and shown is the cMIP's.

**Promises, and bundles.** A vow holds one or more promises. A seller bundles them as it chooses, in public: a season, a series, a single match. What each promise is, and how promises are listed, is the vow's words or a cMIP's.

- **A contest names the sale it contests**, never the whole vow ("Contest (type 14)"). **Naming the promise that failed is optional** (field 1): a buyer may know only that something went wrong. One failed match marks one buyer's sale contested, not the season's every sale.
- **A confirmation likewise names the sale** it confirms. A buyer's claim of a payment is that sale, so a confirmation made there names it; for a free sale, the buyer's act acknowledges both the act about the vow and its own signature act on the publication.
- **What a buyer is owed back when part of a bundle fails is set by the bundle's terms**: the publication's words, or a cMIP's. The core fixes no partial refund.

**A vow names what is promised to the buyer, never the event itself.** A place in the stand to watch a match is one vow; access to a stream of the match is another; neither is "the match". **Two vows on one event stay separate**: neither references the other. This is how they are made, not a check a verifier runs: a vow naming another stays valid (below). **Each may reference the event, where the event exists on MOR as an act of its own** (in its `refs`, Envelopes), never as a vow, since a vow names what is promised. A reference carries no claim, no stake and no marking under rule 14. Each vow sits under its own ownership; whether an ownership agreement claims a vow, and how its rights are managed, is its signer's business.

**A vow's reference to another vow is not an act about it.** Any vow may still name another in its `refs`; that reference moves none of the other vow's sales' states: acknowledging the referring vow confirms no sale of the vow it names.

These hold too:

- "an act about the vow" is one of its versions, or a valid act naming its name in `objects` or `refs`, except another vow naming it in `refs` (above);
- a contest prevails over a confirmation and voids nothing;
- a free sale is confirmed by any valid act of the buyer's acknowledging such an act;
- a sign-on by signature is by anyone other than the publication's own parties;
- a payment whose buyer signed nothing the verifier holds, or committed only a bare key, is a purchase nobody signed onto, listed, with no state (a stated cost of rule 22).

**Everything about the substance is the cMIPs'**:

- what is claimed or delivered and how it is confirmed;
- what a vow became and how claims reach it (an ordinary claim, dated by itself under rule 7, so nothing is backdated);
- quantities and seats;
- delivery points;
- kinds;
- and streams (the live media cMIP).

*By keeping the grammar lean, the same tools serve every kind of event or service; the cMIPs a specialized fork uses decide the rest.*

**Rule 7 speaks of works only:** a claim on a vow's name covers nothing it became.

#### Rule 14. A sale is tied to the seller's ownership agreement, not to the work's claim alone

The core cannot tie a sale of a work to the one ownership that is right. It ties a sale to the ownership agreement its publication names, and makes a sale outside the claim's ownership agreement visible to those it concerns.

A publication, or a bare bake's price tag, for a work whose claim an ownership agreement targets, not signed under that ownership agreement, is a valid act that visibly contradicts it:

- the ownership agreement's holders contest it;
- a keeper has the claim on record;
- the seller's own split shows what they took.

**A payment following such a publication or tag is a purchase under it, read as the signer's own sale and shown outside the ownership agreement whose claim it contradicts; nothing is owed back to the buyer for it.** *The buyer whose client showed the contradiction before paying keeps what they bought; the other owners' remedy is theirs, and the greed is legible.*

*The bits and bolts are all in the core: claims with order, ownership agreements, contests with standing, keeper records, the signed split, and the payer's claim. A client that refuses to buy from a publication outside the claim's ownership agreement, or a reputation service that reads contests, can be built on them, and adoption decides.*

*Client conformance.* A client SHOULD show such a publication or tag as outside the claim's ownership agreement.

**A vow's name is read as a work's.** A publication selling a vow whose name a claim binds, where an ownership agreement targets that claim, not signed under that ownership agreement, is the same valid act visibly contradicting it, shown as outside it. One rule for anything sold under a claim, bytes or not: a buyer sees that the seller is not the ownership agreement claiming the vow.

"Signed under that ownership agreement" is read as a publication naming a version of that agreement's line (its field 1), the agreement having signed it as a party (rule 11). A lone seller's publication is under none.

**A vow has an owner: its signer.** An ownership agreement whose target is a claim on a vow's name gives the vow's signer the whole stake in its founding version; its terms giving it otherwise are invalid, signed by every party or not, where the verifier holds the vow. Under such an agreement the overhead (a platform's share as a partner, a helper's share, a fee) comes off the top (rule 22), what is left is the owner's, and a version that pays the owner less needs the owner's signature (rule 48). **A publication selling a vow that no ownership agreement claims has the owners' side rule 11 gives any publication: naming no ownership agreement, it is a lone seller's, its drafter its owners' side and its owners' line the drafter's** (rule 11). *Stated cost: a vow's owner is paid by a publication of her vow only where she drafts it, is one of its partners, or claims the vow under an ownership agreement it names; a platform's publication of her vow with none of these pays her nothing, and her client flags it, "No owner", before she relies on it.*

*Somebody owns the vow.* *A worker's vow, a job booked through a platform: she claims her vow, and her ownership agreement gives her its stake; the platform's publication names that agreement as its owners, the platform a partner taking its share off the top; what is left is hers, her agreement signs the publication as its owners' side, and the platform raising its share needs her signature.*

- From its founding version on, the stake moves as any stake moves: by its holder's transfer (rule 10), by succession (rule 89), or by a version its holder signs (rule 48), so the owner may sell or share what she owns.
- **A publication selling a vow that it does not pay the vow's owner.** A publication naming a vow counts whether or not it pays the vow's signer: how a platform or a marketplace sells others' vows is a cMIP's. The core only shows such a sale where an ownership agreement claims the vow (above); the owner's protection is her own signature, and what her client shows before she signs (her client flags a publication selling her vow that pays her nothing: "No owner").
- The vow's signer is read from the vow the verifier holds, by its name (its genesis). A verifier that does not hold the vow cannot tell its name from a work's hash, and judges nothing, as for a publication's `[ 3, vow ]` ("Publication (type 6)").

*Budgets are not vows: the vote that decides where a common budget goes is a cMIP's; the projects answering the need make vows, each sold by a publication with its owner, which the budget pays.*

**After the fork of a collective, the original's shares in works pass to the successors in the shares the fork act gives them (rule 91): a successor's publication under the work's ownership agreement is under it, as a holder, never outside it.**

*Stated cost:* a resale under a fresh vow escapes this marking. A holder of a claimed piece who signs a fresh vow for the same object and sells under it is marked by nothing here: this rule reads only publications naming the claimed vow, and the core cannot tell that two vows describe one object, since the object is what MOR cannot hash. Catching it is the provenance cMIP's, with registries and reputation. The point of cheating stays easy to find: it is the fresh vow, signed by the reseller.

#### Rule 15. One ownership, many publications: money passes layer by layer

*In short: each publication pays its partners off the top, then gives the owners their line, divided by the ownership agreement's shares, read by reference; an owner that is a collective, or another ownership agreement, splits again behind it.*

*How it runs most of the time:* the owners sell through their own publication, and their line is divided by their shares.

**One work, one ownership agreement, many publications.** The same owned work may be published in several places, each publication with its own price tag, partners and split. **The owners' shares are the same in all**: every publication reads them from the ownership agreement it names (rule 12), never copies them.

A sale through a publication is divided once, by its split service: **partners first**, each by its share; then the role, metric and fee shares the split plan names, all off the top; **then the owners' line**, divided among the holders of the ownership agreement's stake by their shares (rule 22). Nobody on the publication's side changes the owners' line alone (rule 27). A partner holds a share in the publication, never in the work, by construction. Recoupment and every other shape are the publication's split cMIP's.

**Money passes layer by layer**: a pool (a subscription service's, splitting by its stated rules; freeze scenario 7), then each publication, then the owners, then, behind an owner that is a collective or another ownership agreement, its own owners, as many layers as the agreements chain. *Money is split envelope by envelope, deal by deal, and can reward more participants than the work and the publisher: the pipe too.*

**An owner that is a collective is paid at the collective's own payee pointer**, which leads to the split service its own split agreement names; *it adds one layer of splitting when the money gets to that identity.* The collective's split agreement then divides what arrives by the collective's own stake, read by reference to its ownership agreement.

**An owner that is another ownership agreement** (a manifest's parts, rule 7) **is paid through it**: the split service divides that owner's part among that agreement's holders by their shares, read by reference as the owners' line is (rule 12), the receipt naming that agreement's version too. A part holding nothing on its line of the split is paid nothing.

**A collective's own split agreement.** A collective names the service that receives its income by a split agreement: a publication whose first version sells nothing (field 0 absent), naming the collective's ownership agreement (field 1), a split service and a split plan, with partners where it pays any. *The split service is an agreement that points to the ownership of the collective, to attribute shares, as a publication does.* It is the collective's protected clause: signed for the collective under the judicial tier's rule, every member whose voice remains (rule 67), since it can move money. **A version of it that is an owners' matter** (rule 95: what it pays the stake, the collective's own part among it) **counts once the stake's holders consent as their holders' rule asks** (rule 94), each by a signature act naming the version, beside the members' signatures; and every holder it pays less who has no voice signs it (rule 48). *A collective that operates with a single wallet names none; its income stays at its pointer, and spending it is its business under its rule for Money.*

**Where a collective names a split agreement, its payee pointer counts, for Agreements, only where its addresses and vault entries are the split service's** (rule 16).

**Any agreement may be a party to another.**

- **Any agreement may be a party of any agreement**, consenting by its own rule. An ownership agreement signs a publication where every party of its version in force signs it, a party that is itself an agreement signing the same way (a deal); a collective signs through a member, under its rule for Agreements (rule 60).
- **As a party it holds what the agreement gives it**: an owner's share, a partner's share.
- **It is named by its line**: its founding version, never a single later version. Every later version of the inner agreement carries what it signed outward, and cannot escape it by re-versioning. *What happens in that envelope is separate from the publishing deal.*
- **No loops.** An agreement is never a party of itself, nor an owner of itself, directly or through others: terms making one so are refused; a verifier that cannot follow every layer of it answers unknown.
- **Nesting is bounded at 8 layers**, a freeze parameter ("Parameters").
- **When an inner agreement ends, its shares move by ordinary acts, and what is still owed stays visible:**
  - **A collective is liquidated by ordinary sales and transfers before its closing**: each share it holds sold or moved by a transfer (rule 10), or released (rule 55). The closing (type 20) still counts only once the collective holds nothing (rule 91). **An absentee's money share follows the collective's own rules**: its split agreement, its absence clause, its terms, written before anyone left. What those rules could not deliver stays visible as an open obligation wherever they sent it, until a valid claim appears: never lost, never taken ("Closing (type 20)"). The closing needs no entry for it; its field 4 stays for money owed back. No new field. *Batching those acts together is a client's or a cMIP's convenience, never a second way in the core.*
  - **A deal ends, or winds down, by a clone every party signs** (rule 47), **stating its new conditions**: where its shares went, and what is still owed, as open obligations. What those conditions are depends on the deal. **A deal has no closing act.** A party who is absent is handled by the absence rules: in a deal, one identity judges absence (rules 85 to 89).
  - Either way, a publication keeps reading the inner agreement's line, its own terms unchanged.
- **A manifest neither claims its parts nor is reached by their claims** (rule 7).

*A deal's last clone needs nothing new: it is an ordinary clone of a deal.*

**Responsibility ends at the owner's pointer, in every chain of agreements.** A split service paying an owner pays the owner's pointer, or, for an owner that is another ownership agreement, its holders through it, and its responsibility for that payout ends there, Money's receipt the proof: a publisher's publication paying a work's owners, an agency paying a production company paying its crew, a compilation paying its parts. What follows is the receiving owner's alone. *The network is segmented so that the point of failure or cheating is easily found.*

**A compilation is a layer with its parts' consent, a derivative without it.** With the parts' ownership agreements among its owners, a compilation (a course of lessons by different teachers, an anthology) is a layer: it pays each part through its ownership agreement, and its responsibility ends there. Without their consent it is a derivative: its own work, paying its sources by its own publication, its signed splits showing whether it honours them.


### 4. Splits

How a split service runs is defined by the split cMIP its publication names (publication field 9, task 8; or the split plan's key 1). Agreements keep only the vocabulary and the guarantees below.

*In short: who names the split service, what it signs, and what it is handed.*

#### Rule 16. Named by the publication

A publication names its split service (field 3): the identity that receives every payment under it, divides each one by its split plan, and pays everyone. The service is a party: it signs the publication to accept it (rule 11), with any limits the parties choose in the publication's terms (for example how long it may hold money, or which rails it may use).

**The service receives in its own name.** The publication's price tags, which the service signs or a party it designates signs, name the service as their payee (Money rule 18), so a payment goes to the service's own payee pointer and vault, and the service signs its receipt as the payee of that hop, with its own key, naming in field 9 the ownership agreement and the version whose shares it pays (rule 12). *No partner holds others' money: the split service pays everyone, and no service signs in anyone else's name.*

**A price tag whose payee is not the split service bypasses it.** A payment to a pointer that bypasses the service is still a purchase; the pointer is shown as bypassing, and **what every other share of that payment would have been under the split plan is an open obligation of the identity that received it** (rule 30), shown beside the pointer. *The amounts are the plan's and the receipt's, both held.*

**A collective's split agreement and its pointer.** Where a collective names a split agreement (rule 15), **the collective's payee pointer counts, for Agreements, only if:**

- every address in it also appears in the split service's own signed pointer in force;
- and every entry of its vault in force appears in the service's own signed vault;
- or both appear in those of a backup the split agreement names (field 11).

In each case one service carries every address and every vault entry.

An address is a rail, a rail Module and the address bytes it reads (Money, payee pointer). That is how money reaches the service (Money).

*Client conformance:* an Agreements client, and any wallet reading Agreements, checks the pointer before paying, and shows a pointer that bypasses the split service as such, never as an ordinary pointer.

*Stated cost:* a wallet that reads only Money cannot check it, and pays the pointer as it stands; payers who want the protection use wallets that read Agreements.

*Make it legible: a bypass needs the service, or the party the publication designates, to sign, publicly, for an address that is not its own: collusion in plain view. Set aside: a "receiver" field (anyone can write any name next to their own address); a pointer delegating to another identity's pointer (cleanest, but a change to Money and every wallet); sending every buyer's claim to every owner (it reveals buyers).*

*Payer-side splitting, where a payer's wallet paid each owner's own pointer by the shares, is not a core model: a price tag names one payee, which any wallet can pay, and the split service pays everyone. Owners who want less exposure choose services that pay out at once (rule 32).*

#### Rule 17. The split task, handed to the split cMIP the publication names

The split task is handed to the split cMIP the publication names.

*How it runs most of the time:* one split service, field 3's, receives every payment.

**The split service, its backups in order and what counts as a failed attempt are fields of the publication, read by its split cMIP**, signed with it by every party (fields 3, 11 and 12).

**Attempts run per payment, not by stages:**

- each payment is tried at the first service (field 3's, the tag's payee);
- only if that attempt fails, as the cMIP defines failure, is the next tried, and so on;
- **the next payment starts again from the first.**

*A chain of judgment has stages; a chain of backups has attempts, each only if the one before failed, and every payment starts again at the first.*

A payer's obligation ends when the payment reaches the first service in order whose attempt succeeds, Money's receipt the proof.

**Every payer tries the services in order**, a layer above as a buyer: it pays the tag's payee, and, where that attempt fails as the cMIP defines failure, the next backup, the payment still naming the tag. **A backup receipts in its own name**, as the first service does, and splits by the same plan.

**The task:** the cMIP accepts the publication and the attempts made for a payment, and produces the receiver for this payment.

**The guarantee, the core's: money goes only to an address the parties signed.**

- A cMIP chooses among the services the publication names (field 3's and field 11's), never invents one.
- A payout to anyone else on the owners' line is a mismatch (rule 27), whatever any cMIP answers.
- Where every attempt fails, the money stays where it is, an open obligation of whoever holds it (rules 24, 30).

*What counts as failure depends on rails and services, so it is the cMIP's arena. A verifier that does not hold the cMIP, or its answer for a payment, reads a payment to the first service as received under the publication, and one to a backup as unknown, never as a mismatch, as a client not holding a judge's specification shows its question as unknown (rule 35).*

#### Rule 18. Each participant's check

Once a purchase triggers the publication, each participant checks: **is my cut at my flow address, or at my vault where needed?**

Its cut is what the splits that follow the purchase assign it, layer by layer (rule 15): its payouts in each split naming the payment, signed by a service the publication names, field 3's or a backup's.

It has arrived when its own receipts, valid, each with the rail's answer, place that much at its payee pointer or at an entry of its vault (Money rules 1, 3).

Where the trail stops short (no split yet, a split that breaks the plan, a payout with no receipt of the participant), the check says where, and the shortfall is the service's open obligation (rule 30).

#### Rule 19. What it receives

The split service receives:

- the incoming payment (an ordinary Money payment, for which it signs the receipt);
- any payer's claim for it;
- the split plan from the publication, and the shares from the ownership agreement it names;
- the evidence for role shares: the referral the payer signed in its claim, and any act offered as a helper's evidence (a relay's delivery record, a service's use record) once the claim of the payer the payment commits to acknowledges it;
- and, for a rail Module, the receipt or claim naming it.

*A Module is a specification: it signs nothing.*

*In short: what the split service must do with every payment it receives.*

#### Rule 20. Sign a split

For every incoming receipt, and for every payer's claim that shows money arrived without one, the service signs a split. The split is signed with its own key, names that receipt or claim, and lists every payout.

**It delivers the split to every holder and partner it pays, departed or not, and names each fee and who received it** ("Split plan and split"). A split not delivered to a holder it pays is shown so.

#### Rule 21. Conservation

A split's payouts MUST sum exactly to the amount received, in the unit's smallest part. **A split that does not sum exactly is invalid.**

Under the default rule, every leftover unit goes exactly where rule 9 sends it, so a unit sent elsewhere is a deviation.

The split cMIP declares its remainder rule; where it declares none, leftovers follow rule 9. A declared remainder rule MUST NOT depend on the order in which holders are listed.

#### Rule 22. Role shares with evidence

**Every share paying anyone but the owners, a partner's share, a role share or a metric share, is paid off the top only, as overhead; what is left, the owners' line, goes to the owners alone, by their shares. A plan putting a non-owner in the rest is invalid.** *Subtle ways to dilute are stopped: shared ownership means shared fruits.*

**A collective may keep money for itself, off the top of its own split.** Its split agreement may name the collective itself as a partner. That part is the collective's own money, kept, and never split again: it is **paid to the collective's vault** (Money rule 2, "The vault"), never to its flow pointer, which leads to its split service and would split it again. A split agreement naming the collective as a partner is invalid where the collective declares no vault; a verifier that does not hold the collective's identity chain answers unknown. Raising that part pays the holders less, so it is an owners' matter (rules 48, 95); **spending it is the collective's business**, done under its rule for Money. *A rule that "the reserve pays no member without the owners' agreement" is not one a verifier can decide, money at the collective's pointer being fungible; what the owners get instead is sight (rule 57).*

*In short: a role share pays a helper known only at payment time, and, save a rail Module's, it counts only when the payer's own claim vouches for the helper.*

*How it runs most of the time:* the parties name in advance the helpers they pay (a host, a mastering service), as partners, and no evidence is needed. A role share pays for help known only at payment time, and **its evidence counts only when the payer the payment commits to acknowledges it**, in its claim for the payment: the payer chose the helper, and the payer's own signature says so.

Each role payout names who filled the role and the proof. The proof MUST be an act signed by someone other than the split service and the payee.

The evidence:

- **a referral**: the referral the payer signs in its claim (Money, the claim's referral field);
- **any other act offered as a helper's evidence**, a relay's delivery record (relay transport cMIP, "Delivery records") or a service's use record (Development rule 15), whatever cMIP defines it, **counts only when the payer's claim acknowledges it** (Envelopes rule 18: a Money act may carry acknowledgements). So no verifier needs telling which specification defines it, and every verifier gives the same answer.

For a relay's delivery record, **the object it names is the one the payment was for**, where the verifier reads the record's format.

One no claim acknowledges is evidence of nothing. A claim may acknowledge several, so several helpers can share one payment.

**The payer is the one the payment's own commitment names** (payment cMIP: an identity, an anonymous payer's bare key, or nobody): a claim of the same rail payment whose rail proof carries the commitment recomputed from it, its signer, or the bare key it carries, as payer. **It is never the payer a receipt names**, which the split service writes. Where the commitment names nobody, or the rail binds no payer, nothing can be acknowledged, and the share is one nobody fills.

*Stated cost: a payer who stays wholly anonymous, committing no key, cannot reward a relay or a service.*

**No service is paid on its own record alone**:

- a service the parties chose in advance is paid as a partner;
- a service the payer chose at payment time is paid by a role share only when the payer acknowledges its use record, as for a relay;
- a service evidenced only by its own record is not paid.

A service that worked unnamed is paid by whoever chose it: the parties (by naming it in a new version), the payer (through a client that carries the choice into the payment), or the relay or service that used it (by its own agreement with it).

*Whether a client carries a user's choices into the payment is good practice for client developers, the builders' choice, legible to those who look: a payer may pay the pipe if it wishes to.*

*A helper's own signature alone would let it claim help it never gave, and paying for usage invites faking usage; the confirming signature comes from the other side of the deal, as for a referral.* *Stated cost: a payer and a helper together can acknowledge help that never happened, which the parties bound by the size of the share they offer, as for a self-referral.*

A referral the service names on its own earns nothing.

*The exception: a rail Module.* **A rail Module's role share is the one exception**:

- its proof is the receipt or claim naming that rail Module in its field 0 (Money rule 20);
- it counts even when the split service signs it, provided that rail Module is one the payee's own payee pointer or vault names, where the payment was paid (Money rule 4);
- the payee is the identity the payment was made to: the split service.

A receipt or claim naming a rail Module the payee's pointer and vault never named is evidence of nothing, and counts for nothing as a receipt either (Money rule 4).

*The service cannot invent a Module: what it may name is fixed by the payee, publicly, and the Module's own rule checks the rail's proof. Requiring a third party's signature here would leave only the payer's claim, which payers make public by choice, so most uses would go unrecorded.*

*Stated cost: where the payee's pointer or vault names two rail Modules for one rail, whoever issues the invoice, here the split service, chooses which of them earns; the pointer shows it publicly, and the publication's terms can constrain it.*

Anyone can check the evidence afterwards.

A role share nobody fills follows the option the plan chose: to the owners pro rata, held open as an obligation, or to a named party. **Absent a choice, it goes to the owners' line**, shown before signing (Development rule 13).

**A role share is named by its role, never by a cMIP's hash**: a new transport cMIP needs no new version of every publication.

**Evidence is acknowledged in the claim written at payment.** *Client conformance:* a buyer's client fetches, asks the relay for its delivery record, and acknowledges it in the claim it writes at payment.

*Stated costs:* a record acknowledged after the split fills nothing. One record acknowledged by the same payer's claims for several payments counts for the first on the payer's sequence and is spent for the others (two at one position, on two devices, leave it spent for both).

Several fillers of one role divide it equally.

#### Rule 23. Pay out

Each payout is paid as a simple Money payment to the current holder of the share, or the partner, with its own receipt naming the split.

**A share held by a collective is paid to the collective's own payee pointer**, which leads to its split service (rule 15); **a share held by another ownership agreement is paid through it**, to its holders by their shares (rule 15). A share held by an agreement that names no holder cannot be paid until it does.

#### Rule 24. Keep what it cannot deliver

The service keeps what it cannot deliver as open obligations, visible until paid. Amounts below a rail's minimum are held until they add up to enough.

#### Rule 25. Payout fees

The split plan says who bears each payout's rail fee: each receiver by default, or the split service as part of its cut. **It may state a maximum fee per payout** (plan key 6); **where it states none, there is no cap.**

A payout is discharged when its receipt shows the amount minus a fee no greater than that maximum, where the plan states one (Money rule 21). A shortfall beyond it is an open obligation of the service (stated here, not in Money).

*Client conformance*: **before a party signs a publication whose split plan states no maximum fee per payout, its client MUST flag the absence**: where a receiver bears its payout's rail fee, any fee may then come off its payout, and no shortfall is the service's obligation.

*Flag the risk: whether to cap the fee is the parties' choice; the core keeps only that the choice is seen before signing.*

#### Rule 26. Batching

The publication's split plan, by its split cMIP's parameters, may allow the service to accumulate and pay out periodically or above a threshold, measured on the publication's time reference.

Every incoming receipt must still be matched by a split, so accumulation is visible. Payouts paid with one rail payment name the same batch in their receipts (Money).

*In short: what the split service may never do.*

#### Rule 27. Only the plan

A split service MUST NOT pay anyone outside the owners as the ownership agreement's version in force for the receipt names them, the partners, the roles as evidenced, and the fees the plan makes owed.

It MUST NOT change the plan: only the publication's parties can, by a new version.

#### Rule 28. Fees

*In short: a Module states its fee, but only the publication's own fee entry makes a fee owed.*

A Module states its fee in its own specification (Development field 7), machine-readable and informative. **Only a fee entry of the publication's split plan (key 9) makes a fee owed**, and nothing is forced.

The bearers (every share, fees coming off the top) consent by the publication's signatures: every party signs it, and a holder of the ownership agreement with no voice in the power that signs for the owners' side signs a version adding or raising a fee its share bears (rule 48), or, in a collective, the stake's holders' rule where that holder accepted one (rule 94).

A fee entry says when it applies: every payment, payments for a named bake, or payments by a named rail. **A split leaving out a fee its entry makes owed is a wrong split, and the fee is the service's open obligation.** The split's list of Modules (key 6) is the service's statement, never what decides.

#### Rule 29. Attention

A split may follow plays, views or any metric a module reports.

**A metric share is paid off the top only, as overhead, like every share paying anyone but the owners** (rule 22).

The metric, its module and the resulting payouts are named (the metric and its share in the plan, the records in split key 7), so it is legible like any other.

The metric's evidence is a record signed by the identity running the service that measured it: never by the split service, and never by a Module, which signs nothing.

*In short: what the service owes when something is not paid, and how the parties change services.*

#### Rule 30. Open obligations

Each of these is an open obligation of the service, naming exactly one receiver and one agreement:

- every incoming receipt, and every payer's claim showing money arrived, without a matching split;
- every payout without a receipt;
- **every fee a split left out though its entry made it owed**;
- **every payout a seller receipted after transferring the share, owed to the buyer**;
- **every payment racing the publication's ending, owed back to its payer, from what the service holds of it** (rule 11).

And of another identity:

- **past what the service holds, what a party received of a payment owed back, of that party, in the share it received** (rule 11); where the owners' side is an ownership agreement, of each holder paid on its line, their own payout, a holder that is an ownership agreement through its own holders;
- **what the other shares of a payment to a pointer bypassing the service would have been, of the identity that received it** (rule 16).

**A metric's measurer is none of the identities the metric divides among, nor the split service** (rule 29). A metric pays only identities the plan already pays.

#### Rule 31. Switching services

The parties switch services by a new version of the publication naming another split service (field 3), every party signing it, the new service among them. The old service withdraws its tags (Money rule 18), and the new one signs its own.

**A backup the publication already names (field 11) needs no new version.** It receives a payment whenever the attempts before it fail, payment by payment, and the next payment is tried at field 3's service again (rule 17).

A collective switches the service of its own split agreement by a new version of it, signed as rule 15 says, and points its payee pointer at the new service (rule 16).

The old service still owes payouts on everything it received before.

#### Rule 32. The trust that remains

*Between receiving and paying out, the service holds other people's money. MOR cannot prevent theft, but makes it provable from the receipts and the payers' claims: hiding income requires the payer's silence or collusion. Parties who want less exposure choose services that pay out at once, under a split cMIP that says so.*


### 5. Time, conditions and judges

#### Rule 33. Time

An agreement that needs deadlines names its time reference. "Past its terms" is judged against that reference only.

**An anchor shows a deadline met, never missed.** An anchor of the act itself (Envelopes, task "Anchoring"), at or before the deadline's point on the agreement's time reference, shows the act made in time. An anchor shows only that something existed by a point, never that it did not exist before.

**A keeper's anchored record shows a deadline met too.** An anchor of a keeper's record shows that record, and every record before it in the keeper's sequence, to have existed by the anchor's point (rule 41); so a record of the act lying, in the keeper's sequence, at or before a record anchored at or before the deadline's point shows the act made in time.

**A deadline is shown missed only by a keeper's anchored sequence**: the sequence of a keeper the agreement names, holding a record anchored at a point past the deadline's point, and no record of the act in its records up to and including that anchored one (rule 41). A keeper's word alone never says late: a keeper's sequence orders acts, it does not time them.

**Where the agreement names several keepers**, the agreement's rule for what counts as recorded (terms field 3, rule 38) decides, counted the same way for a deadline as for a rotation: the deadline is shown met when the keepers showing it met, as above, meet that rule; it is shown missed when the keepers whose sequences show it missed, as above, are enough that the rule can no longer be met by the others.

**An anchor of the act itself at or before the deadline's point shows the deadline met, whatever any keeper's sequence lacks**, with one keeper or several. *An anchor shows that the act existed; a keeper's silence rests on the trust rule 42 states.*

Where nothing shows it met or missed, the answer is undetermined.

*Only anchors place anything on the clock. What an anchored keeper's sequence shows about an act it did not record by that point rests on the keeper recording acts as they arrive: the trust rule 42 states. An act proving its own lateness, by naming something that exists only after the deadline, is not a mechanism of MOR 1.*

#### Rule 34. Conditions

An agreement may make an obligation or a payout depend on a condition, evaluated by the condition cMIP it names.

#### Rule 35. The chain of judgment

*In short: an agreement may name, for each judge, who takes over, in order, when that judge answers "unknown" or does not act in time; so a dead judge traps nobody.*

For each judge it names, an agreement may name, in its terms (field 21), the ones that take over, in order, when it answers "unknown" or does not act within its period. The ones that take over are:

- for a judicial task, other specifications;
- for a keeper's operator, an arbitrator or verifier, or the abandonment authority, other identities.

*The split service is no judge: its backups are attempts per payment, not stages (rule 17, publication field 11), and this rule's periods and deadlines do not apply to them.*

Everyone signs the chain with the terms: every party in a deal, every member in a collective, as for the whole judicial tier (rule 67).

*How it runs most of the time.*

**When a judge answers "unknown", the next in its chain is asked. The first answer that is not "unknown" is the chain's answer. No new signature is needed when it passes.**

- A condition cMIP's "unknown" and a time reference's "undetermined" are such answers.
- "pending" is not (Tasks).
- Where every one answers "unknown", the chain's answer is "unknown".

*A client that does not hold a judge's specification shows the question as unknown, as for any act it cannot judge. That is the client's ignorance, not the judge's answer, and it never passes the question down the chain: otherwise two clients holding different specifications would reach different answers.*

**A judge that does not act passes the question on too.** Each link names a period. Once the judge has been asked and has not acted within it, as the agreement's time reference judges it, the next may act. Where the time reference answers "undetermined", so is the chain's answer.

Within one link, a judge contradicting itself has answered "unknown", and the next link is active with no period to wait.

An arbitrator's answer is an act of the condition cMIP the agreement names (task 9).

*The rare cases, in detail:* periods and stages.

**The chain runs on the agreement's deadlines, stage by stage, per question, never per party.**

*There is no one party's deadline; there is an agreed deadline.*

A question is a disputed fork (rule 47) or any question put to the chain.

- **The first valid request with standing** (rule 54) **starts the active link's period**, measured on the agreement's time reference (rule 33).
- **Later requests on the same question join that stage** and start no clock of their own.
- **When the period passes with no answer, the next link is active, and every earlier link is void on that question.**
- **Only the active link can settle.** **A settlement signed outside its link's active window counts for nothing**: before the window opened, or after it closed.

*When the next judge is triggered, the previous one is void; the active judge settles.*

So two links never both settle one question. Where an earlier link settles after a later one took over, having seen its settlement or not, the later link's stands.

In detail:

- the question of a fork is its reference, the version the settlement requests name (type 22);
- the question of a request to a judge is its field 2 (type 25);
- each next link's period runs from the end of the one before.

The rule is the chain's, so it holds for every judge the chain serves, one active link per question.

**A request counts, and the period runs, only where it is public or sealed to the judge it names.** This holds for the request to a judge (type 25), and for the settlement request (type 22) likewise. A link of the chain the request never reached was never asked.

*It is a chain of judgment: a judge that fails is replaced by the one everyone already signed, so a dead judge traps nobody.*

### 6. Keepers

*In short: a keeper is a signed ordering mechanism serving proofs. It signs a sequence, this act, then this, then this rotation, and anyone holding a copy can check that order. A keeper orders; only anchors time.*

#### Rule 36. Named by the agreement

Keepers are chosen by the parties when they sign, so neither side can later substitute a friendly one.

- In a collective, the keepers change only with every member's signature (rule 67).
- A deal's keepers change only with every party (rule 47).

#### Rule 37. Records

A keeper records the deal and the acts around it as they arrive, one keeper record (type 2) per act, signed by its operator. Its records are everyday acts of its operator in one sequence, each naming the one before (Envelopes rule 13): the **keeper's sequence.** One act is recorded before another when its record lies before the other's record in the keeper's sequence.

**A keeper MUST keep one sequence for its records.** Records in two sequences of one operator are never ordered against each other, so a keeper's second sequence protects nothing against its first: a record counts against a rotation only in the sequence that holds the keeper's record of that rotation (rule 41). Each record is public, names the act's signer, which must be the act's own, and names the operator's previous record in `prev` (type 2).

A keeper's sequence is a signed order and nothing more: it places no act on a time reference.

#### Rule 38. Several keepers

An agreement may name several keepers and a rule for what counts as recorded: any one, a threshold, or all. Only the named keepers' records count as testimony.

**Each keeper's record is judged alone**, against that keeper's own record of the rotation (rule 41). The agreement's rule then counts how many keepers' records stand before their own keeper's record of it: under `[0]`, every keeper named; under `[1, k]`, at least `k` of them (`[1, 1]` is any one); under `[2, operators]`, each of the keepers listed (terms field 3).

#### Rule 39. Copies

Records are signed and hash-linked, so they can be copied anywhere and verified wherever they sit. If a keeper disappears, its records survive in every copy.

#### Rule 40. Keepers check homes

Before recording an act, a keeper checks the signer's identity chain at its homes, and records any rotation it sees.

#### Rule 41. What a rotation cannot erase, and what an anchor adds

A record counts against a rotation only if it sits before the keeper's own record of that rotation, in the keeper's sequence.

The act so recorded, even outside the kept ancestry or disowned, becomes a visible dispute rather than void (Identity rule 34). The keeper's record of the rotation, or of a revocation (rule 76), serves only as that point in the keeper's sequence; rule 42's conditions are those of the act recorded before it.

**A keeper MAY anchor its own sequence** (Envelopes, task "Anchoring"). An anchor of one of its records shows that record, and every record before it in the keeper's sequence, to have existed by the anchor's point. *Anchoring is optional; serious keepers will, and an agreement that needs deadlines may require it of its keepers in its terms.*

#### Rule 42. A record counts only alongside the act it names

A keeper record counts, for any rule that reads it, only if:

- the verifier holds the act it names;
- that act is valid as an act, and its signer is the identity the record names beside it;
- and the keeper is one named by the version, in force for the act, of an agreement the act belongs to ("Belongs to"), or, for an act of a collective placed against the collective's own line, one named by the collective's agreement, as "Made before, made after" says.

A record of an act nobody can produce changes no verdict.

**A keeper's own later rotation never undoes what its records placed.** A keeper's record that a rule of this MIR reads to place an act (such as rules 7, 33, 41 and 76, a deal's declaration line, and "Made before, made after", 5), or that a relied-on version's completeness rests on (rule 47), keeps the effect that rule gave it, whatever the keeper's later rotation disowned, shown as a dispute. *A witness chosen in advance cannot un-witness.* This is Identity's stated exception to its rule that evidence counts only while its signer's chain keeps it (Identity, "Evidence counts only while its signer's chain keeps it").

*What remains to trust is that a keeper records acts as they arrive. A keeper can delay recording a rotation while recording a thief's acts first, or record an act later than it arrived; nothing in the bytes shows it. That is trust in keepers, accepted and stated: choose keepers as carefully as homes. A keeper whose signing key is stolen is such a keeper until the agreement names another: the thief's records keep their effect as the keeper's own do, since a witness chosen in advance cannot un-witness; what the keeper's sequence held before its last anchor cannot be rewritten, and a second sequence orders nothing against the first.*

#### Rule 43. Keepers are always sealed

*In short: a keeper never needs an act's content, and is never given it for being a keeper.*

*A keeper only has to prove that an act existed before a rotation. For that it needs the act id and the signer, both on the act's outside, and a check of the signer's home, never the content.*

A client MUST NOT deliver an act's content key to a party because it is a named keeper. A keeper that must also judge content is named as an arbitrator or verifier as well.

*This is a rule for clients: key deliveries are private, so no one else could check it.*

#### Rule 44. Judging content is someone else's job

Where a third party must judge content (escrow and milestones, arbitration, regulated verification), the agreement names an arbitrator or verifier, and the parties deliver it the keys by ordinary key delivery.

### 7. Changing an agreement

#### Rule 45. Clone, never modify

*In short: an agreement is never edited. A change is a new version, a clone, that names the version before it and comes into force only when everyone it needs has signed.*

A clone is new terms naming the parent and the parent's latest act. *Client conformance:* the latest act is the latest the client holds; a verifier accepts any act of the parent's chain. Its mark (field 4) names each power its changes require (rule 64, or rule 47 for a deal). For each power, it names the parties whose signatures meet it (rule 65, or rule 47 for a deal).

A clone is a draft until all of these hold:
- every party its mark names has a valid signature act naming it, and every holder it names under a power counted among holders (`[5, stake]`, or a constitutional change rule counted among a stake's holders);
- every party it adds, and every party it makes a holder of an area it did not hold, has one too;
- every holder whose share of a stake it drops or lowers has one too, member or not (rule 48);
- for a version of a collective's split agreement, every holder of the collective's stake in itself it pays less, by raising what it takes off the top, who has no voice in the power making that change (a departed holder, a stake successor, a buyer), has one too (rule 48); **or, in a collective, where the stake's holders' rule reaches the change and binds that holder, holders meeting the rule have signed, its mark naming them** (`[5, stake]`, rules 64, 94);
- for an issuance, the stake's holders' rule is met, every new holder has one, and the offer's checks hold, or every holder of the stake has one (rule 96): pro rata issuance under the holders' rule is excepted from the bullet on shares dropped or lowered;
- for an owners' matter of rule 95, the owners' consent that rule asks for is given;
- every departed holder whose own stake plan it changes has one too;
- where it changes the release rule, every holder of every stake the parent defines has one too;
- where it changes a stake's holders' rule (field 30), every holder of that stake has one too, as the roster at the line counts them (rules 94, 65);
- the parent exists.

**A draft changes nothing.** *Nobody is added to a collective, or given an area, without their approval: a party added is bound only by its own signature (rule 1), and until it signs, the clone that adds it changes nothing.*

A complete clone closes the parent. Obligations before that point settle under the parent.

Where two complete clones of one deal share a parent, rule 47 says which version is in force. For a collective's agreement, rules 72 and 90 settle it.

#### Rule 46. A false mark makes a clone invalid

A false mark makes a clone invalid.

A clone is invalid, whatever signatures it gathers, if its mark:
- names other powers than those its changes require; or
- names, for a power, a signer who is not among the parties that power is counted among (for `[5, stake]`, and a constitutional change rule counted among a stake's holders, among that stake's holders at the line, rule 94); or
- names too few of them to meet it (as rule 65 counts them, by share where the rule is by share).

A mark naming a succession plan, `[3, party]`, is checked as rule 83 says.

Signature acts by parties the mark does not name bind those parties (rule 1), but do not bring the clone into force.

*The mark names exactly the required powers, never "one at least as strong": powers are not ranked against each other (an area held by one member is neither stronger nor weaker than a clone rule of two of three), so "stronger" could not be computed. It names identities, not signature acts: the signature acts name the clone, so the clone cannot name them. Every version thus says on its face who brought it into force and under which power, and any verifier checks it from the parent and the clone alone. Founding terms' field 4 already said the same thing: which signatures make them exist.*

#### Rule 47. A deal changes only with everyone's signature

A deal changes only with everyone's signature.

In a deal, the signing rule and the clone rule are every party (terms fields 4 and 5). A deal exists when all its parties have signed it. A clone of it completes only when all the parent's parties whose voice remains have signed it. Its mark names the clone rule, `[1]`, and those parties.

Majorities, areas and tiers belong to collectives. Rules 62 to 66, 67, 68, 90 and 91 apply to collectives only. So do the holders' rule and proxies (rules 94 and 97).

**What others relied on stands: a version relied on stays complete.** A deal has no line of its own, so nothing places its versions' signatures as a collective's line places them. Instead, once any party's or keeper's later act relies on a complete version, the version keeps its completeness for everyone, whatever a signer's later rotation disowns; the disowned signature is shown as a dispute, the relying act its place. An act relies on a version when it names it:

- a split service's receipt naming it in field 9 (rule 12);
- a split dividing by it (rule 20);
- a keeper's record of it (rule 37);
- a later version cloning it (rule 45).

*Checkable: the relying act names the version. Without it, a party who rotates and disowns its signature on a completed version would uncomplete it for everyone, the parent coming back into force under purchases and splits already made under the version.* A version nothing relies on yet is judged by its signatures as Identity judges them.

**A deal ends, or winds down, by such a clone.** A deal has no closing act. Its parties end it, or wind it down, by a clone every party signs, stating its new conditions: where its shares went, and what is still owed (open obligations). What those conditions are depends on the deal. A party who is absent is handled by the absence rules (rules 85 to 89; in a deal one identity judges absence): where the deal provides it, the declaration removes the absent party's voice (rule 89), and the clone completes with the parties whose voice remains; the absent party's stake is never reduced without it (rule 48).

*Stated cost: one silent party blocks every change to a deal, however large: one person can hold everything until all agree, as in deal making in everyday life. The ways out: the abandonment clause, whose declaration is not a clone, can remove an absent party's voice where the deal provides it (rule 89); succession plans; and, for many parties or a long relationship, a collective.*

*How it runs most of the time:* a deal has one line of versions, each a complete clone of the one before, and the latest is in force. A deal cannot break: it has no keys of its own, and a clone that is not complete, or whose mark is false, is a draft or invalid and changes nothing (rules 45, 46).

**Rarely: two complete versions of one deal.**

**The fork.** Rarely, every party whose voice remains signs two clones of the same version, neither descending from the other (two devices out of step, a careless client, one party in bad faith and another mistaken). Both are complete, and that version has two branches: a fork of the deal.

Then, in short: the reference holds while the deal has two branches; a new act may follow either branch, and counts; the parties settle the fork by one version that names every tip it drops; a settlement is final for everything its signers could see; and where the parties cannot agree, the judge of forks the reference names may settle it on a party's request. Each part follows.

**The reference.** While the deal has two branches, the version before the split is the reference. It is the last version every party agrees on, what a verifier reports in force, and the point the settlement names.

**Acts on either branch.** A new act may follow either branch, and counts. A payment, a split, a sale or a release naming a version of a branch is judged under that branch's latest version. One naming the reference is judged under the reference. Every party signed both branches, so what is done under either counts, in Agreements and in Money alike, which cannot be separated here. **For an ownership agreement, the shares a payment pays are those of the reference until the fork is settled**: a split service's receipt naming, in field 9, a version of the fork other than its reference is a wrong receipt (rule 12), the purchase under the publication standing.

*The buyer is protected from the parties' human error: the version before the split cannot always count, given the decentralized nature of the network.*

**The settling version.** The parties settle the fork by one version that names every tip it drops, signed by the parties of every branch. From it on, its line is in force and the dropped branches are not. A branch that grows settles nothing.

Only complete versions of the deal count here. A version is read as settling only once it is complete and is a version of this deal. A draft, or an act whose parent is no version of the deal, is nobody's version, and changes nothing.

The settling version is a complete clone:
- whose parent (field 11) is the latest version of one branch; and
- which names in field 26 every tip it drops: the latest version of each other branch, ascending, each cited in `objects` in that order after its parent.

It is signed by the parties of all the branches involved. Besides its mark, which names the clone rule and the parent's parties as for any clone of a deal (this rule), every party of each tip it drops whose voice remains signs it too. So no one on a dropped side is dropped without consent: everyone sees every option, everyone signs the choice.

**What a settlement could see.** MOR has no clock, so a settlement could see exactly what its history holds:
- its own line (its parent and the versions before it);
- each tip it names, with that tip's history;
- what it cites, a judge's settlement its request, each with its own history (what its `prev` and the predecessors its `objects` name, followed back);
- for a judge's settlement, the histories of the version it keeps and of the tips it drops.

Nothing else counts as seen.

A settlement counts only where it names every tip it saw. Where its history holds a version of the fork that is neither on the line it keeps nor at or below a tip it names (a newer version of a branch whose older version it names, or a branch it cites and does not name), it settles nothing, and is a plain version.

**Finality.** A settlement that counts is final for everything its signers could see, and nothing they could not see reopens it. These reopen nothing:
- a version on a dropped branch the settlement does not hold (uploaded late, kept back, or grown there by a party left alone on it);
- a whole branch the settlement never saw;
- a second settlement whose history holds it (made after it), whoever signs it, the judge of forks included.

Only a new version on the line the settlement put in force, complete as this rule asks (signed by every party whose voice remains in the version in force), changes the deal. A client may show such a late version as a leftover of a dropped branch; it changes nothing.

*Stated cost: whoever signed a version on a dropped branch that the settlement's signers could not see loses it, honestly forgotten on an out-of-step device or kept hidden on purpose; nobody who settled in good faith loses anything.*

Finality stands: a settlement is final against a complete branch its signers never saw. *A forked deal is not read as broken, as a collective can be.*

**Client conformance against hidden branches.** Every hidden branch passes through one point: a party signing two different successors of one version.

*Client conformance*: **before signing a successor of a version, a client checks, across all its owner's devices, whether its owner has already signed another successor of the same version; if so, it shows the first and does not sign silently; and a settling version the client signs names every successor of the reference its owner signed** (as a member's client does for a collective's endings, rule 91).

Proposing a version is signing it; the reference is the latest version both the settling version's line and every tip it names descend from; a successor is named where it is on the settling version's line or at or above a tip it names.

Accidental double signing disappears; what remains is deliberate, its trail public for good.

*Stated cost:* a newcomer on a branch the settlers hid is dropped by a settlement that does not name it. This is reached only by settlers who knowingly double-signed past their clients' warnings, their signatures public for good.

*Client conformance*: **before a newcomer signs onto a deal, her client looks for another successor of the version she joins, at the parties' relays and keepers, and warns her if it finds one.**

Every version on the line she joins is looked at; a successor a settling version on that line names (at or above a tip it names) was dropped for good and is not warned of.

*For deals that want more:* a keeper; nothing new in the core.

**Two settlements of one fork, neither holding the other.**
- Where both are the parties' settling versions: every party signed both, and the deal is tangled, on its reference, until a settlement holding both, and naming every tip, settles it.
- Where both are one judge's: a judge's two settlements of one fork, neither holding the other, both count for nothing. They are read as the judge answering "unknown" (rule 35): the deal stays on its last agreed version, and the next link of the chain of judgment settles, with no period to wait. The double signature stays visible, and a client shows it beside the fork.
- Where one is signed by every party and the other is a judge's: the parties' holds, and the judge's counts for nothing. The judge is a fallback a request activates, and a version every party signed is the deal changing by its own rule.
- Two links' settlements of one fork never both count: only the link active on the fork settles it (rule 35). A link whose stage on the fork passed with no answer is void on it. So where an earlier link settles after a later link took over, the later link's stands, whether or not the earlier one saw it. A settlement signed before its link's stage opened counts for nothing too.

Within one link, the rules above apply; and a settlement holding another is after it, the first final.

A judge has contradicted itself where its first settlements of the fork, read by history as any two settlements are read ("What a settlement could see"), keep different versions; one that settles the same way twice has not; a judge that contradicted itself speaks for nothing on that fork afterwards.

**A settling version naming a version this verifier does not hold** is read as a plain version until the verifier holds it. From then on it counts as a settlement. The deal stays readable meanwhile, forked or on its reference, and the parties may sign a correct settlement.

**A tangled fork stays on its reference.** A fork is tangled where, with no settlement that counts:
- a branch splits again; or
- three or more complete versions share one version; or
- two settlements of the parties compete; or
- a settling version is made from below its own branch's latest version, which it holds (one that does not hold it could not see it, and that later version loses).

The deal then stays on its last agreed version, the reference, until one settlement naming every tip it drops. The parties lose what the tangled versions changed, and must settle cleanly. Any buyer who paid under a version every party signed stays protected, as for a simple fork, the payment judged under the version it names; for an ownership agreement, its owners' line is paid by the reference's shares, as for a simple fork. *A stated cost, borne by those who kept signing two versions.*

**The judge of forks.** Where the parties cannot agree, the judge of forks the reference names may settle the fork. The reference names which of its judges settles forks: terms field 27, one identity among its arbitrators or verifiers (field 13). Where it names none, none does, and the deal waits on its reference. *A grant to act under specific conditions, here the condition being the existence of a fork.* Every party consented in advance by signing the reference, or a branch that inherits it.

The judge of forks acts only once activated by one of the signing parties: a settlement request (type 22), signed by a party who signed the reference, naming it.

Its settlement (type 23) names that request, the version of the fork it keeps, and every tip it drops. From it on, the kept version's line is in force, what grows on it included, as after a settling version. It is final as a settling version is, for what it could see, and counts only where it names every tip it saw.

It follows the chain of judgment:
- Where the judge of forks does not act within its period, the next link of its chain (field 21) takes over, with no new signature, as everyone signed the chain. The period is counted on the deal's time reference from the first request on the fork, later requests joining that stage (rule 35).
- An answer a link gives after its period counts for nothing in that question.
- Settling a fork is signing a fork settlement, so only an identity in the chain can settle. A link that is a specification signs nothing and passes the question on once its period passes.


Any judge speaks once per fork: a second settlement, whose history holds the first, counts for nothing.

What the request shows: that a party who signed the reference knew of the fork when it signed the request; never on the judge's own initiative. It does not show that every party knew, the party losing a branch included.

*Stated cost: on a bait branch, the party who made the bait knows of the fork and may request at once, and a judge chosen badly may settle before the other party has seen it; every party chose the judge, by signing the reference.*

**The keepers' record of who signed what, and in what order, is the evidence the judge weighs**, never an automatic "first wins". With no judge of forks named, the deal stays on its reference. The amicable path comes first: a version naming every tip it drops, signed by the parties of all the branches.

*A keeper or arbitrator settling a fork no party has asked about would reopen the bait branch through a colluding keeper; the request is what MOR can check, having no clock.*

*Settled only by a version naming the other branch's tip, so every signer saw the choice: under "the next complete version on one branch settles it", a party in bad faith could steer an unaware partner into settling the fork with a harmless change, and a verifier holding one branch only would see no fork at all; one act naming the tips makes the choice knowing and the settlement checkable. Its cost: field 26. Tips are what matter on the forks.*

*Why every party of a dropped tip signs: by accident the case almost never arises; on purpose it is a bait branch, a fork only one side knows of, used to take a newcomer's money, work, rights or name, then settle on the other side and drop them. Stated cost: a party of either branch can refuse every settlement and keep the deal on its reference; that is all it can do.*

*Why finality: treating a version nobody could see as possibly made before the settlement would reopen a settled deal, and break "only what a party can read can be used against them".*

**The alarms.** *Client conformance:*
- **a seller's client, and a split service, MUST raise the alarm when a payment names a version of the deal that does not descend from the version they hold, showing both branches and pointing to settling the fork;**
- a version they do not hold raises it too: an unknown version is the hidden fork the alarm exists for, to be fetched from the payer's relays;
- a payment naming an older version of the same line, with no fork, raises a plain notice, not the alarm.

*A fork and an outdated publication are not the same issue; alarm fatigue would teach sellers to ignore the alarm the day a bait branch shows up.*

*A payment under a publication names the ownership agreement's version it followed (Money, the receipt's field 9, and the claim's), so a purchase read under the other branch reaches the sellers as signed evidence of the fork: they are the participants who can look for the full picture once made aware of the need to look.*

#### Rule 48. No stake reduced without its holder

A clone can never reduce a stake without its holder's signature, unless the agreement pre-authorised it.

**A stake moved by succession is not a reduction, and the only advance permissions that move a stake without its holder are rule 89's**: a declaration of absence passes the stake to the stake successors the holder's succession plan names, or, where it names none, outcome 1 redistributes it.

**Nor is what a stake is paid lowered without its holder, where that holder has no voice in the power making the change.** For a collective's stake in itself, a version of the collective's split agreement (rule 15) that pays the stake less needs the signature of every holder of the stake it pays less who has no voice in the power making that change: **every holder who is no member: a departed holder (rule 68), a stake successor who received a share by succession (rule 83), and a holder who bought part of the stake (rule 10).** *A change paying such a holder less is a new version, and every holder it pays less who has no voice in the power making it signs it.*

For a work's stake, what a publication takes off the top is distribution, which the owners' side signs (rule 11): in a deal, every party (rule 47). *Stated cost: a holder of a work's stake who is no party, a buyer of a share, is paid the owners' line of each publication the parties sign, without signing it; who buys a share buys a share of the owners' line, and becomes a party only by a clone naming it.*

A member, who holds the power or chose it by signing the constitution, is left to the collective's own rules (rules 64, 65).

**In a collective, the stake's holders' rule may stand in for each signature** (rule 94): where the stake carries a holders' rule by share, and the change hits every holder of the stake alike, holders meeting that rule consent for every holder it binds. A holder it does not bind, one that never accepted it, still signs. What such holders consent to are the owners' matters (rule 95).

**No advance permission reaches what one holder is paid unlike the others.** A holders' rule the holder accepted, by signing or by buying, reaches what every holder of the stake is paid alike (rule 94); nothing reaches what one holder is paid unlike the others of the stake, which that holder alone signs. Abandonment never lowers what a stake is paid while the stake stays with its holder. A departed holder who vanishes does not block the collective's fees, because its stake moves: declared absent, which a declaration may do although the holder is no party (rule 85), to its stake successor, or, with none named, by outcome 1 (rule 89); whoever then holds it signs, or already holds the say. For a deal's holder who is no party, no advance permission reaches its pay: a deal carries no holders' rule (rule 47).

*Abandonment protects operational flow; it is not meant to change stakes or pay. What it can trigger in that regard is succession, the stake and its pay going to the successor.*

**A stake is paid less by any change that lowers what it receives from a payment or can expect from the split plan as written**: a partner's share added or raised, a role share added, unfilled roles sent elsewhere, the rail fee moved onto receivers, the maximum fee raised or removed, the split cMIP or its parameters changed, as well as a fee added or raised. **What a cMIP pays cannot be read from the plan alone, so changing the split cMIP or its parameters counts.** **A share added within a stake by an issuance under its holders' rule (rule 96) is not "paid less" in this sense; one added any other way still is.** **The collective's own part off the top (rule 22) is overhead like any other: raising it pays the stake less.**

*What money sees and money expects is what matters. Judged by effect: what reaches the stake from a payment, and what it can expect from the plan as written.*

**Since a split plan pays non-owners off the top only, the rest is the owners'**: a stake is paid less by anything taken off the top added or raised (a partner's share, a role share, a metric share, a fee), or by a role nobody fills sent away from the owners; never by a non-owner's share in the rest, which no valid plan has.

*The voices chose the power over the collective's split agreement; those without one did not, and what a stake is paid is what no choice of theirs may break.*

#### Rule 94. The holders' rule

*In short: a stake's owners may agree together, by share, on the changes that hit every one of them alike, where each of them accepted that rule; by default every holder signs.*

**A holders' rule per stake.** A collective's terms may say, for each stake they define, how its holders consent together (terms field 30). There are two forms only:

- **every holder**: each holder with no voice in the power making the change signs for itself, as rule 48 asks, a member consenting through the collective's own rules. This is the default, where field 30 says nothing for the stake (the forced default, one of the declared options);
- **owners holding together at least this share of the stake**, in millionths, counted by share.

**It reaches only the changes that hit every owner of the stake alike**: the owners' matters (rule 95). A change that treats one holder of the stake unlike another of the same size, or lowers one holder's share, still needs that holder's own signature, whatever the holders' rule says (rules 8, 48).

**It binds only the holders who accepted it**: by signing a version carrying it (a member, who may later leave; a stake successor, whose stake is born in a clone it signs), or by buying under it (a buyer, who accepts the holders' rule of the version in force where the collective's line placed its transfer, rule 10). A holder it does not bind signs for itself, as rule 48 asks.

**It is changed only by every holder of the stake** (rule 45), as the release rule is (field 24), and a holders' rule is added to a stake only so: the rule binds only those who chose it.

**How it is counted.** The holders' rule is counted among the stake's holders, members and holders who are no members alike, each by its share; the share asked for is of the whole stake, since no holder loses its say on the owners' matters by leaving the membership. A holder whose share is gone for good still counts against the rule until its stake moves (rule 85). The holders whose signatures meet it are named in the clone's mark under `[5, stake]`, and a false mark sinks the clone (rule 46). A proxy may cast a holder's vote as rule 97 says.

**Who holds what at the vote.** For the owners' matters, a transfer counts only where the collective's line placed it: an act of the collective on its chain acknowledges it (Envelopes, `acks`), or a record names it in field 3. Until then the seller holds, for the collective, what field 7 and the transfers already placed say. A vote counts **the roster at the line that puts the version in force**: the holders the version in force there and the transfers placed before that line name. So a seller and a buyer never both count: the line moves the share once. A transfer the line placed that the verifier does not hold leaves the vote **unknown**, never silently short. Money follows transfers as rule 10 says, unchanged: this is a vote, not money.

**A holders' vote registered by the collective's line is kept.** The signature acts completing an owners' matter are named by the record or rotation putting it in force (record field 2), and placed there; a holder's later rotation shows a dispute on the line and changes nothing. Owner votes are signed by signature acts, never by chain key.

**A deal carries no holders' rule.** A deal has no line, so nothing could keep a passed change from unpassing when one holder rotates: the holders' rule is a collective's only, and terms of a deal carrying field 30 are invalid. **In a deal, the version carrying an owners' matter names the transfers it counts** (terms field 31), as a settling version names the tips it settles; a transfer it does not name counts nothing toward it, and its seller holds for that version. *Agreements serve simple partnerships; more complex structures need collectives.*

*Stated cost:* *an owner bound by a holders' rule can be paid less without signing, where owners holding enough of the stake agree and the change hits every owner of the stake alike. What it keeps: no singling out (the change hits every owner alike), a vote in proportion to its share, its proportion in any issuance (rule 96), and the exit (rule 10). What it loses: the personal veto, and it bears its share of the majority's judgment. The majority paying a service it owns outside MOR is fixed by no rule, a stated cost judged by reputation (rule 68's disclosure). An owner to whom the veto mattered would not have accepted a rule by share.*

*Stated cost:* *a thief holding a holder's signing key can vote the holder's share once; once the line registers it, the holder's rotation does not undo the vote for the collective. The vote can pass only what hits every holder alike, the thief's victim included, so there is nothing to steal by it but the vote.*

*Stated cost:* *a buyer has no vote until the collective places its transfer; members can delay a hostile buyer's vote by not placing it, visibly, bounded by the next record any member draws.*

*Example: an owner holds 10% of a stake under a 60% rule; owners holding 70% take 5% off the top for a service; the owner voted no. Under every holder the no blocks it; under the rule the owner accepted it passes, and the owner is paid a little less, exactly as every other owner of the stake is.*

#### Rule 95. The owners' matters

*In short: what a stake's owners consent to together: what it is paid, new shares in it, a sale or release of the shares in works its income comes from, and what a fork's successors pay the owners they keep.*

**A stake's owners' matters** are the changes its holders consent to by its holders' rule (rule 94), or, where it is every holder, each holder with no voice in the power making the change by its own signature:

1. **what the stake is paid** by the collective's split agreement (rule 48), the collective's own part off the top among it (rule 22);
2. **an issuance in it** (rule 96);
3. **a collective's transfer (type 4) or release (type 5) of a share it holds in a work**, for the holders of the collective's stake in itself;
4. **a fork's completeness, where a successor's founding terms pay a kept holder less** than the original's agreement in force at the fork's line, for the kept holders of the original's stake in itself (rule 91).

*Every one of them hits every holder of the stake alike, so a holders' rule can reach it (rule 94). The core cannot tell "substantially all" the works from one song, nor a fair price from a token one; what a rule can say is who consents.*

**A sale or release of a share in a work** (3). A transfer or release of a share a collective holds in a work counts only once the owners of the collective's stake in itself who have no say consent: holders of that stake meeting its holders' rule, or, where it is every holder, each holder who is no member, by a signature act naming the transfer or the release. Those signature acts count where the collective's line placed them (an act of the collective acknowledging them, "Made before, made after", 2), the roster at that line (rule 94), and are kept there. *Without it, the members sell the works for a token sum to a collective of their own, and a departed holder's 25% of all the collective's income is "25% of nothing", unsigned.*

**A fork's successors** (4). For each successor, its founding terms and the split agreement its founding names first must pay no kept holder (a departed holder of the original, or a member whose voice remains on no side) less than the original's agreement and split agreement in force at the fork's line pay it, as rule 48 reads "paid less". The comparison runs between the original's stake in itself and the successor's, each its target's stake, read across the two collectives as the kept holders' stake: what each split agreement takes off the top, the fees each bears, and the split cMIP and its parameters. Where a successor's founding terms pay a kept holder less, the fork completes only once the kept holders consent: holders of the original's stake in itself meeting its holders' rule, or, where it is every holder, each kept holder paid less, by a signature act naming the successor's founding terms, as a holder who is no party signs a deal's version. **A kept holder's consent counts only where an act of the original in the fork's history acknowledges it**, as a closing relies on a release: placed by the original's line and kept there, so a kept holder's later rotation never unmakes a complete fork; one nobody acknowledged is shown, and the fork waits. *A chain-key ceremony per kept holder per fork would weigh on passive owners.* *With the same plan the check is met at once; with no kept holders there is nothing to check.*

**The way out against an owner who vanished** is the declaration of absence, which may name a holder who is no party (rule 85): its stake moves to its stake successor, who consents or not, or by outcome 1.

*Stated cost:* *a members' collective with departed holders and no holders' rule waits for their signatures on its sales and releases of works, and on a fork whose successors' plans pay them less, as its fee changes already do. Shared ownership means shared fruits.*

**Prices and publications are no owners' matter.** The price of what a collective sells, and whether and with whom it publishes, are the collective's business, decided under its rules for each layer (rule 60). Owners who have no say are protected by sight (rule 57) and by the exit (rule 10), never by a vote on prices. *Stated cost:* *the members can price every work at a token price, or at none, or publish it with partners taking most of each sale; publications and price tags are public, so the owners see it, and can leave. A vote on every price is not one owners could cast.*

#### Rule 96. Issuance, with pre-emption

*In short: a stake may take new owners, every existing share shrinking in the same proportion, if its owners agree by their holders' rule; each existing owner is first offered its own proportion on the same terms.*

**An issuance is a version of a collective's agreement that adds new holders to one stake and scales every existing holder's share by the same factor**, within rule 9's rounding, so no existing holder's proportion to another changes. It names the issuance offer it follows (terms field 32), changes no other stake, and changes no holder of that stake otherwise. It is an owners' matter (rule 95), decided by the stake's holders' rule (rule 94), and, where the stake has none, by every holder of it, members included, as rule 8 asks.

**It is pre-emptive.** Each existing holder of the stake is first offered its own proportion of the new shares, on the same terms as everyone else, by an **issuance offer** (type 26), an act of the collective naming the stake, the size of the issuance, its terms, its new holders and its period. What the existing holders do not take up goes to the new holders the offer names, in its shares.

**The pre-emption is waived only by every holder of the stake**: an issuance every holder signs needs no offer. **The holders may also waive it standing**: a standing waiver in the stake's entry of the holders' rules (field 30), set or removed only by every holder of the stake, as the entry is changed (rule 94); a buyer accepts it by buying, as it accepts the holders' rule. Under it an issuance names no offer (field 32 written `[0]`), is decided by the stake's holders' rule, and is complete, besides the powers its mark names and that rule, once every new holder it adds signs it. *A standing waiver changed only by every holder is still "only by every holder"; a venture issuing often need not wait out an offer period each time.*

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

*In short: a passive owner may hand its vote on the owners' matters to someone else, for one vote or until revoked; never its money, its property, or anything that needs every owner.*

**A proxy** (type 27) is an act of a holder of a stake naming a proxy identity and the stake, scoped either to one owners' matter, a version it names, or standing over the stake until revoked: the owner's choice when signing.

**The proxy's signature act on a version counts as the holder's vote under the stake's holders' rule** where all of these hold:

- the collective's line placed the proxy (an act of the collective acknowledging it, or a record naming it in field 3) before the line that puts the version in force;
- no revocation of it was placed before that line;
- it is the holder's latest proxy on the stake so placed: one proxy per owner per stake at a time, a new one replacing the old;
- **the holder placed no signature act of its own on that version at or before that line: the owner's own vote always beats the proxy's.** A signature of the holder's the line does not reach is no vote there, and leaves the proxy's standing.

**A proxy is revocable by the holder at any time**, by a revocation of the proxy (type 28), placed as the proxy was.

**The fence.** A proxy only votes, and only on matters a majority of the stake decides under a holders' rule: an owners' matter under the stake's holders' rule by share (rules 94 to 96), or a constitutional change counted among the stake's holders (rule 69). Never:

- on anything that needs every holder: changing the holders' rule (field 30), waiving pre-emption (rule 96), or a change that needs the holder's own signature (rules 8, 48);
- on the owner's money or property: taking up an issuance, selling or transferring the stake, signing a deal;
- through another: **no sub-proxies**, as a grant key signs no grant (rule 73); a proxy act counts only signed by the holder.

**Owners' votes only**: a member's voice is not handed on; members vote in person. **No instructions**: an instructed proxy is the owner's own signed vote, which anyone may deliver. **Collectives only**, as holders' rules are.

*A proxy can add a voice to a majority decision, never give away what is the owner's alone. On MOR no attendance is needed, so proxies have little use, and they are fenced.*

#### Rule 49. Exit

Agreements are always in core format, so activity on a fading cMIP moves by cloning the agreement onto another.

### 8. When something goes wrong

*The core never enforces; it makes default impossible to hide.*

#### Rule 50. Atomic where possible

Payment is acceptance. Delivery released by payment cannot be defaulted on.

#### Rule 51. Failure attribution

*In short: when a payment or a payout fails, the record names who and what failed.*

Money's receipts and payment claims name the hop and agreement that failed. A split's missing payout names the receiver and agreement.

Agreements define what follows: refund, redirection, contest.

#### Rule 52. Negotiation record

Two sides negotiate by negotiation messages (type 18). Each message is locked and signed, names the previous message in the thread, and acknowledges the latest one received from the other side.

The record is provably complete up to the last acknowledged message. A message acknowledged by the other side fixes every message of the thread before it, by the previous messages each names. It also shows the other side received them all.

Only negotiation messages make the record:

- a text act, a reaction or any other act naming the thread is no part of it, carries no acknowledgement (Envelopes rule 18), and proves nothing about its completeness;
- a negotiation message whose previous is not a message of the same thread is no part of the record either.

Two messages naming the same previous are a fork, visible and provable (Envelopes).

#### Rule 53. Disclosure by choice

Either party may disclose the record, by making the keys of its messages public (Envelopes: going public later).

#### Rule 54. Standing

A contest counts only when signed by someone with standing:

- a party to the agreement;
- a holder of a stake the contested act affects;
- a keeper, arbitrator or verifier the agreement names;
- the buyer of a purchase, for a contest of that purchase ("Contest (type 14)"); a payment of a bare bake's tag is a sale by the uploader, and gives its payer standing as a purchase does.

A contest never changes any act's validity, status or selection. It is shown alongside what it names.

*Reputation, arbitration and courts build on this record from outside the core.*

### 9. Public domain

#### Rule 55. Public domain

The owners may release a work by a release act (type 5). It takes effect at once, or at a future point on the time reference, its content key delivered then by an identity the act names.

A release does three things:

- **the claim ends**: nobody earns from the work as its owner any more, and no sale of it is outside a claim;
- **its history stays named**: the stakes it ends and the claims naming its creators;
- **its content key is made public**: anyone may carry or sell copies.

It needs every direct owner's signature, departed holders of a share in the work included, a collective owner signing by its own rules, under its rule for each layer a release touches. This holds unless the release rule says otherwise (field 24, set at founding, changed only by a clone every owner signs).

**The release rule is the holders' rule's first instance, and its threshold is counted by share**: "holders together holding at least this share of the stake", never a number of heads, so a holder splitting its share among identities it controls gains nothing. **A collective's release of a share it holds in a work is an owners' matter** (rule 95): it counts only once the owners of the collective's stake in itself who have no say consent.

**A release is permanent.**

**A claim the release does not name in its history is shown beside it**: made after it, or a competing claim, openly contested (rule 7), which the release cannot end.

*A work that belongs to no one, but traces its history.*

Its legal effect lies outside the core.

## Part two: collectives

### 10. A collective

#### Rule 56. A collective is an identity its members act for

A collective is an identity with its own genesis, homes and chain key, and **no signing key of its own** (Identity rule 1).

Its genesis declares its founding agreement (an Agreements declaration in the declarations slot) in place of a first signing key, and is signed by a chain key. That agreement is an ownership agreement whose target is the collective itself (`[1, null]`, terms field 33): it carries the members' stake in the collective, the key grammar of its chain key, who acts for it in each layer (field 19) and its finer areas (field 34). Every clone of it is the collective's ownership agreement too.

It uses the Identity MIR for its chain as any identity does: it rotates, and its homes receipt its chain acts. **It signs no everyday act: its members act for it, each with their own key, naming the collective** (rule 58), and Agreements judges each such act. *Collectives only have chain keys, and grant powers to the individual keys of their members: the collective grants powers to its members, not to keys. There is no member key.*

*Stated cost: a client knowing only Identity, or only Money, judges nothing a collective does; it shows every act for a collective unknown, and a Money-only wallet cannot tell whether a collective's own price tag or pointer counts. A buyer of a collective's work pays a publication's tag, signed by its split service, which a Money-only wallet can do.*

#### Rule 57. An act is done once sealed to every member and on the chain

A collective's act is done only once it is sealed to every member and on its chain.

*In short: what a collective does, every member can see, and it is written on the collective's own chain. Until both are true, the act is only a plan.*

An act for a collective, signed by a member or a grantee naming it (rule 58), is done, and binds the collective, only once both of these hold:

- it is sealed to every member: every party of the agreement in force for it is among its recipients (Envelopes, `to`), or the act is public; and
- it is on the collective's chain, citing its latest decision as its signer knew it (rule 58).

Before that, even signed, it is planning. It binds no one, its signer included. It counts for nothing in Agreements: signatures on it complete nothing, and an obligation it carries binds no one.

*A counterparty is safe once a later act of the collective cites its act, against everything but the collusion of an ending's signers, which stays visible* (rules 76, 79).

*Client conformance:* the member's client drafts the act, signs it, seals it to every member, and uploads it where the collective's clients look.

*Powers can be segmented, but information runs free: a continuous assembly where matters are exposed, which only bothers cheaters.*

*Stated cost: a collective keeps no secret from its own members. What a collective plans can stay with some members for a while; once done, it is a fact that touches everyone in it.*

**Owners without a say see the collective's Money acts.** For a collective whose stake in itself has holders who are no members, a Money act for it (a receipt, an obligation, a payout, a payee pointer, a price tag) is done only once it is sealed to every holder of that stake, members and others, or public, besides being on its chain; until then it binds no one. The holders are those the agreement in force for the act and the transfers its line placed name (rule 94). *Client conformance:* the member's client makes those acts public by default.

*Stated cost: more recipients per sealed act, or publicity; such a collective loses privacy from its owners only. The right of exit means little to an owner who cannot see why to leave.*

**A collective is sealed to by sealing to each of its members, or by publicity; no act is sealed to a collective's own key**, since it has none (Envelopes, "Encryption key"). Where a holder of the stake is itself a collective, the act is sealed to each member of that collective's agreement in force, or public; **where a holder is a deal, the act is public.** A deal has no line, so no verifier could tell which of its versions was in force when the act was sealed; publicity reaches every party of every version. Sealed to an agreement's own hash, or to the parties of one of its versions, an act reaches no holder that is a deal. Where a collective seals to the parties of an agreement it names elsewhere, "the version in force" is the version the act itself names. This holds wherever an act must reach a holder: a collective's Money acts here, and an issuance offer (rule 96).

**Where an act is held is never a condition.** An act is valid by its signatures, seals and citations wherever a verifier holds it. Relays are transport: they are where a collective's clients upload and look first, a matter of client conformance or of a cMIP (the relay transport cMIP), never of the core. A verifier states where it found each act as information only; no validity rests on it.

One rule covers every act for the collective, with no exception by type. That includes records, and forks and closings:

- a record not done is no line ("Record (type 17)");
- a fork or closing not done takes no effect (rule 91).

*The rare exceptions, in detail:*

- **Negotiation messages are the one kind not held to this rule.** They are talk, binding nothing, and on neither chain. They need not be sealed to every member, since planning is allowed to stay secret. The deal they lead to is signed, and that signature is an action, which must be done.
- **The collective's identity-chain acts (genesis, rotations) are done by Identity's own rules**: public and at its homes.

#### Rule 58. Two chains

A collective keeps two chains, both made of acts that name it: a decisions chain and an actions chain.

**A member acts for the collective with their own key, the act naming the collective in `objects`**: the collective's identity as chain, once for each act it cites on the collective's chain. **An act that does not name it is the member's own.** An act naming it counts for the collective only where Agreements finds its signer a party who may act there: a member meeting, with the others who signed it, the rule of the layer the act falls in, or of the area within it, under the agreement in force at the decision it cites (rule 60); or a grantee whose grant backs it (rule 80). **A stranger's act naming a collective counts for nothing, and is shown as nobody's**, as a stranger's act naming a grant is. *Anyone can write a collective's name in `objects`; it counts only where Agreements finds the signer acting within a power. And a member cannot later say "that was mine" of an act whose bytes name the collective, nor the collective claim a member's act that does not: the attribution is in the signed bytes.*

**The decisions chain** holds its genesis, rotations and records (which write its clones and register who joins and leaves), its grants and revocations, and its fork or closing. **Each decision names the previous decision in `objects`, as an action names the decision it acts under**, with the other acts on the chain it knows:

- a record, a grant or a revocation, in its `objects` on the collective's chain;
- a fork or closing, in its `objects`, after the entries its type defines;
- a rotation, which carries no `objects` (Identity), by the signature acts its Agreements declaration names, each of which cites the collective's chain as an action does ("Collectives in the identity chain").

**A decision naming none, or one that is no decision of the collective, is no decision.** The genesis names none, being the first.

**The actions chain** holds every other act done for the collective: debts, payments, bakes, publications, releases, sales, and its grantees' acts.

On neither chain are:

- negotiation messages;
- members' own acts that do not name the collective, Identity's acts among them. A collective's escape from a hostile home is Identity's: its homeless rotation, signed by its chain key, is its own escape endorsement (Identity section 11).

**How an action cites.** An action names, in its inside's `objects`, the collective's identity as chain, once for each act it cites:

- the decision it acts under: a record of the collective, a link of its identity chain, or, for a grantee, its grant (rule 73); and
- each other act on the collective's chain it knows that no act it cites already reaches, so that the next act joins the heads where several members signed at once.

These entries come after those the act's type defines, all on that one chain. Agreements' formats allow them there: signature, release, resignation, declaration, terms, publication. **A signer's own `prev` is never followed for the collective**: a member's sequences are theirs, not the collective's. *Client conformance:* a member's client cites, among the heads, its own last act for the collective.

**An act within its signer's powers counts for the collective as soon as it is done and cites the collective's latest decision as the signer knew it.** It is judged under the decisions its history holds (rule 72). A record it never cites decides nothing for it, save by the tie rule ("Made before, made after", 7).

**An action citing no decision, or naming on the collective's chain an act that is not on it, is on no chain of the collective, and counts for nothing.** **An action citing a decision is unknown while the decision it cites is not held, and counts for nothing where it is held and is no decision of the collective.**

*An act within one's powers in a collective is an act for the collective. The chain's role is to make acts unmissable, not to confirm them.*

**An act for the collective is placed on its line only where a later act for the collective cites it, directly or through acts that do; one nothing cites is outside every line.** **This decides what a line of the collective holds (an ending's, a record's, a rotation's through the signature acts it names), and nothing else:** whether an act counts for the collective is decided above, as soon as it is done and cites the collective's latest decision as the signer knew it. An act outside every line still counts; no ending, record or rotation holds it. *Client conformance: a client acting for a collective cites the latest decision and every head it holds.* *Citation places one act at a time on the line: that is its cost, made visible.*

*A member's act for the collective sits in the member's own sequence, so it stays in the member's kept ancestry, and the member's rotation can disown it: Identity rule 34, as for any act. What the collective's line placed stays placed for it, the disowned signature shown as a dispute ("Made before, made after", 4).*

#### Rule 59. Key grammar

The founding agreement says how the collective's chain key is held, according to the members' taste. **A collective has no signing key** (rule 56): the key grammar is the chain key's alone.

**The chain key** is held by one holder, by a custodian, or as shares: split so that any k of n members can rebuild it.

**Rotating with a shared chain key.** At rotation, k members bring their shares to one offline device, which rebuilds the key, signs once and forgets it. The same holds for the chain key that signs the collective's genesis (Identity rule 1).

*For that moment one device holds the whole key; that is the price, and it holds the next key too, before dealing its shares. Nothing can prove a device forgot a key.*

The Module that does it MUST deal the shares of the next key verifiably, and have them checked against the committed key before that key is relied on, so that the members' shares rebuild it. Otherwise the device's holder could end up the only one able to rotate the collective.

*Verifiable dealing stops sole control, not a copy; a copy kept is the price above, stated.*

**A key grammar MUST leave a way to rotate that survives the loss of any one key holder.** That way is either:

- a threshold below the member count; or
- a named recovery path: a custodian holding a share under grant, or an escrowed share released by the abandonment authority, which the abandonment clause names.

A key holder is anyone holding the whole key or a share of it: a member, a custodian, the holder of an escrowed share.

**Where one person holds the chain key, the agreement MUST name a successor (a seat successor in that holder's succession plan) and an escrowed share released to them under its succession or abandonment clause.** A single custodian likewise needs a recovery path held by another. *"No key of its own" is not "no key": the chain key still needs a way out that survives its holder.*

A grammar without such a way is invalid.

Two partners may choose "both", provided they name where a further share sits and who releases it. Whether the path works is the members' risk, stated.

*For a single holder, one construction: the key is split so that any two of four shares rebuild it; the holder keeps two and rotates alone, the successor and a keeper hold one each, useless alone. When the named authority declares the holder absent, the keeper releases its share and the successor rotates the collective to a new key; the succession clone passes the seat.*

**That succession clone also carries a succession plan for the successor, naming their own seat successor, signed by them in the same clone** (rules 64, 83). So the key always has a named successor, and the clone meets this rule.

*The successor signs the clone to join anyway, so the plan they add is signed by them; the escrowed share stays where the key grammar's recovery path puts it, released by the same clause.*

#### Rule 60. Layers and areas: who acts for the collective

**A collective's founding names, for each layer a collective acts in (Text, Envelopes, Money, Agreements, Development), who acts for it there: a rule in the form of every other rule of these terms. An act of the collective in a layer counts under that layer's rule, or under an area's rule where an area within the layer reaches it. A founding that leaves a layer unnamed is outside the format and founds nothing. Identity's acts of a collective are its chain acts, governed by the key grammar; it signs no other. The layer's rule governs the layer's everyday acts, and, in Agreements, grants and revocations, which reach no further than their issuer's power (rule 74); it never governs a clone, a fork or a closing, which take the rules their changes need (rules 64, 91), nor a record, which any member draws and which decides nothing by itself. A layer whose named actors have all left stands frozen (rule 71) until a clone names others.**

*In short: the founders write down, layer by layer, who may act for the collective alone or together; nothing about it is left unsaid. Finer areas, by act type, may narrow a layer.*

**The layers' rules** are terms field 19, a map keyed by layer number (1 Text, 2 Envelopes, 3 Money, 4 Agreements, 5 Development), each a rule in the terms' grammar: `[0]` every party whose voice remains, `[1, k]` any k of them (`[1, 1]` any one member alone), `[2, [+ hash]]` these named parties together. A founding whose map lacks one of the five keys is outside the format and founds nothing (rule 1); so is one carrying a key for a layer the MIRs do not define, so that no seventh layer is smuggled in before a later MOR defines it. A clone keeps every key too. *An app may offer to name every layer at once with the same rule; the founding still carries each layer named. Stated cost: one more step at founding, the app offering the usual choices.*

*Client conformance:* **before a party signs a founding, its client shows, layer by layer, what the rule lets one member do alone, Money first.** *The risk a silent default carried is between members, and a warning cannot make every member read it; a choice written and signed by all can. A collective of two artists who never thought about it should not find that either can point its income at themselves because they never thought about it.*

A collective's homeless rotation, signed by its chain key under its key grammar, is its own escape endorsement (Identity section 11): no member signs one.

**When an act counts.** An act for the collective counts in the layer it belongs to ("Layer") only where its signers meet that layer's rule, or the rule of the area within it that reaches the act: its drafter, who signs it with their own key naming the collective (rule 58), and the others, each by a valid signature act naming it (rule 6). Each must be:

- a party of the agreement in force for the act, and, for an area, a holder of it there;
- one who signed that agreement, or a version it descends from by complete clones; and
- one whose voice remains there for that act ("Made before, made after", rules 70, 71).

The rule is counted as rule 65 counts it. *So under `[1, 1]` one member's act counts; under `[1, 2]` one member's act and another member's signature, each with their own key.*

**An area's limits are a cMIP's.** An area may name a cMIP judging limits on its holders' acts, with its parameters (area key 6). It adds to this rule, never relaxes it: the act counts at the area's number only where the cMIP judges it within them, and as that cMIP asks beyond them. A verifier that does not hold the cMIP, or holds no verdict of it for the act, answers unknown for the area, and the act does not count there. *Capping an area is left to cMIPs; what the core keeps is this rule. A limits cMIP may add a second signature and make the first conditional: within its cap, the area's number; above it, one more holder's signature.*

**The agreement in force for that act** is the one rule 72 picks from the decisions its history holds.

An act of a layer or area that stands frozen counts for nothing (rule 71).

*Layers and areas are one construct at two grains: a rule for a whole layer, named at founding for every layer; an area that narrows it for single act types or operational fields, held by some members, with one set of rules for holding it, granting within it and changing it.*

**What a layer's rule reaches.** It reaches every act of that layer ("Layer"):

- the MIR's own acts;
- the acts of the cMIPs the agreement in force names for that layer's tasks;
- for Development, the acts of the extensions it names.

An area within a layer reaches the acts its kinds name, `[1, spec, type]`, each act of a type of that layer, and takes them out of the layer's rule. An act that belongs to two layers or more, of a specification named for tasks of each, is reached by the rule of each, or of the area within each that reaches it. It counts only when each is met, as a clone across two areas is.

**A layer's rule decides what the collective adopts for that layer** (rule 64):

- which cMIP fills each of that layer's tasks, save the judicial tasks. So the members the founding names for Money adopt a new payment cMIP; the rails beneath it are named by the collective's payee pointer, an act of that layer, or its vault;
- for Development, which extensions the collective adopts.

An area whose field references name a task (`[1, task]`) decides that task's cMIP instead.

**Specifications the collective has not adopted.** An act for a collective whose `spec` is a specification its agreement in force names neither for a task (field 2) nor as an extension (field 15) counts for nothing. The one exception: an area reaches it by a kind naming its type, `[1, spec, type]`; then it counts as that area decides.

To count, the specification must first be adopted, under the powers its adoption needs (rule 64):

- for an operational task, the rule of that task's layer;
- as an extension, the rule of Development with the rule of each layer it declares.

An act of a MIR is never such an act.

*Otherwise an unlisted specification would be a way around every rule: a member could act under a specification nobody adopted, around the rule of its layer. A rail is not adopted this way: it is named by the collective's own pointer or vault (Money rule 4). With adoption under the layer's own rule, waiting costs little.*

**The judicial tasks.** The tasks of the judicial tier (9 condition evaluation, 10 time reference, 11 anchoring, 14 absence proof) stay judicial, outside the rule for Agreements. Neither the rule for Agreements nor any other changes them. They change only with every member's signature (rule 67). That includes a version that also changes the constitution, which needs the constitutional change rule too (rule 64.1).

The rule for Agreements adopts the cMIPs for Agreements' other tasks (12 grant limits, 13 claims). *The split task (8) is a publication's: a collective names its split cMIP in its split agreement (rule 15).*

**A specification adopted for a judicial task is adopted for no other task, and is no extension** ("Areas"). So a judge is never joined to a layer's rule or an area.

*Each judicial task can decide who wins a dispute, and one member picking a friendlier judge after the fact is worse than a majority doing it.*

**Extensions.** An extension acting on another layer needs that layer's rule too, in the same clone, all at once. Its specification declares the layers it acts on (Development, specification field 10), so a client knows whose approval to ask (rule 63).

**Dropping an extension needs the same approvals as adopting it**: the rule of Development and the rule of each layer it declares.

*Modules and cMIPs are governed on the layer they sit in.*

The declaration is not trusted for enforcement. In a collective, a verifier applies an extension's rules only to acts of Development and of the layers whose rule its adoption met. So an extension that under-declares binds nothing beyond the layers whose members approved it.

Nothing an extension does relaxes the core (Development rule 20): the MIRs' own acts stay in their own layers, whatever an extension adds around them.

#### Rule 61. Every constitutional voice is covered

Every party whose signature a collective's constitutional change rule is counted among MUST be covered by the agreement's abandonment clause.

Those parties are: every party under the default or a threshold; the named parties under a rule naming parties.

A party is covered when the clause allows outcome 0, removing a voice, and its authority can declare that party absent. So a named authority does not cover itself.

Coverage is judged under the clause in force, one version for everyone (rule 67).

**Under a rule by share** (`[3, stake, share]`), those parties are every party holding part of that stake, so that every member whose share alone can block the rule is covered; under "all of", the parties of each rule in it.

**Under a constitutional change rule counted among a stake's holders**, holders who are no parties are counted too. A holder has no voice for the clause to remove; its share moves by a declaration naming it (rule 85). **Such a collective's abandonment clause MUST allow moving a vanished holder's share, outcome 1, and its authority must be able to declare each holder of that stake who is no party absent; otherwise the terms are invalid, as for a party.** *Better done upstream: the promise that a lost member never freezes the constitution, carried to owners.*

A founding agreement or clone of a collective that leaves such a party uncovered is invalid, as a key grammar without a way to rotate is.

*The constitution is the tier that can repair every other (reassign an area, revoke a grant, refit the key grammar), so it alone must never freeze; it freezes only through the loss of someone whose signature it needs. A member without constitutional power needs no clause: their loss is repaired from above. This is the promise that a dead member never freezes the collective, carried from the keys (rule 59) to the rules.*


### 11. Tiers and clones

*Nobody loses their say by default. Each part of a collective's agreement is changed by the power that owns it. Which power that is follows mechanically from the fields a clone changes, so every verifier reaches the same answer and the mark (rule 46) can be checked.*

**Tiers and areas apply to collectives only** (scope): to a founding agreement carrying a key grammar, and its clones. A deal has none: every clone of it needs every party (rule 47).

*Deals stay as simple as possible while remaining rich; collectives are for when things get complicated. Two people who end up doing many deals together can found a collective.*

#### Rule 62. Every field belongs to one tier

Every field belongs to one tier.

| Field | Content | Tier |
| --- | --- | --- |
| 0 | Parties | Constitutional (membership) |
| 1 | The words: the constitution's and general words | Constitutional |
| 2 | cMIPs, per task | Tasks 9 (condition evaluation), 10 (time reference), 11 (anchoring) and 14 (absence proof; its cMIP named in the abandonment clause's key 3): judicial, outside the rule for Agreements. Every other task: operational, under the rule of the task's layer (field 19), or in an area naming the task, and under the rule of each other layer the same specification serves. Task 8 (split) is never named here: it is a publication's. A specification named for a judicial task, or in field 6, is named for no other task and as no extension |
| 3 | Keepers | Judicial |
| 4 | Signing rule, or a clone's mark | None: each version states its own |
| 5 | Clone rule | Constitutional |
| 6 | Time reference | Judicial |
| 7 | The stake: its holders and their shares in the target | Operational |
| 8 | *Withdrawn*: once the split plan, now a publication's; never reused | — |
| 9 | Abandonment clause | Judicial |
| 10 | *Withdrawn*: once the concurrency rule; rule 90's default stands; never reused | — |
| 11 | Parent | None: every clone names its own |
| 12 | Key grammar | Constitutional |
| 13 | Arbitrators or verifiers | Judicial |
| 14 | *Withdrawn*: once the split service's grant, now a publication's split service; never reused | — |
| 15 | Extensions | Operational, per extension, added or dropped: under the rule of Development, and of each layer the extension declares in its specification (Development field 10) |
| 16 | Succession plans | Judicial |
| 17 | Refund terms | Operational |
| 18 | Constitutional change rule | Constitutional |
| 19 | Layers: who acts for the collective in each of the five layers | Constitutional |
| 20 | Area words, per area | Operational, in the area whose id it carries |
| 21 | Chain of judgment | Judicial |
| 22 | Departed members entry | Constitutional; it records only who is departed, the stake being in field 7 |
| 23 | Forked from | None: founding terms only |
| 24 | Release rule | Operational, in no area: the clone rule, and every owner's signature |
| 25 | *Withdrawn*: once the relays; never reused | — |
| 26 | Settles: the tips a deal's settling version drops | None: a deal's clone only; deals have no tiers |
| 27 | The judge of forks | None: a deal only; deals have no tiers |
| 28 | *Withdrawn*: once the fees, now a publication's split plan's; never reused | — |
| 29 | *Withdrawn*: once the split service's backups, now a publication's; never reused | — |
| 30 | Holders' rules, per stake | Operational, in no area, as field 24: the clone rule, and every holder of the stake whose entry changes; changed by nobody's majority (rules 45, 94) |
| 31 | Transfers counted | None: a deal's clone states its own; deals have no tiers |
| 32 | Issues under | None: each issuance names its own offer; its change of field 7 is an owners' matter (rules 95, 96) |
| 33 | Target: a claim, or the collective itself | None: founding terms set it, and every clone repeats it |
| 34 | Areas, finer than a layer | Constitutional |

An area's field references (area key 4) name only operational fields and tasks: fields 7 and 17, and tasks of field 2 other than 8, 9, 10, 11 and 14 (fields 8, 10, 14, 25, 28 and 29 are withdrawn).


*Field 4 belongs to no tier: in a clone it is a mark of fact, written fresh each time; founding terms are signed by everyone, and the tiers govern only later changes. Who signs what for the collective is its layer rules and its areas, which are constitutional. Each area carries its own words, changed by its holders with it, so the words never go stale and no area's holder rewrites the constitution's.*

#### Rule 63. What a clone changes

*In short: a clone's changes are found by comparing it with its parent, field by field; each change belongs to its field's tier and, when operational, to a layer's rule, an area, or neither.*

A clone changes a field when the field's deterministic encoding in the clone differs from the parent's, or the field is present in one and absent in the other.

Fields 2, 15, 19 and 20 are compared entry by entry: by task number, by extension, by layer and by area id. Each differing entry (added, removed or replaced) is one change.

Fields 4 and 11 are never compared, nor field 23: a clone never carries it ("Terms"). Nor are fields 31 and 32, which each version states for itself, nor field 33, which a clone repeats; field 30 is compared entry by entry, by stake, each differing entry one change.

**A change of field 16 that only takes, for each party the clone takes out of the parties, the seat part of its succession plan (keys 2 and 3), is no change of its own.** This holds where the plan stays for its stake part, or goes where it has none, and every other plan stays as it was. It goes with the removal, as the party's areas do.

Each change is in the tier of its field or entry (rule 62). An operational change lies:
- for an entry of field 2: under the parent's rule for that task's layer, `[6, layer]`; or, where an area of the parent names that task by a field reference, `[1, task]`, in that area instead. Where the specification the clone names for that task is also named in the clone for a task of another layer, it lies under that layer's rule too. A clone naming one specification for a judicial task and for another task is invalid, whatever its mark;
- for an entry of field 15: under the parent's rule for Development, and the rule of each layer that the extension added or dropped declares in its specification (Development, field 10). Dropping an extension needs the same powers as adopting it. A clone naming as an extension a specification it names as a judge is invalid, whatever its mark;
- for an entry of field 20: in the area whose id it carries;
- otherwise: in the parent's area whose field references name that field.

Any other operational change lies under no layer's rule and in no area.

#### Rule 64. Which powers a clone needs

*In short: the powers a clone needs follow from its changes alone.*

Which powers a clone needs, from its changes alone:

1. If any change is constitutional: the constitutional change rule, `[0]`. Where some change is also judicial, the judicial tier's rule, `[4]`, is needed too: the version stays a draft until both are met, its mark naming both. *Without this, two members of three could change a judge by adding a one-word change to the constitution. The constitutional change rule still changes every other tier alone; a judge needs every member as well.*
2. Otherwise:
   - the rule of each layer under which some change lies, `[6, layer]`, one for each such layer;
   - the power of each area in which some change lies, `[2, area]`, one for each such area;
   - the clone rule, `[1]`, if some operational change, or part of one, lies under no layer's rule and in no area, or if the clone changes nothing;
   - and the judicial tier's rule, `[4]`, if some change is judicial (rule 67).

   So a clone that changes an area and something outside every area and layer's rule needs both, its mark naming both.
3. A clone that executes a party's succession plan may instead name that plan, `[3, party]`, alone, where rule 83 allows a seat to pass automatically. It may do so provided it changes nothing but what the plan gives:
   - the party out of the parties (field 0), its seat successors in;
   - the party out of the holders of every area it held, nothing else in the areas changed;
   - **the seat successors in the party's place in every holding of the key grammar (field 12), every threshold unchanged**;
   - **the seat successors in the party's place in every layer's rule naming it (field 19, `[2, names]`), one already named there written once, nothing else in the layers' rules changed**;
   - the executed plan dropped from field 16, every other plan as it was;
   - where the party held the chain key alone (`[0, party]`), a succession plan for the seat successor in the executed plan's place, naming at least one seat successor of theirs, as rule 59 requires. The seat successor signs the clone as the plan's signer, so that plan is signed by them in the same clone.

   *A key grammar's holdings name only parties, and in most collectives every member holds a share of the chain key, so a seat could never pass without the keys; a plan left in field 16 for someone no longer a party would make the clone invalid. The thresholds stay as the members chose them; the rotation declaring the clone re-deals the keys (rule 83). Where this leaves a case undecided, a verifier answers unknown rather than guessing.*

4. **The owners' matters**: where a change is an owners' matter of a stake (rule 95) whose holders' rule is by share (field 30), and that rule is how its holders consent, the clone needs that stake's holders' rule, `[5, stake]`, beside the members' powers above, its mark naming it with the holders whose signatures meet it, so that a false claim sinks the clone (rule 46). Where the stake's holders' rule is every holder, its holders sign as rule 45 asks, outside the mark. *No declared tier is needed: the owners' matters are counted among a stake's holders, not by moving a field among the members' powers.*

A clone needing several powers comes into force only when each is met, all at once or not at all.

*The clone rule does not reach into an area, and one area's holders do not reach into another: an area's power is exclusive, held by its holders or by the narrower rule that governs it. Its holders, and the rule they act by, change only by a constitutional change.*

#### Rule 65. Counting a power

*In short: each power is counted among the parties whose voice remains; a party that has left still counts for what it signed before it left; and when fewer voices remain than a number asks for, all of them together meet it.*

**Who each power is counted among:**
- the constitutional change rule: among the parent's parties, under the parent's field 18, or every party when the parent has none;
- the judicial tier's rule: among the parent's parties, every one of them;
- the clone rule: among the parent's parties, under its field 5;
- a layer's rule, `[6, layer]`: among the parent's parties, under the parent's field 19 entry for that layer;
- an area's power: among that area's holders in the parent, at least its threshold of them;
- a stake's holders' rule, `[5, stake]`: among that stake's holders at the line, by share (rule 94); and a constitutional change rule counted among a stake's holders, likewise.

In each, only parties whose voice remains are counted, a stake's holders aside, who are counted by what they hold. This is judged on the collective's chain at the act, or, for a clone, at the record or rotation that puts it in force ("Made before, made after"). Left out are:
- a party whose resignation (rule 70) or declaration with outcome 0 (rule 89) the collective registered on a line before it;
- for one area, a holder whose stepping down from it (rule 71) the collective registered on such a line.

They stay left out under every parent descending from the agreement in which they lost that voice.

**A party is named again only by a constitutional clone** made after the version in which it lost that voice, naming it as a party or as that area's holder, which it signed by a signature act the collective did not place before the line registering its departure. It counts again under that clone and its descendants. *An ordinary clone that only copies the list of parties or of an area's holders restores nobody: otherwise a holder who stepped down would count again by signing a change of the area's words.*

**A party that lost its voice still counts, for a clone or an act, through a valid signature act on it placed before the collective's line registering its departure** ("Made before, made after"):
- for that clone or act alone, it counts as a voice that remains, so the rule is met or not as written, its number counted with that voice among the others, never lowered by the departure;
- it counts so even where the record or rotation putting the clone in force does not name that signature among those completing it, and is then a voice that did not sign there;
- a declaration never undoes a clone that a record or rotation put in force before the line registering it, whatever version of the clause or of the agreement it names.

*Her position at the time of signing is valid: she was still acting, and whether the clone is approved now depends on the collective's rules. Under three of three, a member who signed a clone and then resigned still leaves it needing both others: three voices count for it, and three signatures are needed; a rotation naming only the two others' signatures does not meet it. Under every party, it needs everyone who has not left, the early signature standing among them. "Before she left" reads "placed before the collective's line": the record came first, or the collective acknowledged her signature as it arrived.*

**When fewer voices remain than a rule's number asks for, all the remaining voices together meet it; where enough remain, the number stands as written.** This holds for every number an agreement states, and for the judicial tier's "every party":
- the constitutional change rule;
- the clone rule;
- a layer's rule;
- an area's threshold, one a clone left above the area's holders included;
- an abandonment authority that is a threshold of the other parties (rule 85).

When no voice remains, nothing meets the rule. An area left without a holder, or listing none, stands frozen, as in rule 71, until a constitutional clone gives it a holder.

**Counting by share.** A rule may count shares of a stake instead of heads: "those counted, holding together at least this share of this stake". One voice per party stays the default: a rule written without a share counts one voice per party.

- **Among the parties** (a change rule by share, `[3, stake, share]`): each party whose voice remains counts by what it holds of that stake, read from the parent's field 7 and the transfers the collective's line placed before the line that puts the clone in force (rule 94). The share asked for is of what **the parties whose voice remains hold together** at that line, never of the whole stake, so departed holders' shares never keep the members from meeting it. **The fewer-voices clause, restated in shares:** where the voices that remain hold together less than the share the rule asks for, all of them together meet it; where none holds anything of the stake, all the voices that remain together meet it.
- **Among a stake's holders** (the holders' rule, rule 94; a constitutional change rule counted among holders, `[5, stake, share]`): every holder of the stake at that line counts by its share, members and others, and the share asked for is of **the whole stake**: no holder loses its say there by leaving the membership. A holder that vanished is moved by the declaration of absence (rule 85), not by this rule.
- **"All of these rules"** (`[4, rules]`): met when each rule in it is met, each counted as it would be alone, the fewer-voices clause included.

A holder's share counts once, whoever signs: a seller and its buyer never both count, the line moving the share once. An area's threshold stays a number of its holders (area key 2), the forms by share being forms of a change rule. **Areas keep counting heads in MOR 1**: a cMIP may put a by-share decision behind an area's single holder. *An area is not ownership; it splits operations.*

*Counting by share is optional. A member with a majority of the stake decides alone under a rule by share, and that is the point; weights are read from the stakes, never written as free numbers.*

*A number can outlast the voices it counts: "three of three" would still ask for three after one voice is removed, and the abandonment clause (rule 61) would unfreeze nothing. Read this way, a number never freezes a rule, it matches what "every party" already does, and it keeps the founders' number wherever enough voices remain. A lone survivor still holds the keys and the constitution only under rules 59 and 61: the key grammar's thresholds are cryptographic, and this rule never lowers them.*

#### Rule 66. Protections still hold

Protections still hold. Whatever power brings a clone into force, it cannot:
- reduce a stake without its holder's signature (rule 48), a departed holder's included (rule 68), nor lower what it pays a departed holder without that holder's signature (rule 48), or the stake's holders' rule where that holder accepted one (rule 94);
- nor change the judicial tier without every member, a version changing the constitution included (rules 64.1, 67).

*Stated cost: by default a member who is present but unwanted cannot be removed; the others can leave, each alone (rule 70), or use the abandonment clause where it applies. A group that wants expulsion writes a constitutional change rule below everyone at founding, where every founder signs it; even then, removal takes the voice, never the stake. A member who dies or vanishes never freezes the constitution: the abandonment clause every collective carries can remove their voice (rule 61).*

#### Rule 67. Protected clauses: the judicial tier

*In short: the clauses that decide disputes change only with every member, and there is one version of them for everyone.*

Collectives only. **The judicial tier changes only with the signature of every member whose voice remains, and there is one version of it for everyone.** The judicial tier is:
- the abandonment clause;
- the succession plans;
- the keepers;
- outside the terms, the collective's split agreement (rule 15), naming its split service and backups;
- the time reference;
- the arbitrators or verifiers (field 13);
- the condition, time reference and anchoring cMIPs (field 2, tasks 9, 10 and 11), and the absence-proof cMIP (task 14, named in the abandonment clause's key 3);
- the chain of judgment (field 21).

*The concurrency rule (field 10) is withdrawn: rule 90's default stands. Task 14 is judicial in its own entry ("Tasks").*

A clone changing any of them names the judicial tier's rule, `[4]`, in its mark, with every party of the parent whose voice remains, counted as rule 65 says. A version that also changes the constitution names the constitutional change rule beside it, and needs both (rule 64.1).

A clause naming only the member a version removes goes with the removal. This is only the seat part of their succession plan, which needs no judicial power (rule 63). The plan for their stake stays with the stake, as a departed holder's plan (field 16 may carry it; it names stake successors only). No other judicial clause changes that way.

A departed holder's stake plan changes only with that holder's signature too.

Every member, and every departed holder (rule 68), is judged by the version in force.

*It is the joint signature that matters. If a member who did not sign a change kept the version they signed, two members could hold different judges, and where one joined after a change the other never signed, no judge would be signed by both: nothing would say who decides between them. With one version for everyone, every dispute has one judge both signed. Arbitrators, the condition cMIP and the anchoring cMIP can each decide who wins a dispute, so a majority still cannot pick a friendlier judge after the fact.*

*Stated cost: one member can hold a change back, leverage being part of life; a judge that dies cannot trap the collective, the chain of judgment taking over (rule 35); and a holdout makes a standoff, which is good: communication becomes the only channel to solve it, with a collective fork as an option to settle it (rule 91).*

In a deal no clone completes without everyone, so the question never arises.

#### Rule 68. Departed holders

*In short: a member who leaves keeps their stake but loses all control; their stake is treated exactly like everyone else's.*

Collectives only. A collective's departed members entry (terms field 22) records only who left, without voice. Their stake is in the collective's stakes (field 7), which decide what every holder is paid.

**A departed holder has no control and no veto:** it is counted in no change rule, no layer's rule and no area, and the collective's current rules and judges apply to it. Its one signature is on what lowers its own stake or its pay (rule 48), never on anything else. **It is paid, and consulted on the owners' matters** (rules 94, 95): what its stake is paid, an issuance in it, a sale or release of the collective's works, a fork's successors' plans, by the stake's holders' rule where it accepted one, else by its own signature; and it sees the collective's Money acts (rule 57). A constitution may also count it among the holders choosing members (rule 69).

Its stake never shrinks without its signature (rule 48). A clone that lowers its share in field 7, or drops it, is a draft until that holder signs it (rule 45), as for every holder. **Nor is what its stake is paid lowered without it:** a version of the collective's split agreement that pays its stake less, by raising a partner's share or a fee, adding a role or metric share, or changing the split cMIP, is a draft until it signs (rule 48). *This protects what it is paid; it gives it no say in anything else.*

The stake is a share of all the collective's income, not only of what was made while it was a member.

Every term applies equally to every stake, member or departed:
- a term may not treat a departed holder's stake worse than a member's of the same size;
- a fee raised for the departed is raised for the members;
- a fee paid to a service the members own is public. *Client conformance*: a verifier cannot see who owns a service, so the member's client MUST disclose it to the members.

The stakes decide every holder's money (field 7), and every payout matches its stake exactly, every fee alike for every stake ("Split plan and split", rule 27). Equal treatment is what following the stakes with uniform fees produces, not a separate test, and any deviation, either way, breaks the plan. *A member who wants to give income to another transfers part of a stake.*

Every split is delivered to every holder it pays and names each fee and who received it (rule 20), so a fee to a service the members own is seen by everyone it is taken from.

Unpaid shares stay open debts (Money rule 5) until the holder can receive, for instance after setting up on a new rail the collective chose.

*A person who keeps a stake in a collective accepts having no control over its decisions; one who thinks the collective will not survive has the incentive to sell. The stake defines a share of income. A rail swap is the collective's decision: to get paid, past members accept it and set up accordingly. Equal treatment makes any creative accounting legible, and public.*

*The core checks each split; equal treatment follows from the stakes and uniform fees.*

### 12. Members joining and leaving

#### Rule 69. Changing members

*In short: changing who is in a collective takes a clone of its agreement that changes the constitutional tier, put in force by a record; a rotation of its chain key only where the key itself must change. A rotation that gets this wrong breaks the collective until a rollback brings it back.*

**Changing members takes a clone of the collective's agreement changing the constitutional tier, put in force by a record (type 17) that names the signature acts completing it; and a rotation of the chain key where the clone changes the key grammar or removes a party who holds the key or a share of it, the rotation declaring the clone. A clone put in force by a record where a rotation was needed puts nothing in force.** The record or rotation names the signature acts that complete the clone, and places each at its own position; the clone counts as complete there only with those ("Collectives in the identity chain", "Made before, made after"). *The rotation fenced off an old signing key; with none, what remains of its reason is the chain key: a departed member who holds a share of it must not keep one. So the rotation is needed exactly where the key grammar changes or a holder of a share leaves, and a record suffices otherwise. In a shares grammar that is still most departures; in a custodian grammar it is none. Cost: a record's line, not a rotation's, fixes the departure, as it already fixes a resignation.*

Membership is constitutional, so the clone needs the constitutional change rule (rule 64): by default, every party whose voice remains at its line. A member whose resignation (rule 70) or declaration with outcome 0 (rule 89) the collective registered on a line before the rotation is no longer counted.

The record or rotation is a line, a rotation's history that of the signature acts its declaration names (rule 58): a change of members, of a layer's rule or of an area's holders that it puts in force takes effect for the collective's acts there.

A clone that takes a party out of the parties takes it out of every area's holders too. An area it leaves with no holder is written with an empty list of holders, and stands frozen until a constitutional clone gives it a holder (rule 71).

A constitutional clone that removes a party who did not sign it, where the constitutional change rule allows that, takes that party's voice only. The party keeps every stake it holds (rule 48), as a departed holder, under the collective's current rules and judges (rule 68).

Any other change to the constitutional tier (the change rules, the layers' rules, the areas) is likewise put in force by a record; one that changes the key grammar is declared by a rotation before it applies to the collective's acts. A rotation may declare any constitutional clone.

Each agreement the chain declares after the founding one MUST:

- be a clone of the agreement in force at the rotation (the one declared before it, or recorded since, rule 72), its parent (field 11) naming it;
- be complete with the signature acts the declaration names;
- change the constitutional tier.

Otherwise the collective's acts that need member signatures count for nothing: **the collective is broken** from that rotation on, until a rollback brings it back (rule 93). So it is where a rotation removes the collective's Agreements declaration or carries one that cannot be read.

A rollback is the one exception to this rule: it is a clone of the agreement in force just before the broken act, and need not change the constitutional tier (rule 93).

*A rotation declares only a constitutional clone: a clone changing only the judicial or operational tier is written by a record, and a constitutional one by a record too where the key need not change. And a rotation declares only a direct clone of the agreement in force: every other clone is recorded at once (rule 72), so there is never a clone in between, and one that nothing recorded would have no line at which its completeness was judged.*

A rotation declaring nothing new carries the agreement in force forward ("Collectives in the identity chain").

*Clones that change only the judicial or operational tier need no rotation: they change neither who holds the chain key nor who decides. They are written on the collective's chain by a record instead (rule 72), which any member draws.*

A departing member hands over nothing: there is no key of the collective's to hand over but the chain key, which the members rotate to one the departing member never held, re-split among the members who stay or join. *A member's power ends at the line that registers their departure; their own key continues to sign their own acts.*

**Owners may choose who runs the collective, as a choice at founding.** A collective may, in its constitution, count the power over membership among a stake's holders by share: its constitutional change rule (field 18) written as a rule among the holders of a stake, members or not (`[5, stake, share]`), alone or with the members' own rule ("all of"). The default stays members choosing members. The holders sign the clone as its mark names them (rules 45, 46), counted as rule 65 says.

**How it is kept: as every constitution is, by the broken collective** (rule 93). A rotation that moves the chain key without the signatures this constitution requires breaks the collective, its acts counting for nothing until a rollback, visibly: the operators cannot rotate around the owners' rule.

**It binds only through the keys**, a stated cost. Rule 93 punishes a rotation made; it cannot compel a rotation refused. A clone removing operator-members needs a rotation (above), which needs the chain key they hold. Where the key holders refuse it, the owners' vote stands complete and unexecuted, visible to every reader of the chain; the collective is not broken, and runs on under the old members. The owners keep the owners' matters (they can refuse every fee, issuance and sale, rule 95) and the exit, not replacement.

**A constitution that counts membership among a stake's holders SHOULD also put a share of the chain key, or the recovery path's custodian** (rule 59, `recovery = [0, custodian, grant]`), **under the owners' control**, so that the holders' rule can produce the rotation. *Client conformance*: the founding client warns, before the founders sign, where it does not.

*As long as it is a choice: it depends on balance, some people protecting their work, some their investment.* *Stated cost: a majority of capital can remove those doing the work, where the founders chose it.*

#### Rule 70. A member can always leave alone

A member can always leave alone. A party to a collective's agreement gives up its voice by a resignation act (type 16), without anyone else's signature.

**The resignation takes effect for the collective at the collective's line registering it** (record field 3). Any member's client draws that line in its next act for the collective, by a record (rule 72). **Once registered, it stays taken for the collective, whatever its signer's later rotation disowns** ("Made before, made after", 4): the member comes back only by a constitutional clone naming them.

From that line on, the party's signature acts count toward no change rule and no area of that agreement, or of any agreement descending from it. A signature of the party placed before the line stays valid, and still counts toward what it signed. For that clone or act alone, its signer still counts among the voices that remain, so the departure never lowers the number the rule asks for ("Made before, made after", rule 65).

The party keeps its stake, and stays bound by what it signed; it is then a departed holder (rule 68).

The remaining members then rotate the collective's chain key (rule 69) and clone its agreement without the departed party, which takes the party out of every area it held too. They record the departed party, with its stake in the collective itself (field 7), in the departed members entry (field 22).

Meanwhile, from the line on, each rule, and each area the party held, is counted among the voices that remain (rule 65). An area left with no holder stands frozen from that line until a constitutional clone gives it a holder, as in rule 71. Every grant in it ends at that line, to be reinstated, where wanted, by cloning it at the refit.

A resignation counts like a loss: where the key grammar's recovery path is an escrowed share released by the abandonment authority, the authority may release it on a resignation as on a declaration of absence.

*Leaving needs no permission, and lets nobody remove anybody else; the collective that delays drawing the line only delays itself. Absence remains the abandonment clause's business, under the clause the member signed.*

**Leaving a broken collective.** A member can leave a broken collective too (rule 93). During the broken stretch, a resignation, or a stepping down (rule 71):

- names **the agreement in force just before the broken act**;
- takes effect at the collective's next valid line: normally the rollback, which registers it ("Collectives in the identity chain"), or else the first record after the rollback that registers it (record field 3).

A record drawn in the broken stretch is no line and registers nothing (rule 93). A resignation naming the clone the broken act declared names an agreement never in force, and no line can register it.

**Stepping down during the broken stretch is treated as resigning**: a client allows it, and the rollback registers it. *A rollback whose clone names that member again as a holder of the area, and which they sign, gives the area back to them, as any constitutional clone they sign naming them does (rule 71), so a client leaves them out of it.*

*A resignation cannot make the constitutional change rule impossible: a number is counted among the voices that remain, and all of them meet it where fewer remain than it names (rule 65). Where a departure takes away a share of the collective's chain key that the rollback's rotation needs, the key grammar's own way through applies: a resignation counts like a loss (above). Neither case is new to a broken collective.*

**The last voice.** *Client conformance:* where the member resigning is **the last voice that remains** in the collective, the client MUST say so in plain words before the resignation is signed. The member is the last voice that remains where no other party of the agreement in force (during a broken stretch, of the agreement in force just before the broken act) keeps a voice there as rule 65 counts it. The client says that the collective's works will be frozen as they stand, and nobody will be able to change, release or move them. Leaving stays the member's alone: the client says it, and never blocks it. *It is the sign at the entry of a danger zone.*

**The last constitutional voice.** Where the constitutional change rule names some parties only, and the member resigning is the last of them whose voice remains while other parties keep voices in their areas, the client MUST likewise say so before signing, in these words:

> **"You are about to break the collective's constitutional layer. Once you leave, nobody will be able to change its rules again. The other members keep acting in their areas."**

Its constitution freezes as it stands, and nobody can add or remove a member, redraw an area or change a rule of the constitution again (rule 65). It is not a broken collective (rule 93), and has no rollback. *This may be deliberate, in rare cases: a collective may choose to freeze its own rules for good, and the warning makes sure it is chosen.*

**Counting the voices that remain for these warnings, the client reads too the resignations the other parties have uploaded that no line has registered yet.** Agreements count a resignation only once a line registers it (rule 65), and during a broken stretch nothing registers, so voices leaving from separate devices would otherwise each be told the others remain.

*A client names in the resignation the agreement Agreements find in force. Where it cannot read Agreements (its relays and homes away), it says that the resignation names its own copy, which may not be the one in force, and that no last-voice warning can be given.*

*Stated cost: when the last voice has left, the collective's works freeze as they stand.* Its works stay claimed and owned, and every former member keeps its stake as a departed holder (rule 68). Nothing about them can be decided any more, a release to the public domain included, since a collective owner releases only by its own rules and no voice remains to meet them (rule 65). A broken collective can no longer be rolled back. No rule prevents it: *someone with stakes in works worth keeping does not resign.*

Money under publications already signed keeps flowing through the split services they name, and the collective's own income through its split agreement, while they stand.

#### Rule 71. Leaving an area

Leaving an area: giving up an area changes the constitution at that level. It is a constitutional clone (rule 64), put in force as rule 69 says: by a record, or a rotation where the key grammar changes. It comes about in one of three ways:

1. the holder leaving nominates a replacement, and the constitutional change rule approves it or not;
2. the constitutional change rule proposes a replacement, and the holder leaving approves it;
3. the constitutional change rule redraws that area's rules entirely.

The replacement signs the clone too (rule 45). Until one of them completes, the holder keeps the area.

*Mechanically the first two are one clone, signed by the leaving holder and meeting the constitutional change rule, started from either side; the third needs no signature of the holder, since an area's holders and rules change by a constitutional change.*

**Stepping down at once.** A holder may instead give up an area at once, alone, by a resignation naming that area (type 16, field 1). *It says: I am done, and will do nothing more in this area.*

**The resignation names the drafts its signer had signed and leaves behind** (field 2). A version it names never gives the signer the area back, whichever line puts it in force. A draft it fails to name does: the signer's stated cost. *Client conformance:* the holder's client names them, as for a resignation.

The stepping down takes effect for the collective at the collective's line registering it (record field 3). From that line on, the holder's signature acts count toward nothing in that area, in that agreement or any descending from it. A signature of the holder placed before the line stays valid, and counts as rule 65 says. The holder keeps the rest of its voice, and its stake. The collective then makes the constitutional change for that area by one of the three ways.

**Meanwhile, where other holders of the area remain, they carry on**, counted as rule 65 says. The area's threshold stands where enough of them remain, and all of them together meet it where fewer remain than it asks for. Grants issued within the area keep backing acts. A departure that leaves an area held leaves its grants in force; only a revocation ends them.

*Rarely, no holder of the area remains.*

**An area with no holder remaining is frozen** until that change. Its acts made after the line that froze it count for nothing, and every grant issued within it ends for good. The line that freezes the area is:

- the collective's line registering the departure of its last holder whose voice there remained (a resignation, a stepping down, or a declaration removing that holder's voice, rule 89); or
- the rotation declaring a clone that leaves the area with no holder.

**A departure that empties an area ends every grant in it: a decision ending powers.**

- An act under such a grant that the line's history holds was done within the grant's powers, and binds.
- One racing it (neither citing the other) is void, the ending winning (the tie rule).
- Every act after it is void.

No suspension, and no undetermined act. *An empty area is an emergency: end it. The copy still exists, and cloning it reinstates what is needed.*

A void act binds the collective only where the collective itself, by an act for the collective that counts, acknowledges or pays on it, adopting it (rule 76; the import act, type 11, is retired).

*Client conformance:* a member's client shows an empty area as an emergency.

The change ends the freeze once a constitutional clone is declared that changes that area's entry of field 34, the entry with its id, or that layer's entry of field 19, so that it has a holder whose voice remains.

**A layer whose named actors have all left stands frozen likewise**: where its rule names parties (`[2, [+ hash]]`) none of whose voice remains, or where no voice remains at all. Its acts after the line that froze it count for nothing, and every grant issued under it ends at that line, until a constitutional clone names others (rule 60), which rule 64's "membership is constitutional" forces into the clone of the departure. *A rule counting every party, or a number of them, never freezes while a voice remains, all the remaining voices meeting it (rule 65).*

**At the refit, the new holders may reinstate any ended grant by cloning it.** A reinstatement is a grant (type 9):

- whose field 7 names the ended grant, and whose fields 0 to 6 are that grant's;
- drawn by a holder of the refitted area, naming the collective, and completed by signature acts of the others, meeting the area's own rule, its threshold as for any grant within it (rule 74);
- accepted by the grantee.

It is a new decision, judged at its own place like any act the area reaches (rule 60). It counts only when made after the line at which the new holders took the area, since before it the area has no holder to complete it. One reinstatement for each grant, never one for several, and nothing is reinstated automatically.

A signature act naming the ended grant itself reinstates nothing: it is placed at that grant, before the freeze, where the new holders held nothing.

A reinstated grant backs acts as a grant within the refitted area, and only within that area's reach (rule 80), from its own place on. **It takes nothing on**: the acts under the ended grant stay as the ending left them.

*A grantee's acts name the collective's chain, so the line that emptied the area places them as it places every act, and nothing is left to decide later.*

*Stepping down thus works as resigning does (rule 70): neither can be played against the other, and one holder cannot stop the co-holders' work at will, nor keep an area frozen by withholding the signature its refit needs. A grant is the area's, not one holder's: a grant made within the area before the stepping down, even one to the holder who stepped down, keeps backing acts while the area runs, until its remaining holders revoke it (rule 74).*

*If a departure freezes a layer, the collective organizes quickly to fix it. Payments to the collective's payee pointers still arrive on their rails; only the collective's own acts in that area wait.*

#### Rule 72. Every complete clone is written on the record at once

**Every complete clone is written on the collective's record at once.** A clone that changes the key grammar, or removes a party holding the key or a share of it, is declared by a rotation (rule 69). Every other complete clone of a collective's agreement is written, at once, by a record (type 17), which any member draws with their own key, naming the collective.

**The agreement in force for an act for the collective** is the clone put in force by the decisions its history holds, the one furthest along the agreement chain: the founding agreement its genesis declares, the clones its rotations declare, and the clones its records put in force. A rotation declaring nothing new carries the agreement in force forward. Which decisions count:

- for a record itself, only the decisions in its history;
- for a rotation, the decisions in the histories of the signature acts its declaration names;
- for an action, the decisions its history holds, and those in their histories (rule 58). A record it never cites decides nothing for it, a concurrent one included, save by the tie rule ("Made before, made after", 7).

**Records on concurrent lines are a fork of the agreement chain, settled as rule 90 says.** Where two valid records of different clones of the same parent, neither before the other, both count for an act (a record after both, or an action whose history holds both), it is judged under the parent itself, the earlier version staying in force, until a clone of either branch, recorded after both lines, resolves it, as rule 90 says. *The concurrency rule (field 10) is withdrawn.*

*Where the collective's records were drawn concurrently, which of them its key holders drew first does not decide. Records drawn one after the other are no fork: the second names a parent no longer in force, and puts nothing in force.*

A record of a clone counts only if:

- that clone is complete, judged with the signature acts it names; and
- its parent is the agreement in force for the record itself, or one of the clones a fork leaves for it.

So records follow the agreement chain one clone at a time. A rotation's declaration of a new agreement supersedes every record before it, and a rotation declaring nothing new supersedes none.

*MOR has no clock, so an operational clone that nothing writes on the collective's chain could not tell which of the collective's acts it governs: a payment cMIP the members named for Money adopted would not govern the collective's acts until the next rotation, and acts of a cMIP adopted for a task would fall under no rule. The record fixes the moment on the collective's chain, drawn by any member; only clones that change who decides need the chain key's ceremony.*

*Until the record exists, the collective's acts are judged under the agreement before the clone: a delay, visible, which any member can end by drawing the record.*

### 13. Grants

#### Rule 73. Grants

Grants delegate authority with limits: signing new deals, managing specific existing ones, or acting for an identity or collective (posting, uploading, spending up to a limit).

A grant is authority to act in the grantor's name without a stake, the employer-and-employee kind. It confers no voice in the agreement.

**A collective's grant names its grantee, who acts for the collective with their own key.** An agent acting for a collective works under a grant: what it signs, with its own identity's key, naming the collective on its chain and citing the grant as the decision it acts under (rule 58), is an act for the collective, within the grant's reach. **A collective hands no grant key**: it has no signing key to scope (rule 56).

The grant is a decision naming the grantee's own identity, which signs to accept it.

**A grant whose grantee is its own grantor is valid, its acceptance the grantor's own signature act naming it (type 1).** *A grant to oneself: a person grants itself a key that an application makes and holds, so the application signs within the grant's reach and limits, and every reader sees the act signed under that grant, not with the person's own key. It ends with one revocation, as any grant.*

**There is no member key.** A member acts for the collective with their own key, as themselves, for the collective (rule 58); a signature of a founding or a clone names no key (signature field 1 is retired). *A member's change of keys carries their power over: there is nothing to re-grant.*

Grants are revocable at any time, by a revocation: a decision ending powers (type 10).

During a collective's broken stretch its grants are quarantined: a grantee's act of the stretch counts for nothing. The grants work again after the rollback (rule 93), for an act citing the rollback or a later decision.

*Stated cost: a stolen grant key acts within its scope until revoked; a grantee's stolen key acts within the grant's reach until the grant is revoked or the grantee rotates.*

**A grant's dials.** A grant has scope (fields 1, 6), limits by a cMIP (fields 3, 4), revocation with the tie rule, the grantee's acceptance, and never reaches beyond its issuer's power (rule 74). Besides these:

- **Expiry** is one more limit of the grant's limits cMIP, judged against a time reference: an act under the grant past it is not backed (rule 80). The grant goes quiet rather than ending, and stays revocable.
- **Sub-granting stays excluded**: no act under a grant is a grant ("Grant (type 9)").
- **Exclusivity is not in the core**: no verifier proves the absence of another grant. It is a promise written as a deal term, its breach visible on the record. *MOR is not the law; on these matters it keeps the record.*
- **Conditions** (an escrow's "only once X") are a cMIP's.
- **Licences, leases and trusts are not grants**: they are publications, stakes and deals.
- **A proxy is not a grant**: no act under a grant is a decision; a holder's vote is handed on only by a proxy (rule 97).

**A person's grant hands its grantee a grant key**: a key of the person, scoped to the grant (Identity's scoped key), which the grantee makes and holds (field 9). What the grantee signs with it is the person's own act, citing the grant on the person's chain (the person's identity as chain).

**A person's grant and its revocation are everyday acts, signed with the person's own signing key: adding or removing a grant key needs no rotation and no chain key.**

They are public (scoped and visible: a person has no members to seal them to, and everyone who checks the grantee's acts must read them). A private one backs nothing.

A rotation of the grantor judges its grant like any act signed with the key it replaces (Identity rules 33 to 35). A grant the rotation does not keep is void, and its key with it. So a thief who stole the signing key and granted itself a key loses it at the owner's next rotation.

A person's grant reaches the kinds it names (a MIR's layer, or a type of a specification). Naming none, it reaches every act but a decision.

*Stated cost: as with every act of the signing key, a thief holding it can also revoke the owner's grants until the owner rotates and grants again.*

*Grants to a split service are retired with terms fields 14 and 29: a publication names its split service, which receives in its own name (rule 16).*

#### Rule 74. A grant never reaches beyond its issuer's power

A grant never reaches beyond the power of whoever issued it.

**A collective's grant is an act of the collective in Agreements**, drawn by a member naming the collective, counting under its rule for Agreements (rule 60), and **it reaches only acts its signers could do together**: each act its kinds name (field 6) lies within what its drafter and the signers of signature acts naming it meet under the rule of the layer, or of the area, that reaches that act. *A member who acts alone in Money under the founding can grant that and no more; a member whose rule for Money is "two together" cannot grant alone what they cannot do alone.*

**The holders of an area may grant within it.** A grant naming the area (field 5) and the acts it reaches (field 6), within the area's reach, counts only with valid signature acts naming it by the area's holders, meeting its threshold as rule 65 counts it, as for any act the area reaches (rule 60). It is judged by the area it names alone, whichever rule reaches grants as acts.

**So is a revocation of such a grant**: it counts only with valid signature acts naming it by the holders of the area the grant names, meeting its threshold as rule 65 counts it, whichever rule reaches revocations as acts. So is a reinstatement (rule 71). A revocation of a grant naming no area counts under the collective's rule for Agreements.

A grant whose field 6 reaches beyond its area, or beyond what its signers could do together, is invalid, a reinstatement aside (rule 71).

#### Rule 75. Strands

*Retired*, its number never reused. A collective has no devices of its own and hands no grant keys: its members' and grantees' acts join its chain by what they cite (rule 58).

#### Rule 76. Revocation

Revoking a grant ends it, and, for a person's grant, removes its key. The revocation names the grant.

**An act under the grant that the revocation's history holds was done within the grant's powers, and binds.** An act under the grant that the revocation's history does not hold, racing it (neither citing the other) or after it, is void, the ending winning (the tie rule), unless:

- another identity acknowledged it (Envelopes rule 17; by an act of a type the Identity, Money or Agreements MIR defines), the grantee aside: an acknowledgement whose signer is the grantee does not count here;
- or a keeper recorded it before recording the revocation, the record counting as rule 42 says (rule 41);

then it is valid and shown as disputed. A keeper record or acknowledgement counts only alongside the act it names, and only while its own signer's chain keeps it valid (Identity, "Evidence counts only while its signer's chain keeps it"), save rule 42's exception for a keeper's record.

**What such a disputed act confers: nothing, unless adopted.** As an act a rotation disowned (rule 6), an act a revocation's history does not hold, shown disputed, confers nothing on an agreement chain (no stake, no obligation, no consent) and is shown, to everyone; Money treats it as it treats a disputed act after a change of keys (Money rule 7). The grantor may still adopt it (below), and then it binds. *Binding the grantor by an accomplice's acknowledgement would let a thief holding a grantee's key sign the victim into a debt; shown, not binding, keeps both sides visible, and an honest grantor who meant it adopts it. Stated cost: a payee who relied on a revoked application's promise, a debt to come rather than a payment made, holds a visible dispute, not a debt, unless the grantor adopts it; a payment already made stays made on its rail, and the payee's own receipt stands.*

*This is Identity rule 34's principle, for a revocation as for a rotation's disowning: nothing another identity relied on in a way the protocol can see is silently erased, and no grantor's omission, careless or chosen, erases what a counterparty holds a signature for. An act nobody else acknowledged and no keeper recorded stays void, so a revocation still cuts off a stolen or misused grant cleanly.* *Stated cost: a thief holding a grantee's key, with an accomplice who acknowledges its act, gets "disputed" rather than "void": visible to everyone, never erased, and bounded by the grant's own limits. The grantee's own acknowledgement is no such rescue: what decides would be signed by the grantee whose powers the revocation ends.*

**A revocation cites every act under the grant its signer holds.** *Client conformance:* the grantor's client cites, in the revocation's history, every act under the grant it holds, so that each act's holder, holding only its own act, finds it there. *A grantee's acts cite one another on the grantor's chain (rule 58), so an honest grantor's client holding the latest reaches the earlier ones; what it can miss is the tail: an act not yet stored at the grantor's places, or one made at the moment of the revocation. Stated cost: a public revocation lists every act's id, so anyone can count the grant's acts, and a long-lived grant makes a long revocation.*

A revocation of a grant within an area is judged by that area alone (rule 74).

**The grantor may adopt a void or disputed act under its grant as its own.** An act of the grantor that counts (for a person, an act of its own key; for a collective, an act for the collective that counts) makes it bind when it does any of these:

- acknowledges it;
- cites it (for a collective, its history holding the act);
- pays on it

**There is no fourth way: the import act is retired** (rule 77).

**Once adopted, no ending racing the adoption voids it.** A revocation, or a departure emptying the area, that does not hold the act still ends the grant for every act after it, never for one the collective already took on.

**Another grantee then manages it under its own grant** (scope 1, naming it).

*A collective that took the money cannot later say the deal never happened. The adoption is the grantor's own act, never the grantee's: no act under a grant adopts anything.*

#### Rule 77. Import

**Retired**, its number never reused: there is no import act. Type 11 is retired, never reused; adoption is by acknowledging, citing or paying on (rule 76). An act of type 11 is of a type this MIR does not define, and is invalid.

There is no handover. A grantee's acts are the grantor's own, on its chain, so there is no branch to move them from. A void one counts only if the grantor adopts it (rule 76), and another grantee then manages it under its own grant.

*Adoption already does the job, visibly; a second mechanism would have no purpose of its own.*

#### Rule 78. Acknowledgements

An acknowledgement of an act under a collective's grant counts as an adoption only when it is an act for the collective that counts (rule 76), wherever it is stored.

**That means done: sealed to every member and on the collective's chain (rule 57). An Identity witness act (type 15), on neither chain, adopts nothing. The collective adopts by an act for it citing the act, signed under the rule of that act's layer. No act under a grant adopts anything (rule 76).**

#### Rule 79. Fate of acts

An act under a grant that a decision ending the grant does not hold does not bind the collective: it is void, or, where the decision is a revocation, void or disputed as rule 76 says; either way it binds only where the collective (for a person's grant, the grantor) adopted it (rule 76).

Decisions ending a grant are: a revocation, a departure emptying its area, a layer freezing, a fork, a closing.

**Counterparties: wait until a later act of the collective cites the act before performing.** From then on the act is adopted (rule 76), and no ending racing that citation voids it.

**The promise, restated**: safe once cited, against everything but the collusion of an ending's signers.

*Stated cost:* a fork or closing whose line is drawn early on purpose, before the citing act, leaves both out of its history, and both are void (the tie rule). Without a clock, a line drawn early on purpose cannot be told from one drawn before the later acts existed, and every cure would let something uploaded after a fork reopen it, against a complete fork's finality (rule 91). It needs every signer of the ending to collude against the counterparty: each conforming client refuses to sign it ("Made before, made after", client conformance). And it stays fully legible: the signed act, the collective's citation of it and the ending leaving them out stand as evidence for any outside court.

#### Rule 80. Evaluation

A client evaluating an act under a grant follows it to the grant: for a person's grant, by its `binding`, the grant whose key signed it; for a collective's grant, by the grant its `objects` cite on the collective's chain.

The act binds when all of these hold:

- the grant counts (its signers' power met, rule 74), and its grantee signed to accept it;
- the act is signed by the grantee (with the grant's key, for a person's grant), cites the grant on the grantor's chain, is done (rule 57, for a collective), and lies within the grant's reach (rule 74) and within the limits its limits cMIP sets (grant fields 3 and 4);
- no decision ending the grant fails to hold it (rules 71, 76, 91), or, where one does, the grantor adopted it (rule 76).

**For a person's grant**, the person's own chain stands for the collective's in these conditions: the act cites the grant on the person's chain (the person's identity as chain).

An act beyond the grant's reach is not backed by it. **Nor is an act under the grant outside its cMIP's limits, as one outside its kinds is not.** A verifier that does not hold the limits cMIP, or the time reference a limit is judged against, answers unknown.

*Every act under a grant binds or does not.*


### 14. Succession

#### Rule 81. The core gives the language, not the answers

The core gives the language, not the answers.

A party may attach a succession plan to an agreement, as part of its signed terms. A plan names:
- stake successors, each with a share of the party's stakes (summing exactly);
- seat successors, entering automatically or with the members' approval, with no voting weight.

Stake and seat successors may be the same identity or different ones.

**A seat successor carries no voting weight**: plan key 2 lists the seat successors alone; a plan writing a weight beside a successor is invalid, as field 24's head count is. Where a rule counts by share, a seat successor weighs what it holds of the stake, read from field 7, which the plan's stake part gives it; a weight written as a free number is refused.

Changing a plan takes a clone, which needs every member's signature, the party's included (rule 67).

#### Rule 82. Triggers

A plan executes when the party triggers it while alive, or when the authority named by the abandonment clause declares the party absent.

*Death is a complex issue; the core leaves it to the parties, their named authorities and verifying modules.*

#### Rule 83. Execution

Succession is a clone: the new terms carry the stakes and seats the plan gives, and any position attached to a seat is defined at that moment. In a collective, a change of seats changes the parties, which is constitutional.

**A seat passes automatically** (plan key 3, value 0) **only if every party whose voice remains signed that version of the succession plan.** That is: each of them signed a version of the agreement, in the chain up to the parent, whose field 16 carries that party's plan exactly as the clone executes it.

The clone's mark then names the plan, `[3, party]`, with the seat successors entering as its signers. It comes into force on the trigger (rule 82) and their signatures, with no other power, provided it changes nothing but what the plan gives, as rule 64 says:
- the party out and its seat successors in, among the parties and in its place in every holding of the key grammar, every threshold unchanged, and in every layer's rule naming it;
- the party out of every area it held;
- the executed plan dropped;
- and, where the party held the chain key alone, a plan for the successor in its place, naming their own successor, signed by the successor in that clone (rule 59).

**What the plan alone may pass.** A plan passes a seat to one identity or several, **an identity already a party among them**: that party then holds both seats, written once for each in field 0, the departed party's place kept, and counts twice wherever seats are counted, every threshold unchanged. **It passes a key holding to exactly one successor.** It passes the stake to its stake successors, one or several, in its shares. Where a plan names otherwise, the clone marked with it alone is invalid (rule 46), and the change is made by an ordinary clone under the change rule.

**A clone marked with the plan alone that changes anything more is invalid** (a false mark, rule 46): one that places a seat successor elsewhere than in the party's own place, among the parties or in a holding of the key grammar, or that reorders the other parties, changes more than the plan gives.

*Client conformance:* **before a party signs a succession plan, its client shows what each successor would hold after it**: its seats, its key shares, and where that lets one identity act alone. *Consent given in advance by everyone still counted is consent; what must never happen is a surprise, so the consequence is shown at signing. A and B start a collective; over the years it grows; A always meant to give his seat to B and his stake to his children: the plan says so, every member signed it, and each saw that B would then hold two seats.*

*Consent given in advance, by everyone still counted (rule 8); a plan that some members cloned without the others is not that version, so it cannot slip a stranger into the constitution through a judicial clause. A plan changes only with every member, so a plan some members clone without the others never comes into force at all.*

Otherwise the seat successor is a nomination, approved under the constitutional change rule (rule 64). That approval is counted among the voices that remain once the absent party's voice is removed (rule 89), as in rule 71. The successor signs the clone too (rule 45).

A stake passes by succession as planned: it is property, not a seat.

**A seat passed by succession carries membership, never the areas its holder held.** The seat carries the party's voice in the constitution and the change rules, and its place in every layer's rule naming it: the seat successors written there in its place, one already named there written once. The clone that completes the succession, automatic or by nomination, takes the party out of the holders of every area it held. Each such area is refitted as rule 71 says:
- its remaining holders carry on meanwhile;
- an area left with no holder is written with an empty list of holders and stands frozen, its grants ending and reinstated, where wanted, by cloning at the refit, until a constitutional clone gives it a holder, which may be the same clone where the successor is a nomination;
- an area left with fewer holders than its number keeps that number, met by all who remain.

*An area is a job the collective gave a person; a plan is the party's own, and letting it hand out that job would reach into the constitution. The successor is free to be nominated for it.*

In a deal, the clone needs every party whose voice remains (rule 47).

For a collective, the members then rotate and re-split the chain key to include the new key holders, using the grammar's recovery path where a share is gone for good. The succession clone changes the parties, so a rotation declares it (rule 69), and that rotation re-deals the collective's chain key to include the successor.

#### Rule 84. Fallback

**Where no plan exists, a succession the party declared under Identity and its successor confirmed (Identity, section 8) makes the successor a nomination for the party's seat, approved as rule 64 says.** No seat passes automatically this way: an automatic entry needs consent given in advance by everyone still counted (rule 83), and an identity-level succession is the party's act alone. The successor signs the clone that seats it (rule 45).

**The stake stays with the party's identity**, which Identity keeps alive (Identity rule 39), paid at its pointer, until a transfer (rule 10) or the abandonment clause (rule 89) moves it.

**A succession not confirmed nominates nobody.** Otherwise, and where no succession was declared, the abandonment clause applies.

*Why: under rule 83's own reasoning a stranger never enters the constitution without the voices that remain; and Identity rule 39 keeps the old identity alive, so the stake needs no successor to be paid.*

### 15. Abandonment

#### Rule 85. Clause

An abandonment clause, signed into the agreement, names who decides absence and which outcomes may follow.

Every collective carries one that covers each party with constitutional power (rule 61). A deal may carry one or not.

**In a collective, a declaration may also name a holder of the collective's stake in itself who is no party**: a departed holder, a stake successor, a buyer. It is made under the clause in force; its authority and its absence-proof cMIP are the clause's, as for a party. Against such a holder its outcomes are the stake-moving ones only: succession, as rule 89 says, or outcome 1 where the holder's plan names no stake successor; never 3 or 4. **Against a holder who is no party and whose plan names a stake successor, the declaration states no outcome (field 3 empty), and the stake passes by succession** (rule 89); outcome 0 is never stated against a holder who is no party, who has no voice to remove. Rule 61's coverage is unchanged: a holder has no constitutional voice to cover (but see rule 61 where the constitutional change rule counts among a stake's holders). *So a departed holder who vanishes does not block the collective's fees, because its stake moves; without this sentence a declaration could name only a party, and one holder who vanished blocked every change paying the stake less, for good.* *In a deal, a party's death leaves the agreement running as written, with succession plans to step in, and locks nobody out of an identity.*

The authority MUST be an identity:
- the keeper's operator;
- a threshold of the other parties, counted as rule 65 says, so it never asks for more of them than remain. In a collective, they are counted among the voices that remain at the collective's line registering the declaration, or at the recovery rotation where the declaration takes effect there (rule 89): the same place every other departure is judged;
- or a named third party.

**In a deal, the authority is one identity: a party, a keeper's operator, or a collective, never a threshold of the other parties.** Parties who need to decide together form a collective, and name it.

Where a threshold of the other parties needs more than one of them, one signs the declaration and the others add signature acts naming it, as for terms. It counts once the required number have signed ("Abandonment declaration"), placed at the collective's line, or named by the recovery rotation where the declaration takes effect there.

An anchoring cMIP is named as the time reference the authority judges absence against, never as the authority.

Absence means absence from duty: no act by the party on the agreement, for a period measured on the agreement's time reference.

*Client conformance* (as Text rule 6): **before a party signs terms carrying an abandonment clause, its client MUST show in plain words who may declare it absent, with which outcomes, and whether an absence-proof cMIP stands between that authority's word and its stake.**

#### Rule 86. Liveness

A party with nothing else to sign shows presence with a liveness act.

*Presence is shown, never proven by time in the core: whether a party is gone is the judgment of the authority the members chose, or, where their clause names one, of an absence-proof cMIP (rule 87).*

#### Rule 87. Declaration

A declaration is a signed act by the authority the clause names, stating the agreement, the clause, the party and the outcome (type 13). In a collective the party may be a holder of its stake in itself who is no party, under the clause in force, with the stake-moving outcomes only (rule 85).

The core checks:
- that it is signed by that authority (for a threshold of the other parties, by one of them, completed by the others' signature acts until the number is met);
- that the outcome is one the clause allows;
- that field 1 names the version the party declared absent signed last ("Abandonment declaration");
- that, where the party's succession plan names a stake successor, it does not state outcome 1 (rule 89).

**Otherwise the declaration is the authority's judgment, a stated cost the party accepted by signing the clause, and a contest shows it.**

Where the clause names an absence-proof cMIP (key 3), the declaration counts only if that cMIP accepts it (task "Absence proof").

A declaration moves nothing by itself. Its outcomes take effect only through what is put in force under it: a record or rotation in a collective, a clone in a deal (rule 89). The checks are judged at the point where that act uses it. A later act of the party, or a later contest, never undoes what was put in force ("Made before, made after"). **A later rotation is such an act**: the declaration, its completing signatures and the signatures its field 1 is checked against keep, for the collective, the effect the line gave them, whatever their signers' later rotations disowned, shown as a dispute on the line.

The clause applied is the one in force, of the agreement it names, for every party (rule 67): a party whose voice was removed before a judicial change is judged by the clause in force, as every departed holder is.

#### Rule 88. Contest

A party who believes they were wrongly declared absent contests it with a contest act.

*Client conformance*: **a declaration naming a party MUST always be shown to that party, broken collective or not, with the way to contest it.**

*A contest shows a declaration, it does not void it: a wrongly declared member regains their voice only by a later version of the agreement naming them. The absentee must be informed: the declaration reaches them, and their contest shows presence. The contest act's format (type 14) is written: it names the declaration it answers and is signed by the party declared absent, which shows presence; the declared member's client lets them sign it ("Contest (type 14)"). A declaration counts only if public or addressed to the member it names, so it reaches them through the very act that uses it.*

#### Rule 89. Outcomes

**A declaration moves a stake only by succession**: the stake, and its pay with it, goes to the stake successors the holder's succession plan names, in the plan's shares (rules 81 to 83). A clone carrying exactly that, put in force under the declaration, needs no signature of the absent holder. Abandonment never lowers what a stake is paid while the stake stays with its holder (rule 48).

*Abandonment protects operational flow; it is not meant to change stakes or pay. What it can trigger in that regard is succession, the stake and its pay going to the successor.*

The outcomes of a declaration may be combined:
- **voice removed**, described below;
- stake redistributed among remaining holders in proportion, **only where the holder's succession plan names no stake successor**;
- obligations redirected or held;
- agreement closed.

**Outcome 2, a stake transferred to parties named or defined by role, is struck from MOR 1**: a clause or declaration listing it is invalid (rule 87). *Succession covers it: where a succession plan is in force, it passes the stake; without one, the stake is shared out. A frozen format could not have carried whom outcome 2 transferred to.*

A declaration stating outcome 1 against a holder whose succession plan names a stake successor is refused (rule 87).

**Against a holder of the collective's stake in itself who is no party**: the stake passes to its stake successor, as above, or, where its plan names none, outcome 1 moves it; never outcome 0, 3 or 4. The clone carrying it, put in force under the declaration, needs no signature of the absent holder. *The succession plan a departed holder signed as a member stays with its stake (rule 67), so the plan exists to execute.*

Voice removed: the party is no longer counted in any change rule or area of the agreement, or of any agreement descending from it (rule 65). This holds:
- in a collective, from the collective's line registering the declaration, or from the recovery rotation where the declared party is the one who would draw that line, the rotation that removes them;
- in a deal, from the declaration on ("Made before, made after").

A clone put in force before then is never undone, whatever version of the clause or of the agreement the declaration names. "Before then" means by a record or rotation of a collective before its line, or, in a deal, by signatures a keeper recorded before recording the declaration.

When the voice is removed in a collective, the remaining members rotate its chain key and clone its agreement without the party (rule 69), the recovery path standing in for a share that is gone.

*A declaration is not a clone: it needs no change rule, only the authority the party signed. Removing a voice never takes the stake; that takes the party's succession plan or, where it names no stake successor, outcome 1, which the party also signed.*

## Part three: rare cases

### 16. Forks of records

#### Rule 90. Forks of records

*In short: where a collective's rules let parties act independently and two records split the agreement, the version before the split stays in force until a later change, recorded after both branches, chooses one.*

Collectives only. Where a change rule of a collective (a clone rule, or an area's power) lets parties act independently, two records can fork the agreement. The parent stays in force until a clone of either branch resolves it (the concurrency rule, terms field 10, is withdrawn). Only a clone written on the collective's record after both lines (a record that each line of the fork is before) resolves it. It comes into force there, and the other branch is not in force.

A clone of a branch is a clone of that branch's latest clone, as records follow the agreement chain one clone at a time (rule 72):
- where a branch moved on, a clone of its first clone resolves nothing;
- where a branch forked again, no clone resolves the fork through it.

Two clones recorded on concurrent lines are such a fork, settled the same way (rule 72).

*A clone names one parent (field 11), so "a clone naming both branches" could not be written; recording a clone of one branch after both lines shows the collective saw the fork and chose. "Its latest clone": read as a clone of the branch's first clone, a resolution would silently drop a clone already recorded on that branch. A clone of one branch recorded after only one of the lines resolves nothing, and two clones of the branches recorded on concurrent lines leave the fork as it was.*

### 17. How a collective ends

#### Rule 91. How a collective ends: four shapes

*In short: a collective ends in one of four ways: a group leaves and the collective carries on (A), it forks into successors (B), it is abandoned but keeps earning (C), or it is dissolved and closed (D).*

Collectives only. *A fork forces a whole lot of decisions to be taken again.*

**A broken collective cannot fork or close before it is rolled back** (rule 93): while it is broken, no fork or closing counts, whatever line it names. *Whoever wants to push an official act fixes the issue first.*

- **A. A group splits off, with the powers to do so.** This is an ordinary membership change (rule 69). The collective re-signs, by a constitutional clone put in force as rule 69 says (a rotation where a leaver holds a share of the chain key), and keeps its identity. The members who leave become departed holders, recorded with their stake in the departed members entry (field 22, rule 68), keeping it under equal treatment, the pointer check and no veto. They may found a collective of their own. Members without the powers can still leave one by one (rule 70) and found something new together.

- **B. The fork proper,** where both groups want changes and disagree.

  Each side first founds its successor: a new collective (its own genesis and keys) whose founding terms have that side's members as parties and name the original in "forked from" (field 23), a back-link only, never a parent.

  **A fork act (type 19) names the successors by their identities, and, signed by the members on its sides with their own identities under the constitutional change rule, closes the original in Agreements.** By default that is every member, a silent member being the abandonment clause's business. Where the founders set a lower rule, the fork may complete without a member, who must then either join a side or leave: a member who signs no side has no seat in any successor, and is a departed holder of each at their percentage. **Where the constitutional change rule counts by share, an ending is counted by share at its line** (operate by share, end by share): the holdings are those field 7 of the agreement in force at the line names, with the stake transfers placed in the ending's history (rule 94, read at the ending's line); each rule the constitution lists is counted as it would be alone (rule 65), the members by their chain signatures on the ending. **Owners who are no members consent as members do, by a chain signature (Identity type 16) with their own chain key naming the ending**, judged as every ending signature is: it counts at its position in their chain, and no later rotation voids it. *The ending names its history by what it cites on the collective's chain, so nothing in that history can acknowledge a signature on the ending itself: one way to sign an ending, whoever signs.*

  From the fork's line, nothing done for the original counts in Agreements, whatever its key grammar's holders do. A rotation of the original is optional cleanup.

  *Two fork acts signed concurrently on the same agreement, neither naming the other, are concurrent acts on its chain (rule 6): the status quo stands, and neither closes it, until one names the other. **A complete fork or closing is final**: a later ending of the same collective, naming it, counts for nothing. A later fork of a successor is a new fork, of the successor, in sequence.*

  Once the fork is complete:
   - **Ownership.** The fork act transfers the original's stake in each work, as a stake transfer, to the successors, in the shares it names (field 5). By default the shares are in proportion to the stakes of the members on each side in the original itself (field 7), divided in millionths, leftovers by largest remainder as rule 9, ties ordered by the hash of the fork act with each side: `tagged_hash("MOR/law/leftover", [ fork act's id, successor's identity hash ])`, the array of two byte strings in deterministic CBOR, the side whose hash is smallest in bytewise order first. Where the original carries no stakes in itself, each member counts alike: no agreement means equal weight. Each successor then owns its share outright and runs it: pointer, rails, split service. The work's fingerprint never changes.
   - **Departed holders keep their percentage in every successor,** and their stake follows into the successors' future works, a stake in each collective as a whole. Each successor's founding terms keep every departed holder of the original, and every member who signed no side, at the same share of all its income, in its stake in itself (field 7) and its departed members entry (field 22); the members divide the rest. **And no successor's founding terms pay a kept holder less than the original's did, unless the kept holders consent** (rule 95): a successor's plan taking more off the top, or a higher fee, is a change paying them less, as for a clone. *Example: four at 25%, one of them departed; sides taking two thirds and one third: the departed holds 25% of each, the others 37.5% in one or 75% in the other.* *If too many departed members still own shares, the incentive is to found an entirely new collective instead of forking.*
   - **Debts.** The fork cites the original's action head, and hands out every obligation in that history, each to one successor or to several jointly, or it does not take effect ("Fork (type 19)").
     - The successor collective signs for each debt assigned to it, by its own chain signature on the fork (Identity type 16), so members are never made personal debtors of what the collective owed, and no later rotation of the successor unmakes the fork.
     - **A complete fork is never undone over a debt**, nor by a later ending: a debt uploaded after it was in its history, and handed out, or outside it, and void (the tie rule).
     - No successor owes a debt the fork did not hand it.
     - A later fork of a successor hands out, in turn, what an earlier fork handed it, where its own chain signature on that fork lies in its identity chain before the later fork's chain act (the signature is a chain act).
     - An obligation signed by a collective binds it once done, like any act (rule 57): sealed to every member, and on its chain. A debt sealed to the creditor alone binds no one, its signer included, so hiding gains nothing.
     - Publishing the debt is the creditor's choice and protection (client conformance), and no validity rests on where an act is stored.
   - **Grants.** Every grant of the original ends at the fork's line, as when a departure empties an area (rule 71), and the original's split agreement with them. Each successor grants what it wants. An act under a grant in the history the fork cites, or that the original adopted before the fork, binds, as a debt. Any other is missing from the ending's history, and void (the tie rule): its counterparty deals again with a successor.
   - **Money after it.** Payment follows the work's ownership agreement: the work carries nothing and never changes; the fork passes the original's share in it to the successors, so routing follows to their own pointers and split services. A payee pointer of the original that the ending left outside its history still counts for payments made before the ending's line, as the chain stood for each, and for none made after it ("Fork (type 19)"; Money rule 4).
     - The fork ends the original's publications from its line (rule 12): a wallet reading Agreements sees them ended, and pays a successor's publication instead.
     - **A payment that reaches a publication of the original after the fork** (a wallet not reading Agreements paying a tag of an ended publication, a push rail that cannot refuse) **is owed back to the payer as a refund**, as a payment racing an ending is (rules 11, 12).
     - A sale the original's chain recorded in the fork's history stays a purchase.

     *Client conformance:* a split service whose publication has ended issues no payment request. *Stated cost: a wallet reading only Money does not see the ending, and could still pay an on-chain address of a dead service; that money is owed back to it.* *The work is the point of payment; it needs nothing of the old collective.*
   - **Defaults.** Whatever the fork act does not settle falls to these defaults.

- **C. Actively abandoned,** where everyone agrees the collective has ended but its works still earn: a plain collective, nothing new. It keeps its rules, changes rails, renews its publications and pays every holder until winding it down makes sense. *A plain collective is enough; only how its stakeholders use it changes.*

- **D. Dissolution,** where the collective dies. Its works are sold (stake transfers, rule 10) or released to the public domain (rule 55), then it closes. **Each sale or release of a work is an owners' matter** (rule 95): the owners of the collective's stake in itself who have no say consent, by their holders' rule or each signing. **A closing act (type 20), signed under the constitutional change rule like the fork act, and counted by share at its line where that rule counts by share, as a fork is, ends a collective that holds nothing and owes nothing.** After its line, nothing done for the collective counts in Agreements. A collective cannot close while it owes anything: one that cannot pay stays open, abandoned, its debts visible, until each is paid or its creditor releases it (rule 92). This is the whole of liquidation: ordinary sales, transfers and releases before the closing, the closing naming no stake. An absentee's money share follows the collective's own rules (its split plan, its absence clause, its terms); what they could not deliver stays visible as an open obligation wherever they sent it, and it does not keep the collective from closing. The closing names nothing for it; field 4 stays for money owed back (rule 93, "Closing (type 20)"). Batching them is a client's or a cMIP's convenience, never a second way in the core.

*"A fork closes the original" holds for shape B only. No group keeps the original identity: a lone holdout keeping the identity, its history and its pointers while everyone else leaves was the cost that closing the original removes. Leaving costs the vote and the right to act, never a stake unless it is sold.*

#### Rule 92. The creditor's release

*In short: only a creditor can forgive a debt, by signing a release.*

The creditor's release is a Money act. **A creditor may end an obligation owed to it without full payment** by a creditor's release (Money type 4), for instance against stakes or a partial payment.

Only the creditor signs it. No rule, majority or court can discharge a debt for it, and a release signed by anyone else ends nothing.

A collective creditor signs it under its rule for Money alone: forgiving a sum only gives up money, and the release is a Money act, which that rule reaches (rule 60).

A release given against future terms (a share of future income, stakes) is also a deal: an Agreements agreement of its own, signed under the collective's rule for Agreements, which the release names among what it was given against (Money release field 1). The agreement binds on its own, and the release counts whatever it names, its field 1 a record only, never checked. *Plain forgiveness needs the rule for Money; forgiveness traded for future terms needs both rules, each for its own act.*

Once it counts:
- the obligation is owed by nobody, the debtor or any successor owing it (rule 91);
- it ends the whole debt, whatever was paid toward it: to forgive part, the debtor signs a new obligation for the rest and the creditor releases the old one;
- it counts wherever a verifier holds it, public or not, even before the debt it ends binds.

**A closing checks that every debt is paid or released** (rule 91, D). **For a closing, a release counts only where an act of the collective in the closing's history acknowledges it** ("Closing (type 20)"); one nobody acknowledged is shown, and the closing waits. Everywhere else the release counts wherever a verifier holds it, as above.


*Bankruptcy, walked through: a collective that cannot pay keeps its debts open and visible and cannot close; its assets can go to its creditors by sale or by stake transfers, debt turned into ownership; its members are not personally liable; what was missing was discharge, and MOR has no court: the creditor's release is the creditor's own word.*

### 18. A broken collective

#### Rule 93. A broken collective, and its way back

*In short: a collective is broken when a rotation moves its chain key without putting a valid agreement in force, so Identity and Agreements no longer agree on who is in. While it is broken, everything done in its name counts for nothing, and it keeps only what its rules before the break allowed. The way back is a rollback: a later rotation returning to the agreement in force just before the break.*

**What breaks a collective.**

A collective is broken when its chain key moved by a rotation whose declared agreement fails rule 69, or whose Agreements declaration is missing or cannot be read. Identity counts the rotation, so the key has moved, but:

- the clone it declares is not a clone of the agreement in force; or
- it does not change the constitutional tier; or
- it is not complete with the signature acts the declaration names (its mark false, rule 46, included); or
- the rotation declares founding terms; or
- it removes the Agreements declaration; or
- it carries one in neither form.

Agreements then finds no agreement in force, and Identity and Agreements no longer agree on who is in. That rotation is **the broken act**: the first such rotation after the last agreement in force.

*Breaking the collective is what makes such a move worthless. If Agreements ignored the failed declaration and carried the earlier agreement forward, whoever holds the chain key could rotate a member out of the keys at no cost.*

**This is also how a constitution counting membership among a stake's holders is kept** (rule 69): a rotation without the holders' signatures it requires breaks the collective, as one without the members' does. It compels no rotation the key holders refuse. **An owners' matter passed in a broken stretch counts for nothing**, with every other act of the stretch; a rollback registers no holders' vote, so the owners' matter is made again after it.

**The broken stretch and quarantine.**

The broken stretch runs from the broken act to the rollback. **An act for the collective is of the stretch where its history holds the broken act, or a rotation after it, and does not hold the rollback.** Every act of the stretch **stays shown and counts for nothing in Agreements**, during the stretch and after it. An act whose history holds neither is judged as made before the break, under the rules before it, wherever it was made. *No act for a collective is bound to a link of its identity chain, since the collective has no signing key; what an act cites says which side of the break it stands on.* This covers the broken act, the rotations after it other than the rollback, records and the clones and departures they write, agreements, releases, debts, grants, and every other act in its name.

Such an act places no signature at all, a member's signature act on a declaration of absence included ("Made before, made after", 2). Its records register nothing (record field 3): only the rollback's registration counts.

The broken collective is quarantined. *A broken collective is broken until fixed: quarantined as much as possible.*

**A grantee's act of the broken stretch counts for nothing**, like the collective's own. The grants issued before the broken act work again after the rollback, which restores every condition as at the act before the break: a grant issued, revoked or ended by an act of the stretch is as it was before the break (rule 73).

*Client conformance:* a member's or grantee's client cites the latest decision of the collective it holds in every act it signs for it, and, after a rollback, the rollback or a later decision. *MOR has no clock of its own, so an unanchored act proves where it stands only by what it cites. Stated cost: an act that cites only decisions before the break is judged under the rules before it, even where it was made during the stretch or after the rollback; the rules before the break are what the collective keeps.*

**What others relied on during the stretch (a debt, a sale, a receipt) counts for nothing, for good, and is signed anew after the rollback**, never adopted by citing it (rule 76 does not reach it).

**What the collective keeps.**

**The broken collective keeps exactly what its rules before the break allowed.** The test: would it have been valid under the collective's rules as they stood just before the break? If yes, the collective keeps it; if not, it does not.

A payment is judged by the publication it was made under, not by when it was paid:

- A sale under a publication the collective signed before the break is kept, even received during the stretch. What the collective owes for it (a key delivery) is done once the rollback lets it act.
- A debt paid to the collective under an agreement made before the break is kept, and stands as paid.
- A payment naming nothing, a tip, is kept.
- **A payment under a publication the collective signed during the stretch is no purchase and is owed back to its payer** (Money rule 19), unless the sale is signed anew after the rollback, by a receipt of the collective for the same payment. Until settled it stands as a visible open obligation.

A payment shown only by its payer's claim is judged the same way, by the publication it was made under. The rail's own time (a block, an invoice) is supporting evidence where it exists, never the rule.

*A publication the collective signed during the stretch is an act of the stretch: its signature counts for nothing, so the publication never counted, and a deal the collective signed during the stretch never came into force. The collective is read as having an internal problem that freezes changes to its external interactions: the collective's own acts of the stretch still count for nothing; what it keeps is only what others did within rules that already held.*

**Money owed back, and how it is repaid.**

**Money owed back from the stretch is repaid like any debt**, with no new act:

- by a payment naming what it repays: the receipt's field 5 or the claim's field 4 naming a receipt or claim of the payment owed back;
- made to its payer;
- proven by either side's record, the payer's receipt or the collective's claim (double entry, Money rule 11).

Repaid in full, it is no longer owed.

**It follows the debt rule exactly** (Money rule 17). The repayment goes:

- to the refund rail the payer's own claim on the payment names (key 7), where it names one, counting up to the payer's vault limit for its unit and, above it, only once it reaches the payer's vault (rule 11);
- otherwise, to the pointer Money rule 17 selects from the payer's own acts on that payment, or the payer's pointer in force where they hold none.

A payment to the payer's vault always counts, and the payer's own receipt counts wherever the money went.

*Why: a repayment counted at any pointer the payer ever uploaded would let a collective repay to an old pointer a thief controls and be cleared while the payer lost the money; Money rules 17 and 29 exist to stop exactly that for every other debt. Stated cost: the collective looks up the payer's current pointer, as any debtor does.*

**A refund owed to a bare key** (Money rule 19) **is repaid once the collective's claim carries the rail's proof that the money reached where the claim signed with that key said**: the same double entry, a claim with a rail proof showing the money arrived.

**Money owed back to nobody stays open and visible, but does not block a closing** (stated here, not in Money). This is a payment that committed no key, whose refund Money rule 19 can pay to nobody. The closing act names every such obligation it leaves open (the closing's field 4), as a settling version names every tip it drops.

*Why: one anonymous tip with no key, received in a broken stretch, kept the collective from ever closing, a protection trapping every member with nobody gaining from it. Stated cost: a collective may close while visibly owing an anonymous payer who could never have been paid.*

**Money owed back to a payer who gave no address**: a payer with no payee pointer, vault, or refund rail on a claim of theirs. Before closing, the collective sends the payer **a notice sealed to their identity, with a deadline on a time reference** (type 24), asking where the money should go.

- If the payer names an address in time, they are paid.
- If not, the collective may close, the debt named in the closing act, visible and unpaid.

A collective may also set the amount aside with a named holder that outlives the closing and pays the payer when they turn up (a keeper or custodian role, for a cMIP to define). The core allows it, shows it beside the debt in the closing act, and requires neither the holder nor any one notice period.

*Why: a stranger who pays a penny from a fresh identity under a publication of the stretch, and makes nothing public, would otherwise freeze the collective's ending for good. After a closing nothing done for the collective counts, so nothing could be paid later: the notice comes first. The notice demonstrates good faith, its degree set by the notice's conditions.*

*A payer who committed only a one-time key cannot be reached by a notice.*

*The network records and shows the debt and the payer's claim; it cannot force a payment back, as with every obligation in MOR.*

**No fork or closing while broken.**

**A broken collective cannot fork or close before it is fixed.** A fork or closing made during the broken stretch counts for nothing, then and after the rollback (rule 91). And while a collective is broken, no fork or closing counts, whatever line it names, the last good link before the broken act included.

Money owed back from the broken stretch is a debt for a closing's "owes nothing": the collective cannot close until those payers are settled. Two kinds are the exception, and the closing names them as left open:

- money owed back to nobody;
- money owed back to a payer who gave no address and let a notice's deadline pass.

*An emergency has emergency rules: all that happened under it is settled by the rules before the emergency is lifted. A closing on an old line was a quiet way out of the refunds owed for the stretch.*

**The rollback.**

**The way back is a rollback.** A later rotation of the collective declares a rollback: a clone

- whose parent (field 11) is **the agreement in force just before the broken act**, the one in force at that rotation (rule 72); and
- which names the broken act, which it voids and which stays shown ("Collectives in the identity chain").

Nothing is erased. The identity chain carries on: the rollback rotates from the keys the broken stretch holds, as any rotation does (Identity). The agreement chain forks from before the broken act, and the broken clone stays on its own branch, never in force.

*The chain forks from one act before the corrupted one, while showing the corrupted one: that is what the collective faces, a rollback.*

The power it needs. **A rollback needs the constitutional change rule of the agreement in force just before the broken act** (rule 64), counted among the voices that remain at the rollback (rule 65). By default that rule is every party whose voice remains. So a party no longer blocks it:

- whose departure (a resignation, rule 70, or a declaration with outcome 0, rule 89) the collective registered on a line before the broken act; or
- whose resignation, stepping down from an area, or declaration of absence the rollback itself registers.

*Whatever was in force just before the broken act needs the approval that version requires; the broken act is void, and always referenced: the constitutional powers must be met.*

Where every voice that remains for that rule has resigned, nothing meets it (rule 65): no rollback is possible, and the collective stays broken (rule 70, "The last voice").

The rollback's mark (field 4) names the constitutional change rule, `[0]`, with its signers. Where the clone also changes the judicial tier, it names the judicial tier's rule, `[4]`, too, every party whose voice remains (rules 64.1, 67). It names nothing else, whatever its changes: a rollback may change nothing, or may redo correctly the change the broken act failed. *Its mark is checked against these powers, not those of rule 64.2, so a rollback copying its parent unchanged is no false mark (rule 46). Rule 69's "MUST change the constitutional tier" does not apply to it: a rollback is a rotation by its nature, since only a rotation fences off the broken stretch's keys.*

What it registers. **The rollback may register a declaration of absence made during the broken stretch** under the clause of the agreement in force just before the broken act, exactly as a record does outside the stretch, so that a member who dies or vanishes during the stretch does not block the way back. *A faction that is the absence authority could already declare a member absent falsely with no break: the break adds steps, not power; the new risk was attention, which rule 88's client conformance closes.*

**The rollback is a line**, by the signature acts its declaration names, as every rotation is ("Made before, made after"): its clone is in force for the collective's acts after it, and the resignations it registers take effect there.

In everything else a rollback is a clone like any other:

- complete only with the signature acts its declaration names, counted at the rollback (rules 45, 46, 48);
- every party it adds signing it;
- every constitutional voice covered (rule 61);
- its key grammar valid (rule 59).

What it may never do. **The rollback's clone is never the clone the broken act declared**, which stays on its own branch, never in force: a clone of the same rules, signed afresh, may redo the change.

A rotation in the broken stretch that names another act as the broken act, or declares any other agreement, or a rollback that is not complete, is part of the broken stretch, and a later rollback still names the first broken act.

After a rollback, a later rotation that fails rule 69 breaks the collective again, and the next rollback names that rotation.

**A rollback voids only an act Agreements read as broken, never a valid one.** A rollback naming a rotation that met rule 69, or declared where the collective is not broken, puts nothing in force. Being a rotation declaring an agreement that fails rule 69, it is itself a broken act: the attempt breaks the collective, visibly, and is repaired by a rollback to just before it.

*Repair, not undo: a complete ending is final, and a signature placed counts. A break made on purpose reaches back no further than the agreement in force just before it, which holds every valid decision made until then; a person has no rollback.*

*Client conformance:* **a client MUST NOT propose a rollback unless Agreements read the collective as broken.** *A client that does not comply makes its user's attempt fail as above, visibly, at the attempters' cost.*

*Stated cost: the hold-out. A member whose signature the rollback needs can ask a price for it; it is the veto it has over any constitutional change, worth more on a broken collective.*

*Stated cost: break and hold. Holders of enough of the chain key can break the collective on purpose and refuse the repair, freezing a decision they dislike while staying in; they could already leave it unable to act by refusing to sign, and the break stays shown.*

**Technical breaks, and a first agreement that fails.**

**A rotation that removes the collective's Agreements declaration, or carries one in neither form, is a broken act too**, a technical one, with the same way back.

**A collective whose very first agreement fails has nothing to roll back to: it is simply refounded**, as a new collective, with no rollback. *Stated cost: small; a new collective has no history, works, money or followers yet.*

### Made before, made after

*In short: MOR has no clock, so "before" and "after" are always read on one chain. For anything done for a collective, that chain is the collective's own: never a member's personal sequences.*

*MOR has no clock, and every identity may keep several sequences at once, one per device (Envelopes, "Sequences"). A member's own sequences cannot settle what happened first: members keep as many as they like, forget some, and nobody else can see them all. Envelopes' own principle settles it instead: every "before" in the core is judged inside one named chain, by reference to a specific act (Envelopes rule 16). For anything done for a collective, that chain is the collective's own: the acts that name it, each citing the decision it acts under and the other acts on the chain it knows (rule 58). A collective has no signing key and so no sequence of its own; its chain is made of its members' and grantees' acts, joined by what they cite. The chain's role is to make acts unmissable, not to confirm them.*

**For anything done for a collective, "before" and "after" are judged only on the collective's chain, by what its acts cite, never on a member's personal sequences.**

This holds for every event that changes who may act for the collective:

- a member's resignation or stepping down (rules 70, 71);
- a declaration removing a voice (rule 89);
- a member's own rotation (Identity);
- a clone put in force (rules 69, 72); and
- the freeze of an area or a layer (rule 71).

Each takes effect for the collective's acts at a line. A line is a record (type 17), a rotation of the collective, a fork or a closing. A record names, in `objects` on the collective's chain, the previous decision and the other acts it knows (its **tips**); a rotation's history is that of the signature acts its declaration names, each citing the collective's chain as an action does; a fork or closing cites the chain in its own `objects`.

1. **The collective's own acts.** An act for the collective counts as made before a line when the line's history holds it. That is, when it:

   - is an act the line names on the collective's chain (a tip);
   - is reached from there through what those acts name on the collective's chain, the tips of a record so reached, and the signature acts a rotation so reached names, included.

   Every other act for the collective counts as made after it, whenever it was really made. That includes an act on a branch the line left out, by mistake or on purpose; an offline member's act its drafter had not heard of; and a fork made later from an act before the line.

   **While an act the line's history names is not held, whether an act is before that line is unknown; nothing is void on it.** "Made after" is read only where the line's history is held whole: a verifier with a hole in it voids nothing by the tie rule (point 7) and takes no voice away (rule 65) on that line; it answers unknown, and judges again once it holds the act.

   Lines are ordered among themselves the same way, by what they cite alone.

   **For the agreement in force at a record, only the decisions in its history count.** For an action, the decisions its history holds count, and those in their histories (rule 72). A record it does not cite, a concurrent one included, decides nothing for it, save where it ends a power the action uses (the tie rule, point 7).

   *An act within its signer's powers counts as the signer knew the collective's chain.* *Read literally between two records drawn by two members, each would count as after the other, each would judge the other's clone under the wrong parent, and a fork of records could never arise.*

2. **Others' acts are placed by the collective's.** A signature act on an act for the collective is placed:

   - at the act for the collective it signs;
   - at a record naming it among the signature acts that complete its clone (record field 2);
   - at a rotation naming it among the signature acts that complete the clone it declares (rule 69);
   - at a recovery rotation naming it among the signature acts on a declaration that takes effect there; and
   - at any act for the collective on its chain acknowledging it (Envelopes, `acks`).

   It counts as made before a line when one of those acts does, and as made after it otherwise.

   An Identity witness act, on neither chain, places nothing and counts for nothing in Agreements.

   An act a grantee signs for the collective is on its chain, citing its grant, as every action cites (rule 58). It is before a line when the line's history holds it: when an act for the collective before the line names it, or a later act that such an act names reaches it. Where a decision ending the grant's powers does not hold it, the tie rule voids it, or, for a revocation, voids it or shows it disputed as rule 76 says (point 7), save where the collective itself adopts it (rule 76).

3. **A departure takes effect at the collective's line.** A resignation, a stepping down, or a declaration removing a voice takes effect for the collective at the line registering it: a record naming it in field 3. A member's voice remains for an act for the collective made before that line, and through any signature of theirs placed before it. For everything after it, it is gone (rules 70, 71, 65). **A member's power ends at the line that registers their departure; their own key continues to sign their own acts.**

   **Two lines neither of which is before the other are concurrent.** Where a departure is registered on both, an act counts as made before it only when it is before both. Records on concurrent lines are a fork of the agreement chain (rule 72).

   A rotation declaring a clone that removes a party, or takes a holder off an area, is that change's own line (rule 69).

   Rarely, a declaration takes effect at a recovery rotation: where no member other than the declared one remains to draw a record (a collective of one, for instance), at the rotation made by the recovery path (rule 59), its history that of the signature acts it names. That is the rotation that removes the declared member, declaring the clone that takes that party out of the parties, so that clone is counted without the declared party. Where the declaration's authority is a threshold needing more than its own signer, that rotation names the others' signature acts and places them there. The abandonment authority draws no line for the collective.

   *A rotation names no declaration itself, only the signature acts completing one where its number needs them; a recovery rotation declaring nothing new removes nobody, and leaves the declaration to the first record after it.*

4. **A member's own rotation is registered the same way.** The collective registers a member's rotation (Identity) on its line, as it registers a departure (record field 3).

   An act or signature act of that member made with the key the rotation replaced, and placed before that line, stays valid for the collective, whatever the rotation kept or disowned. Its status under Identity is unchanged, and every client shows that status.

   Such an act placed after that line is judged by Identity alone (rule 6).

   *If the member's key was stolen, the thief's acts for the collective placed before the line count too, within the member's power; the collective then reorganizes around the theft.*

   *Stated cost:* *within a collective, Identity's theft protection is softened to this extent.*

   *Stated cost:* *a signature on a clone that no act for the collective placed before the line registering its signer's rotation is judged by Identity alone, so one made from a device the rotation forgot no longer counts; the member's client avoids it by acknowledging members' signatures as they arrive.*

   **This reaches every act a line places.** An act of another identity that a line of the collective (a record, a rotation, a rollback) names, registers, or relies on to count what it registers keeps, for that collective, the effect the line gave it, whatever its signer's later rotation kept or disowned. That is:

   - an act for the collective that the line's history holds;
   - a resignation or stepping down (type 16) a line registers;
   - a declaration of absence (type 13) a line registers, or a recovery rotation or rollback takes effect on, and the signature acts completing it that the line places;
   - the signature acts of the declared party that the declaration's field 1 is checked against, as the line judged them (rule 87);
   - a signature act a line names among those completing a clone, or places by acknowledging it (point 2), a holder's vote on an owners' matter and a proxy's among them (rules 94, 97);
   - a stake transfer, a proxy and its revocation that a line registers or acknowledges (rules 94, 97);
   - a take-up of an issuance offer that a line registers or acknowledges (rule 96);
   - **a keeper's record that a rule reads to place an act (point 5), or that a version's completeness relies on (rule 47)**: it keeps the effect the rule gave it, whatever the keeper's later rotation disowned, shown as a dispute, as rule 42 says for every agreement, a collective's or a deal's. *A witness chosen in advance cannot un-witness.*

   Its status under Identity is unchanged, and every client shows it as a dispute on the line. The line is the collective's own act (Identity rule 34's "disowned but relied on"; "what others relied on stands"), so the record stays a line, the clone it wrote stays in force, the departure stays taken, and every later record finds its parent. An act a line never placed is judged by Identity alone: disowned by its signer's rotation, it is shown, and decides nothing.

   *Stated cost:* *a thief holding a member's signing key can resign the member; once the collective's line registers the resignation, the member's rotation does not undo the departure for the collective, and the member comes back by a constitutional clone naming them (rule 65). A stolen key can so take a voice out until the collective puts it back; the alternative would let one member's chain unwind the collective's year.*

5. **The collective's keepers place its own acts a line left out.** An act for the collective that a line left out counts as made before that line when the keepers named by the collective's agreement in force for the line recorded it before recording the line. This is as the keepers' own rule counts what is recorded: any one, a threshold, or all of them (rules 38, 41, 42).

   Keepers place only acts for the collective: never a member's signature act, or one line against another, which only what the lines cite orders.

   *Stated cost:* *a keeper that records a line late opens a window, the trust in keepers rule 42 already states.*

6. **Nothing else places.** An acknowledgement by any other identity (Envelopes), a member's friend or a counterparty, carries no place on the collective's chain: it keeps the act visible and changes nothing here. A member's personal sequences, their `prev` among them, and which device signed what, are never read for the collective.

7. **The tie rule.** Where a decision ending powers and an action using them cite neither each other, **the ending wins: the action is void**, or, where the ending is a grant's revocation, void or disputed as rule 76 says. A decision ending powers is a fork, a closing, a departure, a grant's revocation, or a departure emptying an area or freezing a layer. So:

   - an act for the collective a fork's or closing's history does not hold counts for nothing (rule 91);
   - a member's voice a line removes is gone for every act the line's history does not hold, an act judged under a version earlier than the one the departure names included (rule 65);
   - an act under a grant that the line emptying its area does not hold is void (rule 71); one that a revocation of its grant does not hold is void, or disputed under rule 76.

   "Does not hold" is read on a history held whole: while an act the history names is not held, the action is unknown for that verifier, never void (point 1).

   *An action missing from the ending's history was made with powers that are ending; its counterparty deals again with a successor. Otherwise anyone holding a power could keep a fork or closing from settling by racing it. A counterparty protects itself by waiting until the collective's chain visibly moves past its act before delivering.*

   **The tie rule voids only acts the collective never took on.** An act that an act for the collective that counts cites is adopted (rule 76), and no ending racing that citation voids it. "Cites" is meant as a line cites: the act lies in the citing act's history.

   *A revocation drawn by a member who had not heard of the citation cannot reach the act; it ends the grant for everything after it. A departure racing the citation takes no voice off the act: the act counts if it counts as judged, or once the departures racing its citation are set aside (whichever of the two judgments counts). Against a fork or closing nothing changes: an act citing it that the ending's history holds puts it in that history, and one the history does not hold is itself void.*

   *Stated limit:* two acts signed at the same moment without seeing each other cannot be ordered by hashes alone; with two chains this remains only where a decision ending powers meets an action using them, and the tie rule settles it. Where the decision ends no power (a record of an operational or judicial clone), each act is judged under the decisions it cites (rule 58).

*Stated cost:*

- *A departure takes effect for the collective's acts when a member draws the line, not when the departing member signs it: until then, the departed member's acts still count for the collective. Any member can draw the line, so a collective that delays it only delays itself.*
- *An act for the collective on a branch a line left out counts as made after it, unless a keeper placed it: the cost falls on the collective, whose line it was, and on whoever relied on the act.*
- *A member who left can still complete an act the collective signed before its line, and it counts: the act was drafted with her in it. A pending act stays completable by whoever held the power when it was made.*
- *A signature the collective never acknowledged before its line, on a clone recorded only after it, no longer counts for its departed signer; a member's client SHOULD acknowledge members' signatures as they arrive.*

*Client conformance:* the members' clients share the acts they hold for the collective before a line is drawn, and a client warns before drawing one while a member has not been heard from, as before a rotation (Identity). **For a fork or a closing it refuses**: a member's client signs no fork or closing, its own or another member's, until it has pulled every member's latest acts for the collective and holds every act the ending's history should hold.

**In a deal, a declaration draws its own line.** A deal has no chain of its own beyond its versions, and no collective's line reaches it. An abandonment declaration with outcome 0 (rule 89) removes the party's voice in a deal from then on. Every signature act of that party on the deal counts as made after it, except one that the keepers the deal names recorded before recording the declaration, as their rule counts it (rules 38, 41, 42). So a clone of the deal completed, and so recorded, before it is never undone. The other parties then change the deal without the declared party (rule 47).

**What others relied on stays complete before any declaration's line.** A declaration's line decides only what no relied-on version holds: a version of the deal that a party's or keeper's later act relies on (rule 47) stays complete, the declared party's signature on it included, in a deal that names keepers and in one that names none.

*A deal's authority is one identity: its signature alone makes the declaration, so the declaration is its own line, with nothing to complete after it.* *A signature on a deal's clone names the clone, an agreement, so the deal's keepers can place it; deals that need protection name a keeper.*


## Part four: act formats

All acts are Envelopes MIR acts, private by default, visible to the agreement's parties and keepers unless they choose otherwise.

Every act type below has its exact format.

Every Agreements act type may carry acknowledgements (`acks`, Envelopes rules 18 and 19).

**An act for a collective** is signed by a member or a grantee, with their own key, naming the collective on its chain in `objects` after the entries its type defines (rule 58); where the table says "the collective", it means so. A collective signs nothing itself.

| Type | Name | Signed by |
| --- | --- | --- |
| 0 | Terms | the proposer. Terms carrying a target (field 33) are an ownership agreement |
| 1 | Signature | each party (or grantee, or collective member) |
| 2 | Keeper record | a keeper's operator |
| 3 | Claim | a sole creator; or one creator, who opens it, completed by the other creators' signature acts. Counts only public or addressed to every creator it names |
| 4 | Stake transfer | the seller, who also signs it by a chain signature (Identity type 16), which fixes its place on the seller's own line; completed by the buyer's signature. Names the agreement as `[agreement, agreement]` |
| 5 | Public domain release | a direct owner of the work, completed by the signature acts of every other holder of the stakes it ends, unless the release rule says otherwise (field 24). A collective owner signs by its own rules, under its rules for Envelopes, Money and Agreements |
| 6 | Publication | always public. Its drafter, completed by the signature acts of its other parties: the owners' side (the ownership agreement it names, consenting by its own rule; for a collective, under its rule for Agreements), each partner and its split service (rule 11). A split agreement of a collective likewise, the collective signing under the judicial tier's rule (rule 15) |
| 7 | *Retired*: the payee's receipt naming the price tag confirms delivery of a bake whose key is public; never reused | — |
| 8 | Split | the split service, with its own key; delivered to every holder and partner it pays |
| 9 | Grant | the grantor. For a collective, an act for it, counting under its rule for Agreements, or, granting within an area, completed by its holders' signature acts; a reinstatement (field 7) likewise. Accepted by the grantee's own signature act |
| 10 | Revocation | the grantor, naming the grant it ends. For a grant within an area, completed by that area's holders' signature acts |
| 11 | *Retired*: adoption is by acknowledging, citing or paying on (rule 76); never reused | — |
| 12 | Liveness | a party; counts only public or addressed to the agreement's other parties |
| 13 | Abandonment declaration | the authority the clause names, always an identity. For a threshold of the other parties (in a collective only): one of them, completed by the others' signature acts, which the recovery rotation names where the declaration takes effect there |
| 14 | Contest | anyone with standing (rule 54): the party a declaration of absence names, answering it; the buyer of a purchase, contesting it, a vow's sale included (rule 13); anyone else with standing, contesting another act |
| 15 | *Retired*: a Module states its fee in its own specification (Development field 7); never reused | — |
| 16 | Resignation | the member giving up their voice, or stepping down from one area, naming the drafts they leave behind |
| 17 | Record | any member of the collective, with their own key, naming the collective: its everyday line |
| 18 | Negotiation message | one side of a negotiation thread (rule 52) |
| 19 | Fork | a member of the collective, with their own identity; completed by the chain signatures (Identity type 16) of every member it lists, meeting the constitutional change rule, with those of holders who are no members where that rule counts among a stake's holders, and by the chain signatures of each successor a debt is assigned to (rule 91) |
| 20 | Closing | a member of the collective, with their own identity; completed by the chain signatures (Identity type 16) of members meeting the constitutional change rule, with those of holders who are no members where that rule counts among a stake's holders (rule 91) |
| 21 | *Retired*: the creditor's release is a Money act, Money type 4 (rule 92); never reused | — |
| 22 | Settlement request | a party who signed a deal's reference version, asking the judge of forks it names to settle the fork (rule 47) |
| 23 | Fork settlement | the judge of forks a deal's reference version names (field 27), or the link of its chain of judgment that took over (field 21), once a settlement request activated it (rule 47) |
| 24 | Notice | the collective, to a payer owed money back from a broken stretch who gave no address. Sealed to that payer, or public naming the payment where the payer committed only a one-time key, with a deadline on a time reference (rule 93) |
| 25 | Request to a judge | someone with standing (rule 54), naming a judge the terms name and the question. Counts, and the judge's period runs, only where public or sealed to that judge (rule 35) |
| 26 | Issuance offer | the collective: an act for it (rule 57), offering each holder of a stake its proportion of an issuance; it reaches each holder it is public or sealed to (rule 96) |
| 27 | Proxy | a holder of a stake of a collective, with its own key, naming the proxy whose signature acts on the owners' matters count as its vote (rule 97) |
| 28 | Revocation of a proxy | the holder who signed the proxy, with its own key (rule 97) |

### Terms (type 0)

*In short: terms propose an agreement. Terms carrying a target are an ownership agreement: a work's, whose target is its claim, or a collective's, whose target is the collective it founds. The format below lists every field; the paragraphs after it are the checks that make terms invalid, and what each field means.*

```cddl
terms-payload = {
  0 => [+ hash],            ; parties: identity or collective hashes; each once, save a party holding two seats by
                            ; succession (rule 83), listed once per seat
  1 => tstr,                ; the terms' words, as canonical text; in a collective, the constitution's and the general
                            ; words (each area's own words are in field 20)
  2 => { * uint => hash },  ; cMIPs, at most one per task (task number => cMIP hash); empty if it uses no task;
                            ; never task 8 in an ownership agreement (the split task is a publication's)
  ? 15 => [+ hash],         ; extensions: cMIPs outside the listed tasks, which add rules and never relax the core's;
                            ; in a collective, adopted under its rule for Development
  ? 16 => [+ succession-plan] ; succession plans of parties, part of the signed terms
  ? 3 => keepers,           ; named keepers, and the rule for what counts as recorded
  4 => rule / mark,         ; founding terms: the signing rule, which signatures make the agreement exist: every party,
                            ; in a deal and in a collective
                            ; a clone: its mark, which change rules of the parent brought it into force, and by whom
  5 => rule,                ; clone rule: in a collective, for operational matters outside every layer's rule and area
                            ; (the judicial tier needs every party whose voice remains, rule 67); every party in a deal
  ? 18 => rule,             ; constitutional change rule; absent: every party (only with field 12)
  ? 19 => layers,           ; who acts for the collective in each layer (only with field 12, and then required)
  ? 34 => [+ area],         ; areas finer than a layer, powers of members (only with field 12)
  ? 20 => { + uint => tstr }, ; each area's own words, as canonical text, by area id (only with field 34)
  ? 6 => [ hash, any ],     ; time reference: the task cMIP and its parameters; a naming for task 10, the same
                            ; specification as field 2's task 10 where both are present
  ? 7 => owners,            ; the stake: the holders of the target and their shares (only with field 33, and then
                            ; required)
  ; 8, is withdrawn: a publication's split plan; never reused
  ? 9 => abandonment,       ; the abandonment clause
  ; 10, the concurrency rule, is withdrawn: rule 90's default stands; never reused
  ? 11 => hash,             ; parent: the agreement this one clones; objects names it as chain and, as predecessor,
                            ; an act of its chain, the latest the signer's client holds (rule 45)
  ? 12 => key-grammar,      ; present if this agreement founds a collective (only with target [1, null])
  ? 13 => [+ hash],         ; arbitrators or verifiers named, who receive keys to judge content
  ; 14, is withdrawn: a publication names its split service; never reused
  ? 17 => refund-terms,     ; until when a refund owed on a payment under these terms is claimable: a point on the
                            ; time reference
  ? 21 => [+ chain],        ; the chain of judgment: who takes over from a judge (rule 35)
  ? 22 => [+ hash],         ; the departed members entry: who left the collective (rule 68; only
                            ; with field 12)
  ? 23 => hash,             ; forked from: in the founding terms of a fork's successor, the original collective, a
                            ; back-link (rule 91; only with field 12)
  ? 24 => holders-rule / [ 2, [+ hash] ],
                            ; the release rule: which of the stake's holders sign its release (rule 55); founding
                            ; terms set it, and a clone every owner signs changes it ; a threshold counted by
                            ; share, never by head
  ? 26 => [+ hash],         ; settles: in a deal's clone only, every tip of the deal's fork this version discards, that
                            ; is, the latest version of each other branch, beside its one parent (field 11) on its own
                            ; branch; ascending, none twice; each also cited in objects (rule 47)
  ? 27 => hash              ; the judge of forks: in a deal only, the identity among field 13 that settles the deal's
                            ; forks on a party's request, following its chain of judgment (field 21) where it does
                            ; not act; absent, none does (rule 47)
  ; 28 (fees) and 29 (the split service's backups) are withdrawn: a publication's; never reused
  ? 30 => [+ [ stake: uint, holders-rule, ? waived: true ]],
                            ; the holders' rules: per stake, by its index (0, the one stake), how its holders consent
                            ; together to the owners' matters; ascending by stake, none twice; a stake not listed:
                            ; every holder (rules 94, 95); only with field 12; `true` third: a standing
                            ; waiver of pre-emption on that stake (rule 96)
  ? 31 => [+ hash],         ; transfers counted: in a deal's clone carrying an owners' matter, the stake transfers whose
                            ; buyers it counts as holders, ascending, none twice (rule 94)
  ? 32 => hash / [ 0 ],     ; issues under: in a collective's clone that is an issuance, the issuance offer (type 26) it
                            ; follows (rule 96); `[0]`, no offer, under the stake's standing
                            ; waiver of pre-emption (field 30)
  ? 33 => target            ; the target: present, these terms are an ownership agreement (rule 7; Part two)
}                           ; key 25 (the relays) is withdrawn and never reused: terms carrying it are invalid

target   = [ 0, claim: hash ]                 ; a work's ownership agreement: the work's claim (type 3), by its act id
         / [ 1, null ]                        ; a collective's: the collective itself, the identity whose genesis
                                              ; declares these terms or the terms they clone
owners   = [+ [ holder: hash, share: uint ]]  ; the one stake, on the target, index 0: holders distinct, each share
                                              ; above zero, summing to 1,000,000; leftovers by largest remainder, the
                                              ; order of holders deciding nothing

layers   = { 1 => layer-rule, 2 => layer-rule, 3 => layer-rule, 4 => layer-rule, 5 => layer-rule }
                                              ; who acts for the collective in each layer: 1 Text, 2 Envelopes, 3 Money,
                                              ; 4 Agreements, 5 Development; every key present, no other (rule 60)
layer-rule = [ 0 ] / [ 1, uint ] / [ 2, [+ hash] ]
                                              ; every party whose voice remains / any k of them / these named parties
                                              ; together; a threshold from 1 to the number of parties

chain    = [ judge, next: [+ [ hash, period: uint ]] ]
                                      ; a judge the terms name, and in order those that take over from it, each with
                                      ; the period, on the time reference, that the one before it has to act once
                                      ; asked
judge    = [ 0, task: uint ]          ; the specification named for judicial task 9, 10, 11 or 14 (field 2, field 6 for
                                      ; 10, or the abandonment clause's key 3 for 14): next are specifications
         / [ 1, identity: hash ]      ; a keeper's operator, an arbitrator or verifier, or the abandonment authority the
                                      ; terms name: next are identities
                                      ; [ 2 ], the split service, is withdrawn and never
                                      ; reused: terms carrying it are invalid

key-grammar = {
  1 => holding,             ; how the chain key is held
  ? 3 => recovery           ; a way to rotate that needs less than every member; required when holding 1 names
                            ; every member
}                           ; key 0 and key 2
                            ; are retired and never reused: a collective has no signing key (rule 59)
holding  = [ 0, holder: hash ]                        ; one holder
         / [ 1, threshold: uint, members: [+ hash] ]  ; any k of these members, by shares
         / [ 2, custodian: hash, grant: hash ]        ; a custodian under the collective's grant
recovery = [ 0, custodian: hash, grant: hash ]        ; a custodian holds a share under grant
         / [ 1, authority: hash ]                     ; an escrowed share released by the abandonment authority

succession-plan = {
  0 => hash,                               ; the party whose succession this is
  ? 1 => [+ [ successor: hash, share: uint ]],   ; stake successors, shares in millionths of the party's shares
  ? 2 => [+ hash],                         ; seat successors, with no voting weight: under a rule by share a successor
                                           ; weighs what it holds of the stake, read from field 7; a successor written with a weight is invalid;
                                           ; a party already among them takes a second seat (rule 83)
  ? 3 => uint                              ; seat entry: 0 automatic where every voice signed this version of the
                                           ; plan, otherwise treated as 1 ; 1 a nomination, approved under the
                                           ; power a change of parties needs (rule 64)
}

abandonment = {
  0 => [ 0, hash ]          ; the authority: a named identity (a keeper's operator, a party, a collective, or a third party)
     / [ 1, uint ],         ; or a threshold of the other parties: in a collective only
  1 => [+ uint],            ; outcomes allowed (rule 89), ascending: 0 voice removed, 1 stake redistributed,
                            ; 3 obligations redirected or held, 4 agreement closed; 2 (once a stake transferred
                            ; to parties named or defined by role) is struck from MOR 1: a clause or a
                            ; declaration listing it is invalid (rule 87)
                            ; key 2 (the period of absence) is retired and never reused: terms carrying
                            ; it are invalid
  ? 3 => [ hash, any ]     ; an absence-proof cMIP and its parameters (a period, a time reference), task "Absence proof"
}

keepers   = [ [+ hash], [ 0 ] / [ 1, uint ] / [ 2, [+ hash] ] ]
                                                    ; keeper operators, and the rule for what counts as recorded:
                                                    ; [0] every keeper named; [1, k] at least k of them (any one: [1, 1]),
                                                    ; k from 1 to their number; [2, operators] each of these, none twice,
                                                    ; every one among those named; operators none twice; terms whose
                                                    ; keepers' rule does not fit them are invalid (no rule by share)
rule      = [ 0 ] / [ 1, uint ] / [ 2, [+ hash] ]   ; all parties / threshold / named parties
          / [ 3, stake: uint, share: uint ]         ; those counted, holding together at least this share, in millionths,
                                                    ; of the stake (index 0)
          / [ 4, [2* rule] ]                        ; all of these rules, each counted as it would be alone
          / [ 5, stake: uint, share: uint ]         ; the holders of the stake, members or not, holding together at
                                                    ; least this share of it ; field 18 only
holders-rule = [ 0 ]                                ; every holder of the stake (the default)
             / [ 3, share: uint ]                   ; holders together holding at least this share of the stake, in
                                                    ; millionths

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
                            ; by its place in field 34
kind = [ 0, layer: uint ]                 ; every act of this layer ("Layer"): 1 Text, 2 Envelopes, 3 Money,
                                          ; 4 Agreements, 5 Development; in a grant's field 6 only (an area
                                          ; reaches act types, a layer's rule the whole layer)
     / [ 1, spec: hash, type: uint ]      ; every act of this type in this specification
field-ref = [ 0, field: uint ]            ; a whole operational field: 7 the stake, 17 refund terms
          / [ 1, task: uint ]             ; one entry of field 2: the cMIP for this task, where the task is operational

mark  = [+ [ power, signers: [+ hash] ] ] ; each change rule claimed, and the parties whose signatures meet it;
                                          ; ascending by the power's deterministic encoding, no power twice;
                                          ; each power's signers ascending by hash, none twice
power = [ 0 ]                             ; the parent's constitutional change rule (its field 18, else every party)
      / [ 1 ]                             ; the parent's clone rule (its field 5)
      / [ 2, area: uint ]                 ; the power over the parent's area of this id
      / [ 3, party: hash ]                ; the succession plan of this party, signed in advance by every voice
                                          ; (rule 83); its signers are the seat successors entering
      / [ 4 ]                             ; the judicial tier's rule: every party of the parent whose voice remains
                                          ; (rule 67)
      / [ 5, stake: uint ]                ; the holders' rule of the parent's stake of this index (field 30): its
                                          ; signers the holders whose signatures meet it, a proxy's vote naming
                                          ; its holder (rules 94, 97)
      / [ 6, layer: uint ]                ; the parent's rule for this layer (field 19), for the cMIPs it adopts for
                                          ; that layer's tasks and the extensions it declares (rules 60, 64)
```


*A rule's threshold is between 1 and the number of parties; named parties are parties. In a key grammar, members of a holding are parties.*

**Rules by share, and "all of".** A rule by share (`[3, stake, share]`) and "all of" (`[4, rules]`) are for a collective's change rules only: its clone rule (field 5) and its constitutional change rule (field 18). A rule among a stake's holders (`[5, stake, share]`) is for field 18 only, alone or within "all of". The stake each names is the one the terms' own field 7 defines, index 0; each share is above zero and at most 1,000,000; "all of" lists two rules or more, none of them itself "all of". Terms breaking any of these are invalid, and so is a deal whose field 5 is not `[0]`. *Weights are read from the stakes, never written as free numbers: a clone cannot raise a weight without changing a stake, which rule 8 guards.*

**The holders' rules** (field 30) appear only in terms carrying a key grammar: terms of a deal carrying field 30 are invalid. Each entry names the stake the terms' field 7 defines, index 0, once; its share is above zero and at most 1,000,000. An entry may carry a standing waiver of pre-emption, `true` as its third element (rule 96), and field 32 written `[0]` is valid only where the parent's entry for the stake issued carries it. A clone whose entry for a stake differs from its parent's is a draft until every holder of that stake signs it (rule 45). **Field 31** appears only in a deal's clone, and names stake transfers of the stake its parent defines. **Field 32** appears only in a collective's clone, which is then an issuance and is judged as rule 96 says.

**The release rule's threshold is counted by share**: field 24 written `[1, uint]`, a number of heads, is invalid; it is written `[3, share]`, holders together holding at least this share of the stake released.

*An area's holders are distinct parties. A clone that takes a party out of field 0 takes it out of every area's holders too, and founding terms never list an area without holders. A clone that takes a holder off an area need not lower its number: a number left above the holders that remain is met by all of them (rule 65), and the refit sets it again. A clone that changes an area's number sets it within its holders.*

*The signers of each power in a mark are distinct, listed ascending by hash, so that one meaning has one encoding; a mark listing them otherwise is invalid. A threshold is written as the founders chose it; how it counts once voices are removed is rule 65.*

**A clone** is terms with a parent (field 11).

- Its inside names, in `objects`, the parent's chain and the act of that chain it follows: `[[parent, act]]`.
- **A settling version** (field 26) **also names the version it settles, as chain and predecessor**: `[[parent, act], [settled, settled]]`, so that a verifier fetching a deal's versions by their citations finds it. Terms carrying field 26 that do not are invalid.
- Founding terms name no chain.
- A clone's field 4 is a mark; founding terms' field 4 is a rule. Terms whose field 4 has the other form are invalid.

**Founding terms exist only when every party has signed them,** a deal's and a collective's alike. Founding terms whose field 4 is not `[0]` are invalid. *A person is never added to a collective without their approval: a founder who has not signed leaves the collective unfounded, and a member added later joins only by signing the clone that adds them (rule 45).*

**A deal** (terms without field 12) has every party as its clone rule too. Any deal whose field 5 is not `[0]` is invalid, and so are terms of a deal carrying field 18, 19, 20 or 34. *The fields are kept rather than dropped so that every agreement has one format, and a deal says on its face what it needs.*

**In a deal, the absence authority is one identity**: a party, a keeper's operator or a collective, named by the clause's first form, `[0, hash]`. Terms of a deal whose abandonment clause names a threshold of the other parties, `[1, uint]`, are invalid, whatever its number. *A deal has no sequence of its own in which several signatures could be placed against its line. Parties who need to decide absence together form a collective, which orders its own acts on its own sequence, and name it as the authority: "a collective made of collectives".*

**A judge never handles what it judges.** This holds in every agreement, a deal's as a collective's.

A judge here is a specification that is either:

- named in field 2 for a judicial task (9 condition evaluation, 10 time reference, 11 anchoring), or in the abandonment clause's key 3 for task 14 (absence proof); or
- named in field 6 as the time reference, which is a naming for task 10.

A judge is named for no other task, judicial or not, and is not named as an extension (field 15). Terms that do either are invalid, founding terms and clones alike, whatever a clone's mark says.

*It removes a slight conflict of interest. An extension fills no task, but it adds rules to acts; one that is also a judge would handle what it judges, so every way a specification can be named is covered. In a deal every party signs every cMIP, so no area can slip a judge in; the reason is the judge's, not the areas'. It also keeps judges away from areas: no specification serves a judicial task and an area's task at once, so no area's holders ever have a say over a judge, and no change to a judge reaches an area's acts.*

**The chain of judgment** (field 21) says who takes over from a judge the terms name. The judges it may follow are:

- a judicial task the terms name a specification for;
- an identity the terms name as a keeper's operator, an arbitrator or verifier, or the abandonment authority (its first form).

The checks:

- Each judge has one link at most, the links ascending by the judge's deterministic encoding.
- Those that take over from a judge are distinct, and none is the judge itself.
- **A specification that takes over from a judicial task is a judge too, so it is named nowhere else in the terms**: for no task, as no extension, and in no other link.
- Each link names a period above zero: the time the one before it has, once asked, to act, measured on the agreement's time reference. After it, the next may act.
- Terms whose chain follows a judge that can stay silent (an identity) name a time reference (field 6, or field 2's task 10). That time reference is itself a judge, which may have a chain of its own.

Terms breaking any of these are invalid. How a chain passes is rule 35.

*A period is compulsory for every link, a specification's included, though a specification always answers.*

*The chain is signed with the terms, by everyone: in a deal by every party, in a collective as part of the judicial tier (rule 67). So nobody signs again when a judge fails.*

*The split service is not in the chain: its backups are a publication's (publication field 11). A chain of judgment has stages; a chain of backups has attempts.*

**The target** (field 33; rule 7, Part two). Terms carrying a target are an ownership agreement.

- **A work's ownership agreement** (`[0, claim]`) is a deal: terms carrying it and field 12, 18, 19, 20, 22, 23, 30, 32 or 34 are invalid. *It refuses the collective's fields: layers, areas, key grammar, the founding fields.*
- **A collective's ownership agreement** (`[1, null]`) carries a key grammar (field 12) and the layers (field 19): terms carrying it without either are invalid, and terms carrying field 12 without it are invalid. *Every collective's constitution is an ownership agreement whose target is the collective itself.*
- **An ownership agreement carries its stake** (field 7): terms carrying a target without field 7, or field 7 without a target, are invalid.
- **A clone repeats its parent's target**; one whose field 33 differs from its parent's is invalid.
- A target naming an act that is no claim, where the verifier holds that act, claims nothing: the agreement is an ownership agreement of nothing, and every publication naming it sells under none (rule 14). A verifier that does not hold the act answers unknown.

*The target is written `[kind, hash]` so that a later MOR can add a kind without touching the act type. One type for both targets: distinct types would double every rule both share (change rules, keepers, judges, succession, absence), which is most of them.*

**The departed members entry** (field 22) appears only in terms carrying a key grammar. It lists identities:

- distinct;
- none of them a party;
- each a holder of a share of the stake in the collective itself (field 7).

Terms breaking any of these are invalid. The entry records only that each is departed, without voice (rule 68); the stake decides what every holder is paid. *They are stakeholders: the stake still shows them, and the organizational part files the identity as departed.*

**The stake** (field 7). Its holders are distinct, each share above zero, the shares summing to 1,000,000 (rule 9). Terms breaking any of these are invalid. It is the one stake the agreement defines, on its target, index 0: a reference to the agreement's stake by any other index (a transfer's field 1, a holders' rule's entry, a rule by share) names no stake, and terms or an act carrying one are invalid.

**The collective holds no share of itself.** A collective's stake in itself held by the collective is invalid; its shares in works are written in those works' ownership agreements, the collective named there by its identity. *The mechanic of "this collective" is kept for the target alone: the collective's identity is its genesis act, which declares the founding agreement, so the founding terms could not name it by its hash, and write `[1, null]` instead.*

**Forked from** (field 23) appears only in the founding terms of a collective (with field 12, without field 11). It holds the original collective's identity. It is a back-link for readers and decides nothing: the fork act names its successors (rule 91). It is no parent: the founding terms are signed by every founder, as any founding terms are. Terms breaking this are invalid. *A successor is founded before the fork act exists, so it cannot name the act; it names the collective it leaves, rather than its agreement, which may still change before the fork.*

**The release rule** (field 24) says which of the stake's holders must sign its release to the public domain, a rule counted among them (rule 55). It is set in an agreement's founding terms; absent, every holder.

**A clone every owner signs may change it.** A clone whose field 24 differs from its parent's is a draft until every holder of the stake the parent defines has signed it (rule 45). This is besides the power its mark names: **the ordinary clone rule**, field 24 lying in no area (rule 64).

*Freedom of making mistakes and fixing them.* The owners are the holders the parent's field 7 names.

**Fields 8, 14, 25, 28 and 29 are withdrawn.** Terms carrying any of them are invalid, and the numbers are never reused. *The split plan, the split service, the fees and the backups are a publication's (fields 4, 3 and 11): ownership is one thing, distribution another.* **Relays are transport**: where a collective's clients upload and look first is client conformance, or a cMIP's (the relay transport cMIP), never the core (rule 57).

*Field 25 named a collective's relays, and made an act done only once it was on one of them. That made an act's validity depend on infrastructure: a vanished or hostile operator could freeze a collective, even its decision to change relays; it gave leverage over the collective; it allowed omission to readers checking one relay; and it failed offline verifiers. That crosses MOR's line that an act is valid by its signatures and content wherever held. The relays were a witness of time; the two chains and the tie rule answer "before" without them.*

**An agreement has one time reference.** Where terms carry both field 6 and a cMIP for task 10 in field 2, the two name the same specification, field 6 adding its parameters. Terms where they differ are invalid, founding terms and clones alike. *One check: terms that use either place alone stay valid.*

**The layers** (field 19) appear exactly in terms that carry a key grammar (field 12). Every one of the five keys is present, and no other: terms carrying field 12 whose field 19 lacks a layer, or carries a key for a layer the MIRs do not define (0, or above 5), are outside the format, and found nothing (rule 1). Each rule's threshold is between 1 and the number of parties; named parties are parties, none twice. *A later MOR adds a layer by one more key, defined by its MIRs; until then no seventh layer can be written in.*

**Areas** (field 34) appear only in terms that carry a key grammar (field 12) (scope). Area words (field 20) appear only for an area that exists. An area's kinds are act types, `[1, spec, type]`, never a whole layer: that is the layer's rule.

**No two areas reach the same act or the same field.** Two kinds overlap when some act could belong to both, as computed from the six MIR hashes and the terms' own fields 2 and 15 ("Layer"). So:

- two `[1, spec, type]` kinds overlap where they name the same type of the same specification;
- an area whose field references name a task overlaps another area naming the same task.

A field reference names an operational field or task ("Tiers").

Genesis and rotations are never in an area's reach: the key grammar governs them. Nor are records (type 17), which any member draws. An area whose kind names a genesis or a rotation (Identity's chain acts) or a record is invalid, never read as reaching nothing.

Terms breaking any of these are invalid.

**An area is followed by its id.** The ids of an agreement's areas (area key 5) are distinct. An area of a clone is the parent's area with the same id, wherever it sits in field 34. Grants (field 5), area words (field 20), steppings down (resignation field 1), marks (`[2, area]`) and a refit (rule 71) name an area by its id. A clone may drop an area, and adds one only under an id that no earlier version of the agreement, back to its founding terms, gave to an area. Terms breaking either are invalid. *An area keeps its id through any redraw, so removing or reordering areas never moves a grant, words or a refit onto another area.*

*Which layer an act belongs to is computed from its own `spec` field, the six MIR hashes and the collective's own terms, never from a label the cMIP's author chose. A collective that names some members for Money gives them the Money MIR's own acts, its receipts and claims on every rail among them, its price tags, and the acts of every Money cMIP it adopted, by its own list. A new rail Module needs no clone at all: the collective's payee pointer, an act of Money, or its vault names it, and a receipt counts only on a rail Module so named (Money rule 4).*

*An act of a specification the terms name nowhere falls in no layer. It counts for nothing for the collective, unless a `[1, spec, type]` kind of some area names it, since otherwise an unlisted specification would be a way around every rule.*

*A specification named for tasks of two layers belongs to both. Where the two layers have different rules, each rule must be met for its acts, as for a clone across two areas, and naming it for the second layer needs both layers' power (rule 63), so neither layer's members can bind the other's acts alone.*

*Six layers, one per MIR: a collective can name one rule for its texts and another for its bakes, since Text and Envelopes are layers of their own; releases of code and other bakes are both Envelopes acts, so an area by act type still names a single type within that layer.*


### Signature (type 1)

*In short: a signature act is one identity's consent to an act that needs it.*

```cddl
signature-payload = {
  0 => hash                 ; the act signed: terms, a clone, an act for a collective whose rule needs several
                            ; signers, a grant within an area, or an abandonment declaration whose authority is a
                            ; threshold of the other parties; an issuance offer, taking up its proportion (type 26);
                            ; a collective's stake transfer or release of a share in a work, consenting as an owner;
                            ; or a publication, as a party consenting to it (type 6) or signing onto it (rule 13)
}                           ; key 1 is retired and never
                            ; reused: there is no member key (rule 73)
```

The inside names, in `objects`, the act signed as both chain and predecessor: `[[signed, signed]]`, followed, on an act for a collective, by its chain citations (rule 58). *A signature follows the act it signs.*

Signatures naming one act are parallel consents to it, never a fork among themselves: rule 6's forks are between acts that change an agreement.

A signature counts only while it is valid under Identity's rules. The exception is a signature a collective placed before its line registering its signer's rotation (rule 6), and every act a line of a collective places (rule 6, "Made before, made after", 4). A signature on a deal's version that a later act relies on keeps the version complete (rule 47).

### Publication (type 6)

*In short: a publication is the offer: what is sold, on which terms, with which partners, which split service pays everyone and how each payment is divided, the owners' line read from the ownership agreement it names. Its price is a price tag (Money) naming it. Every party signs it; a later version that sells nothing ends it. A first version that sells nothing is a split agreement.*

```cddl
publication-payload = {
  ? 0 => [* sold],          ; what it sells, ascending by deterministic encoding, none twice; empty only in a later
                            ; version, which ends the publication; absent in every version of a split agreement
  ? 1 => hash,              ; the owners: the ownership agreement whose holders take the owners' line, by its founding
                            ; version, its line read (rule 12); absent: its drafter, as the lone owner
  2 => [* partner],         ; the partners, ascending by identity, none twice
  3 => hash,                ; the split service: receives every payment under it, and pays everyone (rule 16)
  4 => split-plan,          ; how each payment is divided (rule 22)
  ? 5 => tstr,              ; its words, canonical text: its terms of delivery, refund and contest; required where it
                            ; sells a vow
  ? 6 => [ hash, any ],     ; its time reference: the task cMIP and its parameters
  ? 7 => any,               ; until: a point on the time reference after which it takes no payment
  ? 8 => refund-terms,      ; its refund terms
  9 => { * uint => hash },  ; cMIPs, at most one per task (task number => cMIP hash): its payment cMIP (task 6), its
                            ; split cMIP (task 8), and others; a judge among them is named for no other task
  ? 10 => hash,             ; the party it designates to sign its price tags beside the split service: one of its parties
  ? 11 => [+ hash],         ; the split service's backups, in order: each an identity, a party (rule 17)
  ? 12 => any               ; what counts as a failed attempt: the split cMIP's parameters for it (only with 11)
}
sold = [ 0, bake: hash ]              ; a bake (Envelopes type 0), by its act id
     / [ 2, [ cmip: hash, any ] ]     ; a proven delivery: one whose proof any verifier checks from data alone, under a
                                      ; cMIP and its parameters (widened from access to bytes; a stream's key alone)
     / [ 3, vow: hash ]               ; a vow (Envelopes type 5), by its name, its genesis id
partner = {
  0 => hash,                ; the partner: any identity
  1 => uint,                ; its share of each payment, in millionths, off the top
  ? 2 => tstr               ; a label, canonical text ("client", "relay", "publisher"), shown to readers
}
```

`[ 1, work ]` (any bake carrying a work) is not defined.

*A partner's label is shown to every reader the same way, and nothing reads it: no rule and no payment turns on it. It is here, in the core, because naming who takes what is the legible part of distribution, and a label in a cMIP would be one client showing a word another does not; its cost is one optional field that decides nothing.*

Its `objects`: a later version names `[first, previous]` first. Where field 1 is present, they name the ownership agreement as `[agreement, agreement]`; a publication of a collective then cites the collective's chain (rule 58).

**Its parties** are the owners' side (the ownership agreement field 1 names, consenting by its own rule; or, without field 1, its drafter), each partner, the split service, and each backup. **It counts** where:

- it is valid and public;
- every party of it has signed it: its drafter by drafting it, each other party by a signature act naming it (type 1), an agreement that is a party as rule 15 says;
- the partners' shares, with what the split plan takes off the top as fixed shares, do not exceed 1,000,000 together;
- field 7 has a time reference;
- a later version is signed by the same parties' consent, every party of that version.

A version that does not count sells nothing, and a price tag naming it buys nothing.

**A publication naming a vow** (`[ 3, vow ]`) sells it with its words, under the ownership agreement it names, or, naming none, as its drafter's lone publication (rule 14). It names the vow by its genesis id, never a later version. An act this verifier holds that is not a vow, or is a later version, keeps the publication from counting. A vow made void by its signer's rotation does not: the name others wrote down stands. *What the vow promises, how it is delivered, quantities and seats, and what it became are the cMIPs'.*

**A relay's delivery record counts on a purchase under a publication** where its object is the media of a bake the publication sells (any of them).

**A service sold under a cMIP's terms.** *Paying for a service is an agreement.* A publication selling access under a cMIP (`[ 2, [ cmip, terms ] ]`) carries that cMIP's terms as its own. The access form is the form of every proven delivery, any delivery whose proof a verifier checks from data alone (rule 11); the verifier checks the proof, never the cMIP's say-so. Its deadlines are points on the publication's time reference (field 6). What a default owes (a refund of the price, to the payer the payment committed to) is judged under them, by a client that holds that cMIP. Its refund terms (field 8) end a refund unpaid past their point.

A pooled anchoring service sells so, a proven delivery: its tiers, prices or price scheme, and deadlines are its cMIP's terms, and its tickets and batches its acts under it. Money carries the refund's payment and shows it repaid (Money rules 19 and 17). *Money says how money moves and that it has moved; Agreements say what must happen, in return or in consequence.*

**Refund terms (terms field 17, a publication's field 8).** `refund-terms = { 0 => [ 0, point: any ] }`: the refund is claimable until this point on the time reference. Terms or a publication carrying it name a time reference (rule 33). Past the point, the refund is ended (rule 11).

**A split agreement** is a publication whose versions carry no field 0. Field 0 is the same in kind across a line: **a later version of a publication that sells (field 0 present) carrying no field 0 is invalid**, and one carrying it empty ends the publication; **a later version of a split agreement carrying field 0 is invalid**. It sells nothing and takes no price tag; it divides what reaches its split service for the ownership agreement it names, whose target is a collective (rule 15). A split agreement naming a work's ownership agreement, or naming none, counts for nothing.

### Claim (type 3)

*In short: a claim ties a work, by its hash, to its creators: "I claim to have made this."*

```cddl
claim-payload = {
  0 => hash,            ; the work hash
  1 => [+ hash],        ; the creators, ascending, none twice, the signer (who opens it) among them
  ? 2 => [hash, any]    ; a claim cMIP and what it produces (a commitment made before upload)
}
```

It is bound when every other creator listed has a signature act naming it. It counts only public or addressed to every creator. It carries no roles. Where no ownership agreement targets it, the default holder is the creator who opened it.


### Stake transfer (type 4)

*In short: a holder hands all or part of its share of a stake to a new holder.*

```cddl
transfer-payload = {
  0 => hash,            ; the version of the agreement defining the stake
  1 => uint,            ; the stake, by its index there: 0, the one stake
  2 => hash,            ; to: the new holder
  3 => uint,            ; how much, in millionths of the stake: above zero, at most what the seller still holds at its place on its own line
  ? 4 => [+ hash]       ; what the seller took for it: a payment made before it; read only to find what an over-sale owes back
}
```

Its `objects` name the agreement as `[agreement, agreement]`, never a fork.

It takes effect once the seller's chain signature names it and the buyer's signature act completes it (rule 10), where it fits what the seller still held at that place. An over-sale confers nothing. **The buyer's signature act is read as a closing reads another identity's receipt** ("Closing (type 20)"): for a collective's owners' matters it counts where the collective's line placed the transfer (rule 94), and is kept there whatever the buyer's later rotation disowns, shown as a dispute; elsewhere it is judged as Identity judges a signer's own act (Identity rule 34).

**A collective's transfer of a share it holds in a work** takes effect only once, besides the above, the owners of the collective's stake in itself who have no say consented, by that stake's holders' rule or each such holder signing it by a signature act naming the transfer, placed by the collective's line (rule 95). **For a collective's owners' matters, a transfer counts only where the collective's line placed it** (rule 94): an act of the collective acknowledging it, or a record naming it in field 3.

Across versions, the stake is followed as the agreement's one stake. A payment for it fulfils it (the receipt's field 5, the claim's field 4) or is named in its field 4.

### Issuance offer (type 26)

*In short: a collective offers each owner of a stake its own proportion of new shares, on the same terms, for a period; what is not taken up goes to the new owners it names.*

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

The issuance that follows it is a clone naming it in terms field 32, judged as rule 96 says.

### Proxy (type 27) and revocation of a proxy (type 28)

*In short: a holder hands its vote on the owners' matters of one stake to a proxy, for one version or until revoked; a revocation takes it back.*

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

### Split plan and split (type 8)

*In short: the split plan (publication field 4) says how each payment reaching the split service is divided, beside the partners' shares (field 2); what is left is the owners' line, divided by the ownership agreement's stake; a split (type 8) is the split service's act dividing one payment, payout by payout, which anyone can check against the plan.*

```cddl
split-plan = {                ; publication field 4
  0 => [* share-rule],      ; role shares and metric shares, off the top, beside the partners' shares (field 2)
  1 => hash,                ; split cMIP, which declares the remainder rule and computes the amounts; the same as
                            ; field 9's task 8 where both name one
  ? 3 => unfilled,          ; what happens to a role share nobody fills; absent: [ 0 ], to the owners' line
  ? 5 => uint,              ; who bears payout rail fees: 0 each receiver (default), 1 the split service
  ? 6 => amount / uint,     ; maximum fee per payout the service may deduct: absolute, or in millionths of the payout;
                            ; absent: no cap, flagged before signing (rule 25)
  ? 7 => any,               ; the split cMIP's parameters (a waterfall's thresholds)
  ? 8 => [+ metric],        ; the metrics the plan divides by (rule 29)
  ? 9 => fees               ; fees, each borne by every share, off the top (rule 28)
}                           ; keys 2 and 4 are not used: every share but the owners' line is off the top, and a
                            ; named receiver is a partner (field 2)
share-rule = [ 1, role: tstr, part: uint ]          ; a role, by its name, filled at payment time
           / [ 3, metric: uint, part: uint ]        ; a metric share, by its index in key 8
                                                    ; parts in millionths of each payment; [ 0 ] (a stake) and [ 2 ]
                                                    ; (a named receiver) are not used: the owners' line is what is
                                                    ; left, and a named receiver is a partner
metric     = [ module: hash, measurer: hash, ? params: any ]   ; the measurer named in advance (rule 29)
unfilled   = [ 0 ] / [ 1 ] / [ 2, party: hash ]     ; to the owners' line / held open / to a named party
fees       = [+ fee]                                ; key 9
fee        = [ module: hash, part: uint, ? scope ]  ; borne by every share, off the top (rule 28)
scope      = [ 0, bake: hash ]                      ; payments for this bake; absent: every payment
           / [ 1, rail: hash ]                      ; payments by this rail Module

split-payload = {
  0 => hash,                ; the receipt or payer's claim that brought the money to the split service
  1 => [+ payout],          ; each payout, summing exactly to the amount received
  2 => hash,                ; the split cMIP used
  3 => hash,                ; the publication whose split plan it follows, by its founding version
  ? 4 => [+ [ stake: uint, [+ [ holder: hash, count: uint ]] ]],  ; the running count of leftover units (rule 9)
  ? 5 => uint,              ; its number: one numbering across every split the service makes under the publication, from 1
  ? 6 => [+ hash],          ; the Modules and cMIPs it ran under (rule 28): the service's statement, never what decides
  ? 7 => [+ hash],          ; the metric records it divides by (rule 29)
  ? 8 => [+ [ stake: uint, transfer: hash ]]   ; per stake, the latest transfer it follows: the service's statement
}
payout = {
  0 => hash,                ; the receiver
  1 => uint,                ; the amount, in the smallest part of the receipt's unit
  ? 2 => hash,              ; on the owners' line: the ownership agreement whose stake it pays, by its founding version
                            ; (the one the publication names, or an owner that is itself an ownership agreement, rule 15)
  ? 3 => tstr,              ; the role it fills
  ? 4 => hash,              ; the evidence for that role: an act signed by someone other than the split service and the payee,
                            ; or, for a rail Module's role share, the receipt or claim naming that rail Module, where the
                            ; payee's own pointer or vault names it (rule 22); only with key 3
  ? 5 => hash,              ; a fee: the module whose fee it pays, its receiver being key 0 ; never with key 2 or 3
  ? 6 => uint,              ; the rail fee deducted, within the plan's maximum
  ? 7 => uint,              ; the metric share it pays, by its index in plan key 0 (rule 29); never with keys 2, 3 or 5
  ? 8 => uint               ; the partner it pays, by its index in the publication's field 2; never with keys 2, 3, 5 or 7
}
```

**Every payout matches its share exactly** (rule 27). Each partner receives its share of the payment. For the owners' line, each holder of the stake in the version in force for the receipt (rule 12) receives its share of what is left, exactly as rule 9 sends each leftover unit under the default rule, and nobody else receives on it.

A holder that is a collective receives at its own payee pointer (rule 23). A holder that is another ownership agreement is paid through it: its part divided among its holders, each payout naming that agreement in key 2 (rule 15).

Every fee, partner's, role and metric share is taken before the owners' line divides, so it falls alike on every owner. Any deviation, either way, breaks the plan, and is shown so. *No holder is paid a whole smallest unit or more below its exact share, and none above it by as many units as the stake has holders or more, which leaves room for the leftovers of rounding going to one holder (rule 21).*

Each payout is then paid as a simple Money payment, with its own receipt naming the split. A fee taken off the top, and an app's share for the client that brought the sale (a partner, or a role share), are both expressed in the publication.

**What a verifier checks against the plan:**

- a partner's payout names a partner of the publication, and pays its share;
- a role payout fills a role the plan names; several fillers of one role are paid equally, within one unit;
- a fee payout is a fee entry's, and every fee an entry makes owed on the payment is paid;
- a metric payout names a metric share; its receiver is one the plan already pays, never the metric's measurer; the measurer is not the split service; and the split names a record of the metric's Module signed by the measurer (the record's format is the Module's);
- an owners' line payout names the ownership agreement in key 2 and pays a holder of its stake in the version in force for the receipt; on a holder that is a collective, its receiver is that collective; on a holder that is another ownership agreement, its receivers are that agreement's holders, nested at most 8 layers;
- the collective's own part, in a collective's split agreement (a partner naming the collective, rule 22), is paid to an entry of the collective's vault, never its flow pointer.

Any payout to anyone else is a mismatch: **never an address the parties did not sign.**

How much each share gets is the split cMIP's: a verifier without it shows the amounts as unknown, never as wrong.

**A split is delivered to every holder and partner it pays**: each receiver of a payout is among its recipients (Envelopes, `to`), unless the split is public, a public split being delivered to everyone. Every fee it takes is a payout naming its module and its receiver. *The core cannot know who owns a service, so it never hides a fee: every holder sees what was taken before their share, and by whom.*


### Grant (type 9) and revocation (type 10)

*In short: a grant lets a grantee act for the grantor, within limits. A collective's grantee acts with its own key, naming the collective and the grant; a person's grantee holds a grant key of the person's, scoped to the grant. A revocation ends the grant.*

```cddl
grant-payload = {
  0 => hash,                ; grantee
  1 => uint,                ; scope: 0 sign new deals, 1 manage named existing ones, 2 act for an identity (post, upload, spend)
  ? 2 => [+ hash],          ; the agreements concerned, for scope 1
  ? 3 => any,               ; limits: per-deal cap, total, spending, as the grant's cMIP defines
  ? 4 => hash,              ; the cMIP defining the limits
  ? 5 => uint,              ; for a collective: the area whose power issues it, by its id in the agreement in force for the grant
  ? 6 => [+ kind],          ; the acts it reaches; required for a collective's grant, and within the power of its signers
                            ; (rule 74)
  ? 7 => hash,              ; a reinstatement: the ended grant it reinstates, fields 0 to 6 repeating that grant's (rule 71); only with field 5
  ? 9 => signing-key        ; a person's grant only, and then required: the grant key, in Identity's form [ scheme, key ],
                            ; made and held by the grantee, scoped to this grant
}                           ; key 8 is
                            ; retired and never reused, with terms fields 14 and 29; null in field 2 ("this agreement")
                            ; likewise

revocation-payload = {
  0 => hash                 ; the grant it ends
}
```

**A collective's grant** is an act for the collective (rule 58), drawn by a member with their own key, naming the collective on its chain and the previous decision, as every decision does. It carries no field 9: a collective's grant carrying one is invalid, since a collective has no key to scope. **Its grantee acts with its own key**: an act it signs for the collective names the collective on its chain and the grant as the decision it acts under (rule 58), and is judged by rule 80. **The grant counts only once its grantee signed a signature act naming it** (type 1), accepting it. **The grantee's acceptance is placed as a member's signature is** ("Made before, made after", 2): once an act for the collective acknowledges it, it keeps for the collective the effect that placement gave it, whatever the grantee's later rotation disowns, shown as a dispute; an acceptance no act for the collective placed is judged by Identity alone.

**A person's grant** carries field 9, the grant key: the public part of a signing key the grantee made and keeps (the grantee makes it, so nobody else holds a key that acts as the grantee's for the person). A person's grant without field 9 is invalid. An act signed with the grant key names the grant as its `binding` (Identity: a scoped key, which this MIR judges), and its signer is the grantor. It is the person's own act, citing the grant in `objects` on the person's chain. **It counts only once its grantee signed a signature act naming it**, accepting it.

An act under a grant is backed (rule 80) only within the grant's reach (field 6, or, for a person's grant naming none, every act but a decision), only within the limits its limits cMIP sets (fields 3 and 4: an expiry among them, judged against a time reference), and only while the grant has not ended for it. It is never backed for a decision: no act under a grant is a record, a grant or a revocation, and none places a member's signature or adopts another act for the collective.

A grant survives the collective's rotations. It ends only by a revocation, a departure emptying its area, a layer freezing, a fork or a closing.

**A grant from an area** (field 5) is drawn by a holder of the area and completed by signature acts of the area's other holders (rule 74). Each kind in field 6 must lie within the area's reach: every act it could reach, computed as for overlapping kinds from the agreement in force ("Areas"), is an act the area reaches. Otherwise the grant is invalid.

**A reinstatement** (field 7) is the exception, and **is a clone of the ended grant.** Its fields 0 to 6 must repeat those of the grant it names, which must be a grant within the area of the same id; one whose fields differ is invalid. It backs acts only within the refitted area's reach (rule 71). The grantee accepts it again, and it takes nothing on.

**Revocation (type 10).** A revocation is a decision of the grantor: for a collective, an act for it citing its chain as every decision does, counting as rule 74 says; for a person, an everyday act of its own key. It names the grant it ends. For a grant within an area, it is completed by that area's holders' signature acts, judged by that area alone (rule 74).

It is a decision ending powers: **an act under the grant that the revocation's history holds was done within the grant's powers, and binds; any other, racing it or after it, is void** (the tie rule), unless another identity acknowledged it, or a keeper recorded it before recording the revocation: then it is valid and shown as disputed, and confers nothing unless the grantor adopts it (rule 76).

*A split service is no grantee: a publication names it, and it receives and signs in its own name (rule 16). A receipt under a person's grant, where the person granted an application its receipts, is the person's own receipt (Money rule 7).*


### Request to a judge (type 25)

*In short: a party asks the judge its terms name to decide a question about an act.*

```cddl
judge-request-payload = {
  0 => hash,            ; the version of the agreement whose terms name the judge
  1 => judge,           ; the judge asked, in the terms' `judge` form
  2 => hash             ; the question: the act it is about
}
```

Its `objects` name the version as `[agreement, agreement]`. It counts only public or sealed to the judge. It reaches each link of the chain of judgment it is public or sealed to, in order (rule 35). Standing, for a request to a judge, is that of a party who signed the version.

### Liveness (type 12)

*In short: a party's sign of life on an agreement.*

`liveness-payload = { 0 => hash }`: the agreement, named as `[agreement, agreement]`. It counts only public or addressed to the agreement's other parties. In a collective, it counts only where the collective placed it.

### Release (type 5)

*In short: a release ends the owners' claim on a work and makes its content keys public, so the work becomes public domain (rule 55).*

```cddl
release-payload = {
  0 => hash,                ; the work released, by its hash
  1 => [+ [ agreement: hash, index: uint ]],  ; the stakes in it whose claim ends: the work's owners, past and present
  ? 2 => [+ hash],          ; the claims binding it to its creators: its creators' history
  ? 3 => [+ [ bake: hash, key: bstr .size 32 ]],  ; the content key of each bake carrying it, made public
  ? 4 => [ point: any, keeper: hash ]   ; a timed release: the point on the time reference, and who delivers the keys then
}                           ; field 3 is present unless field 4 is
```

It is signed by one direct owner of the work, with its own key. Every other holder whose signature the release rule asks for adds a signature act naming it (type 1). Its inside names, in `objects`, each agreement whose stake it ends, as chain and predecessor.

**A release is public** (its content key on its outside), so that the content keys it carries are public.

A release is complete when:

- it is valid under Identity, and public;
- each stake it names is a stake of that agreement whose object is the work;
- the release rule of each such agreement in force (field 24; absent, every holder) is met among that stake's holders, a threshold counted by share;
- where a collective releases a stake it holds, the owners' consent of rule 95 is given.

**Every direct owner of the work signs, departed holders of a stake in the work included, unless the release rule says otherwise.**

A holder that is a collective signs by its own rules. Its signature (the release itself, or its signature act on it) counts only with its consent. A release, or a collective's signature on one, is reached by the collective's rules for every layer a release touches, Envelopes, Money and Agreements, each met (rule 60). *Two levels of ownership: the collective owns the work; its members and departed holders own shares of its income, not the work. Releasing is a business decision of the collective; it affects every holder alike. Unlike a price, it ends the claim for good: a price can be raised again, a release cannot be undone.* **And since it pays the holders of the collective's stake in itself less, by effect, it is an owners' matter** (rule 95): the release counts only once the owners of the collective's stake in itself who have no say consent, by that stake's holders' rule or each signing, placed by the collective's line.

**A timed release** names a point on the time reference of each agreement whose stake it ends, which must name one, and the identity that delivers the content keys then (field 4). The claim ends at that point, as the time reference judges it, and is undetermined where it answers undetermined. *Stated cost: the keys' delivery rests on that identity; if it vanishes, the work is released in Agreements but its key may never come out; the owners may always make the key public earlier. That identity is named for the keys alone, not as a keeper in rule 37's sense, which never receives content keys as such (rule 43).*

*Every share in a work lives in its ownership agreement and its transfers on that agreement's chain, so a release signed by every holder there is complete; a claim the release does not name, by another identity, stays openly contested beside it (rule 7), and the release cannot end it.*

### Negotiation message (type 18)

*In short: a negotiation message is one message in the talk between two sides that leads to a deal.*

```cddl
negotiation-payload = {
  0 => tstr,                ; the message, as canonical text (Text MIR)
  ? 1 => hash               ; format: a text format cMIP, as a text act may name one (Text MIR)
}
```

Signed by one side of the negotiation, with its own key.

A thread is identified by its first message:

- the first message names no chain in `objects`;
- every later message names, in `objects`, the thread and the message it follows, `[[thread, previous]]`, the previous message being the thread's first message or another negotiation message of the same thread.

The two sides of a thread are the signer of its first message and the first other identity to sign a message of it. **A message signed by anyone else is no part of that thread's record.**

Each message's `acks` name the latest message of the other side that its signer has received, and nothing else. A side that has received nothing from the other side yet carries no `acks`.

Its text is shown as a text act's is, plain text always available (Text rules 3 to 6).

*A text act carrying acknowledgements is invalid (Envelopes rule 18), so negotiation lives on Agreements' own layer: a reaction or a text reply can never be a negotiation message.*

*Stated cost:* a client that does not implement Agreements shows a negotiation message as unknown, never as text; a negotiation needs an Agreements client, which it needs anyway to sign the deal it leads to.

### Contest (type 14)

*In short: a contest answers an act: a party declared absent answers the declaration, or a buyer contests their purchase, a vow's sale among them. It shows the dispute, and voids nothing.*

```cddl
contest-payload = {
  0 => hash,                ; the act it answers: a declaration of absence (type 13); or the purchase it contests, a vow's sale included
  ? 1 => tstr / [hash, any] ; the promise not kept, shown only in a purchase's contest: in words (canonical text); or, naming a vow, in a cMIP's terms
}
```

A contest of a declaration is signed by the party the declaration names, with its own key. Its inside names the declaration as both chain and predecessor, `[[declaration, declaration]]`, as a signature does.

**It shows that party's presence and the dispute, and voids nothing** (rule 88). It is shown beside the declaration, to everyone who reads it. A voice the declaration removed comes back only by a later version naming the party. A contest signed by anyone else shows nothing.

*Client conformance:* the declared member's client lets them sign it, and uploads it, public.

**A contest of a purchase**: field 0 names **the purchase it contests**: the buyer's payer's claim of the payment that is the purchase (rule 12), any of the buyer's own claims of it, or, for a publication with no price tag, the signature act by which the buyer signed onto the publication (a sign-on, rule 13: a signature act naming the publication, by anyone but its own parties). The buyer is the payer the payment's commitment names, an identity (rule 22), or the signer of that signature act: a purchase whose payer committed only a bare key, or that no claim of the payer's records, has no buyer who can contest it (rule 13's stated cost). Field 1, optional, says what was promised and not kept, in words (a buyer may know only that something went wrong). Its inside names the purchase as both chain and predecessor, `[[purchase, purchase]]`. Signed by the buyer, it is shown beside the purchase while the payment is a purchase (rule 12; a payment still pending, or found to be no purchase, shows none), and voids nothing: it changes no payment, refund or delivery, nor any act's validity, status or selection, nor a sale's state. Signed by anyone else, it shows nothing as the buyer's contest. *Bytes that do not match what was sold are caught by the bytes (Envelopes rule 21, and a key delivery that opens nothing is ignored); words that promised something other than what was delivered are not, and this is where the buyer says so.*

*Client conformance: where the publication the buyer paid or signed onto sells a vow, the buyer's client names the vow in the contest, as its inside's chain and predecessor, `[[vow, vow]]`, so that the sale is marked.*

*Client conformance: where the payee of a purchase is a collective, or an agreement with several parties, the buyer's client makes its claim of the purchase readable by every member of the collective's agreement in force, or by every party of the version the purchase names: sealed to each of them, or its key delivered to each (rule 57). Stated cost: every member or party sees who bought.*

**A vow's sale** is a purchase, and its buyer contests it the same way, with one difference: where its inside names the vow by its name (its genesis id) as chain and predecessor, `[[vow, vow]]`, the contest marks that sale contested (rule 13), and field 1 says which of the vow's promises was not kept, in words or in a cMIP's terms. A contest naming the vow whose field 0 is no sale of that vow marks nothing and shows nothing. In the purchase's form, `[[purchase, purchase]]`, it is shown beside the purchase and marks no sale.

**A contest of any other act**, other than a declaration of absence or a purchase, by anyone with standing (rule 54), is in the same format: field 0 names the act it contests, field 1 is absent, and its inside names that act as both chain and predecessor, `[[act, act]]`. It is shown beside the act it contests, and changes nothing about any act's validity, status or selection. Signed by anyone without standing, it shows nothing.

**Field 1 is read from the bytes alone.** In words, it is in the format of any contest; in a cMIP's terms, only of a contest naming a vow, and a contest carrying it otherwise is invalid. Field 1 is shown only in a contest of a purchase; any other contest carrying it shows nothing.

**"Shows nothing"**: the contest stays a valid act in its signer's sequence, and no client shows it beside the act it names; it changes nothing.

### Settlement request (type 22) and fork settlement (type 23)

*In short: when a deal forks, a party who signed it asks the deal's judge of forks to settle it, and the judge's settlement keeps one branch and drops the rest.*

```cddl
request-payload = {
  0 => hash                 ; the reference: the version of the deal with two complete versions of it
}
settlement-payload = {
  0 => hash,                ; the settlement request (type 22) that activated the judge
  1 => hash,                ; the version of the fork it keeps: its line, and what grows on it, in force from then on
  2 => [+ hash]             ; every tip it drops, ascending, none twice, none the version kept
}
```

A settlement request is signed by a party who signed the reference, with its own key. Its inside names the reference as chain and predecessor, `[[reference, reference]]`.

A fork settlement is signed, with its own key, by the judge of forks the reference names (field 27, one of field 13), or by the link of its chain of judgment that took over (field 21). Its inside names the request as chain and predecessor, `[[request, request]]`.

How they settle a deal's fork is rule 47.

*A settlement that names no request, or a request by someone who did not sign the reference, settles nothing: the judge never acts on its own initiative.*

*Field 1 is any version of the fork, usually the tip of the branch the judge keeps as it saw it; a version made on that branch after it is on the line kept.*

### Resignation (type 16)

*In short: a resignation is how a member leaves a collective, giving up their voice in its agreement. A stepping down gives up only one area.*

```cddl
resignation-payload = {
  0 => hash,                ; the agreement of the collective in which the member gives up their voice
  ? 1 => uint,              ; stepping down: the area given up, by its id in that agreement ; absent: the whole voice
  ? 2 => [+ hash]           ; the drafts its signer had signed and leaves behind, ascending, none twice
}
```

Signed by a party to that agreement, with its own key. Like a signature, its inside names the agreement as both chain and predecessor, `[[agreement, agreement]]`, and it is never a fork.

Only a party to an agreement founding a collective may resign or step down. A deal is left only as its terms provide.

What it gives up:

- Without field 1, it gives up the signer's voice in that agreement and in every agreement descending from it by clones (rule 70).
- With field 1, it is a stepping down. It gives up only the signer's place among that area's holders, in that agreement and its descendants, until a constitutional clone refits the area (rule 71). The signer must hold that area there.

It takes effect for the collective's acts at the collective's line registering it (record field 3). It never takes effect at its place in its signer's own sequences, which are not read ("Made before, made after").

**A resignation, or a stepping down, names the drafts it leaves behind.** A version it names never brings its signer back, nor, for a stepping down, gives the signer the area back, whichever line puts it in force. What she signed while present still speaks where rule 65 counts it.

*Client conformance:* her client names the drafts when she resigns or steps down. *Stated cost:* a draft it fails to name brings her back.


**A resignation or a stepping down is spent once its signer comes back.** Its signer comes back by any later version they signed that names them again, as a member, or as holder of the area, whether or not the resignation was ever registered.

- "Named again" is by a constitutional clone (never an ordinary clone that only copies the list), signed by a signature act of theirs that is valid.
- "Later" is descending from the agreement the resignation names: the only order MOR can see between the two acts.

Once spent, it is still on the record and visible, but no line registers it, by a record or by a rollback. So it can never take a voice or an area its signer kept or came back to.

*A member who means to leave signs a new resignation after the last version they signed.*

The version a line registering a departure puts in force, whose signature the departing member placed before that line, never brings them back: it is the version of their leaving, not of a return.

### Record (type 17)

*In short: a record is the collective's everyday line, which any member draws. It writes a new clone of the collective's agreement on its chain, or registers members' departures and rotations, or both.*

```cddl
record-payload = {
  ? 0 => hash,              ; the complete clone of the collective's agreement it writes on the chain
  ? 2 => [+ hash],          ; the signature acts that complete that clone ; present exactly when field 0 is
  ? 3 => [+ hash]           ; what it registers: resignations and steppings down by parties, abandonment
                            ; declarations removing a party's voice, and parties' own rotations, each by its act's id;
                            ; also stake transfers, proxies and their revocations, and take-ups of an
                            ; issuance offer
}                           ; at least one of fields 0 and 3; key 1 (once the kept tips of the collective's own
                            ; sequences) is retired and never reused: its tips are in `objects`
```

Drawn by any member of the collective, with their own key, as an everyday act of theirs. Its inside names, in `objects`, the clone as both chain and predecessor, `[[clone, clone]]`, as a signature does; a record naming no clone names the agreement in force for it the same way, `[[agreement, agreement]]`. Then, on the collective's chain (the collective's identity as chain), **the previous decision** and **every other act for the collective its drawer holds that no act it cites already reaches**: its tips (rule 58). A record naming no decision is no decision, and no line.

**A record is the collective's everyday line** ("Made before, made after"): what it names on the collective's chain is its history.

A record is a decision. It decides nothing by itself: its clone counts by the clone's own signatures, its registrations by the acts they name. *So letting any member draw one gives nobody a power they lacked. What it gives is timing: the tips that fix the line. Two members drawing records concurrently make a fork of records, which rule 90 settles.*

**A record must be done.** A record that is neither sealed to every member of the agreement in force for it, nor public, is no line: it puts nothing in force, registers nothing, and places no signature (rule 57). *One rule for every act in the collective's name, no exception by type. Example: a key holder draws a record registering a member's resignation, sealed to nobody: it is no line, and the member's voice remains until a record that is done registers it.*

**A record puts its clone in force with the signature acts it names, and only those.**

- Each act field 2 names must be a valid signature act naming the clone (rule 6).
- The record places each at its own position.
- The clone counts as complete at the record only if those signatures meet the powers its mark names, counted as rule 65 says at the record.

A signature act naming the clone that field 2 does not name counts nothing toward it at this record, whenever it was made. *Naming the signatures keeps a record from being completed late, by a signature arriving after it, and then knocking a later record out of force; and it keeps a member who had already left from signing a clone and being counted.*

A record puts its clone in force only if both hold:

- that clone is complete, judged with the signature acts it names; and
- its parent is the agreement in force for the record act itself (rule 72), or, where records on concurrent lines leave a fork for the record (rule 72), the latest clone of one of its branches, the record coming after both lines (rule 90).

Records follow the agreement chain one clone at a time, never skipping it.

A record of a clone that changes the key grammar, or removes a party who holds the key or a share of it, puts nothing in force: only a rotation declares such a clone (rule 69). A record puts every other constitutional clone in force.

**A record's two parts count apart.** A record whose clone it does not put in force still registers what its field 3 names, and is still a line.

No layer's rule and no area reaches a record, as none reaches a rotation: any member draws it. It is judged by the clone it names alone, whose own mark already carries the consent it needed. So the members named for Agreements cannot hold up another rule's change.

**Field 3 registers departures and rotations.** Each act it names must be one of these:

- a resignation or stepping down (type 16) by a party of the agreement in force for the record;
- an abandonment declaration removing such a party's voice (rule 89);
- a rotation (Identity) of such a party's own identity;
- a stake transfer (type 4) of a stake the agreement in force for the record defines, which the record places for the owners' matters (rule 94);
- a proxy (type 27) or a revocation of one (type 28) by a holder of such a stake, which the record places (rule 97);
- a take-up of an issuance offer (type 26) of such a stake, which the record places (rule 96).

A record naming any other act there counts for nothing.

**Each act field 2 or field 3 names is judged as placed at this line** ("Made before, made after", 4), and so is each signature act a declaration it registers needs, and each signature act that declaration's field 1 is checked against. Where these sections ask for a valid act, the act counts as "Made before, made after", 4, counts a member's signature: valid under Identity, or placed by this line before any line of the collective registering the rotation that voided it. Kept so, it is shown as a dispute on the line, and the line stands.

Each takes effect for the collective's acts at this line ("Made before, made after"), whether or not the record puts its clone in force. A resignation spent by its signer's return registers nothing (type 16).

The record is not before itself. A clone the same record writes is judged with the departures it registers already in effect. So a signature it places counts for its departed signer only where an act of the collective placed it before.

*Client conformance:* a member's client registers a departure, and a member's rotation it learns of, in its next record, as it records a complete clone at once (rule 72). The rotation that follows the departure of a holder of a share of the chain key (rule 69) fences off the departed member's share of the chain key. *A departure needs nobody's permission; the line is the collective's, any member draws it, and a collective that delays it only delays itself.*

*The rare case, in detail:* when a declaration removes a voice. A declaration removes a voice when:

- it counts (type 13), judged as placed at this line;
- its outcomes include 0;
- its party is a party of the agreement in force for the record; and
- the agreement it names is that agreement or one it descends from by clones.

Where its authority is a threshold of the other parties, that number is:

- counted at this record, among the other parties whose voice remains there, with the resignations and steppings down this same record registers in effect, other declarations it registers not (rule 85); and
- met by its signer with the signers of the signature acts naming it that this record or an earlier act of the collective acknowledges.

### Abandonment declaration (type 13)

*In short: an abandonment declaration declares a party absent, under the abandonment clause of an agreement the party signed, with the outcomes that clause allows.*

```cddl
declaration-payload = {
  0 => hash,                ; the agreement in which the party is declared absent
  1 => hash,                ; the clause's version: the version of that agreement whose abandonment clause (field 9) it applies,
                            ; the last one, back from field 0 through its parents, that the party signed (rule 87); as the judicial
                            ; tier changes only with every member whose voice remains (rule 67), it carries the clause in force for every such party
  2 => hash,                ; the party declared absent: a party to the agreement of field 0, or, in a collective, a
                            ; holder of the collective's stake in itself who is no party
  3 => [* uint]             ; the outcomes (rule 89), ascending, none twice, each one the clause allows; at least one
                            ; against a party; against a holder who is no party, 1 where its plan names no stake
                            ; successor, and none where it names one, succession alone moving the stake
}
```

Signed by the authority the clause names (rule 85), with its own key. Like a resignation, its inside names the agreement as both chain and predecessor, `[[agreement, agreement]]`, and it is never a fork.

Where it takes effect:

- In a collective, at the collective's line registering it (record field 3). Or, where the declared party is the one who would draw that line, at the recovery rotation: the rotation that removes the declared party.
- In a deal, at its own place, as the deal's keepers record it ("Made before, made after").

**A declaration counts only if it is public, or addressed to the member it names**, or to the holder it names. Public means its content key is on its outside. Addressed means sealed to that member among its recipients (Envelopes, `to`), with others if its signer wishes. One that is neither counts for nothing, so no line or rollback can register it.

*Why it needs no agreement on relays: a declaration has effect only where an act registers it, and that act names it; whoever checks that act, the member named included, must obtain the declaration to accept it, so it reaches the member through the very act that uses it, or that act does not count for them.*

*Client conformance, SHOULD: the declaration is uploaded where the collective's clients look, and delivered to the member's inbox, so that they see it early; this is not the safeguard.*

A declaration counts only when it passes rule 87's checks:

- it is valid under Identity, or, registered by a line of a collective, valid as that line placed it (below);
- the party is a party to the agreement field 0 names, or, in a collective, a holder of its stake in itself who is no party;
- field 1 is the last version of that agreement, back from it, that the party signed by a valid signature act, and carries an abandonment clause; for a holder who is no party, field 1 is the version field 0 names, whose clause is the clause in force (rule 87);
- every outcome it states is one the clause in force allows, the abandonment clause of the agreement field 0 names; against a holder who is no party, the stake-moving ones only: none, its stake passing by succession, where its succession plan names a stake successor, or else outcome 1; never 0, 3 or 4 (rule 89); and
- it is signed by that clause's authority (the clause in force, for every party, one whose voice was removed before a judicial change included). That is the identity the clause names, or, where the authority is a threshold of the other parties, one of them, its number counted where the declaration takes effect (rule 85).

A declaration that fails any check, judged at the point where the record names it, is no declaration there: a record naming it in field 3 counts for nothing (record, field 3). A later act of the party never makes a record fail that passed where it was drawn.

**A later rotation is such a later act.** The declaration, the signature acts completing it, and the party's signature acts its field 1 is checked against are judged as the line that registered them placed them ("Made before, made after", 4): an authority that rotates and disowns its declaration, or a declared party that comes back, rotates and disowns its signature on the version field 1 names, is shown as a dispute on the line, and the line stands, with what it put in force.

*The core does not check the period of absence: it is judged on the time reference, outside the core, and a party wrongly declared absent contests it (rule 88). Field 1 names a version rather than repeating the clause, so a verifier checks it against the version the party signed, and a declaration can never pick a friendlier clause. That version carries the one clause in force for every member whose voice remains (rule 67); the field and its check stay as they are.*

*Where a party's voice was removed before a judicial change, the version it signed last may carry an older clause; the clause in force applies to it, as to every departed holder.*

*The rare cases, in detail:* an authority that is a threshold of the other parties.

**Where the authority is a threshold of the other parties, one of them signs the declaration and the others add signature acts naming it** (type 1, field 0), as for terms. It counts once the required number have signed: its signer and the signers of those signature acts, each among the other parties whose voice remains where it takes effect, meet the number counted there.

In a collective, a signature act on a declaration counts as the collective's own sequence places it ("Made before, made after", 2). Toward a line, it counts only where the collective placed it at that line or before:

- by an act of the collective acknowledging it before the line; or
- by the record registering the declaration acknowledging it (Envelopes, `acks`), as a record names the signature acts that complete its clone.

A signature the collective places only after that line completes nothing there; a later record registering the declaration counts it. *Fixing the signatures at the line keeps a declaration from being completed late, by a signature arriving after its line, and changing what an earlier line did.* *Client conformance: the collective's client acknowledges the others' signatures in the record registering the declaration, or before.*

Where the declaration takes effect at a recovery rotation, the collective cannot act without the declared member before it. So **the recovery rotation places the others' signatures: its Agreements declaration names them**, as it names its clone's, and they count at that rotation ("Collectives in the identity chain"). A signature act on the declaration that the rotation does not name, and that no act of the collective placed before it, completes nothing there. *Client conformance:* the members who make the recovery rotation name in it the signature acts on the declaration that they hold.

In a deal the authority is one identity, never a threshold of the other parties, so a deal's declaration is complete with its own signer.

### Collectives in the identity chain

*In short: a collective's own identity chain says which agreement it lives under. Its genesis declares the founding agreement; a rotation declares a clone that changes the key grammar, or removes a holder of the key or a share of it; every other clone is written by a record.*

Each declaration sits in the declarations slot (Identity). Kind 0 is **the agreement the collective lives under.**

- A collective's genesis declares its founding agreement: `[AGREEMENTS, 0, agreement]`, the value being its id. It declares it in place of a first signing key, and is signed by a chain key (Identity rule 1); its founding agreement's target is `[1, null]`, this collective.
- A rotation declares, with the same kind, each complete clone that changes the constitutional tier, membership included (rule 69). Its value names the clone and the signature acts that complete it: `[AGREEMENTS, 0, [clone, [+ hash]]]`. Only such clones need the collective's chain key to rotate. **The rotation's history is the history of the signature acts it names**: each cites, on the collective's chain, the previous decision and the acts its signer holds, as an action cites (rule 58). *A rotation carries no `objects`, so its signature acts are how it names the previous decision and the action heads it saw.*
- The recovery rotation (the one removing a declared member, rule 85), where a declaration taking effect there needs other signatures than its signer's, adds a third element naming those signature acts: `[AGREEMENTS, 0, [clone, [+ hash], [+ hash]]]`.
- A rollback (rule 93) declares `[AGREEMENTS, 0, [clone, [+ hash], broken, [* hash]]]`. These are: the clone; the signature acts that complete it; the broken act (the rotation's id, as an act of the collective's identity chain); and the acts it registers, each by its act's id, possibly none. Those acts are resignations and steppings down (type 16), declarations of absence (type 13), and the signature acts on those declarations that their authority needs (type 1). Its third element, a hash and not a list, tells it from the recovery rotation's form.

Every other complete clone is written by a record, which any member draws (rule 72).

**A rotation puts its clone in force with the signature acts its declaration names, and only those**, as a record does:

- each must be a valid signature act naming the clone (rule 6);
- the rotation places each at its own position; and
- the clone is complete at the rotation only if it is complete (rule 45) judged with those signature acts alone, the powers its mark names counted as rule 65 says at the rotation.

A signature act naming the clone that the declaration does not name counts nothing toward it there, whenever it was made. *So no signature arriving after the chain key's ceremony completes the clone late, and the records made since are never judged anew. Identity is unchanged: a declaration's value is the higher MIR's to define (Identity rule 31). The genesis declares founding terms, which exist only when every founder has signed them, and names no signatures.*

For an act for the collective, the agreement in force is the clone furthest along the agreement chain among those put in force by the decisions its history holds (rule 72): the genesis's declaration, the rotations' declarations of kind 0, and the records' clones:

- for a record, the decisions in its history;
- for an action, the decisions its history holds, and those in their histories (rule 58).

Its layer rules and areas are the ones that act is judged by.

**A rotation that declares no new agreement changes the chain key, not rules.** Its declarations slot carries the Agreements declaration on unchanged, and the agreement in force carries forward, recorded clones included. The records made before it keep counting. Only a rotation declaring a new value of kind 0 supersedes the records before it. *Otherwise a collective that adopted a payment cMIP by a record, then rotated to fence off a departed member's share before the refit was signed, would silently undo the adoption made under its rule for Money for every act after it.*

*The rare cases, in detail:* a recovery rotation and a rollback.

**A recovery rotation places the signature acts on a declaration that its third element names, and only those**, as it places its clone's.

- Each act the third element names must be a valid signature act (rule 6) naming an abandonment declaration (type 13) against a party that the declared clone takes out of the parties, and without whom no member remains to draw a record, under the agreement in force at the rotation: the declaration that takes effect at this rotation.
- A rotation naming any other act there puts nothing in force, as one naming an act that is not a signature on its clone.
- The rotation places each at its own position. The declaration's number is counted there, among the other parties whose voice remains at the rotation, met by its signer with the signers of the signature acts placed at or before it (rule 85).

*No member but the declared one remains to draw the collective's line, so no act for the collective can place the others' signatures before the rotation; the rotation itself does, at the chain key's ceremony, so no signature arriving later completes the declaration there.*

**A rollback puts its clone in force as a rotation does, and registers departures as a record does** (rule 93). It counts only in the broken stretch, naming as broken the broken act itself. Further:

- its clone's parent is the agreement in force just before the broken act;
- its mark names the powers rule 93 gives it; and
- the clone must be complete at the rollback with the signature acts its second element names, and only those. The powers are counted as rule 65 says at the rollback, with the departures registered on lines before the broken act in effect and none registered in the broken stretch.

Each act its fourth element names must be one of these:

- a valid resignation or stepping down (type 16) by a party of the agreement in force just before the broken act, naming that agreement or one it descends from by clones, a stepping down naming an area its signer holds there;
- a declaration of absence (type 13) with outcome 0 against such a party, under the clause of that agreement or one it descends from. Its authority is counted at the rollback, among the other parties whose voice remains there, the resignations and steppings down it registers in effect and other declarations not, as a record counts it. It is met by its signer with the signers of the signature acts naming it that the fourth element also names, which the rollback places at its own position, as a recovery rotation places those its third element names;
- or such a signature act.

A rollback naming any other act there puts nothing in force. A resignation spent by its signer's return (type 16) is valid there and registers nothing. **Each act a rotation's declaration names, a recovery rotation's and a rollback's included, is judged as placed at that rotation** ("Made before, made after", 4): a later rotation of its signer is shown as a dispute on the line, and the line stands. *No act of the broken stretch places a signature (rule 93), so the rollback itself places the declaration's other signatures, as the recovery rotation does.*

Each takes effect at the rollback, its line, for the collective's acts after it. The clone the rollback declares is judged with them already in effect, as a record judges the clone it writes (record field 3). So a member whose departure the rollback registers is not counted for it. The exception: a signature of theirs on the clone that an act of the collective placed before the rollback counts there, for that clone alone, its signer still counted among the voices that remain, as at every other line. *The resignations and declarations of the broken stretch cannot be registered by any record of the stretch, so the rollback registers them; otherwise one member who resigned, or vanished, and stayed silent would block the way back for good under "every party".*

### Notice (type 24)

*In short: a notice asks a payer whom a collective owes money back where the money should go, with a deadline.*

```cddl
notice-payload = {
  0 => hash,                ; the payment owed back: one receipt or claim of it (rule 93)
  1 => [ hash, any ]        ; the deadline: a time reference, and the point on it
}
```

*Most of the time a collective never sends one.*

A collective owing money back from a broken stretch to a payer who gave no address (no payee pointer, vault, or refund rail on a claim of theirs) sends that payer, before it closes, **a notice sealed to their identity** (or public). The notice asks where the money should go, with a deadline on a time reference.

An act for the collective, drawn by a member. Its inside names the payment as chain and predecessor, `[[payment, payment]]`, followed by its chain citations (rule 58).

If the payer names an address in time, they are paid. If not, the collective may close, the debt named in the closing act, visible and unpaid (rule 93; the closing's field 4).

Its conditions (the deadline, how it was sent) are visible, so its good faith can be judged: *the notice demonstrates good faith, its degree set by the notice's conditions.*

Whether the deadline has passed, with no address given within it, is the time reference's answer, which a verifier states as it states every time reference's answer: the core reads no time reference. The core requires no one notice period; it shows the one a collective chose.

*The rare case, in detail:* a notice to a one-time key. This applies to a payer who committed only a one-time key. A bare signing key cannot be sealed to, so the notice is public, naming the payment, and its holder finds it by looking. If the key's holder names where to pay in time, it is paid. If not, the closing names the debt, visible and unpaid, and does not wait.

*Stated cost:* the payer's privacy: the key is linked to this collective.

*A payer who committed only a one-time key cannot be reached by a notice.*

### Fork (type 19)

*In short: a fork divides a collective among its members into new collectives, one per side. Every member it lists signs it on their own identity chain. It must hand every debt binding the collective in the history it cites to a side, or to several sides jointly, and the members must meet the constitutional change rule. Once complete, it is final.*

```cddl
fork-payload = {
  0 => hash,                ; the original's agreement in force at the fork
  1 => hash,                ; the original collective
  4 => [2* side],           ; the sides
  ? 5 => [+ fork-share],    ; the original's stakes, where not divided by default
  ? 6 => [+ [ obligation: hash, sides: [+ uint] ]]  ; every obligation in the history it cites: the side, or the sides jointly, owing it
}                           ; keys 2 and 3 are
                            ; retired and never reused: the fork's line is what it cites on the collective's chain
side       = [ successor: hash, members: [+ hash] ]   ; the collective the side founded first, by its identity, and its members
fork-share = [ agreement: hash, index: uint, [+ share: uint] ]   ; a stake the original holds, and each side's share, in millionths
```

Field 4 names each successor once, never the original. Field 5's shares sum to 1,000,000, one per side, one entry per stake. Field 6 names each obligation once, its sides ascending, each a side the act lists. A fork act breaking any of these is no fork.

**How it is signed.** A fork is drawn by one member of the original collective, with their own identity. Its inside names, in `objects`, the original agreement as chain and predecessor, `[[agreement, agreement]]`, followed by `[agreement, ending]` for each earlier fork or closing of the same collective it names, the act it follows on that chain, each once. **Its chain citations come after: on the collective's chain, the previous decision and every act for the collective its drafter holds that no act it cites already reaches. They are the fork's line, the action head it cites.**

**Every member it lists, its own signer included, signs it by a chain signature** (Identity type 16): an act on that member's identity chain, signed with their chain key, naming the fork. A signature act (type 1), or the fork act itself, is no member's signature on it. **Each successor a debt is assigned to signs it as a member does, by a chain signature with its own chain key** (Identity type 16), naming the fork. A successor's signature act (type 1) is no successor's signature on it. *An ending is final, and finality cannot rest on another chain's future, which a signature act, voidable by its signer's later rotation, would be. Stated cost: one chain-key ceremony per successor per fork, in a process already slow and heavy, as rotations are.*

**A fork is complete when:**

- it is valid under Identity;
- the agreement it names is the one in force at its line, the original's records before the line counted (rule 72);
- every member it lists is a member whose voice remains at the line (rule 65's voices, the departures registered before it counted), is on one side, and signed it by a chain signature that counts in their identity chain and is not void (below);
- **those members meet the constitutional change rule, counted as rule 65 says**;
- where that rule counts among a stake's holders, each holder who is no member that the count relies on signed it by a chain signature that counts in their identity chain and is not void, as members do;
- each side's successor is held, and its founding terms, as its genesis declares them, have exactly that side's members as parties, and keep, in its stake in itself (field 7) and its departed members entry (field 22), every departed holder of the original and every member whose voice remains on no side, each at exactly their share of all the original's income (how the members divide the rest is theirs);
- **each successor's founding terms pay no kept holder less than the original's agreement in force at the line pays it, as rule 48 reads "paid less", or the kept holders consented as rule 95 says**: the original's stake in itself and the successor's compared, its part of the plan, what each plan takes off the top, the fees, and the split cMIP and its parameters;
- each successor a debt is assigned to signed it by a chain signature that counts in the successor's identity chain and is not void, the successor's own key grammar producing it;
- it hands out everything in the history it cites, as the next paragraph says; otherwise the fork does not take effect;
- the fork is done: sealed to every member of the agreement in force at its line, or public, citing the collective's chain by its line; otherwise it does not take effect either.

*Information runs free: an ending is no exception.* *Client conformance: the members' clients also make a fork public, since creditors and buyers depend on it.*

**What it must hand out.** Field 6 names:

- every obligation of the original in that history, public or not, paid or not, save one that does not bind the collective. An obligation is handed out only if it binds the collective, that is, done (sealed to every member or public, and on its chain, rules 57 and 58) and within its signer's powers, or adopted (rules 76 and 78); one signed with a grant key is included;
- every obligation an earlier fork handed to the original, where the history the fork cites holds the original's own chain signature on that earlier fork, or a later link of the original's identity chain.

**Otherwise the fork does not take effect.** A verifier that does not hold every act that history names cannot tell what it must hand out: for it, whether the fork is complete is **unknown**, never "not complete", so a client tells the two apart. It judges the fork once it holds them.

**What lies outside that history is void** (the tie rule, "Made before, made after", point 7): an obligation of the original the fork's history does not hold binds no one, and no successor owes it. The one exception is a payee pointer left outside it, which still counts for payments made before the fork's line, as the chain stood for each payment, and for none made after it (Money rule 4). *Why: otherwise members could erase, by a fork on an old line, sales they had visibly taken on (rule 76); failing the fork instead would let one payment block an ending, which closings avoid as well (rule 93).*

**Whether a fork took effect is judged only by what its own history holds.** The departures registered before its line count for its check of the obligations it must hand out; a departure registered after it never changes it. *A fork that left out a debt binding in its history stays incomplete, whatever is registered after it; the members sign a new one that hands the debt out.*

*A fork cites the action head; everything in that history is handed out, or the fork does not take effect. A successor owes only what the fork handed it, by its own signature. Publishing has no place in the line, and needs none, since what the line cites is handed out whether public or not; a debt uploaded late was either in the history, and handed out, or outside it, and void. "Everything" is every obligation, public or not, and paid or not, so that whether a fork took effect never changes with what happens after it.* *While the history is not all held, the fork is unknown for that verifier.*

With no stakes written, a member who signs no side keeps each member's equal share, leftovers to the first (rule 9).

**The line.** An act for the original counts as made before the fork when it lies in the history the fork cites: an act it names on the collective's chain, and whatever acts there cite on that chain, a grantee's act so joined included. Every other act for the original counts as made after it.

*Forking is a constitutional decision. Signing with their own identities keeps the key grammar out of it: a key holder refusing to rotate could otherwise block the fork and keep the identity. If the members are in a position to fork, how they fork is up to them: each side founds its collective first, and the act names it, so no successor needs to claim descent.*

Field 23 of each successor names the original collective, not its agreement, since the agreement may still change before the fork.

**Finality.** **A complete ending is final**: a later fork or closing of the same collective, one that names it (directly, or through the endings it names), counts for nothing.

An ending names another in its own act's `objects`, or through a signer's own chain: where one member's chain signature on it lies, in that member's identity chain, after the same member's chain signature on the other. *Each identity chain is one line that never branches, so any two ending signatures of one member are ordered, whatever devices the member uses: a later ending sharing a signer with a complete one names it.*

Of the complete endings, the one that counts is the one every other names or is named by, and that names no other such one. Where there is none, the collective is not ended (two endings each naming the other through two signers' chains included).

**Ties among endings.** Only two complete endings sharing no signer and neither naming the other are concurrent, made without knowing each other, and **neither counts**, as any race between equals, until a third ending naming both settles it. That third ending is ordered against both, and counts, as a clone of both branches resolves concurrent records; a later one naming it counts for nothing. *A tie no ending could settle would trap the collective for good, against the right of exit.*

**A signature on an old proposal, finished late, counts for nothing.** A member's chain signature on an ending counts for nothing where it lies, in their identity chain, after their own chain signature on another ending of the same collective that names it, in `objects` or through a signer's chain. Once a member signed the ending that replaced a proposal, they can no longer finish it.

**A drafter names the endings they signed.** A fork or closing is no ending where its signer signed, earlier in their own identity chain than their chain signature on it, another fork or closing of the same collective that it does not name in its `objects` (directly, or through the endings it names there). It is never complete, and its signatures count for nothing, for naming and for the rule on old proposals alike. *Checkable on the drafter's own chain, unlike "every ending a client holds": without it, a drafter leaving out a proposal they had signed, then the proposal finished late, leaves two endings each naming the other through two signers' chains, which no reading of the chains can tell from a true race.*

"Names" is judged here in two steps, so that no signature both judges and is judged: first by `objects`; then, among the signatures left, through signers' chains too; what an ending names through signers' chains is read from the signatures left after both steps.

*Stated cost: where the drafter of the ending replacing an old proposal never signed that proposal and leaves it unnamed, the proposal can still be finished late, by members who signed no ending naming it, with others' earlier signatures: it then counts as the earlier ending, and the one replacing it for nothing, or the two name each other through two signers' chains, and neither counts until a third ending names both. This needs the drafter not to have held the proposal (a true race) or to bypass their client, which names every ending it holds; under a threshold it needs no more than members who signed neither. The late signatures lie on their signers' chains, visible.*

*Client conformance: a member's client signs no ending that another ending it holds names, nor any ending of a collective once it holds a complete one.* *Stated cost: every member signing an ending goes through the chain-key ceremony, so forks and closings are slow and heavy, as rotations are.*

*A complete fork is never undone: a debt uploaded after it was either in the history it cites, and so handed out, or outside it, and void; and a later ending, naming it, counts for nothing.* *Client conformance: a new ending names every ending of the collective its client holds, complete or not.*

### Closing (type 20)

*In short: a closing ends a collective for good. Its members sign it as they would a fork. It can complete only once the collective holds nothing and owes nothing, with some money owed back left open as the rules allow. An absentee's share is left where the collective's own rules sent it.*

```cddl
closing-payload = {
  0 => hash,                ; the collective's agreement in force at the closing
  1 => hash,                ; the collective
  ? 4 => [+ left-open]      ; money owed back it leaves open (rule 93):
                            ; ascending by payment, none twice
}                           ; keys 2 and 3 are retired and never reused, as the fork's: the closing's line is what it
                            ; cites on the collective's chain
left-open = [ payment: hash, notice: hash / null, ? holder: hash ]
                            ; the payment owed back, by one receipt or claim of it; the notice sent to its payer (type 24), or
                            ; null where it is owed to nobody; a holder that outlives the closing, where the collective chose one
```

**How it is signed.** A closing is drawn by one member of the collective, with their own identity. Its inside names the agreement as chain and predecessor, `[[agreement, agreement]]`, followed by `[agreement, ending]` for each earlier fork or closing of the collective it names, as a fork does, and then its chain citations, its line, as a fork's. Its signer and the other members sign it by chain signatures on their identity chains, as for a fork.

**A closing is complete when:**

- it is valid under Identity;
- its line holds, and the agreement it names is the one in force there, as for a fork;
- **it is done**: sealed to every member of that agreement, or public (client conformance: made public);
- its signer and the members whose chain signatures on it count are members whose voice remains at the line, its signer among them, and, with the holders below, **meet the constitutional change rule**, counted as rule 65 says;
- where that rule counts among a stake's holders, a holder who is no member counts toward it only by a chain signature on the closing that counts in their identity chain and is not void, as members do;
- **the collective holds nothing**: no stake of a latest version of an agreement a verifier holds names it as a holder, after the complete transfers of that stake the closing's history cites, each placed on the collective's line (rule 94), are applied as rule 10 counts them; other than its own stake in itself; unless the work's release (rule 55) counted with the collective's consent placed before the line. *A transfer not in the closing's history leaves the collective a holder, as the tie rule already stands for debts.*
- **the collective owes nothing**: every obligation that binds it and lies before its line, that is, in the history it cites (one outside it is void, the tie rule), and every obligation it owes as a fork's successor (rule 91), is fulfilled in full by receipts a verifier holds, or ended by its creditor's release (Money type 4, rule 92). An obligation it owes as a successor is placed by the original's line, not its own. **A receipt or a release of another identity counts toward this only where an act of the collective in the closing's history acknowledges it (Envelopes, `acks`), or the receipt is the collective's own**: it is then placed by the collective's line, and kept there whatever its signer's later rotation disowns, shown as a dispute. **A receipt or release nobody acknowledged is shown, and the closing waits** until an act of the collective acknowledges it. **An absentee's money share, left where the collective's own rules sent it, does not block the closing** (below);
- **no money is owed back from a broken stretch**, whatever the closing's line (rule 93), save what field 4 leaves open as the rules allow (below);
- **the collective is not broken.**

**A verifier that does not hold every act the closing's history names cannot tell what the collective owes: for it, whether the closing is complete is unknown**, as for a fork, never "not complete". It judges the closing once it holds them.

**Money owed back that field 4 may leave open** is of two kinds:

- money owed back to nobody;
- money owed back to a payer who gave no address, named with a notice of the collective sealed to that payer, or public, whose deadline has passed with no address given.

Every such payment it leaves open, it names. *A holder that outlives the closing and pays the payer when they turn up may be named beside such a payment (a keeper or custodian role, for a cMIP to define). The core allows it and shows it, and requires neither the holder nor any one notice period.* *Stated cost: a collective may close while visibly owing an anonymous payer who could never have been paid; and while visibly owing a payer who gave no address and let the notice's deadline pass.*

**An absentee's money share.** A collective is liquidated by ordinary sales and transfers before its closing (rule 10): its stakes sold or moved by stake transfers, or released, so that it holds nothing. The money share of someone it has nowhere to pay, an absentee, does not block the closing. Where that share goes, and how the absentee is reached or waited for, follows the collective's own rules: its split plan, its absence clause, its terms, written before anyone left. The core checks two things only:

- the closing counts only when the collective holds nothing (above);
- nothing owed vanishes silently: what the collective's rules could not deliver stays visible as an open obligation wherever those rules sent it (its split service, for instance, rule 24), until a valid claim appears: never lost, never taken.

The closing needs no entry for it: field 4 stays for money owed back. The closing names no stake and moves none. *Batching the sales, transfers and closing together is a client's or a cMIP's convenience, never a second way in the core.*

A refund past the terms the buyer accepted by paying is ended, and is not a debt that binds the collective: it never blocks a closing.

**After its line**, nothing done for the collective counts in Agreements, as after a fork, and its publications sell nothing, as after a fork. *Work is either sold or made public domain: clean.* *A collective that cannot pay cannot close: it stays open, abandoned, its debts visible. "Holds nothing" is judged on the latest versions of the agreements a verifier holds, with the complete transfers the closing's history cites applied: a collective that sold its works by transfer can close.*

**Finality and ties.** A complete closing counts only as a fork does:

- it is final, and a later ending naming it (in `objects` or through a signer's chain) counts for nothing;
- of two concurrent ones sharing no signer, neither counts until a third names both;
- a signature on it placed after its signer's signature on an ending naming it counts for nothing;
- one whose signer signed earlier an ending it does not name is no closing.

**Judged on its own history.** Whether a fork or closing is complete is judged on its own line and history, as if it were the ending that counts: its own debts, its own departures, its own signatures; never with another ending already in force. A complete ending that names a final one (directly, or through the endings it names), and so counts for nothing, is shown as such ("complete, counts for nothing: an ending it names is final"), and an incomplete one as incomplete. *The answer does not depend on which ending a verifier judged first. A closing's own conditions (receipts that fulfil its debts, "holds nothing") may still change as a verifier comes to hold more acts.* *A receipt or release a closing relies on is one the collective's own line placed, so a creditor's later rotation cannot reopen a closed collective's debt; the collective client's habit of acknowledging what it relies on does it, in the closing's own history.*

### Keeper record (type 2)

*In short: a keeper record is a keeper's signed statement that it recorded one act. Its records, one after the other, are the keeper's sequence: a signed order anyone can check from any copy.*

```cddl
keeper-record-payload = {
  0 => [ act: hash, signer: hash ]   ; the act recorded, by its id, and the identity that signed it
}
```

Signed by the keeper's operator, with its own signing key, as an everyday act of the operator: **one keeper record per act recorded.** A keeper record is public. It names no chain in `objects`. Its `prev` names the operator's previous keeper record, so a keeper's records form one sequence of its operator's (rule 37): **the keeper's sequence**, whose order Envelopes' position and running summary make checkable from any copy (Envelopes rule 13; rule 39).

**What a verifier checks of a keeper record:**

- it is valid under Identity as an everyday act of its signer, and public, and its payload is in this format;
- it counts, for any rule that reads it, only as rule 42 says: the verifier holds the act it names; that act is valid as an act; that act's signer is the identity the record names beside it; and the record's signer is the operator of a keeper named (terms field 3) by the version, in force for the act, of an agreement the act belongs to ("Belongs to"), or, for an act of a collective placed against the collective's own line, one the collective's agreement names ("Made before, made after", 5);
- it counts only while its signer's chain keeps it valid (Identity, "Evidence counts only while its signer's chain keeps it"), save where a rule of this MIR read it to place an act or a relied-on version's completeness rests on it (rule 42), and where a collective's line placed it ("Made before, made after", 4): it then keeps the effect the rule gave it, whatever the keeper's later rotation disowned, shown as a dispute;
- one record is before another only when it lies in the other's ancestry in the keeper's sequence; records of two operators, or of two sequences, are not ordered against each other by their keepers; a keeper keeps one sequence for its records (rule 37).

**An anchor of a keeper record** (Envelopes, task "Anchoring") shows that record, and every record before it in the keeper's sequence, to have existed by the anchor's point (rule 41). A keeper record places nothing on a time reference by itself (rule 33).

*A record of an act nobody can produce changes no verdict; a record naming the wrong signer counts for nothing.*

### Creditor's release (retired type 21)

*Agreements type 21 is retired and never reused. The creditor's release is Money type 4, "Creditor's release": forgiving a sum only gives up money, a simple money decision, so a collective creditor signs it under its rule for Money alone. A release given against future terms is also a deal, an Agreements agreement of its own (rule 92).*

## Part five: tasks, reasoning and freeze scenarios

### Tasks

- **Split.** A cMIP accepts an amount received, a publication's split plan and the owners' shares read by reference. It produces payouts that sum exactly, with its declared remainder rule and the evidence for each role share. **It also accepts the publication and the attempts made for a payment, and produces the receiver for this payment** (rule 17). The receiver is one of the services the publication names: field 3's first, or a backup of field 11 in order, the next only where the attempt before it failed as the cMIP defines failure. A publication names its split cMIP (field 9, task 8); an ownership agreement names none.
- **Condition evaluation.** A cMIP accepts a condition and the acts it refers to, and produces true, false, pending or unknown.
- **Time reference.** A cMIP accepts a point on its reference (for example a block height) and an act, and produces whether the act is before, after, or undetermined.
- **Absence proof.** This is a judicial task: it joins condition evaluation, time reference and anchoring; a judge never handles what it judges, and the chain of judgment applies. A cMIP accepts an abandonment declaration, the clause's parameters and the acts the history of the record or clone using it holds (acts of the party the collective acknowledged or a keeper recorded before the line). It answers whether the party's absence is shown: accepted, refused, or unknown. It may use anchors, liveness acts and acknowledgements as it defines. A declaration it refuses or cannot judge does not count. It is task 14, and a chain of judgment names it as any judge. A client MUST NOT sign terms naming an absence-proof cMIP it does not implement, as for an unknown extension. *Proving absence from time needs a clock the core does not have (every time check tried was found to have a way around it), so the core keeps the members' chosen judgment and leaves proof to modules that compete on it.*
- **Anchoring** is an Envelopes task. Agreements use it for deadlines, time references and claim priority, an agreement naming the anchoring cMIP and the time reference it relies on. *Identity's validity does not depend on it.*
- **Grant limits.** A cMIP defines how a grant's limits are expressed and checked. Its limits may include an expiry, judged against a time reference; an act under the grant outside them is not backed (rule 80), and a verifier without the cMIP or the time reference answers unknown.
- **Claims.** A cMIP MAY define commitments made before upload, carried by a claim.

### Reasoning

- **Terms plus signatures.** *One signer per act makes every consent a separate, visible act. An agreement is complete exactly when its rule is met, a party refuses simply by not signing, and nobody owes anything they did not sign for.*
- **Identities, not keys.** *Keys change; promises should not. Naming identities means a rotation never breaks a deal.*
- **Stakes and seats can go to different people.** *A stake is property: passing it changes only who is paid. A seat is trust: the other members chose to share control with that person. A plan can give the stake to an heir and the seat to someone trusted for the job, paid through a position.*
- **Collectives are identities with no key of their own.** *A collective that receives money must have an identity, homes and a way out like anyone else, so it keeps an identity chain and a chain key, held as its members choose. It needs no signing key: everything it does is done by a member, with their own key, naming it, and Agreements judges whether that member could act there. A key of the collective's own only said twice what the act's `objects` already says, and sat on one person's device; without it, the founder's key, the member keys and the strands all go, and one mechanism remains. Every grammar still leaves a way through that survives the loss of any one key holder.*
- **Keepers stamp sealed envelopes, and only real ones.** *Proving an act existed before a rotation needs its id and signer, not its content. Keepers that never read keep private deals private; judging content is left to arbitrators and verifiers the parties choose and deliver keys to. A record counts only alongside the act it names, so a bought record of nothing changes nothing.*
- **Protected clauses, one version for everyone.** *A stake cannot be reduced without its holder's signature. But the clause that decides absence, the keeper who judges it and the service that receives the collective's income could move the stake in two steps; and an arbitrator, a condition cMIP or an anchoring cMIP chosen after the fact could decide who wins. So in a collective they change only with every member's signature. Keepers and the collective's split agreement are protected for the same reason.*
- **A chain of judgment.** *Unanimity could trap a collective whose judge disappears. Naming in advance who takes over, signed by everyone, replaces a failing judge with no new signature.*
- **A departed holder is paid, and consulted on the owners' matters by its holders' rule.** *A stake is a share of income, not a say, save on what touches every owner alike. Whoever keeps a stake after leaving accepts the collective's decisions, and is protected by what company law protects: the stake never shrinks without them, and no term treats it worse than a member's. Keeping their old judges would leave a split service keeping two sets of terms for one payment.*
- **A fork closes the original, under the constitutional rule, each side founding its successor first.** *When a collective splits, no side keeps its identity, so a lone holdout cannot keep the name, history and pointers while everyone else leaves; every side starts anew, and what was made together still pays everyone who made it. A fork is a constitutional decision: where the founders allowed less than everyone, a member who signs no side keeps their money, as a departed holder of each successor, and loses only the seat. The members sign with their own identities, so no key holder can block the fork by refusing to rotate; the fork act names the successors, so none has to claim descent.*
- **Every debt goes somewhere.** *A fork cites the collective's history and hands out every obligation in it, each successor signing for its own, or it does not take effect; what lies outside that history is void, the ending winning. A collective's acts are done only once sealed to every member and on its chain, so hiding a debt gains nothing. A collective that owes cannot close, and a debt ends only by payment or its creditor's release, a Money act.*
- **Two chains.** *Hidden debt, late uploading, the missing device, the stray payment and the payment a fork superseded had one cause: MOR has no shared clock, acts are ordered only where one cites another, and a collective's history may branch, so an act could live on a branch nobody builds on. A collective's decisions and its actions are kept on two chains that cite each other. An act within its signer's powers counts once done, citing the head as its signer knew it, and becomes the new head; a decision cites the head it saw. The chain makes acts unmissable; it does not confirm them. Where two acts signed at the same moment never saw each other, only a decision ending powers against an action using them matters, and the ending wins.*
- **One thing is to act, one thing is to read.** *Powers can be segmented among members; information runs free among them. What a collective plans can stay with some members for a while; once done, it is a fact touching everyone in it, sealed to every member and on its chain. Negotiation is talk, and may stay secret; the deal it leads to is done like any act.*
- **An act is valid where it is held.** *Naming relays would make an act's validity depend on infrastructure: an operator vanishing or turning hostile could freeze a collective, even its decision to change relays; readers checking one relay could be shown less; an offline verifier could decide nothing. The two chains and the tie rule already answer "before"; a relay is transport.*
- **A grant names a person, not a key.** *A collective grants powers to identities: its grantee acts with its own key, naming the collective and the grant, so its acts sit on the collective's chain, where a revocation, an emptied area, a fork or a closing places them like every other act, and the tie rule settles the rest. A person, who has a signing key, still hands an application a key scoped to the grant, so that a lost phone is one revocation away.*
- **The burden is where the action takes place.** *A buyer can only guess the current version; the seller knows it. On a request rail the seller's request fixes the tag and the version; on a push rail the split service's own record settles it, the only clock MOR has, belonging to the one answering for it. Old versions stay readable forever; they must not be actionable.*
- **Ownership is one thing, distribution another.** *A split inside the ownership agreement would let a work be sold one way only, and make every partner's cut a change to who owns it. So an ownership agreement says only who owns what share and how the owners decide; each publication says how the work is sold, at what price, with which partners and who takes what, and reads the owners' shares by reference. The same owned work can be published in many places, and a work carried to MOR 2 carries its claim and its ownership, never its distribution.*
- **The publication is the offer.** *An offer, an agreement with whoever publishes it, and a split plan would be three acts doing one thing. A publication does it once: what is sold, on which terms, with whom, and who pays everyone. Its price is a price tag, a Money act any wallet can pay, and paying it is a purchase. The publication's ending and the tag's withdrawal are two different people's stops: everyone's, and the publication's side's.*
- **Unless there is a publication, the tip goes to the uploader.** *A bake says only who uploaded it; money sent to it is the uploader's, with no split possible. Whoever re-uploads a work receives what is sent to their own bake: piracy cannot be stopped, but the owners' claim and their own publication make rewarding them easy, and a client reading Agreements shows the other sale for what it is.*
- **Payment follows the ownership.** *The work is the point of payment; a fork changes only who owns it, so the owners' line follows to the new owners, read by reference, and nothing keeps an old publication alive past the fork's line.*
- **A judge and the constitution together need both rules.** *Otherwise two members of three could change a judge by adding a one-word change to the constitution.*
- **The split service receives in its own name.** *A price tag names one payee, the split service, so a Money-only wallet pays the right identity and nobody signs in anyone else's name. A tag naming another payee bypasses the service, which needs the publication's side to sign, publicly, for an address not the service's own; and what the others would have been paid is that receiver's open obligation. A collective's own pointer is checked against its split agreement's service.*
- **Splits are seen by everyone they pay.** *The core cannot know who owns a service; it can make sure every holder sees every fee taken before their share, and who received it.*
- **A release ends a claim, never a history.** *A work given to everyone still says who made it and who owned it. Every direct owner signs, since a majority releasing would give away the minority's value. Where the owner is a collective, the share is its asset, and releasing it is a business decision taken by its own rules, which every holder of its income feels alike.*
- **Payouts follow shares, exactly.** *Equal treatment is not a separate test: a split that pays every partner and every owner exactly, every fee alike, treats every holder alike; any deviation, either way, is visible.*
- **Deals are everyone's; majorities belong to collectives.** *A deal is as simple as possible while remaining rich: nobody's terms change without their signature, so a party never has to read a rule to know whether they can be outvoted. The price is that one silent party blocks every change, as in everyday deal making. Where many parties or a long relationship need majorities, areas and tiers, they found a collective.*
- **The constitution never freezes.** *The constitution can repair every other tier, so it alone must survive the loss of anyone whose signature it needs. Every such member is covered by an abandonment clause they signed, which can remove their voice, never their stake.*
- **Leaving needs no permission; removal never takes the stake.** *Anyone can walk out of a collective alone, keeping what they own. A constitution may allow removing a member from the board; it can never force them to give up their shares: removed from the board is not forced to sell.*
- **Every layer named, and areas computed from the collective's own list.** *A founding that said nothing about who acts in a layer would leave a silent default, and the risk of a default is between members: any one of them pointing the collective's income at themselves because nobody thought about it. So every layer is named at founding, the client showing what one member could do alone, Money first. Which layer an act falls in is read from which task the collective adopted its cMIP for, never from the cMIP's own label, so every verifier agrees; and letting that layer's members adopt it lets a new rail join without a constitutional change.*
- **A number never freezes a rule.** *When fewer voices remain than a rule asks for, all of them together meet it: the same as "every party" already does, and the founders' number wherever enough remain.*
- **Before and after are the collective's.** *With no clock, "before" means before a named act in one named chain. A member may write from any number of devices, forget some, and nobody else can see them all; every patch that asked which of a member's lines an act named opened another gap. The collective's chain, every act naming it and citing what it saw, is one every verifier can follow, so what was done for the collective is before or after its lines by what they cite, never by a member's devices.*
- **Absence in a deal is judged by one identity.** *A deal has no chain of its own beyond its versions, so nothing could place several signatures against its line. Parties who must decide together are already a group with a say of its own: they form a collective, which has a chain, and name it.*
- **A signature speaks for the moment it was made.** *A member who signed and then left was still acting when they signed; their signature stands, and the rule asks for exactly what it asked before they left, neither less nor more.*
- **Nobody is left holding an area they no longer have, and no hire outlives an emptied area.** *A clone that removes a member takes them off their areas, and an area may wait, empty and frozen, for the collective to refit it, keeping the founders' number for the refit. An empty area is an emergency: its grants end at the line that emptied it, which places every act under them like any act for the collective; the refit reinstates, by cloning, only what is still wanted.*
- **A judge is never chosen by one area.** *The time reference, the condition cMIP and the anchoring cMIP can decide who wins a dispute; they stay judicial, as every member signed them, whoever runs Agreements' other tasks. And a judge never handles what it judges: a specification chosen as a judge serves no other task and is no extension, however it is named and in a deal as in a collective. This removes a conflict of interest and keeps every area out of the choice of judges.*
- **Nothing passes around the rules.** *A specification the collective never listed would let a member act around every rule, so it counts for nothing until it is adopted. One that serves two layers is named for the second only with the power over both layers' tasks, and each of its acts counts only when each layer's rule reaching it is met, as a clone across two areas needs each.*
- **Every change is on the record at once.** *With no clock, the collective's chain is what tells which version governed an act, and who still had a say. A rotation is the chain key's ceremony, kept for changes to who decides; every other change, and every departure, is written by a record, which any member draws, at once.*
- **Nobody is added, and nobody is held.** *A collective exists only when every founder signed it, and nobody joins it or takes an area without signing. A holder can step down at once; the area waits, frozen, for the collective to refit it, rather than running on without anyone answerable for it.*
- **A split service holds authority, not discretion.** *It is named by the publication, bound to its plan, and every incoming receipt or payer's claim must be matched by a split. It can still steal, but never invisibly, and never by naming its own sybil as the referrer: role-share evidence is signed by someone on the other side.*
- **Shares are read by reference, holders follow transfers.** *A plan written in holder names would go stale at the first sale, and a publication copying shares could pay the wrong owners. Read by reference from the ownership agreement's version the receipt names, it pays whoever the agreement's transfer chain names, and two services compute the same answer.*
- **Leftovers by largest remainder, ties taking turns.** *Every client must compute the same result, so the rule is deterministic. It must also move no money when holders are reordered, since a reorder changes no share and needs no holder's signature: giving leftovers to the first listed holder would let a clone that only reordered holders send every small payment to one of them. Largest remainder keeps every payout within one smallest unit of its exact share. Ties cannot be broken by a hash of an act the divider signs, since the signer chooses its salt and can grind the hash. Taking turns, counted along the service's own receipts, lets history decide, and keeps equal holders within one unit of each other over any run of payments.*
- **Keepers are chosen up front.** *Testimony is only trusted if nobody could pick a friendly witness after the fact.*
- **Many ways to split, one vocabulary.** *A service may receive and forward at once, or pool and let owners withdraw, with every unwithdrawn share an open obligation rather than a number in a private database. Each is a competing split cMIP on the same vocabulary.*
- **Splits belong to the publication.** *Money delivers money to a pointer; the publication decides who gets what, and the ownership agreement in what shares. Each payout is a simple payment with its own receipt, so a missing one is as visible as a broken route.*
- **Exact sums, declared remainders, bounded fees.** *Rounding is where money quietly disappears; an unbounded fee line is where it disappears loudly. The plan states the maximum, and the payer's claim fixes what arrived.*
- **Role shares pay for help that is only known at payment time.** *A reposter, a relay or a module earns when its part in a sale is evidenced by someone other than the party paying it, so rewards attach to settlements, never to attention, and never to the service's say-so. That someone is the payer the payment commits to: help known in advance takes a named share.*
- **A stake pays through whoever sells.** *The core cannot tie a sale to a work's ownership without judging which claim is the claim, and a rule that tried would be evaded by re-encoding the file. What it can do is make a sale outside the claim's ownership agreement visible, and give builders every piece needed to refuse or rate such sales. The core is as little intrusive as possible, and carries the bits and bolts.*
- **Clone, never modify.** *Nothing in MOR is updated. A clone that meets its rule is the only way terms change, and the parent's history stays intact.*
- **Nobody loses their say by default.** *Protecting the abandonment clause guards one route to removing a party's voice; rewriting the clone rule is another, which would be unguarded. So the rules that decide who decides form their own tier, changed by their own rule, which is everyone unless the founders, all of them, agreed otherwise. What judges the members changes only with all of them. Everything else is operational, and can be handed to the members who run it, as areas: they decide there without asking the rest, and can hire, but never give more than they hold.*
- **The tier follows from the bytes.** *Which power a clone needs is read from which fields it changes, never from what it says about itself, so two verifiers cannot disagree, and a clone cannot slip a constitutional change past as an operational one.*
- **Every version says who brought it into force.** *A field every agreement carries should never be free text that looks binding and is not. A clone's field 4 is a claim anyone can check: this power, these people. A false claim sinks the clone.*
- **A grantor cannot unsay a deal it was paid on.** *Voiding a deal the collective acknowledged or collected on would leave the counterparty with a contest and nothing else. So a revocation never cuts off what the collective itself adopted, wherever its act sits. Deals the collective never touched are the counterparty's risk, which is why a counterparty waits until a later act of the collective cites its deal before performing.*
- **Default made visible.** *The core cannot force anyone to pay or deliver. It can make sure nobody can hide that they did not.*
- **What the collective's line placed stays placed.** *Another identity's evidence counts only while its signer's chain keeps it, save where a collective's own line placed it: a resignation, a declaration, a vote, a receipt a closing relies on. Otherwise one member's theft protection would unwind a collective's year, and a creditor's rotation would reopen a closed collective. Identity's evidence rule and this one are a pair. Endings rest only on chain keys and the collective's own chain, never on another chain's future.*
- **Unknown is not after.** *A verifier with a hole in a line's history cannot tell before from after, so it says unknown and voids nothing; two honest verifiers then never disagree on void.*
- **Owners consent together on what hits them alike.** *A company's owners who run nothing could only veto, each alone. A holders' rule they accepted lets owners holding enough of a stake agree, by share, on what hits every one of them alike; nothing reaches what one of them is paid unlike the others. Issuance keeps every owner's proportion within its reach; a sale of the works, and a fork's successors' plans, are owners' matters too. Weights are read from the stakes, never written as free numbers. Every addition is optional, its default the rule without it, so the members' collective the core keeps on its own is unchanged.*
- **Owners see what their money does.** *A prohibition on spending cannot be checked; sight can: a collective's Money acts reach every holder of its stake in itself, member or not. The right of exit means little to an owner who cannot see why to leave.*

### Parameters

- **The nesting bound**: an agreement may sit at most 8 layers deep among agreements that are parties of agreements (rule 15).

Left to cMIPs: the encoding of conditions (the condition-evaluation task) and of grant limits (the grant-limits task; grant fields 3 and 4).


### Freeze scenarios

The scenario numbers after each colon are those of the freeze test suite.

#### Making an agreement

- Agreements carry cMIP hashes, one per task: all.
- A party bound only by its own signature; founding terms naming a non-signer's debt stay a draft, the debt shown unsigned: 3.
- Terms with a bidirectional override shown visibly before signing: 1.
- Negotiation record with acknowledgements, proven complete by negotiation messages, Agreements acts; a text act in the thread is no part of it and carries no acknowledgement; disclosure by making keys public: 5.

#### Claims and ownership

- A bake, a claim, an ownership agreement, a publication: each its own act, saying one thing; a bake carrying a price or a `for` invalid; a claim never a mark on a bake: 1, 2.
- An ownership agreement targeting a claim, `[0, claim]`: shares only, no split, no fees, no split service; one carrying field 8, 14, 28, 29, or a collective's field, invalid; a collective's, `[1, null]`, requiring its key grammar and its five layers: 1, 2, 3.
- The stake, stake rule, transfer naming both chains; every publication reading the shares by reference pays the buyer once the transfer is complete, both signatures placed: 1, 3, 9.
- Binding a work; conflicting claims; a co-owner's publication not signed under the ownership agreement visible as outside it, a payment under it a purchase read as the signer's own sale, nothing owed back to the buyer: 2.
- A vow sold by a platform's publication under her ownership agreement: the owners' line hers, the platform a partner taking its share off the top, the platform raising its share only with her signature; an ownership agreement giving the vow's stake to anyone else invalid; a platform's publication naming no ownership agreement, its drafter the owners' side, paying her nothing, counting all the same, flagged "No owner" before she signs: 1.

#### Publications

- Publications; a price tag of the publication's side; key delivery or confirmation as the binding moment; an anonymous refund claimable only by a signature with the key the payment committed to, never by presenting the rail proof: 2, 5.
- A publication's ending, a later version every party signs, and a price tag's withdrawal by its signer alone: two different people's stops; a payment racing the ending owed back by the split service from what it holds, then by each party in the share it received: 2, 9.
- A purchase naming a publication's tag paid by a Money-only wallet: valid; the split service's receipt names the ownership agreement's version, the version in force for it the latest complete one on that line its history holds; a receipt naming a version on no line of that agreement, or a fork's branch other than its reference, a wrong receipt: 2, 3, 9.
- A tag on a bare bake signed by its uploader pays the uploader, unsplit; one signed by anyone else, and one under a publication signed by none of its side, nobody's offer; a re-uploader receives the tips and tag payments on their own bake: 2.
- One push payment whose receipts name different tags or ownership versions: the receipt naming another than the payment's commitment is a wrong receipt, counting for nothing; until the rail answers, the payment is pending: 3.
- On a push rail, the split service's receipt recorded before its own signature on the publication's ending makes a purchase; after it, the payment is owed back; on a request rail, the tag and version the seller's request committed to are bought: 3.

#### Splits

- A collective's split agreement raising a partner's share or a fee, signed under the judicial tier's rule, stays a draft until each departed holder it pays less signs; a work's publication taking a partner's share, signed by every party of the ownership deal, needs no signature of a holder who is no party (stated cost): 1, 3.
- A split plan putting a role share or a metric share in the rest is invalid; the same off the top is valid, and what is left, the owners' line, goes to the owners alone, by their shares: 1, 2, 3.
- A declaration of absence passes a holder's stake to its stake successor, by a clone the holder does not sign; one stating outcome 1 against a holder naming a stake successor is refused; with none named, outcome 1 shares the stake out; no declaration lets a version pay less a holder whose stake stays: 1, 3.
- Conservation and remainder rule; module fees and an omitted fee visible; maximum fee per payout, and a plan stating none flagged before signing; split by an attention metric evidenced by a record the identity running the service signs, never by a Module: 1, 2, 7.
- The collective's own reserve: a split agreement naming the collective as a partner pays that part to the collective's vault, never split again; with no vault declared, it is invalid; raising the part is an owners' matter, a departed holder asked: 3.
- A role share filled by a reposter, with the payer's signed referral; a referral named by the service alone earning nothing; an unfilled role share following the chosen option: 2. A relay's delivery record counting for its role share only when the payer's claim acknowledges it, and only for the object paid for; a claim the relay signs itself confirming nothing: 2.
- A rail Module's role share evidenced by the split service's own receipt naming a rail Module its pointer names; a receipt naming a rail Module its pointer and vault never named evidences nothing: 2.
- A relay's delivery record and a service's use record: each counts only acknowledged by the payer the payment's commitment names, never the payer a receipt names; a verifier not told the relay transport cMIP gives the same answer: 3.
- A split service that receives a payment and signs no split, or under-reports against the payer's claim, shown as an open obligation; the parties switch services by a new version of the publication: 2, 7.
- A collective's payee pointer carrying an address its split agreement's service does not, or a vault entry its vault does not, shown as bypassing it by an Agreements client before paying; a price tag under a publication naming a payee other than its split service shown as bypassing it, the payment still a purchase, what the other shares would have been an open obligation of the identity that received it: 2, 3.
- A publication's backup split services (field 11): a payment tried at the first service, a backup receiving only once the attempt before it failed as the split cMIP defines failure, the next payment starting again from the first; a chain of judgment following the split service (`[ 2 ]`) invalid: 2.
- The split task: a layer pays the owners' line by reference; a payout to an address the parties did not sign is a mismatch whatever is stated; each participant's cut is checked at its own pointer or vault: 1, 2, 3.
- One rule for every split service: it receives under its publication's tags in its own name, signs its receipts with its own key, and signs no receipt in anyone else's name: 3.

#### Time, conditions and judges

- Named time reference: 1, 7.
- Recurring obligation; lapse shown as past its terms: 7.
- A chain of judgment: the condition cMIP answers "unknown", the next in the chain decides, with no new signature; a fallback named elsewhere in the terms is invalid; a silent arbitrator is followed after its period on the time reference, a chain following an identity without a time reference is invalid (rule 35): 3.
- Terms naming one specification for a judicial task and for another task are invalid: 3.
- A deal naming one specification for anchoring and payments is invalid; a judge named as an extension, or in field 6 and for a payment task, is invalid: 1, 3.
- Terms whose field 6 and field 2's task 10 name different specifications are invalid; naming the same one is valid: 1, 3.

#### Keepers

- Keepers named by the agreement; keepers check homes; recorded acts survive rotation as disputes; a record of an act nobody holds confers nothing: 1.
- Several keepers with a threshold; a keeper lost, its records surviving in copies: 1.
- A receipt belonging to an ownership deal through the version its field 9 names, recorded by the deal's keeper before the payee's rotation: disputed; the same recorded by a keeper no agreement it belongs to names: void; a post, belonging to no agreement, placed by no keeper: a component under "Agreements".
- A deadline met, shown by an anchor of the act at or before the point; a deadline missed, shown only by a named keeper's sequence anchored past the point holding no record of the act; a keeper's word alone, or an anchor of the act after the point, never showing it missed: undetermined: a component under "Agreements".
- A keeper's later rotation disowning a record a rule read to place an act: the placement stands, the record shown as a dispute; several keepers, each record judged against its own keeper's record of the rotation, the agreement's rule counting them; a keeper's second sequence ordering nothing against its first: a component under "Agreements".

#### Changing an agreement

- Clone drafts; a deal's clone signed by two of three stays a draft; the concurrency rule withdrawn; status quo default; the judicial tier changed only by every member, one version for everyone: 1, 3.
- A clone changing the arbitrator, signed by two of three, stays a draft; signed by all three, it judges everyone: 3.
- A deal's version completed and relied on (a split service's receipt naming it, a split dividing by it, a keeper's record of it, a later version cloning it), then a party rotates and disowns its signature on it: the version stays complete for everyone, the signature shown disputed; a version nothing relied on yet is judged as Identity judges its signatures: 1, 3.
- A holders' rule: Dana holds 10% of a collective's stake in itself under a 60% holders' rule she signed; owners holding 70% take 5% off the top for a studio, the mark naming `[5, stake]` with them; she votes no and the clone comes into force, every holder paid alike less; a clone lowering her share alone stays a draft until she signs; a holder who never accepted the rule is still asked; a clone adding a holders' rule signed by every holder but one stays a draft: 3.
- A holder votes on an owners' matter, the record names the signature, the holder rotates and disowns it: the change stays in force, the vote shown disputed: 3.
- Who holds what at the vote: a seller votes, sells, and the buyer votes on the same version: one of them counts, by the collective's line placing the transfer; a transfer acknowledged by the collective but not held by the verifier leaves the vote unknown; in a deal, a version naming the transfer in field 31 asks the buyer, one not naming it the seller: 1, 3.
- Counting by share: a constitutional change rule by share, departed holders holding half the stake in itself: the members' sixty per cent is of what the voices that remain hold; voices that remain holding less than it asks for meet it together; "all of" a majority of members and owners holding 60%, each counted as alone; a rule by share used for keepers, or as a deal's clone rule, invalid: 3.
- Areas count heads: a holder of most of a stake who holds an area with two others counts one head toward its threshold, as each of them does; an area's threshold written by share is invalid: 3.
- An issuance under a sixty per cent holders' rule: every existing share scaled alike; each holder offered its proportion by an issuance offer public or sealed to it; one declines by letting its period lapse, one takes up and pays, the rest goes to the new holders the offer names; an offer that did not reach a holder starts no period for it and the issuance waits; an issuance every holder signs needs no offer; one giving a holder that took up less than its proportion, or scaling one share unlike the others, is a draft; a share added any other way needs every holder: 3.
- A standing waiver of pre-emption: set in a stake's entry of field 30 by a clone every holder signs; an issuance under a sixty per cent holders' rule then names no offer (field 32 `[0]`) and is complete once owners holding 60% and its new holders sign; a clone setting or removing the waiver signed by every holder but one stays a draft; a buyer who bought under it is bound by it; a proxy's vote on it counts nothing; field 32 `[0]` without the waiver in the parent: the issuance is invalid: 3.
- The owners' matters: a collective selling its work to its members' new collective for a token price, with a departed holder and no holders' rule: the transfer waits for her signature, placed by the collective's line; under a holders' rule she accepted, holders meeting it carry it; the same for a release: 3.
- A fork whose successor's split agreement takes an overhead the original's did not, a departed holder kept at her share of field 7: the fork is incomplete until the kept holders consent; with the same split, complete: 3.
- A kept holder consents to a fork by a signature act an act of the original in the fork's history acknowledges, then rotates and disowns it: the fork stays complete, the consent shown disputed; a consent nobody acknowledged is shown, and the fork waits: 3.
- Proxies: a holder names a proxy, standing over its stake, placed by the collective's line; the proxy's signature on an owners' matter counts as the holder's vote; the holder's own signature on the same version beats it; a proxy scoped to one version votes on no other; a revocation placed before the version's line, or a newer proxy, ends it; a proxy act placed after the version's line counts nothing there; a proxy's vote on changing the holders' rule, on waiving pre-emption, on taking up an issuance, or on a transfer of the stake counts nothing; a proxy act signed by the proxy counts nothing; a proxy in a deal counts nothing: 3.

#### Public domain

- Public domain: a release every direct owner signs, ending the claim, naming the history and making the content key public; one with an owner missing incomplete; a release rule allowing fewer, changed by a clone every owner signs; a claim it does not name shown beside it; a collective owner releasing by its own rules across its areas; a timed release ending the claim at its point, none without a time reference: 2, 3.
- The release rule counted by share: a holder splitting its share among identities it controls gains nothing; a release rule written as a number of heads is invalid; a collective's release of its work, with a departed holder, waits for the owners' consent: 2, 3.

#### A collective

- Collective born from its founding agreement, with a grammar that leaves a way to rotate; a grammar with a single holder and no successor rejected; a dead member's share released by the recovery path: 3.
- A collective founded on a threshold of its founders does not exist; a member added without signing is not added: 3.
- Founding terms carrying the members' stake in the collective, the target `[1, null]`; a clone writing another target, or a collective holding a share of itself, invalid: 3.
- Acknowledgement recorded by the collective: 3.
- A collective keeps two chains, both of acts naming it: its decisions name the previous decision, its actions the decision they act under and the heads they join; a member's act not naming it is the member's own; a stranger's act naming it is nobody's; an act citing nothing on the chain, or an act off it, counts for nothing; a joined act is before a line drawn after the join, an unjoined one after it: 3.
- A record not sealed to every member, nor public, is no line: it puts nothing in force and registers nothing: 3.
- A collective's debt sealed to its creditor alone binds no one; sealed to every member, it binds, wherever it is held; a grantee's act sealed to its counterparty alone is not backed; an act sealed to a collective's own key, which it has not, reaches nobody; terms carrying field 25 are invalid (rule 57): 3.
- A collective's negotiation message is talk: it binds nothing, and need not be sealed to every member: 3.
- A collective with departed holders pays a member from its reserve: the payout is done only sealed to every holder of its stake in itself, or public; sealed to members alone, it binds no one: 3.
- A collective's stake in itself held in part by a deal and in part by another collective: a payout is done only public, a holder being a deal; with no deal among the holders, sealed to every member of the other collective and every other holder: 3.

#### Tiers and clones

- A majority clone that rewrites the clone rule without the minority is incomplete under the default constitutional change rule; one whose mark claims the clone rule for it is invalid: 3.
- An area's power: its holder changes the area's fields alone, and grants within it; a grant beyond what its signers could do together is invalid; an act beyond a grant's reach is not backed: 3.
- A founding naming every layer's rule, the client showing first what one member can do alone in Money; a founding lacking a layer, or naming a seventh, founds nothing; under `[1, 1]` for Money one member's payee pointer counts, under `[1, 2]` it needs another member's signature; a grant from a member acting alone in Money reaching Money, valid, and from one whose rule is two together, invalid; a record any member draws: 3.
- A clone whose mark names a rule it did not meet, or another rule than the one its changes require, is invalid; a clone changing two areas, each area's power met and named, comes into force at once; an operational clone needs no rotation: 3.
- A clone changing an area and a judicial clause needs both powers: 3.
- A version changing the constitution and a judge needs the constitutional change rule and every member for the judge, its mark naming both: 3.
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

#### Members joining and leaving

- A collective whose chain key is held as shares; a member signs a receipt for it under its rule for Money; a member leaves, a record registers it, and the others rotate the chain key; the member who left, with another, signs an act for it, and it does not count; their own acts stay theirs: 3, 9.
- A member resigns alone and keeps their stake; a member removed under a constitution that allows it keeps their stake: 3.
- Under a constitutional rule of two of three, a removal completes without the removed member, the seat part of their plan going with it and its stake part staying; dropping the stake part too needs every member: 3.
- A constitutional change rule of three of three, one voice removed: the two remaining meet it: 3.
- Three of three: a member signs a clone and resigns; the clone still needs both others: 3.
- A resignation takes effect at the record registering it, not before; a record registering a departure and writing a clone judges the clone with the departure in effect: 3.
- A record writing an incomplete clone and registering a resignation: the clone is not in force, the resignation takes effect at the record: 3.
- An old resignation never registered, then a constitutional clone naming its signer that they signed: registered later, it takes nothing: 3.

#### Grants

- A collective's grant names its grantee, who accepts by signing and acts with its own key, naming the collective and the grant; one not citing it, or beyond its reach, is not backed; a collective's grant carrying a grant key invalid; a revocation, completed by the area's holder, ends it: an act its history holds binds, one racing it or after it is void, or disputed under rule 76: 3.
- A person grants an agent a key and revokes it by everyday acts, public, with no rotation; an act the revocation's history holds binds, one racing it is void, or disputed under rule 76; a grant a thief made with the stolen signing key dies at the owner's rotation; a private grant backs nothing (extended): 3.
- The label revokes Marco; deal 4, void, is adopted by the label's own acknowledgement, and Sofia manages it under her own grant; no handover: 3.
- A grantee's act that one member's act for the collective cites, and a revocation drawn by another member who never heard of it: the act binds, adopted; the grantee's later acts are void, or disputed under rule 76: 3.
- A departure empties an area: a grantee's act the line's history holds binds; acts racing it, or after it, are void; one the collective acknowledged binds; a reinstatement after the refit, a clone of the ended grant, backs new acts and takes nothing on: 3.
- The collective acknowledges a void act under a revoked grant after the revocation: it binds, adopted; an act a counterparty acknowledged after the revocation is shown disputed, confers nothing, and binds once the collective adopts it: 3.
- A frozen area's grants end; after the refit, only the grants the new holder reinstates, by cloning, back acts: 3.
- In an area held by two deciding together, one holder alone does not reinstate a grant; both do: 3.
- A signature act on an ended grant reinstates nothing; a reinstatement act, completed by the refitted area's holders after the refit, reinstates it; one made before the refit counts for nothing: 3.
- A grant whose limits cMIP sets an expiry on a time reference: an act under it after the point is not backed, the grant quiet and still revocable; a verifier without the cMIP or the time reference answers unknown; an act beyond its cMIP's limits is not backed, as one beyond its kinds: 3.
- A revocation of a grant within the refitted area counts only with that area's holder's signature act, although no area of the collective reaches revocations: 3.

#### Succession

- A seat passes automatically when every voice signed that plan; a plan cloned by two of three makes the successor a nomination; a seat passed to a member already a party gives them two seats, counted twice, thresholds unchanged; a key holding passed to two successors makes the clone marked with the plan alone invalid; before signing a plan, the client shows what each successor would hold: 3, 9.
- The automatic succession clone puts the successor in the departed member's place in the parties and in every holding of the key grammar, every threshold unchanged, and drops the executed plan; one that changes a threshold, leaves the successor out of a holding or keeps the plan is invalid; the rotation declaring it re-deals the keys, and the successor's voice then counts: 3.
- A succession plan whose key 2 writes a seat successor with a voting weight beside it is invalid; listed alone, the successor enters as rule 83 says and, under a rule by share, weighs what the plan's stake part gives it: 3.
- Where the dead member held the chain key alone, the succession clone also carries a plan for the successor, naming their own successor, signed by them in it, and comes into force; one without it is invalid (rule 59): 3.
- A seat passed by succession leaves the dead member's area to be refitted: 3.
- A succession clone takes the dead member off their areas; an area left empty is frozen; founding terms with an empty area are invalid: 3.
- A succession clone leaves an area's number above its one remaining holder, who meets it alone: 3.
- A party with no plan and a confirmed identity-level successor: a nomination, approved under the constitutional change rule, never an automatic seat, the stake staying with the party's identity; an unconfirmed successor nominates nobody: 3.

#### Abandonment

- Abandonment declaration signed by the named authority, an identity, under the clause the party signed; contest by a contest act: 1.
- Liveness act: 1.
- A deal whose abandonment clause names a threshold of the other parties is invalid; the parties name one identity, a keeper's operator or a collective they form: 1.
- A founding agreement leaving a member with constitutional power uncovered by the abandonment clause is rejected; a member with constitutional power dies, is declared absent, loses their voice, and the others change the constitution: 3.
- A clone signed by a member later declared absent, already on the record, stays in force; their signature on another clone, which no record names and nothing acknowledges, no longer counts; a year of receipts they signed before the collective's line keeps their signature: 3.
- A threshold abandonment authority of two of the other parties, one of them resigned and registered before the declaration's line: the one who remains declares alone: 3.
- A threshold abandonment authority of two of the other parties, both counted: one signs the declaration and the other a signature act naming it, which the collective acknowledges before its line or in the record registering it; the declaration counts there; a signature it acknowledges only after that record completes nothing there, and a later record registers the declaration: 3.
- A threshold abandonment authority of two of the other parties against the last member able to draw a record: the recovery rotation removing them names the second signature act, and the declaration counts there; one that names none, the second signature placed nowhere before it, leaves the declared member counted: 3.
- A declaration naming another clause version than the one the absent member signed last, an outcome the clause does not allow, or signed by someone other than the authority registers nothing (rule 87): 3.
- A departed holder vanishes: declared absent under the clause in force, though no party, its stake passes to its plan's successor, who signs the sale; with no plan, outcome 1 shares it out and the sale proceeds; a declaration against it stating outcome 0, 3 or 4 counts for nothing: 3.
- A collective whose constitutional change rule counts among its stake's holders, its abandonment clause allowing outcome 0 alone, or naming as authority the holder it would have to declare: invalid; allowing outcome 1 with an authority able to declare every holder who is no party: valid, a vanished holder's stake moved and the constitution changed without it: 3.
- A declaration of absence registered by a line, then its authority rotates and disowns it, or the declared member rotates and disowns the signature field 1 names: the record stays a line, the declaration shown disputed: 3.

#### Forks of records

- Two registrations of one departure drawn concurrently: an act after one of them only counts as made after the departure; two sibling clones recorded concurrently leave their parent in force: 3.
- Two sibling clones recorded on concurrent lines: the concurrency rule being withdrawn, the parent stays in force until a clone recorded after both resolves it: 3.
- A clone of one branch of a fork, recorded after both lines, resolves it; one recorded after only one line does not: 3.

#### How a collective ends

- A group splits off with the powers to do so: an ordinary membership change, its members departed holders (rule 91, shape A): 3.
- A collective forks: each side founds its successor first; the fork act names them; every member signs it with their own identity, by a chain signature with their chain key, on a side, under the constitutional rule; the original's later acts count for nothing; its ownership passes to the successors by the members' stakes; the departed holder keeps their share in each; the fork hands out every debt in the history it cites, an unpublished one included, or does not take effect, each successor signing for its own, and uploading that debt later changes nothing; a successor owing such a debt cannot close until it is paid or released; every grant ends at the fork's line, a grantee's deal the fork's history cites binding and any other void; a debt signed off the fork's history is void; its publications sell nothing from the line; a payment to the old service naming no claim, or the original's claim never recorded by the original's chain before the fork, is no purchase, owed back to the payer; one naming the fork is pending until a successor's chain records it; a member on no side under every-party, a stranger on a side, a successor dropping a departed holder, or two concurrent forks sharing no signer, close nothing (rule 91, shape B): 3.
- Under a constitutional rule of two of three, two members fork without the third, who signs no side and is a departed holder of each successor at their percentage: 3.
- A fork hands out its whole history: a debt another member signed for the collective that the line's history joined must be handed out, one it leaves out is void and owed by nobody; while an act the history names is not held, the fork is not complete; a successor's own later fork hands out what it inherited: 3.
- The tie rule: a public debt a closing's history does not cite is void, and does not keep the collective from closing; cited, it does: 3.
- A publication over a collective that forks or closes sells nothing from the line: a payment its split service receipts that the ending's history does not hold is owed back: 3, 9.
- A fork drawn on a line before a debt the collective had cited: complete, the debt void, the debt and its citation standing as evidence; a member's client that has not pulled every member's latest acts for the collective refuses to sign it: 3.
- A fork on an old line leaving out a payee pointer, a payment to it and its taking-on inside: the payment still counts; a fork leaving out a binding debt, then a departure registered after it: the fork stays incomplete: 3.
- A complete fork, then a second complete fork naming it: the first stays final, the second counts for nothing; a second fork naming nothing in its `objects`, signed by the same members: it names the first through their chains, and counts for nothing; a signature act on an ending counts for nothing; two complete closings sharing no signer: neither counts; a third, signed by one signer of each, settles it: 3.
- An old proposal finished late: a member's signature on it, placed after their signature on the ending naming it, counts for nothing; under a threshold, a member who signed neither finishing it is the stated cost; a second fork whose drafter signed the first and leaves it out of its `objects` is no fork, and the first, finished late, ends the collective: 3.
- A closing sealed to one member takes no effect; public, it does: 3.
- A successor that signed a complete fork by a chain signature with its own chain key later rotates: the fork stays final, no rotation voiding a chain act; a successor's signature act (type 1) on a fork is no signature on it, and the fork stays incomplete: 3.
- A closing relying on a creditor's release that an act of the collective in its history acknowledged: the creditor rotates and disowns the release; the closing stays complete, the release shown disputed; a release nobody acknowledged is shown, and the closing waits: 3.
- A closing whose history names an act the verifier does not hold is unknown for it, never complete and never "not complete"; held, it is judged; the same for a fork: 3.
- A collective releases its work by its own rules, then, holding nothing and owing nothing, closes; its later acts count for nothing; a closing while it holds the work, or owes anything, does not take effect, and completes once one debt is paid and the other ended by its creditor's release after a partial payment; a release signed by anyone but the creditor ends nothing (rule 92): 3.
- A collective forgives a debt owed to it under its rule for Money alone: the release counts once a member meeting that rule signs it, a member outside it signing changes nothing (rule 92): 3.
- A bankrupt collective settles with its creditor: a partial payment, a share of its work by a clone of its agreement, and the creditor's release for the rest; it then owes nothing, and, still holding its share of the work, stays open (rule 92): 3.

#### A broken collective

- A broken collective: a rotation whose clone's mark is false breaks it, every act of the broken stretch counting for nothing; a resignation in the stretch names the agreement in force before the broken act; a rollback naming the broken act, registering the resignations, under that agreement's constitutional change rule, brings it back, the broken act still shown; a rollback under another power, of another parent, or naming another act, puts nothing in force; no rollback once every voice has resigned; the last voice warned before leaving, and the last constitutional voice; the broken clone refused as the rollback's clone; grantees' acts of the stretch counting for nothing and the grants working again after the rollback; payments received in the stretch owed back unless signed anew; a declaration of absence made in the stretch registered by the rollback with its signatures, an acknowledgement in the stretch placing nothing; a rotation removing or garbling the declaration broken with the same rollback; no fork or closing while broken, whatever its line, and money owed back a debt before closing; a grantee's act after the rollback counting once it cites it; what the collective keeps judged by the publication a payment was made under; the contest act; a returned member's old resignation spent, and an old stepping down once the member holds the area again; money owed back repaid by a payment naming it, by either side's record, then no longer blocking a closing; a declaration neither public nor addressed to the member counting for nothing: 3.
- Money owed back from a broken stretch: repaid to the refund rail the payer's own claim names, never elsewhere; to the pointer the payer's own acts hold, never a newer one; to a bare key where its claim says; owed to nobody, it does not block a closing that names it; owed to a payer with no address, a notice sealed to them, its deadline passed, and a closing naming it: 3.

#### Made before, made after

- A record naming, on the collective's chain, the previous decision and the acts its drawer holds; an act for the collective it does not reach counts as made after it: 3.
- A signature from a device a member's resignation never mentions: placed by the act for the collective it signs, or the record naming it, it counts when that act is before the collective's line, whatever the device: 3.
- A signature placed after the collective's line that only a friend acknowledged counts toward nothing: an acknowledgement by another identity places nothing: 3.
- A record counts only with the signature acts it names; a signature arriving after it completes nothing there, and a later record stays in force: 3.
- A receipt on a branch the collective's line left out counts as made after it, unless the collective's keeper recorded it before the line; a keeper never places a member's signature: 3.
- After the line, members cite only acts before it to backdate a receipt a departed member signs for the collective: it counts as made after the line: 3.
- A departed member completes, after the line, a receipt the collective signed before it, and it counts; an early signature counts where the collective acknowledged it before its line, and not otherwise: 3.
- A member's own rotation forgets one of their devices: receipts they signed for the collective from it before the collective's line registering the rotation keep their standing for the collective; one with the old key made after the line does not: 3.
- A clone signed from a device a member's own rotation forgot, recorded before the line registering that rotation: the signature stays valid for the collective, and the clone stays in force: 3.
- A rotation declaring a constitutional clone with too few of its signature acts named puts nothing in force; a signature arriving after it completes nothing there: 3.
- A member resigns, the collective registers it and lives a year under that line; the member rotates and disowns the resignation: the line stands, every record after it stands, the resignation is shown as disputed, and the member comes back only by a constitutional clone naming them: 3.
- A verifier with a hole in a line's history voids nothing on it and takes no voice away: it answers unknown, and judges again once it holds the act; an action citing a decision it does not hold is unknown: 3.

#### The way out, walked

- An owner leaving a work: the transfer alone, both signatures placed; every publication reading the ownership agreement by reference pays the buyer from the next payment: 9.
- A member leaving a collective: resignation, the record registering it, the clone without them put in force by a record, or, where they held a share of the chain key, declared by a rotation re-dealing it; their acts for the collective after the line count for nothing, their own acts stay theirs: 9.
- Succession: a member's plan passes the seat and the stake; a single chain-key holder's successor and escrowed share named; a seat to a member already a party: 9.
- Closing and fork: a fork's successors founded first and named, the members chain-signing it; a publication over the closed original selling nothing from the line: 9.
- Rotation and escape: the collective's chain key rotated from shares; its homeless rotation, signed by its chain key, its own escape, which no old home's objection voids: 9.
- A refund owed back: a payment racing a publication's ending owed back by the split service from what it holds, then by each party in its share: 9.
- A work cloned to MOR 2: its bake, claim and ownership agreement carried; its publications, distribution, remade: 9.

#### Forked deals

- Two complete versions of one deal: the version before the split is the reference while the deal has two branches; an act following either branch counts, judged under that branch's latest version, a purchase included (the buyer is protected), an ownership agreement's shares paid by the reference until the fork is settled, a receipt naming another version of the fork a wrong receipt; a branch that grows settles nothing; only a complete version naming both branches (field 26) settles the fork, finally, the other branch never coming back; a tangled fork stays on its reference, a buyer under a version every party signed protected; a settling version signed by the parties of both branches, naming the discarded tip and citing it; only complete versions of the deal read as settling, a draft or a stranger's act changing nothing; the arbitrator settling on a party's request only; one numbering across a deal's splits, a gap the holder's alarm; a seller's client raises the alarm on a payment naming a version that does not descend from the one it holds, or one it does not hold, and a notice on an older version; a buyer's client checks the publication and its tag are current; a version beyond the named tip, citing the settlement or not, changing nothing; a tangled deal settled by a version naming every tip it discards, signed by the parties of every branch; only the judge of forks the reference names settling, none where it names none; a deal's split with no number, or a repeated one, breaking the plan: 1.
- A settled deal, then a version on the dropped branch the settlement did not hold, a version grown there by a party left alone, a second settlement by the judge holding the first, and a plain version on either branch: nothing reopens, the line in force stays; a settlement holding a newer version of a branch whose older version it names settles nothing; a settling version naming a version not held is a plain version until held; the judge of forks silent past its period, the next link settles: 1.