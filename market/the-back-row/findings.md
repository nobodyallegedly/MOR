# The Back Row: findings

*Newest first. Each: what was tried; what the texts or the code did; what was expected; the rule or vector involved; whether it blocks.*

*Read at the rehearsal commit `af2ed6f8`: the MICS v36, Identity draft 15, Envelopes draft 11, Money draft 13, Agreements draft 23, and `clients/damgar/README.md`. The Back Row builds nothing on the core; it follows one member, one purchase and one bad day through the texts. Not yet read: the freeze test suite, Text, Development, the vectors. A finding below may change when they are.*

## 6 November 2026

### 4. A payment naming no payer gives up every remedy, and nothing tells the payer

- **Tried.** A member who wants privacy pays a price tag with a bare Lightning payment, naming no payer.
- **The texts.** The payment is a gift: it counts toward what it names, no refund is owed on it, and it has no buyer, so no standing to contest (Money rule 11; Agreements rule 13, "a payment naming none has no buyer").
- **Expected.** The rule itself, which is sound: a refund owed to whoever holds the rail's proof could be claimed by any node on the route (Money, reasoning). But no client conformance makes a wallet say so before such a payment. Damgar does say it, after the fact ("a gift … no refund is owed on it").
- **Rule.** Money rule 11; Agreements rule 13.
- **Blocks.** No. A question, not a flaw: should a payer's client be required to say, before paying with no payer named, that no refund and no contest will be possible, and offer a fresh identity instead (Money rule 11's own remedy)?

### 3. A broken vow owes the buyer nothing in the core; the remedy is entirely the seller's terms

- **Tried.** A member buys a season of twelve matches, sold as a vow. Three are cancelled.
- **The texts.** The member contests the sale, naming the promise not kept, and the contest is shown beside it; a contest voids nothing (Agreements rule 13). "What a buyer is owed back when part of a bundle fails is set by the bundle's terms: the publication's words, or a cMIP's. The core fixes no partial refund" (rule 13). The terms may end a refund at a point on the time reference, after which "the owners keep the money", and terms written in bad faith "are not refused" (rule 11). The buyer's client shows that deadline before paying (rule 11, client conformance). The core owes a refund only where a payment received neither a key delivery nor a receipt (rule 11).
- **Expected.** This, from a core that judges nothing. We record it because the buyer's whole remedy for a broken promise now rests on one document that does not exist yet: no refund cMIP for vows is in `cmips/` at this commit.
- **Rule.** Agreements rules 11 and 13.
- **Blocks.** No, for the core. It is the single most important gap above it for audiences. We ask whether Dubsar will publish a default refund cMIP for vows that sellers' own terms can be compared against.

### 2. A lost chain key ends the identity's way out for good

- **Tried.** A member keeps both keys on one phone and loses it. Later, the member's only home turns hostile.
- **The texts.** "An owner who loses the chain key, and its seed, can never rotate, change homes or leave. The identity keeps working with its signing key until that is lost too" (Identity, Reasoning). Where a home's acceptance depends on a device the owner may lose, "losing that device … can mean losing the identity" (Identity rule 24). Backup and recovery are identity modules, outside the core (MICS, "Outside the core").
- **Expected.** "You cannot be locked in" to hold for an owner who is not technical. It holds only for an owner who keeps the chain key's seed, and the failure is permanent and silent until the day it is needed.
- **Rule.** Identity rule 24; Identity, Reasoning ("Losing the chain key is permanent").
- **Blocks.** No. The design is right: a chain key someone else could replace would make that someone a custodian. It settles the question Keep put to Nobody, allegedly. It also means the exit our members are promised depends wholly on identity modules and on what clients tell owners at onboarding.

### 1. By default, every party on the selling side sees who bought

- **Tried.** A member buys one song from a band of three signed to a label (a deal with several parties), and a pass sold under a publication to which a collective of many members is a party.
- **The texts.** "Where the payee of a purchase is a collective, or an agreement with several parties, the buyer's client makes its claim of the purchase readable by every member of the collective's agreement in force, or by every party of the version the purchase names … Stated cost: every member or party sees who bought" (Agreements, "Contest (type 14)", client conformance; rule 57). The core never requires a sender's identity (Money rule 14), and a fresh identity keeps both privacy and the refund (Money rule 11; Identity rule 4). In the suite, Damgar's "Pay without your name" is an option beside "Sign it", by hand only, and never under a lane or inside another app (`clients/damgar/README.md`, round 10): every payment an app makes for its user goes out under the user's own name.
- **Expected.** The money's path readable by the payer (it is), and the payer's identity seen by those who must see it to honour or contest the deal, not by every party of it by default. For a large collective, "every member" is hundreds of people learning who bought.
- **Rule.** Agreements, "Contest (type 14)", client conformance; Agreements rule 57; Money rules 11 and 14.
- **Blocks.** No. The question for Nobody, allegedly: is every party's sight of the payer needed for a guarantee the core keeps (each owner's sight of income), or could every party read the receipt and its amount while the payer's identity is sealed to the split service alone? If it must stay, should the buyer's client be required to say, before paying, how many identities will see the purchase? A stated cost in a text the buyer never reads is not a cost the buyer chose.
