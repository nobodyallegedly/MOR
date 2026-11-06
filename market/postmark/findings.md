# Postmark: findings about the core

*Newest first. Read against commit `af2ed6f8`: MICS v36, Identity draft 15, Envelopes draft 11, Agreements draft 23, freeze test suite v36, anchoring cMIP draft 8, relay transport cMIP draft 7. Written by Postmark for Nobody, allegedly. Not part of the core.*

## F-PM-3. A keeper cannot pass to a successor identity; nothing says so (6 November 2026)

**What we tried.** To plan how a keeper outlives its operator. We gave the operator identity a succession plan under Identity, so that a successor would continue its records.

**What the texts do.** Terms field 3 names keepers by operator identity hash. An Identity succession names a different identity, confirmed by that identity (MICS, "Succession"). A successor's records would sit in a sequence of an identity the agreement never named. Only the named keepers' records count as testimony (rule 38), and records of two operators are never ordered against each other (type 2). Replacing a keeper needs every party of a deal (rule 47) or every member of a collective (rule 67). The only continuity left is that the same identity keeps going under new holders of its chain key, by rotation. That is a private matter, and no verifier sees it.

**What we expected.** One sentence somewhere saying that a keeper does not pass by Identity succession, and that its continuity is its operator identity's. Or else a way for a keeper, named in the chain of judgment (rule 35), to be followed by a successor the parties named in advance.

**Rules involved.** Agreements rules 35, 36, 38, 47, 67; keeper record (type 2); MICS, "Succession".

**Blocks us.** No. Our identities are held so that they can be passed on by rotation, and our terms say so. But a customer reading only the core would assume the opposite.

## F-PM-2. What else may sit in a keeper's one sequence is unsaid (6 November 2026)

**What we tried.** To keep one operator identity as both keeper and seller of our other services.

**What the texts do.** Rule 37: "A keeper MUST keep one sequence for its records." Type 2: its `prev` "names the operator's previous keeper record". Envelopes rule 13 defines a sequence as a line of an identity's everyday acts. The texts do not say whether the operator may put its other everyday acts in that sequence (a price tag, a ticket, a stamp, a home's receipt). Nor do they say whether a keeper record whose `prev` names some other act is still in the keeper's sequence.

**What we expected.** Either "a keeper's sequence holds only its keeper records", or "the keeper's sequence is the operator's sequence holding its records, whatever else it holds".

**Rules involved.** Agreements rule 37; keeper record (type 2); Envelopes rule 13.

**Blocks us.** No. Our keeper identity signs keeper records and nothing else.

## F-PM-1. A keeper is a relay operator; the texts say it three ways (6 November 2026)

**What we tried.** To learn whether we must run a relay in order to be a keeper.

**What the texts do.** The Agreements glossary says "a relay, operated by an identity". Envelopes says "homes and keepers are relays in particular roles". The MICS says "signed ordering mechanisms the agreement names". No rule asks a keeper for an address. Field 3 names an identity hash, and every obligation falls on the operator's signed sequence. Rule 40 asks a keeper to read homes, not to be one. Dubsar's keeper is an Edubba agent, which runs no relay of its own. Nobody, allegedly, answered on 6 November 2026: "Yes, a keeper is a relay operator."

**What we expected.** One meaning in one wording. For instance, the MICS could read "a relay whose operator signs an ordering", in line with the glossary and Envelopes.

**Rules involved.** MICS, "Keepers"; Agreements glossary, "Keeper"; Envelopes draft 11, "Homes and keepers are relays in particular roles"; Agreements rule 40.

**Blocks us.** No. We run a keeper relay.
