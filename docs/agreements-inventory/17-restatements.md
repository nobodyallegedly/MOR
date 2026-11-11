# Agreements draft 24, inventory: sentences that say the same thing in more than one place

Each group below gathers inventory rows whose sentences state one rule in more than one place, outside Part six. Groups are ordered by their first id; the relation line says whether the sentences say exactly the same thing, whether one is narrower or broader than another, or whether they differ (a possible contradiction, described without judging which wording is right). A row may appear in more than one group where it states two rules.

### R-01. The four acts from bake to publication each say one thing (bake: I uploaded this; claim: I made this; publication: how we publish)

**Relation:** one narrower

- A-017 (no rule, How to read this MIR, line 25): "*From bake to publication, in four acts, each saying one thing:* a bake (Envelopes), "I uploaded this"; a claim, "I claim to have made this";…"
- A-049 (no rule, Words used: Claim, line 66): "Claim. An act binding a work's hash to its creators (type 3): "I claim to have made this.""
- A-061 (no rule, Words used: Publication, line 78): "Publication. The act (type 6) that is the offer: "this is how we agree to publish it with these specified partners.""
- A-202 (Rule 7, 2. Claims, stakes and transfers, line 248): "A bake says one thing only, who uploaded it (Envelopes rule 23)."

### R-02. A client implements Agreements fully or not at all

**Relation:** one narrower

- A-029 (no rule, Dependencies, line 45): "Agreements are optional per client, but all or nothing: a client implements it fully, or shows its acts as unknown (core, client conformance)."
- A-030 (no rule, Dependencies, line 45): "A client that acts on agreements implements Agreements."

### R-03. Only acts valid under their own specification's format count

**Relation:** one narrower

- A-033 (no rule, Dependencies, line 49): "Only acts valid in their own format count."
- A-034 (no rule, Dependencies, line 49): "Every act a rule of this MIR counts, its own or another specification's (a receipt, a claim, a bake, a price tag, a rotation, a…"
- A-035 (no rule, Dependencies, line 49): "An act whose type its specification does not define, or whose payload is outside that specification's format, is invalid (Envelopes rule 30), and no rule…"

### R-04. An over-sale is a valid act that confers nothing; its payment is owed back by the seller

**Relation:** one narrower

- A-037 (no rule, Dependencies, line 49): "A format rule is one decided from the act's own bytes; a bound that needs other acts (a transfer's field 3, at most what the…"
- A-289 (Rule 10, 2. Claims, stakes and transfers, line 349): "an over-sale confers nothing, and its payment is owed back by the seller (money received for nothing), paid as a refund (Money rule 17; stated…"
- A-293 (Rule 10, 2. Claims, stakes and transfers, line 353): "The over-sale's payment is owed back by the seller."
- A-2132 (no rule, Stake transfer (type 4), line 2926): "An over-sale confers nothing."

### R-05. An agreement is terms plus one signature act per party

**Relation:** one narrower

- A-040 (no rule, Words used: Signature, line 56): "Each act has one signer, so every agreement is its terms plus one signature act per party."
- A-041 (no rule, Words used: Agreement, line 57): "Agreement. Terms together with the signatures its rules require."
- A-165 (Rule 1, 1. Making an agreement, line 181): "Each party signs with a signature act naming the terms."

### R-06. An agreement names identities, not keys

**Relation:** one narrower

- A-043 (no rule, Words used: Agreement, line 57): "It commits identities, not keys (rules 1, 3)."
- A-176 (Rule 3, 1. Making an agreement, line 195): "An agreement names identity hashes, not keys."

### R-07. A clone names its parent in objects as chain and predecessor

**Relation:** one narrower

- A-044 (no rule, Words used: Agreement chain, line 58): "Agreement chain. The acts on one agreement: signatures, clones, records, transfers, contests, each naming in `objects` the chain and the act it follows (rule 6)."
- A-1920 (no rule, Terms (type 0), field 11, line 2590): "parent: the agreement this one clones; objects names it as chain and, as predecessor, an act of its chain, the latest the signer's client holds…"
- A-1984 (no rule, Terms (type 0): a clone, line 2727): "Its inside names, in `objects`, the parent's chain and the act of that chain it follows: `[[parent, act]]`."

### R-08. A deal is an agreement whose terms carry no key grammar (field 12)

**Relation:** one narrower

- A-045 (no rule, Words used: Deal, line 59): "Deal. An agreement that founds no collective: its terms carry no key grammar (rule 47)."
- A-1992 (no rule, Terms (type 0): a deal, line 2734): "A deal (terms without field 12) has every party as its clone rule too."

### R-09. A position is an agreement conferring income without ownership

**Relation:** same

- A-046 (no rule, Words used: Position, line 60): "Position. An agreement that confers income without ownership (rule 5)."
- A-181 (Rule 5, 1. Making an agreement, line 207): "Positions are agreements that confer income without ownership."

### R-10. Proven delivery leaves a proof any verifier checks from data alone, sold in the access form; promised delivery is a vow

**Relation:** one narrower

- A-047 (no rule, Words used: Proven delivery, promised delivery, line 61): "Proven delivery, promised delivery. The two ways what a publication sells is delivered: with a proof any verifier checks from data alone, sold in the…"
- A-346 (Rule 11, Rule 11. Publications, accepted by payment, line 406): "A proven delivery leaves a proof any verifier can check from data alone, no one's word trusted."
- A-347 (Rule 11, Rule 11. Publications, accepted by payment, line 406): "It is sold in the access form, `[ 2, [ cMIP, params ] ]`, under that cMIP's terms ("A service sold under a cMIP's terms")."
- A-2082 (no rule, Publication (type 6), sold, line 2854): "a proven delivery: one whose proof any verifier checks from data alone, under a cMIP and its parameters (widened from access to bytes; a stream's…"
- A-2106 (no rule, Publication (type 6): a service sold under a cMIP's terms, line 2889): "The access form is the form of every proven delivery (rule 11)."

### R-11. Negotiation messages (type 18) are how two sides negotiate

**Relation:** one narrower

- A-048 (no rule, Words used: Negotiation message, line 62): "Negotiation message. An Agreements act carrying text, by which two sides negotiate (type 18, rule 52)."
- A-525 (Rule 52, Rule 52. Negotiation record, line 619): "Two sides negotiate by negotiation messages (type 18)."
- A-1894 (no rule, Part five: act formats, the type table, line 2546): "one side of a negotiation thread (rule 52)"

### R-12. A claim is its own act; a bake claims nothing

**Relation:** one narrower

- A-050 (no rule, Words used: Claim, line 66): "Its own act, never a mark on a bake (rule 7)."
- A-201 (Rule 7, 2. Claims, stakes and transfers, line 248): "A bake is a neutral carrier: carrying or quoting a work, or pointing to a web resource, claims nothing."

### R-13. A collective's ownership agreement targets the collective itself, [1, null]

**Relation:** one narrower

- A-054 (no rule, Words used: Ownership agreement, line 69): "kind 1, an identity it founds: a collective's ownership agreement, its founding and every clone of it, which also carries the collective's key grammar, its…"
- A-105 (no rule, Words used: This collective, line 117): "This collective. In a collective's own terms, the target written `[1, null]` names the collective whose agreement it is: the identity whose genesis declares these…"
- A-545 (Rule 56, Rule 56. A collective is an identity its members act for, line 654): "That agreement is an ownership agreement whose target is the collective itself (`[1, null]`, terms field 33): it carries the members' stake in the collective,…"
- A-1921 (no rule, Terms (type 0), field 12, line 2592): "present if this agreement founds a collective (only with target [1, null])"
- A-2416 (no rule, Collectives in the identity chain, line 3339): "It declares it in place of a first signing key, and is signed by a chain key (Identity rule 1); its founding agreement's target is…"

### R-14. An ownership agreement says only who owns what; it carries no split, no fees, no split service

**Relation:** same

- A-055 (no rule, Words used: Ownership agreement, line 71): "It carries no split, no fees and no split service: those are a publication's (rule 7; "Terms (type 0)")."
- A-215 (Rule 7, 2. Claims, stakes and transfers, line 258): "An ownership agreement says only who owns what share, and how the owners decide; it carries no split, no fees and no split service."

### R-15. The holder of a share is whoever field 7 and the placed transfers name

**Relation:** one narrower

- A-057 (no rule, Words used: Stake, line 72): "The current holder of a share is whoever field 7 and the transfer chain on the agreement name (rules 8, 10)."
- A-223 (Rule 8, 2. Claims, stakes and transfers, line 266): "A holder is whoever field 7 and the transfers placed say (rule 10): a buyer who completed a transfer is the holder of what it…"

### R-16. The stake decides what every holder is paid; the departed members entry records only that a holder left, without voice

**Relation:** one narrower

- A-059 (no rule, Words used: Stake, line 73): "It decides what every holder is paid, member or departed."
- A-136 (no rule, Words used: Departed holder, line 144): "Its share is in the collective's stake (field 7), which decides what it is paid; its consent is asked where rule 98 asks the owners',…"
- A-137 (no rule, Words used: Departed holder, line 144): "The collective's departed members entry records only that the identity is departed, without voice (terms field 22)."
- A-2026 (no rule, Terms (type 0): the departed members entry, line 2782): "The entry records only that each is departed, without voice; the stake decides what every holder is paid."

### R-17. Owners' consent: the consent of the holders of a collective's stake in itself who have no say; a collective's sale or release of a work share needs it

**Relation:** one narrower

- A-060 (no rule, Words used: Owners' consent, line 74): "Owners' consent. The consent a change needs from the holders of a collective's stake in itself who have no say in it (rules 48, 98)."
- A-263 (Rule 10, 2. Claims, stakes and transfers, line 320): "A collective's transfer of a share it holds in a work needs its owners' consent (rule 98)."
- A-1315 (Rule 91, Rule 91. How a collective ends: four shapes, line 1749): "Each sale or release of a work needs the owners' consent (rule 98): the holders of the collective's stake in itself who have no say…"
- A-1437 (Rule 55, Rule 55. Public domain, line 1928): "A collective's release of a share it holds in a work needs its owners' consent (rule 98): it counts only once the holders of the…"
- A-1461 (Rule 98, Rule 98. The last resort, guarantees, line 1957): "no sale or release of a stake a collective holds counts without the consent of the holders of its stake in itself who have no…"
- A-2134 (no rule, Stake transfer (type 4), line 2928): "A collective's transfer of a share it holds in a work takes effect only once, besides the above, its owners' consent is given (rule 98)."
- A-2245 (no rule, Release (type 5), complete when, line 3090): "where a collective releases a stake it holds, its owners' consent is given (rule 98)."
- A-2249 (no rule, Release (type 5), line 3092): "And since it pays the holders of the collective's stake in itself less, by effect, it needs the owners' consent (rule 98)."

### R-18. A split agreement is a publication whose versions sell nothing, naming the collective's split service

**Relation:** one narrower

- A-063 (no rule, Words used: Split agreement, line 79): "Split agreement. A publication whose versions sell nothing (field 0 absent), dividing what reaches its split service for the collective's ownership agreement it names (rule…"
- A-923 (Rule 15, Rule 15. One ownership, many publications: money passes layer by layer, line 1202): "A collective names the service that receives its income by a split agreement: a publication whose first version sells nothing (field 0 absent), naming the…"
- A-2115 (no rule, Publication (type 6): a split agreement, line 2895): "A split agreement is a publication whose versions carry no field 0."

### R-19. A partner is any identity a publication names to take a share off the top

**Relation:** one narrower

- A-064 (no rule, Words used: Partner, line 80): "Partner. An identity a publication names to take a share of each payment, off the top: a publisher, a relay, a client, a split service;…"
- A-2084 (no rule, Publication (type 6), partner, line 2858): "the partner: any identity"

### R-20. A purchase is a payment naming a price tag the publication counts

**Relation:** one narrower

- A-067 (no rule, Words used: Purchase, line 82): "Purchase. A payment naming a price tag a publication counts (rule 12; Money rule 18)."
- A-358 (Rule 12, Rule 12. A purchase names a publication's price tag, line 416): "A payment is a purchase under a publication when its receipt or claim names, as what it fulfils (the receipt's field 5, the claim's field…"

### R-21. A payment of a bare bake's tag is the uploader's sale, and gives the payer standing as a purchase does

**Relation:** one narrower

- A-068 (no rule, Words used: Purchase, line 82): "A payment of a bare bake's tag is a sale by the bake's uploader, unsplit (Envelopes rule 23; Money rule 18)."
- A-539 (Rule 54, Rule 54. Standing, line 641): "the buyer of a purchase, for a contest of that purchase ("Contest (type 14)"); a payment of a bare bake's tag is a sale by…"

### R-22. Each sale of a vow is pending, confirmed or contested

**Relation:** one narrower

- A-069 (no rule, Words used: Vow, line 83): "Vow. An act naming in words something MOR cannot hash, or cannot hash yet: its own chain, its genesis id its name for good (Envelopes…"
- A-395 (Rule 13, Rule 13. Vows: the state of each sale, line 462): "Each sale is pending, confirmed or contested."

### R-23. Every share paying anyone but the owners is off the top; what is left, the owners' line, goes to the stake's holders by their shares

**Relation:** one narrower

- A-074 (no rule, Words used: Owners' line, line 89): "Owners' line. What a payment leaves for the owners once every share off the top is paid, divided among the holders of the ownership agreement's…"
- A-458 (Rule 14, Rule 14. A sale is tied to the seller's ownership agreement, not to the work's claim alone, line 530): "Under such an agreement the overhead (a platform's share as a partner, a helper's share, a fee) comes off the top (rule 22), what is…"
- A-914 (Rule 15, Rule 15. One ownership, many publications: money passes layer by layer, line 1194): "A sale through a publication is divided once, by its split service: partners first, each by its share; then the role, metric and fee shares…"
- A-991 (Rule 22, Rule 22. Role shares with evidence, line 1314): "Every share paying anyone but the owners, a partner's share, a role share or a metric share, is paid off the top only, as overhead;…"
- A-992 (Rule 22, Rule 22. Role shares with evidence, line 1314): "A plan putting a non-owner in the rest is invalid."
- A-1060 (Rule 29, Rule 29. Attention, line 1421): "A metric share is paid off the top only, as overhead, like every share paying anyone but the owners (rule 22)."
- A-2147 (no rule, Split plan and split (type 8), split plan (keys 2 and 4), line 2947): "keys 2 and 4 are not used: every share but the owners' line is off the top, and a named receiver is a partner (field…"
- A-2173 (no rule, Split plan and split (type 8), line 2988): "For the owners' line, each holder of the stake in the version in force for the receipt (rule 12) receives its share of what is…"
- A-2176 (no rule, Split plan and split (type 8), line 2992): "Every fee, partner's, role and metric share is taken before the owners' line divides, so it falls alike on every owner."

### R-24. A split service receives every payment under a publication, divides it by the split plan and pays everyone

**Relation:** same

- A-075 (no rule, Words used: Split service, line 90): "Split service. The identity a publication names to receive every payment under it, divide each one by its split plan, and pay everyone (rule 16):…"
- A-946 (Rule 16, Rule 16. Named by the publication, line 1226): "A publication names its split service (field 3): the identity that receives every payment under it, divides each one by its split plan, and pays…"

### R-25. A split is signed by the service, names the receipt or claim that brought the money, and lists every payout

**Relation:** one narrower

- A-076 (no rule, Words used: Split, line 91): "Split. A split service's signed act dividing one incoming payment into payouts (type 8, rule 20)."
- A-983 (Rule 20, Rule 20. Sign a split, line 1300): "The split is signed with its own key, names that receipt or claim, and lists every payout."
- A-2156 (no rule, Split plan and split (type 8), split key 0, line 2962): "the receipt or payer's claim that brought the money to the split service"

### R-26. A payout is a simple Money payment with its own receipt naming the split

**Relation:** one narrower

- A-077 (no rule, Words used: Payout, line 92): "Payout. One receiver's part of a split, paid as a simple Money payment with its own receipt (rule 23)."
- A-1037 (Rule 23, Rule 23. Pay out, line 1379): "Each payout is paid as a simple Money payment to the current holder of the share, or the partner, with its own receipt naming the…"

### R-27. A role share's evidence counts only when the payer's claim acknowledges it

**Relation:** one narrower

- A-079 (no rule, Words used: Role share, line 93): "Its evidence counts only as rule 22 says."
- A-980 (Rule 19, Rule 19. What it receives, line 1293): "the evidence for role shares: the referral the payer signed in its claim, and any act offered as a helper's evidence (a relay's delivery record,…"
- A-999 (Rule 22, Rule 22. Role shares with evidence, line 1318): "A role share pays for help known only at payment time, and its evidence counts only when the payer the payment commits to acknowledges it,…"
- A-1003 (Rule 22, Rule 22. Role shares with evidence, line 1325): "any other act offered as a helper's evidence, a relay's delivery record (relay transport cMIP, "Delivery records") or a service's use record (Development rule 15),…"

### R-28. A keeper records act ids and signers, never content

**Relation:** one narrower

- A-081 (no rule, Words used: Keeper, line 97): "It records act ids and signers, never content (rules 36 to 44)."
- A-2570 (no rule, Keeper record (type 2), CDDL, line 3533): "the act recorded, by its id, and the identity that signed it"

### R-29. An act that belongs to no agreement (a post, a bake, a rotation, a genesis) has no keeper of its own

**Relation:** one narrower

- A-087 (no rule, Words used: Belongs to, line 103): "An act that belongs to none (a post, a claim alone, a bake, a rotation) has no keeper of its own: only an anchor places…"
- A-093 (no rule, Words used: Belongs to, line 105): "Its genesis, its rotations and its Identity acts belong to none, as every identity's."

### R-30. The version in force for an act is the latest complete version on its line that the act's history holds

**Relation:** one narrower

- A-091 (no rule, Words used: Belongs to, line 105): "For a deal, the latest complete version, on the line of the version the act names, that the act's history holds (what its `prev` and…"
- A-363 (Rule 12, Rule 12. A purchase names a publication's price tag, line 422): "The version in force for that receipt is the latest complete version on that line its history holds (what its `prev` and the predecessors its…"

### R-31. An arbitrator or verifier, not a keeper, is named to judge content

**Relation:** one narrower

- A-094 (no rule, Words used: Arbitrator or verifier, line 106): "Arbitrator or verifier. A third party named by an agreement to judge content (escrow and milestones, arbitration, regulated checks), who receives the keys of the…"
- A-767 (Rule 43, Rule 43. Keepers are always sealed, line 967): "A keeper that must also judge content is named as an arbitrator or verifier as well."
- A-768 (Rule 44, Rule 44. Judging content is someone else's job, line 973): "Where a third party must judge content (escrow and milestones, arbitration, regulated verification), the agreement names an arbitrator or verifier, and the parties deliver it…"

### R-32. The chain of judgment (terms field 21) names who takes over from a judge, in order, when it answers unknown or fails to act within its period

**Relation:** one narrower

- A-096 (no rule, Words used: Chain of judgment, line 108): "Chain of judgment. For a judge the terms name, the ones that take over from it, in order, when it answers "unknown" or does not…"
- A-1737 (Rule 35, Rule 35. The chain of judgment, line 2325): "For each judge it names, an agreement may name, in its terms (field 21), the ones that take over, in order, when it answers "unknown"…"
- A-1925 (no rule, Terms (type 0), field 21, line 2597): "the chain of judgment: who takes over from a judge (rule 35)"
- A-1941 (no rule, Terms (type 0), chain, line 2634): "a judge the terms name, and in order those that take over from it, each with the period, on the time reference, that the one…"
- A-2002 (no rule, Terms (type 0): the chain of judgment, line 2749): "The chain of judgment (field 21) says who takes over from a judge the terms name."

### R-33. Only an agreement's time reference decides whether something is past its terms

**Relation:** one narrower

- A-098 (no rule, Words used: Time reference, line 109): "For that agreement, only it decides whether an act is before or after a point on its reference, and whether something is past its terms…"
- A-1722 (Rule 33, Rule 33. Time, line 2301): "An agreement that needs deadlines names its time reference."
- A-1723 (Rule 33, Rule 33. Time, line 2301): ""Past its terms" is judged against that reference only."

### R-34. The concurrency rule (field 10) is withdrawn; a fork of records is settled by rule 90's default

**Relation:** one narrower

- A-099 (no rule, Words used: Concurrency rule, line 110): "Concurrency rule. Retired: terms field 10 is withdrawn, never reused."
- A-100 (no rule, Words used: Concurrency rule, line 110): "A fork of records is settled by rule 90's default."
- A-155 (no rule, Words used: Fork of a collective, line 165): "Not to be confused with a fork of records or of an agreement chain (rules 6, 72, 90), which rule 90 settles."
- A-1919 (no rule, Terms (type 0), field 10, line 2589): "10, the concurrency rule, is withdrawn: rule 90's default stands; never reused"

### R-35. A contest counts only when signed by someone with standing

**Relation:** one narrower

- A-101 (no rule, Words used: Contest, line 111): "Contest. A signed objection to another act, by someone with standing (rule 54)."
- A-103 (no rule, Words used: Standing, line 112): "Standing. Who may contest an act (rule 54)."
- A-535 (Rule 54, Rule 54. Standing, line 636): "A contest counts only when signed by someone with standing:"
- A-1890 (no rule, Part five: act formats, the type table, line 2542): "anyone with standing (rule 54): the party a declaration of absence names, answering it; the buyer of a purchase, contesting it, a vow's sale included…"
- A-2293 (no rule, Contest (type 14), of any other act, line 3145): "Signed by anyone without standing, it shows nothing."

### R-36. A contest is shown, never voids: it changes no act's validity, status or selection

**Relation:** one narrower

- A-102 (no rule, Words used: Contest, line 111): "It changes nothing about any act's validity, status or selection; it makes disagreement visible."
- A-432 (Rule 13, Rule 13. Vows: the state of each sale, line 492): "a contest prevails over a confirmation and voids nothing;"
- A-541 (Rule 54, Rule 54. Standing, line 644): "A contest never changes any act's validity, status or selection."
- A-1692 (Rule 87, Rule 87. Declaration, line 2251): "Otherwise the declaration is the authority's judgment, a stated cost the party accepted by signing the clause, and a contest shows it."
- A-2269 (no rule, Contest (type 14), of a declaration, line 3133): "It shows that party's presence and the dispute, and voids nothing (rule 88)."
- A-2282 (no rule, Contest (type 14), of a purchase, line 3137): "Signed by the buyer, it is shown beside the purchase while the payment is a purchase (rule 12; a payment still pending, or found to…"
- A-2292 (no rule, Contest (type 14), of any other act, line 3145): "It is shown beside the act it contests, and changes nothing about any act's validity, status or selection."

### R-37. A collective has no signing key of its own and signs nothing itself; its members act for it

**Relation:** one narrower

- A-104 (no rule, Words used: Collective, line 116): "Collective. Several identities acting together as one identity: an identity with its own genesis, homes and chain key and no signing key of its own,…"
- A-543 (Rule 56, Rule 56. A collective is an identity its members act for, line 652): "A collective is an identity with its own genesis, homes and chain key, and no signing key of its own (Identity rule 1)."
- A-548 (Rule 56, Rule 56. A collective is an identity its members act for, line 656): "It signs no everyday act: its members act for it, each with their own key, naming the collective (rule 58), and Agreements judges each such…"
- A-616 (Rule 59, Rule 59. Key grammar, line 739): "A collective has no signing key (rule 56): the key grammar is the chain key's alone."
- A-1875 (no rule, Part five: act formats, line 2524): "A collective signs nothing itself."
- A-1946 (no rule, Terms (type 0), key-grammar, line 2648): "key 0 and key 2 are retired and never reused: a collective has no signing key (rule 59)"

### R-38. A key grammar must leave a way to rotate that needs less than every member and survives the loss of any one key holder; otherwise it is invalid

**Relation:** one narrower

- A-108 (no rule, Words used: Key grammar, line 118): "Key grammar. The part of a collective's founding agreement that says how its chain key is held, and the way to rotate that needs less…"
- A-622 (Rule 59, Rule 59. Key grammar, line 751): "A key grammar MUST leave a way to rotate that survives the loss of any one key holder."
- A-628 (Rule 59, Rule 59. Key grammar, line 760): "A grammar without such a way is invalid."
- A-1661 (Rule 61, Rule 61. Every constitutional voice is covered, line 2209): "A founding agreement or clone of a collective that leaves such a party uncovered is invalid, as a key grammar without a way to rotate…"
- A-1945 (no rule, Terms (type 0), key-grammar, line 2646): "a way to rotate that needs less than every member; required when holding 1 names every member"

### R-39. The control model is a cMIP with parameters in terms field 35, deciding which powers acts and clones need

**Relation:** one narrower

- A-109 (no rule, Words used: Control model, line 119): "Control model. A cMIP a collective's terms name, with its parameters (terms field 35), deciding which powers its everyday acts and its clones need beyond…"
- A-1794 (Rule 99, Rule 99. Control models, line 2393): "A collective names its control model in its terms (field 35): a cMIP and its parameters, `[cmip, params]`, as the time reference names its own…"
- A-1913 (no rule, Terms (type 0), field 35, line 2577): "the control model: a cMIP and its parameters (rule 99; only with field 12)"

### R-40. Each layer's rule (terms field 19) says who acts for the collective in that layer

**Relation:** one narrower

- A-110 (no rule, Words used: Layer rule, line 120): "Layer rule. For each of the five layers a collective acts in, who acts for the collective there: a rule in the terms' grammar, written…"
- A-1456 (Rule 98, Rule 98. The last resort, 5, line 1952): "Who acts for a collective in each layer is its layer's rule (field 19, rule 60), save where its control model narrows it for some…"
- A-1607 (Rule 60, Rule 60. Layers: who acts for the collective, line 2131): "A collective's founding names, for each layer a collective acts in (Text, Envelopes, Money, Agreements, Development), who acts for it there: a rule in the…"
- A-1613 (Rule 60, Rule 60. Layers: who acts for the collective: The layers' rules, line 2133): "The layers' rules are terms field 19 ("The layers"), each a rule in the terms' grammar: `[0]` every party whose voice remains, `[1, k]` any…"

### R-41. A collective's constitutional changes, membership included, need the constitutional change rule, every party whose voice remains by default

**Relation:** one narrower

- A-112 (no rule, Words used: Change rules, line 122): "the constitutional change rule (terms field 18; every party when none was agreed), for a constitutional change (rule 98);"
- A-698 (Rule 65, Rule 65. Counting a power, line 863): "the constitutional change rule: among the parent's parties, under the parent's field 18, or every party when the parent has none; a constitutional change rule…"
- A-1106 (Rule 69, Rule 69. Changing members, line 1498): "Membership is constitutional, so the clone needs the constitutional change rule (rule 98): by default, every party whose voice remains at its line."
- A-1231 (Rule 83, Rule 83. Execution, line 1664): "In a collective, a change of seats changes the parties, which is constitutional."
- A-1276 (Rule 91, Rule 91. How a collective ends: four shapes, line 1722): "By default that is every member, a silent member being the abandonment clause's business."
- A-1450 (Rule 98, Rule 98. The last resort, 3, line 1950): "A collective's membership, and its way out, change only under its constitutional change rule (terms field 18), every party whose voice remains when the terms…"
- A-1460 (Rule 98, Rule 98. The last resort, guarantees, line 1956): "membership and the way out change only under the constitutional change rule, every member by default, and a holder paid less signs (rules 48, 69);"

### R-42. A layer's rule decides which cMIPs fill that layer's tasks, and Development's which extensions are adopted

**Relation:** one narrower

- A-113 (no rule, Words used: Change rules, line 123): "the rule of each layer (field 19), for the cMIPs the collective adopts for that layer's tasks;"
- A-1631 (Rule 60, Rule 60. Layers: who acts for the collective: A layer's rule decides what the collective adopts, line 2161): "which cMIP fills each of that layer's tasks, save the judicial tasks. So the members the founding names for Money adopt a new payment cMIP;…"
- A-1632 (Rule 60, Rule 60. Layers: who acts for the collective: A layer's rule decides what the collective adopts, line 2162): "for Development, which extensions the collective adopts."

### R-43. In a deal, every change needs every party: the signing rule and the clone rule are every party, save a terminating act

**Relation:** they differ: 115, 1497, 1910 and 1992 say every party; 1257, 1442, 1499 and 738 say every party whose voice remains

- A-115 (no rule, Words used: Change rules, line 126): "In a deal, the signing rule and the clone rule are every party."
- A-738 (Rule 36, Rule 36. Named by the agreement, line 917): "A deal's keepers change only with every party (rule 47)."
- A-1257 (Rule 83, Rule 83. Execution, line 1694): "In a deal, the clone needs every party whose voice remains (rule 47)."
- A-1442 (Rule 98, Rule 98. The last resort, 1, line 1948): "A deal changes only with every party whose voice remains (rule 47), save a terminating act under its termination rule ("Termination"): by default every party…"
- A-1496 (Rule 67, Rule 67. Protected clauses: the judicial tier, line 1992): "In a deal no clone completes without everyone, so the question never arises."
- A-1497 (Rule 47, Rule 47. A deal changes only with everyone's signature, line 1996): "In a deal, the signing rule and the clone rule are every party (terms fields 4 and 5), save a terminating act under its termination…"
- A-1499 (Rule 47, Rule 47. A deal changes only with everyone's signature, line 1996): "A clone of it completes only when all the parent's parties whose voice remains have signed it."
- A-1910 (no rule, Terms (type 0), field 5, line 2573): "clone rule: every party in a deal; in a collective, read by its control model, a change of it constitutional (rules 98, 99)"
- A-1992 (no rule, Terms (type 0): a deal, line 2734): "A deal (terms without field 12) has every party as its clone rule too."

### R-44. Mark: a clone's field 4 names the parent's change rules it claims to meet and their signers; founding terms' field 4 is a rule, a clone's a mark

**Relation:** one narrower

- A-117 (no rule, Words used: Mark, line 128): "Mark. A clone's terms field 4: which of the parent's change rules it claims to meet, and the parties whose signatures meet it (rules 45,…"
- A-168 (Rule 1, 1. Making an agreement, line 183): "A clone comes into force by its mark (rule 45)."
- A-1909 (no rule, Terms (type 0), field 4, line 2570): "founding terms: the signing rule, which signatures make the agreement exist: every party, in a deal and in a collective a clone: its mark, which…"
- A-1967 (no rule, Terms (type 0), mark, line 2696): "each change rule claimed, and the parties whose signatures meet it; ascending by the power's deterministic encoding, no power twice; each power's signers ascending by…"
- A-1988 (no rule, Terms (type 0): a clone, line 2730): "A clone's field 4 is a mark; founding terms' field 4 is a rule."

### R-45. A holder steps down from an area at once, alone, by a resignation naming the area; it keeps the rest of its voice and its stake

**Relation:** one narrower

- A-120 (no rule, Words used: Area, line 129): "It keeps the way out of one (stepping down at once, rule 71), the freeze of one left with no holder whose voice remains, and…"
- A-132 (no rule, Words used: Voice, line 140): "It loses its voice in one area by stepping down from it (rule 71), or by a constitutional clone that replaces it there."
- A-133 (no rule, Words used: Voice, line 141): "It never loses its stake that way."
- A-1182 (Rule 71, Rule 71. Leaving an area: Stepping down at once, line 1593): "A holder may instead give up an area at once, alone, by a resignation naming that area (type 16, field 1)."
- A-1183 (Rule 71, Rule 71. Leaving an area: Stepping down at once, line 1593): "Whether it counts is read without the control model: a member's step-down from an area id its terms name is registered as any resignation is,…"
- A-1191 (Rule 71, Rule 71. Leaving an area: Stepping down at once, line 1597): "The holder keeps the rest of its voice, and its stake."
- A-2308 (no rule, Resignation (type 16), field 1, line 3179): "stepping down: the area given up, by its id in that agreement ; absent: the whole voice"
- A-2315 (no rule, Resignation (type 16), what it gives up, line 3191): "With field 1, it is a stepping down. It gives up only the signer's place among that area's holders, in that agreement and its descendants,…"

### R-46. An act's layer is that of its MIR, or of the task its cMIP is named for

**Relation:** one narrower

- A-122 (no rule, Words used: Layer, line 131): "An act whose `spec` is a MIR belongs to that MIR's layer."
- A-123 (no rule, Words used: Layer, line 132): "An act whose `spec` is a cMIP belongs to the layer of each task that the collective's agreement in force (rule 72) names that cMIP…"
- A-1625 (Rule 60, Rule 60. Layers: who acts for the collective: What a layer's rule reaches, line 2153): "the MIR's own acts;"

### R-47. An act whose spec is an extension belongs to Development; the extension's specification declares the layers it acts on

**Relation:** one narrower

- A-125 (no rule, Words used: Layer, line 133): "An act whose `spec` is an extension the agreement names (field 15) belongs to Development."
- A-129 (no rule, Words used: Extension, line 137): "Its specification declares the layers it acts on (Development, specification field 10); its own acts belong to Development."
- A-1646 (Rule 60, Rule 60. Layers: who acts for the collective: Extensions, line 2185): "Its specification declares the layers it acts on (Development, specification field 10), so a client knows whose approval to ask."

### R-48. An act whose spec the agreement in force names neither for a task nor as an extension belongs to no layer and counts for nothing

**Relation:** one narrower

- A-126 (no rule, Words used: Layer, line 134): "An act whose `spec` is a specification the agreement in force names neither for a task nor as an extension belongs to no layer, and…"
- A-1634 (Rule 60, Rule 60. Layers: who acts for the collective: Specifications the collective has not adopted, line 2166): "An act for a collective whose `spec` is a specification its agreement in force names neither for a task (field 2) nor as an extension…"

### R-49. An extension adds rules and never relaxes the core

**Relation:** one narrower

- A-128 (no rule, Words used: Extension, line 137): "Extension. A cMIP an agreement names outside the listed tasks (field 15), which adds rules and never relaxes the core's (Development)."
- A-1651 (Rule 60, Rule 60. Layers: who acts for the collective: Extensions, line 2193): "Nothing an extension does relaxes the core (Development rule 20): the MIRs' own acts stay in their own layers, whatever an extension adds around them."
- A-1906 (no rule, Terms (type 0), field 15, line 2566): "extensions: cMIPs outside the listed tasks, which add rules and never relax the core's; in a collective, adopted under its rule for Development"

### R-50. A resignation gives up the signer's voice alone, without anyone's signature; from its line its signature counts toward no rule or area of that agreement or its descendants

**Relation:** one narrower

- A-130 (no rule, Words used: Voice, line 138): "Voice. A party's say in an agreement: it counts toward the agreement's change rules and, in a collective, toward its layer rules and the areas…"
- A-797 (no rule, Made before, made after, item 3, line 1022): "For everything after it, it is gone (rules 70, 71, 65)."
- A-1138 (Rule 70, Rule 70. A member can always leave alone, line 1538): "A party to a collective's agreement gives up its voice by a resignation act (type 16), without anyone else's signature."
- A-1142 (Rule 70, Rule 70. A member can always leave alone, line 1542): "From that line on, the party's signature acts count toward no change rule and no area of that agreement, or of any agreement descending from…"
- A-1713 (Rule 89, Rule 89. Outcomes: Voice removed, line 2283): "Voice removed: the party is no longer counted in any change rule or area of the agreement, or of any agreement descending from it (rule…"
- A-2314 (no rule, Resignation (type 16), what it gives up, line 3190): "Without field 1, it gives up the signer's voice in that agreement and in every agreement descending from it by clones (rule 70)."

### R-51. A resignation, stepping down or declaration removing a voice takes effect for the collective at the line registering it

**Relation:** one narrower

- A-134 (no rule, Words used: Voice, line 143): "In a collective, each takes effect at the collective's line registering it, and keeps that effect whatever its signer's later rotation disowns ("Made before, made…"
- A-795 (no rule, Made before, made after, item 3, line 1022): "A resignation, a stepping down, or a declaration removing a voice takes effect for the collective at the line registering it: a record naming it…"
- A-1139 (Rule 70, Rule 70. A member can always leave alone, line 1540): "The resignation takes effect for the collective at the collective's line registering it (record field 3)."
- A-1188 (Rule 71, Rule 71. Leaving an area: Stepping down at once, line 1597): "The stepping down takes effect for the collective at the collective's line registering it (record field 3)."
- A-1714 (Rule 89, Rule 89. Outcomes: Voice removed, line 2284): "in a collective, from the collective's line registering the declaration, or from the recovery rotation where the declared party is the one who would draw…"
- A-2316 (no rule, Resignation (type 16), line 3193): "It takes effect for the collective's acts at the collective's line registering it (record field 3)."
- A-2364 (no rule, Record (type 17), line 3258): "Each takes effect for the collective's acts at this line ("Made before, made after"), whether or not the record puts its clone in force."
- A-2383 (no rule, Abandonment declaration (type 13), line 3297): "In a collective, at the collective's line registering it (record field 3)."
- A-2384 (no rule, Abandonment declaration (type 13), line 3297): "Or, where the declared party is the one who would draw that line, at the recovery rotation: the rotation that removes the declared party."

### R-52. The collective's chain: the acts naming the collective's identity as chain in objects; a member acts for it with their own key, naming it

**Relation:** one narrower

- A-138 (no rule, Words used: The collective's chain, line 148): "The collective's chain. The acts done for a collective, each naming the collective's identity as chain in `objects` (rule 58)."
- A-583 (Rule 58, Rule 58. Two chains, line 701): "A member acts for the collective with their own key, the act naming the collective in `objects`: the collective's identity as chain, once for each…"
- A-657 (Rule 73, Rule 73. Grants, line 809): "A member acts for the collective with their own key, as themselves, for the collective (rule 58); a signature of a founding or a clone…"
- A-1874 (no rule, Part five: act formats, line 2524): "An act for a collective is signed by a member or a grantee, with their own key, naming the collective on its chain in `objects`…"

### R-53. A member's personal sequences, their prev among them, are never read for the collective

**Relation:** one narrower

- A-139 (no rule, Words used: The collective's chain, line 148): "Its members' own sequences are never read for it."
- A-604 (Rule 58, Rule 58. Two chains, line 725): "A signer's own `prev` is never followed for the collective: a member's sequences are theirs, not the collective's."
- A-769 (no rule, Made before, made after: the collective's line, line 981): "For anything done for a collective, "before" and "after" are judged only on the collective's chain, by what its acts cite, never on a member's…"
- A-827 (no rule, Made before, made after, item 6, line 1064): "A member's personal sequences, their `prev` among them, and which device signed what, are never read for the collective."

### R-54. A record: drawn by any member with their own key, it writes a complete clone and registers departures; it decides nothing by itself

**Relation:** one narrower

- A-140 (no rule, Words used: Record, line 149): "Record. The collective's everyday line (type 17, rule 72), which any member draws with their own key: it writes a complete clone of its agreement…"
- A-1893 (no rule, Part five: act formats, the type table, line 2545): "any member of the collective, with their own key, naming the collective: its everyday line"
- A-2334 (no rule, Record (type 17), line 3224): "Drawn by any member of the collective, with their own key, as an everyday act of theirs."
- A-2340 (no rule, Record (type 17), line 3228): "It decides nothing by itself: its clone counts by the clone's own signatures, its registrations by the acts they name."

### R-55. A line is a record, a rotation of the collective, a fork or a closing

**Relation:** one narrower

- A-141 (no rule, Words used: Line, line 150): "Line. An act of a collective at which an event that changes who may act for it takes effect for its acts: a record (type…"
- A-144 (no rule, Words used: Decisions chain, line 151): "Records, rotations, forks and closings are the lines."
- A-776 (no rule, Made before, made after: the collective's line, line 991): "A line is a record (type 17), a rotation of the collective, a fork or a closing."

### R-56. An act is before a line when the history the line cites holds it; every other act is after it

**Relation:** one narrower

- A-142 (no rule, Words used: Line, line 150): "What was done for the collective counts as made before or after a line by whether the history the line cites holds it ("Made before,…"
- A-148 (no rule, Words used: History, line 153): "An act is before a line when the line's history holds it."
- A-778 (no rule, Made before, made after, item 1, line 993): "An act for the collective counts as made before a line when the line's history holds it."
- A-779 (no rule, Made before, made after, item 1, line 995): "is an act the line names on the collective's chain (a tip);"
- A-780 (no rule, Made before, made after, item 1, line 996): "is reached from there through what those acts name on the collective's chain, the tips of a record so reached, and the signature acts a…"
- A-836 (no rule, Made before, made after, item 7, line 1076): ""Cites" is meant as a line cites: the act lies in the citing act's history."
- A-2510 (no rule, Fork (type 19), the line, line 3454): "An act for the original counts as made before the fork when it lies in the history the fork cites: an act it names on…"
- A-2511 (no rule, Fork (type 19), the line, line 3454): "Every other act for the original counts as made after it."

### R-57. The decisions chain holds genesis, rotations, records, grants and revocations, and fork or closing

**Relation:** same

- A-143 (no rule, Words used: Decisions chain, line 151): "Decisions chain. A collective's decisions, in order: its genesis, its rotations, its records, its grants and revocations, its fork or closing (rule 58)."
- A-588 (Rule 58, Rule 58. Two chains, line 705): "The decisions chain holds its genesis, rotations and records (which write its clones and register who joins and leaves), its grants and revocations, and its…"

### R-58. The actions chain holds every other act done for the collective

**Relation:** one narrower

- A-145 (no rule, Words used: Actions chain, line 152): "Actions chain. Every other act done for a collective (rule 58)."
- A-595 (Rule 58, Rule 58. Two chains, line 713): "The actions chain holds every other act done for the collective: debts, payments, bakes, publications, releases, sales, and its grantees' acts."

### R-59. Tie rule: when a decision ending powers and an action using them cite neither each other, the ending wins

**Relation:** one narrower

- A-149 (no rule, Words used: Tie rule, line 154): "Tie rule. When a decision ending powers and an action using them cite neither each other, the ending wins ("Made before, made after", 7)."
- A-828 (no rule, Made before, made after, item 7, line 1066): "Where a decision ending powers and an action using them cite neither each other, the ending wins: the action is void, or, where the ending…"
- A-829 (no rule, Made before, made after, item 7, line 1066): "A decision ending powers is a fork, a closing, a departure, a grant's revocation, or a departure emptying an area or freezing a layer."
- A-832 (no rule, Made before, made after, item 7, line 1070): "an act under a grant that the line emptying its area does not hold is void (rule 71); one that a revocation of its grant…"
- A-852 (Rule 76, Rule 76. Revocation, line 1103): "An act under the grant that the revocation's history does not hold, racing it (neither citing the other) or after it, is void, the ending…"
- A-884 (Rule 79, Rule 79. Fate of acts, line 1148): "An act under a grant that a decision ending the grant does not hold does not bind the collective: it is void, or, where the…"
- A-897 (Rule 80, Rule 80. Evaluation, line 1166): "no decision ending the grant fails to hold it (rules 71, 76, 91), or, where one does, the grantor adopted it (rule 76)."
- A-1203 (Rule 71, Rule 71. Leaving an area: an area with no holder, line 1611): "One racing it (neither citing the other) is void, the ending winning (the tie rule)."

### R-60. A collective's Money act is done only once sealed to every holder of its stake in itself as well, or public

**Relation:** one narrower

- A-150 (no rule, Words used: Done, line 155): "Done. An act for a collective is done once sealed to every member of the agreement in force for it (or public) and on the…"
- A-559 (Rule 57, Rule 57. An act is done once sealed to every member and on the chain, line 679): "For a collective whose stake in itself has holders who are no members, a Money act for it (a receipt, an obligation, a payout, a…"

### R-61. Done: an act for a collective is sealed to every member (or public) and on its chain citing its latest decision; before that it is planning and binds no one

**Relation:** one narrower

- A-150 (no rule, Words used: Done, line 155): "Done. An act for a collective is done once sealed to every member of the agreement in force for it (or public) and on the…"
- A-550 (Rule 57, Rule 57. An act is done once sealed to every member and on the chain, line 664): "it is sealed to every member: every party of the agreement in force for it is among its recipients (Envelopes, `to`), or the act is…"
- A-551 (Rule 57, Rule 57. An act is done once sealed to every member and on the chain, line 665): "it is on the collective's chain, citing its latest decision as its signer knew it (rule 58)."
- A-552 (Rule 57, Rule 57. An act is done once sealed to every member and on the chain, line 667): "Before that, even signed, it is planning."
- A-553 (Rule 57, Rule 57. An act is done once sealed to every member and on the chain, line 667): "It binds no one, its signer included."
- A-554 (Rule 57, Rule 57. An act is done once sealed to every member and on the chain, line 667): "It counts for nothing in Agreements: signatures on it complete nothing, and an obligation it carries binds no one."
- A-880 (Rule 78, Rule 78. Acknowledgements, line 1144): "That means done: sealed to every member and on the collective's chain (rule 57)."

### R-62. A grant delegates limited authority and never reaches beyond its issuer's power; one reaching beyond is invalid

**Relation:** one narrower

- A-151 (no rule, Words used: Grant, line 159): "Grant. A delegation of authority, with limits, from an identity or collective to another identity, never reaching beyond the power of whoever issued it (rules…"
- A-662 (Rule 73, Rule 73. Grants, line 817): "A grant has scope (fields 1, 6), limits by a cMIP (fields 3, 4), revocation with the tie rule, the grantee's acceptance, and never reaches…"
- A-682 (Rule 74, Rule 74. A grant never reaches beyond its issuer's power, line 842): "A collective's grant is an act of the collective in Agreements, drawn by a member naming the collective, counting under its rule for Agreements (rule…"
- A-691 (Rule 74, Rule 74. A grant never reaches beyond its issuer's power, line 850): "A grant whose field 6 reaches beyond its area, or beyond what its signers could do together, is invalid, a reinstatement aside (rule 71)."
- A-2194 (no rule, Grant (type 9) and revocation (type 10), grant field 6, line 3021): "the acts it reaches; required for a collective's grant, and within the power of its signers (rule 74)"
- A-2198 (no rule, Grant (type 9) and revocation (type 10), line 3035): "A collective's grant is an act for the collective (rule 58), drawn by a member with their own key, naming the collective on its chain…"
- A-2212 (no rule, Grant (type 9) and revocation (type 10), line 3043): "Each kind in field 6 must lie within the area's reach: every act it could reach, as the collective's control model computes it from the…"

### R-63. Grant key: a person's grant names a key scoped to the grant, made and held by the grantee (field 9); a person's grant without it is invalid

**Relation:** one narrower

- A-152 (no rule, Words used: Grant key, line 160): "Grant key. A key of a person, scoped to one grant's reach (Identity's scoped key), named by the grant (field 9), made and held by…"
- A-671 (Rule 73, Rule 73. Grants, line 826): "A person's grant hands its grantee a grant key: a key of the person, scoped to the grant (Identity's scoped key), which the grantee makes…"
- A-2196 (no rule, Grant (type 9) and revocation (type 10), grant field 9, line 3024): "a person's grant only, and then required: the grant key, in Identity's form [ scheme, key ], made and held by the grantee, scoped to…"
- A-2203 (no rule, Grant (type 9) and revocation (type 10), line 3037): "A person's grant carries field 9, the grant key: the public part of a signing key the grantee made and keeps (the grantee makes it,…"
- A-2204 (no rule, Grant (type 9) and revocation (type 10), line 3037): "A person's grant without field 9 is invalid."

### R-64. A release to the public domain ends a work's ownership at once or at a point on the time reference, its key delivered then

**Relation:** one narrower

- A-153 (no rule, Words used: Release to the public domain, line 164): "Release to the public domain. An act ending a work's ownership, at once or at a point it names on the time reference (type 5,…"
- A-1430 (Rule 55, Rule 55. Public domain, line 1918): "It takes effect at once, or at a future point on the time reference, its content key delivered then by an identity the act names."
- A-2236 (no rule, Release (type 5), field 4, line 3077): "a timed release: the point on the time reference, and who delivers the keys then"

### R-65. Each side of a fork first founds its successor, naming the original in 'forked from', a back-link that decides nothing

**Relation:** one narrower

- A-154 (no rule, Words used: Fork of a collective, line 165): "Fork of a collective. The end of a collective whose members split into sides that will not agree, each side founding its successor first (type…"
- A-1274 (Rule 91, Rule 91. How a collective ends: four shapes, line 1720): "Each side first founds its successor: a new collective (its own genesis and keys) whose founding terms have that side's members as parties and name…"
- A-1927 (no rule, Terms (type 0), field 23, line 2600): "forked from: in the founding terms of a fork's successor, the original collective, a back-link (rule 91; only with field 12)"
- A-2032 (no rule, Terms (type 0): forked from, line 2788): "Forked from (field 23) appears only in the founding terms of a collective (with field 12, without field 11)."
- A-2034 (no rule, Terms (type 0): forked from, line 2788): "It is a back-link for readers and decides nothing: the fork act names its successors (rule 91)."

### R-66. Closing ends a collective that holds nothing and owes nothing; it cannot close while it owes anything

**Relation:** one narrower

- A-156 (no rule, Words used: Closing, line 166): "Closing. The end of a collective that holds nothing and owes nothing (type 20, rule 91)."
- A-1316 (Rule 91, Rule 91. How a collective ends: four shapes, line 1749): "A closing act (type 20), signed under the constitutional change rule like the fork act, and counted by share at its line where that rule…"
- A-1318 (Rule 91, Rule 91. How a collective ends: four shapes, line 1749): "A collective cannot close while it owes anything: one that cannot pay stays open, abandoned, its debts visible, until each is paid or its creditor…"
- A-1332 (Rule 92, Rule 92. The creditor's release, line 1768): "A closing checks that every debt is paid or released (rule 91, D)."
- A-2541 (no rule, Closing (type 20), complete when, line 3500): "the collective holds nothing: no stake of a latest version of an agreement a verifier holds names it as a holder, after the complete transfers…"
- A-2542 (no rule, Closing (type 20), complete when, line 3501): "the collective owes nothing: every obligation that binds it and lies before its line, that is, in the history it cites (one outside it is…"
- A-2559 (no rule, Closing (type 20), an absentee's money share, line 3513): "the closing counts only when the collective holds nothing (above);"

### R-67. Termination reaches the future only: what was owed or placed before stands, payments received before are split and paid

**Relation:** one narrower

- A-157 (no rule, Words used: Termination, line 167): "Termination. The agreed way out: one side ending, for the future, an agreement or a party's place in it, by a terminating act under the…"
- A-313 (Rule 11, Rule 11. Publications, accepted by payment, line 375): "A replaced service withdraws its tags (Money rule 18) and still owes payouts on everything it received (rule 31)."
- A-504 (no rule, Termination: active and terminated, line 591): "Termination reaches the future only."
- A-505 (no rule, Termination: active and terminated, line 591): "Every obligation owed before it stays owed and every act placed before it stands; every payment received before it is split and paid as the…"
- A-1073 (Rule 31, Rule 31. Switching services, line 1446): "The old service withdraws its tags (Money rule 18), and the new one signs its own."

### R-68. The way out (resignation, stepping down, succession, absence, fork or closing, rollback, transfer, release) is judged by this MIR alone, whatever the control model

**Relation:** one narrower

- A-158 (no rule, Words used: Termination, line 167): "The way out no term reaches is another thing: a member's resignation, a holder's transfer of its own share, a release, a fork or closing,…"
- A-1466 (Rule 98, Rule 98. The last resort, model not held, line 1964): "A collective whose control model's cMIP a verifier does not hold is judged under the constitutional rule alone for its way out."
- A-1467 (Rule 98, Rule 98. The last resort, model not held, line 1964): "The way out is a resignation (rule 70) and a stepping down (rule 71), a succession executed under a plan (rule 83), a declaration of…"
- A-1857 (Rule 99, Rule 99. Control models, line 2474): "Its default is its own: a collective naming no control model is judged by its constitutional rule alone (rule 98), and every way out is…"

### R-69. Where a verifier cannot tell whether a terminating act counts, the state is unknown, never active by default

**Relation:** one narrower

- A-159 (no rule, Words used: Active, terminated, line 168): "Active, terminated. The core's only two states of an agreement, and of a party's place in it, unknown where a verifier cannot tell ("Termination")."
- A-496 (no rule, Termination: active and terminated, line 585): "Where a verifier cannot tell whether a terminating act counts, the agreement's or the place's state is unknown from that act on, never active by…"
- A-518 (no rule, Termination: active and terminated, line 599): "A client that does not hold the termination terms' cMIP shows the agreement's state, or the place's, as unknown from the terminating act on."
- A-1790 (no rule, The tasks, one by one, line 2386): "A verifier that does not hold the cMIP answers unknown for the terminating act, and the agreement's or the place's state is unknown from it…"

### R-70. Termination moves no stake: a terminated party keeps what it holds and is owed

**Relation:** one narrower

- A-160 (no rule, Words used: Active, terminated, line 168): "A terminated place moves no stake: a party whose place is terminated keeps what it holds and is owed (rule 98.2)."
- A-506 (no rule, Termination: active and terminated, line 591): "Termination moves no stake and changes no holder (rule 98.2): a terminated party keeps what it holds and what it is owed, and its signatures…"

### R-71. A deal has no closing act: it is terminated or wound down by a clone every party signs, stating its new conditions

**Relation:** one narrower

- A-162 (no rule, Words used: A deal's end, line 170): "A deal's end. A deal has no closing act: it is terminated, or winds down, by a clone every party signs, terminating only where it…"
- A-509 (no rule, Termination: active and terminated, line 593): "A deal: every party whose voice remains, by the clone of rule 47; each party's own way out is its transfer."
- A-936 (Rule 15, Rule 15. One ownership, many publications: money passes layer by layer, line 1213): "A deal ends, or winds down, by a clone every party signs (rule 47), a terminating act where it carries the termination mark, counting only…"
- A-1511 (Rule 47, Rule 47: Termination, line 2011): "A deal is terminated, or winds down, by such a clone ("Termination")."
- A-1512 (Rule 47, Rule 47: Termination, line 2011): "A deal has no closing act."
- A-1513 (Rule 47, Rule 47: Termination, line 2011): "Its parties terminate it, or wind it down, by a clone every party signs, stating its new conditions: where its shares went, and what is…"

### R-72. Creditor's release: a Money act by which the creditor alone ends an obligation without full payment

**Relation:** one narrower

- A-163 (no rule, Words used: Creditor's release, line 171): "Creditor's release. An act by which a creditor ends an obligation owed to it without full payment (Money type 4; rule 92)."
- A-1322 (Rule 92, Rule 92. The creditor's release, line 1755): "The creditor's release is a Money act."
- A-1323 (Rule 92, Rule 92. The creditor's release, line 1755): "A creditor may end an obligation owed to it without full payment by a creditor's release (Money type 4), for instance against stakes or a…"
- A-1324 (Rule 92, Rule 92. The creditor's release, line 1757): "Only the creditor signs it."
- A-1325 (Rule 92, Rule 92. The creditor's release, line 1757): "No rule, majority or court can discharge a debt for it, and a release signed by anyone else ends nothing."
- A-1897 (no rule, Part five: act formats, the type table, line 2549): "*Retired*: the creditor's release is a Money act, Money type 4 (rule 92); never reused"

### R-73. Founding terms, a deal's and a collective's alike, exist once every party has signed them

**Relation:** one narrower

- A-166 (Rule 1, 1. Making an agreement, line 183): "Founding terms exist once every party has signed them."
- A-167 (Rule 1, 1. Making an agreement, line 183): "This holds in a deal and in a collective's founding agreement alike: their signing rule (field 4) is every party."
- A-1498 (Rule 47, Rule 47. A deal changes only with everyone's signature, line 1996): "A deal exists when all its parties have signed it."
- A-1990 (no rule, Terms (type 0): founding terms, line 2732): "Founding terms exist only when every party has signed them, a deal's and a collective's alike."

### R-74. Every agreement carries at most one cMIP per task

**Relation:** one narrower

- A-172 (Rule 2, 1. Making an agreement, line 189): "Every agreement carries the hashes of the cMIPs it uses, at most one per task."
- A-1905 (no rule, Terms (type 0), field 2, line 2564): "cMIPs, at most one per task (task number => cMIP hash); empty if it uses no task; never task 8 in an ownership agreement (the…"
- A-2076 (no rule, Publication (type 6), field 9, line 2845): "cMIPs, at most one per task (task number => cMIP hash): its payment cMIP (task 6), its split cMIP (task 8), and others; a judge…"

### R-75. A client must not sign terms naming a cMIP (termination terms, absence proof, any task) it does not implement

**Relation:** one narrower

- A-175 (Rule 2, 1. Making an agreement, line 191): "A client that does not implement all of them cannot sign it."
- A-515 (no rule, Termination: active and terminated, line 599): "A client MUST NOT sign terms naming a termination-terms cMIP it does not implement."
- A-1781 (no rule, The tasks, one by one, line 2382): "A client MUST NOT sign terms naming an absence-proof cMIP it does not implement, as for an unknown extension."
- A-1792 (no rule, The tasks, one by one, line 2386): "A client MUST NOT sign terms naming a termination-terms cMIP it does not implement."

### R-76. While a deal is forked, the version before the split is the reference

**Relation:** one narrower

- A-188 (Rule 6, 1. Making an agreement, line 223): "the version before the split is the reference;"
- A-1524 (Rule 47, Rule 47: The reference, line 2021): "The reference. While the deal has two branches, the version before the split is the reference."

### R-77. Deal forks: a new act may follow either branch and counts

**Relation:** same

- A-189 (Rule 6, 1. Making an agreement, line 224): "a new act may follow either branch;"
- A-1526 (Rule 47, Rule 47: Acts on either branch, line 2023): "Acts on either branch. A new act may follow either branch, and counts."

### R-78. A tangled fork stays on its reference

**Relation:** same

- A-190 (Rule 6, 1. Making an agreement, line 225): "a tangled fork stays on the reference;"
- A-1578 (Rule 47, Rule 47: A tangled fork stays on its reference, line 2086): "A tangled fork stays on its reference."

### R-79. A settlement is final for everything its signers could see

**Relation:** one narrower

- A-191 (Rule 6, 1. Making an agreement, line 226): "a settlement settles it, final for everything its signers could see."
- A-1550 (Rule 47, Rule 47: Finality, line 2047): "Finality. A settlement that counts is final for everything its signers could see, and nothing they could not see reopens it."
- A-1594 (Rule 47, Rule 47: The judge of forks, line 2098): "It is final as a settling version is, for what it could see, and counts only where it names every tip it saw."

### R-80. A settling version names every tip it drops and is signed by the parties of every branch

**Relation:** one narrower

- A-192 (Rule 6, 1. Making an agreement, line 230): "a version naming every tip it drops;"
- A-1531 (Rule 47, Rule 47: The settling version, line 2027): "The settling version. The parties settle the fork by one version that names every tip it drops, signed by the parties of every branch."
- A-1539 (Rule 47, Rule 47: The settling version, line 2035): "It is signed by the parties of all the branches involved."
- A-1929 (no rule, Terms (type 0), field 26, line 2606): "settles: in a deal's clone only, every tip of the deal's fork this version discards, that is, the latest version of each other branch, beside…"

### R-81. The judge of forks the reference names, or the link of its chain that took over, settles on a party's request

**Relation:** one narrower

- A-193 (Rule 6, 1. Making an agreement, line 231): "or the judge of forks the reference names, or the link of its chain of judgment that took over, on a party's request."
- A-1591 (Rule 47, Rule 47: The judge of forks, line 2096): "The judge of forks acts only once activated by one of the signing parties: a settlement request (type 22), signed by a party who signed…"
- A-1899 (no rule, Part five: act formats, the type table, line 2551): "the judge of forks a deal's reference version names (field 27), or the link of its chain of judgment that took over (field 21), once…"

### R-82. An act disowned or disputed under rotation rules, or not held by a grant's revocation, confers nothing on an agreement chain

**Relation:** one narrower

- A-194 (Rule 6, 1. Making an agreement, line 233): "An act on an agreement chain that is void or disputed under Identity's rotation rules, or disputed under rule 76 as an act a grant's…"
- A-857 (Rule 76, Rule 76. Revocation, line 1110): "What such a disputed act confers: nothing, unless adopted."
- A-858 (Rule 76, Rule 76. Revocation, line 1110): "As an act a rotation disowned (rule 6), an act a revocation's history does not hold, shown disputed, confers nothing on an agreement chain (no…"

### R-83. What a collective's line placed stays placed for that collective, whatever the signer's later rotation disowns, shown as a dispute

**Relation:** one narrower

- A-195 (Rule 6, 1. Making an agreement, line 235): "What a collective's line placed stays placed for that collective."
- A-196 (Rule 6, 1. Making an agreement, line 235): "A member's signature act that a collective placed before its line registering that member's rotation, and every act of another identity that a line of…"
- A-808 (no rule, Made before, made after, item 4, line 1034): "An act or signature act of that member made with the key the rotation replaced, and placed before that line, stays valid for the collective,…"
- A-809 (no rule, Made before, made after, item 4, line 1034): "Its status under Identity is unchanged, and every client shows that status."
- A-812 (no rule, Made before, made after, item 4, line 1044): "An act of another identity that a line of the collective (a record, a rotation, a rollback) names, registers, or relies on to count what…"
- A-820 (no rule, Made before, made after, item 4, line 1054): "Its status under Identity is unchanged, and every client shows it as a dispute on the line."
- A-821 (no rule, Made before, made after, item 4, line 1054): "The line is the collective's own act (Identity rule 34's "disowned but relied on"; "what others relied on stands"), so the record stays a line,…"
- A-1698 (Rule 87, Rule 87. Declaration, line 2255): "A later rotation is such an act: the declaration, its completing signatures and the signatures its field 1 is checked against keep, for the collective,…"
- A-2391 (no rule, Abandonment declaration (type 13), line 3308): "it is valid under Identity, or, registered by a line of a collective, valid as that line placed it (below);"
- A-2456 (no rule, Collectives in the identity chain, the rare cases: a recovery rotation and a rollback, line 3380): "Each act a rotation's declaration names, a recovery rotation's and a rollback's included, is judged as placed at that rotation ("Made before, made after", 4):…"

### R-84. A deal's version, once relied on, stays complete for everyone

**Relation:** one narrower

- A-197 (Rule 6, 1. Making an agreement, line 237): "A deal's version, once relied on, stays complete, as rule 47 says, the disowned signature shown as a dispute."
- A-847 (no rule, Made before, made after: the collective's line, line 1093): "What others relied on stays complete before any declaration's line."
- A-848 (no rule, Made before, made after: the collective's line, line 1093): "A declaration's line decides only what no relied-on version holds: a version of the deal that a party's or keeper's later act relies on (rule…"
- A-1502 (Rule 47, Rule 47: What others relied on stands, line 2000): "What others relied on stands: a version relied on stays complete."
- A-1504 (Rule 47, Rule 47: What others relied on stands, line 2000): "Instead, once any party's or keeper's later act relies on a complete version, the version keeps its completeness for everyone, whatever a signer's later rotation…"
- A-2067 (no rule, Signature (type 1), line 2827): "A signature counts only while it is valid under Identity's rules, save what a collective's line placed (rule 6; "Made before, made after", 4) and…"

### R-85. A claim by several creators is completed by the others' signature acts; it counts only public or addressed to every creator, and names no roles

**Relation:** one narrower

- A-200 (Rule 7, 2. Claims, stakes and transfers, line 246): "several creators, by one creator's claim completed by signature acts from all the others, and bound only when all are present."
- A-208 (Rule 7, 2. Claims, stakes and transfers, line 254): "A claim counts only public or addressed to every creator it names."
- A-209 (Rule 7, 2. Claims, stakes and transfers, line 254): "It names no roles."
- A-1879 (no rule, Part five: act formats, the type table, line 2531): "a sole creator; or one creator, who opens it, completed by the other creators' signature acts; a collective's, signed by a member for it (rule…"
- A-2123 (no rule, Claim (type 3), line 2910): "It is bound, counts and carries no roles as rule 7 says."

### R-86. A claim cMIP may carry a commitment made before upload

**Relation:** one narrower

- A-204 (Rule 7, 2. Claims, stakes and transfers, line 250): "Order is not evidence of authorship; a claim cMIP MAY carry a commitment made before upload."
- A-1786 (no rule, The tasks, one by one, line 2385): "A cMIP MAY define commitments made before upload, carried by a claim."
- A-2120 (no rule, Claim (type 3), field 2, line 2904): "a claim cMIP and what it produces (a commitment made before upload)"

### R-87. Conflicting claims not ordered by anchor or keeper stay openly contested

**Relation:** one narrower

- A-206 (Rule 7, 2. Claims, stakes and transfers, line 252): "Otherwise they remain openly contested."
- A-1439 (Rule 55, Rule 55. Public domain, line 1932): "A claim the release does not name in its history is shown beside it: made after it, or a competing claim, openly contested (rule 7),…"

### R-88. A work's ownership agreement targets the work's claim, [0, claim], and is a deal

**Relation:** one narrower

- A-210 (Rule 7, 2. Claims, stakes and transfers, line 256): "A work's ownership agreement is an ownership agreement whose target is the work's claim (terms field 33, `[0, claim]`)."
- A-1935 (no rule, Terms (type 0), target, line 2618): "a work's ownership agreement: the work's claim (type 3), by its act id"
- A-2015 (no rule, Terms (type 0): the target, line 2768): "A work's ownership agreement (`[0, claim]`) is a deal: terms carrying it and field 12, 18, 19, 22, 23 or 35 are invalid."

### R-89. Where no ownership agreement targets a claim, its opener is the default holder

**Relation:** one narrower

- A-212 (Rule 7, 2. Claims, stakes and transfers, line 256): "Where no ownership agreement targets the claim, the default holder is the creator who opened the claim."
- A-2124 (no rule, Claim (type 3), line 2910): "Where no ownership agreement targets it, the default holder is the creator who opened it, the collective for a collective's claim."

### R-90. The owners' shares are the same in every publication, read by reference, never copied

**Relation:** one narrower

- A-216 (Rule 7, 2. Claims, stakes and transfers, line 258): "How the work is sold, at what price, with which partners and who takes what, is a publication's (rule 11), and one work may have…"
- A-361 (Rule 12, Rule 12. A purchase names a publication's price tag, line 422): "The owners' shares are read by reference, from one named version."
- A-913 (Rule 15, Rule 15. One ownership, many publications: money passes layer by layer, line 1192): "The owners' shares are the same in all: every publication reads them from the ownership agreement it names (rule 12), never copies them."

### R-91. The parts' owners take part in a manifest through its ownership agreement holding the parts' agreements

**Relation:** one narrower

- A-219 (Rule 7, 2. Claims, stakes and transfers, line 260): "The parts' owners take part in it by agreement: the manifest's ownership agreement has the parts' ownership agreements among its holders (rule 15)."
- A-921 (Rule 15, Rule 15. One ownership, many publications: money passes layer by layer, line 1200): "An owner that is another ownership agreement (a manifest's parts, rule 7) is paid through it: the split service divides that owner's part among that…"

### R-92. A stake moves, shrinks or is paid less only with its holder, save succession, absence outcomes and an issuance under a rule the holder accepted

**Relation:** they differ: 1078 and 1443 list three advance permissions (succession, absence outcomes, issuance); 1079 says the only ones that move a stake without its holder are rule 89's

- A-220 (Rule 8, 2. Claims, stakes and transfers, line 264): "Any act that changes the size of a share of a stake requires its holder's signature."
- A-224 (Rule 8, 2. Claims, stakes and transfers, line 268): "A signature on an agreement is consent to everything it defines, including pre-authorised changes such as abandonment outcomes."
- A-461 (Rule 14, Rule 14. A sale is tied to the seller's ownership agreement, not to the work's claim alone, line 534): "From its founding version on, the stake moves as any stake moves: by its holder's transfer (rule 10), by succession (rule 89), or by a…"
- A-1078 (Rule 48, Rule 48. No stake reduced without its holder, line 1462): "A clone can never reduce a stake without its holder's signature, unless the agreement pre-authorised it, and the only advance permissions are those rule 98…"
- A-1079 (Rule 48, Rule 48. No stake reduced without its holder, line 1464): "A stake moved by succession is not a reduction, and the only advance permissions that move a stake without its holder are rule 89's: a…"
- A-1443 (Rule 98, Rule 98. The last resort, 2, line 1949): "A stake moves, shrinks or is paid less only with its holder, save by succession, the declaration of absence's two outcomes, and an issuance as…"

### R-93. An issuance is a reduction of every holder's share, counting only as rule 48 lets a stake shrink

**Relation:** one narrower

- A-221 (Rule 8, 2. Claims, stakes and transfers, line 266): "An issuance is such an act: new holders added to a stake, every existing holder's share scaled by the same factor, a reduction of every…"
- A-1094 (Rule 48, Rule 48. No stake reduced without its holder, line 1476): "A share added within a stake by an issuance its collective's control model allows, under a rule each holder it binds accepted (rule 8), is…"
- A-1445 (Rule 98, Rule 98. The last resort, 2, line 1949): "An issuance of a stake is a reduction of every holder's share, and counts only as rule 48 lets a stake shrink: each holder signs…"

### R-94. Field 7 changes only by a placed transfer, a succession, an absence outcome or an issuance; any other change is a false mark

**Relation:** one narrower

- A-222 (Rule 8, 2. Claims, stakes and transfers, line 266): "Field 7 changes only as rule 98.2 says, any other change of it a false mark (rule 46)."
- A-1447 (Rule 98, Rule 98. The last resort, 2, line 1949): "Placed by the collective's line, it changes field 7; a change of field 7 by any other act than a placed transfer (rule 10), a…"
- A-1472 (Rule 98, Rule 98. The last resort, model not held, line 1964): "Field 7 is read, for the way out and a rollback, as the latest constitutional clone's, updated by the placed acts since (rule 98.2): the…"

### R-95. Shares are in millionths summing to 1,000,000, holders distinct, leftovers by largest remainder

**Relation:** one narrower

- A-226 (Rule 9, 2. Claims, stakes and transfers, line 272): "Shares are written in millionths, summing to 1,000,000."
- A-227 (Rule 9, 2. Claims, stakes and transfers, line 274): "Leftover units from dividing the owners' line go one each to the holders whose exact shares have the largest fractional remainders."
- A-1938 (no rule, Terms (type 0), owners, line 2622): "the one stake, on the target, index 0: holders distinct, each share above zero, summing to 1,000,000; leftovers by largest remainder, the order of holders…"
- A-2027 (no rule, Terms (type 0): the stake, line 2784): "Its holders are distinct, each share above zero, the shares summing to 1,000,000 (rule 9)."

### R-96. The order in which holders are listed decides nothing in a payout, save the fork's division among members counted alike

**Relation:** one narrower

- A-232 (Rule 9, 2. Claims, stakes and transfers, line 280): "The order in which holders are listed decides nothing in a payout (a fork's division, below, is none)."
- A-248 (Rule 9, 2. Claims, stakes and transfers, line 304): "Among members counted alike, it gives leftovers to the first as listed in the agreement in force, an order every member signed."
- A-2509 (no rule, Fork (type 19), line 3452): "With no stakes written, a member who signs no side keeps each member's equal share, leftovers to the first (rule 9)."

### R-97. Each split carries the running count of leftover units per holder (split key 4)

**Relation:** one narrower

- A-233 (Rule 9, 2. Claims, stakes and transfers, line 282): "Each receipt of a split service carries, per stake, the running count of leftover units each holder has received, and cites the service's previous receipt…"
- A-235 (Rule 9, 2. Claims, stakes and transfers, line 284): "The count is split key 4, `[+ [ stake, [+ [ holder, count ]] ]]`: the count after this split, a holder not named counting…"
- A-2159 (no rule, Split plan and split (type 8), split key 4, line 2966): "the running count of leftover units (rule 9)"

### R-98. A split service delivers splits to holders and partners it pays

**Relation:** they differ: 238 delivers every split dividing the stake to every holder of it, paid or not; 984, 1884 and 2187 to every holder and partner it pays

- A-238 (Rule 9, 2. Claims, stakes and transfers, line 289): "The split service delivers every split that divides the stake to every holder of it, paid or not (client conformance); a split whose owners' line…"
- A-984 (Rule 20, Rule 20. Sign a split, line 1302): "It delivers the split to every holder and partner it pays, departed or not, and names each fee and who received it ("Split plan and…"
- A-1884 (no rule, Part five: act formats, the type table, line 2536): "the split service, with its own key; delivered to every holder and partner it pays"
- A-2187 (no rule, Split plan and split (type 8), line 3009): "A split is delivered to every holder and partner it pays: each receiver of a payout is among its recipients (Envelopes, `to`), unless the split…"
- A-2188 (no rule, Split plan and split (type 8), line 3009): "Every fee it takes is a payout naming its module and its receiver."

### R-99. While forked, each split is judged under the version its receipt names, turns kept per branch

**Relation:** one narrower

- A-249 (Rule 9, 2. Claims, stakes and transfers, line 306): "While an ownership agreement stands forked, the turns stay per branch."
- A-250 (Rule 9, 2. Claims, stakes and transfers, line 306): "Each split is judged under the version its receipt names, and its stake's holders there take their turns along that branch's receipts."
- A-1527 (Rule 47, Rule 47: Acts on either branch, line 2023): "A payment, a split, a sale or a release naming a version of a branch is judged under that branch's latest version."

### R-100. Splits are numbered from 1 in one numbering across every split the service makes under the publication

**Relation:** one narrower

- A-251 (Rule 9, 2. Claims, stakes and transfers, line 308): "One numbering runs across every split the service makes under the publication, for any version of the ownership agreement."
- A-252 (Rule 9, 2. Claims, stakes and transfers, line 308): "Each split shows its number (split key 5), from 1, each one more than the service's split under the publication before it."
- A-2160 (no rule, Split plan and split (type 8), split key 5, line 2967): "its number: one numbering across every split the service makes under the publication, from 1"

### R-101. A share is sold by a transfer signed by the seller (with a chain signature fixing its place) and completed by the buyer's signature, naming the agreement as [agreement, agreement]

**Relation:** one narrower

- A-257 (Rule 10, 2. Claims, stakes and transfers, line 318): "By default, a share of a stake is sold or given by a transfer signed by the seller and completed by the buyer's signature."
- A-1880 (no rule, Part five: act formats, the type table, line 2532): "the seller, who also signs it by a chain signature (Identity type 16), which fixes its place on the seller's own line; completed by the…"
- A-2130 (no rule, Stake transfer (type 4), line 2924): "Its `objects` name the agreement as `[agreement, agreement]`, never a fork."
- A-2131 (no rule, Stake transfer (type 4), line 2926): "It takes effect once the seller's chain signature names it and the buyer's signature act completes it (rule 10), where it fits what the seller…"

### R-102. For a consent of a collective's holders, a transfer counts only where the collective's line placed it

**Relation:** one narrower

- A-259 (Rule 10, 2. Claims, stakes and transfers, line 320): "For a consent the holders of a collective's stake give, a transfer counts only where the collective's line placed it (rule 65): an act of…"
- A-2135 (no rule, Stake transfer (type 4), line 2928): "For a consent of a collective's holders, a transfer counts only where the collective's line placed it (rule 10)."

### R-103. A buyer is bound by the rules of the version in force where its transfer was placed, never the stale version it names

**Relation:** one narrower

- A-262 (Rule 10, 2. Claims, stakes and transfers, line 320): "The buyer accepts the rules binding the stake's holders in the version in force at the placement (rule 98), never in the version the transfer…"
- A-1097 (Rule 48, Rule 48. No stake reduced without its holder, line 1484): "A buyer is bound by the rules it bought under."
- A-1098 (Rule 48, Rule 48. No stake reduced without its holder, line 1484): "It bought under the rules binding the stake's holders in the version in force when the collective's line placed its transfer (rule 10), never the…"
- A-1100 (Rule 48, Rule 48. No stake reduced without its holder, line 1484): ""Made after" is read against the collective's line: a change put in force after the version the transfer names and before the line placed the…"

### R-104. A chain signature's placing stands once the act it placed is complete; no later rotation or escape voids it

**Relation:** one narrower

- A-268 (Rule 10, 2. Claims, stakes and transfers, line 326): "A chain signature's placing stands for the act it placed once that act is complete (a transfer both signatures placed; an ending complete, rule 91;…"
- A-1279 (Rule 91, Rule 91. How a collective ends: four shapes, line 1722): "Owners who are no members consent as members do, by a chain signature (Identity type 16) with their own chain key naming the ending, judged…"
- A-1295 (Rule 91, Rule 91. How a collective ends: four shapes, line 1732): "The successor collective signs for each debt assigned to it, by its own chain signature on the fork (Identity type 16), so members are never…"

### R-105. A payout to the seller for a share sold is owed to the buyer, as the service's open obligation

**Relation:** one narrower

- A-271 (Rule 10, 2. Claims, stakes and transfers, line 328): "That payout is owed to the buyer, in the share sold, as the split service's open obligation (rule 30), the service settling with the seller."
- A-280 (Rule 10, 2. Claims, stakes and transfers, line 338): "From its first split citing the transfer (split key 8), every payout to the seller for that share is the service's debt to the buyer,…"

### R-106. A transfer sells at most what the seller still holds on its own line, the stake followed across versions as one

**Relation:** one narrower

- A-285 (Rule 10, 2. Claims, stakes and transfers, line 344): "A share sold twice is settled on the seller's own line:"
- A-290 (Rule 10, 2. Claims, stakes and transfers, line 351): "What the seller still held is its share in the version the transfer names, less each transfer of the same stake (across the lineage) placed…"
- A-2128 (no rule, Stake transfer (type 4), field 3, line 2919): "how much, in millionths of the stake: above zero, at most what the seller still holds at its place on its own line"
- A-2136 (no rule, Stake transfer (type 4), line 2930): "Across versions, the stake is followed as the agreement's one stake."

### R-107. The payment for a transfer is a receipt or claim fulfilling it, or one its field 4 names

**Relation:** one narrower

- A-292 (Rule 10, 2. Claims, stakes and transfers, line 353): "The payment for a transfer is a Money receipt or claim fulfilling it (the receipt's field 5, the claim's field 4), or one the transfer's…"
- A-2129 (no rule, Stake transfer (type 4), field 4, line 2920): "what the seller took for it: a payment made before it; read only to find what an over-sale owes back"
- A-2137 (no rule, Stake transfer (type 4), line 2930): "A payment for it fulfils it (the receipt's field 5, the claim's field 4) or is named in its field 4."

### R-108. A publication counts and sells once every party has signed it

**Relation:** one narrower

- A-300 (Rule 11, Rule 11. Publications, accepted by payment, line 369): "It counts, and sells, once every party has signed it ("Publication (type 6)")."
- A-2093 (no rule, Publication (type 6): it counts, line 2875): "every party of it has signed it: its drafter by drafting it, each other party by a signature act naming it (type 1), an agreement…"

### R-109. A lone seller's publication, naming no ownership agreement, has its drafter as owners' side and sells what it owns alone or an unclaimed vow

**Relation:** one narrower

- A-302 (Rule 11, Rule 11. Publications, accepted by payment, line 371): "A lone seller's publication, naming no ownership agreement, has its drafter as its owners' side: its owners' line is its drafter's."
- A-303 (Rule 11, Rule 11. Publications, accepted by payment, line 371): "It sells what its drafter owns alone, or a vow no ownership agreement claims, whoever signed the vow (rule 14, "A vow has an owner:…"
- A-455 (Rule 14, Rule 14. A sale is tied to the seller's ownership agreement, not to the work's claim alone, line 528): "A lone seller's publication is under none."
- A-459 (Rule 14, Rule 14. A sale is tied to the seller's ownership agreement, not to the work's claim alone, line 530): "A publication selling a vow that no ownership agreement claims is read as a lone seller's, whoever signed the vow (rule 11)."
- A-2069 (no rule, Publication (type 6), field 1, line 2835): "the owners: the ownership agreement whose holders take the owners' line, by its founding version, its line read (rule 12); absent: its drafter, as the…"
- A-2099 (no rule, Publication (type 6): a vow, line 2883): "A publication naming a vow (`[ 3, vow ]`) sells it with its words, under the ownership agreement it names, or, naming none, as its…"

### R-110. A publication's later version is signed by every party of that version, save a terminating act

**Relation:** one narrower

- A-306 (Rule 11, Rule 11. Publications, accepted by payment, line 373): "A publication changes by versions on its own chain, each a later version signed by every party of that version, save a terminating act (below;…"
- A-2096 (no rule, Publication (type 6): it counts, line 2878): "a later version is signed by the same parties' consent, every party of that version, save a terminating act (rule 11; "Termination": by default the…"

### R-111. By default the owners' side alone terminates the publication or another party's place; a party newly named signs to accept; every other change needs every party

**Relation:** one narrower

- A-310 (Rule 11, Rule 11. Publications, accepted by payment, line 375): "By default its owners' side, under its own rule, terminates alone the publication, by a version that sells nothing (its ending), or another party's place,…"
- A-311 (Rule 11, Rule 11. Publications, accepted by payment, line 375): "Every other version needs every party."
- A-320 (Rule 11, Rule 11. Publications, accepted by payment, line 379): "A publication's ending is a terminating act its owners' side signs alone by default, so no partner and no service ends a publication alone."
- A-498 (no rule, Termination: active and terminated, line 587): "A party the terminating version newly names in a terminated party's place signs it to accept."
- A-508 (no rule, Termination: active and terminated, line 593): "A publication: its owners' side, under its own rule, terminates alone the publication, or any other party's place in it (its split service, a backup,…"
- A-1072 (Rule 31, Rule 31. Switching services, line 1446): "The parties switch services by a terminating act of the old service's place, a version naming another split service (field 3), the new service signing…"

### R-112. A publication is ended by a later version that sells nothing (field 0 empty)

**Relation:** one narrower

- A-315 (Rule 11, Rule 11. Publications, accepted by payment, line 377): "A publication is ended by a later version that sells nothing (field 0 empty), a terminating act (above)."
- A-2068 (no rule, Publication (type 6), field 0, line 2833): "what it sells, ascending by deterministic encoding, none twice; empty only in a later version, which ends the publication; absent in every version of a…"
- A-2116 (no rule, Publication (type 6): a split agreement, line 2895): "Field 0 is the same in kind across a line: a later version of a publication that sells (field 0 present) carrying no field 0…"

### R-113. Past sales stand

**Relation:** same

- A-316 (Rule 11, Rule 11. Publications, accepted by payment, line 377): "Past sales stand."
- A-377 (Rule 12, Rule 12. A purchase names a publication's price tag, line 432): "Past sales stand."

### R-114. A payment racing a publication's ending: on a push rail the service settles it on its own chain; one after the ending is owed back

**Relation:** one narrower

- A-317 (Rule 11, Rule 11. Publications, accepted by payment, line 377): "A payment racing the ending (on a push rail, one its split service receipts after its own signature on the version ending it, or after…"
- A-371 (Rule 12, Rule 12. A purchase names a publication's price tag, line 430): "On a push rail, the split service settles it on its own chain: a receipt it records before its own signature on the version ending…"
- A-1067 (Rule 30, Rule 30. Open obligations, line 1435): "every payment racing the publication's ending, owed back to its payer, from what the service holds of it (rule 11)."

### R-115. Each holder paid on a line owes back its own payout of a payment owed back

**Relation:** one narrower

- A-318 (Rule 11, Rule 11. Publications, accepted by payment, line 377): "Where the owners' side is an ownership agreement, each holder paid on its line owes back their own payout: what the agreement received is what…"
- A-1068 (Rule 30, Rule 30. Open obligations, line 1439): "past what the service holds, what a party received of a payment owed back, of that party, in the share it received (rule 11); where…"

### R-116. A payment naming no payer is a gift: nothing is owed back on it

**Relation:** one narrower

- A-331 (Rule 11, Rule 11. Publications, accepted by payment, line 392): "A payment naming no payer is a gift: no refund is owed on it (Money rule 11)."
- A-359 (Rule 12, Rule 12. A purchase names a publication's price tag, line 418): "A payment naming a tag the publication does not count (a tag on it signed by anyone else, or a version carrying no price) is…"
- A-1380 (Rule 93, Rule 93. A broken collective, and its way back, line 1836): "A payment naming no payer is a gift: nothing is owed back on it (Money rule 11), and it does not block a closing."
- A-1393 (Rule 93, Rule 93. A broken collective, and its way back, line 1853): "A gift owes nothing back (Money rule 11)."

### R-117. A refund past the refund terms the buyer accepted is ended

**Relation:** one narrower

- A-337 (Rule 11, Rule 11. Publications, accepted by payment, line 398): "A refund past the terms the buyer accepted by paying is ended: the obligation closes there, the owners keep the money, and it does not…"
- A-2109 (no rule, Publication (type 6): a service sold under a cMIP's terms, line 2889): "Its refund terms (field 8) end a refund unpaid past their point."
- A-2114 (no rule, Publication (type 6): refund terms, line 2893): "Past the point, the refund is ended (rule 11)."

### R-118. Refund terms are a fixed point on the time reference (terms field 17, publication field 8)

**Relation:** one narrower

- A-338 (Rule 11, Rule 11. Publications, accepted by payment, line 398): "The terms are a fixed point on the time reference (publication field 8)."
- A-1924 (no rule, Terms (type 0), field 17, line 2595): "until when a refund owed on a payment under these terms is claimable: a point on the time reference"

### R-119. A proof may sit inside a vow's sale as evidence

**Relation:** one narrower

- A-343 (Rule 11, Rule 11. Publications, accepted by payment, line 402): "A seller who promises the stream sells a vow, a promised delivery (rule 13; the live media cMIP): the key delivered in keeping the vow…"
- A-408 (Rule 13, Rule 13. Vows: the state of each sale, line 477): "A proof may sit inside a vow as evidence."

### R-120. Only those who signed onto a vow confirm or contest its sales

**Relation:** one narrower

- A-350 (Rule 11, Rule 11. Publications, accepted by payment, line 407): "Each sale is confirmed or contested by those who signed onto the vow."
- A-401 (Rule 13, Rule 13. Vows: the state of each sale, line 468): "Only someone who signed onto the vow may confirm or contest it, at any price, including none."

### R-121. While an ownership agreement is forked, payments pay the reference's shares; a receipt naming another version of the fork is wrong

**Relation:** one narrower

- A-364 (Rule 12, Rule 12. A purchase names a publication's price tag, line 422): "A receipt naming a version on no line of the agreement the publication names is a wrong receipt, and so, until the fork is settled,…"
- A-1530 (Rule 47, Rule 47: Acts on either branch, line 2023): "For an ownership agreement, the shares a payment pays are those of the reference until the fork is settled: a split service's receipt naming, in…"
- A-1585 (Rule 47, Rule 47: A tangled fork stays on its reference, line 2092): "Any buyer who paid under a version every party signed stays protected, as for a simple fork, the payment judged under the version it names;…"

### R-122. After a fork's or closing's line nothing done for the collective counts in Agreements, and its publications sell nothing

**Relation:** one narrower

- A-384 (Rule 12, Rule 12. A purchase names a publication's price tag, line 444): "A publication whose ownership agreement names a closed collective as owner, or names an ownership agreement that is itself closed, sells nothing from the closing's…"
- A-830 (no rule, Made before, made after, item 7, line 1068): "an act for the collective a fork's or closing's history does not hold counts for nothing (rule 91);"
- A-1280 (Rule 91, Rule 91. How a collective ends: four shapes, line 1724): "From the fork's line, nothing done for the original counts in Agreements, whatever its key grammar's holders do."
- A-1306 (Rule 91, Rule 91. How a collective ends: four shapes, line 1739): "The fork ends the original's publications from its line (rule 12): a wallet reading Agreements sees them ended, and pays a successor's publication instead."
- A-1317 (Rule 91, Rule 91. How a collective ends: four shapes, line 1749): "After its line, nothing done for the collective counts in Agreements."
- A-2563 (no rule, Closing (type 20), line 3518): "After its line, nothing done for the collective counts in Agreements, as after a fork, and its publications sell nothing, as after a fork."

### R-123. A contest names the sale it contests, never the whole vow

**Relation:** one narrower

- A-415 (Rule 13, Rule 13. Vows: the state of each sale, line 481): "A contest names the sale it contests, never the whole vow ("Contest (type 14)")."
- A-2288 (no rule, Contest (type 14), a vow's sale, line 3143): "A vow's sale is a purchase, and its buyer contests it the same way, with one difference: where its inside names the vow by its…"

### R-124. A sign-on is a signature act naming the publication by anyone but its own parties

**Relation:** one narrower

- A-433 (Rule 13, Rule 13. Vows: the state of each sale, line 493): "a sign-on by signature is by anyone other than the publication's own parties;"
- A-2274 (no rule, Contest (type 14), of a purchase, line 3137): "A contest of a purchase: field 0 names the purchase it contests: the buyer's payer's claim of the payment that is the purchase (rule 12),…"

### R-125. A buyer is the identity the payment's commitment names, or the signer of the sign-on

**Relation:** one narrower

- A-435 (Rule 13, Rule 13. Vows: the state of each sale, line 495): "the buyer is the identity the payment's commitment names, or the signer of the sign-on; a payment naming none has no buyer (Money rule 11)."
- A-1008 (Rule 22, Rule 22. Role shares with evidence, line 1331): "The payer is the one the payment's own commitment names (payment cMIP: an identity, or nobody): a claim of the same rail payment whose rail…"
- A-2275 (no rule, Contest (type 14), of a purchase, line 3137): "The buyer is the identity the payment's commitment names (rule 22), or the signer of the sign-on; a payment naming none has no buyer, and…"

### R-126. Holders of the stake an act affects have standing to contest it

**Relation:** one narrower

- A-446 (Rule 14, Rule 14. A sale is tied to the seller's ownership agreement, not to the work's claim alone, line 516): "the ownership agreement's holders contest it;"
- A-537 (Rule 54, Rule 54. Standing, line 639): "a holder of a stake the contested act affects;"

### R-127. A fork act transfers the original's stakes in works to the successors in the shares it names

**Relation:** one narrower

- A-466 (Rule 14, Rule 14. A sale is tied to the seller's ownership agreement, not to the work's claim alone, line 540): "After the fork of a collective, the original's shares in works pass to the successors in the shares the fork act gives them (rule 91):…"
- A-1282 (Rule 91, Rule 91. How a collective ends: four shapes, line 1729): "The fork act transfers the original's stake in each work, as a stake transfer, to the successors, in the shares it names (field 5)."
- A-1283 (Rule 91, Rule 91. How a collective ends: four shapes, line 1729): "By default the shares are in proportion to the stakes of the members on each side in the original itself (field 7), divided in millionths,…"
- A-2470 (no rule, Fork (type 19), CDDL, line 3410): "the original's stakes, where not divided by default"
- A-2474 (no rule, Fork (type 19), CDDL, line 3415): "a stake the original holds, and each side's share, in millionths"

### R-128. A mark naming a succession plan, [3, party], is checked as rule 83 says

**Relation:** one narrower

- A-492 (Rule 46, Rule 46. A false mark makes a clone invalid, line 575): "A mark naming a succession plan, `[3, party]`, is checked as rule 83 says."
- A-700 (Rule 65, Rule 65. Counting a power, line 865): "a succession plan, `[3, party]`: as rule 83 says;"
- A-1234 (Rule 83, Rule 83. Execution, line 1668): "The clone's mark then names the plan, `[3, party]`, with the seat successors entering as its signers."

### R-129. A place already ended by the party's own act or an absence outcome needs no termination mark

**Relation:** one narrower

- A-495 (no rule, Termination: active and terminated, line 585): "A party's place in an agreement is active from the version that names it, which it signed, until a terminating act for that place counts,…"
- A-1514 (Rule 47, Rule 47: Termination, line 2011): "A clone terminates only where it carries the termination mark (field 37), naming the deal or the parties' places it terminates; a clone without the…"
- A-2062 (no rule, Terms (type 0): the termination mark, line 2806): "A place already ended needs no mark: by the party's own act, a transfer of its whole stake the clone counts (field 31; rule 10),…"

### R-130. A clone terminates only where it carries the termination mark (field 37); a clone leaving out an active party's place without the mark is invalid

**Relation:** one narrower

- A-497 (no rule, Termination: active and terminated, line 587): "A terminating act is a version of the agreement that sells nothing, or that names a party's place terminated, or a deal's clone carrying the…"
- A-499 (no rule, Termination: active and terminated, line 587): "A deal's clone without the mark is never a terminating act, whatever it states."
- A-1514 (Rule 47, Rule 47: Termination, line 2011): "A clone terminates only where it carries the termination mark (field 37), naming the deal or the parties' places it terminates; a clone without the…"
- A-1915 (no rule, Terms (type 0), field 37, line 2581): "the termination mark: in a deal's clone only, which terminates what it names (rule 47; "Termination")"
- A-2059 (no rule, Terms (type 0): the termination mark, line 2806): "The termination mark (field 37) says that a deal's clone terminates, and names what: `[0]`, the deal, and with it every party's place; `[1, parties]`,…"
- A-2060 (no rule, Terms (type 0): the termination mark, line 2806): "It appears only in a deal's clone: founding terms, or terms carrying a key grammar (field 12), that carry it are invalid ("Termination"; rule 47)."
- A-2061 (no rule, Terms (type 0): the termination mark, line 2806): "A deal's clone that leaves out a party of the parent whose place is still active, without the mark naming that party's place, is invalid:…"
- A-2062 (no rule, Terms (type 0): the termination mark, line 2806): "A place already ended needs no mark: by the party's own act, a transfer of its whole stake the clone counts (field 31; rule 10),…"

### R-131. Where termination terms are named, a terminating act counts only when they answer met; 'not yet met' means it does not count

**Relation:** one narrower

- A-501 (no rule, Termination: active and terminated, line 589): "Where an agreement names termination terms, "the act counts only when the termination terms' cMIP answers met" is read for any terminating act, whoever signed…"
- A-502 (no rule, Termination: active and terminated, line 589): "Where they answer not yet met, the act does not count, and the agreement or the place stays active; a later terminating act may count."
- A-1515 (Rule 47, Rule 47: Termination, line 2011): "Where the deal names termination terms (field 36), they are asked only about a marked clone, which counts only when they answer met; a marked…"
- A-1788 (no rule, The tasks, one by one, line 2386): ""Not yet met" is condition evaluation's "pending" (rule 34) under this task's name: the act does not count."

### R-132. A party's own way out is its transfer of its share, which no term reaches

**Relation:** one narrower

- A-509 (no rule, Termination: active and terminated, line 593): "A deal: every party whose voice remains, by the clone of rule 47; each party's own way out is its transfer."
- A-512 (Rule 11, Rule 11. Publications, accepted by payment, line 597): "Stated cost: termination terms are a deal term, never the way out. Owners whose termination terms never answer met, a veto they signed, keep the…"
- A-1517 (Rule 47, Rule 47: Termination, line 2011): "Each party's own way out is its transfer (rule 10), which no term reaches."

### R-133. Termination terms (field 36) appear only in a deal's terms; a collective names none

**Relation:** one narrower

- A-510 (no rule, Termination: active and terminated, line 593): "A collective: its agreement ends as rule 91 says and a member's place as rule 70 says; a collective names no termination terms, and none…"
- A-1914 (no rule, Terms (type 0), field 36, line 2578): "termination terms: a cMIP and its parameters, task 15 ("Termination"); in a deal only (a collective's terms carrying it, or naming task 15 in field…"
- A-2056 (no rule, Terms (type 0): termination terms, line 2804): "Termination terms (field 36) appear only in terms of a deal: terms carrying a key grammar (field 12) that carry field 36, or name task…"

### R-134. Only the termination terms are asked whether a terminating act counts; no other task or control model

**Relation:** same

- A-511 (no rule, Termination: active and terminated, line 595): "Only the termination terms (task 15) are asked whether a terminating act counts; no other task's answer, and no control model's, is read for it."
- A-1791 (no rule, The tasks, one by one, line 2386): "Only this task is asked whether a terminating act counts; no other task's answer, and no control model's, is read for it."

### R-135. Each negotiation message names the previous one in the thread and acknowledges the other side's latest

**Relation:** one narrower

- A-526 (Rule 52, Rule 52. Negotiation record, line 619): "Each message is locked and signed, names the previous message in the thread, and acknowledges the latest one received from the other side."
- A-532 (Rule 52, Rule 52. Negotiation record, line 626): "a negotiation message whose previous is not a message of the same thread is no part of the record either."
- A-2258 (no rule, Negotiation message (type 18), line 3110): "every later message names, in `objects`, the thread and the message it follows, `[[thread, previous]]`, the previous message being the thread's first message or another…"
- A-2261 (no rule, Negotiation message (type 18), line 3114): "Each message's `acks` name the latest message of the other side that its signer has received, and nothing else."

### R-136. Only negotiation messages of the thread, by its sides, make the record

**Relation:** one narrower

- A-530 (Rule 52, Rule 52. Negotiation record, line 623): "Only negotiation messages make the record:"
- A-531 (Rule 52, Rule 52. Negotiation record, line 625): "a text act, a reaction or any other act naming the thread is no part of it, carries no acknowledgement (Envelopes rule 18), and proves…"
- A-2260 (no rule, Negotiation message (type 18), line 3112): "A message signed by anyone else is no part of that thread's record."

### R-137. A collective uses Identity for its chain; its identity-chain acts are done by Identity's rules

**Relation:** one narrower

- A-547 (Rule 56, Rule 56. A collective is an identity its members act for, line 656): "It uses the Identity MIR for its chain as any identity does: it rotates, and its homes receipt its chain acts."
- A-581 (Rule 57, Rule 57. An act is done once sealed to every member and on the chain, line 695): "The collective's identity-chain acts (genesis, rotations) are done by Identity's own rules: public and at its homes."

### R-138. Holders for an act are those of the agreement in force and the transfers its line placed

**Relation:** one narrower

- A-560 (Rule 57, Rule 57. An act is done once sealed to every member and on the chain, line 679): "The holders are those the agreement in force for the act and the transfers its line placed name (rule 65)."
- A-727 (Rule 65, Rule 65. Counting a power, line 896): "Among the parties (a change rule by share, `[3, stake, share]`, or a power a control model gives an everyday act by share, among the…"

### R-139. A record or fork or closing not done takes no effect; clients make an ending public

**Relation:** one narrower

- A-575 (Rule 57, Rule 57. An act is done once sealed to every member and on the chain, line 689): "a record not done is no line ("Record (type 17)");"
- A-576 (Rule 57, Rule 57. An act is done once sealed to every member and on the chain, line 690): "a fork or closing not done takes no effect (rule 91)."
- A-2342 (no rule, Record (type 17), line 3230): "A record that is neither sealed to every member of the agreement in force for it, nor public, is no line: it puts nothing in…"
- A-2497 (no rule, Fork (type 19), complete when, line 3435): "the fork is done: sealed to every member of the agreement in force at its line, or public, citing the collective's chain by its line;…"
- A-2498 (no rule, Abandonment declaration (type 13), line 3437): "Client conformance: the members' clients also make a fork public, since creditors and buyers depend on it."
- A-2538 (no rule, Closing (type 20), complete when, line 3497): "it is done: sealed to every member of that agreement, or public (client conformance: made public);"

### R-140. Negotiation messages are talk: on neither chain, binding nothing, not held to the done rule

**Relation:** one narrower

- A-577 (Rule 57, Rule 57. An act is done once sealed to every member and on the chain, line 694): "Negotiation messages are the one kind not held to this rule."
- A-578 (Rule 57, Rule 57. An act is done once sealed to every member and on the chain, line 694): "They are talk, binding nothing, and on neither chain."
- A-596 (Rule 58, Rule 58. Two chains, line 717): "negotiation messages;"

### R-141. An act that does not name the collective is the member's own

**Relation:** same

- A-584 (Rule 58, Rule 58. Two chains, line 701): "An act that does not name it is the member's own."
- A-597 (Rule 58, Rule 58. Two chains, line 718): "members' own acts that do not name the collective, Identity's acts among them."

### R-142. An action citing a decision is unknown while that decision is not held

**Relation:** one narrower

- A-587 (Rule 58, Rule 58. Two chains, line 703): "A member's act for a collective is judged where the reader holds the collective's own chain: its identity chain and the acts on its chain…"
- A-610 (Rule 58, Rule 58. Two chains, line 729): "An action citing a decision is unknown while the decision it cites is not held, and counts for nothing where it is held and is…"

### R-143. A rotation's history is that of the signature acts its declaration names

**Relation:** one narrower

- A-592 (Rule 58, Rule 58. Two chains, line 709): "a rotation, which carries no `objects` (Identity), by the signature acts its Agreements declaration names, each of which cites the collective's chain as an action…"
- A-777 (no rule, Made before, made after: the collective's line, line 991): "A record names, in `objects` on the collective's chain, the previous decision and the other acts it knows (its tips); a rotation's history is that…"
- A-2420 (no rule, Collectives in the identity chain, line 3340): "The rotation's history is the history of the signature acts it names: each cites, on the collective's chain, the previous decision and the acts its…"

### R-144. A collective's homeless rotation, signed by its chain key, is its own escape endorsement

**Relation:** same

- A-598 (Rule 58, Rule 58. Two chains, line 718): "A collective's escape from a hostile home is Identity's: its homeless rotation, signed by its chain key, is its own escape endorsement (Identity section 11)."
- A-1617 (Rule 60, Rule 60. Layers: who acts for the collective, line 2137): "A collective's homeless rotation, signed by its chain key under its key grammar, is its own escape endorsement (Identity section 11): no member signs one."

### R-145. A collective's grantee acts with its own key, citing its grant as the decision it acts under

**Relation:** one narrower

- A-599 (Rule 58, Rule 58. Two chains, line 722): "the decision it acts under: a record of the collective, a link of its identity chain, or, for a grantee, its grant (rule 73); and"
- A-794 (no rule, Made before, made after, item 2, line 1020): "An act a grantee signs for the collective is on its chain, citing its grant (rule 58), and is placed as every act for the…"
- A-896 (Rule 80, Rule 80. Evaluation, line 1165): "the act is signed by the grantee (with the grant's key, for a person's grant), cites the grant on the grantor's chain, is done (rule…"
- A-2200 (no rule, Grant (type 9) and revocation (type 10), line 3035): "Its grantee acts with its own key: an act it signs for the collective names the collective on its chain and the grant as the…"

### R-146. A claim a member signs for a collective is the collective's: the collective is its opener and a creator, beside any co-creators

**Relation:** one narrower

- A-603 (Rule 58, Rule 58. Two chains, line 725): "A claim a member signs for the collective is the collective's claim, the collective its opener and a creator, beside any co-creators, members or not…"
- A-1879 (no rule, Part five: act formats, the type table, line 2531): "a sole creator; or one creator, who opens it, completed by the other creators' signature acts; a collective's, signed by a member for it (rule…"
- A-2121 (no rule, Claim (type 3), line 2908): "A claim a member signs for a collective is the collective's claim (rule 58): the collective, which its `objects` name, is its opener and a…"

### R-147. A member's client cites the latest decision and the heads it holds

**Relation:** one narrower

- A-605 (Rule 58, Rule 58. Two chains, line 725): "*Client conformance:* a member's client cites, among the heads, its own last act for the collective."
- A-614 (Rule 56, Rule 56. A collective is an identity its members act for, line 733): "Client conformance: a client acting for a collective cites the latest decision and every head it holds."

### R-148. An act within its signer's powers counts for the collective as soon as it is done and cites its latest decision

**Relation:** one narrower

- A-606 (Rule 58, Rule 58. Two chains, line 727): "An act within its signer's powers counts for the collective as soon as it is done and cites the collective's latest decision as the signer…"
- A-613 (Rule 58, Rule 58. Two chains, line 733): "Whether an act counts for the collective is decided above, as soon as it is done and cites the collective's latest decision as the signer…"

### R-149. The agreement in force for an act is picked from the decisions its history holds; a record it never cites decides nothing for it, save by the tie rule

**Relation:** one narrower

- A-607 (Rule 58, Rule 58. Two chains, line 727): "It is judged under the decisions its history holds (rule 72)."
- A-608 (Rule 58, Rule 58. Two chains, line 727): "A record it never cites decides nothing for it, save by the tie rule ("Made before, made after", 7)."
- A-640 (Rule 72, Rule 72. Every complete clone is written on the record at once, line 778): "for an action, the decisions its history holds, and those in their histories (rule 58)."
- A-641 (Rule 72, Rule 72. Every complete clone is written on the record at once, line 778): "A record it never cites decides nothing for it, a concurrent one included, save by the tie rule ("Made before, made after", 7)."
- A-786 (no rule, Made before, made after, item 1, line 1004): "The agreement in force at a record or an action is read from the decisions rule 72 counts, a record the action does not cite…"
- A-1623 (Rule 60, Rule 60. Layers: who acts for the collective: When an act counts, line 2147): "The agreement in force for that act is the one rule 72 picks from the decisions its history holds."
- A-2432 (no rule, Collectives in the identity chain, line 3354): "For an act for the collective, the agreement in force is the one rule 72 picks from the genesis's declaration, the rotations' declarations of kind…"

### R-150. The chain key that signs a collective's genesis is held as its key grammar says; the genesis declares the founding agreement

**Relation:** one narrower

- A-619 (Rule 59, Rule 59. Key grammar, line 743): "The same holds for the chain key that signs the collective's genesis (Identity rule 1)."
- A-2416 (no rule, Collectives in the identity chain, line 3339): "It declares it in place of a first signing key, and is signed by a chain key (Identity rule 1); its founding agreement's target is…"

### R-151. Where one person holds the chain key, a successor is named, whose succession clone carries their own successor's plan

**Relation:** one narrower

- A-626 (Rule 59, Rule 59. Key grammar, line 758): "Where one person holds the chain key, the agreement MUST name a successor (a seat successor in that holder's succession plan) and an escrowed share…"
- A-631 (Rule 59, Rule 59. Key grammar, line 766): "That succession clone also carries a succession plan for the successor, naming their own seat successor, signed by them in the same clone (rule 83)."
- A-1240 (Rule 83, Rule 83. Execution, line 1673): "and, where the party held the chain key alone, a plan for the successor in its place, naming their own successor, signed by the successor…"

### R-152. A clone changing the key grammar or removing a key holder is declared by a rotation; every other complete clone is written by a record

**Relation:** one narrower

- A-634 (Rule 72, Rule 72. Every complete clone is written on the record at once, line 772): "A clone that changes the key grammar, or removes a party holding the key or a share of it, is declared by a rotation (rule…"
- A-635 (Rule 72, Rule 72. Every complete clone is written on the record at once, line 772): "Every other complete clone of a collective's agreement is written, at once, by a record (type 17), which any member draws with their own key,…"
- A-1103 (Rule 69, Rule 69. Changing members, line 1496): "Changing members takes a clone of the collective's agreement making a constitutional change (rule 98), put in force by a record (type 17) that names…"
- A-1114 (Rule 69, Rule 69. Changing members, line 1506): "Any other constitutional change (the change rules, the layers' rules, the control model and its parameters) is likewise put in force by a record; one…"
- A-1147 (Rule 70, Rule 70. A member can always leave alone, line 1546): "The clone is put in force as rule 69 says: by a record, or by a rotation declaring it where the clone changes the key…"
- A-1176 (Rule 71, Rule 71. Leaving an area, line 1583): "It is a constitutional clone (rule 98), put in force as rule 69 says: by a record, or a rotation where the key grammar changes."
- A-1258 (Rule 83, Rule 83. Execution, line 1696): "For a collective, the succession clone is put in force as rule 69 says: by a record, or by a rotation declaring it where the…"
- A-1269 (Rule 91, Rule 91. How a collective ends: four shapes, line 1716): "The collective re-signs, by a constitutional clone put in force as rule 69 says (a rotation where a leaver holds a share of the chain…"
- A-1718 (Rule 89, Rule 89. Outcomes: Voice removed, line 2289): "When the voice is removed in a collective, the remaining members clone its agreement without the party, put in force as rule 69 says: by…"
- A-2417 (no rule, Collectives in the identity chain, line 3340): "A rotation declares, with the same kind, each complete clone that changes the key grammar or removes a party holding the chain key or a…"
- A-2426 (no rule, Collectives in the identity chain, line 3344): "Every other complete clone is written by a record, which any member draws (rule 72)."

### R-153. A rotation declaring nothing new carries the agreement in force forward, changing the chain key, not rules

**Relation:** one narrower

- A-637 (Rule 72, Rule 72. Every complete clone is written on the record at once, line 774): "A rotation declaring nothing new carries the agreement in force forward."
- A-1122 (Rule 69, Rule 69. Changing members, line 1520): "A rotation declaring nothing new carries the agreement in force forward ("Collectives in the identity chain")."
- A-2433 (no rule, Collectives in the identity chain, line 3356): "A rotation that declares no new agreement changes the chain key, not rules."
- A-2434 (no rule, Collectives in the identity chain, line 3356): "Its declarations slot carries the Agreements declaration on unchanged, and the agreement in force carries forward, recorded clones included."

### R-154. Records on concurrent lines are a fork of the agreement chain, settled by rule 90; the parent stays in force until a clone resolves it

**Relation:** one narrower

- A-642 (Rule 72, Rule 72. Every complete clone is written on the record at once, line 780): "Records on concurrent lines are a fork of the agreement chain, settled as rule 90 says."
- A-643 (Rule 72, Rule 72. Every complete clone is written on the record at once, line 780): "Where two valid records of different clones of the same parent, neither before the other, both count for an act (a record after both, or…"
- A-799 (no rule, Made before, made after, item 3, line 1024): "Two lines neither of which is before the other are concurrent."
- A-801 (no rule, Made before, made after, item 3, line 1024): "Records on concurrent lines are a fork of the agreement chain (rule 72)."
- A-904 (Rule 90, Rule 90. Forks of records, line 1178): "The parent stays in force until a clone of either branch resolves it."
- A-910 (Rule 90, Rule 90. Forks of records, line 1184): "Two clones recorded on concurrent lines are such a fork, settled the same way (rule 72)."

### R-155. Records follow the agreement chain one clone at a time

**Relation:** same

- A-646 (Rule 72, Rule 72. Every complete clone is written on the record at once, line 789): "So records follow the agreement chain one clone at a time."
- A-907 (Rule 90, Rule 90. Forks of records, line 1180): "A clone of a branch is a clone of that branch's latest clone, as records follow the agreement chain one clone at a time (rule…"

### R-156. Grant scopes: sign new deals, manage named ones, act for an identity

**Relation:** one narrower

- A-648 (Rule 73, Rule 73. Grants, line 799): "Grants delegate authority with limits: signing new deals, managing specific existing ones, or acting for an identity or collective (posting, uploading, spending up to a…"
- A-2189 (no rule, Grant (type 9) and revocation (type 10), grant field 1, line 3016): "scope: 0 sign new deals, 1 manage named existing ones, 2 act for an identity (post, upload, spend)"

### R-157. A collective hands no grant key: its grant carries no field 9

**Relation:** one narrower

- A-653 (Rule 73, Rule 73. Grants, line 803): "A collective hands no grant key: it has no signing key to scope (rule 56)."
- A-697 (Rule 75, Rule 75. Strands, line 856): "A collective has no devices of its own and hands no grant keys: its members' and grantees' acts join its chain by what they cite…"
- A-2199 (no rule, Grant (type 9) and revocation (type 10), line 3035): "It carries no field 9: a collective's grant carrying one is invalid, since a collective has no key to scope."

### R-158. A grant counts only once its grantee accepts it by a signature act

**Relation:** one narrower

- A-654 (Rule 73, Rule 73. Grants, line 805): "The grant is a decision naming the grantee's own identity, which signs to accept it."
- A-1885 (no rule, Part five: act formats, the type table, line 2537): "the grantor. For a collective, an act for it, counting under its rule for Agreements, or, granting within an area, completed by its holders' signature…"
- A-2201 (no rule, Grant (type 9) and revocation (type 10), line 3035): "The grant counts only once its grantee signed a signature act naming it (type 1), accepting it."
- A-2207 (no rule, Grant (type 9) and revocation (type 10), line 3037): "It counts only once its grantee signed a signature act naming it, accepting it."

### R-159. There is no member key (signature key 1 retired)

**Relation:** one narrower

- A-656 (Rule 73, Rule 73. Grants, line 809): "There is no member key."
- A-2064 (no rule, Signature (type 1), key 1, line 2819): "key 1 is retired and never reused: there is no member key (rule 73)"

### R-160. Grants are revocable at any time by a revocation, a decision ending powers, naming the grant

**Relation:** one narrower

- A-658 (Rule 73, Rule 73. Grants, line 811): "Grants are revocable at any time, by a revocation: a decision ending powers (type 10)."
- A-850 (Rule 76, Rule 76. Revocation, line 1101): "The revocation names the grant."
- A-1886 (no rule, Part five: act formats, the type table, line 2538): "the grantor, naming the grant it ends. For a grant within an area, completed by that area's holders' signature acts"
- A-2219 (no rule, Grant (type 9) and revocation (type 10), revocation (type 10), line 3047): "It names the grant it ends."
- A-2221 (no rule, Grant (type 9) and revocation (type 10), revocation (type 10), line 3049): "It is a decision ending powers, judged as rule 76 says."

### R-161. During a broken stretch grants are quarantined: a grantee's act counts for nothing, as every act of the stretch

**Relation:** one narrower

- A-659 (Rule 73, Rule 73. Grants, line 813): "During a collective's broken stretch its grants are quarantined: a grantee's act of the stretch counts for nothing."
- A-1349 (Rule 93, Rule 93. A broken collective, and its way back, line 1795): "Every act of the stretch stays shown and counts for nothing in Agreements, during the stretch and after it."
- A-1354 (Rule 93, Rule 93. A broken collective, and its way back, line 1799): "The broken collective is quarantined."
- A-1355 (Rule 93, Rule 93. A broken collective, and its way back, line 1801): "A grantee's act of the broken stretch counts for nothing, like the collective's own."

### R-162. Grants issued before the break work again after the rollback

**Relation:** one narrower

- A-660 (Rule 73, Rule 73. Grants, line 813): "The grants work again after the rollback (rule 93), for an act citing the rollback or a later decision."
- A-1356 (Rule 93, Rule 93. A broken collective, and its way back, line 1801): "The grants issued before the broken act work again after the rollback, which restores every condition as at the act before the break: a grant…"

### R-163. No act under a grant is a decision or adopts anything

**Relation:** one narrower

- A-665 (Rule 73, Rule 73. Grants, line 820): "Sub-granting stays excluded: no act under a grant is a grant ("Grant (type 9)")."
- A-670 (Rule 73, Rule 73. Grants, line 824): "A proxy is not a grant: no act under a grant is a decision; whether and how a holder's vote is handed on is its…"
- A-680 (Rule 73, Rule 73. Grants, line 834): "Naming none, it reaches every act but a decision."
- A-883 (Rule 78, Rule 78. Acknowledgements, line 1144): "No act under a grant adopts anything (rule 76)."
- A-2208 (no rule, Grant (type 9) and revocation (type 10), line 3039): "An act under a grant is backed only as rule 80 says, within its reach (field 6, or, for a person's grant naming none, every…"

### R-164. What a person's grantee signs with the grant key is the person's own act, citing the grant on the person's chain

**Relation:** same

- A-672 (Rule 73, Rule 73. Grants, line 826): "What the grantee signs with it is the person's own act, citing the grant on the person's chain (the person's identity as chain)."
- A-2206 (no rule, Grant (type 9) and revocation (type 10), line 3037): "It is the person's own act, citing the grant in `objects` on the person's chain."

### R-165. A person's grant and its revocation are everyday acts of the person's own key

**Relation:** one narrower

- A-673 (Rule 73, Rule 73. Grants, line 828): "A person's grant and its revocation are everyday acts, signed with the person's own signing key: adding or removing a grant key needs no rotation…"
- A-2218 (no rule, Grant (type 9) and revocation (type 10), revocation (type 10), line 3047): "A revocation is a decision of the grantor: for a collective, an act for it citing its chain as every decision does, counting as rule…"

### R-166. A grant within an area is drawn by a holder and completed by the area's other holders

**Relation:** one narrower

- A-683 (Rule 74, Rule 74. A grant never reaches beyond its issuer's power, line 844): "The holders of an area may grant within it."
- A-2211 (no rule, Grant (type 9) and revocation (type 10), line 3043): "A grant from an area (field 5) is drawn by a holder of the area and completed by signature acts of the area's other holders…"

### R-167. A revocation of a grant within an area is completed by that area's holders

**Relation:** one narrower

- A-688 (Rule 74, Rule 74. A grant never reaches beyond its issuer's power, line 848): "So is a revocation of such a grant: it counts only with valid signature acts naming it by the holders of the area the grant…"
- A-2220 (no rule, Grant (type 9) and revocation (type 10), revocation (type 10), line 3047): "For a grant within an area, it is completed by that area's holders' signature acts, judged by that area alone (rule 74)."

### R-168. What ends a grant: revocation, a departure emptying its area, a layer freezing, a change of control model, a fork or closing

**Relation:** they differ: 1198 says grants in a frozen area end 'for good'; 1151 and 1255 say they may be reinstated by cloning at the refit

- A-692 (Rule 74, Rule 74. A grant never reaches beyond its issuer's power, line 852): "A change of control model ends every grant within an area."
- A-1151 (Rule 70, Rule 70. A member can always leave alone, line 1548): "Every grant in it ends at that line, to be reinstated, where wanted, by cloning it at the refit."
- A-1196 (Rule 71, Rule 71. Leaving an area, line 1599): "A departure that leaves an area held leaves its grants in force; only a revocation ends them."
- A-1198 (Rule 71, Rule 71. Leaving an area: an area with no holder, line 1603): "Its acts made after the line that froze it count for nothing, and every grant issued within it ends for good."
- A-1201 (Rule 71, Rule 71. Leaving an area: an area with no holder, line 1608): "A departure that empties an area ends every grant in it: a decision ending powers."
- A-1255 (Rule 83, Rule 83. Execution, line 1689): "an area left with no holder stands frozen, its grants ending and reinstated, where wanted, by cloning at the refit, until a constitutional clone gives…"
- A-1300 (Rule 91, Rule 91. How a collective ends: four shapes, line 1737): "Every grant of the original ends at the fork's line, as when a departure empties an area (rule 71), and the original's split agreement with…"
- A-2210 (no rule, Grant (type 9) and revocation (type 10), line 3041): "It ends only by a revocation, a departure emptying its area, a layer freezing, a change of control model (for a grant within an area,…"

### R-169. A power a control model gives an everyday act by share is counted among the parties it names, by share

**Relation:** one narrower

- A-703 (Rule 65, Rule 65. Counting a power, line 868): "a power a control model gives one everyday act by share (rule 99, `act-answer` `[2, counted]`): among the parties its answer names, by share, as…"
- A-727 (Rule 65, Rule 65. Counting a power, line 896): "Among the parties (a change rule by share, `[3, stake, share]`, or a power a control model gives an everyday act by share, among the…"
- A-1828 (Rule 99, Rule 99. Control models, line 2452): "A model may answer for an act for the collective `[2, counted]`: its power, the parties it is counted among (parties of the agreement in…"

### R-170. Each rule and area is counted among the voices that remain

**Relation:** one narrower

- A-704 (Rule 65, Rule 65. Counting a power, line 870): "In each, only parties whose voice remains are counted, a stake's holders aside, who are counted by what they hold."
- A-1149 (Rule 70, Rule 70. A member can always leave alone, line 1548): "Meanwhile, from the line on, each rule, and each area the party held, is counted among the voices that remain (rule 65)."

### R-171. A departure registered on a line before a rotation, rollback or clone is not counted for it

**Relation:** one narrower

- A-706 (Rule 65, Rule 65. Counting a power, line 871): "a party whose resignation (rule 70) or declaration with outcome 0 (rule 89) the collective registered on a line before it;"
- A-1107 (Rule 69, Rule 69. Changing members, line 1498): "A member whose resignation (rule 70) or declaration with outcome 0 (rule 89) the collective registered on a line before the rotation is no longer…"
- A-1404 (Rule 93, Rule 93. A broken collective, and its way back, line 1872): "whose departure (a resignation, rule 70, or a declaration with outcome 0, rule 89) the collective registered on a line before the broken act; or"
- A-2448 (no rule, Collectives in the identity chain, the rare cases: a recovery rotation and a rollback, line 3372): "The powers are counted as rule 65 says at the rollback, with the departures registered on lines before the broken act in effect and none…"

### R-172. From the step-down's line, the holder's signatures count toward nothing in that area

**Relation:** one narrower

- A-707 (Rule 65, Rule 65. Counting a power, line 872): "for one area, a holder whose stepping down from it (rule 71) the collective registered on such a line."
- A-1189 (Rule 71, Rule 71. Leaving an area: Stepping down at once, line 1597): "From that line on, the holder's signature acts count toward nothing in that area, in that agreement or any descending from it."

### R-173. A party who lost its voice comes back only by a later constitutional clone naming it

**Relation:** one narrower

- A-709 (Rule 65, Rule 65. Counting a power, line 876): "A party is named again only by a constitutional clone made after the version in which it lost that voice, naming it as a party…"
- A-1141 (Rule 70, Rule 70. A member can always leave alone, line 1540): "Once registered, it stays taken for the collective, whatever its signer's later rotation disowns ("Made before, made after", 4): the member comes back only by…"
- A-2271 (no rule, Contest (type 14), of a declaration, line 3133): "A voice the declaration removed comes back only by a later version naming the party."

### R-174. A signature placed before the departure's line stays valid and still counts, as a voice that remains, for what it signed

**Relation:** one narrower

- A-712 (Rule 65, Rule 65. Counting a power, line 878): "A party that lost its voice still counts, for a clone or an act, through a valid signature act on it placed before the collective's…"
- A-713 (Rule 65, Rule 65. Counting a power, line 879): "for that clone or act alone, it counts as a voice that remains, so the rule is met or not as written, its number counted…"
- A-796 (no rule, Made before, made after, item 3, line 1022): "A member's voice remains for an act for the collective made before that line, and through any signature of theirs placed before it."
- A-1143 (Rule 70, Rule 70. A member can always leave alone, line 1542): "A signature of the party placed before the line stays valid, and still counts toward what it signed."
- A-1144 (Rule 70, Rule 70. A member can always leave alone, line 1542): "For that clone or act alone, its signer still counts among the voices that remain, so the departure never lowers the number the rule asks…"
- A-1190 (Rule 71, Rule 71. Leaving an area: Stepping down at once, line 1597): "A signature of the holder placed before the line stays valid, and counts as rule 65 says."
- A-2320 (no rule, Resignation (type 16), line 3195): "What she signed while present still speaks where rule 65 counts it."

### R-175. When fewer voices remain than a rule's number, all of them together meet it; otherwise the number stands

**Relation:** one narrower

- A-716 (Rule 65, Rule 65. Counting a power, line 885): "When fewer voices remain than a rule's number asks for, all the remaining voices together meet it; where enough remain, the number stands as written."
- A-721 (Rule 65, Rule 65. Counting a power, line 889): "an area's threshold, one a clone left above the area's holders included;"
- A-729 (Rule 65, Rule 65. Counting a power, line 896): "The fewer-voices clause, restated in shares: where the voices that remain hold together less than the share the rule asks for, all of them together…"
- A-1194 (Rule 71, Rule 71. Leaving an area, line 1599): "The area's threshold stands where enough of them remain, and all of them together meet it where fewer remain than it asks for."
- A-1256 (Rule 83, Rule 83. Execution, line 1690): "an area left with fewer holders than its number keeps that number, met by all who remain."

### R-176. When the last voice leaves, the collective freezes; a broken one can no longer be rolled back

**Relation:** one narrower

- A-723 (Rule 65, Rule 65. Counting a power, line 892): "When no voice remains, nothing meets the rule."
- A-1165 (Rule 70, Rule 70. A member can always leave alone: The last constitutional voice, line 1571): "Its constitution freezes as it stands, and nobody can add or remove a member, redraw an area or change a rule of the constitution again…"
- A-1171 (Rule 70, Rule 70. A member can always leave alone, line 1577): "A broken collective can no longer be rolled back."
- A-1173 (Rule 69, Rule 69. Changing members: owners may choose who runs the collective, line 1577): "Stated cost: when the last voice has left, the collective's works freeze as they stand."
- A-1406 (Rule 93, Rule 93. A broken collective, and its way back, line 1877): "Where every voice that remains for that rule has resigned, nothing meets it (rule 65): no rollback is possible, and the collective stays broken (rule…"

### R-177. An area left without a holder stands frozen until a constitutional clone gives it one

**Relation:** one narrower

- A-724 (Rule 65, Rule 65. Counting a power, line 892): "An area left without a holder, or listing none, stands frozen, as in rule 71, until a constitutional clone gives it a holder."
- A-1111 (Rule 69, Rule 69. Changing members, line 1502): "An area it leaves with no holder stands frozen until a constitutional clone gives it a holder (rule 71)."
- A-1150 (Rule 70, Rule 70. A member can always leave alone, line 1548): "An area left with no holder stands frozen from that line until a constitutional clone gives it a holder, as in rule 71."
- A-1197 (Rule 71, Rule 71. Leaving an area: an area with no holder, line 1603): "An area with no holder remaining is frozen until that change."
- A-1255 (Rule 83, Rule 83. Execution, line 1689): "an area left with no holder stands frozen, its grants ending and reinstated, where wanted, by cloning at the refit, until a constitutional clone gives…"

### R-178. Changing a succession plan, the keepers or the judicial tier needs every member whose voice remains; with another constitutional change both rules

**Relation:** one narrower

- A-737 (Rule 36, Rule 36. Named by the agreement, line 916): "In a collective, the keepers change only with every member's signature (rule 67)."
- A-1227 (Rule 81, Rule 81. The core gives the language, not the answers, line 1654): "Changing a plan takes a clone, which needs every member's signature, the party's included (rule 67)."
- A-1408 (Rule 93, Rule 93. A broken collective, and its way back, line 1879): "Where the clone also changes the judicial tier, it names the judicial tier's rule, `[4]`, too, every party whose voice remains (rule 67)."
- A-1452 (Rule 98, Rule 98. The last resort, 3, line 1950): "A clone making one needs the constitutional change rule, `[0]`, whatever its control model asks, and, where it also changes the judicial tier, the judicial…"
- A-1478 (Rule 67, Rule 67. Protected clauses: the judicial tier, line 1968): "The judicial tier changes only with the signature of every member whose voice remains, whatever field 18 says, and there is one version of it…"
- A-1487 (Rule 67, Rule 67. Protected clauses: the judicial tier, line 1980): "A clone changing any of them names the judicial tier's rule, `[4]`, in its mark, with every party of the parent whose voice remains, counted…"
- A-1488 (Rule 67, Rule 67. Protected clauses: the judicial tier, line 1980): "A version that also changes another field of the constitution names the constitutional change rule beside it, and needs both (rule 98)."

### R-179. Keeper records: one per act, signed by the operator, in one sequence linked by prev, ordered only within that sequence

**Relation:** one narrower

- A-739 (Rule 37, Rule 37. Records, line 921): "A keeper records the deal and the acts around it as they arrive, one keeper record (type 2) per act, signed by its operator."
- A-740 (Rule 37, Rule 37. Records, line 921): "Its records are everyday acts of its operator in one sequence, each naming the one before (Envelopes rule 13): the keeper's sequence."
- A-741 (Rule 37, Rule 37. Records, line 921): "One act is recorded before another when its record lies before the other's record in the keeper's sequence."
- A-742 (Rule 37, Rule 37. Records, line 923): "A keeper MUST keep one sequence for its records, and a keeper's sequence holds its keeper records and nothing else."
- A-743 (Rule 37, Rule 37. Records, line 923): "Records in two sequences of one operator are never ordered against each other, so a keeper's second sequence protects nothing against its first: a record…"
- A-744 (Rule 37, Rule 37. Records, line 923): "Each record is public, names the act's signer, which must be the act's own, and names the operator's previous record in `prev` (type 2)."
- A-2571 (no rule, Keeper record (type 2), line 3537): "Signed by the keeper's operator, with its own signing key, as an everyday act of the operator: one keeper record per act recorded."
- A-2574 (no rule, Keeper record (type 2), line 3537): "Its `prev` names the operator's previous keeper record, so a keeper's records form one sequence of its operator's (rule 37): the keeper's sequence, whose order…"
- A-2578 (no rule, Keeper record (type 2), what a verifier checks, line 3544): "one record is before another only when it lies in the other's ancestry in the keeper's sequence; records of two operators, or of two sequences,…"

### R-180. A record counts against a rotation only if it lies before the keeper's own record of that rotation, in that sequence

**Relation:** one narrower

- A-743 (Rule 37, Rule 37. Records, line 923): "Records in two sequences of one operator are never ordered against each other, so a keeper's second sequence protects nothing against its first: a record…"
- A-753 (Rule 41, Rule 41. What a rotation cannot erase, and what an anchor adds, line 943): "A record counts against a rotation only if it sits before the keeper's own record of that rotation, in the keeper's sequence."

### R-181. A keeper's sequence orders acts but places nothing on a time reference

**Relation:** one narrower

- A-745 (Rule 37, Rule 37. Records, line 925): "A keeper's sequence is a signed order and nothing more: it places no act on a time reference."
- A-1730 (Rule 33, Rule 33. Time, line 2307): "A keeper's word alone never says late: a keeper's sequence orders acts, it does not time them."

### R-182. An agreement may name several keepers and a rule for what counts as recorded

**Relation:** one narrower

- A-746 (Rule 38, Rule 38. Several keepers, line 929): "An agreement may name several keepers and a rule for what counts as recorded: any one, a threshold, or all."
- A-824 (no rule, Made before, made after, item 5, line 1058): "This is as the keepers' own rule counts what is recorded: any one, a threshold, or all of them (rules 38, 41, 42)."
- A-1731 (Rule 33, Rule 33. Time, line 2309): "Where the agreement names several keepers, the agreement's rule for what counts as recorded (terms field 3, rule 38) decides, counted the same way for…"
- A-1908 (no rule, Terms (type 0), field 3, line 2569): "named keepers, and the rule for what counts as recorded"

### R-183. Only the named keepers' records count

**Relation:** one narrower

- A-747 (Rule 38, Rule 38. Several keepers, line 929): "Only the named keepers' records count as testimony."
- A-760 (Rule 42, Rule 42. A record counts only alongside the act it names, line 955): "and the keeper is one named by the version, in force for the act, of an agreement the act belongs to ("Belongs to"), or, for…"
- A-823 (no rule, Made before, made after, item 5, line 1058): "An act for the collective that a line left out counts as made before that line when the keepers named by the collective's agreement in…"

### R-184. An anchor of a keeper's record shows it and every earlier record in the sequence existed by the anchor's point

**Relation:** one narrower

- A-757 (Rule 41, Rule 41. What a rotation cannot erase, and what an anchor adds, line 947): "An anchor of one of its records shows that record, and every record before it in the keeper's sequence, to have existed by the anchor's…"
- A-1728 (Rule 33, Rule 33. Time, line 2305): "An anchor of a keeper's record shows that record, and every record before it in the keeper's sequence, to have existed by the anchor's point…"

### R-185. A keeper record counts only alongside the act it names and while its signer's chain keeps it, save rule 42's exception

**Relation:** one narrower

- A-758 (Rule 42, Rule 42. A record counts only alongside the act it names, line 953): "the verifier holds the act it names;"
- A-759 (Rule 42, Rule 42. A record counts only alongside the act it names, line 954): "that act is valid as an act, and its signer is the identity the record names beside it;"
- A-761 (Rule 42, Rule 42. A record counts only alongside the act it names, line 957): "A record of an act nobody can produce changes no verdict."
- A-856 (Rule 76, Rule 76. Revocation, line 1108): "A keeper record or acknowledgement counts only alongside the act it names, and only while its own signer's chain keeps it valid (Identity, "Evidence counts…"
- A-2576 (no rule, Keeper record (type 2), what a verifier checks, line 3542): "it counts, for any rule that reads it, only as rule 42 says;"
- A-2577 (no rule, Keeper record (type 2), what a verifier checks, line 3543): "it counts only while its signer's chain keeps it valid (Identity, "Evidence counts only while its signer's chain keeps it"), save as rule 42 and…"

### R-186. A keeper's later rotation never undoes what its records placed

**Relation:** one narrower

- A-762 (Rule 42, Rule 42. A record counts only alongside the act it names, line 959): "A keeper's own later rotation never undoes what its records placed."
- A-763 (Rule 42, Rule 42. A record counts only alongside the act it names, line 959): "A keeper's record that a rule of this MIR reads to place an act (such as rules 7, 33, 41 and 76, a deal's declaration…"
- A-765 (Rule 42, Rule 42. A record counts only alongside the act it names, line 959): "This is Identity's stated exception to its rule that evidence counts only while its signer's chain keeps it (Identity, "Evidence counts only while its signer's…"
- A-819 (no rule, Made before, made after, item 4, line 1052): "a keeper's record that a rule reads to place an act (point 5), or that a version's completeness relies on (rule 47), as rule 42…"

### R-187. A record or rotation is a line: the change it puts in force takes effect there for the collective's acts

**Relation:** one narrower

- A-775 (no rule, Made before, made after: the collective's line, line 991): "Each takes effect for the collective's acts at a line."
- A-802 (no rule, Made before, made after, item 3, line 1026): "A rotation declaring a clone that removes a party, or takes a holder off an area, is that change's own line (rule 69)."
- A-1108 (Rule 69, Rule 69. Changing members, line 1500): "The record or rotation is a line, a rotation's history that of the signature acts its declaration names (rule 58): a change of members, of…"

### R-188. While an act a line's history names is not held, before/after is unknown and nothing is void

**Relation:** one narrower

- A-783 (no rule, Made before, made after, item 1, line 1000): "While an act the line's history names is not held, whether an act is before that line is unknown; nothing is void on it."
- A-784 (no rule, Made before, made after, item 1, line 1000): ""Made after" is read only where the line's history is held whole: a verifier with a hole in it voids nothing by the tie rule…"
- A-833 (no rule, Made before, made after, item 7, line 1072): ""Does not hold" is read on a history held whole: while an act the history names is not held, the action is unknown for that…"

### R-189. Lines are ordered among themselves only by what they cite

**Relation:** one narrower

- A-785 (no rule, Made before, made after, item 1, line 1002): "Lines are ordered among themselves the same way, by what they cite alone."
- A-825 (no rule, Made before, made after, item 5, line 1060): "Keepers place only acts for the collective: never a member's signature act, or one line against another, which only what the lines cite orders."

### R-190. An Identity witness act, or another identity's acknowledgement, places nothing on the collective's chain

**Relation:** one narrower

- A-793 (no rule, Made before, made after, item 2, line 1018): "An Identity witness act, on neither chain, places nothing and counts for nothing in Agreements."
- A-826 (no rule, Made before, made after, item 6, line 1064): "An acknowledgement by any other identity (Envelopes), a member's friend or a counterparty, carries no place on the collective's chain: it keeps the act visible…"
- A-881 (Rule 78, Rule 78. Acknowledgements, line 1144): "An Identity witness act (type 15), on neither chain, adopts nothing."

### R-191. A recovery rotation, where no other member remains to draw a record, places the declaration and its completing signatures

**Relation:** one narrower

- A-803 (no rule, Made before, made after, item 3, line 1028): "Rarely, a declaration takes effect at a recovery rotation: where no member other than the declared one remains to draw a record (a collective of…"
- A-804 (no rule, Made before, made after, item 3, line 1028): "That is the rotation that removes the declared member, declaring the clone that takes that party out of the parties, so that clone is counted…"
- A-805 (no rule, Made before, made after, item 3, line 1028): "Where the declaration's authority is a threshold needing more than its own signer, that rotation names the others' signature acts and places them there."
- A-2409 (no rule, Abandonment declaration (type 13), the rare cases: a threshold authority, line 3329): "So the recovery rotation places the others' signatures: its Agreements declaration names them, as it names its clone's, and they count at that rotation ("Collectives…"
- A-2421 (no rule, Collectives in the identity chain, line 3341): "The recovery rotation (the one removing a declared member, rule 85), where a declaration taking effect there needs other signatures than its signer's, adds a…"
- A-2438 (no rule, Collectives in the identity chain, the rare cases: a recovery rotation and a rollback, line 3360): "A recovery rotation places the signature acts on a declaration that its third element names, and only those, as it places its clone's."
- A-2439 (no rule, Collectives in the identity chain, the rare cases: a recovery rotation and a rollback, line 3362): "Each act the third element names must be a valid signature act (rule 6) naming an abandonment declaration (type 13) against a party that the…"

### R-192. A record's field 3 registers resignations, steppings down, declarations removing a voice and members' own rotations

**Relation:** one narrower

- A-807 (no rule, Made before, made after, item 4, line 1032): "The collective registers a member's rotation (Identity) on its line, as it registers a departure (record field 3)."
- A-2332 (no rule, Record (type 17), field 3, line 3216): "what it registers: resignations and steppings down by parties, abandonment declarations removing a party's voice, and parties' own rotations, each by its act's id; also…"

### R-193. An act a line never placed, or placed after the line registering the rotation, is judged by Identity alone

**Relation:** one narrower

- A-810 (no rule, Made before, made after, item 4, line 1036): "Such an act placed after that line is judged by Identity alone (rule 6)."
- A-822 (no rule, Made before, made after, item 4, line 1054): "An act a line never placed is judged by Identity alone: disowned by its signer's rotation, it is shown, and decides nothing."

### R-194. An act a counting act for the collective cites is adopted, and no ending racing that citation voids it

**Relation:** one narrower

- A-835 (no rule, Made before, made after, item 7, line 1076): "An act that an act for the collective that counts cites is adopted (rule 76), and no ending racing that citation voids it."
- A-872 (Rule 76, Rule 76. Revocation, line 1126): "Once adopted, no ending racing the adoption voids it."
- A-888 (Rule 79, Rule 79. Fate of acts, line 1152): "From then on the act is adopted (rule 76), and no ending racing that citation voids it."
- A-889 (Rule 79, Rule 79. Fate of acts, line 1154): "The promise, restated: safe once cited, against everything but the collusion of an ending's signers."

### R-195. A member's client signs no fork or closing until it holds every member's latest acts

**Relation:** one narrower

- A-840 (no rule, Made before, made after: the collective's line, line 1089): "For a fork or a closing it refuses: a member's client signs no fork or closing, its own or another member's, until it has pulled…"
- A-892 (Rule 79, Rule 79. Fate of acts, line 1156): "It needs every signer of the ending to collude against the counterparty: each conforming client refuses to sign it ("Made before, made after", client conformance)."

### R-196. In a deal, a declaration draws its own line: outcome 0 removes the voice from then on, and the others change the deal without the party

**Relation:** one narrower

- A-841 (no rule, Made before, made after: the collective's line, line 1091): "In a deal, a declaration draws its own line."
- A-843 (no rule, Made before, made after: the collective's line, line 1091): "An abandonment declaration with outcome 0 (rule 89) removes the party's voice in a deal from then on."
- A-844 (no rule, Made before, made after: the collective's line, line 1091): "Every signature act of that party on the deal counts as made after it, except one that the keepers the deal names recorded before recording…"
- A-846 (no rule, Made before, made after: the collective's line, line 1091): "The other parties then change the deal without the declared party (rule 47)."
- A-1518 (Rule 47, Rule 47: Termination, line 2011): "A party who is absent is handled by the absence rules (rules 85 to 89; in a deal one identity judges absence): where the deal…"
- A-1715 (Rule 89, Rule 89. Outcomes: Voice removed, line 2285): "in a deal, from the declaration on ("Made before, made after")."
- A-2385 (no rule, Abandonment declaration (type 13), line 3298): "In a deal, at its own place, as the deal's keepers record it ("Made before, made after")."

### R-197. A deal has no line of its own: no collective's line reaches or places its versions

**Relation:** same

- A-842 (no rule, Made before, made after: the collective's line, line 1091): "A deal has no chain of its own beyond its versions, and no collective's line reaches it."
- A-1503 (Rule 47, Rule 47: What others relied on stands, line 2000): "A deal has no line of its own, so nothing places its versions' signatures as a collective's line places them."

### R-198. What was put in force before or under a declaration is never undone by a later act of the party

**Relation:** one narrower

- A-845 (no rule, Made before, made after: the collective's line, line 1091): "So a clone of the deal completed, and so recorded, before it is never undone."
- A-1697 (Rule 87, Rule 87. Declaration, line 2255): "A later act of the party, or a later contest, never undoes what was put in force ("Made before, made after")."
- A-1716 (Rule 89, Rule 89. Outcomes: Voice removed, line 2287): "A clone put in force before then is never undone, whatever version of the clause or of the agreement the declaration names."
- A-2398 (no rule, Abandonment declaration (type 13), line 3314): "A later act of the party never makes a record fail that passed where it was drawn."

### R-199. A void act binds only where the grantor adopts it by a counting act acknowledging, citing or paying on it

**Relation:** one narrower

- A-859 (Rule 76, Rule 76. Revocation, line 1110): "The grantor may still adopt it (below), and then it binds."
- A-867 (Rule 76, Rule 76. Revocation, line 1118): "An act of the grantor that counts (for a person, an act of its own key; for a collective, an act for the collective that…"
- A-1206 (Rule 71, Rule 71. Leaving an area: an area with no holder, line 1616): "A void act binds the collective only where the collective itself, by an act for the collective that counts, acknowledges or pays on it, adopting…"

### R-200. A revocation cites every act under the grant its signer holds

**Relation:** one narrower

- A-862 (Rule 76, Rule 76. Revocation, line 1114): "A revocation cites every act under the grant its signer holds."
- A-863 (Rule 76, Rule 76. Revocation, line 1114): "the grantor's client cites, in the revocation's history, every act under the grant it holds, so that each act's holder, holding only its own act,…"

### R-201. The import act is retired: adoption is by acknowledging, citing or paying on

**Relation:** one narrower

- A-871 (Rule 76, Rule 76. Revocation, line 1124): "There is no fourth way: the import act is retired (rule 77)."
- A-876 (Rule 77, Rule 77. Import, line 1134): "Type 11 is retired, never reused; adoption is by acknowledging, citing or paying on (rule 76)."
- A-1887 (no rule, Part five: act formats, the type table, line 2539): "*Retired*: adoption is by acknowledging, citing or paying on (rule 76); never reused"

### R-202. Rules 90 and 91 (and majorities, areas, models) are for collectives only

**Relation:** one narrower

- A-902 (Rule 90, Rule 90. Forks of records, line 1178): "Collectives only."
- A-1501 (Rule 47, Rule 47. A deal changes only with everyone's signature, line 1998): "Majorities, areas and control models belong to collectives: a deal names no control model (rule 99), and rules 90 and 91 apply to collectives only."

### R-203. Nobody on the publication's side changes the plan or the owners' line alone

**Relation:** one narrower

- A-915 (Rule 15, Rule 15. One ownership, many publications: money passes layer by layer, line 1194): "Nobody on the publication's side changes the owners' line alone (rule 27)."
- A-1052 (Rule 27, Rule 27. Only the plan, line 1407): "It MUST NOT change the plan: only the publication's parties can, by a new version."

### R-204. A share held by a collective is paid at the collective's payee pointer, leading to its split service

**Relation:** one narrower

- A-919 (Rule 15, Rule 15. One ownership, many publications: money passes layer by layer, line 1198): "An owner that is a collective is paid at the collective's own payee pointer, which leads to the split service its own split agreement names;…"
- A-1039 (Rule 23, Rule 23. Pay out, line 1381): "A share held by a collective is paid to the collective's own payee pointer, which leads to its split service (rule 15); a share held…"
- A-2174 (no rule, Split plan and split (type 8), line 2990): "A holder that is a collective receives at its own payee pointer (rule 23)."
- A-2183 (no rule, Split plan and split (type 8), what a verifier checks against the plan, line 3002): "an owners' line payout names the ownership agreement in key 2 and pays a holder of its stake in the version in force for the…"

### R-205. A share held by another ownership agreement is paid through it to its holders by their shares

**Relation:** one narrower

- A-921 (Rule 15, Rule 15. One ownership, many publications: money passes layer by layer, line 1200): "An owner that is another ownership agreement (a manifest's parts, rule 7) is paid through it: the split service divides that owner's part among that…"
- A-1039 (Rule 23, Rule 23. Pay out, line 1381): "A share held by a collective is paid to the collective's own payee pointer, which leads to its split service (rule 15); a share held…"
- A-2175 (no rule, Split plan and split (type 8), line 2990): "A holder that is another ownership agreement is paid through it: its part divided among its holders, each payout naming that agreement in key 2…"
- A-2183 (no rule, Split plan and split (type 8), what a verifier checks against the plan, line 3002): "an owners' line payout names the ownership agreement in key 2 and pays a holder of its stake in the version in force for the…"

### R-206. Anything taken off the top added or raised pays the stake less and needs the holders' consent

**Relation:** they differ: 1081 requires the signature of every holder with no voice; 924 and 997 ask the owners' consent, which 1085 lets a control model give together

- A-924 (Rule 15, Rule 15. One ownership, many publications: money passes layer by layer, line 1202): "It is the collective's protected clause, signed for the collective under the judicial tier's rule (rule 67), since it can move money; a version of…"
- A-997 (Rule 22, Rule 22. Role shares with evidence, line 1316): "Raising that part pays the holders less, so it needs the owners' consent (rules 48, 98); spending it is the collective's business, done under its…"
- A-1055 (Rule 28, Rule 28. Fees, line 1413): "The bearers (every share, fees coming off the top) consent by the publication's signatures: every party signs it, and a holder of the ownership agreement…"
- A-1081 (Rule 48, Rule 48. No stake reduced without its holder, line 1466): "For a collective's stake in itself, a version of the collective's split agreement (rule 15) that pays the stake less needs the signature of every…"
- A-1085 (Rule 48, Rule 48. No stake reduced without its holder, line 1472): "In a collective, its control model may let holders consent together (rule 99): where the change hits every holder of the stake alike, holders meeting…"
- A-1095 (Rule 48, Rule 48. No stake reduced without its holder, line 1476): "The collective's own part off the top (rule 22) is overhead like any other: raising it pays the stake less."
- A-1096 (Rule 48, Rule 48. No stake reduced without its holder, line 1480): "Since a split plan pays non-owners off the top only, the rest is the owners': a stake is paid less by anything taken off the…"

### R-207. Any agreement may be a party to another, consenting by its own rule

**Relation:** one narrower

- A-925 (Rule 15, Rule 15. One ownership, many publications: money passes layer by layer, line 1204): "Any agreement may be a party to another."
- A-926 (Rule 15, Rule 15. One ownership, many publications: money passes layer by layer, line 1206): "Any agreement may be a party of any agreement, consenting by its own rule."

### R-208. A collective enters an agreement or publication through a member, under its rule for Agreements

**Relation:** one narrower

- A-928 (Rule 15, Rule 15. One ownership, many publications: money passes layer by layer, line 1206): "A collective signs through a member, under its rule for Agreements (rule 60)."
- A-1464 (Rule 98, Rule 98. The last resort, guarantees, line 1960): "entering a publication, or any agreement, as a party is an act of the Agreements layer under its rule, never of a control model's power…"

### R-209. Nesting of ownership agreements is bounded at 8 layers

**Relation:** one narrower

- A-933 (Rule 15, Rule 15. One ownership, many publications: money passes layer by layer, line 1210): "Nesting is bounded at 8 layers, a freeze parameter ("Parameters")."
- A-2183 (no rule, Split plan and split (type 8), what a verifier checks against the plan, line 3002): "an owners' line payout names the ownership agreement in key 2 and pays a holder of its stake in the version in force for the…"

### R-210. Liquidation: the collective's stakes are sold, transferred or released before its closing, which names no stake

**Relation:** one narrower

- A-935 (Rule 15, Rule 15. One ownership, many publications: money passes layer by layer, line 1212): "A collective is liquidated by ordinary sales and transfers before its closing: each share it holds sold or moved by a transfer (rule 10), or…"
- A-1314 (Rule 91, Rule 91. How a collective ends: four shapes, line 1749): "Its works are sold (stake transfers, rule 10) or released to the public domain (rule 55), then it closes."
- A-1319 (Rule 91, Rule 91. How a collective ends: four shapes, line 1749): "This is the whole of liquidation: ordinary sales, transfers and releases before the closing, the closing naming no stake."
- A-1321 (Rule 91, Rule 91. How a collective ends: four shapes, line 1749): "Batching them is a client's or a cMIP's convenience, never a second way in the core."
- A-2555 (no rule, Closing (type 20), an absentee's money share, line 3511): "A collective is liquidated by ordinary sales and transfers before its closing (rule 10): its stakes sold or moved by stake transfers, or released, so…"
- A-2562 (no rule, Closing (type 20), an absentee's money share, line 3516): "The closing names no stake and moves none."

### R-211. The split cMIP is the publication's task 8 or the plan's key 1, the same specification where both are named

**Relation:** one narrower

- A-944 (Rule 15, Rule 15. One ownership, many publications: money passes layer by layer, line 1222): "How a split service runs is defined by the split cMIP its publication names (publication field 9, task 8; or the split plan's key 1)."
- A-2140 (no rule, Split plan and split (type 8), split plan key 1, line 2937): "split cMIP, which declares the remainder rule and computes the amounts; the same as field 9's task 8 where both name one"

### R-212. A publication's parties are the owners' side, each partner and the split service, each signing; it is always public

**Relation:** one narrower

- A-947 (Rule 16, Rule 16. Named by the publication, line 1226): "The service is a party: it signs the publication to accept it (rule 11), with any limits the parties choose in the publication's terms (for…"
- A-1882 (no rule, Part five: act formats, the type table, line 2534): "always public. Its drafter, completed by the signature acts of its other parties: the owners' side (the ownership agreement it names, consenting by its own…"
- A-2091 (no rule, Publication (type 6): its parties, line 2872): "Its parties are the owners' side (the ownership agreement field 1 names, consenting by its own rule; or, without field 1, its drafter), each partner,…"
- A-2092 (no rule, Publication (type 6): it counts, line 2874): "it is valid and public;"

### R-213. A payment to a pointer bypassing the service is still a purchase; the other shares are the receiver's open obligation

**Relation:** one narrower

- A-951 (Rule 16, Rule 16. Named by the publication, line 1230): "A payment to a pointer that bypasses the service is still a purchase; the pointer is shown as bypassing, and what every other share of…"
- A-1069 (Rule 30, Rule 30. Open obligations, line 1440): "what the other shares of a payment to a pointer bypassing the service would have been, of the identity that received it (rule 16)."

### R-214. The split task: the cMIP accepts the publication and the attempts made, and produces the receiver; the next payment starts again from the first

**Relation:** one narrower

- A-964 (Rule 17, Rule 17. The split task, handed to the split cMIP the publication names, line 1258): "the next payment starts again from the first."
- A-968 (Rule 17, Rule 17. The split task, handed to the split cMIP the publication names, line 1266): "The task: the cMIP accepts the publication and the attempts made for a payment, and produces the receiver for this payment."
- A-1075 (Rule 31, Rule 31. Switching services, line 1448): "It receives a payment whenever the attempts before it fail, payment by payment, and the next payment is tried at field 3's service again (rule…"
- A-1771 (no rule, The tasks, one by one, line 2379): "It also accepts the publication and the attempts made for a payment, and produces the receiver for this payment (rule 17)."

### R-215. A split service must not pay anyone outside the owners, partners, evidenced roles and fees; any other payout is a mismatch

**Relation:** one narrower

- A-971 (Rule 17, Rule 17. The split task, handed to the split cMIP the publication names, line 1271): "A payout to anyone else on the owners' line is a mismatch (rule 27), whatever any cMIP answers."
- A-1051 (Rule 27, Rule 27. Only the plan, line 1405): "A split service MUST NOT pay anyone outside the owners as the ownership agreement's version in force for the receipt names them, the partners, the…"
- A-2185 (no rule, Split plan and split (type 8), line 3005): "Any payout to anyone else is a mismatch: never an address the parties did not sign."

### R-216. What a service cannot deliver stays where it is as a visible open obligation

**Relation:** one narrower

- A-972 (Rule 17, Rule 17. The split task, handed to the split cMIP the publication names, line 1272): "Where every attempt fails, the money stays where it is, an open obligation of whoever holds it (rules 24, 30)."
- A-1041 (Rule 24, Rule 24. Keep what it cannot deliver, line 1385): "The service keeps what it cannot deliver as open obligations, visible until paid."

### R-217. For every incoming receipt, or payer's claim showing money arrived, the service signs a split

**Relation:** one narrower

- A-982 (Rule 20, Rule 20. Sign a split, line 1300): "For every incoming receipt, and for every payer's claim that shows money arrived without one, the service signs a split."
- A-1049 (Rule 26, Rule 26. Batching, line 1401): "Every incoming receipt must still be matched by a split, so accumulation is visible."
- A-1063 (Rule 30, Rule 30. Open obligations, line 1431): "every incoming receipt, and every payer's claim showing money arrived, without a matching split;"

### R-218. A split's payouts sum exactly to the amount received

**Relation:** same

- A-986 (Rule 21, Rule 21. Conservation, line 1306): "A split's payouts MUST sum exactly to the amount received, in the unit's smallest part."
- A-2157 (no rule, Split plan and split (type 8), split key 1, line 2963): "each payout, summing exactly to the amount received"

### R-219. Under the default rule every leftover unit goes where rule 9 sends it; a split cMIP declares its own remainder rule, or rule 9 applies

**Relation:** one narrower

- A-988 (Rule 21, Rule 21. Conservation, line 1308): "Under the default rule, every leftover unit goes exactly where rule 9 sends it, so a unit sent elsewhere is a deviation."
- A-989 (Rule 21, Rule 21. Conservation, line 1310): "The split cMIP declares its remainder rule; where it declares none, leftovers follow rule 9."
- A-1770 (no rule, The tasks, one by one, line 2379): "It produces payouts that sum exactly, with its declared remainder rule and the evidence for each role share."
- A-2140 (no rule, Split plan and split (type 8), split plan key 1, line 2937): "split cMIP, which declares the remainder rule and computes the amounts; the same as field 9's task 8 where both name one"
- A-2173 (no rule, Split plan and split (type 8), line 2988): "For the owners' line, each holder of the stake in the version in force for the receipt (rule 12) receives its share of what is…"

### R-220. The collective's own part is paid to its vault, never split again

**Relation:** one narrower

- A-995 (Rule 22, Rule 22. Role shares with evidence, line 1316): "That part is the collective's own money, kept, and never split again: it is paid to the collective's vault (Money rule 2, "The vault"), never…"
- A-2184 (no rule, Split plan and split (type 8), what a verifier checks against the plan, line 3003): "the collective's own part, in a collective's split agreement (a partner naming the collective, rule 22), is paid to an entry of the collective's vault,…"

### R-221. A helper the parties name in advance is a partner and needs no evidence

**Relation:** one narrower

- A-998 (Rule 22, Rule 22. Role shares with evidence, line 1318): "A helper the parties name in advance (a host, a mastering service) is a partner, and needs no evidence."
- A-1015 (Rule 22, Rule 22. Role shares with evidence, line 1337): "a service the parties chose in advance is paid as a partner;"

### R-222. Role-share evidence is an act signed by someone other than the split service and the payee

**Relation:** one narrower

- A-1001 (Rule 22, Rule 22. Role shares with evidence, line 1320): "The proof MUST be an act signed by someone other than the split service and the payee."
- A-2166 (no rule, Split plan and split (type 8), payout key 4, line 2978): "the evidence for that role: an act signed by someone other than the split service and the payee, or, for a rail Module's role share,…"

### R-223. A relay's delivery record counts as evidence for the object paid for

**Relation:** they differ: 1005 requires the object to be the one the payment was for; 2104 accepts the media of any bake the publication sells

- A-1005 (Rule 22, Rule 22. Role shares with evidence, line 1327): "For a relay's delivery record, the object it names is the one the payment was for, where the verifier reads the record's format."
- A-2104 (no rule, Publication (type 6): delivery records, line 2887): "A relay's delivery record counts on a purchase under a publication where its object is the media of a bake the publication sells (any of…"

### R-224. An unfilled role share follows the plan's option: owners' line, held open, or a named party

**Relation:** same

- A-1027 (Rule 22, Rule 22. Role shares with evidence, line 1363): "A role share nobody fills follows the option the plan chose: to the owners pro rata, held open as an obligation, or to a named…"
- A-2152 (no rule, Split plan and split (type 8), split plan, unfilled, line 2955): "to the owners' line / held open / to a named party"

### R-225. Absent a choice, an unfilled role share goes to the owners' line

**Relation:** one narrower

- A-1029 (Rule 22, Rule 22. Role shares with evidence, line 1363): "Absent a choice, it goes to the owners' line, shown before signing (Development rule 13)."
- A-2141 (no rule, Split plan and split (type 8), split plan key 3, line 2939): "what happens to a role share nobody fills, or a metric share no record measures; absent: [ 0 ], to the owners' line"

### R-226. A role share is named by its role, filled at payment time, never by a cMIP's hash

**Relation:** one narrower

- A-1030 (Rule 22, Rule 22. Role shares with evidence, line 1365): "A role share is named by its role, never by a cMIP's hash: a new transport cMIP needs no new version of every publication."
- A-2148 (no rule, Split plan and split (type 8), split plan, share-rule [ 1 ], line 2949): "a role, by its name, filled at payment time"

### R-227. Several fillers of one role divide it equally

**Relation:** one narrower

- A-1036 (Rule 22, Rule 22. Role shares with evidence, line 1375): "Several fillers of one role divide it equally."
- A-2180 (no rule, Split plan and split (type 8), what a verifier checks against the plan, line 2999): "a role payout fills a role the plan names; several fillers of one role are paid equally, within one unit;"

### R-228. The split plan says who bears payout rail fees: each receiver by default, or the service

**Relation:** same

- A-1043 (Rule 25, Rule 25. Payout fees, line 1389): "The split plan says who bears each payout's rail fee: each receiver by default, or the split service as part of its cut."
- A-2142 (no rule, Split plan and split (type 8), split plan key 5, line 2941): "who bears payout rail fees: 0 each receiver (default), 1 the split service"

### R-229. The plan may state a maximum fee per payout; absent, no cap

**Relation:** one narrower

- A-1044 (Rule 25, Rule 25. Payout fees, line 1389): "It may state a maximum fee per payout (plan key 6); where it states none, there is no cap."
- A-2143 (no rule, Split plan and split (type 8), split plan key 6, line 2942): "maximum fee per payout the service may deduct: absolute, or in millionths of the payout; absent: no cap, flagged before signing (rule 25)"

### R-230. A retired type: a Module states its fee in its own specification

**Relation:** one narrower

- A-1053 (Rule 28, Rule 28. Fees, line 1411): "A Module states its fee in its own specification (Development field 7), machine-readable and informative."
- A-1891 (no rule, Part five: act formats, the type table, line 2543): "*Retired*: a Module states its fee in its own specification (Development field 7); never reused"

### R-231. Only a fee entry makes a fee owed; a split omitting an owed fee is wrong, and the fee is the service's open obligation

**Relation:** one narrower

- A-1054 (Rule 28, Rule 28. Fees, line 1411): "Only a fee entry of the publication's split plan (key 9) makes a fee owed, and nothing is forced."
- A-1057 (Rule 28, Rule 28. Fees, line 1415): "A split leaving out a fee its entry makes owed is a wrong split, and the fee is the service's open obligation."
- A-1065 (Rule 30, Rule 30. Open obligations, line 1433): "every fee a split left out though its entry made it owed;"
- A-2181 (no rule, Split plan and split (type 8), what a verifier checks against the plan, line 3000): "a fee payout is a fee entry's, its receiver the identity the Module's specification names as paid (Development field 7), or its creator where it…"

### R-232. Fees are borne by every share, off the top

**Relation:** one narrower

- A-1055 (Rule 28, Rule 28. Fees, line 1413): "The bearers (every share, fees coming off the top) consent by the publication's signatures: every party signs it, and a holder of the ownership agreement…"
- A-2146 (no rule, Split plan and split (type 8), split plan key 9, line 2946): "fees, each borne by every share, off the top (rule 28)"
- A-2153 (no rule, Split plan and split (type 8), split plan, fee, line 2957): "borne by every share, off the top (rule 28)"
- A-2176 (no rule, Split plan and split (type 8), line 2992): "Every fee, partner's, role and metric share is taken before the owners' line divides, so it falls alike on every owner."

### R-233. A fee entry applies to every payment, a named bake's, or a named rail's

**Relation:** one narrower

- A-1056 (Rule 28, Rule 28. Fees, line 1415): "A fee entry says when it applies: every payment, payments for a named bake, or payments by a named rail."
- A-2154 (no rule, Split plan and split (type 8), split plan, scope [ 0 ], line 2958): "payments for this bake; absent: every payment"
- A-2155 (no rule, Split plan and split (type 8), split plan, scope [ 1 ], line 2959): "payments by this rail Module"

### R-234. The split's list of Modules is the service's statement, never what decides

**Relation:** same

- A-1058 (Rule 28, Rule 28. Fees, line 1415): "The split's list of Modules (key 6) is the service's statement, never what decides."
- A-2161 (no rule, Split plan and split (type 8), split key 6, line 2968): "the Modules and cMIPs it ran under (rule 28): the service's statement, never what decides"

### R-235. A metric share's records are named in the split (key 7)

**Relation:** one narrower

- A-1061 (Rule 29, Rule 29. Attention, line 1423): "The metric, its module and the resulting payouts are named (the metric and its share in the plan, the records in split key 7), so…"
- A-2162 (no rule, Split plan and split (type 8), split key 7, line 2969): "the metric records it divides by (rule 29)"

### R-236. A metric's measurer signs its record and is neither the split service nor one of those it divides among

**Relation:** one narrower

- A-1062 (Rule 29, Rule 29. Attention, line 1425): "The metric's evidence is a record signed by the identity running the service that measured it: never by the split service, and never by a…"
- A-1070 (Rule 30, Rule 30. Open obligations, line 1442): "A metric's measurer is none of the identities the metric divides among, nor the split service (rule 29)."
- A-2182 (no rule, Split plan and split (type 8), what a verifier checks against the plan, line 3001): "a metric payout names a metric share; its receiver is one the plan already pays (the publication's partners and every holder of the stake of…"

### R-237. A metric pays only identities the plan already pays

**Relation:** one narrower

- A-1071 (Rule 30, Rule 30. Open obligations, line 1442): "A metric pays only identities the plan already pays: the publication's partners and every holder of the stake of the ownership agreement it names, in…"
- A-2182 (no rule, Split plan and split (type 8), what a verifier checks against the plan, line 3001): "a metric payout names a metric share; its receiver is one the plan already pays (the publication's partners and every holder of the stake of…"

### R-238. A declaration of absence moves a stake by succession, or by redistribution (outcome 1) where the plan names no stake successor

**Relation:** they differ: 1703 says a declaration moves a stake 'only by succession'; 1079, 1455, 1691 and 1707 also let outcome 1 redistribute it where no successor is named

- A-1079 (Rule 48, Rule 48. No stake reduced without its holder, line 1464): "A stake moved by succession is not a reduction, and the only advance permissions that move a stake without its holder are rule 89's: a…"
- A-1455 (Rule 98, Rule 98. The last resort, 4, line 1951): "A vanished party's absence is declared only by the authority its clause names, and moves its stake only by succession or by sharing it out…"
- A-1691 (Rule 87, Rule 87. Declaration: The core checks, line 2249): "that, where the party's succession plan names a stake successor, it does not state outcome 1 (rule 89)."
- A-1703 (Rule 89, Rule 89. Outcomes, line 2269): "A declaration moves a stake only by succession: the stake, and its pay with it, goes to the stake successors the holder's succession plan names,…"
- A-1707 (Rule 89, Rule 89. Outcomes: The outcomes, line 2275): "stake redistributed among remaining holders in proportion, only where the holder's succession plan names no stake successor;"

### R-239. No advance permission reaches what one holder is paid unlike the others; that holder alone signs it

**Relation:** one narrower

- A-1087 (Rule 48, Rule 48. No stake reduced without its holder, line 1474): "No advance permission reaches what one holder is paid unlike the others."
- A-1088 (Rule 48, Rule 48. No stake reduced without its holder, line 1474): "A rule the holder accepted, by signing or by buying, reaches what every holder of the stake is paid alike (rule 98); nothing reaches what…"
- A-1462 (Rule 98, Rule 98. The last resort, guarantees, line 1958): "nothing reaches what one holder is paid unlike the others of its stake: that holder alone signs it (rule 48);"

### R-240. Abandonment never lowers what a stake is paid while it stays with its holder

**Relation:** same

- A-1089 (Rule 48, Rule 48. No stake reduced without its holder, line 1474): "Abandonment never lowers what a stake is paid while the stake stays with its holder."
- A-1705 (Rule 89, Rule 89. Outcomes, line 2269): "Abandonment never lowers what a stake is paid while the stake stays with its holder (rule 48)."

### R-241. A declaration may name a holder who is no party, with the stake-moving outcomes only

**Relation:** one narrower

- A-1090 (Rule 48, Rule 48. No stake reduced without its holder, line 1474): "A departed holder who vanishes does not block the collective's fees, because its stake moves: declared absent, which a declaration may do although the holder…"
- A-1665 (Rule 85, Rule 85. Clause, line 2219): "In a collective, a declaration may also name a holder of the collective's stake in itself who is no party: a departed holder, a stake…"
- A-1671 (Rule 85, Rule 85. Clause, line 2219): "Against such a holder its outcomes are the stake-moving ones only: succession, as rule 89 says, or outcome 1 where the holder's plan names no…"
- A-1672 (Rule 85, Rule 85. Clause, line 2219): "Against a holder who is no party and whose plan names a stake successor, the declaration states no outcome (field 3 empty), and the stake…"
- A-1687 (Rule 87, Rule 87. Declaration, line 2243): "In a collective the party may be a holder of its stake in itself who is no party, under the clause rule 85 names for…"
- A-1689 (Rule 87, Rule 87. Declaration: The core checks, line 2247): "that the outcome is one the clause allows;"
- A-1711 (Rule 89, Rule 89. Outcomes, line 2281): "Against a holder of the collective's stake in itself who is no party: the stake passes to its stake successor, as above, or, where its…"
- A-2379 (no rule, Abandonment declaration (type 13), CDDL, line 3285): "the party declared absent: a party to the agreement of field 0, or, in a collective, a holder of the collective's stake in itself who…"
- A-2380 (no rule, Abandonment declaration (type 13), CDDL, line 3287): "the outcomes (rule 89), ascending, none twice, each one the clause allows; at least one against a party; against a holder who is no party,…"
- A-2392 (no rule, Abandonment declaration (type 13), line 3309): "the party is a party to the agreement field 0 names, or, in a collective, a holder of its stake in itself who is no…"
- A-2394 (no rule, Abandonment declaration (type 13), line 3311): "every outcome it states is one the clause allows: for a party, the clause in force, the abandonment clause of the agreement field 0 names;…"

### R-242. A record puts nothing in force for a clone only a rotation may declare

**Relation:** one narrower

- A-1104 (Rule 69, Rule 69. Changing members, line 1496): "A clone put in force by a record where a rotation was needed puts nothing in force."
- A-2348 (no rule, Record (type 17), line 3240): "A record puts its clone in force only as rules 72 and 90 say: complete, its parent the agreement in force for the record, or…"

### R-243. A record or rotation puts its clone in force with the signature acts it names, and only those

**Relation:** one narrower

- A-1105 (Rule 69, Rule 69. Changing members, line 1496): "The record or rotation names the signature acts that complete the clone, and places each at its own position; the clone counts as complete there…"
- A-2343 (no rule, Record (type 17), line 3232): "A record puts its clone in force with the signature acts it names, and only those."
- A-2347 (no rule, Record (type 17), line 3238): "A signature act naming the clone that field 2 does not name counts nothing toward it at this record, whenever it was made."
- A-2427 (no rule, Collectives in the identity chain, line 3346): "A rotation puts its clone in force with the signature acts its declaration names, and only those, as a record does:"
- A-2431 (no rule, Collectives in the identity chain, line 3352): "A signature act naming the clone that the declaration does not name counts nothing toward it there, whenever it was made."

### R-244. A clone taking a party out of the parties takes it out of every area it held

**Relation:** one narrower

- A-1109 (Rule 69, Rule 69. Changing members, line 1502): "A clone that takes a party out of the parties takes it out of every area's holders too."
- A-1146 (Rule 70, Rule 70. A member can always leave alone, line 1546): "The remaining members then clone its agreement without the departed party, which takes the party out of every area it held too."
- A-1237 (Rule 83, Rule 83. Execution, line 1670): "the party out of every area it held;"
- A-1253 (Rule 83, Rule 83. Execution, line 1687): "The clone that completes the succession, automatic or by nomination, takes the party out of the holders of every area it held, leaving the control…"

### R-245. Such a clone leaves the control model's parameters as they are: the model reads a departed party out of its areas itself

**Relation:** one narrower

- A-1110 (Rule 69, Rule 69. Changing members, line 1502): "It may leave the control model's parameters as they are: the model reads a holder who is no party of the agreement in force out…"
- A-1235 (Rule 83, Rule 83. Execution, line 1668): "It comes into force on the trigger (rule 82) and their signatures, with no other power, provided it changes nothing but what the plan gives…"
- A-1253 (Rule 83, Rule 83. Execution, line 1687): "The clone that completes the succession, automatic or by nomination, takes the party out of the holders of every area it held, leaving the control…"

### R-246. A party removed by a constitutional clone, or resigning, keeps its stake as a departed holder

**Relation:** one narrower

- A-1112 (Rule 69, Rule 69. Changing members, line 1504): "A constitutional clone that removes a party who did not sign it, where the constitutional change rule allows that, takes that party's voice only."
- A-1113 (Rule 69, Rule 69. Changing members, line 1504): "The party keeps every stake it holds (rule 48), as a departed holder, under the collective's current rules and judges."
- A-1145 (Rule 70, Rule 70. A member can always leave alone, line 1544): "The party keeps its stake, and stays bound by what it signed; it is then a departed holder."

### R-247. A rotation may declare any constitutional clone

**Relation:** same

- A-1115 (Rule 69, Rule 69. Changing members, line 1506): "A rotation may declare any constitutional clone."
- A-2419 (no rule, Collectives in the identity chain, line 3340): "Only such clones need the collective's chain key to rotate; a rotation may also declare any other constitutional clone (rule 69)."

### R-248. A rotation declares a clone of the agreement in force, read for the way out along the constitutional clones alone

**Relation:** one narrower

- A-1116 (Rule 69, Rule 69. Changing members: what each declared agreement MUST be, line 1510): "be a clone of the agreement in force at the rotation (the one declared before it, or recorded since, rule 72), its parent (field 11)…"
- A-1473 (Rule 98, Rule 98. The last resort, model not held, line 1964): "For the way out, and for whether a collective is broken, the agreement in force is read along the line's constitutional clones alone, each judged…"

### R-249. A declared clone is complete only with the signature acts the declaration names

**Relation:** one narrower

- A-1117 (Rule 69, Rule 69. Changing members: what each declared agreement MUST be, line 1511): "be complete with the signature acts"
- A-2430 (no rule, Collectives in the identity chain, line 3350): "the clone is complete at the rotation only if it is complete (rule 45) judged with those signature acts alone, the powers its mark names…"

### R-250. A rotation declares only clones whose every change is constitutional

**Relation:** one narrower

- A-1118 (Rule 69, Rule 69. Changing members: what each declared agreement MUST be, line 1512): "make a constitutional change, and nothing but constitutional changes (rule 98): a clone a rotation declares that also changes what the control model governs is…"
- A-1338 (Rule 93, Rule 93. A broken collective, and its way back, line 1781): "it makes no constitutional change (rule 98); or"
- A-1454 (Rule 98, Rule 98. The last resort, 3, line 1950): "A rotation declares only a clone whose every change is constitutional (rule 69), the operational part recorded separately by a record, so that telling a…"

### R-251. A rotation whose declared agreement fails rule 69 breaks the collective until a rollback

**Relation:** one narrower

- A-1119 (Rule 69, Rule 69. Changing members, line 1514): "Otherwise the collective's acts that need member signatures count for nothing: the collective is broken from that rotation on, until a rollback brings it back…"
- A-1335 (Rule 93, Rule 93. A broken collective, and its way back, line 1778): "A collective is broken when its chain key moved by a rotation whose declared agreement fails rule 69, or whose Agreements declaration is missing or…"

### R-252. A rotation removing the Agreements declaration, or carrying one in neither form, is a broken act

**Relation:** same

- A-1120 (Rule 69, Rule 69. Changing members, line 1514): "So it is where a rotation removes the collective's Agreements declaration or carries one that cannot be read."
- A-1341 (Rule 93, Rule 93. A broken collective, and its way back, line 1784): "it removes the Agreements declaration; or"
- A-1342 (Rule 93, Rule 93. A broken collective, and its way back, line 1785): "it carries one in neither form."
- A-1426 (Rule 93, Rule 93. A broken collective, and its way back, line 1910): "A rotation that removes the collective's Agreements declaration, or carries one in neither form, is a broken act too, a technical one, with the same…"

### R-253. A rollback is a clone of the agreement in force just before the broken act, and need make no constitutional change

**Relation:** one narrower

- A-1121 (Rule 69, Rule 69. Changing members, line 1516): "A rollback is the one exception to this rule: it is a clone of the agreement in force just before the broken act, and need…"
- A-1397 (Rule 93, Rule 93. A broken collective, and its way back, line 1863): "whose parent (field 11) is the agreement in force just before the broken act, the one in force at that rotation (rule 72); and"
- A-2445 (no rule, Collectives in the identity chain, the rare cases: a recovery rotation and a rollback, line 3370): "its clone's parent is the agreement in force just before the broken act;"

### R-254. A rule counted among a stake's holders ([5, stake, share]) counts holders members or not, and is for field 18 only

**Relation:** one narrower

- A-1125 (Rule 69, Rule 69. Changing members: owners may choose who runs the collective, line 1524): "A collective may, in its constitution, count the power over membership among a stake's holders by share: its constitutional change rule (field 18) written as…"
- A-1658 (Rule 61, Rule 61. Every constitutional voice is covered, line 2207): "Under a constitutional change rule counted among a stake's holders, holders who are no parties are counted too."
- A-1962 (no rule, Terms (type 0), rule, line 2687): "those counted, holding together at least this share, in millionths, of the stake (index 0)"
- A-1964 (no rule, Terms (type 0), rule, line 2690): "the holders of the stake, members or not, holding together at least this share of it ; field 18 only"
- A-1976 (no rule, Terms (type 0): rules by share, line 2717): "A rule among a stake's holders (`[5, stake, share]`) is for field 18 only, alone or within "all of"."

### R-255. The constitution counting membership among a stake's holders is kept as every constitution is, by the broken collective

**Relation:** same

- A-1128 (Rule 69, Rule 69. Changing members: owners may choose who runs the collective, line 1526): "How it is kept: as every constitution is, by the broken collective (rule 93)."
- A-1345 (Rule 93, Rule 93. A broken collective, and its way back, line 1791): "This is also how a constitution counting membership among a stake's holders is kept (rule 69)."

### R-256. A member's client registers a departure or a member's rotation in its next record

**Relation:** one narrower

- A-1140 (Rule 70, Rule 70. A member can always leave alone, line 1540): "Any member's client draws that line in its next act for the collective, by a record (rule 72)."
- A-2369 (no rule, Record (type 17), line 3262): "*Client conformance:* a member's client registers a departure, and a member's rotation it learns of, in its next record, as it records a complete clone…"

### R-257. Departed holders are recorded with their stake in the departed members entry (field 22), present only with a key grammar

**Relation:** one narrower

- A-1148 (Rule 70, Rule 70. A member can always leave alone, line 1546): "They record the departed party, with its stake in the collective itself (field 7), in the departed members entry (field 22)."
- A-1270 (Rule 91, Rule 91. How a collective ends: four shapes, line 1716): "The members who leave become departed holders, recorded with their stake in the departed members entry (field 22), keeping it under equal treatment, the pointer…"
- A-1926 (no rule, Terms (type 0), field 22, line 2598): "the departed members entry: who left the collective (rule 70; only with field 12)"
- A-2021 (no rule, Terms (type 0): the departed members entry, line 2776): "The departed members entry (field 22) appears only in terms carrying a key grammar."

### R-258. A member can resign in a broken stretch, naming the agreement before the break; the rollback registers it

**Relation:** one narrower

- A-1153 (Rule 70, Rule 70. A member can always leave alone: Leaving a broken collective, line 1554): "A member can leave a broken collective too (rule 93)."
- A-1154 (Rule 70, Rule 70. A member can always leave alone: Leaving a broken collective, line 1556): "names the agreement in force just before the broken act;"
- A-1405 (Rule 93, Rule 93. A broken collective, and its way back, line 1873): "whose resignation, stepping down from an area, or declaration of absence the rollback itself registers."
- A-1411 (Rule 93, Rule 93. A broken collective, and its way back, line 1881): "The rollback may register a declaration of absence made during the broken stretch under the clause of the agreement in force just before the broken…"
- A-2424 (no rule, Collectives in the identity chain, line 3342): "Those acts are resignations and steppings down (type 16), declarations of absence (type 13), and the signature acts on those declarations that their authority needs…"
- A-2449 (no rule, Collectives in the identity chain, the rare cases: a recovery rotation and a rollback, line 3376): "a valid resignation or stepping down (type 16) by a party of the agreement in force just before the broken act, naming that agreement or…"
- A-2450 (no rule, Collectives in the identity chain, the rare cases: a recovery rotation and a rollback, line 3377): "a declaration of absence (type 13) with outcome 0 against such a party, under the clause of that agreement or one it descends from."
- A-2453 (no rule, Collectives in the identity chain, the rare cases: a recovery rotation and a rollback, line 3378): "or such a signature act."

### R-259. A rollback is a line: its clone is in force after it, and the departures it registers take effect there

**Relation:** one narrower

- A-1155 (Rule 70, Rule 70. A member can always leave alone: Leaving a broken collective, line 1557): "takes effect at the collective's next valid line: normally the rollback, which registers it ("Collectives in the identity chain"), or else the first record after…"
- A-1412 (Rule 93, Rule 93. A broken collective, and its way back, line 1883): "The rollback is a line, by the signature acts its declaration names, as every rotation is ("Made before, made after"): its clone is in force…"
- A-2443 (no rule, Collectives in the identity chain, the rare cases: a recovery rotation and a rollback, line 3368): "A rollback puts its clone in force as a rotation does, and registers departures as a record does (rule 93)."
- A-2457 (no rule, Collectives in the identity chain, the rare cases: a recovery rotation and a rollback, line 3382): "Each takes effect at the rollback, its line, for the collective's acts after it."

### R-260. A record drawn in a broken stretch registers nothing

**Relation:** one narrower

- A-1156 (Rule 70, Rule 70. A member can always leave alone: Leaving a broken collective, line 1559): "A record drawn in the broken stretch is no line and registers nothing (rule 93)."
- A-1353 (Rule 93, Rule 93. A broken collective, and its way back, line 1797): "Its records register nothing (record field 3): only the rollback's registration counts."

### R-261. A resignation or step-down names the drafts it leaves behind

**Relation:** one narrower

- A-1184 (Rule 71, Rule 71. Leaving an area: Stepping down at once, line 1595): "The resignation names the drafts its signer had signed and leaves behind (field 2)."
- A-1892 (no rule, Part five: act formats, the type table, line 2544): "the member giving up their voice, or stepping down from one area, naming the drafts they leave behind"
- A-2318 (no rule, Resignation (type 16), line 3195): "A resignation, or a stepping down, names the drafts it leaves behind."

### R-262. A version a resignation names never gives the signer back its voice or area

**Relation:** one narrower

- A-1185 (Rule 71, Rule 71. Leaving an area: Stepping down at once, line 1595): "A version it names never gives the signer the area back, whichever line puts it in force."
- A-2319 (no rule, Resignation (type 16), line 3195): "A version it names never brings its signer back, nor, for a stepping down, gives the signer the area back, whichever line puts it in…"

### R-263. A draft it fails to name brings the signer back: a stated cost

**Relation:** same

- A-1186 (Rule 71, Rule 71. Leaving an area: Stepping down at once, line 1595): "A draft it fails to name does: the signer's stated cost."
- A-2322 (no rule, Resignation (type 16), line 3197): "*Stated cost:* a draft it fails to name brings her back."

### R-264. The client names the drafts when its holder resigns or steps down

**Relation:** same

- A-1187 (Rule 71, Rule 71. Leaving an area: Stepping down at once, line 1595): "*Client conformance:* the holder's client names them, as for a resignation."
- A-2321 (no rule, Resignation (type 16), line 3197): "*Client conformance:* her client names the drafts when she resigns or steps down."

### R-265. Remaining holders of an area carry on meanwhile

**Relation:** same

- A-1193 (Rule 71, Rule 71. Leaving an area, line 1599): "Meanwhile, where other holders of the area remain, they carry on, counted as rule 65 says."
- A-1254 (Rule 83, Rule 83. Execution, line 1688): "its remaining holders carry on meanwhile;"

### R-266. A layer whose named actors have all left stands frozen; its acts count for nothing until a clone names others

**Relation:** one narrower

- A-1209 (Rule 71, Rule 71. Leaving an area: an area with no holder, line 1622): "A layer whose named actors have all left stands frozen likewise: where its rule names parties (`[2, [+ hash]]`) none of whose voice remains, or…"
- A-1210 (Rule 71, Rule 71. Leaving an area: an area with no holder, line 1622): "Its acts after the line that froze it count for nothing, and every grant issued under it ends at that line, until a constitutional clone…"
- A-1612 (Rule 60, Rule 60. Layers: who acts for the collective, line 2131): "A layer whose named actors have all left stands frozen (rule 71) until a clone names others."
- A-1624 (Rule 60, Rule 60. Layers: who acts for the collective: When an act counts, line 2149): "An act of a layer or area that stands frozen counts for nothing (rule 71)."

### R-267. A reinstated grant is a clone of the ended grant (fields 0 to 6 repeated), accepted by the grantee, taking nothing on

**Relation:** one narrower

- A-1212 (Rule 71, Rule 71. Leaving an area: reinstatement at the refit, line 1626): "whose field 7 names the ended grant, and whose fields 0 to 6 are that grant's;"
- A-1214 (Rule 71, Rule 71. Leaving an area: reinstatement at the refit, line 1628): "accepted by the grantee."
- A-1220 (Rule 71, Rule 71. Leaving an area: reinstatement at the refit, line 1634): "It takes nothing on: the acts under the ended grant stay as the ending left them."
- A-2195 (no rule, Grant (type 9) and revocation (type 10), grant field 7, line 3023): "a reinstatement: the ended grant it reinstates, fields 0 to 6 repeating that grant's (rule 71); only with field 5"
- A-2214 (no rule, Grant (type 9) and revocation (type 10), line 3045): "A reinstatement (field 7) is the exception, and is a clone of the ended grant."
- A-2217 (no rule, Grant (type 9) and revocation (type 10), line 3045): "The grantee accepts it again, and it takes nothing on."

### R-268. A reinstated grant backs acts only within the refitted area's reach

**Relation:** one narrower

- A-1219 (Rule 71, Rule 71. Leaving an area: reinstatement at the refit, line 1634): "A reinstated grant backs acts as a grant within the refitted area, and only within that area's reach (rule 80), from its own place on."
- A-2216 (no rule, Grant (type 9) and revocation (type 10), line 3045): "It backs acts only within the refitted area's reach (rule 71)."

### R-269. A party may attach a succession plan to an agreement, as part of its signed terms

**Relation:** same

- A-1221 (Rule 81, Rule 81. The core gives the language, not the answers, line 1646): "A party may attach a succession plan to an agreement, as part of its signed terms."
- A-1907 (no rule, Terms (type 0), field 16, line 2568): "succession plans of parties, part of the signed terms"

### R-270. Stake successors take the party's stakes in shares summing exactly

**Relation:** one narrower

- A-1222 (Rule 81, Rule 81. The core gives the language, not the answers, line 1647): "stake successors, each with a share of the party's stakes (summing exactly);"
- A-1952 (no rule, Terms (type 0), succession-plan, line 2658): "stake successors, shares in millionths of the party's shares; a plan naming its own party as stake successor names none"

### R-271. Seat successors carry no voting weight; under a rule by share a successor weighs what it holds

**Relation:** one narrower

- A-1223 (Rule 81, Rule 81. The core gives the language, not the answers, line 1648): "seat successors, entering automatically or with the members' approval, with no voting weight."
- A-1225 (Rule 81, Rule 81. The core gives the language, not the answers, line 1652): "A seat successor carries no voting weight: plan key 2 lists the seat successors alone; a plan writing a weight beside a successor is invalid,…"
- A-1226 (Rule 81, Rule 81. The core gives the language, not the answers, line 1652): "Where a rule counts by share, a seat successor weighs what it holds of the stake, read from field 7, which the plan's stake part…"
- A-1953 (no rule, Terms (type 0), succession-plan, line 2660): "seat successors, with no voting weight: under a rule by share a successor weighs what it holds of the stake, read from field 7; a…"

### R-272. A seat passes automatically only where every voice signed that plan version; otherwise it is a nomination under the constitutional change rule

**Relation:** one narrower

- A-1232 (Rule 83, Rule 83. Execution, line 1666): "A seat passes automatically (plan key 3, value 0) only if every party whose voice remains signed that version of the succession plan."
- A-1247 (Rule 83, Rule 83. Execution, line 1683): "Otherwise the seat successor is a nomination, approved under the constitutional change rule (rule 98)."
- A-1260 (Rule 84, Rule 84. Fallback, line 1700): "No seat passes automatically this way: an automatic entry needs consent given in advance by everyone still counted (rule 83), and an identity-level succession is…"
- A-1954 (no rule, Terms (type 0), succession-plan, line 2663): "seat entry: 0 automatic where every voice signed this version of the plan, otherwise treated as 1 ; 1 a nomination, approved under the power…"
- A-1971 (no rule, Terms (type 0), power, line 2702): "the succession plan of this party, signed in advance by every voice (rule 83); its signers are the seat successors entering"

### R-273. A seat passed to an existing party gives it two seats, listed once per seat

**Relation:** one narrower

- A-1241 (Rule 83, Rule 83. Execution: what the plan alone may pass, line 1675): "A plan passes a seat to one identity or several, an identity already a party among them: that party then holds both seats, written once…"
- A-1903 (no rule, Terms (type 0), field 0, line 2560): "parties: identity or collective hashes; each once, save a party holding two seats by succession (rule 83), listed once per seat"
- A-1953 (no rule, Terms (type 0), succession-plan, line 2660): "seat successors, with no voting weight: under a rule by share a successor weighs what it holds of the stake, read from field 7; a…"

### R-274. The successor signs the clone that seats it

**Relation:** same

- A-1249 (Rule 83, Rule 83. Execution, line 1683): "The successor signs the clone too (rule 45)."
- A-1261 (Rule 84, Rule 84. Fallback, line 1700): "The successor signs the clone that seats it (rule 45)."

### R-275. A broken collective cannot fork or close; while broken no fork or closing counts

**Relation:** one narrower

- A-1266 (Rule 91, Rule 91. How a collective ends: four shapes, line 1714): "A broken collective cannot fork or close before it is rolled back (rule 93): while it is broken, no fork or closing counts, whatever line…"
- A-1388 (Rule 93, Rule 93. A broken collective, and its way back, line 1851): "A broken collective cannot fork or close before it is fixed."
- A-1389 (Rule 93, Rule 93. A broken collective, and its way back, line 1851): "A fork or closing made during the broken stretch counts for nothing, then and after the rollback (rule 91)."
- A-1390 (Rule 93, Rule 93. A broken collective, and its way back, line 1851): "And while a collective is broken, no fork or closing counts, whatever line it names, the last good link before the broken act included."
- A-2548 (no rule, Closing (type 20), complete when, line 3503): "the collective is not broken."

### R-276. A fork or closing is signed by members' chain signatures, under the constitutional change rule

**Relation:** one narrower

- A-1275 (Rule 91, Rule 91. How a collective ends: four shapes, line 1722): "A fork act (type 19) names the successors by their identities, and, signed by the members on its sides with their own identities under the…"
- A-1316 (Rule 91, Rule 91. How a collective ends: four shapes, line 1749): "A closing act (type 20), signed under the constitutional change rule like the fork act, and counted by share at its line where that rule…"
- A-1895 (no rule, Part five: act formats, the type table, line 2547): "a member of the collective, with their own identity; completed by the chain signatures (Identity type 16) of every member it lists, meeting the constitutional…"
- A-1896 (no rule, Part five: act formats, the type table, line 2548): "a member of the collective, with their own identity; completed by the chain signatures (Identity type 16) of members meeting the constitutional change rule, with…"
- A-2483 (no rule, Fork (type 19), how it is signed, line 3422): "Every member it lists, its own signer included, signs it by a chain signature (Identity type 16): an act on that member's identity chain, signed…"
- A-2490 (no rule, Fork (type 19), complete when, line 3428): "every member it lists is a member whose voice remains at the line (rule 65's voices, the departures registered before it counted), is on one…"
- A-2491 (no rule, Fork (type 19), complete when, line 3429): "those members meet the constitutional change rule, counted as rule 65 says;"
- A-2535 (no rule, Closing (type 20), how it is signed, line 3491): "Its signer and the other members sign it by chain signatures on their identity chains, as for a fork."

### R-277. Where the constitutional change rule counts by share, an ending is counted by share at its line

**Relation:** one narrower

- A-1278 (Rule 91, Rule 91. How a collective ends: four shapes, line 1722): "Where the constitutional change rule counts by share, an ending is counted by share at its line (operate by share, end by share): the holdings…"
- A-1316 (Rule 91, Rule 91. How a collective ends: four shapes, line 1749): "A closing act (type 20), signed under the constitutional change rule like the fork act, and counted by share at its line where that rule…"

### R-278. Owners who are no members consent to an ending by a chain signature

**Relation:** one narrower

- A-1279 (Rule 91, Rule 91. How a collective ends: four shapes, line 1722): "Owners who are no members consent as members do, by a chain signature (Identity type 16) with their own chain key naming the ending, judged…"
- A-2540 (no rule, Closing (type 20), complete when, line 3499): "where that rule counts among a stake's holders, a holder who is no member counts toward it only by a chain signature on the closing…"

### R-279. Successors keep every departed holder and every member who signed no side at their share

**Relation:** one narrower

- A-1287 (Rule 91, Rule 91. How a collective ends: four shapes, line 1730): "Departed holders keep their percentage in every successor, and their stake follows into the successors' future works, a stake in each collective as a whole."
- A-1288 (Rule 91, Rule 91. How a collective ends: four shapes, line 1730): "Each successor's founding terms keep every departed holder of the original, and every member who signed no side, at the same share of all its…"
- A-2493 (no rule, Fork (type 19), complete when, line 3431): "each side's successor is held, and its founding terms, as its genesis declares them, have exactly that side's members as parties, and keep, in its…"
- A-2509 (no rule, Fork (type 19), line 3452): "With no stakes written, a member who signs no side keeps each member's equal share, leftovers to the first (rule 9)."

### R-280. No successor pays a kept holder less unless the kept holders consent

**Relation:** one narrower

- A-1289 (Rule 91, Rule 91. How a collective ends: four shapes, line 1730): "And no successor's founding terms pay a kept holder less than the original's did, unless the kept holders consent (rule 98)."
- A-1290 (Rule 91, Rule 91. How a collective ends: four shapes, line 1730): "For each successor, its founding terms and the split agreement its founding names first must pay no kept holder (a departed holder of the original,…"
- A-1292 (Rule 91, Rule 91. How a collective ends: four shapes, line 1730): "Where a successor's founding terms pay a kept holder less, the fork completes only once the kept holders consent: each kept holder paid less, by…"
- A-1468 (Rule 98, Rule 98. The last resort, model not held, line 1964): "Where such an act needs the consent of holders who have no say (a fork's successors paying a kept holder less, rule 91), each holder's…"
- A-2494 (no rule, Fork (type 19), complete when, line 3432): "each successor's founding terms pay no kept holder less than the original's agreement in force at the line pays it, as rule 48 reads "paid…"

### R-281. Another identity's consent, receipt or release counts for a fork or closing only where an act of the collective in its history acknowledges it; else shown, and it waits

**Relation:** one narrower

- A-1293 (Rule 91, Rule 91. How a collective ends: four shapes, line 1730): "A kept holder's consent counts only where an act of the original in the fork's history acknowledges it, as a closing relies on a release:…"
- A-1333 (Rule 92, Rule 92. The creditor's release, line 1768): "For a closing, a release counts only where an act of the collective in the closing's history acknowledges it ("Closing (type 20)"); one nobody acknowledged…"
- A-2544 (no rule, Closing (type 20), complete when, line 3501): "A receipt or a release of another identity counts toward this only where an act of the collective in the closing's history acknowledges it (Envelopes,…"
- A-2545 (no rule, Closing (type 20), complete when, line 3501): "A receipt or release nobody acknowledged is shown, and the closing waits until an act of the collective acknowledges it."

### R-282. A fork hands out every obligation in its history, or does not take effect

**Relation:** one narrower

- A-1294 (Rule 91, Rule 91. How a collective ends: four shapes, line 1731): "The fork cites the original's action head, and hands out every obligation in that history, each to one successor or to several jointly, or it…"
- A-2471 (no rule, Fork (type 19), CDDL, line 3411): "every obligation in the history it cites: the side, or the sides jointly, owing it"
- A-2496 (no rule, Fork (type 19), complete when, line 3434): "it hands out everything in the history it cites, as the next paragraph says; otherwise the fork does not take effect;"
- A-2499 (no rule, Fork (type 19), what it must hand out, line 3441): "every obligation of the original in that history, public or not, paid or not, save one that does not bind the collective."
- A-2500 (no rule, Fork (type 19), what it must hand out, line 3441): "An obligation is handed out only if it binds the collective, that is, done (sealed to every member or public, and on its chain, rules…"
- A-2502 (no rule, Fork (type 19), what it must hand out, line 3444): "Otherwise the fork does not take effect."

### R-283. The successor signs for each debt assigned to it by its own chain signature

**Relation:** one narrower

- A-1295 (Rule 91, Rule 91. How a collective ends: four shapes, line 1732): "The successor collective signs for each debt assigned to it, by its own chain signature on the fork (Identity type 16), so members are never…"
- A-2485 (no rule, Fork (type 19), how it is signed, line 3422): "Each successor a debt is assigned to signs it as a member does, by a chain signature with its own chain key (Identity type 16),…"

### R-284. A complete fork is never undone; obligations outside its history are void and no successor owes them

**Relation:** one narrower

- A-1296 (Rule 91, Rule 91. How a collective ends: four shapes, line 1733): "A complete fork is never undone over a debt, nor by a later ending: a debt uploaded after it was in its history, and handed…"
- A-1297 (Rule 91, Rule 91. How a collective ends: four shapes, line 1734): "No successor owes a debt the fork did not hand it."
- A-1303 (Rule 91, Rule 91. How a collective ends: four shapes, line 1737): "Any other is missing from the ending's history, and void (the tie rule): its counterparty deals again with a successor."
- A-2505 (no rule, Fork (type 19), what it must hand out, line 3446): "What lies outside that history is void (the tie rule, "Made before, made after", point 7): an obligation of the original the fork's history does…"

### R-285. A later fork of a successor hands out what an earlier fork handed it

**Relation:** same

- A-1298 (Rule 91, Rule 91. How a collective ends: four shapes, line 1735): "A later fork of a successor hands out, in turn, what an earlier fork handed it, where its own chain signature on that fork lies…"
- A-2501 (no rule, Fork (type 19), what it must hand out, line 3442): "every obligation an earlier fork handed to the original, where the history the fork cites holds the original's own chain signature on that earlier fork,…"

### R-286. A payee pointer left outside an ending's history still counts for payments made before its line

**Relation:** one narrower

- A-1305 (Rule 91, Rule 91. How a collective ends: four shapes, line 1738): "A payee pointer of the original that the ending left outside its history still counts for payments made before the ending's line, as the chain…"
- A-2506 (no rule, Fork (type 19), what it must hand out, line 3446): "The one exception is a payee pointer left outside it, which still counts for payments made before the fork's line, as the chain stood for…"

### R-287. An absentee's money share does not block a closing

**Relation:** one narrower

- A-1320 (Rule 91, Rule 91. How a collective ends: four shapes, line 1749): "An absentee's money share follows the collective's own rules, and does not keep the collective from closing ("Closing (type 20)")."
- A-2546 (no rule, Closing (type 20), complete when, line 3501): "An absentee's money share, left where the collective's own rules sent it, does not block the closing (below);"
- A-2556 (no rule, Closing (type 20), an absentee's money share, line 3511): "The money share of someone it has nowhere to pay, an absentee, does not block the closing."

### R-288. Elsewhere a creditor's release counts wherever a verifier holds it

**Relation:** one narrower

- A-1331 (Rule 92, Rule 92. The creditor's release, line 1766): "it counts wherever a verifier holds it, public or not, even before the debt it ends binds."
- A-1334 (Rule 92, Rule 92. The creditor's release, line 1768): "Everywhere else the release counts wherever a verifier holds it, as above."

### R-289. A broken collective keeps exactly what its rules before the break allowed, such as a debt paid under an earlier agreement

**Relation:** one narrower

- A-1360 (Rule 93, Rule 93. A broken collective, and its way back, line 1809): "The broken collective keeps exactly what its rules before the break allowed."
- A-1366 (Rule 93, Rule 93. A broken collective, and its way back, line 1814): "A debt paid to the collective under an agreement made before the break is kept, and stands as paid."

### R-290. Money owed back to a payer who gave no address: a sealed notice with a deadline, after which the closing may name it left open

**Relation:** one narrower

- A-1381 (Rule 93, Rule 93. A broken collective, and its way back, line 1838): "Money owed back to a payer who gave no address: a payer whose claim carries no refund rail, whose chain declares no vault, and none…"
- A-1383 (Rule 93, Rule 93. A broken collective, and its way back, line 1838): "Before closing, the collective sends the payer a notice sealed to their identity, with a deadline on a time reference (type 24), asking where the…"
- A-1385 (Rule 93, Rule 93. A broken collective, and its way back, line 1841): "If not, the collective may close, the debt named in the closing act, visible and unpaid."
- A-1392 (Rule 93, Rule 93. A broken collective, and its way back, line 1853): "One kind is the exception, and the closing names it as left open: money owed back to a payer who gave no address and let…"
- A-1394 (Rule 93, Rule 93. A broken collective, and its way back, line 1855): "The same exception, with the same tests ("a payer who gave no address", a notice, a verifier that cannot resolve the payer's chain answering unknown),…"
- A-1900 (no rule, Part five: act formats, the type table, line 2552): "the collective, to a payer owed money back (from a broken stretch, or a refund owed) who gave no address. Sealed to that payer, with…"
- A-2463 (no rule, Notice (type 24), line 3395): "A collective owing money back, from a broken stretch or as a refund owed on a payment to it, to a payer who gave no…"
- A-2552 (no rule, Closing (type 20), line 3507): "Money owed back that field 4 may leave open, from a broken stretch or as a refund owed on a payment to the collective, is…"
- A-2554 (no rule, Abandonment declaration (type 13), line 3509): "Stated cost: a collective may close while visibly owing a payer who gave no address and let the notice's deadline pass."

### R-291. A fork or closing a verifier cannot fully judge is unknown, never 'not complete'

**Relation:** one narrower

- A-1382 (Rule 93, Rule 93. A broken collective, and its way back, line 1838): "A verifier that cannot resolve the payer's chain answers unknown for the closing."
- A-2503 (no rule, Fork (type 19), what it must hand out, line 3444): "A verifier that does not hold every act that history names cannot tell what it must hand out: for it, whether the fork is complete…"
- A-2549 (no rule, Closing (type 20), line 3505): "A verifier that does not hold every act the closing's history names cannot tell what the collective owes: for it, whether the closing is complete…"
- A-2551 (no rule, Closing (type 20), line 3505): "An obligation whose condition the condition cMIP answers unknown at the closing's line leaves the closing unknown; one it answers false binds nothing; one it…"

### R-292. A closing may name a holder that outlives it to pay money left open

**Relation:** one narrower

- A-1386 (Rule 93, Rule 93. A broken collective, and its way back, line 1843): "A collective may also set the amount aside with a named holder that outlives the closing and pays the payer when they turn up (a…"
- A-2532 (no rule, Closing (type 20), CDDL, line 3487): "the payment owed back, by one receipt or claim of it; the notice sent to its payer (type 24), required, a null outside the format;…"
- A-2553 (no rule, Closing (type 20), line 3509): "Every such payment it leaves open, it names, with a holder that outlives it where the collective chose one (rule 93)."

### R-293. Money owed back from a broken stretch blocks a closing

**Relation:** one narrower

- A-1391 (Rule 93, Rule 93. A broken collective, and its way back, line 1853): "Money owed back from the broken stretch is a debt for a closing's "owes nothing": the collective cannot close until those payers are settled."
- A-2547 (no rule, Closing (type 20), complete when, line 3502): "no money is owed back from a broken stretch, whatever the closing's line (rule 93), save what field 4 leaves open as the rules allow…"

### R-294. A rollback names the broken act, which it voids and which stays shown

**Relation:** one narrower

- A-1398 (Rule 93, Rule 93. A broken collective, and its way back, line 1864): "which names the broken act, which it voids and which stays shown ("Collectives in the identity chain")."
- A-2444 (no rule, Collectives in the identity chain, the rare cases: a recovery rotation and a rollback, line 3368): "It counts only in the broken stretch, naming as broken the broken act itself."

### R-295. The broken clone stays on its own branch, never in force

**Relation:** one narrower

- A-1401 (Rule 93, Rule 93. A broken collective, and its way back, line 1866): "The agreement chain forks from before the broken act, and the broken clone stays on its own branch, never in force."
- A-1417 (Rule 93, Rule 93. A broken collective, and its way back, line 1892): "The rollback's clone is never the clone the broken act declared, which stays on its own branch, never in force: a clone of the same…"

### R-296. A rollback needs the constitutional change rule before the break, its mark naming [0]

**Relation:** one narrower

- A-1402 (Rule 93, Rule 93. A broken collective, and its way back, line 1870): "A rollback needs the constitutional change rule of the agreement in force just before the broken act (rule 98), counted among the voices that remain…"
- A-1403 (Rule 93, Rule 93. A broken collective, and its way back, line 1870): "By default that rule is every party whose voice remains."
- A-1407 (Rule 93, Rule 93. A broken collective, and its way back, line 1879): "The rollback's mark (field 4) names the constitutional change rule, `[0]`, with its signers."
- A-2446 (no rule, Collectives in the identity chain, the rare cases: a recovery rotation and a rollback, line 3371): "its mark names the powers rule 93 gives it; and"

### R-297. A rollback's clone is complete only with the signature acts it names

**Relation:** one narrower

- A-1413 (Rule 93, Rule 93. A broken collective, and its way back, line 1887): "complete only with the signature acts its declaration names, counted at the rollback (rules 45, 46, 48);"
- A-2447 (no rule, Collectives in the identity chain, the rare cases: a recovery rotation and a rollback, line 3372): "the clone must be complete at the rollback with the signature acts its second element names, and only those."

### R-298. A release names the stakes it ends and the claims of its creators

**Relation:** one narrower

- A-1432 (Rule 55, Rule 55. Public domain, line 1923): "its history stays named: the stakes it ends and the claims naming its creators;"
- A-2233 (no rule, Release (type 5), field 1, line 3074): "the stakes in it whose claim ends: the work's owners, past and present"
- A-2234 (no rule, Release (type 5), field 2, line 3075): "the claims binding it to its creators: its creators' history"

### R-299. A release makes each bake's content key public

**Relation:** one narrower

- A-1433 (Rule 55, Rule 55. Public domain, line 1924): "its content key is made public: anyone may carry or sell copies."
- A-2235 (no rule, Release (type 5), field 3, line 3076): "the content key of each bake carrying it, made public"

### R-300. A collective holder signs a release by its own rules, under its rule for each layer a release touches

**Relation:** one narrower

- A-1434 (Rule 55, Rule 55. Public domain, line 1926): "It needs every direct owner's signature, departed holders of a share in the work included, a collective owner signing by its own rules, under its…"
- A-1881 (no rule, Part five: act formats, the type table, line 2533): "a direct owner of the work, completed by the signature acts of every other holder of the stakes it ends, unless the release rule says…"
- A-2246 (no rule, Release (type 5), line 3092): "A holder that is a collective signs by its own rules."
- A-2248 (no rule, Release (type 5), line 3092): "A release, or a collective's signature on one, is reached by the collective's rules for every layer a release touches, Envelopes, Money and Agreements, each…"

### R-301. The release rule (field 24): set at founding, every holder by default, changed by a clone every owner signs, counted by share never by head

**Relation:** one narrower

- A-1434 (Rule 55, Rule 55. Public domain, line 1926): "It needs every direct owner's signature, departed holders of a share in the work included, a collective owner signing by its own rules, under its…"
- A-1435 (Rule 55, Rule 55. Public domain, line 1926): "This holds unless the release rule says otherwise (field 24, set at founding, changed only by a clone every owner signs)."
- A-1436 (Rule 55, Rule 55. Public domain, line 1928): "The release rule's threshold is counted by share: "holders together holding at least this share of the stake", never a number of heads, so a…"
- A-1881 (no rule, Part five: act formats, the type table, line 2533): "a direct owner of the work, completed by the signature acts of every other holder of the stakes it ends, unless the release rule says…"
- A-1928 (no rule, Terms (type 0), field 24, line 2603): "the release rule: which of the stake's holders sign its release (rule 55); founding terms set it, and a clone every owner signs changes it…"
- A-1965 (no rule, Terms (type 0), holders-rule, line 2692): "every holder of the stake (the default)"
- A-1982 (no rule, Terms (type 0): the release rule, line 2721): "The release rule's threshold is counted by share: field 24 written `[1, uint]`, a number of heads, is invalid; it is written `[3, share]`, holders…"
- A-2037 (no rule, Terms (type 0): the release rule, line 2790): "The release rule (field 24) says which of the stake's holders must sign its release to the public domain, a rule counted among them (rule…"
- A-2038 (no rule, Terms (type 0): the release rule, line 2790): "It is set in an agreement's founding terms; absent, every holder."
- A-2039 (no rule, Terms (type 0): the release rule, line 2792): "A clone every owner signs may change it."
- A-2244 (no rule, Release (type 5), complete when, line 3089): "the release rule of each such agreement in force (field 24; absent, every holder) is met among that stake's holders, a threshold counted by share;"

### R-302. A constitutional clone needs [0] (and [4] where judicial), plus the layer and area powers for any operational change

**Relation:** one narrower

- A-1452 (Rule 98, Rule 98. The last resort, 3, line 1950): "A clone making one needs the constitutional change rule, `[0]`, whatever its control model asks, and, where it also changes the judicial tier, the judicial…"
- A-1465 (Rule 98, Rule 98. The last resort, no control model, line 1962): "A collective that names no control model (terms without field 35) is judged by this rule alone: every clone of its agreement needs its constitutional…"
- A-1845 (Rule 99, Rule 99. Control models, line 2460): "A clone making a constitutional change needs the constitutional change rule, `[0]`, and the judicial tier's rule, `[4]`, where rule 67 asks (rule 98); where…"
- A-1857 (Rule 99, Rule 99. Control models, line 2474): "Its default is its own: a collective naming no control model is judged by its constitutional rule alone (rule 98), and every way out is…"

### R-303. Before founders sign, the client shows who acts on what, Money first

**Relation:** one narrower

- A-1458 (Rule 98, Rule 98. The last resort, 5, line 1952): "An area's number may be below its layer's threshold (one treasurer alone where the rule for Money is any two): the founders' choice, which the…"
- A-1475 (Rule 98, Rule 98. The last resort, model not held, line 1964): "before a founder signs, the client shows who acts on what, Money first: every area, every power by share a model gives an act type…"
- A-1616 (Rule 60, Rule 60. Layers: who acts for the collective, line 2135): "*Client conformance:* before a party signs a founding, its client shows, layer by layer, what the rule lets one member do alone, Money first."

### R-304. A client without the control model shows what it decides as unknown

**Relation:** one narrower

- A-1469 (Rule 98, Rule 98. The last resort, model not held, line 1964): "Every other act whose power its model decides (an act for the collective its model may narrow, a clone changing what its model governs) is…"
- A-1474 (Rule 98, Rule 98. The last resort, model not held, line 1964): "a client acting for or reading a collective holds the control model its terms name (field 35), or shows what that model decides as unknown…"

### R-305. Coverage and declarations are judged under the clause in force, one version for everyone

**Relation:** one narrower

- A-1494 (Rule 67, Rule 67. Protected clauses: the judicial tier, line 1986): "Every member, and every departed holder, is judged by the version in force, save a declaration of absence against a holder who is no party,…"
- A-1656 (Rule 61, Rule 61. Every constitutional voice is covered, line 2203): "Coverage is judged under the clause in force, one version for everyone."
- A-1699 (Rule 87, Rule 87. Declaration, line 2257): "The clause applied is the one in force, of the agreement it names, for every party: a party whose voice was removed before a judicial…"
- A-2378 (no rule, Abandonment declaration (type 13), CDDL, line 3281): "the clause's version: the version of that agreement whose abandonment clause (field 9) it applies, the last one, back from field 0 through its parents,…"
- A-2395 (no rule, Abandonment declaration (type 13), line 3312): "it is signed by that clause's authority (the clause in force, for every party, one whose voice was removed before a judicial change included; for…"

### R-306. A settlement counts only where it names every tip it saw

**Relation:** one narrower

- A-1548 (Rule 47, Rule 47: What a settlement could see, line 2045): "A settlement counts only where it names every tip it saw."
- A-1594 (Rule 47, Rule 47: The judge of forks, line 2098): "It is final as a settling version is, for what it could see, and counts only where it names every tip it saw."

### R-307. A judge contradicting itself is read as answering 'unknown', and the next link settles

**Relation:** one narrower

- A-1568 (Rule 47, Rule 47: Two settlements of one fork, neither holding the other, line 2076): "They are read as the judge answering "unknown" (rule 35): the deal stays on its last agreed version, and the next link of the chain…"
- A-1574 (Rule 47, Rule 47: Two settlements of one fork, neither holding the other, line 2082): "A judge has contradicted itself where its first settlements of the fork, read by history as any two settlements are read ("What a settlement could…"
- A-1751 (Rule 35, Rule 35. The chain of judgment, line 2346): "Within one link, a judge contradicting itself has answered "unknown", and the next link is active with no period to wait."

### R-308. Only the active link settles; two links never both settle one question

**Relation:** one narrower

- A-1572 (Rule 47, Rule 47: Two settlements of one fork, neither holding the other, line 2078): "Two links' settlements of one fork never both count: only the link active on the fork settles it, as rule 35 says."
- A-1758 (Rule 35, Rule 35. The chain of judgment, line 2361): "Only the active link can settle."
- A-1760 (Rule 35, Rule 35. The chain of judgment, line 2363): "So two links never both settle one question."
- A-1761 (Rule 35, Rule 35. The chain of judgment, line 2363): "Where an earlier link settles after a later one took over, having seen its settlement or not, the later link's stands."

### R-309. A settlement request is signed by a party who signed the reference

**Relation:** one narrower

- A-1591 (Rule 47, Rule 47: The judge of forks, line 2096): "The judge of forks acts only once activated by one of the signing parties: a settlement request (type 22), signed by a party who signed…"
- A-1898 (no rule, Part five: act formats, the type table, line 2550): "a party who signed a deal's reference version, asking the judge of forks it names to settle the fork (rule 47)"
- A-2302 (no rule, Settlement request (type 22) and fork settlement (type 23), line 3164): "A settlement request is signed by a party who signed the reference, with its own key."

### R-310. The chain passes on 'unknown' or on no action within the period, with no new signature

**Relation:** one narrower

- A-1595 (Rule 47, Rule 47: The judge of forks, line 2101): "Where the judge of forks does not act within its period, the next link of its chain (field 21) takes over, with no new signature,…"
- A-1597 (Rule 47, Rule 47: The judge of forks, line 2102): "A link that is a specification signs nothing and passes the question on once its period passes."
- A-1741 (Rule 35, Rule 35. The chain of judgment, line 2336): "When a judge answers "unknown", the next in its chain is asked."
- A-1743 (Rule 35, Rule 35. The chain of judgment, line 2336): "No new signature is needed when it passes."
- A-1747 (Rule 35, Rule 35. The chain of judgment, line 2344): "A judge that does not act passes the question on too."
- A-1749 (Rule 35, Rule 35. The chain of judgment, line 2344): "Once the judge has been asked and has not acted within it, as the agreement's time reference judges it, the next may act."
- A-2009 (no rule, Terms (type 0): the chain of judgment, line 2759): "After it, the next may act."

### R-311. An act counts under its layer's rule, or the rule of the area within it that reaches it

**Relation:** one narrower

- A-1608 (Rule 60, Rule 60. Layers: who acts for the collective, line 2131): "An act of the collective in a layer counts under that layer's rule, or under an area's rule where an area within the layer reaches…"
- A-1618 (Rule 60, Rule 60. Layers: who acts for the collective: When an act counts, line 2139): "An act for the collective counts in the layer it belongs to ("Layer") only where its signers meet that layer's rule, or the rule of…"

### R-312. The layers (field 19) appear exactly in terms carrying a key grammar, every one of the five keys present

**Relation:** one narrower

- A-1609 (Rule 60, Rule 60. Layers: who acts for the collective, line 2131): "A founding that leaves a layer unnamed is outside the format and founds nothing."
- A-1912 (no rule, Terms (type 0), field 19, line 2576): "who acts for the collective in each layer (only with field 12, and then required)"
- A-1939 (no rule, Terms (type 0), layers, line 2627): "who acts for the collective in each layer: 1 Text, 2 Envelopes, 3 Money, 4 Agreements, 5 Development; every key present, no other (rule 60)"
- A-2016 (no rule, Terms (type 0): the target, line 2769): "A collective's ownership agreement (`[1, null]`) carries a key grammar (field 12) and the layers (field 19): terms carrying it without either are invalid, and…"
- A-2049 (no rule, Terms (type 0): the layers, line 2800): "The layers (field 19) appear exactly in terms that carry a key grammar (field 12)."
- A-2050 (no rule, Terms (type 0): the layers, line 2800): "Every one of the five keys is present, and no other: terms carrying field 12 whose field 19 lacks a layer, or carries a key…"

### R-313. An extension acting on another layer needs that layer's rule too

**Relation:** one narrower

- A-1638 (Rule 60, Rule 60. Layers: who acts for the collective: Specifications the collective has not adopted, line 2171): "as an extension, the rule of Development with the rule of each layer it declares."
- A-1645 (Rule 60, Rule 60. Layers: who acts for the collective: Extensions, line 2185): "An extension acting on another layer needs that layer's rule too, in the same clone, all at once."

### R-314. The judicial tasks stay outside every layer's rule and change only as rule 67 says

**Relation:** one narrower

- A-1640 (Rule 60, Rule 60. Layers: who acts for the collective: The judicial tasks, line 2177): "The tasks of the judicial tier (9 condition evaluation, 10 time reference, 11 anchoring, 14 absence proof) stay judicial, outside every layer's rule."
- A-1641 (Rule 60, Rule 60. Layers: who acts for the collective: The judicial tasks, line 2177): "Neither the rule for Agreements nor any other changes them, nor any power a control model names: they change only as rule 67 says."

### R-315. A judge (a judicial task's cMIP) is named or adopted for no other task, and not as an extension

**Relation:** one narrower

- A-1643 (Rule 60, Rule 60. Layers: who acts for the collective: The judicial tasks, line 2181): "A specification adopted for a judicial task is adopted for no other task, and is no extension ("Terms (type 0)", a judge never handles what…"
- A-2000 (no rule, Terms (type 0): judges, line 2745): "A judge is named for no other task, judicial or not, and is not named as an extension (field 15)."
- A-2076 (no rule, Publication (type 6), field 9, line 2845): "cMIPs, at most one per task (task number => cMIP hash): its payment cMIP (task 6), its split cMIP (task 8), and others; a judge…"

### R-316. Every party with constitutional power must be covered by the abandonment clause

**Relation:** same

- A-1652 (Rule 61, Rule 61. Every constitutional voice is covered, line 2197): "Every party whose signature a collective's constitutional change rule is counted among MUST be covered by the agreement's abandonment clause."
- A-1663 (Rule 85, Rule 85. Clause, line 2217): "Every collective carries one that covers each party with constitutional power (rule 61)."

### R-317. A holder has no constitutional voice for the abandonment clause to cover; its share moves by a declaration naming it

**Relation:** one narrower

- A-1659 (Rule 61, Rule 61. Every constitutional voice is covered, line 2207): "A holder has no voice for the clause to remove; its share moves by a declaration naming it (rule 85)."
- A-1673 (Rule 85, Rule 85. Clause, line 2219): "Rule 61's coverage is unchanged: a holder has no constitutional voice to cover (but see rule 61 where the constitutional change rule counts among a…"

### R-318. An abandonment clause names its authority (a named identity or, in a collective, a threshold of the other parties) and the outcomes allowed

**Relation:** one narrower

- A-1662 (Rule 85, Rule 85. Clause, line 2215): "An abandonment clause, signed into the agreement, names who decides absence and which outcomes may follow."
- A-1675 (Rule 85, Rule 85. Clause: The authority, line 2222): "a named identity: a keeper's operator, a party, a collective, or a third party;"
- A-1955 (no rule, Terms (type 0), abandonment, line 2669): "the authority: a named identity (a keeper's operator, a party, a collective, or a third party)"

### R-319. The clause version a declaration is judged under: the last the party signed; for a holder who is no party, rule 85's version

**Relation:** one narrower

- A-1666 (Rule 85, Rule 85. Clause, line 2219): "A declaration against a holder who is no party is judged under the abandonment clause of the version that holder last signed as a party,…"
- A-1667 (Rule 85, Rule 85. Clause, line 2219): "Its authority and its absence-proof cMIP are that clause's."
- A-1668 (Rule 85, Rule 85. Clause, line 2219): "A stake passes to a successor with the clause that bound its holder: a stake successor is judged under the version that bound the holder…"
- A-1669 (Rule 85, Rule 85. Clause, line 2219): "A holder that bought more than once is judged under its latest placement."
- A-1670 (Rule 85, Rule 85. Clause, line 2219): "A holder that neither signed a version as a party, bought in nor succeeded is judged under the clause in force."
- A-1690 (Rule 87, Rule 87. Declaration: The core checks, line 2248): "that field 1 names the version the party declared absent signed last, or, for a holder who is no party, the version rule 85 judges…"
- A-1700 (Rule 87, Rule 87. Declaration, line 2257): "A holder who is no party is judged by the clause rule 85 names."
- A-2378 (no rule, Abandonment declaration (type 13), CDDL, line 3281): "the clause's version: the version of that agreement whose abandonment clause (field 9) it applies, the last one, back from field 0 through its parents,…"
- A-2393 (no rule, Abandonment declaration (type 13), line 3310): "field 1 is the last version of that agreement, back from it, that the party signed by a valid signature act, and carries an abandonment…"

### R-320. A threshold authority is counted among the voices that remain where the declaration takes effect

**Relation:** one narrower

- A-1676 (Rule 85, Rule 85. Clause: The authority, line 2223): "or, in a collective only, a threshold of the other parties, counted as rule 65 says, so it never asks for more of them than…"
- A-1677 (Rule 85, Rule 85. Clause: The authority, line 2223): "In a collective, they are counted among the voices that remain at the collective's line registering the declaration, or at the recovery rotation where the…"
- A-2396 (no rule, Abandonment declaration (type 13), line 3312): "That is the identity the clause names, or, where the authority is a threshold of the other parties, one of them, its number counted where…"
- A-2442 (no rule, Collectives in the identity chain, the rare cases: a recovery rotation and a rollback, line 3364): "The declaration's number is counted there, among the other parties whose voice remains at the rotation, met by its signer with the signers of the…"
- A-2451 (no rule, Collectives in the identity chain, the rare cases: a recovery rotation and a rollback, line 3377): "Its authority is counted at the rollback, among the other parties whose voice remains there, the resignations and steppings down it registers in effect and…"

### R-321. In a deal, the absence authority is one identity, never a threshold

**Relation:** one narrower

- A-1678 (Rule 85, Rule 85. Clause: The authority, line 2225): "In a deal, the authority is never a threshold of the other parties."
- A-1956 (no rule, Terms (type 0), abandonment, line 2670): "or a threshold of the other parties: in a collective only"
- A-1994 (no rule, Terms (type 0): a deal's absence authority, line 2736): "In a deal, the absence authority is a named identity (a keeper's operator, a party, a collective or a third party), named by the clause's…"
- A-2412 (no rule, Abandonment declaration (type 13), the rare cases: a threshold authority, line 3331): "In a deal the authority is one identity, never a threshold of the other parties, so a deal's declaration is complete with its own signer."

### R-322. A threshold authority: one signs the declaration, the others add signature acts naming it

**Relation:** one narrower

- A-1680 (Rule 85, Rule 85. Clause: The authority, line 2227): "Where a threshold of the other parties needs more than one of them, one signs the declaration and the others add signature acts naming it,…"
- A-1688 (Rule 87, Rule 87. Declaration: The core checks, line 2246): "that it is signed by that authority (for a threshold of the other parties, by one of them, completed by the others' signature acts until…"
- A-1889 (no rule, Part five: act formats, the type table, line 2541): "the authority the clause names, always an identity. For a threshold of the other parties (in a collective only): one of them, completed by the…"
- A-2400 (no rule, Abandonment declaration (type 13), the rare cases: a threshold authority, line 3320): "Where the authority is a threshold of the other parties, one of them signs the declaration and the others add signature acts naming it (type…"

### R-323. A declaration counts once the required number have signed

**Relation:** one narrower

- A-1681 (Rule 85, Rule 85. Clause: The authority, line 2227): "It counts once the required number have signed ("Abandonment declaration"), placed at the collective's line, or named by the recovery rotation where the declaration takes…"
- A-2401 (no rule, Abandonment declaration (type 13), the rare cases: a threshold authority, line 3320): "It counts once the required number have signed: its signer and the signers of those signature acts, each among the other parties whose voice remains…"

### R-324. A liveness act shows a party's presence, counting only public or addressed to the other parties

**Relation:** one narrower

- A-1685 (Rule 86, Rule 86. Liveness, line 2237): "A party with nothing else to sign shows presence with a liveness act."
- A-1888 (no rule, Part five: act formats, the type table, line 2540): "a party; counts only public or addressed to the agreement's other parties"
- A-2230 (no rule, Liveness (type 12), line 3067): "It counts only public or addressed to the agreement's other parties."

### R-325. A declaration is signed by the authority the clause names, with its own key

**Relation:** one narrower

- A-1686 (Rule 87, Rule 87. Declaration, line 2243): "A declaration is a signed act by the authority the clause names, stating the agreement, the clause, the party and the outcome (type 13)."
- A-2381 (no rule, Abandonment declaration (type 13), line 3293): "Signed by the authority the clause names (rule 85), with its own key."

### R-326. Where the clause names an absence-proof cMIP, the declaration counts only if it accepts it

**Relation:** one narrower

- A-1693 (Rule 87, Rule 87. Declaration, line 2253): "Where the clause names an absence-proof cMIP (key 3), the declaration counts only if that cMIP accepts it (task "Absence proof")."
- A-1779 (no rule, The tasks, one by one, line 2382): "A declaration it refuses or cannot judge does not count."

### R-327. A declaration's checks are judged where the act using it is

**Relation:** one narrower

- A-1696 (Rule 87, Rule 87. Declaration, line 2255): "The checks are judged at the point where that act uses it."
- A-2397 (no rule, Abandonment declaration (type 13), line 3314): "A declaration that fails any check, judged at the point where the record names it, is no declaration there: a record naming it in field…"

### R-328. A declaration naming a party is shown to it with the way to contest, and its client uploads the contest

**Relation:** one narrower

- A-1702 (Rule 88, Rule 88. Contest, line 2263): "*Client conformance*: a declaration naming a party MUST always be shown to that party, broken collective or not, with the way to contest it."
- A-2273 (no rule, Contest (type 14), of a declaration, line 3135): "*Client conformance:* the declared member's client lets them sign it, and uploads it, public."

### R-329. A clone carrying exactly what a declaration allows needs no signature of the absent holder

**Relation:** same

- A-1704 (Rule 89, Rule 89. Outcomes, line 2269): "A clone carrying exactly that, put in force under the declaration, needs no signature of the absent holder."
- A-1712 (Rule 89, Rule 89. Outcomes, line 2281): "The clone carrying it, put in force under the declaration, needs no signature of the absent holder."

### R-330. The absence outcomes: 0 voice removed, 1 stake redistributed, 3 obligations redirected or held, 4 agreement closed; outcome 2 struck

**Relation:** one narrower

- A-1706 (Rule 89, Rule 89. Outcomes: The outcomes, line 2274): "voice removed, described below;"
- A-1707 (Rule 89, Rule 89. Outcomes: The outcomes, line 2275): "stake redistributed among remaining holders in proportion, only where the holder's succession plan names no stake successor;"
- A-1708 (Rule 89, Rule 89. Outcomes: The outcomes, line 2276): "obligations redirected or held;"
- A-1709 (Rule 89, Rule 89. Outcomes: The outcomes, line 2277): "agreement closed."
- A-1710 (Rule 89, Rule 89. Outcomes, line 2279): "Outcome 2, a stake transferred to parties named or defined by role, is struck from MOR 1: a clause or declaration listing it is invalid…"
- A-1957 (no rule, Terms (type 0), abandonment, line 2671): "outcomes allowed (rule 89), ascending: 0 voice removed, 1 stake redistributed, 3 obligations redirected or held, 4 agreement closed; 2 (once a stake transferred to…"

### R-331. A verifier checks a cMIP's answer from the data, never on its word

**Relation:** one narrower

- A-1721 (no rule, 22. The tasks handed to cMIPs, line 2297): "A verifier checks a cMIP's answer from the data the task names, never on the cMIP's word; a verifier that does not hold the cMIP,…"
- A-1789 (no rule, The tasks, one by one, line 2386): "A verifier checks the answer from that data, never on the cMIP's word, so a termination cMIP's conditions are things the data shows: a point…"
- A-1850 (Rule 99, Rule 99. Control models, line 2464): "So two verifiers holding the same acts and the same model reach the same verdict, and a model's answer is checked from the terms, the…"

### R-332. Anchors show a deadline met, never missed

**Relation:** one narrower

- A-1724 (Rule 33, Rule 33. Time, line 2303): "An anchor shows a deadline met, never missed."
- A-1725 (Rule 33, Rule 33. Time, line 2303): "An anchor of the act itself (Envelopes, task "Anchoring"), at or before the deadline's point on the agreement's time reference, shows the act made in…"
- A-1732 (Rule 33, Rule 33. Time, line 2311): "An anchor of the act itself at or before the deadline's point shows the deadline met, whatever any keeper's sequence lacks, with one keeper or…"
- A-2103 (no rule, Publication (type 6): keepers, line 2885): "A publication's keepers are those of the ownership agreement it names; a lone seller's publication has none, and its deadlines can be shown met by…"

### R-333. A deadline is shown missed only by a keeper's anchored sequence

**Relation:** one narrower

- A-1729 (Rule 33, Rule 33. Time, line 2307): "A deadline is shown missed only by a keeper's anchored sequence: the sequence of a keeper the agreement names, holding a record anchored at a…"
- A-1733 (Rule 33, Rule 33. Time, line 2313): "A keeper's sequence shows a deadline missed only where it holds a record anchored at or before the deadline's point; a sequence whose earliest anchor…"

### R-334. A request to a judge counts, and its period runs, only public or sealed to the judge

**Relation:** one narrower

- A-1766 (Rule 35, Rule 35. The chain of judgment, line 2373): "A request counts, and the period runs, only where it is public or sealed to the judge it names."
- A-1767 (Rule 35, Rule 35. The chain of judgment, line 2373): "This holds for the request to a judge (type 25), and for the settlement request (type 22) likewise."
- A-1901 (no rule, Part five: act formats, the type table, line 2553): "someone with standing (rule 54), naming a judge the terms name and the question. Counts, and the judge's period runs, only where public or sealed…"
- A-2226 (no rule, Request to a judge (type 25), line 3063): "It counts only public or sealed to the judge."

### R-335. A link of the chain a request never reached was never asked; it reaches each link in order

**Relation:** one narrower

- A-1768 (Rule 35, Rule 35. The chain of judgment, line 2373): "A link of the chain the request never reached was never asked."
- A-2227 (no rule, Request to a judge (type 25), line 3063): "It reaches each link of the chain of judgment it is public or sealed to, in order (rule 35)."

### R-336. A judge never handles what it judges

**Relation:** same

- A-1775 (no rule, The tasks, one by one, line 2382): "This is a judicial task: it joins condition evaluation, time reference and anchoring; a judge never handles what it judges, and the chain of judgment…"
- A-1996 (no rule, Terms (type 0): judges, line 2738): "A judge never handles what it judges."

### R-337. The control model counts nothing and reads no clock; the core counts

**Relation:** one narrower

- A-1808 (Rule 99, Rule 99. Control models, line 2407): "It reads no other act, no clock and nothing else of the verifier's; the signatures are handed to it so that it can say who…"
- A-1848 (Rule 99, Rule 99. Control models, line 2464): "The core counts; the model never does."
- A-1854 (Rule 99, Rule 99. Control models, line 2470): "who signed: it counts no signature itself, reads no clock (a time reference does, rule 33), and judges no proof of absence (task "Absence proof")."

### R-338. A model's answer outside its format, or reaching what it may never decide, is overreaching and set aside

**Relation:** one narrower

- A-1839 (Rule 99, Rule 99. Control models, line 2456): "Overreaching is a verdict on a model's answer: an answer outside the format above, or one reaching what a model may never decide (below), is…"
- A-1855 (Rule 99, Rule 99. Control models, line 2472): "A model's answer that reaches any of these is overreaching, and set aside as above."

### R-339. The core names no control cMIP as default

**Relation:** same

- A-1856 (Rule 99, Rule 99. Control models, line 2474): "The core names no control cMIP as default."
- A-1860 (no rule, 23. Numbers kept as history, line 2478): "They are kept here as history, not as a default: the core names no control cMIP (rule 99)."

### R-340. Terms carrying a target are an ownership agreement

**Relation:** one narrower

- A-1876 (no rule, Part five: act formats, the type table, line 2528): "the proposer. Terms carrying a target (field 33) are an ownership agreement"
- A-1933 (no rule, Terms (type 0), field 33, line 2615): "the target: present, these terms are an ownership agreement (rule 7; Part two)"
- A-2014 (no rule, Terms (type 0): the target, line 2766): "Terms carrying a target are an ownership agreement."

### R-341. The control model (field 35) appears only with a key grammar

**Relation:** one narrower

- A-1913 (no rule, Terms (type 0), field 35, line 2577): "the control model: a cMIP and its parameters (rule 99; only with field 12)"
- A-2052 (no rule, Terms (type 0): the control model, line 2802): "The control model (field 35) appears only in terms carrying a key grammar (field 12): terms of a deal carrying it are invalid."

### R-342. An agreement has one time reference; field 6 and task 10 name the same specification

**Relation:** one narrower

- A-1916 (no rule, Terms (type 0), field 6, line 2583): "time reference: the task cMIP and its parameters; a naming for task 10, the same specification as field 2's task 10 where both are present"
- A-2046 (no rule, Terms (type 0): one time reference, line 2798): "An agreement has one time reference."
- A-2047 (no rule, Terms (type 0): one time reference, line 2798): "Where terms carry both field 6 and a cMIP for task 10 in field 2, the two name the same specification, field 6 adding its…"

### R-343. An ownership agreement carries its stake (field 7) exactly when it carries a target

**Relation:** one narrower

- A-1917 (no rule, Terms (type 0), field 7, line 2585): "the stake: the holders of the target and their shares (only with field 33, and then required)"
- A-2017 (no rule, Terms (type 0): the target, line 2770): "An ownership agreement carries its stake (field 7): terms carrying a target without field 7, or field 7 without a target, are invalid."

### R-344. Field 31 appears only in a deal's clone, naming transfers whose buyers it counts as holders

**Relation:** one narrower

- A-1932 (no rule, Terms (type 0), field 31, line 2613): "transfers counted: in a deal's clone a holder must consent to (rule 48), the stake transfers whose buyers it counts as holders, ascending, none twice…"
- A-1981 (no rule, Terms (type 0): a holder, line 2719): "Field 31 appears only in a deal's clone, and names stake transfers of the stake its parent defines."

### R-345. Withdrawn terms fields (8, 14, 25, 28, 29) are never reused

**Relation:** one narrower

- A-1934 (no rule, Terms (type 0), key 25, line 2616): "key 25 (the relays) is withdrawn and never reused: terms carrying it are invalid"
- A-2044 (no rule, Terms (type 0): withdrawn fields, line 2796): "Fields 8, 14, 25, 28 and 29 are withdrawn."

### R-346. Each layer rule's threshold is between 1 and the number of parties

**Relation:** one narrower

- A-1940 (no rule, Terms (type 0), layer-rule, line 2630): "every party whose voice remains / any k of them / these named parties together; a threshold from 1 to the number of parties"
- A-2051 (no rule, Terms (type 0): the layers, line 2800): "Each rule's threshold is between 1 and the number of parties; named parties are parties, none twice."

### R-347. The stake is the agreement's one stake, index 0; any other index names no stake

**Relation:** one narrower

- A-1977 (no rule, Terms (type 0): rules by share, line 2717): "The stake each names is the one the terms' own field 7 defines, index 0; each share is above zero and at most 1,000,000; "all…"
- A-2029 (no rule, Terms (type 0): the stake, line 2784): "It is the one stake the agreement defines, on its target, index 0: a reference to the agreement's stake by any other index (a transfer's…"
- A-2126 (no rule, Stake transfer (type 4), field 1, line 2917): "the stake, by its index there: 0, the one stake"

### R-348. A collective holds no share of itself

**Relation:** one narrower

- A-2030 (no rule, Terms (type 0): the stake, line 2786): "The collective holds no share of itself."
- A-2541 (no rule, Closing (type 20), complete when, line 3500): "the collective holds nothing: no stake of a latest version of an agreement a verifier holds names it as a holder, after the complete transfers…"

### R-349. A publication's termination terms (field 13) and its field 9 task 15 name the same specification

**Relation:** one narrower

- A-2058 (no rule, Terms (type 0): termination terms, line 2804): "A publication's field 13 and its field 9's task 15 likewise ("Termination"; task 15)."
- A-2080 (no rule, Publication (type 6), field 13, line 2850): "termination terms: a cMIP and its parameters, task 15 ("Termination"); the same specification as field 9's task 15 where both are present"
- A-2097 (no rule, Publication (type 6): it counts, line 2879): "field 13 and field 9's task 15, where both are present, name the same specification."

### R-350. A publication selling a vow carries its words (field 5)

**Relation:** one narrower

- A-2073 (no rule, Publication (type 6), field 5, line 2840): "its words, canonical text: its terms of delivery, refund and contest; required where it sells a vow"
- A-2099 (no rule, Publication (type 6): a vow, line 2883): "A publication naming a vow (`[ 3, vow ]`) sells it with its words, under the ownership agreement it names, or, naming none, as its…"

### R-351. A publication names a vow by its genesis id, never a later version

**Relation:** one narrower

- A-2083 (no rule, Publication (type 6), sold, line 2856): "a vow (Envelopes type 5), by its name, its genesis id"
- A-2100 (no rule, Publication (type 6): a vow, line 2883): "It names the vow by its genesis id, never a later version."

### R-352. A contest's field 1 (the promise not kept) is shown only in a purchase's contest

**Relation:** one narrower

- A-2266 (no rule, Contest (type 14), field 1, line 3127): "the promise not kept, shown only in a purchase's contest: in words (canonical text); or, naming a vow, in a cMIP's terms"
- A-2296 (no rule, Contest (type 14), line 3147): "Field 1 is shown only in a contest of a purchase; any other contest carrying it shows nothing."

### R-353. A spent resignation (its signer came back) registers nothing

**Relation:** one narrower

- A-2323 (no rule, Resignation (type 16), line 3199): "A resignation or a stepping down is spent once its signer comes back."
- A-2327 (no rule, Resignation (type 16), spent, line 3204): "Once spent, it is still on the record and visible, but no line registers it, by a record or by a rollback."
- A-2365 (no rule, Record (type 17), line 3258): "A resignation spent by its signer's return registers nothing (type 16)."
- A-2455 (no rule, Collectives in the identity chain, the rare cases: a recovery rotation and a rollback, line 3380): "A resignation spent by its signer's return (type 16) is valid there and registers nothing."

### R-354. A fork's and a closing's keys 2 and 3 are retired: the line is what the act cites

**Relation:** same

- A-2472 (no rule, Fork (type 19), CDDL, line 3412): "keys 2 and 3 are retired and never reused: the fork's line is what it cites on the collective's chain"
- A-2531 (no rule, Closing (type 20), CDDL, line 3484): "keys 2 and 3 are retired and never reused, as the fork's: the closing's line is what it cites on the collective's chain"

### R-355. A fork or closing is drawn by one member with their own identity

**Relation:** same

- A-2479 (no rule, Fork (type 19), how it is signed, line 3420): "A fork is drawn by one member of the original collective, with their own identity."
- A-2533 (no rule, Closing (type 20), how it is signed, line 3491): "A closing is drawn by one member of the collective, with their own identity."

### R-356. A fork's or closing's inside names the agreement as chain and predecessor, then each earlier ending

**Relation:** one narrower

- A-2480 (no rule, Fork (type 19), how it is signed, line 3420): "Its inside names, in `objects`, the original agreement as chain and predecessor, `[[agreement, agreement]]`, followed by `[agreement, ending]` for each earlier fork or closing of…"
- A-2534 (no rule, Closing (type 20), how it is signed, line 3491): "Its inside names the agreement as chain and predecessor, `[[agreement, agreement]]`, followed by `[agreement, ending]` for each earlier fork or closing of the collective it…"

### R-357. An ending is valid under Identity

**Relation:** same

- A-2488 (no rule, Fork (type 19), complete when, line 3426): "it is valid under Identity;"
- A-2536 (no rule, Closing (type 20), complete when, line 3495): "it is valid under Identity;"

### R-358. An ending names the agreement in force at its line

**Relation:** one narrower

- A-2489 (no rule, Fork (type 19), complete when, line 3427): "the agreement it names is the one in force at its line, the original's records before the line counted (rule 72);"
- A-2537 (no rule, Closing (type 20), complete when, line 3496): "its line holds, and the agreement it names is the one in force there, as for a fork;"

### R-359. Whether an ending is complete is judged only on its own line and history

**Relation:** one narrower

- A-2507 (no rule, Fork (type 19), what it must hand out, line 3448): "Whether a fork took effect is judged only by what its own history holds."
- A-2508 (no rule, Fork (type 19), what it must hand out, line 3448): "The departures registered before its line count for its check of the obligations it must hand out; a departure registered after it never changes it."
- A-2568 (no rule, Closing (type 20), judged on its own history, line 3527): "Whether a fork or closing is complete is judged on its own line and history, as if it were the ending that counts: its own…"

### R-360. A complete ending is final: a later ending naming it counts for nothing

**Relation:** one narrower

- A-2512 (no rule, Fork (type 19), finality, line 3456): "A complete ending is final: a later fork or closing of the same collective, one that names it (directly, or through the endings it names),…"
- A-2564 (no rule, Closing (type 20), finality and ties, line 3522): "it is final, and a later ending naming it (in `objects` or through a signer's chain) counts for nothing;"
- A-2569 (no rule, Closing (type 20), judged on its own history, line 3527): "A complete ending that names a final one (directly, or through the endings it names), and so counts for nothing, is shown as such ("complete,…"

### R-361. Two concurrent complete endings sharing no signer: neither counts until a third names both

**Relation:** one narrower

- A-2516 (no rule, Fork (type 19), ties among endings, line 3462): "Only two complete endings sharing no signer and neither naming the other are concurrent, made without knowing each other, and neither counts, as any race…"
- A-2517 (no rule, Fork (type 19), ties among endings, line 3462): "That third ending is ordered against both, and counts, as a clone of both branches resolves concurrent records; a later one naming it counts for…"
- A-2565 (no rule, Closing (type 20), finality and ties, line 3523): "of two concurrent ones sharing no signer, neither counts until a third names both;"

### R-362. A signature on an old proposal, after the signer signed an ending naming it, counts for nothing

**Relation:** one narrower

- A-2518 (no rule, Fork (type 19), old proposals, line 3464): "A signature on an old proposal, finished late, counts for nothing."
- A-2519 (no rule, Fork (type 19), old proposals, line 3464): "A member's chain signature on an ending counts for nothing where it lies, in their identity chain, after their own chain signature on another ending…"
- A-2520 (no rule, Fork (type 19), old proposals, line 3464): "Once a member signed the ending that replaced a proposal, they can no longer finish it."
- A-2566 (no rule, Closing (type 20), finality and ties, line 3524): "a signature on it placed after its signer's signature on an ending naming it counts for nothing;"

### R-363. A fork or closing whose signer earlier signed another ending it does not name is no ending

**Relation:** one narrower

- A-2521 (no rule, Fork (type 19), drafter names, line 3466): "A drafter names the endings they signed."
- A-2522 (no rule, Fork (type 19), drafter names, line 3466): "A fork or closing is no ending where its signer signed, earlier in their own identity chain than their chain signature on it, another fork…"
- A-2523 (no rule, Fork (type 19), drafter names, line 3466): "It is never complete, and its signatures count for nothing, for naming and for the rule on old proposals alike."
- A-2567 (no rule, Closing (type 20), finality and ties, line 3525): "one whose signer signed earlier an ending it does not name is no closing."

## Rows with an unresolved pointer left ungrouped

These rows, whose worker named another place saying the same thing, were not placed in a group: their pointer leads outside this MIR (Money, Envelopes, Text, Identity, Development, the build brief), to Part six, or to a bare cross-reference with no second statement of the same wording in this draft.

- A-002 (line 7): points to Brief's unit rule (italic = commentary)
- A-062 (line 78): points to rule 11
- A-066 (line 81): points to Money rule 18
- A-116 (line 127): points to glossary 'Change rules'
- A-180 (line 203): points to Text rule 6
- A-186 (line 218): points to rule 91, 'Two fork acts signed concurrently ... the status quo stands' (line 1726)
- A-187 (line 219): points to rule 47
- A-207 (line 252): points to rule 12
- A-214 (line 258): points to Part six 'Ownership is one thing, distribution another' (line 3563, italic reasoning); reading guide line 71
- A-240 (line 291): points to rule 27
- A-265 (line 322): points to Fable's guarantee 3 (the stake's line is the holders' alone)
- A-288 (line 348): points to line 213 ([x, x] parallel acts)
- A-309 (line 375): points to "Termination: active and terminated"
- A-321 (line 379): points to Money rule 18
- A-329 (line 392): points to Money rule 17
- A-334 (line 396): points to Money rule 17
- A-356 (line 410): points to Development, "The checker is not a task"
- A-430 (line 487): points to line 491
- A-431 (line 491): points to line 487
- A-507 (line 591): points to the italic introduction, line 583
- A-520 (line 609): points to rule 11's italic summary, line 361
- A-663 (line 819): points to Part six scenario line 3717
- A-675 (line 830): points to Part six scenario line 3709
- A-736 (line 914): points to rule 67's judicial tier list ('the keepers', line 1971); glossary 'Keeper'
- A-874 (line 1128): points to freeze scenario line 3710
- A-949 (line 1228): points to Money rule 18; rule 12
- A-957 (line 1240): points to Money, payee pointer
- A-976 (line 1284): points to rule 30
- A-1011 (line 1331): points to Money rule 24; Money rule 20
- A-1024 (line 1355): points to Money rule 4
- A-1045 (line 1391): points to Money rule 21
- A-1050 (line 1401): points to Money rule 12 (batch)
- A-1076 (line 1450): points to rules 15 and 16
- A-1152 (line 1550): points to rule 70 italic at line 1563 refers back to it ('a resignation counts like a loss (above)')
- A-1259 (line 1700): points to Identity section 8 (succession declared by rotation, confirmed by the successor)
- A-1272 (line 1716): points to rule 70 (resignation, the way out)
- A-1307 (line 1740): points to rule 12 (a payment naming a tag the publication does not count is owed back as a refund, line 418)
- A-1463 (line 1959): points to rules 22 and 27
- A-1558 (line 2060): points to rule 91 (a member's client for a collective's endings)
- A-1610 (line 2131): points to rule 59 (key grammar); Identity, collectives
- A-1611 (line 2131): points to rule 64 (the constitution's own agreement); rule 74
- A-1622 (line 2145): points to rule 65
- A-1628 (line 2157): points to rule 99; rule 98
- A-1633 (line 2164): points to rule 99
- A-1635 (line 2166): points to rule 99
- A-1684 (line 2233): points to Text rule 6
- A-1695 (line 2255): points to rule 89 'Voice removed ... This holds'
- A-1719 (line 2293): points to 'Termination' (the terminating act, line 587)
- A-1793 (line 2387): points to rule 99 (lines 2395 to 2456) says each part again
- A-2019 (line 2772): points to rule 14 ('sells under none')
- A-2313 (line 3186): points to 'Termination' (a deal's terminating act under its termination terms); rule 47
- A-2386 (line 3300): points to rule 88 italic, 'A declaration counts only if public or addressed to the member it names'

## Counts

- Groups: 363
- Rows in groups: 1214 distinct (row placements: 1253)
- By relation: same 34; one narrower 322; they differ 7
- Rows with an unresolved pointer placed: 323 of 375; left ungrouped: 52
- Groups that differ: R-43; R-92; R-98; R-168; R-206; R-223; R-238
